---
title: From the First Report to a Resumable Research Program — Open ETF Agent’s Second Stage
description: Follow a synthetic comparison task in v0.10 to see how source material, calculations, and reports stay connected, then explore a separate durable execution path that continues across processes.
---

# From the First Report to a Resumable Research Program — Open ETF Agent’s Second Stage

[When we introduced v0.1](/en/articles/open-etf-agent-v01-first-readable-report), Open ETF Agent did one small thing: read two sources, compare them, save a report, and let another process read back the original file. The central question was what had actually happened when the model said “done.”

By v0.10, that question had moved forward: **When source material passes through selection, calculation, and delivery—and execution may span processes—how can later consumers keep using the original facts rather than independently reconstructing something that merely looks the same?**

That is the thread running through this second stage. It is neither an attempt to fill out every module nor a declaration that the product can independently conduct real fund research. The public project still uses synthetic material and scripted actions to check its execution mechanisms. But two reproducible paths now make the system concrete: one runs from a source table to a report and CSV; the other lets an independent Worker continue the same Run after the submitting process exits, then reads back the committed answer body.

These paths share an execution foundation, but they are separate examples. We will first follow the data through the comparison example, then use the second example to explain the program’s lifecycle—not combine them into a full-featured task that has supposedly already run.

## 1. Connecting Results, Not Just Adding Tools

The simple design in v0.1 had a reason. Reading sources, performing a calculation, and saving files all happened in one local flow. Separating three responsibilities was enough to start: the model gateway received and normalized model responses, the runtime owned the execution loop, and the tool host validated arguments and produced actual effects.

Later development did not overturn that structure. The new problem was that **success at one step cannot stand as evidence for the next.**

Reading a page does not mean a calculation used its numbers. Producing a number does not mean the next request received it. A report and CSV both containing numbers does not mean they came from the same calculation. Having each tool return “success” leaves these gaps intact.

