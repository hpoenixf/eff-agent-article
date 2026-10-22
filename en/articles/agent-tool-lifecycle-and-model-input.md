---
title: "From Tool Invocation to Model Input: A Traceable Agent Execution Chain"
description: "Lifecycle hooks, authorized projections, result-to-request provenance, failure phases and bounded model-input capture."
---

# From Tool Invocation to Model Input: Connecting an Agent's Observability Chain

The tool succeeded, the backend has the result—so why did the model fail to use it?

Investigating this question requires two linked traces: one showing **how the tool executed**, and another showing **how its result entered subsequent model requests**. Tool logs alone stop at “the tool is fine.” Input snapshots alone cannot explain where data changed along the way.

Our approach is to route read-oriented tools through a unified execution entry, capture execution and projection using lifecycle hooks, and relate the result to the model request actually submitted. Here, **“what the model saw” means observable request input, not the model's private understanding.**

## 1. Standardize the Execution Entry Before Standardizing Hooks

If web reading, knowledge retrieval and business-data queries each log from separate implementations, the same field easily represents different facts. One tool's “success” might mean its upstream provider responded; another's might mean parsing, trimming and storage have all finished.

We route Native read calls through one execution coordinator. The caller submits a sealed model turn and action identity. The entry point coordinates authorization, budget, invocation, result projection and receipt finalization. New execution and recovery-time reads follow the same coordinated path. Knowledge retrieval algorithms remain in the retriever; they are not pulled into the generic executor. [1](#evidence-runtime)

This diagram summarizes a fresh read, omitting concurrency and recovery branches:

~~~mermaid
sequenceDiagram
  participant M as Model
  participant H as Host
  participant T as Tool
  participant P as Projector
  participant G as ModelGateway
  M->>H: Propose tool call
  H->>H: Validate and admit
  alt Call not authorized
    H-->>M: Denial receipt
  else Call admitted
    H->>T: Execute read
    T-->>H: Raw result or failure
    H->>P: Create eligible result view
    P-->>H: Projection and status
    H->>G: Assemble next model request
    G-->>M: Effective input and tool result
  end
~~~

One entry point does **not** mean all business logic belongs in one module. It centralizes execution rules common to reads, so each new tool does not have to recreate authorization, receipts and observability; the common layer does not start interpreting every business domain.

Tools also cannot be correlated by name alone: the same tool may run concurrently more than once. We need run and action identities, the model-call ID, and separate links to requests that later consume the result. **The producing turn and the consuming turn are different concepts.** [5](#evidence-lineage)

## 2. Hooks Track Changes, Not Just Start and End

### Before a Call: Original Intent Versus Effective Arguments

A pre-call hook may reject a request or normalize parameters under declared rules. We preserve both originalArguments and effectiveArguments, and provide hooks with an immutable context snapshot. [2](#evidence-hooks)

For example, a tool may explicitly declare that “quarterly” is an alias for “Q”. The original and final values should both be retained. This is a teaching example: the mapping must come from the tool contract, not a generic hook guessing what the user meant. Modified arguments still require ordinary validation and authorization; hook approval alone does not execute the call.

Without both values, debugging cannot distinguish model output from normalization rules or the final upstream invocation.

### After a Call: Narrow the View Without Rewriting the Fact

Post-call processing distinguishes three objects: upstream raw output, the runtime-owned result, and the result view allowed into model context.

Our projection can narrow what is disclosed, but cannot silently change retained facts; derived explanations are separate from source values. Removing a private field is a display transformation. Replacing “no quote available” with a numerical zero fabricates information. Execution status and projection status are recorded separately; one “success” flag cannot stand in for both. [3](#evidence-projection)

This means an upstream read that succeeds while projection fails is no longer misreported as an upstream outage. The repair target becomes a specific phase.

### On Failure: Record Where It Happened

Execution failure, unavailable result, projection failure and persistence failure require different remedies. The current diagnostics distinguish execution, result and projection, and retain phase facts for admission, reservation, invocation, replay, projection and persistence. [4](#evidence-diagnostics)

ToolFailure is a lifecycle extension point, not a universal catch that owns all phases. Hooks and observers also cannot seize control of receipts: permission denial and execution completion remain facts determined by the executor.

## 3. Extend Tracing to the Actual Model Request

Finishing post-call projection is not the end of the chain. During later context assembly, a result might be trimmed again or replaced with a reference that permits on-demand retrieval. Therefore, a post-call hook cannot establish that the next inference received the content.

Our gateway prepares a bounded snapshot when it has formed the effective SDK input, then links the snapshot to the actual submission event. The snapshot covers messages, tool definitions and relevant call parameters. It describes the effective SDK input, **not a byte-for-byte replay of the HTTP request**. A prepared request that was never submitted must not count as delivered. [6](#evidence-capture)

Linking a result receipt to an input snapshot requires carrying provenance through transformations rather than guessing afterward:

**Attach identity when forming result representations from receipts; preserve the link during trimming or replacement; record the position after mapping to SDK messages; during capture, verify the run, action and result version.**

The current implementation carries these associations in-process rather than injecting trace fields into model-visible messages. A new object with no linkage stays unknown; we do not “reconnect” it just because the text looks similar. [5](#evidence-lineage)

A simplified diagnostic record—not the literal production interface—illustrates these facts. Imagine one external read produces a view of the first five rows, which later appears in two submitted requests:

~~~json
{
  "actionId": "read-7",
  "externalDispatches": 1,
  "executionStatus": "succeeded",
  "resultSelection": { "offset": 0, "limit": 5 },
  "appearances": [
    { "requestAttemptId": "request-8", "representation": "reference-only" },
    { "requestAttemptId": "request-9", "representation": "full" }
  ]
}
~~~

This record answers three questions. Request 8 contained only a reference, not the body. Request 9 carried the full **five-row selection**, not necessarily the complete upstream dataset. Both appearances came from one external execution; they must not be counted as duplicate dispatches.

To investigate “the model did not use the data,” locate the relevant inference request first, then inspect the result representation and associated receipt. Tool logs explain **how** the data was acquired; request snapshots explain **which representation** that turn received.

## 4. How This Trace Changed a Debugging Investigation

In a controlled October 6, 2026 exercise, the model updated a research working note twice, and both updates were accepted. But after the first update, the next five model inputs did not contain the updated text. They only contained an unavailable/unknown-disclosure status. This used synthetic web material, not production user data. [7](#evidence-case)

Following the update receipt → state projection → actual request sequence located the fault in projection. The navigation result lacked a source identifier required for a formal reference. The then-current code downgraded the note's disclosure state to unknown; later access to the content did not restore it. It was not simply “the model forgot.” An accepted update had not been propagated correctly to future inputs. [7](#evidence-case)

The current working-note contract now specifies that later tool failures, summaries or source changes must not hide an already accepted working note. That is a state-propagation fix, not proof of a general improvement in answer quality. [1](#evidence-runtime)

Other observations similarly lead to different first checks:

| Observed fact | First place to investigate |
| --- | --- |
| Call denied before execution | Arguments, permissions and admission |
| Tool executed; projection failed | Post-call transformation and result structure |
| Projection succeeded; next request had only a reference | Context assembly and on-demand reads |
| Content truncated or provenance link missing | Collect missing trace evidence before blaming the model |

The gain is not a larger pile of logs. Each symptom now points to a different owner and repair location.

## 5. Recovery, Isolation and Tests

Unified observability has two easy-to-miss hazards.

**Re-executing during recovery.** If a read has finished and a legitimate receipt exists, recovery should replay the result according to its contract, not invoke upstream services or side-effecting hooks just to generate a prettier trace. Recovery storage still owns the receipt; observability must not maintain a second execution ledger. The executor distinguishes fresh execution from receipt replay. This is **not** an exactly-once guarantee for external services. [1](#evidence-runtime) [8](#evidence-executor)

**Allowing observation to alter the business operation.** Body capture checks permission and configuration before iterating and copying content. Observers receive copies; exceptions must not mutate the actual request. If capture exceeds its limit, the gap must be recorded. “Not captured” does not mean “did not occur.” The implementation includes isolation and capacity controls for capture. [6](#evidence-capture)

Tests exercise cross-interface handoffs, not merely whether a hook ran once: [9](#evidence-tests)

| Test case | Required result |
| --- | --- |
| Same receipt appears in multiple requests | Each appearance logged; execution count unchanged |
| Context capacity replaces body with a reference | Snapshot lacks old body but retains original receipt association |
| Replaced result, duplicate identity or mismatched run | Never auto-associate a merely similar-looking result |
| Capture disabled, or observer mutates input then throws | No extra body inspection when disabled; callback error cannot affect request or receipt |

These tests validate the engineering trace, not the quality of the final research answer.

## Conclusion

For a multi-turn agent, tool lifecycle and model-input observability should be designed together. One explains how an action executed; the other explains how its result participated in subsequent inference.

Start with three connection points: **unified execution entry, result projection and actual request submission**. Preserving identities, versions and phase facts at those seams is more useful for finding the right repair than piling up unrelated “tool succeeded” log lines.

## Evidence Notes

The numbered references below identify evidence categories and source scope from the original manuscript. They are not automatically independently verifiable public artifacts.

- <span id="evidence-runtime">**[1]**</span> Read execution, research working notes and recovery contracts.
- <span id="evidence-hooks">**[2]**</span> Lifecycle hook arguments, scope and immutable context.
- <span id="evidence-projection">**[3]**</span> Post-call result layering and narrowing rules.
- <span id="evidence-diagnostics">**[4]**</span> Tool phase facts and multi-dimensional statuses.
- <span id="evidence-lineage">**[5]**</span> Receipt-to-request representation association.
- <span id="evidence-capture">**[6]**</span> Effective SDK input capture, submission events and isolation.
- <span id="evidence-case">**[7]**</span> October 6, 2026 controlled exercise.
- <span id="evidence-executor">**[8]**</span> Fresh execution and recovery paths in the read executor.
- <span id="evidence-tests">**[9]**</span> Result-linkage test implementation.
