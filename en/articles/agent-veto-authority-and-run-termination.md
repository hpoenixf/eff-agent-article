# When Every Module Can Say No: Agent Run Termination, Stage Budgets, and Safe Recovery


A research task has read several sources, completed part of its computation, and delivered a few passages to the user. Should a single failed tool, changed optional suggestion, or disconnected browser terminate the entire investigation?

Simply propagating exceptions upward often gives the earliest failing module the power to terminate a Run. A component responsible for one read or suggestion inadvertently acquires authority over the entire task.

The opposite failure is equally dangerous: to avoid a visible failure, a system silently switches to an easier question and marks a fluent but irrelevant answer **completed**.

The two problems need one coherent response: **a local failure must not arbitrarily terminate independent work, and recovery must not change the task, expand authorization, or relabel unknown effects as successful.**

This is not primarily about adding retries. It is about assigning authority over local operations, the Run lifecycle, and final delivery to their rightful Owners.

## 1. Control over Published Text Is Not Run Termination Authority

The [Publication system](/en/articles/019-agent-answer-publication) handles candidate text, previews, versioned commits, and revisions. Whether a particular passage is eligible for display is a different effect from whether the wider research Run may continue.

A tool can reject an unauthorized invocation. A search service can refuse a search that exceeds its quota. Context compaction can discard a summary whose identity no longer matches. All of these may be correct local decisions.

But do they prove that other authorized sources, tools, and already-committed passages must stop? Usually not.

A veto is identified by its *effect*, not its spelling. A **throw**, filtering operation, early return, or failure to show an authorized tool to the model can all behave as vetoes.

| Original Owner | Facts it may establish | What those facts do not automatically establish |
| --- | --- | --- |
| Tool, source, or execution Owner | One operation was denied, failed, succeeded, or had an unknown effect | The whole research task failed |
| Resource Owner | Admission, usage, and remaining capacity for its resource | Every other resource is depleted, or the user's task is complete |
| Publication | Whether text is displayed or committed, and at which version | The user's question was answered correctly |
| Run Lifecycle | Continue, recover, finalize, or terminate based on original facts | New authorization, rewritten receipts, or certification of answer quality |

**One effect should have one final Owner, but distinct effects still require distinct boundaries.** Putting every decision inside a grand "trust manager" is not inherently safer.

## 2. How Optional Information Became a Second Judge

We once used model-maintained **Research Needs**: a list of questions still requiring work. It helped organize research. It did not own source permissions, and its contents could not prove that a question had been resolved.

In an early Main request path, just before dispatch, we checked whether the Needs list had changed:

~~~typescript
// Historical branch; no longer a present dispatch decision.
if (JSON.stringify(fittedState) !== JSON.stringify(currentNeeds)) {
  throw new Error("Research needs changed before provider dispatch");
}
~~~

The intent was to prevent request/state inconsistency. The effect was to allow an optional worklist to block an entire valid model request.

**Reviewer** suggestions exposed a similar problem. The preparation phase already bound a suggestion to Child terminal state, Run authorization, and actual request identity. Reinterpreting the original Reviewer material immediately before dispatch could then veto a suggestion that had already been legally sealed.

The redundant post-Reviewer check was removed before the Run-termination consolidation. Later, optional Needs failures were separated from actual dispatch authority. Request identity, user corrections, tool contracts, and execution fencing remain valid protections; what disappeared was an optional list's shadow authority over Main dispatch.

**Stop Hook** had another form of veto. Main proposed a legitimate completion, but a Stop response of **continue** could historically turn it into **block** and force another model turn.

The current contract treats Stop as **advice**, not an independent right to veto valid completion or compel extra requests. Explicit user cancellation, real permission restrictions, and objective budget limits still apply through their original Owners.

This change did not remove the no-progress rule. If there is neither publishable text nor a valid tool call, the Run still ends in a bounded way and reports that no answer was generated. Removing the Stop veto does not convert an empty response into success.

The question is therefore not "should we delete consistency checks?" It is **which effect does this check protect, and is it entitled to block the main flow?**

## 3. One Budget Fact Should Not Have Two Ledgers

A Run can be limited by requests, tools, time, concurrency, and reserved final-output capacity. Multiple distinct constraints are normal. Two independent authorities making decisions about the **same consumption** create conflicts.

