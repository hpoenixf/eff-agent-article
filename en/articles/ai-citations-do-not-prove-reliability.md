---
title: "Why AI Answers with Many Citations Can Still Be Unreliable"
description: "Traceability, source support, completeness of user answers, misleading coverage metrics and the limits of AI judges."
---

# Why Does an AI Answer with Lots of Citations Still Feel Unreliable?

Anyone who has written an academic thesis probably recognizes a problem:

**Having a reference does not mean the cited paper supports the sentence that precedes it.**

Under deadline pressure, a writer may first assert:

> Digital transformation improves enterprise project-management efficiency.

Then search “digital transformation,” “project management” and “efficiency,” find a plausibly titled paper, and attach citation [12].

The paper is real. The reference is properly formatted. Whether paper 12 actually demonstrates that claim is a different question.

Humans do this. AI can too.

Modern AI answers often end sentences with strings of citations: [1][2][3][4]. That presentation naturally creates confidence. We once followed the same intuition in our research agent: if the system knows which documents were read, which mattered and which were cited, can it establish that **the answer is adequately grounded**, or even that **the user's question was fully answered**?

The gaps between these questions turned out to be much larger than expected.

## 1. Citations First Answer “Where Did You Get This?”

Suppose a user asks:

> Do my Fund A and Fund B have too much overlap?

The agent reads both holdings datasets. The system might retain:

~~~text
Fund A holdings
Source: fund holdings interface
Data as of: 2026-09-30
Record ID: ev-a
~~~

~~~text
Fund B holdings
Source: fund holdings interface
Data as of: 2026-09-30
Record ID: ev-b
~~~

The model eventually writes:

> The two funds have some overlapping top-ten holdings, so they may create duplicate exposure. [Source A][Source B]

At this point code can establish several valuable facts: both sources were actually retrieved, the citations were not invented by the model, the sources belong to this research scope and their current eligibility remains valid.

Without such checks, a model could claim “according to the fund's 2026 annual report” when no annual report was ever read.

The direct value of a citation is **traceability**:

~~~text
Answer
  ↓
Citation
  ↓
Material actually retrieved
  ↓
Original source
~~~

That answers “what did this statement reference, and can we follow the link?” It does **not** yet prove that the conclusion is correct.

## 2. A Real Source Might Not Support the Claimed Conclusion

Imagine the source contains:

~~~text
Fund A sector allocation:
Technology: 30%
Financials: 20%
Industrials: 10%
~~~

The model says:

> Fund A has very low risk. [Source A]

The citation may be perfectly valid mechanically. The data is real, the timestamp is eligible and the source identity matches.

But **does sector allocation alone prove low risk?**

Certainly not. We might need volatility, maximum drawdown, concentration, asset classes, underlying security properties and the user's definition of risk.

These are two questions:

1. Is the citation a legitimate reference to a real source?
2. Does the cited source *actually support* this particular claim?

The first is amenable to code verification. The second requires understanding the source and natural-language assertion.

**Correct citation ≠ correct conclusion.**

A valid citation proves that the statement was linked to a source, not that the source justifies it.

## 3. Between “Cited” and “Supported” Lies Interpretation

The full reasoning chain is:

~~~text
Source exists
    ↓
Answer cites it correctly
    ↓
Source supports the specific claim?
~~~

Some relations are straightforward. If a source states that Fund A had an 8% maximum drawdown over the past year, an answer repeating exactly that claim is easy to check.

But an answer adding “therefore Fund A is suitable for conservative investors” has crossed into a different kind of judgment.

Another source might state that Funds A and B share six of their top-ten holdings. “They have severe duplicate exposure” might be reasonable or exaggerated depending on the overlapping weights, holdings outside the top ten, sector differences and whether the user cares about company or industry overlap.

Moving from source to claim always involves interpretation. Checking one citation ID cannot complete that step.

## 4. Even a Supported Statement Might Not Answer the Question

Return to the user's question about significant overlap.

