# TD Data Schema Definition

The following terms are defined in an RDFS vocabulary that conceptually aligns with JSON Schema.
See [td-types.ttl](./td-types.ttl) and the examples in this folder.

Schema definitions can also be derived as OWL classes. An experimental JS script is available
[here](https://github.com/vcharpenay/wot/tree/master/proposals/type-system/schema2owl.js).

| RDF Term | JSON Schema | Comment |
| --- | --- | --- |
| rdf:type | type | |
| td:DataSchema | - | schema definition |
| td:DataField | - | object key/value pair |
| td:Object | object | |
| td:Array | array | |
| td:Number | number | ~ union of xsd:decimal, xsd:float, xsd:double |
| td:Integer | integer | ~ xsd:decimal |
| td:String | string | ~ xsd:string |
| td:Boolean | boolean | ~ xsd:boolean |
| td:items | items | |
| td:minItems | minItems | |
| td:maxItems | maxItems | |
| td:enum |enum | |
| td:field | properties | |
| td:name | - | |
| td:value | - | |
| td:required | required | |
| td:anyOf | anyOf | |
| td:someOf | someOf | |
| td:oneOf | oneOf | |
| xsd:minInclusive | minimum | |
| xsd:maxInclusive | maximum | |