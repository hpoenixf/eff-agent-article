---
title: "Green Tests Can Lie: Proving Real Boundaries, Not Test Doubles"
description: "Evidence grades, mock versus real-dependency tests, pending acceptance, and a timeout counterexample from a controlled engineering window."
---

# Green, but Not Real: How to Stop Tests from Faking Production Boundaries

> A focused suite passed completely while broader coverage remained outstanding; unit-test defaults also masked a real command-line timeout. This retrospective explains why these findings cannot substitute for one another.

## The Origin: Delivery That Looked Complete

During one iteration, a focused test suite achieved a perfect result. The team felt that the relevant boundary was protected and work could close.

But when the test scope expanded, the larger collection remained incomplete.

Under the acceptance convention used in that case, the outcome was **not adoptable**. It was pending, requiring a return to baseline and new evidence.

The gap forced us to revisit a fundamental question: **What exactly does a green test certify?** Does it certify a production boundary, or merely a stand-in used by a test?

If those are confused, more green tests can produce more fragile confidence.

The central lesson is that **a pass result must be bound to an explicit boundary type**. A passing count without that context cannot be meaningfully compared across environments.

The largest cost of a false green is not the incorrect report itself. It is that the team stops investigating. Later discovery of the hidden risk makes fixes more costly and the original incident harder to reconstruct.

We adopted a lightweight review convention: any green result should explain, in three sentences, **what was mocked, what was real, and what remains unverified**. A result that cannot answer those questions goes back for evidence collection under that team's convention.

False greens commonly involve inconsistent measurement definitions or missing evidence. Inconsistent definitions can make a timeout look compliant; missing evidence can make “not observed” look like “passed.”

All counts and durations in this article come from a particular controlled evidence window. They illustrate how to report findings. They are neither general performance results nor universal commitments.

## Concepts: Three Different Kinds of “Green”

We use the following terms consistently:

| Dimension | States | Meaning |
| --- | --- | --- |
| Evidence level | Verified / Not collected | Was real execution evidence captured? This is about evidence completeness, not desirability of an outcome. |
| Workflow state | Pending / Return to baseline | Pending means evidence is incomplete; return to baseline means repair and recapture evidence. |
| Adoption decision | Adoptable / Not adoptable | May the current result be relied on for delivery? This is the final judgment. |

Evidence level asks **whether evidence exists**; workflow state asks **what happens next**; adoption decision asks **whether the result can be used**.

“Verified” does not imply “adoptable.” A real execution may verify that the required boundary **does not hold**. That must be reported as verified evidence, a not-adoptable conclusion, and a return to baseline.

Four additional terms are useful:

**Focused suite**: A small, fast set of tests used to locate logic defects early.

**Full suite**: A broader set intended to check whether the relevant boundaries close.

**Evidence ledger**: A record of baseline, failing and passing states, and observations between them.

**Tiered checklist**: A list separating temporary waivers from items that still need actual dependency evidence.

One kind of green is **mock green**: inputs are invented, dependencies are stubbed, and time can be controlled. It checks program branches; it cannot prove that external systems behave as expected.

A separate type of evidence is **real-dependency verification**: tests actually start a process, use an isolated database, or exercise the relevant network boundary. Such a pass proves only the boundary reached during that controlled run, not production quality or global acceptance.

The third state is **pending**. It is not green at all. It explicitly states that some evidence is still missing and the result is temporarily not adoptable.

Our earlier mistake was to compress all three into one success rate. A perfect focused suite and a pending full suite are different measurements; they should not be converted into one score.

The evidence ledger forces comparison to the baseline. Each record must identify the original red state, the green state and intermediate observations. Without a baseline, a green claim may be impossible to review.

The tiered checklist distinguishes a temporary waiver from actual remediation. In one sample window, there were **zero dynamic gaps and four deferred items**. That meant no newly unknown risk surfaced during that window, yet four known items were explicitly postponed. A full score would hide this distinction.

Mock green is cheap and fast, suitable for frequent early iteration. Its conclusion expires as soon as it is applied outside the mock environment.

Real-dependency verification is more expensive and therefore naturally less frequent. Each such record nevertheless corresponds to genuine execution.

Pending is a useful guard against the premature promotion of narrow success into a global delivery claim.

## The Workflow: Expose False Greens Before Adopting Results

The following flow is the postmortem's evidence-validation process. It has one starting point, two verification branches and just two eventual outcomes: accept evidence, or return to baseline. Pending is an intermediate state.

