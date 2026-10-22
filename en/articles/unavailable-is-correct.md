# When Data Goes Stale: How Should an Agent Refresh Evidence Instead of Retrying Blindly?

> A retrospective on controlled evidence refresh: producing, deduplicating, and atomically publishing new evidence while preserving source rejection and read-only guarantees.

This article describes a controlled refresh window on September 4, 2026, and a particular cross-root/application design. It does **not** claim that every current Research Runtime path uses the same mechanism.

## 1. Repeating a Rejected Request Does Not Create New Evidence

After a source has been rejected, the problem is not how to make the "unavailable" message sound nicer. The problem is obtaining *new, approved evidence*. Repeatedly calling the same unapproved source does not change its identity; reusing a stale snapshot does not make old facts current.

The mechanism introduced a safe refresh path: fixed operations, constrained data scopes, deduplication by scope, fingerprint, and hourly window, followed by atomic publication only after validation. If the source remains rejected or the refresh fails, the result remains unavailable.

Controlled checks exercised the handoffs from evidence creation to readback and the rejection or downgrade of untrusted sources. They show how those specific paths behave, not how a real gateway performs over time.

## 2. Two Core Concepts

### 2.1 Source trust: where did the answer come from?

Source trust asks which trustworthy channel produced a number or conclusion, at what time, under which definition—not whether the model thinks it sounds plausible.

A trustworthy channel needs three properties:

1. **Clear responsibility.** Read-only market and portfolio data must not be mixed with inference.
2. **Explicit freshness.** Data is marked fresh or stale; historical records do not masquerade as the present.
3. **Traceability.** Each important claim is tied to concrete evidence rather than an isolated sentence.

Model-generated text is advisory and untrusted by default. Only allowlisted trusted tool outputs can substantiate numeric and state claims. Fluency does not replace that evidence path.

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
| Exactly once within a session | Continuous processing has one effect within the same session | After deduplication: avoid both duplicate and missing effects |

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
- **CheckRefreshAllowed → RemainUnavailable:** no; ordinary questions do not implicitly refresh.
- **CheckRefreshAllowed → ControlledRefresh:** yes; explicit retry or scheduled collection, within hourly limits.
- **CheckRefreshResult → PublishCitedAnswer:** refresh succeeds.
- **CheckRefreshResult → RemainUnavailable:** refresh fails.
- **ControlledRefresh → MarkNotCollected:** real infrastructure is required, or the controlled window does not cover the case.

These branching points are deliberately explicit. Rejection occurs *before* evidence enters the trusted path; unavailable occurs *before* an unsupported answer is produced; refreshing operates through a separate controlled channel. No branch silently sidesteps the guardrails.

The not-collected branch is explicit even where a diagram uses a normal connector rather than a dashed edge. A real database, multi-process execution, or external gateway quality requirement outside the validated window must be recorded as **not collected**, not guessed to have passed or failed. The state remains unavailable.

Only two trigger classes are permitted: **an explicit user retry** and **a scheduled collection task**. Both share the same hourly rate limit. An ordinary question never triggers refresh implicitly.

## 4. What a Rejected Source Taught Us

In early integration work, a seemingly harmless internal source label—for example an internal note tag—was used for debugging and then mistakenly treated as citeable evidence.

In structured terms, **source_label** referred to an internal note, **allowlisted** was false, and so the derived **trusted_hit** was false. The allowlist rejected it, and dependent state claims were downgraded to unavailable.

This can feel overly strict. But admitting internal notes, debugging remarks, or a model's paraphrase as though they were trusted sources creates a systemic failure mode. More unavailable results were preferable to opening that door.

The strict boundary also improved integration speed. Instead of debating whether to make an exception, reviewers could check membership in the allowlist. Subjective judgment became an objective test.

We separated source checks, downgrading, refresh, and auditing so that each responsibility could be reviewed without bundling every risk into one final integration step.

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

