# Versioning of TD Specification Resources

In addition to the specifications, there are other resources that are managed in this repository.
This file documents the discussion on how the versioning should be.
Once there is an agreement, the rules will be moved to [wot-resources](https://github.com/w3c/wot-resources) repository with a corresponding policy.

## Versioning for 1.0 and 1.1 Specifications

- With each REC, we publish the following files:
  - Ontology files in form of TTL and HTML. These are TD, Security, hypermedia controls, JSON Schema, and soon the TM
  - JSON-LD Context file
  - JSON Schemas for TD and TM
- DECISION: We do not publish different versions of these files until we see the need (e.g. a bug that also has breaking changes to current implementations).

## Versioning for next Release

Requirements:

- Support all users of WoT resources (schemas, ontologies, type definitions, etc.), which can be of different versions. Users can be split into two:
  - Early adopters (implementers before REC publication), which include specification developers, editors etc.
    - provide concrete guidelines and rules on how implementations should be made in the editor's draft
    - support quick changes while maintaining the versioning rules
  - REC publication users
    - provide concrete guidelines and rules on how implementations should be made in the REC
    - W3.org URLs can be used and we can do manual work

### Big Picture Versioning Timeline

Do we version anything until a REC release, i.e. for TD.next, do we want to publish resources with each publication (WD, CR, PR etc, even each PR merged) or not?
  - ( @relu91 ) An unofficial version increment for WG members (not for outside): E.g. an alpha prefix and then a number. Beta etc. can be used when going into CR. Or we just tag/prefix/suffix with CR, PR or nightly
  - ( @egekorkan ) The versioning rules do not apply to different versions of a specification, e.g. TD 1.1 schema should be treated like a new release, not a next iteration of the 1.0 schema
  - @mmccool : We need specific snapshots for testing and plugfest purposes where we ask implementors to use a certain (pre-release) version of the resources. Better to name these versions with a word that reflects this (e.g. plugfest september 2025 version)

---

**Decision Making Discussion:**

- McCool : I agree with versioning until development but with another namespace (e.g. unstable, development etc.) (+1 from Luca for the idea)
- Luca: Semver can support "unstable" tags. Developers know that. McCool: the generic unstable iri should return the latest unstable though. Stable iri should return the stable version. Luca: the part after version number is up to us, we can use year-month-date for example.

- Preliminary Decision: Do versioning until REC release

### Meaning of Changes

Which changes are bugfixes, which are new features etc. For each type of artifact, we need to agree on the meaning. Then, these meanings can be reflected on the version information.

File types in question:
  - JSON Schemas
    - Original Input:
      - Patch: English typos etc. Minor: Relaxing a constraint (longer strings, more oneof) so that more TDs can pass the schema. Major: Adding or restricting constraints
    - Learning from JSON Schema Discussion (also see <https://github.com/json-schema-org/website/issues/197#issuecomment-1883270213>):
      - Patch: English typos etc.
      - Minor: Relaxing a constraint (longer strings, more oneof) so that more TDs can pass the schema.
      - Major: Adding or restricting constraints
      - Also see: https://gitlab.openretailing.org/public-standards/api-design-guidelines/-/blob/main/Open%20Retailing%20API%20Design%20Rules%20for%20JSON.pdf
  - JSON-LD Context
  - Ontology files
    - TTL
    - HTML
  - TypeScript types
  - UML Diagrams

Notes: 
- @mahdanoura : Also, the deprecation of terms needs to be considered, i.e. not removing but marking as deprecated.
- Best practices for RDF versioning should be studied. See https://www.w3.org/TR/prov-primer/

#### Reflecting Meaning on Version Information

How do we reflect a patch change on the artifacts? Do we use semantic versioning, use date, and ignore semantic versioning, do we use alpha, beta etc.

- ( @lu-zero ) A date afterward would be good "enough" for implementers. A release every month (in addition to semver) would also be good. We can also pipeline it and tag each resource exposed to github.io. 
- ( @mjkoster ) Short commit hash would be fine. Monthly release may not make sense (unless there is a need)
- ( @mmccool ) To make things easy we should map our directories to the url structure. We should make all URLs are versioned
- @mahdanoura : According to OWL2 specification, for every ontology we can define an Ontology IRI (generic reference, should stay the same through versions) and a Ontology Version IRI. The difference is during dereferencing of the IRIs, the ontology IRI should redirect to the most recent version and the version IRI to the specific version.

#### Synchronisation of Changes

Relevant to the points above, we need to decide whether we version each artifact separately or together.

Notes:

- We need to be careful since if each artifact has its own version, the CD pipeline will get complicated.
- @egekorkan : Matching the versions of files would mean that breaking changes in one file would increment the version in the other ones.
- @mmccool : we can version the folder and let git show what file has changed between versions
- @danielpeintner : If all resources are synced, we will be talking about a certain spec version (pre-release)

--- 

Ege: From user's perspective, it would be better to not change the version if a file doesn't change.
Luca: It is also a tooling problem. The tooling can replace a version tag. A warning can be displayed if we don't bump the version. Changing the tooling, readme etc. doesn't generate the warning.
Luca: Artifacts from a release having different versions will confuse the users. Until a stable release, there is no meaning provided in semver anyways, you have to check the changes manually.
Ege: after the talk, I tend to agree that we should sync all resources all the time (pre-release and release)

### Tooling

- @egekorkan : Maybe there are options other than manually updating specific files and redirection.
- The changelog point below is related to this

---

- @ektrah has tooling for TTL files that leverages npm that we can use. https://github.com/ektrah/rdf-toolkit and its publication at https://github.com/ektrah/rdf-library
  - In general, we should be able to package all types of resources in an npm release which solves the distribution problem. npm packages can contain anything (e.g. dotnet requires dotnet files)
  - The URI of the unstable packages need to be resolved. We can say something like "unstable package can be obtained from npm with the usual npm mechanism". This doesn't imply node.js knowledge, just npm usage. We can test using github.io links with file ending which avoids the content negotiation problem.
  - The tooling doesn't address JSON Schemas and JSON-LD context files (current tooling can be maybe used, to test) (and examples files in the future) but they can be still just packaged together. For JSON Schema, there can be tools from JSON Schema community that we can leverage for fetching correct versions of our dependencies (we don't have that atm).
  - `files` attribute in package.json can allow us to filter which files should be considered for the npm package.
  - We should involve more people into this (Ege to contact Pierre Antoine for pointers to people)
  - GitHub also supports npm packages so no need to publish on npmjs.org
- npmjs.org has different people trying to publish ontologies as packages (search for ontologies).
- Protege has an XML file that can do local redirection. Similar to npm linking in local environment but it does for URLs. See example at https://github.com/geneontology/protege-tutorial/blob/master/advanced-metabolism/catalog-v001.xml
- We can also evaluate GitHub releases (with gh actions)
- We still need to have tooling for updating the version-relevant field within the files
- We currently rely on ontologies that do not change a lot (plus our own ontologies) so we do not have a problem with our dependencies.

Problems to solve:
- Distribution
- URIs of resources
- Packaging

### User Point of View

Who is targeted by each change and how are they affected?

- @mahdanoura : we should communicate the reason for the change and what the change was. We also need to define what we mean by major, minor, and patch.
- Pointing to the most recent version but also older versions should be available. When a user wants to get a resource and does not specify the version, they get the latest version.
- @relu91 : There are Developers who try out the specs so there is no version "just for us".

Note: We should write a user story per persona about this aspect of the discussion.

---

Luca: 

#### Changelog

- @mmccool : Discovery TF did a changelog "test". We should let git/GitHub do the work for us, if possible. Tagging etc.
- @relu91 : commit messages to drive the changelog. There are tools for that but may not work for "documents". We need to define guidelines as well, e.g. using "chore" when doing a small fix.
- @mjkoster : docstrings in commit messages can be used to automate changelog

### Metadata

Different resources need different types of metadata within them.

#### Ontologies

- @mahdanoura: There needs to be also some supplementary metadata that needs to be provided in versioned ontologies like `dct:created`, `dct:modified`, `dct:valid`, `vann:changes`, and the relation between the ontology versions. [Section 7.4](https://www.w3.org/TR/owl-ref/#VersionInformation) details ontology versioning. It states that the `owl:versionInfo` is an annotation property, `owl:priorVersion`, `owl:backwardCompatibleWith` and `owl:incompatibleWith` are ontology properties, where `owl:Ontology` is considered as the `domain `and `range`. Therefore, this shows that OWL requires different versions of an ontology to have different URIs.
  - There is also a proposed standard, [MOD2.0](https://github.com/FAIR-IMPACT/MOD) specification for describing ontology metada and semantic artifacts. It has some metadata we could reuse for our versioned ontologies. 
