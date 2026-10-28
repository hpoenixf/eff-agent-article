---
title: Agent Engineering Glossary
description: A practical glossary for Run, Owner, Harness, Grant, Publication, HIL, handoff, checkpoints, evidence, and other terms used across the engineering notes.
---

# Agent Engineering Glossary

You do not need to learn every internal module to read this site. Start with one distinction: **a model can interpret and propose actions, while authorized systems execute them and retain receipts**. These are terms used in the articles, not a new industry standard or runtime contract.

## Execution and responsibilities

| Term | Meaning in these notes | Further reading |
| --- | --- | --- |
| **Model** | Interprets requests, proposes research actions, and drafts answers; its words alone cannot certify effects. | [Six-layer map](/en/articles/017-prompt-to-answer-six-layer-panorama-v3) |
| **Harness** | Facilities connecting model decisions to work: tool visibility, constraints, state, and execution. | [Model, Harness and Loop](/en/articles/etf-agent-model-harness-research-loop) |
| **Native Agent Loop** | Receives model proposals, dispatches authorized tools, consumes real results, and continues or stops. | [Responsibility split](/en/articles/agent-model-runtime-mcp-skill-boundaries) |
| **Run** | A task execution with its own identity, deadline, budget, and observed effects. Recovery retains this history. | [Termination authority](/en/articles/agent-veto-authority-and-run-termination) |
| **Owner** | The party responsible for particular facts, state, decisions, or effects—not necessarily a microservice. | [Architecture principles](/en/principles) |
| **Entry / Research / Finalization** | Stages for intake, advancing research, and concluding or delivering work—not three separate models. | [Six-layer map](/en/articles/017-prompt-to-answer-six-layer-panorama-v3) |
| **Main / Subagent / Child** | Main worker and constrained task workers. Child results need attributed handoff before Main adopts them. | [Subagent collaboration](/en/articles/agent-subagent-context-specialization) |
| **Provider / Gateway** | Model transport and protocol adaptation. An HTTP 200 response does not imply a completed task. | [Provider admission](/en/articles/agent-provider-architecture-and-admission) |
| **Tool Host / Tool Surface** | The host validates and executes real tools; the surface is the set of tools actually visible to the model. | [Tool Surface](/en/articles/agent-model-capability-presentation-tool-surface) |
| **MCP / Skill** | MCP is an open integration protocol; a Skill gives on-demand instructions and resources. Connection alone does not prove adoption. | [MCP lifecycle](/en/articles/mcp-host-from-discovery-to-consumption) |

## Authority, evidence, and delivery

| Term | Meaning in these notes | Further reading |
| --- | --- | --- |
| **Grant** | Authorized scope, duration, or budget for a Run. Model proposals do not expand it. | [Authorization](/en/articles/011-model-understands-code-authorizes) |
| **HIL / HIO** | Human interaction and response adoption. Asking, receiving, adopting, and causing an effect are separate facts. | [Durable human interaction](/en/articles/agent-durable-human-interaction-response-adoption) |
| **Publication** | A versioned, identifiable, receipt-backed answer a user can retrieve, separate from tool execution success. | [Answer publication](/en/articles/019-agent-answer-publication) |
| **Handoff** | Transfer of a Child's output and identity to another task owner. Proposed, completed, and adopted states differ. | [Subagent collaboration](/en/articles/agent-subagent-context-specialization) |
| **Checkpoint / Recovery** | Preserved execution state with original identity and already-observed effects; unknown is not automatically unexecuted. | [Recovery authority](/en/articles/agent-veto-authority-and-run-termination) |
| **ResultRef / Artifact** | Retrievable references to externalized results or files; the model's context is not the durable original. | [Externalized results](/en/articles/tool-results-outside-model-context) |
| **Memory / RAG** | Memory manages durable preferences or research effects; RAG retrieves and projects source content subject to freshness and revocation. | [Memory](/en/articles/026-agent-memory-forget-durable-effects) · [RAG](/en/articles/027-rag-revocation-publish-replay) |
| **Evidence / Lineage** | Traceable relationships among source facts, calculations, and claims. A citation alone does not prove a conclusion. | [Evidence (Chinese original)](/articles/financial-agent-trustworthy-evidence-chain) |
| **Eval / Dogfood** | Task-specific quality checks, distinct from deterministic invariants and demonstrated user outcomes. | [Testing and evaluation](/en/articles/honest-agent-evaluation) |
| **Effect / unknown** | Known persistent effects and unknown status remain distinct; a sent request without a receipt is not proof it never ran. | [Principle three](/en/principles#principle-3) |

## External reference points

Owner, Publication, and Grant are **terms in this engineering discussion**; not all are standardized elsewhere. These resources help compare mechanisms, **not claim implementation equivalence**.

- [Official MCP specification](https://modelcontextprotocol.io/specification): tools, resources, and authorization concerns.
- [Anthropic · Building Effective Agents](https://www.anthropic.com/research/building-effective-agents): the trade-off between workflows and agents.
- [Temporal · Workflow Execution](https://docs.temporal.io/workflow-execution): a reference for durable workflows; this project does not implement Temporal.
- [ReAct paper](https://arxiv.org/abs/2210.03629): an early research framing for interleaving reasoning and actions.
- [W3C PROV Overview](https://www.w3.org/TR/prov-overview/): provenance concepts for entities and activities.

[Start with the six-layer map](/en/articles/017-prompt-to-answer-six-layer-panorama-v3) · [Runnable teaching project](https://github.com/hpoenixf/open-etf-agent) · [Article catalog](/en/catalog)
