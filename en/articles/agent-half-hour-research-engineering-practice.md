---
description: "What changes when ordinary research becomes a long-running task? Follow a three-fund comparison through concrete integration steps for request assembly, budgets and finalization, material rereading, checkpoints, and report revisions, with links to the existing implementation guides."
articleMetadata:
  author:
    name: "hpoenixf"
    url: "https://hpoenixf.com/about"
readingBrief:
  takeaways:
    - "Long-running research retains the ordinary reasoning-and-tool loop, while adding demands around accumulated material, task continuity, interrupted execution, and report convergence."
    - "The model owns research strategy and semantic judgment; the runtime owns permissions, execution facts, resources, and durable effects. One loop connects them."
    - "Bound exploration and protect finalization capacity in advance so that available material has an opportunity to become an accessible answer."
    - "Organize original requirements, retrievable evidence, working summaries, and recent exchanges separately. Summaries cannot rewrite user restrictions or execution facts."
    - "Background execution, checkpoints, and report versions preserve existing work. Interruptions settle or resume through supported paths; answer quality still needs separate evaluation."
  appliesTo:
    - "Developers with model and tool integration who are designing research lasting tens of minutes, including failure handling and answer delivery."
  notFor:
    - "A complete framework installation tutorial, or treating longer execution and more calls as guarantees of answer quality."
---

<script setup>
import { withBase } from 'vitepress'
</script>

<span id="engineering-half-hour-agent-research-from-execution-budgets-to-a-complete-report"></span>

# Designing Half-Hour Agent Research: From Ordinary Research to Reliable Delivery

When a user asks for a fund's management fee, an agent can usually find the official terms, check the share class and effective date, and answer.

Consider a different task:

> Compare funds A, B, and C on fees, tracking performance, and sector exposure. Use the latest available official disclosures, explain differences and data limitations, and give me a report we can discuss further. Do not execute trades.

This requires repeated retrieval, reading, calculation, and cross-checking. If a disclosure covers a different period, the agent must inspect the original and revise earlier judgments. The user may leave the page, material may outgrow the context window, and a source may become unavailable.

The design must answer two questions: **How does repeated work stay aligned with the original task? When material, resources, or execution cause problems, how is existing work preserved and turned into an answer?**

We will use this three-fund comparison to develop the design from the top down. The funds and task are teaching simplifications. Mechanisms draw on ETF Agent's private implementation and records checked as of November 12, 2026. Local experiments come from different tasks; the public teaching repository does not necessarily contain all capabilities. Half an hour describes the task's scale, and research can finish earlier.

## 1. What changes from ordinary to long-running research?

Both can use the same basic loop: the model chooses a step, tools return observations, and the model decides what follows. Additional design pressure comes from accumulated work and the greater number of places where execution can be interrupted.

| Dimension | Common in ordinary research | Additional demands in long-running research |
| --- | --- | --- |
| Problem solving | A few sources suffice, with short dependency chains | Subquestions affect one another; new evidence changes the direction |
| Context | The question and main material usually fit together | Material and process history grow; residency and exact rereading need management |
| Resources | A fixed allowance often suffices | Exploration, summaries, delegation, and writing compete for resources; protect finalization |
| Lifecycle | An online user can wait for the result | Page disconnection, parking, and process interruption require durable task and execution facts |
| Output | Verification leads to one reasonably complete answer | Later evidence revises tentative findings; maintain a coherent current report |
| Verification | The full input-to-output path is easier to inspect | Inspect actual consumption, accounting, recovery, and final reasoning across the chain |

This is not a strict classification by minutes. A ten-minute task may need recovery, while a long calculation with fixed material and simple dependencies may not need working summaries. The conditions determine the design.

A longer timeout addresses only part of this. Delivery also needs three protections: the next turn knows what to do, completed work survives, and resources remain to organize an answer. The system can make those stages more controllable; correctness needs separate review.

Start by running the same three-fund task through the existing agent. Keep the original question, actual requests, and retrievable report. Inspect three points: whether later requests retain the full comparison requirements, whether accumulating material produces repeated reads, and whether execution ends with saved, readable text. This baseline identifies which seam to improve first. The steps below extend the existing research path; linked articles explain each mechanism in detail.

## 2. Define the deliverable, then assemble the architecture

Work backward from the report. The comparison needs at least four parts:

