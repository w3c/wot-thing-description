# Toolchain Requirements

Before working on the restructuring of the toolchain to make it simpler, we can write the requirements of the toolchain 
by listing what kind of inputs we want to work on and what kind of outputs we want to provide to the users (reader, implementer, spec writers).

## Output Resources

Always synced:
- Editor's Draft index.html -> Should be provided with each PR. Used for PR Preview.
  - Users: Read by spec writes and early adopters of features.
- UML Class Diagrams -> Integrated into index.html. 
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

- Single source of truth in form of one file (can be split into multiple for maintainability)

Done once:

- Any kind of template

## Overall Requirements

Someone without expertise in our tooling should be able to make contributions.
