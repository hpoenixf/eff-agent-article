---
title: "Does a Model Response Mean the Agent Succeeded?"
description: "Why completed, answer quality, evidence coverage, actual streaming delivery and evaluation corrections are different facts."
---

# Does Getting a Model Response Mean an Agent Successfully Ran?

While evaluating models for an agent recently, I encountered a puzzling situation.

The server had an answer candidate, the automated judge returned a verdict, and the Run was even marked completed. From the evaluation report alone, the request looked finished.

Following the frontend delivery chain revealed a different story. The existence of a candidate does not mean it was sent. Even a server-side send event does not prove the browser fully received and rendered the response.

I used to treat those states as nearly interchangeable. The most misleading evaluation reports do exactly that: **collapse success at different levels into one pass status**. A score may look good while the actual delivery path has serious gaps.

So what are we evaluating, and on what basis can we say an agent request actually succeeded?

## Completed Describes One Program State

In ordinary HTTP APIs, success versus failure may appear relatively straightforward. An agent request has a much longer path.

~~~mermaid
sequenceDiagram
  participant U as User
  participant R as Runtime
  participant M as Model
  participant S as Server
  participant C as Client
  U->>R: Submit question
  R->>M: Request research and answer
  M-->>R: Candidate answer
  R->>S: Publish and send events
  S-->>C: Transport content
  C-->>U: Receive and display
~~~

Each arrow proves only its own handoff. Candidate generation, server send, client receipt and UI rendering need separate observations.

~~~text
User question
→ Planning
→ Tool calls
→ Evidence assembly
→ Candidate answer
→ Quality checks
→ Streaming delivery
→ Client reception and display
~~~

These stages do not all pass or fail together.

A JSON object may be valid while planning misunderstands the task. A good plan may fail to invoke a necessary tool. A successful tool invocation may return stale evidence. A fluent candidate may be rejected at publication. A stream may terminate halfway through. Or the server may record a complete send without enough client evidence of a complete render.

An isolated success=true cannot preserve these distinctions.

I now separate the questions:

| Layer | What we need to establish |
| --- | --- |
| Protocol | Can the system parse the response? |
| Planning | Did the model understand the task and evidence requirements? |
| Evidence | Was the required eligible data actually obtained? |
| Answer | Is the final content accurate, safe and supported? |
| Delivery | Did the content actually enter the user-facing delivery path? |

Success in one layer does not certify the next. HTTP 200 does not establish answer quality. completed does not prove the user saw an answer.

## I No Longer Rush to Compute One Overall Score

It is tempting to rate protocol, planning, tool calls and answer quality separately, then compute a weighted 82, 87 or 91.

Some properties should not be averaged away.

If a model writes beautiful prose but lacks essential evidence, language quality must not compensate for that gap. If no answer was ever sent, an excellent server-side candidate should not receive an attractive overall score.

I prefer a vector of outcomes:

~~~text
Protocol = pass
Planning = pass
Evidence = inconclusive
Answer = not_evaluated
Delivery = pass
~~~

It is less visually impressive but much more diagnostic: protocol and planning worked; the delivery mechanism ran; evidence was not closed, so the run cannot support claims about answer quality.

The term **inconclusive** is important. It does not mean “failed, but politely.”

Failed means we have enough evidence that a requirement was violated. Inconclusive means the evidence is insufficient to decide. The appropriate next actions differ: repair an established failure, but collect evidence for an inconclusive outcome.

Treating both as zero risks ranking models by infrastructure noise rather than model quality.

## The Denominator Can Be More Deceptive Than the Score

A subtle trap occurs when **the denominator silently shrinks**.

Suppose we planned 30 test questions. Twenty remain unfinished within the observation window because of queues, timeouts or tool problems. Of the ten that completed, nine returned nonempty content.

This statement is accurate:

> Nine of ten completed samples returned an answer.

This one is not equivalent:

> The success rate was 90%.

The twenty unfinished cases may be precisely those requiring long context, multiple tools, repeated correction or complex reasoning. They are not necessarily missing at random.

Only evaluating completed cases measures performance **conditional on already having finished**, not performance on the original suite.

We therefore freeze the denominator and the experiment identity before a run:

~~~json
{
  "suite": "agent-cases-v1",
  "sourceHash": "sha256:...",
  "revision": "git-revision",
  "modelId": "provider/model-version",
  "profile": "live-read-only",
  "attempt": 1
}
~~~

Change the suite, code, model version or environment and you have a different comparison window. You may compare windows, but you cannot pool them into a flattering new percentage while pretending conditions remained identical.

This convention makes dashboards less appealing. It also keeps the hardest and most informative unfinished samples from disappearing.

## The Judge May Not See What the User Received

This is the most important distinction to me.

Many automated evaluations inspect a candidate on the server. The candidate goes to a judge that checks claims, formatting, citations or tone, then returns a verdict.

That is technically legitimate. But in a streaming product we must ask:

**Did the judge rate the same content the user actually received?**

Maybe not. Publication could reject a complete candidate. The first half of a stream could be delivered before a timeout loses the second half.

Even if a server records send, without a client ACK, receipt event or render evidence, the strongest defensible claim may be:

