---
title: "Prompt, Context, RAG and Memory — Where Does the Model Input Come From?"
description: "Follow one document comparison to distinguish instructions, current input, retrieval and lasting memory. Use Open ETF Agent's offline examples to decide which information needs attention when an answer goes wrong."
readingBrief:
  takeaways:
    - "Instructions belong to the current context, alongside the other inputs available to that model call."
    - "RAG retrieves external material and supplies selected content to generation. A search hit still needs to reach the actual input."
    - "Memory retains information across tasks and can supply current context after recall. Preferences cannot establish product facts."
    - "Inspect the requirements, source text and actual request before changing instructions, retrieval or memory."
  appliesTo:
    - "Developers who have tried a minimal Agent and want to connect prompting, context, retrieval and memory."
  notFor:
    - "Training models, building vector databases or measuring live-model quality."
---

# Prompt, Context, RAG and Memory — Where Does the Model Input Come From?

<LearningPathNav />

You ask an assistant to compare two product guides. It produces an orderly table, but assigns an old restriction to the new edition. Adding “check carefully” changes little. Should you rewrite the prompt, connect a knowledge base or add memory?

Each option changes a different part of the system. Looking inside one model request helps locate the problem.

We will use the introduction's **synthetic Atlas Notes guides**. Free export in version A supports CSV. Version B adds Markdown. Both require an online connection for export. The task is to compare formats and shared restrictions. These are facts established by the teaching fixture.

## What reaches the model before one answer

Think of current context as the working desk. It can hold a task description, original product text, the previous tool result and a relevant user preference. Each item serves a purpose.

| Input | Its role in this comparison |
| --- | --- |
| “Compare free-edition formats and preserve the online requirement” | Defines the goal and constraints |
| Original first pages from A and B | Supplies product facts |
| “A has been read and B is still needed” | Helps continue the current work |
| A saved preference for a table before explanation | Guides presentation |

**Context describes the input carried by this particular call.** Here, prompt emphasizes the instructions, rules and examples within that input. Some APIs and publications use prompt for the entire input, so first establish which meaning an author intends.

Product text, conversation messages and tool definitions can all contribute. Engineering checks should inspect the complete encoded request because tool definitions may travel in separate fields. A system-prompt file alone cannot show everything the model eventually receives.

## Instructions shape the task and materials supply its basis

Suppose both pages are present but the assistant mixes free and enterprise conditions. More specific instructions can help.

```text
Compare export formats for the free edition in both versions.
List their shared online requirement separately.
Keep enterprise capabilities separate, with their version and source.
```

These instructions direct attention to the comparison's scope. They supply no new product facts. If only A is present, the assistant still needs B before it can establish what changed.

Conversely, providing both guides without a comparison goal may produce a long discussion of irrelevant features. Requirements and evidence make different contributions, and they must fit one another.

Start diagnosis by checking whether the request is clear, then whether the necessary original material actually reaches the model. That separates weak task guidance from missing evidence.

## How RAG supplies a larger collection

With two known pages, direct reading is a sensible choice. With thousands of manuals, including everything adds cost, latency and noise. The application first needs to find relevant material.

Retrieval-Augmented Generation connects retrieval to generation. A system searches from the question, acquires relevant content, places selected material in the model's usable input and generates an answer. Lewis and colleagues describe the original RAG formulation in their paper. [Original paper](https://arxiv.org/abs/2005.11401)

Retrieval may use lexical, vector or hybrid methods. Direct page reading remains useful when the document and page are already known. A vector database is one implementation choice whose value depends on the collection and query patterns.

For Atlas Notes, the relationship can be expressed as follows.

```text
A question about offline editing
→ retrieve relevant guides and page locations
→ read the selected original pages
→ include their text and version information in current context
→ compare conditions and write the answer
```

A search preview helps navigation. The original page provides the detailed basis. If search finds B but the next request carries only its title, the model still lacks the text needed for comparison. Retrieving an obsolete edition can also put the answer on the wrong time basis.

