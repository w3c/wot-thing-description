let fs = require('fs');
let rdf = require('rdfstore');
let dust = require('dustjs-helpers');

// extraction of rendering context from the RDF store

let classQuery = fs.readFileSync('ontology/class.sparql', 'UTF-8');
let fieldQuery = fs.readFileSync('ontology/field.sparql', 'UTF-8');
let subclassQuery = fs.readFileSync('ontology/subclass.sparql', 'UTF-8');

function context(store, cb) {
    store.execute(classQuery, function(err, bindings) {
        let classes = bindings.map(function(c) {
            let fq = fieldQuery.replace('?class', '<' + c.uri.value + '>');
            c.fields = {
                query: fieldQuery.replace('?class', '<' + c.uri.value + '>'),
                defer: function(bindings) {
                    let fields = bindings.map(function(f) {
                        if (!f.otherClass && f.oc) {
                            // no label, take local name
                            let uri = f.oc.value;
                            f.otherClass = {
                                value: uri.substr(uri.lastIndexOf('#') + 1),
                                id: uri
                            };
                        } else if (f.otherClass) {
                            f.otherClass.id = '#' + f.otherClass.value.toLowerCase();
                        }
                        return f;
                    });
                    return fields;
                }
            };

            let subq = subclassQuery.replace('?class', '<' + c.uri.value + '>');
            c.subclasses = {
                query: subq,
                defer: function(bindings) {
                    let subclasses = bindings.map(function(sub) {
                        sub.subclass.id = '#' + sub.subclass.value.toLowerCase();
                        return sub;
                    });
                    return subclasses;
                }
            };

            return c;
        });

        // executes SPARQL queries in a serial fashion
        // TODO clean all this?
        let call = function(idx, classes) {
            if (idx == classes.length) {
                cb({ classes: classes });
            } else {
                let c = classes[idx];
                for (key in c) {
                    if (c[key].defer) {
                        let deferred = c[key];
                        store.execute(deferred.query, function(err, bindings) {
                            if (err) {
                                console.error(err);
                                // execution stopped
                            } else {
                                c[key] = deferred.defer(bindings);
                                call(idx, classes);
                            }
                        });
                        return;
                    }
                }
                call(++idx, classes);
            }
        };
        call(0, classes);
    });
}

// rendering

let vocSrc = fs.readFileSync('vocabulary.template', 'UTF-8');
let src = fs.readFileSync('index.html.template', 'UTF-8');

function render(context) {
    dust.renderSource(vocSrc, context, function(err, out) {
        let result = src.replace('{vocabulary.template}', out);
        fs.writeFileSync('index.html', result, 'UTF-8');
    });
}

// main function

let onto = fs.readFileSync('ontology/td.ttl', 'UTF-8');

rdf.create(function(err, store) {
    store.load('text/turtle', onto, function(err) {
        context(store, function(classes) {
            render(classes);
        });
    });
});