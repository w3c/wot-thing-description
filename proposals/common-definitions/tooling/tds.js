// TDs are provided as js so that we can put comments
// However, please do not remove JSON serialization so that they can be copy pasted easily

const validCompactTDs = [
  // Inline (no definitions objects)
  // All defaults in a form and flattened without connection
  {
    "@context": "https://www.w3.org/ns/wot-next/td",
    "title": "valid-test-compact-2",
    "form": {
      "contentType": "application/json",
      "base": "https://example.com",
      "security": {
        "scheme": "nosec"
      }
    },
    "properties": {
      "prop1": {
        "type": "string",
        "forms": [
          {
            "href": "props/prop1"
          }
        ]
      },
      "prop2": {
        "type": "string",
        "forms": [
          {
            "href": "props/prop2"
          }
        ]
      }
    }
  },
  // All Defaults in a Form but still with connection
  {
    "@context": "https://www.w3.org/ns/wot-next/td",
    "title": "valid-test-compact-1",
    "form": {
      "contentType": "application/json",
      "connection": {
        "base": "https://example.com",
        "security": {
          "scheme": "nosec"
        }
      }
    },
    "properties": {
      "prop1": {
        "type": "string",
        "forms": [
          {
            "href": "props/prop1"
          }
        ]
      },
      "prop2": {
        "type": "string",
        "forms": [
          {
            "href": "props/prop2"
          }
        ]
      }
    }
  },
  // Separate Defaults
  {
    "@context": "https://www.w3.org/ns/wot-next/td",
    "title": "valid-test-compact-0",
    "connection": {
      "base": "https://example.com"
    },
    "form": {
      "contentType": "application/json"
    },
    "security": {
      "scheme": "nosec"
    },
    "properties": {
      "prop1": {
        "type": "string",
        "forms": [
          {
            "href": "props/prop1"
          }
        ]
      },
      "prop2": {
        "type": "string",
        "forms": [
          {
            "href": "props/prop2"
          }
        ]
      }
    }
  },
  // With definitions
  // All definitions are present and referenced in the root
  {
    "@context": "https://www.w3.org/ns/wot-next/td",
    "title": "valid-test-compact-3",
    "connectionDefinitions": {
      "conn1": {
        "base": "https://example.com"
      }
    },
    "formDefinitions": {
      "form1": {
        "contentType": "application/json"
      }
    },
    "securityDefinitions": {
      "sec1": {
        "scheme": "nosec"
      }
    },
    "connection": ["conn1"],
    "form": ["form1"],
    "security": ["sec1"],
    "properties": {
      "prop1": {
        "type": "string",
        "forms": [
          {
            "href": "props/prop1"
          }
        ]
      },
      "prop2": {
        "type": "string",
        "forms": [
          {
            "href": "props/prop2"
          }
        ]
      }
    }
  },
  // Definitions in the root but usage only in forms
  {
    "@context": "https://www.w3.org/ns/wot-next/td",
    "title": "valid-test-compact-5",
    "securityDefinitions": {
      "sec1": {
        "scheme": "nosec"
      }
    },
    "connectionDefinitions": {
      "conn1": {
        "base": "https://example.com"
      }
    },
    "formDefinitions": {
      "form1": {
        "contentType": "application/json"
      }
    },
    "properties": {
      "prop1": {
        "type": "string",
        "forms": [
          {
            "connection": ["conn1"],
            "form": ["form1"],
            "security": ["sec1"],
            "href": "props/prop1"
          }
        ]
      },
      "prop2": {
        "type": "string",
        "forms": [
          {
            "connection": ["conn1"],
            "form": ["form1"],
            "security": ["sec1"],
            "href": "props/prop2"
          }
        ]
      }
    }
  },
  // Root definitions using other definitions but no root usage
  {
    "@context": "https://www.w3.org/ns/wot-next/td",
    "title": "valid-test-compact-6",
    "securityDefinitions": {
      "sec1": {
        "scheme": "nosec"
      }
    },
    "connectionDefinitions": {
      "conn1": {
        "security": "sec1",
        "base": "https://example.com"
      }
    },
    "formDefinitions": {
      "form1": {
        "connection": "conn1",
        "contentType": "application/json"
      }
    },
    "properties": {
      "prop1": {
        "type": "string",
        "forms": [
          {
            "form": ["form1"],
            "href": "props/prop1"
          }
        ]
      },
      "prop2": {
        "type": "string",
        "forms": [
          {
            "form": ["form1"],
            "href": "props/prop2"
          }
        ]
      }
    }
  },
  // nothing in the root
  // only defined and used within the forms
  {
    "@context": "https://www.w3.org/ns/wot-next/td",
    "title": "valid-test-compact-4",
    "properties": {
      "prop1": {
        "type": "string",
        "forms": [
          {
            "href": "https://example.comprops/prop1",
            "connection": {
              "security": { "scheme": "nosec" }
            },
            "contentType": "application/json"
          }
        ]
      },
      "prop2": {
        "type": "string",
        "forms": [
          {
            "href": "https://example.comprops/prop2",
            // applying flattening to the form above, removing connection
            "security": { "scheme": "basic" },
            "contentType": "application/json"
          }
        ]
      }
    }
  },
  // one writeproperty requiring basic auth
  {
    "@context": "https://www.w3.org/ns/wot-next/td",
    "title": "valid-test-compact-7",
    "connectionDefinitions": {
      "conn1": {
        "base": "https://example.com"
      }
    },
    "formDefinitions": {
      "form1": {
        "contentType": "application/json"
      }
    },
    "securityDefinitions": {
      "sec1": {
        "scheme": "nosec"
      },
      "sec2": {
        "scheme": "basic"
      }
    },
    "connection": ["conn1"],
    "form": ["form1"],
    "security": ["sec1"],
    "properties": {
      "prop1": {
        "type": "string",
        "forms": [
          {
            "href": "props/prop1",
            "op": "readproperty"
          },
          {
            "href": "props/prop1",
            "op": "writeproperty",
            "connection": {
              "inherit": "conn1",
              "security": "sec2"
            }
          }
        ]
      },
      "prop2": {
        "type": "string",
        "forms": [
          {
            "href": "props/prop2"
          }
        ]
      }
    }
  }
];

