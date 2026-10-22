# From Tool Calls to Adaptive Research: Let the Agent Search, Compute, and Change Course

If we give an Agent search, market data, documents, and Python, can it do research?

At first, it is tempting to imagine a fixed series of calls: search, read, compute, summarize. More tools appear to produce a more complete research workflow.

Real work exposes a different problem. The tools return plenty of material, **but the Agent may not know what should happen next**.

It may search again for an established fact, compare numbers from incompatible definitions, successfully run Python on insufficient inputs, or mark every research question "resolved" while continuing in circles.

We shifted attention from **which tools are available** to **whether new evidence changes the Agent's understanding and therefore its next action**.

That is the transition from tool chaining to **Adaptive Research**. Python's particular contribution is connecting material returned by different tools into intermediate datasets that can be checked, compared, and reused for subsequent reasoning.

## 1. A Research Question That Must Change Course

Suppose the user asks:

> Which of these two ETFs delivered higher returns and a smaller drawdown over the past year?

The example below illustrates the mechanism; it is **not** a real end-to-end test run that has passed acceptance.

A predefined workflow might be:

**Read ETF A → Read ETF B → Calculate return and drawdown → Report.**

Actual evidence may change the plan:

| New discovery | Why the next step must change |
| --- | --- |
| A returns an adjusted price series; B returns unadjusted prices | Verify return definitions before computing incomparable numbers |
| The two series have different start or end dates | Inspect coverage; do not silently shorten "the last year" |
| The data is present but units and schemas differ | Normalize and compute; more searches will not solve a formatting mismatch |
| A calculated drawdown looks anomalous | Check missing values, price units, and source before accepting the figure |
| Complete annual data is still unavailable for one ETF | Give only supported comparisons and disclose the missing annual conclusion |

**How findings change the research route**

~~~mermaid
graph TD
CompareETFs --> DetectDifferentScopes
DetectDifferentScopes --> FetchAndRecompute
FetchAndRecompute --> DecideNextAction
~~~

The next legitimate step may be to collect evidence, adjust the calculation, or disclose limitations and stop. The diagram is a simplified decision cycle, not a fixed production pipeline.

Results no longer serve merely as numbers to paste into an answer. They **reshape the work**. We may begin thinking we need a missing return number and discover we first need to establish comparability. We may plan another search and discover that the remaining work is computational.

Following the original plan mechanically can generate a fluent but invalid answer even with an excellent tool inventory.

## 2. Keep Track of Open Questions, Not a Rigid Sequence of Calls

We let research maintain a short set of **researchNeeds**—the questions that remain to be resolved.

~~~json
{
  "items": [
    {
      "id": "return-basis",
      "need": "Verify the two ETF return series use comparable definitions",
      "status": "open"
    },
    {
      "id": "period-coverage",
      "need": "Verify coverage of the user's requested one-year period",
      "status": "open"
    }
  ]
}
~~~

Each item contains **id**, **need**, and **status**. Statuses include **open**, **resolved**, **unresolved**, and **not_needed**. The model can revise its working judgment through **set_research_needs**.

This is not a list of the next three tool calls. If a single authoritative source establishes that two series have the same return basis, three planned searches can be skipped. Conversely, ten tool calls do not make an unresolved definition problem go away.

We encourage the model to reassess gaps after major findings, failures, conflicts, and transitions from lookup to reading, analysis, or synthesis.

Three conceptual situations help:

| Remaining gap | Appropriate next action |
| --- | --- |
| Facts or required inputs are not yet available | Retrieve relevant evidence |
| Inputs are available but insufficient for a direct answer | Compare, normalize, aggregate, or compute |
| Data and calculations are ready; interpretation remains | Return to the evidence and original question; form a bounded conclusion |

These are reasoning categories, **not** new hard-coded Runtime routing fields.

The original user question remains authoritative. Deleting a working need cannot delete a user constraint. Marking a need **resolved** is not evidence that it is resolved.

## 3. A Trap We Encountered: Updating the List Is Not Making Progress

A working-question list sounds useful. It becomes dangerous if the system infers that any update proves progress—or that an unchanged list proves stagnation.

A recent CLI sample contained **90 runs**, of which **70** had standard body capture. Across those captured bodies, **19 runs** included **71 model-authored research-needs updates**.

That establishes that the model used the feature. It does not provide a question-resolution rate or prove that updates improved the answers.

Two contrasting examples are important.

In a strategy check, the needs had reached **not_needed / not_needed / resolved**, but the model still kept revising until QA terminated the Run.

In a portfolio-adjustment consultation, an **unresolved** need remained, yet the Agent gave a useful explanation of insufficient inputs and ended.

**All-green working notes and a sufficiently useful answer are different things.**

An unresolved gap may genuinely block a conclusion, or may be impossible to resolve with present inputs, in which case an explicit limitation is the correct result. A completely resolved list may have ignored some part of the original question or offer no guidance on when to stop.

Runtime therefore neither treats these statuses as completion authority nor forces more tool calls solely because an item remains unresolved.

