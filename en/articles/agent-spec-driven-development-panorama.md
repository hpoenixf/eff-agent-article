---
title: 'Spec-Driven Agent Development: From Requirements to Trustworthy Delivery'
description: Spec is more than a construction plan. Real file-ingestion, termination, weekly-report and workflow-simplification cases show how principles shape decisions, templates,
  behavior, tests and archives—and constrain the process itself.
readingBrief:
  takeaways:
  - A principle enters Spec when it changes scope, alternatives, scenarios and acceptance—not when a proposal merely claims compliance.
  - Routing rules, domain facts, templates and change instances have different roles. Read by task, and distinguish lightweight practice from the selected schema’s actual dependencies.
  - New denial paths need both protected counterexamples and valid allowed cases. One shared function is not necessarily one decision authority.
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

A research agent gains file-reading support. The parser works and the model receives text—but has the new capability also expanded download permissions, introduced four dedicated tools, or permanently indexed temporary documents? Exception handling is consolidated behind one function, making the code neater—but can every caller still decide to end the entire research run? A weekly-report feature acquires increasingly complete plans for history, subscriptions and comparison, while the user still cannot download a first report.

These problems share a pattern: **an implementation may satisfy its local task without moving the system in the direction we intended.** A construction plan that lists files to change and coding steps is not enough to address that divergence. It can make execution more predictable without improving the quality of the decisions being executed.

We ask more of a Spec workflow: turn durable principles into concrete constraints on each change, challenge requirements with counterexamples, test implementation against observations, and let useful lessons influence the next design. The goal is not to put “follows our architecture principles” at the top of a proposal. For a particular decision, we should be able to explain why it exists, which reasonable alternative it rejects, which behavior it protects, how we detect implementation drift, and when the mechanism could be removed.

“Spec” has two meanings here. In the narrow sense, it is an observable behavior contract. The broader **Spec workflow** includes problem exploration, design choices, behavioral deltas, execution, verification, archiving, and maintenance of the specifications and templates themselves. This article examines the broader workflow while preserving the narrow specification's responsibility: `spec.md` should not become a super-document containing everything.

The discussion is grounded in ETF Agent engineering records. File ingestion provides the main thread; run termination, weekly-report delivery and closeout simplification illuminate three different changes of direction. Historical observations retain their original dates and scope. Requirements, pseudocode and scenarios shortened for explanation are identified as teaching versions. The coding agent using the workflow and the research agent being developed are different actors: the latter's behavior is what we design and check.

<span id="_1-start-with-what-must-survive-the-handoff-not-which-files-to-write" aria-hidden="true"></span>
<span id="1-start-with-what-must-survive-the-handoff-not-which-files-to-write" aria-hidden="true"></span>

## 1. Carry Design Judgment Through the Change, Not Just Files Through a Sequence

A change begins with a user's sentence and eventually enters a codebase. Between those points, the work involves more than completing missing information. Is the problem worth solving? Is an existing capability sufficient? Where should the addition belong? Which failures should remain local? What counts as the user actually receiving a result? When these decisions live only in a conversation, the next implementer may inherit the conclusion without its conditions.

A Spec workflow should therefore preserve an inspectable line of reasoning, not merely a command sequence:

> User goal → relevant principles and current facts → alternatives and tradeoffs → observable behavior → implementation and verification → acceptance or revision → inputs to the next design.

Principles are not criteria applied only at the final review. They should narrow unsuitable options early. Conversely, concrete facts should be allowed to expose a principle whose wording is too broad or whose applicability is unclear. Holding to a principle does not mean holding to the first design. It means being able to explain which values and protections must survive when that design changes.

<figure style="max-width:640px;margin:2rem auto">
<a :href="withBase('/visuals/en/agent-spec-driven-development-panorama/01-change-lifecycle.svg')" target="_blank" rel="noopener" aria-label="Open the full diagram in a new tab"><img :src="withBase('/visuals/en/agent-spec-driven-development-panorama/01-change-lifecycle.svg')" alt="A change, end to end" width="720" height="836" loading="lazy" style="width:100%;height:auto" /></a>
<figcaption>Figure 1. Preserve the commitment, implementation and acceptance basis. Evidence spans every stage; feedback returns to the affected decision. <a :href="withBase('/visuals/en/agent-spec-driven-development-panorama/01-change-lifecycle.svg')" target="_blank" rel="noopener">Open full diagram</a></figcaption>
</figure>

### Quality means more than implementing the feature

