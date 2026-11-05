---
title: "Scheduled Agent Research Without an Always-Running Conversation"
description: "Separate confirmation, due opportunities, research and notification to preserve identity across restarts; public Worker and single-occurrence examples remain smaller than the complete scheduling system."
readingBrief:
  takeaways:
    - "Persist the user-confirmed task definition, not an endless model loop; each due time remains subject to authorization, overlap and resource admission."
    - "Condition checks distinguish true, false and unknown; first-match triggers latch on actual Task creation, and unknown observations cannot re-arm an edge."
    - "Keep triggering, research, publication and notification separate; recover uncertain commits by their original identity, and retry notices without rerunning research."
  appliesTo:
    - "Services adding scheduled or conditional research outside a conversation, with restarts, duplicate triggers and notification retries."
  notFor:
    - "Treating the public Worker or single-occurrence example as a complete scheduler, or synthetic checks as proof of live-market integration or long-term review quality."
---

# Agents Don't Need to Think Continuously: How Research Continues on Schedule After a Conversation Ends

“Check my holdings every Wednesday evening, and notify me only if something important has changed.”

The hard part is not getting the model to say yes. After the browser closes or the service is down for hours, which period should run, which approval applies, and how can the system tell whether a report already exists?

The current design persists a **user-confirmed agreement** and requests finite research when a time or condition qualifies. Its useful trade-offs are explicit: accept a missing period instead of quietly queuing old research; do not turn missing observations into false; do not treat a lost acknowledgment as proof of no effect. We follow the current execution path, then use two public slices to inspect process handoff and one-occurrence admission.

<span id="_5-six-facts-from-trigger-to-report-must-remain-separate"></span>

## 1. Separate Six Facts Between Agreement and Notification

Start with the current path: Schedule retains the confirmed definition and evaluates opportunities; Task owns this job's deadline and total budget; finite Runs perform research; Publication saves the answer; Task History and Notice separately handle reading and notification.

~~~mermaid
flowchart TD
  U["User request"] --> P["Agent proposal"]
  P --> A["Authenticated user review"]
  A --> C["Confirmed schedule revision"]
  C --> O["Calendar slot or observation"]
  O --> D["Trigger decision"]
  D --> S["Suppressed, denied or unknown"]
  D --> T["Task admission"]
  T --> R["Finite research Run"]
  R --> B["Committed Publication"]
  R --> F["Failed or partial Task"]
  F --> H["Independent Task History"]
  B --> H
  B --> N["App Notice"]
~~~

Trigger decision does not imply an automatic path to Task admission. Definition revision, permissions, resource budget, cooldown and overlap must all pass; other outcomes are recorded without launching the model. If research later fails, its Task identity and legitimate outcomes remain, rather than retroactively deleting the trigger fact.

The six facts are:

1. Definition confirmed.
2. Due time or condition observed.
3. Task admitted.
4. Run actually executed.
5. Report committed.
6. Notification delivered.

Each belongs to its existing owner.

A Task may create a subsequent Root Run under explicit durable continuation intent, but all Roots stay within the same Task deadline and total budget. A failed Run, a casual “continue” in model text, or a disconnected SSE stream does not authorize another Root.

Historical reports are not written back into the chat where the schedule was originally confirmed. Each occurrence has an independent Task History entry. Reading it later or starting a follow-up is a separate, authenticated access or conversation action.

<span id="_2-convert-a-natural-language-agreement-into-a-confirmable-definition"></span>

## 2. Confirm Only What the Execution Path Can Enforce

We separated the process into **agent proposal** and **user confirmation**.

A proposal may fill in trigger times, time zone, research instructions, source scope, delivery location and resource limits. Future unattended execution is permitted only after a user confirms an effective, versioned definition through an authenticated entry point.

A teaching example, not literal production API JSON:

