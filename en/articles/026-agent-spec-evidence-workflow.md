---
title: "Writing a Spec Doesn't Mean the Work Is Done: Verifiable Agent Engineering"
description: "Why add engineering evidence when Spec, Git and CI already exist? A cross-revision handoff explains bounded completion claims, selective revalidation and a clear stopping point."
readingBrief:
  takeaways:
    - "Evidence connects requirements, executions, revisions and conclusions. If CI already preserves these relationships, another ledger is unnecessary."
    - "Evidence supports conditional claims. Traceability, trustworthy execution and sufficient coverage are separate properties."
    - "Preserve an old observation's identity. Recheck affected behavior or inputs; a new session must not turn an old pass into a fresh run."
    - "Capture evidence throughout development and generate Verify as a view. Formal closure, model quality and release retain their own acceptance and authority."
    - "Start with a minimal evidence index. Add mechanisms for real coordination or risk, and stop when agreed criteria are met without relevant changes."
  appliesTo:
    - "Development across revisions, sessions or agents, especially changes involving authorization, persistent recovery and model evaluation."
  notFor:
    - "Automatically authenticating executions, proving every behavior or replacing release approval; small edits do not need the entire workflow."
---

<script setup>
import { withBase } from 'vitepress'
</script>

# Why Can't We Call an Agent Feature Finished After Writing the Spec?

Consider a development handoff. An agent passes data-adapter tests on revision A, then changes authorization logic to produce revision B. A live-data integration check never runs because an isolated environment is unavailable. The next session retains only “tests passed,” and the closing report eventually says “the new data source is complete.”

This is a **constructed teaching example**, not a recorded project incident. Its point is not that agents necessarily lie. A genuine local result can lose its conditions across revisions and summaries, becoming a stronger completion claim than the observation supports.

Our evidence mechanism addresses that gap. Here, **engineering evidence means material supporting development conclusions**, not the market sources cited in an investment report. The goal is not another document layer. A successor should be able to identify which requirement was checked, against which source and under what conditions, what remains unverified, and why this piece of work can end.

## 1. What Is Missing When Spec, Git and CI Already Exist?

A spec describes intended behavior. Git preserves source changes. Tests check behavior under particular conditions, while CI can retain revisions, environments and artifacts. These mechanisms are valuable. The usual gap is that **their facts are not connected to the final claim**, not that any one tool inherently lacks the capability.

Adding a data source to a fund-research system may require source identity, access restrictions and failure recovery. A test showing that the adapter parses a mock payload supports only part of that promise. To judge the whole change, someone must connect acceptance commitments to coverage, blocked executions and any relevant modifications made after testing.

<figure style="max-width:640px;margin:2rem auto">
<a :href="withBase('/visuals/en/026-agent-spec-evidence-workflow/01-why-evidence.svg')" target="_blank" rel="noopener" aria-label="Open the full diagram in a new tab"><img :src="withBase('/visuals/en/026-agent-spec-evidence-workflow/01-why-evidence.svg')" alt="Connect the green checks" width="720" height="746" loading="lazy" style="width:100%;height:auto" /></a>
<figcaption>Figure 1. Existing tools own facts; an evidence index connects them. A CI system that already provides these relationships may be sufficient. <a :href="withBase('/visuals/en/026-agent-spec-evidence-workflow/01-why-evidence.svg')" target="_blank" rel="noopener">Open full diagram</a></figcaption>
</figure>

| Existing mechanism | What it directly answers | What still needs linking to the conclusion |
| --- | --- | --- |
| Spec | What behavior is expected? | Which execution exercised which requirement? |
| Git | How did this source change? | Which actual working tree was observed, and what changed later? |
| Tests / CI | What ran, and what was the result? | Which acceptance commitments did those checks cover? |
| PR or handoff summary | What progress does the author report? | Does the conclusion lead to an original execution, rather than another summary? |

**If CI already connects requirements, run identity, revisions, coverage and remaining gaps, it can be the evidence carrier.** Using `evidence.md` in this article is not a reason to duplicate an adequate system.

For our Markdown-based, long-running, multi-session workflow, a lightweight ledger is an index that travels with the change. It mainly stores relationships and summaries. Original logs remain with their runner or artifact storage.

