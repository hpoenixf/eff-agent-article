---
title: "Bring Your Own Documents to an Agent: From the First Report to a Resumable Research Project"
description: "Use Open ETF Agent v0.20 to turn your own documents into a checkable report, following the six-layer handoffs through model decisions, Memory, bounded specialists and task recovery without claiming a complete production platform."
readingBrief:
  takeaways:
    - "v0.20 connects your documents, a natural task and a readable report inside one local project: a bounded path through six layers, not a complete production system."
    - "A different question or source snapshot belongs in a new task. Continue unfinished work through its original Run, preserving its authorization, budget and deadline."
    - "A report that can be reopened is not necessarily a reliable report. Trace conclusions back to their sources and check separately for missing information."
    - "Memory requires an explicit write intent. Child work checks a bounded set of sources without acquiring broader authority or publishing on Main's behalf."
  appliesTo:
    - "Developers practicing agent engineering with local text documents who are prepared to authorize their own model provider, data transmission and costs."
  notFor:
    - "This is not a complete research workflow without model costs, or a guide to unattended research, arbitrary web crawling or investment decisions."
---

<script setup>
import { withBase } from 'vitepress'
</script>

# Bring Your Own Documents to an Agent: From the First Report to a Resumable Research Project

<LearningPathNav />

You give an Agent a short trial note: 64 units went in, 48 were usable, and the causes of the loss are not established. A useful outcome is not merely “75%.” You want a saved report that distinguishes the original facts from the calculation, refuses to invent a cause, and still opens after the process that produced it has exited. When the source changes tomorrow, you also want to know which report belongs to which version.

**That is the project we build here: your own material in, a checkable report and a durable task out.** You will create a project, bind a question to a source snapshot, let a real model choose its steps, then try preferences, bounded specialist work and continuation of an unfinished task. The model is not following a prewritten tool transcript.

The [deep dive](open-etf-agent-v010-system-design.md) explains why source, execution and specialist handoffs need contracts, using separate examples around v0.15. v0.20 brings those concerns behind one public local-project entry. This article follows what the reader does and gets back; it does not repeat the architecture or attribute the entire private system to the open release.

