# Toolchain Requirements

Before working on the restructuring of the toolchain to make it simpler, we can write the requirements of the toolchain 
by listing what kind of inputs we want to work on and what kind of outputs we want to provide to the users (reader, implementer, spec writers).

**Overall Goal:** Change a small number of files (source of truth) but generate as many resources as needed by users.

**Compromise:** Reduce the amount of cross-checking between files by a human expert. In this case, everything is not automatically generated.

## Output Resources

Always synced:

- Editor's Draft index.html -> Should be provided with each PR. Used for PR Preview.
  - Users: Read by spec writes and early adopters of features.
- UML Class Diagrams -> Integrated into index.html
- Ontologies: HTML and TTL format
- JSON-LD Context
- JSON Schemas: For TD and TM
- SHACL Shapes
- TypeScript definitions (possibly other languages): Currently done via Scripting API TF
- Test cases: Each feature has its own test cases. Currently in Eclipse Thingweb but will be moved here

Done once:

- Publication index.html (Overview.html) -> Done with each publication
  - Users: Adopters of the standard
- UML Class Diagrams: Beautified versions of the "always synced" diagrams
  - Users: Adopters of the standard (to give an overview)

## Input Resources

Always updated:

- Single source of truth in the form of one file (can be split into multiple for maintainability)

Done once:

- Any template

To clarify:

- File type and structure of each resource.

## Overall Requirements

1. Someone without expertise in our tooling should be able to make contributions. This is especially relevant for binding contributions from experts of the protocol who are not expert of semantic web or the type of tooling we have. Thus, the learning curve should be not steep at all.
  1. Relying on well-known tools would make it easier. Templating engines like [Handlebars](https://handlebarsjs.com/) are well-known. STTL is not well-known and doesn't support all the features we need.
  2. More documentation about the entire repository configuration and tooling (Actions, hooks, npm scripts to run at some point etc.)
3. It should be easy to debug/observe the process.
4. Smaller but chained tools would be nicer to have more control and less dependency. This needs the inputs and outputs matching. An example would be if the generated JSON Schema is badly structured, it would result in cryptic TS definitions.
5. Not mixing up multiple languages in one resource file (currently, we have HTML snippets in SHACL shapes).