The original **Root Resource** owns atomic admission and actual usage facts for shared requests. Runtime consumes the resource view, selects stages, and produces warnings; it does not issue or revoke request eligibility from an independent shadow ledger.

Focused checks confirmed the intended responsibility boundary between Root Resource and Runtime without duplicating the resource-consumption ledger.

Web-search quotas, Provider physical concurrency, and text-revision counts may still belong to different modules because they constrain distinct resources.

Exhausting search capacity forbids *new searches*, not automatically the consumption of already-obtained results. Whether reading remains available depends on reading's own constraints and shared resources. Exhausting ordinary research capacity also does not erase a previously reserved final-output allowance.

Retries draw from the original remaining budget. If planning, tooling, and continuation each independently grant "two retries," nested retry loops inflate total consumption. Read-only requests still occupy paid tokens, leases, and upstream capacity; they are not free simply because they do not mutate a database.

For the detailed resource contract, see [Run Budget and Constraint Governance](agent-runtime-constraint-governance-v2.md).

## 4. Identify the Clock Before Calling Something a Timeout

Two cases from the former failure article remain particularly instructive.

One inspected run took roughly **360 seconds** as seen from the page: approximately **347 seconds in a queue** and **13 seconds of actual execution**. The execution itself finished normally.

Another combined query appeared as a "network error" in the page, even though the tool succeeded in roughly **0.15–0.29 seconds**. Failure occurred after the tool result, during a second model-continuation round. Approximately **30 seconds** elapsed without answer text.

Both belong to historical controlled-development windows, not current performance baselines. They illustrate why wall-clock duration is not synonymous with execution timeout, and why tool success is not equivalent to successful continuation.

| Clock | Start point | What it primarily explains |
| --- | --- | --- |
| Queue time | Entry into the scheduling queue | Capacity and concurrency delay |
| Stage execution time | When the stage actually gains execution | Model, tool, and validator time |
| No-progress time | Last meaningful business progress | Whether a stage is still producing useful work |
| Overall deadline | Start of the business Run | Remaining time for the original task |

Transport heartbeats, usage events, and internal reasoning chunks prove only transport activity; they must not automatically reset a business-progress clock. Stage time budgets are also bounded by the **remaining overall deadline**. Otherwise every stage can be "legitimately waiting" while the whole request has no finite endpoint.

Recovery depends on the actual failure point. If the tool succeeded and only model continuation failed, preserve the tool receipt and consider resuming downstream work under the original constraints. A browser error is not a reason to execute the whole tool chain again.

If headers arrived and the body was interrupted without definitive deadline evidence, the state should remain **interrupted** or **unknown**, not be relabeled "timeout" on intuition alone.

See the dedicated [failure-diagnosis essay](agent-failure-is-a-boundary-problem.md) for more detailed failure identities.

## 5. What the Old Planner Taught Us: Never Change the Question to Claim Success

One historical fixed-planner validation set contained **48 records**. Across **eight Runs**, **ten planning invocations** generated internal reasoning but no legal plan body, eventually hitting the stage deadline. The old recovery path then constructed a generic-knowledge task, dropping the original entity, time, and evidence requirements. One request accumulated repeated planning and queuing for roughly **672 seconds end to end**.

The essential failure was not the wait. The user asked for a current, evidenced fact; the fallback answered a general conceptual question and called it complete. Similar topic, different completion condition.

At the time, the fix introduced **planning_failed** and negative tests proving that a failed plan would not silently enter later tool, answer, or review stages.

That is a **historical repair of the old planning architecture**, not a present-day requirement for every Research Run to produce a formal valid plan. Today the model selects its path through a native tool loop; Runtime maintains actual authorization, execution, and publication facts.

The lasting principle is that a degraded answer may **reduce what it claims**, but must not silently **replace what the user asked**. When current market evidence is unavailable, retain confirmed parts and explain the gap; don't present timeless generalities as current quotes.

Plan validity, evidence coverage, body persistence, semantic quality, and user receipt cannot be compressed into a single **PlanValid** formula.

## 6. Deepen the Existing Lifecycle Instead of Inventing a Termination Agent

We did not add a new "termination Agent" or funnel module-selected **failed** outcomes through a shared exception formatter. Centralized formatting would not actually reclaim termination authority.