We also corrected the reminder policy. Previously, a needs list that matched its original form could repeatedly trigger a "review your needs" reminder. That assumed no change in notes meant no progress.

But reading three independent sources to verify the same definition can be meaningful work even when the need remains identically phrased.

The **October 9** code change removed an **unchanged-list** trigger. Periodic reminders based on actual completed turns/tool activity and checks near finalization remain. They ask the model to reconsider evidence, gaps, and next steps; they do not require it to rewrite its notes to look busy.

A useful working list keeps research oriented. It must never substitute for the research itself.

## 4. Python as a Relay Between Research Steps

Adaptive Research determines *why* the next step changes. Python handles *how* authorized data from earlier tools can be connected, compared, and reused.

Offering an arbitrary code-execution button is not enough. A new interpreter may lack the variables from the prior invocation. A very large tool response may be visible only as a summary. Huge printed tables are difficult to reuse reliably.

The code evolved toward explicit inputs, an in-Run workspace, and on-demand result references. Existing authoritative deterministic calculation interfaces take precedence when available. Python is a workbench for analyzing permitted data, **not** a replacement for binding investment allocation, monetary decisions, or execution authorization.

There are three legs in this relay.

**Passing work between tools and Python**

~~~mermaid
graph TD
ToolAProvidesData --> PythonSavesResult
PythonSavesResult --> ToolBAddsData
ToolBAddsData --> PythonRecomputes
PythonRecomputes --> ModelInterprets
~~~

The second Python invocation reads saved files and newly acquired data; it does **not** inherit interpreter variables. The model chooses the actual tool calls. This diagram reuses our simplified ETF scenario.

### Leg one: give each tool result an explicit identity

The model may specify a **toolCallId** for a returned result already projected into the current model input:

~~~json
{
  "inputs": [
    {
      "name": "etf_a.json",
      "toolCallId": "call_etf_a"
    },
    {
      "name": "etf_b.json",
      "toolCallId": "call_etf_b"
    }
  ]
}
~~~

After the Host validates the receipt, read eligibility, and current permissions, the data becomes available in Python's read-only input directory:

~~~text
/inputs/etf_a.json
/inputs/etf_b.json
~~~

A subtle boundary matters: a **toolCallId** input consumes the content **actually projected into the current context**. It cannot silently fetch an original hidden body that context fitting chose not to expose.

A later **resultRef** path addresses a distinct problem. Full results can live outside model context. The model explicitly selects a stored reference; Host rechecks authorization and provides either the full eligible view or an explicitly selected subset to computation.

This allows Python to process datasets the model did not read line by line. The model decides **what to calculate**; the data travels through a controlled reference.

The reference is a locator, **not a permission token**. Run ownership, source eligibility, and dependency rules still apply. Past possession of a reference is not an everlasting grant.

Input limits are explicit: at most **eight explicit inputs** and **512 KiB total input** per computation. Exceeding a limit rejects the request; it must not silently truncate rows and pretend the dataset is complete.

An intentional, documented selection of dates or pages is a legitimate analytical choice. Invisible truncation to make a dataset fit changes the research question without consent.

### Leg two: persist intermediate work in files, not invisible interpreter state

A healthy, active Python analysis session shares a workspace:

~~~text
/workspace
~~~

Each execution nevertheless launches a **fresh Python interpreter**.

If the first execution defines:

~~~python
aligned = ...
~~~

the next execution cannot directly read that variable. Persist what must survive:

~~~python
# Example: "aligned" already passed definition and date-alignment checks.
aligned.to_json(
    "/workspace/aligned.json",
    orient="table",
    date_format="iso"
)
~~~

A later execution loads the file explicitly:

~~~python
import pandas as pd

aligned = pd.read_json(
    "/workspace/aligned.json",
    orient="table"
)
~~~

This supports staged work. Python first normalizes two tool results and saves the aligned dataset. The model reads a compact computation summary and realizes that one return definition still needs confirmation. It uses an authorized external tool to collect that evidence. A second Python execution then combines the new material with the existing file and recalculates.

Python does **not** directly call Web or Market tools. The model decides which evidence is missing and obtains it through currently permitted interfaces.

Workspace continuity is scoped to the **healthy current analysis session**. A process restart, invalid session, or new Run does not guarantee that old files exist.

Computations within one session run **serially** so two calls do not race to rewrite intermediate files. Each return reports execution status, workspace state, and a bounded file-change list, letting later steps distinguish safe continuation from uncertain state.

Continuity is about **knowing what was actually saved**, not assuming the interpreter remembers everything.

### Leg three: return reusable results, not just "exit code zero"

After computation, the model needs more than process success. In the ETF example, it needs to know:

- The time window actually compared.
- Which data failed definition or coverage checks.
- Which numerical comparisons are supported.
- Which conclusions remain unjustified.

We prefer bounded structured summaries over printing a full data table. **stdout and stderr share an 8 KiB output limit**. Large tables belong in the workspace, and files intended for the user require explicit export.

An eligible completed execution with valid execution/workspace metadata can register its **returned output** as a result reference for later steps. That lets research use both raw tool data and an earlier computed output.

