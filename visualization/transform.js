const fs = require('fs');
const sttl = require('sttl'); // TODO add to package.json
const http = require('http');

const ttlFiles = [
    '../ontology/td.ttl',
    '../ontology/json-schema.ttl',
    '../ontology/wot-security.ttl',
    '../context/td-context.ttl',
    '../validation/td-validation.ttl'
];

const sttlFile = 'templates.txt';

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

/**
 * params:
 *  ep   - SPARQL endpoint (query)
 *  txt  - STTL templates separated by '\n\n'
 *  main - STTL entry point (URI as a string)
 *  arg  - binding for the ?in STTL variable
 * 
 * returns a Promise (resolve param: STTL string)
 */
function transform(ep, txt, main, arg) {
    sttl.connect(ep);

    let templates = txt.split('---');
    sttl.clear();
    templates.forEach(t => sttl.register(t));

    return sttl.callTemplate(main, arg);
}

const updateEndpoint = process.env.WOT_SPARUL_ENDPOINT;
const queryEndpoint = process.env.WOT_SPARQL_ENDPOINT;
if (!updateEndpoint) throw new Error('WOT_SPARUL_ENDPOINT not defined (SPARQL update endpoint)');
if (!queryEndpoint) throw new Error('WOT_SPARQL_ENDPOINT not defined (SPARQL query endpoint)');

load(updateEndpoint, null).then(() => {
    let promises = ttlFiles.map((f) => {
        let ttl = fs.readFileSync(f, 'utf-8');
        return load(updateEndpoint, ttl);
    });

    Promise.all(promises).then(() => {
        let tpl = fs.readFileSync(sttlFile, 'utf-8');
        let main = 'http://w3c.github.io/wot-thing-description/visualization#main';
    
        transform(queryEndpoint, tpl, main, {
            type: 'uri', value: 'http://www.w3.org/ns/td#'
        }).then(dot => fs.writeFileSync('td.dot', dot));
    
        transform(queryEndpoint, tpl, main, {
            type: 'uri', value: 'http://www.w3.org/ns/json-schema#'
        }).then(dot => fs.writeFileSync('json-schema.dot', dot));
    
        transform(queryEndpoint, tpl, main, {
            type: 'uri', value: 'http://www.w3.org/ns/wot-security#'
        }).then(dot => fs.writeFileSync('wot-security.dot', dot));
    }).catch((e) => {
        throw new Error('Could not load RDF data: ' + e.message);
    });
});