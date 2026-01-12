// TDs are provided as js so that we can put comments
// However, please do not remove JSON serialization so that they can be copy pasted easily

// TDs that do not have all information needed to build requests when expanded
const invalidCompactTDs = [
  // Inline (no definitions objects)
  // Missing Base, i.e., no way to build full URI
  {
    "@context": "https://www.w3.org/ns/wot-next/td",
    "title": "invalid-test-compacted-0",
    "formDefaults": {
      "contentType": "application/json",
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
  }
];

// TDs that are fully expanded and have all information needed to build requests, i.e., like TD 1.1
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
            "href": "https://example.com/props/prop1",
            "security": { "scheme": "basic" },
            "contentType": "application/json",
            "op": "readproperty"
          }
        ]
      }
    }
  },
  // expanded version of the "valid-test-compact-8-override" from above. Note that status2 gets duplicated forms
  {
    "@context": "https://www.w3.org/ns/wot-next/td",
    "title": "valid-test-expanded-8-override",
    "properties": {
      "status1": {
        "type": "string",
        "forms": [
          {
            "href": "coap://mylamp.example.com/status1",
            "contentType": "application/cbor"
          },
          {
            "href": "coap://mylamp.example.com/status1",
            "contentType": "application/octet-stream"
          }
        ]
      },
      "status2": {
        "type": "string",
        "forms": [
          {
            "href": "https://mylamp.example.com/status",
            "contentType": "text/html"
          },
          {
            "href": "https://mylamp.example.com/status",
            "contentType": "text/html"
          }
        ]
      }
    }
  }
];

// TDs that are not fully expanded or do not have all information needed to build requests
const invalidExpandedTDs = [
  // no security defined anywhere
  {
    "@context": "https://www.w3.org/ns/wot-next/td",
    "title": "invalid-test-expanded-1",
    "properties": {
      "prop1": {
        "type": "string",
        "forms": [
          {
            "href": "https://example.com/props/prop1",
            "contentType": "application/json",
            "op": "readproperty"
          }
        ]
      },
      "prop2": {
        "type": "string",
        "forms": [
          {
            "href": "https://example.com/props/prop2",
            "contentType": "application/json"
          }
        ]
      }
    }
  }
];

