---
title: "What to Trust in Agent Engineering: From Local Facts to System Commitments"
description: "Follow a fund-comparison task through development, research, review, and delivery to see why local success does not automatically establish system-wide trust, and how claims, premises, and dependencies guide verification while preserving uncertainty and useful autonomy."
readingBrief:
  takeaways:
    - "Check claims, permissions and actual effects separately. Authentic sources do not ensure a valid comparison, and saving does not establish correctness."
    - "Summaries and handoffs may reuse evidence, but must retain conditions such as dates and coverage that make a claim valid."
    - "Before adding a reviewer, define the error to find and supply the necessary originals. Reassessing the same incomplete summary cannot fill the gap."
    - "When a premise changes, recheck dependent claims. Reuse unaffected parts only when dependencies are clear and original versions remain readable."
  appliesTo:
    - "Engineers building research agents or using Coding Agents who need acceptance checks and boundaries for autonomous execution."
  notFor:
    - "A universal trust score, comprehensive security certification, or a ready-to-use automated trading system."
---

<script setup>
import { withBase } from 'vitepress'
</script>

# What to Trust in Agent Engineering: From Local Facts to System Commitments

**Agent engineering has to manage what a system promises its users, and what grounds it has for making those promises.** How broad a conclusion can a fact established in one part of the system support? What actual actions does a valid authorization permit? What, precisely, does a successful receipt establish has happened? These questions determine how a model's capabilities become results that people can use.

A system can produce genuine success signals at several stages and still deliver an unreliable answer. The code really did pass its tests, the tools really did read the material, the calculation really did follow the formula, and the report really was saved. The mistake occurs at a handoff: what the next stage needs to believe exceeds what the preceding stage actually established.

For example, “we read two fund disclosures from their official websites” gradually becomes “the two disclosures can be compared directly.” Then “the calculation produced a difference” becomes “one fund is more suitable for this user.” No obvious interface error has occurred, yet the commitment keeps expanding.

Calling this **trust escalation without sufficient grounds** helps connect issues otherwise discussed separately under prompt injection, research evidence, tool authorization, AI Coding, and delivery acceptance. The phrase describes a class of composition errors. It is not a trust ranking, nor does it explain every failure: service outages, implementation defects, and incorrect business rules still need their own remedies.

This article follows the development and use of a fund-comparison feature. The recurring scenario is a teaching example. The engineering counterexamples woven into it come from previously published observations or controlled validations; events from different times are not presented as one incident. The question is: **with a model that can still make mistakes, how do we decide which results to use, which actions to permit, and which additional checks we do not need?**

## 1. Start with a task: why does local correctness fail to compose into system-wide trust?

Suppose a team is building a fund-comparison feature. The user asks:

> Compare Funds A and B, explain the overlap in their disclosed holdings and the differences in their fees, and save the report so I can return to it later.

A Coding Agent implements document reading, holdings comparison, and report storage. Its tests use complete examples with the same reporting date and assert that the numbers and files meet expectations. A research agent then handles real inputs, finds two official documents, calculates common holdings, and generates a report.

Several conditions may still be unresolved: do A and B disclose holdings as of the same date? Do the extracted tables cover all holdings or only a subset? Do the fees apply to the share class the user specified? Will the user later read the same report version that was just reviewed?

The test examples need not be wrong, and the official websites need not contain falsehoods. The problem is that the tested conditions differ from those of the current task, while the system carries the earlier success forward without qualification.

| What a stage has established | What the next stage intends to conclude | Conditions that still need to hold |
| --- | --- | --- |
| Two documents came from verifiable public sources | They can answer the current comparison question | Their subjects, dates, and coverage match the question |
| A program calculated overlap from its inputs | The number describes overlap across the two funds as a whole | Input coverage and the denominator support that scope |
| A Reviewer agrees with the report | There was an opportunity to detect the critical errors | The Reviewer actually received the necessary material and checked it against suitable criteria |
| The save interface returned success | The user can retrieve this result later | The corresponding version is durably stored and readable through the supported user entry point |

