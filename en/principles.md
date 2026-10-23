---
title: Agent Architecture Principles and Engineering Methods
description: Eight core AI agent architecture principles on evidence, authority, ownership, failure, context and evolution, plus six practical engineering methods.
---

# Agent Architecture: Core Principles and On-Demand Methods

This is a **reference and reading map**, not another published essay or a new approval process. Core principles should be rare, durable and broadly useful. Engineering methods should be consulted when the relevant design problem arises. Actual security, authorization and effect requirements remain with their owning components.

**How to use this map:** Follow an essay from a principle, then use the link at the top or bottom of the article to return here. Each judgment and method has a stable numbered URL anchor. Mechanism essays without a named principle still belong in the [complete catalog](/en/catalog).

## Layer 1 · Eight core judgments

| Principle | What changes in how we think | Read more |
| --- | --- | --- |
| <span id="principle-1"></span> **1. The model interprets meaning; the system owns objective facts.** | A model can research and explain; a Host/Runtime records permissions, execution and receipts. A deterministic rule is not automatically a semantic judge. | [Model understands, code authorizes](/en/articles/011-model-understands-code-authorizes) · [Model/Runtime boundaries, Chinese original](/articles/agent-model-runtime-mcp-skill-boundaries) |
| <span id="principle-2"></span> **2. Proposal, approval, execution and effect are different facts.** | A tool call is not permission; a returned result is not proof of durable effect. Unknown outcomes cannot silently become “not executed.” | [Memory effects](/en/articles/026-agent-memory-forget-durable-effects) · [Publication, Chinese original](/articles/019-agent-answer-publication) |
| <span id="principle-3"></span> **3. Complexity belongs with its rightful owner.** | Encapsulation consolidates decisions and knowledge, not merely files. A child agent or plugin must not invent a duplicate authority system. | [Ownership boundaries, Chinese original](/articles/agent-model-runtime-mcp-skill-boundaries) |
| <span id="principle-4"></span> **4. A local failure must not become a global veto.** | A module may reject its own protected effect, but not erase unrelated valid work or independently decide the entire run's fate. | [Veto and termination, Chinese original](/articles/agent-veto-authority-and-run-termination) |
| <span id="principle-5"></span> **5. Context is a workbench, not a fact database.** | The current model view is bounded and lossy; persistent evidence, memory, tool receipts and history need independent custodians. | [Keep results outside context](/en/articles/tool-results-outside-model-context) · [Main compaction](/en/articles/agent-main-run-context-compaction) |
| <span id="principle-6"></span> **6. Prefer the smallest sufficient mechanism.** | Do not automatically replace the model's flexible research decisions with more planners, validators, hooks or state machines. | [Entry simplification, Chinese original](/articles/022-agent-entry-from-intent-to-direct-research) |
| <span id="principle-7"></span> **7. Capabilities should be easy to introduce, replace and retire.** | A true upgrade lets a new structure replace an old one, without permanently spreading private contracts. This does not require hot-pluggable everything. | [Architecture evolution, Chinese original](/articles/code-cheaper-systems-harder-to-evolve) |
| <span id="principle-8"></span> **8. Internal success is not user-task success.** | Executing tools, generating text and saving files do not on their own prove that the user received a correct, useful result. | [Task convergence](/en/articles/032-ai-development-from-bug-loop-to-task-convergence) · [HTML delivery](/en/articles/agent-html-evolution-challenges) |

Do not add a ninth principle merely because a bug was fixed. A new core idea should genuinely change decisions across multiple systems and resist being explained by an existing principle.

## Layer 2 · Six on-demand methods

| Design situation | Method to consult | Existing reading |
| --- | --- | --- |
| <span id="method-1"></span> **1. Deciding whether to add a feature** | The “five don'ts”: don't add mechanisms simply because you can; don't spread complexity; don't give local modules global vetoes; don't impose a normal-path tax; don't build abilities with no exit. | [The five don'ts, Chinese original](/articles/code-cheaper-systems-harder-to-evolve) |
| <span id="method-2"></span> **2. Reviewing responsibilities and rejections** | Ask about **facts, authority, failure, and value**. For a rejection, check ownership, effect scope and duplicate arbitration. | [Ownership, Chinese original](/articles/agent-model-runtime-mcp-skill-boundaries) |
| <span id="method-3"></span> **3. Passing evidence through a research system** | Distinguish stored results, model-visible projections, executed inputs, conservative lineage, and exact claim support. No transform magically upgrades authority. | [Evidence chain, Chinese original](/articles/financial-agent-trustworthy-evidence-chain) |
| <span id="method-4"></span> **4. Planning a multi-phase delivery** | Design broadly when needed, but implement along the shortest necessary path to a **first usable deliverable**; do not make optional infrastructure a hidden prerequisite. | [Weekly review staged delivery](/en/articles/agent-weekly-review-staged-delivery) · [Spec and Evidence](/en/articles/026-agent-spec-evidence-workflow) · [Task convergence](/en/articles/032-ai-development-from-bug-loop-to-task-convergence) |
| <span id="method-5"></span> **5. Choosing verification and diagnosing failure** | Infer deterministic invariants with focused contract checks; study uncertain model/user outcomes using proportionate empirical evidence. Locate the actual owner of a failure first. | [Test and evaluation fidelity](/en/articles/honest-agent-evaluation) |
| <span id="method-6"></span> **6. Retiring mechanisms and retaining knowledge** | Remove obsolete assumptions from code, specs, prompts, skills and tests without rewriting historical evidence; load long-term knowledge on demand. | [Engineering context, memory and knowledge retirement](/en/articles/027-agent-context-document-history) |

These methods are **not six new runtime gates**. They help select questions and evidence without requiring every change to run the same experiment.

## Further reading and forthcoming work

The [weekly-review staged-delivery retrospective](/en/articles/agent-weekly-review-staged-delivery) remains a separate case study. Knowledge retirement is now part of the [engineering context and history article](/en/articles/027-agent-context-document-history). Further topics still need distinct evidence before becoming standalone essays. See the [writing roadmap](/en/roadmap).

[Architecture reading](/en/thinking) · [Engineering practice](/en/engineering) · [Full catalog](/en/catalog)
