# WoT Project Management Process

> [!NOTE]
> Proposal Status: Accepted

The main question to answer is "How do we organize the work?".
We want to have one place to look for the list of "work" to do in a short period.
To do that, a prioritization should happen and should be aligned with user stories, use cases, and requirements.
This allows us to limit the load of a person per 1-2 week time frame and thus prioritize certain issues/topics.

## Current Process

- We have a table in a GitHub project managed by the TD TF. See <https://github.com/orgs/w3c/projects/80>
- Once the TF is comfortable with the approach, no other information is needed. Until then, the lifecycle diagram below represents how the work goes through over time.

![lifecycle](./lifecycle.drawio.png)

- **Step 0:** An issue shows up. It can be using the user story template or the blank template.
- **Step 1:** Depending on whether the issue is a user story or not, a different path is taken.
  1. **Right Path:** If the issue is a user story, it needs to be checked whether or not it is a complex one that requires thorough analysis.
  2. **Middle Path:** If the issue is about TF tasks or simple fixes, it will be handled by the TF participants based on the category.
- **Step 2:** If the user story is complex to realize, it needs a thorough analysis. Other related issues, user stories, or previous discussions can make it difficult to specify the feature with a single Pull Request. These are typically significant features.
- **Step 3:** An analysis document is created following [the template](../../planning/work-items/analysis/analysis-mytopic.template.md).
- **Step 4:** The issue is assigned to one or more persons based on who is most suited, has more motivation etc. but not based on their availability.
- **Step 5:** Based on people's availabilities and priorities set by the TF and WG as a whole, the issue is moved to "in progress". This indicates that this issue is being addressed by one or more persons and is part of the agenda until resolved.
  - Note: We need further discussion on how we prioritize items.
- **Step 6:** The result of the work happens in one or more Pull Requests to the Editor's Draft. In that stage, the issue is moved to "In Review". The Pull Request(s) can be merged asynchronously based on agreement in the [WG Policy](https://github.com/w3c/wot/blob/main/policies/async-decision.md). Once it is merged, it is part of the Editor's Draft, and the issue is closed and removed from the board.
- **Step 7:** Based on the nature of the change , it can require implementations to demonstrate implementability.
  - **Step 8:** If the change is an RFC assertion, we need to show its implementability before it can be in the final REC.
  - **Step 9:** If not, it can be in the REC without any further effort. Note that in both cases the WG needs to reach consensus or in the case of REC-track documents, the entire W3C needs to support it as part of the deliverable.

The lifecycle is also reflected in a table below. The example below can be considered a snapshot of the project management process.

![kanbanidea](./kanbanidea.drawio.png)

- New issues come on the "Unsorted" column. Here we see Issue 21.
- After categorization, an issue can get corresponding labels and placed in "Categorized - Not assigned" column. This means that someone from the TF had a look at the issue and put the corresponding labels.
- We see that a person can get assigned to an issue since they are the best fit (more expertise, more motivation etc.) but is not necessarily doing it right now, shown in column "Assigned". Since Person2 has less availability, they are working only on Issue 10 while Issues 7 and 9 are on hold.
- Person1 has more time and is working on Issues 5 and 6 as indicated in column "In Progress", while having assigned Issue 4 as well.
- Issues 11 and 13 are currently under review and have an associated Pull Request.
- Issue 1 is in the parking lot since it is not being actively discussed after some initial discussions.
- Once an issue is closed, it is moved to "Done" column which is hidden from view.

## To Do

- Create issue templates for necessary items
