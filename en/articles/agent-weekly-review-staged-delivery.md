# We Spent an Entire Evening on a Weekly Report—Why Was the First Deliverable Still Missing?

*An AI-agent engineering retrospective: designing the whole solution is not the same as implementing the whole solution at once.*

## 1. We Only Wanted the Agent to Write a Weekly Review

In October 2026, we set out to add a seemingly straightforward capability to ETF Agent: produce a weekly review of a user's existing fund portfolio.

The point was not to list price movements. After reading the report, the user should understand what changed, whether portfolio risks had shifted, what deserved attention, and whether further research or portfolio decisions were warranted.

Ideally, the report would be an HTML document, readable on a phone, with meaningful charts and traceable data. The conversation itself would show a short conclusion.

But once we started designing it, “summarize the portfolio each week” became a much larger proposition.

A weekly report seemed to require history. History suggested comparisons across periods. Comparisons suggested saving previous investment views and tracking how those views evolved. Weekly recurrence suggested subscriptions. Subscriptions implied notifications, cancellation, and retries. Delivery raised additional questions about HTML generation, mobile layouts, printing, file persistence, and download access.

Each requirement was defensible in isolation.

We discussed a fairly comprehensive product design and produced a large specification spanning many scenarios, components, and acceptance paths.

That was where the trouble began.

## 2. An Evening Later, We Were Still Building the Periphery

Implementation was not standing still.

We worked on research methods, a fixed HTML renderer, file storage, historical eligibility, evidence handoffs, presentation quality, and several failure paths. Focused tests accumulated, and some components could work independently.

But after an evening of development, we looked again at what the user originally wanted and had to acknowledge something uncomfortable:

**We had spent considerable effort making the weekly-report system more complete, but the agent still could not autonomously deliver its first report through the normal entry point.**

History, subscriptions, security, and mobile usability were not unimportant.

We had simply failed to distinguish two kinds of work:

Work **without which the first report could not be delivered**, and work that would make the product better **after a first report was already possible**.

Both mattered. They did not deserve the same implementation priority.

The original large specification grouped these capabilities under one broad task and acceptance story. An unfinished peripheral mechanism could therefore make the entire effort feel unfinished.

Worse, peripheral work generated further dependencies. Historical comparisons demanded better evidence coverage. Evidence handling led to versioning. Versioning led to recovery. Visual problems led us deeper into the renderer.

**A specification can be logically coherent and still have the wrong delivery order.**

The execution power of coding agents can amplify the problem.

When a peripheral feature used to take days, its cost gave us time to reconsider priorities. A coding agent can now continue creating modules, adding tests, and extending protocols for as long as the task list remains nonempty.

It does not inherently know that **making progress through a plan and bringing the user closer to a usable result are no longer the same thing**.

## 3. The Turning Point Was Redefining the First Result

On October 20, we narrowed the first phase.

Instead of delivering the complete weekly-review product in one effort, we made the first milestone concrete:

> The user starts a normal CLI command. The agent acquires authorized data, produces a report, saves an HTML file, and returns a link to a file that can actually be downloaded.

This sounded much smaller than the original plan.

It was also a stricter claim.

Several seemingly plausible substitutes no longer counted:

- The model said a report had been generated, but no file existed.
- Python rendered HTML, but the file was never persisted.
- A test assembled the answer in advance, silently performing the agent's work.
- A developer corrected parameters or supplied a file by hand before declaring autonomous delivery.
- The server saved the file, but a normal download request could not retrieve it.

We first required a genuinely generated, saved, and downloaded offline file, establishing the delivery path without relying on a language model. Only then did we ask a real model to use the same capability through the normal application entry point.

Long-term history, cross-period comparisons, subscriptions, investment-thesis management, and fine visual polish were no longer conditions for completing phase one.

They were not cancelled. **We withdrew their power to block the first usable result.**

The first HTML report could be plain, and unavailable research data could be described honestly. But real permissions, evidence identities, file safety, and execution facts still had to be preserved.

**Reducing the scope of a deliverable must never mean removing protections required for that deliverable to be correct and safe.**

## 4. HTML Revealed That Some Capabilities Did Not Belong to Weekly Reviews

Narrowing the scope revealed an even deeper architectural mistake.

We had built a relatively specialized route for weekly reports: a fixed research method, a Python renderer, dedicated HTML generation, and delivery wiring.

Templates do have advantages. Their output is consistent, and deterministic checks are easier to write.

But real research runs revealed the cost.

The model could acquire the data but confuse a result hash with a tool-call identifier. It could try to export a workspace path that did not exist. Or it could spend a long time computing and rendering through Python without ever delivering a file.

In another set of real delivery attempts, five HTML artifacts had been saved, and links appeared in the final answer, yet all five authenticated downloads returned HTTP 404.

