---
description: "Why do stale snapshots and internal notes remain unusable despite repeated calls? This historical refresh retrospective follows source rejection, qualified candidates and atomic publication, separating transferable evidence boundaries from the retired Agent auto-refresh design."
readingBrief:
  takeaways:
    - "This is a retrospective on a retired automatic-refresh path; stale snapshots describe the past, and repeatedly calling a rejected source cannot create current evidence."
    - "Refresh through a separately authorized read-only candidate path, publishing atomically only after validation; an ineligible source or failed refresh leaves the result unavailable."
    - "Source, time and measurement definition jointly determine numeric eligibility; internal notes and plausible guesses cannot fill gaps, and scoped tests do not prove global exactly-once behavior or long-term reliability."
  appliesTo:
    - "Reviewing stale-data degradation, explicit refresh and candidate-report publication without disguising old numbers, annotations or guesses as fresh evidence."
  notFor:
    - "Looking for current Agent auto-refresh controls, or treating historical hourly windows and in-session deduplication as today’s runtime contract and a global execution guarantee."
---
# When Data Goes Stale: How Should an Agent Refresh Evidence Instead of Retrying Blindly?

**When financial data becomes stale, the priority is not to keep calling tools. It is to avoid relabeling old facts as a current investment conclusion.** Retrying the same rejected source creates no new evidence. A refresh helps only when the source, reading permission and candidate-publication path are explicitly qualified.

In a controlled ETF Agent integration case, a report source exposed an internal root label: `reports-1/daily-…json` did not match the approved public source identity and was rejected. A plausible report filename did not establish canonical provenance. Preserving unavailability was safer than weakening the source rule to complete the answer.

**This is a historical engineering account of September 4, 2026.** Later accepted contracts retain a read-only root refresh and controlled publication of valid report candidates. The former Agent auto-refresh, preference/settings entry points and continuation path were retired. Historical trigger and hourly-window descriptions below **do not describe an automatic refresh capability active across current research**. The transferable lesson is how to separate old data, explicit unavailability and truly new evidence.

## 1. Repeating a Rejected Request Does Not Create New Evidence

After a source has been rejected, the problem is not how to make the "unavailable" message sound nicer. The problem is obtaining *new, approved evidence*. Repeatedly calling the same unapproved source does not change its identity; reusing a stale snapshot does not make old facts current.

The mechanism introduced a safe refresh path: fixed operations, constrained data scopes, deduplication by scope, fingerprint, and hourly window, followed by atomic publication only after validation. If the source remains rejected or the refresh fails, the result remains unavailable.

The retained root implementation makes this boundary concrete. The runner clones configuration and ledger state and reuses deterministic computation to produce an isolated candidate; it has no confirmation, execution or ledger-save callback. The publisher binds candidate and canonical roots to trusted configuration, validates the filename, structure, generation time and paths, then stages and renames inside the canonical directory. Failure retains the original report. A request cannot substitute roots or relax the time policy.

Atomic replacement prevents a reader from seeing half a report; it is not a complete power-loss durability proof. A report passing its generation-time check also does not make every market observation inside it sufficient for a present-tense claim. Computation, publication and the claim’s time eligibility remain separate.

## 2. Two Core Concepts

### 2.1 Source trust: where did the answer come from?

Source trust asks which trustworthy channel produced a number or conclusion, at what time, under which definition—not whether the model thinks it sounds plausible.

A trustworthy channel needs three properties:

1. **Clear responsibility.** Read-only market and portfolio data must not be mixed with inference.
2. **Explicit freshness.** Data is marked fresh or stale; historical records do not masquerade as the present.
3. **Traceability.** Each important claim is tied to concrete evidence rather than an isolated sentence.

In this historical design, model-generated text was advisory and untrusted by default; allowlisted tool outputs substantiated numeric and state claims. This describes the original source gate, not a requirement that all current Native research pass through the same tool list or numeric interceptor. The transferable requirement is evidence with the source, reading eligibility and time definition appropriate to the claim, regardless of fluency.

Review the chain in the right order: is the source allowlisted, do its definitions match the question, and only then is the wording clear? A number can come from a trusted source and still be unusable if its statistical definition is unspecified. Source, time, and measurement definition are all essential.

