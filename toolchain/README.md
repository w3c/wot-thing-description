
# W3C Web of Things Specification Generation Process

The W3C WoT specification generation process toolchain is depicted as a Business Process Modeling Notation diagram. There are 4 actors involved:
1. ***Semantic Web Expert***
2. ***WoT Toolchain***
3. ***SPARQL Template Transformation Language***
4. ***Parser Creation***

The Semantic Web Expert has the main responsibility to iteratively define the schema of different vocabularies such as TD, TM, WoTsec, HCTL and any extensions required, as well as the JSON Schema definition and SHACL shapes for validation. These different tasks are performed in an adhoc manner until agreement is achieved among the experts. In addition, they define a set of templates for the specification according to the SPARQL Template Transformation Language (STTL).

The WoT Toolchain is a shell script (render.sh), which manages the interaction between different Node.js scripts. It receives the different JSON-LD context files for each schema, aggregates them into one and converts them into Turtle representation format. 