For local correctness to compose into system-wide trust, both component behavior and the conditions at handoffs must hold. A component that guarantees “calculate according to the inputs” cannot be treated by its caller as guaranteeing “the inputs are correct.” A storage service that confirms a particular version was committed cannot lend that receipt to the research component as proof that the report's contents are correct.

This is continuous with interface contracts in ordinary software. The additional difficulty with agents is that many handoffs happen in natural language, and the model may choose its next step dynamically based on what it has just read. Conditions originally attached to the material can easily disappear during summarization, collaboration, and continued research.

The most useful starting point for reviewing a handoff is therefore to identify this gap: **does the scope supported by the current evidence match the commitment the downstream consumer is about to make?**

## 2. Distinguish three kinds of commitment before deciding whom to trust

We often use “reliable,” “safe,” and “complete” together, but they require different kinds of support. The same report illustrates three distinct commitments.

**Epistemic judgments** ask whether a statement holds under specified conditions. They require relevant facts, an applicable comparison method, and verification proportionate to the strength of the conclusion. For example, the intersection of disclosed holdings from the same reporting date can support a statement with that limited scope. It does not automatically support a claim about all assets.

**Action authorization** asks who may do what, to which object, in the current task. It comes from a valid identity, the user's delegation, and execution policy. A correct report does not thereby gain permission to be sent to someone else; permission to send it does not establish that its contents are correct.

**Observed effects** ask whether a particular action actually produced the specified effect. They require a receipt from the execution service, resource state, or an actual read of the corresponding artifact. A model saying it saved a report and a storage service confirming that a particular version was committed have different evidential force.

<figure>
  <picture>
    <source media="(max-width: 760px)" :srcset="withBase('/diagrams/agent-trust/claims-en-mobile.svg')" />
    <img style="max-height: none !important; height: auto;" :src="withBase('/diagrams/agent-trust/claims-en.svg')" alt="A fund report requires separate support for epistemic judgments, action authorization, and observed effects. The three rely on different grounds and cannot substitute for one another." />
  </picture>
  <figcaption>Figure 1 · The three commitments work together, each with its own grounds. They are not successive trust levels on a single scale. <a class="diagram-original" :href="withBase('/diagrams/agent-trust/claims-en.svg')" target="_blank" rel="noopener noreferrer">View the full diagram</a></figcaption>
</figure>

This explains why a single aggregate score is a poor basis for deciding everything. A high source-quality score cannot compensate for missing authorization. Complete execution records cannot compensate for invalid comparison premises. Weighting these dimensions into a “trust score of 95” may conceal the very condition that has not been met.

The smallest useful object of trust is therefore a **specific claim with an explicit scope**. For example:

> Using the two specified document versions with the same reporting date, the following list identifies common holdings within their disclosed portions. Undisclosed holdings are not included.

This statement identifies its subjects, scope, and supporting material. It is easier to check than “this agent is trustworthy,” and easier to reassess when conditions change.

Separating a claim from the argument and evidence that support it is an established practice in dependable systems engineering. OMG's [Structured Assurance Case Metamodel, SACM](https://www.omg.org/spec/SACM/2.3/PDF), represents relationships among claims, arguments, and evidence. The useful idea here is to make a conclusion's dependencies visible. An application can express them through existing source references, version information, and acceptance records; it does not need to begin by building a new proof platform.

## 3. Once the material is authentic, what is still needed to support a conclusion?

Return to Funds A and B. Both official disclosures are authentic, but one reports holdings as of the end of June and the other as of the end of September. The model finds common holdings and writes in its summary: “The two funds currently have substantial overlap.”

That step introduces two premises the source material may not support: that different dates can represent the same point in time, and that the disclosed portions can stand for the whole. If the missing material cannot yet be obtained, the system can still describe the intersection between these two historical disclosures. It should retain their dates and coverage limits, rather than present the result as a statement about all current holdings.

A real research run described in [The Costliest Part of AI Coding Is Deciding What Is Worth Verifying](/en/articles/ai-coding-judgment-and-verification) had already produced its report when a human review found that the claim “one tracking constraint is twice as strict as the other” lacked a comparable basis in the sources. The primary documents were read again and the inference was withdrawn. The original report was retained, and the correction was saved separately. The observation concerns an unsupported premise when wording in the material was turned into a quantitative relationship, rather than a failure of the calculation tool.

