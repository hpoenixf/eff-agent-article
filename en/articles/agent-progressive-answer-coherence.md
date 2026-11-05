---
description: "As evidence arrives in batches, how can readers keep following one answer? Use append, correction and completion decisions to connect current text, exact revisions and durable delivery, then compare streaming UI primitives with a separate writing stage."
readingBrief:
  takeaways:
    - "Several deliveries can develop one argument: new evidence should determine whether to append, correct or finish, rather than trigger another miniature report."
    - "Continuation needs current text, revisions and explicit omissions from the original publication owner; historical IDs or a preview alone do not define a recoverable article."
    - "Corrections must bind an exact section and expected revision across persistence, readback and the next model input, not merely change the screen."
    - "Streaming, version consistency and writing quality solve different problems; add a writing or evaluation stage when clear criteria and demonstrated value justify its extra latency."
  appliesTo:
    - "Research agents that deliver in parts but repeat summaries, retain conflicting conclusions, or restore old text after reconnecting."
  notFor:
    - "Unrestricted document merging and reordering, or using valid citations and durable storage as substitutes for factual verification."
---
# Progressive Agent Answers: How to Keep One Research Narrative Coherent

A user asks how two index funds differ. The agent first obtains index rules, then annual prices, and finally fee disclosures. These sources arrive at different times. The user should not have to wait until the end to begin reading.

Yet if each batch produces a miniature report with its own introduction, analysis and conclusion, earlier output can make the final result harder to follow. What did the new finding add? Does the previous conclusion still stand? The reader becomes the final editor.

Our current approach is to **develop one answer continuously, letting new evidence determine whether to append, correct or finish**. The model makes that semantic choice. The publication system maintains section identity, revisions and durable delivery. The index comparison below is a teaching example; historical observations are identified separately.

<span id="part-one-initial-research"></span>
<span id="preliminary-summary"></span>
<span id="part-two-additional-research"></span>
<span id="overall-conclusion"></span>
<span id="part-three-new-findings"></span>
<span id="final-conclusion"></span>
<span id="_1-why-progressive-answers-can-undermine-coherence"></span>
<span id="_1-1-from-one-final-answer-to-incremental-delivery"></span>
<span id="_1-2-how-we-accidentally-incentivized-miniature-reports"></span>
<span id="_2-first-change-keep-writing-the-same-article"></span>
<span id="_2-1-before-and-after-organize-around-reader-questions-not-execution-chronology"></span>
<span id="what-is-the-fundamental-difference"></span>
<span id="how-did-they-perform-over-the-last-year"></span>
<span id="what-does-this-mean-for-allocation"></span>
<span id="what-remains-unverified"></span>
<span id="_2-2-first-publication-versus-first-useful-answer"></span>

## 1. Deliver a useful finding before another outline

Progressive delivery preserves an important benefit: an independently supported part should not wait for an unrelated slow lookup.

An earlier tool description asked for each part to be complete and self-contained. This was intended to make early text understandable, but it could also encourage a fresh introduction, risk statement and summary every time. A historical census on October 10, 2026 covered 149 runs with 275 publication records, only two with a revision above one. This describes an append-heavy pattern. It does not by itself measure writing quality or prove a particular prompt caused it.

Preserve “this passage is independently understandable,” without requiring “this passage is an independent essay.”

Once index rules are available, the answer can explain differences in company size, sectors and risk exposure. Annual returns can follow when the price lookup finishes. An early research plan does not answer that question, and style characteristics cannot substitute for missing return figures.

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

The diagram describes delivery timing. The article itself should be organized around the core differences, comparable-period performance and portfolio implications, rather than first search and second supplement.

A first useful answer addresses a material subquestion. Nonempty text, progress messages and early tokens are earlier signals, not equivalent outcomes.

## 2. Ask how new evidence relates to the existing answer

A continuous argument usually needs three choices:

