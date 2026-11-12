---
description: "Longer research exposes accumulated computation, repeated context reads, and fragmented corrections. Drawing on ETF Agent investigations and recorded runs, this article explains how multi-turn research keeps moving and becomes an accessible, coherent report."
articleMetadata:
  author:
    name: "hpoenixf"
    url: "https://hpoenixf.com/about"
readingBrief:
  takeaways:
    - "Longer research needs aligned request limits, active time, and finalization capacity. A budget upgrade must reach the running consumers; a larger displayed allowance is insufficient."
    - "Growing history amplifies synchronous computation. When a lease expires, inspect both database waits and event-loop blocking before choosing the repair."
    - "External results and working summaries solve different problems. Measure compaction against the actual request and retain a path back to original material."
    - "Generating a summary, persisting it, and including it in subsequent model requests are separate facts. Verify continuity at the consumer."
    - "Long research benefits from separate progress, independent findings, and an integrated report. Apply corrections to their original sections to reduce contradictions."
  appliesTo:
    - "Developers with an existing multi-turn tool loop who want to support research lasting tens of minutes and diagnose its bottlenecks."
  notFor:
    - "Simply producing more words, or treating the local observations here as a stability or quality guarantee for half-hour research."
---

<script setup>
import { withBase } from 'vitepress'
</script>

# Engineering Half-Hour Agent Research: From Execution Budgets to a Complete Report

A fee question may need only one announcement before an agent can answer. A request to compare several funds, reconcile disclosures across periods, calculate portfolio exposure, and explain disagreements requires more work. The model chooses a step, tools return material, calculations change an interpretation, another research branch finds counterevidence, and the main model eventually assembles the report.

For this work to keep moving for twenty or thirty minutes, each handoff needs to hold. New material must reach the next input, accumulated history must not overwhelm the service, user corrections must survive, and enough resources must remain to organize the findings.

We made several changes around these problems in ETF Agent. The [long-horizon research panorama](./agent-long-horizon-research-panorama.md) explains the overall relationships. This article examines practical turning points: what changed our diagnosis, where the repair belonged, and why a more obvious approach was insufficient.

“Half an hour” describes the scale of the task. This account uses private implementation and historical records checked as of November 12, 2026. Its examples come from different runs and experiments. They do not form one successful end-to-end run, and the public teaching repository does not necessarily include all these capabilities.

## 1. Give research room to work—and room to finish

Increasing the overall timeout is a reasonable first step. An allowance that is genuinely too small prevents a complex task from obtaining essential material. But several limits usually constrain a research loop together.

A model request has its own waiting boundary; a tool operation has an execution deadline. The research also has active-time, wall-time, request-count, and user-imposed limits. Twenty minutes may remain overall while a particular request has already reached its own limit. Conversely, a connection sending heartbeats does not establish meaningful model progress.

We gradually separated these meanings so that errors describe the actual stage. Time spent executing model and tool operations is observed separately from total elapsed wall time. Concurrent activity requires accounting for the union of actual intervals. Waiting, parking, and recovery have their own conditions; the lifetime of the current process cannot stand in for the time already used by the research.

For new Runs, the current default active-time limit is 60 minutes, the current Deep target is 90 minutes, and the wall-time safety limit is 120 minutes. Older Runs retain their admitted policy, while other deadlines and quotas may stop execution earlier. These values describe available room. Whether a task needs or can use that room depends on the actual work.

<figure>
<picture><source media="(max-width: 700px)" :srcset="withBase('/diagrams/half-hour-research/time-bounds-en-mobile.svg')" /><img :src="withBase('/diagrams/half-hour-research/time-bounds-en.svg')" alt="Research is constrained by per-operation boundaries, overall execution budgets, and protected finalization capacity. Enlarging one allowance does not remove the other limits." loading="lazy" /></picture>
<figcaption>Figure 1 · Several limits constrain execution together. Finalization capacity belongs to the original budget; it cannot be invented after exploration exhausts it. <a :href="withBase('/diagrams/half-hour-research/time-bounds-en.svg')">Open full diagram</a></figcaption>
</figure>

### A running loop must actually adopt an approved upgrade

Implementing Deep taught us a concrete distinction: increasing a persisted allowance and applying it in the current process are separate events.

