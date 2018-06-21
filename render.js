let fs = require('fs');
let rdf = require('rdfstore');
let dust = require('dustjs-helpers');
let jd = require("jsdom/lib/old-api.js");
//let jsdom = require("jsdom");

let jsonld = require('./context/json-ld.js');

// extraction of vocabulary to render from the RDF store

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

function mapping(uri, g) {
    let mappings = g.match(
        null,
        'http://www.w3.org/ns/json-ld#iri',
        uri
    ).toArray();
    
    if (mappings.length == 0) {
        console.error('No context mapping defined for URI: ' + uri);
    }
    
    return mappings[0].subject.nominalValue;
}

function term(uri, g) {
    let terms = g.match(
        mapping(uri, g),
        'http://www.w3.org/ns/json-ld#term',
        null
    ).toArray();
    
    if (terms.length != 1) {
        console.error('Context mapping does not define exactly one term: ' + uri);
    }
    
    return terms[0].object.nominalValue;
}

function label(uri, g) {
    let labels = g.match(
        uri,
        'http://www.w3.org/2000/01/rdf-schema#label',
        null
    ).toArray();
    
    if (labels.length > 0) {
        return labels[0].object.nominalValue;
    } else {
        return uri.substr(uri.lastIndexOf('#') + 1);
    }
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

function array(p, g) {
    let containers = g.match(
        mapping(p, g),
        'http://www.w3.org/ns/json-ld#container',
        null
    ).toArray();
    
    return containers.length > 0 &&
        containers.find(t =>
            t.object.nominalValue === 'http://www.w3.org/ns/json-ld#set' ||
            t.object.nominalValue === 'http://www.w3.org/ns/json-ld#list'
        );
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
            prop: term(p, g),
            propDesc: desc(p, g),
            otherClass: classOrDatatype(psh, g),
            array: array(p, g),
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

function vocabulary(store, cb) {
    store.graph(function(err, g) {
        let voc = {
            coreClasses: [],
            securityClasses: [],
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
                voc.schemaClasses.push(c);
            } else if (c.label.match('Security')) { 
                voc.securityClasses.push(c);
            } else {
                voc.coreClasses.push(c);
            }
        });
        
        cb(voc);
    });
}

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
    "BasicSecurityScheme",
    "DigestSecurityScheme",
    "BearerSecurityScheme",
    "PopSecurityScheme",
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

// rendering

const classSrc = fs.readFileSync('class.template', 'UTF-8');
const vocSrc = fs.readFileSync('vocabulary.template', 'UTF-8');
const src = fs.readFileSync('index.html.template', 'UTF-8');

function render(voc) {
    dust.loadSource(dust.compile(classSrc, 'class'));
    dust.renderSource(vocSrc, voc, function(err, out) {
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
const context = fs.readFileSync('context/td-context.jsonld', 'UTF-8');

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
            
            let ttl = jsonld.toRDF(JSON.parse(context));
            
            store.load('text/turtle', ttl, function(err) {
                if (err) {
                    console.log(err);
                    return;
                }

                vocabulary(store, function(voc) {
                    render(sort(voc));
                });
            });
        });
    });
});