The exercises build on the release’s [recorded real-model runs](https://github.com/hpoenixf/open-etf-agent/blob/a5cef6d5cf1a4597f0f1271025cd6cc16be151e5/docs/verification/v020/case-mechanism-observations.json). Those runs used the public project API and observed source import, Memory and Child use, persisted reports, and continuation in a new process. The CLI below calls that API; its argument handling and no-model operations have been checked separately. The existing runs do not mean this exact terminal sequence or every replacement document has been tested.

## See the destination before typing commands

At the end of the main exercise, you should have three things you can inspect:

- **A source snapshot:** the imported bytes have a manifest identity. Editing the original file does not silently change an existing task.
- **A task with a history:** its Run ID binds the question, configuration, permissions, budget and deadline. Stopping a process does not create a new allowance.
- **A persisted report:** its claims can be checked against the selected material, and a separate Reader can reopen the saved result without another model request.

These are different outcomes. The source may be imported before any model is called; a model may answer without saving the required report; a report may exist while its reasoning is wrong. Each step below makes one of those distinctions observable.

## Where v0.20 sits in the six-layer map

Read the [six-layer panorama](017-prompt-to-answer-six-layer-panorama-v3.md) as a map of responsibilities, not a feature checklist. This exercise passes through a bounded subset of all six layers. It is still a local, single-user project, not a multi-user financial research product.

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
| **L4 · Tools and domain capabilities** | Read selected text and stored results; consult Memory; ask a restricted specialist to check sources. | No live financial-data service, arbitrary web crawling or isolated Python. This configuration does not enable a calculation tool: the 75% ratio is your manual check. |
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

Use Node.js 26.8.1–26.x. Keep your exercise material outside the repository. The commands below run from the repository root; `../my-research` is a working directory you create for the exercise.

```bash
git clone https://github.com/hpoenixf/open-etf-agent.git
cd open-etf-agent
git checkout v0.20.0
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

Create `../my-research/config.json`:

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

## 4. Change questions and sources without rewriting the old task

**This is a versioning exercise, not a conversation-memory trick.** L2 keeps the old question and source identity; L5 keeps its old report. A new question may reach a different conclusion without making the previous artifact disappear.

Write a different question, such as “What information is missing before we can explain the unusable output?”, to `../my-research/second-question.txt` and submit it against the same manifest with a new `--run decision-gaps`. This starts another task on the same sources rather than appending a message to the first task. Compare the two reports: which sources are used again, and how does the focus of the reasoning change?

```bash
node src/research-cli.mjs run submit --project ../my-research/live-project --run decision-gaps --question ../my-research/second-question.txt --manifest LIVE_MANIFEST_SHA --approve-provider --approve-data --approve-cost
node src/research-cli.mjs run work --project ../my-research/live-project --run decision-gaps
node src/research-cli.mjs run report --project ../my-research/live-project --run decision-gaps
```

Next, make a clearly labeled teaching revision of the source, adding “A follow-up inspection identified damaged packaging in 8 units; other causes remain unresolved.” Then run `source import` again. This revision is an exercise, not a claim about the original evaluated trial. The changed source should produce a different manifest, which you bind to a third task. The first report still belongs to the original snapshot; editing a source file should not silently rewrite it.

You now have a concrete way to distinguish a new question, new evidence and an old result. The project directory is persistent state. Keep its sources, tasks, sessions, reports and Memory together rather than treating it as disposable cache.

## 5. Add explicit preferences and bounded specialist work

**Now change how the task is approached, without changing what counts as evidence.** Memory can put a confirmed preference into context across tasks. Child separates a limited source check from Main’s synthesis. Neither changes the original document or automatically increases authority.

Start by saving an explicit presentation preference instead of an unverified business conclusion. Create `../my-research/preference.txt` containing, for example: “List what the sources do not state before presenting the comparison's conclusions.”

```bash
node src/research-cli.mjs memory save --project ../my-research/live-project --intent report-order-1 --text ../my-research/preference.txt --approve-intent
node src/research-cli.mjs memory inspect --project ../my-research/live-project
```

Create a new task and ask it to look for and use applicable report preferences. Check two things separately: whether Memory was saved, and whether this model run actually read and applied it. Matching formatting alone does not establish that Memory was consumed. If the available output does not show adoption, record it as unconfirmed rather than inferring it from a similar answer. The existing evaluation checked original execution records; an ordinary report is not an equivalent trace. To update or forget the preference, use the real entry ID and current revision returned by inspection with `memory revise` or `memory forget`, again with explicit intent approval. Forgetting is not physical erasure of the disk's history.

Only then add Child work. Add `child` to the complete configuration's capabilities, obtain the current `configSha256` through `project inspect`, and use `project update --config ... --expected-config ...` to update configuration for future tasks. Existing Runs do not acquire the new permissions.

Save the complete updated live configuration as `../my-research/child-config.json`, with `capabilities` set to `["report", "memory", "child"]`. Replace `CURRENT_CONFIG_SHA` with the project’s current hash; do not reuse a stale one.

```bash
node src/research-cli.mjs project inspect --project ../my-research/live-project
node src/research-cli.mjs project update --project ../my-research/live-project --config ../my-research/child-config.json --expected-config CURRENT_CONFIG_SHA
```

In a new task, ask the assistant to check whether the selected source supports a proposed explanation for the unusable output, then bring the findings together in a report.

Child work separates a bounded source check from the main task. There is no need to assign a role to every opinion. The public Child path here handles one or two selected text documents with restricted tools and budgets. Its findings are derived material, not original source text, and Main still saves the final report. If the model never invokes Child, record that this was a single-assistant research run instead of presenting the report as a collaboration example.

The final implementation also has an observed Memory–Child–report run on a different synthetic trial: baseline 80, result 100, the same sensor, and uncontrolled weather. It demonstrates that the mechanisms were consumed together, not that a causal interpretation was justified. The supplied source still does not establish why the result changed.

## 6. Continue the same work without starting over

**This checks L2’s original task binding and L3’s durable execution record.** Does the new process continue under the original authorization and preserve consumed results? A checkpoint can exist before any report is published. If a report has already been published, check its L5 readback separately.

Treat stopping as an optional observation, not a requirement to interrupt a fast task. The existing real-model test requested a stop at a known result-consumption checkpoint and continued in a different process. It did not test your manual Ctrl-C timing. The CLI maps SIGINT/SIGTERM to the public Host signal, so the safe question is whether this run has reached a known resumable state.

Choose a task that is still executing and press Ctrl-C to request a cooperative stop. Running the same `run work --project ... --run ...` command again continues the original task; there is no separate `resume` command. Use inspection before and after to compare the Run ID, source identity, state and usage. The original budget and deadline remain in force.

This exercise cannot guarantee that every interruption leaves a point from which work can continue. The task may already have finished, or an uncertain dispatch outcome may remain. Creating another Run does not make that uncertainty disappear. Stop and inspect it rather than treating “unknown” as “did not execute.” `run cancel` explicitly cancels a task; it is not a pause button.

Do not enable every capability merely to make the exercise look complete. Response with Child, Schedule with Child, an actual PDF with Child, and trusted plugins with Child are unsupported combinations. This exercise does not add user-response or scheduling features. When you explore those separately, retain the original task identity and authorization boundaries.

## What to carry into the next project

The goal is to take another document or pair of documents and a different question, then obtain and check a persistent report yourself. You should be able to explain when a new task is appropriate, when work must continue through the original task, and whether Memory or specialist collaboration actually took place.

The design article explains why these contracts exist; this exercise lets you inspect their effects on your own inputs. Reproducibility does not promise identical answers or the absence of failures. It starts with an inspectable relationship between inputs, permissions, execution and results.

[Fixed-version research-project guide](https://github.com/hpoenixf/open-etf-agent/blob/88afb84958ed8de9108d756cdc0d63e6d2fbee24/docs/research-project.md) · [Current main guide](https://github.com/hpoenixf/open-etf-agent/blob/main/docs/research-project.md) · [Layered execution evidence](https://github.com/hpoenixf/open-etf-agent/blob/a5cef6d5cf1a4597f0f1271025cd6cc16be151e5/docs/verification/v020-release.md) · [Design article: handoff contracts](open-etf-agent-v010-system-design.md)


This is the practical next stop after the [deep dive](open-etf-agent-v010-system-design.md), not a replacement for it. Once you can inspect a task on your own material, continue to the [six-layer panorama](017-prompt-to-answer-six-layer-panorama-v3.md) to place those boundaries in the wider system.
