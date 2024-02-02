W3C WoT Toolchain Analysis

The current W3C WoT specification generation tool requires as input different WoT artifacts (e.g., JSON Schema, ontologies, SHACL shapes, etc.,) that are produced by the different task forces. However, once there is an extension to the Thing description information model, these artifacts also need to be updated based on their own schema. However, in most cases this causes alot of manual effort and sometimes inconsistencies between the different artifacts.
Therefore, the aim is to identify a set of potential tools that can simplify the generation of the WoT artifacts.

A set of existing tools have been analyzed based on different requirements. The requirements are identified based on the modeling features important for the TD information model and include: array support, one of, Type/Type array, Inheritance, Unknown object keys, pattern matching, JSON Schema conversion, JSON-LD Context file generation, SHACL shapes generation, term documentation, and diagram generation. 

| Tool                    | LinkML | TreeLDR | ESMF | A.ML | Schema Salad | SOML | WIDOCO |
|-------------------------|--------|---------|------|------|--------------|------|--------|
| Language                |        |         |      |      |              |      |        |
| Array Support           |        |         |      |      |              |      |        |
| One of                  |        |         |      |      |              |      |        |
| Type/Type[]             |        |         |      |      |              |      |        |
| Inheritance             |        |         |      |      |              |      |        |
| Unknown object keys     |        |         |      |      |              |      |        |
| Pattern Matching        |        |         |      |      |              |      |        |
| JSON Schema Generation  |        |         |      |      |              |      |        |
| SHACL Shapes Generation |        |         |      |      |              |      |        |
| Term Documentation      |        |         |      |      |              |      |        |
| Diagram Generation      |        |         |      |      |              |      |        |