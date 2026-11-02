---
title: "Building Agents with Agents: Why Fixing Bugs Doesn't Complete the Research"
description: "A grounded engineering retrospective on task-level acceptance, source-proof loss, Python file handoff, meaningful outcome measures, and proportionate validation."
readingBrief:
  takeaways:
    - "Define the missing task effect before choosing the smallest useful experiment. Attribution, bounded capability, and product completion are different kinds of progress, not interchangeable bug counts."
    - "Only 21 of 93 stored result groups reached visible projection; repair the source-proof producer rather than weaken consumers. That local fix does not deliver the original missing report."
    - "A Python exercise proved its download and History-readback path, not all research. Runtime completion and saved-answer rates still require task-specific delivery and independent quality review."
  appliesTo:
    - "Teams using coding agents to build research agents who keep fixing defects without completing the original user task."
  notFor:
    - "Not evidence of overall success-rate or engineering-cost improvement, nor a demand for full live research after every local change."
---

# When an Agent Builds Another Agent, Why Does Fixing Many Bugs Still Leave Real Research Unfinished?

> **Fixing a defect, completing a handoff, and finishing the user's task are three different kinds of progress.** This article preserves two real validation windows, then examines how a coding agent can choose worthwhile checks—and why even a plausible success-rate figure may say little about product success.

What is the easiest result to produce when one coding agent helps build another agent? Usually a new implementation, a set of passing tests, or an error that finally stops appearing.

Those results matter. But on October 14, 2026, ETF Agent went through multiple real model requests, tool executions, and publication attempts, while the investment study ultimately ended in **`partial / research_interrupted`**, without a normal HTML report. Subagents repeatedly lacked inputs they needed; some script requests described a method without actually completing computation and export.

Judged by tool calls, the system looked busy. Judged by repaired defects, the project appeared to be moving forward. The report the user wanted was still absent.

Later validation work changed how we organize AI-assisted engineering: **do not add more checks to every change by default. First identify the effect missing from the user task, then run the smallest experiment capable of establishing that effect.**

## 1. Define What Task Completion Means Before the Bug Loop Takes Over

An intuitive early development loop is to run a real question, inspect the last error, add a compatibility branch or prompt rule, and rerun a regression. That can fix isolated defects. A complex task, however, may end up perpetually fixing the “previous error.”

A research report passes through source reading, calculation, writing, persistence, and delivery. Each stage has its own success signals, yet a downstream stage may not have consumed the result of the one before it.

A tool may have saved data that the model is not eligible to read in its next request. The model may have proposed a complete revision that the persistence system never accepted. A report file may exist but remain inaccessible from the browser or History. More prompt tuning would not necessarily touch any of those failures.

For similar work, we now start with a **minimal acceptance card**. The following is a teaching illustration, not a verbatim restatement of the October 14 task:

| Question to answer | Evidence that can establish it | What does not establish it |
| --- | --- | --- |
| Did evidence reach the research? | Eligible material was actually read and entered the relevant model input | A download existed or a tool returned success |
| Did calculation and file handoff work? | Code executed, the artifact was saved, and its download and reopening matched | The model said, “I generated the report” |
| Did the user task finish? | The original task's required content, delivery, and independent quality conditions were satisfied | A local interface passed or the Run ended normally |

This card does not prescribe full end-to-end qualification for every feature. It keeps distinct evidence layers apart. Each change first states which row it intends to affect; only then can we choose an appropriate check. **Closing the task means returning to the original request, not to the latest bug.**

## 2. Why Were Only 21 of 93 Stored Result Groups Visible?

The October 14 study left an especially useful counterexample. We independently reconciled stored tool results against their source projection into subsequent requests: **93 groups were stored, but only 21 entered the visible projection**. Nine later numeric result groups and three available catalog groups were excluded.

That changed the diagnosis. We could no longer simply blame the model for “not using retrieved information.” Some material never received the valid source proof required to enter a later request.

The defect lay in the producer. Cumulative Run-level source proof had incorrectly reused the narrower dependency merger designed for a single Publication. The latter permitted eight dependencies, while Run proof should have supported **64 dependencies and 24 KiB**. Mixing these capacities could discard the ninth valid relationship and those that followed.

The right repair was to the proof producer, not to weaken the consumer's rejection of unknown sources or foreign Run identities. Focused regressions covered retention of eligible dependencies, rejection of overflow, tampered sources, and identity isolation.

We had established meaningful **attribution progress**: why some legitimate information could not enter the next research request, and what behavior the bounded fix restored.

Yet that original natural research run did not automatically generate or deliver the missing HTML. **Repairing the evidence-producing stage did not amount to replaying and completing the original task.**

## 3. What Does Evidence of a Working Handoff Look Like?

On October 16, a separate Python exercise provided a different, positive example.

A real subagent initially read the wrong field and raised `KeyError`. It switched to the actual `nav` field and completed the requested calculation. The first HTML-generation attempt then raised `NameError`; a later attempt corrected string concatenation and exported the file.

This time the evidence did not stop at a passing test or at the model claiming to have written a file. The HTML was exported through the original analysis workspace; the Host retained its file type and content identity; an authenticated HTTP download matched the stored record; Main actually used the download path returned by the child task; and reopening History resolved the same file identity.

Independent arithmetic also checked returns and drawdown in a synthetic case. Together, these observations support a specific conclusion: **the focused path for Python correction, file creation, and cross-agent handoff actually worked.**

