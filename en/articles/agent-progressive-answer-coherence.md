# Progressive Agent Answers: How to Keep One Research Narrative Coherent

After adding web search, PDF reading, and data analysis to a financial research Agent, we could deliver useful material before the full investigation finished. This revealed a new problem: how can later research extend the text the user has already seen, instead of turning every successive output into another entry in a running log?

**The more tools an Agent uses, the easier it becomes for the final answer to look like several research reports mechanically glued together.**

Imagine a user asks how two index funds differ:

> ### Part One: Initial Research
> First, we examine the fundamentals of both indices...
>
> ### Preliminary Summary
> They differ in certain ways; further validation is needed.
>
> ### Part Two: Additional Research
> Further investigation reveals...
>
> ### Overall Conclusion
> In summary...
>
> ### Part Three: New Findings
> Building on the above, here is more information...
>
> ### Final Conclusion
> Taking the entire analysis into account...

Each part may be defensible on its own. Together, however, they make readers decide which conclusion is final, whether new material supplements or corrects earlier claims, and why the answer keeps summarizing itself.

Some runs even started with an English research plan, switched to Chinese analysis, and ended with another English summary.

Code inspection and real-model testing led to a useful diagnosis: **this was not simply a writing-skill problem. Our delivery protocol unintentionally encouraged the model to treat each publication as a standalone report.**

We did not introduce a Writer Agent or a full document editor. We re-coordinated the Research model's writing goals, its context, and our existing Publication mechanism.

## 1. Why Progressive Answers Can Undermine Coherence

### 1.1 From one final answer to incremental delivery

The conventional Research Agent follows a linear path:

**Question → Search → Analyze → Synthesize → Deliver the full answer.**

Its weakness is latency. A complex financial study may involve dozens of tool calls; even when useful evidence is available early, the user cannot read it until every step finishes.

**Progressive Answer** lets the Agent publish meaningful portions as it works:

~~~text
User asks
    ↓
Obtain the first usable evidence
    ↓
Publish the first useful passage ───→ User begins reading
    ↓
Continue searching and analyzing
    ↓
Publish the next passage ──────────→ The page evolves
    ↓
Research completes
~~~

But it introduces a distinction: **the system sees several Publications while the user expects one coherent article**.

A *Publication* is an engineering unit: validated content that may be presented, versioned, and persisted. Article organization is semantic: what is the central finding, how does new evidence relate to it, and should the argument be extended or corrected?

Those two units do not naturally coincide.

### 1.2 How we accidentally incentivized miniature reports

An older tool instruction emphasized:

> Submit a complete, self-contained answer passage each time.

The motivation was sound. Readers should not be handed a fragment that makes no sense until some future message arrives.

But **"understandable independently"** can be misinterpreted as **"containing all sections of an independent report."** A model invoking **send_answer_part** may regenerate background, analysis, conclusion, and risk notes each time.

Historical runs exhibited this tendency. One sample of **149 runs** contained **275 Publication records**, of which only **two** had a revision greater than one. That count alone does not establish writing quality, but the recorded text supported the observation that the Agent preferred appending more sections over revising a developing argument.

The question became: how do we preserve early delivery while making the eventual answer read like one naturally written article?

## 2. First Change: Keep Writing the Same Article

We changed the goal before changing the Runtime.

The implicit instruction had been "make each publication a relatively complete piece." The new emphasis was:

> Answer the most important questions supported by evidence as early as possible. Let subsequent passages develop or correct the same line of reasoning.

**Every passage should remain intelligible, but it need not have the structure of a complete report.**

### 2.1 Before and after: organize around reader questions, not execution chronology

Consider a synthetic question:

> How do the CSI 500 and CSI 300 differ? How did their performance and risk compare over the last year?

Before the change, the structure might follow the sequence of tool work:

~~~text
Part One: Index basics
    What are the two indices?
    ↓
Preliminary conclusion
    They differ; more analysis is needed.
    ↓
Part Two: New data
    How do their returns and drawdowns compare?
    ↓
