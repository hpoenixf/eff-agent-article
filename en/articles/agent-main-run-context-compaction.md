---
title: "Why Not Just Ask a Model to Summarize the Conversation When Context Is Full?"
description: "Main Run context compaction with bounded pressure, settled turns, non-authoritative summaries, immutable checkpoints and honest live evidence."
---

# When Context Is Nearly Full, Why Can't We Simply Ask a Model to Summarize History?

Deep research may take dozens of turns. The model reads a long PDF, queries several funds, calculates in Python, then checks citations and writes a report. As tool calls accumulate, the problem is not just **insufficient room in context**. The next model request needs to keep reasoning while old material consumes space and contains execution facts that must not be rewritten.

A common strategy asks a model to summarize the preceding conversation and continues with the summary. That helps with length. It also creates a worse failure mode: the summary may turn “planned to call a tool” into “the tool succeeded,” omit a user correction, or describe a stale amount as current. Subsequent work may then depend on a fabricated history.

Our Main Research Run compaction feature is organized around a different decision: **the model creates only a lossy summary of its prior work; the original task, permissions, tool effects, financial numbers, citations and recovery state remain owned by deterministic records elsewhere**.

The main discussion describes the original system; the final section demonstrates its runnable public note-adoption and original-rereading slice in [Open ETF Agent](https://github.com/hpoenixf/open-etf-agent). That smaller implementation lacks the original system’s cold recovery, so one demo must not stand in for validation of the entire research path.

## 1. Three Ways to Reduce Context Cost Are Not the Same

Initially every tool result could be carried into subsequent model history. That was acceptable for simple queries but caused old results, duplicate materials and repeated correction attempts to crowd out relevant context in long research.

We had already adopted two remedies.

**Externalized results:** large tables and document bodies remain in a controlled result store. The model sees a catalog and reads exact versions or ranges as needed. This answers whether an entire result must be permanently included, but it does not remove the growing history of model turns.

**Reversible context fitting:** shrink auxiliary catalogs, replace older tool bodies that can be reread later, and adjust safe display representations to fit the final request. It is reversible because the authoritative result still exists and can be read again.

**Semantic compaction** is a third, deliberately more intrusive technique. It compresses the earlier model's *working process*, which inevitably loses some information. It must come after the first two techniques, not become the knee-jerk response to any capacity pressure.

Anthropic's [Effective Context Engineering for AI Agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) notes the risk of losing details that only later become important. Research adds another constraint: tool effects, source eligibility and financial calculation definitions must survive regardless of the wording of a summary prompt.

## 2. Establish Real Capacity Pressure Before Compacting

When should the system ask for a summary? Counting messages is misleading: five large tool outputs can take more space than fifty short turns. Counting only text tokens also ignores tool schemas, response reserves and request envelopes.

Our default is an **application-level pressure policy** with a measurable basis. It measures the serialized complete request in UTF-8 bytes: a **256 KiB soft threshold**, **224 KiB target**, **at least 4 KiB of required savings**, and a **6,000-byte summary cap**.

These are application thresholds, not a provider's token context window. They do not mean a particular model has 256 KiB of context. Actual model windows, transport capacity and final-send validation remain under their existing owners.

Main considers semantic compaction only after reversible fitting is complete and the full request still exhibits supported pressure. Unknown token counts are not treated as zero, nor is unknown context size treated as infinite.

The next research step and finalization also need capacity. The system must not covertly spend a model request on internal summarization when the remaining resource budget already needs to be protected for completion.

## 3. Compact Only Settled Older Work, Not the Whole Conversation

This is the most important—and easiest to miss—decision.

Model-visible history is not an ordinary list of sentences. A Tool Call may have parameters, dispatch identity, response, failure reason and retry eligibility. These form a protocol unit. Retaining “the model wanted to look up this fund” while discarding its result, or keeping the result with no call identity, changes the facts a subsequent turn sees.

A candidate compaction interval must meet strict conditions:

- Select older model turns within **the same Main Run** whose sealed inputs and receipts are trustworthy; preserve the most recent work groups intact.
- Keep each tool invocation and result together. Never cut a tool protocol unit in half or call an unsettled effect completed.
- Preserve the user's initial request and explicit later corrections **verbatim and in order** in subsequent requests. They are not replaceable by a model-written summary.
- Never recursively feed earlier summaries into the next summary model. A new compaction covers fresh, nonoverlapping settled ranges rather than repeatedly paraphrasing previous paraphrases.

The summary input is intentionally narrow. The current implementation mostly derives work clues from **recoverable sealed model tool proposals**. It does not pretend to recreate unretained hidden reasoning, every assistant narration or arbitrary raw tool content. If the underlying material is unavailable, it does not fabricate it.

This shares the motivation of [Pi's compaction design](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/compaction.md): preserve recent context and summarize older material so work can continue. Our particular choice is to avoid recursively treating past summaries as authoritative inputs and keep tool, number and permission facts in their existing durable stores. These are tradeoffs under different constraints, not universal proof that one framework is better.

## 4. A Summary May Describe Work, but Cannot Inherit Execution Authority

Consider a simplified request:

> Compare the overlap and fees in my technology funds. Do not treat NAV values from a month ago as current.

In early turns, the model proposed document reads and holdings-overlap calculations, and received partial tool results. A free-form model summary might say “Overlap calculation is complete and the latest NAV values are fine.” That fluent sentence proves neither successful computation nor fresh source data.

We separate the representations:

| Content in the next model request | Authoritative source and handling |
| --- | --- |
| User goal and the “do not use stale NAV” correction | Original text and current revision, preserving precise meaning and order |
| Executed tools and results | Original receipts, versioned stored results and selections; re-readable |
| Older model work clues | Non-authoritative, lossy summary to avoid repeating explanations |
| Current Research Needs, stage and remaining limits | Fresh projection from actual Runtime and resource state |
| Submitted answers, citations and files | Original Publication, Result and Artifact owners |
| Fund NAV, amounts, units and calculated metrics | Domain producers and their controlled numerical/source receipts |

A source ID, a number or “tool succeeded” inside the summary does not acquire authorization or calculation authority. When needed, the model must use the current versioned read interface to obtain eligible original material.

Nor can this structure guarantee the model will later reason perfectly. Mechanisms can protect factual inputs and source identity; semantic accuracy of final investment analysis still needs separate evaluation.

## 5. How a Main Compaction Actually Runs

Think of the process as **select candidate → summarize → check net benefit → commit → replay**.

~~~mermaid
flowchart TD
  A["Prepared Main request"] --> B["Reversible context fitting"]
  B --> C{"Qualified capacity pressure?"}
  C -- "No" --> N["Continue without compaction"]
  C -- "Yes" --> D["Select settled old turn groups"]
  D --> E["Bounded summary model request"]
  E -- "Failed or not helpful" --> F["Continue with original history"]
  E -- "Candidate produced" --> G["Fit the complete next request"]
  G -- "Insufficient savings" --> F
  G -- "Valid and beneficial" --> H["Commit compaction checkpoint"]
  H --> R["Next Main request"]
  F --> R
  N --> R
~~~

The multiple exits are conditions, not mandatory steps. Unqualified pressure or the absence of a safe compaction interval keeps the original request. Failed or low-benefit summaries keep old history. Only a candidate satisfying final capacity, identity and savings conditions produces a checkpoint.

Summarization is a **real model request**. It uses the original Gateway, resource reservation, deadline, cancellation and failure settlement. Calling it “internal” does not make it free. Unknown dispatch outcomes consume their original receipt and must not be retried indefinitely under fresh identities.

After producing a candidate summary, the system re-inserts it into the **complete next Main request** and checks whether the summary, reference catalog, tool definitions and protected original text actually fit and save enough capacity. If they do not, the original history remains in use.

Optional PreCompact and PostCompact hooks may observe the process. They do not gain permission to rewrite original effects or force acceptance of a summary.

## 6. The Identity of the Checkpoint Matters More Than the Summary Text

Suppose a summary is in context and the server crashes. On recovery, having only that string—without knowing which turns it replaced, from what revision or whether the summary request already incurred a cost—could lead to duplicate summarization, repeated tools or an incorrectly positioned summary.

So the existing Recovery checkpoint stores an immutable compaction record binding:

- Original Run and scope; predecessor revision; current correction revision; selected model route.
- Complete compacted turns and source hashes.
- Tool result references and selections derived from genuine receipts.
- Summary request identity, model/prompt version and summary text.

The summary segment describes **how successor turns project earlier history**. It is not a new execution cursor, source registry or financial fact database. Cold recovery replays these records, and original tool results remain readable under their old identities. No additional tool or network call is needed merely to reconstruct context.

A classic counterexample is a checkpoint that committed before the process lost the ACK. Recovery cannot infer “not committed” from absence of a local success response and send a new summary request. It must read the durable receipt and retain the previous attempt's settlement state. If the effect is genuinely unknown, it stays unknown rather than becoming an invented safe retry.

Disabling *new* compaction in the future does not invalidate summaries legitimately committed earlier. Feature enablement and durable past effects are different facts.

## 7. What Did Real Evidence—and Missing Evidence—Show?

As of October 21, 2026, three evidence levels existed.

**Offline implementation checks:** controlled Factory construction, request assembly and isolated PostgreSQL tested full tool-unit preservation, net-benefit assessment, checkpoint commit, cold recovery, user corrections, unknown effects and re-reading old results. Some tests intentionally used lower synthetic thresholds to trigger pressure; these cannot be presented as ordinary provider model windows.

**Default wiring and guard checks:** Main's pressure-triggered compaction policy is enabled by default in the then-current Runtime. It should not send extra summary requests below the threshold, when explicitly disabled, when source evidence is inadequate, or when finalization reserves already need protection. “Enabled by default” does not imply “every deep research run compacts.”

**A real research trigger:** a follow-up review of an October 20 PUBLIC01 deep research run found **at least one naturally triggered summary request completed and a compaction checkpoint segment committed**. This was not merely planned and did not use only a fake model. Yet the overall research finished **partial**, with finalization capacity exhausted. Compaction happening successfully did not complete the research task.

Existing records still did not prove that this live summary was fully consumed by subsequent Main requests, or establish a comparative semantic/citation/financial accuracy study across repeated compactions.

The implementation and controlled recovery paths are available, but we still lack sufficient observations showing that subsequent Main requests consistently use real summaries correctly across repeated compaction, especially for meaning, citations, and financial numbers.

This design follows [principle 5, “Context is a workbench, not a fact database”](/en/principles#principle-5): a compacted summary is a lossy work hint, not an authoritative receipt, number or source. [Method 3, “Passing evidence through a research system”](/en/principles#method-3) separates original records, model-visible projections and the actual request so compression cannot silently promote a summary into fact.

## 8. Was the Complexity Worth It?

Protected originals do not magically disappear. Exact user text, tool receipts, citation catalogs and the new summary itself all occupy capacity. If little safely compactable old work remains, the system must still follow its normal bounded continuation, partial delivery or failure rules—not recursively summarize until everything appears to fit.

Summaries also cost real model requests and time. Identity binding and durable checkpoints are more complex than replacing a list of messages.

The payoff is not “context can never overflow.” It is three verifiable rules:

**Compact only older work that can safely retire; accept only candidates that demonstrably save space; never allow a summary to rewrite original facts.**

For long-running agents, context management resembles a lossy caching policy—not a new memory authority. Its real effectiveness must be judged by actual model input, recoverability and whether semantic omissions degrade final research.

<!-- open-etf-agent:minimal-experiment:start -->
## Observe Note Adoption and Original-Source Rereading in the Public Code

[Open ETF Agent](https://github.com/hpoenixf/open-etf-agent) now exposes one runnable slice: acquire synthetic material, derive a working note under explicit byte pressure, include it in the next request, then read both the note and an original page. It reproduces the boundary that **compaction must not replace originals**, not the full Main Recovery checkpoint described above.

[`compaction.mjs`](https://github.com/hpoenixf/open-etf-agent/blob/05c0dd2dc550f4f7e5da034340ff5c3159768fcf/src/compaction.mjs) starts from the existing reversible context projection, then selects older, complete, successfully settled tool-call groups while preserving the latest group and user question. A candidate note, including its original references, must be smaller than that actual baseline—not an inflated raw-text history that would already have been externalized. If summarization fails, yields no net savings, or the basis changes while the summary is generated or saved, the candidate is not adopted. A written file alone does not prove inclusion in the next request.

With Node.js 26.11.1–26.x, run the fixed snapshot in a new directory:

```bash
git clone https://github.com/hpoenixf/open-etf-agent.git open-etf-agent-compaction-demo
cd open-etf-agent-compaction-demo
git checkout --detach 05c0dd2dc550f4f7e5da034340ff5c3159768fcf
npm ci --ignore-scripts --no-audit --no-fund
npm run demo -- --case compact-and-reread
```

Initial installation may access npm; this case makes no remote model calls after installation. [`working-demo.mjs`](https://github.com/hpoenixf/open-etf-agent/blob/05c0dd2dc550f4f7e5da034340ff5c3159768fcf/src/working-demo.mjs) explicitly sets a low synthetic byte threshold and uses a fixed script to produce the summary. That threshold is not a provider token window. Runtime performs the actual basis checks, net-byte comparison, note persistence and subsequent request assembly.

The case checks more than the existence of a summary file. The next Gateway invocation must find a `derived-working-note` in its actual input before issuing `read_note`. It then calls `read_result` with the previously acquired `resultRef`, checks the original page identity and saves a report citing original sources. The terminal JSON returns the run's `directory` and report `receipt`. Pass that directory to `node src/cli.mjs --observe` to inspect the `working_note` event's `applied` status, adopted `noteRef` and before/after byte counts alongside subsequent real reads and the file-save event.

[`working-note.mjs`](https://github.com/hpoenixf/open-etf-agent/blob/05c0dd2dc550f4f7e5da034340ff5c3159768fcf/src/working-note.mjs) retains `origin: derived-summary` and `semanticStatus: unreviewed`. Its references point back to original records; the note does not acquire original-source identity. The call/result pair used to display the note in context is also marked `projectionOnly` and `dispatched: false`, so a constructed working view is not mistaken for a real tool execution.

Readers can therefore reproduce an engineering path in which **a note is actually adopted, originals remain readable under their original identities, and a report is actually saved**. This public slice lacks the cold-recovery capability discussed earlier, and does not establish that a real model interprets the summary correctly. The [first real-model batch](https://github.com/hpoenixf/open-etf-agent/blob/d075068ac99a6c798d012c46bff4fe0c33eb9979/docs/verification/live-v01-v05-first-batch.md) did not trigger compaction and cannot validate that mechanism. The scripted observation here tests input handoffs and real effects; summary semantics require separate evaluation.
<!-- open-etf-agent:minimal-experiment:end -->

---

## What Still Needs Observation

This change was manually archived under an explicit October 21 exception, not through a passing standard `spec:close`.

Controlled paths confirmed summary inclusion in subsequent Main input, and a real research run completed a summary request and committed its checkpoint. Whether that real summary was correctly used by the next request, and how repeated compaction affects meaning, numbers, citations and cost, still need further observation. Enabling pressure-triggered compaction does not resolve those quality questions.

More recent Access/Memory/Factory ownership changes do not turn summaries into Memory records or historical numeric authority. Exact calculations and evidence still require the original source/result read path; subsequent model consumption and complete task delivery are separate facts.

## Further Reading and Discussion

[Read the original on the author's blog](https://hpoenixf.com/blog/agent-main-run-context-compaction) · [ETF Agent Engineering Library](https://github.com/hpoenixf/eff-agent-article) (stars welcome).
