# Agent Engineering Suite: Connecting Requirements to Release

> This article describes a [fixed public revision of Agent Engineering Suite](https://github.com/hpoenixf/agent-engineering-suite/tree/3b515de2f30e25b1e0757243f3ce4d1be19b00b0). Background report generation is a synthetic teaching example of the workflow; the installation statements below describe actual controlled verification.

An Agent writing a piece of code does not finish the engineering work. Several harder questions remain: does the change solve the original problem? Why was this design chosen? Were the failure paths checked? Can another executor continue after the conversation changes?

We have brought the decision interviews, specification workflow, architecture deepening, code review, History, documentation maintenance and maturity assessment used in our projects into one repository: [Agent Engineering Suite](https://github.com/hpoenixf/agent-engineering-suite). The separately published Spec and History tools are sources for this consolidation, rather than reasons to create two more implementations. Each component has value on its own. Their combined value should show up in how a task passes from one stage to the next, not in the number of plugins.

**The suite is meant to preserve the relationship between questions, decisions and evidence.** Code can change and plans can evolve, but continuing the work should not depend on an Agent remembering what the previous conversation said.

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

There is already an independently published foundation here. The original OpenSpec Evidence Kit supplies structural Spec checks and evidence views, now incorporated into the public suite. It checks the structure of records and agreements; it cannot prove on someone's behalf that a real execution occurred. The unified suite retains that boundary instead of presenting a checking command as automatic acceptance.

## 2. Architecture Deepening and Code Review Answer Different Questions

Having a Spec is still not a reason to immediately add a “unified task manager.” First inspect who already owns task state, persistence and the decision to expose a result to the user.

If those responsibilities already have clear owners, the new feature should reuse them. Otherwise, a small feature can introduce a second task state machine, a second authorization check and a second publication path. Individual modules may look small while the system becomes harder to understand.

Architecture deepening examines these boundaries. Can an interface become simpler while a coherent business responsibility moves inside the appropriate module? Which forwarding layers carry no real responsibility? Which duplicated state should disappear? Progress is not measured by the number of abstractions introduced, nor must every project converge on the same architecture.

Code review examines a particular change along two other axes: whether it meets engineering standards and whether it implements the agreed behavior.

For our report task, an implementation can be tidy yet omit an access check during recovery. Another can cover the feature while distributing state transitions across three callers. The first is closer to a contract gap; the second is a structural problem. Distinguishing them makes findings actionable instead of producing vague recommendations to “optimize the design.”

Either review can trigger the other, but they should not stand in for each other. A small fix does not always need a repository-wide refactor. An architecture problem does not disappear merely because the current diff contains no obvious mistake.

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

## 4. History Preserves Decisions; Documentation Helps People Use Them

After implementation, the easiest thing to lose is the reason behind it. Weeks later, someone may notice that cancellation preserves a completed file, consider it leftover data, and remove it. Another executor may see a repeated access check during recovery and assume the earlier check makes it redundant.

History should retain the original constraints, rejected alternatives, evidence that changed a decision and remaining questions. It need not retain every tool response. Private data, raw logs and temporary credentials should not become project knowledge.

Recording decision rationale is not a new invention. [Architectural Decision Records](https://adr.github.io/) already emphasize reasons, trade-offs and consequences. The additional concern here is continuity in Agent work: a later executor should be able to find a decision, understand the version it describes, and see whether another decision has superseded it.

The original Engineering History Skill's initialization, candidate recording, validation and snapshot tools, including protection for manually maintained regions, are also included in the public suite. Deciding whether a candidate deserves to become lasting history still requires judgment. Tools can protect recording boundaries without assigning significance to the material. They do not automatically access private Agent conversations or summarize every experience for the user.

Usage documentation has a different responsibility. Users need to know how to submit, cancel and inspect a report, and what changes during an upgrade. Contributors need to know who owns the state and where to make changes. Neither group should have to read the entire design history first.

Documentation synchronization and cleanup must therefore do two things: describe current behavior at the right entry point, and mark, migrate or remove obsolete and duplicated guidance. Before cleanup, check references, current use and recoverability. An old acceptance record may still be needed; age alone does not make it disposable.

What remains should be knowledge that supports continued work, rather than an ever-growing log archive.

## 5. Why Maturity Assessment and the Roadmap Are Separate

Maturity assessment asks where the project's capabilities stand today. The roadmap asks why a particular task should come next and what would make it complete.

For background reports, assessment might find evidence for access isolation and restart recovery, while failure handling with the real service remains weak. The roadmap can turn that observation into a next task with an owner, dependencies, blockers and acceptance conditions.

The two modules should share evidence without sharing a simplistic completion switch.

A higher overall score does not establish that report recovery is fixed. A lower score can also reflect a broader evaluation scope or newly examined scenarios. Turning scores directly into progress percentages produces an appearance of precision while obscuring the actual work remaining.

That is why the Roadmap is a separate module. It maintains stable item identities as ideas move through evaluation, specification, implementation, verification and acceptance. Rejected or deferred items retain their rationale. Assessment supplies observations; the roadmap turns them into traceable choices. Completion remains tied to each item's acceptance conditions.

Sharing evidence does not require building a large management platform. Versioned, reviewable repository files can connect these modules initially, avoiding the need to build another engineering-management system before doing the engineering.

The public maturity module provides only generic assessment criteria, deterministic calculators and synthetic examples. It contains no private project paths, responsibility mappings or current baseline. Users supply their own assessments and evidence. Public scales have independent identities and are not directly comparable with private historical scales. Correct arithmetic does not establish a correct assessment. The Roadmap currently provides an independent working method and item templates, not a project-specific state validator or automatic closure process.

## 6. One Repository, Two Forms

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

## 7. Initiative Must Not Expand Authorization

The more continuously an engineering tool can work, the more clearly it needs to know where to stop.

Reading code, proposing changes, running local checks, writing repository files, pushing remotely and publishing publicly are separate operations. An instruction to “keep making progress” should not grant all of them. External model calls must likewise respect the project's existing data scope and spending limits rather than opening paid services in the name of acceptance.

Cleanup follows the same rule. A module can identify redundancy and prepare a reviewable plan, but it should not classify files of unknown purpose as trash. A backup must be checked for coverage; a local commit identifier cannot establish that all work is safe.

Provenance and licensing form another boundary. Some methods adapt existing open-source practices. Publication must retain upstream attribution and licenses and establish redistribution rights. Being able to use a private plugin does not mean all its source material may be made public. Material with unresolved rights should be excluded or independently rewritten first.

The suite earns trust through what it helps complete, and through its ability to state accurately what remains incomplete and which operations are not authorized.

## 8. Start Where Your Workflow Breaks

You do not need to replace your entire development process to adopt the suite.

If requirements repeatedly turn out to mean different things halfway through implementation, start with Grilling and Spec Flow. If the code keeps expanding and small changes touch many modules, start with architecture deepening and then review the specific changes. If a new conversation cannot continue the task, organize History and handoff first. If there is plenty to do but no clear next step, use maturity assessment to identify gaps and the Roadmap to order them.

For the background-report example, the deliverable is more than runnable code. It includes a clear behavioral contract, checked recovery and cancellation paths, usable documentation and a basis for subsequent improvement. Release maintenance then checks whether these entry points describe the same version and whether upgrade guidance matches the actual compatibility boundary.

Creating capabilities moves a project forward; maintenance and upgrades allow it to keep moving. The suite is being assembled so that each step leaves something the next executor can use. Verify that connection through one real task first, then expand adoption, rather than requiring every Agent to perform an elaborate ritual from the start.


For the underlying Spec and History mechanisms, see [the evidence-driven development workflow](/en/articles/026-agent-spec-evidence-workflow) and [engineering knowledge maintenance](/en/articles/027-agent-context-document-history).