// Compact TDs that are recommended to be used as examples for different use cases such as multiple IP addresses, multi protocols, etc.
const validCompactTDs = [
  // 1. default content type not being json (e.g. cbor)
  // use case: constrained devices using coap and cbor
  {
    "@context": "https://www.w3.org/ns/wot-next/td",
    "title": "valid-test-cbor-default",
    "formDefaults": {
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
  // 1-alt. alternative way of writing the same TD using definitions instead of inlining
  // this is not recommended but possible
  {
    "@context": "https://www.w3.org/ns/wot-next/td",
    "title": "valid-test-cbor-default-definitions",
    "formDefinitions": {
      "cborCoap": {
        "contentType": "application/cbor",
        "base": "coap://[2001:DB8::1]/mything",
        "security": {
          "scheme": "nosec"
        }
      }
    },
    "formDefaults": ["cborCoap"],
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
    "title": "valid-test-modbus-params",
    "formDefaults": {
      "base": "modbus+tcp://192.168.178.32:502/1/",
      "modv:timeout": 1000,
      "modv:pollingInterval": 5000,
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
        "type": "boolean",
        "forms": [
          {
            "href": "1",
            "modv:entity": "Coil"
          }
        ]
      },
      "prop2": {
        "type": "string",
        "forms": [
          {
            "href": "2",
            "modv:entity": "HoldingRegister"
          }
        ]
      }
    }
  },
  // 3. mqtt with qos 0 and retained for all topics except one with override. This can be an examples for overriding too.
  // use case: mqtt device with different qos/retain requirements in different topics
  {
    "@context": "https://www.w3.org/ns/wot-next/td",
    "title": "valid-test-mqtt-override",
    "formDefaults": {
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
  // both use the same security and content type
  // there is no advantage of the new mechanism much other than reducing TD length. The forms have the same amount of terms in the end.
  // However, this is a recommended way to use multiple IP addresses
  // without duplicating security and content type in each form
  // and also without duplicating base in each form (as done in the past)
  {
    "@context": "https://www.w3.org/ns/wot-next/td",
    "title": "valid-test-multi-ip",
    "formDefinitions": {
      "ipv4": {
        "base": "https://192.168.1.10:8080",
        "contentType": "application/json",
        "security": {
          "scheme": "nosec"
        }
      },
      "ipv6": {
        "base": "https://[2001:db8:85a3::8a2e:370:7334]:8080",
        "contentType": "application/json",
        "security": {
          "scheme": "nosec"
        }
      }
    },
    "formDefaults": ["ipv4", "ipv6"],
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
  // 5. local with no sec and public with basic auth
  // Use case: When a device is proxied to the internet
  {
    "@context": "https://www.w3.org/ns/wot-next/td",
    "title": "valid-test-diff-sec",
    "formDefinitions": {
      "local": {
        "base": "http://192.168.1.10:8080",
        "contentType": "application/json",
        "security": {
          "scheme": "nosec"
        }
      },
      "public": {
        "base": "https://example.com:8080",
        "contentType": "application/json",
        "security": {
          "scheme": "basic"
        }
      }
    },
    "formDefaults": ["local", "public"],
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
  // both use the same security but different content type and protocol
  {
    "@context": "https://www.w3.org/ns/wot-next/td",
    "title": "valid-test-multi-protocol",
    "formDefinitions": {
      "http": {
        "base": "https://192.168.1.10:8080",
        "contentType": "application/json",
        "security": {
          "scheme": "nosec"
        }
      },
      "coap": {
        "base": "coap://[2001:DB8::1]/mything",
        "contentType": "application/cbor",
        "security": {
          "scheme": "nosec"
        }
      }
    },
    "formDefaults": ["http", "coap"],
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
  // TODO: Double check this one's correctness
  {
    "@context": "https://www.w3.org/ns/wot-next/td",
    "title": "valid-test-nonstandard-rest",
    "formDefinitions": {
      "read": {
        "base": "https://192.168.1.10:8080",
        "op": "readproperty",
        "contentType": "application/json",
        "htv:methodName": "GET",
        "security": {
          "scheme": "nosec"
        }
      },
      "write": {
        "base": "https://192.168.1.10:8080",
        "op": "writeproperty",
        "contentType": "application/json",
        "htv:methodName": "POST",
        "security": {
          "scheme": "nosec"
        }
      },
      "invoke": {
        "base": "https://192.168.1.10:8080",
        "op": "invokeaction",
        "contentType": "application/json",
        "htv:methodName": "POST",
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
    "title": "valid-test-diff-sec-per-op",
    "formDefinitions": {
      "read": {
        "base": "https://192.168.1.10:8080",
        "op": "readproperty",
        "contentType": "application/json",
        "security": {
          "scheme": "nosec"
        }
      },
      "write": {
        "base": "https://192.168.1.10:8080",
        "op": "writeproperty",
        "contentType": "application/json",
        "security": {
          "scheme": "basic"
        }
      }
    },
    "formDefaults": ["read", "write"],
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
  // 9. multiple content types where all affordances are available in json and cbor
  {
    "@context": "https://www.w3.org/ns/wot-next/td",
    "title": "valid-test-multi-contenttype",
    "formDefinitions": {
      "json": {
        "base": "https://192.168.1.10:8080",
        "contentType": "application/json",
        "security": {
          "scheme": "nosec"
        }
      },
      "cbor": {
        "base": "https://192.168.1.10:8080",
        "contentType": "application/cbor",
        "security": {
          "scheme": "nosec"
        }
      }
    },
    "formDefaults": ["json", "cbor"],
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
  // 10. different protocol per affordance type (http for properties and actions, mqtt for events)
  {
    "@context": "https://www.w3.org/ns/wot-next/td",
    "title": "valid-test-multi-affordance-protocol",
    "formDefinitions": {
      "http": {
        "base": "https://192.168.1.10:8080",
        "contentType": "application/json",
        "security": {
          "scheme": "nosec"
        }
      },
      "mqtt": {
        "base": "mqtt://test.mosquitto.org:1883",
        "contentType": "text/plain",
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
  },
  // 11. multiple content types and protocols where all affordances are available in json and cbor AND coap and http
  // note that the expanded version would have 4 forms per affordance (http+json, http+cbor, coap+json, coap+cbor)
  {
    "@context": "https://www.w3.org/ns/wot-next/td",
    "title": "valid-test-multi-protocol-multi-contenttype",
    "formDefinitions": {
      "http+json": {
        "base": "http://192.168.1.10:8080/mything",
        "contentType": "application/json",
        "security": {
          "scheme": "nosec"
        }
      },
      "http+cbor": {
        "base": "http://192.168.1.10:8080/mything",
        "contentType": "application/cbor",
        "security": {
          "scheme": "nosec"
        }
      },
      "coap+json": {
        "base": "coap://[2001:DB8::1]/mything",
        "contentType": "application/json",
        "security": {
          "scheme": "nosec"
        }
      },
      "coap+cbor": {
        "base": "coap://[2001:DB8::1]/mything",
        "contentType": "application/cbor",
        "security": {
          "scheme": "nosec"
        }
      }
    },
    "formDefaults": ["http+json", "http+cbor", "coap+json", "coap+cbor"],
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

module.exports = {
  validCompactTDs,
  invalidCompactTDs,
  validExpandedTDs,
  invalidExpandedTDs,
  recommendedTDs
};
