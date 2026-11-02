---
title: "A Research Agent Needs More Than Tools: How Model, Harness, and Loop Work Together"
description: "A simple example involving fund holdings from different reporting dates explains how evidence should change an Agent’s judgment without changing execution history."
readingBrief:
  takeaways:
    - "A research loop matters when evidence changes strategy or conclusions, not when search counts rise; models judge meaning while execution owners preserve permissions, calculations, and commits."
    - "Financial claims must retain numbers, denominators, and valid dates; fresh articles citing old holdings or precise calculations on mismatched bases do not establish current findings."
    - "Children and Reviewers add evidence and counterexamples when useful, not votes; Run termination, publication, and an accessible report remain separate outcomes."
  appliesTo:
    - "Understanding how a financial-research model, harness, and loop cooperate, and checking whether new observations genuinely change subsequent actions."
  notFor:
    - "Using tool counts, expert counts, resolved flags, or orderly termination as proof of investment correctness, or assuming the public project implements the full design."
---

# A Research Agent Needs More Than Tools: How Model, Harness, and Loop Work Together

> **A good research assistant does not merely search more. It changes its conclusion when the evidence demands it.** Consider a teaching example: we want to compare two funds, but a newly published report quotes holdings from six months ago. Should the assistant search again, revise the claim, or say the evidence is insufficient? This article draws on ETF Agent design experience. The scenario is illustrative, not a verbatim production trace.

## 1. The investor wants a judgment, not ten searches

Suppose someone asks: “Has my fund portfolio become more concentrated in certain sectors? Given currency movements, should I change the allocation?”

Several different questions hide inside that sentence. Which reporting date do the holdings belong to? How do sector weights inside individual funds translate into exposure at the investor's portfolio level? Which FX date makes a cross-currency comparison meaningful? If exposure changed, was it due to prices, fund trading, or the investor's own allocations? Might holding the position still be reasonable?

If an Agent merely receives an instruction to “research thoroughly” and loops through search-and-summary tools, it can produce an impressive report by combining different dates and incompatible denominators.

**Our central design insight while building ETF Agent is that tools expand information access, while a research loop makes revised judgment possible. Trustworthy execution and source relationships make those revisions auditable.**