Suppose the model responds:

> Fund A has 30% technology exposure. Fund B has 28%. Fund A manages CNY 5 billion and Fund B manages CNY 8 billion.

Assume all four figures are authentic and correctly cited.

The answer performs well against “did you fabricate the numbers?” But it still does not establish **whether the two funds have duplicate exposure**. It has described some facts without answering the comparative question.

The full ladder therefore has another step:

~~~text
Authentic source
    ↓
Correct citation
    ↓
Evidence supports claim
    ↓
Claim answers user's question
~~~

The danger is that a system can improve the first two stages and assume the latter two have improved automatically.

## 5. Our Original Goal Was Not an “Answer Confidence Score”

It is important to correct a historical misconception. We did not initially try to calculate “the answer has an 85% probability of being true.”

We were addressing two more concrete needs.

### First: Did We Gather Required Research Material?

A research plan has essential, supporting and optional sources.

For a top-ten holdings comparison, it might look like:

~~~text
Essential:
- Fund A holdings
- Fund B holdings
- Dates of both holdings snapshots

Supporting:
- Prospectuses
- Sector distributions of tracking indexes
- Strategy descriptions

Optional:
- Manager background
- Fund size
- Related news
~~~

If Fund A's holdings are missing, a serious holdings comparison is impossible. The system naturally wants to know whether **core input requirements were met**.

### Second: Which Parts of the User's Question Were Addressed?

The user might ask three things:

~~~text
1. Do the two portfolios overlap?
2. Where does their risk come from?
3. Should I hold both?
~~~

We might wish to track:

~~~text
1. Addressed
2. Addressed
3. Not addressed
~~~

The objective was to track **evidence availability and question coverage**, not to give a numerical confidence estimate of the model's private beliefs.

## 6. The Mistake: Treating Complete Material as a Grounded Answer

Once essential sources are identified, a simple rule seems attractive:

~~~text
All essential sources retrieved → answer is grounded
Missing essential source       → answer is advisory/incomplete
~~~

Historical versions used names such as grounded_answer and advisory_answer. **These were past fields, not part of the current terminal-state contract.** They are included here only to explain how the old design evolved.

If such a status meant only “how many required sources were obtained?”, it would be relatively narrow.

But it easily becomes “therefore the final answer itself is adequately supported and reliable.”

That step is unjustified. Source completeness describes **what the model received**. Answer correctness describes **how the model interpreted and used the evidence**. The entire reasoning process lies between them.

## 7. The Model Can Reason Badly Even with Every Required Source

Suppose a comparison needs both fund holdings, both product documents and an index methodology. All five are retrieved.

That establishes that major research materials were obtained.

It does not justify the model writing:

> Fund A is clearly superior to Fund B.

The supplied materials might never have compared return, risk, suitability, costs or future expectations.

Therefore:

~~~text
Complete research material ≠ correct reasoning
Complete research material ≠ complete answer
~~~

Promoting “all sources collected” into a declaration that the answer is well supported makes code perform a semantic quality judgment it cannot establish.

## 8. Fifty-Seven Reads, All Marked “Required”

A real research experiment exposed another weakness.

Across **four consecutive runs** there were **57 document reads**. All **57/57** were classified as “required.”

The intended distinctions—essential, supporting, optional—had collapsed into “everything matters.”

Even reminding the model that the classification would affect final-answer status did not visibly improve the distribution.

That showed one problem: if every source is mandatory, the classification has little discriminatory power.

A deeper problem remained: **even a perfectly accurate essential/supporting/optional classification could not prove that the final answer was correct**. More optimization of that classifier would not solve the fundamental question.

## 9. Why Not Just Measure Citation Coverage?

A tempting replacement is to count cited paragraphs.

~~~text
Answer paragraphs: 4
Paragraphs with citations: 3
Citation coverage: 75%
~~~

Or create a binary rule:

~~~text
Has citation → supported
No citation  → unsupported
~~~

But the same failure returns.

