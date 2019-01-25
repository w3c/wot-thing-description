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

const types = {
    '': 'Thing',
    '/properties/[^/]*': 'Property',
    '/actions/[^/]*': 'Action',
    '/events/[^/]*': 'Event',
    '(/.*)?/forms/[0-9]*': 'Form',
    '(/.*)?/forms/[0-9]*/response': 'ExpectedResponse',
    '/links/[0-9]*': 'Link',
    '/version': 'Versioning',
    '/properties/[^/]*': 'DataSchema',
    '/actions/[^/]*/input': 'DataSchema',
    '/actions/[^/]*/output': 'DataSchema',
    '/events/[^/]*/data': 'DataSchema',
    '/events/[^/]*/subscription': 'DataSchema',
    '/events/[^/]*/cancellation': 'DataSchema'
}

function type(pointer) {
    for (var pattern in types) {
        if (matches(pointer, pattern)) return types[pattern];
    }
    return null;
}

const jsonschema = {
    'rdf': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    'jsonschema': 'http://w3.org/ns/json-schema#',
    'type': 'rdf:type',
    'object': 'jsonschema:ObjectSchema',
    // TODO 
    'properties': {
        '@id': 'jsonsschema:properties',
        '@container': '@index'
    }
};

const wotsec = {
    'rdf': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    'wotsec': 'http://w3.org/ns/wot-security#',
    'scheme': 'rdf:type',
    'nosec': 'wotsec:NoSecurityScheme'
    // TODO
};

const contexts = {
    '': 'http://w3.org/ns/td',
    '/properties/[^/]*': jsonschema,
    '/actions/[^/]*/input': jsonschema,
    '/actions/[^/]*/output': jsonschema,
    '/events/[^/]*/data': jsonschema,
    '/events/[^/]*/subscription': jsonschema,
    '/events/[^/]*/cancellation': jsonschema,
    '/security/[^/]*': wotsec
}

function context(pointer) {
    for (var pattern in contexts) {
        if (matches(pointer, pattern)) return contexts[pattern];
    }
    return null;
}

function transformRec(obj, pointer) {
    var transformed = null;
    if (typeof obj === 'object') {
        if (obj instanceof Array) {
            transformed = [];
        } else {
            transformed = {};

            if (!isIndexed(pointer) && !obj['@id']) transformed['@id'] = pointer;
    
            var t = type(pointer);
            if (t) {
                if (obj['@type'] instanceof String) t = [t, obj['@type']];
                else if (obj['@type'] instanceof Array) t = [t].concat(obj['@type']);
                transformed['@type'] = t;
            }
    
            var c = context(pointer);
            if (c) {
                if (obj['@context'] instanceof String) c = [c, obj['@context']];
                else if (obj['@context'] instanceof Array) t = [c].concat(obj['@context']);
                transformed['@context'] = c;
            }
        }

        for (var key in obj) {
            if (!key.startsWith('@') && key != 'id') {
                transformed[key] = transformRec(obj[key], pointer + '/' + key);
            }
        }
    } else {
        transformed = obj;
    }
    return transformed;
}

function transform(desc) {
    var transformed = transformRec(desc, '');
    var ctx = transformed['@context'];
    transformed['@context'] = [ctx, {
        '@base': desc.id + '/'
    }];
    return transformed;
}

/**
 * TODO to remove?
 */
