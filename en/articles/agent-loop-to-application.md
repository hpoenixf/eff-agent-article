---
title: "Agent Deep Dive: Run a Specialist Collaboration in v0.15"
description: "Follow actual Open ETF Agent v0.15 code through Main delegation, a Child loop, focused contexts, and report generation before exploring the full architecture."
---

# Agent Deep Dive: Run a Specialist Collaboration in v0.15

> **Deep dive · Stop 3**　[Introduction](./agent-in-15-minutes.md) → [Intermediate](./agent-ten-modules.md) → Deep dive → [Panorama](./017-prompt-to-answer-six-layer-panorama-v3.md)

The previous article introduced ten modules. Now open [Open ETF Agent v0.15](https://github.com/hpoenixf/open-etf-agent/tree/74bd5aa455ccaeb2994eb22aa744affde660bfa2) and follow an implemented example to see them cooperate.

The task remains small: compare the two synthetic Atlas Notes guides, **ask a source-checking specialist to inspect free-edition export restrictions, then let the main assistant assemble a report.**

This path involves Main, Child, their contexts, tools, Session, and report storage. The default CLI simulates model actions with a script for easy local execution while using the project's actual Gateway, Runtime, and file operations.

## Keep the task in view

The first pages contain the required information:

| Item | Free edition A | Free edition B |
| --- | --- | --- |
| Export formats | CSV | CSV, Markdown |
| Per-export limit | 120 rows | 300 rows |
| Export condition | Internet connection required | Internet connection required |

See the [fixed document fixtures](https://github.com/hpoenixf/open-etf-agent/blob/74bd5aa455ccaeb2994eb22aa744affde660bfa2/fixtures/documents.json). Main owns the overall task; Child focuses on these limits and conditions. This example uses one parent and one serial specialist.

**Remember the route: Main asks for a check → Child reads A/B → original material and observations return to Main → Main saves a report.**

## Run first, then follow the output into the code

Using the [v0.15 environment from the introduction](./agent-in-15-minutes.md#try-the-example-in-five-minutes), choose a new exercise directory:

```bash
node src/specialist-cli.mjs run --session runs/deep-specialist-v015
```

The terminal output includes the task's `runId` and directory. Substitute the actual `runId` in this command:

```bash
node src/specialist-cli.mjs read --session runs/deep-specialist-v015 --run RUN_ID
```

Look at three fields: `child.summary` contains the specialist's observation, `sources` contains the acquired original pages, and `report.text` contains the report. The offline report includes the Child observation and both original pages, making the handoff easy to inspect.

Having already run the Intermediate article's specialist example, you can use that session directory and `runId` directly. Use a new directory for each fresh experiment.

## Step one: prepare a task for Main

The entry file, [specialist-cli.mjs](https://github.com/hpoenixf/open-etf-agent/blob/74bd5aa455ccaeb2994eb22aa744affde660bfa2/src/specialist-cli.mjs), accepts `run` or `read`. [specialist-demo.mjs](https://github.com/hpoenixf/open-etf-agent/blob/74bd5aa455ccaeb2994eb22aa744affde660bfa2/src/specialist-demo.mjs) assembles the example: open Session, supply the task, prepare a Gateway, and register the source-checking tool.

Main can use `source_check`, `save_report`, and `read_page`. This example starts with `source_check`, assigning the free-export limits and shared online requirement to the specialist.

This resembles choosing `read_page` in the introduction: **Main's loop proposes a tool call and waits for its returned material.** Here, the tool runs a focused agent internally.

## Step two: give Child a clearly scoped task

[specialist-child.mjs](https://github.com/hpoenixf/open-etf-agent/blob/74bd5aa455ccaeb2994eb22aa744affde660bfa2/src/specialist-child.mjs) manages the handoff. Child receives the overall question, its specific checking task, and the allowed A/B documents.

Its tool scope is smaller: only `read_page`. Child acquires material and returns observations; Main assembles the report.

The assistants therefore have different working desks. Main addresses the complete comparison. Child focuses on export restrictions and needs the checking method and original pages. **Delegation starts with the question, context, and tool scope.**

For developers, the design opportunity is familiar: a focused piece of work with clear inputs and outputs may suit a dedicated assistant.

## Step three: Child runs its own loop

[child.mjs](https://github.com/hpoenixf/open-etf-agent/blob/74bd5aa455ccaeb2994eb22aa744affde660bfa2/src/child.mjs) invokes the project's existing `run`. Child and Main share the execution mechanism, each with its own task input and context.

The default Child sequence has three turns:

| Child turn | Action | Material for later decisions |
| --- | --- | --- |
| First | Read A's first page | A's formats, limit, and condition |
| Second | Read B's first page | B's corresponding content |
| Third | Return a checking observation | Which sources were inspected and the observation |

Each page result enters the next Child input. With a live model, that model selects actions from current material; the default example uses scripted choices to make the connections observable.

**A subagent follows the same choose → execute → receive-result loop.** Once the introduction's loop is familiar, delegation is the principal additional idea.

## Step four: return sources and observations to Main

After Child finishes its focused work, the handoff supplies acquired pages and the observation to Main. Main can use both what the specialist said and the original material.

Think of a colleague returning an investigation note with the documents they consulted. The note highlights the important points; the material supports the main task's overall explanation.

In code, this arrives as the result of `source_check`. **Main then proceeds to its own next turn, continuing the existing task.**

## Step five: Main produces the report and finishes

In the default example, Main proposes `save_report` after the handoff, incorporating the specialist observation and original pages. After receiving the save result, it returns a final answer.

Expanding the parent and child loops makes the connection visible:

| Main progression | Child work during that step |
| --- | --- |
| First turn: call `source_check` | Read A → read B → return observation and original sources |
| Second turn: use the handoff and call `save_report` | This specialist task has finished |
| Third turn: return the final answer | — |

Gateway access, tool execution, context updates, and report storage flow through the existing modules. Session links parent and child tasks so this collaboration can be located and inspected.

That is what makes v0.15 useful beyond the first single loop: **one execution foundation now coordinates two cooperating tasks.**

## Follow four files instead of starting with the whole directory

Read in task order:

| File | First question to answer |
| --- | --- |
| `specialist-cli.mjs` | How does the command enter the program? |
| `specialist-demo.mjs` | What task and tools are supplied to Main? |
| `specialist-child.mjs` | How is the child task created and its result returned? |
| `child.mjs` | How does Child run the same loop with its own input? |

Then enter `runtime.mjs`; model calls, tool execution, and next-turn input will be easier to recognize. All files are in the [fixed source directory](https://github.com/hpoenixf/open-etf-agent/tree/74bd5aa455ccaeb2994eb22aa744affde660bfa2/src).

## Explore other v0.15 capabilities by question

Specialist collaboration is one useful path through several modules. Choose a separate example for another question: [human responses](./agent-durable-human-interaction-response-adoption.md) for incorporating user input, [memory](./026-agent-memory-forget-durable-effects.md) for reading preferences in later tasks, or [result consumption](./financial-agent-python-result-consumption.md) for connecting computation to reports. Follow each article's version-specific commands.

These capabilities have their own entry points. Understand this one main path first, then select the extensions you need.

## Next: expand this path into the panorama

You have now seen a single loop, ten groups of capabilities, and two tasks cooperating within the same program.

**Continue with [The Six-Layer ETF Agent Request Lifecycle](./017-prompt-to-answer-six-layer-panorama-v3.md).** Find the entry point, context, Main/Child, and tools in the diagram first, then explore other areas. The panorama covers a larger system; use each article's public source links to identify implemented scope.

[Back to Intermediate](./agent-ten-modules.md) · [中文](../../articles/agent-loop-to-application.md) · [Open ETF Agent (stars welcome)](https://github.com/hpoenixf/open-etf-agent)
