---
description: "Compare OpenAI, Anthropic, Google, and open-source research practices, then examine ETF Agent’s resource, parallel-evidence, and delivery choices through its implementation and six matched experiments."
articleMetadata:
  author:
    name: "hpoenixf"
    url: "https://hpoenixf.com/about"
readingBrief:
  takeaways:
    - "Deep can reuse the existing research loop, adding authorized capacity and changing later delivery guidance without building another execution flow."
    - "Selecting Deep does not apply the upgrade. The system must approve and activate it; used and reserved capacity still counts, and finalization limits still apply."
    - "Parallelize independent source investigations. Conclusions that depend on several branches need their evidence combined; more agents do not guarantee quality."
    - "Share progress and independent findings early, while resolving material disagreements before synthesis. This guides the model; it is not an automatic evidence-sufficiency test."
    - "Six matched cases had mixed results: Deep sometimes produced a complete answer sooner, and sometimes ended sooner with omissions. It is not reliably more accurate, faster or cheaper."
  appliesTo:
    - "Teams with a recoverable research loop that need more capacity and different delivery timing for complex questions."
  notFor:
    - "A mandatory research sequence or real-world investment proof from synthetic tests; this Deep implementation is also not a feature already shipped in the public repository."
---

<script setup>
import { withBase } from 'vitepress'
</script>

# Deep Research: From Budget Upgrades to Delivery—What We Built and What the Tests Show

An ordinary investment-research question may require checking one fund's fee schedule. A different question can demand portfolio look-through, reports from multiple periods, updated source versions, collaboration among research branches, and one coherent conclusion. Both are called Research, but their resource requirements and delivery cadence are different.

In ETF Agent, we did not build a second agent for the more demanding task. We gave the **same Native Research Loop** an authorized higher resource profile and adjusted guidance according to the mode that had actually taken effect: provide genuine progress as work continues, publish independently supported findings when useful, and be more deliberate when synthesizing conclusions that depend on several pieces of evidence.

After examining how industry systems approach long research, this article asks three questions about ETF Agent: why ordinary Research was insufficient; precisely what Deep changes in the runtime; and what matched Standard/Deep runs actually showed. The Deep implementation discussed here comes from the ETF Agent engineering repository. It should not be mistaken for a feature already shipped in the public Open ETF Agent repository.

## 1. Why introduce a separate Deep mode?

### Timely ordinary answers and sufficient room for complex investigation

Ordinary Research already had search, reading, computation, Child execution, and the ability to publish a useful section through `send_answer_part` before the whole task ended. That is a reasonable design: a verified fee fact should not be held back by a later unrelated lookup.

Complex conclusions, however, can depend on interconnected premises. Suppose a fund's reported return differs from its index. The comparison period, net-return basis, total-return basis, whether fees are already included, and a later correction notice can all change the interpretation. Several individually correct facts may still be insufficient to support the claim that fees caused most of the gap.

A single default resource ceiling may force such tasks into finalization before essential work is complete. Raising the ceiling for *every* task would also grant unnecessary capacity to questions that only need a few calls. **The first requirement was therefore selective, authorized expansion of one Run—not making every answer longer.**

### More capacity is not a reason to publish a synthesis earlier

Our previous progressive-answer strategy encouraged the model to deliver independently useful findings promptly. It addressed a real experience problem: users should not see an empty answer until all research is finished.

But for tasks that require comparing source versions, calculating across documents, and reconciling disagreements, a model may commit an initial interpretation and keep appending corrections. There is plenty of output, yet the final result can resemble a research log rather than a report organized around the user's question.

We therefore distinguish two kinds of delivery:

- **Research progress:** what is being checked, what conflicts have appeared, and which material gaps remain. It can appear early but does not certify a conclusion.
- **Research output:** a fact, calculation, or bounded analysis that already stands on its own. It can be delivered early; a broad synthesis dependent on unresolved evidence should be more cautious.

This is not a rule forbidding output during the first 70% of execution. Nor is it a server-readable boolean called “evidence mature.” It is a change in the model's research and writing priorities.

