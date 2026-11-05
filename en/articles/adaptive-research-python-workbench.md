---
description: "An ETF comparison can fail before Python starts: its inputs may not be comparable. Follow working questions, explicit input identity and execution-local files to understand evidence-driven research, the alternatives, and the costs of choosing isolated computation with explicit state."
readingBrief:
  takeaways:
    - "The model judges research direction; the Host owns permissions, input identity and execution facts. Resolved working notes are not an answer certificate."
    - "A visible tool projection and an authorized stored view are different inputs. Computation can consume data outside the model context without silently truncating the sample."
    - "Files continue within one healthy execution, but Python variables do not. Main and sibling tasks do not share a workspace."
    - "Persistent kernels and hosted computation suit different needs. Local isolation and explicit files trade simpler state boundaries for environment maintenance and serialization."
  appliesTo:
    - "Connecting retrieval, reading and repeated computation so that findings change the research direction instead of merely completing a tool checklist."
  notFor:
    - "Treating exit codes, research-note statuses or invocation counts as proof of financial correctness or research quality."
---
# From Tool Calls to Adaptive Research: Let the Agent Search, Compute, and Change Course

A user asks: “Which of these two ETFs delivered higher returns and a smaller drawdown over the past year?”

The easiest pipeline fetches both series, runs Python and reports two metrics. The easiest mistake happens before computation: A supplies adjusted prices, B supplies unadjusted prices, and the date ranges may differ. The program can finish successfully without answering a valid comparison.

**Adaptive research lets new evidence change the next action. It does not simply run every available tool in order.**

This teaching example connects the current design: the model maintains working questions, obtains material through existing tools, passes explicit inputs into isolated Python, and brings computational findings back into research. It is not an accepted end-to-end ETF test run. Historical observations below are identified separately.

<span id="_1-a-research-question-that-must-change-course"></span>

## 1. Why a Result Should Change the Research Route

The same user question should lead to different next steps when the evidence differs.

| Finding | What should change |
| --- | --- |
| Return definitions differ | Establish or align the basis before putting two numbers side by side |
| Start or end dates differ | Check coverage; do not silently shorten “one year” |
| Data is complete but schemas or units differ | Transform and compute; another search will not fix a formatting mismatch |
| Drawdown looks anomalous | Inspect missing values, units and sources before presenting the number |
| Complete annual data remains unavailable | Offer the supported comparison and identify the missing annual conclusion |

~~~mermaid
graph TD
CompareETFs --> DetectDifferentScopes
DetectDifferentScopes --> FetchAndRecompute
FetchAndRecompute --> DecideNextAction
~~~

This is a simplified decision cycle, not a fixed production pipeline. A calculation may expose another evidence gap, establish that the available material is sufficient, or show why a limited answer is appropriate.

A real historical diagnosis motivated this direction. In an early document-question case, the model searched four times, missed the applicable period, and expanded “not present in the returned excerpts” into “not present in the document.” A targeted query against the same index found the relevant passage. The problem was not simply a shortage of tools: the model did not revise its question using the feedback already available. This old counterexample explains the design motivation; it neither proves that the current version always repeats it nor that working notes alone fix it.

<span id="_2-keep-track-of-open-questions-not-a-rigid-sequence-of-calls"></span>

## 2. Keep Questions, Without Turning Them into an Execution Plan

`researchNeeds` records the questions the model currently considers important:

~~~json
{
  "items": [
    {"id": "return-basis", "need": "Verify comparable return definitions for both ETFs", "status": "open"},
    {"id": "period-coverage", "need": "Verify coverage of the requested one-year period", "status": "open"}
  ]
}
~~~

An item has only `id`, `need` and `status`. The available statuses are `open`, `resolved`, `unresolved` and `not_needed`; the model updates its judgment with `set_research_needs`. Contrary evidence can reopen a resolved question, while another finding can make a planned question unnecessary.

Why not record “search three times, read two pages, run Python once”? Those are actions, not objectives. One authoritative source may settle the return basis. Ten calls may still leave it unresolved.

The responsibilities are deliberately separate:

