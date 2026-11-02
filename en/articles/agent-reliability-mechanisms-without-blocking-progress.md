---
title: Why Can Adding Reliability Mechanisms Stop an Agent from Delivering?
description: A database deadlock involving optional evidence capture and a checkpoint failure after a completed action reveal how reliability mechanisms can become new task dependencies.
date: 2026-11-02
readingBrief:
  takeaways:
    - "Evaluate a reliability mechanism by the work its own failure can block, as well as the failures it can repair."
    - "An asynchronous observation queue can still block the main workflow through shared database locks; isolation must reach the actual resource contention."
    - "A confirmed action, a checkpoint known to have failed before writing, and a write with an unknown outcome require different handling."
    - "Fault-isolation checks should verify independent continuation and retained committed results while preserving cancellation, execution ownership, and unknown outcomes."
  appliesTo:
    - "Developers adding logging, evidence capture, checkpoints, or recovery to agents and long-running task systems."
  notFor:
    - "Weakening authorization, budgets, leases, or required persistence before dispatch, or inferring production reliability from local checks."
---

# Why Can Adding Reliability Mechanisms Stop an Agent from Delivering?

We add logs so we can investigate failures. We add checkpoints so work can continue after an interruption. Both are reasonable choices. But when a result has already been saved and a later record-keeping failure prevents further work, we need to ask what the mechanism is protecting.

Two recent issues in ETF Agent made this question concrete. An optional research-evidence write became involved in database lock contention that affected answer publication. In another path, a tool read had completed, but failure to save a subsequent recovery checkpoint restricted otherwise independent research.

Neither case makes logging or recovery unnecessary. The question is more specific: **when we add a mechanism to handle one failure, do we make the main task depend on something that does not actually have to succeed?**

## 1. Start with What the User Is Waiting For

Suppose a user asks an agent to compare several documents and deliver a report. This is a simplified teaching scenario.

The system performs many invisible operations: recording requests, retaining tool results, updating execution state, saving recovery information, and delivering the answer. Several involve a write, but they serve different purposes.

Some records are necessary to execute the next step safely. Before dispatching an operation with irreversible effects, for example, a system may need durable identity and state to prevent duplicate execution after recovery. Other records preserve facts that have already occurred. Others make later observation and investigation easier.

If all writes receive the same treatment, the simplest implementation is to await them in order. Every step must succeed before the next one starts. The normal path looks tidy. Failure in any added component can now stop the user's report.

Whether stopping is justified depends on **the concrete risk of continuing**. Uncertain authorization should prevent the affected operation. A missing optional copy of a model call first requires a different question: does its absence actually make the original research unsafe to continue?

Making this distinction explicit matters more than the number of exception branches we add.

## 2. How Can an Asynchronous Write Block Publication?

The first case concerns research-evidence retention. The system keeps a bounded copy of model inputs and observable outputs for later inspection. That copy does not establish whether the original request was dispatched, and it does not decide whether an answer may be committed.

At the call boundary, capture was already a side path. The original request continued while evidence entered a bounded queue for database storage. It was tempting to conclude that this protected the main workflow.

The problem was beyond the queue.

The background write still used the same database and needed locks. During investigation, the original database logs showed a cycle among three transactions. Evidence capture held a source-related lock while waiting for a model-record lock; answer publication also participated in the waiting chain. **Asynchronous invocation had not isolated the shared resources.**

Rather than stopping at the assumption that background storage should be harmless, we froze the old version and arranged controlled contention through the original storage entry points. This reproduced a lock cycle and let us examine which waiting edge could be removed.

The change stayed on the optional-capture side. If capture already held the source lock but could not immediately obtain the required model-record lock, its transaction failed and rolled back, releasing its resources. The capture failure remained observable; it was not reported as a successful save. Publication continued under its own rules.

Why not extend the timeout or add another retry? Waiting longer does not remove a cycle. A retry that acquires locks in the same pattern can reproduce the contention. The repair needed to remove a specific resource dependency.

In controlled database checks, a subsequent answer revision could be committed and read back. Task completion and same-run history continued, and a later independent capture succeeded. These observations support the repair to that contention path. Some details of the original transaction's calling path remained unresolved, so the reproduction does not establish every cause of the historical failure.

