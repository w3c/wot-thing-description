const fs = require("fs");
const assert = require("assert");
const { validTDs, invalidTDs } = require("./tds");
const Ajv = require("ajv");

const tdSchema = fs.readFileSync("schema-new.schema.json");
const ajv = new Ajv({
  strict: false,
  addUsedSchema: false,
  formats: {
    // Do not validate the following formats.
    // In the future we could provide a custom checking function for these formats
    "uri-reference": true,
    "json-pointer": true,
    uri: true,
    "date-time": true,
  },
});

describe("Thing Description Confirmation", () => {

  for (const [id, td] of validTDs.entries()) {
      it(`should validate n° ${id}`, () => {
        const valid = ajv.validate(JSON.parse(tdSchema), td);
        assert.equal(valid, true, ajv.errorsText());
      });
  }
});

describe("Thing Description Rejection", () => {
  for (const [id, td] of invalidTDs.entries()) {
    it(`should NOT validate n° ${id}`, () => {
      const valid = ajv.validate(JSON.parse(tdSchema), td);
      assert.equal(valid, false, ajv.errorsText());
    });
  }
});
