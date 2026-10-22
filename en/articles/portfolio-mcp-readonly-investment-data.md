---
title: "Connecting Personal Holdings to an Agent: Designing a Read-Only Financial MCP"
description: "Atomic portfolio reports, scoped holdings views, version-bound scenario calculations and a strict boundary between research and transactions."
---

# Connecting Personal Holdings to an Agent: Designing a Read-Only Financial MCP

It can sound as though giving an agent access to personal holdings requires only one tool: open the account file and return JSON. As users ask follow-up questions, however, the design becomes more specific. How much detail is necessary to answer an asset-allocation question? What denominator applies to the weight of one fund? When asked “what if I reduce my technology exposure,” should the tool return current holdings or calculate a hypothetical plan?

All these requests can enter through the same MCP connection, but they require different meanings for the data. Holding amounts come from an account snapshot; a regular-investment amount may be a proposed calculation; and a confirmed plan is not an executed trade. If the tool combines them into one undifferentiated “portfolio,” the model gets many numbers without knowing what each number can legitimately establish.

We built **Portfolio MCP** for this purpose. It reads facts from an atomic report produced by the root investment system and exposes overview, detail and registered-metric queries. When calculation is needed, it invokes existing financial-domain methods and preserves assumptions and result identity.

**It supports research about an account and calculations about hypothetical changes. It does not acquire permission to write the ledger, confirm actions on behalf of the user or place trades.**

The following synthetic conversation illustrates the system. Fund identifiers, amounts and dates are educational data, not a real account or proof of a completed model run:

> “First show my overall allocation. Which funds make up my technology exposure? If I reduce their weight, how would cash and allocation constraints change?”

## 1. First Establish an Explainable Account Fact Behind the Tool

Our root investment system already owns holdings, cash, deterministic calculation and user confirmation. It assembles these into a **portfolio-report@1** report. Portfolio MCP consumes that report instead of reopening separate holding, cash and old-proposal files for each answer and improvising a new account state.

An “atomic report” is a snapshot delivered under one report identity. Some sections may still be missing, and the underlying dates may differ. Holdings have their own snapshot date, funds have NAV dates, and the report has a generation time. Putting these items in one file does **not** make their business timestamps equal. It does let the related sections be identified, validated and read together.

The Reader finds canonically named reports in an authorized directory, validates path and structure, preserves report ID, evidence version, generation time and snapshot date, and calculates a content hash. Subsequent tools can thus answer “which report produced these figures,” not just return amounts detached from their source.

~~~mermaid
flowchart TD
  L["Investment ledger"] --> P["Report producer"]
  M["Investment domain methods"] --> P
  P --> A["Atomic portfolio report"]
  A --> R["Portfolio Reader"]
  R --> O["Portfolio overview"]
  R --> Q["Scoped queries"]
  R --> S["Scenario methods"]
  H["Explicit hypothetical assumptions"] --> S
  O --> G["Agent research"]
  Q --> G
  S --> G
~~~

The arrows represent data dependencies. The root investment system produces the report; the Reader projects the views needed by different queries; scenario methods require additional explicit assumptions. The diagram has **no path from research back to ledger mutation**.

Originally the report producer and agent Reader duplicated the entire data structure. We later extracted a shared structural contract and decoder. But both ends retain independent qualification checks: the root system can represent a report with an unknown snapshot date, while the agent Reader requires an eligible date and therefore may reject it.

This distinction matters: **shared field definitions reduce schema drift, while each consumer still decides whether a value qualifies for its task**. Importing the report producer itself into the Reader would also drag in file-writing and investment-computation dependencies. We share the side-effect-free contract, not those capabilities.

## 2. For an Overview Question, Actually Return an Overview

Consider the user's first request: “What is my overall allocation?”

An early no-argument portfolio query returned the entire holdings list, along with regular-investment, budget, execution and other decision context. A user asking for a high-level allocation caused the model to receive individual funds, units, NAVs and unrelated decision fields.

We wanted to reduce default disclosure while preserving a stable starting point for research.

**get_portfolio_overview** provides a bounded display view: total portfolio value, **eight presentation buckets**, and essential classification information. It uses the classifications in the root report. Unknown categories have an explicit place, and overlapping risk labels are not summed as though they were mutually exclusive buckets.

The full account report stays inside the service; the tool projects only what the current question needs.

The overview also includes a small number of evidence-backed candidate fund relationships to guide later research. These may include fund codes, so “overview” does not mean “contains no instrument identifiers.” Rather, it avoids expanding **all holdings, units, NAVs and decision sections by default**, while preserving paths to deeper analysis.

One real lesson came from implementation integration. Initially MCP already returned the bounded overview, but the application injected both the direct data source and MCP Host. Another context-assembly path continued to prefer the full report, so the model still saw the unrestricted representation.

A unit test of MCP's return value could not reveal that bypass. Only a controlled regression through **the actual dual-injection application assembly** established that the default model context used the bounded view.

