---
title: "Models Understand; Code Authorizes"
description: "Why natural-language understanding cannot grant execution rights, and how capabilities, sources, PDF routes and citations retain independent checks."
---

# 011 Models Understand; Code Authorizes

> A self-contained article for engineers new to this system.
>
> In one sentence: **a model interprets the world; code decides what actions are allowed**.
>
> **October 11, 2026 revision:** Earlier statements about authorization and source verification have been corrected. This article is about admitting capabilities, **not granting investment execution rights**. Public citation gaps, private-resource authorization and answer quality are handled separately.

## 1. The Core Claim

Models are good at interpreting language. Understanding language is not authorization.

When a user says “buy a little,” the model may understand the approximate intention. It can propose an asset and an amount. Whether any trade may actually proceed, however, must be determined by independent identity, resource, confirmation and execution contracts. Research capability carries no implicit trading authority.

That is what the title means: **interpretation is flexible; authorization is strict**.

## 2. Why the Responsibilities Must Be Separated

Allowing the model itself to decide operations creates three types of drift:

1. **Policy drift:** Similar wording produces different execution behavior.
2. **Evidence drift:** The model fills gaps by inventing plausible material.
3. **Accountability drift:** After failure, nobody can locate the authoritative decision.

With a clean separation, the model proposes an interpretation; code admits or denies concrete actions using facts and rules.

## 3. The Retraction of the Old Intent v2 Design

An earlier, heavyweight intent proposal attempted to package interpretation, planning and execution inside a single intent object. **That version was withdrawn and is no longer the current standard.**

It gave too much decision-making weight to inferred language. New readers do not need to learn its fields or process. The surviving lesson is: **never drive real execution from an uncertain interpretation alone**.

## 4. Three Ideas Worth Preserving from the Old Design

The obsolete proposal was not entirely wrong. Three principles survived:

- Separate **speech acts** from **operations**.
- Do not launch evidence-producing searches against a guessed target.
- Admit capabilities by **intersection**, not by union.

Preserving these ideas does not mean that the old intent fields, object or fixed planning stages still execute. Their present meanings follow.

## 5. Separate Speech Acts from Operations

Each user utterance has two dimensions.

A **speech act** is what the user is doing conversationally: asking, confirming or chatting.

An **operation** is a system effect: retrieving data, proposing a recommendation or recording an execution.

A question is not an order; chat is not confirmation.

The model interprets the utterance and proposes an action. The Host checks the current admission rules and actual arguments. Code should not let a natural-language classifier manufacture permissions merely by labeling the user's intent.

~~~mermaid
flowchart TD
  U["User message"] --> M["Model proposes action"]
  M --> H["Host checks current scope"]
  H --> E["Authorized execution"]
  E --> P["Publish allowed result or limit output"]
~~~

Natural-language interpretation belongs to the model; operation admission belongs to code. The two should not be combined into one confidence score.

## 6. Clarification Must Not Turn a Guess into Evidence

When a user says “look at this” without identifying an object, the model should explain what is missing and ask for it. It must not guess a fund and then treat the real results of that query as evidence for the guessed target.

But clarification does not require **zero tool calls whenever some information is missing**. An authorized context may already identify the item, or a question may only need a general explanation. The model decides whether to read more or clarify based on the task. Code checks identities, scopes and parameters for each concrete tool.

A missing amount may block an amount calculation without blocking public-product documentation retrieval. Restrict the dependent action, not every independent branch of research.

## 7. Capability Intersection: Visible Tools Are Not Execution Rights

Three conditions differ: the model wants to invoke a tool, the system has registered it, and this user is currently authorized to use it.

The visible tool surface is narrowed per turn by Host admission, current package governance, network permissions, stage and budgets. Execution checks again. **Seeing a tool does not bypass a later denial.**

Conversely, an empty visible tool list does not imply “always clarify” or “always refuse.” General explanations may be answerable directly. Protected reads must respect the resource boundary. The model judges whether it has enough evidence; the system does not turn the capability catalog into an answer-quality score.

Approved research documents and personal portfolio holdings are different permissions. Denying a private portfolio read need not deny research documents within the authorized scope. Research-document access does not grant portfolio, confirmation or execution rights.

## 8. Runtime Facts and Answers: Fields Cannot Grant Permission