If the database has approved a longer time allowance but an in-memory timer still fires at the old deadline, research still stops early. If the model sees more turns while the request boundary enforces the old allowance, its planning also fails. The original budget module therefore records one upgrade, and subsequent request admission, the main loop, deadlines, and reminders consume the same effective revision. Spent, reserved, and unknown usage remains. A lost acknowledgement leads to reading the same record, not multiplying the allowance again.

For fixed short tasks, shared configuration and an explicit ceiling are often enough. Our need for a mid-Run upgrade introduced the distinction between approval, application, and actual consumption. The [Deep Research article](./agent-deep-research-resource-and-delivery.md) covers the full profiles and paired experiments; here the concern is the handoff that sustained execution requires.

### Exploration must leave an opportunity to write

One real continuation still had aggregate requests available after its finalization requests were exhausted. A single “requests remaining” figure could invite the model to plan another turn even though the current publication response was consuming its last finalization opportunity.

Research opportunities, physical request capacity, and finalization reserves are now expressed separately. The main model has a dedicated default finalization tail, and the time budget protects output capacity. Near a boundary, the model can abandon low-value exploration and produce a scoped result from available material. The system limits further exploration while preserving existing authorized text through its original path.

This sets aside capacity that could otherwise fund more searching, in exchange for an opportunity to finish and deliver. Raising every allowance together would merely move the same problem later.

## 2. Longer research also accumulates service-side computation

When a long task fails, it is natural to suspect a slow model or database. One lease failure we investigated instead came from synchronous CPU work.

The event loop was blocked for approximately 30.4 seconds. The lease query itself took about 1ms, but the lease had expired by the time the check ran. CPU profiling located repeated work in a history projection: for each action, it rebuilt a prefix, authorization proof, and seal verification for the same candidate. The cost of processing identical material became more visible as history grew.

Lease heartbeats require the event loop to be scheduled. Code can delay them by occupying the execution thread without waiting on the network at all. The official Node.js guide on [avoiding event-loop blocking](https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop) describes the general mechanism; our CPU profile established this incident's particular cause.

Extending the lease would tolerate a longer pause, but would also delay recognizing a genuinely dead executor. Permanently caching every verification result could reuse stale facts after a new receipt or user correction. We limited reuse to **the same candidate object within one synchronous derivation**. A proof that cannot change during that calculation is built once; a new snapshot, receipt, or correction still triggers verification.

On the original snapshot of 46 turns and 111 receipts, a pure-function comparison reduced this processing from 27,887ms to 358ms, with identical hashes for all 111 relationships. This measures a fixed history computation, not end-to-end research acceleration. It does show that almost half a minute of synchronous repeated work could be removed.

That experience changed our diagnostic order. For delayed heartbeats, lease checks, or cancellation, separate waiting from computation and inspect how cost grows with history. Look first for repeated scans, serialization, proof construction, and copying. Consider worker threads or another execution domain once the remaining computation is both necessary and still substantial.

## 3. Externalize results without emptying the working desk

As the model reads pages, tables, and PDFs, even modest individual results accumulate. Sending already processed full text repeatedly increases the load. Keeping only a short summary may leave the next turn unable to verify a date, number, or original sentence.

We use two techniques at different points: **external results manage material size; process compaction manages research history.**

A tool result is first stored under its original identity. The model receives enough current content plus a locator for reading it again. As research advances, older text with a reliable locator can leave the current request. When needed, the original reader retrieves it. The actual result retains what was read, which range is present, and whether more material follows. Locating a file does not mean the model has read all of it.

Small results also need locators. Giving references only to large files leaves accumulated small results with no safe path out of context. Deduplicating identical references cannot solve a collection of many different small results either. Producers, storage, and request projection therefore have to cooperate; clipping old messages at the final model boundary is insufficient.

### An attempt that made the working set too small

We once set a 96KiB target for retaining older text to reduce subsequent input. The experiment instead produced repeated rereads and exhausted the original turns. Actual rereads included the text, although the model could still claim that it “had no data.” Diagnosis has to inspect what it received; that sentence is not an authoritative tool-failure record.

The target was later adjusted to 192KiB. In one synthetic teaching task at that stage, a real model completed the required findings and specified values from eight documents in six requests, while actually moving older text to a reference once. This supports usability for that sample and configuration, not a universal optimal capacity.

The tradeoff is practical: an oversized working set keeps history in the input; an undersized one forces the model to reacquire recently used material. Short, closely related documents may deserve temporary retention. Large documents needed only at a few disputed passages are better candidates for locator-based rereading.