function transformDeprecated(obj, type, pointer) {
    var node = {
        '@id': pointer
    };

    // copy input object keys to node object
    for (var k in obj) {
        if (k != 'id') node[k] = obj[k];
    }

    if (!node['@type']) node['@type'] = [];
    if (!(node['@type'] instanceof Array)) node['@type'] = [node['@type']];
    node['@type'].push(type);
    
    switch (type) {
        case 'Thing':
            var ctx = node['@context'];
            const defaultCtx = 'http://www.w3.org/ns/td';

            if (!ctx) node['@context'] = defaultCtx;
            else if (!(ctx instanceof Array)) node['@context'] = [ctx, defaultCtx];
            else node['@context'].push(defaultCtx);

            node.properties = [];
            for (var property in obj.properties) {
                var p = pointer + '/' + property;
                var propertyObj = transform(obj.properties[property], 'Property', p);
                node.properties.push(propertyObj);
            }

            node.actions = [];
            for (var action in obj.actions) {
                var p = pointer + '/' + action;
                var actionObj = transform(obj.actions[action], 'Action', p);
                node.actions.push(actionObj);
            }

            node.events = [];
            for (var event in obj.events) {
                var p = pointer + '/' + event;
                var eventObj = transform(obj.events[event], 'Event', p);
                node.events.push(eventObj);
            }

            // TODO perform AST transformation instead: copy values to nested forms?
            node.security = obj.security.map(function(sec, idx) {
                if (sec instanceof String) {
                    return pointer + '/securityDefinitions/' + sec;
                } else {
                    var p = pointer + '/security/' + idx;
                    return transform(sec, 'SecurityScheme', p);
                }
            });
            break;

        case 'Property':
            node = transform(obj, 'DataSchema', pointer);
            node['@type'].push('Property');

            if (!node.observable) node.observable = false;
            break;

        case 'Action':
            if (obj.input) {
                var ip = pointer + '/input';
                node.input = transform(obj.input, 'DataSchema', ip);
            }

            if (obj.output) {
                var op = pointer + '/output';
                node.output = transform(obj.output, 'DataSchema', op);
            }

            if (!node.safe) node.safe = false;
            if (!node.idempotent) node.idempotent = false;
            break;

        case 'Event':
            // TODO subscription, cancellation
            var dp = pointer + '/data';
            node.data = transform(obj.data, 'DataSchema', dp);
            break;

        case 'Form':
            // TODO

            if (!node.contentType) node.contentType = 'application/json';
            break;

        case 'DataSchema':
            switch (obj.type) {
                case 'object':
                    node['@context'] = {
                        'properties': 'jsonschema:properties'
                    };
                    
                    node['@type'].push('ObjectSchema');

                    if (obj.properties) {
                        node.properties = [];
                        if (obj.required) node.required = [];

                        for (property in obj.properties) {
                            var p = pointer + '/properties/' + property;
                            var propertyObj = transform(obj.properties[property], 'DataSchema', p);
                            node.properties.push(propertyObj);

                            if (obj.required &&
                                obj.required.indexOf(property) > -1) {
                                node.required.push(p);
                            }
                        }
                    }
                    break;

                case 'array':
                    node['@type'].push('ArraySchema');

                    if (node.items) {
                        var dpp = pointer + '/items';
                        node.items = transform(node.items, 'DataSchema', dpp);
                    }
                    break;
                    
                case 'number':
                    node['@type'].push('NumberSchema');
                    break;
                
                case 'integer':
                    node['@type'].push('IntegerSchema');
                    break;
                
                case 'string':
                    node['@type'].push('StringSchema');
                    break;

                case 'boolean':
                    node['@type'].push('BooleanSchema');
                    break;
            }

            if (!node.readOnly) node.readOnly = false;
            if (!node.writeOnly) node.writeOnly = false;
            break;

        case 'SecurityScheme':
            switch (obj.type) {
                case 'nosec':
                    node['@type'].push('NoSecurityScheme');
                    break;

                case 'basic':
                    node['@type'].push('BasicSecurityScheme');

                    if (!node.in) node.in = 'header';
                    break;
                    
                case 'digest':
                    node['@type'].push('DigestSecurityScheme');

                    if (!node.in) node.in = 'header';
                    if (!node.qop) node.qop = 'auth';
                    break;
                
                case 'apikey':
                    node['@type'].push('APIKeySecurityScheme');

                    if (!node.in) node.in = 'query';
                    break;
                
                case 'bearer':
                    node['@type'].push('BearerSecurityScheme');

                    if (!node.in) node.in = 'header';
                    if (!node.alg) node.alg = 'AES256';
                    if (!node.format) node.format = 'jwt';
                break;
            
                case 'cert':
                    node['@type'].push('CertSecurityScheme');
                    break;
                
                case 'psk':
                    node['@type'].push('PSKSecurityScheme');
                    break;
                
                case 'public':
                    node['@type'].push('PublicSecurityScheme');
                    break;
                
                case 'pop':
                    node['@type'].push('PoPSecurityScheme');

                    if (!node.in) node.in = 'header';
                    if (!node.alg) node.alg = 'AES256';
                    if (!node.format) node.format = 'jwt';
                    break;
                
                case 'oauth2':
                    node['@type'].push('OAuth2SecurityScheme');

                    if (!node.flow) node.flow = 'implicit';
                    break;
            }
            break;

        default:
            throw new Error('Unexpected object type');
    }

    return node;
}

module.exports.transform = transform;
