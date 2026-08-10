
### CSV Handling

As a first concrete case for mapping to non-JSON Payloads, this document conmprises an analysis how the handling of CSV data can be described in a TD.

CSV support is not only a non-JSON payload question, but a mapping question between tabular wire data and TD DataSchema semantics.

"Tabular wire data" means the raw CSV exchanged over the protocol, where meaning is often implied by row and column position, header names, formatting rules, and context.

"TD DataSchema semantics" means the meaning that a WoT Consumer expects from TD data models, such as explicit property names, types, constraints, and structure.

So the challenge is not only to parse CSV syntax, but to define how each CSV column/row maps to TD-level meaning. For example, a CSV line like `t,unit,v` -> `1718894400,C,23.4` needs a mapping that says which field is the timestamp, which is the unit, which is the measured value, and what their expected data types and constraints are.

| CSV column | Example value | TD-facing field | Expected type | Example constraint |
| --- | --- | --- | --- | --- |
| `t` | `1718894400` | `timestamp` | integer or string (date-time) | must map to a valid timestamp |
| `unit` | `C` | `unit` | string | allowed values: `C`, `F`, `K` |
| `v` | `23.4` | `value` | number | within sensor-specific valid range |

Possible TD/DataSchema snippets for different interpretation styles:

1. Flat value model (unit is fixed by schema)

```json
{
  "type": "object",
  "properties": {
    "timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "temperature": {
      "type": "number",
      "unit": "Cel"
    }
  },
  "required": ["timestamp", "temperature"]
}
```

2. Wrapped measurement model (value and unit are explicit data fields)

```json
{
  "type": "object",
  "properties": {
    "timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "airTemperature": {
      "type": "object",
      "properties": {
        "value": { "type": "number" },
        "unit": { "type": "string", "enum": ["Cel", "Fah", "K"] }
      },
      "required": ["value", "unit"]
    }
  },
  "required": ["timestamp", "airTemperature"]
}
```

3. Array-row model (index-based) with explicit mapping metadata

```json
{
  "type": "array",
  "items": [
    { "type": "integer", "description": "timestamp epoch seconds" },
    { "type": "string", "description": "unit" },
    { "type": "number", "description": "value" }
  ],
  "minItems": 3,
  "maxItems": 3
}
```

In this third style, interoperability depends on additional mapping metadata that declares index-to-field semantics (`0 -> timestamp`, `1 -> unit`, `2 -> value`).

Without this mapping layer, two implementations can read the same CSV bytes but derive different JSON structures or interpretations, which harms interoperability.

We therefore need to standardize a predictable mapping from CSV to the JSON-Schema-like data model used by TDs without over-constraining implementations. This includes deciding whether TD should prescribe one canonical JSON representation of CSV rows (e.g., arrays vs. objects), allow multiple representations with explicit mapping metadata, and clarify what is TD specification versus binding-specific behavior.

1. Canonical JSON representation or not

- If TD defines one canonical representation (for example, each CSV row becomes an object keyed by column names), consumers are simpler and interoperability is stronger.
- Constrained implementations can still use array-based rows internally, as long as they expose the canonical TD-facing representation at the interface boundary.
- The downside is reduced flexibility for systems that want to expose array-based rows directly as their external representation.

2. Multiple JSON representations with explicit mapping metadata

- If TD allows multiple representations (for example, row-as-array and row-as-object), TDs need explicit metadata that tells consumers exactly how to interpret rows, headers, ordering, null handling, and type coercion.
- This preserves flexibility and backward compatibility, but raises complexity because consumers must implement more mapping logic.

3. TD specification vs binding-specific behavior

- TD specification should define the minimum semantics needed for cross-protocol interoperability (for example, how mapped values relate to DataSchema constraints and names).
- Binding-specific vocabularies can define protocol or ecosystem details (for example, CSV dialect details or transport-specific defaults) that should not be mandatory for all TD implementations.

In short, the specification needs a balance: enough common rules to ensure portable semantics across implementations, while still allowing binding extensions for protocol-specific needs.

#### Example Service: InfluxDB

InfluxDB is a practical service example where CSV is returned over HTTP rather than only used as an export file format. In InfluxDB 2.x, query results can be requested as CSV by setting `Accept: application/csv` on the query endpoint.

Example request:

```http
POST /api/v2/query?org=my-org HTTP/1.1
Host: influx.example.com
Authorization: Token <token>
Accept: application/csv
Content-Type: application/vnd.flux

from(bucket:"sensors")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "device_metrics")
  |> filter(fn: (r) => r._field == "metric_value")
```

