---
title: "Models Understand; Code Authorizes"
description: "Run-scoped authorization: how Host grants constrain tools and sources through Child delegation, suspension, recovery, and new Run admission."
readingBrief:
  takeaways:
    - "The model proposes research and actions; the Host records source, tool, and capability grants for a particular Run. Tool visibility or prior exposure does not create permission."
    - "A Child receives only an admitted subset of its parent grant; suspension and cold recovery retain the original grant, additions require explicit admission, and a new Run cannot inherit old receipts."
    - "Permission, resource availability, budgets, cancellation, and execution receipts are separate facts; one unavailable source must not be mistaken for revoked authorization or erase independent published content."
    - "Ledger holdings, plan confirmation, and actual execution remain independently authoritative; valid citations neither certify model conclusions nor authorize trades."
  appliesTo:
    - "Engineers designing scoped authorization for long-running agents, specialist Children, or cross-process recovery."
    - "Developers separating model interpretation, investment facts, confirmation, and execution effects in fund-research systems."
  notFor:
    - "Not a live revocation mechanism, trading implementation, or comprehensive production security certification. The public teaching project does not reproduce the complete private Host authorization system."
---

# 011 Models Understand; Code Authorizes

A user says, “That fund looks good; I could buy a little.” The model may understand the user's interest and propose a research direction. The sentence does not establish how much money is in the account, or prove that a trade has happened.

An investment research assistant handles three different activities: interpreting the user, developing an analysis, and producing controlled effects. The model can explain a question, choose research methods and propose actions. The system must use real identity, granted scope and execution records to determine whether a concrete action is allowed and whether it actually occurred.

That is the useful meaning of “build brakes first”: **keep permissions and ledger facts where they can be checked, while letting the model research freely within its granted scope.** It does not require every answer to pass through a fixed checklist, or imply that code can determine whether every sentence is correct.

Run authorization connects research, Child delegation and recovery below; ledger and confirmation examples explain the facts it cannot replace. These are teaching scenarios, not real trading incidents. Research capability does not establish an enabled live trading channel.

## 1. Interpretation Can Produce a Proposal, Not Permission

The current starting point is a concrete action, not a planning object that grants permission once interpretation looks correct. The withdrawn Intent v2 proposal combined intent, plans and execution arrangements. Its useful lesson remains: a richer model description cannot grant broader access, and its old fields and fixed workflow are not today's authority.

“The user seems to want to buy,” “this material looks public,” and “the model thinks the evidence is sufficient” are interpretations or judgments. They can influence a research route, but cannot replace account identity, resource scope, tool admission or an actual execution receipt. Passing a schema check does not turn a structured field into an authorization mechanism.

The system therefore checks **the concrete action proposed by the model**: which resource it would read, which tool it would call, which account it would affect, and whether it fits the granted scope. Code does not need to classify the user's prose as “safe,” “confirmed” or “investment advice” and then manufacture permission from that label.

![The proposed action is checked against the recorded grant, then denied or executed](../../visuals/reading-guides/authority-en.svg)

Actions outside granted scope are denied before dispatch. An admitted action can still fail during execution, and its receipt must preserve the actual outcome. The model can interpret success or failure; answer delivery has its own records. No stage can announce that a later stage succeeded on its behalf.

<span id="a-grant-is-a-recoverable-run-fact-not-a-question-asked-on-every-turn"></span>
<span id="keep-authorization-capacity-and-outcomes-with-their-own-owners"></span>

## 2. Authorization Follows a Run; Execution Conditions Remain Separate

A Run is one logical research execution, not a browser connection or process. At admission, Host records source, tool and capability scope on the original Run. Subsequent reads, analysis, publication and permitted suspension/recovery use that durable grant. Exposure separately records what a model request actually received: **seeing data does not grant permission, and permission does not depend on seeing it first.**

Consider two permitted fund reports. Main delegates one to a Child whose admitted scope is sealed as a subset of the parent grant. If the Child proposes an ungranted private portfolio, Host denies that action; sharing a conversation cannot supply permission. Explicit additional grants can extend scope without replacing or shrinking earlier grants.

~~~mermaid
flowchart TD
    A[Host records a grant for this Run] --> B{Action within recorded grant?}
    B -- No --> X[Deny this action only]
    B -- Yes --> C[Execute admitted tool or read]
    C --> D{Delegate to a Child?}
    D -- Yes --> E[Seal a restricted parent-grant subset]
    D -- No --> F[Preserve result and source identity]
    E --> F
    F --> G{Same Run suspended or recovered?}
    G -- Yes --> H[Restore original grant and receipts]
    G -- No --> I[Continue research and separate publication]
    H --> I
~~~

This isolates authorization handoff, not the whole execution state machine. Child dispatch, handoff and recovery reuse the recorded subset. A proposed new source does not enlarge it. Waiting for a user, changing workers or waking parked work does not itself justify a current-ACL query.

This is a teaching record, not the database schema:

~~~json
{
  "runId": "run-demo-17",
  "scopeId": "demo",
  "grantedSources": ["fund-report-A"],
  "grantedTools": ["read-document"],
  "childSources": ["fund-report-A"],
  "requestedSource": "private-portfolio-B",
  "decision": "deny-this-read"
}
~~~

Changes to external roles or permission tables do not revoke an existing same-Run grant. Account, scope, Run and source identity must still match. A new Run obtains its own admission rather than borrowing authority from cached bytes, exposure history or old receipts.

| Changed condition | Required handling |
| --- | --- |
| The same Run resumes after suspension | Restore the original grant and execution records without querying current ACLs again |
| A request targets a resource outside the original grant | Use the existing additional-admission path; a model declaration cannot expand permission |
| A new Run wants material read previously | Obtain that new Run's own grant; past exposure cannot substitute for it |
| A file is missing, content identity differs, or computation fails | Report the availability or execution problem rather than relabeling it as revoked permission |
| Budget is exhausted or the user cancels | The relevant lifecycle rules constrain subsequent effects without inventing success |

Recoverable authorization does not mean every interrupted execution can resume. Only control wakes accepted by the original recovery contract may continue through the original checkpoint and fence; ordinary abandoned-Root re-entry may only settle and return saved results. A missing or corrupted old grant cannot be reconstructed by guessing from today's ACL. The promise is **original authority along a permitted recovery path**, not universal replay.

Registered, model-visible, granted, dispatched and successful are five distinct facts. Phase and resources can narrow tools, and visibility does not reserve the next unit of capacity. Budgets and cancellation limit effects without rewriting grants. Missing bytes, changed hashes and computation failures retain their own outcomes instead of becoming blanket revocation that clears independent valid material.

### Why use a Run grant rather than query current permissions every time?

