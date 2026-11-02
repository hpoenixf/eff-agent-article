---
title: "Deterministic Fund Allocation: From Holdings to Reproducible Amount Advice"
description: "A synthetic fund-allocation example traces ledger holdings, deployable budgets, asset buckets, fund caps, stale evidence, and explicitly unallocated cash."
readingBrief:
  takeaways:
    - "Amount advice must separate recorded shares, settled changes, valuations, and scenarios. Stale values cannot determine new shares, and simulated purchases never change ledger holdings."
    - "Budgets, asset buckets, and fund-level allocations each impose constraints; when caps, no-buy rules, or unsuitable evidence apply, residual cash must be explicitly unallocated."
    - "Portfolio-wide evidence coverage cannot certify every fund. Withdrawing an amount from one fund does not erase historical facts or stop independent general research."
    - "The deterministic investment calculation module owns domain calculations and advice eligibility, not ledger writes, user confirmation, live trades, or report publication; model prose cannot substitute for those facts."
  appliesTo:
    - "Engineers building fund contribution or rebalancing scenarios that require auditable per-fund constraints, cash reconciliation, and source identity."
    - "Agent developers designing deterministic financial tools with explicit partial availability rather than fabricated amounts."
  notFor:
    - "Not current-market purchase advice or live order execution. The public Open ETF Agent teaching repository does not implement this complete private fund allocation system."
---

# Deterministic Fund Allocation: From Holdings to Reproducible Amount Advice

Imagine a fund contribution plan that says, “Invest CNY 300 today.” Before proceeding, one fund becomes unavailable for new purchases, and another reaches its daily cap. What now? Splitting the full amount across the remaining funds looks convenient, but it may violate the original asset-bucket policy. Forcing all CNY 300 into purchases may also draw from cash that should remain protected.

**The hard part of amount advice is not only accurate arithmetic. It is accounting for every unit of money using eligible facts and constraints that still hold.** Sometimes the correct answer is to leave money unallocated rather than artificially complete a total.

This is the problem addressed by the **deterministic investment calculation** responsibility in ETF Agent. It consumes ledger and source facts, applies defined budgets and risk rules, and returns read-only allocations, eligibility, and gaps. All funds, amounts, and policies below are **synthetic teaching examples**; they are neither actual holdings, executed trades, nor current investment recommendations.

## 1. Which Money Are We Calculating?

“Holding 1,000 shares now” and “having a current value of CNY 1,230” are different claims. The former comes from an account snapshot plus supported settled changes. The latter requires matching those shares to an applicable NAV as of a particular date. A delayed NAV weakens the timeliness of a value estimate; it does not change the recorded number of shares.

A deterministic calculation entry point should keep at least these inputs separate:

| Input | What it determines | What it cannot establish |
| --- | --- | --- |
| Account snapshot and settled changes | Confirmed shares and the baseline time | That a trade occurred because the price changed |
| NAV and market evidence | Valuation, dates, coverage, and per-fund amount eligibility | That public prices are private account facts |
| Confirmed policy and allocation ranges | Bucket targets, risk ranges, and permitted operations | That model enthusiasm constitutes user confirmation |
| Cash, reserves, and unsettled activity | What part of the budget may enter this scenario | That all cash is immediately available for buying |
| Fund and channel restrictions | No-buy status, order/day caps, and amount steps | That a shortfall can be silently filled |

An unsettled transaction may constrain available cash, but it does not increase confirmed shares until settlement is recorded. Simulated purchases cannot be presented as completed trades. Investment fact readers and the ledger own the identity of these inputs; the investment calculation module consumes them without changing the underlying ledger.

## 2. Budget, Bucket, and Fund Are Three Separate Decisions

First decide **how much is deployable**. Then choose **which asset buckets receive that budget**. Only then decide **which funds within each bucket qualify for an amount**. These are three distinct decisions; none may override the others.

