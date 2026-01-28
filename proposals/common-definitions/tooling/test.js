const fs = require("fs");
const assert = require("assert");
const { validTDs, invalidCompactTDs, invalidExpandedTDs } = require("./tds");
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

describe("Compact TD Confirmation", () => {
  for (const [id, tdPair] of validTDs.entries()) {
    const tdCompact = tdPair[0]; // Compact TD is the first item of the array

    it(`should validate n° ${id}`, () => {
      const valid = ajv.validate(JSON.parse(tdSchemaCompacted), tdCompact);
      assert.equal(valid, true, ajv.errorsText());
    });
  }
});

// These tests are for expanded TDs found in the second item of the array in validTDs
describe("Expanded TD Confirmation", () => {
  for (const [id, tdPair] of validTDs.entries()) {
    const tdExpanded = tdPair[1]; // Expanded TD is the second item of the array

    it(`should validate n° ${id}`, () => {
      const valid = ajv.validate(JSON.parse(tdSchemaExpanded), tdExpanded);
      assert.equal(valid, true, ajv.errorsText());
    });
  }
});

describe("Compact TD Rejection when Expanded is expected", () => {
  for (const [id, tdPair] of validTDs.entries()) {
    const tdCompact = tdPair[0]; // Compact TD is the first item of the array
    it(`should NOT validate n° ${id}`, () => {
      const valid = ajv.validate(JSON.parse(tdSchemaExpanded), tdCompact);
      assert.equal(valid, false, ajv.errorsText());
    });
  }
});

describe("Compact TD Rejection", () => {
  for (const [id, td] of invalidCompactTDs.entries()) {
    const test1 = td.title == "invalid-test-compacted-0" ? xit : it;
    test1(`should NOT validate n° ${id}`, () => {
      const valid = ajv.validate(JSON.parse(tdSchemaCompacted), td);
      assert.equal(valid, false, ajv.errorsText());
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
