
# W3C Web of Things Specification Generation Process

The W3C WoT specification generation process toolchain is depicted as a Business Process Modeling Notation diagram. There are 4 actors involved:
1. ***Semantic Web Expert***
2. ***WoT Toolchain***
3. ***SPARQL Template Transformation Language Engine***
4. ***Parser Creation***

The Semantic Web Expert has the main responsibility to iteratively define the schema of different TD model specifications such as TD core, TM, WoTsec, HCTL or any extensions required. Also, the JSON Schema definition is defined for syntacticAL validation of JSON-LD data and Shapes Constraint Language (SHACL) shapes for Validating RDF graph. These different tasks are performed in an adhoc manner until agreement is achieved among the experts. In addition, the experts define a set of templates for the specification generation according to the SPARQL Template Transformation Language (STTL).

The WoT Toolchain is a shell script (render.sh), which manages the interaction between different Node.js scripts developed to achieve different objectives. It receives the different JSON-LD context files for each vocabulary in the TD model and aggregates them into one. The resulting JSON-LD context is then converted into RDF Turtle representation format. 

Next, the TD model ontologies (td core, wotsec, hctl and jsonschema), SHACL shapes (validation/td-validation.ttl), merged context (context/td-context.ttl), templates and a starting node pointing to the WoT Things Description HTML elements are provided as a set of command-line arguments, each serving a different purpose. The TD model ontologies and SHACL shapes are loaded and stored in an RDF store for semantic processing and query.
Then, the STTL templates are parsed according to a developed parser.