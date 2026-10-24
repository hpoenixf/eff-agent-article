# Investment AI Needs More Than Supporting Arguments: From Multiple Perspectives to Falsifiable Theses

> Multi-Agent Investment Research · Part Three | From an investor’s question to a judgment that can actually be tested

Suppose you already hold several funds and are considering a technology ETF. You ask an AI assistant: “Should I add some?”

It may quickly summarize the sector outlook, fund expenses, recent performance and risk disclosures, before concluding that you should consider your risk preferences. None of those statements is necessarily wrong. Yet two important questions remain unanswered: **What would this purchase change in my whole portfolio? And does my original reason for buying actually hold?**

That is a recurring problem in ETF Agent. Retrieving information is one task; turning it into a judgment relevant to an investor’s existing holdings is another. We also want the AI to ask which evidence could overturn its initial conclusion.

We therefore connected distinct investment methodologies, an independent counterargument role and versioned investment theses. A fully synthetic example will illustrate the investor benefit and the engineering and financial trade-offs behind it.

## 1. A Good Fund Is Not Automatically a Good Addition to My Portfolio

“What is this fund like?” can often be answered from product disclosures: its benchmark, fees, trading constraints and underlying holdings.

“Should I add it to my portfolio?” is a different question. It depends on existing exposures, the source of funding, the change the investor hopes to make and the risks they can actually bear.

Consider the claim that owning one more fund must increase diversification. Two differently named funds may own the same companies. Adding both names may increase a count without changing the underlying risk very much.

**Look-through analysis** means going past fund names and inspecting the underlying companies, industries or economic risk factors. Investor-education material likewise cautions that diversification depends on the investments underneath the wrapper, not just the number of funds. [1]

For an investor, the useful comparison often involves at least three alternatives: do nothing; buy with available cash; or sell part of a current holding to fund the new ETF. Each has a different effect on the portfolio.

## 2. Why One Investment Perspective Is Not Enough

No single metric answers every investment question.

Diversification requires understanding how holdings move together. Long-term suitability also depends on cash needs and the ability to stick to a plan. For a fund replacement, tracking difference, total costs and liquidity may matter more than an attractive industry narrative. Even an excellent asset need not be attractive at every price.

ETF Agent therefore registers six optional research methodologies inspired by well-known bodies of investment thought:

| Perspective | What it asks |
| --- | --- |
| **Markowitz: portfolio allocation** | How does a proposed holding change marginal risk, weights and correlations? |
| **Taleb: tails and fragility** | What could break in extreme markets, funding stress or market-infrastructure disruptions? |
| **Bernstein: long-term discipline** | Is the change consistent with the actual time horizon, cash needs and investment plan? |
| **Bogle: implementation cost** | What fees, tracking differences, overlap and trading frictions must be paid for the desired exposure? |
| **Marks: price and compensation** | Does today’s price offer enough reward for valuation, credit, liquidity and other risks? |
| **Fama–French: factor explanation** | Which qualified historical factor exposures might explain observed returns without inventing alpha? |

The Agent is **not impersonating these people** or presenting fabricated contemporary advice. It uses analytical frameworks, not celebrity authority.

And we do not require six Children for every question. A validated look-through calculation can settle a narrow exposure question without six independent recalculations. Missing valuation or factor-series data cannot be created by invoking an impressive role name.

The hoped-for investor benefit is more precise questioning: identify what should be calculated, what should be challenged and what is still unknown.

## 3. Bull–Bear Research Is About Testing a Reason, Not Staging a Debate

Investors commonly form a preference first and seek information that supports it. An AI-generated report with polished “pros” and “cons” can still fail to examine the central premise.

Our Bull role assembles a supporting case. Bear searches for meaningful evidence that would undermine it. Each first researches independently; an optional direct exchange then challenges actual statements before Main produces the user-facing synthesis.

Unlike multi-model voting, the goal is to **allow a judgment to change in response to evidence**.

If an investor says “a new technology ETF improves diversification,” Bear should investigate actual overlap rather than merely add a generic warning that technology valuations are high.

