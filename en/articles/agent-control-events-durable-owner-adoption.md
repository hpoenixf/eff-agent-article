---
description: "A stop command takes effect, but its delivery acknowledgment is lost. Follow command identity, expiring claims and original business receipts to see how durable control handles duplicates and unknown outcomes without mistaking successful delivery for task completion."
readingBrief:
  takeaways:
    - "The control channel owns command identity, order and delivery; original business owners still decide whether stop, correction or recovery effects are admitted."
    - "Claims expire: the original owner rechecks the claim, fence and target revision when admitting an effect; dequeueing work does not confer permanent execution authority."
    - "After a lost acknowledgment, reconcile the original business receipt: settle delivery for an admitted effect, and preserve unknown outcomes instead of retrying under a new identity."
  appliesTo:
    - "Designing cross-process stop, wake or correction handoffs under lease contention, lost receipts and uncertain effects."
  notFor:
    - "Equating queue acknowledgments with task completion, or treating the public local-Session cancellation example as the complete multi-owner control bus."
---
<div><a id="why-an-agent-cannot-execute-a-stop-command-immediately-a08-durable-control-event-handoffs"></a></div>

# Why an Agent Cannot Execute a Stop Command Immediately: Durable Control-Event Handoffs

A background research task is still running when the user selects Stop. Another worker later takes over and discovers a command waiting in the database. Can it simply execute the stop again? What if the previous worker had already stopped the original task, but disconnected just before recording its delivery acknowledgment?

This is the reliability problem ETF Agent has had to make explicit: **reliably delivering a command is not the same fact as committing the business effect requested by that command.** Treat delivery as success and you may overlook an effect that never happened. Treat a missing acknowledgment as proof of non-execution and you may stop, wake, or dispatch a protected action twice.

The durable-control component owns a narrow channel: command identity, ordering, claims, eligibility and delivery settlement. It does not acquire authority to terminate a Run, admit a correction, create a scheduled Task or resume a Child. Those effects remain with their original Owners.

This article first explains the original system's durable-control handoff design, then uses the [public Open ETF Agent implementation](https://github.com/hpoenixf/open-etf-agent) to inspect a narrower path: SQLite-backed claims, cancellation and restart recovery for the same Run. That slice runs independently; it is not a port of the original multi-Owner control-event bus. The distinction matters throughout the comparison.

## 1. Why an ordinary event bus is not durable control

The word *event* describes several genuinely different things in an Agent system.

| Event kind | Final Owner | What the result actually proves |
| --- | --- | --- |
| Lifecycle Hook | Lifecycle events and Hook execution | Which callback was selected and ran, and its local result |
| Durable control command | **Durable control events** | Admission, claim, delivery and settlement against the original business receipt |
| Conversation progress or publication event | Conversation events and history delivery | Content version, sequence, delivery and History readback |
| Call trace or passive audit observation | Research-call evidence retention and readback, and other observation capabilities | What was captured, what is missing and what remains unknown |

An ordinary tool completion does not have to produce all four branches. Its Tool Result may go directly back to research. A persistent wake or stop command exists only when a real control need has been established. A Stop suggestion from a Hook cannot unilaterally terminate a Run; a sent SSE frame cannot certify user visibility or a committed effect.

The first choice is practical: **when caller and effect owner belong to one execution and no intent must survive a process boundary, a direct call is often preferable.** Ordinary tool results and pre/post invocation Hooks retain their original seams. They avoid inbox admission, claiming and settlement, while preserving same-invocation order. Durable handoff earns that cost when work must survive a closed page, process loss, or transfer to another executor.

We chose a durable inbox plus existing business owners rather than turning the entire Runtime into an event-sourced system. Event sourcing is appropriate when the business itself needs event-based state reconstruction. This research runtime already has authoritative Run, budget, result and publication receipts; another execution truth would introduce migration and competing decisions. The channel therefore owns control intent and handoff, not a replacement set of research, budget, publication and memory handlers.

## 2. Seal command identity before a worker claims it

