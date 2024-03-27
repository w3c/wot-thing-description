# W3C WoT Toolchain Analysis

The current W3C WoT specification generation tool relies on various artifacts such as a JSON Schema, ontologies, SHACL shapes, which can be produced by separately. However, when there is an extension to the Thing Description information model, these artifacts must also be updated according to their respective schemas. This process often requires significant manual effort and can result in inconsistencies between the different artifacts. 

Therefore, the aim is to identify a set of potential tools that can simplify the generation of the WoT artifacts. An analysis of existing tools has been conducted based on different requirements, which are determined by the modeling features crucial for the TD information model.
The table below provides a summary of the analyzed tools according to the defined requirements.


| Requirement  \| Tool    | LinkML   | TreeLDR  | ESMF     | A.ML     | Schema Salad | SOML     | WIDOCO   |
|-------------------------|----------|----------|----------|----------|--------------|----------|----------|
| Language                | Python   | Rust     | Java     | Scala    | Python       | NG       | Java     |
| Object/Dict Support     | | |  |  |  |  |  |
| Array Support           | &#x2611; | &#x2611; | &#x2611; | &#x2611; | &#x2611;     | &#x2611; | &#x2612; |
| One of                  | &#x2611; | &#x2611; | &#x2612; | &#x2611; | &#x2611;     | &#x2612; | &#x2612; |
| Type/Type[]             | &#x2612; | &#x2612; | &#x2612; | &#x2612; | &#x2612;     | &#x2612; | &#x2612; |
| Inheritance             | &#x2611; | &#x2611; | &#x2611; | &#x2611; | &#x2611;     | &#x2611; | &#x2612; |
| Unknown object keys     | &#x2611; | &#x2612; | &#x2612; | &#x2611; | &#x2612;     | &#x2612; | &#x2612; |
| Pattern Matching        | &#x2611; | &#x2611; | &#x2611; | &#x2611; | &#x2612;     | &#x2611; | &#x2612; |
| JSON Schema Generation  | &#x2611; | &#x2611; | &#x2611; | &#x2612; | &#x2612;     | &#x2612; | &#x2612; |
| SHACL Shapes Generation | &#x2611; | &#x2612; | &#x2612; | &#x2612; | &#x2612;     | &#x2612; | &#x2612; |
| Term Documentation      | &#x2611; | &#x2612; | &#x2612; | &#x2612; | &#x2611;     | &#x2612; | &#x2611; |
| Diagram Generation      | &#x2611; | &#x2612; | &#x2611; | &#x2612; | &#x2611;     | &#x2612; | &#x2611; |
