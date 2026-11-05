---
title: "From Tool Invocation to Model Input: A Traceable Agent Execution Chain"
description: "Why does an answer omit data after a successful tool call? Follow one read into later model requests, connecting receipts, projections and passive storage while comparing call tracing with result-consumption provenance."
readingBrief:
  takeaways:
    - "Tool execution, result projection, and actual model submission are separate events; connect their identities and versions before diagnosing unused data."
    - "Hooks may normalize declared arguments or narrow disclosure, but must not rewrite source facts or merge execution, projection, and retention into one success flag."
    - "Recovery should replay legitimate receipts, not execute again to improve a trace; observation gaps must neither veto research nor imply absent model input."
  appliesTo:
    - "Debugging a multi-turn agent whose tools succeed but whose later answers omit data, across dispatch, projection, and effective model requests."
  notFor:
    - "Proving model understanding, research correctness, or exactly-once execution by an external service."
---

# From Tool Invocation to Model Input: Connecting an Agent's Observability Chain

A tool returns five rows. The next model request contains only a reference, and a later request contains the five-row body. The backend sees one successful call, while different model turns receive different representations. “Did the tool succeed?” no longer explains missing information in the answer.

This is a teaching scenario. Our current design connects **execution receipts, result projections, actual requests and passive storage** using original identities. Each stage retains its own facts, so investigation can distinguish a tool defect, context assembly and model synthesis.

Here, “what the model saw” means observable submitted input, not an inference about its private understanding.

<span id="_1-standardize-the-execution-entry-before-standardizing-hooks"></span>
<span id="identity-assembly-can-fail-before-tool-dispatch"></span>

## 1. Encapsulate one read before adding more logs

Originally, the ordinary Runtime and recovery adapter jointly coordinated a read. The upper layer reserved attempts and supplied projection callbacks; the lower layer handled replay, dispatch, hooks and receipts. Each responsibility was reasonable, but callers had to know the handshake across them.

Even a well-logged new read could miss a projection or settlement step. Moving functions into one file would not reduce that protocol burden. We chose a Run-bound execution coordinator that encapsulates the sequence while reusing the original authorization, budgets and durable stores. This decision came from call-chain inspection, not a quantified comparison of production failure rates.

We route Native read calls through one execution coordinator. The caller submits a sealed model turn and action identity. The entry point coordinates authorization, budget, invocation, result projection and receipt finalization. New execution and recovery-time reads follow the same coordinated path. Knowledge retrieval algorithms remain in the retriever; they are not pulled into the generic executor.

This diagram summarizes a fresh read, omitting concurrency and recovery branches:

~~~mermaid
flowchart TD
    A["Model proposes a call"] --> B["Host validates admission"]
    B -->|Admitted| C["Tool read and projection"]
    C --> D["Gateway delivers actual input"]
~~~

The order and denial branch remain distinct:

1. The model proposes a tool call to the Host, which validates and admits it. **If not authorized**, the Host returns a denial receipt to the model and does not execute the tool.
2. **If admitted**, the Host executes the read and receives the raw result or failure from the tool. Passing through a common entry does not turn failure into success.
3. The Host asks the context Projector for an eligible result view; the Projector returns the projection and its status.
4. The Host assembles the next model request and submits it to the ModelGateway. Only the effective input and tool result delivered through that gateway are the model's actual input. Tool return, projection and model-input delivery are different events.


One entry point does **not** mean all business logic belongs in one module. It centralizes execution rules common to reads, so each new tool does not have to recreate authorization, receipts and observability; the common layer does not start interpreting every business domain.

Tools also cannot be correlated by name alone: the same tool may run concurrently more than once. We need run and action identities, the model-call ID, and separate links to requests that later consume the result. **The producing turn and the consuming turn are different concepts.**

Calls can fail even before execution: provider fragments must form a complete SDK proposal before Host dispatch. Without a dispatch receipt, inspect protocol assembly before calling it a tool-execution failure. The public implementation's `id: null` continuation case is covered in the [tool identity assembly article](agent-stream-tool-call-null-continuation.md), rather than repeated here.

## 2. Hooks Track Changes, Not Just Start and End

### Before a Call: Original Intent Versus Effective Arguments