### 2.2 Unavailable is the starting state for refresh, not permission to improvise

**Unavailable** means the existing evidence cannot support the requested conclusion. It retains the user's goal and identifies the missing evidence, but it does not authorize arbitrary retrieval. New evidence may only be obtained through an explicitly authorized refresh entry point.

## 3. Main Flow: Rejection, Unavailable, Controlled Refresh

The simplified flow distinguishes three consequential branches: rejecting a source, downgrading the answer to unavailable, and recovering after a controlled refresh. A fourth branch explicitly records what was not collected.

### 3.1 Five mechanics and where they apply

| Mechanism | Definition | Where it applies |
| --- | --- | --- |
| Candidate restriction | Accept only root-level candidates; reject bypass writes | Controlled refresh entry: reject non-candidates |
| Fixed operations | The set of changes is predetermined and limited; no arbitrary mutation | Refresh execution: reject out-of-scope operations |
| Atomic publication | Either the whole result becomes visible or none of it does | Refresh completion: roll back on publication failure |
| Deduplication | Identify duplicates by scope, fingerprint, and hourly window | Before publication: reuse an existing accepted result |
| In-session continuation idempotency | Job and origin-message identity constrain duplicate appends | Covered by scoped transition checks, not a real multi-process global exactly-once claim |

~~~mermaid
graph TD
RootCandidate --> FixedOperations
FixedOperations --> AtomicPublish
AtomicPublish --> Deduplicate
Deduplicate --> ExactlyOnce
~~~

The **ControlledRefresh** node below expands into this chain. If any requirement fails, refresh fails closed, returns to unavailable, and leaves an audit record.

~~~mermaid
graph TD
UserQuestion --> ParseEvidenceNeed
ParseEvidenceNeed --> CheckSourceAllowlist
CheckSourceAllowlist --> RejectUntrustedSource
RejectUntrustedSource --> ReportUnavailable
CheckSourceAllowlist --> CheckEvidenceFreshness
CheckEvidenceFreshness --> ReportUnavailable
CheckEvidenceFreshness --> PublishCitedAnswer
ReportUnavailable --> CheckRefreshAllowed
CheckRefreshAllowed --> RemainUnavailable
CheckRefreshAllowed --> ControlledRefresh
ControlledRefresh --> CheckRefreshResult
CheckRefreshResult --> PublishCitedAnswer
CheckRefreshResult --> RemainUnavailable
ControlledRefresh --> MarkNotCollected
MarkNotCollected --> RemainUnavailable
~~~

**Conditions on the edges:**

- **CheckSourceAllowlist → RejectUntrustedSource:** no allowlist match.
- **CheckSourceAllowlist → CheckEvidenceFreshness:** allowlist match.
- **CheckEvidenceFreshness → ReportUnavailable:** stale or missing evidence.
- **CheckEvidenceFreshness → PublishCitedAnswer:** fresh, complete evidence.
- **CheckRefreshAllowed → RemainUnavailable:** no; generic, unverified, opted-out or otherwise ineligible request.
- **CheckRefreshAllowed → ControlledRefresh:** yes; historical personal current-impact request, verified preference enabled and no verified hourly-key result; reuse the same key.
- **CheckRefreshResult → PublishCitedAnswer:** refresh succeeds.
- **CheckRefreshResult → RemainUnavailable:** refresh fails.
- **ControlledRefresh → MarkNotCollected:** real infrastructure is required, or the controlled window does not cover the case.

These branching points are deliberately explicit. Rejection occurs *before* evidence enters the trusted path; unavailable occurs *before* an unsupported answer is produced; refreshing operates through a separate controlled channel. No branch silently sidesteps the guardrails.

The not-collected branch is explicit even where a diagram uses a normal connector rather than a dashed edge. A real database, multi-process execution, or external gateway quality requirement outside the validated window must be recorded as **not collected**, not guessed to have passed or failed. The state remains unavailable.

The actual historical automatic entry required a verified personal scope and auto-refresh preference, a current-market-impact question about the user’s own portfolio, and no verified result for the scope/portfolio-strategy-fingerprint/UTC-hour key. Generic market questions and opted-out scopes did not start jobs; same-key requests reused results. Thus the historical system was neither “ordinary questions never auto-refresh” nor “any missing data triggers refresh.” The old automatic entry is retired today; this diagram grants no current permission.