Those failures were not merely about presentation quality.

They raised a more fundamental question:

**The weekly review has a specialized research method. Why should it also own a specialized file-delivery infrastructure?**

Why did a weekly report need a separate file-storage protocol? Why should HTML written directly by a model and HTML generated with Python follow different delivery contracts?

We extracted the reusable HTML generation, storage, and download path from the weekly-report-specific implementation.

The resulting flow is simpler to describe:

1. The agent performs research and organizes the content.
2. Depending on the task, it writes HTML directly or uses Python for necessary calculations and repeated markup.
3. Both routes use the existing content preparation, provenance handling, artifact storage, and authorized download capabilities.

The model chooses an appropriate form of expression. Existing domain producers supply reliable numerical facts. Publication owns content preparation; the artifact service owns stored bytes and access boundaries.

We no longer required every report to pass through a weekly-only renderer. Nor did we introduce a universal HTML router or another presentation DSL as a replacement.

This mattered more than moving tasks between milestones.

**Staged delivery can uncover a misplaced ownership boundary: a capability that looked like part of a product feature may actually be reusable infrastructure.**

The weekly-report skill could focus on the research method, while HTML delivery became useful to other research tasks.

## 5. What Did the Three Phases Actually Deliver?

We reorganized the work around independently usable results, rather than the order of chapters in the original specification.

| Phase | Independently usable result | No longer a blocker for that phase |
| --- | --- | --- |
| **Phase one: first report** | One normal command runs the research, saves HTML, and provides a working download | Historical comparisons, subscriptions, complex thesis management, comprehensive quality improvements |
| **Phase two: continuing reviews** | Qualified history, cross-period comparison, retention and deletion, history retrieval, and basic usability | Subscriptions and notices, further thesis versioning, depth optimization |
| **Phase three: ongoing assistance** | Bounded scheduled execution, task history, notice preferences, investment theses and user corrections, more flexible research depth | A new trading engine, a duplicate scheduler, and claims of model semantic quality outside the Runtime's authority |

Reusable HTML delivery was not a “fourth weekly-review phase.” It was a horizontal capability we discovered inside the original use case.

The split also required a less visible but crucial action:

**We changed the current scope, task list, and acceptance conditions, while handing the deferred work, existing evidence, and failures to their proper later phases.**

Writing “MVP first” in a proposal, while leaving the original task queue and completion gate untouched, would not have been a real split. It would merely have given an oversized specification a new label.

We also avoided moving nearly finished phase-two work purely for tidiness. A separate phase was justified by an independently deliverable result, ownership, and acceptance lifecycle—not by dividing tasks evenly into three groups.

## 6. After the Split, Delivery Became Something We Could Demonstrate

On October 20, the shared HTML route yielded a much clearer engineering result.

Normal CLI executions produced saved-file download links, and authenticated downloads returned content matching the stored records.

We could finally say something precise:

**The main file-delivery path needed for the first report had been observed working through a normal entry point.**

We did not claim that the investment research itself had passed a quality assessment.

A file can exist and download correctly while its analysis remains shallow. One completed report does not show that an agent can handle every complex variation reliably.

Phases two and three later completed their separately declared Runtime engineering acceptance scopes. Those results do not prove long-term product value for recurring research, or that the model consistently makes sound investment judgments.

Separating these outcomes made progress more credible.

Previously, a peripheral failure could leave the entire project labelled unfinished. We could now ask distinct questions: Can the first file be delivered? Can history be retained and read correctly? Does a scheduled task respect confirmation and cancellation? What has actually been demonstrated about the quality of the research?

Different questions need different evidence. They should not borrow each other's successes.

## 7. How We Tried to Prevent the Next Oversized Spec

The important outcome was not that we split one weekly-review project into three phases.

**We also changed the existing specification-driven development workflow used by our coding agents.**

Without that change, the next ambitious task could repeat the same cycle: plan ten modules, spend another evening on peripheral systems, and only then rediscover the original user request.

We folded the lessons into the existing workflow rather than creating a new “staging approval system.”

### First, Define the First Deliverable During Design

Previously, we often began with features: what to support, which modules were needed, and how to test each one.

For a complex request, we now ask much earlier:

**What is the earliest genuinely usable thing we can give the user?**

It might be a report, a downloadable file, a calculation, or a completed business operation.

Once that result is defined, the necessary dependencies become much easier to distinguish.

For our weekly review, historical comparisons were not needed to produce the first report. Neither were subscriptions or full investment-thesis versioning.

Authorized data acquisition, actual file generation, persistence, and a working download were necessary.

The specification should therefore name the initial artifact and the evidence that would show it really exists—not merely provide an exhaustive feature list.

### Second, Design Broadly but Do Not Implement Every Phase Early

We did not adopt the opposite extreme: discussing only phase one and refusing to consider the future.