But it was not a continuation of the October 14 natural-language task. Nor did it certify every index-allocation study, independent variation, PDF appearance, or investment conclusion. Later natural-question attempts still encountered Python proposals rejected before execution, failed HTML exports, and successful computations whose source relationships were subsequently lost.

We do not have to turn these observations into a story of “failure, then success, then everything fixed.” They are positive and negative cases from different inputs and scopes. Describing that distinction accurately is more valuable than making the retrospective look neat.

## 4. If We Have Success-Rate Figures, Why Can't We Calculate Research Success?

By October 31, 2026, we had a larger—and still carefully scoped—baseline from real engineering evaluation. Of 120 planned specialist-research Runs, **59 had ended**: **42 with `completed` and 17 with `failed`**. Among those 59, **48 had visible answer bodies with confirmed persistence**. The other 61 Runs had not been executed.

With their actual denominators, the normal Runtime terminal rate was **42/59 = 71.2%**, and the confirmed visible-body persistence rate was **48/59 = 81.4%**. Both are meaningful engineering observations. Neither is a financial-research task success rate. Some failed Runs still retained legitimate answer text; a normally completed Run could omit a required analysis or make an unsupported claim.

The biggest trap here is not miscalculating a percentage. It is **renaming a conveniently collected metric as the outcome we actually care about**.

Task success requires returning to the fixed question, required deliverables, source versions, and independent quality criteria, then reviewing the actual result. Reviewed, unreviewed, and indeterminate samples all need to remain visible. The fact that 59 Runs have terminal states does not turn them into 59 semantic-quality verdicts. For this historical cohort, there was still no independently established financial task-success rate, key fact/citation accuracy, or comparable before-and-after improvement measurement.

This also explains the limit of a recent synthetic reference-answer exercise. Independent arithmetic review of reference figures and a repaired report reader did not produce a quality verdict on a genuine model answer. **A correct reference, a working review mechanism, and good performance by the evaluated agent are three different claims.**

## 5. How Do We Spend Verification Effort on the Decisive Questions?

We did not conclude that every change must trigger another complete, real-model research run. Live evaluation costs money, and model version, source date, and permission conditions may change. Uncontrolled reruns can be expensive without being comparable.

A more useful practice is to leave three questions with each coding-agent task.

**What exactly is this change meant to establish?** A repair to cumulative source dependencies can have a proposition as narrow as: “The ninth eligible dependency is preserved; unauthorized ones are still rejected.” Test that deterministically first. Do not label a whole financial report delivered merely because the local check passes.

**Which real handoff could this change affect?** If it touches a mandatory path from script output to file, from historical material to a new model request, or from a saved report to the browser, add an appropriate integration check when permissions and budgets allow. Only after the actual material can be independently reopened is there a basis for discussing a higher-level outcome.

**When do we continue, and when do we stop?** Repair the behavior where responsibility actually resides, within a bounded scope. Once the evidence excludes a suspected stage, stop adding the same kind of patch. Declaring the original task complete requires comparable execution of the original question or a defined variant, actual delivery, and review against the original quality conditions. Otherwise record `partial`, failure, or `unassessed` instead of endlessly adding prompts and review loops.

This is **layered verification without ceremony for its own sake**: local code changes get local proofs, mandatory handoffs get real readback checks, and product claims get actual tasks and content review. The layers inform one another, but none can issue the other's verdict.

## 6. How Do Spec, Evidence, History, and Skill Reduce Repeated Work?

Coding agents make documentation cheap to produce, too. Creating a fresh bundle of Specs, History entries, and Skills for every failure can make the next agent spend more time figuring out which document still applies.

We keep distinct purposes. **Spec** describes intended behavior and how it will be accepted. **Evidence** fixes the version, actual execution outcome, and failures. **History** preserves turning points that changed our engineering judgment. **Skill** records methods that remain useful in a later task, rather than a fragile assertion about what the current main branch must look like.

The long-lived lesson is not how many checks a particular patch passed. It is when to inspect the proof producer after source eligibility disappears, why a reported file must be downloaded and reopened, and why a reviewed reference does not certify the evaluated task.

The existing articles on [Spec and Evidence](026-agent-spec-evidence-workflow.md) and [on-demand engineering knowledge](027-agent-context-document-history.md) explain those systems in full. This article does not need to become another documentation-framework tutorial.

## 7. Before We Announce Engineering Progress Again

Looking back, I now record three different results.

**Attribution progress** identifies where a missing effect actually belongs and corrects an unsupported earlier explanation. **Capability progress** produces checkable positive and negative cases for a necessary behavior in a real or controlled setting. **Product progress** means the user's original task yielded an artifact that meets its delivery and quality requirements.

All three matter, but none can stand in for the others. A report manually completed by a developer is not an autonomous Agent success; a historical failed Run is not retroactively successful because a later patch passed. Without matched pre/post samples and independent quality review, we cannot infer an overall success-rate improvement or a decrease in engineering cost.

This is [principle 8, “Internal success is not user-task success”](/en/principles#principle-8), together with [method 5, “Verification and failure attribution”](/en/principles#method-5), applied to everyday work. Their practical role is not to make engineers collect more logs. It is to help decide **what to fix next, how much to spend verifying it, and which evidence would justify changing the conclusion**.

Coding agents reduce the cost of implementing an idea. A good engineering process uses that capacity for more valuable work: fewer fixes unrelated to the task, less false confidence from local passes, and the most meaningful verification where the user is waiting for an actual result.