Deterministic computation remains important here. Assigning units, precision, and formulas to reproducible programs can reduce one class of errors. But a program can faithfully calculate with data expressed on the wrong basis. Why the inputs and formula apply still needs explanation and checking.

**The aim is to make new conclusions rest on an explicit derivation, while allowing reasoning to produce them.** Two checked values can of course yield a difference through correct subtraction; there is no need to seek a second source for each difference. A summary that preserves the relevant conditions can also reuse the original evidence. What needs additional support is a premise quietly introduced by the derivation: moving from a sample to a population, from historical data to the present, or from a risk description to suitability for an individual.

This has a direct architectural consequence: provenance cannot be reduced to a URL. The dates, versions, coverage, and calculation basis that determine a conclusion must remain recoverable through its references. Not every field must appear in every model turn, but when it supports an important judgment, the party making that judgment should actually receive it.

Evaluations should also include cases that challenge these changes in scope. Adding ten more normal examples with matching dates and complete tables may be less useful than adding one case in which “the dates differ, but both documents are authentic.” The latter tests whether the system recognizes comparison conditions, rather than proving once more that the parser can read a table.

## 4. Handoffs often lose the very conditions that make a conclusion valid

Longer research makes summaries, caches, subagents, and historical reads increasingly useful. They help the model work within limited context, while creating more opportunities to reinterpret information.

The original material says “the first several disclosed holdings as of the end of June.” A first summary reduces that to “major holdings,” a second handoff to “fund holdings,” and the final report may discuss “the portfolio as a whole.” Each rewrite looks natural, but a few words that determine scope disappear. [The Evidence Chain Behind a Trustworthy Financial Agent (Chinese original)](/articles/financial-agent-trustworthy-evidence-chain) discusses this expansion in detail. Here, the broader point is the responsibility shared by different kinds of handoff.

**Information may become shorter; its conditions should not become broader without support.** A summary can omit repeated prose, but if omitting the date changes the comparison, that date is essential to this task. Engineering should preserve meaningful relationships without requiring every summary to reproduce its source word for word.

An even more dangerous change occurs when material acquires an instruction identity it did not originally have.

In a [controlled content-trust regression](/en/articles/agent-content-trust-prompt-injection), Web content passed through a late request transformation and ended up in the `system` position of the final SDK request. The validation used real protocol mapping with simulated network dispatch. It exposed a structural error on the application side; it did not establish that a real production attack had occurred. It shows why telling the model at the entry point that “Web pages are only material” cannot, by itself, establish that later transformations preserve that identity.

This has a handoff structure similar to the research error above, but the two are different kinds of defect. One expands the applicability of a conclusion; the other changes the authority of content. The former calls for checks of domain definitions and meaning. The latter calls for constraints on source identity, request assembly, and execution permissions. A generic “trustworthiness check” cannot take over both responsibilities. OWASP's [Prompt Injection guidance](https://genai.owasp.org/llmrisk/llm01-prompt-injection/) likewise discusses influence through external content alongside least privilege and execution controls; prompt text alone cannot carry the whole defensive burden.

Long-term memory and other agents' opinions need the same distinction. A previously saved recommendation can be research material, but recalling it does not turn it into new authorization from the user today. A subagent's conclusion may be valuable, yet “provided by an internal collaborator” identifies its source without replacing an assessment of its grounds and applicable conditions.

The principle is: **when passing content along, preserve the grounds on which it may be used; when changing its identity or purpose, have the mechanism responsible for that decision reassess it.**

## 5. Does adding a verifier create another opportunity to find the error?

The comparison of Funds A and B has been generated, and the team decides to add a Reviewer. The main agent passes it the report and a summary. The Reviewer says the analysis is reasonable.

If the summary has already removed the disclosure dates, the Reviewer lacks sufficient material to check whether the dates match. Adding another Reviewer that reads only the same summary still does not fill that gap.

