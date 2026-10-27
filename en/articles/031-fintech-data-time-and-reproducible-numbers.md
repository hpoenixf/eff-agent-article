---
title: "The Most Dangerous Financial AI Illusion: Real Data, Wrong Numbers"
description: "Reproducible time-bound market data, exact decimals, cash conservation, fee semantics and federated financial metrics."
---

# Financial AI's Most Dangerous Appearance of Expertise: The Data Is Real, but the Numbers Are Wrong

> **Historical case:** Index levels come from a 2025 engineering retrospective, not current market quotes.

> **Series:** Fintech and Compliance, with module and architecture perspectives.

> This account draws on the exact-calculation and federated-metrics phases as of October 21, 2026. Calculation counterexamples use safe test inputs, not actual investor losses.

**The most misleading number in financial AI may not be fabricated. It may come from a real source and then be interpreted under the wrong definition.** An investment conclusion needs the right instrument, time, unit, and denominator before anyone checks arithmetic or trusts the final explanation.

In one real ETF Agent research record, the lowest closing value in a retrieved 2025 index series was **3,589.44**, but the model answered **3,722.51**. Elsewhere it had correctly used 3,589.44 in drawdown work. Each of the two retrieved tables contained 243 trading-day records. The evidence pointed to interpretation and answer composition; it did not by itself show Runtime had hidden the right data.

A separate controlled counterexample showed that fee precision and cash constraints can also fail without model involvement. We therefore kept **deterministic decimal computation** separate from the domain decision about **what should be calculated and compared**, rather than centralizing financial truth in one manager.

## 1. A Financial Number First Needs an Instrument, Time and Definition

“What was this year's lowest price?” hides several conditions. Is “this year” the calendar year or a rolling twelve months? Is time measured by the exchange's local day or the user's time zone? Is the field closing price or intraday low? Adjusted or unadjusted? What happens to suspended or missing sessions?

Fund research adds still more choices: fund NAV, index level, ETF secondary-market price or a tracking-index close.

Even if a number is obtained from a legitimate provider, replacing its instrument or time window can yield the wrong answer while every arithmetic operation is correct.

We began treating financial observations as identified facts, including **instrument, field, observation time, sampling window, provider and missingness**. A citation can lead back to a source; it cannot prove that the model understood the temporal constraint.

## 2. The Real Failure Was Not Necessarily in Data Delivery

The erroneous answer initially looked like context truncation. We considered bigger windows, repeated reads and more tool calls. But reviewing the request and records revealed that **3,589.44** had been retrieved and even reused correctly elsewhere.

That rules out one premature diagnosis: **a wrong final number does not, by itself, prove Runtime withheld the correct data**. Conversely, seeing the correct value in one place does not certify the entire report.

In a later independent computation handoff, the model corrected the figure to **3,589.44** but wrongly treated a table hash as a citable source ID. Numerical calculation improved while citation identity broke.

In another live retry, some citations became short prefixes of valid identities. The system retained them as unverified rather than guessing the missing suffix.

These failures belong to different parts of the chain: numerical interpretation, computation-result handoff and citation identity. Calling them all “hallucinations” obscures the needed repair.

## 3. Reproducible Computation Beats a Vote of Several Models

For deterministic operations—means, drawdowns, correlations and range extrema—asking three models “are you sure?” is not independent verification. If all three consume the same inappropriate data definition, agreement can amplify false confidence.

A stronger approach is to run an explicit calculation on retrieved, authorized structured data, recording the field, window and output together.

For an annual minimum closing value, first restrict observations to the specified trading year; then take the minimum over non-missing closes while preserving its date. The adjustment policy for price and drawdown series must be stated separately; incompatible series cannot be silently mixed.

~~~mermaid
flowchart TD
  Q["User's market question"] --> I["Identify instrument and data field"]
  I --> W["Freeze time and sample window"]
  W --> S["Authorized source"]
  S --> C["Reproducible structured calculation"]
  C --> R["Check numerical claim"]
  R --> P["Publish numbers with their definitions"]
~~~

