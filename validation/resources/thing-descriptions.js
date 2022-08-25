const validTDs = [
    {
        "@context": [
            "https://www.w3.org/2019/wot/td/v1",
            "https://www.w3.org/2022/wot/td/v1.1",
            {
                "@language": "en"
            }
        ],
        "title": "Simple Empty TD with Lang",
        "description": "A simple empty TD, with just human readable text",
        "support": "git://github.com/eclipse/thingweb.node-wot.git",
        "version": { "instance": "0.5.1"},
        "@type": "Thing",
        "security": [
            "nosec_sc"
        ],
        "id": "urn:uuid:55f01138-5c96-4b3d-a5d0-81319a2db677",
        "securityDefinitions": {
            "nosec_sc": {
                "scheme": "nosec"
            }
        },
        "properties": {
            "status": {
                "type": "string",
                "title" : "Status",
                "description": "Current status of the device",
                "forms": [
                    {
                        "href": "https://mydevice.example.com/status",
                    }]
            }
        }
    },
    {
        "@context": [
            "https://www.w3.org/2019/wot/td/v1",
            "https://www.w3.org/2022/wot/td/v1.1",
        ],
        "title": "Minimal TD",
        "@type": "Thing",
        "security": [
            "nosec_sc"
        ],
        "id": "urn:uuid:55f01138-5c96-4b3d-a5d0-81319a2db677",
        "securityDefinitions": {
            "nosec_sc": {
                "scheme": "nosec"
            }
        }
    }
   
];
const invalidTDs = [
    {
        "@context": [
            "https://www.w3.org/2019/wot/td/v1",
            "https://www.w3.org/2022/wot/td/v1.1",
        ],
        "title": "Almost empty TD",
    }
];

module.exports = {
    validTDs,
    invalidTDs
};