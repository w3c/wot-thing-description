/**
 * Testing script that attempts to validate TD documents with:
 *  - a JSON schema
 *  - SHACL constraints (after transformation to RDF)
 */
"use strict";

const fs = require("fs");
const assert = require("assert");
const { validTDs, invalidTDs } = require("./resources/thing-descriptions");
const factory = require("rdf-ext");
const ParserN3 = require("@rdfjs/parser-n3");
const SHACLValidator = require("rdf-validate-shacl");
const jsonld = require("jsonld");
const Ajv = require("ajv");
const { Readable } = require("stream");

const tdSchema = fs.readFileSync("validation/td-json-schema-validation.json");
const ajv = new Ajv({
  strict: false,
  addUsedSchema: false,
  formats: {
    // Do not validate the following formats.
    // In the future we could provide a custom checking function for these formats
    "uri-reference": true,
    "json-pointer": true,
    "uri": true,
    "date-time": true
  }
});

describe("Thing Description validation", () => {
  let shapes;

  before(async () => {
    const stream = fs.createReadStream("validation/td-validation.ttl");
    shapes = await loadDatasetN3(stream);

    configureCustomLoader();
  });

  describe("JSONSchema validation", () => {
    for (const [id, td] of validTDs.entries()) {
      it(`should validate n° ${id}`, () => {
        const valid = ajv.validate(JSON.parse(tdSchema), td);
        assert.equal(valid, true, ajv.errorsText());
      });
    }

    for (const [id, td] of invalidTDs.entries()) {
      it(`should reject n° ${id}`, () => {
        const valid = ajv.validate(JSON.parse(tdSchema), td);
        assert.equal(valid, false, ajv.errorsText());
      });
    }
  });

  describe("SHACL validation", () => {
    for (const [id, td] of validTDs.entries()) {
      it(`should validate n° ${id}`, async () => {
        const ttl = await jsonld.toRDF(td, { format: "application/n-quads" });
        const dataset = await loadDatasetN3(Readable.from([ttl]));
        const validator = new SHACLValidator(shapes);
        const report = await validator.validate(dataset);
        assert.equal(report.conforms, true, prettyPrintSHACLValidationErrors(dataset, report));
      });
    }

    for (const [id, td] of invalidTDs.entries()) {
      it(`should reject n° ${id}`, async () => {
        const ttl = await jsonld.toRDF(td, { format: "application/n-quads" });
        const dataset = await loadDatasetN3(Readable.from([ttl]));
        const validator = new SHACLValidator(shapes);
        const report = await validator.validate(dataset);
        assert.equal(report.conforms, false, prettyPrintSHACLValidationErrors(dataset, report));
      });
    }
  });

  describe("Additional checks", () => {
    it("should use the global language", async () => {
      const ttl = await jsonld.toRDF(validTDs[2], { format: "application/n-quads" });
      assert.ok(ttl.includes('"Stato corrente del dispositivo"@it'), "The global language is not used for description");
      assert.ok(ttl.includes('"stato"@it'), "The global language is not used for property names");
      assert.ok(ttl.includes('"Stato"@it'), "The global language is not used for property title");
      assert.ok(ttl.includes('"nosec_sc" .'), "Security string contains a forbidden character");
    });
  });

  describe("Round tripping", () => {
    const context = JSON.parse(fs.readFileSync("context/td-context-1.1.jsonld", "utf-8"));
    for (const [id, td] of validTDs.entries()) {
      it(`should transform TD to RDF and back n° ${id}`, async () => {
        context["@id"] = td.id;
        const ttl = await jsonld.toRDF(td, { format: "application/n-quads" });
        const doc = await jsonld.fromRDF(ttl, { format: "application/n-quads" });
        const transformedTD = await jsonld.frame(doc, context);
        delete transformedTD["@context"];
        delete td["@context"];
        assert.deepEqual(td, transformedTD);
      });
    }
  });
});

function configureCustomLoader() {
  const ctx = JSON.parse(fs.readFileSync("context/td-context-1.1.jsonld", "utf-8"));
  // define a mapping of context URL => context doc
  const CONTEXTS = {
    "https://www.w3.org/2022/wot/td/v1.1": ctx
  };

  // grab the built-in Node.js doc loader
  const nodeDocumentLoader = jsonld.documentLoaders.node();

  // change the default document loader
  const customCtxLoader = async (url, options) => {
    if (url in CONTEXTS) {
      return {
        contextUrl: null, // this is for a context via a link header
        document: CONTEXTS[url], // this is the actual document that was loaded
        documentUrl: url // this is the actual context URL after redirects
      };
    }
    // call the default documentLoader
    return nodeDocumentLoader(url);
  };
  jsonld.documentLoader = customCtxLoader;
}

async function loadDatasetN3(stream) {
  const parser = new ParserN3({ factory });
  return factory.dataset().import(parser.import(stream));
}

function prettyPrintSHACLValidationErrors(input, report) {
  return (
    "\n" +
    input.toCanonical() +
    "\n" +
    report.results
      .map((result) => {
        return `${result.message[0].value} at ${result.path}`;
      })
      .join("\n")
  );
}