This contract also simplifies the client. With numbers, show values and citations; without them, show disclosure and an explicit refresh control. The frontend does not have to interpret half-structured prose. Troubleshooting reads the source match, freshness, and disabled action fields directly. Uniform audit records can later support unavailable-rate, refresh-success, and downgrade-reason analysis rather than anecdotal quality assessments.

## 6. Runtime Rules: Inputs, Priorities, Failures, and Safety

The following rules are evaluated in order. A later step cannot bypass an earlier gate.

| Dimension | Rule |
| --- | --- |
| Input 1: question class | State or numeric claims require the evidence gate |
| Input 2: evidence match | Only allowlisted channels count as trusted hits |
| Input 3: freshness | Fresh is usable; stale, unknown, or missing is unavailable |
| Priority 1: source gate | Reject an untrusted source before generating the answer |
| Priority 2: downgrade gate | Use a fixed disclosure if the evidence gate fails |
| Priority 3: refresh gate | Only explicit retry or scheduled collection may refresh, subject to hourly limits; normal questions never do |

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

Four additional atomicity rules matter:

1. Evidence candidates must originate at the root candidate entry; bypass writes are rejected.
2. Permitted changes are fixed and restricted, not arbitrary mutations.
3. Publication is atomic: all visible or none visible.
4. Deduplication keys include scope, fingerprint, and an hourly window. Exactly-once continuous processing is scoped **to one session**, not to the world.

Controlled checks exercised both root-level candidates and application-level answer assembly. Refresh deliberately used a separate controlled channel rather than the execution-grade daily job stream; these paths do not establish universal behavior.

The distinction is architectural: conversational research requires frequent, low-latency, retriable reads, while transaction-related workflows demand stricter validation and heavier audit. Conflating those paths would make both harder to operate safely.

Scope limits the affected data, fingerprints avoid duplicate work, and hourly windows prevent excessive refresh. In-session exactly-once processing is deliberately narrower than a global exactly-once execution promise.

## 7. Three Comparisons: When to Say "I Don't Know"

### Case 1: stale snapshot versus an honest unavailable response

A trusted provider becomes temporarily unreachable. A stale snapshot is available. One implementation reuses the old numbers and appends "for reference only." Another reports unavailable and explains the lack of fresh evidence.

The former looks helpful but invites readers to treat historical numbers as current. The latter preserves time semantics, even when an explicit refresh takes an extra step.

**Forbidden:** "According to the latest data, the current status is ..." when no fresh data exists.

**Appropriate:** "No fresh trusted evidence is available, so no current-state conclusion is made. You may explicitly retry the refresh."

### Case 2: internal note versus formal rejection

An internal tag appears to contain the correct conclusion and would take one line of code to cite. Admitting it now with a promise to fix the allowlist later creates a precedent for admitting more informal sources. Rejecting it and staying unavailable keeps the source boundary intact, at the cost of a short-term unavailable response.

### Case 3: guessing a missing field versus waiting for refresh

A critical field is missing, but other fields are present. Filling it with common-sense inference may produce a polished response, but it mixes model speculation with trusted facts. Subsequent auditing cannot reliably distinguish them. Preserving the gap and requesting a controlled refresh keeps the answer recoverable: publish new evidence on success, or remain honest about unavailability on failure.

## 8. What the Mechanism Establishes—and What Remains Open

In controlled scenarios, untrusted sources do not enter citation paths, only eligible candidates may be refreshed, and failed validation leaves the status unavailable rather than relabeling old evidence as fresh. That is the transferable engineering result.

We still lack sufficient observations of actual database concurrency, cross-process behavior, external-service latency, and long-running production reliability. Controlled refresh remains separate from the daily execution stream, and exactly-once handling within one session is not a global exactly-once guarantee.

## 9. Conclusion: Refresh Needs Its Own Boundaries

Controlled refresh solves **how to legally obtain and publish new evidence**, not how to automatically make every unavailable result disappear. Triggers, scopes, fingerprints, time windows, atomic publication, and failure audits remain explicit. Anything beyond the observed validation window or unsupported by real-environment evidence remains **not collected**.
