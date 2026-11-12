---
title: 'Spec-Driven Agent Development: From Requirements to Trustworthy Delivery'
description: Start with the background and purpose of specifications, then follow file ingestion through principles, design, templates, behavior, verification, archiving and template maintenance—without copying project-specific ceremony.
readingBrief:
  takeaways:
  - A principle enters Spec when it changes scope, alternatives, scenarios and acceptance—not when a proposal merely claims compliance.
  - Spec records behavioral agreements, Plan organizes execution, and tests provide observations. Read relevant constraints and current facts before choosing artifacts.
  - Templates should preserve decisions that later work actually uses. File count is not quality, and lightweight practice must still respect the selected workflow’s real dependencies.
  - Evolve existing tests while specifying the change, then inspect actual consumer paths. Local passes cannot substitute for a result the user can obtain.
  - Archive behavior and rationale; promote reusable blind spots into templates. The workflow itself must shed duplication, persistent overhead and rules that cannot exit.
  appliesTo:
  - Engineers using coding agents on existing systems who want design philosophy to influence requirements, implementation and quality judgments.
  - Teams handling cross-responsibility or multi-session changes and maintaining Spec templates, tests and engineering knowledge.
  notFor:
  - Obtaining correct requirements, real model quality or release approval solely from documents, structural checks or an installed tool.
---

<script setup>
import { withBase } from 'vitepress'
</script>

# Spec-Driven Agent Development: From Requirements to Trustworthy Delivery

Spec is short for specification. In software development, it records what a system should do, under which conditions, and which boundaries must hold, in terms that people can discuss and check. It is not the name of an AI tool, nor is it simply an implementation task list.

Ask a coding agent to “add file reading,” and code can appear before the requirement becomes clear. May any model-supplied URL trigger a download? How should partial extraction be represented? Should a failed attachment stop the entire task? Leaving those decisions to implementation-time guesses can produce working software that does not match the team's intent.

This article first explains why specifications are useful, then follows authoring, templates, implementation, verification, archiving and maintenance. ETF Agent's file-ingestion change supplies the main example; other experiences illustrate only specific choices. Readers need not copy our directories or principles. The transferable question is **how a team's constraints influence each change instead of remaining isolated in a principles document**.

## 1. What Is a Spec, and Why Does It Matter Again in AI Development?

<span id="_1-start-with-what-must-survive-the-handoff-not-which-files-to-write" aria-hidden="true"></span>
<span id="1-start-with-what-must-survive-the-handoff-not-which-files-to-write" aria-hidden="true"></span>
<span id="_1-carry-design-judgment-through-the-change-not-just-files-through-a-sequence" aria-hidden="true"></span>
<span id="quality-means-more-than-implementing-the-feature" aria-hidden="true"></span>
<span id="both-the-product-and-the-method-need-feedback" aria-hidden="true"></span>

### Specifications predate coding agents

