const fs = require("fs");
const assert = require("assert");
const { validCompactTDs, invalidCompactTDs, validExpandedTDs, invalidExpandedTDs } = require("./tds");
const Ajv = require("ajv");

const tdSchemaCompacted = fs.readFileSync("schema-new.schema.json");
const tdSchemaExpanded = fs.readFileSync("schema-full.schema.json");
const ajv = new Ajv({
  strict: false,
  addUsedSchema: false,
  formats: {
    // Do not validate the following formats.
    // In the future we could provide a custom checking function for these formats
    "uri-reference": true,
    "json-pointer": true,
    uri: true,
    "date-time": true
  }
});

describe("Non-expanded TD Confirmation", () => {
  for (const [id, td] of validCompactTDs.entries()) {
    it(`should validate n° ${id}`, () => {
      const valid = ajv.validate(JSON.parse(tdSchemaCompacted), td);
      assert.equal(valid, true, ajv.errorsText());
    });
  }
});

describe("Non-expanded TD Rejection", () => {
  for (const [id, td] of invalidCompactTDs.entries()) {
    const test1 = td.title == "invalid-test-compacted-0" ? xit : it
    test1(`should NOT validate n° ${id}`, () => {
      const valid = ajv.validate(JSON.parse(tdSchemaCompacted), td);
      assert.equal(valid, false, ajv.errorsText());
    });
  }
});

// These tests are for fully expanded TDs, i.e. no use of definitions, absolute URLs etc
describe("Expanded TD Confirmation", () => {
  for (const [id, td] of validExpandedTDs.entries()) {
    it(`should validate n° ${id}`, () => {
      const valid = ajv.validate(JSON.parse(tdSchemaExpanded), td);
      assert.equal(valid, true, ajv.errorsText());
    });
  }
});

describe("Expanded TD Rejection", () => {
  for (const [id, td] of invalidExpandedTDs.entries()) {
    it(`should NOT validate n° ${id}`, () => {
      const valid = ajv.validate(JSON.parse(tdSchemaExpanded), td);
      assert.equal(valid, false, ajv.errorsText());
    });
  }
});

describe("Compact TD Rejection when Expanded is expected", () => {
  for (const [id, td] of validCompactTDs.entries()) {
    it(`should NOT validate n° ${id}`, () => {
      const valid = ajv.validate(JSON.parse(tdSchemaExpanded), td);
      assert.equal(valid, false, ajv.errorsText());
    });
  }
});