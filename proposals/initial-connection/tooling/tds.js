// TDs are provided as js so that we can put comments
// However, please do not remove JSON serialization so that they can be copy pasted easily

const validTDs = [
  // Inline (no definitions objects)
  // Separate Defaults
  {
    "title": "valid-test0",
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
  // All Defaults in a Form but still with connection
  {
    "title": "valid-test1",
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
  // All defaults in a form and flattened without connection
  {
    "title": "valid-test2",
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
  // All definitions are present and referenced in the root
  {
    "title": "valid-test3",
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
  // only defined and used within the forms
  {
    "title": "valid-test4",
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
  // Definitions in the root but usage only in forms
  {
    "title": "valid-test5",
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
    "title": "valid-test6",
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
  // one writeproperty requiring basic auth
  {
    "title": "valid-test7",
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

const invalidTDs = [
  // Inline (no definitions objects)
  // Missing Connection
  // TODO: This cannot be invalid since there is no way to say that connection is required if it is not inlined in the form
  {
    "title": "invalid-test0",
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
  // a flattened form but it still has connection
  {
    "title": "invalid-test1",
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

module.exports = {
  validTDs,
  invalidTDs
};
