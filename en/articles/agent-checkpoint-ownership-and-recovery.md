---
description: "Learn who saves checkpoints, when they are triggered and how one Run updates them. Follow the same task through LangGraph, Microsoft Agent Framework, Temporal and ETF Agent to compare continuation models and ownership."
readingBrief:
  takeaways:
    - "A checkpoint saves progress needed for the next step. One Run can save repeatedly; this implementation retains only the latest snapshot."
    - "A snapshot neither proves a tool executed nor authorizes continuation. Recovery still checks original receipts and current execution authority."
    - "Handle pre-write failure, unknown write outcomes and lost leases separately. An auxiliary snapshot failure must not erase confirmed work."
    - "ETF Agent removed LangGraph to avoid duplicating its own recovery system, not because graph frameworks are unsuitable for Agents."
    - "Choose recovery by save boundaries and interruption guarantees. Graph snapshots, workflow snapshots and event replay still require external-effect checks."
  appliesTo:
    - "Designing Agent progress and recovery, or comparing checkpoint and durable-workflow approaches."
  notFor:
    - "Obtaining lossless continuation across arbitrary interruptions and versions."
---

<script setup>
import { withBase } from 'vitepress'
</script>

# Checkpoint System Design: What Does an Agent Save, and What Lets It Continue?

A research task has read two documents, completed a calculation and saved the first section of a report. It is about to inspect a third source. Closing the page, restarting the server and receiving a stop request are three different events.

Handling them requires both a record of research progress and a trustworthy account of what has already happened. Checkpoints help with progress. The second requirement also depends on tool receipts, report versions, grants, request records and execution leases.

**A useful checkpoint system makes ordinary work easy to continue and gives an interrupted system enough information to distinguish reusable material from actions that still require execution authority.** It need not turn the entire application into a permanently replayable graph.

This article follows a teaching example through the normal path, then revisits why we introduced and later removed LangGraph in ETF Agent. The project account covers the private system's design, a live-model development evaluation and controlled verification. A separate public teaching example appears near the end; its capabilities are deliberately narrower.

## Start with the basics: a progress snapshot that gets updated

**A checkpoint is a snapshot saved at a chosen execution boundary: where this Run has reached, which stage comes next, and which working state and original-result references are needed there.** It is not the Run itself, the entire conversation or the finished report.

Think of it as a handover note: “Source A has been read; its result is in the original receipt. One question remains unresolved. Next, return to model reasoning.” The next executor reads that note and verifies the original records rather than restoring every byte of the previous process's memory.

### Who initiates a save? Is it a model-callable tool?

**For the Recovery checkpoints discussed here, Runtime initiates a save under its execution protocol, Recovery assembles the snapshot and save outcome, and the Store writes to the selected storage. No built-in `checkpoint` tool exposes this operation to the model.** A model may propose reading a source or sending a draft. The Host executes that business action and confirms its original receipt; Runtime updates the snapshot at the corresponding boundary. The model influences the research action, rather than issuing a separate “save progress” tool call.

A different concept shares the name: **a Workspace checkpoint records research progress.** When the Host enables that capability and supplies a Workspace goal, the model can attach an optional `workspaceCheckpoint` to `send_answer_part`, proposing question-status updates, a summary and historical content references. The Host verifies the original publication receipt and sources before accepting it. An invalid optional proposal must not discard otherwise valid published content. This record is not an execution-continuation cursor and grants no authority to resume a Run.

### Why keep one when there are already databases and logs?

Action receipts say what happened. Published revisions say which content was committed. Logs record events. Continuing the work also requires its current stage, unresolved questions and continuation position. A checkpoint puts that **reusable working state** behind a defined, identity-bound read interface, reducing the need to reconstruct the context from scratch.

A short, simple task can run without one. For longer work or supported waits and continuations, however, the system may otherwise have to infer its progress again or may lack proof of where it can proceed. Calling a tool again is not a substitute for checking its original effect: the request may already have executed. A checkpoint helps a valid handover; it does not promise in-place recovery from every crash. An in-memory adapter loses its snapshots with the process. Retention across processes requires the corresponding persistent store.

### What triggers a save?

The execution protocol calls the save interface at explicit stage boundaries. A model saying “I remember” does not create a checkpoint, and every token, event or log entry need not create one. The current ETF Agent implementation has these classes of save call:

- **Initialization:** when no checkpoint exists, attempt to save the initial execution position.
- **Continuation-position updates:** for example, prepare state before a model request, or update the continuation hint after a model turn and its ordered proposals have been sealed but before Host effects are dispatched. The turn and proposals retain their own durable records.
- **After a confirmed action or content commit:** save an auxiliary snapshot reflecting the new progress. The original effect owner confirms the effect first; the snapshot cannot replace its receipt.
- **Main context-compaction state commit:** save the new state, then read and adopt that saved state only after success.
- **Finalization or cancellation paths:** attempt to save the corresponding stage state. The original owners still maintain committed terminal and cancellation facts.

These are trigger categories, not a fixed checklist executed once per loop. A path may skip some and call others several times. Control waits have another relationship: a wait can **bind the revision and digest of an already saved checkpoint** so an accepted wake can identify its state. Entering a wait does not itself mean another snapshot was successfully saved.

### Can one Run have several checkpoints?

**It can have several successful saves.** Imagine the same Run saving its initial state, progress after a source read, progress after publishing a draft, and its compacted state: revisions 1, 2, 3 and 4. The diagram selects four convenient save points; a real execution can save additional continuation states between them. The numbers are not mandatory step numbers.

<picture>
  <source media="(max-width: 640px)" :srcset="withBase('/diagrams/checkpoint-system/en/save-timeline-mobile.svg')" />
  <img :src="withBase('/diagrams/checkpoint-system/en/save-timeline.svg')" alt="Four illustrative saves in one Run: initialization, source read completion, draft commit and compaction state commit. Successful saves increment the revision; the Store retains only the latest snapshot, while original action and publication receipts remain separate." loading="lazy" style="display:block;width:100%;height:auto;border-radius:18px" />
</picture>

<a :href="withBase('/diagrams/checkpoint-system/en/save-timeline.svg')">Open the checkpoint update timeline</a>

Several saves do not necessarily mean retained snapshot history. **The current in-memory and PostgreSQL adapters keep one latest checkpoint per scope and Run. Each successful save increments its revision and replaces that current snapshot.** They do not provide a history browser that can arbitrarily replay revisions 1, 2 or 3. The format version says how to interpret a snapshot; its revision counts successful saves for this Run. Those are different identifiers.

A known pre-write rejection creates no new snapshot and leaves the previous successful one in place. An unknown write outcome does not establish that the old revision remained unchanged. Original action receipts, model turns and published content are separate from this latest-snapshot slot: replacing a checkpoint does not automatically delete them, and selecting an older progress position cannot undo their committed effects.

Now put the save operation back into an ordinary research cycle to see how it works with those other records.

## 1. The normal path: how a checkpoint is produced

Our synthetic task is: “Compare two funds' public disclosures, calculate their holding overlap, deliver a first draft, then fill the remaining evidence gaps.” The documents and results illustrate the mechanism, not an actual investment conclusion.

### Admit the task and establish execution identity

The runtime establishes the account, task, authorized sources and available resources. Durable storage retains the run identity, and the current executor obtains a lease with a fencing number.

The lease identifies the executor temporarily allowed to operate on the run. The fence prevents an old executor from writing after a successor takes over. Neither fact is determined by what the model remembers or whether the browser remains open.

### Record a proposal, then execute an authorized action

The model proposes reading a document. The application host binds that proposal to its request and tool-call identity; the tool path checks authorization, arguments and budget. Once reading finishes, the original action owner saves the result and completion receipt.

The distinction matters. “Read this document next” in a checkpoint describes progress. “This invocation completed” in a receipt records an effect. Recovery cannot safely decide to repeat a call from the progress hint alone, or infer an external request's outcome from a summary.

### Save the continuation position and necessary working state

The runtime passes the next stage, working state and required references to the checkpoint interface. A simplified snapshot may retain:

- The run, format version and checkpoint revision.
- Whether the next stage is model work, action handling or completion evaluation.
- Observations, unresolved gaps and working notes needed by subsequent research.
- References to original action receipts, source identities and saved results.

Not everything needs another copy. An observation already preserved in a durable receipt can be represented by a reference when identity and content match exactly. Information that cannot be reconstructed accurately must remain in the appropriate durable object.

### Consume the saved work and proceed

After saving, the runtime advances through its own lifecycle. It reads earlier material through original result references, submits report content through Publication, and establishes a control wait when it needs a human response or a Child result.