A durable command needs more than the string `"stop"`. It carries the authorized subject, original producer, target identity and revision, plus stable identities for deduplication and ordering.

In the current implementation, the producer's `producerKey` is paired with the original event fingerprint. Replaying the same intent and exactly the same content yields the original fact. Reusing that key for changed content is an identity conflict, not an invitation to overwrite history. An accepted event receives an `eventId`, and the delivery command uses `commandKey = control:eventId`. A sequence and target revision preserve the order of commands accepted for the same target even if workers scan the queue in different orders.

Why distinguish an *intent* from an accepted *event*? Some original domain facts must be committed atomically with an intention to deliver control. `stageInTransaction` allows both to roll back together if that original transaction fails. A later Relay turns the already-recorded intent into an eligible event; it does not execute a model, tool or domain effect. A future timer intention is not admitted prematurely, as doing so could occupy the target's sequence and delay a user correction that is valid now.

This addresses the same dual-write problem as the established [Transactional Outbox pattern](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html): commit the business fact and pending notification together, then relay asynchronously. It does not promise exactly-once downstream effects. [SQS standard-queue documentation](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/standard-queues-at-least-once-delivery.html) likewise requires consumers to tolerate duplicate delivery. A managed queue can provide transport and scaling; adopting one would still leave the application responsible for original command identity, business receipts and uncertain effects. We retain those facts in existing database transactions and pay the cost of maintaining relay, capacity and recovery logic, rather than claiming a more general transport than mature brokers.

Backpressure also needs precise accounting. Unfinished intents, pending/claimed/unknown events and reserved capacity can all occupy bounded Scope space. An unknown effect cannot be erased merely to make the queue count look smaller.

## 3. Claims and fences: possession is not perpetual authority

Two workers can inspect the same queue concurrently. The durable-control component selects eligible work in a short database transaction and records a worker identity, expiration and incrementing `fence`. The target revision and compatible consumer are also checked; a command for a superseded target must not retain operational force.

**A claim valid at dequeue time may no longer be valid when the domain effect is admitted.** External I/O, scheduler pauses and storage retries can outlive the lease. The original business Owner therefore checks the same command identity, worker, fence, target and live expiration inside its own transaction before admitting an effect.

This does not turn durable control into a second authorization authority. A claim only says which sealed command a worker may presently deliver. The original Owner still determines whether identity, permissions, resource constraints and domain state permit the requested effect.

