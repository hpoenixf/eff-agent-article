---
title: "What a Model Attempt Leaves Behind: Capturing, Retaining, and Reading Agent Research Evidence"
description: "A mechanism-level account of E04's passive, bounded capture of logical requests, observable outputs, and source dependencies—without turning telemetry into execution authority."
readingBrief:
  takeaways:
    - "Research evidence stores bounded observation copies, not execution receipts; dispatch, queue acceptance, and durable persistence remain separate facts."
    - "Capture permission precedes sensitive-content traversal; bounded queues and writes keep optional retention failures from rewriting dispatch, budgets, or Run termination."
    - "Historical reads recheck current access, source revocation, dependency versions, and integrity; retained copies authorize neither executable recovery nor billing claims."
  appliesTo:
    - "Designing auditable agent input/output retention, bounded asynchronous storage, and historical readback with revocation and expiry checks."
  notFor:
    - "Guaranteeing complete reconstruction of every call, replaying tasks from telemetry, or certifying production capture rates and financial research quality."
---

# What a Model Attempt Leaves Behind: Capturing, Retaining, and Reading Agent Research Evidence

After an agent fails, two records can disagree. The gateway shows a completed model call, but the tracing system cannot reconstruct its input. Or the report was saved, yet nobody can establish which material the model was actually allowed to consume. “Log everything” sounds attractive, but creates new problems: sensitive content gets retained without consent, persistence slows execution, and revoked sources may leak during historical inspection.

This article focuses on a specific module: **Research Evidence Retention and Readback (E04)**. It owns bounded observation copies of model exchanges and physical attempts. It does **not** own sending model requests, business execution, publication, semantic scoring, or executable recovery.

Examples and identities here are synthetic. The mechanisms reflect the engineering contracts reviewed on October 31, 2026; scoped engineering checks are not proof of complete production capture, better financial research, or reconciled billing.

## 1. First, separate three kinds of evidence

| Record | Owner of the original fact | What it answers | What it cannot establish |
| --- | --- | --- | --- |
| Execution/tool receipts | Original Gateway, Host, Run and domain Owners | Whether dispatch, execution, or publication committed | Whether the model understood the task correctly |
| E04 research evidence copies | Research Evidence Store | How much of a specific exchange/attempt's logical input and observable output was retained | Complete HTTP wire, exact charges, or a runnable checkpoint |
| Traces and diagnostics | Respective telemetry Owners | Which stages were observed, timing, and gaps | That every original event is represented |

These records should share stable identities, not a single “success” flag. **A request can be dispatched without being captured; being queued for capture does not prove durable persistence.**

## 2. The passive capture path

**Figure 1: Collection runs beside execution. Rejecting observation must not veto the original call.**

~~~mermaid
flowchart TD
    A[Original Run and request Owner] --> B[Bind exchange and attempt identity]
    B --> C{Run admitted and capture policy permits?}
    C -- No --> G[Record a bounded gap reason]
    C -- Yes --> D[Observe logical request and output]
    D --> E{Encodable and queue has capacity?}
    E -- No --> G
    E -- Yes --> F[Queue persistence in Evidence Store]
    F --> H{Write and source checks succeed?}
    H -- Yes --> I[Retain independent evidence reference]
    H -- No or unknown --> G
    B --> J[Original Gateway dispatch and settlement]
    G -. Does not veto .-> J
~~~

The observer is intentionally not a mandatory gateway. The original request Owner governs authorization, budgets, dispatch, retry, and settlement. E04 may reject capture or later reading, but it cannot convert “cannot record this call” into “the research must stop.”

A captured attempt has two independently observable parts:

1. **logical-request**: the effective provider-neutral SDK input, including route, model, messages, tool schemas and request options. It is neither a prompt template nor raw HTTP bytes.
2. **observable-output**: observed text, tool calls and input fragments, settlement and partial usage. Truncation and missing content remain explicit.

Run, exchange, attempt, and part are separate identity dimensions. One logical exchange may involve several physical attempts. Even within one attempt, the input and output parts can have different capture outcomes. An available output does not prove that its input copy is complete.

## 3. Check permission before traversing content

The most important ordering rule is **admission first, sensitive payload traversal second**. Model requests may include holdings, user messages, personal preferences, and access-controlled documents. An observer must not serialize them and only then discover that the user opted out.

Capture is conditional on the server-owned Run/Scope admission and content policy. Temporary mode, content opt-out, sampling, expiry and capacity can suppress capture. Source IDs and dependency versions are bound to a part; before asynchronous persistence, the writer rechecks authorization, revocation, and dependency validity.

