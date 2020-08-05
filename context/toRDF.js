const fs = require('fs');

const ld = 'http://www.w3.org/ns/json-ld#';
const a = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';

function fullIRI(curie, ctx) {
    let capture = /^(\w+):(\w+)$/.exec(curie);

    if (capture) {
        let [str, ns, name] = capture;
        if (ctx[ns]) return ctx[ns] + name;
        else console.warn('No mapping found for prefix ' + ns);
    }

    return curie;
}

function context(obj, id) {
    let ctx = obj['@context'];
    let scope = id ? id.substring(id.indexOf('#') + 1) + "-" : ""; // TODO hash
    
    if (!ctx) {
        return '';
    }

    let txt = `_:${scope}context <${a}> <${ld}Context> .\r\n`;
    
    if (ctx['@vocab']) {
        let vocab = fullIRI(ctx['@vocab'], ctx);
        txt += `_:${scope}context <${ld}vocab> <${vocab}> .\r\n`;
    }
    
    Object.entries(ctx)
    .filter(([k, v]) => !k.startsWith('@'))
    .map(([k, v]) => {
        txt += `_:${scope}${k} <${a}> <${ld}Mapping> .\r\n`;
        txt += `_:${scope}${k} <${ld}term> "${k}" .\r\n`;
        
        let iri = fullIRI(v instanceof Object ? v['@id'] : v, ctx);
        if (!iri.startsWith('@')) {
            txt+= `_:${scope}${k} <${ld}iri> <${iri}> .\r\n`;
        }
        
        if (v instanceof Object) {
            if (v['@container']) {
                let container = v['@container'].replace('@', '');
                txt += `_:${scope}${k} <${ld}container> <${ld + container}> .\r\n`;
            }

            if (v['@type']) {
                let type = v['@type'];
                if (type != '@id' && type != '@vocab') {
                    txt += `_:${scope}${k} <${ld}type> <${type}> .\r\n`;
                }
            }
    
            if (v['@context']) {
                txt += context(v, iri);
            }
        }
    });
  
    return txt;
}

// CLI parser

const msg = '\
Usage: toRDF [options]\n\
Options:\n\
\t-i <file>\n\
\t\tReads JSON input from <file>.\n\
\t-o <file>\n\
\t\tWrites RDF (N-Triples) to <file>.\n\
\t-h\n\
\t\tPrints this help message and exits.\n';

let args = process.argv;

if (args.indexOf('-h') > -1) {
    console.log(msg);
    return;
}

let i = args.indexOf('-i');
let o = args.indexOf('-o');

if (i > -1 && args[i + 1]) {
    let input = args[i + 1];

    let ctx = JSON.parse(fs.readFileSync(input));
    let nt = context(ctx);

    if (o > -1 && args[o + 1]) {
        let output = args[o + 1];
        fs.writeFileSync(output, nt);
    } else {
        console.log(nt);
    }
} else {
    console.log(msg);
}