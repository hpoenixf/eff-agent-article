---
title: "Building Agents with Agents: Why Fixing Bugs Doesn't Complete the Research"
description: "A retrospective on source-proof loss, actual Python recovery, task-level convergence and evidence-backed engineering progress."
---

# When an Agent Builds Another Agent, Why Does Fixing Many Bugs Still Leave Real Research Unfinished?

> **Reading path:** AI Agent Engineering Practice, with connections to systems architecture. This article concerns convergence in complex development and acceptance tasks, rather than rating methodology or a single Runtime module.

After some time building ETF Agent, we faced a frustrating reality: the architecture kept getting more complete, local tests kept turning green, yet a real investment research task entrusted to the agent still did not finish.

An October 14, 2026 run recorded **26 physical model requests, 24 durable model turns and 4 publication blocks**, but History ended in **partial / research_interrupted**. No normal HTML report was delivered. All six subagent requests returned unavailable inputs; among thirteen script requests, most stopped after describing a method instead of running computation, rendering and export code.

Counting tool calls makes the system look busy. Counting passing local tests makes many capabilities look ready. Neither creates the result the user requested.

We stopped treating “number of faults repaired” as the same measure as “distance remaining to a completed task.”

## 1. Why Fixing the Last Error Produces an Endless Loop

An intuitive early-development cycle is to run a real question, find the last error code, add an adapter or prompt rule, run regression checks, then retry.

This is useful for isolated defects, but it often misses **handoffs between stages** in complex research.

For example, a result may already be stored but remain invisible to the model in the next turn. We could blame the model for forgetting, or increase token capacity. Yet the missing piece might be the proof of source eligibility used when projecting the result into the next request.

In another case, the model might submit a complete revision while History still shows the old one. Improving the final-answer prompt will not help if the failure is in the handoff from an accepted proposal to its persisted version.

We reframed the question from “What was the last error?” to **“Which real effects does the user goal require, which one is missing, and who owns that fact?”**

That reframing makes each change narrower. It does not automatically add yet another defensive rule to Runtime.

## 2. How Reconciling 93 Against 21 Changed the Diagnosis

In the interrupted research run, tool results had been stored. A separate, read-only check of source projection showed that **93 groups of stored results yielded only 21 visible groups**. Nine subsequent numeric results and three available catalog results were excluded.

We could no longer say simply that the model “failed to use the retrieved data.” For some results, the model never received the current proof required to use them at all.

We traced the problem to a specific producer defect: cumulative Run-level source proof incorrectly reused the narrower dependency merger intended for a single Publication. Publication's **eight-dependency** capacity had been applied to Run proof that should support **64 dependencies / 24 KiB**, losing the ninth valid relationship and those following it.

We fixed the producer, rather than weakening the downstream rejection of unauthorized dependencies. Regression coverage included 9, 32 and 64 legitimate dependencies; denial for 65; and negative cases involving missing, tampered and cross-Run proofs. The historical record reported **79 focused, 10 independent and 173 caller-side checks passing**.

This established a narrow engineering result: **we identified why an eligible source lost its authority during subsequent requests and performed bounded regression verification.**

But the original natural-language research run did not magically deliver its missing HTML report. We did not use this fix to declare the user task closed.

That is why capability progress and task progress need separate accounting.

## 3. A Positive Counterexample: Python Fixed the Error and Delivered the Report

On October 16, a Python-focused exercise produced a stronger end-to-end example.

A real subagent initially raised KeyError while reading a field. It switched to the actual input field, nav, and completed the required calculation. Its first attempt to generate HTML then raised NameError; a later revision fixed string concatenation.

The result did not stop at “the script succeeded” or “the model says the report was written.”

The subagent exported an **11,384-byte HTML** file through the normal analysis workspace. The Host retained its content type, size and digest. A real HTTP download returned status **200**, and byte comparison matched. Main actually consumed the download path returned by the child task, and a fresh History read still resolved the same file identity.

That real execution used **17 physical model requests**. The root run ended in approximately **251.5 seconds**. Separate calculations also checked returns and drawdown for a synthetic case.

This is meaningful engineering progress. It is not evidence that ETF Agent can now autonomously finish every index-allocation research task. The exercise focused on Python error correction and formal handoff. It did not certify the original task, independent variants, PDF appearance, cancellation, or investment-analysis quality.

