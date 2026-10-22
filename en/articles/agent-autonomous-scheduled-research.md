---
title: "Scheduled Agent Research Without an Always-Running Conversation"
description: "Confirmed schedules, durable occurrences, conditional triggers, three-valued observations, Task recovery and notification boundaries."
---

# Agents Don't Need to Think Continuously: How Research Continues on Schedule After a Conversation Ends

“Check my holdings every Wednesday evening, and notify me only if something important has changed.”

An agent in a chat can easily say “Okay.” The harder question comes later: when the browser is closed, the server restarts and the next date arrives, **who remembers the commitment, who is allowed to begin research, and what prevents duplicate reports?**

We initially only handled the user's current request. ETF Agent later added research tasks independent of the chat connection: a user confirms a schedule once; background coordination creates a bounded research opportunity at an agreed time; reports enter independent history; and notification failure does not rerun the model.

We did **not** turn the model loop into a process that runs forever or repeatedly use cron to imitate a user sending a new message. **What persists is the user-confirmed task definition, not an immortal agent process. Each due time offers one candidate execution opportunity, and the existing authorization and resource rules still decide whether research may begin.**

## 1. Why Calling an Agent on a Timer Is Not Scheduled Research

One could call a chat endpoint each week with the same prompt. That creates requests, but leaves critical questions unanswered:

- Which revision of the task did the user confirm? If data scope changes, does it take effect immediately or require new confirmation?
- If two Workers see the same due time, can the system create only one Task?
- If last week's research is still running, does this week's occurrence run concurrently, catch up or skip?
- If a report was committed but notification failed, should retry repeat research or only redeliver notice?
- When the user pauses a schedule, is the next due time suppressed, or is an already running Task cancelled?

These are long-lived identity, authorization, state and resource questions—not problems of prompt interpretation. A model can help understand what the user wants reviewed each week. Saying “understood” cannot grant indefinite background execution authority.

Mature workflow systems emphasize durable time and execution state, as in [Temporal's Schedule and Workflow concepts](https://docs.temporal.io/workflow-execution). We borrowed the **separation of time triggers, durable execution and business effects**. We are not claiming to use Temporal or to have recreated a universal workflow platform.

## 2. Convert a Natural-Language Agreement into a Confirmable Definition

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

## 3. Calendar Occurrences Are Opportunities, Not Guaranteed Reports

Scheduling now includes more than once per week.

The current definitions cover four time types: the existing once and weekly, a designated time at, and an interval anchored to a UTC starting instant. Intervals have a minimum supported resolution and explicit termination conditions: until cancelled, until a specified instant or after a fixed number of **calendar occurrences**.

An important distinction: **three calendar opportunities do not guarantee three successful reports**. If a slot is skipped because of downtime, overlap or an expired catch-up window, the scheduler does not extend the future indefinitely to make up a target number of successful reports.

UTC intervals follow elapsed time. Weekly plans follow civil clock time in the chosen time zone. A nonexistent local time during daylight-saving transition is skipped; a repeated civil time fires once according to the established rule. Treating either schedule as “delay a little after the last run finished” introduces drift and changes what the user confirmed.

When two instances discover the same slot, stable occurrence identity and database admission determine the winner. Each process does not independently launch research. After multiple missed slots, only the latest eligible occurrence within the grace window is considered; the system does not create a catch-up storm.

## 4. Conditional Monitoring Is Not Asking the Model to Guess Every Minute

A user may also ask: “Run new research when this indicator first crosses a threshold.” That means observing external facts and deciding whether they warrant a Task.

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

The conditional path has controlled proof using **synthetic mockQuote** observations with real PostgreSQL and the standard application assembly. That is **not** an enabled live-stock-price monitoring service. Market-provider authorization, freshness and physical failure semantics still require separate integration and acceptance.

## 5. Six Facts from Trigger to Report Must Remain Separate

We reused authoritative records for Schedule, Task, Run, Control, Publication, History and Notice. We did not add a second scheduler database or a new “always-online Agent Runtime.”

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

## 6. Restarts and Lost COMMIT Receipts Are the Real Challenge

The hardest moment is not ordinary polling. It is when a Worker has committed an admission to the database but never received its success response. If a second Worker interprets “I did not see the receipt” as “nothing happened,” it may create a duplicate Task or invoke the model again.

We separate slow observation I/O from short database transactions. Reading the source happens outside DB locks; the result returns with the original revision, fence, lease and observation identity. The transaction then rechecks effective confirmation, authorization and limits, and commits the observation receipt, condition state and original Task/Control intent together.

If the database actually committed but a test wrapper dropped the post-commit ACK, recovery must use the **original durable receipt**; it cannot retry under a new identity. After a definition is cancelled or reconfirmed, late observations cannot cross the old fence to alter the new revision.

**Observation polling has its own budget.** A poll consumes a real read opportunity even if it returns unknown; “no quote returned” does not refund the read. That polling cost must not be confused with model research spending. Raising future schedule limits does not automatically replenish the current accounting period.

Final notification has a separate outbox, delivery identity and retry rule. A failed notice can be retried with the already committed report reference. It must never use a delivery retry as an excuse to rerun research.

## 7. What Was Actually Validated?

This capability is more than a Spec.

In a controlled time-scheduling run, the normal application configuration autonomously passed through **three 120-second interval slots** after authenticated confirmation, storing three distinct completed reports. Restart verification showed no unwanted fourth catch-up Task.

A separate synthetic conditional exercise validated **one firstMatch** and **two everyEdge** report/notice handoffs. These were different source versions and evidence windows, not one combined run.

Real PostgreSQL concurrency, confirm/cancel fences, recovery after lost commit ACK, exhaustion of polling opportunities and non-replenishing budgets have their own bounded evidence. The original extension Spec's provider-free scope formally closed on **October 21, 2026**. Integration into main included targeted compatibility checks against current notification preferences.

The evidence supports this statement: **under the tested application assembly and synthetic inputs, Schedule can start a finite Task outside a conversation, preserve its result, and respect its original identity across retries.**

It does **not** establish that user schedules are deployed, that live market monitoring is enabled, or that paid-model long-running task reliability is proven. Nor does it mean weekly research reports already make mature investment judgments.

“Notify only on important changes,” multi-period investment-thesis revisions and corrections remain part of Weekly Review product acceptance. Their incompleteness must not be confused with absence of the underlying A09 scheduling mechanism.

## Conclusion: The Durable Thing Is an Agreement, Not a Reasoning Loop

If building this from scratch, I would ask **when the user granted ongoing authorization, when stable Task identity is assigned and how uncertain effects recover** before deciding which timer to use.

We did not keep the agent thinking while idle. We kept a **confirmed durable agreement**, allowing independent, finite, recoverable Runs to carry out each authorized research task.

This also explains why infrastructure scheduling can mature before the complete weekly-review product: one controls when and how a research opportunity may arise, while the other still has to prove that each report helps users identify meaningful changes to their investment thesis.

---

## Further Reading and Discussion

[Read the original on the author's blog](https://hpoenixf.com/blog/agent-autonomous-scheduled-research) · [ETF Agent Engineering Library](https://github.com/hpoenixf/eff-agent-article) (stars welcome).