Example response body (CSV):

```csv
timestamp,metric_name,metric_value,unit,asset_id
2026-07-14T08:00:00Z,throughput,23.4,items_per_minute,asset-01
2026-07-14T08:01:00Z,throughput,23.5,items_per_minute,asset-01
```

This is relevant to CSV mapping because, even with a simple single-header CSV shape, a TD mapping still needs to define how columns such as `timestamp`, `metric_name`, and `metric_value` map to TD-facing semantics.

#### Semantic Mapping Concerns

This subsection groups exercises where interoperability depends primarily on explicit TD-level meaning, mapping intent, and domain semantics.

##### Exercise 1: Tabular Wire Data vs TD DataSchema Semantics

Using the InfluxDB CSV example

```csv
timestamp,metric_name,metric_value,unit,asset_id
2026-07-14T08:00:00Z,throughput,23.4,items_per_minute,asset-01
```

the mapping challenge is to define TD-facing semantics explicitly, for example:

- `timestamp` -> observation time,
- `metric_name` -> which logical property/event the value belongs to,
- `metric_value` -> numeric payload value,
- `unit` -> engineering unit.

Without explicit mapping rules, implementations may interpret `metric_name` differently (as metadata, as property selector, or as part of the payload), which harms interoperability.

##### Exercise 2: Time Semantics and Normalization

Although InfluxDB commonly returns RFC3339 timestamps, mapping still needs to define:

- required timestamp format and precision,
- normalization target in TD-facing payloads,
- behavior for invalid or missing timestamps.

This ensures deterministic cross-implementation handling even when query pipelines or intermediate processing alter time fields.

#### Parser-Centric Concerns

This subsection groups exercises where parser behavior and deterministic normalization rules are the main focus.

##### Exercise 3: Canonical Representation Decision

For the same row, two consumer-facing representations are possible:

- object form (for example `{ "timestamp": "...", "metric_name": "throughput", "metric_value": 23.4, ... }`),
- array form (for example `[..., ...]` with index-based meaning).

If one canonical representation is required, implementations remain free to use other internal forms but should expose the canonical TD-facing shape.

##### Exercise 4: Type Coercion and Missing-Value Handling

CSV values are text on the wire, so mapping must define:

- coercion rules for `metric_value` (string to number),
- handling of empty fields,
- handling of sentinel or non-numeric values,
- validation behavior when coercion fails.

Without these rules, identical CSV rows can lead to divergent TD-level payloads.

#### Example Device: Campbell Scientific CR1000xe and TOA5

IoT devices that deliver data in CSV format over common protocols such as HTTP are relatively rare and are most often found in industrial data logger scenarios.