The problem is not unique to agents. [Google SRE's discussion of cascading failures](https://sre.google/sre-book/addressing-cascading-failures/) describes how local resource problems can spread through dependencies. The transferable lesson here is to follow an optional background task into the connections, locks, and queues it actually uses, rather than stopping at its asynchronous interface.

## 3. How Can a Recovery Record Restrict a Completed Action?

The second case occurred after an action had completed.

A tool read had settled, and the store held its original completion receipt. The system then saved a recovery checkpoint to support later continuation. Controlled fault injection made this save fail during serialization, before the write reached storage.

The completed read was still present. However, the next model turn entered a finalization-only phase, making an otherwise available independent read unavailable. Instead of helping the research continue, recovery machinery had narrowed its remaining options.

Two broad responses are tempting: stop on every checkpoint failure, or ignore every checkpoint failure. Neither addresses the decisive distinction: **what is already known to have happened, and what is still unknown?**

| Confirmed facts | Judgment to preserve |
| --- | --- |
| The original action completed, and its later checkpoint definitely failed before writing | Preserve the action's outcome; handle this checkpoint failure locally only after checking the original receipt and continuation conditions |
| The checkpoint may have committed, but its acknowledgement was lost | Retain an unknown outcome; do not treat it as definitely unwritten or replay it blindly |
| A trustworthy completion receipt is missing, or the execution lease has been lost | Local degradation does not authorize further protected effects |

The repair was therefore narrow. Local isolation applied only when the completed action could be verified under its original identity and the corresponding checkpoint had a known pre-write failure. Existing cancellation and lease checks remained effective. The next tool dispatch still had to pass its own required durable boundary; completion of the previous action did not waive future checks.

Along the repaired controlled path, the original read executed once, a distinct read could proceed, and the subsequent answer and task completion succeeded. Counterexamples involving unknown writes and missing or invented receipts retained their original handling. This demonstrates continuation after a particular fault, not safe recovery from any crash.

The case changed how we looked at checkpoints. They describe and support execution. They are not a second ledger that may rewrite facts already committed elsewhere.

## 4. Test Reliability Mechanisms in Reverse

The two cases look different: one involves database waiting, the other recovery-state persistence. Both added a dependency to the main task without sufficiently explaining why it had to be mandatory.

A normal feature check asks whether a record can be saved. A reliability check should also ask what must remain true when saving that record fails.

For a report task, deliberately create contention in optional capture or a pre-write checkpoint failure after a completed action. Then observe:

- Can previously committed content still be read?
- Can later work that does not depend on this failure continue?
- Has the original action been executed again?
- Do unknown writes, user cancellation, and loss of execution ownership still receive their original handling?

The first two questions limit failure propagation. The last two prevent continuation from bypassing necessary boundaries. Merely checking that no exception escapes is insufficient: a task can avoid an error while losing the ability to continue researching.

This need not create a large new fault-management subsystem. Finding the actual wait, write, and receipt, and repairing the module that already owns them, often makes the scope easier to explain.

## 5. Design the Failure of the Reliability Mechanism

Logs, traces, and checkpoints usually earn their place through a successful path: inspecting a call, resuming a task, or reviewing a result. Their failure behavior deserves the same design attention.

Start with three questions:

1. **Why must this succeed?** More complete observation alone does not justify blocking the user's result. If a record protects permission or prevents a duplicate external effect, identify the exact execution boundary.
2. **What does it share with the main workflow?** An asynchronous interface can still conceal shared locks, connections, capacity, and failure handling.
3. **What can the system accurately promise afterward?** A missing optional record can leave an explicit observation gap. An unknown outcome must remain unknown. Neither should be presented as a successful save.

Return to the report. A missing optional observation should not automatically erase independently authorized results. A completed action should not be reinterpreted as absent because later record-keeping failed. At the same time, the system must still recognize when it lacks the conditions for safe execution of the next step.

**The value of a reliability mechanism includes both what it repairs when it succeeds and how much room it leaves for the main task when it fails.**

## Further Reading

- [Run termination, phase budgets, and safe recovery](agent-veto-authority-and-run-termination.md): who decides whether a local failure ends the task.
- [Capturing, retaining, and reading research evidence](agent-research-evidence-store-lifecycle.md): optional observation copies and original execution facts.
- [中文版](/articles/agent-reliability-mechanisms-without-blocking-progress)

Discuss these tradeoffs in the [GitHub collection](https://github.com/hpoenixf/eff-agent-article). If the examples help your engineering decisions, a Star is welcome.
