# Why Do AI Answers with Plenty of Citations Still Get Things Wrong?

Anyone who has written a thesis probably knows an uncomfortable truth:

**A citation does not automatically support the sentence preceding it.**

Under deadline pressure, someone might write:

> Digital transformation improves enterprise project-management efficiency.

Then search for papers containing "digital transformation," "project management," and "efficiency," pick a plausibly titled study, and add citation **[12]**.

The paper exists. The citation format is correct. Whether that paper actually supports the claim is another question.

Humans do this. AI systems can, too.

AI answers now routinely end sentences with **[1][2][3][4]**. The visual impression is reassuring: surely the answer must be reliable if so many sources were consulted?

When we built a research-oriented Agent, we initially followed that reasoning. We knew which sources the model read, which ones mattered, and which ones the answer cited. Could we go a step further and decide:

> **Does this answer have sufficient evidence?**

Or further still:

> **Has the user's question been adequately answered?**

We learned that these are much more distant claims than they first appear.

## 1. A Citation First Establishes Where Something Came From

Suppose a user asks:

> Are my Fund A and Fund B holdings overly redundant?

The Agent reads holdings for both funds. Its records may look like:

~~~text
Fund A holdings
Source: Fund holdings interface
Data as of: 2026-09-30
Evidence ID: ev-a
~~~

~~~text
Fund B holdings
Source: Fund holdings interface
Data as of: 2026-09-30
Evidence ID: ev-b
~~~

The model answers:

> The top-ten holdings overlap to some degree, so the funds may share exposure. [Source A][Source B]

Host can verify useful mechanical facts:

- Both source records were actually read.
- The citations are real, not fabricated identifiers.
- The records belong to this Research Run.
- The sources remain eligible under current constraints.

This already matters. Without these checks, a model could say "according to Fund A's 2026 annual report" despite never reading it.

The most direct purpose of the citation is **traceability**:

~~~text
Answer
   ↓
Citation
   ↓
Actually consumed evidence
   ↓
Original source
~~~

But **traceability is not correctness**.

## 2. Authentic Evidence May Not Support the Model's Conclusion

Suppose the Agent obtained:

~~~text
Fund A sector distribution
Technology: 30%
Financials: 20%
Industrials: 10%
~~~

Then it writes:

> Fund A has very low risk. [Source A]

The citation might satisfy every mechanical requirement: the data is authentic, fresh, and attributed to the right source.

Yet **does a sector allocation prove that overall risk is low?** Clearly not.

We may need volatility, maximum drawdown, concentration, asset classes, security characteristics, and the user's actual definition of risk.

Two independent questions exist:

1. Is the cited source real and correctly attributed?
2. Does the source **substantiate this particular claim**?

The first is often deterministic. The second demands semantic interpretation.

**Correct citation ≠ correct conclusion.**

A valid citation establishes that the model linked its statement to that source. It does not prove the statement followed from the source.

## 3. Support Requires Understanding, Not Just Matching an ID

The progression is:

~~~text
Evidence actually exists
         ↓
Answer correctly cites evidence
         ↓
Does the evidence support the claim?
~~~

Some comparisons are straightforward.

Source: "Fund A's maximum drawdown over the last year was 8%."

Claim: "Fund A's maximum drawdown over the last year was 8%."

The values and periods can be compared.

But the model might add:

> Therefore Fund A is ideal for conservative investors.

That conclusion introduces a separate judgment not established by the drawdown number alone.

Another source might say:

> Fund A and Fund B share six names among their top-ten holdings.

The model could conclude:

> The funds have significant portfolio redundancy.

Maybe. But one must still check the overlapping **weights**, holdings beyond the top ten, the significance of other positions, and whether "redundancy" refers to constituent names or sector exposure.

The transition from evidence to a conclusion always involves interpretation. A citation-ID validator cannot perform it.

## 4. Even Supported Statements Can Miss the User's Question

Return to the user asking whether two funds are too redundant.

The Agent says:

> Fund A has 30% technology exposure.
> Fund B has 28% technology exposure.
> Fund A's size is 5 billion.
> Fund B's size is 8 billion.

