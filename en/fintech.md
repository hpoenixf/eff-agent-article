---
title: Fintech × Agent · Trustworthy Financial Software Engineering
description: A cross-category reading map for business compliance, content trust, controlled effects, numeric accuracy, resilience, records, reviewability and third-party governance.
---

# Fintech × Agent: Security, Resilience, Control, Records and Auditability

<small>TRUSTWORTHY FINANCIAL SOFTWARE · October 22, 2026 · Cross-category topic, not a fourth canonical category</small>

Financial software needs more than a model producing a plausible answer. A portfolio study may access private holdings, read external material, calculate financial constraints, propose actions, save results and recover after disconnection or process failure. The system must answer **where data originated, who authorized its use, which effects occurred, what the user received, and what a reviewer can independently reconstruct**.

**Compliance is not security; security is not resilience; telemetry is not necessarily an audit record; and a model saying "approved" is not authorization.** These distinct concerns should not be collapsed into one global Safety Manager or one green test suite.

This curated map links existing articles without duplicating them or changing their single canonical classification. A35 Content Trust belongs in the financial reading path, but its provider-free structural tests do not establish resistance to real-model prompt injection. Links labelled **Chinese original** have no verified full English edition.

## Eight Engineering Concerns Worth Testing Separately

| Concern | The financial software question | Existing reading and the evidence boundary |
| --- | --- | --- |
| **Compliance and investor protection** | Are public education, personalized research, advice and execution different services with different responsibilities? | [Research, advice and trading](/en/articles/030-fintech-from-research-to-investment-advice); [Code authorizes actions](/en/articles/011-model-understands-code-authorizes). Design separation is **not** a license, suitability finding or legal compliance attestation. |
| **Content trust, security and privacy** | Can Web/PDF/MCP/Memory text forge instructions or consent? When may protected data be read or disclosed? | [A35: Prompt Injection and content trust](/en/articles/agent-content-trust-prompt-injection), [RAG revocation](/en/articles/027-rag-revocation-publish-replay), [Memory durable effects](/en/articles/026-agent-memory-forget-durable-effects). The RAG article includes historical architecture. **Real-model injection immunity and universal data-flow safety remain unproven.** |
| **Authorization and bounded control** | Does tool visibility mean permission? Does a proposal mean approval, execution or a committed transaction? | [Run grants](/en/articles/011-model-understands-code-authorizes), [Run termination and local rejection](/en/articles/agent-veto-authority-and-run-termination), [A34 Tool Surface](/en/articles/agent-model-capability-presentation-tool-surface). Original effect owners retain authorization; there is **no new global veto**. |
| **Data accuracy and reproducibility** | Are currency, units, fees, timestamps, coverage and source limitations faithfully preserved and used? | [Financial numbers](/en/articles/031-fintech-data-time-and-reproducible-numbers), [Python results consumption](/en/articles/financial-agent-python-result-consumption), [Financial evidence chain](/articles/financial-agent-trustworthy-evidence-chain) (**Chinese original**), [Portfolio MCP](/articles/portfolio-mcp-readonly-investment-data) (**Chinese original**). Correct arithmetic is not an investment-quality certificate. |
| **Reliability, resilience and delivery** | What happens after tool timeouts, model outages, browser disconnects or database restarts? | [Publication](/articles/019-agent-answer-publication) (**Chinese original**), [Async delivery deadlines](/en/articles/agent-asynchronous-research-time-bound-delivery), [Controlled refresh](/en/articles/unavailable-is-correct), [Budgets and recovery](/en/articles/agent-veto-authority-and-run-termination). Scoped tests are not production SLAs or disaster-recovery exercises. |
| **Records and traceability** | Which request, source version, tool dispatch, effect, answer revision and delivery event actually happened? | [Langfuse observability](/en/articles/025-agent-langfuse-from-trace-to-trustworthy-observability), [Tool-to-model input tracing](/en/articles/agent-tool-lifecycle-and-model-input), [Publication revisions](/articles/019-agent-answer-publication) (**Chinese original**). A trace is **not** necessarily an immutable, retained regulatory audit ledger. |
| **Reviewability, explanation and correction** | Can a reviewer reconstruct evidence, assumptions, user revisions, model proposals and actual effects, including the version delivered to the user? | [Investment Thesis history](/en/articles/agent-weekly-thesis-history-continuous-research), [Honest evaluations](/en/articles/honest-agent-evaluation), [Financial evidence chain](/articles/financial-agent-trustworthy-evidence-chain) (**Chinese original**). Engineering traceability does not expose hidden model reasoning or establish investment value. |
| **Third-party dependencies and change** | What happens when providers, MCP data sources, plugins or routes change or fail? | [MCP Host](/en/articles/mcp-host-from-discovery-to-consumption), [Market-data MCP responsibilities](/en/articles/mcp-market-responsibility-retrospective), [Extension Host](/en/articles/020-agent-extension-host-smartphone), [Multi-ecosystem Hooks](/en/articles/agent-multi-ecosystem-hook-execution). Interface controls are not vendor due diligence or outsourcing exit verification. |

## Three Short Reading Routes