| Property | Confirmed agreement |
| --- | --- |
| Trigger | Wednesdays at 20:00 in a specified IANA time zone |
| Research | Check authorized portfolio snapshots and fund sources; create a review for that period |
| Limits | Bounded model requests, tool attempts, deadline and shared capacity per run |
| Delivery | Report stored in independent Task History; app notice points to the committed result |
| Effective version | Only the revision currently confirmed by the user may create future Tasks |

This also helps when editing a schedule. Adjusting descriptive wording should not rewrite all previous history. Changing sources, triggering conditions, permissions or execution limits requires renewed inspection and confirmation of the effective scope. A Task already created keeps the definition revision under which it was admitted; new edits must not silently upgrade it.

We retained existing once and weekly semantics and hashes, then introduced explicitly versioned at and interval definitions. Unsupported schedule types or versions are rejected rather than guessed into the “closest” mode.

**A field being expressible is not proof the execution path can enforce it.** Nonempty `sourceIds`, `methodIds` or `skillIds` restrictions are not yet fully supported by execution admission, so the original definition service rejects them during draft, review and confirmation. It must not obtain confirmation first and demote the restriction to prompt guidance. Policy processing cannot erase restrictions from the original proposal either. The portfolio-review table is a needs illustration, not a claim that any source-restricted weekly report is already runnable.

Automatic execution also excludes runtime human interaction: `ask_user` is not presented, and the interaction owner rejects question, Permission and Effect waits from scheduled Task/Root/Child/plugin producers. If required input or approval is missing, the protected effect does not run; independently useful output and gaps can still be delivered before the original deadline settles the task. Setup confirmation is different from waiting indefinitely for a user during unattended execution.

This makes the supported contract clearer at the cost of mid-task clarification. Work needing fresh approval at each step belongs in an interactive workflow rather than a chat wait silently repurposed as background parking.

<span id="_3-calendar-occurrences-are-opportunities-not-guaranteed-reports"></span>

## 3. Miss One Period or Queue Three Old Reports After Recovery?

Suppose hourly research is down for three hours. On recovery, the important decision is not polling frequency: should it reconstruct three old reports or attempt only the current period? We choose the latter: best-effort current research, not a complete historical series.

The current definitions cover four time types: the existing once and weekly, a designated time at, and an interval anchored to a UTC starting instant. Intervals have a minimum supported resolution and explicit termination conditions: until cancelled, until a specified instant or after a fixed number of **calendar occurrences**.

An important distinction: **three calendar opportunities do not guarantee three successful reports**. If a slot is skipped because of downtime, overlap or an expired catch-up window, the scheduler does not extend the future indefinitely to make up a target number of successful reports.

UTC intervals follow elapsed time. Weekly plans follow civil clock time in the chosen time zone. A nonexistent local time during daylight-saving transition is skipped; a repeated civil time fires once according to the established rule. Treating either schedule as “delay a little after the last run finished” introduces drift and changes what the user confirmed.

When two instances discover the same slot, stable occurrence identity and database admission determine the winner. Each process does not independently launch research. After missed slots, selection first finds the latest natural slot due at the authoritative observation time beyond the durable consumption boundary, then checks grace, authority, budgets and overlap. If that slot is ineligible, it does not search backward for an older period that can run. If an older Task is active, the new slot is recorded and consumed as overlap; completion of the old Task does not replay it later.

The cost is deliberate gaps in History. The benefit is avoiding a queue of stale research after recovery or extending a three-opportunity agreement to obtain three successes. A business that must reconstruct every hourly accounting record needs a different, explicit backfill policy.

A controlled run of the normal application autonomously traversed three 120-second interval slots, retaining three independent reports; a restart check produced no fourth compensating Task. This supports time and consumption behavior in that assembly, not exact-time delivery or long-term review value.

<span id="_4-conditional-monitoring-is-not-asking-the-model-to-guess-every-minute"></span>

## 4. Why True, Timeout, True Must Not Trigger Again

The dangerous shortcut in conditional monitoring is treating missing data as a negative observation. Consider true → timeout → true: recording the timeout as false would manufacture a new false-to-true edge from a network problem.

