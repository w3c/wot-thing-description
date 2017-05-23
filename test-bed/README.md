# Test bed for Serialization formats

The goal of the test bed is to categorize various suitable serialization formats for WoT Thing Description.

To do so a set of test data is collected.

## Test data

The folder `/data` contains test instances

Test data is structured into the following categories

* `/data/coverage` deals with exploring variations (e.g., different datatypes) 
* `/data/realistic` tries to collect realistic examples (e.g., with semantic annotations) for actually exploring different serialization formats
* `/data/plugfest` contains PlugFest test-cases (could be also part of "realistic" ?)
* `/data/others` placeholder for including test data from other organizations (e.g., OCF, oneM2M, ....)

## Evaluation

So far it is not decided yet how to do a proper evaluation. Possible important aspects might be

* Adaption in (other) communities/platforms
* Acceptance (web developer vs. embedded developer)
* Data exchange size
* Processing speed/requirements (enable in-place processing)
* Royalty free
* Free/open source implementations?
* ...