Specifications predate AI coding. In a [2013 essay](https://www.wired.com/2013/01/code-bugs-programming-why-we-need-specs/), Leslie Lamport advocated specifying behavior before implementation and distinguished informal from formal specifications. This is an earlier example, not the origin date of Spec.

The underlying problem persists: **human intent, implemented behavior and the next maintainer's understanding do not align automatically**. Code alone may not reveal whether a behavior was deliberate, inherited baggage or an accident. Oral agreements can lose their conditions during handoff. A specification provides a shared place to examine and revise those decisions.

For example, “support file reading” is a goal. “Admitted files are readable within the current task; unadmitted text cannot initiate a download; partial extraction must not masquerade as a complete document” begins to define behavior. Which parser library to use and where to integrate it are design and implementation questions. **Spec defines outcomes and boundaries, Plan organizes execution, and tests observe whether the agreement holds. They connect but do not replace one another.**

### Which existing problems do coding agents amplify?

AI can turn a vague request into substantial implementation quickly, but someone still has to supply the missing decisions. Without an explicit agreement, that someone may be the current model, a prompt fragment or an incidental pattern in existing code. Another session or executor may interpret the same word differently.

GitHub's [September 2025 introduction of Spec Kit](https://github.blog/ai-and-ml/generative-ai/spec-driven-development-with-ai-get-started-with-a-new-open-source-toolkit/) addressed this mismatch: generated code can look reasonable while missing intent or choosing an unsuitable stack or architecture. The toolkit connects specifications, plans, tasks and implementation.

Spec-driven development, or SDD, is therefore not simply “write more documents before coding.” It makes important agreements continuing inputs to implementation and review. It is particularly useful when work crosses sessions or modules, changes existing behavior, or touches authorization and recovery. A one-off experiment may already be served adequately by a clear request, a few tests and a PR description.

[OpenSpec](https://github.com/Fission-AI/OpenSpec/blob/main/docs/concepts.md) is one implementation of this approach. It separates accepted specifications from proposed changes, describes modifications to existing systems through deltas, and emphasizes iteration rather than an irreversible waterfall. This article uses it to organize artifacts without equating OpenSpec, our project-specific templates and the general idea of a specification.

### From a one-time plan to an ongoing basis for judgment

A construction plan answers “what should change first, and what comes next?” A complete Spec workflow also asks “why is this worth changing, which conditions must survive, and how will we know the result is right?” Its reasoning chain is:

> User goal → relevant constraints and current facts → alternatives and tradeoffs → observable behavior → implementation and verification → acceptance or revision → a basis for the next design.

Principles help rule out unsuitable approaches during design and guide tests and review. New observations can, in turn, change the design. Revisiting a decision is not a process violation when scope, rationale and behavioral changes are reconciled.

<figure style="max-width:640px;margin:2rem auto">
<a :href="withBase('/visuals/en/agent-spec-driven-development-panorama/01-change-lifecycle.svg')" target="_blank" rel="noopener" aria-label="Open the full diagram in a new tab"><img :src="withBase('/visuals/en/agent-spec-driven-development-panorama/01-change-lifecycle.svg')" alt="From intent to a transferable change" width="720" height="836" loading="lazy" style="width:100%;height:auto" /></a>
<figcaption>Figure 1. The workflow preserves commitments, implementation and acceptance grounds. Evidence spans the stages; feedback returns to the affected decision. <a :href="withBase('/visuals/en/agent-spec-driven-development-panorama/01-change-lifecycle.svg')" target="_blank" rel="noopener">Open full diagram</a></figcaption>
</figure>

Quality here includes functional correctness, a useful requirement, clear responsibilities, necessary protections and future maintainability. Spec cannot guarantee correct answers to all of these questions. It makes them discussable before implementation and inspectable during execution instead of raising them only after a problem appears.

## 2. Before Authoring: Turn Relevant Principles into Questions About This Change

<span id="investigate-facts-before-asking-for-decisions" aria-hidden="true"></span>
<span id="_2-before-authoring-bring-relevant-principles-into-context-not-the-entire-document-library" aria-hidden="true"></span>
<span id="start-with-routing-then-deepen-the-relevant-question" aria-hidden="true"></span>
<span id="nine-principles-five-don-ts-and-four-questions-are-not-three-sets-of-gates" aria-hidden="true"></span>
<span id="_3-turn-principles-into-questions-that-change-the-design" aria-hidden="true"></span>
<span id="use-the-five-don-ts-to-examine-additions-not-prohibit-all-complexity" aria-hidden="true"></span>
<span id="apply-the-four-questions-to-the-present-decision" aria-hidden="true"></span>
<span id="a-principle-does-not-authorize-an-arbitrary-new-hard-gate" aria-hidden="true"></span>
<span id="_6-a-real-counterexample-one-termination-function-is-not-one-termination-authority" aria-hidden="true"></span>
<span id="how-did-the-principle-change-design" aria-hidden="true"></span>
<span id="how-did-the-principle-change-acceptance" aria-hidden="true"></span>

A large documentation system is not a prerequisite. In most existing projects, begin with three kinds of material: the team's enduring constraints; the affected module's accepted behavior, code and tests; and the goal and unresolved choices of the current request. Read design history only when it helps explain a decision that matters now.

These sources serve different purposes. Principles guide choices, current code and tests establish implementation facts, and history explains earlier reasoning. Do not flatten them into an undifferentiated “project background” or reread everything for each task. Preparation should produce a fact that changes the proposed solution: for example, “the existing workspace already searches and reads material; this change needs ingestion, not another platform.”

Our particular principles are documented in the [principles index](/en/principles), with the five don'ts and their tradeoffs in the [architecture-evolution article](/en/articles/code-cheaper-systems-harder-to-evolve). What matters here is their use: **choose a principle relevant to the change, turn it into a concrete question, and carry the answer into the design, scenarios and verification**.

Take “a local failure must not veto independently valid results.” For file ingestion, ask whether one failed attachment justifies losing the other results of the same tool call. If not, Design should choose attachment-level failure handling; Spec should preserve those other results; and tests should observe the failed attachment alongside the successful content. Merely declaring compliance in a proposal—or checking that the parser threw an exception—does not complete that chain.

Termination ownership offers a compact real counterexample. Replacing scattered error handling with calls to `terminate(failed)` centralizes the write entry point, while callers may still decide that the entire run has failed. The design instead had local components report facts and the existing run-control responsibility decide continuation, finalization or termination. Acceptance shifted from “which function was called?” to “which permitted effects can continue after a local fault?” The [full mechanism](/en/articles/agent-veto-authority-and-run-termination) has its own article. The lesson here is that a principle must change choices and observable behavior, not only names.

Keep these answers in existing design notes or decision records; another “principle-compliance form” is unnecessary. Nor does a principle automatically authorize a new gate. A denial needs a protected effect, authoritative facts and a defined scope. Necessary protection remains, and independently permitted paths need verification as well.

## 3. Templates Are Not a Document Package: Why Each File Exists

<span id="_4-templates-are-not-a-document-package-why-each-file-exists" aria-hidden="true"></span>

Principles need a durable carrier, but not necessarily one enormous rulebook. We use OpenSpec to organize accepted behavior and proposed deltas, Superpowers-related practices for exploration, execution, tests and review, and project-specific rules for evidence, closure and historical handoff.

Connecting principles to execution is not unique to this project. [GitHub Spec Kit's plan template](https://github.com/github/spec-kit/blob/main/templates/plan-template.md) includes a project Constitution check. [OpenSpec](https://github.com/Fission-AI/OpenSpec) emphasizes iterative artifacts. [Superpowers](https://github.com/obra/superpowers) connects design clarification, plans and testing practices. The subject here is our arrangement of responsibilities, not a claim that other tools merely generate documents.

### Schema, template and change instance are different things

`schema.yaml` describes artifact types, dependencies, generated locations and operational instructions. `templates/` supplies their drafting skeletons. `changes/<change>/` holds the actual decisions and observations for one change. Editing a template changes future authoring defaults; it neither rewrites existing changes nor proves that an executor followed the new rule.

The inspected `superpowers-bridge` template directory contains ten Markdown forms:

```text
openspec/
  schemas/superpowers-bridge/
    schema.yaml
    templates/
      brainstorm.md
      proposal.md
      design.md
      spec.md
      evidence.md
      tasks.md
      plan.md
      apply.md
      verify.md
      retrospective.md
  specs/<capability>/spec.md          # Accepted behavior contract
  changes/<change>/                  # Artifacts for one change
    specs/<capability>/spec.md        # Instance delta, not the template
```

This is not a requirement to write ten essays each time. The schema declares nine artifact types and has separate `apply` execution instructions. The `apply.md` template is optional handoff navigation, not another execution ledger. One `spec.md` template can also generate deltas for several capabilities; file count is not phase count.

| Artifact | Unique responsibility and consumer | Why preserve it separately? | How it stays lightweight |
| --- | --- | --- | --- |
| `brainstorm.md` | Problem understanding, viable options and unresolved conditions, consumed by the proposal. | Prevent an unexamined implementation guess from becoming a commitment; preserve why alternatives were reasonable. | Summarize decisions already settled. Do not copy the conversation or reenact exploration for a clear request. |
| `proposal.md` | The problem, current scope, non-goals, acceptance route and material decisions. | Later scope judgments need a way to distinguish discussion from a commitment to implement now. | Keep items that affect scope, behavior, authority or acceptance; reuse existing explicit authorization. |
| `design.md` | Implementation choices, alternatives, boundaries, cost and test seams. | Behavior requirements alone cannot explain why one integration was chosen over another reasonable option. | Focus on decisions instead of duplicating tasks, commands and results. |
| `specs/**/*.md` | Observable behavior being added, changed or removed. | Different implementations can answer to one contract that survives future maintenance. | Describe materially different scenarios; do not promote internal function names into permanent requirements. |
| `evidence.md` | Baselines, measurement definitions, execution observations and limitations for verification and handoff. | Intent and observation cannot collapse into a self-authored claim of completion; the original run must remain locatable across sessions. | Record each result once and link original artifacts instead of copying full logs. |
| `tasks.md` | Cohesive work units, dependencies and completion state. | A behavior specification does not identify who advances which work or what remains incomplete. | Several scenarios may share one workstream rather than four lifecycle checkboxes per scenario. |
| `plan.md` | Execution order, integration points, test entry points and necessary prerequisites. | Complex work needs an actionable continuation path rather than repeated rediscovery. | Add useful execution detail without maintaining another requirements, status or evidence copy. |
| `apply.md` | Current step, blocker and next-action pointer when needed. | A long handoff occasionally benefits from a signpost, but it creates no new completion fact. | Omit it when Tasks and Evidence already suffice; do not make a fourth progress report. |
| `verify.md` | A conclusion about the commitment, based on observations and outstanding conditions. | Execution output needs interpretation against the agreed scope. | Generate a view, not an execution; handwritten conclusions also reference existing facts. |
| `retrospective.md` | Useful decisions, causes of failure and plan deviations. | The next designer needs reasons, not a replay of terminal output. | No distinctive lesson is a valid outcome; archiving must not force a new story. |

### “As needed” must not conceal actual dependencies

An important distinction needs precision. General working rules allow lightweight handling of small tasks, and the Plan template encourages necessary detail only. But **when this particular schema is selected, apply explicitly requires `plan` and `evidence`, while Evidence depends on Design and Specs**. It would be misleading to claim to use that workflow and then skip actual prerequisites because an article called the files optional.

There are two legitimate simplifications. Use an existing lightweight route for a small change. For the full route, retain its required artifact identities while compressing nonessential content into brief statements and references. If a dependency itself is no longer justified, change the schema and relevant checks through workflow maintenance—not an executor's ad hoc bypass.

Artifact dependencies are not execution facts either. In this schema, Verify follows Plan in the dependency graph, while its instructions require implementation to have produced reviewable changes before a conclusion is written. A node becoming generatable does not establish that a preceding test actually ran. The dependency graph prepares inputs, execution rules guide the work, and observations plus applicable gates establish what happened. Their authority is not interchangeable.

This also explains why reading the template alone is insufficient. A template field, schema instruction, shared policy and validator may be at different points in their evolution. Resolve conflicts by checking the current contract and actual consumers. An old sentence does not create new authority, and extra copies of a table do not resolve the inconsistency.

<span id="proposal-preserves-the-commitment" aria-hidden="true"></span>

### A field is valuable because a later decision uses it

`First deliverable` in Proposal should change task order. `Test seam` in Design should determine where behavior is exercised. Allowed and denied scenarios should shape assertions. An uncollected baseline in Evidence should limit the final claim. A field filled during drafting but never read again has little leverage over quality.

Likewise, `Approval` records an existing instruction; typing approved does not create authorization. `observed-run` declares the origin of an observation; successful parsing is not independent authentication. A template puts useful questions at useful moments. Quality still depends on the answers, execution and review.

<span id="_2-turn-one-sentence-into-an-acceptable-commitment" aria-hidden="true"></span>
<span id="2-turn-one-sentence-into-an-acceptable-commitment" aria-hidden="true"></span>

<span id="_3-design-explains-choices-spec-defines-observable-behavior" aria-hidden="true"></span>
<span id="3-design-explains-choices-spec-defines-observable-behavior" aria-hidden="true"></span>

## 4. From Request to Behavioral Agreement: The File-Ingestion Case

<span id="_5-the-main-case-turning-file-reading-into-a-bounded-capability" aria-hidden="true"></span>

This case uses the file-ingestion design and observation records from late September to early October 2026. Condensed scenarios are teaching adaptations; historical, scoped checks are not certification of the current deployment.

Business tools could return fund prospectuses, product documents or file references, but the research agent lacked a uniform reading path. “Add a parser” described an intermediate step, not the capability's entry point, authority, output or lifecycle.

The design first established the existing state: research assets, a run-scoped workspace, and generic search, reading and provenance already existed. The gap was upstream. The proposal therefore connected trusted MCP file results to those facilities rather than promising another document center.

<figure style="max-width:640px;margin:2rem auto">
<a :href="withBase('/visuals/en/agent-spec-driven-development-panorama/02-request-to-commitment.svg')" target="_blank" rel="noopener" aria-label="Open the full diagram in a new tab"><img :src="withBase('/visuals/en/agent-spec-driven-development-panorama/02-request-to-commitment.svg')" alt="Find the gap. Bound the work." width="720" height="819" loading="lazy" style="width:100%;height:auto" /></a>
<figcaption>Figure 2. The case fills a missing connection from trusted tool output to an existing workspace, rather than starting a document platform. <a :href="withBase('/visuals/en/agent-spec-driven-development-panorama/02-request-to-commitment.svg')" target="_blank" rel="noopener">Open full diagram</a></figcaption>
</figure>

### First change: from “what can it parse?” to “who can make it parse?”

A URL written by the model must not directly authorize the host to download a file. Even a genuine file descriptor returned by a business tool must be bound to its tool invocation, the current scope and configured acquisition mechanisms. Credentials stay inside the host instead of entering model context or ordinary logs for convenience.

This applies the separation of semantic judgment from execution authority. What enters Proposal and Design is not just the principle's name: only host-validated canonical tool results can yield the trusted descriptor; arbitrary model text, paths and self-declared identities cannot widen acquisition scope.

That choice changes the tests. “Given a URL, return its text” does not establish the contract. The real host seam must distinguish superficially similar inputs: an admitted tool result can be processed, while model-authored text or a call lacking the required grant cannot trigger acquisition.

<span id="compare-reasonable-options-before-choosing-the-integration-point" aria-hidden="true"></span>

### Second change: integrate with existing responsibilities instead of every consumer

The design considered parsing in business Skills, exposing format-specific tools, and integrating at the host's result-processing seam. A one-off unauthenticated script may favor the first option. A system with an existing generic workspace and multiple sources sharing acquisition and authorization needs has a stronger reason to centralize at the host boundary.

Acquisition adapters handle admitted sources; parsers handle format differences; assets and the workspace retain provenance, scope and reading state. The model continues using generic search and read operations. Canonical MCP tool identity and business fields remain unchanged; ingestion contributes separate evidence references instead of wrapping the business tool again.

This addresses both complexity spillover and normal-path overhead. Tasks without files need not teach the model a new family of format tools. Adding a format need not change every business Skill. The host still pays for adapters, capacity limits and integration tests. Complexity has not disappeared; it has been placed with a responsibility that has a reason to carry it.

<span id="a-specification-is-not-an-implementation-checklist" aria-hidden="true"></span>

### Third change: partial extraction is a factual state, not a cosmetic downgrade

The first delivery covered text-layer PDF, DOCX, XLSX and static HTML—not OCR, chart understanding, legacy Office formats or automatic long-term indexing. Extraction retained native locations such as PDF pages, DOCX paragraphs, XLSX sheets and cells, and HTML sections and anchors.

The important part is not just the extracted text, but an accurate account of what was not extracted. A resource limit stopping a parser does not mean the remaining region contains nothing. An exact read range in the workspace is also different from the document's overall extraction coverage. Material already read cannot support a claim that depends on an unparsed or unread region.

The following teaching scenarios condense the real constraints; they do not introduce a new interface:

```text
Requirement: acquisition comes from actual admission, not a textual guess.
Given: an admitted tool call and a host descriptor bound to that call.
When: its acquisition adapter completes bounded acquisition.
Then: evidence enters the current workspace, retaining canonical tool identity
      and business facts.

Contrast: the same URL exists only in model text, or the call lacks admission.
Then: acquisition does not occur; other independently permitted results survive.

Requirement: partial material must not impersonate a complete document.
Given: only part of a file was extracted.
When: an available segment is read.
Then: return the actual segment and coverage; do not treat unparsed areas as empty.
```

The specification describes both useful capability and protection. “Deny unauthorized acquisition” alone can miss whether legitimate files reach the researcher. “Files can be read” alone can quietly turn the entry point into an arbitrary downloader.

These behaviors first exist as proposed specification deltas, not immediately as accepted facts. `ADDED` introduces a requirement, so its absence from the current contract is expected. `MODIFIED` and `REMOVED` must identify an existing requirement in the same capability; `RENAMED` records a naming change. Preserve unrelated behavior rather than overwrite the old contract simply to make the new design internally consistent.

For file ingestion, admitting trusted tool-returned files into the run workspace is a new capability. A change to existing material-reading semantics should identify the old requirement and its modification, not duplicate another set of similarly named reading rules. Deltas expose the commitments and protections being changed. Valid structure still does not establish working implementation; later acceptance provides the basis for reconciliation.

<figure style="max-width:640px;margin:2rem auto">
<a :href="withBase('/visuals/en/agent-spec-driven-development-panorama/03-spec-delta.svg')" target="_blank" rel="noopener" aria-label="Open the full diagram in a new tab"><img :src="withBase('/visuals/en/agent-spec-driven-development-panorama/03-spec-delta.svg')" alt="A proposal is not current truth" width="720" height="852" loading="lazy" style="width:100%;height:auto" /></a>
<figcaption>Figure 3. Keep proposed deltas distinct from accepted contracts. An unmet acceptance condition does not become an accepted fact. <a :href="withBase('/visuals/en/agent-spec-driven-development-panorama/03-spec-delta.svg')" target="_blank" rel="noopener">Open full diagram</a></figcaption>
</figure>

### Fourth change: equal content does not mean equal rights

The historical observations contain a useful controlled counterexample: the same source and content in two scopes produced the same asset identifier, creating a storage-identity collision. A later change incorporated scope into the relevant identity to prevent the records from overwriting one another.

This was more than adding a parameter. Content deduplication and authorization isolation are different problems. Identical bytes do not remove a new call's admission and scope requirements. A cache hit establishes neither current permission nor freshness.

The design discussed a content-addressed parse cache, but the implementation at that stage used an ephemeral run-scoped repository and did not implement cross-run parsing cache. Long-term corpus admission, retention and indexing remained a separate lifecycle. Successful parsing did not authorize indefinite future use.

### Put the first usable result into scope

<span id="_4-design-the-whole-direction-commit-to-a-deliverable-slice" aria-hidden="true"></span>
<span id="4-design-the-whole-direction-commit-to-a-deliverable-slice" aria-hidden="true"></span>
<span id="_5-turn-specifications-into-handoff-ready-work-not-more-checkboxes" aria-hidden="true"></span>
<span id="5-turn-specifications-into-handoff-ready-work-not-more-checkboxes" aria-hidden="true"></span>
<span id="_7-improve-the-requirement-not-just-the-speed-of-executing-a-large-plan" aria-hidden="true"></span>
<span id="a-complete-design-is-not-a-commitment-to-implement-it-all-now" aria-hidden="true"></span>
<span id="narrowing-scope-is-not-removing-necessary-protection" aria-hidden="true"></span>
<span id="what-supports-a-more-deliverable-requirement" aria-hidden="true"></span>

Discussing a complete capability does not commit the current phase to every enhancement. File ingestion first delivers material readable within the current task; OCR, cross-run caching and long-term indexing keep their separate future ownership. Source admission, scope isolation and truthful coverage are conditions of the current result, so they cannot be deferred with those enhancements.

In the weekly-report work, history, comparisons and subscriptions once obscured the first file deliverable. The commitment was narrowed to an actually saved, downloadable HTML file, with scope, task dependencies and acceptance updated together—not merely a note saying “MVP first.” The [staged-delivery retrospective](/en/articles/agent-weekly-review-staged-delivery) covers the full experience. The reusable method is to organize necessary work around the first useful result, move enhancements out of its completion conditions, and retain essential protection and historical failures.

<figure style="max-width:640px;margin:2rem auto">
<a :href="withBase('/visuals/en/agent-spec-driven-development-panorama/04-delivery-scope.svg')" target="_blank" rel="noopener" aria-label="Open the full diagram in a new tab"><img :src="withBase('/visuals/en/agent-spec-driven-development-panorama/04-delivery-scope.svg')" alt="Design broadly. Deliver a slice." width="720" height="840" loading="lazy" style="width:100%;height:auto" /></a>
<figcaption>Figure 4. A complete slice includes required safeguards. Enhancements stay outside this commitment; delivery, not folder size, determines phases. <a :href="withBase('/visuals/en/agent-spec-driven-development-panorama/04-delivery-scope.svg')" target="_blank" rel="noopener">Open full diagram</a></figcaption>
</figure>

### Where does the principle-to-behavior connection actually land?

| Design judgment | Constraint recorded in the change | Observable implementation or verification result |
| --- | --- | --- |
| The model cannot grant itself execution authority. | Acquisition consumes trusted tool-result bindings and original run admission. | Forged prose triggers no acquisition; admitted calls enter the real integration path. |
| Reuse existing factual ownership. | Retain research assets and the evidence workspace instead of another citation system. | Original tool identity and business fields survive; the same run can search and read new material. |
| Keep local failures local. | Admit or fail each attachment independently without erasing legitimate results. | One bad attachment leaves other successful attachments and safe business facts available. |
| A projection cannot upgrade a fact. | Preserve extraction coverage and exact read ranges. | Unparsed content is not reported as absent; a bounded read is not marked as whole-document consumption. |
| Do not silently expand a capability's lifecycle. | Default to run-scoped use; handle long-term promotion separately. | Original isolation and revocation rules apply, with no implicit corpus write. |

This table explains the case in retrospect; it is not a proposal for another mandatory artifact. The actual workflow reuses decisions, scenarios, tasks and observations. What matters is being able to follow a principle to an effect—not ensuring every table cell contains text.

## 5. Evolve Tests During Specification, Not After Implementation as Supporting Evidence

<span id="_8-evolve-tests-during-specification-not-after-implementation-as-supporting-evidence" aria-hidden="true"></span>

Putting principles into Proposal and Spec is insufficient. Task decomposition, test assumptions and execution can still optimize for convenient local implementation and leave the principles on paper.

File ingestion was organized around cohesive workstreams: trusted descriptors and acquisition, format parsing and coverage, and workspace integration and lifecycle. Each had inputs, protections and observable outcomes, connected through shared seams into one path. It was not four RED/GREEN/REFACTOR/VERIFY checkboxes for every scenario.

<figure style="max-width:640px;margin:2rem auto">
<a :href="withBase('/visuals/en/agent-spec-driven-development-panorama/05-work-and-handoff.svg')" target="_blank" rel="noopener" aria-label="Open the full diagram in a new tab"><img :src="withBase('/visuals/en/agent-spec-driven-development-panorama/05-work-and-handoff.svg')" alt="Tasks and handoffs" width="720" height="835" loading="lazy" style="width:100%;height:auto" /></a>
<figcaption>Figure 5. A development-dependency sketch, not historical scheduling or runtime data flow. Stabilize shared contracts before independent parallel work. <a :href="withBase('/visuals/en/agent-spec-driven-development-panorama/05-work-and-handoff.svg')" target="_blank" rel="noopener">Open full diagram</a></figcaption>
</figure>

### Tasks own outcomes; Plans explain continuation

A task should define when a coherent result exists. Trusted file ingestion cannot be reduced to “add an ingestor class.” A successor should know that it consumes host-validated results, admits attachments to parsing, records failed attachments locally, preserves business fields and credentials boundaries, and exercises admitted and forged inputs through the same entry point.

A Plan adds what complex execution actually needs: the production seam, which output contract stabilizes first, usable test entry points, environmental dependencies, and the point where the next executor continues. Results still belong in Evidence and completion state in Tasks.

Multi-agent parallelism must follow those dependencies. Before interfaces and test assumptions stabilize, more executors can simply produce incompatible assumptions faster. Parallel work has clearer value when shared seams are explicit, edit scopes are independent and someone owns final integration. Figure 5 depicts development dependencies; it is not evidence that the historical implementation was actually scheduled concurrently in that arrangement.

### Old tests may encode old philosophy

A common blind spot appears when a new design changes responsibility but an existing test still treats the old boundary as correct. Suppose optional feedback must no longer veto completion, yet an old assertion requires whole-run failure. Restoring the old behavior solely to turn the test green lets historical tests make the current product decision.

That does not authorize deleting any red test. During substantive specification work, classify affected tests: keep valid contracts, move implementation-coupled assertions toward stable behavior, consolidate duplicate coverage, and retire tests serving withdrawn mechanisms only after checking callers and persisted readers.

The rationale belongs in existing Design or Plan: affected paths, reasons and retained protection, not another per-assertion ledger. Unique counterexamples protecting authorization, idempotency, transactions and recovery need appropriate coverage. “The new architecture is cleaner” is not a reason to remove them.

This makes testing part of design. Where the seam is clear, evolve tests, fixtures and relevant execution entries during Spec authoring. Where a prerequisite remains unresolved, record the gap and earliest runnable point. Do not generate empty tests, `todo` or `skip` placeholders and later let the model derive expectations from its finished implementation.

### RED matters because it discriminates, not because it performs a ritual

A useful RED reaches the intended behavior and fails because that behavior is missing or wrong. An unavailable database, an unimportable module or a typo is a real problem worth recording, but not proof that the target behavior was exercised.

The file-ingestion ledger is not a flawless process story. It includes early observed asset-layer failures, module-import failures, and an integration baseline explicitly reconstructed afterward. Those cannot all be repackaged as proof of strict test-before-code execution. **Keeping the deviations visible exposes where the workflow still needs work; beautifying them into the required template shape destroys the basis for quality judgment.**

Default TDD should still observe meaningful failure before production implementation. An explicitly authorized implement-first, verify-later route should retain its different identity and actual verification rather than invent past RED. Documentation and inspection tasks use a real CHECK; they need not manufacture a product failure.

<span id="_6-bring-execution-facts-into-the-workflow-tdd-wiring-and-review" aria-hidden="true"></span>
<span id="6-bring-execution-facts-into-the-workflow-tdd-wiring-and-review" aria-hidden="true"></span>

## 6. Check That Principles Reached the System, Not Merely the Documents

<span id="_9-check-that-principles-reached-the-system-not-merely-the-documents" aria-hidden="true"></span>

“The proposal mentions the five don'ts, Design names an owner, and tests are green” is not sufficient. Follow the actual user path and observe whether the protected effect reaches its final consumer.

<figure style="max-width:640px;margin:2rem auto">
<a :href="withBase('/visuals/en/agent-spec-driven-development-panorama/06-execution-and-review.svg')" target="_blank" rel="noopener" aria-label="Open the full diagram in a new tab"><img :src="withBase('/visuals/en/agent-spec-driven-development-panorama/06-execution-and-review.svg')" alt="Test, integrate, review" width="720" height="849" loading="lazy" style="width:100%;height:auto" /></a>
<figcaption>Figure 6. Behavioral tests, production wiring and independent review answer different questions. Environment errors are not behavioral failures. <a :href="withBase('/visuals/en/agent-spec-driven-development-panorama/06-execution-and-review.svg')" target="_blank" rel="noopener">Open full diagram</a></figcaption>
</figure>

### First check that the meaning of completion has not shrunk

After the early asset-layer checks passed, the file-ingestion ledger explicitly retained an incomplete boundary: trusted descriptor admission, acquisition adapters, credential projection and workspace exposure remained unverified. The corresponding workstream could not be marked complete.

That record prevented a common substitution. The commitment was “the research task can read a file returned by a business tool,” while the observation only established “bytes can be registered as an asset.” Later checks carried local format fixtures through real host integration, read from the same run's workspace, and checked locations, partial coverage, revocation and cross-scope rejection.

Acceptance should therefore not stop at a module's output. Check whether the downstream consumer actually receives it, whether identity and limitations survive, and whether the next step needed for the user result occurs. A successful internal call, saved material, model consumption and user delivery are adjacent but distinct facts.

### Prove both necessary denial and the absence of excessive denial

An unauthorized protected effect must be rejected; an independent legitimate effect in the same batch must survive. Missing either side can allow tests to support the wrong system.

For file ingestion, the pair is “forged descriptors cannot acquire files, while admitted attachments remain readable.” For termination, it is “actual cancellation prevents new calls, while a recoverable local failure does not erase the whole run.” For HTML delivery, it is “active dangerous content cannot be committed as a static file, while ordinary permitted presentation is not vetoed by preference.”

These are not three additional testing platforms. They are discriminating counterexamples and controls, allowing tests to distinguish effective protection from rejecting everything. A higher blocking rate is not automatically higher quality.

<span id="independent-review-starts-from-the-commitment" aria-hidden="true"></span>

### Independent review must not repeat the implementer's story

A reviewer needs original requirements, relevant decisions, actual diffs, tests and observations—not only the implementer's summary. Switching models or opening a fresh session does not automatically create independence. What matters is that expected behavior is not derived entirely from the implementation under review.

One termination entry point is a useful clue, but did callers precompute `failed` before invoking it? Reusing one asset structure is useful, but do equal-content records collide across scopes? A download endpoint exists, but does the answer's link resolve to the actual committed final bytes rather than a temporary preview?

No mandatory philosophy-review agent is needed. Existing code review can examine both contract conformance and design costs. Give reviewers the right questions, original material and room to revise; adding roles is not the objective.

### Match evidence to the quality claim

Local contracts, real integration and user outcomes require different evidence. Targeted contracts and controlled integration can examine parsing, source isolation and local denial. Live file-service availability needs observations of that service. Whether the model understands the material or produces better research conclusions does not follow from either kind of success.

Test level and live-model use are different dimensions. An end-to-end test through complete production assembly can use a fake gateway. The label e2e does not confer evidence about real model quality.

Spec should state the claim the change intends to support, then choose proportionate evidence. A small authorization change may need rigorous boundary testing; a large documentation change or deterministic refactor may not need paid models. Risk and evidence route should not be collapsed into one coarse label.

<span id="_7-new-information-should-reopen-the-decision-it-contradicts" aria-hidden="true"></span>
<span id="7-new-information-should-reopen-the-decision-it-contradicts" aria-hidden="true"></span>

## 7. When Facts Change, Revisit the Decision They Defeat

<span id="_10-when-facts-change-revisit-the-decision-they-defeat" aria-hidden="true"></span>

Spec-driven development does not mean freezing requirements and refusing change. It gives decisions explicit homes so new facts can be addressed at the right location.

<figure style="max-width:640px;margin:2rem auto">
<a :href="withBase('/visuals/en/agent-spec-driven-development-panorama/07-feedback-routing.svg')" target="_blank" rel="noopener" aria-label="Open the full diagram in a new tab"><img :src="withBase('/visuals/en/agent-spec-driven-development-panorama/07-feedback-routing.svg')" alt="Which decision did the fact change?" width="720" height="844" loading="lazy" style="width:100%;height:auto" /></a>
<figcaption>Figure 7. Return to the earliest invalid decision. Missing prerequisites block their own lane; withdrawal is a valid outcome. <a :href="withBase('/visuals/en/agent-spec-driven-development-panorama/07-feedback-routing.svg')" target="_blank" rel="noopener">Open full diagram</a></figcaption>
</figure>

Adding scanned documents to the first phase changes scope and acceptance. A parser reporting truncated output as complete first indicates implementation violating the current contract. Missing provider credentials leave one verification route unready. Ordinary formatting repeatedly rejected by static-file checks may reveal an unjustified design premise.

| New fact | First place to revise | What must survive |
| --- | --- | --- |
| The user's goal or current deliverable changes. | Proposal, affected Specs, Tasks and acceptance scope. | Why the earlier decision was made, ownership of deferred work and historical failures. |
| A counterexample defeats a design assumption. | Design and the associated behavior constraints. | What the previous option solved and why a different one is now chosen. |
| Implementation violates a valid requirement. | Code, tests and corresponding observations. | The correct contract; do not weaken necessary protection for a green result. |
| A test encodes a retired mechanism. | Existing tests, fixtures and active execution references. | Valid unique protection and evidence of replacement coverage or exit conditions. |
| Environment, authorization or dependencies are unavailable. | The affected verification route and retry conditions. | The distinction between not executed, blocked and failed. |

### A design rationale should be open to disproof

A useful reflection explains not only why an option was chosen, but which facts would make it worth reconsidering. If a new check repeatedly rejects normal work without protecting a distinct effect, consider removing or narrowing it rather than continually expanding an allowlist. If an optional abstraction fails to reduce consumer complexity and instead forces every ordinary call to understand more state, being implemented is not enough reason to retain it.

Revision must still respect authorization. Technical choices within approved scope can be handled autonomously. Material changes to user-visible behavior, authority, scope or acceptance commitments require revisiting the affected decision. One `approved` label cannot cover all future changes, but every function edit need not trigger the same approval request again.

### Exiting is also a legitimate outcome

If a requirement has insufficient value, an existing capability already solves it, or maintenance cost exceeds its usefulness, the workflow may conclude with no change, a local repair, characterization only, or withdrawal. That is not process failure. Executing an unnecessary plan to completion puts procedural completeness ahead of system quality.

On exit, identify which proposals never became accepted behavior, which temporary integrations and tests should be removed, and which observations remain useful history. Stopping does not mean erasing failures. Nor does it establish retirement while actual consumers still exist.

<span id="_8-what-do-closure-archiving-and-release-actually-end" aria-hidden="true"></span>
<span id="8-what-do-closure-archiving-and-release-actually-end" aria-hidden="true"></span>

## 8. Closure and Archiving: Carry Useful Decisions Forward Without Rewriting History

<span id="_11-closure-and-archiving-carry-useful-decisions-forward-without-rewriting-history" aria-hidden="true"></span>

After implementation, Verify judges how much of the commitment the evidence supports. Formal close executes required acceptance for the declared route. Accepted deltas are reconciled into current specs. The archive retains the change, and useful history helps the next designer understand its reasons. Release remains a separate process.

<figure style="max-width:640px;margin:2rem auto">
<a :href="withBase('/visuals/en/agent-spec-driven-development-panorama/08-close-and-handoff.svg')" target="_blank" rel="noopener" aria-label="Open the full diagram in a new tab"><img :src="withBase('/visuals/en/agent-spec-driven-development-panorama/08-close-and-handoff.svg')" alt="Closure is not release" width="720" height="857" loading="lazy" style="width:100%;height:auto" /></a>
<figcaption>Figure 8. Acceptance leads to specification synchronization, archiving and useful history. Gaps remain explicit; release stays separate. <a :href="withBase('/visuals/en/agent-spec-driven-development-panorama/08-close-and-handoff.svg')" target="_blank" rel="noopener">Open full diagram</a></figcaption>
</figure>

### Why not combine these actions into one “done”?

Checked tasks describe work state, not proof that formal acceptance ran. Generating Verify shows that a view can be produced from recorded inputs; it does not create a new execution. A successful local close establishes the declared contract, not release approval or real-model performance.

Accepting a specification is an engineering decision, not a measurement of every deployed revision. If the parser or workspace behavior later changes, the old receipt remains historical evidence of its original revision, not assurance for the new behavior. File ingestion had repairs and focused observations after its initial close. Their scopes must remain separate rather than becoming one indefinitely valid certificate.

The project's `spec:close` is its own acceptance mechanism—not a universal release authority supplied by OpenSpec or the public Evidence Kit. Structural checks are bounded too: they can inspect required task and observation structures without proving semantic agreement among Proposal, Design, Delta and implementation. Actual execution and review address that gap; another “complete” label does not.

### Accepted specs preserve behavior; History preserves reasons

Why not put every reason into the accepted Spec? The next implementer first needs the current contract, not a tour through every discarded design. Why not retain only the code? It describes today's behavior but may not explain why a still-plausible alternative was rejected.

For file ingestion, the accepted contract retains trusted origin, coverage, scope isolation and local failure behavior. History can explain why parsing did not belong inside each Skill or imply long-term indexing. For termination, the accepted contract identifies continuation, finalization and termination authority; History explains why centralizing writes was insufficient.

Archiving therefore performs two different handoffs: accepted behavior to later implementation, and meaningful rationale to later judgment. Historical material retains its time and does not automatically become a current instruction. Start future work with the current contract and follow history links when the tradeoff needs explanation.

### No material lesson means no manufactured history essay

The handoff distinguishes `none`, `candidate` and `history`. Material without long-term value need not be promoted. A useful fragment without a settled lesson can remain a candidate. Durable value justifies a canonical history entry. Daily summaries and topic indexes are reading views, not competing factual stores.

A successful close, with no relevant behavior or necessary-input changes, should not trigger another acceptance run solely for archival bookkeeping. Conversely, a concrete failure or material unverified behavior change cannot be hidden behind historical reuse. Stopping conditions and provenance should be explicit rather than every phase transition automatically adding another run.

## 9. Template Maintenance: Keep the Workflow Lightweight

<span id="_12-maintain-the-templates-with-the-same-five-don-ts" aria-hidden="true"></span>

A workflow can solve a real early problem and later create another burden. Evidence went through this evolution. Initially, before-state measurements and execution observations were easy to lose, motivating a continuous ledger. Later, commands and results were copied into Tasks, Plan and Verify, and archival bookkeeping could demand low-value History.

The early-October 2026 closeout simplification applied the same principles to the process itself. With an existing factual source, why maintain another? Does archiving actually need a new story? Is a recording tool acquiring acceptance authority it does not own?

### A concrete subtraction: make Verify a view

The change reused existing parsing to generate Verify from Tasks and Evidence. It preserved original dates, revisions and results, detected stale views when inputs changed, protected handwritten files, and refused out-of-scope paths and symlink escapes. The generator neither executed tests nor declared a formal close.

More automation does not automatically make evidence more trustworthy. The immediate value was less duplicated maintenance of the same fact. Authors still needed to record genuine observations and judge whether they supported the present claim. View freshness and evidence applicability remain different; the [evidence and acceptance article](/en/articles/026-agent-spec-evidence-workflow) examines this distinction in depth.

History also changed from an implied archival obligation to a decision about material value. Existing explicit acceptance commitments did not disappear silently when templates changed, and historical changes were not automatically rewritten into the new format. The simplification has local-contract observations but no comparable measurement of development hours. Its value need not be inflated into an efficiency percentage.

### Should a lesson change code, domain rules or the shared template?

Adding a global rule after every failure makes every future task pay for a local incident. First identify the level at which the failure occurred:

| Finding | Preferred home | Expansion to avoid |
| --- | --- | --- |
| A format-specific parsing constraint. | Parser implementation, tests and its domain contract. | Requiring every proposal to include checks for that format. |
| A consumer misreads another owner's state. | Original producer/consumer integration and behavioral regression. | A new global fact registry and secondary adjudication system. |
| Multiple kinds of design repeatedly miss decision authority or failure scope. | Better questions and examples in the existing Design Reflection. | A mandatory approval state for every principle. |
| Artifacts duplicate the same fact. | Consolidated field ownership and corresponding generation/check behavior. | Another table checking that four copies agree. |
| A proposed new principle appears distinctive. | First test whether existing principles already explain it. | Promoting a repair, threshold or implementation trick straight into core philosophy. |

This is a maintenance reasoning aid, not another workflow file to introduce. Principles should be few and durable; methods can evolve with recurring problems; format and implementation details belong to their natural owners.

### Template changes need their own change process

A real template update is not just editing a prompt paragraph. Locate its consumers: root routing, shared policy, schema generation and prerequisites, default template fields, structures actually read by validators and closeout tools, and examples that depend on them.

Changing a question's wording while preserving its fields and behavior may need only focused content checks. Changing required fields, a generated view or closure semantics needs relevant behavioral regression. Safe Verify generation, for instance, should demonstrate that handwritten files survive, changed inputs are detected as stale, and invalid paths are rejected. “Be careful” in the instructions cannot replace those observable properties.

Likewise, if an older template still requests comprehensive mappings while the shared workflow favors links where useful, inspect execution instructions and actual checks before fixing the affected references. Updating a rule does not magically remove old language. Discovering an old sentence is not a reason to restore a heavier process.

Test the revision against a small task as well as a complex one. Does it expose a consequential omission, or require pages of meaningless “not applicable”? Useful maintenance scenarios include a small inspection, a cross-responsibility change and a task blocked by external prerequisites. This is a recommended evaluation approach, not a claim that an automated system already certifies all authoring behavior.

### Keep a way to narrow or remove rules

A useful template creates meaningful differences: a question leads to rejecting unnecessary machinery, a scenario exposes excessive denial, or an execution condition prevents a local pass from being reported as the whole deliverable. A field that repeatedly produces boilerplate nobody uses may need consolidation or removal.

Subtraction must preserve genuine invariants. Removing duplicate instructions is not removing authorization. Eliminating an unhelpful report is not hiding failure. Reducing formatting gates is not accepting work that lacks necessary observations. The aim is to make consequential questions more visible, not to make every check easier to pass.

<span id="_9-bring-the-workflow-to-your-own-project" aria-hidden="true"></span>
<span id="9-bring-the-workflow-to-your-own-project" aria-hidden="true"></span>

## 10. Adopt the Judgment Chain Before Choosing the Tooling Scale

<span id="_13-adopt-the-judgment-chain-before-choosing-the-tooling-scale" aria-hidden="true"></span>

Teams need not reproduce every directory or apply every artifact to every edit. First examine whether current PRs, CI, specifications and reviews preserve commitments, reasons, behavior and observations. Retain what already works. Add carriers when cross-session work, responsibility boundaries, authorization or recovery complexity warrants them.

A simple edit may need only a clear request and valid tests. A behavior change with reasonable alternatives needs rationale and counterexamples. A cross-responsibility capability needs real integration, boundaries and handoff. Model-quality and user-outcome claims need proportionate evaluation. Neither file count nor mechanism count measures maturity.

One question can test your workflow: **after removing “follows our principles,” can a reader still see what the principle changed in the scope, alternatives, scenarios, tests and acceptance?** If not, it has not entered engineering. If so—and without five repeated descriptions—it is becoming a sustained way of working.

### Which part can readers reproduce publicly?

The project artifacts and business cases discussed here do not mean that the public toolkit contains every business implementation or internal closeout mechanism. [Spec Flow in Agent Engineering Suite](https://github.com/hpoenixf/agent-engineering-suite/tree/3b515de2f30e25b1e0757243f3ce4d1be19b00b0/skills/aes-spec-flow) provides public methods and tooling. Its [Evidence Kit](https://github.com/hpoenixf/agent-engineering-suite/tree/3b515de2f30e25b1e0757243f3ce4d1be19b00b0/skills/aes-spec-flow/toolkit) checks task/observation structure, generates Verify and reads recorded completion; it does not execute product tests or assume formal closure or release authority.

With Node 26.11.1–26.x, run the pinned offline format example without a model key or database:

```bash
git clone https://github.com/hpoenixf/agent-engineering-suite.git
cd agent-engineering-suite
git checkout 3b515de2f30e25b1e0757243f3ce4d1be19b00b0
cd skills/aes-spec-flow/toolkit
node bin/spec-evidence.mjs lint --root examples --changes-dir changes --change example --stage apply
node bin/spec-evidence.mjs verify --root examples --changes-dir changes --change example
node bin/spec-evidence.mjs verify --root examples --changes-dir changes --change example --check
```

The output is the example directory's `verify.md`, not a product acceptance result. The bundled records are fictional format examples; reading them does not execute their tests. Installation is documented at the [pinned revision](https://github.com/hpoenixf/agent-engineering-suite/blob/3b515de2f30e25b1e0757243f3ce4d1be19b00b0/docs/installation.md), with ongoing maintenance in the [same module on main](https://github.com/hpoenixf/agent-engineering-suite/tree/main/skills/aes-spec-flow).

Tools supply the skeleton. A product still needs its own principles, domain contracts, proportionate verification and accountable people. A checker capable of inspecting a field has not thereby solved the judgment behind that field.

---

Returning to file ingestion, the value of Spec is not the number of files produced. Scope, responsibilities, behavior and acceptance constrain the same change. Decisions made during design remain visible through implementation, handoff and maintenance, while new observations have a clear place to challenge an earlier approach.

**Spec should not merely tell the coding agent how to build. It should help a team keep explaining why a change is worthwhile, which principles must survive, which assumptions may be disproved, what supports acceptance, and how the next effort can avoid the same mistake.** It cannot guarantee every judgment is right. It can give decisions a durable home, deviations an observable signal and revisions a factual basis, turning design philosophy from a slogan into a maintainable engineering practice.

For the evidence mechanism, continue with [Evidence and Trustworthy Acceptance](/en/articles/026-agent-spec-evidence-workflow). For the broader responsibility for AI-written code, see the [AI Coding Quality Panorama](/en/articles/ai-coding-quality-panorama). They complement this lifecycle view rather than replace its design reasoning.

The [Chinese article](https://hpoenixf.com/eff-agent-article/articles/agent-spec-driven-development-panorama) and [English article](https://hpoenixf.com/eff-agent-article/en/articles/agent-spec-driven-development-panorama) keep their original addresses. Source and discussion are maintained in the [GitHub collection](https://github.com/hpoenixf/eff-agent-article); stars welcome.
