---
title: "History, Context, Memory and Checkpoints — How Does an Agent Continue?"
description: "Return to a document comparison after closing the program. Distinguish conversation history, current input, lasting memory and execution checkpoints to understand what viewing the past and resuming work each require."
readingBrief:
  takeaways:
    - "Conversation history retains exchanges. Context construction determines which parts reach the next model call."
    - "Memory supports reuse across tasks, while preferences, original documents and derived conclusions retain different purposes."
    - "Checkpoints save execution state at supported boundaries. Continuation still depends on effect records, task identity and budgets."
    - "Reading a report, asking a new question and resuming an original task are different operations. Uncertain writes require inspection."
    - "Define what forgetting affects. Stopping current recall, deleting conversation history and removing old reports have separate scopes."
  appliesTo:
    - "Developers connecting multi-turn conversation, lasting preferences and durable tasks."
  notFor:
    - "Automatic recovery at arbitrary positions, general external exactly-once effects or production disaster-recovery certification."
---

# History, Context, Memory and Checkpoints — How Does an Agent Continue?

<LearningPathNav />

Yesterday you asked an assistant to compare two product guides. It had finished reading A. Today you open the program and say “continue.” Should it reread A, start reading B or simply open yesterday's report?

Those two words leave several possibilities. First establish what the user wants to continue and what the system actually retained. History, context, memory and checkpoints all involve the past, while answering different questions.

We will keep the synthetic Atlas Notes comparison. The user asks for a comparison of export capabilities and explicitly requests a saved report. For teaching, divide the work into reading A, reading B, comparing and saving. A real Agent may choose another path as observations arrive.

## Four reasons to retain information

| User need | Main support | What it can provide |
| --- | --- | --- |
| Review yesterday's exchange | Conversation history | Original questions, corrections and earlier answers |
| Help this model call continue reasoning | Context | Selected requirements, sources and latest observations |
| Reuse a presentation preference later | Lasting memory | Selected cross-task information that still applies |
| Continue execution after a process exits | Checkpoints and execution records | Original state, completed actions and a continuation position |

An implementation may put these in one database and share some underlying data. Their purposes, update times and supported operations make the distinction useful.

## How conversation history becomes current context

A user who sees yesterday's conversation on screen may assume the model sees it too. Displaying history and constructing a later request are separate paths that need connecting.

The application may include recent turns, choose a summary or let the model reread earlier material on demand. This controls capacity and cost, while introducing a diagnostic question. Is a requirement merely retained in history, or does it actually reach the current request?

Suppose yesterday's correction was “compare only the free editions.” If today's input contains only a brief assistant conclusion, the model may be unable to recover that restriction. Keeping access to the user's original words and supplying the relevant correction helps prevent that loss.

History also retains past judgments. “The current edition supports CSV” carries its original conditions. A new question about B requires checking the text and edition before reusing that claim.

## Reviewing, following up and researching again use different parts of the past

Separate yesterday's work into concrete materials. The user's words include “compare only the free editions.” A's original text includes the online-export requirement. An intermediate assistant message says A has been acquired. There is also a final comparison report. All belong to the past, but later operations use them differently.

Complete history is the direct place to review what was said. If the user asks why the assistant previously claimed that free export supported PDF, find the original question, answer and relevant evidence together. A summarized preference cannot reconstruct that judgment's conditions.

For a follow-up such as “What about enterprise?”, the current request can include the earlier question, necessary answer and relevant source text so the model understands the expanded scope. The request needs sufficient background. Mechanically appending all history may mix restrictions from the earlier question with the new one.

For fresh research into whether today's latest edition changed, establish the new time and version scope. The previous report can help locate dimensions to check, while current facts still need applicable original sources. Retain the conditions and time associated with the old report's claims.

These operations can share a chat interface while reading different objects. When designing history features, establish which exchange a user wants to review, which background should carry forward and whether sources need reacquisition. Displaying the full exchange provides the review function.

## Why lasting memory has a separate purpose

Some information should span many tasks, such as the user's explicit preference for a comparison table first. Searching entire conversations every time costs resources and risks turning a temporary request into a lasting rule.

Memory lets the system select information worth retaining, record its scope and source, and support correction and forgetting. Later use retrieves relevant current records and selects suitable content for the input.

A request may therefore contain both conversation history and memory. Recent history helps locate the current exchange. Memory provides selected background across tasks. New user requirements also need clear representation so the model can reason about their applicability.

Product guides are another kind of object. They supply product facts and need original versions and readable locations. Retrieval can serve both documents and memory while preserving the distinction between personal preferences, original facts and derived conclusions.

## A memory entry passes through several stages before use

Take the explicitly saved preference to show the comparison table first. Its lifecycle includes saving, selection, use, revision and forgetting. Each stage needs a clear meaning.