### Why does agent collaboration make this more noticeable?

One agent can write the requirements, implementation, tests and final explanation. That is convenient, but **producing a result and explaining it may share the same misunderstanding**. A second agent that reads only the first agent's summary has not performed an independent check.

Session changes and context compaction can also change which material a successor sees. Implementation, testing and integration may occur in different working trees at different times. Human handoffs have the same problem; agents have not invented a new engineering discipline. They make it more useful to design explicitly for preserving the original conditions.

The benefit is therefore not another prompt asking an agent to report honestly. It is changing the handoff object from “done” into inspectable relationships. Reminders help, but should not be the only carrier.

## 2. Engineering Evidence Supports a Conditional Claim

<div id="_3-evidence-ledger-don-t-reconstruct-test-outcomes-from-model-memory" aria-hidden="true"></div>
<div id="3-evidence-ledger-don-t-reconstruct-test-outcomes-from-model-memory" aria-hidden="true"></div>

Return to the new data source. The claim is: “Adding this source must not expand the user's data access.” After one denial test, the defensible conclusion is: “This exercised denial path in revision A meets the requirement.” That is still narrower than “every authorization path is correct.”

<figure style="max-width:640px;margin:2rem auto">
<a :href="withBase('/visuals/en/026-agent-spec-evidence-workflow/02-claim-and-observation.svg')" target="_blank" rel="noopener" aria-label="Open the full diagram in a new tab"><img :src="withBase('/visuals/en/026-agent-spec-evidence-workflow/02-claim-and-observation.svg')" alt="Evidence bounds a claim" width="720" height="818" loading="lazy" style="width:100%;height:auto" /></a>
<figcaption>Figure 2. Teaching example. The requirement, execution conditions, observation and original source jointly bound a conclusion. One successful example does not establish every path. <a :href="withBase('/visuals/en/026-agent-spec-evidence-workflow/02-claim-and-observation.svg')" target="_blank" rel="noopener">Open full diagram</a></figcaption>
</figure>

Useful evidence should identify **the claim being supported, the observation that actually occurred, and the conditions under which it occurred**. Revision, command, environment, samples and artifacts are not decorative fields. They constrain the relationship among those three things.

The following is a simplified teaching record, not an actual execution receipt or the public CLI's complete input format:

```text
Evidence: EV-01
Claim: The new source must not expand data access
Task: 1.1
Revision: Actual source / working-tree identity at execution
Check: Targeted out-of-scope request in an isolated environment
Observation: The exercised request was denied
Artifact: Locatable run record and original output
Limit: Other access paths and live-provider behavior are not covered
```

`EV-01` connects “why check this?” with “what was observed?” Its value is not the identifier itself. Reporting many passing tests without connecting them to the claim still leaves weak support.

### Traceable, trustworthy and sufficient are different properties

**Traceable** means a record leads back to an execution and its artifacts. **Trustworthy** means there is reason to believe the execution record was neither fabricated nor misattributed. **Sufficient** means the checks support the particular decision being made.

A ledger primarily improves traceability and makes the other two properties easier to scrutinize. An agent that can edit the implementation, tests and ledger can make all three agree while misunderstanding the requirement. Another field does not solve that problem.

For important permissions or external effects, an existing CI runner can retain independent run identities and protected artifacts, while established review, testing and release mechanisms decide acceptance. That is a stronger trust arrangement, **not an authentication capability already supplied by the Evidence Kit below**. An existing file or a matching digest alone establishes neither a genuine execution nor sufficient testing.

