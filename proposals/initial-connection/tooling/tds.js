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
  }
];

const invalidTDs = [
  // Inline (no definitions objects)
  // Missing Connection
  {
    "title": "invalid-test0",
    "form": {
      "contentType": 123 // FIXME: Put correct string value here
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
