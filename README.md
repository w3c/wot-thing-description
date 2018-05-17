# Specification 'Web of Things (WoT) Thing Description'

Each commit here will sync it to the master, which will expose the content to http://w3c.github.io/wot-thing-description/.

To make contributions, please provide pull-requests to the html file, see [github help](https://help.github.com/articles/using-pull-requests/).

## Rendering

Part of the document is automatically rendered using the [Dust.js](http://www.dustjs.com/) HTML template engine and Node.js. To render it, run:

```sh
npm install
npm run render
```

## Normative Assertions

To extract a list of normative assertions, e.g. for organizing testing, issue the following command:
```sh
npm run assertions
```
The assertions will be in [testing/assertions.html](testing/assertions.html) which will use relative links back up to
index.html.  The input to this process is [index.html](index.html) (not index.html.template) so use `npm run render` first.

For this to work, the assertions need to follow specific conventions.  Here are some examples:
```html
<span class="rfc2119-assertion-MAY" id="json-serialization-additional-vocabularies">JSON TD <em class="rfc2119">MAY</em> contain additional optional vocabularies that are not in the Thing Description core model.</span><!-- Describe test cases -->
<span class="rfc2119-assertion-MUST" id="json-serialization-additional-vocabularies-prefix">Terms from additional optional vocabularies used in a JSON-TD <em class="rfc2119">MUST</em> carry a prefix for identification within the key name (e.g., <tt>"http:header"</tt>).</span>
```

Conventions:
* Put the entire assertion inside a span
* Mark the span with an id unique to this document.  It is recommended that the section id be followed by a short name for the specific assertion.
* Mark the span with a class of the form `rfc2119-assertion-` followed by one of `MUST`, `MAY`, `MUST-NOT`, etc.
* The assertion may optionally be followed by a comment; this will also be extracted.  It can be used to define some suitable test cases, constraints, or other issues.
* The entire assertion and the comment need to be on a single input line (sorry).

Best practices:
* Make the assertion independent of context.  For example, avoid using pronouns referring to previous statements not in the assertion (eg replace "this serialization" with "a JSON-TD serialization", etc).
