/**
 * Testing script that attempts to validate TD documents with:
 *  - a JSON schema
 *  - SHACL constraints (after transformation to RDF)
 * 
 * The script assumes that w3c/wot is cloned in the same folder
 * as w3c/wot-thing-description, to read Plugfest/Testfest
 * materials (see dirTD variable).
 */
'use strict';

const fs = require('fs');
const SHACLValidator = require('shacl');
const jsonld = require('jsonld');

const td = require('../td.js');

const ctx10 = JSON.parse(fs.readFileSync('context/td-context-1.0.jsonld', 'utf-8'));
const shapes = fs.readFileSync('validation/td-validation.ttl', 'utf-8');

const dirTD = '../wot/testfest';

function forEachTD(dir, fn) {
    fs.readdir(dir, (err, files) => {
        files.forEach(f => {
            let path = dir + '/' + f;
            if (fs.statSync(path).isDirectory()) {
                forEachTD(path, fn);
            } else {
                if (f.endsWith('.jsonld')) {
                    fs.readFile(path, (err, str) => {
                        let desc = JSON.parse(str);
                        fn(desc, path);
                    });
                }
            }
        });
    });
}

function substitute(ctx) {
    if (ctx instanceof Array) return ctx.map(substitute);
    else if (ctx === 'http://w3.org/ns/td') return ctx10;
    else return ctx;
}

forEachTD(dirTD, desc => {
    // TODO desc.id as @base
    let transformed = td.transform(desc);
    transformed['@context'] = substitute(transformed['@context']);
    let str = JSON.stringify(transformed);
    
    jsonld.toRDF(transformed, {
        format: 'application/n-quads'
    }, (err, ttl) => {
        let v = new SHACLValidator();
        v.validate(ttl, 'text/turtle', shapes, 'text/turtle', (err, report) => {
            let nb = ttl.length === 0 ? 0 : ttl.split('\n').length;
            console.log(desc.id + ' (' + nb + ' triples):');
            if (!report.conforms()) {
                report.results().forEach(res => {
                    let s = res.severity();
                    let n = res.focusNode();
                    let p = res.path();
                    p = p.replace(/.*#/g, '');
                    let m = res.message();

                    console.log('\t' + s + ' on <' + n + '> (' + p + '): ' + m);
                });
            }
        });
    });
});
