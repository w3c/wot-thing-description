let fs = require('fs');
let sttl = require('sttl');
const http = require('http');
const urlm = require('url');

let jsonld = require('./context/json-ld.js');
//let tidyHTML = require('./tidy.js');

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
        let url = urlm.parse(ep);
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

const ctxFiles = [
    'context/td-context-1.1.jsonld'
    // 'context/td-context.jsonld',
    // 'context/json-schema-context.jsonld',
    // 'context/wot-security-context.jsonld',
    // 'context/hypermedia-context.jsonld'
];

const ttlFiles = [
    'ontology/td.ttl',
	'ontology/json-schema.ttl',
	'ontology/wot-security.ttl',
    'ontology/hypermedia.ttl',
    // 'ontology/alignments.ttl',
	'validation/td-validation.ttl'
];

const txtFiles = [
    'templates.txt',
    'visualization/templates.txt',
    'ontology/templates.txt'
];

const updateEndpoint = 'http://localhost:3030/temp'; // process.env.WOT_SPARUL_ENDPOINT;
const queryEndpoint = 'http://localhost:3030/temp'; // process.env.WOT_SPARQL_ENDPOINT;
if (!updateEndpoint) throw new Error('WOT_SPARUL_ENDPOINT not defined (SPARQL update endpoint)');
if (!queryEndpoint) throw new Error('WOT_SPARQL_ENDPOINT not defined (SPARQL query endpoint)');

//////////////////////////////////////////////////////// 0. render main document
const src = fs.readFileSync('index.template.html', 'UTF-8');
const atriskCSS = fs.readFileSync('testing/atrisk.css', 'UTF-8');
const jsonSchemaValidation = fs.readFileSync('validation/td-json-schema-validation.json', 'UTF-8');

let rendered = src.replace('{atriskCSS}', atriskCSS);
rendered = rendered.replace('{td.json-schema.validation}', jsonSchemaValidation);

fs.writeFileSync('index.html', rendered, 'UTF-8');
///////////////////////////////////////////////////////////// 1. clear endpoint
load(updateEndpoint, null)
///////////////////////////////////// 2. generate 1.1 context file with nesting
.then(() => {
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

    ctx.forms['@context'] = hctl['@context'];
    ctx.links['@context'] = hctl['@context'];

    fs.writeFileSync('context/td-context-1.1.jsonld', JSON.stringify(td));

    return Promise.resolve();
}) 
//////////////////////////// 2. generate RDF for context and load all RDF files
.then(() => {
    let promises = ttlFiles.map((f) => {
        let ttl = fs.readFileSync(f, 'utf-8');
        return load(updateEndpoint, ttl);
    }).concat(ctxFiles.map(f => {
        const context = fs.readFileSync(f, 'UTF-8');
        let ttl = jsonld.toRDF(JSON.parse(context));
        return load(updateEndpoint, ttl);
    }));

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
///////////////////////////////////// 4. for each namespace, call HTML templates
.then(() => {
    sttl.connect(queryEndpoint);

    let td = { type: 'uri', value: 'https://www.w3.org/2019/wot/td#' };
    let jsonschema = { type: 'uri', value: 'https://www.w3.org/2019/wot/json-schema#' };
    let wotsec = { type: 'uri', value: 'https://www.w3.org/2019/wot/security#' };
    let hctl = { type: 'uri', value: 'https://www.w3.org/2019/wot/hypermedia#' };

    // HTML rendering (ontology documents)
 
    let tdPrefix = { type: 'literal', value: 'td' };
    let jsonschemaPrefix = { type: 'literal', value: 'jsonschema' };
    let wotsecPrefix = { type: 'literal', value: 'wotsec' };
    let hctlPrefix = { type: 'literal', value: 'hctl' };

    let process = (ns, html) => {
        let tpl = 'ontology/' + ns + '.template.html';
        let f = 'ontology/' + ns + '.html';
        let doc = fs.readFileSync(tpl, 'utf-8').replace('{axioms}', html);
        fs.writeFileSync(f, doc);
    };

    tpl3 = 'http://w3c.github.io/wot-thing-description/ontology#main';
    sttl.callTemplate(tpl3, td, tdPrefix)
    .then(html => {
        process('td', html);
        return sttl.callTemplate(tpl3, jsonschema, jsonschemaPrefix);
    })
    .then(html => {
        process('jsonschema', html);
        return sttl.callTemplate(tpl3, wotsec, wotsecPrefix);
    })
    .then(html => {
        process('wotsec', html);
        return sttl.callTemplate(tpl3, hctl, hctlPrefix);
    })
    .then(html => {
        process('hctl', html);
    })
    .catch(e => console.error('HTML (ontology) rendering error: ' + e.message));

})
.catch((e) => {
    console.error('Initialization error: ' + e.message);
});
