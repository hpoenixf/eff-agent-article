---
title: "Agents in 15 Minutes"
description: "A friendly introduction for frontend and backend developers. Follow a runnable document-comparison example to understand the model, runtime, and tools."
---

# Agents in 15 Minutes

If you have built an API, called a backend service, or written a short JavaScript automation script, you already have a useful starting point for understanding agents.

**Think of an agent as an assistant that keeps a task moving: it understands the goal, chooses a next step, uses tools, and continues with the information it receives.**

One example and three diagrams are enough to see how that works.

![Agents at a glance: user request, next action, tools, useful result](../../visuals/en/agent-in-15-minutes/01-agent-at-a-glance-en.svg)

## A familiar task: compare two documents

Imagine receiving this request:

> **"Compare product guides A and B. Which export formats are available in the free edition, and what restrictions do they share?"**

This is a synthetic teaching example from [Open ETF Agent](https://github.com/hpoenixf/open-etf-agent). The fictional product is called *Atlas Notes*. The documents contain three facts:

- **Version A:** the free edition exports CSV.
- **Version B:** the free edition exports CSV and Markdown.
- **Both versions:** exporting requires an internet connection.

You would probably read guide A, then guide B, and summarize what changed and what stayed the same. The example agent follows the same outline.

![Document comparison: read A, read B, compare, and write a short result](../../visuals/en/agent-in-15-minutes/02-document-compare-en.svg)

**A useful result looks like this:**

> Version B adds Markdown export alongside CSV. Both free editions require an internet connection to export.

Even this small example includes the essential steps: understand the request, read information, organize it, and produce a result.

## Who does what inside an agent?

Start with just three roles.

![Three core roles: model chooses, runtime coordinates, tools perform actions](../../visuals/en/agent-in-15-minutes/03-three-roles-en.svg)

The **model** understands the request and chooses what to do next. It might read a document first and organize an answer once it has the relevant material.

The **runtime** connects the steps. It gathers the question, available information, and tool results into the **context** for the next model turn, allowing the agent to continue its work.

The **tools** perform concrete operations. File reading, database queries, API calls, and calculations can all be exposed as functions with inputs and outputs.

Together they form a useful loop: **choose an action → run a tool → receive information → decide what comes next.**

Once you understand this loop, other agent frameworks become easier to approach.

## Try the example in five minutes

The document comparison can be run locally using [Open ETF Agent v0.6](https://github.com/hpoenixf/open-etf-agent/tree/7480b656b18192e6d6b44aab65255b970d58e6f8). With Node.js 26.11.1–26.x installed, run:

```bash
git clone https://github.com/hpoenixf/open-etf-agent.git
cd open-etf-agent
git checkout v0.6.0-dev.0
npm ci --ignore-scripts --no-audit --no-fund
npm run build
npm run demo -- --case T1
```

The command reports the directory for the run. Open `report.md` inside that directory to see the comparison and its sources.

The default example uses a **scripted model-action sequence**, so no model API key is needed. You can explore the tool execution process locally. When you later connect a live model, the same idea of choosing steps, using tools, and consuming results remains central.

## Your next stop: the full agent architecture

You now have a useful mental model: **the user sets a goal, the model chooses the next step, the runtime coordinates, and tools do the work.**

To go deeper into conversations, context management, subagents, and frontend interactions, read [**The Six-Layer ETF Agent Request Lifecycle**](/en/articles/017-prompt-to-answer-six-layer-panorama-v3). It expands this small example into a system-level view.

[Open ETF Agent source and examples](https://github.com/hpoenixf/open-etf-agent) · [中文版](/articles/agent-in-15-minutes) · [Engineering notes on GitHub (stars welcome)](https://github.com/hpoenixf/eff-agent-article)