# Why Do AI Answers with Plenty of Citations Still Get Things Wrong?

**A citation is a route for checking a claim, not a certificate of correctness.** It helps us find the material a model relied on. It does not, on its own, establish that the material supports the conclusion or that the conclusion answers the user's question.

That distinction should shape research-agent design: make provenance and attribution dependable, and keep content judgment separate. Citation counts, source completeness, and attractive scores must not stand in for checking the reasoning.

In ETF Agent, we took a detour. We originally wanted to know whether research material was complete, but gradually let those mechanical states make quality judgments about the final answer. The important change was not a more elaborate citation score. It was to stop asking one kind of evidence to settle a different question.

## 1. Four Separate Questions Behind a Reliable Answer

Suppose a user asks whether Fund A and Fund B create excessive overlapping exposure. The agent reads both holdings disclosures and produces a cited answer. Four questions remain distinct:

| Question | What it actually examines |
| --- | --- |
| Is the material authentic? | Whether the relevant source was acquired and its identity, date, and access eligibility apply |
| Is the citation correctly attributed? | Whether the statement refers to the material actually read |
| Does the material support the conclusion? | Whether the original text, figures, and limitations justify this inference |
| Does the answer resolve the question? | Whether the user receives a supported, qualified explanation of overlapping exposure |

The diagram shows levels of examination, not an implication that success at one level automatically establishes the next.

~~~mermaid
graph TD
SourceAuthenticity --> CitationAttribution
CitationAttribution --> EvidenceSupportsClaim
EvidenceSupportsClaim --> AnswerMeetsQuestion
~~~

The first two mainly establish traceability. The last two require understanding content and the user's objective. We made the earlier infrastructure increasingly complete while assuming the later judgments had been solved along with it.

Citations remain valuable. They turn “the model says it checked” into “we can locate what it actually checked.” They provide the beginning of an examination, not its completion.

## 2. How an Authentic Citation Can Accompany an Overstated Conclusion

Consider a teaching example. A source lists Fund A's technology, financials, and industrials allocations as 30%, 20%, and 10%. The model writes, “Fund A has low risk.” Even an authentic, correctly attributed, current citation would not supply enough support.

Sector allocation describes where assets are invested. Low risk also depends on asset classes, concentration, volatility, drawdown, and what the user means by risk. The problem is not citation formatting; the conclusion exceeds what the material establishes.

Return to the two-fund comparison. Suppose the sources show six shared stocks among the top-ten holdings. That supports an observation about overlap in those disclosed positions. It does not directly establish excessive redundancy across the entire portfolio. The analysis still needs the overlapping weights, disclosure coverage beyond the top ten, and the user's allocation to each fund.

A subtler failure occurs when every sentence is correct but the question remains unanswered. Listing technology allocations of 30% and 28% and fund sizes of CNY 5 billion and CNY 8 billion, each with a source, still does not explain whether overlapping exposure warrants attention.

**Start verification from the conclusions that affect the decision and work back to their material—not from the number of citations and an assumed quality score.** A directly reported figure requires an object, date, and value check. An analysis or recommendation additionally requires checking the premises introduced by the reasoning.

## 3. Why We Stopped Certifying Answers Through Source Completeness

The original design had a reasonable purpose. Research consumes many sources, so we wanted to distinguish essential, supporting, and optional material, and track which of the user's subquestions had been addressed.

For a holdings comparison, both holdings datasets and their dates are central. Manager background or related news may be supporting material. This classification organized research; it was not intended to predict an “85% probability that the answer is correct.”

The difficulty arose in later interpretation. Historical statuses such as `grounded_answer` and `advisory_answer` distinguished answers with more complete and incomplete material. These fields have been retired from the current terminal contract; their names appear here only to explain the design's history.

When “the essential material was obtained” came to mean “the final answer is sufficiently justified,” the system crossed an unchecked reasoning step. Receiving two holdings disclosures does not establish a correct comparison of their weights. Collecting product documents does not establish that one fund is clearly superior.

Actual runs supplied another counterexample: across four consecutive research runs, all 57 source reads were classified as essential. Reminding the model that classification affected the final answer state did not meaningfully change the distribution. The categories had largely lost their discriminating value.

But the more important issue was not poor classification performance. **Even perfect essential/supporting/optional classification describes the acquisition of material; it cannot certify the final reasoning.**

We therefore stopped trying to optimize that classification into an answer-quality judgment. Source status remains useful when it describes only the facts it actually establishes.

## 4. Why Citation Coverage Recreates the Same Problem

Could we replace completeness with the proportion of cited paragraphs? Three cited paragraphs out of four gives 75% coverage.

That measures association, not support. If a source only reports a 15% return over the previous year, citing it does not establish the claim that the fund suits conservative investors.

Mechanical coverage targets can also change what the model optimizes for. Organizational sentences do not all need citations; the basis of analytical advice depends on context. Treating every uncited sentence as unsupported can encourage a model to attach a link everywhere rather than reason more carefully.

We did not replace an evidence-completeness score with a citation score. **An easily counted signal can help diagnosis, but its measurability does not make it the quality we actually care about.**

This is not an argument against metrics. It is an argument for defining what a metric measures before deciding which conclusions it supports.

## 5. Another Model Can Review the Answer, but Its Output Remains a Judgment

Asking an independent model whether the source supports a statement or whether the answer addresses the question is closer to the task than counting citations or matching keywords. The reviewing model can still miss material, misunderstand qualifications, or disagree about ambiguous inferences.

We therefore distinguish mechanical checks from semantic review. Code retains source identity, read records, applicable dates, citation correspondence, and affected content. Review examines specific conclusions for support, contradiction, missing premises, and relevance to the question.

The latter results are reasoned, inspectable opinions—not unquestionable system truth. Missing material should remain a limitation. “No error was found” must not silently become “correctness was proved.”

This division strengthens rather than devalues citation infrastructure. A traceable source relationship lets reviewers examine where a model distorted the material, where it made a reasonable inference, and where it did not answer the user at all.

It does not require an additional model call for every sentence. Looking up one explicit field and comparing two investment proposals warrant different review effort. The useful question is where examination can affect the conclusion.

## 6. The Takeaway Is Not “Distrust Citations”

We retained source and citation infrastructure and withdrew the quality certification it should not have owned. What was read, which version it represented, and which statement used it are still facts worth maintaining carefully.

**For product designers, citations should open the original material and its qualifications, not decorate an answer with a “verified” badge. For engineers and reviewers, identify the claims that drive the conclusion, examine whether the material supports them, and then check whether they address the user's actual question.**

Keep the two outcomes distinct: how far source and attribution checks reached, and which support or uncertainty remains in the interpretation. A valid citation should not endorse reasoning automatically; difficult semantic judgment should not prevent automation of the facts that can be checked.

Reliability improves not when citation markers grow denser, but when a reader can trace a consequential conclusion to its basis, understand the reasoning, and identify its limits.

**Citations make an answer easier to examine. Content judgment after that examination determines how much confidence it deserves.**

### Further Reading

[The Expensive Part of AI Coding Is Deciding What Deserves Verification](ai-coding-judgment-and-verification.md) discusses how to allocate verification effort. [A Trustworthy Evidence Chain for Financial Agents](https://hpoenixf.com/eff-agent-article/articles/financial-agent-trustworthy-evidence-chain) explains how original material passes through tools, calculations, and delivery (Chinese original).

More case studies are available in [ETF Agent Engineering Notes](https://github.com/hpoenixf/eff-agent-article). Stars and counterexamples that challenge these judgments are welcome.