~~~mermaid
flowchart TD
    A[Read identified holdings and policy] --> B{Current amount evidence usable?}
    B -- No --> X[Keep historical facts Mark amount gaps]
    B -- Yes --> C[Calculate deployable budget and protected cash]
    C --> D[Allocate bucket budgets within policy ranges]
    D --> E{Fund evidence and purchase limits satisfied?}
    E -- No --> F[Withdraw this amount Retain gap]
    E -- Yes --> G[Apply fund caps and amount steps]
    F --> H[Reconcile allocated and unallocated cash]
    G --> H
    X --> I[Read-only output with explicit limitations]
    H --> I
~~~

This is a **conceptual diagram of decisions and responsibilities**, not an assertion that every production function executes in this exact order. Cash and policy determine whether a budget is deployable. Domain calculations determine bucket and fund allocations. Inadequate evidence removes the amount that depends on it, not every already-established historical fact.

A particularly subtle error is assuming that **good portfolio-wide coverage makes every single fund eligible for a current valuation**. One fund cannot borrow another fund's price evidence to qualify its own amount. Unallocated cash must remain visible in the output, rather than disappearing into rounding or automatic reweighting.

## 3. A CNY 300 Example You Can Recalculate by Hand

Every value here is a teaching assumption, not a byte-for-byte output captured from the production implementation. Suppose CNY 300 is deployable for this iteration; protected reserves are outside that figure. The amount step is CNY 10. The synthetic policy assigns CNY 180 to a Core bucket and CNY 120 to a Satellite bucket.

| Bucket | Fund | Constraint | Allocation |
| --- | --- | --- | ---: |
| Core (CNY 180 budget) | Fund A | Maximum CNY 100 per order | CNY 100 |
| Core (CNY 180 budget) | Fund B | Maximum CNY 80 per order | CNY 80 |
| Satellite (CNY 120 budget) | Fund C | Maximum CNY 50 per order | CNY 50 |
| Satellite (CNY 120 budget) | Fund D | No new buys | CNY 0 |
| Satellite (remainder) | Unallocated cash | No other eligible capacity in this bucket | CNY 70 |

The invariant is **300 = 100 + 80 + 50 + 0 + 70 (CNY)**. Core uses its full CNY 180, while Satellite allocates only CNY 50 and retains CNY 70. That residual is not an algorithmic failure. It reflects the decision not to manufacture policy compliance through an unapproved transfer across buckets.

A machine-readable output should keep allocation and the residual explicit instead of giving the model only a sentence such as “Invest CNY 230”:

~~~json
{
  "scenario": "synthetic-read-only",
  "currency": "CNY",
  "dailyBudget": 300,
  "amountStep": 10,
  "allocations": [
    { "fund": "A", "amount": 100 },
    { "fund": "B", "amount": 80 },
    { "fund": "C", "amount": 50 },
    { "fund": "D", "amount": 0, "reason": "no_buy" }
  ],
  "allocated": 230,
  "unallocated": 70,
  "ledgerWritten": false
}
~~~

These fields form a **teaching projection for recalculation**, not a claim that the production system publishes precisely this JSON schema. The real allocation producer must reconcile bucket allocations, fund caps, pauses, redistribution, and amount steps together. A single equal-weight split does not establish the full behavior.

## 4. Three Small Changes, Three Different Outcomes

**Case one: Fund C lacks a qualified current NAV or source identity.** Reliable prices for the other funds cannot preserve C's CNY 50 contribution. Under our fixed bucket budgets, with no other eligible Satellite fund, all CNY 120 of Satellite remains unallocated while Core retains CNY 180. This is a **local withdrawal of current amount eligibility**. It neither erases historical holdings nor rejects an independent conceptual explanation.

**Case two: Fund D resumes purchases, but its channel still imposes a daily cap.** The scenario may be recalculated within actual admission, channel capacity, and allowed amount steps. Any remaining cash must stay explicit. A CNY 300 objective does not excuse bypassing limits or shifting money to another bucket without policy authorization.

