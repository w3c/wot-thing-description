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
            "href": "/props/prop1"
          }
        ]
      },
      "prop2": {
        "type": "string",
        "forms": [
          {
            "href": "/props/prop2"
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
            "href": "/props/prop1"
          }
        ]
      },
      "prop2": {
        "type": "string",
        "forms": [
          {
            "href": "/props/prop2"
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
            "href": "/props/prop1"
          }
        ]
      },
      "prop2": {
        "type": "string",
        "forms": [
          {
            "href": "/props/prop2"
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
    "connection": "conn1",
    "form": "form1",
    "security": "sec1",
    "properties": {
      "prop1": {
        "type": "string",
        "forms": [
          {
            "href": "/props/prop1"
          }
        ]
      },
      "prop2": {
        "type": "string",
        "forms": [
          {
            "href": "/props/prop2"
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
            "connection": "conn1",
            "form": "form1",
            "security": "sec1",
            "href": "/props/prop1"
          }
        ]
      },
      "prop2": {
        "type": "string",
        "forms": [
          {
            "connection": "conn1",
            "form": "form1",
            "security": "sec1",
            "href": "/props/prop2"
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
            "form": "form1",
            "href": "/props/prop1"
          }
        ]
      },
      "prop2": {
        "type": "string",
        "forms": [
          {
            "form": "form1",
            "href": "/props/prop2"
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
            "href": "https://example.com/props/prop1",
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
            "href": "https://example.com/props/prop2",
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
    "connection": "conn1",
    "form": "form1",
    "security": "sec1",
    "properties": {
      "prop1": {
        "type": "string",
        "forms": [
          {
            "href": "/props/prop1",
            "op": "readproperty"
          },
          {
            "href": "/props/prop1",
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
            "href": "/props/prop2"
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
            "href": "/props/prop1"
          }
        ]
      },
      "prop2": {
        "type": "string",
        "forms": [
          {
            "href": "/props/prop2"
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
            "href": "/props/prop1"
          }
        ]
      },
      "prop2": {
        "type": "string",
        "forms": [
          {
            "href": "/props/prop2"
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
            "href": "https://example.com/props/prop1",
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
            "href": "https://example.com/props/prop1",
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
const recommendedTDs = [
  // 1. Multi IP addresses (IPv4 and IPv6)
  // notes:
  // there is no default connection/ip format.
  // both use the same security and content type
  // there is no advantage of the new mechanism much other than reducing TD lenght. The forms have the same amount of terms in the end.
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
        "base": "https://2001:db8:85a3::8a2e:370:7334:8080"
      }
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
            "connection": "ipv4",
            "href": "/props/prop1"
          },
          {
            "connection": "ipv6",
            "href": "/props/prop1"
          }
        ]
      },
      "prop2": {
        "type": "string",
        "forms": [
          {
            "connection": "ipv4",
            "href": "/props/prop2"
          },
          {
            "connection": "ipv6",
            "href": "/props/prop2"
          }
        ]
      }
    }
  },
  // local with no sec and public with basic auth
  {
    "@context": "https://www.w3.org/ns/wot-next/td",
    "title": "recommended-test-diff-sec",
    "connectionDefinitions": {
      "local": {
        "base": "https://192.168.1.10:8080",
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
    "form": {
      "contentType": "application/json"
    },
    "properties": {
      "prop1": {
        "type": "string",
        "forms": [
          {
            "connection": "local",
            "href": "/props/prop1"
          },
          {
            "connection": "public",
            "href": "/props/prop1"
          }
        ]
      },
      "prop2": {
        "type": "string",
        "forms": [
          {
            "connection": "local",
            "href": "/props/prop2"
          },
          {
            "connection": "public",
            "href": "/props/prop2"
          }
        ]
      }
    }
  }
  // multi protocols (http and coap)
  // readproperty and writeproperty defaults (GET and POST)
  // read and write requring different security for all operations
  // modbus with all parameters in connection (one property not same endianness)
  // mqtt with qos 0 for all topics except some
  // default content type not being json
  // multiple content types
];
module.exports = {
  validCompactTDs,
  invalidCompactTDs,
  validExpandedTDs,
  invalidExpandedTDs,
  recommendedTDs
};