~~~mermaid
flowchart TD
  A["Define required boundary"] --> B["Capture baseline and initial failure"]
  B --> C["Run focused mock verification"]
  B --> D["Run real-dependency verification"]
  C --> E{"Mock checks pass?"}
  E -- "No" --> Z["Return to baseline, repair, recapture"]
  E -- "Yes" --> F["Mark mock-only evidence"]
  D --> G{"Real probe passes?"}
  G -- "No" --> Z
  G -- "Yes" --> H{"Real evidence complete?"}
  F --> H
  H -- "Yes" --> I["Evidence is adoptable"]
  H -- "No" --> J["Pending: investigate missing evidence"]
  J --> Z
~~~

The mock-only marker is essential. It prevents a perfect result in a surrogate environment from pointing directly to publication.

Only when the real-dependency evidence is complete can the focused mock success contribute to an adoptable conclusion. Otherwise the stated convention is to mark the work pending and return to baseline for missing evidence.

A pending state is not a punishment or a final rejection. It tells the next engineer which probe to add, rather than vaguely requesting another full rerun.

## From Input to Structured Output: An Evidence Contract

We made each validation action declarative: inputs describe what boundary is being tested; outputs describe what was actually observed.

This is a teaching representation of the recorded scenario:

~~~json
{
  "caseIntent": "Verify whether timeout governance cap is enforced",
  "boundaryType": "real-dependency verification",
  "inputs": {
    "unitDefaultTimeoutSec": 45,
    "modelTimeoutSec": 80,
    "governanceCapSec": 60,
    "callStyle": "per-call"
  },
  "observations": {
    "effectiveTimeoutSec": 80,
    "boundaryHolds": false,
    "evidenceLevel": "verified",
    "adoption": "not-adoptable",
    "followUp": "Fix timeout propagation semantics and return to baseline"
  }
}
~~~

Three details matter.

First, **all three timeout values** must be reported together: the unit-test default, the model timeout, and the governance cap.

Second, the boundary's truth is separate from evidence completeness. The field boundaryHolds indicates whether the contract held; evidenceLevel records whether that judgment came from real execution. A mock inference is not verified real-dependency evidence.

Third, even verified evidence may lead to a **not-adoptable** outcome. Here boundaryHolds is false despite evidenceLevel being verified. The correct next step is a baseline return.

The other half of the contract is honest branching. Collect a baseline first; run the mock branch; then exercise real dependencies. If that branch is absent or fails, the result becomes pending and goes back for repair and new evidence.

Here, a “contract gate” refers to **human review rules adopted by the team**, not a claim that every step was implemented as a mandatory machine gate.

The contract also prevents inconsistent timeout interpretations. A total-task timeout limits the whole job; a per-call timeout limits one invocation. Confusing the two can allow an individual call to exceed governance expectations.

## Mechanism: Inputs, Rules, Branches, Failure and Safety

Inputs comprise four groups: declared boundary, timeout parameters, isolation resources, and expected outcomes.

A boundary declaration states whether logic branches or real external behavior are under examination. Timeout parameters must include default, propagated and governance values together. Isolation resources may include an independent database, a loopback listener and isolated process space. Expected outcomes define adoptable versus pending/return-to-baseline **before** the test runs.

Our review rules were:

1. Mock-only green is not sufficient for release adoption; it needs paired real-dependency evidence.
2. The tiered checklist keeps temporary waivers separate from uncollected evidence; counts must not be merged.
3. Per-call timeout semantics must not be confused with total-task semantics.
4. Evidence levels are **verified** and **not collected**. Inferences without a real run remain not collected.

Three branches correspond to logic checks, boundary checks and unresolved conclusions. A mock-branch failure returns directly to baseline. A real-dependency failure also returns to baseline. Two apparently green branches with incomplete evidence go first to pending, then return for recapture.

Failures should be handled at their actual level rather than retried indiscriminately. A logic failure needs code repair, not a costly external probe. An environment failure needs a preserved minimal reproducer. A timeout failure needs all three timeout values, not a fix to whichever value is easiest to change.

Safety relies on isolation and minimal exposure. The following are example observations **within the same controlled window**, not throughput claims:

- Isolated-database verification: **3 executed, 0 skipped**.
- Loopback-listener checks: **65 cases**, approximately **1.84 seconds** in that window, with no residual processes; temporary ports and resources were recovered.
- Real standard-I/O channel verification: **4 passing records**. An oversized-result case yielded a typed truncation response in that window, without observed channel corruption.

