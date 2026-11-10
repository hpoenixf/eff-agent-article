---
title: "Prompt, Context, RAG and Memory — Where Does the Model Input Come From?"
description: "Follow one document comparison to distinguish instructions, current input, retrieval and lasting memory. Use Open ETF Agent's offline examples to decide which information needs attention when an answer goes wrong."
readingBrief:
  takeaways:
    - "Instructions belong to the current context, alongside the other inputs available to that model call."
    - "RAG retrieves external material and supplies selected content to generation. A search hit still needs to reach the actual input."
    - "Memory retains information across tasks and can supply current context after recall. Preferences cannot establish product facts."
    - "Comparison needs coverage of the versions being compared. A hit from one version alone cannot establish what changed."
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

## Similar-looking mistakes can start in different places

Consider the same symptom of assigning an old restriction to the new edition. The following three teaching cases change the input conditions to illustrate how diagnosis works.

In the first case, both original guides are present, but the request merely says “compare them.” The assistant puts free and enterprise conditions in the same column, leaving the reader with a misleading impression. Specify the editions, comparison dimensions and output requirements, then inspect the answer using the same materials. Revising the prompt primarily changes how the task is organized.

In the second case, the instructions are already clear, but only A reaches the input. Repeating “be accurate” and “omit nothing” cannot supply B's text. Follow the acquisition path to check whether B was read, truncated or confused with an older file sharing its name. Additional adjectives simply lengthen a request whose evidence is still incomplete.

In the third case, B was acquired, but an intermediate summary dropped the online-export requirement. The model receives only “B adds Markdown” and may write an overly broad conclusion. The part needing attention is the selection and representation of material before it enters the request. Retrieval itself may have returned the correct page.

All three cases can produce an incorrect table cell while calling for different adjustments. A useful debugging practice preserves the relationship between the question, important original passages and the actual request. Locate where information was lost before changing instructions, acquiring another source or restoring a missing condition.

Also check how much evidence a claim requires. “B supports Markdown” supports a statement about B. “B adds Markdown compared with A” also requires checking A. Comparisons, rankings and expressions such as “only” usually demand broader source coverage.

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

## Relevant results still need to support the actual question

Retrieval often ranks passages by similarity or term matching. A user's question may require a complete comparison. Connecting those two objectives takes an explicit check.

Suppose we search Atlas Notes for `Markdown`. B mentions the term directly and is easy to find. A does not contain it and may be absent from the results entirely. Reading those hits can establish what B says, while leaving the comparison incomplete. When the task already names A and B, read both known documents and organize matching fields from each.

Small chunks introduce another problem. A retrieved passage may contain “supports Markdown,” while “free edition” and “online export” appear in the preceding paragraph. Even an accurate paraphrase of the returned passage can broaden the capability's apparent scope. Chunk selection should consider whether headings, neighboring conditions and version information remain together. Longer chunks leave room for fewer candidates, so this choice depends on the task.

| Judgment the reader needs | Additional checks |
| --- | --- |
| Whether B supports Markdown | Version, edition within that version and applicable conditions |
| What B changed compared with A | Acquisition of both versions and matching comparison dimensions |
| Whether both support offline export | Export's connection requirement, kept separate from offline editing |
| Which formats are completely unsupported | Coverage of relevant clauses and whether a missing hit establishes an explicit negative |

This explains why a high retrieval score cannot by itself establish sufficient evidence for an answer. Ranking helps determine reading order. Specific claims still depend on corresponding clauses. When a query returns nothing, the system can try another query, inspect a contents page or follow a known document. An empty result describes the observation from that particular search.