| What changed? | What should happen to the article? |
| --- | --- |
| An important unanswered aspect gains evidence | Extend the argument and explain what the new information adds |
| An existing finding is contradicted or corrected | Correct that section while retaining its position and revision identity |
| No useful information was added | Finish necessary checks, without publishing another summary |

This is not a runtime keyword classifier. The model interprets the evidence; the system provides interfaces that make those choices possible.

Suppose an early source covered only part of a year, but the model described a local low as the annual minimum. A later full-year series disproves it. Appending “Correction: the minimum was another value” is easy, but leaves readers facing two contradictory answers.

The existing `replaces` mechanism lets the model identify the original section and expected revision, then submit a corrected complete section. The new revision appears in the same position; the old version remains historical. Neither titles nor text similarity decide what to replace.

If the new material only adds a fee comparison, an additional section is appropriate. With no new information, completion does not require another conclusion. **Append when the reader gains something new; revise the original finding that changed.**

<span id="_3-second-change-let-the-model-see-what-it-has-already-written"></span>
<span id="_3-1-conversation-history-is-not-the-same-as-the-present-article"></span>
<span id="_3-2-project-the-actual-current-article"></span>

## 3. Give the model the current article

“Do not repeat yourself” cannot repair missing context. The next request needs to show what was already written, which revision replaced it, and what was omitted from the current input.

We reuse a current-text view from the publication module, rather than creating another editable article database. A conceptual representation is:

~~~json
{
  "sections": [
    { "id": "section-1", "revision": 2, "text": "The current text of this section" }
  ],
  "omittedCount": 0
}
~~~

Text enables continuity, identity and revision enable targeted correction, and omission information prevents an assumption that the entire article was included. The actual projection preserves the Run's grant, source identity and capacity constraints. An existing grant is not revoked midway through that Run merely because an external permission table changes; historical reads by a new Run have their own admission. These lifecycles must remain distinct.

### The surprising failure: corrected on screen, old text in storage

Historical investigation exposed a subtler issue than a model declining to revise. One publication adapter supported commits without completing the durable replacement path. Accepted replacement text could appear as a preview while the persisted article differed. Quality attribution based on those inconsistent versions was therefore withdrawn.

The repair added no Writer. The adapter reads the original section's exact identity, revision and position; the original persistence owner still performs the atomic, version-checked replacement. Relevant verification covered the saved new revision, its publication event and the next actually fitted model request.

This explains why “current article” cannot mean only the last text sent to the page. A preview lets users read early; a durable receipt supports later reopening; subsequent model turns must stay consistent with committed publication. **Check the screen, saved result and next model input together when testing a correction.**

<span id="_4-third-change-revise-when-evidence-changes-instead-of-appending-forever"></span>
<span id="_4-1-appending-is-not-the-only-option"></span>
<span id="_4-2-how-the-existing-mechanics-cooperate"></span>

## 4. Bound the editing operation while preserving the reading experience

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

The decisions in the diagram belong to the model: continue research when support is insufficient, publish when evidence supports the passage, then append, revise or finish according to the new information. The Host validates and stores effects; it does not certify semantic sufficiency.

The current correction capability is not a general editor. It targets an original section and expected revision, subject to existing modification limits, permissions and durable state. A missing replacement target cannot silently become an append. Arbitrary cross-section merging, deletion and reordering are not implied.

This choice limits editing protocols and failure handling, but makes good initial organization more important. A collaborative document product may justify a richer document model or editing protocol. A research conversation does not need to start with that complexity.

<span id="_6-why-we-did-not-add-a-writer-agent"></span>
<span id="less-repeated-guidance-can-work-better"></span>

## 5. Which layer do established approaches solve?

Three useful capabilities are often confused here.

