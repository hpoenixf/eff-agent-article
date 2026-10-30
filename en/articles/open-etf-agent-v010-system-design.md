---
title: "Agent Deep Dive: From One Report to Durable Execution and Specialist Collaboration"
description: "Combine the original v0.10 system-design article with v0.15 specialist collaboration, following data, execution, and delegation before the six-layer panorama."
---

# Agent Deep Dive: From One Report to Durable Execution and Specialist Collaboration

> **Deep dive · Stop 3**　[Introduction](./agent-in-15-minutes.md) → [Intermediate](./agent-ten-modules.md) → Deep dive → [Panorama](./017-prompt-to-answer-six-layer-panorama-v3.md)

The first two articles explained how AI chooses the next step in a loop and what ten modules do. Now take another step: **How does the same work continue when information passes through several tools, another process takes over execution, or another assistant handles part of the task?**

This is one reading path through Open ETF Agent from v0.10 to v0.15. The original system-design article and the new specialist walkthrough are combined here at the original URL. The [original v0.10 edition](https://github.com/hpoenixf/eff-agent-article/blob/a377164e53e5f63b7a6114d54e2635c084dfbbcd/en/articles/open-etf-agent-v010-system-design.md) remains available as a fixed snapshot.

We will examine three questions: how information becomes a report, how execution continues, and how a specialist contributes. These are independent examples sharing the same execution foundation. Default public commands use synthetic material and scripted model actions while executing actual tools, storage, and process handoffs.

## 1. How do source data and calculations reach a report?

Start with the small v0.10 example. A synthetic table has three values: **100, 999, and 250**, all in USD with a data date of 2026-10-01. The task compares the first and last rows. The middle value, 999, is not an operand.

Passing 100 and 250 to a calculator is straightforward. Once a model explanation, report, and CSV follow, the numbers also need to retain their origin.

The capability connects the steps: **read the source table → select two rows → calculate once → use the same result in the next model input, report, and CSV.**

`read_comparison` retrieves the source and Result retains the original content. A calculation request refers to that result and identifies the selection and row positions. The calculator reads the saved source values, producing a difference of 150, a current-to-baseline ratio of 2.5, and a relative increase of 150%, while retaining units, currency, and date.

The report and CSV draw their values from that calculation. A reader can trace a reported number back to the computation and then to the original rows. The model still explains what the numbers mean.

The design choice is practical: existing tools already read, calculate, and save. Add the reference relationships that let one result continue through them. The [original proposal](https://github.com/hpoenixf/open-etf-agent/blob/ff5b9273ef0d239e804f61792702cd2e94174be7/openspec/changes/result-reference-consumption/proposal.md) records that reasoning.

<details>
<summary>Further detail: v0.10 selection and numerical definitions</summary>

The request has this shape; the read tool returns the actual `resultRef`:

```json
{
  "resultRef": "result reference returned by reading the source table",
  "selection": { "offset": 0, "limit": 3 },
  "baselineRow": 0,
  "currentRow": 2
}
```

The selection must cover both operands. Reading only the first two rows does not supply the third. Date, currency, and denominator requirements also remain attached to the computation. The numerical section comes from the calculation; free-form conclusions still require interpretation against the sources.

The [independent-readback record](https://github.com/hpoenixf/open-etf-agent/blob/ff5b9273ef0d239e804f61792702cd2e94174be7/docs/verification/result-consumption-independent.safe.json) checks original report and CSV output. Gateway-encoding checks establish that material entered a request, not that a live model understood it correctly.

</details>

## 2. Who continues after the submitting process exits?

A short task can finish within one command. Longer work can separate submission from execution: register a task first, then let a Worker take it over.

Three familiar modules divide the work:

| Part | Responsibility |
| --- | --- |
| Session | Retain the task, its progress, and execution conditions |
| Worker | Drive one explicitly selected task |
| Runtime | Continue the existing model-and-tool loop |

Worker reuses Session's execution records and calls the same runtime. The [single-Run proposal](https://github.com/hpoenixf/open-etf-agent/blob/ff5b9273ef0d239e804f61792702cd2e94174be7/openspec/changes/v09-single-run-worker/proposal.md) narrowed the design to this clear path instead of adding another layer of task state.

The command window and research task can then have separate lifecycles. A later process takes over the same task with its allowed scope, consumed budget, and original deadline.

The original article's `durable-publication` example demonstrates that handoff. It runs separately from the calculation example, giving a second view of the same foundation.

<details>
<summary>Further detail: boundaries of continued execution</summary>

Continuation relies on existing execution facts and supported checkpoints. Dispatched requests with unknown outcomes are not automatically replayed; stopping a Worker does not itself cancel the user's task. Committed answer bodies and saved files retain their own identities through later task changes.

v0.10 uses `tool-host@2`. Persisted `tool-host@1` snapshots cannot be resumed or replayed by the newer runtime, including snapshots of already terminal Runs. Before an upgrade, let active tasks finish on their original version or isolate the old code and data. Independent reading of Results, Artifacts, and Publications is separate from execution recovery. The [upgrade checklist](https://github.com/hpoenixf/open-etf-agent/blob/d943dd8452e4a97fbca5e5c74537a05655e73837/docs/upgrade-guide.md) preserves these conditions; its synthetic old-label tests do not constitute acceptance of a real old-snapshot migration.

</details>

## 3. Add a specialist: how do two loops cooperate?

v0.15 adds one serial source-checking specialist. Return to the introduction's Atlas Notes task: Main compares the guides, while Child focuses on free-export limits and conditions.

The original material remains small: A's free edition exports CSV with a 120-row limit; B supports CSV and Markdown with a 300-row limit; both require an internet connection. These facts come from the [fixed synthetic documents](https://github.com/hpoenixf/open-etf-agent/blob/74bd5aa455ccaeb2994eb22aa744affde660bfa2/fixtures/documents.json).

Remember the route: **Main requests a check → Child reads A/B → original pages and observations return to Main → Main assembles a report.**

### Main starts with a tool call

[specialist-demo.mjs](https://github.com/hpoenixf/open-etf-agent/blob/74bd5aa455ccaeb2994eb22aa744affde660bfa2/src/specialist-demo.mjs) prepares Main's task and tools. The example chooses `source_check`, delegating the free-export limits and common online requirement.

From Main's loop, this resembles selecting a page-reading tool: propose an action and receive its result. In this case, the tool runs a more narrowly focused assistant internally.

### Child runs with its own material

[specialist-child.mjs](https://github.com/hpoenixf/open-etf-agent/blob/74bd5aa455ccaeb2994eb22aa744affde660bfa2/src/specialist-child.mjs) establishes the handoff. Child receives the overall question, the specific checking request, and the permitted A/B documents. Its only tool is `read_page`; Main organizes the final report.

[child.mjs](https://github.com/hpoenixf/open-etf-agent/blob/74bd5aa455ccaeb2994eb22aa744affde660bfa2/src/child.mjs) calls the project's existing `run`. Both assistants share the execution mechanism, with separate task input and context.

| Child turn | Action | Newly acquired material |
| --- | --- | --- |
| First | Read A's first page | A's formats, limit, and condition |
| Second | Read B's first page | B's corresponding content |
| Third | Return a checking observation | Inspected material and observations |

Each tool result enters the next turn's input. With a live model, the model chooses subsequent actions from current material. The default example uses fixed actions to make the connections easy to inspect.

### Main receives the material and continues its next turn

Child returns original pages alongside its observation. Think of a colleague handing over an investigation note with the source documents attached. Main can use the highlighted points and the underlying material in its report.

This enters Main's context as the result of `source_check`. The default sequence then selects `save_report` and returns its final answer:

| Main progression | Where Child participates |
| --- | --- |
| First turn: call `source_check` | Child reads A/B and returns observations with original pages |
| Second turn: organize the handoff and call `save_report` | This specialist task has finished |
| Third turn: give the final answer | — |

**AI still chooses task actions, the runtime still drives the loop, and tools still execute operations; together they now coordinate two cooperating tasks.** Session links parent and child, Result retains original material, and report storage preserves the output. The modules from the Intermediate article form a concrete path here.

## 4. Explore the main path in one v0.15 checkout

Use the [v0.15 environment installed in the introduction](./agent-in-15-minutes.md#try-the-example-in-five-minutes) and a new dedicated directory:

```bash
node src/specialist-cli.mjs run --session runs/deep-specialist-v015
```

The terminal prints the actual `runId`. Substitute it in this command:

```bash
node src/specialist-cli.mjs read --session runs/deep-specialist-v015 --run RUN_ID
```

Begin with `child.summary`, `sources`, and `report.text`: the specialist observation, acquired pages, and report body. The default report lists the observation and original A/B pages, making the handoff inspectable. A session already created by the Intermediate example can be read using its directory and `runId`.

Read four entry points in order: **[specialist-cli.mjs](https://github.com/hpoenixf/open-etf-agent/blob/74bd5aa455ccaeb2994eb22aa744affde660bfa2/src/specialist-cli.mjs) → specialist-demo.mjs → specialist-child.mjs → child.mjs**. Identify who passes what to whom before entering `runtime.mjs`.

<details>
<summary>Reproduce the original v0.10 calculation and independent Worker examples</summary>

These commands preserve the original fixed version. Use a separate directory from the v0.15 checkout. Node.js 26.11.1 matches that historical verification environment.

```bash
git clone https://github.com/hpoenixf/open-etf-agent.git open-etf-agent-v010
cd open-etf-agent-v010
git switch --detach ff5b9273ef0d239e804f61792702cd2e94174be7
npm ci --ignore-scripts --no-audit --no-fund
npm run build
node dist/src/cli.mjs --case result-consumption --output runs/article-v010
```

Inspect the report, source manifest, and CSV in the actual output directory. The Worker example uses another new Session directory; run these commands consecutively:

```bash
node dist/src/session-cli.mjs submit --session runs/article-worker --run original-example --case durable-publication
node dist/src/session-cli.mjs work --session runs/article-worker --run original-example
node dist/src/session-cli.mjs publication --session runs/article-worker --run original-example
```

This example's 30-second deadline begins at submission. It demonstrates submission-process exit, execution by a separate process, and reading the original answer. See the [Worker cases](https://github.com/hpoenixf/open-etf-agent/blob/ff5b9273ef0d239e804f61792702cd2e94174be7/test/worker-process.test.mjs) for the original recovery conditions. Default examples run offline after dependency installation, which may access npm.

</details>

## Next: place the concrete path in the panorama

You can now understand the system from three directions: **information continues through references, execution continues within the same task, and specialists contribute to clearly scoped questions.** The modules from the first two articles have concrete places in that flow.

Continue with [**The Six-Layer ETF Agent Request Lifecycle**](./017-prompt-to-answer-six-layer-panorama-v3.md). Find the entry point, context, Main/Child, and tools first, then explore other areas as needed. The panorama covers a larger system; each article's fixed source identifies its public implementation scope.

[Back to Intermediate](./agent-ten-modules.md) · [Current source project](https://github.com/hpoenixf/open-etf-agent) · [中文](../../articles/open-etf-agent-v010-system-design.md) · [Engineering notes on GitHub (stars welcome)](https://github.com/hpoenixf/eff-agent-article)