// TDs that do not have all information needed to build requests when expanded
const invalidCompactTDs = [
  // Inline (no definitions objects)
  // Missing Connection
  // TODO: This cannot be invalidated with a JSON Schema since there is no way to say that connection is required if it is not inlined in the form
  {
    "@context": "https://www.w3.org/ns/wot-next/td",
    "title": "invalid-test-compacted-0",
    "form": {
      "contentType": "application/json"
    },
    "security": {
      "scheme": "nosec"
    },
    "properties": {
      "prop1": {
        "type": "string",
        "forms": [
          {
            "href": "props/prop1"
          }
        ]
      },
      "prop2": {
        "type": "string",
        "forms": [
          {
            "href": "props/prop2"
          }
        ]
      }
    }
  },
  // a flattened form but it still has connection, i.e. base conflicts
  {
    "@context": "https://www.w3.org/ns/wot-next/td",
    "title": "invalid-test-compacted-1",
    "form": {
      "contentType": "application/json",
      "base": "https://example.com",
      "security": {
        "scheme": "nosec"
      },
      "connection": {
        "base": "https://example.com"
      }
    },
    "properties": {
      "prop1": {
        "type": "string",
        "forms": [
          {
            "href": "props/prop1"
          }
        ]
      },
      "prop2": {
        "type": "string",
        "forms": [
          {
            "href": "props/prop2"
          }
        ]
      }
    }
  }
];

const validExpandedTDs = [
  // Simple TD
  {
    "@context": "https://www.w3.org/ns/wot-next/td",
    "title": "valid-test-expanded-0",
    "properties": {
      "prop1": {
        "type": "string",
        "forms": [
          {
            "href": "https://example.comprops/prop1",
            "security": { "scheme": "basic" },
            "contentType": "application/json",
            "op": "readproperty"
          }
        ]
      }
    }
  }
];