A pre-call hook may reject a request or normalize parameters under declared rules. We preserve both originalArguments and effectiveArguments, and provide hooks with an immutable context snapshot.

For example, a tool may explicitly declare that “quarterly” is an alias for “Q”. The original and final values should both be retained. This is a teaching example: the mapping must come from the tool contract, not a generic hook guessing what the user meant. Modified arguments still require ordinary validation and authorization; hook approval alone does not execute the call.

Without both values, debugging cannot distinguish model output from normalization rules or the final upstream invocation.

### After a Call: Narrow the View Without Rewriting the Fact

Post-call processing distinguishes three objects: upstream raw output, the runtime-owned result, and the result view allowed into model context.

Our projection can narrow what is disclosed, but cannot silently change retained facts; derived explanations are separate from source values. Removing a private field is a display transformation. Replacing “no quote available” with a numerical zero fabricates information. Execution status and projection status are recorded separately; one “success” flag cannot stand in for both.

This means an upstream read that succeeds while projection fails is no longer misreported as an upstream outage. The repair target becomes a specific phase.

### On Failure: Record Where It Happened

Execution failure, unavailable result, projection failure and persistence failure require different remedies. The current diagnostics distinguish execution, result and projection, and retain phase facts for admission, reservation, invocation, replay, projection and persistence.

ToolFailure is a lifecycle extension point, not a universal catch that owns all phases. Hooks and observers also cannot seize control of receipts: permission denial and execution completion remain facts determined by the executor.

<span id="_3-extend-tracing-to-the-actual-model-request"></span>

## 3. How can one execution appear in several model requests?

Finishing post-call projection is not the end of the chain. During later context assembly, a result might be trimmed again or replaced with a reference that permits on-demand retrieval. Therefore, a post-call hook cannot establish that the next inference received the content.

Our gateway prepares a bounded snapshot when it has formed the effective SDK input, then links the snapshot to the actual submission event. The snapshot covers messages, tool definitions and relevant call parameters. It describes the effective SDK input, **not a byte-for-byte replay of the HTTP request**. A prepared request that was never submitted must not count as delivered.

Linking a result receipt to an input snapshot requires carrying provenance through transformations rather than guessing afterward:

**Attach identity when forming result representations from receipts; preserve the link during trimming or replacement; record the position after mapping to SDK messages; during capture, verify the run, action and result version.**

The current implementation carries these associations in-process rather than injecting trace fields into model-visible messages. A new object with no linkage stays unknown; we do not “reconnect” it just because the text looks similar.

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

In a controlled October 6, 2026 exercise, the model updated a research working note twice, and both updates were accepted. But after the first update, the next five model inputs did not contain the updated text. They only contained an unavailable/unknown-disclosure status. This used synthetic web material, not production user data.

Following the update receipt → state projection → actual request sequence located the fault in projection. The navigation result lacked a source identifier required for a formal reference. The then-current code downgraded the note's disclosure state to unknown; later access to the content did not restore it. It was not simply “the model forgot.” An accepted update had not been propagated correctly to future inputs.

The current working-note contract now specifies that later tool failures, summaries or source changes must not hide an already accepted working note. That is a state-propagation fix, not proof of a general improvement in answer quality.

Other observations similarly lead to different first checks:

| Observed fact | First place to investigate |
| --- | --- |
| Call denied before execution | Arguments, permissions and admission |
| Tool executed; projection failed | Post-call transformation and result structure |
| Projection succeeded; next request had only a reference | Context assembly and on-demand reads |
| Content truncated or provenance link missing | Collect missing trace evidence before blaming the model |

The gain is not a larger pile of logs. Each symptom now points to a different owner and repair location.

<span id="_5-recovery-and-observability-must-preserve-execution-facts"></span>
<span id="_6-october-2026-follow-up-execution-receipts-and-evidence-storage-have-different-owners"></span>

## 5. Let the observation chain fail without changing execution facts

When a read has finished with a legitimate receipt, recovery reuses its settled final result. It does not invoke upstream services or side-effecting hooks again to produce a complete trace. The original recovery store owns the receipt; observation adds no execution ledger. This avoids counting repeated appearances as new executions, but does not promise exactly-once external effects.

