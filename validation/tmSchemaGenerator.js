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
 - Remove the term `enum` from all levels
 - Maybe in the future: remove const but there is no use of it at the current state
 - Remove format from a string type
 - If a term is not of type string, allow also string
 - Adding TM specific link validation (not fully clear yet)
 Expectations:
 - Required: There are currently 21 required in the TD Schema. There should be 2 left that are objects
 - Enum: There are 29 enums, there should be 2 left.
 - Format: There are 7 formats, there should be 3 left.
*/


const fs = require('fs');

// take the TD Schema
let tdSchema = JSON.parse(fs.readFileSync('validation/td-json-schema-validation.json'));

let tmSchema = changeMetadata(tdSchema)
tmSchema = removeRequired(tmSchema)
tmSchema = removeEnum(tmSchema)
tmSchema = removeFormat(tmSchema)

fs.writeFileSync("validation/tm-json-schema-validation.json", JSON.stringify(tmSchema,null,2))

/** 
 * This function changes the values of metadata terms in the schema.
 * These are title and description
 * @param {object} argObject
 * @return {object}
**/
function changeMetadata(argObject){

    argObject.title = "WoT Thing Model Schema - 16 February 2021"
    argObject.description = "JSON Schema for validating Thing Models. This is automatically generated from the WoT TD Schema."

    return argObject;
}

/** 
 * if there is a required, remove that
 * once that is done, find a sub item that is of object type, call recursively
 * if there is no sub item with object, return the current scoped object
 * @param {object} argObject
 * @return {object}
**/

function removeRequired(argObject) {

    // remove required if it exists and is of array type.
    // check for array is needed since we also specify what a required is and that it is an object
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
            argObject[key] = removeRequired(curValue)
        }
    } 

    return argObject;
}

/** 
 * if there is a enum, remove that
 * once that is done, find a sub item that is of object type, call recursively
 * if there is no sub item with object, return the current scoped object
 * This is done to allow putting placeholders for a string that would be limited with
 * a list of allowed values in an enum
 * @param {object} argObject
 * @return {object}
**/

function removeEnum(argObject) {

    // remove enum if it exists and is of array type.
    // check for array is needed since we also specify what a enum is and that it is an object
    if (("enum" in argObject) && (Array.isArray(argObject.enum))){
        // need to decide whether to delete or replace it with ""
        // delete is "cleaner" but "" is more explicit
        delete argObject.enum;
    }

    for (var key in argObject)
    {
        let curValue = argObject[key];
        // removal is done only in objects, other types are not JSON Schema points anyways
        if (typeof(curValue)=="object"){
            argObject[key] = removeEnum(curValue)
        }
    } 

    return argObject;
}

/** 
 * if there is a format for a string, remove that
 * once that is done, find a sub item that is of object type, call recursively
 * if there is no sub item with object, return the current scoped object
 * This is done to allow putting placeholders for a string that will actually break the format
 * @param {object} argObject
 * @return {object}
**/

function removeFormat(argObject) {

    // remove enum if it exists and is of array type.
    // check for array is needed since we also specify what a enum is and that it is an object
    if (("format" in argObject) && (typeof(argObject.format) == "string")){
        // need to decide whether to delete or replace it with ""
        // delete is "cleaner" but "" is more explicit
        delete argObject.format;
    }

    for (var key in argObject)
    {
        let curValue = argObject[key];
        // removal is done only in objects, other types are not JSON Schema points anyways
        if (typeof(curValue)=="object"){
            argObject[key] = removeFormat(curValue)
        }
    } 

    return argObject;
}