At least four kinds of quality questions need to stay connected. First, is the requirement worth pursuing, and does the first deliverable address the user's problem? Second, does the architecture place facts and decision authority with the right responsibilities, without burdening every normal path for one feature? Third, does the implementation preserve valid allowed, denied, partial-failure and recovery behavior? Fourth, will the system remain understandable, resumable, replaceable and removable after the change?

Tests matter greatly to the third question, but do not automatically answer the other three. A compelling design cannot replace execution evidence either. The workflow connects these judgments: acceptance conditions lead back to the goal, tests to behavioral commitments, and design choices to principles and current facts. Each part must do more than pass its own unrelated checks.

For example, “a local failure must not acquire a global veto” is a principle. Applied to file ingestion, it becomes “an unavailable attachment must not erase independently permitted business facts from the same tool call.” Tests should then observe both the failed attachment and the retained valid content. Checking that the parser throws the correct exception is insufficient: an upstream handler might still aggregate that exception into failure of the whole run.

### Both the product and the method need feedback

Two connected feedback loops help explain this without requiring new runtime modules. One governs the product change: propose, observe the implementation, then accept or revise. The other governs the development method: identify a workflow failure, decide whether it is a one-off issue, a domain rule or a recurring blind spot, then change the relevant instruction entry point, template or tool.

The second loop is easy to miss. Adding a mandatory template field after every incident creates its own spillover, normal-path overhead and hard-to-retire baggage. **The philosophy used to constrain the system must also constrain the Spec workflow.**

## 2. Before Authoring: Bring Relevant Principles into Context, Not the Entire Document Library

Our coding agent does not start with an empty template. Root `AGENTS.md` retains invariants and routes the task. Domain context explains vocabulary and responsibility. The shared Spec workflow defines artifact and execution rules. Accepted behavior specifications, source code and existing tests provide the facts needed for the current decision.

These are not interchangeable “reference documents.” They answer different questions and should be loaded at different points.

| Material | Question it helps answer | How authoring uses it |
| --- | --- | --- |
| Root rules and task routing | Which constraints persist, and where should this task look? | Establish authority, factual and scope boundaries without copying the entire knowledge base. |
| Core principles and on-demand methods | How should this kind of design be judged? | Select relevant principles, five-don't questions or responsibility questions without manufacturing a form for each one. |
| Domain `CONTEXT` and responsibility descriptions | What do the terms mean, and who owns the relevant facts and decisions? | Avoid reinventing existing capabilities or crossing domain boundaries. |
| Accepted specs, entry-point code and existing tests | What is promised, what actually happens, and what protections already exist? | Cross-check the three; a proposal or document is not execution evidence. |
| This change's artifacts and observations | What is actually committed, and how far has execution progressed? | Continue the current task instead of reconstructing its state from an old chat summary. |
| Relevant History | Why was the earlier approach chosen, and which assumptions changed? | Explain decisions without promoting a historical approach into a current instruction. |

<span id="investigate-facts-before-asking-for-decisions" aria-hidden="true"></span>

### Start with routing, then deepen the relevant question

The default approach in the root rules is one bootstrap entry, one matching task pack and the exact target files. Read more when the task crosses domains, changes authority or ownership boundaries, or repeatedly fails focused verification. Read the shared workflow at task start; on continuation, inspect relevant changes rather than rereading the entire collection because implementation has moved to verification.

This is not merely context optimization. More importantly, **each fact retains its authoritative location**. Current behavior belongs to accepted contracts and implementation; actual results belong to original execution records; a compacted conversation is only a navigation aid. Combining everything into a convenient “project summary” can erase distinctions between historical and current, suggested and required, implemented and unverified.

File ingestion illustrates the point. Looking only at “support files returned by MCP” makes it easy to propose a download service, a file registry and format-specific tools. Reading the relevant existing material reveals research assets, provenance, a run-scoped evidence workspace, and generic search and read operations. The missing capability is the connection from a trusted tool result into those existing facilities.

The useful output of prerequisite reading is therefore not “ten documents read.” It is a fact that changes the design: **add the connection here, not another platform.**

### Nine principles, five don'ts and four questions are not three sets of gates

The core principles address durable judgments: who understands meaning, who has decision authority, how proposal and effect differ, how far failure propagates, where facts live, how much machinery is necessary, how capabilities exit, whether the user completed the task, and whether local improvement produced system-wide progress. The [principles index](/en/principles) collects them, but the relevant ideas are explained here; reading every related article is not a prerequisite.

