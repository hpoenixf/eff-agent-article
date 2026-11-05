---
title: "Exact Numbers Are Not Correct Investments: A Numeric Kernel for Units, Rounding, and Residuals"
description: "The Numeric kernel: exact decimal strings, explicit dimensions, signed rounding, comparisons, residuals, and separation from financial-method authority."
readingBrief:
  takeaways:
    - "Decimal strings preserve source precision, with explicit units and ratio scales; amounts, shares and percentage points cannot derive their meaning from magnitude or display formatting."
    - "Rounding policy determines negative ties, and residuals record rounded minus exact; identical displays need not mean equal values, while conflicting strict constraints remain infeasible."
    - "Numeric owns reproducible operations and local rejection; domains own formulas, denominators, dates and applicability, so exact arithmetic does not establish correct investment conclusions."
  appliesTo:
    - "Designing deterministic amount, share and weight calculations that need explicit unit checks, signed rounding, residuals and domain-constraint ownership."
  notFor:
    - "Seeking a universal investment-truth authority, or using synthetic arithmetic tests to certify fresh data, correct return conventions or executed trades."
---

# Exact Numbers Are Not Correct Investments: A Numeric Kernel for Units, Rounding, and Residuals

A financial research agent returns **CNY 2.06**. Its arithmetic may be reproducible even when the investment meaning is wrong: shares and net asset value might refer to different dates, different currencies might have been combined, or a fee already reflected in NAV might be deducted again.

Two responsibilities must remain separate. **The Numeric kernel** guarantees a deterministic operation for specified decimal inputs, units, and rounding policies. **The deterministic investment calculation module and other domain modules** select formulas, determine input eligibility and denominators, and decide what the financial result actually means.

This is a mechanism-level account of the Numeric module and its interface. All values are synthetic. Focused arithmetic tests do not certify the correctness of real fund-research methods.

## 1. The input must preserve its meaning

**Figure 1: The Numeric kernel must not invent missing financial prerequisites.**

~~~mermaid
flowchart TD
    A[Source data and original precision] --> B[Domain Owner selects object, time and method]
    B --> C{Unit, scale and operation binding explicit?}
    C -- No --> X[Reject local operation with reason]
    C -- Yes --> D[A33 exact decimal operation]
    D --> E[Return exact, rounded and residual]
    E --> F[Domain Owner checks business constraints]
    F --> G[Result retains identity and limitations]
    G --> H[Model interpretation and original Publication]
~~~

Binary floating point cannot exactly represent every decimal fraction. Beyond the safe-integer range, source digits may be lost before formatting. Formatting an ordinary number to two decimal places cannot recover precision already discarded.

The input therefore carries a **decimal string**, with an explicit rounding rule:

~~~json
{
  "quantity": { "value": "137", "unit": "CNY" },
  "factor": { "value": "0.015", "unit": "ratio" },
  "rounding": { "scale": 2, "mode": "half-toward-positive-infinity" }
}
~~~

This input does not establish that a 1.5% fee applies to any real fund. Selecting a fee is a domain decision.

## 2. Precision, units, scales, and methods are distinct

| Dimension | Example | Owner of the decision |
| --- | --- | --- |
| Numeric representation | 2.055, 1e-400 | Numeric retains decimal precision and exact comparisons |
| Unit | CNY, USD, shares:fund-A | Source/domain declares it; Numeric rejects incompatibility |
| Ratio scale | 0.25 ratio, 25 percent | A versioned domain contract converts explicitly |
| Method and denominator | Return, fee, NAV valuation | Domain Owner chooses; Numeric does not |
| Settlement/display precision | Two decimals, currency quantum | Domain selects policy; Numeric applies it |

Same-unit addition and subtraction are permitted; CNY and USD must not be silently combined. Multiplying shares by per-share NAV requires an explicit dimensional binding: **shares:fund-A × CNY/share:fund-A → CNY**. Numeric does not infer fund identity, retrieve an exchange rate, or validate the freshness of source data.