The public example uses lexical matching within the allowed document set. This makes query-dependent hits easy to inspect. A real collection with synonyms, multiple languages or long documents may justify semantic retrieval, hybrid ranking or different chunking. [Pinned retrieval implementation](https://github.com/hpoenixf/open-etf-agent/blob/bcc12995c83abfbd5b37b9792f5a86ab74aa788e/src/retrieval.mjs)

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

## Choose knowledge storage, memory and adaptation by what changes

“Help the assistant know more” expresses a broad product wish. Engineering decisions become clearer when we ask what should change and how often it changes.

If a user uploads B today and wants a comparison a minute later, reading it directly for this task is natural. If many later tasks need to search it, organizing it into a knowledge collection becomes useful. The object being maintained is an updateable, traceable product fact, so document identity and version still matter.

A preference such as showing the table first raises different questions. How was it explicitly retained? Which tasks does it apply to? How can the user revise it? “Give me only the conclusion this time” may simply be a local instruction. Lasting retention needs corresponding product behavior and update rules.

For sustained behavioral adaptation, such as a particular output habit in a stable task family, assess examples in the prompt, tool constraints and, under suitable conditions, training. Fine-tuning changes behavioral tendencies through model parameters. Its cost includes preparing data, evaluation and later maintenance. Runtime access to original text retains independent value for frequently changing facts that need item-level traceability.

These approaches can be combined. A domain-adapted model can retrieve current guides, recall user preferences and receive explicit instructions for this request. They contribute at different positions. A design should explain how each is updated and selected, and how the reader can return to the underlying basis.

A simple thought experiment separates the changes. Keep the model fixed and supply a different guide edition. Its available information changes. Keep the source fixed and change the comparison requirements. Its focus can change. Add the preference for a table first, and presentation order may change. Distinguishing these effects makes a discussion of a “smarter” assistant more specific.

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

## Why organize context even when more text fits

For this comparison, the simplest request might include every conversation turn, guide and memory entry. With a small collection, that is easy to implement and inspect manually. As work grows, capacity, cost and reading noise grow together.

Even material that fits can interfere with other material. Mixed old and new guides require version separation. A requirement changed several turns ago needs its current applicability made clear. A tool may return a page full of navigation whose relevant clause occupies only two lines. Retaining all of it increases the selection burden.

Start context organization by separating three purposes. Current goals and effective constraints should be easy to find. Original passages supporting the comparison need identity and a rereading path. Completed work whose detail is temporarily unnecessary can become a short record, with details available on demand.

Suppose A was read earlier and the current work is checking B's online condition. A working note can say that A has been acquired and B's export condition still needs checking, while retaining page references. When the final table needs exact wording, follow those references back to the clauses. This reduces repeated input while preserving a route to the complete basis.

The arrangement adds rereading cost and depends on retained material remaining available. For two short documents, keeping the complete text may be cheaper. When a task needs selection and compaction, protect its goal, original conditions and rereading paths before deciding which details can temporarily leave the input.

The four concepts now connect through one actual request. Instructions state the current task, retrieval and reading supply original passages, memory supplies applicable background, and context construction organizes what is sent. The relationships within that request are what we ultimately need to inspect.

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

After running both queries, compare the outputs against the same question. Find which document versions appear in the report's evidence, which conditions remain in its prose and which queries and reads appear in the journal. The difference between `Markdown` and `offline editing` makes the path tangible. Queries affect candidates, reads acquire passages, and generation uses the current input.

A small diagnostic record can contain three questions. Were all comparison objects covered? Did the model-visible text preserve the important conditions? Did the conclusion extend beyond those conditions? Acquire B when it was missing, return to the relevant clauses when editions were mixed, and adjust presentation requirements when the issue is output order.

The same inspection works for contracts, product manuals and internal policies. Relevant conditions vary by task, but the path from question through materials and actual input to conclusion remains inspectable. Once the affected position is known, changing that part makes the result easier to explain than simultaneously replacing instructions, retrieval and memory.

When an answer fails, inspect four things in sequence. Are the requirements specific? Is the necessary original text in this request? Did retrieval acquire applicable sources? Is the recalled memory still suitable? Locating the change makes the next adjustment clearer.

Continue to [Ten Core Modules in Open ETF Agent](./agent-ten-modules.md) to connect these input relationships to actual code.

LienJack's concept-oriented explanation helped motivate this topic. This article organizes its own explanation around Atlas Notes and the public implementation. [Prompt, Context and RAG](https://blog.lienjack.com/blog/AI/1.%E6%A6%82%E5%BF%B5%E4%BB%8B%E7%BB%8D/02.%E5%A6%82%E4%BD%95%E8%AE%A9LLM%E6%9B%B4%E8%81%AA%E6%98%8E)