Actually reading a checkpoint requires more than deserializing JSON. The system checks the run identity, supported format and revision before interpreting the continuation position. Omitted observations can be reconstructed only from matching original receipts; sources and published results retain their original identities. Once the working state is assembled, the owner of that continuation still establishes execution authority before entering the selected stage.

A checkpoint is therefore an interpretable handover, not a dump of an entire process. An incompatible format, mismatched reference or unavailable original result must be reported as such. An empty object, summary or fresh invocation cannot silently stand in for the missing state.

<picture>
  <source media="(max-width: 640px)" :srcset="withBase('/diagrams/checkpoint-system/en/normal-flow-mobile.svg')" />
  <img :src="withBase('/diagrams/checkpoint-system/en/normal-flow.svg')" alt="Four stages: admission and lease, proposal and effect receipt, progress snapshot, then continued work or a control wait. Effect facts and progress snapshots remain separate records." loading="lazy" style="display:block;width:100%;height:auto;border-radius:18px" />
</picture>

<a :href="withBase('/diagrams/checkpoint-system/en/normal-flow.svg')">Open the full normal-flow diagram</a>

The diagram shows one work cycle. An implementation may save progress more often or require a durable safe point before a particular call. Its execution protocol defines those boundaries; every internal variable change does not require another snapshot.

## 2. The records beside a checkpoint

Several operations write to a database, but answer different questions.

| Record | Main question | Interpreting owner |
| --- | --- | --- |
| Execution checkpoint | Where can work continue, and with which working state? | Checkpoint and recovery boundary |
| Action and model-request receipt | Was it dispatched, is the result known, and was it settled? | Original execution and effect owner |
| Published content and versions | Which deliverable can the user read now? | Publication and its reader |
| Control wait and wake | Which response or event can reconnect to which safe point? | Original control owner |
| Conversation history and memory | What did the user say, and what should another task remember? | Conversation and memory owners |
| Research workspace progress | What has a longer research project achieved, and what remains? | Research workspace |

The last item may also be called a “checkpoint.” It represents research goals and stage results, not an executor's continuation cursor. Sharing a name is not a reason to merge the two modules.

Think of an execution checkpoint as a work handover. It can point to a completed calculation and a saved report without replacing either original. Recording “inspect fund B next” does not grant the next executor permission to read private material about fund B.

## 3. Which path follows an interruption?

**The page disconnects.** If the server process and original run remain valid, research may continue. Reopening the page reads existing content and progress; restoring the display needs no new model call.

**The server process stops.** Recovery first checks for a valid executor, then reconciles fencing, committed work and unresolved requests. ETF Agent currently permits limited loss of uncommitted progress after an ordinary interruption. It does not automatically reconstruct the original root task, child tasks and wait relationships in a new process. The original run is settled according to actual deliverables; an explicit continuation proceeds as a new Run with its own admission.

**An authorized control wake arrives.** An accepted human response or Child notification may continue its permitted work when the original wait, safe point, supported format and execution identity match. This requires both a usable checkpoint and a wake accepted by the original control owner. Finding an old database row is insufficient.

**The user asks to stop.** The original control channel first accepts the request, and the current execution seam adopts it. Cancellation and final settlement have their own owners. A failed checkpoint cannot turn an actual cancellation into successful continuation; it also cannot roll back committed reports or confirmed tool effects. Unresolved external effects remain governed by their original request records.

All four paths preserve established facts, but promise different kinds of continuation. Choose the product promise first, then decide how much state a checkpoint must retain.

## 4. Why we used LangGraph, then removed it

In September 2026, ETF Agent moved from a fixed semantic chain to a continuous research runtime. Instead of following one preset sequence, a task needed to read, reason, invoke tools and gather more material until it could deliver.

A thin LangGraph.js StateGraph was a reasonable choice: three logical stages expressed the loop, a persistent checkpointer supported continuation, and existing gateways, tools and business stores remained in place. The graph tracked execution position while application systems retained tool and publication receipts. We did not ask the framework to take over the product.

As the system evolved, the application's own Recovery layer acquired the durable facts needed for safe continuation: model turns and proposals, tool receipts, publication commits, budgets, leases, fences and the continuation cursor. The graph checkpoint deliberately held only a bounded projection; complete active objects still lived in the current process.

That created a specific duplication. **A new process still needed Recovery before it could continue safely; the graph checkpoint could not do that independently.** Yet maintainers had to understand both graph threads and cursors and the application's run identities, receipts and continuation state.