Percentage-point conventions are especially error-prone. A 0.02 decimal difference may represent 2 percentage points under its method contract. A source already reporting 2 percentage points must not be multiplied by 100 again.

## 3. Rounding is a policy, not a cosmetic format

The synthetic multiplication 137 × 0.015 is **CNY 2.055**. Applying an explicit two-decimal policy with the declared tie direction produces:

~~~json
{
  "exact": { "value": "2.055", "unit": "CNY" },
  "rounded": { "value": "2.06", "unit": "CNY" },
  "roundingResidual": { "value": "0.005", "unit": "CNY" }
}
~~~

The residual here means **rounded minus exact**, so it is positive CNY 0.005. This is a visible rounding effect, not an arithmetic error.

Negative values reveal the significance of the tie rule. The bounded implementation uses half-toward-positive-infinity, so **−10.075 → −10.07** at two decimal places, rather than −10.08. That is correct for its declared rule, not a universal financial rounding convention.

No binary float is needed first: 137 has integer coefficient 137 and scale 0; 0.015 has coefficient 15 and scale 3. Multiplication yields coefficient 2055 with scale 3, or 2.055. Settlement to two places then applies the explicit rule to quotient and remainder. Aligning settled and exact values to a common scale yields the residual. The current kernel uses BigInt coefficients for these finite operations and decimal strings across JSON.

Why keep a negative tie toward positive infinity instead of switching to the more familiar away-from-zero rule? It preserves the original domain’s Math.round direction rather than declaring a universal finance rule. An October 20, 2026 synthetic case through the original query exposed 1000 × 0.189915 − 200 = −10.085 CNY: the old path produced a sale of 10.09 where that existing policy required 10.08. The repair retained decimal multiplication and subtraction before applying the same policy, without changing business rules under the cover of precision work. This new counterexample does not reconstruct an earlier research failure whose original inputs remain unavailable.

Computing exactly, applying a domain-selected settlement policy, and formatting last generally differs from rounding each intermediate step.

## 4. Display rounding must not erase exact comparison

Both 1.00 CNY and 0.999 CNY might display as 1.00 at two places, yet the first remains strictly greater by **0.001**. A tiny positive decimal such as 1e-400 also must not be treated as zero merely because a conventional number conversion loses it.

The difference can change eligibility: original synthetic query cases let a purchase of 1 look feasible after cent rounding despite a budget or available cash of 0.999, or a protected-reserve deficit of 0.001. The domain now compares unrounded differences before reporting a shortfall. Displaying 1.00 cannot authorize the expenditure.

“Remaining cash must not become negative” remains a domain constraint. Numeric compares chosen same-unit values; the domain decides which values to check, whether a tolerance exists, and which local business action is rejected.

## 5. A residual can reveal impossible constraints

**Figure 2: Explanatory prose cannot repair mutually inconsistent strict constraints.**

~~~mermaid
flowchart TD
    A[Domain specifies targets and constraints] --> B[A33 computes and compares exactly]
    B --> C{Conservation and constraints satisfied?}
    C -- Yes --> D[Retain deterministic result]
    C -- No --> E[Return difference and affected fields]
    E --> F{Domain has explicit tolerance or repair policy?}
    F -- Yes --> G[Domain adjusts locally and recomputes]
    F -- No --> H[Report infeasibility or missing condition]
    D --> I[Model explains but cannot grant approval]
    G --> I
    H --> I
~~~

Suppose a synthetic allocation has three weights each constrained to **exactly 0.333**, and their total must also be **exactly 1**. Exact summation yields 0.999, leaving **0.001**. This is not a floating-point error, nor can rendering three values as 33.3% repair it.

Which bucket absorbs the remainder? May cash change? What tolerance is allowed? Those are portfolio-domain decisions. Numeric returns exact values and differences. When strict constraints conflict, the local outcome must remain infeasible rather than pretending conservation holds.

