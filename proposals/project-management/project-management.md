# WoT Project Management Process

The main question to answer is "How do we organize the work?".
We want to have one place to look for the list of "work" to do in a short period.
To do that, a prioritization should happen and should be aligned with use cases and requirements.
This allows us to limit the load of a person per 1-2 week time frame and thus prioritize certain issues/topics.

## Proposal from Ege Korkan

- We have two tables in a GitHub project managed by the TD TF: Sorting and Assigning
  - Note: There can be other tables in other TFs, such as the UC TF.
- Once the TF is comfortable with the approach, no other information is needed. Until then, a lifecycle diagram represents how the work goes through over time.

![lifecycle](./lifecycle.drawio.png)

- When an issue shows up (step 0), the TF acts fast to categorize and refine it (step 1). The steps are detailed below and reflected also in the sorting table example towards the end.
  1. If an issue has Use Case relevant content where a deeper understanding is needed (step 2), it is immediately moved to the Use Cases repository (step 3).
  2. If it is an issue that can be handled by the TF alone (step 6), such as tooling, editorial fixes, etc., the TF labels it and moves it to the relevant column in the sorting table.
  3. If the issue is created by the Use Cases TF (step 4), it is analyzed, which can result in smaller issues, more description etc. (step 5). This is also reflected in the sorting table. Note that this is closely related with the [Use Cases Process](https://github.com/w3c/wot-usecases/blob/main/Process.md) where the result of the gap analysis and feature definition are the inputs to this point.
- The initial categorization to 1, 2 or 3 can happen outside of the calls but issues that need thorough analysis and refinement would typically in a meeting.
- During the refinement of an issue (understanding, labeling), it is placed in a column in the sorting table based on the category. Categories such as `bindings`, `data mapping`, `tooling`, which are [work items](https://github.com/w3c/wot/blob/main/planning/ThingDescription/work-items.md) (big topics), are separate a columns. Categories such as `editorial`, `bug` are grouped in one column called `other`.
- Once refined, it is assigned (step 7) to one or more persons based on who is most suited, has more motivation etc. but not based on their availability.
- Based on people's availabilities and priorities set by the TF and WG as a whole, we move issues to "in progress" (step 8). This indicates that this issue is being addressed by one or more persons and is part of the agenda until resolved.
  - Note: We need further discussion on how we prioritize items.
- The result of the work happens in a Pull Request to the Editor's Draft. It can be merged asynchronously based on the agreement in the [WG Policy](https://github.com/w3c/wot/blob/main/policies/async-decision.md). Once it is merged, it is part of the Editor's Draft (step 9).
- Based on the nature of the change (step 10), it can require implementations to demonstrate implementability. If the change is an RFC assertion, we need to show its implementability before it can be in the final REC (step 12). If not, it can be in the REC without any further effort (step 11). Note that in both cases the WG needs to reach consensus or in the case of REC-track documents, the entire W3C needs to support it as part of the deliverable.

The lifecycle is also reflected in two tables. Steps 0 to 7 are contained in the sorting table whereas step 7 to 9 are contained in the assignment table. The example below can be considered a snapshot of the project management process.

![kanbanidea](./kanbanidea.drawio.png)

- Here we see that no issue that is not categorized is in the assignment table, i.e. issues 1, 2 and 3.
- We see that a person can get assigned to issue since they are the best fit (more expertise, more motivation etc.) but is not necessarily doing it right now. Since Person2 has less availability, they are working only on Issue 10 while  Issue 7 and 9 is on hold.
- Person1 has more time and is working Issue 5 and 6, while having assigned Issue 4 as well.
- Issues 13 and 14 are done and are visible in both tables.

## To Do

- We should analyze https://github.com/w3c/strategy/projects/2 and https://github.com/orgs/w3c/projects/13
- Create issue templates for necessary items

## Archive

### Opinions

- Ege Korkan:
  - Ideally, we should discuss our requirements and what people want to see. Mandating a mechanism that the moderators like but is disliked by everyone else should be avoided.
  - The goal is to make it more systematic than "copy-pasting the agenda, look into issues and PRs"
  - The process for generating features from use cases should be taken into account
  - We can use a tool like GitHub Projects. A premature example is available at https://github.com/orgs/w3c/projects/31
- Mahda Noura: Only assigning an issue is not enough, because the number can increase and we can lose oversight/prioritization.
- Cristiano Aguzzi: Assigning should happen when you know that person can do it in 1-2 weeks.
- Jan Romann: Splitting issues definitely helps. We should limit the workload of an issue in the beginning or use checkboxes per small item and open a "spinoff" issue.
- Kazuyuki Ashimura: We should think of what we have been doing so far.