At saving time, establish who supplied the statement, which tasks it concerns and whether it should last. “Show me the table first this time” may serve only the current request. Making it a future default needs a corresponding user action or an explicit product agreement.

At use time, search the appropriate scope and select applicable records for current input. A search hit still needs to pass through that selection. A database entry establishes that something was retained. To inspect its role in this call, examine the input actually sent and the resulting answer.

For revision, the user might request three sentences of conclusions before future tables. Recalling both old and new records leaves the model to work out which applies. Preserving their revision relationship and reading the effective version reduces this ambiguity.

Forgetting needs a defined scope as well. The memory collection can stop recalling a preference while an earlier conversation still contains it. Previously generated reports may remain. A delete-memory control should explain the object it affects so these outcomes remain distinguishable.

The public example saves, revises and forgets a synthetic preference in a deliberately selected library. It returns separate receipts and checks current reads. Historical revisions remain retained, making the change in current recall distinguishable from the retention of older versions. [Pinned memory tools](https://github.com/hpoenixf/open-etf-agent/blob/bcc12995c83abfbd5b37b9792f5a86ab74aa788e/src/memory-tools.mjs)

Lasting retention also requires maintenance. Preferences change, sources become obsolete and applicability needs updating. A temporary formatting request in a short task can remain in current context. Repeated cross-task requirements are stronger candidates for separate management.

## What continued execution needs beyond conversation

Now consider process exit. Reading A has completed, and the program is preparing to read B. Continuing from there requires more than chat text.

```text
Original task and identity
Current execution position
Acquired A result and its references
Consumed and remaining resource allowances
Pending actions and actual outcomes
Saved artifacts and receipts
```

A checkpoint saves necessary working state at a supported boundary. Execution records, tool receipts and artifact storage retain actual outcomes. Systems may divide those objects differently, and checkpoints can reference externally stored records.

Recovery reconstructs what the next step needs from this material. Supported resume positions and treatment of in-flight calls depend on the implementation's contract. A message list alone rarely establishes whether an external write occurred.

## Read checkpoints together with execution records

Use reading A, reading B and saving a report to consider several possible exit positions. These are general design relationships. The actual implementation determines its supported recovery boundaries.

If the process exits before reading B, retained A results and the next position may let recovery prepare that read. If only the statement “A was read” remains, A's content still needs acquisition. Whether a newer version may be used depends on whether the original task requested fixed snapshots or current information.

If B's request was dispatched before exit but its response was never recorded, the situation changes. Processing might not have started, or it might have completed without the current process retaining the result. Distinguish preparation from dispatch with an unknown outcome. Recording both as merely incomplete can lead recovery to repeat the action.

Reads generally have no write effect, although rereading can acquire changed content. Saving reports and sending messages can produce additional effects when repeated. Depending on the action, recovery needs an operation identity, actual receipt or inspectable artifact to choose an appropriate next step.

If the report was saved before exit, recovery can verify its receipt and read the original artifact. A model-written note saying that the report remains unfinished cannot change the existing file. Derived summaries help organize work, while actual execution records establish external effects.

A checkpoint may contain important state and references or include necessary results. Saving more costs storage. Referencing external objects depends on those objects remaining readable. Retention should reflect the positions from which continuation is supported and the facts that recovery needs to establish.

The presence of checkpoints therefore needs a concrete promise. Which recorded position can the system resume from? How are unknown calls treated? Does it retain the original allowances? How can saved work be read again? Specific answers show what a restart can actually recover.

## Locate the interruption before acting on “continue”

**Case one: A was read and the result retained.** Verify that result and continue with B at a supported position. Whether rereading is appropriate also depends on whether the task needs its original snapshot or current material.

**Case two: report saving was dispatched but confirmation was lost.** The file may already exist. Inspect the original operation, artifact and receipt before deciding what to do next. Blind rerunning can duplicate effects.

**Case three: the report already completed and the user returned to read it.** Open the retained version. A new research question can then create the appropriate new task.

These cases involve execution continuation, uncertain-effect inspection and existing-result reading. A single visible “continue” control can still preserve these distinctions internally.

A checkpoint supplies no new permissions or budget. Same-task recovery uses the original identity and its records, while a new task follows its admission path. The added persistence and consistency work is justified when cross-process continuation matters. Short computations that can safely restart may use a simpler approach.

## Place different meanings of “continue” on a timeline

A teaching timeline for the same task makes the state differences visible.

| Interruption position | Known fact | Basis needed before proceeding |
| --- | --- | --- |
| A read and B not yet called | A has a retained result | Original state, A's snapshot and B's read position |
| B dispatched without a recorded result | The call started | Its actual outcome or the implementation's unknown-outcome handling |
| Report saving confirmed | An artifact and receipt exist | Original report and its reading entry |
| User returns with another question | A new request exists | New goal and relevant historical background |

This also helps product design. A control can say “continue,” while making clear whether it resumes a task, opens a report or begins new research with earlier background. For a long task, showing that its report was saved often communicates progress more concretely than saying that memory was restored.

Allowances also persist along the timeline. Restarting cannot automatically restore resources already consumed by the original task. A different process cannot move an expired absolute deadline into the future. Continuation inherits those records, while additional investment is a separate explicit decision.

Permissions likewise come from the original task's authorization record. A checkpoint can retain or reference that identity, and recovery uses it under the existing contract. A model's statement that it should have permission cannot replace an actual grant. Keeping execution identity separate from the natural-language plan helps explain both intended work and permitted actions.

## What remains accessible after compaction

A long task may organize earlier material into notes and remove large original texts from current input. The notes help the next decision, original sources support verification and checkpoint state supports execution continuation.

If a note says “B's export condition still needs checking,” the next step can reread the page. If the execution record says a report was saved, a model-written summary cannot change that effect into something that never occurred.

**Compaction changes the working representation. Durable records retain the corresponding facts.** Keeping those purposes distinct supports compact input and a research process that remains inspectable. [Context compaction guide](./agent-main-run-context-compaction.md)

## Combine summaries, sources and checkpoints in a long task

Consider research that has already read many pages. To leave room for subsequent reasoning, the system summarizes earlier detail as “A acquired, B's export condition still needs checking.” That note can guide the next step. An exact final comparison still needs the corresponding original sentence.

A useful note retains completed work, unresolved questions and original locations. It can omit most wording while showing later work where to find it. When numbers, editions and online requirements affect a claim, follow the original page to check them. In particular, avoid turning “not found yet” into “does not exist” during summarization.

Checkpoints handle execution continuation. If a note proposes saving next while execution records show the report already saved, recovery should first inspect the existing artifact. Otherwise, an obsolete plan may lead to another action. Summaries and tool receipts retain their separate purposes.

The public compaction example gives the derived note and original page distinct identities. It persists and reads the note, rereads the page through its original result reference, then saves a source-based report. The two reading paths show how a short representation and access to original evidence can coexist. [Working-note and rereading example](https://github.com/hpoenixf/open-etf-agent/blob/bcc12995c83abfbd5b37b9792f5a86ab74aa788e/src/working-demo.mjs)

This adds storage, references and reads. A short conversation can simply carry its full content. Long tasks, repeated source inspection and cross-process execution provide reasons to add the corresponding mechanisms around real needs.

## Observe the parts in Open ETF Agent

This article pins published **v0.26.0**. Prepare the project with the [input guide's setup](./prompt-context-rag-memory.md#observe-the-relationship-in-open-etf-agent), then run these independent offline examples.

```bash
npm run demo -- --case compact-and-reread
npm run demo -- --case explicit-memory --memory-library runs/concept-memory-library
```

The first demonstrates derived notes and original-text rereading. The second saves, revises and forgets entries in a dedicated synthetic memory library. Choose a fresh empty directory for memory and inspect the save, revision and forgetting receipts printed by the CLI. Model choices are scripted.

For continuation, inspect the public Cross-process continuation tests and their assertions about interruption and supported handoff positions. These exercise the original runtime and remain offline mechanism checks. [Cross-process continuation tests](https://github.com/hpoenixf/open-etf-agent/blob/bcc12995c83abfbd5b37b9792f5a86ab74aa788e/test/durable-runtime.test.mjs)

```bash
node --test --test-concurrency=1 test/durable-runtime.test.mjs
```

During these examples, record the question each artifact answers. `report.md` retains readable work. Process records describe tool actions and outcomes. Current memory records reflect saving, revision and forgetting. Derived notes help later work locate sources. Cross-process tests exercise interruption and continuation of the same task at supported positions.

One continuation case is particularly revealing. When an action was dispatched without an outcome, the system retains that uncertainty and checks that another process does not execute it again. Unknown status affects subsequent decisions and should remain visible. The saved-report case instead verifies the original artifact, making the distinction between recovery and generating a similar-looking replacement concrete.

Apply these observations by working backward from the user promise. Conversation review calls for history reading. Reusing preferences calls for effective memory reaching the next request. Cross-process continuation calls for restoring execution identity, completed work, unknown outcomes and allowances. Each promise has corresponding observable behavior, giving a concrete object to discussions of what an Agent remembers.

When designing “remember me” or “continue,” make the promise concrete. Does the user need conversation review, a lasting preference, access to earlier material or the original execution position? That choice determines what to retain and how to verify its later use.

Continue to [From One Report to Durable Execution and Specialists](./open-etf-agent-v010-system-design.md) to see these concepts participate in a complete design. [Current open-source project](https://github.com/hpoenixf/open-etf-agent)
