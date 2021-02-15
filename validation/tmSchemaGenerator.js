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
 Expectations:
 - Required: There are currently 21 required in the TD Schema. There should be 2 left that are objects 
*/


const fs = require('fs');

// take the TD Schema
let tdSchema = JSON.parse(fs.readFileSync('validation/td-json-schema-validation.json'));

//console.log(tdSchema);

let tdSchemaNoReq = removeRequired(tdSchema)

fs.writeFileSync("validation/tm-json-schema-validation.json", JSON.stringify(tdSchemaNoReq,null,2))

/** 
 * if there is a required, remove that
 * once that is done, find a sub item that is of object type, call recursively
 * if there is no sub item with object, return the current scoped object
 * @param {object} argObject
 * @return {object}
**/

function removeRequired(argObject) {

    // remove required if it exists and is of array type.
    // check for array is needed since we also specify what a required is and that is an object
    if (("required" in argObject) && (Array.isArray(argObject.required))){
        // need to decide whether to delete or replace it with ""
        // delete is "cleaner" but "" is more explicit
        delete argObject.required;
    }

    for (var key in argObject)
    {
        let curValue = argObject[key];
        // removal is done only in objects, other types are not JSON Schema points anyways
        if (typeof(curValue)=="object"){
            argObject[key] = removeRequired(argObject[key])
        }
    } 

    return argObject;
}