There is a concrete precedent. A [controlled Reviewer integration validation](/en/articles/ai-coding-judgment-and-verification) found that the system had invoked the original-material reader, but its complete output never actually reached the Reviewer. The Reviewer still received the incomplete summary. The repair was made at the existing material handoff. This validation established that the delivery of material into the input was corrected; it did not establish the reliability of all the Reviewer's semantic judgments.

However, “using the same source” does not mean “the review adds no value.” One checker can recompute the numbers while another examines dates and share classes. Even when both read the same original document, they may detect different errors. A different model, prompt, or isolated context may create more opportunities to find mistakes, but these are implementation choices.

The questions that matter are: **does this check improve our ability to distinguish right from wrong? Does it depend on precisely the premise we are trying to question?**

| The uncertainty at hand | A more targeted check | An approach that does little to fill the gap |
| --- | --- | --- |
| Whether the two documents support a comparable analysis | Check dates, share classes, metric definitions, and coverage in the original material | Ask more models to assess the same summary after its conditions have been removed |
| Whether the calculation faithfully implements the chosen method | Independently recompute it or examine the reproducible calculation | Assess only the report's professional tone or coherence |
| Whether the correct report version was saved | Retrieve and compare the corresponding version through the supported read path | Ask the generator, “Are you sure it was saved?” |

The same principle applies to Coding Agents. Having one agent generate the implementation, tests, and explanation can be an efficient way to work. The issue is whether all three inherit an unchecked assumption about the requirements. Having another agent write the tests does not automatically make the business premises independent.

For this fund-comparison feature, acceptance conditions can be stated in advance as observable behavior: differing dates must be disclosed in the comparison; partial holdings must not be described as complete holdings; and a specified version must be readable after it has been saved. Validate with inputs that challenge those conditions, rather than deriving every expected result from the implementation that has already been written.

Even the premises of a test need observational support. [The Agent Evaluation Panorama](/en/articles/honest-agent-evaluation) records a controlled recovery test whose fixture declared that the old Worker had stopped, while the old process could still write. Only when fault injection was placed at the actual write boundary did the test begin to exercise the claimed recovery scenario. The value of a green result depends on the conditions the test actually created and the outcomes it actually checked.