Bear may acknowledge finding no sound disconfirmation. Bull may concede an error. Agreement does not automatically turn a shared opinion into a sourced fact. We want investors to stop relying on weak reasons, not watch agents collect victories.

Let us make that concrete with numbers anyone can verify.

## 4. A Checkable Example: Does Adding a Fund Actually Diversify Risk?

The following is **entirely synthetic teaching data**. It represents no real portfolio, security, investor or forecast. Imagine total assets of 100 monetary units. Real look-through calculations must also align valuation times, currencies, classifications and disclosure coverage.

The original portfolio holds 50% in a broad equity fund, 30% in bonds and 20% in cash. Compare two ways to add a 10% technology ETF allocation:

| Plan | Broad equity | Technology ETF | Bonds | Cash |
| --- | ---: | ---: | ---: | ---: |
| A: leave unchanged | 50% | 0% | 30% | 20% |
| B: fund with 10 points of cash | 50% | 10% | 30% | 10% |
| C: replace 10 points of broad equity | 40% | 10% | 30% | 20% |

Suppose the broad fund has 30% technology-sector exposure and the technology ETF has 80%. Assume the holdings use the same observation date and industry classification with complete coverage; in this teaching definition, bonds and cash carry no equity technology exposure.

Weight the fund exposures by their portfolio allocations:

~~~text
A: 50% × 30%                          = 15%
B: 50% × 30% + 10% × 80%              = 23%
C: 40% × 30% + 10% × 80%              = 20%
~~~

Both proposed purchases **increase** technology-sector exposure. B adds eight percentage points; C adds five. B also reduces cash from 20% to 10% and raises the total equity share.

We can now withdraw the statement “more funds automatically means less technology concentration.”

But **greater technology weight alone does not prove that total portfolio volatility rises**, or that the purchase is necessarily unsuitable. If the investor intentionally wants more technology, that is a separate thesis requiring its own evaluation.

This limited result is still valuable: it distinguishes observed changes from unsupported conclusions and unconfirmed personal goals.

## 5. Turn “I Like Technology” Into a Thesis That Can Be Checked Later

Investment retrospectives have a familiar weakness. Three months ago someone said “technology has a bright long-term future”; three months later, whatever the performance, a new paragraph can explain why the original idea was supposedly right all along.

A versioned **Investment Thesis** prevents that kind of retroactive editing. It records a proposition, its subject, the supporting information, the date, and **the condition under which the proposition should be reconsidered**.

The last element is a *falsification condition*: evidence that would make the original statement untenable.

Our example contains three separate hypotheses:

| Hypothesis | Original claim | What the given evidence establishes |
| --- | --- | --- |
| H1 | Plan B does not increase technology-sector weight | Complete synthetic look-through shows a rise from 15% to 23% |
| H2 | Plan B reduces overall portfolio volatility | Comparable return history and correlations are missing |
| H3 | Plan B fits the investor’s long-term needs better | Confirmed cash requirements and investment goals are missing |

H1 can specify an exact falsification condition: “Comparable, complete look-through shows B has higher technology weight than A.” The provided calculation meets it, so H1 must be withdrawn.

H2 cannot substitute sector exposure for a properly defined total-risk estimate. H3 cannot invent a drawdown tolerance or cash plan from a role instruction.

**Disproving one hypothesis does not prove or disprove everything else.**

## 6. What Should One Useful Round of Dialogue Actually Change?

The following exchange is constructed for teaching; it is **not** quoted from an actual ETF Agent model run.

> **Bull:** A technology ETF may offer additional growth exposure, but I have not verified whether the claim “more funds mean better diversification” holds for the current portfolio.
>
> **Bear:** On the stated industry look-through, Plan B raises technology weight from 15% to 23%, which meets the original falsification condition for H1. Please withdraw H1. Overall volatility remains unknown.
>
> **Bull:** I withdraw H1. If the goal is intentional technology overweight, we can examine valuation and funding, but that is not the original diversification claim.

One round is enough. The investor learns precisely which premise failed, why it failed and which new questions matter before proceeding.

