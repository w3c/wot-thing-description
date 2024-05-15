<p align="center">
  <a href="https://w3.org/wot">
    <img alt="Web of Things Homepage" src="https://www.w3.org/WoT/IG/wiki/images/8/8f/WOT-hz.svg" width="300" />
  </a>
</p>

<p align="center">
  <a href="https://w3c.social/@wot">
    <img alt="Follow on Mastodon" src="https://img.shields.io/mastodon/follow/111609289932468076?domain=https%3A%2F%2Fw3c.social"></a>
  <a href="https://twitter.com/W3C_WoT">
    <img alt="X (formerly Twitter) Follow" src="https://img.shields.io/twitter/follow/W3C_WoT"></a>
  <a href="https://stackoverflow.com/questions/tagged/web-of-things">
    <img alt="Stack Exchange questions" src="https://img.shields.io/stackexchange/stackoverflow/t/web-of-things?style=plastic"></a>
</p>

<p align="center">
  <a href="https://www.w3.org/TR/2023/REC-wot-thing-description11-20231205/">
    <img alt="Latest REC" src="https://img.shields.io/badge/W3C_REC-Latest-005a9c"></a>
  <a href="https://w3c.github.io/wot-thing-description">
    <img alt="Latest Editor's Draft" src="https://img.shields.io/badge/Editor's_Draft-Latest-fe914a"></a>
</p>

# Web of Things (WoT) Thing Description

General information about the Web of Things can be found at https://www.w3.org/WoT/.

---

A Thing Description describes the metadata and interfaces of Things, where a Thing is an abstraction of a physical or virtual entity that provides interactions to and participates in the Web of Things.
Thing Descriptions provide a set of interactions based on a small vocabulary that makes it possible both to integrate diverse devices and to allow diverse applications to interoperate.
Thing Descriptions, by default, are encoded in a JSON format that also allows JSON-LD processing.

## Logistics

- Call information: We use the W3C Calendar. You can find the next WoT TD/Binding Templates calls at https://www.w3.org/groups/wg/wot/calendar.
- Wiki (contains agenda): <https://www.w3.org/WoT/IG/wiki/WG_WoT_Thing_Description_WebConf>
- [Contribution rules](./CONTRIBUTING.md)

## Publications

