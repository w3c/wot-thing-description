/*
 This script takes the TD Validation Schema (JSON Schema).
 Its goal is to generate another JSON Schema that can be used to 
 validate Thing Model documents.
 Generic Requirements:
 - Not require any dependency
 - Allow the inspection of the Schema at different iterations that add or remove functionalities
 - Be recursive to be able to adapt to changes in the TD Schema
 Changes to the TD Schema:
 - Remove the term `required` from all levels
 - If a term is not of type string, allow also string
 - Adding TM specific link validation (not fully clear yet)
*/


const fs = require('fs');

// take the TD Schema
let tdSchemaFile = JSON.parse(fs.readFileSync('validation/td-json-schema-validation.json'));

console.log(tdSchemaFile);

function removeRequired(tdSchema) {
    
}