# Project Management Process

The text below is copied from <https://www.w3.org/WoT/IG/wiki/index.php?title=WG_WoT_Thing_Description_WebConf>.

The main question is "How do we organize the work?".

## Opinions

- Ege Korkan:
  - Ideally, we should discuss our requirements and what people want to see. Mandating a mechanism that the moderators like but is disliked by everyone else should be avoided.
  - The goal is to make it more systematic than "copy-pasting the agenda, look into issues and PRs"
  - The process for generating features from use cases should be taken into account
  - We can use a tool like GitHub Projects. A premature example is available at https://github.com/orgs/w3c/projects/31
- Mahda Noura: Only assigning an issue is not enough, because the number can increase and we can lose oversight/prioritization.
- Cristiano Aguzzi: Assigning should happen when you know that person can do it in 1-2 weeks.
- Jan Romann: Splitting issues definitely helps. We should limit the workload of an issue in the beginning or use checkboxes per small item and open a "spinoff" issue.
- Kazuyuki Ashimura: We should think of what we have been doing so far.

## Proposals

**Preliminary goal from meetings:**

- An MVP is one place to look at the list of "work" to do in a short period. We can make sure to limit the load of a person per 1-2 week time frame and thus prioritize certain issues/topics.
- A prioritization should happen and should be aligned with use cases and requirements, i.e. how do we choose the small list of work to do

### Proposal from Ege Korkan

- We have two tables in a GitHub project: Sorting and Assigning
- We follow the lifecycle figure below:
  
![lifecycle](./lifecycle.drawio.png)

- When an issue shows up, the TF acts fast to categorize it.
  1. If an issue has Use Case relevant content where a deeper understanding is needed, it is immediately moved to the Use Cases repository.
  2. If it is an issue that can be handled by the TF alone, such as tooling, editorial fixes, etc., the TF labels it and moves it to the relevant column in the sorting table.
  3. If the issue is created by the Use Cases TF, it is analyzed, which can result in smaller issues, more description etc.. This is also reflected in the sorting table.

- We use the sorting table to categorize issues into topics we agree on via work item categories, i.e. `bindings`, `data mapping`, `tooling`, `editorial`, `bug`, where each category is a column. The granularity of categories is aligned with the work item categories at <https://github.com/w3c/wot/blob/main/planning/ThingDescription/work-items.md>. The backlog of this table is uncategorized issues, which are the cases 2 and 3 above. This table is edited primarily outside of the calls, i.e. as issues show up.
  - Issues that come from the use case pipeline typically contain a short feature proposal that needs to satisfy a set of requirements. It is possible that the work to satisfy the requirement is a lot. In that case, the TF works on planning the work to fit the TF structure and the spec generation pipeline. Ideally, it should be split into multiple issues that are easy to manage, assignable as tasks and that do not result in very big PRs.
    - Also see <https://github.com/w3c/wot-usecases/blob/main/Process.md>. The result of the gap analysis and feature definition is the input to this point.
- Once an issue is analyzed and sorted sufficiently (called refined), we use the Assignment Table to track who is most suited for the issue and whether that is being worked on. Based on people's availabilities, we move issues to "in progress". The backlog of this table is refined issues. This table is edited primarily during calls and can be considered to mirror the agenda closely.

The tables proposal is illustrated in the figure below:

![kanbanidea](./kanbanidea.drawio.png)

- Here we see that no issue that is not categorized is in the assignment table, i.e. issues 1, 2 and 3.
- We see that a person can get assigned to issue since they are the best fit (more expertise, more motivation etc.) but is not necessarily doing it right now. Since Person2 has less availability, they are working only on Issue 10 while  Issue 7 and 9 is on hold.
- Person1 has more time and is working Issue 5 and 6, while having assigned Issue 4 as well.
- Issues 13 and 14 are done and are visible in both tables.

## Procedure

Concrete procedure text will come here.

## To Do

- We should analyze https://github.com/w3c/strategy/projects/2 and https://github.com/orgs/w3c/projects/13
- Create issue templates for necessary items
