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

const contexts = [
    ['', 'http://www.w3.org/ns/td'],
    ['/properties/[^/]*', 'http://www.w3.org/ns/json-schema'],
    ['/actions/[^/]*/input', 'http://www.w3.org/ns/json-schema'],
    ['/actions/[^/]*/output', 'http://www.w3.org/ns/json-schema'],
    ['/events/[^/]*/data', 'http://www.w3.org/ns/json-schema'],
    ['/events/[^/]*/subscription', 'http://www.w3.org/ns/json-schema'],
    ['/events/[^/]*/cancellation', 'http://www.w3.org/ns/json-schema'],
    ['/security/[^/]*', 'http://www.w3.org/ns/wot-security']
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
    else return [].concat(val); // return a copy
}

function transformByPointer(obj, id, pointer) {
    var transformed = null;
    if (obj instanceof Object) {
        if (obj instanceof Array) {
            transformed = [];
        } else {
            transformed = {};

            if (!isIndexed(pointer) && !obj['@id']) transformed['@id'] = id + pointer;
            else if (obj['@id']) transformed['@id'] = obj['@id'];
    
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
            if (['id', '@id', '@type', '@context'].indexOf(key) === -1) {
                transformed[key] = transformByPointer(obj[key], id, pointer + '/' + key);
            }
        }
    } else {
        transformed = obj;
    }
    return transformed;
}

function transform(desc) {
    return transformByPointer(desc, desc.id, '');
}

module.exports.transform = transform;
