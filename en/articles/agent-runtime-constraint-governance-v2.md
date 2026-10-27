# The Agent Found Plenty of Sources—Why Couldn't It Deliver an Answer?

One of the most frustrating things about building an investment-research Agent is not that the model refuses to use tools. It searches, reads pages, and records numerous actions—yet the user still receives no finished answer.

Across several versions of one research scenario, we investigated failures labeled **provider unavailable**, **search quota exhausted**, **source handle invalid**, and **publication rejected**. Some Runs advanced and delivered partial material but still did not finish normally.

Viewed separately, each looks like a missing check or a limit that needs increasing. Together they reveal a deeper problem: **the working conditions offered to the model are not always consistent, and misleading error attribution sends diagnosis in the wrong direction**.

The cases below come from **September 25–26, 2026 development investigations**. They are neither production incident statistics nor repeated measurements of one fixed version.

## 1. One Research Question, Several Different Failure Classes

The model chooses the next evidence to inspect and how to present a conclusion. Host Runtime executes tools, records results, validates Publication candidates, and settles the Run.

### Failure 1: local budget exhaustion mislabeled as Provider outage

An early Run ended with **PROVIDER_UNAVAILABLE**. That label naturally suggests upstream failure, network issues, rate limits, or a different model.

The underlying records pointed instead to **our own diagnostic proxy**. It forwarded the approved number of requests, then refused the next one. Its **local budget** denial propagated as a Provider-related failure.

A subsequent regression reproduced the classification error: HTTP **429** bearing a local-budget marker was treated as a retryable rate limit and transport-transient failure.

HTTP status alone is insufficient. An upstream transient 429 might justify bounded waiting. A local Run quota cannot be fixed by waiting or switching Providers; doing so would evade the authorized budget.

The incident also exposed an accounting mismatch. A model request for **entry interpretation/routing**, before Research proper, consumed part of the same overall allowance. Runtime and proxy did not count it the same way.

The fundamental bug was not simply "too few model calls." Two components disagreed about **which calls belonged to the same budget**.

### Failure 2: search returned a handle that reading called invalid

Our Web reader does not accept arbitrary URLs from the model. Search registers a **Run-scoped source handle** that the model can use in a later read.

During one investigation, the model tried to read a handle it had actually received, but Host returned **INVALID_SOURCE**. The safety record established that the rejected handle had appeared in a search result shown to—and subsequently consumed by—the model. This was not a simple fabricated ID.

The historical snapshot contained contradictory limits:

| Subject | Historical configuration / observation | Exposed problem |
| --- | --- | --- |
| Web Run time versus handle lifetime | 90-second allowed Run window; 60-second handle lifetime | A valid ongoing investigation could outlive its earlier source handles |
| Search capacity versus registration capacity | Up to 12 searches × 10 results = 120 potential results; registry capacity 50 handles | Permitted discovery could exceed registrable references |
| Handling registration failure | Failed registration not correctly accounted for in returned results | A source could be returned as available without successful registration |
| Observed Run | 12 application requests; of four reads, two succeeded and two returned INVALID_SOURCE; no accepted Publication | Work consumed budget but did not produce an accepted answer |

These limits governed **the same research** at different layers. They should not be treated as independent numbers whose combination is irrelevant.

There is an important evidence limit. Available records cannot identify which of the **two invalid handles** failed from expiry and which from capacity. Later offline tests reproduced both defects and the erroneous return of failed registrations. That does **not** establish a specific cause for each historical failed read.

The same Run also suffered a separate Publication issue: a candidate citation did not match an evidence ID in a successful read result. The handle problem cannot, by itself, explain the entire failed delivery.

Still, the contradiction is obvious. The model was issued a source entry, planned to read it next, and Host refused to recognize it. It then spent additional resources handling the rejection rather than reading the missing body.

Repeating "prefer official sources" in a Prompt cannot fix an invalid source handle. The model needs a **legally usable entry point**.

### Failure 3: finalization had no space to repair a rejected candidate

The early implementation reserved one model request for finalization. In one diagnostic Run, the model used it to propose a Publication; Host rejected the candidate. No second correction opportunity remained, and the terminal reason did not clearly distinguish finalization exhaustion.

Publication here means submitting a **candidate answer** for server validation and commit—not merely saying "research complete" in prose. A missing citation binding, for example, can cause rejection.

However, the precise validation reason for that historical rejection was no longer recoverable. The diagnostic script had filtered its reason code and the isolated database was removed. We know the candidate was **not accepted**; we cannot invent its exact rejection cause.

The important flaw was this: **we reserved enough space for the happy path to submit, but not for a correctable Publication rejection**.

Earlier research requests, tools, and drafting had already incurred cost. Converting them into a valid delivered answer still required requests, time, and output capacity. Naming that step "finalization" does not make it free.

## 2. Why Increasing One Limit Is Not Enough

These failures were observed across multiple investigations, not one fixed sequence. Other failures, including model-stream interruption, occurred too and must not be reclassified as budget issues for narrative convenience.