- **The model chooses the research direction.** Acquire missing facts, compute when available data needs transformation, and explain what the evidence supports. These are thinking prompts, not new routing fields.
- **The Host stores and bounds the state.** It checks structure, capacity and update facts. It does not certify that a question is resolved or let notes grant tool or source permissions.
- **The original request remains authoritative.** Deleting a need or submitting an empty list does not delete “one year” from the task or establish completion.

Without a usable list, research can retain the complete original question rather than requiring another planning-model call. If optional notes cannot fit, preserving them must not displace protected original material.

<span id="_3-a-trap-we-encountered-updating-the-list-is-not-making-progress"></span>

### Why an All-Green List Can Still Fail to Finish

The October 9, 2026 diagnosis preserved two contrasting cases. One strategy task reached `not_needed / not_needed / resolved` but continued publishing until QA cancelled it. Another advisory task retained an `unresolved` question, gave a useful explanation of insufficient inputs, and finished normally.

The current Runtime therefore does not gate publication or completion on needs statuses. An unresolved question may block a conclusion, or it may be precisely the limitation the user should hear.

Likewise, **unchanged notes do not imply unchanged research**. Reading three sources to verify the same definition can leave the question text unchanged. An earlier implementation independently triggered a reminder when the list still matched its initial value. The current design retains periodic guidance based on actual turns and invocation facts, plus a finalization check, without asking the model to rewrite notes to look busy. The verified change is a prompting contract, not a measured improvement in answer quality.

<span id="_4-python-as-a-relay-between-research-steps"></span>

## 3. Why Isolated Python Is Separate from Trusted Skill Scripts

Existing trusted Skill scripts execute previously reviewed methods. Their runner is not a sandbox for arbitrary model-authored code. Saving newly generated Python into a trusted package and invoking it would borrow a trusted identity for untrusted content.

`run_analysis_python` separates those trust models. The model can author temporary analysis code; the Host provides a prepared local isolation environment, fixed dependencies and resource limits. Existing tools retain external acquisition authority. Python does not gain network, database, MCP or model access, and cannot install packages on demand.

Use an existing authoritative deterministic calculation when one applies. General Python handles long-tail transformation, comparison and analysis; it does not replace the owners of portfolio facts, allocation or investment execution.

Local isolation keeps private material within the existing execution boundary and connects to the same grants, invocation receipts and delivery mechanisms. This is not a claim that hosted computation is weaker. It avoids introducing another data-processing and lifecycle boundary for this particular research path.

<span id="leg-one-give-each-tool-result-an-explicit-identity"></span>

## 4. Tool-to-Python Inputs Must Identify Both the Data and Its Permission

The model can select inputs explicitly:

~~~json
{
  "inputs": [
    {"name": "etf_a.json", "toolCallId": "call_etf_a"},
    {"name": "etf_b.json", "toolCallId": "call_etf_b"}
  ]
}
~~~

After validation, the Host materializes this invocation's inputs under read-only `/inputs`. Two input forms have different meanings:

| Input | What it identifies | What it must not imply |
| --- | --- | --- |
| A current-Run `toolCallId` | The completed call's actual projection submitted to the model | The call ID cannot retrieve original bytes hidden or omitted from that projection |
| An authorized stored-view `resultRef` with an explicit selection | Saved data bound to a version, content and sources, potentially broader than the model-visible body | Knowing the reference string does not mean the model read the data or gained another permission |

The second path lets the model choose what to calculate without first reading every row and copying it into code. **Computational consumption and model reading are separate facts.**

Permission comes from the Run's sealed grant, including any applicable Child subset. Consuming unchanged, already-granted data within that Run does not query current external ACLs again. The Host still verifies Run and scope, receipts or stored-view identity, content hashes, source dependencies and available bytes. An external permission change is not automatically a same-Run invalidation rule. Conversely, a reference cannot authorize foreign, altered or originally ungranted data. A new Run has its own admission.

Capacity is also part of input semantics. The current configuration allows at most 32 named inputs totaling 4 MiB, still subject to the chosen read range and other transport limits. Oversize inputs must fail explicitly rather than silently retaining half the table. Deliberately selecting a date window is different from truncating data to make it fit.