Some boundaries need early attention—permissions, data identity, durable compatibility, and future constraints that would otherwise force expensive rework.

It is reasonable to discuss the whole architecture.

But **discussing a future capability does not commit the current phase to implementing it**.

The active task queue contains only the dependencies needed for its deliverable. Later phases may preserve goals and key compatibility constraints without immediately creating databases, services, protocols, and test frameworks.

Even if several coding agents can work in parallel, they should not automatically build every peripheral module.

Parallel execution improves throughput. It does not determine the order in which value should be delivered.

### Third, Give Each Phase a Real Task Queue and Acceptance Boundary

This lesson came directly from the weekly-review split.

When staging is genuinely needed, each phase must be able to answer:

**What will this phase deliver? What does it depend on? What is explicitly out of scope? What would prove that it is complete?**

Implementation follows the dependencies of that deliverable—not the order of sections in the original design document.

If the scope narrows, the current tasks, plan, and acceptance promise must change with it. Deferred work leaves the current completion conditions but retains a later owner and its accumulated evidence.

We cannot say “deliver first” while continuing to execute the original enormous checklist.

Nor may completion of one phase be presented as completion of the whole product.

### Fourth, Review Whether a New Mechanism Is Needed at All

Even after a phase becomes small, a coding agent can keep inventing new modules to address local failures.

We therefore reuse the original four design questions:

**Who owns the facts? Who has decision authority? What happens when something fails? What value does the new mechanism actually add?**

If report generation fails, examine the existing generation and storage contracts before introducing a dedicated Report Manager, Repair Agent, or another flow controller.

This discussion does not require a new form or a separate automated complexity score.

The aim is better architectural judgment, not more ceremony.

### Fifth, Verify the Real Delivery Path and Stop When the Question Is Answered

For a weekly report, a stored file is not proof of a successful download; a local test is not proof that the agent autonomously delivered it.

Phase one therefore required a path from the normal entry point to a real, retrievable file.

At the same time, delivery mechanics and model research quality remained separate questions.

A narrow interface change needs focused regression checks. A claim about the model's research behavior needs appropriately scoped real-model observations.

Once there is sufficient evidence for the stated scope, entering another documentation phase should not automatically rerun the same tests.

**Verification should answer a specific question, not create an endless reason for more verification.**

### When Should This Approach Be Used?

We do not split every task by default.

A small, well-defined change that can be delivered in one pass should remain small.

Staging becomes worth considering when a specification contains several independently usable outcomes, peripheral capabilities start delaying the central result, or a single acceptance commitment becomes too broad to evaluate clearly.

There is no mandatory number of phases, tasks, or pages.

**The goal is not to make every project procedural. It is to establish the right delivery order when a complex request first enters design.**

Splitting the weekly review into deliverable phases is a direct use of [method 4, “Planning a multi-phase delivery”](/en/principles#method-4): establish the first report the user can receive, then introduce subscriptions, history and richer HTML only when necessary. Peripheral designs should not become hidden prerequisites for the initial result.

## 8. What Changed in Our Idea of a Complete Design

Thinking through the full solution was not the mistake.

Historical continuity, subscriptions, long-term investment theses, and recovery all deserved consideration. Anticipating constraints that would otherwise create rework was useful.

The mistake was subtler:

**We treated everything worth considering during design as something that had to be finished in the first phase.**

A complete design and staged implementation are compatible.

Design can look toward the whole product. Implementation should move toward the first result the user can actually obtain. Future phases need clear boundaries and necessary constraints, not premature scaffolding.

When the first useful outcome can be reached through a smaller complete path, the eventual product should not continuously determine whether today's work may be delivered.

The weekly-review experience left me with one sentence:

**Think through the whole solution so you do not head in the wrong direction tomorrow. Build around the first deliverable so you can reach a result today.**

Embedding that judgment in our development workflow means the next coding agent should not need another entire evening of peripheral work to remember what the user originally asked for.


## Further Reading

This experience complements [Moving Beyond the Bug-Fixing Loop](https://hpoenixf.com/eff-agent-article/en/articles/032-ai-development-from-bug-loop-to-task-convergence), [Why Saved HTML Can Still Fail Delivery](https://hpoenixf.com/eff-agent-article/en/articles/agent-html-evolution-challenges), and [Specs and Evidence in Agent Engineering](https://hpoenixf.com/eff-agent-article/en/articles/026-agent-spec-evidence-workflow). A companion essay, [Why Retired Engineering Knowledge Still Directs Coding Agents](https://hpoenixf.com/eff-agent-article/en/articles/027-agent-context-document-history), addresses the other half of long-term engineering evolution.

Explore the [ETF Agent Engineering Notes](https://github.com/hpoenixf/eff-agent-article). If these case studies are useful, consider giving the project a **Star**.