Increasing individual limits can be justified. But a higher search limit does not expand a lower-level handle registry. A longer Run deadline does not extend an independent handle TTL. More exploration does not automatically reserve capacity for correcting Publication.

The local constraints each had reasonable motivations: external-call control, memory bounds, and handle validity. What was missing was **compositional consistency**—could their combination support a complete legal path through the task?

We did not set out to "make every number larger" or build a giant new budget platform. We required each constraint to identify **who owns it, what it counts, what scope consumes it, which operation stops when it expires, and how it is represented to downstream layers**.

## 3. Give Every Constraint an Explicit Owner

We replaced bare constants in the loop with **identified policy definitions**.

A historical example of a finalization reserve:

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

The number **2** was a choice in the sampled version, not a universal recommendation.

The identity tells us whether this counts requests, tokens, or tool actions; who may change it; and which default and hard ceiling apply. Equal current default/maximum values do not make the concepts interchangeable.

Other constraints remain with their original Owners: Web Gateway defines search and shared Web usage; the reader owns page segments. Runtime references them rather than copying shadow constants.

At composition time, conflicting declarations of the same ID—Owner, version, unit, or value—cause rejection. This check governs **declared policies**; it does not automatically discover every hard-coded limit in a repository.

Budgets cannot be enlarged because the model suggests it. Server configuration, transport capabilities, authorized scope, remaining usage, and phase determine eligible resources. Ordinary user text and tool payloads have no authority to change those facts. Invalid configurations may be rejected outright; this is not simply **Math.min** applied everywhere.

The value emerges during maintenance. A higher search bound prompts review of registration capacity; a longer deadline prompts review of handle lifetime, per-call timeouts, and outer deadlines. There may still be cross-constraint relationships to validate, but the Owners are no longer mysterious.

## 4. Search Exhaustion Does Not Mean All Work Must Stop

A regression showed a mismatch between **model-visible tools** and **actually executable tools**. Host had recorded exhausted search capacity, yet the next model request still exposed search. In other paths the read budget was already zero but the visible contract was stale.

We changed the next-turn tool projection to reflect known Host facts.

If only the **search-call quota** is exhausted, hide **new search** while retaining reading if its own authorization, budget, and lifetime still permit it.

If the **overall Web deadline** has elapsed, new search and reading may both be stopped.

In **finalization-only**, new evidence gathering and capability requests are absent.

A teaching example—not a production wire contract—assumes that existing read handles, permission, and other budgets remain valid:

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

The model still decides which source to read next and whether enough evidence exists. Runtime establishes objective quota facts. And a model-visible tool list does **not** replace Host authorization at actual invocation.

Handle registration required a separate repair: align lifetime with effective Web eligibility, provide registry capacity adequate for approved search scale, and never return a failed registration as a valid source.

When only some registrations succeed, preserve the valid entries and clearly report incomplete coverage rather than discarding everything or issuing fictitious handles.

None of this guarantees every read will succeed. It avoids forcing the model to compensate for source entrances that never legally existed.

## 5. Reserve Finalization at Admission, Including Bounded Corrections

A Run reserves a portion of total request capacity **when admitted**:

~~~text
Exploration request allowance =
  Authorized total request allowance - Finalization reserve
~~~

Entry requests count against the same total. Every subsequent request also consumes the original ledger. The reserve does **not** increase the overall limit or create an emergency authorization bypass.

An invalid reserve—over its hard maximum or total authorized capacity—fails admission.

When research quota or working time no longer permits ordinary investigation, but the original final-output reserve and hard deadline remain valid, the Run transitions into **finalization-only**.

The model may use existing evidence to propose Publication, correct a rejected candidate within a bounded allowance, or propose termination. It cannot spend the finalization reserve on another Web search.

The diagram shows budget-driven transitions, not every completion or failure path. Cancellation, revoked authorization, and unrecoverable faults retain their own decision rules.

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

Requests and **time** must be checked together. One unused request is worthless if the outer deadline has expired. Input capacity may also prevent the request from being sent.

That is why verification must include outer deadlines and Recovery, not just loop-counter unit tests.

Later versions gave a correctable Publication rejection a bounded follow-up opportunity. That consumes capacity previously available for exploration; the appropriate reserve size still requires real-model behavior and diagnostic evidence.

Also, **having text is not the same as completing the task**. Publication checks remain mandatory; a finish proposal still passes Host verification. Previously committed eligible text may survive when the rest of the task remains unfinished.

## 6. Recovery Cannot Mint a Fresh Budget

A Run can be interrupted or restarted, possibly after deployment of a different default policy.

Two facts must stay separate:

- The **admission snapshot** records the constraints originally approved for the Run.
- The **durable usage ledger** records what the Run actually consumed.

A snapshot is not an extra balance. It does not entitle the Run to a newer, more generous deployment default.

Suppose an old Run had ten approved calls and consumed eight. A subsequent deployment permits new Runs twenty by default. Resuming the old Run cannot switch it to twenty—or reset its usage to zero.

