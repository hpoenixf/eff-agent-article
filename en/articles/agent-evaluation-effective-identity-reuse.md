---
description: "An Agent run may contain multiple model requests, failover, child work, and recovery. This article explains actual execution identity, effective behavior inputs, three-way comparability, and the explicitly limited reuse of historical local evaluation results."
readingBrief:
  takeaways:
    - "Selected models express intent; dispatched requests are facts. One Run may contain multiple models and execution roles."
    - "An attempt ID, model name, or shared Git commit does not independently prove that two evaluations are comparable."
    - "Partial observations can prove a known contradiction without proving complete equivalence."
    - "Recent local evaluations can be reused under an explicit 48-hour assumption, with incomplete input qualification disclosed."
    - "Known mismatches and unknown observations must not be rewritten as historical passes."
  appliesTo:
    - "Engineering Agent evaluations across model failover, child execution, recovery, and historical-result reuse."
  notFor:
    - "Treating synthetic protocol tests as real-model quality rankings or local approximation as exact production qualification."
---

# Agent Evaluation Identity: Can Results Survive Model Failover?

Consider a research run scheduled to use model A. It completes an entry decision, then the main research call encounters an eligible provider failure. The runtime rechecks the request, switches to model B, and eventually retains an answer. The Run may be complete. Whose evaluation result is it?

The obvious answer is to record B, the model that actually ran, rather than the configured A. That is correct but solves only **the name of one request**. An Agent run can contain entry classification, main research, child investigations, failed physical attempts, backup routes, and continuation after a process restart. One Run is not necessarily one model, nor one complete observable set of requests.

The harder question arrives later: **can yesterday's result be reused today without running the model again?** Comparing only a model label or Git SHA can make two different experiments appear identical.

This article draws on controlled verification at ETF Agent's real SDK adapter, isolated PostgreSQL, and local evaluation seams. A and B are illustrative names. The tests use synthetic provider responses and controlled faults; they are not evidence of a real production misattribution incident or improved model quality.

## 1. A Run, a physical request, and an evaluation cell have different identities

Evaluation first freezes selected cases, model configuration, scoring criteria, and the intended evaluation cells. Runtime execution then creates concrete model requests. Each identity answers a different question.

| Identity | What it establishes | What it cannot establish |
| --- | --- | --- |
| Planned identity | Intended model, cases, and evaluation conditions | Which model was actually dispatched |
| Physical attempt | Effective provider, model, protocol, and request outcome | Identity of every request in the Run |
| Effective behavior | Authorized instructions, logical tool surface, and reasoning/generation settings that controlled the request | Complete authorization or semantic quality from a single prompt hash |
| Evaluation cell | Case, round, configuration, rubric, and corresponding execution evidence | Safe reuse merely because the Run completed |

An attempt ID is a correlation handle for diagnostic records, not a stable key for comparing behavior across experiments. Retrying creates a new attempt, potentially with the same approved controls. Conversely, a Run ID can stay unchanged while its dispatched model or settings change.

The design is not a universal new identity registry. **The request owner supplies actual dispatch facts, the instruction and tool owners supply effective control facts, and the evaluation owner decides comparability from the combined evidence.** Original authority and result ownership stay in place.

## 2. Why recording backup model B is still insufficient

Imagine this controlled sequence:

| Request | Role | Intended / actual | Known outcome |
| --- | --- | --- | --- |
| Entry decision | Entry | A / A | Completed |
| First research call | Main | A / A | Provider failure |
| Backup research call | Main | A / B | B completed |
| Independent investigation | Child | Separately selected | Partial diagnostics |

Collapsing all of this into “Run model = A” incorrectly attributes B's work to A. Replacing it with “Run model = B” erases the entry and failed Main attempt. Child requests mixed into Main attribution can also corrupt call counts, costs, and comparison conditions.

The original diagnostics must therefore preserve role (Main or Child), resource purpose (Entry or execution), effective provider/model/protocol, and attempt outcome. Local evaluation retains appropriately identified Main, Entry, and Child observations separately. The link to the original request matters more than the final response label.

A surprising detail is that **overall diagnostic coverage can be incomplete while individual facts remain valid**. An event with a missing identity prevents the timeline from proving complete coverage. Yet two validated Main attempts can still supply a decisive contradiction: if the original attempt went to B rather than the evaluated A, attribution to A must not pass. Seeing one matching A attempt, on the other hand, cannot prove that no B attempt was omitted.

This gives us an asymmetric rule: **one trustworthy contradiction can invalidate a comparison; a handful of matching observations cannot prove complete equality.**

## 3. Compare effective behavior, not just the configuration file

