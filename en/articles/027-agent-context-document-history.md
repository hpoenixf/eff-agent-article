---
title: "Documentation Is Not Meant to Be Read All at Once: On-Demand Agent Knowledge and Engineering History"
description: "Hot/Warm/Cold document routing, authoritative knowledge, History promotion and Handoff for long-running coding agents."
---

# Documentation Isn't Meant to Be Read in Full: How We Designed On-Demand Loading and Long-Term Engineering Memory

As a project grows, its documentation almost always expands. It begins with a README, then acquires architecture designs, contracts, test strategies, incident reports, agent work instructions, and months of dated history.

That growth is useful. The problem is that a Coding Agent may interpret “documentation matters” as “read every document before doing any work.”

Imagine a task to fix one frontend interaction, and an agent that first reads the investment model, every Runtime document, the entire project history and every archived Spec. It has consumed a great deal of context, but it may not be closer to solving the UI issue.

More dangerously, the context now mixes currently binding rules, retracted proposals and outdated handoffs. **More context does not guarantee more accurate engineering facts.**

We separated the document workflow into two questions: **how should an agent find the knowledge required for this task, and how should the lessons learned during the task remain useful to future agents?**

## 1. Turn AGENTS.md Back from an Encyclopedia into a Map

The easiest solution is to place all important knowledge in AGENTS.md. That prevents omissions, but incurs a fixed context cost regardless of whether the current task needs it.

When several subagents independently investigate, review and test, the redundant fixed reading cost scales with the number of roles.

We redefined the root work instruction accordingly: **global guidance stores cross-task invariants and navigation; domain documents own detailed knowledge**.

The authoritative source of investment data, permissions and confirmation boundaries should be discoverable to every task. A particular MCP provider's fallback for a missing field does not need to occupy every frontend context.

A simplified route table:

| Task area | Primary reading entry |
| --- | --- |
| Frontend interaction | Frontend task pack and relevant UI contracts |
| MCP and data sources | MCP task pack, current interface contracts and adapters |
| Investment computation | Core investment invariants and current calculation contracts |
| Agent Runtime | Runtime architecture, relevant Spec and tests |
| Historical regression | Current call path, then only necessary historical records |

Knowledge is not deleted; **when it enters context** changes.

## 2. Hot, Warm and Cold: Three Reading Temperatures

We introduced Hot/Warm/Cold routing for development context:

~~~mermaid
flowchart TD
  T["Task request"] --> H["Hot global rules"]
  H --> D["Domain router"]
  D --> W["Warm task pack"]
  W --> S["Current Spec"]
  S --> C["Relevant code"]
  C --> I["Scoped implementation"]
  I --> E["Need escalation?"]
  E --> K["Cold History"]
  E --> V["Focused verification"]
  K --> V
~~~

The chart does not mean every task must enter Cold. Ordinarily the agent reads the Hot entry and matching Warm pack, finds current specs and code, and expands into history only for cross-domain issues, ownership disputes or difficult regressions.

### Hot: Small Constraints That Cannot Be Ignored

Hot holds fundamental work invariants, bootstrap instructions and entry navigation. It tells an agent what sort of project it is in, what it must never violate and where to look next.

It is not an encyclopedia of every module's current status.

### Warm: Knowledge Matched to the Task

Warm contains domain-oriented packages—for frontend, MCP, Memory, governance, testing and observability.

The agent first reads a primary pack matching the task and expands along the actual code call path and change scope. A cross-domain task may load a second pack. There is no requirement to read every domain manual from scratch.

### Cold: Important but Not Loaded by Default

Cold mainly contains superseded Specs, archived history, large evaluation outputs and obsolete experiments.

Cold does **not** mean worthless. It means temporally specific or useful only for targeted diagnosis.

When investigating a recovery regression, reading its earlier design and original evidence may be justified. An ordinary component styling change generally does not need that history.

Anthropic's [Effective Context Engineering for AI Agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) also discusses context selection. Our application of the same underlying idea targets **a development agent reading project files**, not an assumption that making every repository document permanent context increases accuracy.

### What Was Actually Measured?

In an August 2026 context-governance iteration, two resident Agent instruction files fell from **442 lines to 164 lines**, and the routing structure and focused tests were recorded.

