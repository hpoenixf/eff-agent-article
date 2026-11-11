---
title: "Bring Your Own Documents to an Agent: From the First Report to a Resumable Research Project"
description: "Use fixed Open ETF Agent v0.24 to produce a checkable report, then combine retrieval with bounded Child work on the same question. Distinguish original evidence, derived advice, task recovery and project capacity."
readingBrief:
  takeaways:
    - "Bind a question to a source snapshot before approving model execution. Use a new task when the question or sources change."
    - "A report that opens still needs its claims checked against the originals. Do not invent causes the sources never established."
    - "Main searches; Child checks a local question using only admitted documents. Main must still review the advice and save the report."
    - "Continuation keeps the original task, permissions, budget and deadline. Inspect unknown outcomes rather than clearing them with a new task."
  appliesTo:
    - "Developers practicing with a local v0.24 project who can configure a model service and approve data transmission and costs."
  notFor:
    - "Free offline research execution, unattended operation, arbitrary web crawling, or investment decisions."
---

<script setup>
import { withBase } from 'vitepress'
</script>

# Bring Your Own Documents to an Agent: From the First Report to a Resumable Research Project

<LearningPathNav />

You give an Agent a short trial note: 64 units went in, 48 were usable, and the causes of the loss are not established. A useful outcome is not merely “75%.” You want a saved report that distinguishes the original facts from the calculation, refuses to invent a cause, and still opens after the process that produced it has exited. When the source changes tomorrow, you also want to know which report belongs to which version.

**That is the project we build here: your own material in, a checkable report and a durable task out.** You will create a project, bind a question to a source snapshot, let a real model choose its steps, then combine retrieval and a bounded specialist check in a new task before inspecting continuation of unfinished work. The model is not following a prewritten tool transcript.

