let fs = require('fs');
let rdf = require('rdfstore');
let dust = require('dustjs-helpers');

const sparql = 'ontology/td.sparql';
const ttl = 'ontology/td.ttl';
const vocTemplate = 'vocabulary.template';
const template = 'index.html.template';
const html = 'index.html';

function aggregate(bindings) {
    let array = [];
    let idx = {};
    bindings.forEach(function(b) {
        let c = b.class.value;
        if (idx[c] != undefined) {
            let i = idx[c];
            array[i].bindings.push(b);
        } else {
            array.push({
                bindings: [b]
            });
            idx[c] = array.length - 1;
        }
        if (!b.otherClass && b.oc) {
            // no label, take local name
            let uri = b.oc.value;
            b.otherClass = {
                value: uri.substr(uri.lastIndexOf('#') + 1),
                id: uri
            };
        } else if (b.otherClass) {
            b.otherClass.id = '#' + b.otherClass.value.toLowerCase()
        }
    });
    return array;
}

let query = fs.readFileSync(sparql, 'UTF-8');

let onto = fs.readFileSync(ttl, 'UTF-8');

let vocSrc = fs.readFileSync(vocTemplate, 'UTF-8');

let src = fs.readFileSync(template, 'UTF-8');

rdf.create(function(err, store) {
    store.load('text/turtle', onto, function(err) {
        store.execute(query, function(err, results) {
            dust.renderSource(vocSrc, {
                classes: aggregate(results)
            }, function(err, out) {
                let result = src.replace('{vocabulary.template}', out);
                fs.writeFileSync(html, result, 'UTF-8');
            });
        });
    });
});