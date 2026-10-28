---
title: Agent Architecture Principles and Engineering Methods
description: "A simple document-comparison and report-saving example explains nine Agent design principles and seven practical methods: judgment, execution, failure scope and real user results."
---

# Agent Architecture: Core Principles and On-Demand Methods

**These nine principles are not about adding architecture. They are about helping a person actually receive a usable result.**

Consider a teaching example: a teammate asks an AI assistant to compare two product documents, answer whether the new version exports PDF, and save a report with references. The answer looks correct and the UI says “done,” but the file-saving operation has no definitive receipt. **Was the report delivered?**

You do not need to know a dozen internal modules to begin. Ask: **Who understands the question? Who knows whether the file was saved? When something fails, which independent results can still reach the user?** Principles 1–4 cover interpretation, authorization, and failure scope. Principles 5–7 make future changes easier without accumulating obsolete machinery. Principles 8–9 ask whether the task succeeded and whether an improvement truly helped.

If you are new to Agent architecture, first follow [one report through nine design judgments](/en/articles/one-report-nine-architecture-judgments), then return here for the relevant principle. The [six-layer overview](/en/articles/017-prompt-to-answer-six-layer-panorama-v3) gives the fuller technical execution path.

These are design questions, **not nine mandatory approval gates**. A model may propose an action; the program that owns permissions and stored results must confirm what really happened.

<FlagshipEntry compact />

## Layer 1 · Nine core judgments

**One aim to remember:** A user receives an accurate report they can inspect and reopen. Clear responsibility, limited failure scope, and retireable mechanisms are means to that end.

**How to use this map:** ①–④ ask who decides and what may fail; ⑤–⑦ ask whether future changes will become harder; ⑧–⑨ ask whether users get a better result. No request needs to pass nine new checks.


| Principle | Core question | What changes in how we think | Read more |
| --- | --- | --- | --- |
| <span id="principle-1"></span> **1. The model interprets meaning; the system owns objective facts.** | **Who interprets the request?** | The model may spot that PDF export was added. The program must confirm which documents were read, which tools were authorized, and whether the report was saved. | [Model understands, code authorizes](/en/articles/011-model-understands-code-authorizes) · [Model/Runtime responsibilities](/en/articles/agent-model-runtime-mcp-skill-boundaries) · [Six-layer execution guide](/en/articles/017-prompt-to-answer-six-layer-panorama-v3) |
| <span id="principle-2"></span> **2. Complexity belongs with its rightful owner.** | **Who owns the decision?** | The document reader owns reading; storage owns confirmation of a saved file. Do not add a manager that pretends to certify both. | [Ownership boundaries](/en/articles/agent-model-runtime-mcp-skill-boundaries) · [A one-day Runtime refactor](/en/articles/agent-runtime-refactor-one-day-blocked) |
| <span id="principle-3"></span> **3. Proposal, approval, execution and effect are different facts.** | **What actually happened?** | “Save the report” is a request, not a saved file. When the outcome is unknown, do not assume nothing happened and blindly retry. | [Memory effects](/en/articles/026-agent-memory-forget-durable-effects) · [Publication](/en/articles/019-agent-answer-publication) |
| <span id="principle-4"></span> **4. A local failure must not become a global veto.** | **How far may a failure propagate?** | A broken optional chart should not erase valid prose. But content lacking required authorization must still be withheld. | [Veto and termination](/en/articles/agent-veto-authority-and-run-termination) |
| <span id="principle-5"></span> **5. Context is a workbench, not a fact database.** | **Where do durable facts live?** | If the model forgets page three, reread the original document instead of treating its summary as the only copy. | [Keep results outside context](/en/articles/tool-results-outside-model-context) · [Main compaction](/en/articles/agent-main-run-context-compaction) |
| <span id="principle-6"></span> **6. Prefer the smallest sufficient mechanism.** | **What is the smallest sufficient mechanism?** | Start by reading, comparing, and saving two short documents—not by building a general planner and approval platform. | [Entry simplification](/en/articles/022-agent-entry-from-intent-to-direct-research) |
| <span id="principle-7"></span> **7. Capabilities should be easy to introduce, replace and retire.** | **Can this capability evolve or retire?** | When replacing a document reader, check who still depends on the old path and retire obsolete rules and tests. | [Architecture evolution](/en/articles/code-cheaper-systems-harder-to-evolve) |
| <span id="principle-8"></span> **8. Internal success is not user-task success.** | **Did the user’s task succeed?** | Make sure the user can open the report, understand the comparison, and inspect the cited source pages. | [Task convergence](/en/articles/032-ai-development-from-bug-loop-to-task-convergence) · [HTML delivery](/en/articles/agent-html-evolution-challenges) · [The complete delivery path](/en/articles/017-prompt-to-answer-six-layer-panorama-v3) |
| <span id="principle-9"></span> **9. Local improvements are not system progress.** | **Did the whole system improve?** | Faster search does not necessarily produce a better report. Compare delivery quality, latency, and cost for equivalent tasks. | [Local versus end-to-end improvement](/en/articles/local-improvement-is-not-system-progress) |

