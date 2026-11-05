---
description: "Why can a Child be exhausted while Main still has capacity, and why can a publication turn be exempt while real requests still run out? Current execution-scoped budgets, shared limits, finalization and retained receipts explain the trade-offs."
readingBrief:
  takeaways:
    - "Fresh Runs account for Main and each Child's model requests separately; Root still owns shared time, actions, Stop and genuine external caps, while older Runs retain their policy."
    - "Logical turns, physical requests, phase allowance and time are distinct; a publication turn can be exempt while its request and elapsed time remain charged."
    - "Tools narrow locally for known limits, finalization reserves add no total capacity, and recovery reads original policy and occupancy rather than refunding unknown attempts."
  appliesTo:
    - "Multi-agent research that must preserve Main synthesis opportunities, explain local exhaustion, and govern finalization and durable wakes under original admission."
  notFor:
    - "Universal budget recommendations, guaranteed task completion, or treating mechanical qualification as evidence of production deployment, better quality or lower cost."
---
# The Agent Found Plenty of Sources—Why Couldn't It Deliver an Answer?

A Child exhausts its allowance while Main still needs to compare results. An answer commits but the Run never confirms completion. A status message says two finalization requests remain while physical request capacity is already zero. Asking “how much budget remains?” is insufficient. **Whose budget, which unit, which phase, and is another request actually admissible?**

ETF Agent separates four responsibilities: freeze policy and identity at admission, account for Main and Child requests separately, narrow capabilities under shared constraints, and deliver or settle through original records. Budgeting provides a viable execution path. It does not decide whether evidence is sufficient or whether Publication succeeded.

<span id="_2-why-increasing-one-limit-is-not-enough"></span>

## 1. One Original Ledger Does Not Mean One Shared Balance

Start with units and ownership.

| Resource | Current primary owner | What it does not substitute for |
| --- | --- | --- |
| Main model requests and logical turns | Main admission and consumption, including its Entry requests | A Child's remaining allowance, provider tokens, or money |
| Child requests and retries | Each committed execution identity | Another Child's or Main's unused allowance |
| Time, tool actions, Stop, and lifecycle | Original Root and responsible modules | Independent Child requests cannot remove these shared boundaries |
| Genuine Task, Provider, or diagnostic aggregate caps | Their original owners, intersected with local capacity | Local remaining calls cannot override an outer cap |
| Source handles, registry capacity, and input size | Original tools and transports | Model allowance does not make a handle valid or an input fit |

The request allowance counts request-admission units, not provider tokens, actual monetary cost, or observability spans. An admitted request whose dispatch outcome is still unproven can retain occupancy; the unknown rules below preserve exactly that distinction.

This is a specific trade-off. A shared request pool makes a task-wide ceiling simple, but cumulative Child exploration can consume Main's synthesis opportunities. Fresh admission now explicitly selects `independent-execution-budget@3`: Main and each Child have separate accounts, while Root observes aggregate consumption and retains shared controls. The implementation reuses the original durable ledger and admission transactions, rather than creating unrelated accounting systems for every agent.

The source's `research-runtime-policy@11` defaults are below. They are implementation policy values, not universal recommendations or proof that a deployment currently uses the defaults:

| Execution | Default logical turns | Default model-request admissions |
| --- | --- | --- |
| Main | 30 research + 6 finalization | Base 57, covering Entry, stage retries, protocol repairs, and protected reserve |
| Each Child | 18 research + 6 finalization | 30, including that execution's 6 retries |

A Root admits at most five cumulative Child identities, not five reusable slots that can be canceled and replenished forever. Each newly committed Child adds one turn and one request to Main's original baseline, up to five. That is ordinary spendable capacity, not guaranteed to survive until the Child returns. Independent allowances increase theoretical total exposure; shared time and genuine external caps may therefore stop the task earlier.

Recovery does not enroll old Runs in this new policy. Historical records without an independent-policy identity retain legacy shared-pool interpretation, and older independent versions keep their own meaning. “Debit the original ledger” no longer means “every execution spends one common model-request balance.”

One source discrepancy matters: current code defaults to 60/120 minutes of active/wall time, while one constraint-Spec scenario still says 15 active minutes. This article follows current code without calling the stale sentence a new implementation bug or inferring a deployment's duration. Actual Runs retain their original admission values and applicable narrower limits.

<span id="failure-1-local-budget-exhaustion-mislabeled-as-provider-outage"></span>
<span id="_4-search-exhaustion-does-not-mean-all-work-must-stop"></span>

## 2. Narrow Tools Locally, Not Every Capability at Once