## 4. What Did a Rejected Source Teach Us?

During early integration, the internal root label `reports-1` entered a report source path. This was a noncanonical provenance identifier, not a note containing a mistaken conclusion. The portfolio source check rejected that identity even though it appeared to point to a plausible report file.

The repair aligned candidate validation, canonical publication and readback rather than adding the internal root label to the public allowlist. **Evidence authority does not come from a field name, plausible prose or model confidence.** The immediate cost was a missing result; the benefit was an inspectable relationship between the publication path and its public citation identity.

The reusable engineering move is to identify the actual producer of source identity and check how that material becomes a legitimate citation, rather than adding an output-time exception for one convenient case.

## 5. From Input to Structured Output

For "unavailable" to remain machine-readable, both the input and response use structured constraints. This is a **synthetic teaching example**, not real portfolio data.

~~~json
{
  "input": {
    "question": "What is the current portfolio status?",
    "need_numbers": true,
    "need_advice": false
  },
  "evidence": {
    "source_label": "internal-note",
    "allowlisted": false,
    "trusted_hit": false,
    "freshness": "unknown",
    "source_id": null
  },
  "output": {
    "status": "unavailable",
    "numbers": [],
    "disclosure": "No trusted evidence is available; no current-state claim was made.",
    "next": "An explicit controlled refresh may be requested before retrying.",
    "audit": {
      "action_tendency": "none",
      "execution_allowed": false
    }
  }
}
~~~

**trusted_hit** is true if and only if **source_label** is non-empty and has an allowlist match. It is a derived field, not manually supplied. **need_numbers** and **need_advice** are typed inputs in this historical illustration; their presence does **not** imply that the Runtime is allowed to classify free-form user intent through a rule-based parser.

The priority order does not change:

~~~text
trusted_hit = allowlisted and source_label in allowlist
if not trusted_hit: return unavailable
if evidence is missing or stale: return unavailable
if a number lacks a trusted root: leave numbers empty + use fixed disclosure
else: generate a cited answer + persist the audit record
~~~

Here the internal-note source fails the allowlist check and immediately follows the rejection branch.

Inputs express whether the request needs numbers and action inclination. Outputs always carry status, disclosure, next step, and audit details. On an unavailable path, action inclination is **none** and execution permission is **false**—the answer must not imply that a trade or other effect can be executed.

Structured states let the client present values, citations and missing evidence separately rather than infer availability from fluent prose. Source matches, freshness and action fields give troubleshooting concrete starting points; no diagnosis-time improvement was measured here.

Unavailable rates and refresh success rates can expose operational problems, but they are not proxies for answer quality or investment outcomes. Lower unavailability may reflect new evidence or a silently weakened rule. An audit must distinguish those causes.

## 6. Runtime Rules: Inputs, Priorities, Failures, and Safety

The following is the **historical controlled design**, not an option that silently enables Agent auto-refresh in current Native research.

The following rules are evaluated in order. A later step cannot bypass an earlier gate.

| Dimension | Rule |
| --- | --- |
| Input 1: question class | State or numeric claims require the evidence gate |
| Input 2: evidence match | Only allowlisted channels count as trusted hits |
| Input 3: freshness | Fresh is usable; stale, unknown, or missing is unavailable |
| Priority 1: source gate | Reject an untrusted source before generating the answer |
| Priority 2: downgrade gate | Use a fixed disclosure if the evidence gate fails |
| Priority 3: refresh gate | Historical personal current-impact requests require verified preference permission; start or reuse by scope/fingerprint/UTC-hour key; ineligible requests do not trigger |

These six rules decide **when to stop**. Inputs determine whether a gate applies; priorities determine where processing stops. Failing a gate short-circuits downstream behavior.

| Dimension | Rule |
| --- | --- |
| Failure 1: gateway outage | Downgrade; neither infer missing values nor substitute stale ones |
| Failure 2: incomplete evidence | Missing required fields make the claim unavailable |
| Downgrade 1: fixed wording | Use a standardized unavailable disclosure |
| Downgrade 2: no action | Set action inclination to none and execution flag to false |
| Safety 1: read-only | The question-answer path cannot execute or mutate state |
| Safety 2: mandatory audit | Record the reason and suggested next step |