## 2. Which industry practices are worth adopting?

Deep Research does not imply one mandatory internal architecture. The following comparison focuses on **research effort, decomposition, and delivery**. Product documentation establishes exposed behavior; engineering accounts explain disclosed design; open-source code exposes an inspectable execution path. These are different kinds of evidence, and this comparison does not imply that we evaluated or adopted each option when building our implementation.

<figure class="deep-research-figure">
<picture><source media="(max-width: 700px)" :srcset="withBase('/diagrams/deep-research/industry-decisions-en-mobile.svg')" /><img :src="withBase('/diagrams/deep-research/industry-decisions-en.svg')" alt="Read the public sources by decision: asynchronous work and citations, independent investigations, plan and effort selection, and bounded research loops. This is not a ranking or a reconstruction of private internals." loading="lazy" /></picture>
<figcaption><strong>Figure 1 · Four public practices, four engineering decisions</strong><br />Read the public sources by decision: asynchronous work and citations, independent investigations, plan and effort selection, and bounded research loops. This is not a ranking or a reconstruction of private internals. <a class="diagram-original" :href="withBase('/diagrams/deep-research/industry-decisions-en.svg')">Open full diagram</a></figcaption>
</figure>

### OpenAI: expose long-running work and traceable reports as product interfaces

OpenAI's [Deep Research API example](https://developers.openai.com/cookbook/examples/deep_research_api/introduction_to_deep_research_api) shows report text with structured citations containing text spans, titles, and URLs. Its [background-mode documentation](https://developers.openai.com/api/docs/guides/background) describes response IDs and event cursors for reconnecting to the same response after a dropped connection.

Two concrete practices matter here: **let readers locate the evidence behind a claim, and retrieve an existing task before restarting research after a client disconnect.** A hosted API can reduce orchestration work for teams that do not need their own research execution layer, at the cost of depending on its interfaces, data handling, and observability. Stream reconnection does not establish arbitrary tool-step rollback or exactly-once external actions. ETF Agent still uses its own existing resource, publication-version, and recovery responsibilities; adding Deep did not turn it into a wrapper around this API.

### Anthropic: parallelize independent investigations, not agent counts

Anthropic's [June 2025 engineering account](https://www.anthropic.com/research/multi-agent-research-system) describes a lead researcher delegating parallel tasks, synthesizing findings, and investigating further. Delegation specifies objectives, outputs, sources, and boundaries. Breadth-oriented work suits parallelism; tightly coupled work and extensive shared context may not. A separate citation-processing step follows research.

For our fund question, one branch could examine the original report's period and calculation basis while another seeks correction notices and counterevidence. Deciding which version to use when recalculating the gap depends on both branches, so each should not independently deliver a final causal attribution. The diagram is a **teaching composition**, not a reconstruction of Anthropic's private implementation or an observed trajectory from our paired tests.

<figure class="deep-research-figure">
<picture><source media="(max-width: 700px)" :srcset="withBase('/diagrams/deep-research/parallel-evidence-en-mobile.svg')" /><img :src="withBase('/diagrams/deep-research/parallel-evidence-en.svg')" alt="Teaching composition: the original report and correction can be read independently, but synthesis must align versions and measurement bases. Handoffs retain source pointers and unknowns, not just a polished summary." loading="lazy" /></picture>
<figcaption><strong>Figure 2 · Parallel evidence, synthesis after alignment</strong><br />Teaching composition: the original report and correction can be read independently, but synthesis must align versions and measurement bases. Handoffs retain source pointers and unknowns, not just a polished summary. <a class="diagram-original" :href="withBase('/diagrams/deep-research/parallel-evidence-en.svg')">Open full diagram</a></figcaption>
</figure>

The costs include additional calls, lossy summaries, and coordination. Our proposed handoff retains original-source pointers, applicable dates, and unknowns instead of treating Child count as evidence of depth. ETF Agent already supports Child collaboration, but this article establishes neither a correctness gain from more parallelism nor the addition of an Anthropic-style citation agent. Observed errors such as a present but unsupported citation should determine whether a dedicated citation check is justified.