![A research journey from the investor's question through qualified sources and counterevidence to usable delivery](../../visuals/en/etf-agent-model-harness-research-loop/01-journey-en.svg)

An essential distinction follows: **more information is not automatically better research; longer execution is not automatically deeper reasoning**. Unless an observation changes the next action or the current conclusion, the loop is just repetition.

## 2. Who decides what to investigate, and who confirms that a source was read?

Continue with the fund example. The assistant sees that the new article cites old holdings and decides to find the original filing. Choosing *what matters* is a judgment call. Whether the file was authorized and actually fetched is an execution fact, not a matter of the model saying “I checked it.”

Three responsibilities make the distinction concrete:

| Question | Responsible party | In this example |
| --- | --- | --- |
| What should we read next, and how should contradictory evidence change the claim? | **Model** | Seek the original filing or qualify the conclusion |
| Was a call permitted, did reading actually succeed, and may the task continue safely? | **Harness and execution owners** | Record tool requests, receipts, limits, and recoverable state |
| Which date do the holdings describe, and how were totals computed? | **Original sources and calculation tools** | Preserve dates, denominators, and reproducible calculations |

A *harness* is the environment that supplies tools to a model, governs execution, and retains what actually happened. It may contain the research loop, but **being able to run a search does not make it an investment judge**. Likewise, interpreting a number gives a model no authority to change an account or approve a trade.

The takeaway matters more than the labels: **research direction can change; actual reads, permissions, calculations, and file saves must remain grounded in real records.**

## 3. The point of a loop is not repetition—it is a changed strategy

Think of research as repeating three ordinary steps: **decide what to check → actually check it → decide whether the new evidence requires another step**. If this quarter's holdings are missing, the assistant cannot simply continue with a claim about today's concentration.

ETF Agent's native research loop follows this rhythm: the model proposes its next move through native tool calls, `ActionRuntime` executes admitted work, and `CompletionGate` evaluates receipts and budgets to continue or stop. The lifecycle still names the model-turn stage `AgentTurn`, but the durable record is a native `ModelTurn`—not the retired JSON `AgentTurn` protocol. No general-purpose workflow manager is needed.

![Native research loop: Main judgment, Host execution, settled observations, and a choice to recheck, delegate, or publish](../../visuals/en/etf-agent-model-harness-research-loop/02-native-loop-en.svg)

Three time scales make this especially useful.

**First, an observation changes the next action.** Main may discover that a fund's NAV is current but its disclosed holdings are from a previous quarter. It should not therefore describe today's sector exposure as known. It can seek the filing, use an explicitly dated historical view, or state that the needed data is unavailable.

**Second, research questions can reopen within the same Run.** ETF Agent's optional `researchNeeds` hold model-authored working questions. “Confirm changes in sector exposure” may once have been marked `resolved`, only for Main to discover that the reported holdings cover too little of the fund. The model can reopen the question. This permits genuine revision without turning working-note status into a completion gate. A `resolved` flag is not a certificate of financial correctness.

**Third, continuation across time is not reconstruction of an old execution graph.** Durable records preserve the original Run's identity, grant, budgets, and settled receipts, but a record or checkpoint is not permission to execute again. Only an accepted Human/Child control wake may continue at a supported checkpoint within the original Run. Ordinary re-entry after an interrupted execution without such a wake settles the interruption and reads saved results, without replaying previous model or tool calls. An explicit Continue starts a linked new Run with independent admission. Unknown external effects must be reconciled rather than blindly retried.

These distinctions explain why ETF Agent has repeatedly concentrated Main, Child, Memory, Recovery, and Publication responsibilities in their original owners: **research strategy should be allowed to change, but recorded execution history should not change along with the model's opinion**.

## 4. Finance makes time—and the denominator—part of the answer

In generic technical systems, freshness is often modeled as one timestamp. An investment claim may involve several: market-event time, the holdings `dataAsOf` date, original disclosure date, correction date, news repost date, and the moment an Agent fetched the material.

Imagine an article published this morning that quotes a fund's six-month-old portfolio. The search result is recent; the portfolio is not. Similarly, a quarterly holdings report and a newer NAV observation may both be accurate without describing the same portfolio at the same instant.

![Different clocks in financial evidence: market event, data cutoff, official filing, reposting, and retrieval](../../visuals/en/etf-agent-model-harness-research-loop/03-financial-time-en.svg)

ETF Agent's existing Web/PDF reading, source identity, ResultRef, temporal semantics, and market tools provide different pieces of this problem. Source/Result preserves provenance and derivation relationships; temporal semantics explains user-relative dates and market sessions; finance tools supply the actual holdings or market-data definitions. The model consumes those materials and decides how to investigate contradictions or qualify its language.

There is also an easily missed arithmetic issue:

`Portfolio sector exposure ≈ Σ (investor's allocation to fund × that fund's weight in the sector)`

This is a simplified relationship to illustrate denominators, not a complete financial formula. Actual analysis must consider cash, non-equity assets, look-through coverage, overlapping exposures, reporting periods, and currencies. A Python calculation can be numerically precise while answering the wrong question if the lineage and assumptions get lost between fund-level data and portfolio-level conclusions.

The broader insight is that **a financial Agent needs to preserve the number, its denominator, and the date when that number was valid**. A citation link points the reader somewhere. A traceable relationship among sources, transformations, and conclusions explains what the analysis actually depends on.

## 5. Subagents should divide research work, not vote on the conclusion

Some investment questions benefit from specialists. ETF Agent already has Child lifecycles, different research methods, investment perspectives, and bounded bull–bear conversations. That does not imply every investigation needs a fixed team of expert personas.

A better rule is for Main to delegate when an independent branch is useful. One Child can compare two original filings; another can recalculate sector look-through within authorized data access. Different investment perspectives can challenge the premise that a rise in concentration automatically calls for selling.

A Child returns **its own result and source relationships**. Main consuming the Child's summary is not equivalent to Main reading the entire source document. A Reviewer flagging a possible issue contributes an opinion, not an automatic veto over publication or permission to place a trade.

The right question about multi-agent collaboration is therefore not “how many agents participated?” It is **whether the extra branch supplied missing evidence, better arithmetic, or a counterargument that actually changed the judgment**. If not, fewer Children may be clearer, cheaper, and easier to resume safely.

## 6. A finished Run is not the same as a delivered result

It is tempting to define completion in terms of internal events: the model stops calling tools, the Run terminates, a report string is generated, and the task is marked successful.

The investor cares about something different: does the report actually describe their portfolio? Do cash and total allocations reconcile? Why was that recommendation made? Can they open the file? Will the same evidence still appear when they return?

ETF Agent's existing Publication, Artifact, History, and progressive-answer mechanisms separate these facts. Independently sound partial explanations can be delivered early; a final answer can be committed later. Files have their own durable identity and access conditions. History should replay the correct version. A background study can continue while the user asks a separate short question.

![From model output to actual delivery: execution, source relationships, publication versions, files, and history are separate facts](../../visuals/en/etf-agent-model-harness-research-loop/04-delivery-en.svg)

This is not a call for a complicated approval workflow around every sentence. Quite the opposite: **deliver what can stand on its own, and describe what remains unknown without disguising it as finished research**. A Run may stop because the question has been sufficiently addressed, resources ran out, it is waiting for an external event, or the user cancelled. One attractive `completed` value should not erase those distinctions.

## 7. Three design choices worth carrying into other Agents

If we distill these engineering lessons into a single investment-research story, the interesting part is not the number of modules. It is three choices.

**First, let the model change its mind.** Do not turn it into a natural-language wrapper around a rigid workflow. New disclosures, contradictory sources, and counterevidence should affect the next research action. But changing a strategy does not require rewriting execution history.

**Second, make each verifiable fact someone's actual responsibility.** Who granted access, who supplied source data, who calculated the totals, and who confirmed the report was saved? Each answer needs a real record, not an all-knowing supervisor's assertion.

**Third, work backward from a report the user can use.** Can it be opened? Which date is it about? How were the numbers calculated? What evidence might support a different conclusion? Those questions matter more than the number of modules.

A good investment-research Agent need not know every answer. It should recognize when to continue investigating, when to revise a belief, and when only a qualified conclusion is justified. **The goal is not a loop that never stops; it is a system that can be corrected by evidence without losing the evidence.**


**Public implementation scope:** As of October 28, 2026, [Open ETF Agent's pinned v0.11 development commit](https://github.com/hpoenixf/open-etf-agent/tree/5f42c33892d57ed05e8cd09cad48573e6901995b) contains synthetic document comparison, result consumption, and bounded local text-layer PDF work. That commit's README still designated v0.10 as the qualified stable development baseline; the v0.11 PDF path was work in progress, not a separately qualified full research release. Neither the code nor the private design establishes live-model research quality.

---

[Six-layer panorama V3](/en/articles/017-prompt-to-answer-six-layer-panorama-v3) · [Financial evidence chain (Chinese original)](/articles/financial-agent-trustworthy-evidence-chain) · [Research results and provenance](/en/articles/tool-results-outside-model-context) · [Asynchronous research and delivery](/en/articles/agent-asynchronous-research-time-bound-delivery)

[ETF Agent engineering essays on GitHub](https://github.com/hpoenixf/eff-agent-article) · If these design choices are useful, consider giving the repository a Star.
