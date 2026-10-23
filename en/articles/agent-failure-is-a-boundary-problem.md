# Stop Blaming Every Agent Failure on the Model: From Coarse Error Codes to a Verifiable Failure Chain

The longer I build Agents, the less I trust a single catch-all error such as **PROVIDER_UNAVAILABLE**.

It seems precise: the model provider is unavailable. So developers retry, switch models, increase timeouts, inspect provider status, and run the task again.

But we eventually encountered a much more awkward situation: the model request **had completed normally**, with HTTP 200 and a complete stream. The failure was **downstream Publication validation**. We had been retrying the part that was not broken.

"No answer" describes the outcome, not the cause. It can result from dispatch never happening, provider failure, stream interruption, structured-output parsing, tool execution, publication validation, persistence, or delivery.

If all these conditions collapse into **PROVIDER_UNAVAILABLE**, the error vocabulary gets simpler while diagnosis becomes less accurate.

Our first change was deliberately modest: do not automatically guess the "root cause." **Record the last definitively observed blocking stage first.**

## 1. We Had Enough Logs, but No Reliable Relationships Between Them

Model calls, tools, Publication, databases, and frontend streams all produce logs. They often exist as unrelated fragments.

A timeline might read:

~~~text
14:03:01 model request started
14:03:07 provider 200
14:03:08 candidate parsed
14:03:08 publication rejected
14:03:09 another model turn started
14:03:15 block committed
14:03:15 stream closed
~~~

It is tempting to tell a complete story: the first answer was rejected, the model read feedback, fixed it, committed the revision, and delivered it.

But three relationships are not established by that sequence:

1. Did the next model request **actually consume** the rejection feedback?
2. Was the later committed block really a **revision of the rejected block**?
3. Did the user **actually receive** the committed block?

Temporal proximity is not causality. We needed both stages and **identities/receipts linking legitimate effects**.

~~~mermaid
flowchart LR
  Request["Request submitted"] --> Provider["Model response"]
  Provider --> Parse["Parse result"]
  Parse --> Tool["Tool execution"]
  Tool --> Publication["Publication handling"]
  Publication --> Storage["Persistence"]
  Storage --> Delivery["User delivery"]
  Request -. "Correlation identities and receipts" .-> Delivery
~~~

This sketches possible stages. Only shared Run identities and actual receipts establish connections; neighboring timestamps alone do not.

## 2. First Improvement: Last Confirmed Blocker, Not Imagined Root Cause

We considered fields like **rootCause** or **primaryFailure** and rejected them.

Suppose:

~~~text
Provider returns 200
→ JSON parses successfully
→ Publication validation rejects
→ No content is delivered
~~~

We can establish that **publication validation** was the last confirmed barrier to complete delivery. We cannot yet establish *why* it rejected: malformed model content, an overly strict rule, invalid upstream data, or a contract mismatch are all possibilities.

So the diagnostic field is **terminalBlocker**, not **rootCause**:

~~~json
{
  "terminalBlocker": "publication_validation",
  "delivery": "none"
}
~~~

It makes a narrower, defensible claim: **given the verified facts, this is where the chain was definitively stopped**. That is already enough to prevent irrelevant model-provider troubleshooting.

## 3. HTTP 200 Is Only One Successful Hop

API debugging creates strong habits: 200 means success, 4xx client error, 5xx server error. In an Agent, provider HTTP success confirms only one segment.

~~~text
provider response
→ stream assembly
→ JSON parse
→ schema validation
→ Runtime orchestration
→ tool execution
→ Publication validation
→ Publication commit
→ delivery
~~~

Parsing deserves its own failure identity. The current classification contract places invalid or truncated JSON under **response_parse** and forbids reporting it as **PROVIDER_UNAVAILABLE**.

One controlled live audit observed **STRUCTURED_OUTPUT_INVALID_JSON**. That audit did not provide an HTTP status, so it is **not** presented here as a measured case of failure *after* HTTP 200. It illustrates the distinction between parsing and transport failure, nothing stronger.

Without stage ownership, we had patterns such as:

~~~text
Invalid output schema       → provider unavailable
Business deadline exceeded  → provider timeout
Explicit user cancellation  → provider timeout
Publication rejected        → provider unavailable
~~~

The provider becomes a dumping ground for unrelated errors.

Timeout attribution particularly benefited from one simple field:

~~~text
timeoutOwner =
  provider
  | business
  | user
  | unknown
~~~

The layer **actually initiating the abort** records this fact. It is not inferred by the model or guessed from nearby timestamps. Provider timeout and a product-wide business deadline require completely different fixes.

## 4. Diagnosis Does Not Require Duplicating the Answer Body