### Google: align the question before choosing research effort

Google's [April 2026 Deep Research / Max announcement](https://blog.google/innovation-and-ai/models-and-research/gemini-models/next-Generation-gemini-deep-research/) distinguishes lower-latency interactive research from background research using more inference-time computation. It also offers reviewing and adjusting a research plan before execution. These are documented product choices, not independently measured performance findings in this article.

The practical lesson is to **check that extra resources will address the right question**. For “why did the tracking gap widen?”, a plan should establish the period, benchmark, and whether fee attribution is required rather than defaulting to a fund encyclopedia. Plan review is useful when several people must agree on scope or the task will run for a long time; mandatory review adds friction to short questions. ETF Agent's `auto/standard/deep` controls mode intent and authorization. Those values are not equivalent to Google's product tiers, and they do not establish an equivalent interactive plan-review capability.

### LangChain: make research boundaries inspectable in the loop

A [fixed version of Open Deep Research](https://github.com/langchain-ai/open_deep_research/blob/1b7d2e80db9faa586165c60e09096dbbfd483a64/src/open_deep_research/deep_researcher.py) exposes supervisor and researcher loops, a parallel-research cap, and a separate report-generation stage. The supervisor can exit on a completion signal, no tool calls, an iteration limit, or an execution exception. This is an inspectable example of why **reaching report generation does not establish complete investigation**.

An explicit stage graph suits teams that want to replace research, compression, and writing models independently. It also requires maintaining state handoffs, truncation policy, and failure semantics across stages. ETF Agent has a different local constraint: an existing unified research loop and publication-version path. We therefore first change capacity and guidance within that loop rather than maintain two sets of execution facts. This does not make graph-based orchestration inferior or the existing loop inherently more reliable.

Together, these practices suggest an order of decisions: establish question and source boundaries, identify investigations worth parallelizing, choose effort, then assess stopping reasons and report quality separately. **This is our engineering synthesis, not a protocol that all four providers publicly claim to implement.**

## 3. How it works inside the existing runtime {#_2-how-it-works-inside-the-existing-runtime}

### Four proposal surfaces, one resource authority

Deep can be requested through an explicit user selection, trusted metadata from a registered Skill, an Entry research-mode proposal, or a Main tool call to `enable_deep_research`. These are different ways to express intent, not independent ways to mint capacity.

The frontend's `researchDepthPreference` distinguishes `auto`, `standard`, and `deep`. Auto may permit an eligible recommendation; explicit Standard must not be silently upgraded by a Skill or model. A Direct answer that has already been admitted does not secretly become Research because an upgrade was suggested.

The existing Run Resource Owner decides whether an upgrade is legal. It uses the Run's frozen original allowance, current consumption and reservations, phase, clocks, and external caps. A Child cannot independently upgrade the Root.

We deliberately avoided creating another “Deep budget ledger.” Otherwise the Main, Child, reminder and recovery paths could disagree about how much work is actually permitted.

### A 1.5× target, not free model credits

The current depth profile calculates a target as the admitted total plus half of that total, rounded down. Under the current default baseline:

| Resource axis | Standard | Deep, approved and applied |
| --- | ---: | ---: |
| Main model turns in total | 36 | 54 |
| Root model-request allowance | 57 | 85 |
| Read actions | 72 | 108 |
| Discovery actions | 6 | 9 |
| Publication actions | 48 | 72 |
| Active execution-time ceiling | 60 minutes | 90 minutes |

These are default baselines and target ceilings, not guaranteed capacity for every Run. Already consumed requests, Child reservations, unknown settlements, and external provider or task limits still apply. **Upgrading does not reset usage or start a second budget.**

Consider a teaching allocation: a Root total of 57, with 20 used and 6 reserved for Children, leaves at most 31 unallocated. Applying a total of 85 raises that upper bound to 59. The increase is 28, not a fresh grant of 85. These allocation figures are illustrative, not observed Run usage; other constraints can still reduce availability.

<figure class="deep-research-figure">
<picture><source media="(max-width: 700px)" :srcset="withBase('/diagrams/deep-research/budget-ledger-en-mobile.svg')" /><img :src="withBase('/diagrams/deep-research/budget-ledger-en.svg')" alt="Teaching arithmetic: Root requests rise from 57 to 85. Used 20 and Child-reserved 6 carry forward, so the unallocated upper bound rises from 31 to 59. Unknown settlements and external caps can further constrain availability." loading="lazy" /></picture>
<figcaption><strong>Figure 3 · Upgrade total capacity, not a second budget</strong><br />Teaching arithmetic: Root requests rise from 57 to 85. Used 20 and Child-reserved 6 carry forward, so the unallocated upper bound rises from 31 to 59. Unknown settlements and external caps can further constrain availability. <a class="diagram-original" :href="withBase('/diagrams/deep-research/budget-ledger-en.svg')">Open full diagram</a></figcaption>
</figure>

There is also an eligibility window. Around the 50% reminder stage of the original request or time budget, the system can suggest that Main consider Deep for unresolved work; the suggestion does not itself start another model call. Near the 80% threshold of the original basis, in `finalization-only`, or when deadlines or authority prohibit expansion, the resource owner checks eligibility again at the actual effect boundary. A tool having been visible earlier is not sufficient.

One more distinction matters: a durable approval is not proof that the live Host has applied the new resource profile to running admission and clocks. The runtime distinguishes `standard`, `recorded-pending`, `deep`, and `unknown`. Only actually applied `deep` affects subsequent effective behavior.

<figure class="deep-research-figure">
<picture><source media="(max-width: 700px)" :srcset="withBase('/diagrams/deep-research/upgrade-boundaries-en-mobile.svg')" /><img :src="withBase('/diagrams/deep-research/upgrade-boundaries-en.svg')" alt="Resource Owner checks the intent; only after Host applies the upgrade does the next request use Deep guidance. Existing consumption and reservations still count." loading="lazy" /></picture>
<figcaption><strong>Figure 4 · From mode intent to applied Deep</strong><br />Resource Owner checks the intent; only after Host applies the upgrade does the next request use Deep guidance. Existing consumption and reservations still count. <a class="diagram-original" :href="withBase('/diagrams/deep-research/upgrade-boundaries-en.svg')">Open full diagram</a></figcaption>
</figure>

### Rebuild each model request; do not mutate an earlier prompt

The current integration does not keep one permanent System Prompt inside the provider. Each model invocation rebuilds the `system` field, relevant history, tool results, and authorized tool surface.

On a new Main turn, the runtime reads the Host's current depth state, refreshes the effective research contract, and asks the Native Request Projector to construct that request. The relevant decision is approximately as follows (**illustrative pseudocode, not a callable repository API**):

```typescript
const cadence = currentHostDepth === "deep"
  ? deepDeliveryCadence
  : ordinaryDeliveryCadence;

const modelRequest = {
  system: composeResearchInstructions(cadence),
  messages: projectCurrentResearchHistory(),
  tools: projectAuthorizedTools()
};
```

Ordinary guidance continues to favor prompt delivery of supported, independently readable findings. Deep guidance asks the model to consider requested coverage, conflicting evidence, and material unknowns before composing a major synthesis. An independently mature section may still be published early. We also removed the unconditional “publish a first answer early” instruction from shared guidance so the two cadences would not conflict in the final request.

Suppose the first five turns ran in Standard and Main requested an upgrade on turn six. Only after Host actually applies it will turn seven's newly assembled request use Deep cadence guidance. There is no old provider-side System Prompt to overwrite; prior research remains available through the projected transcript. The upgrade cannot revise an already committed answer retroactively, nor does it automatically raise reasoning effort.

### Progress and answer content use existing delivery paths

The core research path can be summarized as follows; authorization, deadline, correction, and recovery details are deliberately omitted:

<figure class="deep-research-figure">
<picture><source media="(max-width: 700px)" :srcset="withBase('/diagrams/deep-research/delivery-lanes-en-mobile.svg')" /><img :src="withBase('/diagrams/deep-research/delivery-lanes-en.svg')" alt="Only Host-applied Deep selects Deep guidance; otherwise ordinary guidance remains. Both progress and independently supported answers can return to research. Publishing a part is not termination; existing stop conditions still govern." loading="lazy" /></picture>
<figcaption><strong>Figure 5 · Two delivery paths within one research loop</strong><br />Only Host-applied Deep selects Deep guidance; otherwise ordinary guidance remains. Both progress and independently supported answers can return to research. Publishing a part is not termination; existing stop conditions still govern. <a class="diagram-original" :href="withBase('/diagrams/deep-research/delivery-lanes-en.svg')">Open full diagram</a></figcaption>
</figure>

`send_research_update` carries a concise progress or attention assessment, subject to its own receipt and presentation rules. It is not a formal answer. `send_answer_part` publishes a portion of the answer. Publishing one part does not end the research; termination remains governed by the existing completion mechanism. Ordinary assistant text and explicit answer tools still follow the existing Publication authority.

Deep adds no mandatory final Writer and no minimum number of sources before a legitimate part may be published. The model can share a supported section while investigating remaining questions. Unsupported conclusions must retain their limitations instead of being laundered through a progress message.

### More investigation requires room for legitimate revisions

A correction notice or a longer appendix may arrive after an initial section has been published. The existing `replaces` mechanism can revise an authorized current block rather than accumulating a trail of near-duplicate appendices.

Ordinary defaults allow up to two modifications per block and eight across a Research Run. For applied Deep, the unset defaults become **six and twenty-four**. An explicit operator limit still wins, including an explicit zero.

This does not permit arbitrary whole-document edits. Target identity, revision, source permissions, and durable-save checks still apply. A temporary preview visible to the user is not proof that Recovery has saved the corresponding revision. Earlier modification usage is not erased when the mode upgrades, and recovery reconstructs the original Run and publication facts.

The implementation remains intentionally narrow: **Resource Owner governs capacity; the model researches and synthesizes; Publication owns official answer versions; the existing durable path owns recovery.** Deep alters strategy and capacity inside this path rather than cloning it.

## 4. What did the matched runs actually show? {#_3-what-did-the-matched-runs-actually-show}

An earlier matched study used two synthetic fund cases. In A, Deep delivered the first useful content later but eventually met 14/14 requirement groups versus Standard's 13/14, and reached terminal state earlier. In B, both met 15/15; Deep began useful delivery slightly earlier but finished later and consumed more known resources. The directions were already mixed, and the sample was small.

On November 10, 2026, we completed another four matched cases: two with **all source material present at Run start** (S1, S2), and two where **a corrected source was registered after the first publication** (D1, D2). Within each pair, the question, source bytes, `deepseek-v4.1-flash` model, provider, and tool composition were held fixed, with fresh Conversations, databases, and workspaces for each mode.

The reports support the following case-specific observations, which make the scores easier to interpret:

- **S1 · Valuation and source constraints (7 requirement groups):** whether the valuation interval retained an open upper bound, conclusions named their sources, and an earlier snapshot justified back-calculating an old NAV from the current share count. The last inference lacked evidence of an unchanged share count in both modes, an extra error the pass counts must not conceal.
- **S2 · Source support and risk statements (9 groups):** both modes completed their source citations only in the second delivery. Deep's final version removed a first-version “maximum loss of −100%” example unsupported by the asset-type evidence. A passing final score does not make the first version reliable.
- **D1 · Answering after a source correction (8 groups):** final answers were compared after the correction became available. The first publications were preparation notices, so they do not establish an old conclusion → new evidence → revision sequence.
- **D2 · Return gap and version revision (8 groups):** the question explicitly asked for a revisable v1 conclusion before inspecting the correction. The reported gap changed from −0.5 to −0.9 percentage points; review checked both that ordering and whether fee explanations exceeded the evidence.

The complete frozen questions and item-by-item rules were not published with the engineering report. These are verifiable observation points, not complete task statements or a reproduced rubric. **The denominator is the number of preregistered requirement groups for that case; a group passes only when all its subconditions are met, and unassessed groups remain in the denominator.** Thus 7/7 and 9/9 are not equal-difficulty capability percentages and should not be pooled into a win rate.

### The four pairs did not produce a Deep sweep

| Task | Final requirements met, Standard → Deep | Earliest version meeting all requirements, Standard → Deep | Conversation completed, Standard → Deep |
| --- | --- | --- | --- |
| S1 · Static sources | **7/7 → 5/7** | 326 s → Not reached | 411 s → 310 s |
| S2 · Static sources | 9/9 → 9/9 | 96 s → **73 s** | **102 s** → 129 s |
| D1 · Publication-triggered update | 8/8 → 8/8 | **123 s** → 183 s | **184 s** → 262 s |
| D2 · Publication-triggered update | 7/8 → 6/8 | Neither reached | 445 s → 329 s |

<figure class="deep-research-figure">
<picture><source media="(max-width: 700px)" :srcset="withBase('/diagrams/deep-research/matched-outcomes-en-mobile.svg')" /><img :src="withBase('/diagrams/deep-research/matched-outcomes-en.svg')" alt="These exploratory pairs retain their different denominators and failures. S2 Deep met all requirements sooner but finished later; S1 and D2 ended sooner with omissions." loading="lazy" /></picture>
<figcaption><strong>Figure 6 · A complete answer and a completed Run are different</strong><br />These exploratory pairs retain their different denominators and failures. S2 Deep met all requirements sooner but finished later; S1 and D2 ended sooner with omissions. <a class="diagram-original" :href="withBase('/diagrams/deep-research/matched-outcomes-en.svg')">Open full diagram</a></figcaption>
</figure>

A “met requirement” here means that every subcondition of a preregistered requirement group was judged satisfied. It does not mean the entire answer contained no other errors. A completion event is not a browser-render timestamp; a first publication is not necessarily the first useful result.

S1 Deep reached terminal state sooner but missed an upper-bound interval and named source support. S2 Deep produced a fully satisfactory version earlier, yet terminated later. D1 Standard reached a version meeting all requirements and terminated sooner. However, both D1 modes first published only a preparation notice; the correction was registered about 0.002 seconds later, before actual source reading or a substantive answer. Its 8/8 scores therefore do not demonstrate that either model first formed an old-version conclusion and then revised it in response to new evidence. Neither D2 mode satisfied all requirements, and Deep's first publication was merely a reading notice: the task's requirement to publish a revisable old-version conclusion before inspecting the correction was not demonstrated.

One part of the D2 task wording admits a looser interpretation. If a later accurate restatement of v1 suffices, Deep could be counted as 7/8 instead of 6/8. An unsupported fee-bound inference remains in either interpretation, so Deep still does not reach 8/8. We retain both interpretations rather than silently changing the criterion after the result.

<figure class="deep-research-figure">
<picture><source media="(max-width: 700px)" :srcset="withBase('/diagrams/deep-research/evidence-timing-en-mobile.svg')" /><img :src="withBase('/diagrams/deep-research/evidence-timing-en.svg')" alt="Both D1 modes and D2 Deep first published preparation notices. D2 Standard did publish an old-version conclusion before revising it, but its fee inference remained wrong." loading="lazy" /></picture>
<figcaption><strong>Figure 7 · An update trigger does not prove a revised conclusion</strong><br />Both D1 modes and D2 Deep first published preparation notices. D2 Standard did publish an old-version conclusion before revising it, but its fee inference remained wrong. <a class="diagram-original" :href="withBase('/diagrams/deep-research/evidence-timing-en.svg')">Open full diagram</a></figcaption>
</figure>

### Why “shorter elapsed time” cannot decide the mode

Across these four pairs, Standard made 82 physical calls and Deep made 69. Known provider-reported list-price subtotals were about USD 0.219 and USD 0.192 respectively. One D1 Deep call lacks a complete protocol and usage record; subscription costs, local services, and actual billing are outside those subtotals.

Crucially, **fewer calls did not translate into better correctness on every case**. In some runs Deep stopped sooner but left requirements unmet. In others, it spent longer to reach the same final requirement coverage.

D1 and D2 also have an experimental-design dependency: the corrected source became available only after a first official publication. Since the mode can change that publication time, it also affects when the next evidence version is ready. This measures a complete publication-triggered feedback workflow, not the isolated causal effect of Deep wording when both modes receive all evidence at exactly the same time.

These runs establish that both modes entered Native Research, consumed their distinct effective allocations, read sources, and delivered saved answers. **They do not demonstrate a universal Deep advantage in financial correctness, latency, or cost.**

### What else has direct execution evidence?

Other live runs captured applied Deep grants, actual Child participation, continued reads after source updates, `replaces` revisions, and durable readback of the resulting answer. These are execution facts: the mechanisms can participate in real long-running research, not merely produce an impressive-looking text response.

The **four paired answers from the earlier A/B study** were separately evaluated with Ragas and DeepEval; **those evaluations do not cover S1, S2, D1, or D2**. Both engines used each saved answer and its confirmed, exactly deduplicated source contexts actually received by the model. Their reference answers and 11 external requirements per case are distinct from the primary review's 14 groups for A and 15 for B.

All 20 Ragas metrics produced scores. Of 16 DeepEval metrics, 10 produced scores, two were inconclusive because of metric-verdict structure problems, and four were inconclusive because A Standard exceeded the local input-capacity limit. The engines also differ in claim decomposition and Judge behavior. External scores neither replace requirement-group review nor certify execution or source-reading facts: a single `faithfulness=1.0` is not proof that provenance, calculations, and reported read scope have all been independently verified.

That distinction locates the real boundary of this implementation: **we can deterministically give a model more authorized room to research; whether it uses that room well must still be established from observed results.**

## 5. Why not introduce a separate Deep graph? {#_4-why-not-introduce-a-separate-deep-graph}

An alternative is a fixed sequence such as plan → search → expert review → final Writer. That may be appropriate when a product's research workflow is tightly standardized.

ETF Agent already had a tool loop, Children, resource and finalization phases, progress events, Publication, checkpoints, and recovery. Adding a parallel Deep graph would require the same permissions, budgets, recovery facts, and answer revisions to be coordinated twice. We instead let **the existing loop adapt to the Run's actual Host-confirmed resource state**, leaving mechanically decidable effects to Host and judgment of evidence sufficiency to the model.

This does not prove the design is final. The new comparisons show that extra capacity and more cautious writing guidance do not automatically produce better synthesis. A future test of delivery cadence itself should make the same evidence available at fixed times and separately investigate the effect of prompt strategy and the effect of the budget profile, rather than attributing their combined treatment to either alone.

For an agent that already has a mature Native Loop, Deep can start as a **bounded, recoverable, measurable mode**. Actual evidence can then determine whether additional planning, review, or final-writing stages are worth their complexity. Ordinary Research retains its value for short questions; Deep offers more opportunities to investigate and revise difficult answers, not a guarantee of a better result.

---

**Implementation and evidence:** This article describes the ETF Agent engineering implementation verified on November 10, 2026. Paired results draw on saved answers, source views, and independent reviews from the earlier two-case A/B study and the four-case study completed that day. Full raw inputs and review materials are not public; the article retains verifiable result definitions, counterexamples, and unknowns. These synthetic evaluations involved no real personal holdings or trades.

**Further reading:** [When should research stop?](./agent-research-decisions-evidence-synthesis.md) discusses choosing the next evidence-gathering action. The [long-horizon research panorama](./agent-long-horizon-research-panorama.md) covers continuity across time. This article focuses specifically on Deep resource mode, delivery cadence, and comparative outcomes. The public [Open ETF Agent](https://github.com/hpoenixf/open-etf-agent) repository provides a starting point for exploring the broader Agent project; **do not assume that this engineering Deep implementation is already shipped in that public version**. If the project is useful, consider starring the public repository.

<style scoped>
.deep-research-figure { margin: 28px 0; }
.deep-research-figure picture, .deep-research-figure img { display: block; width: 100%; height: auto; }
.deep-research-figure figcaption { margin-top: 12px; font-size: 14px; line-height: 1.7; }
</style>
