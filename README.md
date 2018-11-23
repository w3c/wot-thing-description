# Specification 'Web of Things (WoT) Thing Description'

Each commit here will sync it to the master, which will expose the content to http://w3c.github.io/wot-thing-description/.

To make contributions, please provide pull-requests to the html file, see [github help](https://help.github.com/articles/using-pull-requests/).

## Rendering

Part of the document is automatically rendered using the [STTL.js](https://github.com/vcharpenay/STTL.js/) RDF template engine and Node.js.
_Any change to the document must be performed on the main HTML template [`index.template.html`](index.template.html)_, and not on `index.html`.
To render `index.html`, along with SVG figures, run: 

```sh
$ ./render.sh
```

The script will first download and install some dependencies (triple store, Node.js dependencies) and then execute the JS script `render.js`.
The latter should always be execute within `render.sh` since it requires some env variables to be set first.
For Windows users, the script should be run in a [Cygwin shell](http://cygwin.com/).

Rendering is primarly based on the content of [`validation/td-validation.ttl`](validation/td-validation.ttl).
Any customization of the rendering should go there. e.g. by defining `sh:order` or `sh:description` triples for the relevant shapes.

## Normative Assertions

To extract a list of normative assertions,
e.g. for organizing testing, issue the following command:
```sh
npm run assertions
```
A table of assertions will be generated and output to
[testing/assertions.html](testing/assertions.html)
which will use relative links back up to [index.html](index.html).
The input to this process is [index.html](index.html)
(not index.html.template) so make sure to execute `npm run render` first.

For this to work, the assertions need to 
be marked up as in the following examples and follow RFC2119 conventions:
```html
<span class="rfc2119-assertion" id="additional-vocabularies">
  JSON TD MAY contain additional optional vocabularies that are 
  not in the Thing Description core model.
</span>
<span class="rfc2119-assertion" id="additional-vocabularies-prefix">
  Terms from additional optional vocabularies used in a JSON-TD MUST 
  carry a prefix for identification within the key name
  (e.g., <tt>"http:header"</tt>).
</span>
```

The assertions must be marked up as follows:
* Enclose each assertion in a span.
* Mark the span with unique id.
  It is recommended that the section id be followed
  by a short name for the specific assertion.
* Mark the span with a 'class' attribute set to `rfc2119-assertion`.
* Include one (and only one) instance of the RFC2119 keywords (MUST, MAY, etc.)
  in capitals.
This markup does not change the rendering; it just clearly indicates
and uniquely names the assertion.

It is strongly recommended to make assertions independent of context.
In particular, avoid using pronouns or relational expressions
referring to previous statements not included in the assertion.
Such references can always be replaced with their
antecendent ("dereferenced") without changing the meaning,
and this is less ambigious anyway.
For example, instead of using "this serialization", use
"a JSON-TD serialization".