An older account used “capabilities, observations, gaps, answer blocks” to describe research. These are still useful reading perspectives, but they are **not a modern authorization token**, nor a mandatory four-stage process for every answer.

In the current Native Research loop, the model proposes tools; the Host owns admission and actual execution receipts; the Projector prepares material for the next turn; Publication handles send_answer_part and normal assistant prose. Observations and gaps explain what was obtained, but cannot create read or trade permissions.

A number having a citation also does not prove every conclusion about it. Controlled personal numerical authority comes only from authorized Portfolio results. A webpage or user message repeating the same number does not acquire Portfolio authority. Public sources whose verification is incomplete should be described with their limits, not expanded into a full semantic certificate for the answer.

~~~mermaid
flowchart TD
  M["Model proposal"] --> H["Host execution"]
  H --> R["Execution receipt"]
  R --> P["Projector prepares context"]
  P --> A["Model drafts answer"]
  A --> G["Publication checks"]
~~~

Each handoff retains its own facts. Successfully committing prose does not prove its semantic correctness or completion of every subsequent task.

## 9. Current Eligibility: Authorization, Freshness and Coverage Are Separate

Registering a capability does not mean it may be invoked at this moment. Current scope, revocation, remaining budget and service state may all reject a call.

After obtaining data, we still need to preserve time, source and coverage gaps. One success flag cannot express all these properties.

Earlier writing described a universal pre-approved trusted-root set, which could misleadingly suggest one system-wide allowlist for all public research. Actual governance must be interpreted for each resource and contract. Private material requires explicit permission; public sources require honest documentation of acquisition and eligibility. An authentic source can still fail to support the conclusion drawn from it.

Approval of one integration does not establish a global certificate for every source. Nor does one expired source automatically revoke all unrelated tool capabilities. Restrict the affected data or attachment and preserve other legitimately usable material.

## 10. Citation Checks: A Boolean Is Not Reliability

These are separate facts:

1. A source exists.
2. A page or passage was actually obtained.
3. The quoted source supports the particular claim.
4. The claim answers the user's question.

The older idea that a code-verified marker on each evidence block proves correctness is **not** a current system-wide contract. Similarly, sourceVerified in an evaluation cannot certify all research conclusions.

Publication currently handles missing, stale, malformed or over-capacity public citations by locally degrading the relevant citation attachment and presenting a Host explanation. Bad citations must not erase independent, authorized answer text. Revocation of protected sources still restricts the relevant effects; deleting a citation does not remove an underlying dependency.

Code enforces identity and authorization; semantic review assesses support for claims. See the [citation reliability essay](/articles/ai-citations-do-not-prove-reliability) and current publication rules.

## 11. Two PDF Routes Must Never Certify One Another

The system has two distinct PDF paths.

One imports **portfolio statements** to extract holdings and totals. Another reads **research documents** to retrieve pages and quotations.

Parsing a statement successfully does not prove research retrieval works. Finding a research excerpt does not prove ledger units are trustworthy.

Success on one route must not be promoted to success on the other.

~~~mermaid
flowchart TD
  S["Statement import"] --> L["Portfolio ledger"]
  R["Research PDF reading"] --> E["Research evidence"]
~~~

Separate states and labels prevent this tempting shortcut.

## 12. Pages and Excerpts: Existing Capabilities, Unverified Quality

The old manuscript broadly declared page and excerpt reading “unfinished.” That needs narrowing.

The document Reader already supplies locatable research material. Selected provider-free contracts for PDF page imagery were closed on **October 11, 2026**, but rendering remained disabled by default. Real visual quality and production enablement still required independent acceptance.

Receiving a page image does not prove the model consumed it. Receiving an excerpt does not prove that it supports an answer. Never invent a page number or present a model paraphrase as original text. Public citation gaps degrade the relevant attachments locally; private-source permissions do not loosen merely because some answer text can be shown.

Statement parsing and research reading still cannot certify each other.

## 13. Freshness and Trusted Portfolios

Freshness asks whether evidence is current. Portfolio trust asks whether the ledger is fit to support an action. Those are different questions.

Market prices may be ten minutes old, while a statement may be a month old. Fresh quotes do not make an outdated portfolio statement authoritative.

An amount-sensitive operation requires clearly identified units, NAV timestamps and eligible portfolio sources.

