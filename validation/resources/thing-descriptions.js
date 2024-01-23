const validTDs = [
  {
    "@context": [
      "https://www.w3.org/2019/wot/td/v1",
      "https://www.w3.org/2022/wot/td/v1.1",
      {
        "@language": "en",
      },
    ],
    title: "Simple Empty TD with Lang",
    description: "A simple empty TD, with just human readable text",
    support: "git://github.com/eclipse/thingweb.node-wot.git",
    version: { instance: "0.5.1" },
    "@type": "Thing",
    security: ["nosec_sc"],
    id: "urn:uuid:55f01138-5c96-4b3d-a5d0-81319a2db677",
    securityDefinitions: {
      nosec_sc: {
        scheme: "nosec",
      },
    },
    properties: {
      status: {
        type: "string",
        title: "Status",
        description: "Current status of the device",
        forms: [
          {
            href: "https://mydevice.example.com/status",
          },
        ],
      },
    },
  },
  {
    "@context": ["https://www.w3.org/2019/wot/td/v1", "https://www.w3.org/2022/wot/td/v1.1"],
    title: "Minimal TD",
    "@type": "Thing",
    security: ["nosec_sc"],
    id: "urn:uuid:55f01138-5c96-4b3d-a5d0-81319a2db677",
    securityDefinitions: {
      nosec_sc: {
        scheme: "nosec",
      },
    },
  },
  {
    "@context": [
      "https://www.w3.org/2019/wot/td/v1",
      "https://www.w3.org/2022/wot/td/v1.1",
      {
        "@language": "it",
      },
    ],
    title: "Descrittore semplice con lingua di default",
    "@type": "Thing",
    security: ["nosec_sc"],
    id: "urn:uuid:55f01138-5c96-4b3d-a5d0-81319a2db677",
    securityDefinitions: {
      nosec_sc: {
        scheme: "nosec",
      },
    },
    properties: {
      stato: {
        title: "Stato",
        description: "Stato corrente del dispositivo",
        forms: [{ href: "https://mydevice.example.com/status" }],
      },
    },
  },
  {
    "@context": ["https://www.w3.org/2019/wot/td/v1", "https://www.w3.org/2022/wot/td/v1.1"],
    title: "Minimal TD with link",
    "@type": "Thing",
    security: ["nosec_sc"],
    id: "urn:uuid:55f01138-5c96-4b3d-a5d0-81319a2db677",
    securityDefinitions: {
      nosec_sc: {
        scheme: "nosec",
      },
    },
    links: [
      {
        href: "https://example.com/status",
        rel: "icon",
        type: "bar",
        sizes: "16x16",
        hreflang: "en",
      },
    ],
  },
  {
    "@context": ["https://www.w3.org/2019/wot/td/v1", "https://www.w3.org/2022/wot/td/v1.1"],
    title: "Minimal TD with Operations",
    "@type": "Thing",
    security: ["nosec_sc"],
    id: "urn:uuid:55f01138-5c96-4b3d-a5d0-81319a2db677",
    securityDefinitions: {
      nosec_sc: {
        scheme: "nosec",
      },
    },
    forms: [
      {
        href: "https://mydevice.example.com/status",
        op: "readallproperties",
      },
    ],
  },
  {
    "@context": ["https://www.w3.org/2019/wot/td/v1", "https://www.w3.org/2022/wot/td/v1.1"],
    title: "Minimal TD with Array Operations",
    "@type": "Thing",
    security: ["nosec_sc"],
    id: "urn:uuid:55f01138-5c96-4b3d-a5d0-81319a2db677",
    securityDefinitions: {
      nosec_sc: {
        scheme: "nosec",
      },
    },
    forms: [
      {
        href: "https://mydevice.example.com/status",
        op: ["readallproperties", "writeallproperties"],
      },
    ],
  },
];
const invalidTDs = [
  {
    "@context": ["https://www.w3.org/2019/wot/td/v1", "https://www.w3.org/2022/wot/td/v1.1"],
    "@type": "Thing",
  },
  {
    "@context": ["https://www.w3.org/2019/wot/td/v1", "https://www.w3.org/2022/wot/td/v1.1"],
    title: {
      foo: "bar",
    },
    "@type": "Thing",
  },
  {
    "@context": ["https://www.w3.org/2019/wot/td/v1", "https://www.w3.org/2022/wot/td/v1.1"],
    title: "Minimal TD",
    "@type": "Thing",
    security: ["nosec_sc"],
    id: "urn:uuid:55f01138-5c96-4b3d-a5d0-81319a2db677",
    securityDefinitions: {
      nosec_sc: {
        scheme: "nosec",
      },
    },
    properties: [{ foo: "bar" }],
    actions: [{ foo: "bar" }],
    events: [{ foo: "bar" }],
  },
  {
    "@context": ["https://www.w3.org/2019/wot/td/v1", "https://www.w3.org/2022/wot/td/v1.1"],
    title: "Minimal TD missing href",
    "@type": "Thing",
    security: ["nosec_sc"],
    id: "urn:uuid:55f01138-5c96-4b3d-a5d0-81319a2db677",
    securityDefinitions: {
      nosec_sc: {
        scheme: "nosec",
      },
    },
    properties: {
      status: {
        type: "string",
        title: "Status",
        description: "Current status of the device",
        forms: [{}],
      },
    },
  },
];

module.exports = {
  validTDs,
  invalidTDs,
};