> The server recorded sending this material.

Not:

> The user definitely saw the entire answer.

An evaluation should distinguish at least three representations:

~~~text
Model candidate
     ↓
Actual server-emitted content
     ↓
Client receipt / display evidence
~~~

The middle representation is often the easiest to reconstruct reliably: concatenate the actual outbound content events in order.

If the client produces ACKs, message sequence numbers or rendering receipts, they can support stronger statements about the final level. Without them, do not rename “sent” to “seen” just to make a metric look more satisfying.

### Reconstructing Server-Delivered Content

A streaming answer is an **event history**, not merely one final string.

For example:

~~~text
run started
tool call
tool result
text delta #1
text delta #2
text delta #3
terminal
~~~

The text given to an evaluator should be reconstructed from **actual outbound text delta events**, rather than copied from a saved candidate that might never have been delivered.

This exposes a common false green:

> The judge marked the answer complete, but the client-side path received only the first half.

If a stream ended early, the evaluated delivery should contain only bytes or text actually emitted before interruption. A better server-side draft written afterward cannot rewrite that run's original history.

This is why agent evaluation differs from a conventional language-model benchmark: it evaluates a **distributed delivery process** as well as model output.

## The Evaluation System Can Be Wrong Too

What happens when the evaluator itself has a defect?

We encountered such a case. One class of outputs was mechanically failed because of an issue in the test fixture or validation contract. Correcting evaluation logic substantially changed verdicts for affected samples, while some genuine failures remained.

The simplest approach is to overwrite the old results. That destroys the explanation of why they failed originally and why a later review changed them.

We chose an append-only ledger model:

~~~text
Unmodified raw evaluation result
           +
Append correction
           ↓
Compute a revised view
~~~

A correction must identify the original evaluation, affected cases, old and new verdicts, the reason for changing them, and the identity of the original inputs and versions.

In shorthand:

~~~text
RevisedView = RawLedger + ValidCorrections
~~~

The essential rule is that RawLedger remains unchanged. A further correction can be appended if the first correction proves wrong.

This matters for model tuning. Otherwise a leaderboard that has been silently revised several times cannot reveal whether an apparent improvement came from the model, Runtime, or the evaluator itself.

## Why I Now Explain Fewer Things from Large Test Counts

In controlled verification windows, our records included:

- **583/583** passing offline checks in one batch.
- **59/59** passing evidence-closure checks in another.
- **677/677** passing checks in a larger model-evaluation collection.

I used to be tempted to call those “everything passed.” Now I add a qualification:

> They demonstrate the corresponding local test contracts in those specific windows; they do not prove one candidate model performs better in long-running production.

This is not needless caution. We have repeatedly seen numbers that were correct but conclusions drawn from them that were too strong.

A controlled batch can show the protocol worked under its test conditions. A real call shows a path worked at least once. Automated judge outcomes can provide comparison signals.

Long-term quality, tail latency, provider stability and actual tool availability all require their own evidence. Those claims cannot borrow each other's pass counts.

## Release Model Conclusions Only After Three Gates

We eventually stopped trying to invent a complex universal score and asked three gate questions first.

### 1. Are we comparing the same experiment?

Do the test suite, code, model, configuration, data snapshot and denominator line up? If not, do not compute a direct ranking.

### 2. Did a hard requirement fail?

Protocol, security, privacy, required evidence and delivery can all be hard gates. An explicit violation should make a candidate ineligible for the current role, regardless of an otherwise high quality score.

### 3. Are important states still unknown?

If a critical requirement remains inconclusive, keep the candidate provisional. Collect evidence before announcing a winner.

Only after these checks do quality, reliability, latency and cost become meaningful comparison metrics.

~~~text
if not same_experiment:
    return inconclusive

if hard_gate_failed:
    return not_eligible

if hard_gate_unknown:
    return provisional

return compare_quality_reliability_latency_cost()
~~~

This looks less sophisticated than an all-in-one intelligence formula. I trust it more because it cannot let “95 points” conceal the fact that the answer never went out.

## Final Reflection

After revising our evaluation approach, I did not suddenly become more capable of testing models. I became less willing to trust a green number without knowing its meaning.

completed, candidate generated, automated judge pass, server content sent and client display successful are related **but not identical** facts.

Likewise, 9/10 after twenty unfinished cases is not 90% on the original thirty-question suite.

As an agent's execution chain becomes more complex, each stage can appear successful while the assembled task is not.

I now ask first:

> What exactly does this green result establish?

Only after answering that question should we compare models. Otherwise we risk precisely calculating the answer to an incorrectly defined question.

## Evidence Scope and References

The numbers above come from controlled engineering windows and illustrate evaluation mechanisms and observed results—not long-term model ability, a production SLA or an official model ranking.

The underlying engineering records cited in the original article were:

- doc/common/history/time/2026-09-10-classic30-evaluation-and-visible-answer-evidence.md
- doc/common/history/time/2026-09-07-model-evaluation-correction-and-reviewer-gate.md
- doc/common/history/time/2026-09-08-evaluation-evidence-loop-and-boundaries.md
- openspec/changes/agent-validate-three-model-tool-portfolio-live-loop/evidence.md
