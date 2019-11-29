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

// TODO remove if JSON-LD impl is up-to-date
// const td = require('../td.js');

const ctx = JSON.parse(fs.readFileSync('context/td-context-1.1.jsonld', 'utf-8'));
const remoteCtx = 'https://www.w3.org/2019/wot/td/v1';

function substitute(obj) {
    if (obj == remoteCtx) return ctx;
    else if (obj instanceof Array) return obj.map(substitute);

    let c = obj['@context'];
    if (c) obj['@context'] = substitute(c);
    
    return obj;
}

const shapes = fs.readFileSync('validation/td-validation.ttl', 'utf-8');

const dirTD = '../wot/testing/tests/2019-05/inputs';

function forEachTD(dir, fn) {
    fs.readdir(dir, (err, files) => {
        files.forEach(f => {
            let path = dir + '/' + f;
            if (fs.statSync(path).isDirectory()) {
                forEachTD(path, fn);
            } else {
                if (/json(ld|td)?$/.test(f)) {
                    fs.readFile(path, (err, str) => {
                        let desc = JSON.parse(str);
                        fn(desc, path);
                    });
                }
            }
        });
    });
}

forEachTD(dirTD, desc => {
    desc = substitute(desc);
    let str = JSON.stringify(desc)
    
    jsonld.toRDF(desc, {
        format: 'application/n-quads'
    }, (err, ttl) => {
        if (err) {
            console.error(err);
            return;
        }

        let v = new SHACLValidator();
        v.validate(ttl, 'text/turtle', shapes, 'text/turtle', (err, report) => {
            if (err) {
                console.error(err);
                return;
            }

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
            } else {
                console.log('\tOK');
            }
        });
    });
});