Later attempts with natural questions still showed cases in which a Python proposal was rejected before execution, an HTML export failed, or an otherwise successful Python computation subsequently lost its source relationship.

**A real positive case and a real negative case can both be true.** Engineering reports should say what each proves, rather than forcing all runs into one polished success narrative.

## 4. Using AI to Build AI Without Turning Validation into an Infinite Task

Those experiences changed how we organize Coding Agent work.

**First, freeze the actual user question.** For example, one original question assesses autonomous research, while a controlled variant changes a single assumption about new capital. Freezing the question does not demand identical prose from the model. It ensures the next fix still addresses the same business task.

**Second, state the smallest testable proposition for each change.** “The ninth valid source dependency is retained” can be checked deterministically. “The user received a decision-useful investment report” additionally requires real delivered content and independent content judgment.

**Third, do not rerun an expensive complete live task for every local fix.** If a change touches only a stable, isolated interface, verify that interface first. Schedule a comparable real-path exercise when the change affects a mandatory handoff and valid permissions and comparable inputs exist. Prior failures, unknown billing and unfinished tasks do not turn green just because this regression passed.

**Fourth, preserve stopping conditions.** Not every failed idea needs to grow into a new Runtime layer, revision loop or Spec. Once a seam is ruled out, stop adding the same type of interceptor. A newly discovered risk should become its own bounded issue under the correct owner, not an excuse to keep one research run alive indefinitely.

This is different from “keep tuning prompts until quality feels better.” The Coding Agent should identify when to change code, when to improve observability, and when to accept a partial outcome.

## 5. What Should Spec, Evidence, History and Skill Each Own?

We had accumulated many engineering documents. Then we noticed that writing a new history entry for every failure and recreating the entire artifact set for every minor fix also creates a maintenance burden.

We increasingly apply distinct responsibilities:

- **Spec** defines intended behavior and acceptance criteria. It must not claim implementation is complete merely because it describes the target.
- **Evidence** records the version, actual execution outcome and failures without inventing missing facts during wrap-up.
- **History** promotes only events that change engineering judgment—for example, retracting an earlier claim that a missing answer was the model's fault.
- **Skill** preserves repeatable methods for future runs, rather than caching an already outdated snapshot of main.

These are not documents for documentation's sake. They keep the next Coding Agent from guessing what happened last time or repeating a path that has already been rejected.

The related articles on [Spec and Evidence](/articles/026-agent-spec-evidence-workflow) and [on-demand engineering knowledge](/articles/027-agent-context-document-history) explore those subjects in depth; this is not another Spec tutorial. Their complete English editions were not available in this batch.

## 6. Three Different Measures of Progress

I now prefer to distinguish three outcomes.

**Capability progress:** A concrete execution seam that previously failed now has an observed positive case and explicit negative cases, such as a downloadable file after Python correction.

**Attribution progress:** Even if the full task still fails, we can establish which owner caused the missing fact. The misuse of Publication capacity for Run source proof is an example.

**Product progress:** The user's original natural task actually finishes; its research claims are checkable, key risks and alternatives add decision value, and the formal artifact can be delivered and reopened.

These outcomes are not interchangeable. In particular, a report manually completed by a developer cannot count as an autonomous ETF Agent deliverable.

Within the evidence window ending October 17, 2026, complete autonomous research, independent variants and content quality still had outstanding work. We did not have comparable long-term engineering-cost or overall success-rate measurements and cannot claim quantified savings.

But the working principle became clearer:

**When using AI to build an agent, track whether each change actually alters a condition required for the user's task—not how many bugs were fixed.** Tests that demonstrate such a change are valuable. Extra model calls that merely dress a partial result as progress are not.

## Source and Validation Limits

This article draws on the autonomous index-allocation task and its original failures; the October 14 partial run and source-proof fix; the October 16 Python R4 correction and genuine HTML handoff; and later unfinished live acceptance work.

All numbers retain their original sample scope. We have not rerun the models or pooled separate test counts into a claim that the entire agent passed.

**Public-version note:** The original manuscript referred to private tests, specs and engineering logs not included with this article. We preserve the dated cases and bounded verification without passing private acceptance records off as publicly inspectable evidence.