The next tool surface is assembled from Host facts: original grant, phase, local balance, shared action/time limits, and relevant result identities. **Visibility is a projection, not a reservation.** Concurrent executions may compete for the last unit; actual dispatch still needs the original admission transaction.

- Exhausted search calls stop new search. Reading existing results still depends on its own actions, handles, and deadlines.
- Exhausted shared read/action capacity cannot be bypassed by renaming the same action “local” or “finalization.”
- Main finalization stops external exploration, new Children, scope requests, and Deep upgrades. Already admitted local computation/export can continue only within remaining action, request, and time capacity.
- Child finalization primarily retains its own handoff, not Main's publishing authority. A Child's local exhaustion is not Root completion, but Root Stop, hard deadlines, and terminal state still constrain every descendant.

This retained teaching example illustrates a local relationship. Names and fields are illustrative, not the current wire schema. It assumes valid read handles, original permission, and sufficient remaining resources:

~~~json
{
  "input": {
    "phase": "research",
    "searchCallBudgetExhausted": true,
    "runDeadlineExhausted": false
  },
  "projection": {
    "removedTools": ["search_public_sources"],
    "retainedTools": [
      "read_public_source",
      "publish_answer",
      "finish_research"
    ]
  }
}
~~~

The model still decides what to read, whether evidence suffices, and how to explain gaps. Runtime enforces known boundaries rather than inventing a keyword-driven research plan.

Error attribution needs equal precision. An original diagnostic proxy exhausted its local allowance and returned HTTP 429 with a local marker, but the error was classified as retryable supplier throttling. That refusal now retains `PROVIDER_CALL_BUDGET_EXCEEDED` / `local_budget_exhausted`; waiting, cooling down, or changing suppliers does not create allowance. Who refused what determines whether a retry remains legitimate, even when the HTTP status is identical.

<span id="_5-reserve-finalization-at-admission-including-bounded-corrections"></span>

## 3. Finalization Is Protected Work, Not a Success Voucher

Finalization includes writing, correcting rejected proposals, committing, and confirming completion. Current policy protects capacity at the start instead of handing output whatever exploration happens to leave behind.

One layer of Main's own request accounting can be understood as:

~~~text
Exploration request allowance =
  Authorized total request allowance - Finalization reserve
~~~

Actual availability also depends on phase allowance, held/unknown requests, time, and external caps. Reserve comes from the original total; it is not a free emergency extension. When work can no longer continue but output remains admissible, the phase can enter `finalization-only`. Once there, a later larger resource view cannot reopen exploration. Cancellation, hard deadlines, and unsafe continuation do not automatically receive a finalization opportunity.

The diagram shows Main's budget transitions, omitting normal early completion and Child branches:

~~~mermaid
graph TD
AdmitRunAndBudget --> ResearchPhase
ResearchPhase --> CheckResearchBudget
CheckResearchBudget --> ContinueResearch
ContinueResearch --> ResearchPhase
CheckResearchBudget --> CheckFinalBudget
CheckFinalBudget --> StopNewRequests
CheckFinalBudget --> FinalizeOnly
FinalizeOnly --> PublishOrRevise
PublishOrRevise --> HostChecksFinish
HostChecksFinish --> FinishRun
HostChecksFinish --> CheckFinalBudget
~~~

**Conditions:**

- **CheckResearchBudget → ContinueResearch:** yes.
- **CheckResearchBudget → CheckFinalBudget:** no.
- **CheckFinalBudget → StopNewRequests:** no.
- **CheckFinalBudget → FinalizeOnly:** yes.
- **HostChecksFinish → FinishRun:** yes.
- **HostChecksFinish → CheckFinalBudget:** no.

Three kinds of remaining capacity are easy to confuse. In two October 2026 historical samples, one had consumed physical 42/42 yet still reported two reserved finalization units. Another had used 38/42 but exhausted its finalization phase 3/3. The first lacked physical capacity; the second lacked phase capacity. Seeing four aggregate units before the second sample's final publication response did not imply another Main opportunity afterward. These records must not be merged into one cause, and controlled prompt corrections do not prove the model will subsequently finish.

Current accounting also separates **logical turns from real requests**. When sealed Main proposals/receipts establish a `send_answer_part` call, the turn is exempt from logical-turn consumption whether the effect is accepted, rejected, failed, or unknown. Physical requests and elapsed time remain charged. Missing exact call evidence grants no exemption; an unsealed unknown request retains its occupancy and cannot be treated in advance as a free publication turn. Publication is not miscounted as another exploration turn, but repeated publication does not acquire unlimited free calls.

