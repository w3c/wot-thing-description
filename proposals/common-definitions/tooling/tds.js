// TDs are provided as js so that we can put comments
// However, please do not remove JSON serialization so that they can be copy pasted easily

// TDs that do not have all information needed to build requests when expanded
const invalidCompactTDs = [
  // Inline (no definitions objects)
  // Missing Base, i.e., no way to build full URI
  // This cannot be validated by the schema as base is optional in formDefaults since form hrefs can have absolute URIs
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
  },
  // no formDefaults, i.e. definitions exist but not referenced. Thus, no way to build full requests or understand security
  // This cannot be validated by the schema as maybe all forms have "form"
  {
    "@context": "https://www.w3.org/ns/wot-next/td",
    "title": "invalid-test-compacted-1",
    "formDefinitions": {
      "cborCoap": {
        "contentType": "application/cbor",
        "base": "coap://[2001:DB8::1]/mything",
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
  // One form is referencing a non-existing definition
  // This cannot be validated by the schema as we cannot check for links between values
  {
    "@context": "https://www.w3.org/ns/wot-next/td",
    "title": "invalid-test-compacted-2",
    "formDefinitions": {
      "cborCoap": {
        "contentType": "application/cbor",
        "base": "coap://[2001:DB8::1]/mything",
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
      },
      "prop2": {
        "type": "string",
        "forms": [
          {
            "form": "cborCoap",
            "href": "props/prop2"
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
// This is an array of arrays where each sub-array has two TDs: [compact TD, expanded TD]
const validTDs = [
  [
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
    // expanded
    {
      "@context": "https://www.w3.org/ns/wot-next/td",
      "title": "expanded-valid-test-cbor-default",
      "properties": {
        "prop1": {
          "type": "string",
          "forms": [
            {
              "href": "coap://[2001:DB8::1]/mything/props/prop1",
              "contentType": "application/cbor",
              "security": {
                "scheme": "nosec"
              },
              "op": ["readproperty", "writeproperty"]
            }
          ]
        },
        "prop2": {
          "type": "string",
          "forms": [
            {
              "href": "coap://[2001:DB8::1]/mything/props/prop2",
              "contentType": "application/cbor",
              "security": {
                "scheme": "nosec"
              },
              "op": ["readproperty", "writeproperty"]
            }
          ]
        }
      }
    }
  ],
  [
    // 1-alt2. alternative way of writing the same TD without formDefaults
    // this is not recommended but possible
    {
      "@context": "https://www.w3.org/ns/wot-next/td",
      "title": "valid-test-cbor-default-definitions-alt2",
      "formDefinitions": {
        "cborCoap": {
          "contentType": "application/cbor",
          "base": "coap://[2001:DB8::1]/mything",
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
              "form": "cborCoap",
              "href": "props/prop1"
            }
          ]
        },
        "prop2": {
          "type": "string",
          "forms": [
            {
              "form": "cborCoap",
              "href": "props/prop2"
            }
          ]
        }
      }
    },
    // expanded
    {
      "@context": "https://www.w3.org/ns/wot-next/td",
      "title": "expanded-valid-test-cbor-default",
      "properties": {
        "prop1": {
          "type": "string",
          "forms": [
            {
              "href": "coap://[2001:DB8::1]/mything/props/prop1",
              "contentType": "application/cbor",
              "security": {
                "scheme": "nosec"
              },
              "op": ["readproperty", "writeproperty"]
            }
          ]
        },
        "prop2": {
          "type": "string",
          "forms": [
            {
              "href": "coap://[2001:DB8::1]/mything/props/prop2",
              "contentType": "application/cbor",
              "security": {
                "scheme": "nosec"
              },
              "op": ["readproperty", "writeproperty"]
            }
          ]
        }
      }
    }
  ],
  [
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
    // expanded
    {
      "@context": "https://www.w3.org/ns/wot-next/td",
      "title": "expanded-valid-test-modbus-params",
      "properties": {
        "prop1": {
          "type": "boolean",
          "forms": [
            {
              "href": "modbus+tcp://192.168.178.32:502/1/1",
              "modv:entity": "Coil",
              "modv:timeout": 1000,
              "modv:pollingInterval": 5000,
              "modv:zeroBasedAddressing": true,
              "modv:mostSignificantByte": true,
              "modv:mostSignificantWord": true,
              "contentType": "application/octet-stream",
              "security": {
                "scheme": "nosec"
              },
              "op": "readproperty"
            }
          ]
        },
        "prop2": {
          "type": "string",
          "forms": [
            {
              "href": "modbus+tcp://192.168.178.32:502/1/2",
              "modv:entity": "HoldingRegister",
              "modv:timeout": 1000,
              "modv:pollingInterval": 5000,
              "modv:zeroBasedAddressing": true,
              "modv:mostSignificantByte": true,
              "modv:mostSignificantWord": true,
              "contentType": "application/octet-stream",
              "security": {
                "scheme": "nosec"
              },
              "op": "readproperty"
            }
          ]
        }
      }
    }
  ],
  [
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
    // expanded
    {
      "@context": "https://www.w3.org/ns/wot-next/td",
      "title": "expanded-valid-test-mqtt-override",
      "actions": {
        "act1": {
          "type": "string",
          "forms": [
            {
              "href": "mqtt://broker.com:1883/actions/act1",
              "mqv:qos": "0",
              "mqv:retain": true,
              "contentType": "application/json",
              "security": {
                "scheme": "nosec"
              },
              "op": "invokeaction"
            }
          ]
        },
        "act2": {
          "type": "string",
          "forms": [
            {
              "href": "mqtt://broker.com:1883/actions/act2",
              "mqv:qos": "0",
              "mqv:retain": true,
              "contentType": "application/json",
              "security": {
                "scheme": "nosec"
              },
              "op": "invokeaction"
            }
          ]
        },
        "act3": {
          "type": "string",
          "forms": [
            {
              "href": "mqtt://broker.com:1883/actions/act3",
              "mqv:qos": "2",
              "mqv:retain": false,
              "contentType": "application/json",
              "security": {
                "scheme": "nosec"
              },
              "op": "invokeaction"
            }
          ]
        }
      }
    }
  ],
  [
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
      "properties": {
        "prop1": {
          "type": "string",
          "forms": [
            {
              "form": "ipv4",
              "href": "props/prop1"
            },
            {
              "form": "ipv6",
              "href": "props/prop1"
            }
          ]
        },
        "prop2": {
          "type": "string",
          "forms": [
            {
              "form": "ipv4",
              "href": "props/prop2"
            },
            {
              "form": "ipv6",
              "href": "props/prop2"
            }
          ]
        }
      }
    },
    // expanded
    {
      "@context": "https://www.w3.org/ns/wot-next/td",
      "title": "expanded-valid-test-multi-ip",
      "properties": {
        "prop1": {
          "type": "string",
          "forms": [
            {
              "href": "https://192.168.1.10:8080/props/prop1",
              "contentType": "application/json",
              "security": {
                "scheme": "nosec"
              },
              "op": ["readproperty", "writeproperty"]
            },
            {
              "href": "https://[2001:db8:85a3::8a2e:370:7334]:8080/props/prop2",
              "contentType": "application/json",
              "security": {
                "scheme": "nosec"
              },
              "op": ["readproperty", "writeproperty"]
            }
          ]
        },
        "prop2": {
          "type": "string",
          "forms": [
            {
              "href": "https://192.168.1.10:8080/props/prop2",
              "contentType": "application/json",
              "security": {
                "scheme": "nosec"
              },
              "op": ["readproperty", "writeproperty"]
            },
            {
              "href": "https://[2001:db8:85a3::8a2e:370:7334]:8080/props/prop2",
              "contentType": "application/json",
              "security": {
                "scheme": "nosec"
              },
              "op": ["readproperty", "writeproperty"]
            }
          ]
        }
      }
    }
  ],
  [
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
      "properties": {
        "prop1": {
          "type": "string",
          "forms": [
            {
              "form": "local",
              "href": "props/prop1"
            },
            {
              "form": "public",
              "href": "props/prop1"
            }
          ]
        },
        "prop2": {
          "type": "string",
          "forms": [
            {
              "form": "local",
              "href": "props/prop2"
            },
            {
              "form": "public",
              "href": "props/prop2"
            }
          ]
        }
      }
    },
    // expanded
    {
      "@context": "https://www.w3.org/ns/wot-next/td",
      "title": "expanded-valid-test-diff-sec",
      "properties": {
        "prop1": {
          "type": "string",
          "forms": [
            {
              "href": "http://192.168.1.10:8080/props/prop1",
              "contentType": "application/json",
              "security": {
                "scheme": "nosec"
              },
              "op": ["readproperty", "writeproperty"]
            },
            {
              "href": "https://example.com:8080/props/prop1",
              "contentType": "application/json",
              "security": {
                "scheme": "basic"
              },
              "op": ["readproperty", "writeproperty"]
            }
          ]
        },
        "prop2": {
          "type": "string",
          "forms": [
            {
              "href": "http://192.168.1.10:8080/props/prop2",
              "contentType": "application/json",
              "security": {
                "scheme": "nosec"
              },
              "op": ["readproperty", "writeproperty"]
            },
            {
              "href": "https://example.com:8080/props/prop2",
              "contentType": "application/json",
              "security": {
                "scheme": "basic"
              },
              "op": ["readproperty", "writeproperty"]
            }
          ]
        }
      }
    }
  ],
  [
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
              "form": "http",
              "href": "props/prop1"
            },
            {
              "form": "coap",
              "href": "props/prop1"
            }
          ]
        },
        "prop2": {
          "type": "string",
          "forms": [
            {
              "form": "http",
              "href": "props/prop2"
            },
            {
              "form": "coap",
              "href": "props/prop2"
            }
          ]
        }
      }
    },
    // expanded
    {
      "@context": "https://www.w3.org/ns/wot-next/td",
      "title": "expanded-valid-test-multi-protocol",
      "properties": {
        "prop1": {
          "type": "string",
          "forms": [
            {
              "href": "https://192.168.1.10:8080/props/prop1",
              "contentType": "application/json",
              "security": {
                "scheme": "nosec"
              },
              "op": ["readproperty", "writeproperty"]
            },
            {
              "href": "coap://[2001:DB8::1]/mything/props/prop1",
              "contentType": "application/cbor",
              "security": {
                "scheme": "nosec"
              },
              "op": ["readproperty", "writeproperty"]
            }
          ]
        },
        "prop2": {
          "type": "string",
          "forms": [
            {
              "href": "https://192.168.1.10:8080/props/prop2",
              "contentType": "application/json",
              "security": {
                "scheme": "nosec"
              },
              "op": ["readproperty", "writeproperty"]
            },
            {
              "href": "coap://[2001:DB8::1]/mything/props/prop2",
              "contentType": "application/cbor",
              "security": {
                "scheme": "nosec"
              },
              "op": ["readproperty", "writeproperty"]
            }
          ]
        }
      }
    }
  ],
  [
    // 7. readproperty and writeproperty defaults that are not the defaults of the binding (GET and POST)
    // use case: device using REST but not following usual conventions
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
              "href": "props/prop3"
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
    // expanded
    {
      "@context": "https://www.w3.org/ns/wot-next/td",
      "title": "expanded-valid-test-nonstandard-rest",
      "properties": {
        "prop1": {
          "type": "string",
          "forms": [
            {
              "href": "https://192.168.1.10:8080/props/prop1",
              "op": "readproperty",
              "contentType": "application/json",
              "htv:methodName": "GET",
              "security": {
                "scheme": "nosec"
              }
            },
            {
              "href": "https://192.168.1.10:8080/props/prop1",
              "op": "writeproperty",
              "contentType": "application/json",
              "htv:methodName": "POST",
              "security": {
                "scheme": "nosec"
              }
            }
          ]
        },
        "prop2": {
          "type": "string",
          "forms": [
            {
              "href": "https://192.168.1.10:8080/props/prop2",
              "op": "readproperty",
              "contentType": "application/json",
              "htv:methodName": "GET",
              "security": {
                "scheme": "nosec"
              }
            },
            {
              "href": "https://192.168.1.10:8080/props/prop2",
              "op": "writeproperty",
              "contentType": "application/json",
              "htv:methodName": "POST",
              "security": {
                "scheme": "nosec"
              }
            }
          ]
        },
        // in the following, we don't use the definitions from above as the protocol defaults are enough.
        // it is not clear if this is a real use case, but it shows the possibility
        "propWithProtocolDefaults": {
          "type": "string",
          "forms": [
            {
              "op": "readproperty",
              "href": "https://192.168.1.10:8080/props/prop3",
              "security": {
                "scheme": "nosec"
              },
              "contentType": "application/json",
              "htv:methodName": "GET"
            },
            {
              "op": "writeproperty",
              "href": "https://192.168.1.10:8080/props/prop3",
              "security": {
                "scheme": "nosec"
              },
              "contentType": "application/json",
              "htv:methodName": "PUT"
            }
          ]
        },
        "propReadOnly": {
          "type": "string",
          "readOnly": true,
          "forms": [
            {
              "op": "readproperty",
              "href": "https://192.168.1.10:8080/props/propR",
              "security": {
                "scheme": "nosec"
              },
              "contentType": "application/json",
              "htv:methodName": "GET"
            }
          ]
        }
      }
    }
  ],
  [
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
              "href": "props/prop2"
            }
          ]
        }
      }
    },
    // expanded
    {
      "@context": "https://www.w3.org/ns/wot-next/td",
      "title": "expanded-valid-test-diff-sec-per-op",
      "properties": {
        "prop1": {
          "type": "string",
          "forms": [
            {
              "href": "https://192.168.1.10:8080/props/prop1",
              "op": "readproperty",
              "contentType": "application/json",
              "security": {
                "scheme": "nosec"
              }
            },
            {
              "href": "https://192.168.1.10:8080/props/prop1",
              "op": "readproperty",
              "contentType": "application/json",
              "security": {
                "scheme": "basic"
              }
            }
          ]
        },
        "prop2": {
          "type": "string",
          "forms": [
            {
              "href": "https://192.168.1.10:8080/props/prop2",
              "op": "readproperty",
              "contentType": "application/json",
              "security": {
                "scheme": "nosec"
              }
            },
            {
              "href": "https://192.168.1.10:8080/props/prop2",
              "op": "readproperty",
              "contentType": "application/json",
              "security": {
                "scheme": "basic"
              }
            }
          ]
        }
      }
    }
  ],
  [
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
      "properties": {
        "prop1": {
          "type": "string",
          "forms": [
            {
              "form": "json",
              "href": "props/prop1"
            },
            {
              "form": "cbor",
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
            },
            {
              "form": "cbor",
              "href": "props/prop2"
            }
          ]
        }
      }
    },
    // expanded
    {
      "@context": "https://www.w3.org/ns/wot-next/td",
      "title": "expanded-valid-test-multi-contenttype",
      "properties": {
        "prop1": {
          "type": "string",
          "forms": [
            {
              "href": "https://192.168.1.10:8080/props/prop1",
              "contentType": "application/json",
              "security": {
                "scheme": "nosec"
              },
              "op": ["readproperty", "writeproperty"]
            },
            {
              "href": "https://192.168.1.10:8080/props/prop1",
              "contentType": "application/cbor",
              "security": {
                "scheme": "nosec"
              },
              "op": ["readproperty", "writeproperty"]
            }
          ]
        },
        "prop2": {
          "type": "string",
          "forms": [
            {
              "href": "https://192.168.1.10:8080/props/prop2",
              "contentType": "application/json",
              "security": {
                "scheme": "nosec"
              },
              "op": ["readproperty", "writeproperty"]
            },
            {
              "href": "https://192.168.1.10:8080/props/prop2",
              "contentType": "application/cbor",
              "security": {
                "scheme": "nosec"
              },
              "op": ["readproperty", "writeproperty"]
            }
          ]
        }
      }
    }
  ],
  [
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
    // expanded
    {
      "@context": "https://www.w3.org/ns/wot-next/td",
      "title": "expanded-valid-test-multi-affordance-protocol",
      "properties": {
        "prop1": {
          "type": "string",
          "forms": [
            {
              "href": "https://192.168.1.10:8080/props/prop1",
              "contentType": "application/json",
              "security": {
                "scheme": "nosec"
              },
              "op": ["readproperty", "writeproperty"]
            }
          ]
        }
      },
      "actions": {
        "act1": {
          "input": { "type": "string" },
          "forms": [
            {
              "href": "https://192.168.1.10:8080/actions/act1",
              "contentType": "application/json",
              "security": {
                "scheme": "nosec"
              },
              "op": "invokeaction"
            }
          ]
        }
      },
      "events": {
        "evt1": {
          "data": { "type": "string" },
          "forms": [
            {
              "href": "mqtt://test.mosquitto.org:1883/events/evt1", //assuming we transition to topic relative hrefs in mqtt binding
              "contentType": "text/plain",
              "security": {
                "scheme": "nosec"
              },
              "op": "subscribeevent"
            }
          ]
        }
      }
    }
  ],
  [
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
      "properties": {
        "prop1": {
          "type": "string",
          "forms": [
            {
              "form": "http+json",
              "href": "props/prop1"
            },
            {
              "form": "http+cbor",
              "href": "props/prop1"
            },
            {
              "form": "coap+json",
              "href": "props/prop1"
            },
            {
              "form": "coap+cbor",
              "href": "props/prop1"
            }
          ]
        },
        "prop2": {
          "type": "string",
          "forms": [
            {
              "form": "http+json",
              "href": "props/prop2"
            },
            {
              "form": "http+cbor",
              "href": "props/prop2"
            },
            {
              "form": "coap+json",
              "href": "props/prop2"
            },
            {
              "form": "coap+cbor",
              "href": "props/prop2"
            }
          ]
        }
      }
    },
    // expanded
    {
      "@context": "https://www.w3.org/ns/wot-next/td",
      "title": "expanded-valid-test-multi-protocol-multi-contenttype",
      "properties": {
        "prop1": {
          "type": "string",
          "forms": [
            {
              "href": "http://192.168.1.10:8080/mything/props/prop1",
              "contentType": "application/json",
              "security": {
                "scheme": "nosec"
              },
              "op": ["readproperty", "writeproperty"]
            },
            {
              "href": "http://192.168.1.10:8080/mything/props/prop1",
              "contentType": "application/cbor",
              "security": {
                "scheme": "nosec"
              },
              "op": ["readproperty", "writeproperty"]
            },
            {
              "href": "coap://[2001:DB8::1]/mything/props/prop1",
              "contentType": "application/json",
              "security": {
                "scheme": "nosec"
              },
              "op": ["readproperty", "writeproperty"]
            },
            {
              "href": "coap://[2001:DB8::1]/mything/props/prop1",
              "contentType": "application/cbor",
              "security": {
                "scheme": "nosec"
              },
              "op": ["readproperty", "writeproperty"]
            }
          ]
        },
        "prop2": {
          "type": "string",
          "forms": [
            {
              "href": "http://192.168.1.10:8080/mything/props/prop2",
              "contentType": "application/json",
              "security": {
                "scheme": "nosec"
              },
              "op": ["readproperty", "writeproperty"]
            },
            {
              "href": "http://192.168.1.10:8080/mything/props/prop2",
              "contentType": "application/cbor",
              "security": {
                "scheme": "nosec"
              },
              "op": ["readproperty", "writeproperty"]
            },
            {
              "href": "coap://[2001:DB8::1]/mything/props/prop2",
              "contentType": "application/json",
              "security": {
                "scheme": "nosec"
              },
              "op": ["readproperty", "writeproperty"]
            },
            {
              "href": "coap://[2001:DB8::1]/mything/props/prop2",
              "contentType": "application/cbor",
              "security": {
                "scheme": "nosec"
              },
              "op": ["readproperty", "writeproperty"]
            }
          ]
        }
      }
    }
  ]
];

module.exports = {
  validTDs,
  invalidCompactTDs,
  invalidExpandedTDs
};