[LangGraph streaming](https://docs.langchain.com/oss/python/langgraph/streaming) separates messages, state updates and custom events. It helps consumers receive ongoing execution changes. The application still decides which events belong in the report and which are progress only.

[Vercel AI SDK data streams](https://ai-sdk.dev/docs/ai-sdk-ui/streaming-data) distinguish message-history data parts from transient notifications and reconcile updates with the same ID. This is a useful client-side primitive. An application's server still defines modification permission, expected revisions and durable storage.

At a different layer, [Anthropic's evaluator–optimizer pattern](https://www.anthropic.com/engineering/building-effective-agents) iterates generation and feedback. It fits clear evaluation criteria and improvements that justify additional calls. It does not automatically restore missing source evidence or fix a broken durable replacement path.

We first reused the research model, current text and publication versions because those capabilities already existed and the observed gaps lay mainly in their coordination. A separate Writer would receive another context, source and version handoff, adding latency and failure handling. It remains an option if its value for the target tasks can be demonstrated.

<span id="_5-better-writing-also-means-less-system-noise"></span>
<span id="_5-1-place-qualifications-beside-the-claims-they-qualify"></span>
<span id="_5-2-make-citation-warnings-local-and-useful"></span>
<span id="_5-3-change-the-affordance-not-only-the-instruction"></span>

## 6. Reduce system noise without erasing material limits

A qualification should explain the conditions of a particular finding. “Both indices remain exposed to the A-share market” is more informative than repeating a generic investment disclaimer in every section. Missing annual data, unfinished calculations and conflicting sources still belong next to the claims they affect.

Citation notices should follow the affected section and revision. One section without bound citations cannot establish that the entire report lacks reliable material. A cited section cannot certify its neighbor either. The [publication article](019-agent-answer-publication.md) covers that mechanism.

Interfaces also influence writing. Historical tests showed the model shortening valid citation IDs. Providing a complete, copyable marker makes correct use easier than requiring reconstruction:

~~~text
[[cite:complete-source-citation-ID]]
~~~

In one sample, all 37 authored citations matched complete IDs; a later run still shortened them. The contrast supports improving the interface while retaining validation, rather than treating one successful sample as a universal fix.

Adding writing instructions also once exhausted a fixed context budget. We consolidated existing guidance instead of continually raising capacity or adding a naturalness classifier. Prompts need editing as much as prose does.

<span id="_7-what-improved-and-what-was-still-unresolved"></span>

## 7. Evaluate the whole reading process

Look beyond the final returned value: when did the first useful content appear, did later text develop the same argument, were errors corrected in place, and did the result remain consistent after reconnecting?

On October 11, 2026, the user gave six answers from the then-supported environment overall scores of 4, 4, 3, 5, 4 and 4, averaging 4.0/5. This is a dated reading assessment, not evidence that all six tasks completed or a matched-model, matched-source, matched-budget experiment. The records also retain unfinished tasks, incomplete review reasons, incorrect numerical selections and citation failures. Later delegated reviews concern separate samples and cannot be combined into one improvement result.

Keep the failure classes separate. Selecting the wrong minimum from an available full-year price series calls for investigating synthesis and calculation. Accepting a replacement without persisting it calls for repairing publication. Both can produce a bad final article, but need different remedies.

For the next evaluation, ask:

- Did the earliest useful content address a material subquestion rather than present a plan?
- Did later text add reasoning or restart the answer?
- Did facts, citations and durable versions agree after correction?
- Was any reading improvement purchased by dropping requested scope, adding excessive calls or increasing waiting time?

<span id="conclusion-users-should-not-have-to-read-the-agent-s-work-log"></span>

## Conclusion: readers need an answer, not an execution log

Timeliness is the reason to preserve progressive delivery. Letting execution order dictate article structure is the failure to avoid.

Keep one user question in view, show the model the current text, choose append, correction or completion from the evidence, and let the existing publication owner preserve every change accurately. The system can work in many steps while the reader follows one argument.

Further reading: [Independent publication](019-agent-answer-publication.md) · [Reconciling live client events with history](agent-client-interaction-and-reading.md). This article describes the broader research system. [Open ETF Agent](https://github.com/hpoenixf/open-etf-agent) is a smaller independent teaching implementation, not a public release of every capability discussed here.