~~~json
{
  "freshness": "Temporal status of evidence, e.g. delayed quotes or NAV",
  "trustedPortfolio": "Whether the ledger is eligible as a basis for an operation",
  "rule": "Current quotes cannot compensate for an untrusted ledger",
  "failAction": "If the ledger is untrusted, discuss method rather than amounts"
}
~~~

## 14. Case One: Mistaking Casual Praise for an Order

A user says, “That fund looks good; maybe I could buy it.” The model can interpret the positive tone, but the speech act is casual discussion or a question, not an execution command.

An unsafe implementation interprets tone as confirmation or even a fill. The current approach offers analysis without advancing execution state. Only an explicit, authorized purchase instruction can reach the next gate.

## 15. Case Two: A Research Conclusion Without a Page Reference

A user asks what a report says. The system finds a relevant lead but has no authenticated excerpt or page number.

The obsolete approach lets the model expand that lead into a definitive claim. The safer approach marks the missing verification, provides only a lead-level response, and explains that the original passage and page are required to support a stronger conclusion.

This degradation protects the reader and the system.

## 16. Case Three: Using Successful Statement Parsing to Trust a Research Report

A portfolio statement is parsed successfully; all units reconcile.

Someone concludes that the research-report search feature must also work.

That is exactly the cross-route promotion we prohibit. The ledger branch passes; the research branch still has its own unresolved gaps.

One status record cannot rubber-stamp another.

## 17. Evolution Comparison

| Dimension | Obsolete approach | Current approach |
| --- | --- | --- |
| Intent | Heavyweight intent object drove execution | Withdrawn; not an authorization basis |
| Interpretation vs. authorization | Often mixed together | Speech acts and operations separated |
| Missing information | Guess, then search | Clarify only when needed; avoid fabricated targets |
| Capability selection | Use everything registered | Intersect request, Host permission and current admissible capability |
| Authorization | Model judgment | Concrete identity, resource, confirmation and execution contracts |
| Source trust | Model self-rating or universal trusted-root language | Specific resource eligibility and provenance, never blanket semantic certification |
| PDF reading | Two paths could be conflated | Statement and research routes cannot certify one another |
| Gaps | Silence or invented content | Disclose gaps and limit only dependent actions |

The original table's heavy intent terms and universal-source assumptions were historical simplifications. This revision states the current interpretation rather than reinstating obsolete gates.

## 18. What Must Survive After Old Designs Are Archived?

Three earlier essays may be archived, but four principles remain:

1. Separate operations from speech acts.
2. Do not search for guessed entities as if they were facts.
3. Admit capabilities by intersection, never by union.
4. Never use success in one PDF route as proof that the other succeeded.

Heavy Intent objects, obsolete fields and superseded workflows can be deleted. These principles should survive in admission checks and engineering judgment.

## 19. Evidence Boundaries of This Revision

| Subject | Basis checked | Supported claim | Unsupported inference |
| --- | --- | --- | --- |
| Visible tools | Current native-tool-surface.ts | MCP descriptors and Host admission jointly shape this turn's tools | Visibility implies execution or full end-to-end success |
| Publication | Accepted research-answer-publication rules | Local degradation of public citations; protected dependencies governed separately | Published prose is semantically correct |
| PDF page images | Selected archived provider-free verification | Local contract closed while default-off remains | Production enablement or live vision quality is proven |
| Two routes and private data | Current behavior and owner contracts | Research data cannot create portfolio or execution permission | Every statement or source in every environment is eligible |
| This review | Documentation, code and existing receipts | Corrected historical scope and dates | Fresh production tests or a measured model improvement |

Past principles, old approaches and historical tests cannot all be stamped “verified today.” Source authenticity, runtime completion, permission and answer quality remain independent judgments.

## 20. Three Sentences for New Readers

Models understand; only code can authorize.

When evidence is insufficient, safe degradation is a capability.

Success on separate paths must never certify each other.

## Evidence Sources

- Early intent understanding, dual PDF route guards and model-semantic discussions: evolutionary context only.
- The withdrawn heavy Intent proposal is superseded by this article's retraction.
- Current tool-surface implementation for visibility and admission.
- Research Runtime behavior for Evidence Workspace and personal data.
- Current publication rules and PDF page-imagery verification.
