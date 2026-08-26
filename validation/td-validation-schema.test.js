/**
 * Testing script that attempts to validate TD documents with:
 *  - a JSON schema
 *  - SHACL constraints (after transformation to RDF)
 */
"use strict";

const fs = require("fs");
const assert = require("assert");
const { validTDs, invalidTDs } = require("./resources/thing-descriptions");
const Ajv = require("ajv");

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
});