The meaningful property is not the size of these numbers; it is that the tests actually crossed the claimed boundaries.

An isolated database provides a repeatable clean starting point. Loopback listeners make network behavior observable without affecting external environments. Standard I/O probes verify explicit truncation semantics for large output. Together they formed a minimum credible set of real-dependency checks in the recorded window.

## Three Comparisons: What “Green” Meant in Practice

### Comparison One: A Perfect Focused Suite and an Incomplete Full Suite

A focused subset reported **32/32 passing** in one sample window, under mock conditions. It was fast and stable.

The broader collection recorded only **8 out of 11** completed. Remaining evidence was incomplete; the adoption decision for that window stayed **not adoptable**, requiring a return to baseline.

Without boundary labels, the first looks like success and the second like failure. With labels, the first establishes limited logic correctness, while the second exposes an unclosed real boundary.

We treated the first as **mock-only evidence**, and the second as a more honest statement of overall progress. That choice was contentious at the time, but preserved the reliability of the retrospective.

### Comparison Two: Deferred Items Versus Actual Dependency Probes

A tiered checklist reported **0 dynamic gaps and 4 deferred items**.

At first glance that sounds unfinished—and it was. But zero dynamic gaps meant no newly unknown risk appeared in that window, while four known tasks were openly deferred.

Real probes supplied evidence the checklist could not: the isolated database produced **3 executions with 0 skipped** and the standard channel **4 passing records** in the same example window.

The checklist answers whether risk is visible. The probes answer whether the actual boundary held under the tested conditions. Neither substitutes for the other.

### Comparison Three: The Timeout Hidden by Default Values

The most revealing reversal involved actual command-line waiting time.

The unit-test default was **45 seconds**. The model-side timeout was **80 seconds**, passed through as a **per-call** timeout. The governance cap was **60 seconds**. Under the test window's stated semantics, allowing 80 seconds per call exceeded the cap.

Mocks never truly waited for 80 seconds, so the discrepancy remained invisible until a long-running command-line exercise.

The root cause observed in that window was confusion between total-budget and per-call semantics. Forty-five seconds described the unit-side default assumption, while 80 seconds described the actual possible wait for one call.

The remedy was not simply increasing the cap. It was correcting timeout propagation and its unit of measurement.

This led to a team convention: **every timeout-related report shows all three numbers side by side.**

## Evidence Boundary: Verified and Not Collected

| Dimension | Verified in the stated window | Not collected or not established |
| --- | --- | --- |
| Evidence ledger | Baseline, red and green stages recorded | A missing stage makes the claim difficult to review |
| Focused suite | 32/32 mock checks passed | No full-suite inference is justified |
| Full suite | 8 of 11 completed | Remaining items require additional evidence; adoption was not approved |
| Tiered checklist | 0 dynamic gaps | 4 deferred items remained |
| Standard channel | 4 passed | Oversized results need continued observation |
| Isolated database | 3 executed; 0 skipped | Production database behavior was outside scope |
| Loopback listener | 65 checks in roughly 1.84 s; no residue | Cross-machine network behavior was not covered |
| Timeout propagation | Three-value relationship confirmed; boundary failed | No post-fix rerun result was collected |

Read both columns together. The left is what we can support; the right is the boundary beyond which we cannot extend it. Reporting only the left misuses evidence.

“Verified” means real execution evidence exists, **not** that it is adoptable. “Not collected” is a concrete work list, not an embarrassing blank.

Each missing item should identify what probe or owner is needed next. That is more useful than a vague pass rate because it points to an action.

## Conclusion: Give Every Green Light an Evidence Watermark

The turning point was not a specific fix. It was acknowledging that a perfect focused suite was only mock green; that an incomplete full suite was pending rather than silently complete; and that zero new gaps and four deferred tasks could coexist.

We also had to accept that four channel passes and three isolated-database executions were limited real-dependency evidence; that 65 fast loopback checks did not replace a long timeout test; and that a 45-second default had hidden an 80-second per-call wait exceeding a 60-second cap.

A reliable pass report now needs three explicit annotations: **boundary type, evidence level and adoption decision**.

Future work becomes concrete: show timeout values and their semantics together; pair mock success with real-dependency probes; preserve deferred items; and verify long-running behavior through real commands.

The watermark turns hidden assumptions into visible text. Reviewers can debate evidence rather than impressions; future engineers can see what was demonstrated without repeating the same detours.

Before celebrating a pass count, ask which boundary was exercised, which real-dependency evidence exists, and only then what the count means.