Overall conclusion
    Summarize fundamentals and returns again.
    ↓
Part Three: New discovery
    Add a risk or correct an earlier claim.
    ↓
Final conclusion
    Summarize everything yet again.
~~~

The intended structure instead follows the reader's actual questions:

> ### What is the fundamental difference?
>
> The CSI 300 and CSI 500 largely represent different company-size segments. Their industry weights, style exposures, and risk sources differ. They can therefore behave differently across market environments, although that does not mean they eliminate each other's equity-market risk.
>
> ### How did they perform over the last year?
>
> Compare return, maximum drawdown, and volatility for *the same start and end dates* and *the same measurement convention*. Returns help identify performance; drawdown shows how much downside was experienced along the way. Neither should be interpreted in isolation.
>
> ### What does this mean for allocation?
>
> Both are Chinese A-share equities. Holding distinct index funds does not automatically diversify their common market exposure; the underlying assets and sources of risk matter.
>
> ### What remains unverified?
>
> Yearly performance metrics require complete, comparably defined data. Until they are available, actual returns and drawdowns remain unconfirmed; index style alone cannot establish them.

These are **illustrations of two writing structures**, not verbatim historical answers. No annual return figures have been invented.

Previously, headings described **what the Agent did**. Afterwards, they describe **what the user needs to understand**. The material can still arrive incrementally, but later passages should advance the same argument.

### 2.2 First Publication versus First Useful Answer

This change also challenged our delivery metrics.

**First Token** measures when the model begins emitting text. **First Publication** measures when content first becomes publishable. Neither guarantees the user has received an actual answer.

For example, the passage "I will search the index rules, then analyze historical returns" might appear promptly without resolving any meaningful part of the question.

We therefore place more emphasis on **First Useful Answer**: the first delivered passage should answer at least one important subquestion with adequate supporting evidence.

This does **not** license premature conclusions. When the essential facts are still missing, research should continue. When one independently meaningful point is already established, it need not wait for every other point.

**Publish useful substance early, not merely progress narration.**

## 3. Second Change: Let the Model See What It Has Already Written

A Prompt saying "do not repeat yourself" cannot reliably solve the problem. The model must first know what the current article actually contains.

### 3.1 Conversation history is not the same as the present article

In a multi-step Agent, the next model request may not contain all prior output. Context may have been compacted; tool results may be loaded on demand; a Publication may have been revised; some sources may no longer be authorized.

A historical Publication ID alone does not tell the model the text of that passage, which revision is current, which conclusions reached the user, or which content is missing due to permission or capacity.

Without those facts, even a model attempting to write coherently cannot reliably avoid repetition or contradiction.

### 3.2 Project the actual current article

We strengthened **Current Publication Context**: a view of the **currently readable, authorized article body**, provided by the existing Publication mechanism. It is not a second document store.

A simplified contract looks like:

~~~json
{
  "sections": [
    {
      "id": "section-1",
      "revision": 2,
      "text": "The text currently visible to the user"
    }
  ],
  "omittedCount": 0
}
~~~

Three design requirements matter.

**First, provide actual text, not just IDs.** The model can see established judgments and qualifications and choose how new evidence should connect.

**Second, keep version and authorization aligned.** A revoked or invalidated passage must not re-enter the model context merely because it appeared in a previous message.

**Third, disclose omissions.** If fitting constraints exclude some body text, **omittedCount** tells the model it lacks a complete view instead of suggesting it saw the whole article.

This is the practical role of context engineering: not simply limiting token volume, but ensuring visible content corresponds to the present task and authorized state.

## 4. Third Change: Revise When Evidence Changes Instead of Appending Forever

Later evidence has three common relationships to the existing answer:

| Relationship of new evidence | Preferred behavior |
| --- | --- |
| Adds valuable information | Extend the current argument with a relevant point |
| Changes an earlier conclusion | Revise the affected earlier passage |
| Adds nothing useful | Avoid repeating; complete remaining checks and finish |

