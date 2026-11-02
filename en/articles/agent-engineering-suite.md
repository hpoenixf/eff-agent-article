---
readingBrief:
  takeaways:
    - "Engineering continuity needs explicit handoffs between decisions, tasks, evidence, and next steps; the suite complements Git, CI, and project acceptance rather than replacing them."
    - "Spec, History, Maturity, and Roadmap own different questions: promised behavior, decision rationale, current assessment, and next work. Structural checks cannot substitute for semantic judgment."
    - "The nine modules are optional and share one implementation across packaging forms; bounded installation checks establish neither model quality nor permission to publish."
  appliesTo:
    - "Projects coordinating multi-agent or multi-session engineering with durable decisions, revision-specific evidence, and explicit handoffs."
  notFor:
    - "Not an autonomous scheduler, acceptance authority, or release platform; small edits do not need the entire suite."
---
# Agent Engineering Suite: Connecting Requirements to Release

> This article describes a [fixed public revision of Agent Engineering Suite](https://github.com/hpoenixf/agent-engineering-suite/tree/3b515de2f30e25b1e0757243f3ce4d1be19b00b0). Background report generation is a synthetic teaching example of the workflow; the installation statements below describe actual controlled verification.

An Agent quickly implements a background-task endpoint. The tests pass and the README is updated. In the next conversation, however, another Agent cannot tell whether cancellation should stop computation or merely hide the result. It finds an old proposal and restores a design that was deliberately abandoned. Eventually the project receives a higher maturity score, while the roadmap item for restart recovery still lacks real acceptance.

This is a synthetic scenario, but it poses a concrete engineering question: **as writing code becomes easier, who owns the gaps between requirements, implementation, evidence and the next action?** A correct local result may still fail to connect to the outcome a user needs. With multiple Agents, communication alone is not enough. They must distinguish whether the material they exchange is a requirement, a hypothesis, an observation or an accepted conclusion.

We have brought the decision interviews, specification workflow, architecture deepening, code review, History, documentation maintenance and maturity assessment used in our projects into one repository: [Agent Engineering Suite](https://github.com/hpoenixf/agent-engineering-suite). The separately published Spec and History tools are sources for this consolidation, rather than reasons to create two more implementations. Each component has value on its own. Their combined value should show up in how a task passes from one stage to the next, not in the number of plugins.

**The suite is meant to preserve the relationship between questions, decisions and evidence.** Code can change and plans can evolve, but continuing the work should not depend on an Agent remembering what the previous conversation said.

## The Landscape: Connecting Existing Tools

Issues can hold work items, CI can execute checks, ADRs can explain decisions and Git can preserve changes. None needs to be replaced by this suite. The gaps lie between them: does an issue's completion refer to the current code? Do CI scenarios cover the requirement? Does an old ADR still apply? Why should the next executor trust the previous summary?

Putting all these materials into context gives a model more text without resolving differences in revision, authority and time. Another approach is a long global rulebook that requires every task to perform the entire process. That makes an ordinary fix pay the cost of a full project review.

Agent Engineering Suite uses a smaller combination: retain the project's existing code, tests and work items, and add working methods, record formats and deterministic checks at consequential handoffs. Its distinguishing feature is not an invented term. It separates responsibilities that are easy to confuse and connects them through evidence that can be read back.

[![Agent Engineering Suite landscape: nine modules connect decisions, implementation, evidence and evolution](/diagrams/agent-engineering-suite/01-landscape-en.svg)](/diagrams/agent-engineering-suite/01-landscape-en.svg)

*Figure 1: The modules form a selectable map of engineering work. The groups show relationships between responsibilities, not a mandatory execution order or a background execution system.*

Three threads run through this map. Grilling and Spec Flow turn a problem into implementable decisions. Architecture, Code Review and Workflow's acceptance templates help connect those decisions to an implementation with clear responsibilities. History, Docs Maintenance, Maturity and Roadmap make the result useful later by separately handling experience, entry points, assessment and plans. Workflow is optional navigation, not a central scheduler or a publication authority above the project's existing maintainer.

### Which Gaps Deserve Attention First?

A **goal gap** appears when interpretation gradually replaces the request. A user asks for continuation after restart, but the implementation generates everything again. The happy path can still return a report while cost, side effects and identity semantics change.

An **evidence gap** appears when a fact is used beyond its support. Unit tests on one revision become a claim that the current revision is accepted. A successful command becomes a claim that the user received the file. A simulated model response becomes a claim that the real service is connected. The problem may be misplaced evidence rather than insufficient evidence.

A **knowledge gap** appears when the earlier work cannot be continued. History says only “fixed,” without explaining the rejected alternative. A roadmap becomes a row of checkboxes with no reason for the next item. The next conversation starts the questions and reasoning again, sometimes recreating the old problem.

[![From repeated guessing to continuity: preserve decisions, observations and next actions across conversations](/diagrams/agent-engineering-suite/02-failure-loop-en.svg)](/diagrams/agent-engineering-suite/02-failure-loop-en.svg)

*Figure 2: The improvement is not endless verification. It is preserving reusable decisions, observations and next actions at useful boundaries, then stopping repeated checks when no new facts appear.*

## 1. A Small Feature Reveals the Real Work

Suppose an application needs background report generation. A user submits a task, leaves the page, returns to inspect progress, and can cancel the task.

It seems straightforward to ask an Agent to implement it: add an endpoint, connect a task queue, and build a progress component. A few questions, however, expose different designs:

- Should closing the page stop the task or leave it running?
- After cancellation, should an already generated report remain available?
- Following a service restart, does execution resume or start again?
- If the same task is delivered twice, can it produce two results?
- Which boundary ensures users can access only their own tasks?

These answers change the implementation. They should not be left to patches after the code is written. The suite's first entry point brings consequential branches into view earlier.

### Resolve the Decisions, Then Write the Spec

Grilling follows the design tree rather than turning every ordinary detail into a questionnaire. Existing repository conventions should be read first. Details that do not affect a decision can be reasonably inferred. Choices that change authorization, delivery semantics or cost need to be made explicit.

For this example, we might establish a bounded contract: closing the page does not cancel execution; explicit cancellation prevents further generation; completed reports remain readable; recovery cannot bypass current access permissions.

The Spec workflow turns those decisions into inspectable behavior. It need not repeat the whole discussion, but it should retain the goal, non-goals, important scenarios and completion conditions. “Continues after the page closes” and “recovers after a service crash” are separate promises. A broad claim of background execution should not conceal the difference.

The implementation should receive a contract against which behavior can be judged, rather than a plausible summary of the request.

### Keep the Feature from Quietly Becoming Something Else

Suppose this iteration supports one person generating one report at a time, not large-scale multi-tenant scheduling. State that non-goal. Otherwise, an Agent trying to make the feature “more complete” may first introduce organization management, a quota service and a new scheduling layer, turning a small capability into a platform project.

Relevant branches, however, need observable contracts. If cancellation occurs before publication, the late result must not become a success. If it occurs after completion, reading the existing report remains possible. If a crash happens between writing the file and registering the result, recovery must recognize the original task rather than create another delivery. These are choices for our example, not universal answers for every product.

A minimal implementation plan might therefore have three stages: task identity and result reading, cancellable execution, then cross-process recovery. Staging does not silently reduce the final commitment. It makes clear what each stage delivers and what remains. Spec Flow can preserve and check the stage materials; it does not decide whether the staging is appropriate for the product.

[![Synthetic background-report journey: decisions, implementation, acceptance and a result the user can obtain](/diagrams/agent-engineering-suite/03-task-journey-en.svg)](/diagrams/agent-engineering-suite/03-task-journey-en.svg)

*Figure 3: Progress follows the outcome. Failure and cancellation return to the relevant responsibility rather than unconditionally restarting everything. A readable file, completed code and accepted behavior remain distinct facts.*


There is already an independently published foundation here. The original OpenSpec Evidence Kit supplies structural Spec checks and evidence views, now incorporated into the public suite. It checks the structure of records and agreements; it cannot prove on someone's behalf that a real execution occurred. The unified suite retains that boundary instead of presenting a checking command as automatic acceptance.

## 2. Architecture Deepening and Code Review Answer Different Questions

Having a Spec is still not a reason to immediately add a “unified task manager.” First inspect who already owns task state, persistence and the decision to expose a result to the user.

If those responsibilities already have clear owners, the new feature should reuse them. Otherwise, a small feature can introduce a second task state machine, a second authorization check and a second publication path. Individual modules may look small while the system becomes harder to understand.

Architecture deepening examines these boundaries. Can an interface become simpler while a coherent business responsibility moves inside the appropriate module? Which forwarding layers carry no real responsibility? Which duplicated state should disappear? Progress is not measured by the number of abstractions introduced, nor must every project converge on the same architecture.

Code review examines a particular change along two other axes: whether it meets engineering standards and whether it implements the agreed behavior.

For our report task, an implementation can be tidy yet omit an access check during recovery. Another can cover the feature while distributing state transitions across three callers. The first is closer to a contract gap; the second is a structural problem. Distinguishing them makes findings actionable instead of producing vague recommendations to “optimize the design.”

Either review can trigger the other, but they should not stand in for each other. A small fix does not always need a repository-wide refactor. An architecture problem does not disappear merely because the current diff contains no obvious mistake.

### Deepening Does Not Mean Hiding Everything in a Large Class

“One owner” can also be misused. A manager might absorb the queue, file storage, permissions, rendering and notifications to centralize state. Callers lose a few lines while the manager loses its internal boundaries. Architecture deepening asks which stable responsibility an interface contains and whether callers must still understand its internal steps. It is not a large object concealing all complexity.

In this example, the task lifecycle can decide whether publication is still allowed. File storage remains responsible for writing and reading files, and access control for who may access them. When cancellation meets a late result, one explicit boundary should decide result eligibility rather than leaving the UI, callback and recovery process to guess separately. A useful interface lets callers express intent without assembling a mysterious sequence of state mutations.

Code review then checks whether the design was actually followed. Pin the review's starting point and trace the same contract through the normal and recovery entry points. Find specific counterexamples and callers rather than scoring the architecture from class names. Each finding should identify the triggering condition, violated agreement and repair direction. When there is only a potential risk, preserve that evidence identity instead of presenting it as an observed incident.

The modules can form a short feedback loop: a review discovers that callers maintain a second state; architecture analysis identifies the duplicated responsibility; the change is checked again against the same contract. Where boundaries already work, fix the current defect without manufacturing a refactor to demonstrate “architecture deepening.”


## 3. Acceptance Follows the User Path Beyond Code Checks

The happy path is easy to demonstrate: submit a task, wait for completion, and download the report. A more revealing path is a service exit during execution, followed by recovery and cancellation, while an old executor eventually returns a result.

In this synthetic scenario, the questions are specific:

1. Does cancellation prevent the old result from being published as a new success?
2. Does recovery retain the correct task identity instead of silently creating another execution?
3. Does report access still respect current permissions?
4. Can repeated requests cause duplicate delivery?

Synthetic data and controlled faults can check these behaviors first. That is useful evidence. If the feature also depends on an external model or service, its integration needs separate acceptance. A simulated response is not proof that the real service is connected, and a model returning text is not proof that the user received a file.

The first version's Workflow entry therefore provides acceptance, release and handoff templates. They help record what was implemented, where it was checked, what remains, and which code revision the observations describe. These templates do not introduce another test runner or automatic release orchestrator. Existing project processes still execute checks and accept changes; an executor saying “done” does not automatically archive the task.

The evidence can be small. A record of the input conditions, operation, observable outcome and corresponding revision is more helpful here than a long list of passing checks. If a later fix changes recovery logic, that record also identifies conclusions that need to be revisited.

### What Can a Deterministic Tool Actually Tell Us?

The retained Spec CLI offers a direct example. The following command uses the repository's fictional format fixture, requiring no model, database or real business data. From a retrieved suite source directory, run:

```bash
node skills/aes-spec-flow/toolkit/bin/spec-evidence.mjs lint \
  --root skills/aes-spec-flow/toolkit/examples \
  --changes-dir changes --change example --stage apply
```

The actual execution for this article returned:

```json
{
  "change": "example",
  "stage": "apply",
  "issues": [],
  "structuralOnly": true,
  "semanticQuality": "unverified"
}
```

This small response is more precise than “everything passed.” It says the example's task and observation structure meets the rules; it does not claim the background-report feature exists. Reading the fixture's `status` then reports `recorded-complete`, alongside `rerun: false` and `release: not-claimed`: the tool found an authored completion record. It did not rerun historical checks or obtain permission to release.

The implementation and fixture are available in the [Spec CLI](https://github.com/hpoenixf/agent-engineering-suite/blob/3b515de2f30e25b1e0757243f3ce4d1be19b00b0/skills/aes-spec-flow/toolkit/bin/spec-evidence.mjs), [evidence format](https://github.com/hpoenixf/agent-engineering-suite/blob/3b515de2f30e25b1e0757243f3ce4d1be19b00b0/skills/aes-spec-flow/toolkit/docs/evidence-format.md) and [synthetic example](https://github.com/hpoenixf/agent-engineering-suite/blob/3b515de2f30e25b1e0757243f3ce4d1be19b00b0/skills/aes-spec-flow/toolkit/examples/changes/example/evidence.md).

A reusable evidence directory need not be elaborate. The Spec describes the contract and tasks. `evidence.md` preserves observations and artifact locations. A generated Verify view organizes those inputs. An optional project-authored `completion.json` preserves a completion decision already made. A generated view must not become the source of its own observations, and missing results must not be invented to produce a green status.

For the report feature, a bounded record could say: “On revision X, trigger generation with a synthetic task, interrupt after the file write, then resume; the same task exposes one file.” That is narrower than “recovery complete,” but tells a future executor which path to examine. If access control subsequently changes while recovery code stays untouched, someone must still decide whether the old test covers the new permission boundary. File modification times alone cannot answer that.

[![Material responsibilities: contracts, implementation, observations, explanations, assessment and action remain distinct](/diagrams/agent-engineering-suite/04-evidence-ownership-en.svg)](/diagrams/agent-engineering-suite/04-evidence-ownership-en.svg)

*Figure 4: Different materials answer different questions. Revisions and references connect them, but no single summary replaces all the sources.*

### Handoffs Need Contracts Too

A cross-Agent handoff should at least retain the goal, scope, current revision, actual artifacts, unresolved problems and permitted next action. When other writers are active, identify file or module ownership. When the remaining allowance for a paid service is unknown, preserve that unknown rather than resetting the accounting. These are work boundaries, not a reason to expose private task histories or account details.

Workflow helps ask the right handoff questions and supplies reusable fields. It cannot automatically determine that a result was genuinely consumed, nor can a template authorize another Agent to publish, delete or call an external service. The receiver must still inspect the current state: a handoff describes the moment it was written, not a permanently live status.


## 4. History Preserves Decisions; Documentation Helps People Use Them

After implementation, the easiest thing to lose is the reason behind it. Weeks later, someone may notice that cancellation preserves a completed file, consider it leftover data, and remove it. Another executor may see a repeated access check during recovery and assume the earlier check makes it redundant.

History should retain the original constraints, rejected alternatives, evidence that changed a decision and remaining questions. It need not retain every tool response. Private data, raw logs and temporary credentials should not become project knowledge.

Recording decision rationale is not a new invention. [Architectural Decision Records](https://adr.github.io/) already emphasize reasons, trade-offs and consequences. The additional concern here is continuity in Agent work: a later executor should be able to find a decision, understand the version it describes, and see whether another decision has superseded it.

The original Engineering History Skill's initialization, candidate recording, validation and snapshot tools, including protection for manually maintained regions, are also included in the public suite. Deciding whether a candidate deserves to become lasting history still requires judgment. Tools can protect recording boundaries without assigning significance to the material. They do not automatically access private Agent conversations or summarize every experience for the user.

Usage documentation has a different responsibility. Users need to know how to submit, cancel and inspect a report, and what changes during an upgrade. Contributors need to know who owns the state and where to make changes. Neither group should have to read the entire design history first.

Documentation synchronization and cleanup must therefore do two things: describe current behavior at the right entry point, and mark, migrate or remove obsolete and duplicated guidance. Before cleanup, check references, current use and recoverability. An old acceptance record may still be needed; age alone does not make it disposable.

What remains should be knowledge that supports continued work, rather than an ever-growing log archive.

### Make Records Concrete Without Promoting Every Record

History's four layers create a progressively more focused reading path. Candidate is an inexpensive material buffer. Time preserves a useful decision. Daily selects what genuinely changed understanding during a day. Type helps readers follow one subject across time. An ordinary formatting change may never enter this chain. Repeated tests with no new lesson need not produce a new historical account every day.

In our example, “added a cancel button” may not deserve lasting history. “Cancellation changes future task effects without deleting a report the user already obtained; recovery still checks current access permissions” may deserve preservation because it explains a boundary future maintainers could accidentally remove. Humans or Agents judge importance. The CLI handles more deterministic matters: identity, dates, file links and manual-content protection.

Here is a reproducible minimal path. Run it in a dedicated synthetic example directory rather than adding teaching records to a real project's history:

```bash
AES_ROOT=/absolute/path/to/agent-engineering-suite
node "$AES_ROOT/skills/aes-history/scripts/cli.mjs" init
node "$AES_ROOT/skills/aes-history/scripts/cli.mjs" candidate \
  --task "Synthetic cancellation ownership" \
  --summary "Teaching example: cancellation and publication need one task identity; no application execution claimed." \
  --source-id "demo:report:cancel-1"
node "$AES_ROOT/skills/aes-history/scripts/cli.mjs" validate
```

This article's actual run used a separate synthetic directory. `init` created indexes under `docs/history/`; `candidate` returned `status: written` with a record path under `.work/history-candidates/`; `validate` returned `status: valid`. This checks the recording tools, not implementation of that cancellation policy in an application. A stable `source-id` supports retries without presenting the same experience repeatedly as new progress.

The recording and protection entry points are the [History Skill](https://github.com/hpoenixf/agent-engineering-suite/blob/3b515de2f30e25b1e0757243f3ce4d1be19b00b0/skills/aes-history/SKILL.md) and its [bundled CLI](https://github.com/hpoenixf/agent-engineering-suite/blob/3b515de2f30e25b1e0757243f3ce4d1be19b00b0/skills/aes-history/scripts/cli.mjs).

Before updating Daily or Type, take a protected-region snapshot and check that changes stay within the intended maintenance region. Generating a summary must not erase manually supplied context. This connects documentation maintenance and History: one keeps current usage accurate, while the other explains why. When an old entry point retires, preserve useful reasoning without allowing obsolete requirements to keep directing new code.


## 5. Why Maturity Assessment and the Roadmap Are Separate

Maturity assessment asks where the project's capabilities stand today. The roadmap asks why a particular task should come next and what would make it complete.

For background reports, assessment might find evidence for access isolation and restart recovery, while failure handling with the real service remains weak. The roadmap can turn that observation into a next task with an owner, dependencies, blockers and acceptance conditions.

The two modules should share evidence without sharing a simplistic completion switch.

A higher overall score does not establish that report recovery is fixed. A lower score can also reflect a broader evaluation scope or newly examined scenarios. Turning scores directly into progress percentages produces an appearance of precision while obscuring the actual work remaining.

That is why the Roadmap is a separate module. It maintains stable item identities as ideas move through evaluation, specification, implementation, verification and acceptance. Rejected or deferred items retain their rationale. Assessment supplies observations; the roadmap turns them into traceable choices. Completion remains tied to each item's acceptance conditions.

Sharing evidence does not require building a large management platform. Versioned, reviewable repository files can connect these modules initially, avoiding the need to build another engineering-management system before doing the engineering.

[![Maturity and roadmap feedback: assessment supplies observations; actions require independent judgment and acceptance](/diagrams/agent-engineering-suite/05-maturity-roadmap-en.svg)](/diagrams/agent-engineering-suite/05-maturity-roadmap-en.svg)

*Figure 5: A score change cannot directly trigger completion. New evidence can update an assessment; a new delivery task needs its own owner, dependencies and acceptance conditions.*

### A Useful Status Does Not Always Say “Better Than Before”

The public default rubric separately examines contracts, correctness, safety, recovery, operability and user value. It does not automatically compress these dimensions into a universal score. Insufficient evidence can explicitly remain unknown; an implementation not existing is a different fact. Giving both a zero mixes “not yet assessed” with “demonstrably absent.”

A score movement should also explain its cause. It may reflect a product change, newly discovered evidence, a changed assessment scope or correction of an earlier mistake. Within the same scope and rubric, unchanged evidence should not receive a different conclusion merely to display progress. A newly identified public scale must not inherit private scores to manufacture a historical trend.

Roadmap turns a vague wish into an actionable item. The following synthetic item follows the module's example fields. It illustrates a data shape, not a state machine running in the background:

```json
{
  "id": "BL-001",
  "title": "Demonstrate restart recovery",
  "status": "candidate",
  "owner": "project-maintainer",
  "dependsOn": [],
  "acceptance": "Restart preserves identity and does not duplicate an effect",
  "evidence": [],
  "nextAction": "Define representative failure fixture"
}
```

The [public generic rubric](https://github.com/hpoenixf/agent-engineering-suite/blob/3b515de2f30e25b1e0757243f3ce4d1be19b00b0/skills/aes-maturity/references/rubric.json) and [Roadmap item shape](https://github.com/hpoenixf/agent-engineering-suite/blob/3b515de2f30e25b1e0757243f3ce4d1be19b00b0/skills/aes-roadmap/references/item.json) are directly inspectable. Each project still chooses its scope of adoption; example fields are not executed task records.

At this stage, the useful information is the next counterexample to construct, not an estimate that the task is 40 percent complete. If work becomes blocked, preserve both the blocker and any independently useful permitted action. If scope changes, reopening should retain the earlier acceptance record instead of silently rewriting what was once completed. Near-term commitments should be concrete while distant directions may remain uncertain. That keeps the roadmap from becoming a falsely precise schedule.


The public maturity module provides only generic assessment criteria, deterministic calculators and synthetic examples. It contains no private project paths, responsibility mappings or current baseline. Users supply their own assessments and evidence. Public scales have independent identities and are not directly comparable with private historical scales. Correct arithmetic does not establish a correct assessment. The Roadmap currently provides an independent working method and item templates, not a project-specific state validator or automatic closure process.

## 6. One Repository, Two Forms

[![One core source produces four delivery forms: individual and full-suite Skills and plugins](/diagrams/agent-engineering-suite/06-source-packaging-en.svg)](/diagrams/agent-engineering-suite/06-source-packaging-en.svg)

*Figure 6: Four installation choices share the core. Platform adapters and distribution packaging remain separate; fixes should not need repeating across four hand-maintained copies.*

The repository maintains one core source and generates standalone Skills and Codex plugins through build scripts. The current modules are Spec Flow, History, Grilling, Architecture, Code Review, Docs Maintenance, Maturity, Roadmap and an optional Workflow entry. Together they cover the stages in our example. Acceptance and release templates belong to Workflow; they are not an additional runtime platform.

The old Spec and History repositories’ origins, commit histories and release metadata are preserved in the [migration records](https://github.com/hpoenixf/agent-engineering-suite/tree/3b515de2f30e25b1e0757243f3ce4d1be19b00b0/docs/legacy), and existing Chinese and English articles use the unified entry points. Preserved old versions support historical inspection and recovery; they are not another current implementation to maintain.

- **Standalone Skills** suit people who already have a workflow and want to add one capability, such as architecture review or History.
- **Codex plugins** package a module's entry points, instructions and associated resources for the host, reducing manual organization.

Each module has its own package, and a full-suite package is generated from the same source. Installing everything makes selection convenient; it does not require every task to run every module. Fixing a spelling mistake does not need a design interview and maturity assessment.

The consolidation does not simply concatenate existing plugin directories. Some original components depend on platform-specific tools; others contain ETF project paths, criteria and publication habits. The portable version separates project configuration from working methods. The core explains how to identify evidence, hand off work and check boundaries; project configuration supplies directories, commands, domain criteria and authorization. Documentation maintenance, for example, uses a local adapter and a precise cleanup plan. It does not claim to port the original ChatGPT-specific GitHub integration or automatically delete files permanently.

Installing Roadmap alone does not require adopting an ETF scorecard. Choosing a standalone Skill does not silently install every plugin. The installer presents a plan first and makes no changes by default. It does not directly overwrite an existing same-name Skill; updates and removal check the installation receipt and file contents. It also checks overlapping installations within known scopes, but cannot guarantee discovery of conflicts in another remote host or an unknown cache.

On Linux with Codex CLI 0.163.0, the fixed public commit above was fetched through a real Git marketplace. The History-only plugin and full suite were separately installed, listed, compared byte for byte across all installed files, and removed. This establishes that installation path, not model-task quality, compatibility with other platforms or public plugin-store approval.

To start with History, use the verified fixed revision:

```bash
codex plugin marketplace add https://github.com/hpoenixf/agent-engineering-suite.git --ref 3b515de2f30e25b1e0757243f3ce4d1be19b00b0
codex plugin add agent-engineering-suite-history@agent-engineering-suite
```

For the complete suite, use `codex plugin add agent-engineering-suite@agent-engineering-suite` instead; do not overlap it with installed individual modules. See the [installation guide](https://github.com/hpoenixf/agent-engineering-suite/blob/3b515de2f30e25b1e0757243f3ce4d1be19b00b0/docs/installation.md) for standalone Skill plan previews, updates and removal. Skills and plugins use the same core through different installation mechanisms. The [repository homepage](https://github.com/hpoenixf/agent-engineering-suite) is the ongoing maintenance entry.

The [module boundary table](https://github.com/hpoenixf/agent-engineering-suite/blob/3b515de2f30e25b1e0757243f3ce4d1be19b00b0/docs/module-parity.md) identifies retained, adapted and unimplemented capabilities. Read the [Workflow templates](https://github.com/hpoenixf/agent-engineering-suite/blob/3b515de2f30e25b1e0757243f3ce4d1be19b00b0/skills/aes-workflow/references/handoff.md) for the handoff materials rather than assuming a hidden automatic acceptance service.

### Why Four Entry Points Instead of One Archive?

“Individual or full suite” describes adoption scope. “Skill or plugin” describes host integration. They are independent choices. Someone adding History to an established team workflow can use one Skill. Someone who wants Codex to manage discovery and installation can select one plugin. A new project establishing its working methods may benefit more from the full suite.

Source directories retain core Skills and associated scripts; generated directories hold distributable packages. The suite is a version-consistent combination of the same modules, not a stronger capability claim. A repair to file protection should reach both individual and full-suite packages. Their README descriptions must not remain identical while their contents gradually diverge.

The combination has costs. Installing the same module individually and through the suite creates overlapping names. One check on the current machine cannot discover every unknown cache on another host. The installer conservatively rejects conflicts it can identify, checks managed files before updates and preserves user changes. It does not promise atomic rollback of a multi-module write after disk failure; a partial state still needs inspection before proceeding.

The practical rule is to choose one form for each module, inspect the plan, and then apply it. Do not manually patch plugin caches as though they were ordinary source folders. To switch forms, remove the old one through the host's normal mechanism before installing its replacement. These constraints look less impressive than “one-click automation,” but they are concrete protections for long-term maintenance.


## 7. Initiative Must Not Expand Authorization

The more continuously an engineering tool can work, the more clearly it needs to know where to stop.

Reading code, proposing changes, running local checks, writing repository files, pushing remotely and publishing publicly are separate operations. An instruction to “keep making progress” should not grant all of them. External model calls must likewise respect the project's existing data scope and spending limits rather than opening paid services in the name of acceptance.

Cleanup follows the same rule. A module can identify redundancy and prepare a reviewable plan, but it should not classify files of unknown purpose as trash. A backup must be checked for coverage; a local commit identifier cannot establish that all work is safe.

Provenance and licensing form another boundary. Some methods adapt existing open-source practices. Publication must retain upstream attribution and licenses and establish redistribution rights. Being able to use a private plugin does not mean all its source material may be made public. Material with unresolved rights should be excluded or independently rewritten first.

The suite earns trust through what it helps complete, and through its ability to state accurately what remains incomplete and which operations are not authorized.

## 8. Start Where Your Workflow Breaks

You do not need to replace your entire development process to adopt the suite.

A project with clear CI, review and release processes may initially need only Spec Flow's structural checks. Add it as one existing-process step and observe which completion claims become traceable; there is no requirement to rewrite every issue. A fast-moving prototype can begin with Grilling to narrow decisions and short History entries to preserve genuine changes of direction, adding a fuller evidence chain when recovery and authorization become consequential.

For parallel human or Agent development, first establish who owns current changes and final publication. Then use handoff templates to expose conflicts. Do not begin by launching every module to scan the whole repository, and do not let reviewers create competing final-completion states because each saw different materials.

The process itself also needs stopping conditions. An ordinary change with no new design need not produce an ADR. Material without lasting value need not be promoted to History. Without new evidence, do not recompute a superficially different score. The suite should help choose the next useful action and help recognize when there is no reason to do more.


If requirements repeatedly turn out to mean different things halfway through implementation, start with Grilling and Spec Flow. If the code keeps expanding and small changes touch many modules, start with architecture deepening and then review the specific changes. If a new conversation cannot continue the task, organize History and handoff first. If there is plenty to do but no clear next step, use maturity assessment to identify gaps and the Roadmap to order them.

For the background-report example, the deliverable is more than runnable code. It includes a clear behavioral contract, checked recovery and cancellation paths, usable documentation and a basis for subsequent improvement. Release maintenance then checks whether these entry points describe the same version and whether upgrade guidance matches the actual compatibility boundary.

Creating capabilities moves a project forward; maintenance and upgrades allow it to keep moving. The suite is being assembled so that each step leaves something the next executor can use. Verify that connection through one real task first, then expand adoption, rather than requiring every Agent to perform an elaborate ritual from the start.


For the underlying Spec and History mechanisms, see [the evidence-driven development workflow](/en/articles/026-agent-spec-evidence-workflow) and [engineering knowledge maintenance](/en/articles/027-agent-context-document-history).