The public v0.7 slice puts this principle in a local implementation that readers can inspect. [`session.mjs`](https://github.com/hpoenixf/open-etf-agent/blob/5f70dc0b4760ad70ef211f4823828ab2fee5c525/src/session.mjs) claims a Run in a short SQLite transaction. A competing claimant receives `LEASE_BUSY` while the lease is valid. Once the lease expires and a new claimant takes over, the fence increases: the previous claimant cannot wake up and write another checkpoint or reserve another tool unit. This protects database-write eligibility, not remote side effects. Invalidating a database fence cannot retract a request already sent elsewhere. The [store cases](https://github.com/hpoenixf/open-etf-agent/blob/5f70dc0b4760ad70ef211f4823828ab2fee5c525/test/session.test.mjs) check these separate moments rather than treating lock acquisition as permanent execution authority.

## 4. Read the business receipt before deciding to redeliver

A valid handoff follows this flow. *Unknown* does not mean merely a temporary network failure; it means the original business effect cannot yet be proved to have happened or not happened.

```mermaid
flowchart TD
  A[Original Owner transaction seals control intent] --> B[A08 accepts event and target sequence]
  B --> C[Worker claims event with Fence]
  C --> D{Claim and target still current?}
  D -- No --> E[Discard stale delivery authority]
  D -- Yes --> F[Read the original business Owner receipt]
  F --> G{Definitive original receipt exists?}
  G -- Accepted or rejected --> H[Settle delivery from original receipt]
  G -- Proven absent --> I{Safe first admission remains possible?}
  I -- Yes --> J[Original Owner deduplicates and admits in transaction]
  J --> K{Original result definitive?}
  K -- Yes --> H
  K -- No --> L[Preserve Unknown and reconcile only]
  I -- No --> L
  G -- Temporarily unreadable --> M[Defer receipt read, never admit a new effect]
```

The original Owner's `readReceipt` may return `null` only when the authoritative store positively establishes that the receipt does not exist. An unreadable database must throw, not masquerade as null. If admission has not started and there is no prior uncertain effect, a read failure merely defers delivery. A later positive-absence result can permit first `admit` when `ownerUncertain` is absent, the claim is not `reconcileOnly`, and it remains current; there is no nonexistent earlier transaction whose rollback must be proved. Proven rollback before any external dispatch is required only to defer and retry after an admission already started and failed. Ordinary exceptions, ambiguous commits and existing `ownerUncertain` preserve unknown and allow only original-receipt reconciliation, not another `admit`.

One surprising failure was that **exhausting retries must not end receipt reconciliation**. A real synthetic process test placed the crash on the last allowed delivery attempt: the original Run admission committed, then the owner process was killed. The new process quarantined the exhausted event before reading its existing business receipt. It did not create a duplicate Run; it left an already-admitted Run without its delivery ACK.

The current mechanism separates another effect attempt from another read of the original result. An expired final claim can be reclaimed as `reconcileOnly`: read the existing receipt first and settle from it, without invoking `admit` again. No receipt plus a previously uncertain effect remains unknown. Positive absence without prior uncertainty, after new admission attempts are exhausted, can be quarantined. Exhausted pending work that never entered admission and unsupported events can also be quarantined. **Quarantine is not success, and reconciliation is not a new execution opportunity.**

Another historical counterexample committed admission and then threw; the service called it ordinary deferred, incorrectly suggesting the effect had not started. Now a dedicated deferred fact is available only when the original owner proves that admission rolled back before any external dispatch. Ordinary exceptions and ambiguous commits retain unknown. These are controlled persistence/process observations, not live-user incidents or an exactly-once guarantee for arbitrary remote effects.

## 5. A synthetic lost-ACK incident

Imagine that the original Run Owner atomically admits a stop request and records an `accepted` domain receipt. The worker crashes before changing the control channel's claimed delivery status to acknowledged. After the lease expires, another worker may claim the same `eventId` with a new fence.

The correct action is to **query the original receipt under the same `commandKey`**. If the original accepted fact exists, only the delivery record is settled. In another failure branch, neither the original transaction outcome nor its receipt can be checked. Even if the caller saw a timeout, the durable-control component preserves unknown until the domain Owner can independently reconcile the outcome.

| Observable situation | What can be established | Appropriate next step |
| --- | --- | --- |
| Original Owner has `accepted`; the control channel has no ACK | Domain admission occurred; delivery settlement is behind | Reuse the receipt and settle delivery without repeating the effect |
| Original Owner proves absence and no uncertain effect existed | Eligibility for a first admission can be checked | Attempt admission with a live fence in the original transaction |
| Original receipt temporarily unreadable, before admission | No evidence yet permits a new domain effect | Defer another read; do not treat failure as null |
| Original admission began but its commit outcome is ambiguous | The domain effect may already have happened | Preserve unknown; reconcile under the original identity |
| Target revision changed or claim expired | Old delivery authority is invalid | Reject the stale claim, without deciding for the new revision |

This is a teaching reconstruction of current contracts, not a disclosed real user's Stop log. The difficult failure falls precisely between two durable facts: the original effect has been admitted, but the delivery ACK has not committed. Adding a single global `completed` flag does not remove that sequencing problem.

The public code also gives “do not redeliver an unknown effect” an executable recovery position rather than a single completion flag. In the same [`runtime.mjs`](https://github.com/hpoenixf/open-etf-agent/blob/5f70dc0b4760ad70ef211f4823828ab2fee5c525/src/runtime.mjs) loop, `proposal-sealed` means a proposal already exists, so restart does not need another model request to regenerate it. `result-committed` means the original tool receipt is durable and only needs consumption. By contrast, a `tool-dispatched` position without a verifiable original result retains `TOOL_OUTCOME_UNKNOWN`; a new process does not authorize another dispatch. The same Run keeps its original question, authorization bindings, absolute deadline and consumed budget. This is not the original durable-control delivery-ACK protocol, but it makes the same judgment observable: **recovery must follow facts already established, not a wish that retrying will succeed.**

<div><a id="_6-how-a08-cooperates-with-hio-tasks-and-recovery"></a><a id="6-how-a08-cooperates-with-hio-tasks-and-recovery"></a></div>

## 6. How durable control cooperates with HIO, Tasks and Recovery

Durable human interaction (HIO) owns a human interaction request and response identity. When the user reply needs to resume the original research, Correction or Recovery still makes the legitimate continuation decision; a durable control command is used only where a real handoff requires it. The scheduled-task component owns confirmed schedules, Task creation and cancellation. Receiving `timer_due` does not let durable control mint research budget. The Run continuation and termination component decides whether a Run continues, enters bounded finalization or reaches a technical terminal state. A control-channel ACK is never a substitute for the resulting Run outcome.

A separate choice concerns progress, not idempotency. Slow admission must not occupy all control capacity. The current scheduled runtime separates control admission from Task execution slots, tracking at most two independent control jobs rather than awaiting an entire research execution inside a scan. In controlled historical evidence, owner A waited before its admission SQL while B admitted its original Root. Stop committed A's cancellation fence before A resumed and recorded only a rejected receipt. No timeout pretended A had never executed. Two slots provide bounded isolation, not arbitrary-load fairness or a latency guarantee; original Stop authority cannot depend on adding one more message to the tail of an ordinary FIFO.

A common objection is, "Why not put all this state in one table?" The number of tables is not the governing question. **The real danger is giving one effect two final decision-makers.** Shared identities and lock ordering can be useful; letting a delivery component declare the underlying business effect successful is not.

## 7. What exists today—and what still needs evidence

The current source connects these delivery contracts to selected scheduled-task, correction and research-control paths. Readers should distinguish two kinds of evidence: the original system's persistence/process counterexamples explain why the branches exist; the public local Session below supplies an independently runnable adjacent mechanism. That public example does not reproduce every control seam of the original system.

That does not prove every target, deployment or cross-process failure has passed one unified end-to-end qualification. A real control command's intended Run, Task or Child effect must still be checked against the domain receipt. Correct model questioning and readable published reports are also outside the claim established by the control channel's queue state.

**Reliable control does not mean only that a message was sent at least once. It means failure still leaves us able to distinguish "the event arrived," "the original effect was admitted," and "the outcome is not yet known."**

## 8. Observe Cancellation and Recovery Without Creating a New Task

The [current main README](https://github.com/hpoenixf/open-etf-agent/blob/main/README.md) is the ongoing project entry point. The commands below pin the public v0.7 commit so that the implementation matches this explanation. Qualification used Node.js 26.11.1. Package metadata supports 26.8.1–26.x, but not every patch version has been tested. Initial installation may access npm. The examples use synthetic material and a scripted model fixture, with no remote model calls; SQLite persistence, separate processes and report files are real.

```bash
git clone https://github.com/hpoenixf/open-etf-agent.git open-etf-agent-control-demo
cd open-etf-agent-control-demo
git checkout --detach 5f70dc0b4760ad70ef211f4823828ab2fee5c525
npm ci --ignore-scripts --no-audit --no-fund
npm run session -- start --session runs/control-example --case durable-report
```

`start` prints the actual `runId`, `directory`, report `receipt` and `rootUsage`; the session directory contains `session.sqlite`. Replace `run-YOUR_ID` below with the returned ID, then read the same Run through separate commands:

```bash
npm run session -- inspect --session runs/control-example --run run-YOUR_ID
npm run session -- resume --session runs/control-example --run run-YOUR_ID
```

The default example completes before `start` returns. Its `resume` is therefore **terminal readback**: retain the same Run, original report receipt and consumed budget, and check existing artifacts rather than write another report. [`session-cli.test.mjs`](https://github.com/hpoenixf/open-etf-agent/blob/5f70dc0b4760ad70ef211f4823828ab2fee5c525/test/session-cli.test.mjs) checks that behavior; it does not, by itself, establish continuation after an in-flight interruption. Nor should you cancel a completed Run and interpret the unchanged outcome as failed cancellation. Cancellation removes continuation eligibility from an active root and its active children; it does not rewrite completed history.

To observe the branches with real timing pressure, run the existing focused process cases:

```bash
node --test --test-concurrency=1 --test-name-pattern="after result commit|cancel during pending model|dispatched-without-result" test/durable-runtime.test.mjs
```

These [process cases](https://github.com/hpoenixf/open-etf-agent/blob/5f70dc0b4760ad70ef211f4823828ab2fee5c525/test/durable-runtime.test.mjs) cancel while a scripted model request is still pending, check that its late proposal dispatches no tool, and verify that another process still reads a cancelled Run. Other cases actually terminate the process after result commit or synthetic external-effect dispatch, await its exit, and open the same database under a different PID. A committed receipt is consumed; an unconfirmed effect remains unknown. The meaningful result is preserving those different exits, not making them all completed.

Cancellation must also preserve effects that already happened. The [public verification record](https://github.com/hpoenixf/open-etf-agent/blob/5f70dc0b4760ad70ef211f4823828ab2fee5c525/docs/verification/v07-observations.md) preserves a controlled counterexample in which cancellation lost an already-saved report receipt. The [corrected case](https://github.com/hpoenixf/open-etf-agent/blob/5f70dc0b4760ad70ef211f4823828ab2fee5c525/test/durable-review.test.mjs) keeps the cancelled outcome while returning the original receipt, without another model invocation. **No further execution does not mean nothing happened earlier.**

This public path controls only the selected local Session and its supported synthetic profiles. The CLI will not replace a live-model binding with a fixture and call that recovery. It does not provide the article's complete HIO, scheduled control, multi-tenant system or reconciliation for arbitrary external side effects. It already lets a local developer answer a concrete question: after a process changes, which actions may continue, which facts may only be reread, and which unknown outcomes must stop honestly? For how packages publish complete contributions before execution and resource release through the existing Runtime, continue with [Extension Host](https://hpoenixf.com/eff-agent-article/en/articles/020-agent-extension-host-smartphone). Package lifecycle and Run cancellation or recovery remain separate responsibilities.

---

<!-- open-etf-case:control@e1b8e4edde724548fab16d8ca4b205379bfa7f30 -->
### Check durable cancellation while a model request is pending

The [process-level cancellation case at this fixed public snapshot](https://github.com/hpoenixf/open-etf-agent/blob/e1b8e4edde724548fab16d8ca4b205379bfa7f30/test/durable-runtime.test.mjs) places the boundary after a model request reserves budget but before its result returns.

After installing dependencies according to the README at the linked fixed snapshot, run:

```bash
node --test --test-concurrency=1 --test-name-pattern='^7\.3 cancel during pending model is durable and late proposal cannot dispatch$' test/durable-runtime.test.mjs
```

It waits for a real child process to reach `model-pending`, cancels durably through another Session connection, and checks that the late proposal dispatches no tool. A new process reads the same Run as `cancelled`, with model usage still 1.

The model behavior is synthetic. This checks durable Run cancellation and rejection of a late proposal, not the article's complete durable-control delivery, deduplication, and business-owner adoption system.
<!-- /open-etf-case -->

## Further reading

[Durable human response adoption](https://hpoenixf.com/eff-agent-article/en/articles/agent-durable-human-interaction-response-adoption) explains the human-interaction admission boundary; [scheduled research](https://hpoenixf.com/eff-agent-article/en/articles/agent-autonomous-scheduled-research) describes long-lived scheduled-Task obligations; and [asynchronous delivery](https://hpoenixf.com/eff-agent-article/en/articles/agent-asynchronous-research-time-bound-delivery) explains conversation-event notifications and History.

Read more in [ETF Agent Engineering Notes](https://github.com/hpoenixf/eff-agent-article), and Star the repository to follow the series.