The existing **Run Lifecycle** receives facts established by the original local Owners and selects an allowed **continue, recover, finalize, or settle** path.

Main still owns research selection and synthesis. Recovery preserves leases, fencing, and receipts. Resource Owners make admission decisions. Publication decides the treatment of published text.

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

A failure that can be handled locally stays local. When escalation is required, the lifecycle chooses among **currently authorized operations**, not just abstract success/failure labels.

| Actual state | Possible next path | Constraint that must remain |
| --- | --- | --- |
| One ordinary tool fails but other independent evidence and tools remain | Continue authorized research | Do not reclassify the failure as a successful empty result |
| Temporary Provider failure with original recovery conditions and budget intact | Bounded recovery within the existing mechanism | Do not manufacture more budget or change task identity |
| Ordinary research cannot continue but the original output reserve remains valid | One-way transition to **finalization-only** | Use existing eligible material; disclose unfinished scope |
| Explicit user cancellation, overall hard limit, or failed protective identity | Stop and settle according to original facts | Do not dispatch more work in the name of elegance |
| External effect remains unknown | Ask the original execution/Recovery Owner to reconcile | Do not replay blindly or mark it successful prematurely |

Finalization reuses the original output channel. It is **not** a new fallback system. It may only use existing accepted resources and permissions, and cannot bounce back into ordinary research to obtain another round of finalization capacity after failing.

There is a family resemblance to Microsoft's [Bulkhead pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/bulkhead): isolate the impact of a local failure. Here that does **not** imply creating a thread pool for every module. We are consolidating authority within a single Runtime so a refusal for one effect does not automatically veto independent effects.

## 7. Recovery Must Preserve the Task and Admit Unknown Effects

Eligibility for recovery must check at least the original task identity, an available checkpoint, the same Run Grant, remaining budgets, and whether the original execution can safely resume. A label saying "temporary error" is not enough.

AWS Builders' Library on [making retries safe with idempotent APIs](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/?did=ba_card) illustrates the same fundamental issue: **no received response does not mean the server performed no effect**.

An Agent facing tool timeout or a lost database-commit acknowledgment cannot conclude that nothing happened. Original request identity and receipts govern replay; the model asking to "try again" is not execution evidence.

Several boundaries must hold together:

- **Do not re-invent effects that already occurred.** Read committed tool results and text under their original identities. A previewed candidate is not a persisted artifact; a summary cannot recreate a nonexistent original.
- **Do not regrant permissions within the same Run.** Recovery inherits recorded authorization. It does not re-adjudicate the existing Run from today's permission table. Original account, scope, content identity, cancellation, and resource boundaries still apply; a *new* Run undergoes fresh admission.
- **Do not reset shared resources.** Retries, continuations, and Recovery consume the original balances rather than minting new allowances.
- **Do not replay an unknown external effect automatically.** The original execution and Recovery evidence—not a timeout label, "read-only" tag, or user expectation—determine safety.
- **Do not rewrite the user's goal on continuation.** Narrow claims and disclose missing evidence when needed. A new user correction must be accepted by the current work, not presumed to have propagated through an old summary.

These limits make failures explainable. They do not promise every failure can be recovered or create a bypass for Runs whose identity or persistence preconditions no longer hold.

## 8. Disconnected Client, Settled Run, and User Receipt Are Different Facts

The browser connection is an observation channel. The Run is a business execution.

An ordinary disconnect detaches a subscription; an explicit user stop is a cancellation intent. Those are not interchangeable. Reconnecting must not silently launch new research.

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

**Detached** means a connection left, not that the Run received renewed permission. **Settled** retains the true complete, partial, failed, or canceled outcome; it does not certify research quality. Reconnection reads original events and commits, not a convenient rewritten success.

Research that genuinely resumes after a terminal state requires a causally linked *new Run* with independent admission.

Even a uniquely recorded terminal state on the server cannot prove that the browser received every passage. Distinguish **candidate generation, server commit, transport send, and client observation**.

If background persistence ultimately records only **partial**, the public outcome and completion callback must not keep an earlier **complete** classification. But proof that the client received all text requires its own delivery evidence.

