# More Than One Investment Expert: How Multi-Perspective Agents Test an Investment Thesis

> Multi-Agent Investment Research · Part Three | Shared facts, different methods, and disagreements worth resolving

Imagine you already own several funds. You are considering a technology ETF and ask an AI assistant: “If I add this fund, will my portfolio become more diversified?”

An assistant can easily produce a polished report: promising industry prospects, valuation concerns, fees, and a familiar reminder to invest carefully. What you actually need is more specific: **How much of this ETF overlaps with the funds I already hold? If someone claims the purchase improves diversification, who checks whether that claim is true?**

That is why ETF Agent introduces multiple investment perspectives and optional Bull/Bear research. The point is not to let six simulated “investment legends” deliver six speeches. It is to break a vague assertion into checkable questions, bring in only useful specialists, allow meaningful disagreement, and keep Main Agent responsible for one evidence-based, conditional synthesis.

This article focuses on **how investment-perspective Agents are selected, how they share facts, and how they handle disagreement**. The details of Peer Messages, waiting, waking and cold recovery belong to [the preceding article on the Bull/Bear runtime](bounded-bull-bear-peer-dialogue.md). The broader end-to-end research workflow is reserved for [our architecture outlook](multi-layer-agent-collaboration-outlook.md).

## 1. Investors Do Not Simply Need More Experts

“What is this ETF?” can often be answered using its benchmark, fees, holdings and risk disclosures. “Should I add it to my portfolio?” also requires information about existing exposures, the funding source and the investor's longer-term plan.

No single metric answers all those questions. High growth does not imply a low valuation; owning more fund names does not ensure less underlying concentration; lower historical volatility does not exclude severe losses.

We want multi-perspective research to do three things: **identify important assumptions, apply suitable methods to the same underlying facts, and revise a reason when legitimate counterevidence emerges—rather than vote on competing recommendations.**

That means specialists are optional. If the only question is a fund's current management fee, a permitted disclosure lookup may be sufficient. An extra Child Agent is justified only when different analytical methods or an independent challenge might add material value relative to its cost in time and model calls.

## 2. What Do the Six Investment Methods Actually Examine?

We registered six optional investment methods on the existing Child execution mechanism. Their names refer to analytical schools and established research traditions. **The model does not impersonate these people or invent their current investment advice.**

| Perspective | Its first question | What it cannot conclude from the label alone |
| --- | --- | --- |
| **Markowitz: allocation** | How do correlations, marginal risk and risk contributions change? | Without aligned return series, sector names cannot yield an optimal allocation |
| **Taleb: tails and fragility** | What happens under market, liquidity or cross-border infrastructure stress? | Historical VaR does not capture every black swan or justify fabricated probabilities |
| **Bernstein: long-term discipline** | Is the change consistent with the time horizon, cash needs and plan? | Current holdings do not establish the investor's true risk tolerance |
| **Bogle: implementation cost** | Which index, tracking difference, overlap and total costs matter? | The lowest displayed price is not always the most suitable implementation |
| **Marks: compensation for risk** | Does today's price adequately reward the risks being taken? | A macro story cannot precisely forecast a market turning point |
| **Fama–French: factor explanation** | Which comparable historical factors may explain observed returns? | An explanatory regression is not manager skill, causality or a forecast of alpha |

For a proposed technology ETF, Markowitz may focus on correlation with current holdings; Bernstein may question whether cash earmarked for a payment six months from now is truly available; Bogle may compare the total cost of alternative funds offering the same intended exposure. They need not arrive at identical sentences because they are answering different questions.

The value for the investor is not that “six professionals appeared.” It is that **one decision is tested against different, clearly identified criteria**.

## 3. Independence Starts With Shared Facts, Not Shared Opinions

Generating three separate reports is easy. The hard part is avoiding different disclosure dates, incompatible data definitions and seemingly irreconcilable conclusions.

Our design prefers to reuse **the current Run's authorized source material and deterministic calculations** that Main already has. Existing `inputRefs` and Result/Lineage identities can pass actual result references to a Child. A new expert should not automatically fetch the same portfolio again or maintain its own competing truth database.

Three concepts must remain separate:

1. **Fact:** dated holdings, a product disclosure or an actually executed calculation, with its source and measurement basis.
2. **Hypothesis:** a testable proposition such as “adding this ETF improves diversification.”
3. **Opinion:** the interpretation a particular investment method develops from those facts and hypotheses.

If Main tells every Child that it already believes the purchase improves diversification, and smuggles that provisional belief into the source facts, “independent analysis” may simply repeat Main's initial position. A better handoff carries the original materials and user restrictions. When critiquing an earlier view, label that view as a **claim to be examined**, not verified evidence.

Sharing result identities also does not share permissions. A Child authorized to read protected data cannot grant sibling Children access by paraphrasing it. Host authorization and resource rules still govern every real tool call, disclosure and action.

## 4. What Should Several Agents Do With the Same Portfolio?