1. **Scope:** products, share classes, data periods, and disclosure dates.
2. **Comparison:** fees, tracking performance, and sector exposure on comparable terms.
3. **Explanation:** differences attributable to products, calculation conditions, or disclosure timing.
4. **Findings and gaps:** supported judgments and questions that remain unanswered.

This outline guides research. If A uses a quarterly report and B an older annual report, inspect B's official disclosure before subtracting values. The report's needs guide what is worth obtaining next; the model still adjusts tool order as evidence arrives.

The system can divide responsibility as follows:

| Responsibility | Owns | Handoff |
| --- | --- | --- |
| Task entry | Original requirements, user additions, initial authorization | Accurate task and applicable restrictions |
| Main model | Decomposition, methods, interpretation, report composition | Proposed next operation or delivery |
| Research runtime and tool execution | Call sequencing, permission and resource enforcement, execution records | Retrieved content, failures, or unknown outcomes |
| Durable records and recovery | Execution position, result locators, consumption, settled effects | Read saved results and handle continuation under the existing recovery contract without repeating execution |
| Report publication | Stored, accessible answer versions | Current report and existing results for the user |

These responsibilities can share one process and reuse existing entry points and storage. They do not require five services or another unified planner.

<figure>
<picture><source media="(max-width: 700px)" :srcset="withBase('/diagrams/half-hour-research/research-loop-en-mobile.svg')" /><img :src="withBase('/diagrams/half-hour-research/research-loop-en.svg')" alt="Original requirements enter model requests. Tools return observations to the next turn; proposed answers use the original publication owner and become retrievable after commit." loading="lazy" /></picture>
<figcaption>Figure 1 · Complete one loop first: observations return to the model, answers use the publication path. <a :href="withBase('/diagrams/half-hour-research/research-loop-en.svg')">Open full diagram</a></figcaption>
</figure>

**The model owns research judgment; the runtime owns execution facts.** The model can identify missing evidence. Code can establish whether a tool executed, what it returned, and how much capacity remains. Keywords should not certify research sufficiency, and the model's claim that a calculation is complete cannot replace a calculation receipt.

Preserve the original user text independently. “Do not execute trades” must survive summarization, and “latest official disclosure” must not become “real-time holdings.” Later reasoning needs an accurate task basis.

### Begin with three existing integration seams

Do not start by splitting services. Locate these three points in the existing project and connect them under the same task identity:

1. **Model-request assembly.** Read the original user text, additions, and current work state from existing conversation and task records on every turn, rather than supplying requirements only in the first request.
2. **Tool settlement.** Save call identity, arguments, actual result, source locator, and known success, failure, or unknown status before feeding usable observations into the next turn. Keep proposed calls distinct from completed execution.
3. **Answer save and read.** Send generated text to the existing publication owner. Page and history readers consume the same committed version, rather than relying on a temporary streaming preview.

Verify a short path first: read A's fee, save a fee section, and retrieve it after refreshing the page. Then expand to all three funds. For first-input assembly and checking the request actually dispatched, see [the task-preservation and initial-view sections of the context-governance implementation guide](./agent-context-governance-actions.md#_1-preserve-the-task-before-choosing-the-first-input).

## 3. How does the loop advance—and recognize an opportunity to finish?

A minimal loop has five steps:

1. **Prepare input:** original requirements, applicable additions, working summaries, material locators, recent exchanges, and actual remaining resources.
2. **Let the model choose:** read, calculate, verify, or propose delivering the current result.
3. **Execute and record:** call tools within existing permissions and budgets; preserve actual content, identity, and status.
4. **Return observations:** new evidence or failure reasons enter the next request, allowing the model to revise its research questions.
5. **Continue or finish:** the model judges the next step's value and answer scope; the runtime handles cancellation, resources, execution termination, and publication facts.

A possible path obtains basic material for all three funds, notices B's sector disclosure covers the wrong date, retrieves its quarterly report, and compares consistent periods. If the original remains unavailable, the model can try another authorized source or retain a gap.

Each turn should add material, resolve a disagreement, complete a calculation, or narrow the answerable scope. The model decides whether further work is useful from observations. The system supplies clear resource usage, failure reasons, and available material. Ten searches do not establish sufficiency; twenty remaining minutes do not require more searching.

### Represent next steps as revisable research questions

