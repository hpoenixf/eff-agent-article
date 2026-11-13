---
layout: page
title: "Open ETF Agent: A Runnable Open-Source Agent Learning Project"
description: "Learn agent development from document comparison to sustained research through pinned code and module guides, distinguishing verified capabilities, teaching slices and unfinished work."
---

<!-- open-module-map:start -->
<div class="vp-doc" style="max-width: 1440px; margin: 24px auto; padding: 0 24px;">

<a id="module-map"></a>
## Read the six-layer map by module and capability

Select a card to open its corresponding article. Expand, zoom and scroll the map. The map describes bounded Open implementation, not a claim that every capability in the article is public or qualified.

Current scope: **v0.30.0** · [Fixed navigation source](https://github.com/hpoenixf/open-etf-agent/tree/d3822ab07186ab16f3d57e60a7bbf91fea3eb9d5) · [Code and verification limits](https://github.com/hpoenixf/open-etf-agent/blob/d3822ab07186ab16f3d57e60a7bbf91fea3eb9d5/docs/module-status.md)

<PanoramaViewer src="/eff-agent-article/visuals/open-etf-agent/module-map.svg" label="Open ETF Agent six-layer map: select a module to read its article" :canvas-width="2240" :canvas-height="2034">
<div style="overflow: auto; max-width: 100%;">
<object type="image/svg+xml" data="/eff-agent-article/visuals/open-etf-agent/module-map.svg" style="display:block;width:1320px;max-width:none;height:1199px;" aria-label="Open ETF Agent six-layer map: select a module to read its article">
<a href="/eff-agent-article/visuals/open-etf-agent/module-map.svg">Open clickable SVG</a>
</object>
</div>
</PanoramaViewer>

[Open the interactive SVG directly](/eff-agent-article/visuals/open-etf-agent/module-map.svg)

<details>
<summary>Article links by module (same destinations as the map)</summary>

### L1 · Inputs & triggers

- **CLI** → [Agents in 15 Minutes](https://hpoenixf.com/eff-agent-article/en/articles/agent-in-15-minutes) · Overview
- **Research Project** → [Bring Your Own Documents to an Agent: From the First Report to a Resumable Research Project](https://hpoenixf.com/eff-agent-article/en/articles/open-etf-agent-research-project-workshop) · Workshop
- **Schedule** → [Agents Don't Need to Think Continuously: How Research Continues on Schedule After a Conversation Ends](https://hpoenixf.com/eff-agent-article/en/articles/agent-autonomous-scheduled-research) · Module article

### L2 · Identity, session & context

- **Session** → [Agent Execution Identity Panorama: From a Conversation to Model Turns—What Actually Continues?](https://hpoenixf.com/eff-agent-article/en/articles/agent-task-session-run-worker-schedule) · Overview
- **Conversation** → [Keep Chatting Is Not Keep Executing: Agent Conversation Admission and Task Continuation](https://hpoenixf.com/eff-agent-article/en/articles/agent-conversation-admission-task-continuation) · Module article
- **Temporal** → [When an Agent Says “Today,” Which Day Does It Mean? Task Time, User Time, and Market Sessions](https://hpoenixf.com/eff-agent-article/en/articles/agent-temporal-semantics-market-calendar) · Module article
- **Context** → [Agent Context Governance Panorama · Practice: From the First Request to Long-Term Memory](https://hpoenixf.com/eff-agent-article/en/articles/agent-context-governance-actions) · Overview
- **Compaction** → [When Context Is Nearly Full, Why Can't We Simply Ask a Model to Summarize History?](https://hpoenixf.com/eff-agent-article/en/articles/agent-main-run-context-compaction) · Module article
- **Memory** → [The Full Lifecycle of Agent Memory: From Remembering Preferences to Safe Forgetting](https://hpoenixf.com/eff-agent-article/en/articles/026-agent-memory-forget-durable-effects) · Module article
- **Human Interaction** → [After an Agent Asks the User: Returning a Durable Human Response to the Original Research](https://hpoenixf.com/eff-agent-article/en/articles/agent-durable-human-interaction-response-adoption) · Module article
- **Specialist Profile** → [A Custom Expert Should Be More Than a Prompt Field](https://hpoenixf.com/eff-agent-article/en/articles/agent-custom-expert-from-prompt-to-recovery) · Module article
- **Skill** → [How Is a Skill Different from a Prompt? From Loading to Script Execution](https://hpoenixf.com/eff-agent-article/en/articles/agent-skill-from-markdown-to-callable-research) · Module article

### L3 · Agent decisions & execution

- **Worker** → [Agent Deep Dive: From One Report to Durable Execution and Specialist Collaboration](https://hpoenixf.com/eff-agent-article/en/articles/open-etf-agent-v010-system-design) · Open walkthrough
- **Admission** → [Why the Next Model Request Still Queues After HTTP 200: Provider Admission, Leases and Unknown Occupancy](https://hpoenixf.com/eff-agent-article/en/articles/agent-provider-admission-capacity-lease) · Module article
- **Gateway** → [Inside an Agent’s Provider Layer: Why a Unified API Still Needs Shared Admission](https://hpoenixf.com/eff-agent-article/en/articles/agent-provider-architecture-and-admission) · Module article
- **Runtime** → [A Research Agent Needs More Than Tools: How Model, Harness, and Loop Work Together](https://hpoenixf.com/eff-agent-article/en/articles/etf-agent-model-harness-research-loop) · Overview
- **Hooks** → [From Claude and Pi to Codex: Running Multi-Ecosystem Hooks Inside Our Agent Runtime](https://hpoenixf.com/eff-agent-article/en/articles/agent-multi-ecosystem-hook-execution) · Module article
- **Run Control** → [When Every Module Can Say No: Agent Run Termination, Stage Budgets, and Safe Recovery](https://hpoenixf.com/eff-agent-article/en/articles/agent-veto-authority-and-run-termination) · Module article
- **Main → Child** → [Subagent Panorama: Independent Context, Specialist Work and Real Handoffs](https://hpoenixf.com/eff-agent-article/en/articles/agent-subagent-context-specialization) · Overview
- **Child Lifecycle** → [Subagent Panorama: Independent Context, Specialist Work and Real Handoffs](https://hpoenixf.com/eff-agent-article/en/articles/agent-subagent-context-specialization) · Overview

### L4 · Tools & domain capabilities

- **Tool Host** → [From Tool Invocation to Model Input: Connecting an Agent's Observability Chain](https://hpoenixf.com/eff-agent-article/en/articles/agent-tool-lifecycle-and-model-input) · Module article
- **MCP** → [From Connecting MCP to Actually Using Its Tools: Building an End-to-End Agent Integration Path](https://hpoenixf.com/eff-agent-article/en/articles/mcp-host-from-discovery-to-consumption) · Module article
- **Trusted Plugin** → [How Agent Extensions Enter the Host: Plugin Lifecycle and Runtime Boundaries](https://hpoenixf.com/eff-agent-article/en/articles/020-agent-extension-host-smartphone) · Module article
- **Web Acquisition** → [From Finding Pages to Reading Further: How We Taught an Agent to Browse the Web](https://hpoenixf.com/eff-agent-article/en/articles/021-agent-web-research-from-search-to-deep-reading) · Module article
- **PDF** → [From Being Able to Read to Being Able to Research: Evolving PDF into Traceable Multimodal Evidence](https://hpoenixf.com/eff-agent-article/en/articles/024-agent-pdf-from-text-to-evidence) · Module article
- **Result / ResultRef** → [Why Tool Results Should Not All Enter Model Context](https://hpoenixf.com/eff-agent-article/en/articles/tool-results-outside-model-context) · Module article
- **Retrieval** → [The RAG Lifecycle: From Document Ingestion to Cited Answers](https://hpoenixf.com/eff-agent-article/en/articles/agent-knowledge-retrieval-end-to-end) · Overview
- **Knowledge** → [The RAG Lifecycle: From Document Ingestion to Cited Answers](https://hpoenixf.com/eff-agent-article/en/articles/agent-knowledge-retrieval-end-to-end) · Module article
- **Calculation** → [Agent Deep Dive: From One Report to Durable Execution and Specialist Collaboration](https://hpoenixf.com/eff-agent-article/en/articles/open-etf-agent-v010-system-design) · Open walkthrough
- **Child Results** → [How Do We Know the Main Agent Actually Used a Specialist’s Findings?](https://hpoenixf.com/eff-agent-article/en/articles/agent-subagent-contribution-evidence) · Module article

### L5 · Publication & delivery

- **Main → Report** → [Start with a Report You Can Read Back: Open ETF Agent v0.1](https://hpoenixf.com/eff-agent-article/en/articles/open-etf-agent-v01-first-readable-report) · Open walkthrough
- **Report** → [Start with a Report You Can Read Back: Open ETF Agent v0.1](https://hpoenixf.com/eff-agent-article/en/articles/open-etf-agent-v01-first-readable-report) · Open walkthrough
- **Artifact / Revision** → [A Report Is Generated: Why Can’t It Be Shared Yet?](https://hpoenixf.com/eff-agent-article/en/articles/agent-artifact-version-access-sharing) · Module article
- **Publication** → [The Agent Has Generated an Answer. Why Does It Still Need a Separate Publication System?](https://hpoenixf.com/eff-agent-article/en/articles/019-agent-answer-publication) · Module article
- **Report Review** → [After the report: source checks, specialist work, and independent review](https://hpoenixf.com/eff-agent-article/en/articles/open-etf-agent-report-review-workshop) · Workshop

### L6 · User interfaces

- **Loopback Reader** → [Agent Deep Dive: From One Report to Durable Execution and Specialist Collaboration](https://hpoenixf.com/eff-agent-article/en/articles/open-etf-agent-v010-system-design) · Open walkthrough
- **CLI Readback** → [Start with a Report You Can Read Back: Open ETF Agent v0.1](https://hpoenixf.com/eff-agent-article/en/articles/open-etf-agent-v01-first-readable-report) · Open walkthrough

</details>

Dashed cards represent call-sites of existing owners, not additional modules. Article links provide reading navigation only; existing coverage qualification and historical evidence remain unchanged. The GitHub README image is a preview; interactive card navigation is available here.

</div>
<!-- open-module-map:end -->

<OpenEtfTopic language="en" />
