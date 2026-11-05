---
description: "A three-ETF comparison explains why a workbench preserves files instead of interpreter state, and why a rejected new calculation must not destroy earlier outputs. Current input, execution and export paths reveal the trade-offs."
readingBrief:
  takeaways:
    - "Transient code uses identified inputs under the original Run grant in a separate environment; trusted Skills may share method source, not execution privileges."
    - "Files continue under the actual executor while each Python process starts fresh; no-touch facts, settlement and inventory determine what survives a failure."
    - "Previews, complete computational data and exported artifacts serve different consumers; static diagnostics, execution security and numerical quality also have different authority."
  appliesTo:
    - "Repeated Python analysis and Child collaboration that must preserve independent valid work after capacity rejection, code errors or unavailable dependencies."
  notFor:
    - "Persistent Notebooks, unrestricted networking or automatic scratch recovery, or treating successful calculation as proof of correct interpretation and user delivery."
---
# A Python Workbench That Keeps Calculations Connected and Prior Work Intact

Compare three ETFs over a year: return, maximum drawdown, volatility and charts. The first invocation may only align dates. A second discovers inconsistent data definitions and needs another source. A third finally computes the result. A tool that runs Python solves just one part of this task.

Continuation depends on how new data enters, who owns earlier files, whether an error destroys prior results, and whether a chart ever becomes a file the user can download.

The current path is explicit: **original tools retrieve data, Host validates inputs, each actual executor owns a file workspace, every invocation starts fresh Python, and export is deliberate.** The ETF comparison is a teaching scenario; dated failures and controlled samples retain their own scope rather than claiming this entire financial task has passed.

<span id="teaching-an-agent-to-compute-the-architectural-evolution-from-python-tool-to-computational-workbench"></span>
<span id="_1-reuse-analysis-methods-not-their-execution-permissions"></span>
<span id="_2-flexible-code-does-not-mean-reimplementing-every-formula"></span>

## 1. Bring Data into Computation, Not Business Privileges into the Script

The model submits temporary code and named input references. Host checks Run, scope, source, content identity and completeness before admitting data to the isolated environment. A model-supplied sandbox ID or permission field cannot expand that scope.

Inputs can come from an exact visible projection of a tool call, or from an authorized result reference and explicit selection. The latter does not require the whole dataset to pass through model context first. Neither path may treat a capacity-truncated prefix as a complete dataset or borrow another Run's authority.

Later analysis uses the same Run's recorded Host grant; a Child inherits its admitted subset without querying current ACL state again. Byte availability, hash, Reader identity, budget and cancellation remain separate checks. **Permission cannot restore missing bytes, and unavailability must not masquerade as revocation.**

For the ETF comparison, a missing time interval sends the Agent back to the original data tools. Python does not connect directly to the business database, market provider or MCP. The model can transform and calculate without inheriting application-server files, credentials, internal networks or unlimited resources. Host prepares dependencies and the supported execution environment.

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

These are optional handoffs, not a mandatory pipeline. Every later invocation still checks the original granted scope, input facts and execution conditions. A file existing in a workspace does not make it downloadable.

This sacrifices the convenience of putting retrieval, arithmetic and external API access into one script. In exchange, business data keeps its original acquisition and authorization path instead of gaining a competing implementation inside Python.

### Reusing a runner and sharing a method library are different choices

The existing `run_skill_script` executes maintained code in trusted packages. Placing newly generated code in that directory does not change its provenance, so transient programs use the separate `run_analysis_python` route. The distinction concerns code origin, not the Python language.

Method source can be shared. The build produces Skill and analysis-image artifacts from one canonical research library, avoiding missing-value or parameter semantics drifting between copies. Models may reuse maintained risk, attribution and scenario methods or write temporary analyses; ordinary scientific computation need not depend on every optional fund helper being available.

Optional-method drift is also different from an unsafe base Runner. The current implementation separates base-environment qualification from optional-method status rather than turning every mismatch into a ban on general computation. Whichever method runs, account shares, balances, holdings and investment execution remain facts of the original business owners. Derived research does not rewrite that ledger.

<span id="_3-continuity-does-not-require-a-persistent-notebook"></span>
<span id="multiple-agents-made-the-original-ownership-too-broad"></span>

## 2. Preserve Files Across Invocations, Not Hidden Interpreter State

After aligning the ETF dates, save the table in the workspace. The next invocation reads it and computes metrics. **Every invocation starts a new Python process; only files in a healthy workspace continue.** Variables, in-memory objects and imports do not persist implicitly, and the read-only input area is rebuilt each time.

The original design compared three reasonable options:

| Approach | When it fits | Cost in this task |
| --- | --- | --- |
| Fully stateless execution | Small one-off calculations that are cheap to repeat | Repeated normalization across iterations |
| Persistent interpreter or Notebook kernel | Interactive exploration with important in-memory objects and a managed kernel lifecycle | More implicit state, checkpointing and cross-restart recovery complexity |
| Continuing files with fresh processes | Intermediate outputs can be explicitly saved and reloaded | Repeated initialization/imports and explicit persistence by the model |