The [deep dive](open-etf-agent-v010-system-design.md) explains why handoffs need contracts. Here we use released **v0.24.0** and follow the reader’s inputs and artifacts. The [original v0.20 workshop](https://github.com/hpoenixf/eff-agent-article/blob/16547101a8a42f01a62695a7a4e32ecfcace0d05/en/articles/open-etf-agent-research-project-workshop.md) retains its commands, sources and observations. Do not apply the new steps directly to an old project directory.

The original [v0.20 real-model records](https://github.com/hpoenixf/open-etf-agent/blob/a5cef6d5cf1a4597f0f1271025cd6cc16be151e5/docs/verification/v020/case-mechanism-observations.json) support the earlier source, Memory, Child and recovery paths. Later [Knowledge runs](https://github.com/hpoenixf/open-etf-agent/blob/afbfb9865539c18c9358ac65c822f929aaa6e872/docs/verification/v023-release.md) observed Main retrieval, Child reading originals, and Main consuming the handoff before saving a report. Those observations belong to fixed v0.23 execution source, not a new v0.24 combined evaluation. This revision checks the v0.24 commands and offline preparation without new model calls; it does not promise the exact terminal sequence or new documents will yield the same answer.

## See the destination before typing commands

At the end of the main exercise, you should have three things you can inspect:

- **A source snapshot:** the imported bytes have a manifest identity. Editing the original file does not silently change an existing task.
- **A task with a history:** its Run ID binds the question, configuration, permissions, budget and deadline. Stopping a process does not create a new allowance.
- **A persisted report:** its claims can be checked against the selected material, and a separate Reader can reopen the saved result without another model request.

These are different outcomes. The source may be imported before any model is called; a model may answer without saving the required report; a report may exist while its reasoning is wrong. Each step below makes one of those distinctions observable.

## Follow the same six-layer map {#where-v0-20-sits-in-the-six-layer-map}

The diagram retains the original v0.20 responsibility map, not the execution identity of this revision. Read the [six-layer panorama](017-prompt-to-answer-six-layer-panorama-v3.md) as a map of responsibilities, not a feature checklist. This exercise passes through a bounded subset of all six layers. It is still a local, single-user project, not a multi-user financial research product.

<figure>
  <picture>
    <source media="(max-width: 640px)" :srcset="withBase('/diagrams/open-workshop/six-layers-en-mobile.svg')" />
    <img style="max-height: none !important; height: auto;" :src="withBase('/diagrams/open-workshop/six-layers-en.svg')" alt="The six responsibilities used in this workshop. The source and task remain inspectable; this is not a complete-product maturity chart." />
  </picture>
  <figcaption>The six responsibilities used in this workshop. The source and task remain inspectable; this is not a complete-product maturity chart. <a class="diagram-original" :href="withBase('/diagrams/open-workshop/six-layers-en.svg')" target="_blank" rel="noopener noreferrer">Open full diagram</a></figcaption>
</figure>

| Layer | What you actually use here | What remains outside this exercise or release |
| --- | --- | --- |
| **L1 · Input and triggers** | `run submit` stores a question; `run work` executes it. | No chat-intent router or unattended daemon. The release has bounded Response and Schedule entries, but we do not enable them here. |
| **L2 · Identity, session and context** | Project, Run, source manifest, grant and configuration keep scope stable; explicit Memory can supply preferences. | A local project ID is not account authentication or multi-tenant isolation. A stored preference is not automatic learning. |
| **L3 · Agent decisions and execution** | Main chooses tool actions in a research loop; a bounded Child can contribute; known unfinished work can continue in the same Run. | Not the production system’s complete Direct/Research/Coord routing or an arbitrary hierarchy of autonomous agents. |
| **L4 · Tools and domain capabilities** | Read selected text and stored results; Main searches admitted sources; consult Memory and ask a restricted specialist to check originals. | No live financial-data service, arbitrary web crawling or isolated Python. This configuration does not enable a calculation tool: the 75% ratio is your manual check. |
| **L5 · Publication and delivery** | Save the report through the original Publication path, then read the persisted result and receipt. | Saving is not answer-quality certification or proof of a full message-history, streaming and notification service. |
| **L6 · User interface** | CLI inspection and a read-only local Reader for saved reports and sources. | Not a chat application, account portal, collaboration UI or public sharing service. |

The same Memory capability participates across layers; these are not separate memory systems. One `run work` can revisit context preparation, model judgment and tool execution many times. Saving the report and opening it in the Reader are separate observable events. The useful change from the deep dive is the application entry that keeps those handoffs attached to your project, not six new engines.


## 1. Choose a small question worth checking

Start with one short synthetic source already used in the released evaluation, rather than private documents or a large collection of manuals. Save the following as `independent.md`:

```text
Independent trial: intake 64 units; usable output 48 units; failure causes not established.
```

Ask: “Summarize the intake, usable output and evidence limits. Distinguish stated facts from calculations, cite the source and save a report.” This is a reader-facing question, not a prescribed tool transcript. The [existing report and source](https://github.com/hpoenixf/open-etf-agent/blob/a5cef6d5cf1a4597f0f1271025cd6cc16be151e5/docs/verification/v020/synthetic-data-and-reports.json) show a real run on this material, including Memory, bounded Child work and continuation after a known stop. That observation belongs to the earlier implementation recorded with the report, not to a fresh run of the final tag.

There are three useful checks: 64 and 48 must retain their meaning; 48/64 = 75% is a manual check and must be labeled as a calculation; the source does not establish why the remainder was unusable. A persistent report is evidence of delivery, not certification that every sentence is correct. Read its reasoning against the source.

Once comfortable, replace the material with your own short text or Markdown document. A purchasing proposal or service terms can work, but you must choose new checks that fit the new question. The project should accept the selected file, not require a name from a built-in example catalog.

## 2. Prepare the sources before approving execution

**You are now exercising L1 and L2.** Project creation prepares the local home for the work; import fixes the evidence version; submission binds that version to one question. Before data is sent to a provider, you can inspect what the task is and what it may use.

The declared Node.js range is 26.8.1–26.x; release verification used 26.11.1. Keep your exercise material outside the repository. The commands below run from the repository root; `../my-research` is a working directory you create for the exercise.

```bash
git clone https://github.com/hpoenixf/open-etf-agent.git
cd open-etf-agent
git checkout v0.24.0
npm ci --ignore-scripts --no-audit --no-fund
npm run build
node src/research-cli.mjs --help
mkdir -p ../my-research
```

Save the source above as `../my-research/independent.md`, and the question as `../my-research/question.txt`. Then create `../my-research/files.json`:

```json
["../my-research/independent.md"]
```

This selects specific files; it does not grant access to the whole directory. The entry point supports text, Markdown and bounded PDFs with extractable text. Start with text here so that you can add Child work later. Paths are resolved from the command's current working directory. Do not use globs or supply a directory in place of a file.

Use new, empty project directories for this exercise; `project init` is not an upgrade command for an existing directory. Create `../my-research/config.json`:

```json
{
  "schemaVersion": "research-project@1",
  "gateway": {
    "mode": "fixture", "provider": "fixture",
    "protocol": "fixture@1", "model": "offline"
  },
  "capabilities": ["report", "memory"],
  "limits": {
    "maxRounds": 20, "maxTools": 32, "timeoutMs": 300000,
    "model": 24, "tool": 40
  }
}
```

```bash
node src/research-cli.mjs project init --project ../my-research/dry-project --config ../my-research/config.json
node src/research-cli.mjs source import --project ../my-research/dry-project --files ../my-research/files.json > ../my-research/import.json
```

The import result's `manifestSha256` identifies this source snapshot. Copy it into the `MANIFEST_SHA` placeholders below. Do not substitute a filename or invent a hash.

```bash
node src/research-cli.mjs source list --project ../my-research/dry-project --manifest MANIFEST_SHA
node src/research-cli.mjs run submit --project ../my-research/dry-project --run comparison --question ../my-research/question.txt --manifest MANIFEST_SHA
node src/research-cli.mjs run inspect --project ../my-research/dry-project --run comparison
```

Inspect the task identity, source manifest and model usage, which is still zero. **Submission does not execute the task.** Running `run work` on this fixture project returns `CLI_LIVE_WORK_REQUIRED`. That is an intentional CLI restriction, not a safeguard this exercise asks you to remove.

## 3. Ask a live model to produce the first report

**This is where L3 and L4 start moving, before L5 and L6 make the outcome visible.** Main can request source reads, inspect results and decide whether it has enough evidence to save a report. You define the goal and permission boundary, not a fixed tool sequence.

Live execution requires your own model service. Copy the configuration to `../my-research/live-config.json`, retain the other fields and replace its gateway object with the structure below. Supply the model and HTTPS endpoint actually supported by your authorized service:

```json
{
  "mode": "live",
  "provider": "YOUR_PROVIDER_ID",
  "protocol": "chat-completions",
  "model": "YOUR_AUTHORIZED_MODEL",
  "endpoint": "https://example.invalid/v1/chat/completions",
  "apiKeyEnv": "RESEARCH_API_KEY",
  "stream": false
}
```

The example endpoint is deliberately nonfunctional. Supply `RESEARCH_API_KEY` through your existing secure credential workflow in the process environment. Do not put its value in configuration, questions, source documents or Git; the CLI does not load `.env` files. First confirm that the provider may receive these materials, then check its billing rules. The configured counts and duration are not a monetary spending cap. Data approval includes the selected question and documents, plus relevant Memory and derived content that execution may send to the provider.

Create `../my-research/live-project` with the new configuration and import the same sources:

```bash
node src/research-cli.mjs project init --project ../my-research/live-project --config ../my-research/live-config.json
node src/research-cli.mjs source import --project ../my-research/live-project --files ../my-research/files.json > ../my-research/live-import.json
```

Use the returned `manifestSha256` for `LIVE_MANIFEST_SHA` below. Run the following commands only after approving the provider, data transmission and costs:

```bash
node src/research-cli.mjs run submit --project ../my-research/live-project --run comparison --question ../my-research/question.txt --manifest LIVE_MANIFEST_SHA --approve-provider --approve-data --approve-cost
node src/research-cli.mjs run work --project ../my-research/live-project --run comparison
node src/research-cli.mjs run inspect --project ../my-research/live-project --run comparison
node src/research-cli.mjs run report --project ../my-research/live-project --run comparison
```

Look beyond the final line in the terminal. Check whether a report was persisted, whether its citations lead back to the corresponding sources and whether “failure causes not established” was quietly replaced with an invented cause. A model saying it has finished is insufficient if the required report is missing. An existing real task did exactly that: it returned a final answer without the required report, and `REPORT_REQUIRED` correctly kept the task from counting as a successful delivery. That is why you inspect the artifact instead of trusting the final sentence.

After the execution process has exited, run `run report` again. You can also run:

```bash
node src/research-cli.mjs report serve --project ../my-research/live-project --run comparison --port 0
```

Open the actual local address printed by the command. The Reader reads saved reports and sources without calling a model again; stop it with Ctrl-C. A persisted report establishes that an artifact was delivered. Its conclusions still need your judgment.

## 4. Retrieve evidence without rewriting the old task {#_4-change-questions-and-sources-without-rewriting-the-old-task}

Reading one short document directly is enough. With several documents, retrieval can narrow what to inspect. Knowledge here performs bounded lexical search over **this task’s imported text**, not the web or a vector service. It returns complete original pages and source identities; scores help rank results. `complete` covers lexical matches within this collection, `partial` omits some matches, and `no-evidence` means this query found none.

Keep `independent.md`. Add `follow-up.md` with this **constructed teaching input**, not a new observation from the original evaluation:

```text
Independent trial follow-up: 8 of the 16 unusable units had damaged packaging. Causes for the other 8 units remain unresolved.
```

Change `files.json` to two explicit paths and import them again:

```json
["../my-research/independent.md", "../my-research/follow-up.md"]
```

The new manifest contains both sources; the old Run keeps its original snapshot. Copy the complete `live-config.json` to `knowledge-config.json`, set capabilities to `["report", "memory", "knowledge"]`, and add top-level `"knowledge": {"maxResults": 4, "maxSourceBytes": 128000}`. Keep the gateway and limits. Do not override `allowedTools`: preserve the original tool scope needed by Main and the later Child step.

```bash
node src/research-cli.mjs project inspect --project ../my-research/live-project
node src/research-cli.mjs project update --project ../my-research/live-project --config ../my-research/knowledge-config.json --expected-config CURRENT_CONFIG_SHA
node src/research-cli.mjs source import --project ../my-research/live-project --files ../my-research/files.json > ../my-research/knowledge-import.json
```

Use the just-inspected `CURRENT_CONFIG_SHA` and the new import’s `KNOWLEDGE_MANIFEST_SHA`. Save this question as `second-question.txt`: “Use Knowledge to find evidence from the trial and follow-up inspection. Can all unusable output be attributed to packaging? Distinguish stated facts, calculations and unresolved causes; cite the originals and save a report.”

```bash
node src/research-cli.mjs run submit --project ../my-research/live-project --run decision-gaps --question ../my-research/second-question.txt --manifest KNOWLEDGE_MANIFEST_SHA --approve-provider --approve-data --approve-cost
node src/research-cli.mjs knowledge inspect --project ../my-research/live-project --run decision-gaps
node src/research-cli.mjs run work --project ../my-research/live-project --run decision-gaps
node src/research-cli.mjs run report --project ../my-research/live-project --run decision-gaps
```

`knowledge inspect` checks admitted sources and retrieval bindings; it does not show that the model searched. During execution Main can use `knowledge_query` to obtain originals with `sourceId` and `resultRef`, reread them with `read_result`, then cite them in a saved report. Check that “8 units” has not become “all 16 units,” or a search miss a claim that no cause exists. Even for those eight units, observed packaging damage does not establish that it caused the unusable output. Renaming, replacing or reimporting the external file must not rebind an admitted task. Changed evidence or questions belong in a new Run.

This is a simple, fixed and inspectable path, at the cost of automatic file discovery and semantic-recall guarantees. Direct page reading is simpler for two tiny sources; retrieval is included to expose how a hit becomes citable original evidence, not to claim search is always better. The [fixed Knowledge guide](https://github.com/hpoenixf/open-etf-agent/blob/afbfb9865539c18c9358ac65c822f929aaa6e872/docs/knowledge.md) explains capacity and recovery limits.

## 5. Add explicit preferences and bounded specialist work

**Keep the same question and add one independent, local check rather than repeating the architecture.** Memory supplies an optional presentation preference; Child checks whether the sources found by Main support a claim. Neither creates new evidence.

Start by saving an explicit presentation preference instead of an unverified business conclusion. Create `../my-research/preference.txt` containing, for example: “List what the sources do not state before presenting the comparison's conclusions.”

```bash
node src/research-cli.mjs memory save --project ../my-research/live-project --intent report-order-1 --text ../my-research/preference.txt --approve-intent
node src/research-cli.mjs memory inspect --project ../my-research/live-project
```

Check storage separately from adoption: a new task must actually read and apply the preference, not merely produce similar formatting. To revise or forget it, use the actual ID and current revision from inspection with `memory revise` / `memory forget`, approving the intent. Forgetting is not physical erasure of history.

This exercise uses `delegate_child`, introduced in v0.22 and retained in v0.24, rather than the old one-off `source_check`. Run this configuration command from the repository root. It imports the complete method and hash from fixed source instead of asking you to transcribe a partial descriptor:

```bash
node --input-type=module <<'JS'
import { readFileSync, writeFileSync } from 'node:fs';
import { CLAIM_COMPARISON_METHOD } from './src/child.mjs';
const config = JSON.parse(readFileSync('../my-research/knowledge-config.json', 'utf8'));
config.capabilities = ['report', 'memory', 'knowledge', 'child'];
config.childExecution = {
  schemaVersion: 'child-execution@1',
  maxChildren: 1,
  methods: [CLAIM_COMPARISON_METHOD]
};
writeFileSync('../my-research/child-config.json', JSON.stringify(config, null, 2) + '\n');
JS
node src/research-cli.mjs project inspect --project ../my-research/live-project
node src/research-cli.mjs project update --project ../my-research/live-project --config ../my-research/child-config.json --expected-config CURRENT_CONFIG_SHA
```

Again, use the fresh configuration hash. Existing Runs do not acquire Child permission. Create `review-question.txt`: “Use Knowledge to find the two trial records, then use one claim-comparison check: was all unusable output caused by damaged packaging? Give Child a precise local question and admitted document scope. Main must check its advice against the originals, separate known facts, calculations and unknowns, and save a report.”

```bash
node src/research-cli.mjs run submit --project ../my-research/live-project --run reviewed-gaps --question ../my-research/review-question.txt --manifest KNOWLEDGE_MANIFEST_SHA --approve-provider --approve-data --approve-cost
node src/research-cli.mjs run work --project ../my-research/live-project --run reviewed-gaps
node src/research-cli.mjs child list --project ../my-research/live-project --run reviewed-gaps
node src/research-cli.mjs run report --project ../my-research/live-project --run reviewed-gaps
```

Main selects admitted `documentId` values from the hits and gives Child the local question. **It does not copy parent ResultRefs or the entire tool history.** This `claim-comparison` method permits only Child’s own `read_page` over at most two selected documents, not `knowledge_query`. Child returns verified original references plus derived advice; Main checks that advice and saves the final report.

Use `child list` to inspect whether execution occurred, which documents were admitted, and whether the handoff is `not-consumed`, `committed-not-consumed` or `consumed`. This read-only command does not call a model. If no Child was invoked, record a single-assistant run; a completed Child whose output Main has not consumed is not delivered collaboration. An independent check costs extra calls and budget. For a question already easy to resolve from two sources, more roles are unnecessary.

A real caution comes from [v0.23 K09](https://github.com/hpoenixf/open-etf-agent/blob/afbfb9865539c18c9358ac65c822f929aaa6e872/docs/verification/v023-real-ten.safe.json): retrieval, Child reading, Main consumption and report saving occurred, but the model changed the requested query, so the strict natural-task check still failed. Collaboration is not proof of faithful task execution. The original v0.20 also observed Memory, Child and report composition on a synthetic trial with baseline 80, result 100, the same sensor and uncontrolled weather. That still does not establish a cause, and it is not a new-version execution result.

## 6. Continue the same work without starting over

**This checks L2’s original task binding and L3’s durable execution record.** Does the new process continue under the original authorization and preserve consumed results? A checkpoint can exist before any report is published. If a report has already been published, check its L5 readback separately.

Treat stopping as an optional observation, not a requirement to interrupt a fast task. The existing real-model test requested a stop at a known result-consumption checkpoint and continued in a different process. It did not test your manual Ctrl-C timing. The CLI maps SIGINT/SIGTERM to the public Host signal, so the safe question is whether this run has reached a known resumable state.

Choose a task that is still executing and press Ctrl-C to request a cooperative stop. Running the same `run work --project ... --run ...` command again continues the original task; there is no separate `resume` command. Use inspection before and after to compare the Run ID, source identity, state and usage. The original budget and deadline remain in force.

This exercise cannot guarantee that every interruption leaves a point from which work can continue. The task may already have finished, or an uncertain dispatch outcome may remain. Creating another Run does not make that uncertainty disappear. Stop and inspect it rather than treating “unknown” as “did not execute.” `run cancel` explicitly cancels a task; it is not a pause button.

Do not enable every capability merely to make the exercise look complete. Response with Child, Schedule with Child, an actual PDF with Child, and trusted plugins with Child are unsupported combinations. This exercise does not add user-response or scheduling features. When you explore those separately, retain the original task identity and authorization boundaries.

## What to carry into the next project

The exercise follows one path: explicit import → Main finds originals → Child checks a narrow scope → Main consumes and saves → independent readback. You should be able to distinguish changed questions or evidence from the original task, and actual retrieval or collaboration from merely wishing they occurred.

v0.24 also preserves one original request slot across configuration revisions using the same normalized HTTPS endpoint in a new-format project. Inspect it without calling a model: `node src/research-cli.mjs capacity inspect --project ../my-research/live-project --run reviewed-gaps`. Changing the model name or credential-variable alias does not create capacity. Separate project directories remain independent; this is not account-wide limiting. Old v0.20 projects keep their original contract without automatic migration. Do not delete old state or create a new task to erase an unknown request; the fixed capacity guide below explains compatibility.

[Fixed-version research-project guide](https://github.com/hpoenixf/open-etf-agent/blob/88afb84958ed8de9108d756cdc0d63e6d2fbee24/docs/research-project.md) · [Current main guide](https://github.com/hpoenixf/open-etf-agent/blob/main/docs/research-project.md) · [Layered execution evidence](https://github.com/hpoenixf/open-etf-agent/blob/a5cef6d5cf1a4597f0f1271025cd6cc16be151e5/docs/verification/v020-release.md) · [Design article: handoff contracts](open-etf-agent-v010-system-design.md)

[v0.24 project guide](https://github.com/hpoenixf/open-etf-agent/blob/afbfb9865539c18c9358ac65c822f929aaa6e872/docs/research-project.md) · [Child methods and inspection](https://github.com/hpoenixf/open-etf-agent/blob/afbfb9865539c18c9358ac65c822f929aaa6e872/docs/child-execution.md) · [Project capacity and legacy formats](https://github.com/hpoenixf/open-etf-agent/blob/afbfb9865539c18c9358ac65c822f929aaa6e872/docs/provider-capacity.md). This exercise is fixed to v0.24.0; the older guide and layered execution evidence above remain historical entry points. Do not mix commands from future main revisions.

This is the practical next stop after the [deep dive](open-etf-agent-v010-system-design.md), not a replacement for it. Once you can inspect a task on your own material, continue to the [six-layer panorama](017-prompt-to-answer-six-layer-panorama-v3.md) to place those boundaries in the wider system.


Continue the workshop: [checking sources, collaborating, and independently reviewing a finished report](open-etf-agent-report-review-workshop.md).


<!-- introductory-series-links:start -->

## Getting started: continue in order

Previous: [Agent Deep Dive: From One Report to Durable Execution and Specialist Collaboration](open-etf-agent-v010-system-design.md).

Next: [Expert, Subagent, Review, Judge: If They All Use Another Model, Why Are They Different?](agent-expert-subagent-review-judge.md).

<!-- introductory-series-links:end -->