We use **entirely synthetic teaching data**, not real holdings. Suppose the original portfolio contains a broad equity fund (50%), bonds (30%), and cash (20%). The broad fund is 30% technology by the chosen classification, while the candidate technology ETF is 80% technology. We assume the disclosure dates, classifications and coverage are aligned and complete; bonds and cash have no equity technology exposure under this teaching definition.

| Plan | Broad equity fund | Technology ETF | Bonds | Cash | Technology-sector exposure |
| --- | ---: | ---: | ---: | ---: | ---: |
| A: do nothing | 50% | 0% | 30% | 20% | **15%** |
| B: buy with cash | 50% | 10% | 30% | 10% | **23%** |
| C: replace broad equity | 40% | 10% | 30% | 20% | **20%** |

The deterministic calculation is simply the sum of each fund's portfolio weight multiplied by its technology-sector weight. Three experts need not each recalculate it. The interesting question is **how they use the same qualified number differently**.

- **Allocation perspective:** Plan B lifts technology-sector exposure from 15% to 23%, raises the overall equity allocation and reduces cash. Without comparable return and covariance data, it still cannot prove that overall portfolio volatility must increase.
- **Long-term discipline:** Does that reduction in cash use money needed for a near-term payment? Until the investor confirms the need, the answer remains unknown.
- **Implementation perspective:** If the real objective is an intentional technology overweight, which ETF benchmark, fees, trading conditions and overlapping holdings justify the implementation? Missing actual fee data cannot be replaced with precise-sounding numbers.

These observations challenge a **specific proposition**: “Because there is one more fund, technology exposure cannot rise.” They do not establish that all measures of diversification worsened, or that the investor must buy or sell.

This is a common multi-Agent failure mode: concatenate three expert reports and call the result “synthesis.” **Genuine synthesis relates different methods to one choice, including conditions that are still unresolved.**

## 5. When Is a Bull–Bear Exchange Worthwhile?

Different methods do not always require a debate. For “What is the overlap percentage?”, source retrieval and calculation matter most. When an important decision depends on a **falsifiable hypothesis**, an independent challenger may become valuable.

Suppose original hypothesis H1 says: “Plan B does not increase technology-sector exposure.” Its original falsification condition is: on complete, comparable look-through data, B's technology weight is greater than A's.

A simplified **synthetic teaching exchange**, not a transcript from a real model run, might look like this:

> **Bull:** The technology ETF might increase targeted growth exposure, but I have not verified the assertion that more funds necessarily improve diversification.
>
> **Bear:** Under the aligned data, Plan B increases technology exposure from 15% to 23%, satisfying H1's original falsification condition. Should you withdraw that specific proposition?
>
> **Bull:** I withdraw H1. If the investor wants an intentional technology overweight, we still need to assess the price, cash needs and whole-portfolio risk. We cannot claim that improved diversification was already demonstrated.

The useful change is not that Bear “won.” Bull actually revised a clearly identified reason.

ETF Agent retains ordinary Main-to-Child delegation and Child-to-Main result handoff, while an admitted pair of Bull/Bear Children can **directly exchange public challenges and replies** within the original authorization. Main need not rephrase every exchange. They may stop early rather than exhaust a round quota. The actual transport, round bookkeeping, waiting and recovery mechanics are covered separately in [the Bull/Bear runtime article](bounded-bull-bear-peer-dialogue.md).

## 6. Main Is Responsible for Synthesis, Not a Vote

If two experts disagree, which one should the investor trust?

**A vote, averaged position or consensus score cannot replace a supported investment assessment.** If one perspective needs correlations and another needs confirmation of cash requirements, averaging “buy 10%” and “do not buy” into a 5% order resolves neither missing input.

Main should bring together three categories: sourced facts and actual calculations; attributed findings and material differences from the specialists who truly participated; and conditions still unknown or awaiting investor clarification. If a Child fails or has not produced a result, Main cannot manufacture that specialist's vote. Independent valid findings remain deliverable.

**A suitable user-facing synthesis**, still entirely hypothetical, might say:

> Verified change: under these complete synthetic inputs, Plan B takes technology exposure from 15% to 23% and cash from 20% to 10%.
>
> Revised rationale: owning one additional fund did not establish that technology exposure was diversified. That specific reason should be withdrawn.
>
> Unresolved: total portfolio volatility, actual cash needs, ETF fees and valuation inputs remain insufficiently established.
>
> Next step: if the true goal is an intentional technology overweight, analyze that goal and its implementation directly. Do not create an automatic trading instruction.

The investor benefit is not that AI sounds more confident. It is **knowing which reason changed and what remains necessary for a decision**. Demonstrating a real quality improvement requires independent comparison, not this synthetic case alone.

### Optional Research Reviewer: Audit the Study, Not the Vote

Investment perspectives determine **which method to apply**; Bull/Bear determine **who challenges a specific premise**. ETF Agent also implements an independent **Research Reviewer Child** to inspect **the original evidence, material gaps, and whether further investigation is worth the cost**. It is neither a seventh investing method nor a third peer in the Bull/Bear dialogue.