We do not ask Main to average a “buy 10%” recommendation with a “buy 0%” recommendation into a 5% trade. Financial decisions are not majority votes, and a missing input is not repaired by compromise.

## 7. The Engineering Challenge: Remember Why We Believed Something

An isolated answer can say “I changed my mind.” Sustainable research must answer a harder question months later: **Which hypothesis was recorded at the time, and what original evidence led to the revision?**

Our approach preserves versioned hypotheses, provenance and optional review associations rather than keeping every report and chat transcript in an endlessly expanding model context. A later user correction produces an explicit successor record; it does not overwrite the previous claim.

This is a **conceptual illustration**, not an exact production schema:

~~~json
{
  "thesisId": "demo-tech-allocation",
  "version": 1,
  "hypothesisId": "H1",
  "claim": "Plan B does not increase technology-sector weight",
  "falsificationCondition": "Comparable, complete look-through shows B above A",
  "source": "synthetic-lookthrough-v1"
}
~~~

When the challenge occurs, the system links the original thesis version to actual evidence and the public Bull/Bear messages that really occurred. It records the date, the reviewing author and unresolved gaps. Any replacement rationale becomes a successor, never a silent edit of version one.

Old reports need not represent today’s reality. They **must** faithfully represent what was argued at the time. If “I bought it for diversification” can be silently rewritten as “I always intended a technology overweight,” there is no meaningful historical test.

## 8. Four Assessment States—and the Important Fifth Case

A completed thesis assessment can produce four attributed research judgments:

| State | Plain-language meaning | Important limitation |
| --- | --- | --- |
| **Supported** | Current evidence supports the stated claim | Not a permanent truth or return guarantee |
| **Challenged** | Material counterevidence exists but the original condition has not been established as met | Identify the unresolved dispute |
| **Invalidated** | Qualified evidence establishes that the original falsification condition was met | H1 in this synthetic case |
| **Inconclusive** | An assessment was performed, but evidence is insufficient or conflicting | Record the missing information |

A fifth case sits **outside** those four labels: **no assessment was performed at all**. If no one examined the user’s actual cash requirements in H3, that is “not assessed,” not automatically Inconclusive and certainly not evidence of safety.

Similarly, Bear’s failure to find a counterexample does not automatically support a thesis. The sample may be too short, coverage too weak or affirmative evidence absent.

~~~mermaid
flowchart TD
    A[Read original thesis and falsification condition] --> B{Was an assessment actually performed?}
    B -- No --> C[Record not assessed]
    B -- Yes --> D[Inspect available supporting and opposing evidence]
    D --> E{Enough evidence for a judgment?}
    E -- No --> F[Record insufficient evidence and gaps]
    E -- Yes --> G{Original falsification condition met?}
    G -- Yes --> H[Record invalidated with reasons]
    G -- No --> I{Material opposing evidence?}
    I -- Yes --> J[Record challenged and unresolved dispute]
    I -- No --> K{Clear affirmative support?}
    K -- Yes --> L[Record supported]
    K -- No --> F
    C --> M[Preserve original version; never auto-trade]
    F --> M
    H --> M
    J --> M
    L --> M
~~~

This diagram explains a **review methodology**, not a program that mechanically proves investment truth from four fields. Each assessment is a dated, attributed research opinion rather than an instruction to trade. User authorization and execution controls remain separate.

## 9. Even Correct Arithmetic Can Produce an Incorrect Financial Story

The arithmetic behind 15%, 23% and 20% is elementary. In real fund portfolios, much of the difficulty occurs **before** arithmetic.

A fund may disclose only its largest holdings, not the complete book. Two disclosures may cover different dates. Domestic and overseas funds can differ in currency, time zone, share class or classification. Treating missing exposure as zero creates fictional completeness.

Sector exposure and whole-portfolio risk are also different measures. For compatible asset-return series with consistent frequency and assumptions, portfolio variance is:

\[
\sigma_p^2 = w^\mathsf{T}\Sigma w
\]