Chunked text and file delivery have the same separation. Failure of chunk two does not erase chunk one; the existence of chunk one does not prove the entire question was answered. Saving an article body does not prove that an attachment was saved or downloaded. Publication and file Owners retain their respective mechanisms; Run Lifecycle should not recreate their validators.

### A Closed Physical Request Is Not an Accepted Child Result

In October 2026, Child finalization exposed a narrower contract conflict. The original model request may have a durable completion receipt but no output that the Child can accept. Earlier length-truncation rules differed, and interpreting returned and thrown responses in separate Native branches risked conflicting terminal decisions.

We moved that decision back to the **original Child lifecycle owner**, not a new global termination judge. The original Request owner first establishes that this exact admitted physical request genuinely closed. The Child then checks previously accepted content, cancellation, fences, source identity, committed effects, and whether a permitted continuation or final handoff remains. Only when those conditions are satisfied may it settle its own technical-failure outcome. That does not relabel the physical request as failed, refund usage, retry automatically, or erase Main's committed answer.

By contrast, an interrupted transport, an unacknowledged completion commit, or an unresolved external effect remains **unknown**, not “failed because no text arrived.” Independently valid partial work survives. Controlled integration evidence supports this bounded decision; the separate Child completion change's formal close must be verified on its own, not inferred from the older Run-termination acceptance.

## 9. What Was Verified, and What Still Needs Separate Evidence

Run-termination authority consolidation was implemented, aligned with accepted specs, and archived on **October 19, 2026**.

The selected verification covered shared termination decisions, recovery and bounded finalization through existing mechanisms, isolation of optional Needs, advisory Stop, and consistency between durable state and completion callbacks.

Controlled checks covered the production Factory with a scripted model gateway, fresh-pool recovery against independent PostgreSQL, and consistency of terminal receipts. They support these specific control behaviors, not a whole-repository quality score or real-model research success rate.

Completion of complex research by real models, stability of browser interactions, and production behavior still require verification in their respective operating environments.

Meaningful acceptance examines the original chain: can independent legal work continue after a local failure? Can Stop force an extra turn? Can an unknown effect be repeated? Do Publication settlement and completion callbacks agree?

We need evidence for both sides: justified rejections still happen, **and independent authorized work is not incorrectly stopped**.

## 10. Before Merging Code, Ask Who Owns the Refusal

Our review questions now boil down to three:

1. Does this module own the final decision over the effect?
2. Does its rejection affect only that effect?
3. Is it reinterpreting a fact already recorded by another Owner?

This echoes John Ousterhout's writing on [modular design and information hiding](https://web.stanford.edu/~ouster/cgi-bin/cs190-winter18/lecture.php?topic=modularDesign): useful modularity prevents callers from having to reproduce a module's internal decision. Merely placing exception handling in one large function while allowing callers to independently select terminal states does not consolidate responsibility.

Reliable execution does not mean returning polished prose every time. It means preserving effects that really occurred, continuing what is still legal under the original permissions and resources, and settling honestly when continuation is impossible.

A module can say its *own operation* must stop. **Whether the entire research task can continue belongs to the lifecycle that knows the original execution facts and recovery conditions.**

This governance change implements [principle 4, “A local failure must not become a global veto”](/en/principles#principle-4): refusal of one operation must not terminate unrelated work that can still proceed lawfully. In review, we apply [method 2, “Reviewing responsibilities and rejections”](/en/principles#method-2) by asking who owns the decision, which effect is blocked, and whether a different owner's settled fact is being reinterpreted.

## Further Reading and Discussion

- [Publication](/en/articles/019-agent-answer-publication): text revisions, partial downgrade, and durable commits.
- [Run Budget and Constraint Governance](agent-runtime-constraint-governance-v2.md): resource admission, output reserves, and stage convergence.
- [Stop Blaming Every Failure on the Model](agent-failure-is-a-boundary-problem.md): failure identity, diagnosis, and unknown effects.
- [Avoiding Misleading Green Tests](honest-agent-evaluation.md): separate proof of execution, delivery, and quality.

Read more at the [ETF Agent Engineering Notes site](https://hpoenixf.com/eff-agent-article/). Examples and counterarguments are welcome through the [GitHub article repository](https://github.com/hpoenixf/eff-agent-article); feel free to Star it.