These choices have different effects on article quality.

### 4.1 Appending is not the only option

Suppose an Agent already published:

> On the data currently examined, the CSI 300's lowest closing value in the specified year was X.

A complete-year dataset later reveals that X was only a local low; the actual annual minimum was Y.

An append-only strategy produces a new paragraph saying "Correction: the minimum was actually Y," leaving both X and Y visible and making the reader resolve the conflict.

We already had a **replaces** mechanism: the model can identify the original Publication ID and submit a corrected complete passage. The system validates target revision and authorization before updating the current body.

This does not require guessing replacement targets from Markdown headings or deleting text based on similarity.

### 4.2 How the existing mechanics cooperate

~~~mermaid
graph TD
UserQuestion --> ResearchEvidence
ResearchEvidence --> CheckAnswerReadiness
CheckAnswerReadiness --> ResearchEvidence
CheckAnswerReadiness --> PublishUsefulAnswer
PublishUsefulAnswer --> HostSavesVersion
HostSavesVersion --> UserReads
HostSavesVersion --> ReuseApprovedText
ReuseApprovedText --> CheckNewEvidence
CheckNewEvidence --> AppendInformation
CheckNewEvidence --> ReviseById
CheckNewEvidence --> FinishChecks
AppendInformation --> HostSavesVersion
ReviseById --> HostSavesVersion
~~~

The decision edges mean:

- **CheckAnswerReadiness → ResearchEvidence:** not enough evidence yet.
- **CheckAnswerReadiness → PublishUsefulAnswer:** a supported useful answer is ready.
- **CheckNewEvidence → AppendInformation:** add a new point.
- **CheckNewEvidence → ReviseById:** an existing point needs correction.
- **CheckNewEvidence → FinishChecks:** no new value.

**The model determines how the argument evolves. Runtime validates the identity, version, permissions, and evidence of each delivery.**

We deliberately did not introduce a generic article AST or mandatory final polishing stage. The present priority is evidence-based correction, not unrestricted cross-section merging, deletion, or reordering.

This is an architectural trade-off, not an accidental missing feature.

## 5. Better Writing Also Means Less System Noise

Repetition is not the only obstacle. Financial research needs source constraints, numeric precision, and risk disclosures. Important guardrails can still damage readability when repeated indiscriminately.

### 5.1 Place qualifications beside the claims they qualify

We saw answers repeatedly append statements such as:

> This is not personalized investment advice.
> We do not have complete portfolio data.
> Further validation is required.

Those warnings sometimes matter. But general index-mechanics questions rarely benefit from repeating the same generic paragraph at the start, middle, and end.

A more useful qualification is attached to the argument:

> Broad market indices may span several industries, but wider coverage does not prevent substantial drawdowns when the equity market falls.

We are not removing risk disclosure. We are making the boundary of the claim clear at the point where the claim appears.

### 5.2 Make citation warnings local and useful

"The paragraph has no recorded verifiable inline citation" is more precise than declaring an entire long answer unreliable. Put notices near affected passages rather than repeating an article-wide disclaimer after every append.

Publication owns version binding, source downgrade, and presentation eligibility. This essay does not duplicate those contracts; see the [Publication essay](019-agent-answer-publication.md).

### 5.3 Change the affordance, not only the instruction

One real-model test exposed a particularly concrete failure mode: the model received valid citation IDs but shortened them when embedding citations in its answer. The Host then rejected the bindings.

Adding more reminders to "always use the full ID" was not consistently effective. We instead provided a **copy-ready, complete citation marker** in model context:

~~~text
[[cite:COMPLETE_SOURCE_REFERENCE_ID]]
~~~

The model only had to copy a valid marker instead of assembling one.

In one subsequent real-model run, **all 37 generated citations matched full Host-issued IDs**, and the page displayed the citation details.

A later run nevertheless produced truncated citations again. This was an improvement observed in one run, **not** a stable solution across all tasks; Host-side validation remained indispensable.