In early October, we removed the redundant graph execution and checkpointer wiring. The three logical stages remained as ordinary control flow inside ResearchRuntime, with durable continuation supplied by the existing Recovery owner. We did not replace the graph wrapper with a renamed general-purpose workflow manager.

This was a decision about responsibilities in that project. Applications that need graph branching, parallel super-steps, state forks and time travel, and want the framework's execution model, can use those capabilities in LangGraph.

### Comparing the two on the same terms

Set aside our migration for a moment and use one teaching task: **read sources A and B → draft a report → wait for approval → publish it.** The walkthroughs below apply documented mechanisms; they are not a cross-framework benchmark we ran. LangGraph uses the JavaScript Graph API here, Microsoft Agent Framework uses Python workflows, and Temporal represents a different durable-workflow approach.

<picture>
  <source media="(max-width: 640px)" :srcset="withBase('/diagrams/checkpoint-system/en/recovery-models-mobile.svg')" />
  <img :src="withBase('/diagrams/checkpoint-system/en/recovery-models.svg')" alt="Four continuation models for the same report task: LangGraph graph state, Microsoft Agent Framework executor and message state, Temporal event-history replay, and ETF Agent's latest snapshot plus original receipts. External effects still require confirmation." loading="lazy" style="display:block;width:100%;height:auto;border-radius:18px" />
</picture>

<a :href="withBase('/diagrams/checkpoint-system/en/recovery-models.svg')">Open the four-model comparison</a>

#### LangGraph: the graph runtime saves at boundaries defined by nodes