Per-use permission queries are a reasonable alternative when later access should promptly reflect administrative changes. An application using [OpenFGA Check](https://openfga.dev/docs/interacting/consistency), for example, can bypass caches and query the database. That trades freshness against query cost; it does not by itself prove an in-flight external effect was revoked.

Our earlier system simultaneously depended on initial grants, exposed sources and current permissions. Recovery, Memory, Children, waiting and publication accumulated separate queries, pruning and compensation. The October 15 decision fixed authorization lifetime to the logical Run, reused its persistent owner and separated permitted scope from actual execution facts. It did not preserve the same repeated queries behind renamed helpers.

The cost is no immediate dynamic revocation within that Run. A product requiring administrator revocation to block all later protected operations should choose a corresponding access-check and execution-stop contract rather than copy this policy unchanged. Explicit Stop, resource limits and terminal state still apply, but they are not a revocation service and cannot erase reads or sends that already occurred.

## 3. Missing Information Restricts the Actions That Depend on It

If the user says “look at this” and the available context does not identify an object, the model should explain what is missing and ask. It must not guess a fund and then use real query results to substantiate the guess.

But “clarification needed” does not mean “zero tool calls everywhere.” Authorized material may already identify the object, or the question may require only a general explanation. A missing purchase amount can prevent an amount calculation without preventing access to public product documentation.

Whether to read more, explain first or ask is a task-dependent model judgment. Code checks the resource, identity and arguments of the concrete call. Restrict the affected action while allowing independent research to continue.

Personal holdings and research documents also require distinct permissions. A user denying access to a private portfolio does not automatically prohibit access to already-authorized research material. Permission to read a report does not grant access to accounts, plan confirmation or trade execution. Capability intersection means an action must meet all applicable objective constraints; it does not mean the model maintains an object whose completed fields automatically admit the action.

## 4. Units Times NAV: Analysis Must Not Rewrite the Ledger

One concrete ledger rule matters more than a general reliability slogan: **units held are a portfolio fact; a monetary value is derived from those units and the corresponding NAV.**

The following data is a synthetic teaching example:

```json
{
  "holdingTruth": {
    "shares": 1000,
    "currentNav": 1.234,
    "holdingValue": 1234.0,
    "formula": "holdingValue = shares * currentNav"
  },
  "forbidden": "shares != staleAmount / newNav"
}
```

Suppose the account still holds 1,000 units. When a new NAV arrives, the system can recompute the holding value. It must not divide an old monetary value by that new NAV to infer a different unit balance. Distributions, splits or changes in reporting dates can invalidate that reverse calculation. An actual change in units requires its own ledger basis.

Now suppose a cross-border fund's NAV report is delayed. The appropriate response is to preserve known units, record the NAV date and describe valuation limits, rather than make units fluctuate with each daily estimate. Fresh market prices cannot automatically update a month-old account snapshot either.

Freshness, account identity and calculation basis must therefore remain explicit. Missing data may still allow an explanation of the method or a clearly labeled hypothetical scenario. It does not justify presenting assumed amounts as current account facts, or granting investment execution authority from them.

## 5. Confirming a Plan, Instructing Execution and Observing Execution Are Different

“That looks good; I could buy it” might be an evaluation or an invitation to discuss further. Positive wording alone cannot advance an account's execution state.

Even when the user clearly agrees to a plan, **agreement does not mean a trade occurred**. An explicit execution instruction is still only a prerequisite. Whether dispatch was permitted and execution completed requires records from the relevant execution path. A research system cannot substitute its own published prose for those facts.

| Established fact | What may be recorded | What it does not establish |
| --- | --- | --- |
| The model proposes an allocation direction | A proposal for discussion or a hypothetical scenario | Current holdings have changed |
| The user confirms a plan | The user's confirmation of that plan | A trade was submitted or filled |
| The user issues an explicit execution instruction | A request to process under the identity, permission and confirmation contract | Execution will necessarily succeed |
| The execution path obtains an actual receipt | The operation and status established by that receipt | Fills, returns or other effects beyond its evidence |

Unconfirmed suggestions must not alter portfolio estimates. Hypothetical scenarios discussed in conversation must remain separate from account facts. The table explains different facts; it is not a four-label state machine that can execute trades, or proof that the read-only research path discussed here has order-placement capability.

Clarify when necessary, focusing on missing execution conditions. The system should neither trade automatically based on tone nor require trade confirmation merely to inspect ordinary information.

## 6. Source Identity and Citations Do Not Substitute for Answer Quality

In the research loop, the model proposes tool actions, the Host records actual calls and results, the context layer prepares material for the next turn, and Publication accepts ordinary assistant prose and explicitly submitted answers. These handoff records support traceability. They do not establish correct understanding.

Controlled personal numeric bindings can originate only from authorized Portfolio results. An identical number on a webpage, in a user message or in the model's self-assessment does not acquire personal ledger authority. The model can discuss user-provided numbers while retaining that identity; it cannot turn them into Host-verified account fields.

Likewise, source existence, obtaining an exact passage, that passage supporting a claim, and that claim answering the question are different properties. No universal “trusted root” or `sourceVerified=true` can certify all research conclusions.

Missing public citations, malformed references or insufficient attachment capacity are handled locally under the publication contract, preserving independently authorized prose with a source limitation notice. A private source absent from the original Run grant is a real permission issue. Removing its citation marker cannot erase the underlying dependency. **The same Run and its recovery use the original grant; this does not reintroduce permission revocation during the Run.**

For example, when only a search lead has been obtained for a report, the answer can describe that lead or continue reading within granted scope. It must not invent quotations or page numbers. Missing page numbers should not become a blanket reason to reject an entire answer, either. Whether a particular conclusion is supported still depends on the material actually available.

The [Publication article](/en/articles/019-agent-answer-publication) explains delivery mechanisms, while the [citation reliability article](/en/articles/ai-citations-do-not-prove-reliability) covers the relationship between claims and sources. This article focuses on their authorization handoff.

## 7. Two PDF Routes Cannot Certify Each Other

The same distinction applies to document reading. Statement import and research PDF reading serve different consumers:

| Route | Principal output | What success does not establish |
| --- | --- | --- |
| Statement import | Units, amounts and records for ledger reconciliation | Research retrieval or page-image understanding is working |
| Research PDF reading | Passages, quotations, tables or page images as research material | Statement units are trustworthy, the account is authorized, or the research conclusion is correct |

In a teaching scenario, every unit in a statement could reconcile without establishing that a separate research report was retrieved correctly. Each route retains its own results and gaps instead of borrowing the other's passing status.

PDF page-image reading is a controlled feature disabled by default. A functioning local interface does not establish visual understanding quality or production readiness. The [PDF article](/en/articles/024-agent-pdf-from-text-to-evidence) covers the reading mechanisms.

<span id="_8-the-judgments-retained-after-consolidation"></span>

## 8. Choose Authorization Lifetime According to Required Permission Changes

| Question | Judgment used in this article |
| --- | --- |
| Does understanding the user permit execution? | Interpretation produces a proposal; identity, the Run grant and the execution contract govern concrete actions |
| Does missing information stop everything? | Do not fabricate a target as evidence; restrict dependent actions while preserving independent work |
| Does every call query current permissions again? | Check the original Run's granted scope; the same Run and recovery do not repeat current-ACL queries, while a new Run has independent admission |
| Do complete fields and citations prove correctness? | Assess structure, source identity, semantic support and delivery separately |
| Can a confirmed plan be recorded as executed? | Preserve confirmation, instruction and execution receipts separately; hypothetical scenarios do not rewrite account facts |
| Can one document route certify another? | Each retains its own evidence scope; success is not promoted across routes |

Before adopting this policy, decide whether external permission changes must alter running work and whether recovery must retain its original grant. Those requirements determine authorization lifetime; the presence of a snapshot is not a reason to trust it forever. Here the lifetime is limited to the original logical Run, does not cross accounts or new Runs, and supplies no trading execution capability.

The model can keep adapting its research route. The system needs stable records of what it was permitted to do, what it actually did, and which effects have not occurred. Keeping those facts separate makes each operation explainable as capabilities expand.
