let fs = require('fs');
let sttl = require('sttl'); // TODO add to package.json
const http = require('http');

let jsonld = require('./context/json-ld.js');

// class sort prior to rendering

const corePredefined = [
    "Thing",
    "InteractionPattern",
    "Property",
    "Action",
    "Event",
    "Form",
    "Link"
];

const schemaPredefined = [
    "DataSchema",
    "ArraySchema",
    "ObjectSchema",
    "BooleanSchema",
    "NumberSchema",
    "StringSchema"
];

const securityPredefined = [
    "SecurityScheme",
    "NoSecurityScheme",
    "BasicSecurityScheme",
    "CertSecurityScheme",
    "DigestSecurityScheme",
    "BearerSecurityScheme",
    "PSKSecurityScheme",
    "PopSecurityScheme",
    "PublicSecurityScheme",
    "ApikeySecurityScheme",
    "OAuth2SecurityScheme"
];

function sort(voc) {
    voc.coreClasses.sort(function(c1, c2) {
        let i1 = corePredefined.indexOf(c1.label);
        let i2 = corePredefined.indexOf(c2.label);
        
        if (i1 === -1) { i1 = corePredefined.length; }
        if (i2 === -1) { i2 = corePredefined.length; }
        
        return i1 - i2;
    });
    voc.schemaClasses.sort(function(c1, c2) {
        let i1 = schemaPredefined.indexOf(c1.label);
        let i2 = schemaPredefined.indexOf(c2.label);
        
        if (i1 === -1) { i1 = schemaPredefined.length; }
        if (i2 === -1) { i2 = schemaPredefined.length; }
        
        return i1 - i2;
    });
    voc.securityClasses.sort(function(c1, c2) {
        let i1 = securityPredefined.indexOf(c1.label);
        let i2 = securityPredefined.indexOf(c2.label);
        
        if (i1 === -1) { i1 = securityPredefined.length; }
        if (i2 === -1) { i2 = securityPredefined.length; }
        
        return i1 - i2;
    });
    
    return voc;
}

/**
 * params:
 *  ep  - SPARQL Update endpoint
 *  ttl - Vocabulary raw content (Turtle format);
 *        if null, the whole dataset is deleted
 * 
 * returns a Promise (no resolve param)
 */
function load(ep, ttl) {
    return new Promise((resolve, reject) => {
        let url = new URL(ep);
        let req = http.request({
            protocol: url.protocol,
            hostname: url.hostname,
            port: url.port,
            path: url.pathname,
            method: 'POST',
            headers: { 'Content-Type': 'application/sparql-update' }
        }, res => {
            if (res.statusCode >= 400) {
                let e = new Error('Endpoint returned ' + res.statusCode);
                reject(e);
            } else {
                resolve();
            }
        });
        
        req.on('error', e => reject(e));
    
        if (ttl) {
            // Turtle -> SPARQL Update syntax
            let prefixRegex = /@(prefix\s+\w*\s*:\s*<.*>)\s*\.\s*\n/g;
            let prefixes = '';
            while ((m = prefixRegex.exec(ttl))) prefixes += m[1] + '\n';
            let triples = ttl.replace(prefixRegex, '');

            req.end(prefixes + ' insert data { ' + triples + ' }');
        } else {
            req.end('drop all;');
        }
    });
}

const ttlFiles = [
    'ontology/td.ttl',
	'ontology/json-schema.ttl',
	'ontology/wot-security.ttl',
	'validation/td-validation.ttl'
];

const txtFiles = [
    'templates.txt',
    'visualization/templates.txt'
];

const src = fs.readFileSync('index.html.template.html', 'UTF-8');
const jsonSchemaValidation = fs.readFileSync('validation/td-json-schema-validation.json', 'UTF-8');

const updateEndpoint = process.env.WOT_SPARUL_ENDPOINT;
const queryEndpoint = process.env.WOT_SPARQL_ENDPOINT;
if (!updateEndpoint) throw new Error('WOT_SPARUL_ENDPOINT not defined (SPARQL update endpoint)');
if (!queryEndpoint) throw new Error('WOT_SPARQL_ENDPOINT not defined (SPARQL query endpoint)');

///////////////////////////////////////////////////////////// 1. clear endpoint
load(updateEndpoint, null)
//////////////////////////// 2. generate RDF for context and load all RDF files
.then(() => {
    let promises = ttlFiles.map((f) => {
        let ttl = fs.readFileSync(f, 'utf-8');
        return load(updateEndpoint, ttl);
    });

    const context = fs.readFileSync('context/td-context.jsonld', 'UTF-8');
    let ttl = jsonld.toRDF(JSON.parse(context));
    promises.push(load(updateEndpoint, ttl));

    return Promise.all(promises);
})
//////////////////////////////////////////////////// 3. register STTL templates
.then(() => {
    sttl.clear();

    txtFiles.forEach((f) => {
        let txt = fs.readFileSync(f, 'UTF-8');
        let templates = txt.split('---');
        templates.forEach(t => sttl.register(t));
    })

    return Promise.resolve();
})
//////////////////////////// 4. for each namespace, call HTML and DOT templates
.then(() => {
    sttl.connect(queryEndpoint);

    let rendered = src;

    let td = { type: 'uri', value: 'http://www.w3.org/ns/td#' };
    let jsonschema = { type: 'uri', value: 'http://www.w3.org/ns/json-schema#' };
    let wotsec = { type: 'uri', value: 'http://www.w3.org/ns/wot-security#' };

    // HTML rendering

    let tpl1 = 'http://w3c.github.io/wot-thing-description/#classes';
    sttl.callTemplate(tpl1, td)
    .then(html => {
        rendered = rendered.replace('{td}', html);
    //     return sttl.callTemplate(tpl1, jsonschema);
    // })
    // .then((html) => {
    //     rendered = rendered.replace('{json-schema}', html);
    //     return sttl.callTemplate(tpl1, wotsec);
    // })
    // .then(html => {
    //     rendered = rendered.replace('{wot-security}', html);
        return Promise.resolve();
    }).then(() => {
        rendered = rendered.replace('{td.json-schema.validation}', jsonSchemaValidation);
        fs.writeFileSync('index.html', rendered, 'UTF-8');
    })
    .catch(e => console.error('HTML rendering error: ' + e.message));

    // DOT rendering

    // tpl2 = 'http://w3c.github.io/wot-thing-description/visualization#main';
    // sttl.callTemplates(tpl2, td)
    // .then(dot => {
    //     fs.writeFileSync('visualization/td.dot', dot);
    //     return sttl.callTemplate(tpl2, jsonschema);
    // })
    // .then(dot => {
    //     fs.writeFileSync('visualization/json-schema.dot', dot);
    //     return sttl.callTemplate(tpl2, wotsec);
    // })
    // .then(dot => {
    //     fs.writeFileSync('visualization/wot-security.dot', dot);
    // })
    // .catch(e => console.error('DOT rendering error: ' + e.message));
})
.catch((e) => {
    console.error('Initialization error: ' + e.message);
});