Accordingly, `observed-run` means “the recorder declares this was an execution observed at the time,” not a trust stamp issued by the tool. The [public toolkit documentation](https://github.com/hpoenixf/agent-engineering-suite/blob/3b515de2f30e25b1e0757243f3ce4d1be19b00b0/skills/aes-spec-flow/toolkit/README.md) explicitly preserves that limitation.

A second easily missed form of evidence is the **before state**. Without a baseline, a passing result can support “the exercised conditions are now met,” but not “the system improved by this much.” Mark an unavailable baseline as not collected. Do not infer an attractive before measurement from an after result.

## 3. How Can Evidence Survive Revisions and Sessions?

An observation is first a historical fact: a result was seen at a particular time under particular conditions. A later commit does not erase it, but neither automatically inherits all of its evidentiary value.

In the opening example, B changes authorization. Adapter tests on A cannot directly establish B's authorization behavior. Review which requirements, tests and inputs the change affects, then rerun the relevant scope instead of giving an old `PASS` a new date.

Conversely, correcting a typo does not necessarily alter behavior, configuration, samples or external conditions. A valid closure record should not force a full rerun solely because the commit identifier changed.

<figure style="max-width:640px;margin:2rem auto">
<a :href="withBase('/visuals/en/026-agent-spec-evidence-workflow/03-revision-and-reuse.svg')" target="_blank" rel="noopener" aria-label="Open the full diagram in a new tab"><img :src="withBase('/visuals/en/026-agent-spec-evidence-workflow/03-revision-and-reuse.svg')" alt="Keep history. Recheck scope." width="720" height="800" loading="lazy" style="width:100%;height:auto" /></a>
<figcaption>Figure 3. Preserve the original record and separately assess applicability. This is a maintainer's impact-analysis method, not automatic source-equivalence checking by the CLI. <a :href="withBase('/visuals/en/026-agent-spec-evidence-workflow/03-revision-and-reuse.svg')" target="_blank" rel="noopener">Open full diagram</a></figcaption>
</figure>

| Recorded state | How a successor should use it |
| --- | --- |
| `observed-run` | Read the original date, revision, environment and artifacts; check whether they support the current claim. |
| `reused-historical` | Explicitly reference the original observation and preserve its identity; do not present it as a fresh execution. |
| `blocked` | Identify the missing prerequisite and the change that would make a retry useful. |
| Not collected / unverified | Keep the unknown visible rather than replacing it with zero, success or assumed failure. |

Relevant changes are not limited to code diffs. Test data, prompts, dependencies, configuration and external-service behavior may change the applicability of an earlier observation. When the impact cannot be established, retain an unverified state instead of allowing a summary to imply a stronger guarantee.

Two actions must remain distinct: **reading an existing completion record** and **accepting a new change**. The former can preserve a historical outcome; the latter must satisfy the consuming project's current acceptance policy. The public CLI's `status` does not compare current source with old tests, and a historical import does not satisfy the fresh observations required for a newly checked task.

An agent handoff should transfer original observation pointers, relevant changes and unresolved gaps, not just the predecessor's verdict. A reviewer should be able to follow those pointers to the originals. If the original logs are gone, acknowledge reduced inspectability; a remembered chat summary must not become newly manufactured execution evidence.

## 4. Capture Evidence Throughout Development Without Turning Work into Forms

<div id="_2-a-spec-workflow-is-about-facts-produced-at-each-stage-not-file-order" aria-hidden="true"></div>
<div id="2-a-spec-workflow-is-about-facts-produced-at-each-stage-not-file-order" aria-hidden="true"></div>

The initial motivation was straightforward: after an important change, we wanted to explain why it was made, what existed before and which choices mattered, without reconstructing everything from chats when preparing a retrospective or technical explanation.

The engineering record dated August 30, 2026 already identified the gap. Material was mostly assembled during Verify and Retrospective, and some changes lacked independently collected before measurements. We introduced a continuously maintained `evidence.md`: baseline or unknown before implementation, observations during execution, and conclusions derived from existing facts during closeout.

This is why the ledger should not appear as a step created only after GREEN. It is a **record spanning the work**, not a final report reconstructed afterward.

<figure style="max-width:640px;margin:2rem auto">
<a :href="withBase('/visuals/en/026-agent-spec-evidence-workflow/04-ledger-through-lifecycle.svg')" target="_blank" rel="noopener" aria-label="Open the full diagram in a new tab"><img :src="withBase('/visuals/en/026-agent-spec-evidence-workflow/04-ledger-through-lifecycle.svg')" alt="Record as the work happens" width="720" height="780" loading="lazy" style="width:100%;height:auto" /></a>
<figcaption>Figure 4. Capture a baseline before implementation, append observations during execution and generate Verify as a view. Decisions and implementation can be revisited; the process is not an irreversible waterfall. <a :href="withBase('/visuals/en/026-agent-spec-evidence-workflow/04-ledger-through-lifecycle.svg')" target="_blank" rel="noopener">Open full diagram</a></figcaption>
</figure>

### Separate intent, accepted contracts and observed behavior

<div id="_1-separate-what-the-system-currently-is-from-what-we-want-to-change" aria-hidden="true"></div>
<div id="1-separate-what-the-system-currently-is-from-what-we-want-to-change" aria-hidden="true"></div>

[OpenSpec](https://github.com/Fission-AI/OpenSpec) distinguishes accepted specifications from proposed changes. [GitHub Spec Kit](https://github.github.com/spec-kit/) also organizes specifications, plans, tasks and implementation as connected artifacts. We build on these ideas, rather than claiming that those tools lack verification or proposing another universal standard.

In the original project, `openspec/specs/` contains accepted behavior contracts, while `openspec/changes/<name>/` contains a proposed change. `ADDED` introduces a requirement; `MODIFIED` and `REMOVED` should refer to existing requirements; `RENAMED` records a name change. A new requirement not yet appearing in the accepted spec is normal. A missing old requirement calls for checking the delta classification or a specification gap.

An accepted contract is still not a measurement of an arbitrary deployed revision. A proposal records intent, code describes implementation, and a run records behavior observed under specific conditions. They should align, not substitute for one another.

<div id="proposal-define-the-problem-not-a-promise-of-implementation" aria-hidden="true"></div>
<div id="design-record-decisions-rather-than-restating-requirements" aria-hidden="true"></div>

Proposal establishes the problem, scope, non-goals and acceptance route early, preventing closeout from continuously accumulating new commitments. Design explains alternatives and costs: why existing responsibilities are insufficient and which invariant a new state or interceptor protects. For semantic questions such as whether research material is sufficient, an easy-to-write validator should not pretend the runtime can independently certify the judgment.

<div id="tasks-one-work-unit-not-four-duplicate-checkboxes" aria-hidden="true"></div>

Group tasks by shared responsibility, implementation seam and test set. One work unit can share RED → GREEN → necessary refactoring and verification; every scenario need not become four procedural checkboxes.

A meaningful behavioral RED reaches the target behavior and fails because that behavior is absent or wrong. An unavailable database, syntax error or unloadable test instead exposes an environment, assembly or executability problem. Record those real failures, but do not upgrade them into evidence about the intended business behavior. Documentation inspection can use an actual CHECK rather than manufactured RED.

### Store each observation once

<div id="_4-generate-verify-from-evidence-instead-of-copying-evidence-into-verify" aria-hidden="true"></div>
<div id="4-generate-verify-from-evidence-instead-of-copying-evidence-into-verify" aria-hidden="true"></div>
<div id="_6-why-we-simplified-the-spec-closing-process" aria-hidden="true"></div>
<div id="6-why-we-simplified-the-spec-closing-process" aria-hidden="true"></div>

After introducing the ledger, another problem emerged: commands and results were copied into Tasks, Plan, Evidence and Verify. The early-October 2026 closeout change addressed duplicated maintenance rather than adding more acceptance layers.

| Artifact | Primary responsibility |
| --- | --- |
| Proposal / Design | Motivation, committed scope, alternatives and key tradeoffs |
| Specs | Observable requirements and their deltas |
| Tasks | Work units and completion state |
| Plan, when needed | Execution order, necessary test entry points and traceability links |
| Evidence | Baselines, observations, execution identity, artifacts and limitations |
| Verify | Conclusions and remaining gates based on existing observations |

The original project's `superpowers-bridge` schema organizes these artifacts; not every small change requires every optional file. The later `spec:verify` command generates Verify as a projection of the ledger. It preserves original dates and revisions, detects stale inputs, protects handwritten Verify files, and refuses out-of-scope or symlink-traversing writes.

Two kinds of freshness matter. **View freshness** means Verify agrees with its current inputs. **Evidence applicability** means those inputs still support the present decision. The generator checks the former, not the latter. Regenerating a view today from an old observation does not produce a new execution today.

```bash
# Original-project entry points, not public Evidence Kit commands
pnpm run spec:verify --change example-change
pnpm run spec:verify --change example-change --check
pnpm run spec:lint --change example-change --stage plan
pnpm run spec:lint --change example-change --stage apply
pnpm run spec:lint --change example-change --stage verify
```

Stage checks inspect their corresponding structure: `plan` checks minimum task operability, `apply` checks observations associated with completed tasks, and `verify` checks states, evidence and conclusions. They neither establish model-answer quality nor need to scan every historical change and become another universal acceptance engine.

The same closeout work distinguished `none`, `candidate` and `history` handoffs. Without a useful new long-term insight, archiving need not manufacture an engineering-history essay. The change has bounded verification and closure records, but no measured reduction in development hours. Its directly explainable value is **concentrating maintenance of each fact in one place**.

## 5. When Can Work End? Completion Is Not One Boolean

<div id="_5-when-is-a-change-formally-closed" aria-hidden="true"></div>
<div id="5-when-is-a-change-formally-closed" aria-hidden="true"></div>

Implementation, local contracts, live integration, model-quality evaluation, formal closure and release are different dimensions. They do not form a ladder where a `PASS` automatically promotes the change to the next level.

<figure style="max-width:640px;margin:2rem auto">
<a :href="withBase('/visuals/en/026-agent-spec-evidence-workflow/05-scoped-completion.svg')" target="_blank" rel="noopener" aria-label="Open the full diagram in a new tab"><img :src="withBase('/visuals/en/026-agent-spec-evidence-workflow/05-scoped-completion.svg')" alt="No automatic upgrade to done" width="720" height="840" loading="lazy" style="width:100%;height:auto" /></a>
<figcaption>Figure 5. Teaching example. Validation routes retain independent states. Missing a required gate prevents closure of that scope, and closure does not grant release authority. <a :href="withBase('/visuals/en/026-agent-spec-evidence-workflow/05-scoped-completion.svg')" target="_blank" rel="noopener">Open full diagram</a></figcaption>
</figure>

Suppose the agreed commitment is an offline adapter and an authorization-denial contract, with live-provider quality assigned to later independent work. Local acceptance can support that bounded deliverable. But if live-provider integration is part of the present commitment, a blocked integration means that portion remains unfinished. Quietly shrinking scope after a failure cannot fulfill the original promise.

The original project uses a separate `spec:close` to run the gates required by the declared route. Checked tasks describe task state, not formal closure. Closeout preparation can finish while retaining `formal close: not-run`. Otherwise, “the task needs a successful close, but closing needs every task checked” creates a circular dependency.

```bash
# Original-project entry points: readiness inspection and actual closure differ
pnpm run spec:close:doctor --change example-change
pnpm run spec:close --change example-change
```

`spec:close:doctor` summarizes static blockers before the first close. It does not run paid models or promote readiness into acceptance. A `provider-free` route supports declared local deterministic and mock contracts, not long-term live-model quality. When a required condition is unmet, preserve the specific gap, repair the affected behavior or wait for the prerequisite. Independent completed work can still be reported within its actual scope.

<div id="three-often-confused-outcomes" aria-hidden="true"></div>

When a successful closure receipt already exists and relevant behavior has not changed, archiving can reuse it, synchronize accepted specs and hand off history according to its actual value. Rerunning everything because a summary was edited usually adds no decision-relevant evidence. Newly required checks in the formal plan, changed inputs or concrete failures still need attention.

**A stopping condition should be explainable when work begins, not invented when it ends.** When current commitments have the support they require, remaining work genuinely lies outside the agreed scope and a successor can inspect the record, the current phase can end. This is the same judgment taught by [multi-phase delivery](/en/principles#method-4) and [verification and failure diagnosis](/en/principles#method-5): define the commitment and evaluate matching evidence instead of pursuing an ever-larger pass count.

## 6. Start with the Smallest Useful Evidence Index

<div id="_8-which-projects-benefit" aria-hidden="true"></div>
<div id="8-which-projects-benefit" aria-hidden="true"></div>

First ask whether the existing PR, CI and test reports answer the questions above. If they do, keep using them. Add a ledger and structural checks only where real handoff cost, scattered evidence or risk boundaries justify them.

<figure style="max-width:640px;margin:2rem auto">
<a :href="withBase('/visuals/en/026-agent-spec-evidence-workflow/06-adoption-boundary.svg')" target="_blank" rel="noopener" aria-label="Open the full diagram in a new tab"><img :src="withBase('/visuals/en/026-agent-spec-evidence-workflow/06-adoption-boundary.svg')" alt="Start with the smallest fit" width="720" height="782" loading="lazy" style="width:100%;height:auto" /></a>
<figcaption>Figure 6. Adoption strength follows coordination needs and risk, not file count. Higher-risk work needs trusted execution and protected acceptance, not merely more Markdown. <a :href="withBase('/visuals/en/026-agent-spec-evidence-workflow/06-adoption-boundary.svg')" target="_blank" rel="noopener">Open full diagram</a></figcaption>
</figure>

A minimal practice can be small: place observable completion criteria next to the requirement; retain the original run pointer, revision and scope during execution; then link the conclusion to those observations and preserve the unknowns. Do not copy every log or create an entire change directory for each spelling correction.

### Where can the public toolkit help?

<div id="_7-extracting-the-portable-part-openspec-evidence-kit" aria-hidden="true"></div>
<div id="7-extracting-the-portable-part-openspec-evidence-kit" aria-hidden="true"></div>
<div id="why-this-is-not-another-acceptance-authority" aria-hidden="true"></div>

We extracted task/observation structure checks, Verify generation and recorded-completion inspection into [OpenSpec Evidence Kit](https://github.com/hpoenixf/agent-engineering-suite/tree/3b515de2f30e25b1e0757243f3ce4d1be19b00b0/skills/aes-spec-flow/toolkit), now maintained as **Spec Flow in Agent Engineering Suite**. The unified repository retains the [historical v0.1.0 release](https://github.com/hpoenixf/agent-engineering-suite/blob/3b515de2f30e25b1e0757243f3ce4d1be19b00b0/docs/legacy/openspec-evidence-kit-releases.json) and [migration records](https://github.com/hpoenixf/agent-engineering-suite/tree/3b515de2f30e25b1e0757243f3ce4d1be19b00b0/docs/legacy). That historical version does not describe the current version or acceptance scope of the entire plugin suite.

Responsibilities remain separate: **runners execute; developers or agents record; the CLI checks structure; the project's existing owners decide acceptance and release**. The kit does not execute your tests, authenticate `observed-run`, judge coverage sufficiency or supply the original project's `spec:close`.

The pinned public source requires Node **26.11.1–26.x**, is MIT-licensed, has no runtime dependencies and needs no database or model key. It also works with ordinary local directories. Its optional [`evidence-driven` schema](https://github.com/hpoenixf/agent-engineering-suite/tree/3b515de2f30e25b1e0757243f3ce4d1be19b00b0/skills/aes-spec-flow/toolkit/schema/evidence-driven) adapts OpenSpec; it does not copy the entire internal `superpowers-bridge`. The [NOTICE](https://github.com/hpoenixf/agent-engineering-suite/blob/3b515de2f30e25b1e0757243f3ce4d1be19b00b0/skills/aes-spec-flow/toolkit/NOTICE.md) attributes related practices, including Superpowers' influence on design and testing.

### Run the bundled example before adopting it

<div id="clone-and-run-the-bundled-offline-example" aria-hidden="true"></div>

These commands pin the source examined for this article rather than relying on future main changes. Skill and plugin installation are covered separately in the [guide for this revision](https://github.com/hpoenixf/agent-engineering-suite/blob/3b515de2f30e25b1e0757243f3ce4d1be19b00b0/docs/installation.md).

```bash
git clone https://github.com/hpoenixf/agent-engineering-suite.git
cd agent-engineering-suite
git checkout 3b515de2f30e25b1e0757243f3ce4d1be19b00b0
cd skills/aes-spec-flow/toolkit
node bin/spec-evidence.mjs lint --root examples --changes-dir changes --change example --stage apply
node bin/spec-evidence.mjs verify --root examples --changes-dir changes --change example
node bin/spec-evidence.mjs verify --root examples --changes-dir changes --change example --check
node bin/spec-evidence.mjs status --root examples --changes-dir changes --change example
```

`verify` creates `examples/changes/example/verify.md`; `--check` compares that view with its inputs. **The example's tasks, observations and completion record are fictional format material.** Reading `recorded-complete` means neither that those checks just ran nor that your project passed acceptance.

<div id="from-one-task-to-an-inspectable-observation" aria-hidden="true"></div>

For your own project, consult the [Spec templates](https://github.com/hpoenixf/agent-engineering-suite/tree/3b515de2f30e25b1e0757243f3ce4d1be19b00b0/skills/aes-spec-flow/toolkit/schema/evidence-driven/templates), [Evidence template](https://github.com/hpoenixf/agent-engineering-suite/blob/3b515de2f30e25b1e0757243f3ce4d1be19b00b0/skills/aes-spec-flow/toolkit/schema/evidence-driven/templates/evidence.md) and [exact field format](https://github.com/hpoenixf/agent-engineering-suite/blob/3b515de2f30e25b1e0757243f3ce4d1be19b00b0/skills/aes-spec-flow/toolkit/docs/evidence-format.md). The following remains a teaching example. Write real records after observing execution, and resolve artifact paths relative to the selected `--root`.

```text
# tasks.md
- [x] 1.1 [check-only] Inspect the cache result file

# evidence.md
## Observation Log
| Date / phase | Evidence ID | Task | Command | Actual result | Artifact | Revision | Origin |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-01-01 CHECK | EV-01 | 1.1 | inspect result.txt | passed: illustrative check | result.txt | demo-revision | observed-run |
```

Ordinary completed tasks require ordered `RED → GREEN` by default. `[check-only]` uses CHECK, `[baseline-green]` uses BASELINE → VERIFY, and `[tests-after]` explicitly records later VERIFY. The author is responsible for selecting a marker; it cannot approve exceptions to project policy or turn historical imports into fresh observations.

After placing real files under `openspec/changes/cache-fix/`, run from the target project directory:

```bash
AES_ROOT=/absolute/path/to/agent-engineering-suite
node "$AES_ROOT/skills/aes-spec-flow/toolkit/bin/spec-evidence.mjs" lint --change cache-fix --stage plan
node "$AES_ROOT/skills/aes-spec-flow/toolkit/bin/spec-evidence.mjs" lint --change cache-fix --stage apply
node "$AES_ROOT/skills/aes-spec-flow/toolkit/bin/spec-evidence.mjs" verify --change cache-fix
node "$AES_ROOT/skills/aes-spec-flow/toolkit/bin/spec-evidence.mjs" verify --change cache-fix --check
node "$AES_ROOT/skills/aes-spec-flow/toolkit/bin/spec-evidence.mjs" status --change cache-fix
```

`plan` checks task labels and duplicate IDs. `apply` checks completed-task phase records and local artifacts. `verify` creates an input-digest-bearing view when tasks and observations are usable, while protecting handwritten files and path scope. `status` is narrower: it reads task state and the project's authored `completion.json`, preserving the original date, revision and route. It does not rerun checks, revalidate old artifacts or determine whether current source remains covered.

For the entire suite and module relationships, see the [Agent Engineering Suite introduction](/en/articles/agent-engineering-suite). Adopt the part that reduces a real handoff burden; the complete workflow is not a prerequisite.

---

Engineering cannot make every judgment certain. The practical value of evidence is keeping uncertainty visible through handoffs, summaries and closure, instead of quietly rewriting it as established fact. It helps us recognize both when work cannot yet be called complete and when the available evidence is enough to end the current commitment.

The [original Chinese URL](https://hpoenixf.com/eff-agent-article/articles/026-agent-spec-evidence-workflow) and [complete English edition](https://hpoenixf.com/eff-agent-article/en/articles/026-agent-spec-evidence-workflow) are retained. Source and engineering discussion live in the [GitHub collection](https://github.com/hpoenixf/eff-agent-article); stars welcome.
