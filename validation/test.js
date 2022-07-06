const assert = require('assert');
const fs = require('fs');
const Ajv = require("ajv")

const tmSchema = fs.readFileSync("validation/tm-json-schema-validation.json")
const ajv = new Ajv({"strict":false, "addUsedSchema":false})

const validTMs = [
    {
        "$comment":"security allowing placeholders in scheme",
        "@context": ["https://www.w3.org/2022/wot/td/v1.1"], 
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
        "@context": ["https://www.w3.org/2022/wot/td/v1.1"], 
        "@type" : "tm:ThingModel",
        "title": "Valid model 2",
        "forms": [
          {
            "href": "https://example.com",
            "op": "{{MY_PLACEHOLDER}}"
          }
        ]
    },
    {
        "$comment":"missing title",
        "@context": ["https://www.w3.org/2022/wot/td/v1.1"], 
        "@type" : "tm:ThingModel"
    },
    {
        "$comment":"example 3 of the spec",
        "@context": ["https://www.w3.org/2022/wot/td/v1.1"], 
        "@type" : "tm:ThingModel",
        "title": "Valid Model 4",
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
        "@context": ["https://www.w3.org/2022/wot/td/v1.1"], 
        "@type" : "tm:ThingModel",
        "title": "Valid Model 5",
        "properties": {
            "onOff": {
                "type": "boolean"
            }
        }
    },
    {
        "$comment":"example 52",
        "@context": ["https://www.w3.org/2022/wot/td/v1.1"], 
        "@type" : "tm:ThingModel",
        "title": "Valid Model 6",
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
        "@context": ["https://www.w3.org/2022/wot/td/v1.1"], 
        "@type" : "tm:ThingModel",
        "title": "Valid Model 7",
        "properties" : {
            "switch" : {
                "tm:ref" :"http://example.com/BasicOnOffTM.tm.jsonld#/properties/onOff"
            }
       }
    },
    {
        "$comment":"example 54 of the spec",
        "@context": ["https://www.w3.org/2022/wot/td/v1.1"], 
        "@type" : "tm:ThingModel",
        "title": "Valid Model 8",
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
        "@context": ["https://www.w3.org/2022/wot/td/v1.1"], 
        "@type" : "tm:ThingModel",
        "title": "Valid Model 9",
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
        "$comment":"example 56 of the spec. Valid Model 10",
        "@context": ["https://www.w3.org/2022/wot/td/v1.1"], 
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
        "@context": ["https://www.w3.org/2022/wot/td/v1.1"], 
        "@type" : "tm:ThingModel",
        "title": "Valid Model 11",
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
        "@context": ["https://www.w3.org/2022/wot/td/v1.1"], 
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
    },
    {
        "$comment": "Enum with placeholder",
        "@context": ["https://www.w3.org/2022/wot/td/v1.1"],
        "@type": "tm:ThingModel",
        "links": [{
            "rel": "tm:extends",
            "href": "http://example.com/SmartControlLampTM",
            "type": "application/td+json"
        }],
        "properties": {
            "dim": {
                "type": "string",
                "enum":"{{MY_ENUMS}}"
            }
        }
    }
];
const invalidTMs = [    
    {
        "$comment":"absence of @type",
        "@context": ["https://www.w3.org/2022/wot/td/v1.1"],
        "title": "Invalid model 1"
    },
    {
        "$comment":"absence of @context",
        "@type" : "tm:ThingModel",
        "title": "Invalid model 2"
    },
    {
        "$comment":"single curly bracket",
        "@context": ["https://www.w3.org/2022/wot/td/v1.1"], 
        "@type" : "tm:ThingModel",
        "title": "Invalid model 3",
        "securityDefinitions": {
            "example_sc": {
                "scheme": "{PLACEHOLDER}"
            }
        },
        "security": ["example_sc"]
    },
    {
        "$comment":"no curly bracket",
        "@context": ["https://www.w3.org/2022/wot/td/v1.1"], 
        "@type" : "tm:ThingModel",
        "title": "Invalid model 4",
        "securityDefinitions": {
            "example_sc": {
                "scheme": "PLACEHOLDER"
            }
        },
        "security": ["example_sc"]
    },
    {
        "@context": ["https://www.w3.org/2022/wot/td/v1.1"], 
        "@type" : "tm:ThingModel",
        "title": "Thermostate No. {{THERMOSTATE_NUMBER}}",
        "base": "mqtt://{{MQTT_BROKER_ADDRESS}}",
        "properties": {
            "temperature": {
                "description": "Shows the current temperature value",
                "type": "number",
                "minimum": -20,
                "maximum": "{{THERMOSTATE_TEMPERATURE_MAXIMUM}}",
                "observable" : "{{THERMOSTATE_TEMPERATURE_OBSERVABLE}}",
                "{{myvar}}":true
            }
        }
    }
];

validTMs.forEach(element => {
    const valid = ajv.validate(JSON.parse(tmSchema),element)
    if (!valid) {
        console.log(element)
        console.log(ajv.errors)
    }
    assert.strictEqual(valid,true)
});

invalidTMs.forEach(element => {
    const valid = ajv.validate(JSON.parse(tmSchema),element)
    if (valid) {
        console.log(element)
        console.log(ajv.errors)
    }
    assert.strictEqual(valid,false)
});