let fs = require('fs');

let td = JSON.parse(fs.readFileSync('context/td-context.jsonld'));
let jsonschema = JSON.parse(fs.readFileSync('context/json-schema-context.jsonld'));
let wotsec = JSON.parse(fs.readFileSync('context/wot-security-context.jsonld'));
let hctl = JSON.parse(fs.readFileSync('context/hypermedia-context.jsonld'));

let ctx = td['@context'];
ctx['@version'] = 1.1;

ctx.properties['@context'] = jsonschema['@context'];
ctx.input['@context'] = jsonschema['@context'];
ctx.output['@context'] = jsonschema['@context'];
ctx.data['@context'] = jsonschema['@context'];
ctx.subscription['@context'] = jsonschema['@context'];
ctx.cancellation['@context'] = jsonschema['@context'];

ctx.security['@context'] = wotsec['@context'];
ctx.securityDefinitions['@context'] = wotsec['@context'];

ctx.forms['@context'] = hctl['@context'];
ctx.links['@context'] = hctl['@context'];

fs.writeFileSync('context/td-context-1.1.jsonld', JSON.stringify(td, null, 2));