**Case three: the user wants an extra purchase outside the regular plan.** That is not an automatic extension of daily contributions. Extra operations require separate conditions, including a confirmed active policy, required evidence freshness, weekly frequency, monthly ceilings, usable cash, channel limits, and risk fit. Without the required confirmed policy, the calculator can reject **that extra operation** without denying historical holdings or otherwise authorized research.

In all three cases, eligibility belongs to a concrete operation and instrument. Record the failed condition and the unallocated amount first, then consider only substitutions permitted by the policy. The model must not fill the residual with “probably close enough.”

## 5. Who Guarantees Arithmetic, and Who Decides Whether Money Can Be Allocated?

Exact decimal addition, comparison, and rounding are reusable numeric operations. They can prove that 100 + 80 + 50 equals 230, but they cannot decide which cash is protected, which NAV date is usable, or which fund can accept an order. Those are investment-domain rules.

The division of responsibilities matters more than a universal calculator:

- **Investment fact reads** expose confirmed holdings and reports without creating new positions.
- **Deterministic investment calculations** use facts, policy, and restrictions to produce scenario amounts, feasibility, and unallocated cash.
- **The Numeric kernel** performs precise operations with units, scales, and rounding policies supplied by its caller; it does not select financial formulas.
- **Investment ledger and confirmation** own durable investment facts after proper confirmation; investment calculation results do not write them.
- **Atomic report production** assembles verifiable snapshots of inputs, calculations, and coverage; model explanations and file rendering cannot change that authority.

A report can contain both recorded holdings and hypothetical advice. Their appearance on the same page does not make them the same kind of fact. Agreement with a direction, confirmation of a plan, an explicit execution request, and a real execution receipt are separate events. **Read-only calculation is not automatic order placement.**

## 6. Verify the Calculator, Not Merely the Report's Writing

With a fixed synthetic snapshot, policy, and fund restrictions, a minimum check covers four things: identical inputs produce identical amounts; fund caps and no-buy rules are respected; allocated plus unallocated equals the deployable budget; and no ledger or confirmed trade is modified. Then introduce stale evidence, zero deployable cash, and cross-account inputs to confirm that the relevant operation fails locally.

ETF Agent's historical engineering work recorded corrections to account-baseline reconstruction, read-only daily contributions, removal of amounts lacking per-fund evidence, and explicit return of residual cash. But that engineering evidence **does not certify that a model will faithfully cite and explain the result throughout a real research task**; independent historical research-quality samples still included failures.

This essay explains the domain mechanism. The separate public [Open ETF Agent](https://github.com/hpoenixf/open-etf-agent) repository provides offline teaching exercises for synthetic documents, research, and delivery. It **does not ship the complete private fund allocation system** described here. Readers can independently check this CNY 300 example with arithmetic and stated constraints; they should not mistake the public demo for investment calculations or a trading route.

## Conclusion: A Sound Allocation Can Leave Money Unspent

If policy makes only CNY 230 eligible, the remaining CNY 70 must remain visible as cash. When designing a financial amount tool, ask: when were the shares recorded, which part of the budget is protected, which funds qualify, why does each restriction hold, and where did the remainder go? Answer those questions before asking a model to explain the numbers.

Continue with [Read-only Portfolio MCP](./portfolio-mcp-readonly-investment-data.md), [Financial Data, Time and Reproducibility](./031-fintech-data-time-and-reproducible-numbers.md), [Numeric Kernel](./agent-numeric-kernel-exact-units-rounding.md), and [Research, Advice, and Trading Boundaries](./030-fintech-from-research-to-investment-advice.md).

For related offline research-and-delivery mechanisms, try the synthetic examples in [Open ETF Agent](https://github.com/hpoenixf/open-etf-agent). Stars and issues are welcome for discussion of reproducible financial tooling.
