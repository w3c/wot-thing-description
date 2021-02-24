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

/** 
 * This function returns part of the object given in param with the value found when resolving the path. Similar to JSON Pointers.
 * In case no path is found, the param defaultValue is echoed back
 * Taken from https://stackoverflow.com/questions/6491463/accessing-nested-javascript-objects-and-arrays-by-string-path/6491621#6491621
 * @param {object} object
 * @param {string} path
 * @param {any} defaultValue
 * @return {object}
**/
const resolvePath = (object, path, defaultValue) => path
   .split('.')
   .reduce((o, p) => o ? o[p] : defaultValue, object)

/** 
 * This function replaces part of the object given in param with the value given as value at the location given in path.
 * Taken from https://stackoverflow.com/questions/6491463/accessing-nested-javascript-objects-and-arrays-by-string-path/6491621#6491621
 * @param {object} object
 * @param {string} path
 * @param {any} defaultValue
 * @return {object}
**/
const setPath = (object, path, value) => path
.split('.')
.reduce((o,p,i) => o[p] = path.split('.').length === ++i ? value : o[p] || {}, object)



const fs = require('fs');

// take the TD Schema
let tdSchema = JSON.parse(fs.readFileSync('validation/td-json-schema-validation.json'));

let tmSchema = staticReplace(tdSchema)
tmSchema = removeRequired(tmSchema)
tmSchema = removeEnum(tmSchema)
tmSchema = removeFormat(tmSchema)
// tmSchema = convertString(tmSchema)
tmSchema = manualConvertString(tmSchema)

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
 * This function changes the terms that have values of number, integer or boolean to anyOf with string and that term.
 * Until convertString function works, this is its more manual version
 * such types are found in: definitions/dataSchema minimum, maximum, minItems, maxItems, minLength, maxLength, multipleOf, 
 * writeOnly, readOnly and the exact same in definitions/property_element but there is also observable here
 * safe and idempotent in definitions/action_element
 * @param {object} argObject
 * @return {object}
**/
function manualConvertString(argObject){
    // the exact paths of the above mentioned locations of types
    let paths = [
        "definitions.dataSchema.properties.minimum",
        "definitions.dataSchema.properties.maximum",
        "definitions.dataSchema.properties.minItems",
        "definitions.dataSchema.properties.maxItems",
        "definitions.dataSchema.properties.minLength",
        "definitions.dataSchema.properties.maxLength",
        "definitions.dataSchema.properties.multipleOf",
        "definitions.dataSchema.properties.writeOnly",
        "definitions.dataSchema.properties.readOnly",
        "definitions.property_element.properties.minimum",
        "definitions.property_element.properties.maximum",
        "definitions.property_element.properties.minItems",
        "definitions.property_element.properties.maxItems",
        "definitions.property_element.properties.minLength",
        "definitions.property_element.properties.maxLength",
        "definitions.property_element.properties.multipleOf",
        "definitions.property_element.properties.writeOnly",
        "definitions.property_element.properties.readOnly",
        "definitions.property_element.properties.observable",
        "definitions.action_element.properties.safe",
        "definitions.action_element.properties.idempotent"
    ]
    
    //iterate over this array and replace for each
    paths.forEach(element => {
        console.log(element)
        let curSchema = resolvePath(argObject,element,"hey");
        // if (curSchema == "hey") console.log(element)
        let newSchema = changeToAnyOf(curSchema);
        setPath(argObject,element, newSchema);
    });
    return argObject;

}

/** 
 * This function take a schema that has type:something and converts it into
 * anyOf with string
 * @param {object} argObject
 * @return {object}
**/
function changeToAnyOf(argObject){
    if ("type" in argObject ){
        let curType = argObject.type;
        delete argObject.type;

        argObject.anyOf = [{
            type: curType
        },{
            type: "string"
        }]
        return argObject;
    } else {
        return argObject
    }
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