The developer defines state, nodes and edges, then configures a checkpointer. The application invokes the graph with a `thread_id`; the graph runtime calls the saver without asking the model to select a checkpoint tool. A model can influence a business branch, while the execution layer owns persistence. A thread can accumulate state across several graph invocations, so it is not equivalent to one application Run in this article. [Graph API design](https://docs.langchain.com/oss/javascript/langgraph/thinking-in-graph-api), [threads and checkpoints](https://docs.langchain.com/oss/javascript/langgraph/checkpointers#threads)

The application-facing snapshot contains state values, the next scheduled nodes and execution information. Nodes return updates that the graph merges under its state rules. **Only information admitted into that state and persistence protocol becomes continuation material.** Ordinary process variables do not turn into a complete memory image automatically.

A super-step advances a scheduled batch of nodes. If reads A and B run in parallel in one batch, their completed updates form that full state boundary; the next batch can consume them to draft the report. Sequential nodes occupy different steps. Combining reading and drafting into one node removes the full checkpoint boundary between those operations. [Super-steps and snapshots](https://docs.langchain.com/oss/javascript/langgraph/checkpointers#super-steps), [choosing node boundaries](https://docs.langchain.com/oss/javascript/langgraph/thinking-in-graph-api)

There is also finer-grained progress. If A finishes but B fails, completed task writes can be retained as pending writes. Once those writes are durably saved, resuming the step can reuse A instead of invoking it again. **Task writes and full super-step snapshots have different granularity**: a finished node does not necessarily create another full time-travel checkpoint. [The separate `put` and `putWrites` interfaces](https://github.com/langchain-ai/langgraphjs/blob/77294a35a56bfdb86e5952158bcb343fc3c41950/libs/checkpoint/src/base.ts)

#### Approval, process restart and history replay take different paths

Application code calls `interrupt()` inside an approval node. The Host later supplies `Command({ resume: ... })` with the same thread. **The interrupted node starts again from its beginning**; a suspended call stack is not resurrected at one line. Sending the report before `interrupt()` therefore risks running that code again. Separate approval from the side-effect boundary deliberately. [Interrupt and resume semantics](https://docs.langchain.com/oss/javascript/langgraph/interrupts#resuming-interrupts)

Process recovery first requires storage that survives the process. `MemorySaver` retains state in RAM; a persistent saver lets the application retrieve saved progress using the original thread. Long-term memory is another concern: checkpointers hold thread state, while Stores hold application data across threads. Both can be used together. [Persistence and Stores](https://docs.langchain.com/oss/javascript/langgraph/persistence)

History replay can select a retained checkpoint, or fork from it with changed state. Nodes before that point reuse saved results; subsequent nodes execute again, potentially making fresh model and API calls. **Replay is not a side-effect-free recording**, and it does not retract a report already published elsewhere. [Time-travel execution](https://docs.langchain.com/oss/javascript/langgraph/use-time-travel)

#### Does a checkpoint mean each step is already durable?

The saver and durability mode both matter. `async` overlaps saving with the next step, so a crash can lose recent unfinished writes. `exit` delays persistence until execution exits through completion, error or a human interrupt, rather than protecting intermediate progress against a crash. For `sync`, this article uses the **fixed LangGraph.js 1.6.1 implementation**: after a completed super-step, the runtime awaits the checkpoint work scheduled for that step before advancing. It waits for the saver's completion; actual durability still depends on the saver and storage configuration. [Durability modes](https://docs.langchain.com/oss/javascript/langgraph/checkpointers#durability-modes), [the 1.6.1 step barrier](https://github.com/langchain-ai/langgraphjs/blob/77294a35a56bfdb86e5952158bcb343fc3c41950/libs/langgraph-core/src/pregel/loop.ts#L1280-L1288)

This detail warrants a version pin: at review time, one passage in the online JavaScript description differed from that fixed source. The explanation here follows the linked implementation. A mode name alone does not establish the same wait boundary across every SDK and version.

Now consider publication. The remote service accepts the report, but the node stops before receiving confirmation. The graph may still lack a success record. Safe retry requires a stable business idempotency identity honored by the service, or reconciliation of the original operation. LangGraph's own fault-tolerance guidance addresses this. Our receipt design tackles the same problem, not a principle the framework overlooked. [External effects and missing acknowledgements](https://docs.langchain.com/oss/javascript/langgraph/fault-tolerance#retry-boundaries-and-idempotency)

### Microsoft Agent Framework: hand over executors and queued messages

Microsoft Agent Framework also uses super-steps, organized around message delivery and executors: collect messages, route them, finish the current batch, then process newly queued messages in the next batch. With checkpoint storage configured, the workflow runtime triggers saving; no model-issued archive tool is required. [Official execution model](https://learn.microsoft.com/en-us/agent-framework/concepts/workflows/builder-and-execution#execution-model-supersteps)

In our example, drafting has produced content while approval awaits a response. Continuation needs the content, message destinations and outstanding requests. Its snapshot therefore includes executor state, queued messages, pending requests and responses, and shared state. Custom executors explicitly export and restore state through `on_checkpoint_save` and `on_checkpoint_restore`; arbitrary instance fields are not automatically captured. [Python save and restore hooks](https://github.com/microsoft/agent-framework/blob/cf734bc4692ccfc944496a5b3182b3d65483c44d/python/packages/core/agent_framework/_workflows/_runner.py#L352-L427)

An application can choose a checkpoint ID and restore it into a matching workflow, including a rebuilt instance with compatible topology and executor identities. In-memory, file and Cosmos DB storage have different durability and deployment implications. Enabling checkpointing alone does not establish cross-machine recovery. [Storage and reconstruction requirements](https://learn.microsoft.com/en-us/agent-framework/workflows/checkpoints)

Save boundaries evolve too. Python 1.13.0 added an entry checkpoint before initial execution and another after requested responses arrive but before their consuming step. Original input and human responses thereby become replayable boundary material, rather than only their processed results being saved. [The 1.13.0 upgrade](https://learn.microsoft.com/en-us/agent-framework/support/upgrade/python-1-13-0-workflow-checkpoint-upgrade-guide)

Like LangGraph, it incorporates continuation into the workflow execution model. Our current implementation instead organizes it around application Runs, receipts and accepted control wakes. Compare these concrete states and entry points, not whether every library has a class named Checkpoint. The documented workflow-state scope also provides no basis for inferring a cross-service transaction or exactly-once external publication.

### Temporal: rebuild workflow state from event history

Temporal is a durable-workflow platform, not another equivalent Agent graph library. Developers organize steps in workflow code and place non-deterministic work, such as model and network calls, in Activities. The service records event history; a Worker uses that history to replay code and reconstruct execution state. [Workflows and replay](https://docs.temporal.io/workflows), [Activity responsibilities](https://docs.temporal.io/activities)

Our report becomes “read-source Activity → draft Activity → wait for an approval signal → publish Activity.” If the draft Activity's completion result is already recorded, a restarted Worker can reach that call again and receive the historical result without calling the model merely to restore progress. Recorded timers and signals also guide reconstruction; deterministic workflow code recomputes ordinary local variables. The model never requests a dump of all variables. [How event history drives recovery](https://docs.temporal.io/encyclopedia/event-history/event-history-typescript)

Distinguish **workflow replay**, which reuses recorded Activity results, from **Activity retry**, which can execute the Activity function again under its retry policy. If publication succeeded remotely but Activity completion was not recorded, another attempt may contact that service again. Activities still need idempotency and outcome reconciliation. [Retry policies](https://docs.temporal.io/encyclopedia/retry-policies)

Deterministic replay and durable history carry substantial continuation responsibility, in exchange for adopting that programming and deployment model. This is not a capability our Recovery gains simply by swapping storage adapters, nor one implied by our latest-snapshot interface.

### Shared problems, different recovery promises

The example exposes three concrete choices:

- **Who defines a valid continuation point?** LangGraph's graph runtime, Microsoft's workflow runtime and Temporal's workflow protocol define their execution boundaries. Our Runtime, Recovery and Control protocols cooperate on ours. All require a Host protocol; a model saying “continue” is not execution authority.
- **What past is retained?** LangGraph supports retained graph-checkpoint history; Microsoft supports saving and selecting workflow checkpoints by ID; Temporal uses event history. ETF Agent's current Store keeps only the latest snapshot per scope and Run, with original effects recorded separately. These are not interchangeable history-replay facilities.
- **What happens after interruption?** The frameworks offer execution recovery under their respective models. Our ordinary-interruption path settles actual deliverables and admits a new Run for explicit continuation; accepted control wakes retain scoped continuation. That is a product trade-off, not equivalent recovery delivered with less machinery.

They share another requirement: recovered progress cannot replace confirmation of external effects. An accepted report, an unresolved request and an accepted cancellation still need their responsible protocols. Choose the promise your product must keep before choosing how neatly its workflow can be drawn.

## 5. Locate the failure before choosing a response

Return to the teaching task. The first report section has committed, but saving the next checkpoint fails. At least three outcomes require different treatment.

### A known pre-write failure

A cyclic reference can make JSON serialization fail before the database transaction begins. The new checkpoint was not written, and this operation did not replace the previous one.

If Publication already holds a real commit receipt, this failure cannot make the content unpublished. Whether another independent read can proceed still depends on its own authorization, budget, persistence requirements and the current lease. Saving a report does not authorize every later action.

Controlled tests at the original execution seams have examined this failure after completed reads, reasoning-effort changes, committed publications and cancellation requests. They share a principle: an auxiliary snapshot failure remains local, while the original owner supplies proof that its particular effect exists.

### An unknown write outcome

The database may have committed without the client receiving confirmation. The system cannot report that nothing was written or treat the exception as permission for a safe retry. It must read and reconcile durable facts under the original identity, retaining uncertainty when it cannot establish the outcome.

The same applies to external models and tools: a missing response does not establish that execution or resource consumption never happened.

### A lost lease, invalid identity or missing required safe point

An executor that has lost write authority cannot keep operating with its old fence, even if the snapshot is perfectly serializable. If a human wait requires an exact checkpoint and that checkpoint is unavailable, the system may refuse that particular park or recovery operation.

Rejecting an operation whose prerequisites are missing is a legitimate local responsibility. Overall task disposition and the visibility of existing work remain decisions for the original runtime and Publication owners.

### Capacity policy also changed over time

Checkpoints have been used in the project. **On October 4, 2026, a development evaluation using a real model and synthetic research material had persisted 30 observations in a 123,940-byte checkpoint.** Further reads produced results, but the Run failed at checkpoint capacity validation before exhausting its model-request allowance. Those real calls are distinct from the scripted tests below.

The rejected state was not captured at the failure point. A later read-only reconstruction from the original completed-read receipts produced a 132,166-byte candidate state with 32 observations, exceeding the then-current 128 KiB limit. That size is a **receipt-derived reconstruction**, not a captured failure payload.

The repair removed duplicate observations already held in complete receipts, without truncating citations or original text. A zero-model reconstruction of that actual material preserved the content and order of 32 observations and 155 complete citations while reducing the checkpoint projection to 4,037 bytes. A projection generated after restoring it had the same size. A separate PostgreSQL synthetic fixture checked the storage seam; it was not a successful rerun of the real task.

**The original live-model Run remained failed and was not rerun.** The record establishes actual use of the save path and a capacity fault caused by duplicated state. The later result establishes offline reconstruction equivalence, not rescue of a live task. This is a sanitized account of private run evidence; the full original records are not public.

The earlier repair retained the original cap. A later change removed the artificial fixed checkpoint byte limit, retaining JSON validation and real storage failures.

Those stages should not become a claim that compression eliminates capacity limits. Deduplication reduces repeated representation; databases and hosts still have physical limits. Model context capacity is another independent constraint. A state that can be persisted may still be too large for a model request.

### What did failure-isolation tests actually observe?

Alongside that real-task record, offline fault injection exercised the original Runtime seams. Concrete observations are more informative than saying that every test passed.

| Injected fault | Observed result | Supported conclusion |
| --- | --- | --- |
| After initial or replacement content commits, insert a cycle into the following snapshot so the real serializer rejects it | Original content, revision and publication receipt remain available; independent completion is accepted | A confirmed publication does not need this auxiliary snapshot to become true again |
| At that publication boundary, substitute an unknown storage error or lose the lease after failure | The continuation call rejects; existing content remains; the Run is not declared completed | Preserving work does not justify ignoring unknown writes or lost authority |
| Make serialization fail while establishing a clarification wait that requires a checkpoint | The operation rejects and no clarify_pending state is written | A required safe point cannot be skipped by a general ignore-errors policy |

These executed tests use scripted models and an in-memory Store. Their assertions inspect save outcomes, receipts, content and run state, not production-user samples, model quality, latency, cost or production failure rates. The complete private tests are not public. The public teaching code below supplies a different, narrower experiment readers can run themselves.

An earlier publication fix also retained a before-and-after observation: under the same one-time pre-write fault, content existed in storage but the old path returned partial without establishing independent completion. After that fix, content remained and completion was accepted. That is evidence for the particular fault repair, not a benefit attributable to the later checkpoint-interface consolidation.


## 6. An independent checkpoint owner, with a narrow boundary

Here, an owner is the module responsible for interpreting a class of facts and protecting its invariants. It need not be a separate process, database or manager class.

Checkpointing has substantial work of its own: format and identity validation, revision handling, exact receipt-backed reconstruction, write-outcome classification, and determining whether a saved snapshot is usable for a particular supported continuation. Those rules deserve one clear home.

Reading execution state should not make that module responsible for every execution decision.

<picture>
  <source media="(max-width: 640px)" :srcset="withBase('/diagrams/checkpoint-system/en/ownership-mobile.svg')" />
  <img :src="withBase('/diagrams/checkpoint-system/en/ownership.svg')" alt="Responsibilities: Runtime decides task progression, effect owners confirm commits, Checkpoint saves and validates snapshots, and Control accepts wakes. All use the original identity and fencing." loading="lazy" style="display:block;width:100%;height:auto;border-radius:18px" />
</picture>

<a :href="withBase('/diagrams/checkpoint-system/en/ownership.svg')">Open the full ownership diagram</a>

Useful review boundaries are:

- **Checkpoint** can report an unsaved snapshot, identity mismatch or unavailable read, and refuse that save or read.
- **Recovery and Control** determine which accepted wake and safe point may use the snapshot. Its existence alone does not authorize execution.
- **Action, Publication and Cancellation owners** confirm their own effects. A snapshot neither revokes those independent facts nor invents missing successful receipts.
- **Runtime** chooses among the remaining lawful paths: continue, finalize or stop.

Simply adding a `CheckpointManager` may therefore make no improvement. If it assesses report quality, allocates budgets, manages Child work and determines every exception's terminal outcome, the complexity has only acquired a new name.

## 7. What should the repeated logic become?

The existing implementation already separates checkpoint contracts, encoding validation, in-memory and PostgreSQL storage, and a production recovery adapter. Call sites still had to repeatedly distinguish known pre-write serialization rejection from other storage errors, then decide whether their particular operation could proceed.

This consolidation adds an independent save module inside Recovery. It accepts only the existing store's checkpoint-save capability and original input, exposing two facts that can be established:

| Save outcome | Module result | Remaining caller decision |
| --- | --- | --- |
| The original store returned a save receipt | Saved, with the original checkpoint receipt | Consume that snapshot through the original flow |
| Serialization was rejected before the write | Not saved, with the original typed error | Does this operation have sufficient independent proof to continue without the new snapshot? |

Other errors retain their original rejected path and identity. The module does not package lease loss, authorization failure, transaction errors or missing acknowledgements into an easily ignored “optional failure.” In particular, an unknown write outcome is not evidence that the old state remained unchanged.

All three existing save entry points use the same interface: ordinary snapshots, snapshots after Main context compaction, and continuation cursors. Format validation, revision constraints, transactions and fencing remain in the original store contract; the read protocol is not duplicated. The save module itself holds no session, budget, published content or control wait. It does not retry, renew leases or choose terminal status.

**Repeated error classification is consolidated; business-specific continuation conditions remain distinct.** An auxiliary snapshot after a committed publication, a wait requiring an exact snapshot and a cursor before a model call need different proof. An existing special path that can continue from its own committed control receipt retains its original owner's policy. The common classifier must not turn that path into a whole-run failure.

Unlike an “ignore errors” switch, this interface explicitly classifies the save fact; callers still handle it within their own effect scope. Checkpointing can have an independent interface while remaining inside Recovery's existing storage and authority boundaries.

The interface and all three call-site migrations are integrated into the current implementation. Local verification without real-model calls and independent review covered the original recovery, terminal and wait seams. **Existing boundary tests already passed before this refactor and continued to pass afterward. The established change is centralized classification with preserved tested behavior, not conversion of previously failing business tasks into successes.** This change neither rewrote storage transactions nor expanded recovery after ordinary interruptions. Those engineering results do not establish acceptance with real models, a production database or a deployed service. The remote CI run failed without a reported cause; it cannot be counted as a successful remote pipeline.

Existing initial-checkpoint handling remains narrow, and its separate qualification is unfinished. Other independent checkpoint work is not automatically completed by this interface consolidation. A clearer module boundary does not mean every recovery scenario in the wider system has been verified.

## 8. Observe two exits in public teaching code

The private system's complete protocol is not a capability list for the public teaching project. To inspect the distinction between a committed result and an unknown external outcome, use this [fixed Open ETF Agent snapshot](https://github.com/hpoenixf/open-etf-agent/tree/5f70dc0b4760ad70ef211f4823828ab2fee5c525). It comes from the v0.7 development stage and demonstrates a limited slice rather than packaging this entire design as a library.

With Node.js `>=26.8.1 <27`:

```bash
git clone https://github.com/hpoenixf/open-etf-agent.git
cd open-etf-agent
git checkout 5f70dc0b4760ad70ef211f4823828ab2fee5c525
npm ci
node --test --test-concurrency=1 --test-name-pattern='after result commit|dispatched-without-result' test/durable-runtime.test.mjs
```

This update inspected the [fixed test source](https://github.com/hpoenixf/open-etf-agent/blob/5f70dc0b4760ad70ef211f4823828ab2fee5c525/test/durable-runtime.test.mjs) without rerunning it. The tests are designed to use scripted models and test-owned child processes, send `SIGKILL` at a selected boundary, then open the original state in another process:

- With a committed result, assert one total tool dispatch, one stored tool message and one consumed ID after recovery.
- With dispatch but no result, assert `TOOL_OUTCOME_UNKNOWN`, one unresolved effect and still only one effect invocation in the recorded attempts.

Inspect call counts, original receipts and final status rather than the amount of generated prose. These tests need no live model calls and do not reproduce the complete private-system isolation protocol. The [current project entry](https://github.com/hpoenixf/open-etf-agent) links newer versions, whose behavior should be read against their own documentation.

## Design for the next handover

In our unfinished fund comparison, Publication retains the first report section, completed calculations remain readable through their original results, and current execution authority determines whether the third source can be acquired. A checkpoint organizes the working state without rewriting any owner's facts.

Before designing the next checkpoint, answer three questions: **Who will read this state, what will they do next, and which facts must they verify against original records?** Then choose the save boundary, format and failure handling. That produces a module with independent responsibility and a clear place in the wider research system.

## Further reading

- [A Disconnect Is Not a Crash: Why an Agent Need Not Restore Its Original Execution Graph](agent-disconnect-is-not-crash-recovery-contract.md)
- [When Every Module Can Say No: Run Termination, Stage Budgets and Safe Recovery](agent-veto-authority-and-run-termination.md)
- [When Context Fills Up, Why Not Just Ask a Model to Summarize the History?](agent-main-run-context-compaction.md)

[ETF Agent Engineering Notes](https://github.com/hpoenixf/eff-agent-article). Stars and discussion are welcome.
