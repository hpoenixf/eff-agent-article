---
title: "Why Can a Fund Research Report Still Make Unsupported Conclusions?"
description: "A bounded review of real-model fund reports shows how cash reconciliation, incomplete holdings coverage and ETF trading rules can invalidate claims even when the report looks complete; learn to assess what each claim is entitled to say."
date: 2026-11-05
readingBrief:
  takeaways:
    - "Cash flows, holdings rankings and trading costs require different checks: reconciliation, coverage and applicable market rules; genuine sources cannot substitute for those decisions."
    - "With only partial holdings, report the largest contribution among observed positions, not the largest underlying holding of the entire portfolio."
    - "Passing preregistered necessary checks does not certify every additional claim in a long report; later findings should not silently rewrite prior scores."
    - "Attach the object, as-of date, denominator, coverage and permitted strength of wording to consequential claims; when evidence falls short, narrow the claim rather than invent certainty."
  appliesTo:
    - "Engineers and researchers evaluating portfolio look-through, fund comparisons or consequential numerical claims in investment research reports."
    - "Agent teams with saved real-model answers that need reproducible criterion-level review and source readback."
  notFor:
    - "Not a current fund recommendation or comprehensive investment advice, and not an estimate of aggregate model accuracy from a few non-blind cases."
---

# Why Can a Fund Research Report Still Make Unsupported Conclusions?

A fund report may contain coherent tables, genuine citations and some correct calculations. It may even pass most checks that were defined before the research began, yet assert an investment conclusion the available evidence cannot support.

That happened in a recent ETF Agent review. A real model completed a research run and its final HTML was readable. Of four necessary checks fixed before the run, only two passed: the claimed cash usage did not reconcile beginning and ending cash, while a geographic-exposure estimate with incomplete coverage was described as a strict lower bound for the entire portfolio. A subsequent review of the same saved answer found that the label “largest individual holding” exceeded the holdings coverage actually obtained.

The observations came from real model execution over public fund material and synthetic portfolio inputs, followed by a **non-blind, bounded assistant review** of saved reports. They are neither real personal-account results nor an independent audit. This article asks a narrower engineering question: **When is a number usable, but not entitled to support the sentence written around it?**

## 1. A cash table: correct-looking numbers do not reconcile themselves

The first failure is familiar. A report presents cash movements and balances, and individual values appear to have sources. Yet the claimed cash draw cannot be reconciled with the beginning and ending cash balances.

In a simplified single-currency cash account, with matching dates and definitions, there must at least be a coherent bridge:

```text
Ending cash = Starting cash + Inflows - Outflows + Explained adjustments
```

A report might use “cash used” inconsistently across transfers, dividends, fees or measurement dates. Individual arithmetic can be sound while the overall explanation is unsound. The correction is not simply to ask the model to calculate again. It is to require a **reconcilable relation across the same object, period and cash definition**, with unexplained residuals made explicit.

The saved research document contained a numerical inconsistency. We cannot attribute it precisely to a particular tool, prompt turn or compaction step from the available evidence, and do not present it as a confirmed Runtime root cause. The transferable decision is to evaluate the opening-to-closing cash bridge independently from whether some individual computations succeeded.

## 2. “Largest holding”: missing positions are not zero

The subtler problem arises in portfolio look-through. The reader wants to know the largest exposure to a single underlying company. The Agent reads the top ten holdings of two funds, computes their contributions to the overall portfolio, and calls one company the “largest individual holding.”

But **the largest contribution in disclosed holdings and the largest contribution in the full portfolio are different propositions.**

In that saved answer, company X contributed **3.451 percentage points** of the portfolio based on available disclosures. This can support “largest among the records examined.” It cannot exclude an additional contribution from a company that also appears in a fund's unread positions.

To test that distinction, we constructed a **hypothetical completion consistent with the reported figures** after the fact. It is not a discovery about undisclosed real holdings:

| Hypothetical information | Contribution to the overall portfolio |
| --- | ---: |
| Company Y is 10.03% of fund A, while fund A is 30% of the portfolio | 3.009 percentage points |
| Assume Y also represents 1.50% of fund B, while fund B is 40% of the portfolio | 0.600 percentage points |
| Total hypothetical contribution of Y | **3.609 percentage points** |
| Reported contribution of X in the observed holdings | **3.451 percentage points** |

This demonstrates only that there is a possible completion, consistent with the observed top-ten limits, under which Y overtakes X. It **does not establish** that Y actually does so in the real holdings, or that we accessed an undisclosed position.

The logical consequence matters: if the Agent examined only top-ten holdings, and other positions or broad-market constituents are still unknown, it has not ruled out such a completion. It may rank the examined subset and disclose its coverage; it should not elevate the subset ranking to an unconditional full-portfolio result.

The same applies to the label “strict lower bound.” That label requires a proof that omitted exposures and the method of aggregation cannot invalidate the asserted bound, using consistent constituent weights and denominators. Calling an estimate conservative does not establish this mathematical property.

## 3. Trading costs: the correct number belongs to a specific market rule

A separate research run compared two ETFs' quarterly returns, holdings overlap and costs. The question, reference criteria and model execution were recorded. Its original answer met all four preregistered necessary criteria, but an additional post-hoc review found a statement about distribution and changes in fund assets that presented an unverified inference too confidently. The original four scores remain unchanged: **passing necessary criteria is not a certification of the entire report.**

