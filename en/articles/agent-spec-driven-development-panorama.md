---
title: 'Spec-Driven Agent Development: From Requirements to Trustworthy Delivery'
description: 'Follow a real MCP file-ingestion change through clarification, design, specification deltas, task decomposition, TDD, independent review, acceptance and archiving—and learn when the full workflow is unnecessary.'
readingBrief:
  takeaways:
    - "A Spec workflow preserves a change's commitments and rationale; it does not require an agent to fill every document in sequence."
    - "Proposal defines the problem and scope, Design records why an option was chosen, and Spec defines observable behavior."
    - "Separate complete design from the present implementation commitment; organize around deliverable outcomes without postponing required authorization or correctness."
    - "TDD, independent review and acceptance have different jobs. Record observations during execution; local green checks cannot replace production wiring and actual consumption."
    - "Closure, specification synchronization, archiving and release remain distinct. Keep useful decisions and remove duplicate maintenance."
  appliesTo:
    - "Cross-module changes in an existing codebase, Coding Agent handoffs, and teams establishing a lightweight specification-driven workflow."
  notFor:
    - "Treating document count as a quality metric, or expecting installation to supply correct requirements, demonstrated model quality or release approval."
---

<script setup>
import { withBase } from 'vitepress'
</script>

# Spec-Driven Agent Development: From Requirements to Trustworthy Delivery

“Let the agent read files returned by business tools.” It sounds like adding a parser to a tool result. Implementation quickly raises other questions: who may cause a download? Where do credentials live? Could a partially parsed file be presented as complete? Does every file enter a long-term knowledge base? May existing business fields change?

These are not all coding questions. They determine what will be delivered, which approaches are allowed, what counts as completion, and what a successor may still rely on. Specification-driven development preserves those decisions as maintainable engineering context, then allows implementation and observations to correct them.

This article follows a real **MCP-returned-file ingestion** change in ETF Agent, using its late-September and early-October 2026 design and observations. Compact specifications below are teaching adaptations, not certification of the current deployed version. The agent doing development is a Coding Agent; the product being developed is a research agent. They play different roles.

## 1. Start with What Must Survive the Handoff, Not Which Files to Write

A change begins as intent. Discussion turns it into a bounded commitment. Design makes that commitment implementable, specifications define important behavior, tasks organize execution, and evidence supports acceptance. Accepted changes then enter the current specification; useful decisions enter engineering history.

<figure style="max-width:640px;margin:2rem auto">
<a :href="withBase('/visuals/en/agent-spec-driven-development-panorama/01-change-lifecycle.svg')" target="_blank" rel="noopener" aria-label="Open the full diagram in a new tab"><img :src="withBase('/visuals/en/agent-spec-driven-development-panorama/01-change-lifecycle.svg')" alt="A change, end to end" width="720" height="836" loading="lazy" style="width:100%;height:auto" /></a>
<figcaption>Figure 1. Preserve the commitment, implementation and acceptance basis. Evidence spans every stage; feedback returns to the affected decision. <a :href="withBase('/visuals/en/agent-spec-driven-development-panorama/01-change-lifecycle.svg')" target="_blank" rel="noopener">Open full diagram</a></figcaption>
</figure>

This is not a one-way approval pipeline. Discovering an incompatible existing interface may require revisiting the design. A test exposing contradictory requirements should send the work back to the requirements, not force code to satisfy mutually exclusive promises. **The decision contradicted by new information determines where to return.**