A source reports that Fund A gained 15% over the past year. The model writes “therefore Fund A is suitable for conservative investors” with that source attached.

The source and citation are real; suitability does not follow.

Citation coverage measures **how much content is linked to sources**, not **whether the sources support that content**.

Replacing an evidence-completeness score with a citation-count score would not solve the semantic gap.

## 10. More Citations Can Make an Answer Worse

Not every sentence needs a citation.

“Next we compare sector and holdings exposure” is a structural transition. “If sector concentration matters most to you, compare the combined technology exposure” is an analytical suggestion whose support and citation needs depend on context.

If the system defines “no citation = no support,” the model may learn to place a citation after every sentence instead of reasoning more carefully.

The final metric could display **100% citation coverage** while actual answer reliability remains unproven.

**A citation is primarily a trace relationship, not an answer quality score.**

## 11. The Hard Problems Are the Last Two Steps

Return to the chain:

~~~text
Authentic source
    ↓
Correct citation
    ↓
Does source support claim?
    ↓
Does claim answer user's question?
~~~

The last two require semantic understanding.

**Source support** asks what the material actually says and what the model's sentence claims.

**Answer relevance** asks what the user really wanted and whether the response actually addresses it.

Neither can be replaced by:

~~~text
citationCount > 3 → claim is true
requiredSourcesRead → user's task is complete
~~~

## 12. Why We Stopped Letting Runtime Judge Open Semantic Questions

We tried several shortcuts historically: using source status to infer grounding, citation presence to infer quality, fixed fields to infer completion, or keywords to classify statements.

All attempted to derive a **hard semantic conclusion** from signals that are easier to check.

We increasingly separated them.

Programmatic checks can establish what was retrieved, source identity, staleness, citation validity and which answer segments depend on which sources.

They cannot automatically conclude from those facts alone that the source supports the sentence or that the sentence answers the user.

## 13. Should Another Language Model Be the Judge?

The opposite extreme is to hand all such questions to a second model:

> Does this evidence support the claim?
>
> Does this answer completely address the user's question?

A model judge can make more contextual semantic evaluations than crude citation counts or keyword matching.

It is not infallible. It may miss source details, misunderstand the user, disagree on ambiguous judgments, be misled by professional-looking citations or produce different judgments when replaced with another model.

~~~text
Model A generates answer
            ↓
Model B evaluates answer
~~~

This is **a semantic quality evaluation**, not absolute proof that the system has established correctness.

## 14. The More Honest Chain We Kept

We did not remove the evidence and citation system.

We still retain which documents were read, where they came from, their timestamps, which answer parts cited them, what dependencies attach to each segment, and which parts must be rechecked after source revocation.

These are essential. They turn “the model says it looked something up” into “we can independently locate what it actually read.”

What we stopped doing was automatically promoting those facts into “the answer is grounded” or “the user question is completely solved.”

~~~mermaid
flowchart TD
  S["Source authenticity"] --> C["Citation attribution"]
  C --> E["Evidence supports the claim?"]
  E --> A["Answer addresses the user question?"]
~~~

The first two stages primarily establish traceability. The last two are genuine content-quality evaluations. Even when a language model judges them, they remain assessments rather than formal proofs.

## Conclusion

Why do many citations fail to guarantee a reliable AI answer?

Because **retrieving material, citing it, interpreting it and answering the question are four different activities**.

Numerous citations suggest that the earlier traceability chain may be more complete. They do not ensure the model understood the source or the user's actual question.

I now interpret “has citations” as:

> **This answer is easier to check.**

Not:

> **This answer has been proven trustworthy.**

Semantic judgment is still needed to decide whether evidence supports a claim and whether the claim answers the question. Models are better suited than naive rules for those judgments, but models can be wrong too.

Evaluation records should keep mechanical facts—source identity, eligibility and structure—separate from semantic assessments of evidential support and task relevance. Citations provide an entry point for review. They do not perform the review themselves.