Persistent state is not inherently a mistake. [OpenAI Code Interpreter](https://developers.openai.com/api/docs/guides/tools-code-interpreter) provides sandbox containers, reuse and file download. [Anthropic Code Execution](https://platform.claude.com/docs/en/agents-and-tools/tool-use/code-execution-tool) also continues files, with interpreter persistence under applicable versions and configuration. For hosted analysis alone, adopting such a service may be simpler. Our own workbench connects existing Run, source and Artifact owners; that is not a claim that hosted products lack isolation or files.

Files were chosen because the immediate need was intermediate-output continuity, not a complete Notebook. A restarted service or failed session does not promise to rebuild scratch by rerunning old code. Export results that need to survive independently.

### Files belong to an executor, not the entire task tree

One Root-wide session was reasonable when there was one executor. Once Children arrived, model conversations could be separate while scratch, generations and lineage remained shared. Renaming a directory does not resolve that ownership mismatch.

Imagine two Children both saving `normalized.csv`. This is an illustrative collision, not a reported overwrite incident. Sharing a parent task should not silently grant shared mutable state.

The current session is selected by the actual executionId in a sealed Host invocation record. An executor can repair its code and reuse its files; Main and sibling Children cannot directly read or export its workspace. Results require an explicit handoff. Creating logical Children also does not create additional physical execution slots.

<span id="_4-after-failure-ask-which-existing-effects-are-still-valid"></span>
<span id="why-did-a-request-that-never-ran-destroy-prior-results"></span>

## 3. Before Invalidating Old Files, Establish Whether the New Request Touched Them

A script can write the aligned table and then fail while plotting. The workbench does not make execution a filesystem transaction or promise rollback. Continuing requires confirmed completion, stopped writes and a valid complete inventory. Unknown execution invalidates the workspace rather than rerunning code to guess at recovery.

A seemingly cautious rule once destroyed valid work. In an October 18 regression, A had a completed, exportable file while B and C occupied the compute slots. The adapter rejected A's next request before prepare or execution. The session treated it as potentially active work and destroyed A's healthy workspace.

**No new code ran, but old results disappeared.** Rejecting capacity was correct; assigning uncertainty to the untouched old state was not.

The current rule is not “preserve on unavailable.” The adapter that knows dispatch facts supplies a narrow no-touch proof:

- Validate inputs and the target workspace first. A busy target itself does not qualify.
- Issue the rejection only when the target is idle, other executions fill global capacity, and prepare has not started.
- Bind the exception to this dispatch-input object's identity and the original workspace through a private identity map. Copies, matching names and old exceptions cannot substitute.
- The session also requires an unchanged workspace, no closing transition, and active cancellation/deadline conditions. Only then restore prior lineage and retain generation and inventory; inputs from the rejected call do not contaminate old files.

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

The branches are alternatives, not mandatory successive stages. Later export still checks actual bytes, hashes and lineage; no-touch proof does not prove export. In the current Docker adapter, timeout, cancellation and output-hard-limit termination do not perform normal complete-inventory readback: they destroy the workspace and report unsettled execution. They do not inherit the preservation exception.

The regression used real sessions and the production adapter with an injected command transport. It did not establish combined real-Docker and model acceptance of this branch. A later real-model sample calculated and exported successfully but never naturally hit capacity rejection, and its narrative remained flawed. Those outcomes cannot validate one another.

<span id="source-checks-exposed-the-same-ownership-problem"></span>
<span id="_5-a-small-model-preview-must-not-become-the-computation-s-limit"></span>

## 4. Continue Provenance and Complete Data, Not Just a Small Preview

File continuity requires provenance continuity. Copying a private number into a code constant does not make analysis source-free. A normal failed script may already have written files, so a nonzero exit cannot erase dependencies.

Historical failure and context-projection paths lost known source facts, leaving later Python with an unknown origin and no legitimate continuation. The repair kept facts with their original producers through exact receipts and projections, reusing the same Run's grants and lineage. Removing dependencies or adding error-text allowlists would not solve that ownership problem. More retries do not replace missing facts.

Output completeness is independent. The current combined stdout/stderr preview is bounded at 64 KiB, with stderr at most 16 KiB; the combined execution-output hard ceiling is 2 MiB. Exceeding preview capacity need not stop calculation; exceeding the hard ceiling does. **2 MiB is not a promise to retain complete stdout**: omitted output may only continue to be counted. The final Native tool envelope also has its own capacity, including metadata and JSON escaping, so the model is not guaranteed 64 KiB of visible text.

Each stream records observed bytes, retained bytes, truncation and completeness. Missing historical metadata means unknown completeness, not an excuse to infer it from short text or a successful `JSON.parse`. Only completed execution with a usable workspace and complete output is eligible for registration as re-readable computational output.

For the ETF table, a truncated prefix may remain valid JSON. Arithmetic can be perfectly correct on that smaller, different dataset. Write large complete datasets to files and read them explicitly; do not reconstruct omitted rows from model memory.

| Artifact | Primary purpose | What it cannot substitute for |
| --- | --- | --- |
| Bounded execution feedback | Help the model decide next steps and understand errors | Full computational dataset |
| Intermediate file in a healthy workspace | Continue analysis under the same execution identity | Durable downloadable artifact |
| Explicitly exported file | Authorized reading and download | Original provenance and correctness of research conclusions |

<span id="_6-preflight-checks-are-useful—but-must-not-become-another-approval-system"></span>

## 5. Static Diagnostics Can Advise Without Automatically Blocking

Optional preflight uses CPython, Ruff and Pyright, separating suspicious code from proof that this invocation should not execute. Dynamic binding, uncalled functions and exception handling make general static diagnostics different from certain runtime failure.

Besides compilation errors, the name-error proof is extremely narrow: the entire program must be one top-level bare-name read, excluding built-in names. A standalone `mystery` may qualify; `print(mystery)` does not fit that proof. Ruff F821 or agreement between two analyzers is not independently blocking authority. Diagnostics can still guide revision; isolation and authorization remain responsibilities of the original environment.

A genuine preflight block reports that execution was not attempted, without invented stdout, file changes or execution duration. Failure of an optional analyzer alone does not close an independently qualified sandbox. Original cancellation and deadlines still apply.

Checks cost time. Two synthetic cold/warm samples on October 17 observed roughly **1.5–1.7 seconds** of overhead. Those are historical controlled samples, not a current SLA or complex-task latency result. Preflight remains off by default; the samples do not establish fewer model corrections, lower end-to-end latency or better research. Computation itself also needs its own enablement and environment qualification.

Long-lived research libraries use a separate development-time diagnostic baseline to constrain new issues. Maintained code and one-off generated programs need not have identical enforcement. A passing baseline does not certify financial formulas either.

<span id="_7-computation-interpretation-and-delivery-must-be-measured-separately"></span>
<span id="python-should-not-be-mandatory-for-every-presentation-task"></span>

## 6. Calculation, Interpretation and User Delivery Need Separate Evidence

Computing ETF metrics creates derived results. A correctly executed formula does not prove that its date window matches the question; a rendered chart does not prove understanding. A file is not independent evidence for its own financial conclusion.

An early sample generated HTML but delivered only a code block rather than an attachment. Later samples achieved real delivery through Child handoff, export, download and historical readback. Other synthetic financial tasks passed independent numeric comparisons but failed export; some saved answers still contained omissions. A single “Python succeeded” label hides these differences.

Current workspace export reads actual bytes, checks size, hash and lineage, and saves through the original Artifact owner. HTML preparation may change the final bytes, so the saved artifact hash need not equal the scratch file's original hash. Saving, downloading and opening in a browser remain distinct facts.

### A presentation without new computation need not run Python first

The October 19 choice separated calculation from page composition. Fixed standard reports retained their renderer; custom pages could use direct HTML or authorized Python when programming helped. Existing values could be displayed without recalculation. The model chooses based on the task, without a separate Host router imposing row-count or chart-count thresholds.

Today this is more than generation guidance. When the original Artifact and HTML-preparation capabilities are available, the direct HTML branch of `export_analysis_artifact` can accept content, check lineage, prepare it and save a file independently of Python-workspace health. It reuses the same artifact owner rather than allowing a text assertion or invented URL to stand in for a save receipt.

Missing computation limits the charts that depend on it; unavailable Python should not block otherwise legitimate static presentation of existing reliable values. An implemented engineering path does not establish that the model always selects well or that page aesthetics have improved.

<span id="_8-preserve-freedom-to-compute-with-clear-boundaries"></span>

## 7. Choose Complexity According to the State That Actually Needs to Continue

A stateless tool may suffice for one small calculation. Interactive exploration with important live objects may justify a persistent kernel. Our file workspaces connect iterative research to existing source, executor and delivery identities. The costs are Host-managed isolation and inventories, explicit save/read steps, and no guarantee of automatic recovery after invalidation.

Three questions guide failure handling:

1. Did the new request touch the workspace? Only its execution owner can supply no-touch evidence bound to that invocation.
2. If it executed, has it ended, and are inventory and provenance still valid? Ordinary errors, cancellation and unknown execution are not one outcome.
3. Does the next consumer need model feedback, computational data or a downloadable artifact? They are not the same output.

Supported container environments have engineering verification, and real-model samples have repaired code and delivered files. Complex research still has interpretation, completeness and delivery failures. The workbench provides an explainable path for continuing calculations, not a claim that adding Python reliably solves investment research.