We combine established approaches. [OpenSpec](https://openspec.dev/) organizes current specifications and change deltas. [Superpowers](https://github.com/obra/superpowers) emphasizes design clarification, planning, test-driven implementation and review. Our project's evidence, closure and history conventions preserve execution facts across longer collaboration. These approaches overlap; describing their contributions is not a claim that each lacks the others' capabilities.

[GitHub Spec Kit](https://github.github.com/spec-kit/) also provides a structured Spec → Plan → Tasks → Implement path. Teams can keep their existing framework. What matters is deciding where each decision lives and how later work consumes it, not copying every directory or command.

Our custom `superpowers-bridge` schema organizes artifacts and their input dependencies. It does not require every optional file for every change. When a PR description, existing tests and CI already explain a small edit adequately, the full workflow is unnecessary.

## 2. Turn One Sentence into an Acceptable Commitment

The case began with a concrete gap. Business MCP tools could return fund prospectuses, product documents or file references. If every business Skill handled downloading, authentication, format detection and parser limits itself, each would inherit duplicated, sensitive infrastructure work.

The codebase already had research assets, source identity, a run-scoped evidence workspace, and generic material search/read operations. The missing piece was **connecting files in trusted tool results to those existing capabilities**, not building a new document platform.

<figure style="max-width:640px;margin:2rem auto">
<a :href="withBase('/visuals/en/agent-spec-driven-development-panorama/02-request-to-commitment.svg')" target="_blank" rel="noopener" aria-label="Open the full diagram in a new tab"><img :src="withBase('/visuals/en/agent-spec-driven-development-panorama/02-request-to-commitment.svg')" alt="Find the gap. Bound the work." width="720" height="819" loading="lazy" style="width:100%;height:auto" /></a>
<figcaption>Figure 2. The case fills a missing connection from trusted tool output to an existing workspace, rather than starting a document platform. <a :href="withBase('/visuals/en/agent-spec-driven-development-panorama/02-request-to-commitment.svg')" target="_blank" rel="noopener">Open full diagram</a></figcaption>
</figure>

### Investigate facts before asking for decisions

Before implementation, the Coding Agent should inspect relevant accepted specifications, entry points and tests to establish existing capabilities, gaps and affected responsibilities. Facts available in the repository should not become a questionnaire delegated to the user.

The genuine decisions concern product scope. Which formats come first? Are scanned documents required in the initial delivery? Is material limited to the current task, or retained by default? These choices change implementation size, permissions and acceptance. They should not be silently settled while coding.

The case bounded its first version to text-layer PDF, DOCX, XLSX and static HTML. OCR for scans, chart understanding, legacy Office formats and automatic vector indexing were outside initial acceptance. It also avoided adding format-specific model tools such as `read_pdf` and `read_excel`.

### Proposal preserves the commitment

A proposal can be brief, but it should explain why the change is needed, what changes, what does not, and how acceptance works. This teaching adaptation compresses the real scope; it is not a mandatory template:

```text
Problem: Trusted MCP files lack a common path into the existing workspace.
Deliverable: Authorized files become searchable/readable in the current task.
Preserve: Tool identity, business fields, source locations and access limits.
Exclude: OCR, automatic indexing, arbitrary URL downloads and format tools.
Acceptance: Local format fixtures traverse real Host wiring and workspace reads;
            cover rejection and partial extraction.
```

The commitment already excludes two misleading forms of completion: a parser produces output that the model cannot reach through the normal entry point; or every document is successfully indexed by expanding retention without approval.

Excluding OCR reduces feature scope. It does not justify excluding authorization. **Enhancements can be deferred; correctness and safety required by the current deliverable cannot.**

## 3. Design Explains Choices; Spec Defines Observable Behavior

### Compare reasonable options before choosing the integration point

There were at least three reasonable approaches. Per-Skill parsing can be quickest for a one-off script. Format-specific tools may suit a product that deliberately asks the model to manipulate format details. A common Host result-processing path fits a system that already has generic material access and wants credentials and parser mechanics kept out of model reasoning.

Here, Host means the program that executes tools, enforces access and assembles results. The case chose that third approach: validate file descriptors, acquire content, parse within bounds, and register it with existing research assets and the workspace. The model continues using generic search/read operations and never receives acquisition credentials.

The design must also record the cost. Centralization creates shared responsibility for format adapters, resource ceilings, error classes and integration tests. That cost makes sense when multiple sources share the requirements. A single-purpose script reading a small public text file may need much less machinery.

Design also preserves choices that casual “improvements” can violate. One failed attachment must not erase unrelated safe business facts. Identical content does not establish present authorization. The delivered stage used an ephemeral run-scoped repository, not a cross-run parse cache; a cache discussed in the design must not be presented as delivered functionality.

### A specification is not an implementation checklist

A specification describes observable behavior, commonly as requirements and scenarios. “Create a class” or “add a file” is not a useful feature contract: another implementation could meet the same requirement without those artifacts.

```text
Requirement: Unadmitted input must not trigger file acquisition.
GIVEN: Model prose contains a URL without a trusted tool-result binding.
WHEN: The system processes that output.
THEN: No acquisition occurs; unrelated safe business results remain unchanged.

Requirement: Incomplete parsing preserves actual coverage.
GIVEN: A resource limit allows only part of a file to be parsed.
WHEN: The model reads the parsed material.
THEN: Return the material with partial coverage; do not infer that unread areas
      contain nothing.
```

These teaching scenarios adapt key behaviors from the case rather than quote its clauses. Normal operation, rejection and partial success appear together so later tests can distinguish an incorrect success from a correct one.

<figure style="max-width:640px;margin:2rem auto">
<a :href="withBase('/visuals/en/agent-spec-driven-development-panorama/03-spec-delta.svg')" target="_blank" rel="noopener" aria-label="Open the full diagram in a new tab"><img :src="withBase('/visuals/en/agent-spec-driven-development-panorama/03-spec-delta.svg')" alt="A proposal is not current truth" width="720" height="852" loading="lazy" style="width:100%;height:auto" /></a>
<figcaption>Figure 3. Keep proposed deltas distinct from accepted contracts. An unmet acceptance condition does not become an accepted fact. <a :href="withBase('/visuals/en/agent-spec-driven-development-panorama/03-spec-delta.svg')" target="_blank" rel="noopener">Open full diagram</a></figcaption>
</figure>

Accepted specifications live under `openspec/specs/`; the proposed delta lives under `openspec/changes/<change>/specs/`. `ADDED` introduces a requirement, `MODIFIED` changes one, `REMOVED` removes one, and `RENAMED` changes its name. Modification and removal must identify the existing requirement. A proposed addition not yet appearing in the accepted specification is normal.

Our project synchronizes these changes after acceptance of the declared scope. Accepting a contract remains an engineering decision, not a measurement of a deployed revision. When code, tests and specifications disagree, investigate the disagreement instead of treating any one artifact as an absolute oracle.

## 4. Design the Whole Direction; Commit to a Deliverable Slice

A familiar trap is adding OCR, a knowledge base, cross-run caching, administration screens and runtime statistics to the same phase in the name of complete design. Each item may be reasonable alone. Together, they keep postponing the first usable path.

The case's first outcome was an authorized file becoming material the current research task could read through the real Host entry point. Admission, parsing, provenance and workspace wiring had to work together for that result. Automatic long-term indexing and richer content understanding could wait.

<figure style="max-width:640px;margin:2rem auto">
<a :href="withBase('/visuals/en/agent-spec-driven-development-panorama/04-delivery-scope.svg')" target="_blank" rel="noopener" aria-label="Open the full diagram in a new tab"><img :src="withBase('/visuals/en/agent-spec-driven-development-panorama/04-delivery-scope.svg')" alt="Design broadly. Deliver a slice." width="720" height="840" loading="lazy" style="width:100%;height:auto" /></a>
<figcaption>Figure 4. A complete slice includes required safeguards. Enhancements stay outside this commitment; delivery, not folder size, determines phases. <a :href="withBase('/visuals/en/agent-spec-driven-development-panorama/04-delivery-scope.svg')" target="_blank" rel="noopener">Open full diagram</a></figcaption>
</figure>

Slice work by usable outcomes rather than “all backend first, then all frontend.” In another project, one format could be a sensible first slice. That is an adoption suggestion, not a rewrite of this case's original four-format commitment.

One Spec can describe the broader direction while clearly bounding the current phase. Separate changes are useful when outcomes, owners or closure lifecycles are genuinely independent, not merely because the document is long. If the declared scope still spans multiple phases, the first phase cannot stand in for closure of the whole change.

When scope changes, update Proposal, Tasks and acceptance conditions as well. Saying “MVP first” in chat while executing the original checklist has not narrowed the work. Preserve the destination of deferred work and the record of existing failures rather than deleting them to manufacture completion.

## 5. Turn Specifications into Handoff-Ready Work, Not More Checkboxes

The case grouped implementation into three cohesive units: trusted descriptors and acquisition; format parsing and coverage; workspace integration and lifecycle. Each owns related behavior and an inspectable result. Every scenario need not produce four additional RED, GREEN, REFACTOR and VERIFY tasks.

<figure style="max-width:640px;margin:2rem auto">
<a :href="withBase('/visuals/en/agent-spec-driven-development-panorama/05-work-and-handoff.svg')" target="_blank" rel="noopener" aria-label="Open the full diagram in a new tab"><img :src="withBase('/visuals/en/agent-spec-driven-development-panorama/05-work-and-handoff.svg')" alt="Tasks and handoffs" width="720" height="835" loading="lazy" style="width:100%;height:auto" /></a>
<figcaption>Figure 5. A development-dependency sketch, not historical scheduling or runtime data flow. Stabilize shared contracts before independent parallel work. <a :href="withBase('/visuals/en/agent-spec-driven-development-panorama/05-work-and-handoff.svg')" target="_blank" rel="noopener">Open full diagram</a></figcaption>
</figure>

`tasks.md` owns work state. When dependencies genuinely need explanation, `plan.md` adds sequencing, integration points and test entry points. A task should tell a successor what must change, which constraints remain binding and how completion can be judged, without requiring another duplicated requirement document.

This teaching work unit describes the integration point, invariants and verification rather than prescribing every function:

```text
Work unit: Trusted file ingestion.
Input: A Host-validated tool result and the current task scope.
Outcome: Admitted attachments reach parsing; rejected ones retain local failure.
Preserve: Tool identity and business fields; no credentials in model input.
Check: Use the same entry point for allowed files, forged descriptors and a bad attachment.
Handoff: Output contract, locator rules, revision, observations and remaining gaps.
```

Parallel agents are optional. Before interfaces and test prerequisites stabilize, assigning more workers may create incompatible assumptions faster. Agree on shared wiring and output contracts, then parallelize independent work. The diagram illustrates dependency-aware planning; it does not claim the historical change used that concurrent schedule.

Each worker needs an explicit editing scope. Adjacent problems can be reported to their owner, but reading a dependency does not authorize changing it. Someone must still integrate the work through the real entry point. Individually passing modules do not spontaneously assemble into a usable feature.

## 6. Bring Execution Facts into the Workflow: TDD, Wiring and Review

TDD first lets a discriminating test expose missing behavior, then lets implementation change its outcome. It is not satisfied by a red log followed by a green one. If a test never loads or a database never starts, repair those prerequisites rather than counting the environment failure as behavioral RED.

<figure style="max-width:640px;margin:2rem auto">
<a :href="withBase('/visuals/en/agent-spec-driven-development-panorama/06-execution-and-review.svg')" target="_blank" rel="noopener" aria-label="Open the full diagram in a new tab"><img :src="withBase('/visuals/en/agent-spec-driven-development-panorama/06-execution-and-review.svg')" alt="Test, integrate, review" width="720" height="849" loading="lazy" style="width:100%;height:auto" /></a>
<figcaption>Figure 6. Behavioral tests, production wiring and independent review answer different questions. Environment errors are not behavioral failures. <a :href="withBase('/visuals/en/agent-spec-driven-development-panorama/06-execution-and-review.svg')" target="_blank" rel="noopener">Open full diagram</a></figcaption>
</figure>

One observation in the case is especially instructive. Asset-layer tests initially passed, but the ledger explicitly retained unverified descriptor admission, acquisition adapters and workspace exposure. The associated task remained incomplete. **Registering bytes as an asset is not the same as letting the research agent read a file returned by a business tool.**

Later checks sent local file fixtures through the real Host result integration and read them from the same run's workspace. They checked source locations, partial coverage, revocation and cross-scope inaccessibility. These local checks support the integration contract, not production provider availability or the quality of the model's research conclusions.

The ledger starts before implementation with a baseline or an unknown. During RED, GREEN and integration checks, append the actual revision, outcome and artifacts. Waiting until implementation ends invites a polished reconstruction from memory. The [evidence and acceptance deep dive](/en/articles/026-agent-spec-evidence-workflow) explains fields and reuse rules; for the whole workflow, the key is that observations enter the record where execution actually occurs.

### Independent review starts from the commitment

Review has two questions: does the implementation meet the original commitment, and does its approach introduce unnecessary coupling, expanded authority or hard-to-maintain state? One reviewer can answer both. The distinction does not mechanically require two additional roles.

A reviewer should inspect relevant requirements, diffs, actual tests and original results, not only the implementer's explanation. Another model or a fresh session is not automatically independent. Expected behavior and observed behavior must not derive entirely from the same self-report.

If review finds that tests cover asset registration but not tool-to-workspace integration, add the missing path rather than more similar parser assertions. A higher test count does not necessarily bring the work closer to the user's outcome.

## 7. New Information Should Reopen the Decision It Contradicts

Specification-driven work does not freeze the specification. It makes revision targeted. First distinguish a changed commitment, an unsuitable design, an implementation error and a missing execution environment. Then update the artifact that owns that fact.

<figure style="max-width:640px;margin:2rem auto">
<a :href="withBase('/visuals/en/agent-spec-driven-development-panorama/07-feedback-routing.svg')" target="_blank" rel="noopener" aria-label="Open the full diagram in a new tab"><img :src="withBase('/visuals/en/agent-spec-driven-development-panorama/07-feedback-routing.svg')" alt="Which decision did the fact change?" width="720" height="844" loading="lazy" style="width:100%;height:auto" /></a>
<figcaption>Figure 7. Return to the earliest invalid decision. Missing prerequisites block their own lane; withdrawal is a valid outcome. <a :href="withBase('/visuals/en/agent-spec-driven-development-panorama/07-feedback-routing.svg')" target="_blank" rel="noopener">Open full diagram</a></figcaption>
</figure>

A new requirement to read scanned documents changes scope and acceptance, so revisit the implementation commitment. A parser labeling truncated content as complete violates an unchanged requirement: repair the implementation and its tests rather than rewrite Proposal. Missing provider credentials block that verification route while independent local work can continue.

| New observation | Return first to | Do not casually do this instead |
| --- | --- | --- |
| The user changes delivery scope | Proposal, affected specifications and tasks | Update only the chat summary while retaining the old checklist |
| The chosen design violates an existing constraint | Design and affected contracts | Hide the responsibility conflict under more patches |
| Implementation violates a valid requirement | Code, tests and their observations | Weaken the requirement to obtain a green check |
| Environment or authority is missing | That verification route and its retry conditions | Repeat the unchanged failing command or record a pass |

Rerunning a blocked command with unchanged environment, revision and permissions usually contributes little new information. A concrete missing prerequisite and retry condition are more useful than repeated reports of the same failure.

A change can also be abandoned. Retain the reason, stop implementation and identify which proposals never entered the accepted specification. Withdrawing an idea that no longer deserves implementation is a valid outcome, not an incomplete checklist that must be finished for appearances.

## 8. What Do Closure, Archiving and Release Actually End?

Verify answers which commitments the existing observations support and which gaps remain. It can be generated from the evidence ledger, but generation runs no tests and creates no fresh pass.

Formal closure follows the project's declared acceptance route. Checked tasks describe work state; completed preparation means the materials are ready. Neither replaces actual acceptance. Our project's `spec:close` is a project-specific mechanism, not a universal release command supplied automatically by OpenSpec or the public Evidence Kit.

<figure style="max-width:640px;margin:2rem auto">
<a :href="withBase('/visuals/en/agent-spec-driven-development-panorama/08-close-and-handoff.svg')" target="_blank" rel="noopener" aria-label="Open the full diagram in a new tab"><img :src="withBase('/visuals/en/agent-spec-driven-development-panorama/08-close-and-handoff.svg')" alt="Closure is not release" width="720" height="857" loading="lazy" style="width:100%;height:auto" /></a>
<figcaption>Figure 8. Acceptance leads to specification synchronization, archiving and useful history. Gaps remain explicit; release stays separate. <a :href="withBase('/visuals/en/agent-spec-driven-development-panorama/08-close-and-handoff.svg')" target="_blank" rel="noopener">Open full diagram</a></figcaption>
</figure>

The historical case declared a local deterministic ingestion contract. Local format fixtures and controlled adapters could therefore establish that scope without a paid model invocation. A commitment that the research agent correctly cites real fund documents would require matching real-task and citation-quality evaluation. It cannot borrow the narrower contract's pass.

After successful closure, synchronize the accepted specification delta and archive the change. A successor can then start from the current contract instead of mistaking an old proposal for a feature that still needs to be implemented.

History preserves decisions that will matter later: why parsing belongs in the Host rather than a business Skill, or why files remain scoped to the current task. It need not copy every log. Without a distinct reusable insight, formal history can be omitted; an existing candidate need not be written again just to archive the change.

The case retains its historical local closure receipt. Later DOCX/XLSX repairs have separate focused verification, and the task note still marks a new formal close as pending. Preserve that distinction: an old receipt does not certify subsequently changed code, and this article does not treat it as current production certification.

Release remains with the established release process, including authorization, deployment and required readback. Archiving grants no release approval. Conversely, a valid closure record with only documentation cleanup should not automatically trigger the entire acceptance process again.

## 9. Bring the Workflow to Your Own Project

Begin with an actual change, not a workflow platform. Determine whether your PR, CI and documents already preserve commitments, execution and conclusions; add only the missing parts. A readable directory sketch follows. Optional artifacts expand only where useful:

```text
openspec/
  specs/<capability>/spec.md       # Accepted behavior contract
  changes/<change>/
    proposal.md                   # Why change, and what this phase promises
    design.md                     # Necessary alternatives, choices and costs
    specs/<capability>/spec.md     # Behavior changed by this proposal
    tasks.md                      # Cohesive work units
    plan.md                       # Dependencies and test entry points, if needed
    evidence.md                   # Before-state and execution observations
    verify.md                     # Conclusions and remaining gates
```

This is not a checklist forbidding work whenever one file is missing. If a small edit is clearly explained in a PR and CI retains the applicable revision and result, keep that approach. More explicit durable agreements become worthwhile when work spans sessions or owners, or affects authorization and recovery.

### Which part can readers reproduce publicly?

[Spec Flow in Agent Engineering Suite](https://github.com/hpoenixf/agent-engineering-suite/tree/3b515de2f30e25b1e0757243f3ce4d1be19b00b0/skills/aes-spec-flow) provides a public method entry point and toolkit. Its [Evidence Kit](https://github.com/hpoenixf/agent-engineering-suite/tree/3b515de2f30e25b1e0757243f3ce4d1be19b00b0/skills/aes-spec-flow/toolkit) checks task/observation structure locally, generates Verify and reads recorded completion. It neither executes your project's tests nor copies our project's formal-closure or release authority.

With Node 26.11.1–26.x, run this offline format example against pinned source. It needs no model key or database:

```bash
git clone https://github.com/hpoenixf/agent-engineering-suite.git
cd agent-engineering-suite
git checkout 3b515de2f30e25b1e0757243f3ce4d1be19b00b0
cd skills/aes-spec-flow/toolkit
node bin/spec-evidence.mjs lint --root examples --changes-dir changes --change example --stage apply
node bin/spec-evidence.mjs verify --root examples --changes-dir changes --change example
node bin/spec-evidence.mjs verify --root examples --changes-dir changes --change example --check
```

The observable output is the example directory's `verify.md`, not a newly accepted product change. Its records are fictional format material; inspecting them does not execute those tests. Consult the [installation guide for this revision](https://github.com/hpoenixf/agent-engineering-suite/blob/3b515de2f30e25b1e0757243f3ce4d1be19b00b0/docs/installation.md); the [same module on main](https://github.com/hpoenixf/agent-engineering-suite/tree/main/skills/aes-spec-flow) remains the current maintenance entry point.

The business-ingestion case comes from the original project's engineering process. It does not imply that the public toolkit includes those product capabilities. The tool helps maintain records; your project must still define behavior, choose verification methods and integrate the real path.

---

The workflow did not invent a parsing algorithm. It preserved decisions easily lost during implementation: accept only trusted sources, do not expand access, reuse the existing workspace, do not present partial material as a complete document, and do not turn the initial change into a document platform. Implementation, tests and handoff could then proceed around those decisions.

A workflow worth keeping should reduce a successor's guesswork, make a reviewer's checks easier and give the current owner a defensible stopping point. Adding necessary records is design. Merging duplicate documents, deferring unrelated work and removing gates without decision value are design as well.

Continue with [Evidence and Trustworthy Acceptance](/en/articles/026-agent-spec-evidence-workflow) for the verification mechanism, and [AI Coding Quality Panorama](/en/articles/ai-coding-quality-panorama) for responsibility across the project. The first asks why a change may be accepted; this article explains how a change proceeds end to end; the third asks how to take responsibility for the whole system.
