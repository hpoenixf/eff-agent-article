---
title: "Why Not Just Ask a Model to Summarize the Conversation When Context Is Full?"
description: "Main Run context compaction with bounded pressure, settled turns, non-authoritative summaries, immutable checkpoints and honest live evidence."
readingBrief:
  takeaways:
    - "Use semantic compaction after externalization and reversible fitting; a soft target is desired headroom, while adoption still requires measured savings, hard-capacity fit and original authorization."
    - "Compact eligible older work while preserving original user text, complete call relationships and effect receipts; summaries acquire neither source authority nor execution authority."
    - "Bind compaction records to the original Run, range and request identity; recovery reads the checkpoint rather than repeating summarization or tool effects after a lost acknowledgment."
  appliesTo:
    - "Reducing context pressure within a long research Run while preserving original-source access, execution facts and process recovery."
  notFor:
    - "Treating committed summaries or scripted note adoption as proof of real-model understanding, repeated-compaction quality or successful end-to-end research."
---

# When Context Is Nearly Full, Why Can't We Simply Ask a Model to Summarize History?

A research agent has inspected dozens of fund documents and still has work to do. The obvious fix is to ask the model to summarize earlier turns. But the real risk is not a verbose summary. It is **a fluent sentence turning an intended action into a completed tool call, or last quarter's figures into current facts**.

Two further surprises shaped the final design. Conservative capacity preflight can reject every potentially helpful summary. And a committed checkpoint containing a summary does not mean the next model request actually contained it. We did not solve this by introducing a smarter summarizer. We made the summary a **non-authoritative working note** while leaving sources, grants, effects and recovery with their original owners.
<div><a id="_1-three-ways-to-reduce-context-cost-are-not-the-same"></a></div>

## 1. Not Every Context Problem Calls for Summarization

We reduce pressure in an intentional order: **externalize repeated tool results → apply reversible fitting and exact rereads → only then summarize older work**. A PDF or fund-holdings table with a stable source identity and permitted selector should not be reinserted into every model turn. Recent tool calls and their corresponding results must stay together.