The more general lesson is simple: **make correct behavior easier at the interface, rather than endlessly warning the model not to make mistakes.**

## 6. Why We Did Not Add a Writer Agent

A natural response to awkward answers would be another model pipeline:

~~~text
Research Agent
      ↓
Writer Agent
      ↓
Reviewer Agent
      ↓
Final Answer
~~~

That can be appropriate elsewhere. We did not use it as the first remedy for three reasons.

First, the Writer would need research context and independent guarantees about source eligibility, numeric fidelity, and current permissions.

Second, every additional model phase incurs latency, context-transfer work, and another failure path.

Third, we already had Publication, revisions, **replaces**, and a projection of the current body. The issue was how these existing capabilities worked together, not necessarily a missing new capability.

Our division of responsibility remained:

| Model responsibility | Runtime responsibility |
| --- | --- |
| Understand the user's real question | Preserve constraints and authorization scope |
| Decide which information matters | Validate sources, numbers, and permissions |
| Choose append versus revision | Validate Publication identity and revision |
| Organize the argument naturally | Keep persistence, recovery, and delivery consistent |
| Explain uncertainty | Preserve actual evidence and failure states |

We also avoided having Runtime decide whether prose was "natural" by searching for certain words or Markdown headings. Checking whether a citation ID is valid is a deterministic protocol problem; deciding whether an article is repetitive is a semantic writing-quality problem.

### Less repeated guidance can work better

An expanded set of writing instructions once pushed a fixed-capacity model request over its context budget.

Rather than simply raising the budget, we consolidated existing prompts while retaining necessary constraints.

**Prompts consume finite runtime capacity too.** More rules about coherence, completeness, style, and repetition can displace the user question and supporting evidence. We chose a unified writing goal over ever more format directives.

## 7. What Improved, and What Was Still Unresolved?

Real-model testing after these changes showed some encouraging results. In one six-question sample, all six tasks completed, with an overall user rating averaging **4.0/5** and **five questions rated at least 4**.

We did **not** report a precise percentage improvement. This was not a controlled A/B test using identical model versions, data snapshots, and budgets. The improvement cannot be attributed exclusively to prompts or context projection.

The runs also revealed unresolved defects:

- Some answers still included English process narration.
- Some citation IDs were incomplete despite otherwise readable content.
- Some runs obtained data but selected the wrong numeric value during synthesis.
- Some runs published useful partial passages without completing the underlying research.

In one index-research test, the model retrieved a complete time series but incorrectly identified a local low as the annual lowest closing value. Stronger guidance then required the same metric, full time period, and matched extreme value/date from the same row. A later real test corrected that particular value but still encountered citation and unfinished-computation problems.

This is why **readability, factual correctness, source reliability, and task completion are related but distinct dimensions**.

Useful next measurements include when the *first useful* answer reaches the user, whether later passages actually advance the argument, whether reduced repetition preserves evidence and caveats, whether revisions leave stale conclusions or broken citations, and whether smoother writing increases model calls or latency.

The goal is not merely attractive prose. It is an answer the user can understand sooner without a meaningful regression in correctness or cost.

## Conclusion: Users Should Not Have to Read the Agent's Work Log

Research may involve many rounds of search, computation, verification, recovery, and incremental publication. That execution chronology should not dictate the structure of the article.

The user asked a question—not for a timestamped transcript of tool calls.

We kept the Research model responsible for organizing **one evolving answer** around that question. The authorized current body helps it continue what it has written. Publication owns accurate append and revision. Runtime keeps evidence, numbers, and permissions grounded.

**Delivery is incremental; the answer is not a stack of independent reports.**

The broader principle is to **let the model choose how to express the argument while the system strictly controls what has authority**.

Sometimes improving an Agent does not require a Writer Agent, more states, or additional defensive rules. It requires existing mechanisms to cooperate around the user's actual goal.

A successful user experience sounds less like "here is every step I took" and more like: **I understood the question, found the evidence, and explained the answer clearly, naturally, and reliably.**