Capturing every user question, model response, and raw tool result in the diagnosis store would create a larger privacy and operations problem.

We deliberately separated **diagnostic facts** from **content**:

~~~json
{
  "runId": "...",
  "timeline": [
    {
      "stage": "provider_dispatch",
      "status": "ok"
    },
    {
      "stage": "response_parse",
      "status": "ok"
    },
    {
      "stage": "publication_validation",
      "status": "rejected",
      "reasonCodes": ["..."]
    }
  ],
  "summary": {
    "terminalBlocker": "publication_validation",
    "delivery": "none"
  }
}
~~~

The long-lived record needs allowed reason codes, stages, status, delivery facts, and explicit unknowns—not the answer text.

Raw body access may occasionally be needed during a tightly scoped incident investigation. It should not silently become permanent diagnostic storage.

**Diagnosable does not mean "retain every original byte."** Stable identities and bounded metadata often establish where to investigate without exposing sensitive research contents.

## 5. A Was Rejected and C Was Committed: That Does Not Mean A Was Repaired

Consider:

~~~text
A rejected
→ Model continues
→ C committed
~~~

Readers may silently convert this to "the model fixed A." But **C may be an independent block**, may answer an entirely different question, or may have existed before A failed.

Sequence alone proves no repair. A defensible repair chain instead resembles:

~~~text
A revision 1 rejected
→ Feedback consumed by model turn 3
→ A revision 2 proposed
→ A revision 2 validated
→ A revision 2 committed
→ A revision 2 delivered
~~~

Each step has a different identity and evidentiary meaning.

Even proof that a later model turn happened does not establish that it consumed feedback. We need an explicit relation such as:

~~~json
{
  "actionId": "...",
  "proposedByModelTurnId": "turn-2",
  "consumedByModelTurnId": "turn-3"
}
~~~

A stricter implementation verifies that the **actual next request transcript** was bound to the earlier feedback.

Without such links, a "self-repair success rate" calculated from neighboring timeline events can be a fictional number.

## 6. The Model Receiving Feedback Is Not the Model Understanding It

Suppose we prove that the rejection feedback appeared in the next model request. That proves **the model had an opportunity to see it**.

It does not prove comprehension or that the eventual answer correctly applied the feedback.

System-observable stages are:

~~~text
Feedback included in request: verifiable
Later version linked as revision of A: verifiable
Later version passed validation: verifiable
Later version committed: verifiable
Later version sent: verifiable at the corresponding layer
Model genuinely understood the correction: not established by these facts
~~~

This limit is inconvenient but necessary. A diagnostic system must not become a speculative interpreter of the model's mental state.

## 7. Publication Commit Is Not Delivery

In a streaming Agent, a committed block is a strong signal—yet it still does not mean the user saw it.

Possible states include:

~~~text
validated
→ committed
→ projected / emitted
→ client received
→ rendered
~~~

Not every product measures every stage. The discipline is to **claim no more than the last observed one**.

If only commit is proven, say "the content was committed," not "delivered" or "seen by the user." A server-send record supports a narrower transport statement. An actual client ACK, sequence acknowledgment, or rendering receipt can support later claims.

Agents often turn "**the next step probably occurred**" into "**the next step did occur**." Diagnosis must resist precisely that shortcut.

## 8. Feedback and Observability Can Mislead the Repair Itself

Stage-specific records still need scrutiny: was the observer correct, and was the effect read back from its real owner?

| Observed symptom | Facts to distinguish | Actual repair locus and related case |
| --- | --- | --- |
| Strict JSON evaluator cannot parse a score | Truncated evaluator output versus weak tested answer | [The evaluator itself can fail](honest-agent-evaluation.md); fixing score formatting does not improve answer quality |
| Missing Trace turn or body | No invocation versus invocation with missing capture | [Langfuse capture limits and missing-body receipts](025-agent-langfuse-from-trace-to-trustworthy-observability.md); telemetry absence is not execution absence |
| Recovery still shows old text | Model failed to revise versus revision never persisted | Compare original block identity, proposal, preview, commit, and readback; not just the final page |

In the third case, the model did submit a complete revised body, the tool accepted a **replaces** proposal, and preview showed the revised article. A nonstandard Factory path coordinated commit without persisting the replace effect.

After correcting that path using the original Recovery identity, a deterministic regression observed the new body persisted and included in the next model request.

The original attribution—"the model cannot write a complete final answer"—was withdrawn. Correcting persistence still does **not** establish higher writing quality.

These historical incidents came from separate execution windows.

## 9. A Failure Is a Bounded Investigation Chain

We ultimately need answers to a limited sequence of questions:

