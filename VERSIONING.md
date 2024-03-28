# Versioning of Specification Resources

In addition to the specifications, there are other resources that are managed in this repository.
This file documents the discussion on how the versioning should be.
Once there is an agreement, the rules will be moved to [wot-resources](https://github.com/w3c/wot-resources) repository with a corresponding policy.

## Versioning for 1.0 and 1.1 Specifications

- With each REC, we publish the following files:
  - Ontology files in form of TTL and HTML. These are TD, Security, hypermedia controls, JSON Schema, and soon the TM
  - JSON-LD Context file
  - JSON Schemas for TD and TM
- DECISION: We do not publish different versions of these files until we see the need (e.g. a bug that also has breaking changes to current implementations).

## Versioning for this Charter Period Resources

### Requirements

- Support all users of WoT resources (schemas, ontologies, type definitions, etc.), which can be of different versions. Users can be split into two:
  1. Early adopters (implementers before REC publication), which include specification developers, editors, testers, other TFs etc.
  2. REC publication users. Naturally, all early adopters are in this category as well.
- To both users, provide concrete guidelines and rules on how implementations should be made that take the versioning into account. The lack of this is the reason why we do not have versioned resources for 1.0 and 1.1 specifications.
- Prioritize stability for post REC users
- Make sure that quick changes are well-communicated to early adopters in the form of a changelog or similar
- Publicly serve all versions of all resources all the time
- Any change to any resource should bump the version inside the resource as well as the way the resource is obtained (e.g. URL, package manager, etc.)

---

> [!WARNING]  
> Parts below are still under discussion until further notice.

### Summary on Basic Policy

- We assume that each resource belongs to a specification. If not, we can "invent" a virtual specification like wot that is hosting multiple resources and use that string to identify multiple resources.
- Until AND after REC release:
  - Version is contained at all times inside the resource. E.g. JSON Schema version field reflects the version of the schema.
  - A changelog is created in each change. Until the REC release, it is the only source of information about the changes.
  - The part after the `+` sign is informative, called [build metadata](https://semver.org/#spec-item-10) in semver. [A real-life example for curl in crates.io](https://crates.io/crates/curl-sys/versions)
- Until REC release:
  - We publish snapshots that have no guarantees on the meaning of changes. E.g. snapshot 2 is published after snapshot 1 and it can break all your tooling. A changelog becomes necessary in this case.
  - Naming scheme: (semver for resource)-pre(some unique number or string)+(spec version)-pre(some unique number or string)
  - Synchronization: All resources have the same version (before and after `+`)
  - `-` complies with [pre-release version notation](https://semver.org/#spec-item-9) in semver.
  - **Open Point 1:** Decide whether we want a simple integer or a date after the `pre`.
    - McCool: date is better for being less error-prone. it is my preference. number is shorter. We should use day granularity. In cases like Testfest, we may want to do publish quick fixes.
    - Luca: if we release whenever needed, the date makes more sense. If we do monthly, the number is like the date.
  - **Open Point 2:** Whenever needed or monthly.
- After REC release:
  - Each resource gets versioned separately based on the need of that resource respecting the semver rules of that resource.
  - Naming scheme: resourcename-(semver for resource)+(spec version)
  - Synchronization: Syncing the part after the `+` sign but part before is per resource. At the same time, each resource has its own versioning rules on what is a major, minor, patch (see the meaning of changes).
  - Meaning of changes: Each type of resource has its own versioning timeline and meaning of changes
    - JSON Schemas:
      - Patch: Language typos etc.
      - Minor: Relaxing a constraint (longer strings, more oneof) so that more TDs can pass the schema. Adding new property keys
      - Major: Adding or restricting constraints
      - Further reading: <https://github.com/json-schema-org/website/issues/197#issuecomment-1883270213> and <https://gitlab.openretailing.org/public-standards/api-design-guidelines/-/blob/main/Open%20Retailing%20API%20Design%20Rules%20for%20JSON.pdf>
    - JSON-LD Context: No input yet.
    - Ontology files: No input yet. Further reading: https://www.w3.org/TR/prov-primer/
    - TypeScript types: Needs input from Scripting API TF
    - UML Diagrams: No input yet
- List of open points. More information at [Open Points Section](./#open-points):
  - How to take deprecation of terms into account
  - How should the changelog look like
  - Which tooling will we use
  - How will versioning information look like inside each resource
 
#### Example Versioning of TD JSON Schema

- Until the REC release
  - `2.0.0-pre1+td-2.0.0-pre1` OR `2.0.0-pre20240301+td-2.0.0-pre20240301` -> The unique number gets updated and remains in sync between two
  - `2.0.0-pre2+td-2.0.0-pre2` OR `2.0.0-pre20240401+td-2.0.0-pre20240401` -> Next small release during working mode
- After the REC release
  - 2.0.0+td-2.0.0 -> First publication after REC
  - 2.0.1+td-2.0.0 -> Fixed a typo in JSON Schema
  - 2.1.0+td-2.0.0 -> Added a new feature to JSON Schema
  - 2.0.2+td-2.0.1 -> Published an errata in TD spec
  - 3.0.1+td-2.0.1 -> We decided to move to a different version of JSON Schema itself
  - 4.0.1+td-2.0.1 -> We restrict JSON Schema in one way (e.g. reducing the number of enums). This should ideally never happen since it means we did not review the schema enough before the REC publication.

### Open Points

#### Tooling

Problems to solve:
- Distribution
- URIs of resources
- Packaging

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

#### Changelog

- @mmccool : Discovery TF did a changelog "test". We should let git/GitHub do the work for us, if possible. Tagging etc.
- @relu91 : commit messages to drive the changelog. There are tools for that but may not work for "documents". We need to define guidelines as well, e.g. using "chore" when doing a small fix.
- @mjkoster : docstrings in commit messages can be used to automate changelog

#### Version Information within Resources

- @mahdanoura: There needs to be also some supplementary metadata that needs to be provided in versioned ontologies like `dct:created`, `dct:modified`, `dct:valid`, `vann:changes`, and the relation between the ontology versions. [Section 7.4](https://www.w3.org/TR/owl-ref/#VersionInformation) details ontology versioning. It states that the `owl:versionInfo` is an annotation property, `owl:priorVersion`, `owl:backwardCompatibleWith` and `owl:incompatibleWith` are ontology properties, where `owl:Ontology` is considered as the `domain `and `range`. Therefore, this shows that OWL requires different versions of an ontology to have different URIs.
  - There is also a proposed standard, [MOD2.0](https://github.com/FAIR-IMPACT/MOD) specification for describing ontology metada and semantic artifacts. It has some metadata we could reuse for our versioned ontologies. 

## Archive

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

Which changes are bugfixes, which are new features etc. For each type of artifact, we need to agree on the meaning. Then, these meanings can be reflected in the version information.

File types in question:
  - JSON Schemas
    - Original Input:
      - Patch: English typos etc. Minor: Relaxing a constraint (longer strings, more oneof) so that more TDs can pass the schema. Major: Adding or restricting constraints
    - Learning from JSON Schema Discussion (also see <https://github.com/json-schema-org/website/issues/197#issuecomment-1883270213>):
      - Patch: English typos etc.
      - Minor: Relaxing a constraint (longer strings, more oneof) so that more TDs can pass the schema.
      - Major: Adding or restricting constraints
      - Also see: https://gitlab.openretailing.org/public-standards/api-design-guidelines/-/blob/main/Open%20Retailing%20API%20Design%20Rules%20for%20JSON.pdf
      - 
  - JSON-LD Context: How a JSON-LD context is versioned needs further input. No input from Ege, Daniel or Luca so far
  - Ontology files
    - TTL
    - HTML
  - TypeScript types: Needs input from Scripting API TF what major, minor, patch means for type versions.
  - UML Diagrams: How a UML diagram is versioned needs further input. No input from Ege, Daniel or Luca so far

Notes: 
- @mahdanoura : Also, the deprecation of terms needs to be considered, i.e. not removing but marking as deprecated.
- Best practices for RDF versioning should be studied. See https://www.w3.org/TR/prov-primer/

### Reflecting Meaning of Version Information

How do we reflect a patch change on the artifacts? Do we use semantic versioning, use date, and ignore semantic versioning, do we use alpha, beta etc.

- ( @lu-zero ) A date afterward would be good "enough" for implementers. A release every month (in addition to semver) would also be good. We can also pipeline it and tag each resource exposed to github.io. 
- ( @mjkoster ) Short commit hash would be fine. Monthly release may not make sense (unless there is a need)
- ( @mmccool ) To make things easy we should map our directories to the url structure. We should make all URLs are versioned
- @mahdanoura : According to OWL2 specification, for every ontology we can define an Ontology IRI (generic reference, should stay the same through versions) and a Ontology Version IRI. The difference is during dereferencing of the IRIs, the ontology IRI should redirect to the most recent version and the version IRI to the specific version.
- @egekorkan: we can do scoped versioning : td-version:resource-version -> 2.0.0.pre1+1.0.0.pre1 but this can be complicated. -> Not in favor of it anymore after talking
  - others: Something like a changelog in the discovery can convey the meaning of change. Using one version would be simpler.
- @egekorkan: We cannot do semantic versioning in the usual sense since TD 2.0 has set the expectation already. Or we decouple the spec version from resource version, e.g. TD 2.0 can have resources in version 25.2.1
- Cris: CSS simply increases the major version -> TD 2 has TD 2 resources. Until we get there, we can have TD 2.pre1 TD 2.a1.
- Luca: We can embed resource/format specific version inside the resource itself.
- Luca: We assume the TD 2.0 will not change but the resources can have big changes since they are moving targets. E.g. JSON Schema Draft 7 becomes obsolete and we decide to update to JSON Schema 2026-09 with totally new terms etc. In this case, JSON Schema resource gets a major version bump.
  - In this case, the resource needs its own semantic versioning lifecycle but refer to which spec version it refers to. Example for JSON Schema version: 4.0.0+2.0 becomes 5.0.0+2.0 following the example above. Next TD version, we will get 4.0.0+2.0 -> 5.0.0+3.0 

Discussion between Luca, Daniel, Ege:
- Scripting API's type definition versioning is currently based on JSON Schema version. Current thinking is to use `type-definition-1.2.0+json-schema-td-2.0.0+td-2.0.0` where everything is added after the + sign as informative text.
- There are cases like Scripting API HTML spec and the type definitions, TD Ontology in HTML and TTL. We need to decide if the versions of those are always the same. In the case of Scripting API, the spec can change but the type definitions don't (1) and vice versa (2).
  1. Informative text, explanation on the usage of a function in the TD spec (like not having `queryaction` in the spec but having it in the TD and JSON schema since 4 versions), WebIDL changes.
  2. Automatically, the type definition gets updated but the spec hasn't caught up.
 
### Synchronisation of Changes

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
ScAPI: Which Scripting API version uses which TD version and which version of Scripting API implementations (e.g. node-wot) use which version of Scripting API and TD. So this kind of (external) synchronization is also relevant.

### User Point of View

Who is targeted by each change and how are they affected?

- @mahdanoura : we should communicate the reason for the change and what the change was. We also need to define what we mean by major, minor, and patch.
- Pointing to the most recent version but also older versions should be available. When a user wants to get a resource and does not specify the version, they get the latest version.
- @relu91 : There are Developers who try out the specs so there is no version "just for us".

Note: We should write a user story per persona about this aspect of the discussion.