That measures the file size of the resident entry guidance at that time. It does **not** prove that paid token usage fell proportionally or that long-term engineering speed improved by a known percentage.

The more meaningful design change was moving from “read all background first” to “select the domain, read precise current contracts, expand only if needed.”

## 3. After Finding a Document, Determine What It Can Prove

Loading context is only the first challenge. **When documents disagree, which one owns the current fact?**

Imagine a proposal choosing approach A, a later design review choosing B, and code implementing only part of B. Weeks later, a new agent finds the original proposal. Treating “once suggested” as “already implemented” leads to wrong changes.

So we distinguish document responsibilities instead of merely sorting files by module:

| Material | Primary question it answers |
| --- | --- |
| Work instructions and domain model | What invariants and domain concepts must be respected? |
| Accepted Spec | What behavioral contract is currently accepted? |
| Active Change | What behavior is being changed now? |
| Current code and configuration | What does this revision actually execute? |
| Tests and execution evidence | What was observed on which version and environment? |
| ADR and architecture docs | Why were responsibilities divided this way? |
| History | What happened at the time, and which lessons may be reusable? |
| Handoff | How far had execution progressed when work was transferred, and what was next then? |

This is not one universal hierarchy in which one document category always overrides all others. Authority depends on the question.

For runtime behavior, examine real wiring and code. For an accepted contract, consult the accepted Spec. For why approach A was rejected, consult design records or History.

