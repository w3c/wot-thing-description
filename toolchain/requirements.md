# Toolchain Requirements

Before working on the restructuring of the toolchain to make it simpler, we can write the requirements of the toolchain 
by listing what kind of inputs we want to work on and what kind of outputs we want to provide to the users (reader, implementer, spec writers).

**Overall Goal:** Change a small number of files (source of truth) but generate as many resources as needed by users.

**Compromise:** Reduce the amount of cross-checking between files by a human expert. In this case, everything is not automatically generated.

## General Requirements for Toolchain

1. Someone without expertise in our tooling should be able to make contributions. This is especially relevant for binding contributions from experts of the protocol who are not experts of the semantic web or the type of tooling we have. Thus, the learning curve should not be steep at all.
    1. Relying on well-known tools would make it easier. Templating engines like [Handlebars](https://handlebarsjs.com/) are well-known. STTL is not well-known and doesn't support all the features we need.
    2. More documentation about the entire repository configuration and tooling (Actions, hooks, npm scripts to run at some point etc.)
2. It should be easy to debug/observe the process.
3. If multiple tools are "chained together", we should ensure that the inputs and outputs match. An example would be if the generated JSON Schema is badly structured, it would result in cryptic TS definitions.
4. Not mixing up multiple languages in one resource file (currently, we have HTML snippets in SHACL shapes).
5. (Optional) The tooling should be easy to install and understand the inner workings.

## Output Resources

Output resources are given to the users of the specification for various usages.

The following resources are updated each time the "source of truth" in the input resources is updated:

- Editor's Draft index.html -> Should be provided with each PR. Used for PR Preview.
  - Users: Read by spec writes and early adopters of features.
- UML Class Diagrams -> Integrated into index.html
- Ontologies: HTML and TTL format
- JSON-LD Context
- JSON Schemas: For TD and TM
- SHACL Shapes
- Abstraction or Interfaces for Programming Languages: 
  - TypeScript definitions: Currently done via Scripting API TF
  - We need to clarify it for other languages
- Test cases: Each feature has its test case(s). Currently in Eclipse Thingweb but will be moved here

The following resources are updated less frequently, generally in publication phases:

- Publication index.html (Overview.html) -> Done with each publication
  - Users: Adopters of the standard
- UML Class Diagrams: Beautified versions of the "always synced" diagrams
  - Users: Adopters of the standard (to give an overview)

## Input Resources

Input resources, referred to as source of truth, are what the TD Task Force writes and maintains to generate the output resources for the users.

The following resources are updated for each change:

- Single source of truth in the form of one file (can be split into multiple for maintainability)

The following resources are written mostly at the beginning of work:

- Any template file

To clarify:

- File type and structure of each resource.