If Main is preparing to claim that another technology ETF improves diversification, Reviewer can check the original authorized portfolio facts, calculations, and disclosure dates—not just Main's summary. Has the analysis confused industry weight with total portfolio volatility? Did it overlook cash needed in six months? Reviewer may conduct authorized targeted verification and suggest `continue`, `pivot`, `finalize`, or `suspend`.

Reviewer reuses existing Child execution, budget, and recovery. Main can call `consult_research_reviewer` when manual review is enabled; Runtime may admit a bounded automatic review only under configured factual triggers and resource limits. **Reviewer cannot approve an answer, certify investment truth, or block a lawful Main publication**. Sufficiently supported research can be delivered without a review.

The path has [scoped engineering acceptance](https://github.com/hpoenixf/etf-agent/blob/main/openspec/changes/archive/2026-10-18-agent-add-research-convergence-reviewer/verify.md), but real financial-quality gains and incremental cost still need separate evaluation. There is also an **explicit post-publication financial-semantic review report**; this separate evaluation tool is not the in-Run Reviewer Child or a mandatory final approval step.


## 7. Under the Hood: Several Methods, One Child Runtime

We did not build six separate runtimes for Markowitz, Taleb, Bernstein, Bogle, Marks and Fama–French. Ordinary `web/pdf/python` expresses an execution specialty; optional `perspectiveId` identifies an investment method; `peer.role` represents a legitimate Bull/Bear assignment; and `subagentProfileId` refers to a saved user-authored method. **These are composable dimensions, not four levels of supervision.** The end-to-end qualification of the custom-profile combination remains separate and open.

A conceptual example follows; it is **not an unchanged receipt from a real model request**:

~~~json
{
  "type": "python",
  "task": "Review the marginal risk of the proposed technology allocation",
  "perspectiveId": "investment-perspective/markowitz@1",
  "inputRefs": ["the-current-run-authorized-calculation"]
}
~~~

The important properties are identity and authority, not the JSON syntax:

- A Host-registered method has a stable ID, version and content hash. Cold recovery cannot quietly replace it with a different method that happens to have the same name.
- Main should reuse real `inputRefs` and original provenance, never promote its provisional thesis into source fact.
- A saved personal Profile is identified user-authored method guidance, not an elevated system instruction or permission for peer messages, trading, additional tools or budget.
- Children return attributed findings and gaps. Main owns the investment synthesis and final prose. Failure of an optional perspective cannot veto independently authorized results.

~~~mermaid
flowchart TD
    U[Investor asks a question] --> M[Main confirms goal and available evidence]
    M --> Q{One research path sufficient?}
    Q -- Yes --> R[Main researches and delivers]
    Q -- No --> P[Select relevant method and Child on demand]
    P --> S[Children read the same authorized facts]
    S --> D{Material hypothesis worth challenging?}
    D -- No --> H[Hand back findings and gaps]
    D -- Yes --> B[Optional Bull Bear falsification dialogue]
    B --> H
    H --> T[Main synthesizes sources and unresolved conditions]
    T --> R
~~~

This is a **conceptual coordination diagram**, not a mandatory execution DAG. Its purpose is to avoid needless delegation while retaining meaningful independent challenges.

## 8. Engineering Success and Financial Quality Are Separate Questions

Six methods already have scoped engineering evidence around immutable registration, actual Child requests and recovery. Bounded Bull/Bear dialogue has independent evidence for real pairing, public messages and cold recovery. None of that by itself establishes that the combination gives investors better answers.

Real models can choose the wrong specialist, duplicate delegated work, recast a hypothesis as a fact or spend much longer while producing only additional prose. **Subagent cost includes model calls, waiting, duplicate retrieval and Main's synthesis**, so it is not necessarily cheaper or faster than a capable single Main.

The meaningful future comparison uses the same investor question and authorized data basis. Would a single Main discover the critical counterexample? Did a specialist contribute new verifiable information? Did Bull/Bear actually correct a mistaken reason? Was the extra time and resource use justified? Independent financial-quality qualification of the full picture is still open.

The point of investment-perspective Agents is not to manufacture more voices. It is to let each useful voice **test the same verifiable facts with an appropriate method**, disagree when warranted and remain accountable to the investor's actual question.

---

### Further reading

[Subagent foundations](agent-subagent-context-specialization.md) explains context isolation and handoff. [Bounded Bull/Bear dialogue](bounded-bull-bear-peer-dialogue.md) explains direct transport, waiting and recovery. [Multi-layer collaboration: an architecture outlook](multi-layer-agent-collaboration-outlook.md) preserves what has not yet been validated across the complete workflow. For versioned investment reasoning, see [Investment Thesis and continuing weekly research](agent-weekly-thesis-history-continuous-research.md).

Every example here is synthetic and is not an investment recommendation. The engineering work is documented in [ETF Agent](https://github.com/hpoenixf/etf-agent); the [article collection](https://github.com/hpoenixf/eff-agent-article) welcomes Stars.
