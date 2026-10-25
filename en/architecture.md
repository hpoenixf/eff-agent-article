---
title: Architecture Guide
---

# Architecture Guide

<FlagshipEntry compact />

**Start with the [six-layer request lifecycle V3](/en/articles/017-prompt-to-answer-six-layer-panorama-v3)**. It follows one request through admission, conversation/context, Main and subagents, optional tools, publication and visible client results. [V2 is preserved](/en/articles/017-prompt-to-answer-six-layer-panorama) and the [original V1 remains readable](/articles/017-prompt-to-answer-six-layer-panorama-v1).

The engineering articles separate model judgment from runtime facts and permissions. For a structured starting point, explore the [architecture reading path](/en/thinking), then the [module mechanisms](/en/modules).

The [architecture principles](/en/principles) now distinguish eight durable judgments from six on-demand engineering methods; the [writing roadmap](/en/roadmap) distinguishes article revisions from unpublished candidates.

The [A35 content trust deep dive](/en/articles/agent-content-trust-prompt-injection) distinguishes trusted producer identities from source data and effect permissions. Its Phase 1 structural tests are not a real-model security qualification.

## October 24, 2026: implementation versus acceptance

Bounded front-end conversation responses and background research now share the original Conversation/Run ownership, but a complete source-grounded research run has not yet passed its separate acceptance criteria. Optional Reviewable details are attached to results and readable from History without becoming a new authority over the answer.

Account-scoped subagent profiles and frozen Run/Child selection have source-level integration; end-to-end account, PostgreSQL, browser, and research validation remain open. The optional Nasdaq 2026 calendar path distinguishes user-local time, task anchors and scheduled sessions, but is disabled by default. A scheduled market session is not proof of actual trading or quote freshness. The curated question catalog likewise does not certify answer quality.

The [43-owner gallery](/en/gallery) now includes A36 Temporal Semantics and A37 durable Human Interaction as two first-class logical Owners. The interactive map currently retains Chinese labels. A36 source/calendar/ordinary real-agent acceptance is still open. A37 Stages A–D and provider-free formal close are complete in the scoped local lane, while production Human Park remains disabled by default. Its interaction handoff authority does not replace Authorization, Effect, Recovery or Publication.

The [original architecture guide](/architecture) contains further Chinese-language details.