Recall quality is therefore one part of the problem. Check whether selected content is readable, what actually enters the model request and whether that content supports the conclusion.

## How lasting memory enters a later task

Now the user explicitly asks, “For future product comparisons, show the table first.” The system can save that preference as memory. A later task can retrieve relevant, current records and include suitable content in its input.

Memory concerns retention and reuse across tasks. Context concerns this call's input. Recall connects them. Memory and a business knowledge base may share retrieval techniques, while retaining different objects with different update rules.

| Retained information | What to check before reuse |
| --- | --- |
| The preference for a table first | Whether it still applies and whether this request changes it |
| A previously read guide | Its version, source and relevance to the new question |
| A previous conclusion | Whether its conditions changed and original text needs rereading |

Saving “B supports Markdown” cannot establish what a later C version supports. A presentation preference cannot prove a product capability either. Retained information needs a source, scope and purpose.

Memory also needs correction and forgetting. If a record changes but an old summary keeps entering later requests, the model may still follow the obsolete preference. The content that reaches the current call determines its available information.

## Putting the four concepts together

Their relationship includes containment and supply. A simplified request makes that visible.

```text
Current model input
  Task and rules   ← instructions
  Relevant sources ← direct reading or retrieval
  Background       ← conversation and applicable memory
  New observations ← current tool results
```

Context engineering handles the selection, organization and maintenance of these materials. It considers ordering, capacity, rereading and what remains useful to carry forward. Anthropic's discussion likewise extends attention beyond wording instructions to maintaining the entire input. [Context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)

Fine-tuning changes model parameters. Runtime source acquisition operates at another level. For a newly revised internal guide, checking access to the correct edition is usually the more direct first step. Sustained adaptation to a particular behavior calls for a separate assessment of training methods and data.

## Observe the relationship in Open ETF Agent

This article uses published **v0.26.0**. Prepare Node.js 26.8.1–26.x and install the pinned dependencies before running the offline example. [Fixed source](https://github.com/hpoenixf/open-etf-agent/tree/bcc12995c83abfbd5b37b9792f5a86ab74aa788e) · [Current entry point](https://github.com/hpoenixf/open-etf-agent)

```bash
git clone https://github.com/hpoenixf/open-etf-agent.git
cd open-etf-agent
git checkout v0.26.0
npm ci --ignore-scripts --no-audit --no-fund
npm run build
npm run demo -- --case retrieve-reread --query "Markdown"
```

The CLI prints the run directory, which contains `report.md` and `run.jsonl`. Inspect the content and sources in the report, then follow the process events in the journal. `Markdown` matches only B, and the report preserves that coverage limitation. Change the query to `offline editing` and observe which pages and report evidence change.

The example scripts model choices while actually performing retrieval, reads and file saving. It demonstrates how materials travel through the research path. A real model's source selection and understanding require separate assessment. [Context implementation](https://github.com/hpoenixf/open-etf-agent/blob/bcc12995c83abfbd5b37b9792f5a86ab74aa788e/src/context.mjs)

When an answer fails, inspect four things in sequence. Are the requirements specific? Is the necessary original text in this request? Did retrieval acquire applicable sources? Is the recalled memory still suitable? Locating the change makes the next adjustment clearer.

Continue to [Ten Core Modules in Open ETF Agent](./agent-ten-modules.md) to connect these input relationships to actual code.

LienJack's concept-oriented explanation helped motivate this topic. This article organizes its own explanation around Atlas Notes and the public implementation. [Prompt, Context and RAG](https://blog.lienjack.com/blog/AI/1.%E6%A6%82%E5%BF%B5%E4%BB%8B%E7%BB%8D/02.%E5%A6%82%E4%BD%95%E8%AE%A9LLM%E6%9B%B4%E8%81%AA%E6%98%8E)
