const assert = require('assert'); 
const {validTMs, invalidTMs} = require('./resources/thing-models');
const fs = require('fs');
const Ajv = require("ajv")

const tmSchema = fs.readFileSync("validation/tm-json-schema-validation.json")
const ajv = new Ajv({ 
    strict: false, 
    addUsedSchema: false, 
    formats: {
        // Do not validate the following formats.
        // In the future we could provide a custom checking function for these formats
        "uri-reference" : true,
        "json-pointer" : true,
    } 
})



describe('Thing Model validation', () => {
    for (const [id, tm] of validTMs.entries()) {
        it(`should validate n° ${id}`, () => {
            const valid = ajv.validate(JSON.parse(tmSchema), tm)
            assert.equal(valid, true, ajv.errorsText());
        });
    }

    for (const [id, tm] of invalidTMs.entries()) {
        it(`should fail validation for n° ${id}`, () => {
            const valid = ajv.validate(JSON.parse(tmSchema), tm)
            assert.equal(valid, false);
        });
    }
});