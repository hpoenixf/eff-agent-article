---
layout: home
title: ETF Agent · Engineering Notes
hero:
  name: ETF Agent · Engineering Notes
  text: How AI agents are built, governed, and evolved.
  tagline: A curated engineering library organized around modules, architecture, and AI-assisted development. English translations are added alongside new articles.
  actions:
    - theme: brand
      text: Read the six-layer architecture →
      link: /en/articles/017-prompt-to-answer-six-layer-panorama
    - theme: alt
      text: Explore the eight principles →
      link: /en/principles
    - theme: alt
      text: Browse the library →
      link: /en/catalog
    - theme: alt
      text: Star on GitHub ↗
      link: https://github.com/hpoenixf/eff-agent-article
features:
  - title: Module Deep Dives
    details: Execution loops, provider admission, tool results, MCP, memory, research, context and publication mechanisms.
    link: /en/modules
  - title: Architecture and Systems Thinking
    details: Separation of responsibilities, reliable effects, boundaries and sustainable evolution.
    link: /en/thinking
  - title: AI Agent Engineering
    details: Specs, evidence, test fidelity and end-to-end task convergence.
    link: /en/engineering
---

## New Module Essays: Durable Control and Provider Capacity

[A08 durable control events](/en/articles/agent-control-events-durable-owner-adoption) separates delivery ACKs, original effects and unknown outcomes. [A30 Provider Admission](/en/articles/agent-provider-admission-capacity-lease) explains shared queues, leases and unknown remote occupancy after HTTP 200. The existing [Provider architecture guide](/en/articles/agent-provider-architecture-and-admission) now also clarifies A32 model-catalog eligibility instead of adding a third overlapping essay.

## New Essays: Human Interaction, Time and Usage

[Durable HIL](/en/articles/agent-durable-human-interaction-response-adoption) explains how a reply reaches its original research consumer. [Temporal semantics](/en/articles/agent-temporal-semantics-market-calendar) separates user days, market sessions and quote as-of times. [Shadow Credits](/en/articles/agent-personal-credits-shadow-accounting) tracks proven dispatches and missing usage without introducing billing or production quota denial.

## Essential first reads: architecture and principles

Read the [six-layer architecture guide](/en/articles/017-prompt-to-answer-six-layer-panorama) to follow a question through the Native Loop, evidence, delivery and recovery. Then study the [eight architecture principles](/en/principles) to learn how semantic decisions, authorization and capability ownership are designed. **These two guides serve as the system map and the decision map** for the rest of the library.

<FlagshipEntry />

## Dig deeper by mechanism

Continue with [why tool results should not all enter model context](/en/articles/tool-results-outside-model-context), then continue to [traceable tool execution](/en/articles/agent-tool-lifecycle-and-model-input) and [memory effects that survive answer failures](/en/articles/026-agent-memory-forget-durable-effects).

### Newly translated reading paths

- **Provider architecture and failover:** [Shared admission and request lifecycles](/en/articles/agent-provider-architecture-and-admission), followed by [changing routes without resetting the task](/en/articles/agent-provider-failover-without-resetting-the-run). These explain implemented mechanisms and architectural tradeoffs, not completed production high availability.
- **Reliable knowledge:** [RAG revocation and disclosure](/en/articles/027-rag-revocation-publish-replay), and [A35 content trust and prompt injection](/en/articles/agent-content-trust-prompt-injection).
- **Financial boundaries:** [Research versus investment advice and trading](/en/articles/030-fintech-from-research-to-investment-advice).
- **AI-assisted engineering:** [Staged delivery from a weekly-review Spec](/en/articles/agent-weekly-review-staged-delivery), [retiring obsolete engineering knowledge](/en/articles/027-agent-context-document-history), [task convergence](/en/articles/032-ai-development-from-bug-loop-to-task-convergence), and [why green tests can lie](/en/articles/honest-agent-evaluation), and [why tests must be refactored or retired as part of a Spec](/en/articles/test-lifecycle-refactoring-retirement-and-spec).
- **Origins:** [The first-week ETF assistant retrospective](/en/articles/001-one-week-4-billion-tokens-etf-investment-agent).

Mermaid diagrams, tables and their decision labels are localized in the respective article editions. Existing standalone SVG/HTML galleries may still use Chinese labels until their separate visual translations are published.

The [complete catalog](/en/catalog) follows the canonical reading tree and includes every original article. Articles without an English translation are clearly labeled **Chinese original** and keep linking to their original text. We do not substitute summaries for full translations.

For an architecture decision map, see [eight core principles and six on-demand engineering methods](/en/principles). The [writing roadmap](/en/roadmap) separates planned additions from revisions to existing essays; neither is counted as a published article.

**Owner status, October 24, 2026:** The [architecture gallery](/en/gallery) now explains recently integrated concurrency, Reviewable result details, private subagent profiles and optional time/calendar evidence. Its inventory now has 43 Owners including A36 Temporal Semantics and A37 durable Human Interaction; neither the inventory nor implementation by itself proves production or investment-research quality.

Browse [financial technology topics](/en/fintech), the [architecture gallery](/en/gallery), or our [writing roadmap](/en/roadmap).

Our articles discuss engineering mechanisms and bounded evidence; they do not constitute investment advice or claims of production-level validation.

Latest: [Keep Chatting: Async Background Research](/en/articles/agent-background-research-collaborative-experience). Message handoffs, concurrency resources, and out-of-order UI delivery in one conversation.