An intentionally uncaptured Run should not acquire a hidden “debug copy.” Neither deliberate opt-out nor collection failure means an empty model request, zero usage, or successful no-content output.

## 4. A finite queue must never become execution backpressure

A passive observer encodes bounded data, computes a digest, and requests asynchronous storage. The **default policy**, not an achieved capture rate, specifies **256 KiB per part, 128 parts and 16 MiB per Run, 32 pending parts and 4 MiB pending bytes, and a 2-second observed write timeout**. These are configurable initial limits, not guarantees that every attempt will fit.

When limits are reached, capture returns an explicit gap. The same applies to invalid snapshots, unsupported versions, or storage uncertainty:

- **queued** is not the same as durably **stored**;
- a timed-out underlying operation may still be in flight, so its capacity must remain reserved until it actually settles;
- failure of optional evidence persistence does not rewrite dispatch, budget, Run termination, or existing publications.

A call may leave only its request, only its output, or neither. The data model must be honest about each possibility.

## 5. Readback is not permission to resurrect old context

**Figure 2: Read authorization, index discovery, and content selection are distinct checks.**

~~~mermaid
flowchart TD
    A[Request historical evidence for a Run] --> B{Viewer and Scope authorized?}
    B -- No --> X[permission_denied]
    B -- Yes --> C[List metadata and paginated references]
    C --> D{Part exists and retention is active?}
    D -- No --> Y[not_found or retention_expired]
    D -- Yes --> E[Select one evidence reference]
    E --> F{Digest, source and dependencies still valid?}
    F -- No --> Z[integrity_mismatch or source_unavailable]
    F -- Yes --> G[Return bounded content and identity]
~~~

A metadata page can expose a part reference, format, size, capture time, dispatch and settlement without leaking its private source bindings. Pagination uses **per-page-live** consistency: each page has its own observation window. It is not an atomic snapshot of the whole Run.

Selecting content triggers fresh permission, digest, revocation and dependency checks. Permission granted to the original caller does not transfer to another viewer, a new Run, or a user whose document access has since been revoked.

Expiry and purge must remain explicit. A deleted snapshot must not reappear through an old reference or stale index. Yet purging E04 evidence does not automatically erase business records, trades, or independently published answers.

## 6. Three failure branches worth testing

The following scenarios are synthetic mechanism tests, not historical traces.

| Input / observation | Correct behavior | Incorrect shortcut |
| --- | --- | --- |
| Temporary Run; model dispatch succeeds | Suppress body capture, mark the observation gap; execution settles independently | Secretly retain the full prompt for debugging |
| Attempt A dispatches, stream interrupts, request copy survives | Keep the known request, mark output missing or unknown | Fabricate a failed output or zero usage |
| A previously valid source is revoked before readback | Re-evaluate source and dependency eligibility; reject where necessary | Reveal historical content solely because its hash still matches |

An illustrative structured receipt:

~~~json
{
  "runId": "demo-run",
  "exchangeId": "research-4",
  "attemptId": "physical-2",
  "part": "observable-output",
  "capture": "not_captured",
  "reason": "capacity_exceeded",
  "dispatch": "unknown"
}
~~~

This is a teaching projection, **not** the production public response schema. Unknown must never silently become not-dispatched.

## 7. Where E04 stops

**Tracing (E01)** provides a timeline and diagnostic lens. A complete trace query does not certify exhaustive input capture. **Cost observation** can correlate original physical attempts and partial vendor usage, but list price, subscription credits, actual charges, and allocation to a particular deliverable remain distinct. An input snapshot is not a bill. **Recovery** requires executable state, original grants, and a valid checkpoint; E04's read-only copies grant no permission to execute again.

The Store's **depth** lies in one limited interface covering admission, bounded encoding, asynchronous persistence, lifecycle rules, readback, and purge. Its own failures remain local rather than turning telemetry into a global veto.

## Conclusion: useful evidence includes the known gaps

A trustworthy system should not promise perfect reconstruction of every agent call. It should distinguish original execution, attempted capture, durable storage, current read permission, and lost or expired parts. That separation turns a debugging artifact into an honest, inspectable piece of evidence.

Further reading: [Tool-to-model input lifecycle](/en/articles/agent-tool-lifecycle-and-model-input) · [The Trace Says Complete](/en/articles/agent-trace-complete-observation-gaps) · [Cost attribution](/en/articles/agent-report-cost-attribution) · [Observability panorama](/en/articles/025-agent-langfuse-from-trace-to-trustworthy-observability).