Two more cases expose the same boundary: accurate multiplication with an unknown holding date does not establish an eligible current valuation; a reproducible hypothetical fee is not a verified debit, and fees already contained in NAV must not be deducted again without an explicit accounting basis.

<span id="_6-why-a-global-financial-metrics-manager-is-not-the-answer"></span>

## 6. Integer minor units, a decimal library, or a narrow numeric kernel?

**For fixed settlement units, integer minor units are often simpler.** [Stripe’s amount interface](https://docs.stripe.com/currencies#minor-units-in-api-amounts) accepts the currency’s minor unit; not every currency uses a factor of 100. Once settlement is complete, currency plus an integer amount is a useful accounting/payment representation. The NAV, rate and 0.001 deficit above are pre-settlement inputs, however. Keeping only cents too early discards needed information. The integer representation must also have sufficient range: changing units does not remove overflow concerns.

**For broader operations and rounding policies, a mature decimal library is a better fit.** [decimal.js](https://mikemcl.github.io/decimal.js/) supplies configurable precision, multiple rounding modes and operations such as division. Its ROUND_HALF_CEIL corresponds to the tie direction here. Inputs should still come from original decimal strings, with explicit precision and business policy. The library does not identify a fund, NAV date or currency; the application must preserve that unit boundary.

**Our choice is a narrow kernel for known consumers.** Same-unit addition/subtraction/comparison, explicitly bound multiplication, ratio scaling and exact/rounded/residual results fit bounded decimal parsing plus BigInt coefficients. No cross-language RPC or general finance DSL is needed. The cost is a limited operation set and one explicit rounding policy, not a complete Decimal replacement. General division, additional policies or complex functions should trigger a fresh library decision rather than indefinite expansion of this module.

Statistical methods such as covariance estimation can still use floating point with declared samples and tolerances. Exact money does not require moving every mathematical method into one engine. Responsibilities follow inputs and business meaning:

| Module | Owns | Does not own |
| --- | --- | --- |
| Exact numeric operations | Exact arithmetic, units, rounding and residuals | Formula selection or source authentication |
| Isolated analysis | Sandbox, bound inputs and actual script execution | Declaring investment correctness from execution |
| Deterministic investment calculations | Amounts, allocations and domain constraints | Global Run or Publication veto |
| Research results and references | Result identities, dependencies and reread references | Recomputing financial authority |
| Answer publication and preparation | Answer revisions and delivery | A universal semantic finance judge |

Migration has a cost too: turning a number into a string cannot restore digits lost at ingress. Historical results keep their original methods rather than being silently recalculated by History. Before choosing a representation, locate the first loss of precision and identify the actual consumer paths that need migration.

## 7. Verify the local promise without inflating it

A minimum set of tests covers: the exact/rounded/residual outcome for 137 × 0.015, a negative half-tie, CNY/USD addition rejection, explicit same-fund shares/NAV multiplication, mismatched fund binding rejection, exact comparison of 1.00 and 0.999, tiny nonzero values, and the infeasible strict-weight example.

These fixed inputs and expected outputs demonstrate local arithmetic contracts. They do not establish correct live fund-return formulas, investment advice, executed trades, or repaired historical results.

## Conclusion

Numeric does not make “all numbers in an Agent correct.” Its useful promise is narrower and stronger: **with eligible decimal inputs, explicit unit bindings, and a specified rounding policy, results are reproducible, residuals explainable, and invalid operations rejected locally.** Financial domains retain responsibility for methods, evidence, applicability and authorization.

Further reading: [Financial data, time and reproducibility](/en/articles/031-fintech-data-time-and-reproducible-numbers) · [Why Python results can be misused](/en/articles/financial-agent-python-result-consumption) · [Models understand; code authorizes](/en/articles/011-model-understands-code-authorizes).
