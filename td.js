'use strict';

function matches(pointer, pattern) {
    return new RegExp('^' + pattern + '$').test(pointer);
}

const indexed = [
    '/properties',
    '/actions',
    '/events',
    '/properties(/.*)?/properties',
    '/actions/[^/]*/input(/.*)?/properties',
    '/actions/[^/]*/output(/.*)?/properties',
    '/events/[^/]*/data(/.*)?/properties',
    '/events/[^/]*/subscription(/.*)?/properties',
    '/events/[^/]*/cancellation(/.*)?/properties'
];

function isIndexed(pointer) {
    for (var pattern of indexed) {
        if (matches(pointer, pattern)) return true;
    }
    return false;
}

const types = [
    ['', 'Thing'],
    ['/properties/[^/]*', 'Property'],
    ['/actions/[^/]*', 'Action'],
    ['/events/[^/]*', 'Event'],
    ['(/.*)?/forms/[0-9]*', 'Form'],
    ['(/.*)?/forms/[0-9]*/response', 'ExpectedResponse'],
    ['/links/[0-9]*', 'Link'],
    ['/version', 'Versioning'],
    ['/properties/[^/]*', 'DataSchema'],
    ['/actions/[^/]*/input', 'DataSchema'],
    ['/actions/[^/]*/output', 'DataSchema'],
    ['/events/[^/]*/data', 'DataSchema'],
    ['/events/[^/]*/subscription', 'DataSchema'],
    ['/events/[^/]*/cancellation', 'DataSchema']
];

function getTypes(pointer) {
    var match = [];
    for (var [pattern, type] of types) {
        if (matches(pointer, pattern)) match.push(type);
    }
    return match;
}

const jsonschema = {
    'rdf': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    'jsonschema': 'http://w3.org/ns/json-schema#',
    'type': {
        '@id': 'rdf:type',
        '@type': '@vocab'
    },
    'object': 'jsonschema:ObjectSchema',
    'array': 'jsonschema:ArraySchema',
    'boolean': 'jsonschema:BooleanSchema',
    'string': 'jsonschema:StringSchema',
    'number': 'jsonschema:NumberSchema',
    'integer': 'jsonschema:IntegerSchema',
    'null': 'jsonschema:NullSchema',
    'properties': {
        '@id': 'jsonschema:properties',
        '@container': '@index'
    }
};

const wotsec = {
    'rdf': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    'wotsec': 'http://w3.org/ns/wot-security#',
    'scheme': {
        '@id': 'rdf:type',
        '@type': '@vocab'
    },
    'nosec': 'wotsec:NoSecurityScheme',
    'basic': 'wotsec:BasicSecurityScheme',
    'digest': 'wotsec:DigestSecurityScheme',
    'apikey': 'wotsec:APIKeySecurityScheme',
    'bearer': 'wotsec:BearerSecurityScheme',
    'cert': 'wotsec:CertSecurityScheme',
    'psk': 'wotsec:PSKSecurityScheme',
    'public': 'wotsec:PublicSecurityScheme',
    'pop': 'wotsec:PoPSecurityScheme',
    'oauth2': 'wotsec:OAuth2SecurityScheme'
};

const contexts = [
    ['', 'http://w3.org/ns/td'],
    ['/properties/[^/]*', jsonschema],
    ['/actions/[^/]*/input', jsonschema],
    ['/actions/[^/]*/output', jsonschema],
    ['/events/[^/]*/data', jsonschema],
    ['/events/[^/]*/subscription', jsonschema],
    ['/events/[^/]*/cancellation', jsonschema],
    ['/security/[^/]*', wotsec]
];

function getContext(pointer) {
    for (var [pattern, ctx] of contexts) {
        if (matches(pointer, pattern)) return ctx;
    }
    return null;
}

function normalize(val) {
    if (!val) return [];
    else if (!(val instanceof Array)) return [val];
    else return val;
}

function transformByPointer(obj, pointer) {
    var transformed = null;
    if (obj instanceof Object) {
        if (obj instanceof Array) {
            transformed = [];
        } else {
            transformed = {};

            if (!isIndexed(pointer) && !obj['@id']) transformed['@id'] = pointer;
    
            var ts = getTypes(pointer);
            if (ts.length > 0) {
                transformed['@type'] = normalize(obj['@type']);
                for (var t of ts) {
                    transformed['@type'].push(t);
                }
            }
    
            var c = getContext(pointer);
            if (c) {
                transformed['@context'] = normalize(obj['@context']);
                transformed['@context'].push(c);
            }
        }

        for (var key in obj) {
            if (!key.startsWith('@') && key != 'id') {
                transformed[key] = transformByPointer(obj[key], pointer + '/' + key);
            }
        }
    } else {
        transformed = obj;
    }
    return transformed;
}

function transform(desc) {
    var transformed = transformByPointer(desc, '');
    transformed['@context'].push({
        '@base': desc.id + '/'
    });
    return transformed;
}

module.exports.transform = transform;