Having text, accepted Publication, normal Run completion, and acceptable answer quality remain different outcomes. Without a legal next request, Runtime does not call the model once more to explain exhaustion. Independently eligible existing text stays with its original Publication/History path.

<span id="_6-recovery-cannot-mint-a-fresh-budget"></span>

## 4. Wakes Retain Policy; Restart, Cancellation, and Unknown Do Not Mint Refunds

The **admission snapshot** records policy, units, identities, and ledger bindings. **Durable usage** records consumed, protected, and ambiguous occupancy. A snapshot is not a second resettable balance.

Consider a teaching example: an old task admitted ten requests and used eight; a later deployment defaults new tasks to twenty. Readback still interprets the original ten-request contract and usage. It neither adopts twenty nor replaces the record because new defaults became smaller. Applicable narrower Host caps may still reduce actual availability; preserving a snapshot does not exempt it from outer limits.

“Recovery” also has a bounded meaning. Ordinary re-entry after an abandoned Root currently settles interruption and reads saved output rather than arbitrarily restoring the old graph. A genuinely accepted Human/Child control wake can continue under the original Run, checkpoint, grant, and fence. Explicit later continuation can create a new Run under separate admission, not refill the old one for free. The current adapter reads the original budget and checks protocol/graph identity; today's Factory budget defaults do not replace admission.

Unknown sends cannot be settled by inference. Timeout, cancellation, lease expiry, and process restart do not prove no request was sent. Only the original owner proving `not-dispatched`, with the old executor fenced against a late send, permits release under that ledger's rules. Releasing a Task hold does not automatically refund Root's conservative request debit. Replaying an already settled receipt neither dispatches nor charges again.

A real October 2026 diagnostic exposed this mismatch: its harness allowed four physical transports while Runtime believed 38 remained. The fifth local refusal happened after a shared admission lease was obtained, leaving unknown occupancy. Unused overall authorization could not erase it. Subsequent allowance-query and client-timing changes did not receive another paid confirmation; they cannot be described together as a fully verified live path.

Retries need one explicit responsible layer and must debit the original allowance/deadline. SDK, Gateway, and Runtime can each say “only one retry” while their composition exceeds expectations. This is a design risk to prevent, not evidence that all three retries were observed simultaneously. Input fitting likewise narrows the model view while preserving current user text, paired tool records, and durable facts. If it still cannot fit, refuse before dispatch; fewer bytes are not measured monetary savings.

<span id="_1-one-research-question-several-different-failure-classes"></span>
<span id="failure-2-search-returned-a-handle-that-reading-called-invalid"></span>
<span id="failure-3-finalization-had-no-space-to-repair-a-rejected-candidate"></span>
<span id="_3-give-every-constraint-an-explicit-owner"></span>
<span id="_7-did-the-fixes-guarantee-successful-answers"></span>

## 5. Why Limits Must Compose: Three Real Counterexamples

These September 25–26, 2026 development diagnostics came from different versions. They are neither production incident statistics nor repeated trials of one version. They explain choices, not current defaults.

**A source handle must survive its legitimate usage window.** A search handle actually appeared in a subsequent model request, but reading returned `INVALID_SOURCE`; fabrication was not a sufficient explanation. The historical combination was:

| Subject | Historical configuration / observation | Exposed problem |
| --- | --- | --- |
| Web Run time versus handle lifetime | 90-second allowed Run window; 60-second handle lifetime | A valid ongoing investigation could outlive its earlier source handles |
| Search capacity versus registration capacity | Up to 12 searches × 10 results = 120 potential results; registry capacity 50 handles | Permitted discovery could exceed registrable references |
| Handling registration failure | Failed registration not correctly accounted for in returned results | A source could be returned as available without successful registration |
| Observed Run | 12 application requests; of four reads, two succeeded and two returned INVALID_SOURCE; no accepted Publication | Work consumed budget but did not produce an accepted answer |

Available safe records cannot assign each invalid read to expiry or capacity. Reproducing both defects offline does not reconstruct each historical cause. The same Run separately proposed a citation that did not match evidence from a successful read, so handle faults cannot alone explain failed delivery. The transferable checks are discovery scale, registrable capacity, required lifetime, and whether failed registrations are still returned as usable entries. Partial registration failure should preserve successful entries with coverage, rather than leaving all repair work to the model.

**One publication opportunity may not cover repair.** An early single-request finalization reserve left no correction after rejection. The diagnostic filtered the rejection code and the isolated database was later removed, so its precise cause remains unknown. A later sample spent two finalization requests on rejected→accepted Publication but never proposed `finish_research`; it remained partial. Do not fill the first gap with an invented citation cause or conclude from the second that reserving two always completes a task.