Assume all four statements and citations are correct.

The answer did not invent figures—but **did it answer whether the funds are redundant?**

Not really.

So the chain has four separate stages:

~~~text
Authentic evidence
         ↓
Correct attribution
         ↓
Evidence supports the claim
         ↓
The claim answers the user's question
~~~

We were making the first two stages increasingly robust while assuming the latter two had somehow become reliable as well.

## 5. We Were Not Originally Trying to Predict Answer Confidence

A historical design decision is easy to misunderstand. Our early fields did **not** aim to announce an "85% probability the answer is correct."

We were trying to resolve two practical questions.

### Did the research collect the necessary evidence?

Some sources are central to the task; others are supportive or incidental.

For example:

~~~text
Essential:
- Fund A holdings
- Fund B holdings
- Dates for both holdings datasets

Supporting:
- Product disclosures
- Index sector distribution
- Strategy description

Optional:
- Fund-manager background
- Fund size
- Related news
~~~

If Fund A holdings are missing, a serious comparison cannot be made. It seems reasonable to ask whether **essential evidence is complete**.

### Did the answer cover the user's subquestions?

A user may ask:

~~~text
1. Do the fund holdings overlap?
2. Where do their risks come from?
3. Should I hold both?
~~~

We might want a status such as:

~~~text
1. Answered
2. Answered
3. Not answered
~~~

These aims—**evidence readiness** and **question coverage**—are not the same as probabilistic confidence or correctness.

## 6. The Mistake: Promoting Evidence Completeness into Answer Quality

Once a plan identified required sources, a tempting rule appeared:

~~~text
All essential evidence collected
         ↓
Answer sufficiently grounded

Essential evidence missing
         ↓
Answer not sufficiently grounded
~~~

Historical fields included statuses resembling **grounded_answer** and **advisory_answer**. They are **retired historical fields**, not the current terminal contract. We mention them only to explain the design evolution.

If such a status meant only "how many of the planned sources were obtained," it might have been useful.

But it was readily interpreted as:

> **The final answer itself is justified and reliable.**

That inference crosses the entire reasoning process.

**Evidence completeness describes what the model received. Answer correctness describes what the model understood and did with it.**

## 7. All Sources Can Be Present While the Reasoning Is Wrong

Imagine that a two-fund comparison legitimately requires:

~~~text
Fund A holdings
Fund B holdings
Fund A product materials
Fund B product materials
Index documentation
~~~

All five are successfully retrieved. The model concludes:

> Fund A is clearly better than Fund B.

But the sources may never compare returns, downside risks, suitability, fees, or forward-looking assumptions.

**All sources retrieved ≠ reasoning correct.**

Likewise, **all sources retrieved ≠ question completely answered**.

An automatic "sufficiently grounded answer" label would therefore certify an analytical step the system had not actually checked.

## 8. The Run in Which All 57 Reads Became "Essential"

A set of **four consecutive research Runs** included **57 source reads**.

Every single read—**57/57**—was classified as **essential**.

The category was supposed to distinguish core, supporting, and incidental material. Instead, everything became important.

We even tried prompting the model that these classifications would affect the final answer state and should be used carefully. The distribution did not improve meaningfully.

A first obvious issue was that a classification where everything is "essential" has almost no discriminating value.

A more fundamental issue remained: **even a perfectly accurate essential/supporting/optional label cannot prove the answer is correct**.

Optimizing that label would not solve the actual semantic-quality problem.

## 9. Why Not Replace Completeness with Citation Coverage?

Another intuitive strategy is to count citations.

For example:

~~~text
Four answer paragraphs
Three contain citations
Citation coverage: 75%
~~~

Or:

~~~text
Has citation → grounded
No citation  → insufficient basis
~~~

This looks more direct. It has the same flaw.

Source:

> Fund A gained 15% over the last year.

Model claim:

> Fund A is well suited to conservative investors. [Source A]

The citation is authentic. The source does not substantiate the suitability recommendation.

Citation coverage measures **what fraction of content is linked to some source**. It does not measure **whether the source supports that content**.