For the ETF example, input preparation should preserve the return basis, actual date coverage, and missing-data exclusions. Otherwise the next stage cannot tell which question its numbers actually answer.

<span id="leg-two-persist-intermediate-work-in-files-not-invisible-interpreter-state"></span>

## 5. Continue Through Files, Not Hidden Python Variables

~~~mermaid
graph TD
ToolAProvidesData --> PythonSavesResult
PythonSavesResult --> ToolBAddsData
ToolBAddsData --> PythonRecomputes
PythonRecomputes --> ModelInterprets
~~~

Later Python calls within the same healthy execution can reuse `/workspace` files, but each starts a fresh interpreter. An `aligned` variable created in one call is not inherited by the next. Reusable state must be saved explicitly:

~~~python
# Illustration: basis checks and date alignment have completed in this call.
aligned.to_json("/workspace/aligned.json", orient="table", date_format="iso")
~~~

The next invocation reads it explicitly:

~~~python
import pandas as pd

aligned = pd.read_json("/workspace/aligned.json", orient="table")
~~~

Between these calculations, the model can obtain another source through an ordinary tool and combine the new input with the saved file. Python does not call that tool itself; choosing the next research action remains the model's job.

“The same execution” is more precise than “the same research task.” Sessions are selected by the Host-sealed `executionId`. Main and different Child tasks do not share a workspace. Collaborating on one root task should not grant access to a sibling's temporary files or exports, or mix their provenance.

This distinction came from an actual design correction. A single root-owned session mixed Main and Python siblings' scratch, generations and lineage. Creating several independent fake workspaces in a test was also insufficient: the real runner had to admit the corresponding capacity. Identity isolation and machine capacity require separate verification.

Operations in one workspace are serialized to avoid concurrent mutation. After a service restart, sandbox loss or invalidated generation, a familiar pathname is not proof that its file still exists. **A durable receipt records what happened; it does not make the temporary directory durable.**

<span id="leg-three-return-reusable-results-not-just-exit-code-zero"></span>

## 6. Where Other Approaches Fit, and Why We Chose File State


This comparison evaluates the current requirements. It does not claim that the team deployed or experimentally compared every listed product.

| Approach | Stronger fit | Our trade-off |
| --- | --- | --- |
| Fixed scripts or workflows | Stable inputs, formulas and steps requiring consistent execution | Keep authoritative methods; do not require every long-tail analysis to become a prewritten script |
| A persistent Jupyter kernel | Human-led exploration with convenient variables, rapid iteration and rich presentation | Fresh interpreters reduce implicit memory state, at the cost of explicit intermediate-file serialization |
| Hosted computation such as OpenAI Code Interpreter | Managed isolated execution, containers and files under an acceptable data-processing boundary | Local execution connects to existing grants and receipts, but makes image maintenance, supervision, health checks and cleanup our responsibility |
| A completely stateless computation each time | Small calculations whose inputs are cheap to reconstruct | Retain files to avoid repeating every transformation, without promising workspace recovery across restarts |