**Accepted and delivered is not quality-qualified.** A later sample's first Publication was accepted; records linked consumed reads in subsequent model input to durable text, and delivery completed. The Run still reported `PARTIAL_RESULT`, while a truncated Reviewer output left quality `inconclusive`, neither passed nor failed. Other samples suffered model-stream interruption, which must not be relabeled budget failure for a tidy narrative.

These observations motivated identified constraints. The following historical `policy@3` declaration illustrates why version, unit, and owner travel together. Its value 2 is not today's default:

~~~json
{
  "id": "research-runtime/finalization-request-reserve",
  "owner": "research-runtime",
  "version": "research-runtime-policy@3",
  "unit": "requests",
  "defaultValue": 2,
  "hardMaximum": 2
}
~~~

Conflicting owner, version, unit, or values for one ID cause rejection at composition. Declared-policy checks do not automatically find every bare constant. Search, page segmentation, and handles retain their module owners; Runtime references them rather than copying another universal constant list.

## 6. When Are Simple Limits Enough?

| Approach | When it fits better | Trade-off or remaining work |
| --- | --- | --- |
| Single-agent step limit and timeout | Short tasks without durable wakes and relatively simple step/call relationships | Lightweight, but steps do not automatically count physical requests or money |
| Shared model-request pool | One intuitive task-wide ceiling with few Children | Child exploration can consume Main synthesis capacity unless protected separately |
| Per-execution requests with Root controls | Several Children while Main needs synthesis and delivery opportunities | Larger total exposure, durable identities, legacy interpretation, and genuine outer caps |
| Durable workflow execution | Long waits, cross-process coordination, and retries dominate | Can carry application policy, but model requests, turns, actions, and Publication still need defined resource semantics |

[LangGraph's recursion limit](https://docs.langchain.com/oss/python/langgraph/graph-api#recursion-limit) caps super-steps; parallel nodes can share a super-step, so it is not directly a physical-model-call count. [Temporal's timeout documentation](https://docs.temporal.io/develop/typescript/workflows/timeouts) distinguishes Execution, Run, and Task time boundaries. These capabilities can support this design rather than constituting incompatible weaker alternatives. The application still defines its resource units and external-effect accounting.

ETF Agent retains execution identity and separate debits in original Root transactions to preserve existing Publication, tool, and Recovery interfaces while reducing Child pressure on Main. Versioned policy and uncertain occupancy add complexity, and conservative unknowns can block further work. Those costs become worthwhile when multiple executions, persistent tasks, or real external caps actually require them.

## 7. A Runnable Public Counterexample

<!-- open-etf-case:budget@e1b8e4edde724548fab16d8ca4b205379bfa7f30 -->
### Stop the second model request at the root budget

The [root-budget refusal case at this fixed public snapshot](https://github.com/hpoenixf/open-etf-agent/blob/e1b8e4edde724548fab16d8ca4b205379bfa7f30/test/cooperation-integration.test.mjs) reduces ownership of actual usage to one explicit counterexample.

After installing dependencies according to the README at the linked fixed snapshot, run:

```bash
node --test --test-concurrency=1 --test-name-pattern='^3\.3 root budget refusal stops before a second model request$' test/cooperation-integration.test.mjs
```

The model budget is 1. The first request proposes and completes one read; the second must be refused before dispatch. Assertions require one actual model call, a Run code of `ROOT_BUDGET_EXHAUSTED`, and root usage `{ model: 1, tool: 1 }`.

A `failed` Run is the expected protective outcome here; a passing test does not mean the research completed. This slice does not implement the article's finalization repair reserve, full constraint governance, or task-quality evaluation.
<!-- /open-etf-case -->

<span id="what-changed—and-what-remains-unproven"></span>
<span id="_8-what-i-would-inspect-first-next-time"></span>

## 8. What Evidence Would Make This Design Worthwhile?

Independent Child accounting and handoff have original provider-free, isolated PostgreSQL, and bounded cross-process integration evidence. Material from five Children reaching a subsequent Main request proves receipt, not semantic adoption. Formal closure does not qualify deployment, live quality, or cost comparisons. This article inspects current code and existing records; it does not rerun models or recast stage evidence as a new end-to-end acceptance.

Check outcomes separately: does local Child exhaustion preserve Main's legal opportunity, does refusal identify the real owner, does the final response still need a completion action, does unknown occupancy stay in its original ledger, and which claims does the delivered answer support? Success, cost, and latency need an independently controlled comparison using the same tasks, sources, and budget definitions.

**Budgeting cannot guarantee that the model chooses well. It can provide a path whose resource meanings agree, allowing useful delivery or an honest stop.**
