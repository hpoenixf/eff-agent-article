---
title: "Why an Agent Needs Brakes Before Intelligence"
description: "A practical introduction to evidence, portfolio ledgers, model responsibilities and the difference between confirmation and execution."
---

# 010 Why an Agent Must Have Brakes Before It Gets Smarter

> Written for engineers who are unfamiliar with this project.
> The central question is why a small assistant grows into a system of evidence, ledgers, models and execution boundaries.
> The background comes from an early week of experiments, but this article stands on its own.

> **October 11, 2026 clarification:** The scenarios below are teaching examples, **not reports of real trading incidents**. The four kinds of material and levels L1–L3 are explanatory perspectives, not a fixed authorization state machine in the current Runtime.

## 1. The Starting Point: One Very Small Wish

The initial wish was simple: look at an index each day and decide whether to invest regularly.

The input would be market prices; the output, a sentence: buy or do not buy.

That sounds like a script.

It quickly raises several engineering questions, however. A recommendation may rely on stale information; a portfolio valuation may disagree with ledger accounting; and a single sentence from the model may be mistaken for confirmation to execute an order. The educational cases below show why these responsibilities should be separated, without pretending they all happened in one real trading incident.

## 2. Four Ways a Small System Gets Bigger

A small system tends to grow along four dimensions.

**Evidence:** Where did a recommendation come from, and can someone check it?

**Ledger:** What amounts and units really exist, and who has authority to say so?

**Model:** The model interprets; it does not make final authorization decisions.

**Boundaries:** What is permitted, and where must the system stop?

Ledger rules, authorization and confirmation can all be evaluated against these four questions. Without one of them, the answer may become impossible to reproduce, or analysis may be mistaken for execution.

## 3. How to Read the Historical Story

The early account mentioned a substantial amount of experimentation. Read that as historical narrative and an illustrative evidence window, **not as a performance guarantee**.

Do not repeat rough historical quantities as factual commitments.

What survives is one principle:

> An intelligent recommendation that cannot be reproduced has no practical value in investing.

## 4. Four Kinds of Material: What Makes an Answer Traceable?

Capabilities, actual outcomes, gaps, and the published answer are four useful perspectives on a research run. They need not be one fixed object that the model maintains on every turn; populating all four fields does not prove an answer is correct.

The current Native loop lets the model propose tool actions. The Host owns actual dispatches and receipts. The Projector arranges the material made available to the current turn. Publication owns the answer content. Research records support traceability; identity, resource scope and current governance still determine permission.

~~~mermaid
flowchart TD
  M["Model proposes a tool call"] --> H["Host executes the admitted action"]
  H --> R["Record receipts and gaps"]
  R --> P["Projector prepares context"]
  P --> A["Model submits an answer"]
  A --> D["Publish and deliver"]
~~~

## 5. Traceability Is Not Proof That a Model's Reasoning Is Correct

Knowing which material entered which model request helps diagnose failures. It does not prove the inference itself. Numbers, time periods and sources must be checkable; unknown outcomes must not be reported as successful; semantic quality still needs independent review.

Public citation gaps are handled locally according to the current publication contract, while revocation of protected material constrains effects that depend on it. “Some evidence is missing” must not erase independently authorized content, just as fluent prose must not bypass authorization.

## 6. Four Questions to Use When Relevant, Not a Mandatory Checklist

Portfolio research may involve market conditions, the user's holdings, action constraints and evidence coverage. But explaining what an index is does not require fetching personal positions; defining an industry does not require answering how much the user can buy.

The four questions are prompts for research method, **not four compulsory Runtime stages**. The model chooses methods based on the task; program code checks the actual actions and permissions. Tool success, answer submission and delivery to the user produce different records and cannot be collapsed into one overall “success.”

## 7. Units Times NAV: A Fundamental Ledger Truth

A portfolio ledger has a strict rule: **units held are the underlying fact; a monetary amount is derived**.

Holding value equals units multiplied by the current net asset value. Never infer units by dividing an old value amount by a new NAV. Distributions, splits and reporting delays would contaminate the ledger.

This sounds mundane, but accurate holdings are the starting point for trustworthy subsequent analysis. A single erroneous ledger digit can invalidate later recommendations.

~~~json
{
  "holdingTruth": {
    "shares": 1000,
    "currentNav": 1.234,
    "holdingValue": 1234.0,
    "formula": "holdingValue = shares * currentNav"
  },
  "forbidden": "shares != staleAmount / newNav",
  "reason": "Distributions, splits and delayed NAV updates invalidate reverse inference"
}
~~~

## 8. Confirmation Is Not Execution: Two Gates

The system distinguishes two actions: **confirmation** and **execution**.

Confirmation means the user agrees with a proposed direction. Execution means the system records that an authorized operation actually took place.

Confirmation must not change the portfolio ledger. Even an explicit instruction to execute requires the identity, authorization and confirmation contracts of the relevant execution path. Agreeing with research, accepting an explanation, or publishing an answer does not automatically alter financial records.