We therefore did not simply trade one evidence-readiness score for another citation score.

## 10. More Citations May Not Produce a Better Answer

Not every sentence needs its own citation.

For instance:

> Let's examine this question from the sector and holdings perspectives.

That is organization, not a factual claim requiring external proof.

Or:

> If sector concentration is your concern, compare the combined technology exposure of the two funds.

This is an analytical instruction. Whether a separate citation is needed depends on the surrounding argument and evidence.

If a system declares **uncited = unsupported**, the model may learn to append a citation to every sentence rather than reason more carefully.

The result can be:

~~~text
Citation coverage: 100%
~~~

Nothing about that figure establishes higher accuracy.

**A citation is fundamentally a traceability relation, not an answer-quality score.**

## 11. The Hardest Parts Are the Final Two Stages

Revisit the full chain:

~~~text
Authentic evidence
         ↓
Correct citation
         ↓
Evidence supports conclusion
         ↓
Conclusion answers user question
~~~

The final two are semantic.

**Does the source support the claim?** Requires understanding both the source and the proposition being made.

**Does the answer resolve the user's question?** Requires understanding user intent and actual response content.

They cannot be reduced to:

~~~text
citationCount > 3 → conclusion established
~~~

Or:

~~~text
allRequiredSourcesRead → user question solved
~~~

## 12. Why We Stopped Asking Deterministic Code to Decide Semantics

Our earlier designs experimented with using evidence status, citation counts, fixed completion fields, or answer keywords to determine whether an answer was "grounded" or complete.

All tried to derive a **difficult semantic conclusion from an easier mechanical signal**.

We separated those responsibilities.

Deterministic code continues to validate:

~~~text
Was the source read?
Does its original identity exist?
Is it fresh and authorized?
Is the citation ID valid?
Which passage depends on which source?
~~~

But it no longer treats these checks as proof that the source supports a sentence or that the user question was answered.

## 13. Would Another Model Make the Final Judgment Reliable?

The opposite extreme is to ask a second model:

> Does the evidence support this claim?

Or:

> Does the answer fully address the user?

This is closer to a semantic task than counting IDs or keywords.

It is still fallible.

The judging model may overlook documents, misunderstand the question, interpret ambiguous conclusions inconsistently, or be persuaded by professional-looking citations. Another model may reach a different judgment.

~~~text
Model A generates answer
         ↓
Model B reviews answer
~~~

That adds a **semantic evaluation**, not an infallible judge.

Its output can inform answer-quality assessment. It cannot be relabeled "the system proved this is correct."

## 14. The More Honest Chain We Kept

We did **not** delete source and citation infrastructure.

The system continues to retain which sources were read, where they came from, when their data applies, which passages cite them, and which claims need renewed checks after source invalidation.

That moves us from **"the model says it looked at evidence"** to **"we can actually find the evidence it consumed."**

But the system no longer automatically concludes that the entire answer is correct, fully grounded, or complete merely because its source bookkeeping passed.

~~~mermaid
graph TD
SourceAuthenticity --> CitationAttribution
CitationAttribution --> EvidenceSupportsClaim
EvidenceSupportsClaim --> AnswerMeetsQuestion
~~~

The first two stages primarily establish traceability. The last two require genuine content-quality judgment.

Even when a model performs those judgments, they remain **evaluations rather than proof**.

## Conclusion

Why can a thoroughly cited AI answer still be unreliable?

Because **retrieving evidence, citing evidence, understanding evidence, and answering the question are four different activities**.

Many citations can demonstrate a well-developed retrieval and attribution path. They cannot guarantee that the model has not misread evidence or missed the user's actual concern.

I now interpret "has citations" as:

> **This answer is easier to audit.**

Not:

> **This answer has been proven trustworthy.**

Semantic assessment is still needed to determine whether documents support claims and whether claims address the user. Models are generally better suited to this than simplistic thresholds, but models can err too.

Review records should therefore report two classes of outcome separately: **which mechanical source, identity, and permission checks passed**, and **what semantic evaluation says about support and completeness**.

Citations create an entry point for verification. They cannot do the verifying by themselves.