**Why keep principles eight and nine separate?** The eighth asks whether the user actually succeeded; the ninth asks whether a change demonstrably improved end-to-end outcomes after costs and trade-offs. A local green check is not system progress.

Do not add a tenth principle merely because a bug was fixed. A new core idea should genuinely change decisions across multiple systems and resist being explained by an existing principle.

## Layer 2 · Seven on-demand methods

| Design situation | Method to consult | Existing reading |
| --- | --- | --- |
| <span id="method-1"></span> **1. Deciding whether to add a feature** | Suppose you add optional charts to a report. Do users who never request charts now wait longer or pay for extra tool descriptions? Can the feature later be retired? | [The five don'ts](/en/articles/code-cheaper-systems-harder-to-evolve) |
| <span id="method-2"></span> **2. Reviewing responsibilities and rejections** | When upload, citation, or file saving fails, ask who recorded that fact, who may reject the operation, and what other work may still be delivered. | [Ownership](/en/articles/agent-model-runtime-mcp-skill-boundaries) · [Subagent refactor retrospective](/en/articles/agent-runtime-refactor-one-day-blocked) |
| <span id="method-3"></span> **3. Passing evidence through a research system** | When a report cites a source page, verify that the page was read and the claim matches it. A link in a summary alone is not evidence. | [Evidence chain, Chinese original](/articles/financial-agent-trustworthy-evidence-chain) |
| <span id="method-4"></span> **4. Planning a multi-phase delivery** | Design broadly when needed, but implement along the shortest necessary path to a **first usable deliverable**; do not make optional infrastructure a hidden prerequisite. | [Weekly review staged delivery](/en/articles/agent-weekly-review-staged-delivery) · [Spec and Evidence](/en/articles/026-agent-spec-evidence-workflow) · [Task convergence](/en/articles/032-ai-development-from-bug-loop-to-task-convergence) |
| <span id="method-5"></span> **5. Choosing verification and diagnosing failure** | Infer deterministic invariants with focused contract checks; study uncertain model/user outcomes using proportionate empirical evidence. Locate the actual owner of a failure first. | [Test and evaluation fidelity](/en/articles/honest-agent-evaluation) |
| <span id="method-6"></span> **6. Retiring mechanisms and retaining knowledge** | Remove obsolete assumptions from code, specs, prompts, skills and tests without rewriting historical evidence; load long-term knowledge on demand. | [Engineering context, memory and knowledge retirement](/en/articles/027-agent-context-document-history) |
| <span id="method-7"></span> **7. Differentiate interface stability and evolution** | Keep promises such as “the report was saved” stable while allowing retrieval and summary methods to evolve. Choose verification by the concrete user and consequence, not by freezing a whole module. | [Differentiated evolution contracts](/en/articles/agent-differentiated-evolution-contracts) · [The Runtime refactor that prompted them](/en/articles/agent-runtime-refactor-one-day-blocked) |

These methods are **not seven new runtime gates**. They help select questions and evidence without requiring every change to run the same experiment.
