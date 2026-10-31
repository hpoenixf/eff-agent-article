---
title: "Start with a Report You Can Read Back: Open ETF Agent v0.1"
description: Run the fixed offline example to inspect source identity, tool execution, partial writes, and independent file readback, then separate known facts from gaps in a real-model rejection.
---

# Start with a Report You Can Read Back: Open ETF Agent v0.1

> For the later system design, start with [From the First Report to a Resumable Research Program — Open ETF Agent’s Second Stage](./open-etf-agent-v010-system-design.md). This article preserves the v0.1 engineering starting point.

After reading an article about agent architecture, a natural question remains: how do these components actually run together?

We have already written about tool calls, context, memory, subagents, and publication. Putting all of them into the public project on day one would make it harder to see which responsibilities a task needs immediately and which ones emerged from later problems.

Open ETF Agent therefore starts with something smaller: **read two documents, compare them, save a report, and let another process read back the same file.**

v0.1 makes that engineering path publicly available. Its default example uses a script to choose actions while executing real reads, calculations, and saves. This lets us inspect how the program works; it does not establish whether a real model understands the documents. This article explains the first path. Later increments will connect runnable source code to the module articles we already have.

## Latest public entry point — as of 2026-10-31

The current stable code is the [fixed v0.15.2 snapshot](https://github.com/hpoenixf/open-etf-agent/tree/34124cefc6df289e08518173789210b45a716451). Continue through the existing module essays on [explicit Memory consumption](./026-agent-memory-forget-durable-effects.md), [serial source checking and Main handoff](./agent-subagent-context-specialization.md), and [why summaries must not replace report receipts](./agent-main-run-context-compaction.md). v0.15.1 repairs these execution boundaries; v0.15.2 then handles [null stream continuations after a tool ID is established](./agent-stream-tool-call-null-continuation.md), without changing tool authorization.

For ongoing installation and usage, use the [current main README](https://github.com/hpoenixf/open-etf-agent/blob/main/README.md). Default demonstrations use synthetic material and scripted actions. These repairs also have independent real-model task records, but those do not rewrite older failures or establish summary understanding or investment-research quality. Work on 0.16/0.17 is not formally released and is not part of this stable capability set. The October 28 progress snapshot and original v0.1 example remain below; historical commands still belong to their fixed versions and should not share a working directory across versions.

## Where to continue now — as of 2026-10-28

As of **2026-10-28**, the latest public numbered version is **v0.13.0 ordinary durable responses**. One question is saved before yielding the execution lease; an explicit resume of the same Run adopts the original reply as a tool result that reaches the next request and report. Use the [current main README](https://github.com/hpoenixf/open-etf-agent/blob/main/README.md) as the ongoing entry point or the [fixed v0.13 source](https://github.com/hpoenixf/open-etf-agent/tree/300f78f7066ab76fcc4e9efb54137ff021ecc278) for this example. The [existing human-interaction article](./agent-durable-human-interaction-response-adoption.md) explains the commands and the distinction between receipt and adoption. This minimal path adds no Human Park, automatic wake-up, approval or account identity platform; waiting refreshes neither budgets nor deadlines. The earlier [fixed v0.12 Temporal source](https://github.com/hpoenixf/open-etf-agent/tree/46c2822be9865b99696bb70fb9e0ff1b5257ff35), [fixed v0.11 PDF source](https://github.com/hpoenixf/open-etf-agent/tree/b11f70e57121f5c80a15893d6ba5e10d447d4e6c), [fixed v0.10 Result / Reference snapshot](https://github.com/hpoenixf/open-etf-agent/tree/ff5b9273ef0d239e804f61792702cd2e94174be7) and [fixed v0.9 Worker snapshot](https://github.com/hpoenixf/open-etf-agent/tree/dad9c6e64f32c3d7579aea96613776b40917ec6d) remain available. The [temporal-semantics article](./agent-temporal-semantics-market-calendar.md) retains the frozen-time example. The rest of this article preserves v0.1 and its original boundaries rather than attributing later capabilities to the first version.

The [fixed v0.11 PDF qualification snapshot](https://github.com/hpoenixf/open-etf-agent/tree/1de10d40b69db9a83ff990c32e8e272121052814) retains its [fixed execution evidence](https://github.com/hpoenixf/open-etf-agent/tree/e1b8e4edde724548fab16d8ca4b205379bfa7f30); it is not a floating main HEAD. See the [existing PDF article](./024-agent-pdf-from-text-to-evidence.md) for the runnable scope and exclusions. Stable here means bounded, provider-free Runtime and delivery checks, not a formal Release, cloud deployment, model-quality guarantee or the full PDF Reader. OCR, page images, layout, multimodal reading and active-parse recovery remain outside this version.

The public implementation has progressed from file readback to immutable artifacts, SQLite checkpoint recovery and durable answer text. Publication retains the original answer block, delivery position and revision receipt; a later Run failure does not erase an already committed body. The existing [answer-publication article](https://hpoenixf.com/eff-agent-article/en/articles/019-agent-answer-publication) explains that mechanism. The **single-Run Worker** introduced in v0.9 lets the submitting process exit before another process drives the same Runtime under the original identity, limits and deadline. It adds neither a new queue nor the complete scheduled-research system.

After selecting that snapshot and installing/building as described in the README, run `node dist/src/session-cli.mjs submit --session runs/article-v09 --run original-example --case durable-publication`, then `node dist/src/session-cli.mjs work --session runs/article-v09 --run original-example`. Read the original body and receipt with `node dist/src/session-cli.mjs publication --session runs/article-v09 --run original-example`. The fixture's 30-second deadline begins at submission. The [corresponding process cases](https://github.com/hpoenixf/open-etf-agent/blob/dad9c6e64f32c3d7579aea96613776b40917ec6d/test/worker-process.test.mjs) also inspect stopping, competing workers and process death after commit. Documents and model actions are synthetic scripts; SQLite commits and cross-process readback are real. The real-model observation below remains evidence only for its original version.

Stopping a Worker is not user cancellation, and starting another process does not authorize retrying an unknown request. The existing [scheduled-research article](https://hpoenixf.com/eff-agent-article/en/articles/agent-autonomous-scheduled-research) now includes this minimal mechanism; calendars, conditional triggers and notices remain outside the public slice. The old v0.10 read-only adapter was cancelled because no independent consumer was identified; it was not renamed Web. The completed **Result / Reference consumption module** now follows v0.9 as a [fixed public v0.10 snapshot](https://github.com/hpoenixf/open-etf-agent/tree/ff5b9273ef0d239e804f61792702cd2e94174be7): calculate from an explicit original selection, then carry the same result into the next request, report and CSV. The [result-consumption article](https://hpoenixf.com/eff-agent-article/en/articles/financial-agent-python-result-consumption) explains the example and its limits. This incorporates the original roadmap 1.1 minimal increment into v0.10 without scheduling it twice. The 1.0 stability milestone is not declared complete; read the [`tool-host@2` recovery compatibility note](https://github.com/hpoenixf/open-etf-agent/blob/ff5b9273ef0d239e804f61792702cd2e94174be7/openspec/changes/result-reference-consumption/design.md) before adopting it.

## Choose a question whose answer can be checked

The example uses neither personal holdings nor a market-data service. We wrote two synthetic product guides for Atlas versions A and B.

The question is straightforward:

> What changed in the free edition's export capabilities? Which conditions stayed the same? Save the comparison with its sources.

A supports CSV, while B adds Markdown. Both require an online connection when exporting. The guides also describe enterprise capabilities, so “B supports a feature” does not automatically mean “B's free edition supports it.”

Another question compares export limits: 120 rows per export in A and 300 in B. Three different results must remain distinct:

| Question | Result |
| --- | --- |
| How much larger is B than A? | 180 rows/export |
| How many times A is B? | 2.5 |
| What is the increase relative to A? | 1.5, or 150% |

These numbers do not demonstrate investment skill. They make the original inputs, units, denominator, and report wording independently inspectable. Similar distinctions matter in financial research, but a synthetic product example cannot establish that the system has completed real investment research.

Acceptance in this phase concerns only the Runtime: faithful arguments and sources, lawful execution or rejection, and accurate budgets, state, partial effects, and file receipts. Incorrect model wording may be recorded as an observation; it does not make the Runtime fail, and we do not repeatedly adjust the prompt until an answer looks like a pass.

The complete questions and materials are in the [fixed-version fixtures](https://github.com/hpoenixf/open-etf-agent/tree/f9370b81beef84199293120ee23d245bb0129553/fixtures). Readers do not need accounts or private data to begin.

## Keep three core responsibilities

This version has no database, background service, or plugin system. The CLI accepts a task, and three components support the loop:

- **Model Gateway:** converts a response into either proposed tool calls or final text. An unfinished protocol response or incomplete JSON arguments cannot become executable actions.
- **Runtime:** maintains messages, pairs calls with results, and enforces round limits, tool budgets, timeouts, and cancellation.
- **Tool Host:** defines the available tools, validates their arguments, performs reads, calculations, and saves, and returns the observed effects.

The model can propose `read_page`, `calculate_change`, and `save_report`. It cannot choose arbitrary file paths. Nor can the sentence “the report has been saved” produce a successful receipt by itself.

This follows the approach of starting with a sufficiently simple composition and adding complexity when needed. Anthropic discussed that trade-off in its 2024 article [Building effective agents](https://www.anthropic.com/research/building-effective-agents). Our concrete choice here is to solve only the handoff from local documents to a report. Future capabilities need a new problem to justify them rather than an entire platform built in advance.

Read the source in execution order: [cli.mjs](https://github.com/hpoenixf/open-etf-agent/blob/f9370b81beef84199293120ee23d245bb0129553/src/cli.mjs) → [runtime.mjs](https://github.com/hpoenixf/open-etf-agent/blob/f9370b81beef84199293120ee23d245bb0129553/src/runtime.mjs) → [tools.mjs](https://github.com/hpoenixf/open-etf-agent/blob/f9370b81beef84199293120ee23d245bb0129553/src/tools.mjs). There is no need to learn dozens of module names first.

## A completed read needs a concrete identity

`read_page` returns more than text. It includes the document ID, version, physical page number, and text hash. The Tool Host records the pages actually acquired during this run.

When saving, the model may cite only source IDs in that acquired set. Unknown sources, duplicate sources, and model-invented file paths cannot become a valid save request.

This addresses a specific problem: someone receiving the report can find the page content acquired at the time, rather than reopen a “latest version” that may since have changed.

However, **reading a page does not establish that every sentence in the report is supported by that page.** The v0.1 save checks own source identity, not semantic judgment. Confusing free and enterprise editions or omitting the online requirement remains a separate reading and content-quality issue.

The example's actions and wording come from a [transparent scripted adapter](https://github.com/hpoenixf/open-etf-agent/blob/f9370b81beef84199293120ee23d245bb0129553/src/fixture-gateway.mjs). It first proposes page reads, then uses real tools to calculate or save. It does not copy a prepared report file and present it as an execution result. This script makes engineering boundaries repeatable, but it is not evidence of a real model's document comprehension.

## A real fix: the file was written, but the task failed

The save path was intended to produce both a report and a source manifest: `report.md` holds the body, while `manifest.json` holds source snapshots and the file receipt.

An independent review introduced a small fault: occupy the manifest destination before saving. The report was successfully written, but the second step failed because it could not overwrite the existing file.

Returning only “tool failed” would hide the change already made on disk. Returning complete success would conceal the missing source manifest. Automatically retrying would also be inappropriate because the first write still existed.

The fix did not pretend the two writes formed an atomic transaction. Instead, it carried known partial effects through to the Runtime:

```json
{
  "status": "failed",
  "receipt": null,
  "partialEffects": [
    {
      "callId": "save",
      "name": "save_report",
      "partialPaths": ["report.md"]
    }
  ]
}
```

This is an excerpt of the result returned in the test. The report remains, the pre-existing manifest is not overwritten, and no complete save receipt is issued. The caller knows to inspect existing artifacts before attempting another write.

The [regression test](https://github.com/hpoenixf/open-etf-agent/blob/f9370b81beef84199293120ee23d245bb0129553/test/review.test.mjs) preserves this fault. It was a controlled local experiment, not a production incident. The useful improvement in this small version is that a failure result now accurately describes what already happened.

The same review also found that descendant directories should not be created before an unsafe symlink ancestor is rejected. The implementation now checks existing ancestors before creating missing directories. This protection assumes a trusted, single-user output root; it is not an operating-system sandbox against a hostile process running as the same user.

## Check that the file is the one just saved

A normal run creates its own directory containing:

```text
report.md
manifest.json
run.jsonl
```

The manifest preserves source snapshots and the report's byte length and SHA-256. Validation lets the CLI child process exit, then reads the report bytes from the test process and compares them with the receipt. Reading does not invoke the model again or generate a new answer that merely looks identical.

“Independent readback” describes what the test actually does. The CLI does not secretly start a reader service, and this does not establish that a user has opened the report in a browser. JSONL is diagnostic data, not an executable recovery checkpoint.

That distinction determines the next increment. Browser reading needs a reader and download path. Interrupted execution needs persistent execution identity and a recovery protocol. The existence of a file cannot stand in for either capability.

## Run the fixed version

Use the following commands in a new local directory with Node 26.11.1–26.x. v0.1 has no third-party dependencies.

```bash
git clone https://github.com/hpoenixf/open-etf-agent.git
cd open-etf-agent
git switch --detach f9370b81beef84199293120ee23d245bb0129553

npm ci --offline --ignore-scripts --no-audit --no-fund
npm run build
npm test
npm run demo -- --case document-compare --output runs/article-v01
```

Each `directory` in the CLI output points to its report, source manifest, and diagnostic record. To focus on numeric conventions, run `npm run demo -- --case T3`. To inspect exact file readback, see the checks performed after child-process exit in `test/cli.test.mjs`.

These offline commands have [execution records at the fixed version](https://github.com/hpoenixf/open-etf-agent/blob/f9370b81beef84199293120ee23d245bb0129553/docs/verification/observations.md). The CLI in this snapshot still blocks live requests; the default example does not silently call a model. The real-model observation below came through a separate, bounded validation entry point. It does not change what the default commands run.

## After connecting a real model: a run without a report

Later validation used a separate adapter to invoke the original v0.1 Gateway and Runtime, rather than placing a newer implementation under an older version's name. The adapter bounded requests and outputs and used the same synthetic materials. It was not the fixed snapshot's default CLI. The [verification summary](https://github.com/hpoenixf/open-etf-agent/blob/d075068ac99a6c798d012c46bff4fe0c33eb9979/docs/verification/live-v01-v05-first-batch.md) and [safe record](https://github.com/hpoenixf/open-etf-agent/blob/d075068ac99a6c798d012c46bff4fe0c33eb9979/docs/verification/live-v01-v05-first-batch.safe.json) preserve the observed path and its limits.

The run acquired page one from both A and B. Both model requests returned HTTP 200, but the subsequent `calculate_change` proposal was rejected during Tool Host validation. Calculation was not dispatched, and no report was produced. The run stopped with `TOOL_REJECTED`; successful requests were not presented as a completed task.

However, the original diagnostic record retained neither the exact rejected arguments nor the precise validation error. We can establish that rejection preceded dispatch, but cannot retrospectively determine whether that particular input was valid. Inventing a plausible cause would not close the gap. Rejection alone is not a Runtime bug, and absence of dispatch does not certify that this particular rejection was correct.

The later adapter now includes a safe proposal trace: facts such as missing required fields, finite numbers, field types, and unit shape, rather than arbitrary model text, credentials, or request headers. This makes the next occurrence easier to inspect; it cannot recover the missing historical arguments. The next check concerns whether the Host executed or rejected according to its existing rules, not whether repeated attempts eventually produced an attractive report.

This real-model run did not establish the report-save path, let alone exercise later versions' Skill, MCP, Child, Memory, or compaction mechanisms. Real file readback in the offline example and an unfinished save path under a real model are separate pieces of evidence. Preserving both makes the remaining gap visible.

## Continue through the existing module articles

v0.1 gets its own article to provide a practical starting point for the series. It answers one question: what is the smallest set of responsibilities needed to connect source documents, an execution, and a report that can be read back?

Later versions do not each need another equivalent architecture overview. Method and tool integration belong with the [MCP article](https://hpoenixf.com/eff-agent-article/articles/mcp-host-from-discovery-to-consumption); externalized originals belong with [results and context](https://hpoenixf.com/eff-agent-article/articles/tool-results-outside-model-context); summaries and long-lived preferences belong with [Main compaction](https://hpoenixf.com/eff-agent-article/articles/agent-main-run-context-compaction) and [Memory](https://hpoenixf.com/eff-agent-article/articles/026-agent-memory-forget-durable-effects). These links point to the existing Chinese articles.

Those articles will retain their own questions and history, then add the relevant version's minimal runnable implementation. When an advanced mechanism is absent from the public code, its boundary remains explicit. A similarly named function cannot count as full coverage.

The aim is to leave readers with a concrete path: run an example, understand the important branch, then change it and observe the result. The [public engineering repository](https://github.com/hpoenixf/open-etf-agent) preserves these fixed stages. If this progression from small, concrete problems is useful, a Star or a reproducible issue is welcome.

<!-- agent-article-sync:guidance:start -->
Read the [complete Chinese version](../../articles/open-etf-agent-v01-first-readable-report.md?lang=zh). More articles are available in the [reading catalog](../catalog.md) and the [public collection](https://github.com/hpoenixf/eff-agent-article). A Star is welcome if you would like to follow the connections between module articles and runnable code.
<!-- agent-article-sync:guidance:end -->
