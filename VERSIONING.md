# Versioning of TD Specification Resources

In addition to the specifications, there are other resources that are managed in this repository.
This file documents the discussion on how the versioning should be.
Once there is an agreement, the rules will be moved to [wot-resources](https://github.com/w3c/wot-resources) repository.
The points below present a summary, but you can scroll to the bottom of the page to find the original input from the meetings.

- With each REC, we publish the following files:
  - Ontology files in form of TTL and HTML. These are TD, Security, hypermedia controls, JSON Schema, and soon the TM
  - JSON-LD Context file
  - JSON Schemas for TD and TM
- We do not publish different versions of these files until we see the need (e.g. a bug that also has breaking changes to current implementations).
- Initial thoughts on versioning
  - When a user wants to get a resource and does not specify the version, they get the latest version.
  - We prefer semantic versioning with the following rules (also see <https://github.com/json-schema-org/website/issues/197#issuecomment-1883270213>):
    - Patch: English typos etc.
    - Minor: Relaxing a constraint (longer strings, more oneof) so that more TDs can pass the schema.
    - Major: Adding or restricting constraints
  - ( @egekorkan ) The versioning rules do not apply to different versions of a specification, e.g. TD 1.1 schema should be treated like a new release, not a next iteration of the 1.0 schema
  - Do we version anything until a REC release
    - ( @relu91 ) An unofficial version increment for WG members (not for outside): E.g. an alpha prefix and then a number. Beta etc. can be used when going into CR. Or we just tag/prefix/suffix with CR, PR or nightly
    - ( @lu-zero ) A date afterward would be good "enough" for implementers. A release every month (in addition to semver) would be also good. We can also pipeline it and tag each resource exposed to github.io.
    - ( @mjkoster ) Short commit hash would be fine. Monthly release may not make sense (unless there is a need)
  - We need a policy (when to change a version for example.
  - We need to be careful since each artifact has its own version, which will complicate CD pipeline.

## Original Input

Text copied from <https://www.w3.org/WoT/IG/wiki/WG_WoT_Thing_Description_WebConf>

- What do we mean by versioning?
  - Pointing to the most recent version but also older versions should be available
  - Semver with Major, Minor, Patch at semver.org
  - For TD.next, do we want to publish resources with each publication (WD, CR, PR etc) or not?
- Which changes are bugfixes, new features (TD 2.0 keywords)
  - JSON Schemas
    - Patch: English typos etc. Minor: Relaxing a constraint (longer strings, more oneof) so that more TDs can pass the schema. Major: Adding or restricting constraints
  - JSON-LD Context
  - Ontology files
    - TTL
    - HTML
- How much time to invest in maintaining 1.1 resources?
  – Maintaining multiple files or not: xxx.v1.1.0.ttl xxx.v1.1.1.ttl
- Decision so far: Do not dig into 1.1 versioning until we have the need.
- TM resources (tm.ttl and tm.html) will not be versioned for the first changes since HTML doesn't exist and TTL is not usable.