In ordinary language, **w** describes portfolio weights; **Σ** describes each asset’s variability and how holdings move together. Knowing how much technology is held is not enough to know total portfolio volatility.

Our teaching example provides no aligned historical return series, covariance estimate or rebalancing convention. We therefore cannot calculate a justified total-volatility change. Nor does it give credible valuation or fee inputs for a precise “cheap or expensive” conclusion.

The following minimal Python example calculates technology weight for **fully supplied synthetic data** and refuses missing look-through rather than silently assigning zeros:

~~~python
from math import isclose, isfinite

def tech_exposure(weights, lookthrough):
    if set(weights) - set(lookthrough):
        raise ValueError("Missing look-through data")
    if not isclose(sum(weights.values()), 1, abs_tol=1e-9):
        raise ValueError("Weights must sum to one")
    if any(not isfinite(x) or not 0 <= x <= 1
           for x in [*weights.values(), *lookthrough.values()]):
        raise ValueError("Invalid proportion")
    return sum(w * lookthrough[k] for k, w in weights.items())

lookthrough = {"broad": .30, "tech": .80, "bond": 0., "cash": 0.}
plans = {
    "A": {"broad": .50, "tech": 0., "bond": .30, "cash": .20},
    "B": {"broad": .50, "tech": .10, "bond": .30, "cash": .10},
    "C": {"broad": .40, "tech": .10, "bond": .30, "cash": .20},
}
for name, weights in plans.items():
    print(f"{name}: {tech_exposure(weights, lookthrough):.1%}")
~~~

The output is A: 15.0%, B: 23.0%, C: 20.0%. This verifies one weighted-exposure calculation, **not** a full engine for fund-of-funds nesting, leverage, derivatives or incomplete disclosures.

That is why the investment perspectives should share verified inputs and deterministic calculations wherever possible before offering different interpretations. When source coverage cannot support a conclusion, narrow the conclusion instead of manufacturing a number.

## 10. Personalization and Collaboration: Assist a Decision, Never Make It Without the Investor

An investor might save recurring instructions such as “compare doing nothing before any rebalance,” “check my cash needs first,” or “explain how the thesis could fail.” Such instructions can improve relevance without pretending that the system already knows the user’s actual needs.

A saved profile is not a verified statement of risk tolerance, and it is not permission to execute trades. Someone enthusiastic about technology needs an assistant that can challenge the extra risks, not one engineered to agree with their preference.

As of October 24, 2026, ETF Agent had six optional investment methods, bounded direct Bull/Bear exchange and versioned links to the original investment thesis, with scoped engineering verification. Whether real models consistently discover more valid counterexamples than a single Main, and whether the cost is justified, still requires comparable live tasks under the same evidence, time and financial-quality criteria. One convincing simulated dialogue or passing implementation test cannot establish the benefit.

We did not build these features so that an AI report could claim to contain more experts. We built them in pursuit of a rarer research process: **one that states its reasons clearly, explains how those reasons might fail, and is willing to revise them when qualified counterevidence arrives.**

---

### References and related reading

[1] Investor.gov, [Asset Allocation and Diversification](https://www.investor.gov/introduction-investing/getting-started/asset-allocation). General context for underlying investments and diversification, not a source for our synthetic numbers.

For fees and ownership costs, see Investor.gov’s [Mutual Fund and ETF Fees and Expenses](https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/mutual-fund-and-etf-fees-and-expenses-investor-bulletin). Factor methods require market- and return-basis discipline; see the [Kenneth French Data Library](https://mba.tuck.dartmouth.edu/pages/faculty/ken.french/Data_Library/f-f_5developed.html).

Engineering background: [Subagent collaboration](/en/articles/agent-subagent-context-specialization) and [bounded Bull–Bear peer dialogue](/en/articles/bounded-bull-bear-peer-dialogue). For continuous research, see [After the weekly report, does the Agent remember why?](/en/articles/agent-weekly-thesis-history-continuous-research). More essays are in the [ETF Agent article collection](https://github.com/hpoenixf/eff-agent-article); Stars welcome. This article is not investment advice.
