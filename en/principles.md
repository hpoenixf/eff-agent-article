---
title: Agent Architecture Principles and Engineering Methods
description: Nine agent architecture principles covering semantic interpretation, ownership, effects, failure isolation, context, minimal mechanisms, replacement, user-task success and system-wide progress, plus seven engineering methods.
---

# Agent Architecture: Core Principles and On-Demand Methods

**The point of this map is not to memorize nine slogans. It is to make a better decision in your next agent design review.** Identify who interprets a request and who owns its facts, determine what a local failure may affect, and then ask whether the change actually improved the user's task.

Three practical questions lead to the principles: **Who may authorize a model-proposed action and confirm its effect?** (1–4); **Does a new module hide complexity or spread it to callers?** (5–7); **After the tools and tests turn green, what actually improved for the user?** (8–9). For decisions about problem framing and proportionate verification, see the [AI Coding judgment and verification essay](/en/articles/ai-coding-judgment-and-verification).

**See the nine principles work together:** [Nine Architecture Judgments Behind One Report](/en/articles/one-report-nine-architecture-judgments) follows one document comparison through ownership, failure, recovery, evolution, and delivery.

This page retains nine durable judgments and seven on-demand engineering methods. It is **not another approval workflow or Runtime gate**. Security, authorization, and persistent effects remain with their rightful owners. For how a request actually moves through the system, start with the [six-layer architecture guide](/en/articles/017-prompt-to-answer-six-layer-panorama-v3).

<FlagshipEntry compact />

## Layer 1 · Nine core judgments

**Guiding aim:** An agent architecture should reliably complete real user tasks. That requires separating semantic interpretation from facts, keeping authority with the rightful owner, and distinguishing a proposed action from a verified effect. Use the smallest sufficient, recoverable, replaceable mechanisms, then check whether local changes improve the whole task.

**Reading order:** ①–④ trustworthy execution (interpretation, ownership, effects, local failures); ⑤–⑦ sustainable evolution (context, minimal mechanisms, replacement); ⑧–⑨ effectiveness (task success and system progress). This is a way to reason about design, **not** an additional runtime pipeline, approval step, or universal evaluation gate.


| Principle | Core question | What changes in how we think | Read more |
| --- | --- | --- | --- |
| <span id="principle-1"></span> **1. The model interprets meaning; the system owns objective facts.** | **Who interprets the request?** | A model can research and explain; a Host/Runtime records permissions, execution and receipts. A deterministic rule is not automatically a semantic judge. | [Model understands, code authorizes](/en/articles/011-model-understands-code-authorizes) · [Model/Runtime boundaries, Chinese original](/articles/agent-model-runtime-mcp-skill-boundaries) · [Six-layer execution guide](/en/articles/017-prompt-to-answer-six-layer-panorama-v3) |
| <span id="principle-2"></span> **2. Complexity belongs with its rightful owner.** | **Who owns the decision?** | Encapsulation consolidates decisions and knowledge, not merely files. A child agent or plugin must not invent a duplicate authority system. | [Ownership boundaries](/en/articles/agent-model-runtime-mcp-skill-boundaries) · [A one-day Runtime refactor](/en/articles/agent-runtime-refactor-one-day-blocked) |
| <span id="principle-3"></span> **3. Proposal, approval, execution and effect are different facts.** | **What actually happened?** | A tool call is not permission; a returned result is not proof of durable effect. Unknown outcomes cannot silently become “not executed.” | [Memory effects](/en/articles/026-agent-memory-forget-durable-effects) · [Publication](/en/articles/019-agent-answer-publication) |
| <span id="principle-4"></span> **4. A local failure must not become a global veto.** | **How far may a failure propagate?** | A module may reject its own protected effect, but not erase unrelated valid work or independently decide the entire run's fate. | [Veto and termination, Chinese original](/articles/agent-veto-authority-and-run-termination) |
| <span id="principle-5"></span> **5. Context is a workbench, not a fact database.** | **Where do durable facts live?** | The current model view is bounded and lossy; persistent evidence, memory, tool receipts and history need independent custodians. | [Keep results outside context](/en/articles/tool-results-outside-model-context) · [Main compaction](/en/articles/agent-main-run-context-compaction) |
| <span id="principle-6"></span> **6. Prefer the smallest sufficient mechanism.** | **What is the smallest sufficient mechanism?** | Do not automatically replace the model's flexible research decisions with more planners, validators, hooks or state machines. | [Entry simplification](/en/articles/022-agent-entry-from-intent-to-direct-research) |
| <span id="principle-7"></span> **7. Capabilities should be easy to introduce, replace and retire.** | **Can this capability evolve or retire?** | A true upgrade lets a new structure replace an old one, without permanently spreading private contracts. This does not require hot-pluggable everything. | [Architecture evolution, Chinese original](/articles/code-cheaper-systems-harder-to-evolve) |
| <span id="principle-8"></span> **8. Internal success is not user-task success.** | **Did the user’s task succeed?** | Executing tools, generating text and saving files do not on their own prove that the user received a correct, useful result. | [Task convergence](/en/articles/032-ai-development-from-bug-loop-to-task-convergence) · [HTML delivery](/en/articles/agent-html-evolution-challenges) · [The complete delivery path](/en/articles/017-prompt-to-answer-six-layer-panorama-v3) |
| <span id="principle-9"></span> **9. Local improvements are not system progress.** | **Did the whole system improve?** | A better projection, trace or evaluation score needs to be followed through actual model inputs, durable outputs and user tasks. Separate local repairs, measurement corrections and end-to-end benefits; account for normal-path tool-definition costs and quality, cost and latency trade-offs. | [Local versus end-to-end improvement](/en/articles/local-improvement-is-not-system-progress) |