1. Was the request actually dispatched?
2. Did the provider respond?
3. Did parsing succeed?
4. Did Runtime orchestrate correctly?
5. Did the tool complete its effect?
6. Did Publication validation accept the candidate?
7. Was the content committed?
8. Did it enter the delivery chain?
9. Which transitions have proven identities and receipts?
10. Where must the answer remain **unknown**?

A bounded summary can then say:

~~~json
{
  "terminalBlocker": "publication_validation",
  "contributingFailures": [
    "provider_dispatch:http_permanent"
  ],
  "delivery": "none",
  "classificationConfidence": "partial"
}
~~~

The **partial** qualifier is load-bearing. Until delivery identity is connected to individual blocks and revisions, aggregate counts cannot establish **confirmed** correspondence.

For example:

~~~text
Expected: A B C
Receipts: A B B
Count:    3
~~~

Equal totals do not make the identities equal.

**Aggregate counts are useful. They cannot replace per-object identity.**

## 10. Diagnosis Must Not Break the Business Path

Instrumentation is often described as "side-channel," and then written like this:

~~~text
await writeDiagnosticEvent()
await executeTool()
~~~

Or:

~~~text
const result = await executeTool()
await writeDiagnosticEvent()
return result
~~~

A slow diagnostic sink now blocks actual dispatch or return.

Our review found such risks in another lifecycle logging path: awaiting **start** logging could delay tool dispatch; awaiting **settle** logging could delay wrapper completion.

That does **not** prove production database lock contention occurred. It shows that "it's observability code, therefore non-blocking" is an unjustified assumption.

For each genuinely side-channel projection, test business behavior with:

~~~text
diagnostics off
diagnostics on
diagnostic sink slow
diagnostic sink failed
~~~

Only then may one claim non-interference, and only for the tested scope. Proving one diagnostic projection safe does not certify every logger in the repository.

Prefer "**this path did not change the business trace under these test conditions**" over an unrestricted "observability is non-blocking."

## 11. Sometimes "Unknown" Is More Useful Than an Incorrect Error

One counterintuitive outcome of better diagnostics was **more explicit unknowns**:

~~~text
delivery = unknown
repairOutcome = unknown
usage = unknown
cost = unknown
~~~

Previously these gaps might have been guessed as zero, false, or failed.

But no captured cost does not mean zero cost. No observed delivery receipt does not prove nothing arrived. A later successful block does not prove a prior rejection was repaired. Lacking positive provider availability evidence does not justify inventing a provider-unavailable failure.

The job is to keep **known, unknown, and inferred** separate.

If an apparently complete diagnostic system has almost no unknowns, it may be inventing more certainty than it measures.

## 12. Three Particularly Dangerous Shortcuts

### HTTP 200 ⇒ success?

No. It proves the provider hop completed under its contract, not that parsing, tools, Publication, and delivery succeeded.

### A later success ⇒ the earlier issue was fixed?

No. Verify object identity, revision links, and actual feedback consumption. Chronology does not establish causality.

### Commit ⇒ the user received it?

No. Commit, server emission, client receipt, and render are distinct effects. Match the claim to its evidence.

These rules are not exotic. Long Agent execution chains simply make it easy to narrate convenient transitions that were never verified.

## 13. What Diagnosis Can Establish—and What It Cannot Replace

The engineering path now distinguishes failures by stage, traces whether tool results enter subsequent model requests, and separates committed answer text from actual delivery. A rejection no longer has to be attributed generically to the model or Provider, and diagnostic capture must not alter the business outcome.

Locating the last confirmed blocker is the starting point of root-cause investigation. Cross-revision delivery identity, long-term recovery, and cost effects need evidence from their respective executions.

This diagnostic approach applies [method 5, “Choosing verification and diagnosing failure”](/en/principles#method-5): locate the last confirmed blocker and its owner before deciding whether to repair code, add observation or retain an unknown outcome. The most visible error code is not necessarily the cause of the entire task's failure.

## Conclusion

When an Agent fails to answer, the model might be at fault. So might Runtime, parsing, tools, Publication, persistence, or delivery.

I now begin with the sequence of actual facts: was a request dispatched, did the Provider respond, did parsing pass, did the tool execute, was text accepted and committed, and what evidence exists that it reached the user?

**Do not automate a guessed root cause before recording what happened at each hop.**

**terminalBlocker** is not root-cause analysis. A timeline is not proof of causation. Commit is not delivery. Feedback being present in context is not model comprehension.

These constraints make the story less satisfyingly simple—but they make diagnosis faster and more reliable.

An accurate **"we do not know yet"** is often a better next step than a fluent, complete, and incorrect explanation.
