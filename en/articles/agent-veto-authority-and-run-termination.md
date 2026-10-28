# When Every Module Can Say No: Agent Run Termination, Stage Budgets, and Safe Recovery

**A failed read should stop that read, not automatically erase everything the system has already accomplished.** Continuing is not permission to retry forever: authorization, cancellation, total budgets, and unknown effects may still require a stop.

Consider a teaching example. A user uploads three authorized product documents and asks an assistant to compare them and save a report. The first two are readable; the third is temporarily unavailable. The assistant should disclose the gap and deliver comparisons that stand on their own. It must not turn “unread” into “no differences,” or delete the results already saved. This illustrates a design choice, not a recorded production run.

The reading module usually knows only “I could not read this file.” It does not know whether other evidence is sufficient, another permitted route exists, or a partial result would be useful. **Deciding whether one operation can proceed and deciding how the whole task should end are different responsibilities.**

## 1. Separate a failed step from an ended task

The three-document example makes the decisions concrete:

| Decision | Who should establish it? | What it must not decide automatically |
| --- | --- | --- |
| Was the third document read successfully? | The tool that actually reads it | That the first two documents are also invalid |
| How many searches or model requests remain? | The program that owns that resource balance | That changing stages grants a new allowance |
| Which answer revision is saved and displayable? | The existing Publication component | That the answer correctly resolves the whole question |
| Should the task continue, finalize, or stop? | The lifecycle holding original execution facts | New permission, rewritten receipts, or a substituted goal |

The lifecycle is the logic managing one research execution, called a **Run**, from start to settlement. It is not another supervisory Agent. It receives established facts and selects a next step that is still allowed.

Do not look only for a literal `deny`. Throwing an exception, returning early, or filtering a candidate answer may all turn a local failure into a global stop. Ask: **Which effect does this decision prevent, and is the evidence sufficient?**

## 2. A research note should not become a master switch

ETF Agent has used an optional list of questions called **Research Needs**. Think of it as a note on the analyst's desk: useful for organizing work, but neither an authorization document nor a certificate of completion.

An earlier implementation compared that list again after preparing a model request. A change could block the entire dispatch. Intended as a consistency check, it gave optional notes authority over otherwise valid work.

In the teaching example, imagine the assistant is ready to check document two. Its note changes from “check price” to “check price and validity period,” and the system cancels the whole request. The important checks are whether the request belongs to the original user, tools remain in scope, and resources remain available. A changed note alone is not enough to veto it.

Reviewer advice revealed a related issue: preparation established its identity, but a later reinterpretation could still block an admitted request. That redundant check was removed before the termination consolidation; the later work must not take credit for every earlier repair.

A **Stop Hook** should likewise remain advisory. It may suggest another useful investigation, but cannot independently veto a valid ending or force an extra model turn. Conversely, an empty response with neither deliverable text nor a valid call still needs a bounded, honest outcome. Removing a veto does not turn an empty response into success.

## 3. Permission to continue is not a fresh budget at every step

A failed read of document three may justify another existing reading method, but it must use the original permissions, balances, and deadline.

If search grants two retries, tools grant another two, and model continuation grants two more, nested attempts can turn a small failure into a long wait. Read-only operations also consume fees, concurrency slots, and upstream capacity; they are not free.

Different resources may have different owners. Search quota, model concurrency, and answer-revision capacity are not the same ledger. The problem is making two independent decisions over the same consumption, or resetting a balance when execution moves to another stage.

Exhausted search quota does not necessarily prevent reading a source already acquired. An exhausted research allowance does not necessarily consume the original reserve for final output. The next action depends on the actual remaining resource, not a generic “budget exhausted” label. See [Run Budget and Constraint Governance](agent-runtime-constraint-governance-v2.md).

## 4. Before adding a timeout, find out where the time went

In one historical controlled case, the page showed roughly **360 seconds** elapsed: around **347 seconds of queuing and 13 seconds of execution**, with execution ending normally. In another, a tool returned in approximately **0.15–0.29 seconds**, yet the page showed a network error. The next model continuation had produced no answer text for roughly **30 seconds**.

These are historical observations, not current performance baselines. They explain why retrying a successful tool cannot repair downstream continuation, and why extending execution timeouts may not solve queue delay.

| Clock | Starts at | What to inspect first |
| --- | --- | --- |
| Queue time | Waiting for an execution slot | Capacity and concurrency |
| Execution time | Actual start of the stage | Model, tool, or storage behavior |
| No-progress time | Last meaningful work | Whether new usable results are appearing |
| Overall deadline | Start of the original task | Whether the whole task still has time |

A transport heartbeat proves connection activity, not research progress. Individual waits must also fit inside the original task deadline. Otherwise every stage can wait legitimately while the overall task never ends.

## 5. Do not replace the question to disguise non-completion

An early fixed-planner path exposed another failure. When a model did not produce a valid plan, recovery switched to generic knowledge and discarded the original entities, dates, and evidence requirements. One historical request accumulated approximately **672 seconds** of planning and queuing.

The user wanted a current fact; the system returned a general explanation and marked the task complete. Similar topic, different task.

The historical repair kept an explicit planning failure instead of silently proceeding with a changed question. That is a lesson from the old architecture, not a requirement that today's native tool loop always produce a fixed plan.

For the three documents, an honest result says: “Documents one and two were compared; the third was not read, so differences across all three remain unresolved.” Replacing it with generic advice about choosing products does not complete the comparison. **Degradation may reduce the claim; it must not silently replace the user's goal.**