In [Demystifying evals for AI agents](https://www.anthropic.com/research/demystifying-evals-for-ai-agents), Anthropic distinguishes the execution transcript from the eventual outcome in the environment and emphasizes calibrating model grading against human judgment. A transferable practice is to use appropriate methods for deterministic constraints, semantic judgments, and actual effects, so that each score answers a clear question.

Before adding a Reviewer, specify the error it should detect, the material it needs to see, and why the existing checks are insufficient. If it would merely reassess the same incomplete input, repairing the handoff is more useful. If the current reviewer can perform the same check once it has complete material, another role and another serial call can wait.

## 6. Trust has a period of validity: what to recheck depends on which premises changed

The report is completed today. Tomorrow, Fund A publishes a new holdings disclosure. The user returns and asks, “Does the conclusion still hold now?”

The old report remains an authentic historical result, but the applicability of its “current overlap” claim needs reassessment. If the new material changes the holdings data, the overlap calculation and explanations that depend on it need updating. Parts whose fee documents, share classes, and comparison conditions remain unchanged may still be reusable.

Neither extreme is useful: treating the whole report as permanently valid ignores change, while repeating all the research discards work that still holds. A better approach is to follow dependencies to identify the affected judgments.

A **controlled, synthetic same-Run regression in November 2026** made the distinction concrete. The Root holdings snapshot and portfolio weight stayed fixed. The research first acquired disclosure A and computed known look-through exposures, then obtained a changed disclosure B within the same Run. Both disclosures covered only part of the underlying holdings; new source bytes did not make the unknown remainder disappear.

| Known look-through exposure | Disclosure A | Recomputed disclosure B |
| --- | ---: | ---: |
| Stock A | 5% | 2% |
| Stock B | 3% | 6% |
| Unknown remainder | 92% | 92% |

A completed calculation is not automatically applicable to a later disclosure. In the controlled path, the original method composer rejected reuse of the old result under B, then new computation produced a second report. Both A and B were saved and reread under their own identities; B did not overwrite A's file bytes. **Historical source lineage from one Run or Workspace** records what the research has depended on, not proof that a selected computation remains compatible with the current inputs. The workspace record can retain earlier dependencies while the latest report actually selects the freshly recomputed child result.

This does not establish a general-purpose automatic invalidation engine. The case was verified using synthetic inputs, a scripted model, and real local Python and file-delivery handlers. Selective reuse is defensible only where input, method, and output versions can be associated precisely; otherwise the review should widen rather than infer validity from the fact that everything happened in one task.

<figure>
  <picture>
    <source media="(max-width: 760px)" :srcset="withBase('/diagrams/agent-trust/dependency-en-mobile.svg')" />
    <img style="max-height: none !important; height: auto;" :src="withBase('/diagrams/agent-trust/dependency-en.svg')" alt="When a holdings source changes, recheck the overlap calculation and judgment. An independent fee comparison may be reused if its sources and applicable conditions are unchanged; one changed premise does not invalidate every result." />
  </picture>
  <figcaption>Figure 2 · A changed premise means the supporting grounds need reassessment, not that the opposite of the original conclusion has been established. Selective reuse requires clear dependencies and readable original versions. <a class="diagram-original" :href="withBase('/diagrams/agent-trust/dependency-en.svg')" target="_blank" rel="noopener noreferrer">View the full diagram</a></figcaption>
</figure>

This principle explains several engineering choices at once: recheck research conclusions when their source material changes; run regressions covering affected commitments when the implementation changes; determine whether an earlier review still applies after a report revision; and check whether an action remains within the original authorization when a task resumes.

An existing authorization should not expire merely because a process restarts, nor should it continue indefinitely because a historical summary says “the user approved.” Its reuse depends on what the actual grant specifies about the subject, resource, action, version, and validity conditions. Rechecking it does not mean asking the user again every time.

Actual effects still require separate treatment. Suppose a save request has been dispatched, but a network interruption prevents the receipt from returning. “We did not observe success” cannot be translated directly into “nothing was saved.” First query the original operation or the corresponding version. Retry safely under the original idempotency identity only when the execution protocol explicitly permits it. Another round of model reasoning cannot establish whether the remote system committed the write.

Local uncertainty should also propagate along dependencies. If comparable holdings are unavailable, the system can deliver a checked fee explanation that stands independently. It cannot retain an overall risk ranking that depends on the missing holdings comparison. If the dependencies themselves are unclear, the review must be widened; we cannot simply assume for convenience that the other parts are unaffected.

This yields a practical rule: **invalidation should follow actual dependencies, and verification should cover the commitments affected.** A small task can express these relationships with existing version references and a few explicit acceptance conditions. More systematic dependency records become worthwhile when reuse over time, branching, or correction becomes too complex to manage otherwise.

## 7. Expand autonomous exploration, and place commitments at the right boundaries

Research cannot start if every reasoning step must first be fully proved. A model needs to propose hypotheses that do not yet have support, choose search directions, try calculations, and revise its judgments in response to new findings. That exploration is part of an agent's value.

What can be strictly constrained is the adoption of those candidates: before a hypothesis becomes a conclusion for the user, explain its grounds and limits; before a call reaches a protected resource, check actual authorization; before the system claims completion, confirm the corresponding effect.

These boundaries occur where the actual behavior takes place. Search itself accesses a network and consumes a budget, and query parameters may carry sensitive data. Exploration therefore also needs resource and data-scope constraints. Controls cannot all be postponed until the final report is published.

<figure>
  <picture>
    <source media="(max-width: 760px)" :srcset="withBase('/diagrams/agent-trust/autonomy-en-mobile.svg')" />
    <img style="max-height: none !important; height: auto;" :src="withBase('/diagrams/agent-trust/autonomy-en.svg')" alt="Within authorized data and budget limits, an agent may read material, form hypotheses, gather support, and revise. Published conclusions, actions, and completion claims are checked against evidence, authorization, and actual effects respectively; insufficient support remains local uncertainty." />
  </picture>
  <figcaption>Figure 3 · Exploration can iterate; formal commitments have applicable conditions. These distinctions are perspectives for making judgments and can be handled by existing modules together. <a class="diagram-original" :href="withBase('/diagrams/agent-trust/autonomy-en.svg')" target="_blank" rel="noopener noreferrer">View the full diagram</a></figcaption>
</figure>

Making an agent more autonomous need not relax every threshold. It can choose which material to investigate, how to break down a question, and when to seek additional support, while stable constraints continue to apply at boundaries with defined permissions and consequences. Reducing repeated questions and ineffective reviews is compatible with retaining essential protections.

Putting rules into code is not the final proof either. An authorization service can be misconfigured, a calculation program can contain defects, and a human reviewer can miss something. Code offers explicit enforcement points, inspectable rules, repeatable checks, and an execution path on which the model cannot freely rewrite constraints. Those mechanisms still need verification, especially whether actual effects can bypass them.

Engineering will always depend on some foundations: where identity comes from, who maintains the rules, where writes occur, and which record represents a commit. A reasonable objective is to keep that foundation small, assign responsibility clearly, and make it continuously verifiable. Indefinitely adding reviewers cannot eliminate every trust assumption.

### How can a design review actually use this perspective?

Start with a commitment on which the user genuinely depends, such as “the report completes the comparison within the specified scope and is saved as a version that can be read later.” Work backward to its support: what material and premises does the comparison require, what authorization does saving require, and what establishes that the user can read it?

At each important handoff, ask three concrete questions:

1. **What has actually been established here?** State the scope and version instead of using a generic “success.”
2. **What will the next stage assert, execute, or promise the user on that basis?** Look for an expansion in subjects, time, permissions, or effects.
3. **What supports the additional commitment?** It may be a valid derivation, an existing business constraint, current authorization, or a check that has yet to be performed.

These questions do not automatically call for more modules. If the existing tool gateway already covers the same authorization boundary completely, reuse it instead of creating another authority that lets a model decide permissions. If the original material remains retrievable, is still eligible for use, and meets the conditions of the current task, repair its actual handoff and avoid redundant retrieval. If acceptance for a version still applies, reuse the receipt. If a comparison premise is missing, obtain the relevant material or narrow the conclusion.

Additional verification also needs a stopping condition. When deterministic checks already cover the required constraints and another Reviewer adds no ability to distinguish a specific remaining error, the process need not grow. For low-consequence, reversible exploration, traceable results and a reasonable budget are often more useful. For permissions, sensitive data, and irreversible effects, a favorable score cannot offset a missing essential control.

## Conclusion: the result we deliver is a commitment we can stand behind

Return to the task involving Funds A and B. A useful result can describe the intersection of their disclosed holdings with each source's own date and coverage, provide a fee explanation whose basis has been checked, and leave the broader judgment open where support is still missing. The relevant comparison can be updated once data for the same reporting date has been obtained. After the report is saved, the user retrieves the corresponding version. When new material appears, the system can explain which parts need to be revisited.

Such a result neither hides all uncertainty nor abandons valid work because one part remains unknown. The model can keep researching actively, while the system distinguishes which judgments have support, which actions are authorized, and which effects have actually occurred.

The next time an agent says “done,” the most useful question concerns the substance behind that confidence: **what, specifically, has it completed; what does that commitment depend on; and do those conditions still hold now?**

Clear answers give us grounds to use its results within the relevant scope and a way to revise them when their premises change. They provide a foundation for expanding autonomy: the agent can explore more broadly while its commitments to users remain specific.

## Further reading

- [Nine Architectural Judgments Behind One Report](/en/articles/one-report-nine-architecture-judgments): responsibilities and tradeoffs along a report task.
- [The Evidence Chain Behind a Trustworthy Financial Agent (Chinese original)](/articles/financial-agent-trustworthy-evidence-chain): sources, numbers, versions, and how results are consumed.
- [The Costliest Part of AI Coding Is Deciding What Is Worth Verifying](/en/articles/ai-coding-judgment-and-verification): key assumptions and the allocation of verification effort.
- [The Agent Evaluation Panorama](/en/articles/honest-agent-evaluation): separate checks for execution, quality, and actual delivery.

If these engineering ideas are useful, consider starring [ETF Agent Engineering Notes](https://github.com/hpoenixf/eff-agent-article) and sharing agent practices that others can examine and verify.
