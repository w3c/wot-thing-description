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

let tmSchema = staticReplace(tdSchema)
tmSchema = removeRequired(tmSchema)
tmSchema = removeEnum(tmSchema)
tmSchema = removeFormat(tmSchema)
// tmSchema = convertString(tmSchema)

fs.writeFileSync("validation/tm-json-schema-validation.json", JSON.stringify(tmSchema,null,2))

/** 
 * This function changes the values of terms in the schema in a static/deterministic way.
 * These are title and description and `@type` in the root level
 * @param {object} argObject
 * @return {object}
**/
function staticReplace(argObject){

    argObject.title = "WoT Thing Model Schema - 16 February 2021"
    argObject.description = "JSON Schema for validating Thing Models. This is automatically generated from the WoT TD Schema."
    argObject.properties["@type"] = {
        "oneOf": [{
                "type": "string",
                "const":"ThingModel"
            },
            {
                "type": "array",
                "items": {
                    "type": "string"
                },
                "contains":{
                    "const":"ThingModel"
                }
            }
        ]
    }
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

/** 
 * if there is a term that does not have `string` in the type key,
 * convert that into an anyOf where one option is a string
 * this allows the use of {{MY_PLACEHOLDER}} kind of placeholders that are always string
 * If the term already is an anyOf or similar, it might be tricky to find an elegant option
 * If the type is object or array, it is not touched, right? Is it allowed to have something like: "properties":"{{}}"
 * @param {object} argObject
 * @return {object}
**/

function convertString(argObject) {
    console.log("---")
    console.log(JSON.stringify(argObject))
    // look for any type
    if (("type" in argObject)){
        //check if it is not a string and add it as anyOf
        // console.log("there is type")
        let curType = argObject.type;
        // if((curType != "string") && (curType != "object") && (curType != "array")){
        if(curType == "number"){
            console.log(curType)
            console.log(argObject)
            process.exit(0)
            delete argObject.type;
            // this is the minimum
            argObject.anyOf = [{
                type: curType
            },{
                type: "string"
            }]
            console.log(argObject)
        }

    }
    

    // console.log(Object.keys(argObject))
    
    for (var key in argObject)
    {
        let curValue = argObject[key];
        // removal is done only in objects, other types are not JSON Schema points anyways
        if (typeof(curValue)=="object"){
            if ("type" in curValue) {
                if (curValue.type == "object"){
                    // console.log(curValue)
                    curValue = convertString(curValue)
                    argObject[key] = curValue
                }
                else if (curValue.type == "array"){
                    // think about iterating arrays as well
                }
            } else {
                curValue = convertString(curValue)
                argObject[key] = curValue
            }

        }
        else {
            // console.log(curValue);
        }
    } 
    
    return argObject;
}

/* 
 Why the following wishful thinking will not work:
 - If there is a maximum with the type number, it needs to be detected and put into the anyOf. So a string replacement is not the good approach
*/


function replaceWithString(argObject) {

    argString = JSON.stringify(argObject);
    // pick the types that will be replaced: number, integer, boolean
    let resultString = argString.replace('"type":"number"','"anyOf":[{"type":"number"},{"type":"string"}]');
    resultString = resultString.replace('"type":"integer"','"anyOf":[{"type":"number"},{"type":"string"}]');
    return JSON.parse(resultString);
}