[Anthropic's context-engineering guidance](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) treats context as scarce working space. Its [tool-result clearing](https://platform.claude.com/docs/en/build-with-claude/context-editing) is well suited to workflows that no longer need to see earlier tool output. Our financial research adds a constraint: **removing current model-visible text must not remove auditable source identity, authorization or numeric provenance**.

<div><a id="_2-establish-real-capacity-pressure-before-compacting"></a></div>

## 2. The Surprise: Being Too Conservative Can Make Compaction Impossible

The application policy measures the **entire fitted request in UTF-8 bytes**. Its defaults are a 256 KiB soft threshold, a 224 KiB desired target, a 4 KiB minimum net reduction and a 6,000-byte summary cap. These are application thresholds, **not a provider's token context limit**.

The old preflight imagined a maximum-length, maximally escaped summary and rejected the attempt unless that hypothetical worst case fit. A useful short summary never got a chance. A second rule treated the soft target as a strict one-shot requirement: even a substantial actual reduction was rejected if it remained above the target.

The final mechanism separates two questions. **Before spending**, reject only when even the smallest valid nonempty summary cannot meet minimum savings or real hard capacity. **After generating**, fit the actual summary into the *complete next Main request*—including tool schemas, source catalog, recent working set and exact user corrections—and check real net savings, the hard limit and original identities. The soft target expresses desired headroom, not a hard adoption gate. We retain strict hard limits while permitting **safe incremental reductions**.

<div><a id="_3-compact-only-settled-older-work-not-the-whole-conversation"></a><a id="_4-a-summary-may-describe-work-but-cannot-inherit-execution-authority"></a><a id="why-summarize-the-same-evidence-repeatedly"></a></div>

## 3. The Greater Risk: A Working Note Impersonates an Execution Receipt

Consider a teaching scenario. The agent requested two funds' quarterly disclosures; a tool returned only part of a document. The user then clarified: “Do not substitute old NAV for today's price.” A free-form summary could falsely say “the latest disclosures were checked,” causing the later model to stop reading missing evidence.

We summarize only **older, complete, settled model/tool groups with durable identities inside the same Run**. Unsettled effects, unknown outcomes, recent work, user originals and corrections are retained. Previously adopted notes are not recursively fed back as new evidence, avoiding compound paraphrase errors.

Current needs, committed answers, source references, balances and exact numerical results are still projected from their original owners. A source ID mentioned in a summary is not a grant. **A higher compression ratio that erases whether a tool actually ran is not an improvement**.

<div><a id="_5-how-a-main-compaction-actually-runs"></a><a id="_6-the-identity-of-the-checkpoint-matters-more-than-the-summary-text"></a><a id="_7-what-did-real-evidence—and-missing-evidence—show"></a><a id="observing-a-summary-needs-its-own-bounded-window"></a><a id="what-still-needs-observation"></a></div>

## 4. The Final Execution Path: Three Different Questions

1. **Is an attempt worthwhile?** The fitted request still has supported pressure, a safe older interval exists, and a minimal nonempty summary could satisfy original hard limits and measured minimum gain.
2. **Is the result admissible?** The original Gateway returns a complete, non-truncated summary. Recovery commits it only when the full refitted request genuinely saves space and satisfies source, grant, and checkpoint identities.
3. **Was it consumed?** The subsequent dispatched Main request actually contains the adopted note. Recovery later uses that checkpoint without rerunning the model or replaying settled tool effects.

~~~mermaid
flowchart TD
  A["Complete Main request"] --> B{"Capacity pressure?"}
  B -- "No" --> Z["Keep original request"]
  B -- "Yes" --> C["Select settled older groups"]
  C --> D{"Even minimal valid summary infeasible?"}
  D -- "Yes" --> Z
  D -- "No" --> E["Summarize through original Gateway"]
  E --> F{"Actual full fitted request saves space and remains valid?"}
  F -- "No" --> Z
  F -- "Yes" --> G["Commit original-identity checkpoint"]
  G --> H["Actual subsequent Main input"]
  H --> I["Reread sources using original references"]
~~~

Summarization remains a metered model request under the original Gateway, deadline, route limits and finalization reserve. One real summary was cut off under an additional hardcoded 900-output-token ceiling and returned `finishReason=length`; it was not adopted. The current system uses the applicable fitted Main request and finite route ceiling instead. An invalid result falls back to the original history rather than being retried until it looks successful.

A different real Run reduced its complete fitted request from **264,062 to 182,786 bytes** and later dispatched the adopted summary. These are distinct research runs, not a matched A/B result about quality or cost. What matters is the actual request sent to the model—not merely whether a summary file was written.

<div><a id="_8-was-the-complexity-worth-it"></a></div>

## 5. What Other Frameworks Do, and Why We Kept Our Own Ownership Rules

| Approach | Best fit | Why we chose an additional application contract |
| --- | --- | --- |
| [LangChain SummarizationMiddleware](https://reference.langchain.com/python/langchain/agents/middleware/summarization/SummarizationMiddleware) | Summarizes older messages at a threshold, retaining recent messages and AI/Tool pairs | Conversation management is useful; financial provenance, frozen grants, durable effects and cold recovery still belong to the application |
| [Anthropic Context Editing](https://platform.claude.com/docs/en/build-with-claude/context-editing) | Clears stale tool-result content from active context | Clearing does not create our original source and effect receipts |
| **ETF Agent Main compaction** | Externalize first, summarize only under pressure, keep original-Run ownership | Requires more implementation and identity checks, but a lossy note never becomes execution truth |

The point is **not that custom summaries are smarter**. It is that the summary cannot replace an execution ledger or source database. A casual conversation can tolerate looser paraphrase; research with dates, money and potentially repeated effects cannot.

<div><a id="observe-note-adoption-and-original-source-rereading-in-the-public-code"></a><a id="inspect-what-remains-readable-after-note-adoption"></a><a id="does-the-same-working-note-survive-a-process-restart"></a><a id="why-a-saved-report-must-not-become-merely-a-sentence-in-a-summary"></a></div>

## 6. A Runnable Public Teaching Slice

The public [Open ETF Agent](https://github.com/hpoenixf/open-etf-agent) provides a pinned synthetic exercise: create a derived working note under byte pressure, include it in a subsequent request, then reread original source material by `resultRef`. It demonstrates **actual note adoption with unchanged source identity**, not the private Main Recovery implementation in its entirety.

~~~bash
git clone https://github.com/hpoenixf/open-etf-agent.git open-etf-agent-compaction-demo
cd open-etf-agent-compaction-demo
git checkout --detach 05c0dd2dc550f4f7e5da034340ff5c3159768fcf
npm ci --ignore-scripts --no-audit --no-fund
npm run demo -- --case compact-and-reread
~~~

Inspect `run.jsonl`, `report.md` and `manifest.json` in the generated run directory. The note retains a `derived-summary` identity and projected note displays are marked `projectionOnly`; they are not counterfeit tool execution. Separate fixed public revisions include a [process-recovery test](https://github.com/hpoenixf/open-etf-agent/blob/ff5b9273ef0d239e804f61792702cd2e94174be7/test/durable-runtime.test.mjs) and [effect-receipt preservation tests](https://github.com/hpoenixf/open-etf-agent/blob/8ba24a15cb1ce6ad3a0ebd48141be0549bfda35a/test/compaction-receipts.test.mjs). They must not be backdated onto the original teaching snapshot.


<!-- open-etf-case:compaction@e1b8e4edde724548fab16d8ca4b205379bfa7f30 -->
For a reproducible fixed-CLI check, use the [original case entry](https://github.com/hpoenixf/open-etf-agent/blob/e1b8e4edde724548fab16d8ca4b205379bfa7f30/src/cli.mjs) and inspect the resulting source reread and report files:

~~~bash
node src/cli.mjs --case compact-and-reread --output runs/article-compaction
~~~

The selected CLI is from another pinned public snapshot; do not imply that the preceding demonstration and this case share one implementation version.
<!-- /open-etf-case -->

This is the concrete application of [principle 5, “Context is a workbench, not a fact database”](/en/principles#principle-5): retain original figures and execution effects first, then let Main continue through a lossy working note.

**The portable design judgment:** first identify which old material can be reread exactly; only summarize what remains useful as a working hint. If a lossy note becomes your only source of facts, reducing context size may simply manufacture a second, less trustworthy history.

## Further Reading and Discussion

**Two forms of compaction, two identities:** this essay covers checkpointed work inside one Main Run. [Cross-Run conversation compaction](/en/articles/agent-conversation-history-compaction-source-boundaries) prepares source-bound histories of completed question–answer pairs for later Runs, with immutable summaries and original user text retained separately. Their failure and recovery contracts differ.

[Read the original on the author's blog](https://hpoenixf.com/blog/agent-main-run-context-compaction) · [ETF Agent Engineering Library](https://github.com/hpoenixf/eff-agent-article) (stars welcome).