Computation must not also decide whether the user should buy the resulting portfolio. It produces checkable numbers under defined inputs. The model still explains meaning, comparison conditions and uncertainty. When prose differs from the computed number, locate the specific claim rather than asking a generic checker to judge whether the whole investment recommendation is correct.

## 4. A33 Solves Precise Arithmetic, Not Investment Judgment

JavaScript number uses binary floating point. The problem goes beyond the familiar 0.1 + 0.2 illustration. An amount multiplied by a fee rate may lie exactly near a half-cent, and floating-point error can change displayed rounding. Rounding **before** an adequacy check can also hide a real cash shortfall.

We introduced a small **A33 Numeric** capability in the original portfolio-calculation producer. Inputs retain explicit units and decimal strings. Operations use exact decimal coefficients, followed by the caller's declared rounding policy and residual reporting.

Representative safe fixed cases from the code:

| Input and operation | Exact value | Output under the caller's policy |
| --- | --- | --- |
| CNY 137 × 0.015 | CNY 2.055 | CNY 2.06 |
| CNY 145 × 0.015 | CNY 2.175 | CNY 2.18 |
| CNY −10.085 rounded to two decimals | CNY −10.085 | CNY −10.08 |
| Compare CNY 1.000 and CNY 0.999 | Difference CNY 0.001 | **Strictly unequal** |

The third row uses the **domain's explicitly selected tie-toward-positive-infinity policy**, **not** a universal default for finance. Settlement precision, internal computation precision and report display precision may differ. A33 does not decide a broker's settlement policy.

A33 provides same-unit addition, subtraction and comparison, explicitly unit-bound multiplication, proportional scaling, and rounding residuals.

It does not infer yuan versus cents from magnitude, add CNY to USD, or determine which fund is represented by “units × NAV” merely from the formula. Product identity and NAV date remain the original investment-data producer's responsibility.

The TypeScript Portfolio planning paths consume these operations. Python return analysis continues using its own method. We did not add a network service or force all financial research through a central TypeScript arithmetic kernel.

## 5. Cash Conservation Depends on Business Meaning, Not Display Precision

Rebalancing is not simply “target weight × total assets.” Cash can mean available balance, protected reserve, unsettled proceeds from selling, or a budget assumed for simulation.

Combining these roles may produce a numerically balanced equation that represents an invalid plan.

Under an explicitly stated settlement scenario, the following relation can be checked:

**Ending allocatable cash = starting allocatable cash + sale proceeds permitted in this scenario − purchases − included fees.**

The equation holds only for those specified cash roles and settlement assumptions. Protected reserves must not be counted as buyable cash. Permission to simulate a sale does not imply proceeds have settled in a real account. Fees must come from the same itemization and must not be subtracted twice by different consumers.

Our synthetic regression made precision consequential: when **budget, available cash or protected reserve differed by just CNY 0.001**, the old comparison could still say the plan was feasible. The new path compares the exact quantities **before** formatting. Two numbers that both display as two decimal places are not necessarily equal.

A negative half-cent transaction delta also reproduced a discrepancy of **10.09 versus the independently expected 10.08** in the original query path, followed by a fix at the producer.

The supported outcome is correction of specified amount and feasibility paths—not certification of every brokerage fee, portfolio record or real trade.

## 6. Assumed Fees, Estimates and Actual Charges Are Different Facts

Some financial mistakes do not originate in precision at all. They result from using a formula for the wrong type of fact.

| Fee type | Supported conclusion | Not directly supported |
| --- | --- | --- |
| Explicitly assumed cost | Scenario comparison under a stated rate and trade assumption | That the user actually receives that rate |
| Estimate computed from applicable supplied terms | Estimated cost when units, channel, validity, basis and other conditions match | That the terms' source is authenticated or that the broker already charged the fee |
| Actual transaction receipt | Charges that truly occurred in that transaction | Future costs in unrelated scenarios |

We consolidated fee semantics into the original domain methods rather than letting Report, Python and Portfolio independently implement identical rules.

Bounded support currently includes **percentage costs on an exclusive-of-fees base** and **fixed per-transaction costs**. Unsupported inclusive-of-fee bases, tiers and holding-period clauses must not be invented by a generic calculator.

