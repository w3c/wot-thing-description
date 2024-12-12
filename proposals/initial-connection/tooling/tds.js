// TDs are provided as js so that we can put comments
// However, please do not remove JSON serialization so that they can be copy pasted easily

const validTDs = [
  // Inline (no definitions objects)
  // Separate Defaults
  {
    "title": "test1",
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
    "title": "test2",
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
    "title": "test3",
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

// TODO: Invalid TDs are not detected yet
const invalidTDs = [
  // Inline (no definitions objects)
  // Missing Connection
  {
    "title": "test1",
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
  }
];

module.exports = {
  validTDs,
  invalidTDs
};