**Why keep principles eight and nine separate?** The eighth asks whether the user actually succeeded; the ninth asks whether a change demonstrably improved end-to-end outcomes after costs and trade-offs. A local green check is not system progress.

Do not add a tenth principle merely because a bug was fixed. A new core idea should genuinely change decisions across multiple systems and resist being explained by an existing principle.

## Layer 2 · Seven on-demand methods

| Design situation | Method to consult | Existing reading |
| --- | --- | --- |
| <span id="method-1"></span> **1. Deciding whether to add a feature** | The “five don'ts”: don't add mechanisms simply because you can; don't spread complexity; don't give local modules global vetoes; don't impose a normal-path tax; don't build abilities with no exit. | [The five don'ts, Chinese original](/articles/code-cheaper-systems-harder-to-evolve) |
| <span id="method-2"></span> **2. Reviewing responsibilities and rejections** | Ask about **facts, authority, failure, and value**. For a rejection, check ownership, effect scope and duplicate arbitration. | [Ownership](/en/articles/agent-model-runtime-mcp-skill-boundaries) · [Subagent refactor retrospective](/en/articles/agent-runtime-refactor-one-day-blocked) |
| <span id="method-3"></span> **3. Passing evidence through a research system** | Distinguish stored results, model-visible projections, executed inputs, conservative lineage, and exact claim support. No transform magically upgrades authority. | [Evidence chain, Chinese original](/articles/financial-agent-trustworthy-evidence-chain) |
| <span id="method-4"></span> **4. Planning a multi-phase delivery** | Design broadly when needed, but implement along the shortest necessary path to a **first usable deliverable**; do not make optional infrastructure a hidden prerequisite. | [Weekly review staged delivery](/en/articles/agent-weekly-review-staged-delivery) · [Spec and Evidence](/en/articles/026-agent-spec-evidence-workflow) · [Task convergence](/en/articles/032-ai-development-from-bug-loop-to-task-convergence) |
| <span id="method-5"></span> **5. Choosing verification and diagnosing failure** | Infer deterministic invariants with focused contract checks; study uncertain model/user outcomes using proportionate empirical evidence. Locate the actual owner of a failure first. | [Test and evaluation fidelity](/en/articles/honest-agent-evaluation) |
| <span id="method-6"></span> **6. Retiring mechanisms and retaining knowledge** | Remove obsolete assumptions from code, specs, prompts, skills and tests without rewriting historical evidence; load long-term knowledge on demand. | [Engineering context, memory and knowledge retirement](/en/articles/027-agent-context-document-history) |
| <span id="method-7"></span> **7. Differentiate interface stability and evolution** | Do not rank whole modules or directories. Separate **protected effects, durable outcomes, evolving research behavior, and replaceable adapters** at concrete interfaces: Child handoffs and forgetting must stay correct, while prompts and retrieval methods can evolve. Verify the actual consumers without adding a parent owner. | [Differentiated evolution contracts](/en/articles/agent-differentiated-evolution-contracts) · [The Runtime refactor that prompted them](/en/articles/agent-runtime-refactor-one-day-blocked) |

These methods are **not seven new runtime gates**. They help select questions and evidence without requiring every change to run the same experiment.