[Anthropic's context-engineering article](https://www.anthropic.com/research/effective-context-engineering-for-ai-agents) likewise discusses compaction, external notes, and subagents as distinct techniques. They carry different kinds of information. Our useful observations are what the next decision needs and how much rereading costs, rather than how small a request can become.

## 4. A summary must reach the subsequent work

After tool text is reduced, the model's process history still grows: failed approaches, conflicting sources, conditional findings, and the evidence still needed next. This is suitable material for a working summary.

We summarize **complete, settled history intervals**. An invocation stays with its result; source intervals do not overlap; a later summary does not summarize the earlier summary again. Original user requirements, applicable corrections, and execution facts stay in their own records. The summary helps the model understand the work.

This reduces repeated rewriting of the same summary, but independent summary segments also accumulate. Original text, summaries, tool definitions, and output reserves all consume capacity. The complete request still has to fit actual provider limits. With a large window and short task, retaining recent full context is usually simpler; a summary request is not useful merely as a demonstration of long-term capability.

### Allow a possible improvement, then measure the actual one

The compaction mechanism also had unnecessary restrictions. Its earlier preflight estimated the largest possible summary with worst-case escaping, which could reject a history interval that had a real chance of shrinking. After generation, a useful reduction could be discarded because it did not reach the soft target in one step.

The revised approach retains the real hard input limit, configured summary size, and minimum saving. Preflight asks whether a minimally valid summary could still help. After a result returns, the actual summary is inserted into the complete request to measure real savings and hard-limit fit. The soft target expresses the desired reduction; a useful partial improvement can still be adopted.

In another real research Run, an auxiliary summary hit an internally hardcoded 900-token output ceiling and did not produce a usable summary. That request now uses the existing configured Main-request limit and known provider limit, taking the lower when both exist. It does not invent another number when no reliable limit is known. A failed summary leaves the original context in place and does not start an unlimited summary-repair loop. Its request still counts toward the original research usage.

### How do we know it was used?

A real research Run on October 25 naturally produced two summary segments. We inspected the inputs actually dispatched to the main model. The first appeared in 19 subsequent requests and the second in 11; those later 11 retained both segments. They covered different original intervals, and the second summarizer did not receive the first summary for further summarization.

A fresh process then read the persisted checkpoint. We matched the summaries to actual inputs and checked the original user text, references, and action identities. The important observation is that output reached the subsequent consumer and the original task survived that handoff.

Summary content still needs review. One period description in this sample was defective while its original parameter remained unchanged. Separating originals from summaries matters precisely here: the model can write an incorrect working note while the system still lets later verification return to the initial evidence.

<figure>
<picture><source media="(max-width: 700px)" :srcset="withBase('/diagrams/half-hour-research/summary-handoff-en-mobile.svg')" /><img :src="withBase('/diagrams/half-hour-research/summary-handoff-en.svg')" alt="Settled history produces a summary, actual successor requests adopt it, and a persisted checkpoint retains the same revision. Original requirements, execution receipts, and result locators are preserved separately." loading="lazy" /></picture>
<figcaption>Figure 2 · Check generation, successor adoption, and durable readback separately. The summary supports continued work; original records retain its verification basis. <a :href="withBase('/diagrams/half-hour-research/summary-handoff-en.svg')">Open full diagram</a></figcaption>
</figure>

## 5. Keep the extended task working on the same question

Time and context are only part of the work. Users also need a way to adjust the research. During a background task they may leave the page, return with a follow-up, or add a requirement such as comparing tracking error. These actions need different treatment.

For authorized background execution, a page disconnect detaches its subscription. An explicit Stop follows the original cancellation path. Reopening the page should retrieve the original task's progress and results. An explicit continuation creates a successor execution carrying the original question, applicable restrictions, and permitted background. An ordinary new question is handled independently.

We observed a real Continue with the correct parent-child Run link, visible text, and readable history, yet it drifted away from the original multi-index task. Inspecting the successor's actual input showed empty original-user context. Relationship identity and successful persistence had not established task continuity. The preparation path was repaired to retain original user text, hand off assistant summaries, source records, and research needs separately, and verify their arrival in the main-model input.

We inspect subagent handoffs the same way. Independent investigations can expand evidence gathering, but the main model still needs an opportunity to synthesize them. Completion, persistence, inclusion in the Main request, and correct use in the final argument are distinct stages. Execution records can establish the earlier stages; the last requires report review. Main and Child execution allowances are therefore expressed separately, while real requests and costs remain recorded.

Same-Run process recovery also involves elapsed usage and execution ownership. At the time of writing, some Child/Peer wake paths after a crash leaves an unclosed activity interval are still undergoing safe-settlement and recovery qualification. A known lower bound cannot be treated as complete usage and silently refund time to a successor. A long-task design should state its supported recovery paths while ensuring that independently saved results remain accessible.

## 6. Sustained research still needs a coherent report

Our original progressive delivery encouraged publishing supported, independently readable material before research ended. That works well for ordinary questions. A verified fee fact need not wait for unrelated branches.

Complex research exposed a different friction. Several real reports accumulated correction sections, withdrew earlier facts, and showed inconsistencies between citations and arguments. Users had to combine the original text, additions, and errata themselves to determine the current conclusion. Continuous output conveyed activity without naturally becoming an integrated report.

We later changed Deep guidance: **report what is being checked and where evidence conflicts early; organize dependent conclusions after the necessary evidence comparison.** Independently mature sections may still be delivered early. The server does not introduce an “evidence is sufficient” Boolean gate or require a fixed time percentage to pass before writing.

### Apply corrections to the section they change

The existing publication path supports revision replacement. A later correction should therefore update the relevant section so that the user can read the current report directly. Previous versions keep their history. Appending “point two above is withdrawn” leaves the integration work with the reader.

Deep's default correction capacity also increased: from 2 to 6 modifications per block and from 8 to 24 per research. Explicit operator caps still take precedence, including zero; spent and reserved usage is not reset. Capacity provides room for legitimate revision. Evidence and reasoning determine whether the revision is right.

This creates more opportunities to organize and revise material and can increase consumption. It suits tasks with revised sources and conclusions that depend on several documents. A short factual question is simpler to answer directly. Existing paired experiments also produced mixed results: more capacity and more cautious guidance did not guarantee a more complete or faster answer.

### Finishing is part of the research

A local tool failure, optional reminder failure, or broken citation attachment should first be handled within its own effect scope. The single Run termination responsibility then uses actual state to decide whether qualified continuation is available or whether the main model should use protected capacity for bounded finalization. Every exception-throwing location must not independently acquire the right to stop the entire task.

Finalization should integrate the findings that still hold, their main evidence, corrections, and material gaps around the original question. Partial evidence supports a correspondingly scoped answer. If a later step fails, previously authorized generated and persisted text remains. A new phase cannot invent a new budget, and changing an operation identity cannot erase an unknown effect that already occurred.

## 7. What should you inspect in your own agent first?

I prefer starting with one task that genuinely needs several rounds of document work, then locating its bottleneck through actual inputs, execution, and the report. Different symptoms lead to different next steps:

| Observed symptom | Inspect first |
| --- | --- |
| Time remains, but execution cannot continue | Current phase, actual next-request capacity, operation deadlines, and finalization reserve |
| Heartbeats or cancellation slow as history grows | Event-loop blocking and the growth of projection, serialization, and proof construction |
| Recently read material is fetched repeatedly | Whether the actual input already contains it, locator completeness, and working-set size |
| A summary is saved, but the task is forgotten | Whether the original requirements and summary enter the next Main request |
| Experts have results, but the report misses a part | Main receipt of results, remaining synthesis capacity, and their use in the argument |
| The final text consists of additions and errata | Progress versus conclusion timing, section revisions, and the integrated report version |

These observations do not require building every module up front. Retain original text while the window is sufficient and use a fixed allowance for short tasks. Introduce rereading, compaction, independent research branches, or recovery mechanisms when a concrete bottleneck warrants them.

Half-hour research ultimately involves an entire working chain: enough execution room, controlled history-processing cost, material available for the next decision, preserved user requirements, and a report that can change with the evidence. Duration provides a window for that work. What matters after each interval is a clearer, better-supported answer to the original question that the user can actually retrieve.

---

Further reading: [Long-horizon research panorama](./agent-long-horizon-research-panorama.md) · [Deep budgets and paired experiments](./agent-deep-research-resource-and-delivery.md) · [Same-Run context compaction](./agent-main-run-context-compaction.md) · [Background research and foreground interaction](./agent-background-research-collaborative-experience.md).