These rules decide **what happens after stopping**. Failures do not trigger guesswork; standard downgrades avoid misleading wording; safety rules prevent side effects and preserve traceability.

These tables describe the original gate for a particular state answer. A missing critical field blocks the conclusion that depends on it, not every independently supported fact elsewhere in the research.

The misleading shorthand is calling deduplication, publication and continuation all “exactly once.” Scope/fingerprint/hour limits duplicate jobs; candidate validation and rename control report visibility; owner and origin-message identity control continuation. In-memory, single-process fixtures can check those transitions without proving global effects under real database contention.

The reason to retain a separate read-only runner is not merely that chat is lighter. The ordinary DCA path may persist suggestions, cash or execution state. Reusing deterministic calculation is useful; inheriting its persistence entry point would cross the investment boundary. The cost is maintaining a separate candidate-validation and publication handoff. A working execution job does not establish a qualified refresh.

## 7. Three Comparisons: When to Say "I Don't Know"

### Case 1: stale snapshot versus an honest unavailable response

Serving an older snapshot during a provider outage is not inherently wrong. For a historical date, trend or previous report, still-authorized material with an explicit date may be exactly what the user needs. The failure is using it to assert a current state; “for reference only” does not change that claim.

Mature caches make a legitimate availability trade-off. [RFC 5861](https://www.rfc-editor.org/rfc/rfc5861.html) permits stale-if-error reuse within a bounded age and keeps the response visibly stale. Permission to return an HTTP response neither makes its financial values valid for the present question nor grants new access. We retain the old report for suitable historical questions and leave unsupported current claims unavailable. The cost is that a snapshot cannot conceal a source outage.

**Forbidden:** "According to the latest data, the current status is ..." when no fresh data exists.

**Appropriate:** "No fresh trusted evidence is available, so no current-state conclusion is made. You may explicitly retry the refresh."

### Case 2: internal note versus formal rejection

An internal tag appears to contain the right conclusion and would take one line of code to cite. The question is what the material actually proves, not whether it is named a “note” or a “report.” A note can record a hypothesis; relabeling it cannot make it a source of current holdings. Rejection preserves the need to find original evidence. If the legitimate producer chain changes later, revise its source contract with evidence rather than create an exception for one convenient answer.

### Case 3: guessing a missing field versus waiting for refresh

First identify which conclusion depends on the missing field. Independently supported facts can remain. If an estimate is useful, separate its assumptions from observed facts rather than silently inserting it into a trusted field. Explicit refresh is an option only when the original request and current permissions allow it.

The answer may be incomplete, but new evidence can resolve a specific gap. Publish a qualified candidate on success; on failure, retain the old report’s identity and the unresolved question rather than persist a guess as a fact for later research.

## 8. What the Mechanism Establishes—and What Remains Open

In controlled scenarios, untrusted sources do not enter citation paths, only eligible candidates may be refreshed, and failed validation leaves the status unavailable rather than relabeling old evidence as fresh. That is the transferable engineering result.

Those unknowns concern the September refresh chain’s real concurrency, external latency and long-running behaviour. They do not mean the later project never exercised PostgreSQL. Subsequent retirement checks used an isolated database to verify that synthetic historical records stayed unchanged. That establishes history preservation and removal of old effects, not global exactly-once refresh under production failures.

## 9. Conclusion: Knowing When Evidence Is Unavailable Beats Blind Retries

**A correct refresh does not merely turn a status green. It replaces an old state with a newly qualified report without rewriting investment ledger facts.** Review this kind of mechanism by asking: Can the original material support a present-tense claim? Is there a separately authorized, read-only, inspectable way to produce a candidate? If candidate validation fails, does the system preserve the original report identity instead of presenting old numbers as new?

The September 2026 controlled work illustrated source rejection, candidate validation and safe publication. It did not establish live-provider reliability, global exactly-once effects or better investment advice. Subsequent accepted contracts retired the Agent's automatic refresh route while retaining supported explicit and read-only report-refresh behavior.

**Sometimes stating “the current evidence is unavailable” is more reliable financial research than another tool call.**