Use existing work state to retain the questions the model currently needs to resolve. ETF Agent already has `researchNeeds` and `set_research_needs`. A note might contain the following; this is teaching content, not the tool's argument schema:

```text
Fees: A and C verified; B's share class still needs confirmation.
Tracking: comparable benchmark data is missing; do not rank all three yet.
Sector exposure: B's page uses an old disclosure; read the official quarterly report next.
Delivery: organize confirmed fees, then synthesize comparable findings and gaps.
```

After obtaining B's new report, let the model revise the affected questions and include that note together with the actual read result in the successor request. If the user adds “please explain tracking error,” preserve the exact addition and let the model update its questions. Replacing a plan must not delete the original comparison requirements.

Verify the successor request contains the original task, latest addition, B's new material, and unresolved questions. Review the next choice separately; a note marked complete does not certify completion. See [working notes versus execution receipts](./agent-context-governance-actions.md#working-notes-describe-questions-receipts-describe-execution) for their division of responsibility.

### Hand off a new requirement while a request is running

Suppose a model request is already in flight when the user adds “compare only matching disclosure periods.” Preserve the exact message, target research identity, and correction revision first. A transmitted request cannot acquire that content retroactively; the next admitted model request receives it.

Separate three cases: stop obsolete proposals that have not dispatched at the original safe boundary; preserve completed calls and their actual results; retain unknown status and consumption for dispatched calls with unresolved outcomes. The original operation owner may attempt to interrupt an older request, but a request-local interruption must not become a user stop of the entire research Run.

