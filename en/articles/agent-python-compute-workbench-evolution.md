---
readingBrief:
  takeaways:
    - "Authorize transient code separately from trusted Skill scripts while sharing maintained research methods; Python expands computational freedom without creating another business-data access path."
    - "Continue through each executor’s own files rather than hidden interpreter state; a rejected request proven not to touch the workspace must not destroy earlier valid outputs."
    - "Previews are not complete datasets, and static diagnostics do not all justify blocking; verify numerical correctness, interpretation and actual artifact delivery as separate outcomes."
  appliesTo:
    - "Building repeated Python analysis and subtask collaboration with explicit file continuity, capacity refusals, source propagation and downloadable artifacts."
  notFor:
    - "Requiring persistent Notebooks or unrestricted network execution, or equating sandbox success and passing preflight with reliably correct complex investment research."
---
# Teaching an Agent to Compute: The Architectural Evolution from Python Tool to Computational Workbench

Imagine asking an AI:

> Compare three ETFs over the last year: return, maximum drawdown, volatility, and charts showing how their behavior differs.

Writing Python for this is no longer a difficult challenge for a modern model. pandas can normalize data, NumPy can calculate metrics, and Matplotlib can create charts. [OpenAI Code Interpreter](https://developers.openai.com/api/docs/guides/tools-code-interpreter) and [Anthropic Code Execution](https://platform.claude.com/docs/en/agents-and-tools/tool-use/code-execution-tool) already provide code execution, iteration, and file outputs.

So why not simply add a **Python execution tool** and declare the Agent capable of flexible analysis?

Our initial motivation was straightforward. ETF Agent already had market data, fund analysis, and established research methods, but user questions change constantly. Comparison windows vary; data needs recombination; new analyses do not always justify dedicated tools.

Python gives the model room to solve what has not been predefined.

The first problem is **safety**. Model-written code must not inherit access to an application server's files, credentials, internal network, or unlimited CPU merely because it is supposed to calculate returns. An Agent working with portfolios and private research material cannot delegate that requirement to a prompt asking for safe code.

We began with isolated execution. As research grew longer, the questions changed: can a later calculation reuse earlier data? What survives a code error? Can multiple Agents overwrite one another's files? How does a generated result reach the user as a real artifact?

Several architectural changes followed. Some expanded the model's freedom; some constrained risk; and some removed excessive protection that was wrongly destroying otherwise valid work.

## 1. Reuse Analysis Methods, Not Their Execution Permissions

ETF Agent already had **run_skill_script**, which executes maintained scripts from trusted Skill packages. A tempting shortcut would have been to write the model's newly generated Python into a Skill directory and invoke that trusted runner.

We rejected that approach. The existing runner trusts code because of its reviewed package origin. Moving transient model code into the same folder does **not** change its trust level.

The important distinction is not "Python versus another language"; it is **reviewed code versus model-generated code**.

We added **run_analysis_python** with a separate, controlled analysis environment. The model may submit temporary code, but it cannot thereby access arbitrary server files, secrets, or networks. Dependencies and runtime resources are prepared and constrained by Host, not installed without limit by the model.

We made another choice: **Python computes; authorized external data still arrives through existing tools**.

For the three-ETF example, the Agent obtains approved data through the original Market/Web capabilities and passes selected results into Python. If the computation reveals a missing time window, the Agent retrieves that data through the original tool path. Python does not secretly open another connection to the market provider or database.

**Figure 1: Relay between data acquisition, isolated computation, and delivery**

~~~mermaid
graph TD
ResearchQuestion --> AgentDecision
AgentDecision --> AuthorizedDataTools
AuthorizedDataTools --> HostInputValidation
HostInputValidation --> IsolatedPython
IsolatedPython --> BoundedFeedback
BoundedFeedback --> AgentDecision
IsolatedPython --> RunWorkspace
RunWorkspace --> LaterPythonCall
LaterPythonCall --> BoundedFeedback
RunWorkspace --> ExplicitExport
ExplicitExport --> DurableArtifact
DurableArtifact --> AuthorizedDownload
~~~

This is a responsibility diagram, **not a compulsory pipeline**. The Agent may collect more information, recalculate, or provide a bounded conclusion. Every later Python invocation still passes current Host admission and source checks. A file's mere existence in a workspace does not make it downloadable.

The design sacrifices the convenience of a script that does retrieval, computation, and external API access all at once. We accept that because the alternative would create a second business-data path with competing permissions and error semantics.

**We wanted more freedom to compute—not an additional data-access system.**

## 2. Flexible Code Does Not Mean Reimplementing Every Formula

General Python solves "what if no dedicated tool exists?" But the converse soon appeared: why have the model rewrite an existing, maintained method?

Our fund-research packages already included risk, attribution, and scenario calculations. At first, the separate analysis environment could not import the shared research library. Copying a few functions would have been easy but dangerous over time.

One copy might fix missing-value behavior while another retains old semantics. A parameter meaning might change on one side but not the other. Both implementations would return plausible figures using subtly different definitions.

We therefore reused the **same research-method source** for trusted Skills and isolated analysis, producing the required artifacts through the existing build process.

This did not turn free-form Python into a rigid calculator. The model can still write temporary normalization, analysis, and composition code. But it need not reinvent maintained methods.

Reusing methodology also does **not** transfer business authority. Python may analyze a hypothetical allocation's risk. Account balances, holdings state, and investment execution continue to follow the original deterministic business Owners.

**Share stable methods; allow temporary analysis; leave authoritative business facts with their original producers.**

## 3. Continuity Does Not Require a Persistent Notebook

An ETF comparison is not necessarily one script. The model may normalize the dates, discover inconsistent return definitions, retrieve missing material, and calculate again.

Discarding all execution state forces repeated work. Keeping one Python interpreter alive indefinitely introduces hidden mutable state and more difficult recovery semantics.

We chose a middle ground:

**Workspace files persist within a healthy analysis session; each execution starts a fresh interpreter.**

A first invocation saves an aligned dataset. A later invocation reads it explicitly. Global variables, imported modules, and in-memory objects do **not** silently survive.

A restarted service or failed analysis session does not promise to reconstruct the temporary workspace by automatically rerunning old code.

This is not a claim that Notebooks are bad. Our immediate need was **intermediate-artifact continuity**, not a persistent kernel, interpreter snapshots, and cross-restart object recovery.

The trade-off is explicit: models must save intermediate results and later reload them, and interpreter/library initialization may repeat.

Files are still not trustworthy merely because they exist. Ownership, writable scope, and invalidation rules remain essential.

### Multiple Agents made the original ownership too broad

At first, the whole research Run owned one analysis session. That fit a single main executor.

After introducing Python subagents, Main and several Child tasks had separate model contexts but could still share the same lower-level session, intermediate files, and source dependencies.

Imagine two Child tasks independently normalizing data and saving **normalized.csv**. This is an **illustrative risk**, not a reported file-corruption incident. They should not share mutable state simply because they belong to the same parent research task.

We narrowed workspaces from root-task ownership to the **actual Host-verified executor identity**.

Each executor can fix its own code and reuse its files. Main and sibling Children cannot directly read or export another executor's workspace. Results cross those boundaries only through explicit handoff.

**Separate model contexts do not automatically separate execution state. And creating logical subagents does not create more physical compute capacity.**

## 4. After Failure, Ask Which Existing Effects Are Still Valid

With persistent intermediate files, an exception is more than an exit code.

A script might write a table and fail while drawing a chart. Did the file persist? Is it complete? Can the next invocation use it?

We did **not** make each Python execution a filesystem transaction, and did not promise automatic rollback. A normal code exception can leave prior writes intact. Continuing is allowed only when execution has definitely ended and the workspace is confirmed usable.

If the code's execution state is unknown, its workspace must not be trusted blindly.

That was a reasonable protective stance—until we found it could be overapplied.

### Why did a request that never ran destroy prior results?

An **October 18** regression reproduced:

1. Task A completed a calculation and saved a file eligible for export.
2. Tasks B and C occupied all available compute slots.
3. Task A requested another invocation.
4. The adapter rejected the new request **before preparing or executing any code**.
5. The session manager misclassified the rejection as uncertain execution and destroyed A's previously healthy workspace.

No new code ran. Old completed work was lost.

The quota rejection was correct; its side effect was not.

We did **not** simply preserve the workspace after every exception or match error-message strings. The execution adapter—the Owner that actually knows whether the workspace was touched—must supply evidence bound to the **specific invocation and workspace**.

When it proves **no dispatch, no touch**, the session may preserve existing results.

Cancellation, exhausted deadlines, mismatched identities, and uncertainty **after execution began** retain their own protective paths.

**Figure 2: Execution facts determine whether the workspace survives**

~~~mermaid
graph TD
AnalysisRequest --> AdmissionCheck
AdmissionCheck --> ProvenNoTouchRejection
AdmissionCheck --> DispatchedExecution
ProvenNoTouchRejection --> PreserveExistingWorkspace
DispatchedExecution --> ConfirmedSettlement
DispatchedExecution --> UnknownSettlement
ConfirmedSettlement --> UsableInventory
ConfirmedSettlement --> UnusableInventory
UsableInventory --> ContinueWithFiles
UnusableInventory --> InvalidateWorkspace
UnknownSettlement --> QuarantineWorkspace
~~~

Branches represent **alternative outcomes**, not a sequence every request follows. Only proven pre-dispatch/no-touch rejection preserves existing work automatically. A dispatched execution that definitely settled requires trustworthy confirmation of stopped writes and file inventory; uncertain work is invalidated or quarantined rather than replayed to recreate files.

Targeted adapter/session regression evidence exercised this repair using an alternative command transport. Later real-model samples did not naturally trigger compute-slot admission rejection. We therefore do **not** claim this particular branch passed combined real-container, real-model acceptance.

**Refusing a new operation should not automatically invalidate earlier completed operations.**

### Source checks exposed the same ownership problem

To stop restricted data losing its source limits after computation, analysis retains source dependencies. A model copying a private figure into a Python constant cannot declare the computation "source-free."

However, some failure and context-projection paths lost source facts that were already known. Python then encountered an "unknown source" and refused legitimate continuation.

The problem could be missing fact propagation, not a missing permission.

We did not remove provenance constraints or add exception after exception to an allowlist. Instead, original result producers preserve facts they know, and computation reuses eligible authorization/source records from the same research.

As with erroneous workspace cleanup, **restore correct fact ownership before adding more retries or weakening checks**.

## 5. A Small Model Preview Must Not Become the Computation's Limit

A program's real output and the preview shown to the model may differ dramatically in size.

Sending every table, array, and log into model context wastes capacity. But forcing a tiny hard output limit just because model context is scarce can needlessly constrain otherwise legitimate analysis.

We separated **preview truncation** from the **actual output hard limit**, and retained observed bytes, retained bytes, and completeness status for each output stream.

The model may see a small bounded preview. That preview must not pretend to be the complete computational output.

Silent truncation can be especially deceptive: a shortened result may still parse as valid JSON or resemble a full table. Subsequent arithmetic may be mathematically correct on an **incomplete, different dataset**.

"Parses successfully" is not proof that **all records are present**. The model must not reconstruct omitted rows from memory to make analysis seem complete.

| Artifact | Primary purpose | What it cannot substitute for |
| --- | --- | --- |
| Bounded execution feedback | Help the model decide next steps and understand errors | Full computational dataset |
| Intermediate file in a healthy workspace | Continue analysis under the same execution identity | Durable downloadable artifact |
| Explicitly exported file | Authorized reading and download | Original provenance and correctness of research conclusions |

Different consumers need different representations. Forcing everything into one tool response damages those distinctions.

## 6. Preflight Checks Are Useful—but Must Not Become Another Approval System

Static inspection before executing model-generated code sounds sensible. We introduced optional preflight feedback using **CPython, Ruff, and Pyright**.

But diagnosing a suspicious pattern is different from proving the current code must be blocked. Python has dynamic behavior, lazy execution, and exception handling. A static diagnostic is not necessarily a runtime failure.

The implementation permits only **compilation errors and a very narrow class of independently proven name errors** to block this execution. Other diagnostics are localized guidance. If an optional analyzer is unavailable, an otherwise eligible sandbox execution is not forbidden solely for that reason.

The original isolation and authorization mechanism remains the execution-security authority.

Preflight has a cost. In two synthetic cold/warm samples, it added roughly **1.5–1.7 seconds**. That matters for short scripts. The delivery therefore kept preflight **off by default**, and those measurements do not establish a reduction in actual model corrections, end-to-end latency, or task-quality failures.

For maintained research libraries, we use a different policy: preserve a reviewable static-diagnostic baseline during development and prevent new defects. Long-lived production code and one-off model scripts do not require identical enforcement.

**Security boundaries, pre-execution feedback, and repository quality controls are all "checks," but they should not share the same authority.**

## 7. Computation, Interpretation, and Delivery Must Be Measured Separately

As the basic executor matured, end-to-end studies exposed different types of failure.

One early sample computed successfully and generated an HTML file, yet delivered only a code block rather than a normal attachment. Later samples traversed subtask handoff, export, download, and historical readback and achieved verifiable file delivery.

Counting both as "Python succeeded" would hide a crucial difference in user experience.

Synthetic financial-analysis cases also separated **numeric correctness**, **interpretation correctness**, and **artifact delivery**. Some calculations passed independent metric comparisons but failed export. Some bodies persisted while explanations still contained omissions or mistakes.

We began verifying distinct effects: which result the code produced, which measurement convention it used, how the model interpreted it, and what the user actually received.

Correct execution of a formula cannot establish that its input window matches the user's request. A chart rendering successfully does not prove that the model understood it. A generated file is a delivery medium—not independent evidence for its own financial conclusion.

### Python should not be mandatory for every presentation task

Initially, making HTML often meant asking Python to assemble the page.

We later separated **computing financial values** from **organizing a static page**.

On **October 19**, fixed standardized reports continued using their existing renderer. For custom static pages, the model could generate HTML directly or use already-authorized Python when computation was useful.

Existing numeric facts continued to come from their original producers; styling a chart did not require recalculating them. We did not introduce a separate length/complexity classifier that forces tasks into one route.

But HTML text alone is **not a downloadable saved file**. Persistence and delivery need real execution results.

The change had focused engineering verification, not evidence that models always select the best route or that real-world page aesthetics improved.

**Python is an optional capability, not a mandatory checkpoint for every research or presentation task.**

## 8. Preserve Freedom to Compute with Clear Boundaries

This journey was not simply adding features to a Python Tool.

We distinguished transient model code from trusted Skill scripts to avoid inheriting inappropriate privileges. We shared stable research methods to avoid maintaining duplicate formulas. We kept intermediate file continuity without prematurely building a persistent Notebook.

When multiple execution identities appeared, we separated their workspaces. When failures occurred, we learned to ask **whether new code actually ran** and **which existing files and source facts remained valid** before clearing them.

New checks no longer automatically earned the right to block execution.

Some mechanisms have engineering verification in supported container environments, and real-model paths have shown code corrections and successful artifact delivery. Complex research still has recorded failures in interpretation, completeness, and delivery.

The evidence supports these architectural judgments, **not** a claim that complex investment research is reliably solved.

The workbench's purpose is to give the model sufficiently flexible space to choose methods, write code, observe results, and then fix, re-fetch, or finish.

Runtime must rigorously govern the facts it owns: authorized inputs, the execution environment, created files, and which state is still safe for continuation.

**Teaching an Agent to compute means more than making code run. It means allowing valid prior work to survive, and making each necessary restriction affect only the operation it actually governs.**

Sometimes progress comes from sharing an existing method, preserving a previously established fact, or removing an unnecessary precondition—not adding another tool, rule, or automatic retry.

The desired Agent can compute when computation is useful, continue safely after ordinary errors, and finish tasks that do not require Python without paying an extra execution cost.