This prevents a conversation from silently turning into a transaction.

~~~mermaid
flowchart TD
  Start["Start"] --> Proposed["Proposal created"]
  Proposed --> Confirmed["User confirms"]
  Confirmed --> Executed["Explicit authorized execution"]
  Proposed --> Proposed
  Confirmed --> Proposed
~~~

**Transitions and conditions:**

- **Start → Proposed:** The system creates a proposal.
- **Proposed → Confirmed:** The user explicitly agrees.
- **Confirmed → Executed:** The user issues an execution instruction through the proper authorized process.
- **Proposed → Proposed:** A follow-up question does not advance state.
- **Confirmed → Proposed:** New evidence invalidates the previous proposal.

The chart is a conceptual teaching model, **not evidence that a live trading path has been implemented**.

## 9. Three Levels: L1, L2 and L3

> These L1–L3 terms mean facts, inference and action. They are different from test-environment levels sometimes named L0–L3.

The levels illustrate progressively stronger responsibilities. They do **not** mean that the implementation can certify facts, reasoning or executable actions merely by applying three labels.

**L1 — facts:** Did we obtain the appropriate market data, holdings and applicable rules?

**L2 — inference:** Which conclusions, if any, follow from those facts?

**L3 — action:** Is an executable action permitted?

Each has different conditions. Missing a critical source should restrict conclusions or actions *dependent on that source* while leaving independent, authorized explanations available. Whether an inference is convincing is a semantic judgment; code governs concrete permissions, source dependencies and effects.

The following is an educational checklist rather than a current production protocol:

~~~json
{
  "L1_fact": {
    "question": "Do we have sufficient eligible evidence?",
    "failAction": "State the gap and avoid dependent inference"
  },
  "L2_inference": {
    "question": "Is the inference adequately supported?",
    "failAction": "Present checkable facts without an unsupported conclusion"
  },
  "L3_action": {
    "question": "May this operation be executed?",
    "failAction": "Give analysis only; do not perform the action"
  }
}
~~~

## 10. Teaching Case One: Buy or Wait When Prices Are Missing?

Imagine that a market-data endpoint times out and the current market state cannot be retrieved.

A bad approach fills the gap with an approximate number recalled by the model. A better approach explicitly reports missing data, says that a current decision cannot be supported and refrains from giving a purchase amount.

The first answer looks complete but is false. The second is incomplete but honest.

In this case, honesty is more valuable than apparent completeness.

## 11. Teaching Case Two: The Temptation to Reverse-Engineer Units from Delayed NAV

Cross-border funds frequently have NAV reports lagging by a day.

A flawed method takes yesterday's amount and divides it by today's estimate to reconstruct units. The resulting holdings fluctuate inexplicably and no longer match the brokerage statement.

The correct method keeps unit holdings unchanged, updates the NAV timestamp separately, marks the lag, and reduces the confidence or scope of dependent conclusions.

The underlying formula matters more than neat-looking numbers. A ledger should acknowledge latency rather than invent precision.

## 12. Teaching Case Three: Is “Sounds Like I Could Buy” an Order?

The user says, “That sounds like something I could buy.”

This is not a completed purchase. It might not even be an unambiguous confirmation; it may be ordinary conversation.

A clear, authorized execution instruction is required before any execution effect occurs. A poor implementation guesses intent from tone and confuses recommendations with fills. A safer design preserves the state separation and clarifies where necessary.

One additional question is preferable to recording a transaction without authorization.

## 13. What This Review Actually Checked

| Subject | Checkable basis | What it does not establish |
| --- | --- | --- |
| Holdings and reports | Atomic portfolio-report rules and ledger invariants | That any historical amount can reconstruct current units |
| Tools and execution | Current available tool surface | That a visible tool has already executed, or that trading was approved |
| Publication and delivery | Publication contract | That permission to publish proves correctness or actual user delivery |
| Teaching cases | Explicitly constructed examples of faults and responsibilities | Actual incidents, production statistics or new passing tests |

The review examined documentation, then-current implementation and existing evidence. It did **not** rerun production tests or measure overall success rates, costs or investment returns.

## 14. What Should Survive When an Old Design Is Deleted?

Earlier writing emphasized how hard the model worked. The current approach keeps three transferable lessons and allows much of the original narrative to be archived:

1. **Reproducibility matters more than cleverness.**
2. **Ledger arithmetic is not negotiable.**
3. **Stopping can be a correct answer.**

Historical emotions, rough scales and procedural details may be archived, but these three principles should remain visible in implementation and checks.

That is how deleting an obsolete account need not erase its useful knowledge.

## 15. Three Sentences for a New Reader

Build brakes before optimizing intelligence.

When evidence is unavailable, honesty matters more than a complete-sounding answer.

The ledger and execution boundary are an agent's lifelines.

## Evidence Sources

- The first-week story: background and illustrative evidence window only, not a performance guarantee.
- Then-current tool surface and publication contract.
- Existing invariants for units × NAV, confirmation versus execution, and the three-level explanatory model.
