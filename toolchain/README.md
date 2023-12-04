
# W3C Web of Things Specification Generation Process

The W3C WoT specification generation process toolchain is depicted as a Business Process Modeling Notation diagram. There are 4 actors involved:
1. ***Semantic Web Expert***
2. ***WoT Toolchain***
3. ***SPARQL Template Transformation Language Engine***
4. ***Parser Creation***

The Semantic Web Expert has the main responsibility to iteratively define the schema of different TD model specifications such as TD core, TM, WoTsec, HCTL or any extensions required. Also, the JSON Schema definition is defined for syntacticAL validation of JSON-LD data and Shapes Constraint Language (SHACL) shapes for Validating RDF graph. These different tasks are performed in an adhoc manner until agreement is achieved among the experts. In addition, the experts define a set of templates for the specification generation according to the SPARQL Template Transformation Language (STTL). The templates expressed in STTL describe different rules for transforming a source RDF graph into a result text.

The WoT Toolchain is a shell script (render.sh), which manages the interaction between different Node.js scripts developed to achieve different objectives. It receives the different JSON-LD context files for each vocabulary in the TD model and aggregates them into one. The resulting JSON-LD context is then converted into RDF Turtle representation format. 

The STTL engine takes different RDF graphs: TD model ontologies (), SHACL shapes (validation/td-validation.ttl), merged context (context/td-context.ttl), a transformation (a set of templates), and a starting HTML node pointing to the WoT Things Descriptions as a set of command-line arguments and generates HTML textual output format. The TD model ontologies and SHACL shapes are loaded and stored in an RDF store for semantic processing and querying.
Then, the STTL templates are parsed according to the parser developed by the Parser Creation actor. This is followed by matching the input HTML node with one of the transformation names specified in the template. Each STTL template has a apply template section, which 

The Parser Creation process is mainly performed by a developer using a 2-step process. The grammar is developed manually using to context-free grammar according to the semantics of STTL language.
Then, Jison tool takes the grammar as input and outputs a JavaScript file capable of parsing the language described by that grammar. The generated script is then used to parse visualization template inputs.