[Diátaxis](https://diataxis.fr/start-here/) distinguishes tutorials, how-to guides, reference and explanation by reader needs. Our categories share its concern for purposeful documents but emphasize **contract authority, version time and execution state** during ongoing development rather than adopting its four forms unchanged.

Once an agent understands what a source is authoritative *for*, search results are less likely to disguise old decisions as current instructions.

## 4. History Should Not Become Another Giant Event Log

Continuous multi-agent development creates another form of documentation bloat.

Every fix, test and formal closure seems to deserve a retrospective. Retaining all of them verbatim leads to repeated entries: RED today, GREEN tomorrow, regression the next day, Close afterward, and a follow-up correction later. Future agents must wade through all of this to identify the one event that changed engineering judgment.

We created several levels of history.

### Candidate: A Cheap Buffer for Potentially Valuable Material

When a task suggests a reusable lesson but evidence is incomplete or the topic is not independently valuable, it may leave a concise Candidate.

Candidate is **not formal history**. Nor must every task generate one. Formatting work, repeated checks or maintenance with no new judgment can create no Candidate at all.

### Time: What Actually Happened Then

An official Time entry is a traceable historical narrative containing context, key judgment, actual outcome and evidence limits.

It is not promoted automatically because “tests passed.” The questions are: Is there a new, non-obvious engineering decision? Can future engineers use it? Is there enough evidence? Does existing History already cover the lesson?

Time owns the historical event, not the current code or accepted specification.

### Daily: Preserve Only Meaningful Changes Within a Day

Daily is not a mirror of every Time document. It compresses several rounds of research, repair, regression and closure on the same topic into a small number of short entries.

If a topic receives four test runs but the enduring lesson remains “distinguish tool transport failure from unavailable source data,” Daily can record that one evolving judgment, its result boundary and a representative Time link—not duplicate all four runs.

### Type: Read the Cross-Time Evolution of a Topic

Daily answers “What happened today?” Type answers “How did the important judgment about this topic evolve over time?”

It retains a core decision, several meaningful stages, representative events and reusable checkpoints.

Another Close operation or change in test counts does not automatically create a new historical phase. Updates are warranted by a genuine new topic, change in core judgment or a better representative case.

The knowledge production and reading pathway is:

~~~mermaid
flowchart TD
  E["Engineering change"] --> L["Evidence ledger"]
  L --> R["Review material for reusable value"]
  R --> N["No History needed"]
  R --> C["Candidate"]
  R --> T["Canonical Time"]
  T --> D["Daily digest"]
  D --> S["Topic summary (Type)"]
  D --> W["Writing discovery"]
  S --> W
  W --> H["Read original historical evidence"]
  H --> V["Verify current facts"]
  V --> A["Technical article"]
~~~

The branches are intentional. Material with no long-term relevance need not be promoted. Potential lessons with inadequate support may become Candidates. Material demonstrating a reusable engineering judgment may become Canonical Time.

Daily and Type are **compressed navigation layers**, not competing copies of authoritative facts.

## 5. Example: What Should Remain After Fixing a Document Reader?

Suppose an agent knows a web page but cannot resume reading it through the original source identity.

This is a simplified teaching scenario, not a full replay of a specific production incident.

**Step one: read current facts.** The agent enters the Web research domain through work guidance, locates current Spec, implementation and tests. It does not scan the entire month's web incidents first.

**Step two: consult history if the cause requires it.** If the source-identity design is unclear, navigate from Type to relevant representative Time entries. Historical cases suggest diagnostic hypotheses but do not prove the code still behaves the same way.

**Step three: run focused verification.** After changing the behavior, record actual RED/GREEN results, revision and outputs in this change's Evidence Ledger. Any live-model quality check not run remains explicitly unverified.

**Step four: decide whether to preserve a lesson.** If the fix is for a known fault already explained in History, add the evidence without producing a duplicate historical essay. If it reveals a genuinely new source-identity confusion with reusable judgment and support, promote it to Time; compress into Daily; update Type only if that topic's core explanation changes.

The next agent can navigate from the topic summary to representative history, then return to current code to verify.

**History helps the next agent know what to inspect sooner. It should not dictate what code must be changed today.**

## 6. Handoff and History Are Different Types of Memory

Long-term Agent collaboration also requires a special distinction for **Handoff**.

History explains why something was designed a certain way and what happened previously. Handoff preserves **executable task state at the moment of transfer**.

A useful Handoff identifies the current task and specification, branch/worktree at that moment, modified files, actual test receipts, remaining blockers, next concrete command and protected areas outside the task's scope.

A dated Handoff is not the current state forever. The receiver must inspect the current worktree, task queue and Evidence Ledger again. “Run X next” from two weeks ago does not establish that running X is still correct today.

This supports two different needs:

- **Short-term continuity:** work can resume after one agent pauses.
- **Long-term reuse:** months later, another agent can understand a design decision unrelated to its present task.

Making one document own both creates a long, ambiguous and constantly edited file.

## 7. Why We Didn't Put All Documentation in a Vector Database First

As repository knowledge grows, a natural proposal is to embed everything and let the agent semantically search.

That can improve discovery. It cannot solve the central authority problem: semantic similarity does not tell us whether a document is an old Proposal, withdrawn design, current contract or experimental snapshot.

Engineering tasks also come with structured clues: module, error code, Spec name, path, task ID and test command. For those targets, simple routing and exact reads are relatively cheap and interpretable.

We therefore started with navigation, task packs and compressed history. Semantic retrieval can be added where cross-domain discovery is demonstrably difficult, but should initially own **candidate discovery**, not the current authority of its results.

This is a scope decision, not an objection to RAG as a technique.

## 8. Better Preservation Requires Stronger Stopping Rules

The system still needs maintenance. Routes can become stale, task packs must follow interface changes, major decisions must update current docs, and history promotion needs judgment.

But we explicitly avoid generating History for every Change, editing Daily after every test or updating Type whenever a topic is mentioned.

Technical writing follows the same funnel: find promising topics in Daily/Type, read a small set of representative Time entries to understand the original reasons, then verify against current Specs, code and tests. Earlier articles can help deduplicate themes but cannot replace checking current implementation.

Our resulting responsibility model is:

**Maintain current rules in authoritative locations; load documentation on demand; save actual executions as Evidence; selectively preserve lasting lessons; let future agents rediscover and verify those lessons from compressed entry points.**

We observed much smaller resident instruction files and implemented routing conventions in historical samples. Cross-project token savings, long-term engineering time and error-rate improvements remain unmeasured; they cannot be inferred from line counts.

For long-lived Coding Agent projects, I would not begin by demanding the agent “remember everything.” I would first teach it three things: **what to read, which source to trust for which question, and what deserves to be preserved**.

---

Also published on the [personal blog](https://hpoenixf.com/blog/027-agent-context-document-history). More engineering practice is available in the [GitHub collection](https://github.com/hpoenixf/eff-agent-article); stars welcome.
