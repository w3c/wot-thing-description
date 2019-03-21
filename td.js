'use strict';

const jsonld = require('jsonld').promises;

function toRDF(desc) {
    // TODO add defaults
    // TODO deal with @index

    return jsonld.toRDF(desc);
}

module.exports.transform = transform;