There is an implementation limit: the specification demands preservation of old limits or lawful narrowing, while the sampled Recovery adapter checks important contracts (total budget, action budget, protocol) for consistency and rejects mismatches. It does **not** transparently migrate arbitrary configurations.

Retries have a similar risk. A retryable failure should have one clearly responsible layer. Fallback attempts consume the same original allowance and remain subject to the same deadline.

Otherwise SDK, Gateway, and Runtime could each retry a failure and report "only one retry" in their own logs. This is a **composition risk the design prevents**, not evidence we observed all three independent retry layers executing at once.

Input fitting follows related principles. Shorten the *model view*, preserving the original user request and tool-call/result pairing, without deleting persisted facts. If the projection still exceeds capacity, reject **before dispatch**.

Byte-based input preflight is not the same as Provider token metering; fewer bytes do not establish an actual cost reduction.

## 7. Did the Fixes Guarantee Successful Answers?

No. The subsequent partially successful Runs are important counterexamples.

In one diagnostic after entry-call accounting was aligned, a local proxy quota no longer blocked the Run and search-tool narrowing worked. Yet two finalization requests were consumed by a rejected Publication and its accepted correction. The model never proposed **finish_research** before budget exhausted; the Run remained **partial**.

This shows that a correction opportunity does not automatically provide enough room for both repair and completion.

A later run accepted a Publication on the first proposal. Its records linked read evidence consumed by later model requests to a durable Publication, and delivery occurred. Yet the Run still reported **PARTIAL_RESULT**. The Reviewer output was truncated, leaving the quality assessment **inconclusive**—neither proven good nor proven bad.

Those observations followed several combined fixes. They cannot isolate the causal benefit of one limit, Prompt, or code change. They establish narrower facts: a specific read entered a later request, a specific body was accepted and delivered, and answer quality remained unverified.

Targeted regressions supported more precise improvements:

- Local proxy quota refusal keeps its own classification.
- Exhausted search disappears from the next tool contract.
- Handle validity, capacity, and failed registrations receive dedicated checks.
- Request exhaustion and Recovery do not erase consumed usage.
- Later soft constraints do not discard already legal Publication commits.

For example, a local proxy refusal retains **PROVIDER_CALL_BUDGET_EXCEEDED** with classification **local_budget_exhausted**. Tests also check that it is not treated as upstream throttling and retried or cooled down incorrectly.

This is more informative than "all tests green." Some real execution contradictions were corrected; remaining failures were not magically solved.

### What Changed—and What Remains Unproven

Historical runs exposed real conflicts in the ownership of local quota errors, the visibility of exhausted tools, and the room left for final-answer correction. Some were fixed at their original call sites, while incomplete research and inconclusive reviewer results retained their status. These changes alone cannot quantify improvements in overall task success, cost, or latency.

<!-- open-etf-case:budget@62b70d1a512ad97fc560ed0bf84351cc091ae048 -->
### Stop the second model request at the root budget

The [root-budget refusal case at this fixed public snapshot](https://github.com/hpoenixf/open-etf-agent/blob/62b70d1a512ad97fc560ed0bf84351cc091ae048/test/cooperation-integration.test.mjs) reduces ownership of actual usage to one explicit counterexample.

After installing dependencies according to the README at the linked fixed snapshot, run:

```bash
node --test --test-concurrency=1 --test-name-pattern='^3\.3 root budget refusal stops before a second model request$' test/cooperation-integration.test.mjs
```

The model budget is 1. The first request proposes and completes one read; the second must be refused before dispatch. Assertions require one actual model call, a Run code of `ROOT_BUDGET_EXHAUSTED`, and root usage `{ model: 1, tool: 1 }`.

A `failed` Run is the expected protective outcome here; a passing test does not mean the research completed. This slice does not implement the article's finalization repair reserve, full constraint governance, or task-quality evaluation.
<!-- /open-etf-case -->

## 8. What I Would Inspect First Next Time

The important lesson was not the final numeric settings.

I would begin by tracing how constraints compose along the work. How many results can allowed searches produce? How long must their handles remain readable? Is there enough time and budget to read and synthesize those sources?

Each limit can be individually valid while their combination makes a full task impossible.

I would then treat final delivery as a **normal workload**. Drafting, validation, correction, and explicit completion all consume resources. They do not become free merely because they happen after exploration.

I would keep distinguishing resource limits from semantic decisions. Host can know that search capacity reached zero; the model should still decide whether existing evidence is sufficient and what the most useful next step would be.

For a small Agent, we need not immediately adopt a comprehensive policy catalog, snapshots, and Recovery layer. Start by correctly naming actual counters and error Owners. Formalize relationships as soon as multiple modules independently interpret the same fact or Runs need to survive restarts.

Instead of simply asking, "Is the model weak, or should we increase the budget?", I now ask:

**From search through source reading, Publication, and termination, is there an authorized, consistent resource path that can actually finish the task?**

The model may still fail. But the system must not promise access to sources it has already invalidated, reject a correctable candidate after consuming all its repair capacity, or describe its own quota refusal as a Provider outage.
