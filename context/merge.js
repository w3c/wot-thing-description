let fs = require('fs');

let cp = val => JSON.parse(JSON.stringify(val));

let td = JSON.parse(fs.readFileSync('context/td-context.jsonld'));
let jsonschema = JSON.parse(fs.readFileSync('context/json-schema-context.jsonld'));
let wotsec = JSON.parse(fs.readFileSync('context/wot-security-context.jsonld'));
let hctl = JSON.parse(fs.readFileSync('context/hypermedia-context.jsonld'));

let ctx = td['@context'];
ctx['@version'] = 1.1;

// if a nested context is defined with an index containers,
// the index property is taken from the nested context, not its parent
// see https://github.com/w3c/wot-thing-description/pull/1077
let tmp = cp(jsonschema['@context']);
let p = cp(tmp.properties);
tmp.properties['@index'] = ctx.properties['@index'];
tmp.properties['@context'] = { properties: p };
ctx.properties['@context'] = tmp;

ctx.input['@context'] = jsonschema['@context'];
ctx.output['@context'] = jsonschema['@context'];
ctx.data['@context'] = jsonschema['@context'];
ctx.dataResponse['@context'] = jsonschema['@context'];
ctx.subscription['@context'] = jsonschema['@context'];
ctx.cancellation['@context'] = jsonschema['@context'];

ctx.security['@context'] = wotsec['@context'];
ctx.securityDefinitions['@context'] = wotsec['@context'];

ctx.forms['@context'] = hctl['@context'];
ctx.links['@context'] = hctl['@context'];

fs.writeFileSync('context/td-context-1.1.jsonld', JSON.stringify(td, null, 2));