This does not mean **every workspace file automatically becomes a resultRef**. Workspace files are for analysis-session continuation; referencable results derive from eligible returned outputs; exported files serve delivery. These are separate paths.

Computation then changes the research route again. Inadequate overlapping dates reopen coverage questions. Comparable data allows synthesis. Anomalies trigger further source verification.

**Python supplies new material for judgment; Adaptive Research uses that material to choose what happens next.**

## 5. Computing on Data Must Not Erase Its Provenance

Once Python sits between tools, the difficult question is which earlier sources a later computed value depends upon.

A revoked or inaccessible source does not become permanently usable merely because its contents were written into a CSV.

The workbench therefore keeps **source and dependency relationships**. Stored-result consumption binds a **result reference and content hash**; execution records keep a **code hash and environment information**. Execution, export, and artifact download have their own current-permission checks.

The present dependency model **conservatively accumulates dependencies at workspace level**. It is not perfect per-cell provenance, but it does not forget sources after several Python rounds.

Copying a number out of a conversation into a Python constant does not magically remove the source restrictions attached to that number.

A related recent improvement distinguishes **currently bound Skill method instructions** from external business evidence. A method description, analysis instructions, or an empty-data control message should not automatically count as an unknown business source that blocks computation.

But Host must verify the identity of the currently bound Skill. A model calling arbitrary text "method instructions" does not make it trusted method context.

Research needs continuity for both **data** and **method**, while keeping their authorities distinct.

## 6. Continuing After Failure Requires Knowing What Still Exists

Real tests showed the model revising broken Python and trying again. That can be useful, but only when the execution environment supplies precise failure facts.

A completed code error and an execution whose status is unknown require different treatment.

If execution definitively stopped and the workspace remains confirmed safe, the model may fix the code and continue. A failed run may already have written files, so prior source dependencies must not be casually cleared.

If execution or workspace safety cannot be established, intermediate files must not be trusted. The current mechanism invalidates the workspace.

Recovery and replay create another form of "continuation." A completed invocation with a receipt is **read back rather than reexecuted** during replay. A new computation invocation remains genuinely new. Similar code and arguments are not sufficient to reuse an arbitrary old result because inputs and workspace state can have changed.

This is less magical than retrying until something works, but it preserves the identity of the work being continued.

## 7. Time Definitions Must Travel With the Research

Code review also identified an important time-model correction: distinguish the task's saved time anchor from the current reference time.

A long research Run may issue queries at different moments. Market-data timestamps, news publication times, and document applicability periods differ. Re-querying does not make old observations current.

The implementation separates the saved **task-time anchor** from the current reference. A timezone is accepted only from an explicit trusted caller input.

The ordinary production path currently provides a task-time anchor. This does **not** mean the system knows the user's timezone. If none was provided, it remains unknown rather than being inferred from a market or deployment location.

For "the last year," calculation must therefore preserve both the chosen measurement convention and the time anchor from which the requested period was defined.

New evidence may change the research conclusion. It may not silently rewrite the original time window.

## 8. Six Connections Worth Building First

You do not need to clone an entire Agent framework. These six connections provide a foundation for research that can change course:

1. **Keep the original task intact.** Working notes may change; user goals and constraints may not disappear with them.
2. **Maintain a small list of current questions.** Update it with evidence, but never use its status as completion or authorization proof.
3. **Give data stable identities.** Distinguish currently visible tool output from authorized stored results; validate ownership, permission, coverage, and capacity on each use.
4. **Provide a per-Run analysis workspace.** Read-only inputs and file-persisted intermediates; fresh interpreters, session-scoped files, and serial execution.
5. **Return inspectable computation outputs.** Include numbers, actual windows, and caveats; retain identities and dependencies for reuse.
6. **Reconsider the next action when evidence or stage changes.** Continue reading, recompute, interpret, or stop with an explicit limitation.

Two distinct forms of judgment remain necessary:

The **model** interprets what the current gaps mean. The **Host** checks which inputs/actions are authorized and whether execution state is certain.

Model-driven research does not grant model-driven permissions. A successful process exit does not authorize Host to certify the analysis as correct.

## 9. What the Recent Evidence Actually Establishes

By **October 9**, the inspected implementation contained working-question updates, evidence feedback, Python explicit inputs, per-Run file continuity, authorized result references, and dependency continuation checks.

In the **90-run CLI sample**, **21 runs** contained Python tool proposals and **eight** included proposals across multiple research turns. That shows repeated selection of computational work, **not** an execution-success percentage.

Working questions were also used, but the examples show why list updates, successful computation, research convergence, and correct answers need distinct evidence.

The CLI sample spanned service versions and preceded the latest reminder and timing fixes. It cannot demonstrate that those fixes improved quality or that all kinds of end-to-end research now complete reliably.

The architectural lesson is stronger than those unmeasured claims:

Tools retrieve material. Python connects it into inspectable intermediate results. The model uses new findings to update its working questions and actions. When the remaining gap can be resolved, research advances; when it cannot, a clear limitation is itself an honest research result.

**Adaptive Research emerges from those connections, not from maximizing the number of available tool calls.**
