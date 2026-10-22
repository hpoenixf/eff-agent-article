---
title: "Why Building a Small ETF Assistant Became an Engineering Problem"
description: "A dated first-week retrospective: timeouts, stale data, disappearing reports, confirmations and evidence-aware design."
---

# Why a Small ETF Investment Assistant Became an Engineering Problem

> First engineering essay · September 3, 2026
>
> This retrospective is based on development notes from August 26 to September 2, 2026. Early token usage was only roughly estimated; no verifiable billing data was available.

This is an origin story, **not the current architecture specification**. For the ongoing separation of understanding and authority, see [Models Understand; Code Authorizes](/articles/011-model-understands-code-authorizes). For the broader series, see [Why an Agent Needs Brakes First](/articles/010-agent-first-brakes). Those linked full articles remain in Chinese at the time of this translation.

Originally, I thought I was building a simple ETF assistant.

I did not want it to trade stocks for me. I wanted to ask “What do I hold?”, “What happened today?” or “Should I keep investing regularly?” and have it retrieve relevant facts and explain them plainly.

It sounded like a small project: ask a question, retrieve data, have a model compose Chinese text, then display a confirmation button.

Instead, the very first message did not return reliably.

## Act One: The Chat Window Started with a Timeout

On August 26, the page displayed: **“Chat model request timed out.”**

My first assumption was that the model service was down. But when I reduced the task to the smallest possible request, bypassing the knowledge base and tools, it replied “probe-ok” in about **5.9 seconds**.

The model was not dead. My assumption that a *complete* request would necessarily reach the end was wrong.

The supposedly simple path hid several stages: fetching source material, reading data, having the model compose an answer, and delivering it to the page.

When any one stage stalled, the user saw the same message: a timeout.

The ideal path was simple: question → current data → recommendation → user confirmation.

The actual path was timeout → isolate the failing stage → discover missing evidence → repair the input → only then consider giving advice.

The week's focus shifted from “make it smarter” to “teach it to stop under uncertainty.”

## Act Two: An Answer Does Not Mean It Knows

The most dangerous failure for an investment assistant is often not incorrect arithmetic. It is presenting an **old number as a current number**.

The underlying fact in a portfolio ledger is the number of units held. Current market value should be recomputed as **units × current NAV**, not inferred backwards from an old monetary snapshot.

One simple test asked, “Does my portfolio have gold exposure?” It sounds harmless, but it could influence the next investment decision.

Without reliable holdings data for that day, even saying “no” would be unjustified. The better answer is to acknowledge that the evidence is insufficient.

Another query asked for a Federal Reserve meeting schedule. The agent produced dates from **2025**.

The search words themselves were reasonable. The failure was that “today is in 2026” had not been carried into later queries, and subsequent searches did not preserve the year and date range.

The wording sounded credible, but the temporal context was wrong. A knowledge base explaining ETFs cannot substitute for a live portfolio ledger.

## Act Three: The Scariest Failures Looked Successful

On August 30, the UI reported that a tool invocation had finished, but the result was “NOT_FOUND.”

I initially blamed the tool. Tracing backward from page → tool → report directory revealed that the official daily-report reader expected date-named JSON files, while only an old HTML file remained.

The root cause was neither the model nor the tool protocol: a cleanup script had deleted the report directory. The input no longer existed; even a clever model could only report that it was missing.

Another subtler case followed. The file existed, but a complete daily report had been overwritten by a lightweight one, leading the system to display “No regular investment action today.”

File existence is not proof that it is the right file. A completed call is not proof that the answer can be trusted.

External services also break assumptions. A data provider may return an empty field; a model provider may return HTTP **403**. A successful connectivity probe certifies that particular attempt, not every future one.

On September 2, the frontend delivered another lesson: root-level checks passed while the page consistently returned HTTP **500**. Fixing the page back to **200** still did not justify claiming that the full browser interaction had been verified.

I also began tracing whether one source could survive the complete journey: daily-report generation, handoff to the assistant, persistence, replay and re-read. Testing one segment makes it easy to celebrate a misleading green result.

I began separating three questions: Can it invoke a tool? Can we trust its result? Can the complete task finish?

## Act Four: A Confirmation Button Is Far from an Actual Trade

The UI feature that worried me most was the **Confirm** button.

Once an answer contains “suggest buying,” the button looks like the next logical action. But a clickable button does not imply that an order should execute.

The browser may submit the identity of the proposal and a request identifier. Critical fields—amount, limits, reserves, NAV—must not become authoritative merely because the browser provided them.

The server must reload the proposal and recheck permission, expiration, version and source freshness. If any check fails, confirmation stops.

At the time, this flow did **not** write a real portfolio ledger. There was still a major step between clicking a button and changing actual holdings, and the model could not fill that step by assertion.

The recurring lesson was the distance between a UI affordance and an economic side effect. A sober verification layer has to sit between them.

## Context Costs Outgrew Expectations First

I made rough estimates of several long-context requests but had no billing records to verify them, so I do not treat them as actual spending.

The more immediate observation was that the model repeatedly read project background, history, evaluation samples and generated files. Input context became bloated before the codebase became large.

I began dividing materials into three groups: required every time, loaded only when needed, and archived unless explicitly requested. The goal was no longer to make the model read everything, but to make it read what the current task actually needed.

While building an investment assistant, I was also simplifying my own development workflow.

## Rough Architecture: The Model Above, the Facts Below

~~~mermaid
flowchart LR
  subgraph Facts["Readable facts"]
    Ledger["Portfolio ledger"]
    Market["Market data"]
    Research["Investment research"]
  end
  User["User question"] --> Model["Dialogue and model"]
  Model --> Access["Validate authorization and freshness"]
  Facts --> Access
  Access --> Draft["Draft analysis or recommendation"]
  Draft --> Confirm["User confirmation"]
  Rules["Fixed execution rules"] --> Gate["Backend revalidation"]
  Confirm --> Gate
~~~

The model interprets questions, requests sources and explains findings. Fixed application rules determine shares, amounts, limits and whether execution is allowed.

The model may propose an action; it cannot rewrite the ledger or perform an action simply by proposing it.

Passing a local test and delivering an entire product are two different facts. Learning to keep them separate was one of the biggest outcomes of that first week.

## What Had We Built After One Week?

It was not an autonomous investing robot.

It was closer to a cautious investing copilot: something that could put sourced material on the table, state when the data was collected, stop when evidence was insufficient, and isolate actions that require confirmation.

It could not guarantee external uptime, turn stale information into current information, bypass confirmation or prove transaction safety through local tests.

The accomplishment was not an “investing model,” but an early framework designed to keep a fluent model from making confident, unsupported mistakes.

## Lessons from That First Week

A small domain does not imply a small system. An ETF may look like a simple fund, but holdings, NAV, dates, confirmation and execution all need to be trustworthy, or the conclusion can be misleading.

The most useful engineering stories are not just when the model answered correctly. They are about when it nearly got things wrong: timeouts, wrong years, deleted reports, overwritten files, and the gap between a button and actual execution.

Verify data, authorization and action boundaries before adding more intelligence. If sources are insufficient, describe the gap rather than turning an estimate into a fact.

Later essays will draw on actual timeline and daily-development records. The next story in the original series begins with a browser timeout and a successful minimal model probe.

For now, this is the origin of an apparently modest ETF assistant—and the engineering system it gradually required.