**Security and compliance:** [Research-to-trading boundaries](/en/articles/030-fintech-from-research-to-investment-advice) → [A35 instruction identity](/en/articles/agent-content-trust-prompt-injection) → [RAG access and disclosure](/en/articles/027-rag-revocation-publish-replay) → [Action authorization](/en/articles/011-model-understands-code-authorizes).

**Resilience and control:** [Run termination](/en/articles/agent-veto-authority-and-run-termination) → [Publication](/articles/019-agent-answer-publication) (**Chinese original**) → [Time-bound research delivery](/en/articles/agent-asynchronous-research-time-bound-delivery) → [Trustworthy observability](/en/articles/025-agent-langfuse-from-trace-to-trustworthy-observability).

**Reviewable investment research:** [Portfolio facts](/articles/portfolio-mcp-readonly-investment-data) (**Chinese original**) → [Financial calculations](/en/articles/031-fintech-data-time-and-reproducible-numbers) → [Result consumption](/en/articles/financial-agent-python-result-consumption) → [Investment Thesis history](/en/articles/agent-weekly-thesis-history-continuous-research) → [Evaluation of delivered answers](/en/articles/honest-agent-evaluation).

## Regulations and Frameworks: Establish Applicability First

These are **official reference points**, not universal obligations or a statement that ETF Agent is compliant:

- **Mainland Chinese securities and fund institutions:** the CSRC's [IT Administration Measures](https://www.csrc.gov.cn/csrc/c106256/c1653896/content.shtml) (issued 2018, amended 2021) address governance, permissions, security, audits, continuity and service providers for specified activities and entities.
- **European financial entities:** ESMA's [DORA overview](https://www.esma.europa.eu/esmas-activities/digital-finance-and-innovation/digital-operational-resilience-act-dora) states that it applies from January 17, 2025, focusing on ICT and third-party risk.
- **Banks:** the Basel Committee's [operational resilience principles](https://www.bis.org/committees/bcbs/basel-consolidated-guidelines/module/orr/20) address critical operations, continuity exercises, dependencies, incidents and recovery. They are not automatically binding on every research tool.
- **Cross-industry security and AI governance:** NIST [CSF 2.0](https://www.nist.gov/cyberframework/faqs) uses Govern, Identify, Protect, Detect, Respond and Recover; [AI RMF 1.0](https://airc.nist.gov/airmf-resources/airmf/5-sec-core/) uses Govern, Map, Measure and Manage. These are frameworks, not certificates.
- **Capital markets AI risk:** IOSCO's [Artificial Intelligence in Capital Markets (2025)](https://www.iosco.org/library/pubdocs/pdf/IOSCOPD788.pdf) is a useful industry reference for model, data, customer communication and third-party risk. Specific duties depend on applicable regulation.

## What Should We Build or Verify Next?

These are **candidates for independent engineering evidence**, not features already implemented or committed roadmap promises.

| Priority | Smallest meaningful proof | Unresolved gap |
| --- | --- | --- |
| **P0: Read-only task review package** | Let an authorized reviewer reconstruct one real or synthetic task from original Run grants, source/result references, tool proposals/dispatches/effects, answer revisions and delivery/recovery receipts. Keep missing facts explicitly unknown. | Existing sources have distinct owners; the full lawful review path has not been demonstrated. **Do not build a duplicate Audit Manager or authoritative ledger.** |
| **P0: A35 live adversarial evaluation** | Use the existing evaluation path to test authority forgery, fake consent and exfiltration prompts in Web/PDF/MCP, Child, summaries and Memory. Include legitimate reports, quoted attack examples and PDF image use as allow controls. | A35 has structural and local-effect evidence, **not** measured real-model attack-success or false-rejection rates. |
| **P1: Third-party data flows and exit tests** | Map sensitive data classes, provider routes, transmitted data, logging and retention expectations, and test fallback or provider changes with synthetic inputs. | Integrated tools and plugins do not establish privacy-purpose limitations, supplier diligence or viable exit. |
| **P1: Resilience and delivery drills** | Exercise process termination, unavailable databases, tool timeouts and committed-but-undelivered results through original owners; only report recovery objectives after measurement. | A single cold recovery and scoped checks do not demonstrate production RTO/RPO or sustained availability. |
| **P1: Independent financial research quality assessment** | Use an approved synthetic or public portfolio to evaluate coverage, dates, fees, risk scenarios, counterarguments, advice boundaries and delivered outcomes. | Correct numbers and published reports have not yet proved user decision benefit. |

One future **acceptance scenario** could bring these together: a user requests portfolio-risk research; an external document forges trading consent; the agent continues valid analysis but cannot execute an ungranted action; an interruption recovers correctly or records unknown state; and an authorized reviewer reconstructs the task from original receipts. This is a proposed scenario, **not an experiment already run**.

## Boundaries and Navigation

This is an engineering map, **not** legal advice, an investment recommendation, operating authorization or a security qualification. Recordkeeping requirements depend on the entity, jurisdiction, retention, access, integrity and audit independence. A35 remains a [module deep dive](/en/modules); its presence here is a cross-category link.

[Writing and evidence roadmap](/en/roadmap) · [Architecture](/en/thinking) · [Engineering Practice](/en/engineering) · [Star the public collection](https://github.com/hpoenixf/eff-agent-article)