// TDs that are not fully expanded or do not have all information needed to build requests
const invalidExpandedTDs = [
  // connection is not expanded
  {
    "@context": "https://www.w3.org/ns/wot-next/td",
    "title": "invalid-test-expanded-0",
    "properties": {
      "prop1": {
        "type": "string",
        "forms": [
          {
            "href": "https://example.comprops/prop1",
            "connection": {
              "security": { "scheme": "nosec" }
            },
            "contentType": "application/json",
            "op": "readproperty"
          }
        ]
      }
    }
  },
  // no security defined anywhere
  {
    "@context": "https://www.w3.org/ns/wot-next/td",
    "title": "invalid-test-expanded-1",
    "properties": {
      "prop1": {
        "type": "string",
        "forms": [
          {
            "href": "https://example.comprops/prop1",
            "contentType": "application/json",
            "op": "readproperty"
          }
        ]
      },
      "prop2": {
        "type": "string",
        "forms": [
          {
            "href": "https://example.comprops/prop2",
            "contentType": "application/json"
          }
        ]
      }
    }
  }
];

// Compact TDs that are recommended to be used as examples for different use cases such as multiple IP addresses, multi protocols, etc.
const recommendedTDs = [
  // 1. default content type not being json (e.g. cbor)
  // use case: constrained devices using coap and cbor
  {
    "@context": "https://www.w3.org/ns/wot-next/td",
    "title": "recommended-test-cbor-default",
    "form": {
      "contentType": "application/cbor",
      "base": "coap://[2001:DB8::1]/mything",
      "security": {
        "scheme": "nosec"
      }
    },
    "properties": {
      "prop1": {
        "type": "string",
        "forms": [
          {
            "href": "props/prop1"
          }
        ]
      },
      "prop2": {
        "type": "string",
        "forms": [
          {
            "href": "props/prop2"
          }
        ]
      }
    }
  },
  // 2. modbus with all parameters in one form
  // use case: any modbus device
  {
    "@context": "https://www.w3.org/ns/wot-next/td",
    "title": "recommended-test-modbus-params",
    "form": {
      // until next comment: can be in connection
      "base": "modbus+tcp://192.168.178.32:502/1/",
      "modv:timeout": 1000,
      "modv:pollingInterval": 5000,
      // until security: not in connection
      "modv:zeroBasedAddressing": true,
      "modv:mostSignificantByte": true,
      "modv:mostSignificantWord": true,
      "contentType": "application/octet-stream",
      "security": {
        "scheme": "nosec"
      }
    },
    "properties": {
      "prop1": {
        "type": "string",
        "forms": [
          {
            "href": "props/prop1"
          }
        ]
      },
      "prop2": {
        "type": "string",
        "forms": [
          {
            "href": "props/prop2"
          }
        ]
      }
    }
  },
  // 3. mqtt with qos 0 and retained for all topics except one with override. This can be an examples for overriding too.
  // use case: mqtt device with different qos/retain requirements in different topics
  {
    "@context": "https://www.w3.org/ns/wot-next/td",
    "title": "recommended-test-mqtt-override",
    "form": {
      "base": "mqtt://broker.com:1883",
      "mqv:qos": "0",
      "mqv:retain": true,
      "contentType": "application/json",
      "security": {
        "scheme": "nosec"
      }
    },
    "actions": {
      "act1": {
        "type": "string",
        "forms": [
          {
            "href": "actions/act1"
          }
        ]
      },
      "act2": {
        "type": "string",
        "forms": [
          {
            "href": "actions/act2"
          }
        ]
      },
      "act3": {
        "type": "string",
        "forms": [
          {
            "href": "actions/act3",
            "mqv:qos": "2",
            "mqv:retain": false
          }
        ]
      }
    }
  },
  // 4. Multi IP addresses (IPv4 and IPv6)
  // Use case: Device with two IP assignments
  // notes:
  // there is no default connection/ip format.
  // both use the same security and content type
  // there is no advantage of the new mechanism much other than reducing TD length. The forms have the same amount of terms in the end.
  // However, this is a recommended way to use multiple IP addresses
  // without duplicating security and content type in each form
  // and also without duplicating base in each form (as done in the past)
  {
    "@context": "https://www.w3.org/ns/wot-next/td",
    "title": "recommended-test-multi-ip",
    "connectionDefinitions": {
      "ipv4": {
        "base": "https://192.168.1.10:8080"
      },
      "ipv6": {
        "base": "https://[2001:db8:85a3::8a2e:370:7334]:8080"
      }
    },
    "connection": ["ipv4", "ipv6"],
    "form": {
      "contentType": "application/json"
    },
    "security": {
      "scheme": "nosec"
    },
    "properties": {
      "prop1": {
        "type": "string",
        "forms": [
          {
            "href": "props/prop1"
          }
        ]
      },
      "prop2": {
        "type": "string",
        "forms": [
          // TODO: leaving it here for now to give an idea. It would look weird but keep more consistency
          {
            "href": "props/prop2"
          },
          {
            "href": "props/prop2"
          }
        ]
      }
    }
  },
  // 5. local with no sec and public with basic auth
  // Use case: When a device is proxied to the internet
  {
    "@context": "https://www.w3.org/ns/wot-next/td",
    "title": "recommended-test-diff-sec",
    "connectionDefinitions": {
      "local": {
        "base": "http://192.168.1.10:8080",
        "security": {
          "scheme": "nosec"
        }
      },
      "public": {
        "base": "https://example.com:8080",
        "security": {
          "scheme": "basic"
        }
      }
    },
    "connection": ["local", "public"],
    "form": {
      "contentType": "application/json"
    },
    "properties": {
      "prop1": {
        "type": "string",
        "forms": [
          {
            "href": "props/prop1"
          }
        ]
      },
      "prop2": {
        "type": "string",
        "forms": [
          {
            "href": "props/prop2"
          }
        ]
      }
    }
  },
  // 6. multi protocols: http with json and coap with cbor
  // Use case: Device supporting both coap and http
  // notes:
  // there is no default connection/protocol.
  // both use the same security but different content type
  // if they were both using the same content type, we could have used two connection definitions, like in the example above
  {
    "@context": "https://www.w3.org/ns/wot-next/td",
    "title": "recommended-test-multi-protocol",
    "formDefinitions": {
      "http": {
        "base": "https://192.168.1.10:8080",
        "contentType": "application/json"
      },
      "coap": {
        "base": "coap://[2001:DB8::1]/mything",
        "contentType": "application/cbor"
      }
    },
    "form": ["http", "coap"],
    "security": {
      "scheme": "nosec"
    },
    "properties": {
      "prop1": {
        "type": "string",
        "forms": [
          {
            "href": "props/prop1"
          }
        ]
      },
      "prop2": {
        "type": "string",
        "forms": [
          {
            "href": "props/prop2"
          }
        ]
      }
    }
  },
  // 7. readproperty and writeproperty defaults that are not the defaults of the binding (GET and POST)
  // use case: device using REST but not following usual conventions
  {
    "@context": "https://www.w3.org/ns/wot-next/td",
    "title": "recommended-test-multi-protocol",
    "connection": {
      "base": "https://192.168.1.10:8080"
    },
    "formDefinitions": {
      "read": {
        "op": "readproperty",
        "contentType": "application/json",
        "htv:methodName": "GET"
      },
      "write": {
        "op": "writeproperty",
        "contentType": "application/json", // duplicating this can be avoided with "inherit"
        "htv:methodName": "POST"
      },
      "invoke": {
        "op": "invokeaction",
        "contentType": "application/json",
        "htv:methodName": "POST"
      }
    },
    "security": {
      "scheme": "nosec"
    },
    "properties": {
      "prop1": {
        "type": "string",
        "forms": [
          {
            "form": "read",
            "href": "props/prop1"
          },
          {
            "form": "write",
            "href": "props/prop1"
          }
        ]
      },
      "prop2": {
        "type": "string",
        "forms": [
          {
            "form": "read",
            "href": "props/prop2"
          },
          {
            "form": "write",
            "href": "props/prop2"
          }
        ]
      },
      // in the following, we don't use the definitions from above as the protocol defaults are enough.
      // it is not clear if this is a real use case, but it shows the possibility
      "propWithProtocolDefaults": {
        "type": "string",
        "forms": [
          {
            "op": ["readproperty", "writeproperty"],
            "href": "props/prop1"
          }
        ]
      },
      "propReadOnly": {
        "type": "string",
        "readOnly": true,
        "forms": [
          {
            "form": "read",
            "href": "props/propR"
          }
        ]
      }
    }
  },
  // 8. read and write requiring different security for all affordances
  {
    "@context": "https://www.w3.org/ns/wot-next/td",
    "title": "recommended-test-multi-protocol",
    "connection": {
      "base": "https://192.168.1.10:8080"
    },
    "formDefinitions": {
      "read": {
        "op": "readproperty",
        "contentType": "application/json",
        "security": "readNoSec"
      },
      "write": {
        "op": "writeproperty",
        "contentType": "application/json", // duplicating this can be avoided with "inherit"
        "security": "writeBasic"
      }
    },
    "securityDefinitions": {
      "readNoSec": {
        "scheme": "nosec"
      },
      "writeBasic": {
        "scheme": "basic"
      }
    },
    "security": "readNoSec",
    "properties": {
      "prop1": {
        "type": "string",
        "forms": [
          {
            "form": "read",
            "href": "props/prop1"
          },
          {
            "form": "write",
            "href": "props/prop1"
          }
        ]
      },
      "prop2": {
        "type": "string",
        "forms": [
          {
            "form": "read",
            "href": "props/prop2"
          },
          {
            "form": "write",
            "href": "props/prop2"
          }
        ]
      }
    }
  },
  // 9. multiple content types where all affordances are available in json and cbor
  {
    "@context": "https://www.w3.org/ns/wot-next/td",
    "title": "recommended-test-multi-protocol",
    "formDefinitions": {
      "json": {
        "contentType": "application/json"
      },
      "cbor": {
        "contentType": "application/cbor"
      }
    },
    "form": ["json", "cbor"],
    "connection": {
      "base": "https://192.168.1.10:8080"
    },
    "security": {
      "scheme": "nosec"
    },
    "properties": {
      "prop1": {
        "type": "string",
        "forms": [
          {
            "form": "json",
            "href": "props/prop1"
          }
        ]
      },
      "prop2": {
        "type": "string",
        "forms": [
          {
            "form": "json",
            "href": "props/prop2"
          }
        ]
      }
    }
  },
  // 10. different protocol per affordance type (http for properties and actions, mqtt for events)
  {
    "@context": "https://www.w3.org/ns/wot-next/td",
    "title": "recommended-test-multi-affordance-protocol",
    "formDefinitions": {
      "http": {
        "base": "https://192.168.1.10:8080",
        "contentType": "application/json"
      },
      "mqtt": {
        "base": "mqtt://test.mosquitto.org:1883",
        "contentType": "text/plain"
      }
    },
    "security": {
      "scheme": "nosec"
    },
    "properties": {
      "prop1": {
        "type": "string",
        "forms": [
          {
            "form": "http",
            "href": "props/prop1"
          }
        ]
      }
    },
    "actions": {
      "act1": {
        "input": { "type": "string" },
        "forms": [
          {
            "form": "http",
            "href": "/actions/act1"
          }
        ]
      }
    },
    "events": {
      "evt1": {
        "data": { "type": "string" },
        "forms": [
          {
            "form": "mqtt",
            "href": "events/evt1" //assuming we transition to topic relative hrefs in mqtt binding
          }
        ]
      }
    }
  }
];

module.exports = {
  validCompactTDs,
  invalidCompactTDs,
  validExpandedTDs,
  invalidExpandedTDs,
  recommendedTDs
};
