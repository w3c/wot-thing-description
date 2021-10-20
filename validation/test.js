import assert from 'assert';

const validTMs = [
    {
        "$comment":"security allowing placeholders in scheme",
        "@context": ["http://www.w3.org/ns/td"], 
        "@type" : "tm:ThingModel",
        "title": "Invalid model 1",
        "securityDefinitions": {
            "example_sc": {
                "scheme": "{{PLACEHOLDER}}"
            }
        },
        "security": ["example_sc"]
    },
    {
        "$comment":"placeholder with underscore",
        "@context": ["http://www.w3.org/ns/td"], 
        "@type" : "tm:ThingModel",
        "title": "Invalid model 2",
        "forms": [
          {
              "href": "https://example.com",
            "op": "{{INVALID_PLACEHOLDER}}"
          }
        ]
    }
];
const invalidTMs = [];