Exercise this branch explicitly: interrupt an old request because a correction supersedes it, then check that its successor can be admitted in the original research phase and continue reading. Explicit stop and real deadlines retain their original handling. Readmission does not reset usage or blindly replay unknown requests. Record handoff only when the full correction reaches the successor request; inspect the report separately for matching-period comparisons. The [background-research interaction guide](./agent-background-research-collaborative-experience.md#_3-adjustment-received-is-not-research-adopted-the-adjustment) explains targeted additions versus independent short questions.

<figure>
<picture><source media="(max-width: 700px)" :srcset="withBase('/diagrams/half-hour-research/correction-handoff-en-mobile.svg')" /><img :src="withBase('/diagrams/half-hour-research/correction-handoff-en.svg')" alt="Save the exact targeted correction, distinguish undispatched, settled, and unknown work, and adopt the full message in the next admitted request while preserving explicit stop." loading="lazy" /></picture>
<figcaption>Figure 2 · Corrections hand off at request boundaries; one superseded request is not a stopped Run. <a :href="withBase('/diagrams/half-hour-research/correction-handoff-en.svg')">Open full diagram</a></figcaption>
</figure>

### Delegate independent questions; retain synthesis in the main model

First make one main loop complete the task. Introduce subagents when fees, tracking performance, or disclosure discrepancies can genuinely be investigated independently.

Specify the question, scope, and expected return. For example: “Check B's latest sector disclosure; return its date, source, distribution, and unresolved points.” The main model still needs to read, compare, and integrate that result.

Observe the entire handoff: child completion, result storage, inclusion in Main input, and correct use in the report. These facts are distinct. Parallel investigations can widen coverage but cost requests and synthesis effort. A single model is often simpler for tightly connected questions.

Start with one delegated disclosure check for B. Request the date, share class, sector classification, original-source locator, and unresolved points. Check that Main receives those conditions, then inspect the report for use of the wrong date. The [Subagent article's worked collaboration example](./agent-subagent-context-specialization.md#_4-one-fund-research-question-across-the-whole-collaboration) explains decomposition and handoff. Complete this one handoff before adding parallel branches.

<span id="_1-give-research-room-to-work—and-room-to-finish"></span>

## 4. Protect delivery with explicit budgets and finalization reserves

Long research needs execution room, bounded consumption, and an opportunity to write.

Distinguish per-model or per-tool deadlines, active execution time for the research, and total elapsed wall time. Account for overlapping activity using actual intervals. Waiting and parking have different meanings; the current process's lifetime cannot stand in for time already used.

For new ETF Agent Runs, the current default active-time limit is 60 minutes, the Deep target is 90 minutes, and the wall-time safety limit is 120 minutes. Older Runs retain their admitted policy, while other quotas or deadlines may constrain execution sooner. These values describe available room, not required duration or universal defaults.

<figure>
<picture><source media="(max-width: 700px)" :srcset="withBase('/diagrams/half-hour-research/time-bounds-en-mobile.svg')" /><img :src="withBase('/diagrams/half-hour-research/time-bounds-en.svg')" alt="Research is constrained by per-operation boundaries, overall execution budgets, and finalization reserves. Enlarging one allowance does not remove the other limits." loading="lazy" /></picture>
<figcaption>Figure 3 · Exploration and finalization share the original budget. Leave room for composing the report from the start. <a :href="withBase('/diagrams/half-hour-research/time-bounds-en.svg')">Open full diagram</a></figcaption>
</figure>

<span id="exploration-must-leave-an-opportunity-to-write"></span>

Request accounting must include Main, summaries, and subagents. Exploration cannot consume protected delivery capacity; the main model needs dedicated finalization opportunities. Near a boundary, communicate actual remaining resources so it can abandon lower-value exploration and answer from available evidence.

For example, fees may be verified and sector exposure comparable with dates stated, while part of B's historical series is missing. Organize the answerable parts and state the tracking comparison's coverage. A limited result can still serve the original task.

<span id="a-running-loop-must-actually-adopt-an-approved-upgrade"></span>

If mid-Run upgrades are supported, the original budget owner records one change. Admission, the loop, timers, and reminders consume the same effective revision. Spent, reserved, and unknown usage remains; a lost acknowledgement leads to reading that record rather than multiplying allowances again. Fixed tasks can start with a shared fixed budget and add upgrades when actually needed.

### Integrate accounting first, then exercise finalization

Inspect current configuration and accounting: where Main, summary, and Child calls are charged, who accumulates time, and who protects delivery reserves. Keep the original allowances. Request admission and model input should read the same effective resource state; avoid another small outer cap that interrupts execution early.

Connect the existing finalization path next. Once exploration opportunities are exhausted, stop adding exploration while allowing finalization calls admitted by the resource owner. Provide existing material, current text, and gaps to Main. If the final model call also fails, expose committed results and retain the failure; do not label an ungenerated answer delivered.

In a controlled engineering test, construct an exhausted exploration allowance with finalization capacity remaining. Observe whether searching stops, the existing finalization entry is used, and actually generated text is saved. Real-model evaluation retains its authorized ordinary configuration rather than manufacturing success with a temporary smaller allowance. The [Deep implementation chapter](./agent-deep-research-resource-and-delivery.md#_2-how-it-works-inside-the-existing-runtime) covers upgrade entry points, shared accounting, and successor-request integration.

Do not diagnose this from one requests-remaining number. Ask how much physical model-request capacity remains, how many research or finalization opportunities the current phase allows, and whether deadlines and input capacity permit the next call. These are different views of existing resource records, not three independent budgets.

For example, two confirmed publication turns may release their own dedicated finalization units while their actual model calls remain charged. A neighboring unknown request must not receive a refund with them. Bind settlement to the original request and its owner's exact receipt rather than releasing nearby occupancy merely because `send_answer_part` appears. Historical implementation checks established this distinction, not a guarantee that every real task can finish within its remaining opportunities.

Add two controlled cases: aggregate capacity remains but the current phase has no opportunity, and finalization calls remain but the hard deadline has passed. Check that the first explains the actual reason and the second stops new calls while exposing committed results. Passing an inner counter check does not establish admission under outer deadlines and provider capacity. See the [budget-governance finalization section](./agent-runtime-constraint-governance-v2.md#_5-reserve-finalization-at-admission-including-bounded-corrections).

<figure>
<picture><source media="(max-width: 700px)" :srcset="withBase('/diagrams/half-hour-research/budget-views-en-mobile.svg')" /><img :src="withBase('/diagrams/half-hour-research/budget-views-en.svg')" alt="The original resource owner checks physical request usage, current-phase opportunities, deadlines, and input capacity at actual request admission." loading="lazy" /></picture>
<figcaption>Figure 4 · Aggregate balance, phase opportunities, and hard bounds jointly constrain the next call. <a :href="withBase('/diagrams/half-hour-research/budget-views-en.svg')">Open full diagram</a></figcaption>
</figure>

<span id="_3-externalize-results-without-emptying-the-working-desk"></span>

## 5. Manage material and process history to preserve direction

Tool text, calculations, and analysis accumulate. Organize the next input by purpose:

| Content | Treatment | Example |
| --- | --- | --- |
| Original requirements and additions | Preserve exact text independently, in applicable order | Comparison dimensions; no trades |
| Evidence and calculation results | Preserve identity, version, and locator for rereading | Quarterly report, sector distribution, calculation inputs |
| Working summaries | Describe completed work, tentative findings, conflicts, and next steps | B's page was outdated; quarterly report acquired; classification still needs alignment |
| Recent complete exchanges | Retain current calls with corresponding results | Latest read and subsequent analysis |

This organizes input; it does not require four new storage systems.

### Externalize material without emptying the working desk

Store full pages, long tables, and PDFs outside model context, with locators readable through the original entry point. Include passages or fields needed now. Older text can leave the working set and return through exact rereading when a dispute arises.

For sector comparisons, retain disclosure dates, classifications, and weights together. To verify a number, read the corresponding version and page. Results must state actual coverage; a file reference does not establish full reading. Small results need reliable locators too, so their accumulated text can eventually leave context.

Start at the result producer. After acquisition, the Host stores the authorized view and issues its `resultRef`; model-visible output retains the actual selection and coverage. Only then may successor-request assembly replace eligible older text with its original reference. The existing `read_tool_result` entry lets the model reread fields, records, or text ranges from that version.

Exercise this with one of B's sector tables: acquire the text, let it leave the working set, and reread the original reference. Check that the date, selected records, and coverage match. Inspect the final dispatched request too, so that later adaptation has not discarded the reread text. [Why tool results should not all enter model context](./tool-results-outside-model-context.md#a-desk-does-not-need-to-hold-the-entire-archive) gives concrete storage, catalog, and selected-read examples.

<span id="an-attempt-that-made-the-working-set-too-small"></span>

An undersized working set also has costs. ETF Agent encountered repeated rereading with a 96KiB target. At 192KiB, a real model completed one synthetic eight-document teaching task in six requests and actually converted older text to references. This supports that sample, not a universal optimal capacity. Observe whether the next judgment has enough material and how much rereading costs.

<span id="_4-a-summary-must-reach-the-subsequent-work"></span>

### Summarize the process; preserve original facts

Summarize complete, settled history intervals to retain progress, conditional judgments, and remaining questions. Keep calls paired with results. Repeated summaries cover different original intervals rather than recursively summarizing earlier summaries. Original requirements, receipts, and material are not delegated to summaries for rewriting.

<span id="allow-a-possible-improvement-then-measure-the-actual-one"></span>

Compose the next complete request with the actual summary, then check real reduction and provider hard capacity. Useful partial improvement can be adopted; a soft target need not be reached in one step. Summary requests use configured request capacity and known provider limits, count toward original usage, and leave original context intact on failure. Avoid unlimited attempts to obtain a summary.

Implement reference-only projection first, then connect compaction when the complete request still faces capacity pressure. ETF Agent retains the two most recent complete turns and selects only consecutive older groups with durable, settled calls and results. The summarizer receives eligible work trajectory; original user requirements and execution receipts remain with their existing records. Adoption saves the source interval, summary, and successor projection, so later assembly consumes the committed record instead of generating that summary again.

Check that old calls stay paired with results, the actual successor request includes the summary, and disputed numbers can still be verified against original material. The [context-compaction algorithm](./agent-main-run-context-compaction.md#the-algorithm-select-by-rules-summarize-with-an-llm-retain-originals) explains selection and adoption without requiring another compactor here.

<figure>
<picture><source media="(max-width: 700px)" :srcset="withBase('/diagrams/half-hour-research/summary-handoff-en-mobile.svg')" /><img :src="withBase('/diagrams/half-hour-research/summary-handoff-en.svg')" alt="Settled history produces summaries adopted by subsequent requests and preserved in a checkpoint; original requirements, receipts, and result locators remain separate." loading="lazy" /></picture>
<figcaption>Figure 5 · Summaries reach subsequent input while original requirements, material, and execution facts remain independently checkable. <a :href="withBase('/diagrams/half-hour-research/summary-handoff-en.svg')">Open full diagram</a></figcaption>
</figure>

<span id="how-do-we-know-it-was-used"></span>

Verify actual consumption. Two summaries from a real October 25 research Run appeared in 19 and 11 subsequent Main requests, respectively; a fresh process read the same checkpoint. One still misstated a period's meaning, while the original parameter remained intact. Adoption and correct interpretation need separate checks. Original records preserve a route back to the evidence.

Anthropic's [context-engineering article](https://www.anthropic.com/research/effective-context-engineering-for-ai-agents) also discusses compaction, external notes, and subagents. Choose according to the bottleneck: locators and rereading for large material; summaries for growing process history. Short tasks with sufficient context are often simpler with recent original text retained.

<span id="_5-keep-the-extended-task-working-on-the-same-question"></span>

## 6. Preserve work across interruptions

Authorized background research has a lifecycle independent of its page connection. Disconnection removes the subscription; an explicit stop follows cancellation. Reopening the page reads existing progress and saved reports.

Durable records must answer: “If the process disappears here, where does execution continue?” Reuse records for original requirements and additions, execution position, completed calls and results, material locators, summaries, consumption, and answer versions.

Recovery reads these facts first. Stored results do not require another execution just to rebuild context; saved text is directly available. Unknown actions remain with their original execution owner rather than acquiring a new identity and being treated as unattempted. The same Run inherits its recorded grant, and a new process does not reset usage.

An explicit follow-up research task is a new execution. It needs independent admission and authorized inheritance of the original question, restrictions, sources, and pending work. A parent-child link does not convey the question to the model; check actual successor input. Ordinary new questions remain independent.

Promise recovery only for supported paths. At this snapshot, settlement of unclosed activity intervals and recovery verification for certain Child/Peer wake paths after a crash were still being completed. Arbitrary lossless resumption is not established. Make stored results accessible, then verify the promised continuation paths.

### Connect save boundaries and interruption exits separately

Save at the original runtime's lifecycle boundaries: record the model proposal, let the action owner persist actual result receipts, then let the checkpoint record the next stage and necessary references. An earlier intention to read cannot override a committed completed read. The [checkpoint article's normal execution path](./agent-checkpoint-ownership-and-recovery.md#_1-the-normal-path-how-a-checkpoint-is-produced) describes this order.

Implement and verify three distinct exits:

1. **Page disconnection:** background execution continues; reopening subscribes to progress and reads the answer without a model call merely to restore the display.
2. **Ordinary process interruption:** the original recovery owner settles execution and preserves results. ETF Agent does not automatically reconstruct the entire old Root/Child graph. An explicit user continuation starts an independently admitted new Run with reusable original questions, material, and gaps.
3. **Existing legitimate control wake:** resume only the work allowed by the original wait, checkpoint, and execution identity. Finding an old Run is not sufficient to start execution.

Exercise page refresh, stopping an owned test executor, and replying through an existing wait separately. Check additional model requests, saved-report accessibility, and repeated dispatch of settled tools. [The disconnection classification](./agent-disconnect-is-not-crash-recovery-contract.md#_1-which-connection-actually-disconnected) explains these exits; success in one does not establish the others.

<span id="_2-longer-research-also-accumulates-service-side-computation"></span>

### Keep history processing affordable

The service must also remain responsive as history grows. Alongside model and tool duration, observe event-loop delay, history-processing time, and cancellation responsiveness.

In one ETF Agent lease failure, synchronous work blocked the event loop for roughly 30.4 seconds, while the lease query took about 1ms. Rebuilding proofs for the same candidate was the bottleneck. Reuse within one synchronous derivation reduced processing of a fixed 46-turn, 111-receipt snapshot from 27,887ms to 358ms, with matching relationship hashes. This is a local pure-function comparison, not end-to-end research acceleration.

Inspect repeated scans, serialization, and proof construction first. Extending leases delays recognition of dead executors; permanent caching risks stale facts. Consider worker threads if necessary computation remains heavy. The official Node.js [event-loop guide](https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop) explains why synchronous blocking delays other work.

<span id="_6-sustained-research-still-needs-a-coherent-report"></span>

## 7. Connect progress, reports, and limited finalization

During research, users need to understand progress. Afterward, they need a coherent answer. Organize these separately.

Progress might say: “Fees verified; aligning disclosure dates; one part of B's tracking data remains unavailable.” The report follows the earlier outline: scope, comparison, explanation, and gaps. Independently mature sections can arrive early; the model organizes dependent conclusions after comparing necessary evidence. No boolean sufficiency gate or mandatory elapsed-time fraction is needed.

<span id="apply-corrections-to-the-section-they-change"></span>

If B's fee later turns out to belong to another share class, revise the fee section and dependent judgments. Save the current version through the existing publication path while retaining version history. Users should read one coherent report rather than assemble errata themselves.

Revisions need capacity too. ETF Agent's Deep defaults increased from 2 corrections per block and 8 per Run to 6 and 24. Explicit configuration still wins; spent and reserved usage remains. More capacity provides opportunities to revise, not correctness guarantees; paired experiments did not show consistent improvement either.

### Show current text to the model, then revise by identity

Reuse the two existing paths: `send_research_update` for progress and `send_answer_part` for formal answer content. After a fee section is saved, the publication owner supplies its current block identity, revision, text, and omission information to the next request, so the model knows what the user has received.

When B's share class is found to be wrong, the model targets the original block through `replaces` and submits the corrected complete section. Publication saves the new version and the page reads it. Do not guess replacement targets from Markdown headings or infer current text from chat history.

Use two teaching disclosures to exercise this: save the fee section from an earlier source, then supply the corrected share-class material. Check that the new version replaces the original block, dependent judgments are revised, and a refreshed page reads the current version. See [the current-article projection](./agent-progressive-answer-coherence.md#_3-2-project-the-actual-current-article) and [identity-based revisions](./agent-progressive-answer-coherence.md#_4-1-appending-is-not-the-only-option).

### Keep optional observation off the answer-commit wait chain

Inspect logging, diagnostics, and optional evidence capture around publication. If they hold locks while waiting or become mandatory prerequisites in the commit chain, they can delay publication and termination even after the model has produced text.

ETF Agent reproduced a cross-transaction lock cycle on a frozen baseline. The repair addressed one waiting edge owned by optional capture: on contention there, roll back that capture, release its transaction locks, and retain a bounded failure observation. Independent answer commits, termination, and later reads keep their original paths. This accepts losing one optional observation without labeling it stored or hiding the loss behind global retries or another queue.

In an owned isolated test environment, hold the lock required by that capture. Check visible capture failure, durable answer save and readback, and success of a later independent capture. Necessary answer-storage failure remains a delivery failure and cannot be skipped as optional observation. If the answer transaction committed before the runtime journal updated, read the original commit identity rather than republishing because the journal is missing. The [Publication chapter](./019-agent-answer-publication.md#_7-real-problem-two-the-database-committed-but-the-runtime-log-was-not-finished) explains preparation, preview, commit, and Run termination.

<span id="finishing-is-part-of-the-research"></span>

<figure>
<picture><source media="(max-width: 700px)" :srcset="withBase('/diagrams/half-hour-research/publication-isolation-en-mobile.svg')" /><img :src="withBase('/diagrams/half-hour-research/publication-isolation-en.svg')" alt="Required answer commits remain independent of optional observation; capture rolls back on its measured contention edge and records failure without becoming a publication prerequisite." loading="lazy" /></picture>
<figcaption>Figure 6 · Local rollback protects independent delivery; required answer storage must still succeed. <a :href="withBase('/diagrams/half-hour-research/publication-isolation-en.svg')">Open full diagram</a></figcaption>
</figure>

### What does the system protect when something goes wrong?

| Situation | Handling | Preserved for delivery |
| --- | --- | --- |
| A source cannot be read | Report failure; model tries another authorized source or narrows scope | Other acquired evidence and supported findings |
| Older material leaves context | Retain real locators; reread the same version and range | Access to originals without treating summaries as originals |
| Summary generation fails | Reject the failed summary, retain history, continue or finalize within original resources | Requirements, execution facts, existing text |
| Resources approach a boundary | Limit further exploration; use protected finalization capacity | A scoped answer addressing the original task and key gaps |
| Page or process disconnects | Resubscribe the page; recover the process through supported paths | Saved results and reports, with usage and settled effects intact |
| An earlier finding is wrong | Revise its section and dependent reasoning; save a new version | An accessible current report and history |
| Optional reminders or attachments fail | Confine handling to the affected effect and its original owner | Independently authorized text and usable sibling content |

The original termination responsibility handles the Run's ending. Local failures do not automatically gain authority over the entire answer. Real permission, isolation, and investment-execution boundaries retain their owners. Unsupported judgments remain gaps; existing authorized content stays available.

These mechanisms make failures easier to locate, narrow their impact, preserve work, and protect finalization opportunities when resources allow. They cannot guarantee fault-free operation or certify answer correctness. Actually generated and stored content should be retrievable; a status label cannot stand in for delivery that has not happened.

<span id="_7-what-should-you-inspect-in-your-own-agent-first"></span>

## 8. Implement the answer path first, then extend sustained research

With model and tool entry points in place, implement three stages, each producing an observable end-to-end result:

| Stage | Implement first | Check |
| --- | --- | --- |
| Complete delivery | Fixed budget, one main loop, real tool results, report save and read | Trace the question to an answer the user can retrieve |
| Long-task support | Result locators, rereading, optional summaries, finalization reserves, history-cost observation | Actual requests, subsequent summary adoption, answers near resource limits |
| Interruptions and collaboration | Background subscriptions, user additions, settlement or continuation under existing contracts, necessary delegation | Reconnection readback, preserved results, no replay of settled effects on legitimate continuation, child results reaching Main synthesis |

Use controlled material for date conflicts, source failures, summary failures, exhausted exploration capacity, and process interruption. Then evaluate real-model behavior: verifying conflicts, using retrieved evidence, covering the original question, and writing a coherent report. System checks and answer-quality evaluation are separate.

The first implementation pass can use four checks around the same task: generate the normal comparison report; remove one of B's teaching sources and inspect the local gap and independent findings; use controlled state to trigger context pressure and exhausted exploration allowance, inspecting rereading and finalization; disconnect after saving the fee section, retrieve it again, then supply corrected material and inspect version replacement.

Keep actual input, tool receipts, final text, and the answer's retrieval location for each check. If no new answer is generated, identify the failed stage and the results still available. Real-model comparisons retain the same question and material conditions, inspecting coverage, source use, contradictions, readability, and consumption rather than minutes alone. The [end-to-end context-governance checks](./agent-context-governance-actions.md#_8-check-one-task-end-to-end-not-just-a-checkbox-for-every-module) provide a record structure; the [Deep paired experiments](./agent-deep-research-resource-and-delivery.md#_3-what-did-the-matched-runs-actually-show) illustrate how to interpret tradeoffs.

### Check revised reasoning, not only revised numbers

In the Normal/Deep study of four synthetic tasks executed with real models, one return-gap case supplied a correction from −0.5 to −0.9 percentage points. A model could update the number yet still claim that fees could not explain most of the gap, or infer a fee-contribution ceiling from nominal fee rates. The material only established that the fee contribution was unknown.

Review each revision for three things: whether new data arrived, whether explanations depending on old data were reassessed, and whether unsupported questions remain unknown. Correcting the gap does not automatically correct attribution.

The release point for corrected material also changes what a test establishes. Publishing only “reading now” before releasing the new version demonstrates later consumption, not revision of an earlier conclusion. To test changed judgment, freeze the original material and expected questions, wait until a substantive old-version finding is actually saved, then release the correction and independently compare each answer version with its sources. This is an evaluation judgment, not a production keyword gate or mandatory review step. The [Deep paired results](./agent-deep-research-resource-and-delivery.md#_3-what-did-the-matched-runs-actually-show) retain the sample and its interpretation limits.

<figure>
<picture><source media="(max-width: 700px)" :srcset="withBase('/diagrams/half-hour-research/evidence-revision-en-mobile.svg')" /><img :src="withBase('/diagrams/half-hour-research/evidence-revision-en.svg')" alt="A proposed teaching test saves an original substantive finding before releasing synthetic revised evidence from minus 0.5 to minus 0.9 percentage points, then checks values, reasoning, and unknown fee contribution." loading="lazy" /></picture>
<figcaption>Figure 7 · Inspect substantive answer versions; revised values still need supported explanations. <a :href="withBase('/diagrams/half-hour-research/evidence-revision-en.svg')">Open full diagram</a></figcaption>
</figure>

For the opening task, observe whether comparable terms are established, gaps are recognized, original restrictions survive, and the user obtains a clear comparison report. Add mechanisms along that delivery path so each design choice has a concrete purpose beyond keeping the agent running longer.

Related: [Long-horizon research panorama](./agent-long-horizon-research-panorama.md) · [Deep resources and paired experiments](./agent-deep-research-resource-and-delivery.md) · [Same-Run context compaction](./agent-main-run-context-compaction.md) · [Background research and foreground interaction](./agent-background-research-collaborative-experience.md).