The five don'ts and four responsibility questions help apply these principles. The former assess whether to introduce a mechanism; the latter trace facts, authority, failure and value. They do not add nine checklists, five approvals and four reports to every requirement.

A small wording correction does not require a simulated architecture review. A few lines introducing a new denial path may warrant a careful authority review along the call chain. **The depth of reading and discussion follows changed behavior and risk, not the line count or the number of empty fields in a template.**

## 3. Turn Principles into Questions That Change the Design

“Keep it simple,” “be secure” and “decouple modules” are easily correct yet ineffective statements. To influence a design, a principle must become a question that distinguishes reasonable alternatives. The answer should live with existing design decisions, not in a new principle-compliance dossier.

### Use the five don'ts to examine additions, not prohibit all complexity

Our five don'ts are not a ban on new modules. They examine the benefit and cost of a capability from five directions:

| Don't | Concrete question | Consequence for file ingestion |
| --- | --- | --- |
| Do not add a mechanism merely because it is implementable. | What is actually missing for the user? Would an existing capability plus one seam suffice? | Do not rebuild provenance, citations and reading just because a parsing platform is possible. |
| Do not let complexity spill outward. | Will credentials, parser limits and error handling spread into every Skill? | Encapsulate acquisition and bounded parsing on the host side instead of repeating infrastructure in business methods. |
| Do not spread local veto power. | Which effects can one failed attachment legitimately cancel? | An unavailable attachment must not erase other independently permitted results. |
| Do not impose meaningless overhead on the normal path. | Do tasks without files still carry more prompts, tools, states and checks? | Do not add `read_pdf`, `read_excel` and similar declarations to every model request by default. |
| Do not introduce a capability that cannot exit. | Which consumers must change if the parser is replaced or ingestion is removed? | Integrate through existing asset and workspace contracts, containing format differences at the adapter boundary. |

Normal-path overhead is more than execution time. An unused tool declaration can still occupy model context. A state can force every caller to understand a new branch even without adding a database table. Design should consider both the triggered cost and the persistent cost when the capability is unused.

The same questions can justify a shared capability. When several business sources need access isolation, parsing bounds and provenance, leaving every Skill to implement them is not simplicity—it distributes complexity. Fewer lines of code do not necessarily mean a smaller system burden. A sufficiently complete shared seam can reduce what consumers need to know.

### Apply the four questions to the present decision

**Facts: who produces, stores and interprets this value?** Real tool execution supplies source identity, parsers produce extracted text and coverage, and the model interprets the content. Passing schema validation does not grant an object trustworthy provenance. Equal content hashes do not establish the current task's permission to read.

**Authority: who may allow, deny, continue or terminate which effect?** Acquisition admission, parser resource limits, workspace reading and whole-run termination are distinct decisions. Different owners may examine different facts at different times; the same word `deny` does not make their checks duplicates. Nor does placing checks in different files grant each an independent final authority.

**Failure: what can still proceed legitimately when this part fails?** Can other attachments and business facts survive an unavailable file? Can recovery repeat an effect whose receipt is unknown? After cancellation, will “graceful finalization” initiate another model request? These questions determine exception propagation, not merely error names.

**Value: which user result does the mechanism improve?** Between supporting a format and enabling useful research lie admission, acquisition, registration, actual reading and use of the content. A design should identify the part improved, the maintenance cost introduced, and the facts that would justify reducing or removing it.

A few substantive paragraphs of `Design Reflection` may answer these questions. Where the decision table already contains the answer, link to it. Reopen the relevant discussion when a material choice changes. Repeating the same principles does not improve the decision.

### A principle does not authorize an arbitrary new hard gate

“Add another check for reliability” deserves particular scrutiny. Deterministic code is well suited to validating syntax, identity, permissions, resource boundaries and execution receipts. Being expressible as a condition does not give it authority to decide whether research is sufficient, an opinion is credible or an answer deserves to be shown.

Our decision record asks where authoritative input originates and why it is valid for this particular decision, who owns the effect, how far denial extends, and how independently legitimate results survive failure. A model-produced `safe: true` is not permission approval. A regular expression failing to recognize wording does not establish that the user withheld authorization or that the answer has no value.

When translating a principle into a specification, describe both what must not happen and **which legitimate behavior must remain possible**. Writing only denial conditions can turn quality governance into an ever-growing veto system. Conversely, local failure isolation is not an instruction to deliver under all conditions: actual private dependencies, ambiguous identity, unknown write effects and user cancellation must still be handled by their rightful owners.

