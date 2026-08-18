# Usage of readOnly and writeOnly

The table below presents different locations where `readOnly` and `writeOnly` can be used. The scope is derived from the location. Please make sure to read [[[#sec-op-data-schema-mapping]]] as well.

> **Note:** While other terms also influence interaction semantics such as `idempotent` in Action, those are excluded from this section for the time being.

## Location, Scope and Implications of readOnly and writeOnly — When one is true, the other is assumed to be false or not present

| Location                                                                    | Recommended Usage?                                                                                          | Scope                                                                     | Implication of readOnly=true                                                                                               | Implication of writeOnly=true                                                                             |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| 1. Root of a Property Affordance                                            | Yes                                                                                                         | All messages between the Thing and Consumer                               | There should be only readproperty operations in the forms                                                                  | Not recommended usage. There should be only writeproperty operations in the forms                         |
| 2. Within a key of an Object in a Property Affordance                       | Yes                                                                                                         | Presence of the key and its value in a message                            | Different payload for readproperty response and writeproperty request                                                      | Different payload for readproperty response and writeproperty request                                     |
| 3. Root of an Action Affordance                                             | No                                                                                                          | Not applicable                                                            | Not applicable                                                                                                             | Not applicable                                                                                            |
| 4. Root Input Schema of an Action Affordance                                | No?                                                                                                         | All messages between the Thing and Consumer to invoke an action           | Not recommended? Action does not require a payload for invokeaction but a response will be provided that is not the output | Already implied that an input is a writeOnly operation                                                    |
| 5. Root Output Schema of an Action Affordance                               | No?                                                                                                         | All messages between the Thing and Consumer after the an invoke an action | Already implied that an output is a readOnly operation                                                                     | Not recommended? Action does not require a request (with or without payload) to get invokeaction response |
| 6. Within a key of an Object in the input or output of an Action Affordance | No. Turn to separate input and output instead.                                                              | Not applicable                                                            | Not applicable                                                                                                             | Not applicable                                                                                            |
| 7. Root of an Event Affordance                                              | No                                                                                                          | Not applicable                                                            | Not applicable                                                                                                             | Not applicable                                                                                            |
| 8. Root of Subscription in an Event Affordance                              | Yes                                                                                                         | All messages between the Thing and Consumer to establish a subscription   | Only a response is returned                                                                                                | Only a request is needed to establish subscription, no payload returned                                   |
| 9. Root of Data in an Event Affordance                                      | No                                                                                                          | Not applicable                                                            | Not applicable                                                                                                             | Not applicable                                                                                            |
| 10. Within a key of an Object in Data in an Event Affordance                | No. A data is always asynchronously emitted to the Consumer. Thus, readOnly or writeOnly should not be used | Not applicable                                                            | Not applicable                                                                                                             | Not applicable                                                                                            |
| 11. Root of Cancellation in an Event Affordance                             | Yes                                                                                                         | All messages between the Thing and Consumer to cancel a subscription      | Only a response is returned                                                                                                | Only a request payload is needed to cancel subscription, no payload returned                              |
| 12. Within a key of an Object in the subscription of an Event Affordance    | Yes                                                                                                         | Presence of the key and its value in a subscription-related message       | Different payloads for the subscription request and its response                                                           | Different payloads for the subscription request and its response                                          |
| 13. Within a key of an Object in the cancellation of an Event Affordance    | Yes                                                                                                         | Presence of the key and its value in a cancellation-related message       | Different payloads for the cancellation request and its response                                                           | Different payloads for the cancellation request and its response                                          |

**Example of readOnly and writeOnly usages**

```json
{
  "properties": {
    "prop1a": {
      "description": "For row 1 readonly true",
      "type": "string",
      "readOnly": true
    },
    "prop1b": {
      "description": "For row 1 writeonly true",
      "type": "string",
      "writeOnly": true
    },
    "prop2": {
      "description": "For row 2",
      "type": "object",
      "properties": {
        "key1": {
          "type": "number",
          "readOnly": true
        },
        "key2": {
          "type": "string",
          "writeOnly": true
        }
      }
    }
  },
  "actions": {
    "act1": {
      "description": "For row 3",
      "readOnly": true
    },
    "act2a": {
      "description": "For row 4, input readOnly true",
      "input": {
        "type": "string",
        "readOnly": true
      }
    },
    "act2b": {
      "description": "For row 4, input writeOnly true",
      "input": {
        "type": "string",
        "writeOnly": true
      }
    },
    "act3a": {
      "description": "For row 5, output readOnly true",
      "output": {
        "type": "string",
        "readOnly": true
      }
    },
    "act3b": {
      "description": "For row 5, output writeOnly true",
      "output": {
        "type": "string",
        "writeOnly": true
      }
    },
    "act3a_row6": {
      "description": "For row 6, input output objects",
      "input": {
        "type": "object",
        "properties": {
          "key1": {
            "description": "this should move to output",
            "type": "number",
            "readOnly": true
          },
          "key2": {
            "description": "this is implied",
            "type": "string",
            "writeOnly": true
          }
        }
      },
      "output": {
        "type": "object",
        "properties": {
          "key1": {
            "description": "this is implied",
            "type": "number",
            "readOnly": true
          },
          "key2": {
            "description": "this should move to input",
            "type": "string",
            "writeOnly": true
          }
        }
      }
    }
  },
  "events": {
    "ev1": {
      "description": "For row 7",
      "readOnly": true
    },
    "ev2a": {
      "description": "For row 8, readonly true in subscription",
      "subscription": {
        "type": "string",
        "readOnly": true
      }
    },
    "ev2b": {
      "description": "For row 8, writeonly true in subscription",
      "subscription": {
        "type": "string",
        "writeOnly": true
      }
    },
    "ev3": {
      "description": "For row 9, readonly true in data (same for writeOnly)",
      "data": {
        "type": "string",
        "readOnly": true
      }
    },
    "ev4": {
      "description": "For row 10, readonly and writeOnlytrue in object in data",
      "data": {
        "type": "object",
        "properties": {
          "key1": {
            "type": "number",
            "readOnly": true
          },
          "key2": {
            "type": "string",
            "writeOnly": true
          }
        }
      }
    },
    "ev5a": {
      "description": "For row 11, readonly true in cancellation",
      "cancellation": {
        "type": "string",
        "readOnly": true
      }
    },
    "ev5b": {
      "description": "For row 11, writeonly true in cancellation",
      "cancellation": {
        "type": "string",
        "writeOnly": true
      }
    },
    "ev6": {
      "description": "For row 12, readonly and writeOnlytrue in object in subscription",
      "subscription": {
        "type": "object",
        "properties": {
          "key1": {
            "type": "number",
            "readOnly": true
          },
          "key2": {
            "type": "string",
            "writeOnly": true
          }
        }
      }
    },
    "ev7": {
      "description": "For row 13, readonly and writeOnlytrue in object in cancellation",
      "cancellation": {
        "type": "object",
        "properties": {
          "key1": {
            "type": "number",
            "readOnly": true
          },
          "key2": {
            "type": "string",
            "writeOnly": true
          }
        }
      }
    }
  }
}
```