The [original Result / Reference proposal](https://github.com/hpoenixf/open-etf-agent/blob/ff5b9273ef0d239e804f61792702cd2e94174be7/openspec/changes/result-reference-consumption/proposal.md) therefore did not call for another results database or calculation platform. Raw results could already be saved, the runtime already passed tool results back to the gateway, and reports and CSVs were already deliverable files. What was missing was a verifiable connection between these steps.

That connection is what v0.10 adds: select inputs from saved source content, calculate with the existing calculator, and have the next request, report, and CSV use the same derived result. This is a complete capability added to the existing flow, not a second execution flow.

## 2. Following a Small Table into a Report and CSV

The example starts with a table explicitly marked as synthetic data. It deliberately contains three rows, with values of 100, 999, and 250. Their units match, their currency is USD, and their data date is 2026-10-01. The task compares the first and last rows; the middle row is not an operand.

This demands more than passing `100` and `250` straight to a calculator: the program must be able to explain where those operands came from.

### Retrieve the Source, Then Select the Operands

`read_comparison` retrieves fixed source material through the existing tool host. Result retains the raw content and its identity. The calculation request then supplies the raw-result reference, a selection, and two row positions:

```json
{
  "resultRef": "raw-result reference returned after retrieving the source",
  "selection": { "offset": 0, "limit": 3 },
  "baselineRow": 0,
  "currentRow": 2
}
```

This illustrates the request shape; the tool returns the actual reference at runtime. The calculator parses values from the saved original bytes rather than trusting numbers copied into the request by the caller. The reference, content hash, actual selection, and row positions remain attached to the derived result.

This also explains the small but deliberate choice to use the final row. If the selection covers only the first two rows while the request still asks for the third, the program cannot supply 250 on the assumption that the table “might contain more data.” The selection does not cover the required operand, so the comparison is unavailable.

Even a complete selection means only that the selected stored rows were retrieved in full. It does not establish that the upstream material covers every holding, much less that the model understood the entire source.

### Carry the Numerical Basis Along with the Result

For this table, the difference is 150, the current value is 2.5 times the baseline, and the increase relative to the baseline is 1.5, or 150%. These are not three interchangeable descriptions.

The derived result also retains the operands, units, currency, and data date. If dates or currencies differ, or the denominator is unknown, the current “same-snapshot comparison” method cannot return an apparently normal bound result. The program returns a specific reason for unavailability. It neither treats an unknown value as zero nor invents a denominator.

Limitations must travel with the result if they are not to disappear in later wording. The runtime adds tool results to subsequent input. Verification of the production gateway’s encoding checks whether the actual encoded request carries the same reference, values, and qualifications. An injected offline transport inspects these requests; the presence of those bytes in a request is not presented as evidence that a real model reasoned correctly from them.

### The Report and Attachment No Longer Recalculate Separately

CSV generation receives a reference to the derived calculation, not another manually assembled set of numbers. When saving the report, the tool host also generates its numerical section from the original calculation result. Both deliverables can therefore be traced to the same calculation and then to the same source selection.

Free-form report prose remains a separate matter. The program-generated numerical section can be checked, but that does not automatically support every written conclusion. This distinction lets the system guarantee the relationships it actually controls without taking over the model’s semantic judgment.

Once the files are saved, Artifact and Revision identify each deliverable and its revision. An independent process reads the original report and CSV bytes and checks the receipts, rather than calling the model again to generate a similar answer. The [independent-readback record retained from before the v0.10 version designation](https://github.com/hpoenixf/open-etf-agent/blob/ff5b9273ef0d239e804f61792702cd2e94174be7/docs/verification/result-consumption-independent.safe.json) captures this path: numerical results and file identities can be checked together.

The change is concrete. We can now ask not only “Was it saved?” but also “Which rows produced the saved numbers, and do the report and attachment represent the same result?”

## 3. Processes Can Change; Execution Identity Must Not Reset

Once files can be read back, another question remains: who continues the task when the submitting process exits? Does the next process continue the original task or perform it again?

This is not a hidden step in the comparison example above. The public project uses a separate `durable-publication` example to verify durable execution and answer-body delivery. Its material and actions are also synthetic, while SQLite commits and process handoff really occur.

There is another important tradeoff here. An earlier Worker direction considered a larger queue mechanism. The later [single-Run proposal](https://github.com/hpoenixf/open-etf-agent/blob/ff5b9273ef0d239e804f61792702cd2e94174be7/openspec/changes/v09-single-run-worker/proposal.md) narrowed the scope: if a Worker takes over just one explicitly identified Run, it can reuse Session’s existing execution lease rather than duplicate it with another layer of Task state.

The responsibilities therefore remain separate:

- **Session** stores the original task definition, budget, deadline, and checkpoint, and determines who currently has authority to write execution state.
- **Runtime** continues to own dispatch and recovery. Worker does not introduce a second execution loop.
- **Worker** drives the selected Run, manages its own process lifecycle, and reads the existing execution facts.
- **Publication and Artifact** retain committed answer bodies and file deliveries respectively, rather than making their existence depend on whether a process is still alive.

The submit command can therefore exit before another process takes over. But that process cannot reset the consumed budget, replace the original authorization, or extend the deadline. An operation with a durable result is not repeated merely because the process changed.

More importantly, **resumable does not mean safe to retry after every interruption.** If a request has been dispatched but no authoritative result exists, the system retains the fact that the outcome is unknown and refuses automatic replay. Starting a new Worker does not make a retry safe. Stopping a Worker does not automatically mean the user has canceled the task, either. These distinctions determine what can happen next; they cannot be collapsed into a generic “retry on failure.”

Committing an answer body has its own boundary. Once an answer block is written to Publication, a later Run failure does not erase it. Replacing the body requires an explicit commit through the original revision relationship, rather than treating the “latest output” as the original answer. An unavailable attachment should not revoke an independently valid answer body either.

The state of the whole Run, whether a particular answer body has been committed, and whether a particular file has been delivered are thus related but distinct facts. Keeping their identities separate makes it possible to tell what remains after an interruption.

## 4. Running Both Paths at a Fixed Version

This article uses the [fixed v0.10 source snapshot](https://github.com/hpoenixf/open-etf-agent/tree/ff5b9273ef0d239e804f61792702cd2e94174be7). For day-to-day use, start with the [current main README](https://github.com/hpoenixf/open-etf-agent/blob/main/README.md). Do not assume commands or recovery capabilities from later versions apply to this snapshot.

Node.js 26.11.1 matches the existing verification environment. The default examples need no model key. Dependency installation may access npm; afterward, both examples run offline. The public implementation uses native JavaScript ESM. Its `build` checks and copies source code and resources; it is not a TypeScript type check.

```bash
git clone https://github.com/hpoenixf/open-etf-agent.git
cd open-etf-agent
git switch --detach ff5b9273ef0d239e804f61792702cd2e94174be7
npm ci --ignore-scripts --no-audit --no-fund
npm run build

node dist/src/cli.mjs --case result-consumption --output runs/article-v010
```

The CLI returns the actual Run directory and delivery receipts. Inspect `report.md` and `manifest.json` in that directory, then use the attachment identity in the manifest to inspect the CSV. The point is not merely to see that files exist, but to compare their original sources, calculation references, numerical basis, and attachment receipts.

Stay in the repository root and use a separate session output directory. Run the following three commands consecutively to observe “submission exits → independent process executes → original answer body is read back”:

```bash
node dist/src/session-cli.mjs submit --session runs/article-worker --run original-example --case durable-publication
node dist/src/session-cli.mjs work --session runs/article-worker --run original-example
node dist/src/session-cli.mjs publication --session runs/article-worker --run original-example
```

This example’s 30-second deadline starts at submission, not when `work` begins. The process has already exited when the first command returns; the second command launches another process. The third only reads the answer body and original receipts—it does not execute model actions again. Use a new session directory for another experiment rather than overwrite old results.

These commands demonstrate cross-process handoff, not transparent recovery after forcibly terminating any external call. Continuation at safe checkpoints, stopping, and unknown effects are separately constrained by the [Worker process cases](https://github.com/hpoenixf/open-etf-agent/blob/ff5b9273ef0d239e804f61792702cd2e94174be7/test/worker-process.test.mjs) and recovery paths. An easily missed upgrade constraint is the execution-protocol version. v0.10 uses `tool-host@2`; persisted `tool-host@1` snapshots cannot be resumed **or replayed** through the new Runtime, **even if the old Run was already terminal**. Let active Runs finish on their original version before replacement, or isolate the old code and data rather than sharing a live Session between old and new Workers. Retained Results, Artifacts and Publications have independent readers: **readable output does not make the old Host restorable**. The [upgrade checklist](https://github.com/hpoenixf/open-etf-agent/blob/d943dd8452e4a97fbca5e5c74537a05655e73837/docs/upgrade-guide.md) also notes that current compatibility tests alter a synthetic snapshot version; they are not an acceptance run migrating a real snapshot produced by the old Runtime.

## 5. Which Complexity Is Worth Keeping?

Looking outward from these two examples makes the other mechanisms easier to place.

Skill and MCP connect methods and external tools to the same host. Bounded Child execution can separate contexts while remaining subject to the root budget. Result and Context distinguish original content from material sent in a request. Compaction notes cannot replace original sources, and explicit Memory cannot silently turn a temporary input into a lasting preference. Their value lies not in adding module names but in addressing specific problems already encountered along the main path.

For the same reason, the public version does not need every mechanism in its fullest form at once. The current Child example still uses scripted delegation, and Worker is not a scheduled-execution platform. PDF input is future work, not an entry point available in this article’s fixed version. To explore the fuller module designs, start from the [Open ETF Agent topic page](/en/open-etf-agent), then compare each article with the scope of its public implementation.

What has emerged in this second stage is an engineering foundation that can support further research capabilities: **original facts can be retrieved, derived results can be traced, what later consumers used can be inspected, and changing processes does not automatically rewrite execution identity.** This lets us break “it runs” into concrete questions instead of compressing everything into “the Agent is done.”

The same standard can guide the next addition: which missing connection does it establish? Another wrapper around an already readable interface may not be worth it. Enabling an input that previously stopped short to actually reach its consumer has a clear purpose.

The [v0.1 article](/en/articles/open-etf-agent-v01-first-readable-report) preserves the minimal starting point, the module articles explain their individual design histories, and this article connects the current public project into a runnable map. Try an example from the [public repository](https://github.com/hpoenixf/open-etf-agent), then work outward through its source material, results, and deliverables. If this direction is useful to you, consider starring the repository or opening an issue with a reproducible example.