- [Latest Editor's Draft](https://w3c.github.io/wot-thing-description) (syncs to this repository's main branch)
<!-- - [Latest Working Draft](w3.org link goes here) (This is relevant for notes and REC-track until publication) -->
- Recommendations:
  - [Version 1.1](https://www.w3.org/TR/2023/REC-wot-thing-description11-20231205/) - [Repository Snapshot](https://github.com/w3c/wot-thing-description/tree/REC1.1)
  - [Version 1.0](https://www.w3.org/TR/2020/REC-wot-thing-description-20200409/) - [Repository Snapshot](https://github.com/w3c/wot-thing-description/tree/REC1.0)
- Other deliverables:
  - [Implementation Report Version 1.1](https://w3c.github.io/wot-thing-description/testing/report11.html)
  - [Implementation Report Version 1.0](https://w3c.github.io/wot-thing-description/testing/report.html)
  - [Resources such as JSON-LD Context, Ontologies, JSON Schemas for validation](https://github.com/w3c/wot-resources/tree/main/td). Also see [below](https://github.com/w3c/wot-thing-description/?tab=readme-ov-file#resources-used-together-with-the-td-specification).

---

## Instructions for Editors and Contributors

If you have followed the [Contribution rules](./CONTRIBUTING.md) and want to contribute, please follow the instructions below.

### Working on the Specifications

Part of the document is automatically rendered using the [STTL.js](https://github.com/vcharpenay/STTL.js/) RDF template engine and Node.js.
_Any change to the document must be performed on the main HTML template [`index.template.html`](index.template.html)_, and not on `index.html`.
To render `index.html`, along with SVG figures, run:

- `npm install` to install all the dependencies
- `npm run render` to render all the files

You can also invoke the rendering script directly:

```sh
./render.sh
```

Requirements: Node.js 16, [GraphViz](https://graphviz.org/).

The script will first download and install some dependencies (triple store, Node.js dependencies) and then execute the JS script `render.js`.
The latter should always be executed within `render.sh` since it requires some env variables to be set first.

For Windows users, the script should be run in a [Cygwin shell](http://cygwin.com/). The Git package from Cygwin distribution should not be used. Alternative Git client distribution such as [Git for Windows](https://gitforwindows.org/) works better when you encounter an issue building the document using Cygwin.

#### Automatic rendering

The repository is equipped with git hooks that automate the rendering process. To enable them, run `npm install` in the root folder. The hooks will render the documents automatically at every commit.
If you run the rending process manually or you do not want to execute the automatic process add the `--no-verify` option to your commit command.

#### Formatting

We use Prettier to automatically format the files, such that we have small git diffs in Pull Requests.
Make sure to run `npm run format` before committing your files.
If not, a GitHub action will format them by overwriting your last commit.

### Implementation Report

To generate the implementation report,
including a list of normative assertions,
issue the following command:

```sh
npm run assertions
```

A draft implementation report will be generated and output to
[testing/report.html](testing/report.html)
which will use relative links back up to [index.html](index.html).
The input to this process is [index.html](index.html)
(_not_ `index.html.template`) so make sure to execute `npm run render` first.

For this to work, the assertions need to
be marked up as in the following examples and follow RFC2119 conventions:

```html
<span class="rfc2119-assertion" id="additional-vocabularies">
  A JSON TD MAY contain additional optional vocabularies that are not in the Thing Description core model.
</span>
<span class="rfc2119-assertion" id="additional-vocabularies-prefix">
  Terms from additional optional vocabularies used in a JSON-TD MUST carry a prefix for identification within the key
  name (e.g., <tt>"http:header"</tt>).
</span>
```

The assertions must be marked up as follows:

- Enclose each assertion in a span.
- Mark the span with a unique id.
  It is recommended that the section id be followed
  by a short unique name for the specific assertion.
- Mark the span with a 'class' attribute set to `rfc2119-assertion`.
- Include one (and only one) instance of the RFC2119 keywords (MUST, MAY, etc.)
  in capitals.
  This markup does not change the rendering; it just clearly indicates
  and uniquely names the assertion.

It is strongly recommended to make assertions independent of context.
In particular, avoid using pronouns or relational expressions
referring to previous statements not included in the assertion.
Such references can always be replaced with their
antecedent ("dereferenced") without changing the meaning,
and this is less ambiguous anyway.
For example, instead of using "this serialization", use
"a JSON-TD serialization".

Also, assertions should ideally only constrain one item.
Multiple constraints should be stated in separate sentences.

Note that the above rendering process also assigns each
table entry a unique ID and these are also listed in the
table included in the implementation report.

Other data, e.g., data from test results, test specifications,
and implementation descriptions, are also needed to complete the
implementation report. See [testing/README.md](testing/README.md)
for details.

The generation of the implementation report also generates a CSS file
`testing/atrisk.css`
that highlights at-risk items in the generated `index.html`. The at-risk
items are listed in `testing/inputs/atrisk.csv`. If at-risk items are
updated, to update the at-risk highlighting the implementation report
needs to be generated first, and then the rendering.

## Known Implementations

The W3C WoT collects known implementations at <https://www.w3.org/WoT/developers/>. Implementations of REPO NAME are found under categories X, Y and Z.

## Labeling Conventions

We use the GitHub labels found at <https://github.com/w3c/wot-thing-description/labels>. Please try to reuse the labels before creating new ones.

## Resources used together with the TD Specification

In addition to the TD specification, the Working Group maintains additional resources that are relevant for implementers.
These are categorized below, and their use cases are explained.

### Vocabularies and Ontologies

The present specification introduces the TD Information Model as a set of constraints over different vocabularies.
The current list of vocabularies is found under [the namespaces section](https://w3c.github.io/wot-thing-description/#namespaces).

By default, if a user agent does not perform any content negotiation, human-readable HTML documentation is returned instead of the RDF document.
To perform content negotiation, clients must include the HTTP header `Accept: text/turtle` in their request.

The working documents are in the [ontology](./ontology) folder.

### Context files

We provide a JSON-LD context file to reference the TD ontology within JSON-LD documents, including TDs.
The working document can be found at [context/td-context-1.1.jsonld](./context/td-context-1.1.jsonld), and the version-specific context file can be retrieved from the `@context` value of a TD 1.0 or TD 1.1 instance.
**Note** that [context/td-context-1.1.jsonld](./context/td-context-1.1.jsonld) is the result of the rendering process and should not be edited manually.
In practice, the rendering process merges [context/td-context.jsonld](./context/td-context.jsonld), [context/json-schema-context.jsonld](./context/json-schema-context.jsonld), [context/wot-security-context.jsonld](./context/wot-security-context.jsonld), [context/hypermedia-context.jsonld](./context/hypermedia-context.jsonld).

You can find more information on using the context at [the Appendix of the TD specification](https://w3c.github.io/wot-thing-description/#json-ld-ctx-usage).

### JSON Schemas

We provide JSON Schema for TD and TM instances.
The working documents are found under the [validation](./validation/) folder, and specific versions are linked to the Thing Description specification.
These can be used for the purposes below among others:

- TD and TM validation
- Type generation for programming languages

**Note** that TM Schema is generated from the TD schema using the `tmSchemaGenerator.js` script.

Each commit here will sync to the master, which will expose the content to http://w3c.github.io/wot-thing-description/.
To make contributions, please provide pull requests to the appropriate files,
keeping in mind that some files, most notably `index.html` and `testing/report.html`,
as well as most files under `visualization`, are
autogenerated and should not be modified directly.
See GitHub [help](https://help.github.com/articles/using-pull-requests/) for
information on how to create a pull request.

## Obsolete Documents

Some documents of this repository are not required to be kept in the upstream branch (main branch).
They are deleted but are recorded below with a link pointing to a tagged branch:

- Review of the main document for TAG: <https://github.com/w3c/wot-thing-description/blob/CR-request/tag-review.html>
