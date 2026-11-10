---
title: "History, Context, Memory and Checkpoints — How Does an Agent Continue?"
description: "Return to a document comparison after closing the program. Distinguish conversation history, current input, lasting memory and execution checkpoints to understand what viewing the past and resuming work each require."
readingBrief:
  takeaways:
    - "Conversation history retains exchanges. Context construction determines which parts reach the next model call."
    - "Memory supports reuse across tasks, while preferences, original documents and derived conclusions retain different purposes."
    - "Checkpoints save execution state at supported boundaries. Continuation still depends on effect records, task identity and budgets."
    - "Reading a report, asking a new question and resuming an original task are different operations. Uncertain writes require inspection."
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

## Why lasting memory has a separate purpose

Some information should span many tasks, such as the user's explicit preference for a comparison table first. Searching entire conversations every time costs resources and risks turning a temporary request into a lasting rule.

Memory lets the system select information worth retaining, record its scope and source, and support correction and forgetting. Later use retrieves relevant current records and selects suitable content for the input.

A request may therefore contain both conversation history and memory. Recent history helps locate the current exchange. Memory provides selected background across tasks. New user requirements also need clear representation so the model can reason about their applicability.

Product guides are another kind of object. They supply product facts and need original versions and readable locations. Retrieval can serve both documents and memory while preserving the distinction between personal preferences, original facts and derived conclusions.

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

## Locate the interruption before acting on “continue”

**Case one: A was read and the result retained.** Verify that result and continue with B at a supported position. Whether rereading is appropriate also depends on whether the task needs its original snapshot or current material.

**Case two: report saving was dispatched but confirmation was lost.** The file may already exist. Inspect the original operation, artifact and receipt before deciding what to do next. Blind rerunning can duplicate effects.

**Case three: the report already completed and the user returned to read it.** Open the retained version. A new research question can then create the appropriate new task.

These cases involve execution continuation, uncertain-effect inspection and existing-result reading. A single visible “continue” control can still preserve these distinctions internally.

A checkpoint supplies no new permissions or budget. Same-task recovery uses the original identity and its records, while a new task follows its admission path. The added persistence and consistency work is justified when cross-process continuation matters. Short computations that can safely restart may use a simpler approach.

## What remains accessible after compaction

A long task may organize earlier material into notes and remove large original texts from current input. The notes help the next decision, original sources support verification and checkpoint state supports execution continuation.

If a note says “B's export condition still needs checking,” the next step can reread the page. If the execution record says a report was saved, a model-written summary cannot change that effect into something that never occurred.

**Compaction changes the working representation. Durable records retain the corresponding facts.** Keeping those purposes distinct supports compact input and a research process that remains inspectable. [Context compaction guide](./agent-main-run-context-compaction.md)

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

When designing “remember me” or “continue,” make the promise concrete. Does the user need conversation review, a lasting preference, access to earlier material or the original execution position? That choice determines what to retain and how to verify its later use.

Continue to [From One Report to Durable Execution and Specialists](./open-etf-agent-v010-system-design.md) to see these concepts participate in a complete design. [Current open-source project](https://github.com/hpoenixf/open-etf-agent)
