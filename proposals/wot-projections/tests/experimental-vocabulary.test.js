const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const test = require("node:test");
const jsonld = require("jsonld");
const context = JSON.parse(
  readFileSync(join(__dirname, "../context.experimental-v1.jsonld"), "utf8"),
);

const namespace =
  "https://raw.githubusercontent.com/marcschier/wot-thing-description/main/proposals/wot-projections/context.experimental-v1.jsonld#";
const options = {
  documentLoader: async () => {
    throw new Error("Vocabulary checks must not retrieve remote contexts.");
  },
};

test("experimental marker and IRI-valued terms expand to the assigned experiment", async () => {
  const [expanded] = await jsonld.expand(
    {
      ...context,
      "@type": "wotproj:projection",
      "wotproj:scenario": "https://example.org/scenarios/maintenance",
      "wotproj:resolvedFrom": "https://example.org/source#/properties/speed",
    },
    options,
  );
  assert.deepEqual(expanded["@type"], [namespace + "projection"]);
  assert.deepEqual(expanded[namespace + "scenario"], [
    { "@id": "https://example.org/scenarios/maintenance" },
  ]);
  assert.deepEqual(expanded[namespace + "resolvedFrom"], [
    { "@id": "https://example.org/source#/properties/speed" },
  ]);
});

test("source entries retain their authored order and literal value kinds", async () => {
  const [expanded] = await jsonld.expand(
    {
      ...context,
      "wotproj:projects": [
        { "wotproj:sourceName": "second", "wotproj:selectAll": false },
        { "wotproj:sourceName": "first", "wotproj:selectAll": true },
      ],
    },
    options,
  );
  const entries = expanded[namespace + "projects"][0]["@list"];
  assert.deepEqual(entries, [
    {
      [namespace + "sourceName"]: [{ "@value": "second" }],
      [namespace + "selectAll"]: [{ "@value": false }],
    },
    {
      [namespace + "sourceName"]: [{ "@value": "first" }],
      [namespace + "selectAll"]: [{ "@value": true }],
    },
  ]);
});

test("another prefix expands to the same vocabulary without relying on its spelling", async () => {
  const [expanded] = await jsonld.expand(
    {
      "@context": { p: { "@id": namespace, "@prefix": true } },
      "@type": "p:projection",
      "p:sourceName": "pump",
    },
    options,
  );
  assert.deepEqual(expanded["@type"], [namespace + "projection"]);
  assert.deepEqual(expanded[namespace + "sourceName"], [{ "@value": "pump" }]);
});

test("selection and source-option terms preserve their literal contents", async () => {
  const [expanded] = await jsonld.expand(
    {
      ...context,
      "wotproj:routing": "source",
      "wotproj:sourceDigest": "sha-256:" + "a".repeat(64),
      "wotproj:namePrefix": "pump",
      "wotproj:select": [{ "wotproj:affordanceKind": "property" }],
    },
    options,
  );
  assert.deepEqual(expanded[namespace + "routing"], [{ "@value": "source" }]);
  assert.deepEqual(expanded[namespace + "sourceDigest"], [
    { "@value": "sha-256:" + "a".repeat(64) },
  ]);
  assert.deepEqual(expanded[namespace + "namePrefix"], [{ "@value": "pump" }]);
  assert.deepEqual(expanded[namespace + "select"], [
    { [namespace + "affordanceKind"]: [{ "@value": "property" }] },
  ]);
});

test("placeholder and rebound prefix terms remain distinct from the experiment", async () => {
  const placeholder = "https://example.org/wot/projection#";
  const [expanded] = await jsonld.expand(
    {
      "@context": { wotproj: { "@id": placeholder, "@prefix": true } },
      "@type": "wotproj:projection",
      "wotproj:sourceName": "pump",
    },
    options,
  );
  assert.deepEqual(expanded["@type"], [placeholder + "projection"]);
  assert.deepEqual(expanded[placeholder + "sourceName"], [{ "@value": "pump" }]);
  assert.equal(expanded[namespace + "sourceName"], undefined);
  assert.equal(expanded["@type"].includes(namespace + "projection"), false);
});