Observation copies have their own capture, queue, durable storage and readback path. A queued snapshot may not yet be stored. A failed historical read may reflect retention or present read eligibility. Neither implies that the original tool did not execute or that the model did not receive input at the time.

~~~mermaid
flowchart LR
    A[Original tool Host] --> B[Original Result and receipt]
    B --> C[Context projection]
    C --> D[Effective model request]
    D --> E[Original Gateway dispatch and settlement]
    D -. Passive capture attempt .-> F[E04 logical input copy]
    E -. Passive capture attempt .-> G[E04 observable output copy]
    F --> H[Bounded queue and persistent evidence]
    G --> H
    H --> I[Separately authorized readback]
~~~

The dotted edges are passive capture. They correlate original identities without taking control of the call. The [evidence store article](agent-research-evidence-store-lifecycle.md) explains capture admission, retention and readback. The practical ordering here is: **preserve the authoritative execution receipt, then let observation keep an accurate copy on its own path.**

Capture checks permission and configuration before traversing or copying bodies. Observers receive detached copies; exceptions cannot mutate actual requests. Capacity, provenance and storage gaps remain explicit. Disabled capture does not read extra bodies for diagnostics, and observation failure does not become whole-Run failure.

This yields a useful investigation order:

| Observation | What to inspect next |
| --- | --- |
| One result appears in two requests | Deduplicate executions by original receipt; inspect each representation separately |
| Request includes only a reference | Check whether a subsequent read returned the body |
| Copy is queued or expired | Inspect persistence and retention without repeating a settled action |
| Result was replaced, identity conflicts or linkage is missing | Keep the gap unknown rather than constructing a chain from similar text |

## 6. Why add result provenance when general tracing already works?

[OpenTelemetry's generative AI semantic conventions](https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/gen-ai/gen-ai-spans.md) provide common representations for model inference, tool execution and related inputs and outputs. Tracking latency, errors and tool names along calls is a reasonable starting point for most systems.

A call tree answers which call happened under which parent. Our question is which representation of which result reached a later request. One result can serve several later turns, first as a reference and then as a partial body. That consumption relationship is not simply parent-child nesting.

We retain existing tracing and storage, carrying result identity, version and appearance location through actual transformations. In-process associations keep diagnostic fields out of model messages and avoid another execution ledger. The cost is explicit propagation at each transformation: a missing handoff creates an observation gap rather than being reconstructed from text similarity.

For a single model call with an unchanged tool result, ordinary call tracing is often enough. Result consumption links become worth adding when externalized results, trimming, replay and multi-turn reuse appear. They supplement general tracing rather than replace it.

## 7. Inspect one small path in public teaching code

<!-- open-etf-case:batch@e1b8e4edde724548fab16d8ca4b205379bfa7f30 -->
### Follow batch-read results into the saved report

The [batch-read CLI at this fixed public snapshot](https://github.com/hpoenixf/open-etf-agent/blob/e1b8e4edde724548fab16d8ca4b205379bfa7f30/src/cli.mjs) offers an inspectable chain: two fixed read tasks return synthetic originals, then Main saves a cited report.

This example uses the linked fixed snapshot. Consult the [current README](https://github.com/hpoenixf/open-etf-agent/blob/main/README.md) for newer versions without mixing commands. After installing dependencies according to the fixed snapshot's README, run:

```bash
node src/cli.mjs --case batch-read --output runs/article-batch
```

Terminal `observations` records tool-result return and Run release. The returned `directory` contains `run.jsonl`, `report.md`, and `manifest.json`, allowing calls, acquired sources, and the final report to be compared rather than reduced to a success flag.

These are fixed read workers and local Hook observations, not concurrent model experts, a complete model-input tracing platform, or a Langfuse exporter. An observation alone does not prove an external effect was durably committed.
<!-- /open-etf-case -->

## Conclusion

When an answer omits material, work backward: what was in the relevant request, which result produced that representation, and which actual execution produced the result?

Connect the read entry point, result transformations and actual request submission, then keep evidence storage on a separately fallible path. This identifies a repair target more reliably than additional success logs, without repeating business actions merely to complete the trace.
