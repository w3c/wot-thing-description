let fs = require('fs');
let rdf = require('rdfstore');
let dust = require('dustjs-helpers');

const sparql = 'ontology/td.sparql';
const ttl = 'ontology/td.ttl';
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
    });
    return array;
}

let query = fs.readFileSync(sparql, 'UTF-8');

let onto = fs.readFileSync(ttl, 'UTF-8');

let src = fs.readFileSync(template, 'UTF-8');

rdf.create(function(err, store) {
    store.load('text/turtle', onto, function(err) {
        store.execute(query, function(err, results) {
            dust.renderSource(src, {
                classes: aggregate(results)
            }, function(err, out) {
                fs.writeFileSync(html, out, 'UTF-8');
            });
        });
    });
});