let fs = require('fs');
let rdf = require('rdfstore');
let dust = require('dustjs-helpers');
let jd = require("jsdom/lib/old-api.js");
//let jsdom = require("jsdom");



// extraction of rendering context from the RDF store

function target(sh, g) {
    let uris = g.match(
        sh,
        'http://www.w3.org/ns/shacl#targetClass',
        null
    ).toArray();
    
    if (uris.length != 1) {
        console.error('Shape does not define exactly one target class: ' + sh);
    }
    
    return uris[0].object.nominalValue;
}

function label(uri, g) {
    // TODO
    return uri.substr(uri.lastIndexOf('#') + 1);
}

function desc(uri, g) {
    let comments = g.match(
        uri,
        'http://www.w3.org/2000/01/rdf-schema#comment',
        null
    ).toArray();
    
    let desc = comments.reduce((d, t) => {
        let c = t.object.nominalValue;
        c.trim();
        if (!c.endsWith('.')) {
            c += '.';
        }
        if (d.length > 0) {
            d += ' ';
        }
        d += c;
        
        return d;
    }, '');
    
    return desc;
}

function path(psh, g) {
    let uris = g.match(
        psh,
        'http://www.w3.org/ns/shacl#path',
        null
    ).toArray();
    
    if (uris.length != 1) {
        console.error('Shape does not define exactly one path: ' + psh);
    }
    
    return uris[0].object.nominalValue;
}

function classOrDatatype(psh, g) {
    let classes = g.filter(t => {
        return t.subject.equals(psh) &&
            (t.predicate.equals('http://www.w3.org/ns/shacl#class')
            || t.predicate.equals('http://www.w3.org/ns/shacl#datatype'));
    }).toArray();
    
    if (classes.length != 1) {
        console.error('Shape does not define a range: ' + psh);
    }
    
    let u = classes[0].object.nominalValue;
    let l = label(u, g);
    
    return {
        uri: u.startsWith('http://www.w3.org/ns/td#') ? '#' + l.toLowerCase(): u,
        label: l
    };
}

function mandatory(psh, g) {
    let minCounts = g.match(
        psh,
        'http://www.w3.org/ns/shacl#minCount',
        null
    ).toArray();
    
    if (minCounts.length > 1) {
        console.error('Shape defines more than one min count constraint: ' + psh);
    }
    
    return minCounts.length > 0;
}

function defaultValue(psh, g) {
    let defaultValues = g.match(
        psh,
        'http://www.w3.org/ns/shacl#defaultValue',
        null
    ).toArray();
    
    if (defaultValues.length > 1) {
        console.error('Shape defines more than one default value: ' + psh);
    }
    
    return defaultValues.length > 0 ? defaultValues[0].object.nominalValue : null;
}

function fields(sh, g) {
    let fields = [];
    
    g.match(
        sh,
        'http://www.w3.org/ns/shacl#property',
        null
    ).toArray().forEach(function(t) {
        let psh = t.object.nominalValue;
        let p = path(psh, g);

        let f = {
            prop: label(p, g),
            propDesc: desc(p, g),
            otherClass: classOrDatatype(psh, g),
            mandatory: mandatory(psh, g),
            defaultValue: defaultValue(psh, g)
        };
        
        fields.push(f);
    });
    
    return fields;
}

function subclasses(sh, g) {
    let subclasses = [];
    
    let u = target(sh, g);
    let sc = g.match(
        null,
        'http://www.w3.org/2000/01/rdf-schema#subClassOf',
        u
    ).toArray().forEach(function(t) {
        let scu = t.subject.nominalValue;
        let l = label(scu, g);
        
        subclasses.push({
            subclass: {
                uri: scu.startsWith('http://www.w3.org/ns/td#') ? '#' + l.toLowerCase(): scu,
                label: l
            }
        });
    });
    
    return subclasses;
}

function context(store, cb) {
    store.graph(function(err, g) {
        let ctx = {
            coreClasses: [],
            schemaClasses: []
        };
        
        g.match(
            null,
            'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
            'http://www.w3.org/ns/shacl#NodeShape'
        ).forEach(function(t) {
            let sh = t.subject.nominalValue;
            let u = target(sh, g);
            
            let c = {
                uri: u,
                label: label(u, g),
                desc: desc(u, g),
                fields: fields(sh, g),
                subclasses: subclasses(sh, g)
            };
            
            // TODO not the best logic
            if (c.label.match('Schema')) {
                ctx.schemaClasses.push(c);
            } else {
                ctx.coreClasses.push(c);
            }
        });
        
        cb(ctx);
    });
}

// class sort prior to rendering

const predefined = [
    "Thing",
    "InteractionPattern",
    "Property",
    "Action",
    "Event",
    "Form"
];

function sort(ctx) {
    ctx.coreClasses.sort(function(c1, c2) {
        let i1 = predefined.indexOf(c1.label);
        let i2 = predefined.indexOf(c2.label);
        
        if (i1 === -1) { i1 = predefined.length; }
        if (i2 === -1) { i2 = predefined.length; }
        
        return i1 - i2;
    });
    
    return ctx;
}

// rendering

const classSrc = fs.readFileSync('class.template', 'UTF-8');
const vocSrc = fs.readFileSync('vocabulary.template', 'UTF-8');
const src = fs.readFileSync('index.html.template', 'UTF-8');

function render(ctx) {
    dust.loadSource(dust.compile(classSrc, 'class'));
    dust.renderSource(vocSrc, ctx, function(err, out) {
        if (err) {
            console.error(err);
            return;
        }
        
        let result = src.replace('{vocabulary.template}', out);
        fs.writeFileSync('index.html', result, 'UTF-8');
    });
}

// main function

const onto = fs.readFileSync('ontology/td.ttl', 'UTF-8');
const shapes = fs.readFileSync('validation/td-validation.ttl', 'UTF-8');

rdf.create(function(err, store) {
    store.load('text/turtle', onto, function(err) {
        if (err) {
            console.log(err);
            return;
        }
        
        store.load('text/turtle', shapes, function(err) {
            if (err) {
                console.log(err);
                return;
            }
        
            context(store, function(ctx) {
                render(sort(ctx));
            });
        });
    });
});
