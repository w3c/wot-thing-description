const assert = require('assert');
const fs = require('fs');
const Ajv = require("ajv")

const tmSchema = fs.readFileSync("validation/tm-json-schema-validation.json")
const ajv = new Ajv({"strict":false})

const validTMs = [
    {
        "$comment":"security allowing placeholders in scheme",
        "@context": ["http://www.w3.org/ns/td"], 
        "@type" : "tm:ThingModel",
        "title": "Valid model 1",
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
        "title": "Valid model 2",
        "forms": [
          {
            "href": "https://example.com",
            "op": "{{INVALID-PLACEHOLDER}}"
          }
        ]
    },
    {
        "$comment":"missing title",
        "@context": ["http://www.w3.org/ns/td"], 
        "@type" : "tm:ThingModel"
    },
    {
        "$comment":"example 3 of the spec",
        "@context": ["http://www.w3.org/ns/td"], 
        "@type" : "tm:ThingModel",
        "title": "Lamp Thing Model",
        "properties": {
            "status": {
                "description": "current status of the lamp (on|off)",
                "type": "string",
                "readOnly": true
            }
        },
        "actions": {
            "toggle": {
                "description": "Turn the lamp on or off"
            }
        },
        "events": {
            "overheating": {
                "description": "Lamp reaches a critical temperature (overheating)",
                "data": {"type": "string"}
            }
        }
    },
    {
        "$comment":"example 51 of the spec",
        "@context": ["http://www.w3.org/ns/td"], 
        "@type" : "tm:ThingModel",
        "title": "Basic On/Off Thing Model",
        "properties": {
            "onOff": {
                "type": "boolean"
            }
        }
    },
    {
        "$comment":"example 52",
        "@context": ["http://www.w3.org/ns/td"], 
        "@type" : "tm:ThingModel",
        "title": "Smart Lamp Control with Dimming",
        "links" : [{
            "rel": "tm:extends",
            "href": "http://example.com/BasicOnOffTM",
            "type": "application/td+json"
         }],
        "properties" : {
            "dim" : {
                "type": "integer",
                "minimum": 0,
                "maximum": 100
            }
       }
    },
    {
        "$comment":"example 53 of the spec",
        "@context": ["http://www.w3.org/ns/td"], 
        "@type" : "tm:ThingModel",
        "title": "Smart Lamp Control",
        "properties" : {
            "switch" : {
                "tm:ref" :"http://example.com/BasicOnOffTM.tm.jsonld#/properties/onOff"
            }
       }
    },
    {
        "$comment":"example 54 of the spec",
        "@context": ["http://www.w3.org/ns/td"], 
        "@type" : "tm:ThingModel",
        "title": "Smart Lamp Control",
        "properties" : {
            "dimming" : {
                "tm:ref" :"http://example.com/SmartLampControlwithDimming.tm.jsonld#/properties/dim",
                "maximum": 80,
                "unit" : "%"
            }
       }
    },
    {
        "$comment":"example 55 of the spec",
        "@context": ["http://www.w3.org/ns/td"], 
        "@type" : "tm:ThingModel",
        "title": "Smart Lamp Control",
        "links" : [{
            "rel": "extends",
            "href": "http://example.com/BasicOnOffTM",
            "type": "application/td+json"
         }],
        "properties" : {
            "status" : {
                "tm:ref" :"http://example.com/LampTM.tm.jsonld#/properties/status"
            },
            "dimming" : {
                "tm:ref" :"http://example.com/LampWithDimmingTM.tm.jsonld#/properties/dim"
            }
       }
    },
    {
        "$comment":"example 56 of the spec",
        "@context": ["http://www.w3.org/ns/td"], 
        "@type" : "tm:ThingModel",
        "title": "Thermostate No. {{THERMOSTATE_NUMBER}}",
        "base": "mqtt://{{MQTT_BROKER_ADDRESS}}",
        "properties": {
            "temperature": {
                "description": "Shows the current temperature value",
                "type": "number",
                "minimum": -20,
                "maximum": "{{THERMOSTATE_TEMPERATURE_MAXIMUM}}",
                "observable" : "{{THERMOSTATE_TEMPERATURE_OBSERVABLE}}"
            }
        }
    },
    {
        "$comment":"example 57 of the spec",
        "@context": ["http://www.w3.org/ns/td"], 
        "@type" : "tm:ThingModel",
        "title": "Lamp Thing Model",
        "description": "Lamp Thing Description Model",
        "tm:required": [
            "#/properties/status",
            "#/actions/toggle"
        ],
        "properties": {
            "status": {
                "description": "current status of the lamp (on|off)",
                "type": "string",
                "readOnly": true
            }
        },
        "actions": {
            "toggle": {
                "description": "Turn the lamp on or off"
            }
        },
        "events": {
            "overheating": {
                "description": "Lamp reaches a critical temperature (overheating)",
                "data": {"type": "string"}
            }
        }
    },
    {
        "$comment":"example 59 of the spec",
        "@context": ["http://www.w3.org/ns/td"], 
        "@type" : "tm:ThingModel",
        "links" : [{
            "rel": "tm:extends",
            "href": "http://example.com/SmartControlLampTM",
            "type": "application/td+json"
         }],
        "properties" : {
            "dim" : {
                "maximum": 200
            }
       }
    }
];
const invalidTMs = [    
    {
        "$comment":"absence of @type",
        "@context": ["http://www.w3.org/ns/td"],
        "title": "Invalid model 2"
    },
    {
        "$comment":"absence of @context",
        "@type" : "tm:ThingModel",
        "title": "Valid model 2"
    },
    {
        "$comment":"single curly bracket",
        "@context": ["http://www.w3.org/ns/td"], 
        "@type" : "tm:ThingModel",
        "title": "Valid model 1",
        "securityDefinitions": {
            "example_sc": {
                "scheme": "{PLACEHOLDER}"
            }
        },
        "security": ["example_sc"]
    },
    {
        "$comment":"no curly bracket",
        "@context": ["http://www.w3.org/ns/td"], 
        "@type" : "tm:ThingModel",
        "title": "Valid model 1",
        "securityDefinitions": {
            "example_sc": {
                "scheme": "PLACEHOLDER"
            }
        },
        "security": ["example_sc"]
    }
];

validTMs.forEach(element => {
    const valid = ajv.validate(tmSchema,element)
    if (!valid) console.log(ajv.errors)
    assert.strictEqual(valid,true)
});

invalidTMs.forEach(element => {
    const valid = ajv.validate(tmSchema,element)
    console.log(valid)
    console.log(element)
    assert.strictEqual(valid,false)
});