[Jupyter's kernel and interactive session](https://jupyter-notebook.readthedocs.io/en/latest/notebook.html#opening-notebooks) explain the value of persistent interaction. [OpenAI Code Interpreter](https://developers.openai.com/api/docs/guides/tools-code-interpreter#containers) provides isolated containers that can be created, reused and populated with files, with lifecycle limits when containers expire. Neither is the wrong design; the state, operational and data-boundary choices differ.

Our midpoint is to let files carry useful iterative state without making interpreter memory another recovery system. This does not automatically establish reproducibility. Recalculation still requires input identities, code, environment and explicit intermediate artifacts, not merely a record that an earlier call succeeded.

<span id="_5-computing-on-data-must-not-erase-its-provenance"></span>
<span id="_6-continuing-after-failure-requires-knowing-what-still-exists"></span>
<span id="_7-time-definitions-must-travel-with-the-research"></span>

## 7. A Preview Is Not a Complete Result


Useful computational output tells research the actual period, definitions, valid sample, anomalies, limitations and supported numbers. Printing the whole table consumes context and can bury the finding that matters.

The current combined stdout/stderr preview ceiling is 64 KiB, with at most 16 KiB reserved for stderr. The eventual model-visible tool result also has its existing outer message limit, so 64 KiB is not a promise that all retained preview bytes reach the model. Exceeding the preview ceiling alone does not terminate computation, but partial output must be marked. Exceeding the 2 MiB combined hard output ceiling triggers resource termination. These are configuration boundaries, not performance measurements.

A truncated prefix must not become a supposedly complete table in the next calculation, even if the prefix happens to be valid JSON. Write large data to a file explicitly, or consume an eligible complete saved result through its existing path.

Three kinds of output serve different purposes:

- **Workspace files** support further processing within the same healthy execution; they are not automatically durable deliveries.
- **Referenceable returned results** can be registered when completion, completeness and execution metadata qualify them. An arbitrary stdout prefix does not qualify.
- **Explicitly exported files** pass the existing export and delivery checks. Generating a chart or CSV does not turn it into original source evidence.

For the ETF example, “the common window covers only nine months, so an annual conclusion is unsupported” may be more useful than a polished ranking that quietly shortened the sample.

<span id="_8-six-connections-worth-building-first"></span>
<span id="_9-what-the-recent-evidence-actually-establishes"></span>

## 8. Computation Retains Provenance, and Failed Calls Can Leave Real Files

The workspace conservatively accumulates dependencies from admitted inputs and originating exposure. It does not track every cell's lineage. This is coarser than a fine-grained dependency graph, but converting data to CSV, running more Python, or copying a number into a code literal does not erase its source.

Same-Run execution uses recorded grants while preserving content and source identity checks. Later delivery, retention and new-Run reads follow their respective entry-point rules. “We calculated it before” is not permanent access authority.

Method material and business data also differ. A Host-verified method document from the currently bound Skill should not be treated as unknown business data. The model calling arbitrary text “a method” cannot establish that identity. The distinction rests on actual material provenance, not prose appearance.

Failures require similarly precise interpretation:

| Outcome | What the next step can rely on |
| --- | --- |
| Ordinary code exception; process stopped and file inventory complete | Diagnostics can guide repair; files already written may remain because there was no automatic rollback |
| Input or capacity denial before execution | No code ran; the denial is not a calculation result and should not needlessly destroy previously healthy state |
| Execution settlement or file state is unknown | Invalidate the affected workspace rather than trusting its intermediates |
| Recovery finds an existing completed receipt | Replay its recorded result without rerunning code; the receipt cannot resurrect lost scratch |

“Retry until success” is not a substitute for knowing whether execution started, which effects are settled and where safe continuation begins.

Time is also an input. The task's saved time anchor differs from the current reference clock; a fresh query does not make an old fact current. The normal production path cannot infer a user's timezone merely from the task timestamp. Without a trusted timezone, it remains unknown. “The past year” needs an explicit reference time and actual interval rather than drifting with the last query.

## 9. What to Connect First in a Similar System

Keep the complete task and a few working questions, then connect a path that can explain inputs, execution, outputs and the next action:

1. **Let findings change actions.** Distinguish missing evidence, missing transformation and missing explanation; a checklist of actions is not a research result.
2. **Give inputs exact identities.** Separate visible projections from stored views, admit them within the execution's grant, and reject oversize samples rather than truncating them.
3. **Make continuation state explicit.** Reuse files within one healthy execution, without hidden interpreter variables or sibling scratch sharing.
4. **Keep the question's boundaries in the output.** Report actual periods, definitions and gaps; distinguish previews, complete results and deliveries.
5. **Be honest about failure and completion.** Repair ordinary errors, invalidate uncertain state, and recognize a useful limitation statement as a valid outcome.

Historical diagnoses observed repeated computation, but also repeated publication, mistaken inference and failure to converge. They span different versions and are not a controlled quality comparison of the current implementation. Engineering contracts can verify isolation, identity and receipts; they cannot certify arbitrary formulas, evidence sufficiency or answer quality.

The ultimate test of adaptive research is whether **new material changes the next action and helps the user receive a more trustworthy, understandable answer**.