According to the [Campbell Scientific CR1000xe](https://www.campbellsci.com/cr1000xe) documentation, one possible output format is TOA5 (Table Output ASCII, version 5). It is currently unclear whether TOA5 is used only for local storage or is also exposed over protocols such as HTTP.

For the CSV handling analysis, we still use TOA5 as an example because it is a relevant tabular text format that typically includes:

- table-oriented metadata/header lines (for example, table or schema context),
- a field-name row,
- data records as delimited values.

This creates the exact mapping problem discussed above: a TD consumer must interpret not only the row values, but also the structural meaning conveyed by TOA5 headers and column conventions. In practice, interoperability depends on clear mapping rules for column identity, data types, timestamp semantics, units, missing values, and whether mapped JSON is represented as arrays or objects.

As a result, TOA5 is a strong candidate to exercise CSV data mapping decisions before defining normative TD requirements.

#### Semantic Mapping Concerns

This subsection groups exercises where interoperability depends primarily on explicit TD-level meaning, mapping intent, and domain semantics.

##### Exercise 1: Illustrating Tabular Wire Data vs TD DataSchema Semantics

Consider the following simplified TOA5-style payload:

```csv
"TOA5","CR1000","CR1000","12345","CR1000.Std.32.07","CPU:weather.CR1X","1234","Weather"
"TIMESTAMP","RECORD","AirTemp_C","RH","WindSpeed_ms"
"TS","RN","Deg C","%","m/s"
"","","Avg","Avg","Avg"
"2026-06-25 10:00:00",1,23.4,56.2,4.8
```

At the wire level, this is only a sequence of delimited rows. Some rows contain metadata about the table, some define column names, some define units or aggregation semantics, and only the last row contains the actual observation values.

From a TD DataSchema perspective, however, a consumer would typically want a semantic structure closer to:

```json
{
  "timestamp": "2026-06-25T10:00:00Z",
  "airTemperature": {
    "value": 23.4,
    "unit": "Cel",
    "type": "number"
  },
  "relativeHumidity": {
    "value": 56.2,
    "unit": "percent",
    "type": "number"
  },
  "windSpeed": {
    "value": 4.8,
    "unit": "m/s",
    "type": "number"
  }
}
```

This gap illustrates the problem. The wire data does not directly say that `AirTemp_C` should map to a TD property called `airTemperature`, that `Deg C` should be interpreted as a semantic unit, that `Avg` qualifies the value as an average, or that `TIMESTAMP` should be normalized into a TD-friendly date-time representation. Those semantics must either be inferred by convention or declared explicitly in mapping metadata.

The exercise therefore shows that CSV handling is not only about parsing rows and columns. It is about identifying which rows carry schema information, which cells carry data values, and how both are mapped into the logical data model exposed by the TD.

##### Exercise 2: Header and Metadata Line Classification

Using a TOA5-style fragment:

```csv
"TOA5","CR1000","CR1000","12345","CR1000.Std.32.07","CPU:weather.CR1X","1234","Weather"
"TIMESTAMP","RECORD","AirTemp_C","RH","WindSpeed_ms"
"TS","RN","Deg C","%","m/s"
"","","Avg","Avg","Avg"
"2026-06-25 10:00:00",1,23.4,56.2,4.8
```

the first four lines are not equivalent. They contain different kinds of metadata:

- logger/table context,
- field identifiers,
- engineering units,
- aggregation qualifiers.

If an implementation misclassifies any of these lines as data records, the TD mapping may become corrupted (for example, trying to parse `"Deg C"` as a string measurement).

To make behavior deterministic, the mapping profile should define:

- which rows are metadata and which rows are observations,
- whether metadata is fixed-position, pattern-based, or explicitly declared,
- how repeated headers or table restarts are handled,
- whether metadata lines are preserved as provenance/annotations.

This exercise shows that CSV interoperability depends on row-role classification before value mapping begins.

##### Exercise 3: Time Semantics and Normalization

Using a row with timestamp but no explicit timezone:

```csv
"2026-10-25 01:30:00",1201,12.1,84.0,1.2
```

two consumers may normalize the same value differently:

- Consumer A assumes UTC -> `2026-10-25T01:30:00Z`
- Consumer B assumes local station time with daylight-saving context -> `2026-10-25T01:30:00+02:00` (or `+01:00`)

Both normalizations are plausible, but they represent different instants. That can break downstream correlation, event ordering, historical queries, and threshold analytics in WoT consumers.

To avoid this ambiguity, mapping metadata should define at least:

- source timezone policy (fixed timezone, UTC, or per-station configuration),
- daylight-saving handling rules,
- timestamp format grammar and precision,
- normalization target (for example, always RFC 3339 UTC in TD-facing payloads),
- behavior for invalid or ambiguous local times.

This exercise demonstrates that time handling is a core semantic mapping concern, not only a formatting concern.

##### Exercise 4: Quality and Status Side-Channel Mapping

Assume the payload includes quality/status columns next to measurements:

```csv
"TIMESTAMP","AirTemp_C","AirTemp_QC","RH","RH_QC"
"2026-06-25 10:10:00",23.9,"G",55.8,"SUSPECT"
```

The mapping challenge is deciding where quality semantics live in the TD-facing model. At least three choices are common:

- embed quality with each value,
- publish quality in a parallel structure,
- expose quality via separate affordances.

If implementations choose different patterns without explicit mapping metadata, applications cannot consume quality information consistently.

A deterministic mapping might define:

- enumeration for quality vocabulary (for example `GOOD`, `BAD`, `SUSPECT`),
- how quality links to each measured field,
- whether low-quality values are filtered, flagged, or still delivered,
- how quality affects validation and downstream automation.

This exercise shows that combining payload value channels with semantic quality channels is optional in CSV mapping. If needed, it can be handled at the implementation level or in binding-specific definitions.

##### Exercise 5: Multi-Table and Multi-Measurement Routing

This exercise is intentionally not a native single-table TOA5 shape. Instead, it models a generic or post-processed CSV stream where rows from multiple logical tables are merged.

Assume one export stream carries rows from different logical tables:

```csv
"TABLE","TIMESTAMP","RECORD","AirTemp_C","RH","Battery_V"
"Weather","2026-06-25 10:15:00",15,24.1,54.9,
"Power","2026-06-25 10:15:00",99,,,12.4
```

In native TOA5, table identity is typically provided in header metadata rather than as a per-row `TABLE` column. The example above therefore represents an aggregated/multiplexed CSV case used to stress-test mapping behavior.

The challenge is routing rows to the correct TD model elements:

- `Weather` row -> environmental property/event model,
- `Power` row -> device-health property model.

Without explicit routing rules, consumers may attempt to coerce sparse columns into one schema, causing invalid or misleading payloads.

A robust mapping should define:

- table discriminator field(s),
- per-table target affordance (property/action/event data model),
- per-table schema and required fields,
- behavior for unknown tables or partially populated rows.

This exercise demonstrates that table-level routing is a first-class mapping concern, not a post-processing detail.

#### Parser-Centric Concerns

This subsection groups exercises where parser behavior and deterministic normalization rules are the main focus.

##### Exercise 6: Canonical Representation Decision (Row-as-Array vs Row-as-Object)

Using the same TOA5-style data row:

```csv
"2026-06-25 10:00:00",1,23.4,56.2,4.8
```

two valid JSON mappings are possible.

Option A (row-as-array):

```json
[
  "2026-06-25 10:00:00",
  1,
  23.4,
  56.2,
  4.8
]
```

Option B (row-as-object):

```json
{
  "TIMESTAMP": "2026-06-25 10:00:00",
  "RECORD": 1,
  "AirTemp_C": 23.4,
  "RH": 56.2,
  "WindSpeed_ms": 4.8
}
```

Both are syntactically correct and both can be transformed into a TD-level model. However, they have different trade-offs:

- Array form is compact, but depends on fixed column order and external knowledge of index-to-meaning mapping.
- Object form is self-descriptive, but depends on stable field names and clear normalization rules.

To avoid ambiguity across implementations, mapping metadata must make the representation explicit. At minimum, the mapping needs to state:

- which representation is used (`array` or `object`),
- how columns are ordered or named,
- how types are coerced,
- how units and qualifiers (for example `Avg`) are attached,
- how timestamps are normalized.

This exercise illustrates why the specification needs either one canonical mapping profile or a small set of allowed mappings with mandatory metadata. Without that, two conforming consumers can parse the same CSV payload and still produce incompatible semantic results.

##### Exercise 7: Type Coercion and Missing-Value Handling

Assume the following payload fragment:

```csv
"TIMESTAMP","RECORD","AirTemp_C","RH","WindSpeed_ms"
"TS","RN","Deg C","%","m/s"
"2026-06-25 10:05:00",2,"23.7","NAN",""
```

Even with column names known, multiple interpretation choices remain:

- `"23.7"` may be treated as a string or coerced to a numeric value.
- `"NAN"` may be interpreted as a valid string token, IEEE NaN, null, or a data-quality error.
- `""` (empty field) may mean null, not observed, sensor offline, or default value.

If these choices are not standardized, implementations diverge. For example, one consumer may produce:

```json
{
  "airTemperature": 23.7,
  "relativeHumidity": null,
  "windSpeed": null
}
```

while another may keep raw tokens:

```json
{
  "airTemperature": "23.7",
  "relativeHumidity": "NAN",
  "windSpeed": ""
}
```

To preserve interoperability, mapping metadata (or a canonical profile) should define at least:

- field-level target type (string, number, integer, boolean),
- coercion rules (for example, parse decimal strings as numbers),
- recognized missing/sentinel tokens (`""`, `"NAN"`, `"-9999"`, etc.),
- nullability and validation behavior when coercion fails,
- optional quality flags when values are imputed or marked invalid.

This exercise highlights that CSV-to-TD mapping is not only structural. It also requires deterministic semantic rules for value normalization, especially for partial, noisy, or legacy telemetry data.

##### Exercise 8: CSV Dialect and Locale Variability

Assume different producers emit equivalent data using different dialects:

```csv
# dialect A
"2026-06-25 10:20:00",24.3,53.1

# dialect B
"2026-06-25 10:20:00";"24,3";"53,1"
```

Both can represent the same observation, but delimiter and decimal conventions differ. If dialect is inferred incorrectly, values may be split or parsed incorrectly (for example `24,3` as string or two columns).

Mapping metadata should declare at least:

- delimiter, quote, and escape characters,
- decimal and thousands separators,
- header presence and encoding,
- whitespace and line-ending normalization.

This exercise shows that semantic interoperability depends on syntactic dialect declarations before any TD schema mapping can be trusted.

##### Exercise 9: Error Handling and Validation Outcomes

Assume a row violates expected numeric constraints:

```csv
"TIMESTAMP","AirTemp_C","RH"
"2026-06-25 10:25:00","ERR",140
```

Here `AirTemp_C` is non-numeric and `RH` is out of range. Different consumers may:

- reject the entire row,
- keep valid fields and null invalid ones,
- preserve raw tokens with error annotations.

All approaches are reasonable, but interoperability requires one declared policy (or a bounded set of policies) so downstream systems know what guarantees they receive.

The mapping specification should define:

- row-level vs field-level rejection behavior,
- required error annotations and diagnostics,
- whether raw source tokens are retained,
- retry, quarantine, or dead-letter behavior for repeated failures.

This exercise highlights that validation is part of semantic mapping behavior, not only implementation-specific error handling.

#### Findings from Stack Comparison (pandas vs csv-parse)

Based on the two proposed configuration profiles ([planning/work-items/analysis/pandas-csv-config-schema.yaml](planning/work-items/analysis/pandas-csv-config-schema.yaml) and [planning/work-items/analysis/csv-parse-config-schema.yaml](planning/work-items/analysis/csv-parse-config-schema.yaml)), the following findings summarize how the stacks address the CSV handling challenges above.

##### 1. Parsing and Dialect Control

- Both stacks provide strong controls for delimiter, quoting, escaping, comments, and malformed lines.
- `pandas.read_csv` provides many parsing controls in one API, including `dialect` compatibility and `on_bad_lines` policies.
- `csv-parse` offers similarly rich parser-level controls (`delimiter`, `columns`, `relax_*`, `skip_*`, `record_delimiter`) with stream-oriented behavior by default.
- Finding: both stacks can handle Exercise 8 (dialect variability) well when configuration is explicit.

##### 2. Header and Metadata Row Classification

- `pandas` supports `header`, `names`, and row skipping, but multi-line metadata patterns like TOA5 usually require additional logic around `read_csv`.
- `csv-parse` gives low-level row control in streaming mode, which can simplify custom classification pipelines for mixed metadata/data rows.
- Finding: both can implement Exercise 2, but neither provides domain-native TOA5 row-role semantics out of the box.

##### 3. Canonical Row Representation (array vs object)

- `pandas` naturally yields table-like columns and then JSON objects (`orient=records`) for row-as-object output.
- `csv-parse` can emit arrays or objects (`columns: true`), making the representation choice explicit at parser level.
- Finding: both support Exercise 6, and both still require explicit profile rules to guarantee one canonical representation across implementations.

##### 4. Type Coercion and Missing Values

- `pandas` has stronger built-in declarative support for type and missing-value normalization (`dtype`, `na_values`, `keep_default_na`, date parsing).
- `csv-parse` can cast values (`cast`, `cast_date`) but practical normalization policies are usually implemented in application code after parse.
- Finding: for Exercise 7, pandas is more batteries-included; csv-parse is more flexible but relies more on downstream transformation logic.

##### 5. Time Semantics and Normalization

- Both stacks can parse timestamp strings, but neither stack alone resolves semantic timezone policy, DST policy, or canonical TD-facing instant semantics.
- Both require explicit profile metadata and application logic for deterministic normalization.
- Finding: Exercise 3 remains a mapping-policy problem above the parser layer in both ecosystems.

##### 6. Quality/Status Side-Channels and Routing

- Both stacks can parse side-channel columns (for example `*_QC`) and discriminator columns (for example `TABLE`).
- Neither stack prescribes how to map those fields into TD quality semantics or affordance routing.
- Finding: Exercises 4 and 5 are not parser problems; they require explicit mapping/routing metadata and implementation conventions.

##### 7. Error Handling and Validation Outcomes

- `pandas` provides parser-time bad-line policies and can pair well with DataFrame-level validation.
- `csv-parse` supports strict/relaxed parsing and skip/error controls; validation outcomes are typically implemented in custom processing stages.
- Finding: both can support Exercise 9, but interoperable behavior depends on explicitly documented reject/annotate/quarantine policy beyond parser settings.

##### 8. Configuration Model and Interoperability Implication

- Neither stack has a mandatory standardized external CSV profile format for semantic mapping.
- In both ecosystems, parser options are usually code-level objects; external YAML/JSON profiles are a project convention.
- Finding: parser capability is sufficient, but interoperability depends on shared, declarative mapping profiles (including typing, nullability, time, routing, and validation semantics), not only parser options.

Coverage summary: across Exercises 1 to 9, parser-centric concerns are covered well (especially Exercises 6, 7, 8, and parser aspects of 9), while semantic mapping concerns are only partially covered or uncovered without additional profile logic (notably Exercises 1, 2, 3, 4, and 5).
