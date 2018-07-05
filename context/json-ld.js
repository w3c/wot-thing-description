const fs = require('fs');

const ld = 'http://www.w3.org/ns/json-ld#';
const a = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';

function context(obj, id) {
    let ctx = obj['@context'];
    let scope = id ? id.substring(id.indexOf('#') + 1) + "-" : ""; // TODO hash
    
    if (!ctx) {
        return '';
    }

    let txt = `_:${scope}context <${a}> <${ld}Context> .\r\n`;
    
    if (ctx['@vocab']) {
        let vocab = ctx['@vocab']; // TODO resolve curie if needed
        txt += `_:${scope}context <${ld}vocab> <${vocab}> .\r\n`;
    }
    
    Object.entries(ctx)
    .filter(([k, v]) => !k.startsWith('@'))
    .map(([k, v]) => {
        txt += `_:${scope}${k} <${a}> <${ld}Mapping> .\r\n`;
        txt += `_:${scope}${k} <${ld}term> "${k}" .\r\n`;
        
        let iri = v instanceof Object ? v['@id'] : v; // TODO resolve curie if needed
        txt+= `_:${scope}${k} <${ld}iri> <${iri}> .\r\n`;
        
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

exports.toRDF = context;