## 4. Templates Are Not a Document Package: Why Each File Exists

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

## 5. The Main Case: Turning File Reading into a Bounded Capability

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

## 6. A Real Counterexample: One Termination Function Is Not One Termination Authority

File ingestion shows how principles constrain a new capability. The termination change shows how they can redirect an apparently sensible refactor.

Local exceptions could still implicitly stop the entire research run. Stop advice could veto completion. Persisted status and completion callbacks could disagree. A plausible first response was to centralize terminal writes in a common function, making the code more consistent and its exits easier to inspect.

The proposal's design reflection challenged that response. If each caller still interprets its own exception and invokes `terminate(failed)`, **the write is centralized, but the decision is not**. A local module can still promote its failure into whole-run failure; it has merely hired a shared function to persist the verdict.

The following teaching pseudocode illustrates the distinction; these are not actual project APIs:

```text
Superficial centralization:
  A module encounters an exception
  → The caller decides the whole run failed
  → A shared termination function writes failed

Consolidated responsibility:
  A module reports the operation's failure, known receipts and recovery conditions
  → Existing run control considers cancellation, resources and effect state
  → Continue, enter bounded finalization, or terminate
  → Publication preserves independently admitted body content
  → Persistence supplies the actual settled result
```

### How did the principle change Design?

The change introduced neither a termination agent nor a second resource ledger. It deepened the existing run lifecycle so one responsibility actually decided continuation, finalization and terminal state. Local modules retained their error handling and supplied objective facts; exception types no longer automatically conferred authority over the whole run.

Body disposition did not move into that responsibility. The model judged content, run control decided whether execution continued, Publication handled body content, and persistence/recovery retained actual effects and state. Putting every power into a universal manager would have missed the point as well.

Stop Hook feedback remained observable but could no longer veto an accepted finish or force another model turn. Unavailable optional research notes could not invalidate an already assembled legitimate request merely because later notes were absent. At the same time, actual source, content-identity and unknown-effect protections could not be bypassed through a broad `catch`.

### How did the principle change acceptance?

A test asserting that termination was called once would not establish the design. Tests needed to inject recoverable failures through production assembly and observe a permitted follow-up request or bounded finalization. They also needed contrasts: cancellation must not initiate new model finalization, hard resource exhaustion must not authorize another call, and unknown effects must not be replayed.

Actual save failure, body visibility and final callback state needed separate checks. Independently admitted text could be visible without having been saved successfully. A save failure must not automatically clear that text. The archived observations cover production assembly with a fake gateway and isolated database recovery paths; real research-content quality remains a separate question.

The valuable change for this article is not another owner name. Spec moved the review question from “does every exit call the same function?” to “who decides which effect, based on which facts?” Source scans can help answer the former; the latter requires tracing behavior. The [veto and termination article](/en/articles/agent-veto-authority-and-run-termination) examines the mechanism further.

## 7. Improve the Requirement, Not Just the Speed of Executing a Large Plan

Spec's quality role extends beyond preventing incorrect implementation. It can reveal why a requirement fails to produce a deliverable. The weekly-report change is an example.

During that October 2026 effort, history, comparison, investment theses, subscriptions and presentation acceptance expanded until they obscured a simpler question: could a user issue one command, let the agent generate and save a first report, and receive a real file link?

Those surrounding capabilities were useful. Cross-period comparison needs history, subscriptions need scheduling, and long-running research needs evolving theses. The problem was organizing all of them as prerequisites to the first usable result. Each local task had a plausible justification while the whole effort lacked an obtainable output.

<span id="_4-design-the-whole-direction-commit-to-a-deliverable-slice" aria-hidden="true"></span>
<span id="4-design-the-whole-direction-commit-to-a-deliverable-slice" aria-hidden="true"></span>

### A complete design is not a commitment to implement it all now

After the user explicitly prioritized first delivery, the proposal narrowed the current commitment to autonomous delivery of the first file and assigned later capabilities to separately owned stages. That deferred collection could subsequently be divided further. The important distinction was not two phases versus three; it was preventing every future idea from becoming a prerequisite to the first phase.

Adding “MVP first” to Proposal would not suffice. Scope, task queues, dependencies and acceptance conditions had to change together, while retaining the destination of deferred work and the record of earlier failures. Otherwise, a coding agent would keep executing the old list, simply calling every item part of the MVP.

Figure 4 illustrates the same judgment for file ingestion: defer enhancements, not necessary protection. The weekly-report case made that principle change the execution sequence as well.