## 6. Let the existing lifecycle choose continuation, finalization, or stopping

We did not add a dedicated failure-deciding Agent. The existing lifecycle needs to own the actual decision to continue, recover, finalize, or settle—not merely write `failed` after other modules have made that decision independently.

~~~mermaid
graph TD
LocalOperation --> LocalDecision
LocalDecision --> ContinueWork
LocalDecision --> EscalateFacts
EscalateFacts --> RunLifecycle
RunLifecycle --> BoundedRecovery
RunLifecycle --> MainFinalization
RunLifecycle --> DurableSettlement
BoundedRecovery --> ContinueWork
MainFinalization --> Publication
Publication --> DurableSettlement
~~~

The branches map directly to user-visible work:

| What happened? | Possible response | Constraint to retain |
| --- | --- | --- |
| Document three fails; two documents and other tools remain usable | Continue authorized work or deliver an explicitly scoped partial result | Do not turn missing evidence into a successful empty result |
| Temporary service failure; original recovery conditions and balance still hold | Retry within the existing bounds | Do not reset task identity, permission, or budget |
| Research cannot continue, but the original output reserve remains | Summarize acquired material and explain gaps | Failed finalization cannot return to research to claim another allowance |
| User cancellation, a hard limit, or invalid required identity | Stop new execution and settle from original facts | Do not add a model call merely for a graceful ending |
| An external effect remains unknown | Have the original execution and recovery logic reconcile it | Neither assume success nor blindly execute again |

The goal resembles Microsoft's [Bulkhead pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/bulkhead): limit a local failure's impact. Here it does not imply creating a separate thread pool for every module; the issue is how far one refusal may reach within an existing system.

Controlled verification of the termination consolidation supports these specific control behaviors, not live-model research quality. Acceptance should test both sides: necessary denials remain, and independent authorized work is not stopped incorrectly.

## 7. Recovery begins by checking what happened, not by doing it again

A connection can break after a report save. The file may not exist, or it may have been written while its acknowledgment was lost. AWS's discussion of [idempotent APIs and safe retries](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/) addresses the same problem: no received response does not mean no server-side effect.

Recovery should first inspect the original task, stored results, supported checkpoints, and remaining resources. Confirmed effects are read under their original identities. Unknown effects cannot be replayed merely because someone says “try again.” A checkpoint is not a promise to recover from every failure.

Under ETF Agent's current contract, continuation within the same Run inherits recorded authorization rather than re-adjudicating that Run from today's permission table. Account, scope, content identity, cancellation, and resource checks still hold. A new Run needs its own admission. Downloads have separate access checks: research authorization is not permanent permission to download a file.

A Child follows the same separation. A closed physical model request does not prove that the Child delivered an acceptable result. After permitted continuation paths are exhausted, the Child may settle its own technical failure, but cannot rewrite the original request's usage, retry on its own authority, or erase Main's committed answer. If request completion itself is uncertain, missing text is not enough to establish failure.

## 8. Observe disconnection, cancellation, and delivery separately

Closing a browser page leaves an observation channel; pressing Stop expresses cancellation. These are different events. Reconnection should read the original task rather than start a new investigation simply because a subscription reopened.

~~~mermaid
graph TD
Running --> Detached
Detached --> Running
Running --> Settled
Detached --> Settled
Running --> CancelRequested
CancelRequested --> Settled
Settled --> ReplayOriginal
~~~

`Detached` means the connection left. `Settled` means the task has recorded its actual outcome. The diagram describes connection versus task lifecycle; it does not promise arbitrary continuation after a server-process crash.

A server-side ending also cannot prove the browser received every passage. Generation, commit, transmission, and client display are separate observations. Failure of passage two must not erase passage one; the existence of passage one does not prove the whole question was answered. An attachment needs its own storage and access outcome.

If the final outcome is partial, the public status must retain that fact instead of carrying forward an earlier optimistic completion label. [Publication](019-agent-answer-publication.md) owns answer revisions; the [disconnection and recovery essay](agent-disconnect-is-not-crash-recovery-contract.md) explains the finer recovery promises.

## 9. Bring the principle into the next review

When you encounter a `throw`, early return, or automatic retry, use a concrete task to ask: which independent results should survive this failure? Who records the final state? Does recovery change the goal or repeat an unknown effect?

Ousterhout's discussion of [modularity and information hiding](https://web.stanford.edu/~ouster/cgi-bin/cs190-winter18/lecture.php?topic=modularDesign) emphasizes keeping callers from duplicating internal knowledge. The direction here is similar: decisions belong with the facts needed to make them, not merely in a larger exception-handling function.

For the three documents, the judgment is straightforward: compare what was read, retain the missing part explicitly, preserve saved work, and stop when continuing is unsafe. **A module may say “I cannot do this step.” That does not automatically mean “the entire task has no remaining value.”**

See [principle 4: local failure scope](/en/principles#principle-4) and [method 2: responsibility and rejection review](/en/principles#method-2). For further investigation, read [failure diagnosis](agent-failure-is-a-boundary-problem.md) and [testing and evaluation](honest-agent-evaluation.md).

More essays are available at the [ETF Agent reading site](https://hpoenixf.com/eff-agent-article/). Examples and counterarguments are welcome through the [GitHub collection](https://github.com/hpoenixf/eff-agent-article); consider a Star if it helps.
