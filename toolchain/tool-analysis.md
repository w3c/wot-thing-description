# W3C WoT Toolchain Analysis

The current W3C WoT specification generation tool relies on various WoT artifacts such as JSON Schema, ontologies, SHACL shapes, which are produced by the different task forces. However, when there is an extension to the Thing description information model, these artifacts must also be updated according to their respective schemas. This process often requires significant manual effort and can result in inconsistencies between the different artifacts.

Therefore, the aim is to identify a set of potential tools that can simplify the generation of the WoT artifacts. An analysis of existing tools has been conducted based on different requirements, which are determined by the modeling features crucial for the TD information model.
The table below provides a summary of the analyzed tools according to the defined requirements.

| Requirement \| Tool     | LinkML | TreeLDR | ESMF | A.ML  | Schema Salad | SOML | WIDOCO |
| ----------------------- | ------ | ------- | ---- | ----- | ------------ | ---- | ------ |
| Language                | Python | Rust    | Java | Scala | Python       | NG   | Java   |
| Object/Dict Support     | O      |         |      |       |              |      |        |
| Condition Check         |        |         |      |       |              |      |        |
| Array Support           | O      | O       | O    | O     | O            | O    | X      |
| One of                  | O      | O       | X    | O     | O            | X    | X      |
| Type/Type[]             | X      | X       | X    | X     | X            | X    | X      |
| Inheritance             | O      | O       | O    | O     | O            | O    | X      |
| Unknown object keys     | O      | X       | X    | O     | X            | X    | X      |
| Pattern Matching        | O      | O       | O    | O     | X            | O    | X      |
| JSON Schema Generation  | O      | O       | O    | X     | X            | X    | X      |
| SHACL Shapes Generation | O      | X       | X    | X     | X            | X    | X      |
| Term Documentation      | O      | X       | X    | X     | O            | X    | O      |
| Diagram Generation      | O      | X       | O    | X     | O            | X    | O      |
| Prog. Lang. Gen.        | O      |         |      |       |              |      |        |
| Extensibility           | O      |         |      |       |              |      |        |

Explanations:

- Object/Dict Support: Modelling a JSON Object structure. E.g. TD having properties, actions, events keys, or a single form element
- Condition Check: Asserting conditions on values based on other values. E.g. security values should be in securityDefinitions first, titles and descriptions having the same language
- Array Support: Modelling a JSON Array structure. E.g. links and forms array
- One of: Enum and similar structs where values are restricted. E.g. security schemes, op values
- Type/Type[]: A value that can be a type or a type of that array. E.g. `@type`, security, op. This should be possible via `One of` modeling and we should check.
- Inheritance: A class inheriting another one and thus copying all its properties. E.g. property affordance inheriting data schema
- Unknown object keys: An object whose property keys are not defined by the model. E.g. all affordance names, securityDefinition keys.
- Pattern Matching: A string value with a regex pattern. E.g. `tm:optional` being restricted to affordance names only.
- JSON Schema Generation: Generation of JSON Schemas to validate TD and TM instances.
- SHACL Shapes Generation: SHACL Shapes to validate TDs which are serialized into RDF Graphs.
- Term Documentation: Human-readable text to help understanding of terms
- Diagram Generation: UML Class diagrams to help illustrate the information model
- Prog. Lang. Gen.: Generation of assets for various programming languages such as types in TypeScript.
- Extensibility: Extending the tool to offer other output formats in the future.