We did not choose to call a model on each quote read to ask if the condition holds. The implementation describes conditions using versioned read-only sources, unit-aware numeric comparisons and bounded compound predicates. **Code evaluates the comparison; the model analyzes only after research has separately been admitted.**

For example:

> For a specified instrument, currency and price unit, request one research Task when a freshness-checked observation is at most 5,000.

Why retain instrument, unit, currency, asOf and observation identity? Because a stale quote, a number in another currency or a timed-out source is **not** proof that the threshold condition is false.

Condition evaluation is therefore **three-valued**:

| Observation | Meaning | May it trigger research? |
| --- | --- | --- |
| true | Fresh, comparable observation satisfies the predicate | Still subject to Task admission |
| false | Valid comparable observation explicitly fails the predicate | No; may become a baseline for a later true edge |
| unknown | Stale, failed or noncomparable source, or other unresolved evidence | No; must not fabricate a true-to-false transition |

There are two distinct trigger modes.

**firstMatch** latches only after the condition matches **and the underlying Task is actually created**. If a valid match is denied due to scope or capacity, do not record an imaginary successful trigger. Once creation succeeds, a failed research run or a notification retry must not automatically trigger it again.

**everyEdge** observes the first match and an explicit **false → true** transition, subject to cooldown, overlap and budget rules. An edge suppressed during cooldown is recorded as suppressed, not secretly queued for later. Staying true does not rerun research at every polling interval. An unknown observation cannot re-arm the edge.

The currently supported condition source is **synthetic mockQuote**, not an integrated live market feed. Normal application and real-PostgreSQL checks produced one firstMatch and two everyEdge report/notice handoffs. Those checks and the three-slot interval run belong to different versions and evidence windows, not one combined experiment. Real sources still need integration and qualification for units, currency, freshness, permissions and unknown physical reads.

<span id="_6-restarts-and-lost-commit-receipts-are-the-real-challenge"></span>

## 5. After a Lost Receipt, Find the Original Facts

The hardest moment is not ordinary polling. It is when a Worker has committed an admission to the database but never received its success response. If a second Worker interprets “I did not see the receipt” as “nothing happened,” it may create a duplicate Task or invoke the model again.

We separate slow observation I/O from short database transactions. Reading the source happens outside DB locks; the result returns with the original revision, fence, lease and observation identity. The transaction then rechecks effective confirmation, authorization and limits, and commits the observation receipt, condition state and original Task/Control intent together.

If the database actually committed but a test wrapper dropped the post-commit ACK, recovery must use the **original durable receipt**; it cannot retry under a new identity. After a definition is cancelled or reconfirmed, late observations cannot cross the old fence to alter the new revision.

**Observation polling has its own budget.** A poll consumes a real read opportunity even if it returns unknown; “no quote returned” does not refund the read. That polling cost must not be confused with model research spending. Raising future schedule limits does not automatically replenish the current accounting period.

Final notification has a separate outbox, delivery identity and retry rule. A failed notice can be retried with the already committed report reference. It must never use a delivery retry as an excuse to rerun research.

| Observation | Permitted next step | Invalid inference |
| --- | --- | --- |
| A transaction is known to have rolled back | Retry the original operation within its constraints | A new budget or identity is available |
| COMMIT happened but its client ACK was lost | Read the original occurrence, Task and receipt, then continue that work | No response means no commit |
| An external model or notification outcome is unknown | Preserve uncertainty and reconcile through its original execution/delivery owner | A local unique constraint guarantees exactly one remote effect |

The PostgreSQL check committed a real transaction and then dropped its ACK in a test wrapper; it was not a physical network-loss experiment. Local deduplication finds the same Task and outbox after restart, without promising external exactly-once effects. When occurrence is uncertain, the next step is to find the original facts, not simply do the work again.

<span id="_1-why-calling-an-agent-on-a-timer-is-not-scheduled-research"></span>

## 6. Where Cron, Workflow Services and Existing Tasks Fit