Data minimization must be checked where the data is actually consumed—not just at one producer interface.

There is a tradeoff: a small overview necessitates more detail reads. An overview that is too thin could force mechanical pagination for every task. We grouped tools by user question, rather than making every field a separate call.

| Current user need | Tool entry | Primary returned content |
| --- | --- | --- |
| Understand the overall allocation | get_portfolio_overview | Total, display buckets, coverage and selected relationship hints |
| Inspect one fund or a set of positions | get_fund_position, get_portfolio_holdings | Holding facts within an explicit product or portfolio scope |
| Understand fund relationships | get_portfolio_relationships | Feeder relationships, tracking indexes and supported constituent overlaps |
| Query metrics or compare scenarios | query_portfolio_metric | Registered methods, input scope, timestamps and computed results |

## 3. From Overview to Detail: Every Number Retains Its Scope

The user then asks about technology holdings. “Technology” might cross several display buckets. The model must decide whether the question means a particular bucket or look-through industry exposure across funds before selecting a query.

The current **get_portfolio_holdings** can also return the complete portfolio. A full read is reasonable when the question truly needs individual analysis. Default overview and on-demand detail answer different questions.

Consider an illustrative fund in the Nasdaq bucket. Suppose the report's allocatable portfolio total is **CNY 100,000** and hypothetical fund **900001** has **1,000 units**, with snapshot NAV **CNY 12**. The detail query is:

~~~json
{
  "fundCode": "900001"
}
~~~

Selected response fields, omitting the full protocol and separate display projection:

~~~json
{
  "status": "available",
  "analysis": {
    "fundCode": "900001",
    "name": "Example Technology Fund",
    "category": "nasdaq",
    "shares": 1000,
    "nav": 12,
    "value": 12000,
    "weight": 0.12,
    "view": {
      "query": { "kind": "fund", "fundCode": "900001" },
      "snapshot": { "asOf": "2026-10-18", "freshness": "fresh" }
    }
  },
  "provenance": {
    "reportId": "demo-report-2026-10-18",
    "evidenceVersion": "demo-v1",
    "snapshotDate": "2026-10-18",
    "authority": "report-snapshot"
  }
}
~~~

Here **12%** uses the **root report's portfolio total** as the denominator, not this fund's share of the technology subset.

fresh means the snapshot meets the current Reader freshness configuration. The snapshot is still dated **October 18**, and the model must not silently rewrite it as “today's holdings.”

The displayed amount has explicit provenance: the implementation multiplies units by NAV from **the same report**, then computes the display weight. It does not fetch a newer market quote and covertly replace account valuation. If recent market developments matter, the agent can separately retrieve market evidence and disclose the time difference.

Repeated reads in a conversation are not automatically a snapshot-isolated transaction. Each tool may read the currently available report; if the report updates, later calls can see a newer identity. Cross-result comparisons must check report ID and date. We use one report in this teaching example solely to keep the mechanism clear.

### Variation One: Similar Names Are Not Unique Fund Identities

If the user says “that technology fund,” a query must not pick a product based on a vaguely similar name.

A single-name query with multiple matches reports ambiguity and requests a more precise identity. A batch query preserves candidates and ambiguity markers. A nonexistent fund returns its own unavailable outcome; it is not silently treated as zero holdings, nor must it make every other entry in a batch fail.

### Variation Two: Complete Positions Do Not Guarantee Complete Relationship Evidence

Two funds may have a feeder/target relationship, track the same index, or share some underlying securities. Those are different relationships requiring different evidence.

Relationship queries therefore report **holding-scope completeness** separately from **relationship-evidence completeness**.

Even when every holding row is present, missing constituent data must not be interpreted as “no overlap.” The model can explain known relationships and identify what else needs to be read. Tool-level success does not supply absent premises for a financial conclusion.

## 4. Why a Read-Only Service Can Still Calculate Scenarios

The third question is: “What if I reduce technology exposure?”

If “read-only” meant “may only relay existing numbers,” this would be difficult. Even summaries, weights and scenario comparisons involve computation.

The real boundary is **ownership of account state and business methods**. A read service must not rewrite the ledger, treat a hypothetical target as an accepted strategy, or implement a competing calculation system with different formulas.