A subsequent real-model repeat of the same question passed the source-and-time, return-and-unit, and two-fund holdings-calculation criteria. It failed the shared-risk-and-cost criterion: the report listed “stamp duty on secondary-market ETF trades” as an investor cost.

This was not an arithmetic error. It applied a **tax rule for another class of securities transaction** to the ETF secondary-market trade under discussion. The Shanghai Stock Exchange's [ETF investor-education Q&A](https://edu.sse.com.cn/best/article/mcontent/c/4731121.shtml) states that such ETF trading does not incur stamp duty; the [Shanghai Taxation Bureau's FAQ](https://shanghai.chinatax.gov.cn/zcfw/rdwd/202309/t468612.html) specifies the stock and stock-based depositary-receipt scope of the securities-transaction stamp tax. These sources support the stated trading scenario, not a universal rule covering all security types, overseas exchanges or creation/redemption arrangements.

The lesson for domain evaluation is to bind cost assessment to the **instrument, trading venue, secondary-market versus creation/redemption route, and applicable date** before summing fees. A precise fee calculator cannot choose the correct legal and market applicability assumptions by itself.

The subsequent run also recorded successful adoption of a context summary. That establishes a compaction step was committed and used in later requests; it does not establish that compaction caused the cost error or improved financial correctness. The engineering observation and the financial evaluation are separate facts.

## 4. Why “four passes” do not certify every sentence

A useful evaluation does not merely attach a total score to a long report. It states what that score actually covers.

Here we have three bounded observations. The original full fund study failed two frozen necessary checks. Another two-ETF report met its four checks but contained a further unsupported statement. The subsequent repeat failed the applicable trading-cost check. These involved different runs, execution conditions and evidence windows: they cannot be plotted as a credible quality trajectory of “50%, then 100%, then 75%.”

Instead separate three layers:

| Layer of review | Question answered | Not established |
| --- | --- | --- |
| Source and execution facts | Was this material actually read, and which answer revision was saved? | Source completeness or support for each statement |
| Frozen necessary criteria | Does this answer satisfy the limited checks declared before dispatch? | Correctness of every extra claim in a long document |
| Post-hoc claim review | Does a newly noticed assertion overreach its evidence? | A rewritten historical score or aggregate model performance |

Two opposite mistakes are possible: silently changing a preregistered score because a new issue was discovered, or hiding a real issue because the original rubric passed. The better practice is to **preserve the old assessment, record new findings separately, and revise and refreeze the task and reference before any new scored run**.

Identity binding is distinct from source support, too. Matching the answer and source fingerprints proves the assessment refers to the same artifacts. It does not prove the reviewer examined every supporting source or that merely including a quarterly report in the result list supports the specific claim.

## 5. Give conclusions an eligibility condition, not just a number and a link

This discipline can fit into a compact research-review table. It does not require a new, all-knowing “financial correctness Agent.” For each potentially consequential claim, check five dimensions:

1. **Object:** Is this about a fund, share class, underlying company, account or whole portfolio? Do not silently switch within a sentence.
2. **Time:** Do the disclosure date, holdings as-of date, acquisition time and comparison window agree?
3. **Denominator and method:** Is the value a within-fund weight, portfolio contribution, return difference in percentage points, cash balance or transaction cost?
4. **Coverage:** Did the system read top-ten holdings, two identified quarterly reports, every eligible document or the complete underlying positions? An item not retrieved is not an item proven absent.
5. **Permitted wording:** Is “largest within observed disclosures” justified, or has the full-portfolio maximum genuinely been established? Is a conditional statement warranted instead?

A report with partial holdings need not be blocked wholesale. A more defensible statement would be:

> Among the fund holdings examined in this run, company X had the largest disclosed portfolio contribution at 3.451 percentage points. Other holdings and some broad-market constituents were not fully obtained, so we cannot determine whether X is the largest exposure across the complete portfolio.

This is more specific than adding “for information only” to every paragraph. **The uncertainty belongs beside the exact conclusion it affects.** If the cash account does not reconcile, repair or disclose the cash bridge. If the transaction rule does not apply, withdraw the erroneous cost item rather than burying it under a general disclaimer.

In implementation terms, deterministic computation owns formulas and unit identities; data access owns sources, versions and coverage; the Main Agent owns synthesis; and review checks the eligibility of consequential claims. Cooperation among these responsibilities does not make any one of them an authority that automatically validates every sentence.

## Conclusion: a good report knows which claim it cannot yet make

The most important distinction from this review is not a count of model mistakes. It is between **a failed numerical reconciliation, incomplete evidence coverage, and an inapplicable market rule**. All can hide inside a polished report with genuine sources, but each requires a different remedy.

For the next financial research evaluation, start with a small set of claims that materially affect interpretation. Check objects, dates, denominators, coverage and applicable rules; recompute what is computable, name incomplete coverage and withdraw inapplicable charges. A bounded partial answer or a request for more evidence is often more useful than allowing a single score to vouch for every sentence.

Related reading: [A trustworthy evidence chain](./financial-agent-trustworthy-evidence-chain.md) follows provenance across tools; [Python results and financial interpretation](./financial-agent-python-result-consumption.md) examines methods and result consumption; [Agent evaluation panorama](./honest-agent-evaluation.md) covers score identity, denominators and evidentiary scope. This case study focuses on **the strength of claim that the available financial evidence actually permits**.