The required order was specific. First generate, save and obtain an actual file through a fully offline path with neither a real nor a simulated model dependency. Then connect a real agent to the same file capability. An end-to-end test with a fake gateway can establish its contract, but cannot substitute for an actual obtainable offline file. Once that file path worked, model integration had a concrete result to consume.

This is not a universal rule that every project must begin offline. It was the user's explicit delivery sequence for this task. One purpose of Spec is to make such a sequence govern execution rather than disappear beneath a more ambitious architecture diagram.

### Narrowing scope is not removing necessary protection

Phase one did not treat investment-analysis quality, wording or every presentation preference as acceptance criteria. It still required genuine saving, a genuine link, the correct downloadable file, and original permission, privacy, run isolation, file-safety and effect-integrity protections. The reduction concerned uncommitted enhancements, not conditions necessary for the current deliverable to be valid.

A later real sample revealed another issue: ordinary CSS variables, numeric typography and legacy table attributes were rejected by a presentation whitelist. Teaching the model to avoid every formatting restriction—or adding a mandatory reviewer agent—could perpetuate a local check's burden on the entire task.

The design instead revisited the original static-file responsibility. Presentation preferences are not the same as scripts, automatic loading, embedding or other active-content risks. User-clicked navigation should not simply inherit a server-side fetch destination policy. The change adjusted the existing file boundary, removing unjustified presentation whitelists and duplicate capacity constraints while retaining objective file safety, real resource limits, identity and commit protections. It did not create another weekly-report publishing route.

This was not “relax security to finish.” Each denial needed an actual protected invariant and a minimal effect scope. A field failing a preference should not veto an independently permitted answer. Equally, making a file downloadable could not justify deleting its actual private-source dependencies.

### What supports a more deliverable requirement?

The bounded acceptance observations checked that an ordinary CLI run completed, independently saved the file and returned its link. Downloads were then compared with the saved bytes, and the file was opened. The archive supports those delivery facts, not a broader claim about investment correctness, user satisfaction or long-term subscription reliability.

The improvement illustrated here is primarily in requirement structure and the delivery path: the first useful result no longer depended on every surrounding system, and acceptance focused on a file the user could obtain rather than internal steps. No invented efficiency percentage is necessary to explain that value. See the [weekly-review staging retrospective](/en/articles/agent-weekly-review-staged-delivery) for a separate treatment.

<span id="_5-turn-specifications-into-handoff-ready-work-not-more-checkboxes" aria-hidden="true"></span>
<span id="5-turn-specifications-into-handoff-ready-work-not-more-checkboxes" aria-hidden="true"></span>

## 8. Evolve Tests During Specification, Not After Implementation as Supporting Evidence

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

## 9. Check That Principles Reached the System, Not Merely the Documents

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

## 10. When Facts Change, Revisit the Decision They Defeat

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

## 11. Closure and Archiving: Carry Useful Decisions Forward Without Rewriting History

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

## 12. Maintain the Templates with the Same Five Don'ts

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

## 13. Adopt the Judgment Chain Before Choosing the Tooling Scale

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

Looking back across the cases, the workflow preserves design judgment rather than a complete set of files. File ingestion did not casually become a new document platform. A common function did not disguise scattered termination authority. A comprehensive weekly-report design did not indefinitely postpone its first result. The evidence process did not gain permission to produce unlimited duplicate documents in the name of completeness.

**Spec should not merely tell the coding agent how to build. It should help a team keep explaining why a change is worthwhile, which principles must survive, which assumptions may be disproved, what supports acceptance, and how the next effort can avoid the same mistake.** It cannot guarantee every judgment is right. It can give decisions a durable home, deviations an observable signal and revisions a factual basis, turning design philosophy from a slogan into a maintainable engineering practice.

For the evidence mechanism, continue with [Evidence and Trustworthy Acceptance](/en/articles/026-agent-spec-evidence-workflow). For the broader responsibility for AI-written code, see the [AI Coding Quality Panorama](/en/articles/ai-coding-quality-panorama). They complement this lifecycle view rather than replace its design reasoning.

The [Chinese article](https://hpoenixf.com/eff-agent-article/articles/agent-spec-driven-development-panorama) and [English article](https://hpoenixf.com/eff-agent-article/en/articles/agent-spec-driven-development-panorama) keep their original addresses. Source and discussion are maintained in the [GitHub collection](https://github.com/hpoenixf/eff-agent-article); stars welcome.