A simple timer is not inherently wrong. For an idempotent daily batch on one machine, without changing user scope, long-lived definitions or uncertain external effects, cron may be the simplest choice. As requirements grow, inspect existing infrastructure before building another scheduler.

| Choice | Strongest fit | Application responsibility that remains |
| --- | --- | --- |
| cron / Kubernetes CronJob | Existing batch jobs or a cluster running independent scheduled work | User-approved revision, business effects and result access |
| Temporal Schedule + Workflow | Long-lived cross-service processes needing rich overlap, catch-up and durable execution | Business authorization, uncertain model effects and report/notice meaning |
| Existing Schedule + Task + Run | Those durable identities and admission rules already exist; timing is another entry into research | Maintaining calendar, transaction, cancellation and observation boundaries with a narrower feature set |

[Kubernetes CronJob](https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/) offers time zones, starting deadlines and concurrency policies, and explicitly recommends idempotent Jobs because creation may duplicate or be missed. It is more than a bare timer, but Job identity does not replace research authorization or source versions.

[Temporal Schedule](https://docs.temporal.io/schedule) has identity independent of Workflow, configurable overlap policies such as Skip or buffering, and catch-up controls. Pausing future scheduling differs from pausing an existing execution. When those workflow needs dominate, an established service may be more appropriate than expanding a small scheduler. Its [Workflow execution model](https://docs.temporal.io/workflow-execution) remains useful background.

We reuse Task/Run so each opportunity consumes the same budgets, leases, cancellation, publication and recovery, rather than letting a new executor and the original Runtime independently decide what may continue. The cost is owning and testing those connections, with explicit limits around backfill, live conditions and unattended interaction. This is a choice within the existing architecture, not a performance ranking of workflow platforms.

## 7. Two Public Experiments: Process Handoff and Time Admission

### Start with one independently executed Run

To understand who continues the original work after its submitting process exits, you do not need to deploy a complete scheduling system. The [fixed Open ETF Agent v0.9 implementation](https://github.com/hpoenixf/open-etf-agent/tree/dad9c6e64f32c3d7579aea96613776b40917ec6d) extracts just this layer: admit a Run with an explicit identity, then let another process acquire its original Session execution lease and enter the same Runtime. The calendars, conditional triggers, Task History and notices described above remain capabilities of the full ETF Agent system; this small public slice does not include them.

With Node 26 in the range declared by the README, use a new directory to run this synthetic example. The [README associated with this historical slice](https://github.com/hpoenixf/open-etf-agent/blob/e888ee911ca784d6488f33def31abf225293719a/README.md) provides the usage entry point.

```bash
git clone https://github.com/hpoenixf/open-etf-agent.git
cd open-etf-agent
git switch --detach dad9c6e64f32c3d7579aea96613776b40917ec6d
npm ci --ignore-scripts --no-audit --no-fund
npm run build
node dist/src/session-cli.mjs submit --session runs/worker-example --run original-example --case durable-publication
node dist/src/session-cli.mjs work --session runs/worker-example --run original-example
node dist/src/session-cli.mjs publication --session runs/worker-example --run original-example
```

`submit` persists the request, bindings, limits and deadline, then exits without calling a model or tool. `work` is another process: it reads two synthetic documents, saves a report and commits answer text. The last command only reads the original body and receipt; it does not repeat research. Model actions come from a script, while SQLite commits, files and process handoffs really execute. The fixture's original 30-second deadline begins at submission; restarting that clock when the execution process begins would change the task itself.

Stop reasons are easy to confuse. A Worker receiving SIGTERM does not mean the user cancelled research. A sealed action can be left for the next process. But if a model request was dispatched and its result was never durably recorded, recovery does not guess that it probably failed and send it again. Follow the [thin Worker entry](https://github.com/hpoenixf/open-etf-agent/blob/dad9c6e64f32c3d7579aea96613776b40917ec6d/src/worker.mjs) into the original Runtime, or inspect the [actual process-interruption cases](https://github.com/hpoenixf/open-etf-agent/blob/dad9c6e64f32c3d7579aea96613776b40917ec6d/test/worker-process.test.mjs). This preserves original identity and observed effects; it is not an automatic retry button for uncertain requests.

<!-- open-etf-case:worker@e1b8e4edde724548fab16d8ca4b205379bfa7f30 -->
### Execute the original Run after submission exits

The [Worker CLI case at this fixed public snapshot](https://github.com/hpoenixf/open-etf-agent/blob/e1b8e4edde724548fab16d8ca4b205379bfa7f30/test/worker-cli.test.mjs) separates durable submission from execution into different processes and checks that they still refer to the original work.

After installing dependencies according to the README at the linked fixed snapshot, run:

```bash
node --test --test-concurrency=1 --test-name-pattern='^9\.1 submit exits before a separate work process drives and reads the original Run$' test/worker-cli.test.mjs
```

After `submit`, the Run is `ready`, has no owner, and has consumed no model or tool usage. A separate `work` process completes that same Run with Publication revision 1. Repeating `work` reads the terminal state without increasing usage or creating another body revision.

This test sets no calendar trigger, creates no Task queue, and does not validate notifications or concurrent Workers. Its scope is independent execution, original identity, and terminal readback.
<!-- /open-etf-case -->

### One Step Further: One Confirmation Links to One Original Run

The Worker answers who continues execution, but not which Run a particular time opportunity may create. The public v0.18 design compares three options. A separate schedule database and executor would split occurrence and Run across commits. Exporting a prepared Run object for controller reconstruction would create a second admission path. The chosen design lets the original Runtime prepare an immutable definition and the original Session insert both Run and occurrence link in one synchronous short transaction; the original Worker still executes. The same-version design linked below makes this choice inspectable; it is not a replacement description of the private implementation.

 The [fixed v0.18 source used for provider-free validation](https://github.com/hpoenixf/open-etf-agent/tree/b1d2431a6b86bd0120f2fe5acb531ef928e92de2) adds that smaller step, not a full calendar product: a trusted caller confirms a UTC instant, IANA time zone and lateness window, then explicitly invokes `schedule-wake`.

Confirmation retains the original question, documents, tool authority and budget. When due, the original Session inserts the original Run and its occurrence link in one short transaction. Repeated wakes from two processes still resolve to the same identity. A materialized link proves durable admission, not successful research. The original Worker executes; Publication and Reader deliver the committed body and report.

Failures remain specific: an early wake creates no Run; an expired window records a missed opportunity rather than a replacement task. A lost confirmation acknowledgment is reconciled by its original identity, without renewing the deadline or budget. Cancellation before materialization prevents a Run; after materialization it uses the original cancellation path, preserving spent resources and committed reports.

In a new checkout of that fixed commit, install dependencies from its README and run the [cross-process delivery scenario](https://github.com/hpoenixf/open-etf-agent/blob/b1d2431a6b86bd0120f2fe5acb531ef928e92de2/test/schedule.test.mjs):

```sh
node --test --test-concurrency=1 --test-name-pattern='^18 different-PID Worker completion, readonly Publication and original Reader exact bytes$' test/schedule.test.mjs
```

This synthetic scenario runs the original Worker in another process, then reads back the original body and report bytes without a model account. The manual surface is `schedule-confirm`, `schedule-wake`, `schedule-inspect` and `schedule-publication` in the [CLI](https://github.com/hpoenixf/open-etf-agent/blob/b1d2431a6b86bd0120f2fe5acb531ef928e92de2/src/session-cli.mjs); the [design at the same snapshot](https://github.com/hpoenixf/open-etf-agent/blob/b1d2431a6b86bd0120f2fe5acb531ef928e92de2/openspec/changes/v18-schedule-occurrence/design.md) explains its full scope.

The slice explicitly selects a new schema5 database; it neither migrates an old database nor installs a background service. After a machine restart, a caller must invoke wake again. Recurrence, market conditions, notifications and the complete Task History described above remain outside this slice. Its synthetic loop does not substitute for full release qualification, nor promise that a sleeping machine will wake itself.


For a direct walkthrough, follow the [same-version guide](https://github.com/hpoenixf/open-etf-agent/blob/b1d2431a6b86bd0120f2fe5acb531ef928e92de2/docs/schedule-occurrence.md). In a separate directory, select and confirm a future instant:

```sh
INSTANT="$(node -e 'console.log(new Date(Date.now()+60000).toISOString())')"
node src/session-cli.mjs schedule-confirm --session runs/schedule-demo --schedule one-shot --revision 1 --instant "$INSTANT" --zone Asia/Shanghai --lateness 60000
```

Keep the returned `reference.confirmationHash`. Confirmation stores identity, not a background waiter. At the selected instant, within the lateness window, replace `CONFIRMATION_HASH` with that value and invoke:

```sh
node src/session-cli.mjs schedule-wake --session runs/schedule-demo --schedule one-shot --hash CONFIRMATION_HASH
node src/session-cli.mjs schedule-inspect --session runs/schedule-demo --schedule one-shot --hash CONFIRMATION_HASH
node src/session-cli.mjs schedule-publication --session runs/schedule-demo --schedule one-shot --hash CONFIRMATION_HASH
```

An early call does not wait for you; a missed first-materialization window is not silently moved to another occurrence. Repeating `schedule-wake` after commitment follows the original occurrence and Run without starting another research task or refreshing its budget. Original report/Reader byte checks and same-Run terminal replay are retained in the [provider-free CLI qualification receipt](https://github.com/hpoenixf/open-etf-agent/blob/b1d2431a6b86bd0120f2fe5acb531ef928e92de2/docs/verification/v018-schedule.safe.json).

The real-model path enters through the [original Schedule API](https://github.com/hpoenixf/open-etf-agent/blob/b1d2431a6b86bd0120f2fe5acb531ef928e92de2/src/schedule.mjs). The [frozen real-task record for that version](https://github.com/hpoenixf/open-etf-agent/blob/b1d2431a6b86bd0120f2fe5acb531ef928e92de2/docs/verification/v018-real-ten.safe.json) first confirms the instant, with no dispatch during confirmation or pre-due inspection. After the actual due time, one explicit wake lets the original Worker and Admission continue the same Run, publish through Publication and cold-read the original report through a read-only Session Reader. This answers whether an authorized time opportunity connects to the original task, not whether a background service will start it on time.

The [earlier real-request record](https://github.com/hpoenixf/open-etf-agent/blob/b1d2431a6b86bd0120f2fe5acb531ef928e92de2/docs/verification/v018-release.safe.json) remains separate. The CLI demonstration above has provider-free evidence; real API requests do not qualify it as a live-model CLI. Nor do zero-call cold reads make the whole task zero-call. These paths do not certify autonomous background wake, recurrence, financial quality or universal power-loss recovery.

<span id="_7-what-was-actually-validated"></span>
<span id="conclusion-the-durable-thing-is-an-agreement-not-a-reasoning-loop"></span>

## 8. Scheduling Infrastructure Does Not Establish Useful Weekly Reviews

These mechanisms separate time opportunities, actual execution and delivery while keeping confirmed background work finite. They do not establish that every report finds important changes or qualify live market integration, long-running deployment reliability or multi-period investment-thesis review.

Before adopting the design, decide whether missing periods are acceptable, whether execution needs clarification, which restrictions can really be enforced, and who reconciles unknown external outcomes. Until those questions have answers, more timing syntax only makes uncertain work easier to repeat.

The durable thing should be the agreement and original facts, not a reasoning loop that never ends.

---

## Further Reading and Discussion

[Read the original on the author's blog](https://hpoenixf.com/blog/agent-autonomous-scheduled-research) · [ETF Agent Engineering Library](https://github.com/hpoenixf/eff-agent-article) (stars welcome).