Even two calls labelled model A may have different experimental conditions. Trusted system instructions, participating Skills, the ordered logical tool surface, reasoning effort, output limits, protocol, and other effective generation settings can all alter behavior.

Two categories need different treatment:

- **Behavior-controlling inputs:** trusted instructions, selected tool contracts, and the settings actually applied to the request.
- **Task-specific dynamic material:** user questions, retrieved documents, history, and authorized context fitting. They affect outcomes, but do not automatically constitute a new version of every system-level behavior setting. Case and source identity belong to the evaluation plan.

Hashing the entire prompt is not enough. It can conflate a legitimate change in user input with a configuration change; worse, the hash might come from a preliminary prompt rather than **the request actually dispatched**. Request assembly, tool admission, context fitting, and gateway encoding can each occur at different points. Evidence must come from the correct original seam.

An additional local complication is a dirty worktree. Equal Git HEADs do not prove that tracked runtime source files were identical. Bounded source digests allow the evaluator to distinguish a known change during execution, an observable match, and an unavailable observation. A matching digest is limited source evidence—not a proof that dependencies, provider versions, or complete wire requests matched.

## 4. Historical outcomes require mismatch, match, and unknown

Once execution identity reaches evaluation, comparability needs at least three outcomes.

| Evidence | Treatment |
| --- | --- |
| Necessary relevant execution facts and comparison conditions meet the original qualification rules | Consider reuse under those existing rules, retaining the original result |
| Known discrepancy in Main route, source, configuration, plan, or relevant case identity | Do not reuse the attributed historical result |
| Essential request observations or immutable provider versions are unavailable | Retain unknown unless an explicitly authorized, bounded approximation applies |

Unknown and different are not interchangeable. Missing observations do not prove an attempt never happened. A known contradiction must not disappear because some other fields are unknown.

ETF Agent also implements a pragmatic **local-resume-only approximation**. Immutable provider/model versions and complete effective inputs may be unavailable when a local evaluation resumes. Under the specifically authorized policy, a historical cell whose **original execution start** falls within 48 hours may be reused when existing plan, registry, configuration, route, and observable source checks find no known contradiction and the original review remains valid.

This is not a claim that “everything within 48 hours is the same.” The report records input compatibility as `assumed-not-verified` and can return `passed_with_warnings`. It neither runs a new model-quality assessment nor provides exact qualification to other evaluation consumers. Restarting cannot refresh the original execution clock; missing, expired, or future timestamps cannot qualify.

A known Main route mismatch, a changed Entry output limit, code that changed during evaluation, or contradictory adapter hashes instead keeps attribution `unverified`. The evaluator should detect known drift **before dispatching the next provider checkpoint**, not spend resources first and discover that the previous results are incomparable afterward.

## 5. Where the bug hides: five different seams

Debugging the model selector alone is unlikely to be enough. Investigate the evidence handoffs in order:

1. **Request preparation:** Which authorized control inputs reached the final request? Did legitimate context fitting occur afterward?
2. **Dispatch:** Was the original model actually called? Did backup routing re-admit the request? Which provider, protocol, and model were used for each attempt?
3. **Diagnostic projection:** Did transformation into evaluation cells lose Main/Entry/Child roles or failed-attempt outcomes? Did incomplete coverage incorrectly erase valid individual evidence?
4. **Durable readback:** After process restart, does the stored identity reflect original requests or current default configuration?
5. **Reuse before next dispatch:** Are known route, source, and plan changes rejected before the next paid experiment? Does the 48-hour window use the original start time?

These questions are suitable for deterministic contract tests, not guesses by an LLM judge. Controlled tests inject synthetic provider failures through the configured SDK adapter, then verify that failed A and successful B remain distinguishable in original diagnostics, request records, and local Evaluation. Other cases exercise Child recovery, cross-process readback, and pre-dispatch drift rejection. They verify the tested identity and refusal behavior, not semantic quality, production-wide trace coverage, or investment accuracy.

## 6. When this complexity earns its keep

For a single model call with no historical result reuse, a planned model label and an actual response record may be enough. Maintaining multiple identities, bounded fingerprints, and unknown states imposes operational and reporting complexity.

Once an Agent supports failover, multiple execution roles, cold recovery, and repeated evaluation, the question becomes: **can today's result be shown to have been produced under comparable, reconstructable conditions?** If not, the system should retain “unknown” or explicitly disclose a permitted approximation. Lower evaluation cost and exact comparability are a real trade-off, not a naming problem.

This article focuses on evaluation attribution. For why a task can safely change model routes, see [model failover](agent-provider-failover-without-resetting-the-run.md). For case selection, judges, financial accuracy, and release decisions, see the [Agent evaluation panorama](honest-agent-evaluation.md).