The [MCP tool annotation specification](https://modelcontextprotocol.io/specification/2025-11-25/schema#toolannotations) defines **readOnlyHint** as a hint about whether a tool modifies its environment, while stating that annotations are **hints, not security guarantees**.

Our tools declare read-only intent, but the actual guarantee comes from exposing read capabilities, invoking pre-existing domain methods, and offering **no ledger-write or trading entry point**. A Boolean annotation is not the implementation.

**query_portfolio_metric** supports only registered metrics. Each has a method/formula version, source fields, allowed dimensions and freshness requirements. The model cannot invent a metric name and force the service to execute an arbitrary investment formula.

Rebalancing scenarios use the same query entry while calling existing portfolio methods. Research first reads **portfolio.rebalance.context** to obtain report identity, current strategy identity, portfolio denominator, cash roles and missing assumptions, then constructs explicit scenario assumptions.

“Reduce tech a little” is not sufficient input. The method needs **complete target weights, fee assumptions, budget, and whether hypothetical sale proceeds may fund buys**. Targets must cover existing funds and respect the scope of the currently confirmed allocation. The method does not choose optimal weights or automatically import new products.

The request also binds **report ID, evidence version, report content hash and strategy identity**. When executing, the method checks those against the content actually being read. If the report changed while the model assembled the hypothetical plan, mismatch results in rejection rather than applying stale positions to a new account.

That is a specific version check; it still does not turn the whole conversation into one database snapshot transaction.

When conditions hold, methods calculate buy/sell deltas, fees, cash shortfalls and allocation constraints. Even a **feasible-under-assumptions** result preserves:

~~~json
{
  "targetAuthority": "hypothesis",
  "stateChanged": false,
  "executionEligibility": "unknown",
  "executionAvailable": false
}
~~~

Those fields mean “mathematically feasible under these assumptions,” not “a transaction occurred.”

Account facts, derived calculations and confirmation states need separate interpretation:

| Returned material | What it can establish | What remains unproven |
| --- | --- | --- |
| Holdings and cash snapshot | Account state at the stated report identity/time | Changes after the snapshot |
| Metrics, suggestions or scenario results | Derived outcomes under explicitly defined inputs and methods | User confirmation and actual execution |
| Confirmed regular-investment plan | The plan has reached its recorded confirmation status | Fills, cash transfers and later change receipts |

For example, **get_dca_plan** reads a proposal. **get_execution_status** reads confirmed plans and their present or last-known status. The word execution in a tool name does **not** allow a plan row to be translated into “these funds were bought today.”

Tool descriptions need to state the distinction explicitly, and result identities preserve it for later explanation.

## 5. What Happens When Sources Become Stale or Incomplete?

Financial updates do not arrive simultaneously. Account uploads, fund NAV publication and daily report generation have different clocks; QDII funds can publish NAVs later still.

Availability, observation date, estimation status and coverage must be represented separately.

### Variation Three: A Displayable Estimate May Be Ineligible for Rebalancing

If a report includes an explicitly labeled estimated holding, the overview may display it together with estimation coverage. A current rebalancing scenario requires actual, complete, reconcilable holding evidence, plus eligible strategy and cash constraints.

The ability to display an estimated amount does **not** grant eligibility to use it in a current actionable calculation.

Similarly, if a query for an exact historical date has no matching snapshot, it must not silently substitute the nearest other date while claiming the requested one. The user may elect to study the available date or accept an explicit coverage gap.

Local failure should remain local to its dependencies. In one controlled path, a later read of an expired cash budget caused an otherwise valid holdings total to be downgraded as unverified in the consumer. We repaired that projection: independent holdings may remain visible while stale cash stays restricted. If the **same field** loses eligibility, or report identity actually changes, dependent claims must still be withdrawn.

This fix belongs to result consumption and publication eligibility; Portfolio supplies the identities, scope and field provenance. Together the layers can express a partial gap without silencing all research and without laundering stale data through an unrelated valid result.

## 6. What the Portfolio MCP Actually Owns

Across overview, detail and scenarios, Portfolio MCP makes account facts queryable, interpretable and reproducible as research inputs.

The model interprets the user's question, chooses necessary queries and compares conditions. The root report producer maintains account facts. Existing domain methods own financial computations. Ledger writes and confirmation belong to the original investment workflow.

That separation comes with real maintenance work. Schema changes need Reader updates; changes to tool granularity require checking what the model actually consumes; each new metric needs a defined method and limits.

Those costs are worthwhile because they give concrete answers to “where did this number come from?”, “which report did this read use?”, and “did this query modify the account?”

Implementation and controlled regressions support these read and calculation boundaries and exposed actual application-assembly bypasses. They do **not** prove every naturally phrased conversation produces reliable financial research, nor certify the quality of recommendations or user investment outcomes.

For “what happens if I change the allocation?” the useful answer identifies **current holdings, the exact hypothetical change, assumptions used in the calculation and actions that have not happened**.

That is what makes a read-only financial MCP useful: it lets the different facts participate in one research process without losing their original meanings.

## Continue Reading

- [MCP Host: From Discovery to Real Tool Use](/articles/mcp-host-from-discovery-to-consumption)
- [Why Market Data MCP Became a Research Decision System](/articles/mcp-market-responsibility-retrospective)

The [engineering reading site](https://hpoenixf.github.io/eff-agent-article/) provides the series, diagrams and continuous reading order. If this article helped, consider starring the [GitHub repository](https://github.com/hpoenixf/eff-agent-article) and sharing counterexamples through Issues.