If the conditions for an estimate are missing, **that estimate** is unavailable; an independent hypothetical scenario may still proceed. Matching terms does not authenticate their source or prove money left the account.

If a fund's NAV already reflects some ongoing expenses, the same cost cannot be subtracted again under the same net-return definition. One-time subscription/redemption fees and multi-year fee drag belong to different methods.

**Correctly evaluating a formula does not authorize calling its output the user's actual cost.**

## 7. Why Federated Financial Metrics Instead of a Central Metrics Manager?

We originally wanted to eliminate duplicate formulas everywhere. But identical field names do not always represent identical financial methods.

A central Manager that unilaterally certifies return, fees, look-through coverage and tracking differences would need to absorb multiple domains and might incorrectly equate incompatible values.

For example, an older tracking-difference record containing decimal **0.02** must be displayed under its versioned method as **two percentage points**. Another record already expressed as “2 percentage points” must not be multiplied by 100 again. A price-index move and a dividend-inclusive total return cannot be merged merely because both are called return.

Portfolio annualization is similarly method-specific. In a scenario with complete successive calendar-year observations, common currencies and compatible return bases, the attribution method may **compound period-by-period portfolio returns and then annualize**. Weighting individual-asset CAGRs using current holdings is generally **not** the CAGR of the historical portfolio path.

The code's bounded implementation remains a **simulation proxy**, not actual account time-weighted or money-weighted return.

We chose federated consolidation:

- **Portfolio:** cash roles, constraints and rebalancing.
- **Fee domain:** applicable fee terms and estimation.
- **Python research methods:** returns, attribution and look-through.
- **A33:** exact arithmetic only.

Reuse methods whose semantics truly match; preserve independent versions when they do not. Stored historical reports keep their original numbers and are not retroactively recalculated using today's revised formula when reopened.

This is less ambitious than sending every metric through one class. It makes audit questions easier: Which method produced this number? Who may change it? What cannot be inferred from it?

## 8. Real Sources Are Not Universal Certificates of Authority

A fund prospectus may establish the stated tracking objective or fee terms at its document date. It does not establish today's ETF secondary-market price. An index provider may publish methodology and constituents; it does not verify someone's private trading activity.

Source governance therefore includes **the scope of authority of each source**, not merely whether it was read.

In our controlled numerical chain, an amount that happens to match a public webpage does not thereby become authorized private portfolio data. A valid public-document citation likewise does not replace the actual holdings and time window required for personal risk calculations.

Financial reports mix several legitimate forms of “truth”: official disclosures, historical price observations, derived calculations, and actual personal profit/loss ledger entries. Packaging them in one professional-looking PDF does not cause them to validate one another.

## 9. A Financial Number Matters Only When It Supports the Decision

As of October 21, 2026, exact arithmetic, bounded metric definitions, and the first HTML weekly-report delivery had their own scoped engineering evidence. Autonomous portfolio research still had historical gaps in full-task completion, numerical interpretation, and proper consumption of results.

When reviewing an investment report, select **two or three numbers that could actually change its conclusion**. Ask what instrument and time they describe, which return, fee or constraint definition applies, whether qualified inputs allow independent recalculation, and whether the final prose goes beyond what those values support.

That is why computation and research should have different responsibilities. One performs precise operations under declared premises; the other chooses appropriate methods and explains their limitations. Repeating a calculation ten times cannot rescue an invalid comparison.

**A number with a source is a starting point. Reproducible definitions and qualified interpretation make it useful for judgment.** For more on how results can be misread after Python has calculated them, see [Python result consumption](financial-agent-python-result-consumption.md). A polished report alone is not evidence of successful investment research.

## Further Reading

- [Consuming Python results without losing financial semantics](financial-agent-python-result-consumption.md)
- [A trustworthy financial evidence chain](/articles/financial-agent-trustworthy-evidence-chain)
- [Python as a computational research workbench](/articles/agent-python-compute-workbench-evolution)

Browse the [independent ETF Agent reading site](https://hpoenixf.com/eff-agent-article/) or [GitHub article repository](https://github.com/hpoenixf/eff-agent-article). Counterexamples about definitions and numbers are welcome.
