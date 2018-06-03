const fs = require('fs');

const ld = 'http://www.w3.org/ns/json-ld#';
const a = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';

function context(obj) {
    let ctx = obj['@context'];
    
    if (!ctx) {
        return '';
    }

    let txt = `_:context <${a}> <${ld}Context> .\r\n`;
    
    if (ctx['@vocab']) {
        let vocab = ctx['@vocab']; // TODO resolve curie if needed
        txt += `_:context <${ld}vocab> <${vocab}> .\r\n`;
    }
    
    Object.entries(ctx)
    .filter(([k, v]) => !k.startsWith('@'))
    .map(([k, v]) => {
        txt += `_:${k} <${a}> <${ld}Mapping> .\r\n`;
        txt += `_:${k} <${ld}term> "${k}" .\r\n`;
        
        let iri = v instanceof String ? v : v['@id']; // TODO resolve curie if needed
        txt+= `_:${k} <${ld}iri> "${iri}" .\r\n`;
        
        if (v instanceof Object) {
            if (v['@container']) {
                let container = v['@container'].replace('@id', '');
                txt += `_:${k} <${ld}container> "${ld + container}" .\r\n`;
            }

            if (v['@type']) {
                let type = v['@type'];
                txt += `_:${k} <${ld}type> "${type}" .\r\n`;
            }
        }
    });
  
    return txt;
}

let txt = fs.readFileSync('ontology/td-context.jsonld', 'utf-8');
let obj = JSON.parse(txt);

let ctx = context(obj);
fs.writeFileSync('ontology/td-context.ttl', ctx);