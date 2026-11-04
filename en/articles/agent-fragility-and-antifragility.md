---
title: "Agent Fragility and Antifragility: When Safeguards Start Causing Failures"
description: "From optional-note vetoes to termination ownership, Spec, and History: why safeguards can amplify local failures and how engineering can reduce repeated control and evolution debt."
readingBrief:
  takeaways:
    - "Judge fragility by how a disturbance reaches the user's task. If a change in auxiliary state can veto independent permitted work, the safeguard itself has expanded the failure's reach."
    - "Centralizing termination requires ownership of continuation, finalization, and stopping decisions, together with their coordination rules. A shared failure write or another all-purpose manager does not resolve scattered responsibility."
    - "Recovering a task shows that it survived a particular disturbance. Antifragility also requires specifying which system benefits, under which conditions, and after accounting for costs; passing tests is insufficient."
    - "Engineering experience matters when it changes later decisions. Preserve counterexamples and design history, put valid constraints into the current Spec, and retire obsolete rules and duplicate vetoes."
  appliesTo:
    - "Teams maintaining research Agents, investigating local failures that halt larger tasks, resolving conflicts between retries and finalization, or reviewing an accumulation of safeguards and engineering rules."
  notFor:
    - "A quantitative certification of antifragility, an automatic self-improvement design, or a fault-injection runbook ready for production use."
---

<script setup>
import { withBase } from 'vitepress'
</script>

# Agent Fragility and Antifragility: When Safeguards Start Causing Failures

**One source of fragility in an Agent system is the way it handles exceptions: a local problem passes through successive safeguards until the whole task loses its opportunity to continue or deliver useful work.**

A read fails, so we add an interception point. State changes, so we add another check. The model is ready to finish, so we ask another reviewer to confirm. Each measure can seem reasonable on its own. Connected together, however, they can make a changed working note prevent an already prepared model request from being sent, or let one failed operation cut off other work that remains valid. Code can execute all these rejections consistently and deterministically.

In the evolution of ETF Agent, we moved from scattered interception to explicit termination authority, then brought the relevant coordination rules into the existing termination responsibility. These changes are useful to examine together: **how a system absorbs a deviation and how its development process learns from that deviation are connected but distinct questions.** The first determines how much of today's task is lost. The second determines whether tomorrow's design repeats the same way of creating the problem.

This article examines the structure of a system's response to disturbances. A disturbance might be a failed read, a change in auxiliary state, or a new capability that invalidates an old assumption. This is an analytical perspective, not a proposed architecture layer: follow a problem to see how its effects spread, then follow the repair to see how the experience enters the next design.

Before calling a system resilient or self-healing, it is more useful to make this path clear.

## 1. Why a Small Problem Can Fail the Whole Task

We will use one teaching task throughout. A user uploads several authorized product documents and asks an assistant to compare their differences and save a report. Two documents can be read; another is temporarily unavailable. The research also uses an optional working note to track questions that still need checking.

A reasonable result for the user might be a limited comparison based on the material that was read, a clear statement of what is missing, and a report they can return to later. That does not mean the complete comparison is finished. The unreadable document must not be described as containing no differences.

In one implementation, any error in an auxiliary step throws upward, and the top-level handler marks the task as failed. Another implementation lets the reader report the specific failure, preserves work that does not depend on the missing document, and leaves the task lifecycle to decide whether to continue, finalize, or stop.

The local problem is the same, but the scope of the loss differs. The first design makes one component's health a condition for delivering other work. The second first asks: **which subsequent actions actually depend on the condition that failed?**

That gives us a more explanatory question than how many errors occurred: **after a deviation passes through the system, how far has its effect spread?**

When a document is missing, the immediate consequence should fall on conclusions that depend on it. When the outcome of an actual write is unknown, the system must not assume nothing happened and perform the same action again. The former permits a narrower conclusion; the latter constrains the relevant operation. Collapsing both into a generic `error` and applying the same stopping or retry policy discards the information that determines what may happen next.

<figure>
  <picture>
    <source media="(max-width: 760px)" :srcset="withBase('/diagrams/agent-fragility-and-antifragility/failure-propagation-en-mobile.svg')" />
    <img style="max-height: none !important; height: auto;" :src="withBase('/diagrams/agent-fragility-and-antifragility/failure-propagation-en.svg')" alt="Two ways a failure can spread: a local problem with optional research notes can reject an entire task, or be handled locally while the lifecycle chooses continuation or finalization under the original constraints" />
  </picture>
  <figcaption>Figure 1 · A teaching illustration: the scope of a safeguard determines how much permitted work the same disturbance can interrupt. Continuation and finalization remain subject to the original authority, budget, and execution facts. Expand full-size diagram <a class="diagram-original" :href="withBase('/diagrams/agent-fragility-and-antifragility/failure-propagation-en.svg')" target="_blank" rel="noopener noreferrer">View full diagram</a></figcaption>
</figure>

This problem is not exclusive to Agents. It becomes especially visible when parts of the later path form only after the model reads new material. A search that finds no answer might lead to another source, a narrower question, or an explicit gap; it does not inherently require the entire investigation to end. [Runtime Uncertainty and the Difference from Backend Development](/en/articles/agent-vs-backend-development-panorama) connects this to a concrete responsibility: preserve room for permitted adaptation while enforcing the boundaries of actual actions.

## 2. How Safeguards Acquire Authority They Do Not Own

Scattered interception did not appear without a reason. When a path is short and every step is required, stopping early on an exception can prevent further work based on invalid premises. Rechecking state after preparing a request may also protect against stale conditions. The problem appears as the system evolves: auxiliary information and necessary prerequisites become distinct, while an old check retains its former power to veto everything.

ETF Agent's `Research Needs` provides one example. It is an optional list of research questions that helps the model organize what still needs checking. The old implementation checked whether this list had changed after a model request was prepared. A change could prevent the entire request from being dispatched.

The observation that the list changed could be entirely correct without justifying the rejection that followed. A working note is neither user authorization nor proof of available tool resources. The real identity, permission, and resource conditions still need checking, but a change in auxiliary work state does not by itself invalidate an already prepared request. The [termination-authority article](https://hpoenixf.com/eff-agent-article/en/articles/agent-veto-authority-and-run-termination) explains the mechanism in more detail.

An earlier finalization repair addressed a different conflict. Once part of the response body had been published, old logic restricted subsequent publication, preventing additional explanations of limitations and conflicts from reaching the user. Having already published something was treated as evidence that no further publication was needed. That assumption no longer held for progressive research. This repair preceded the centralization of termination authority; it must not be rewritten as a single achievement of the later module.

Together, these experiences reveal a recurring change: **state intended to assist a task gradually becomes a prerequisite for allowing the task to proceed at all.**

This also explains why safeguards cannot be judged by their number. A check consumes time, adds dependencies, and may change which results can reach the user. It participates in system behavior. Reviewing it requires examining both the error it blocks and the permitted paths it may cut off.

For example, checking the same applicable authorization at several execution boundaries may be necessary defense in depth: the boundaries may serve different callers, or authorization may have changed between them. By contrast, several modules independently interpreting whether the same research note is sufficiently complete, then each deciding whether the whole task may finish, may simply duplicate a veto for which none has adequate authority.

**Withdraw decisions that lack the corresponding responsibility, while keeping necessary protection at the boundary of the effect it actually safeguards.**

## 3. Centralize Termination Decisions, Not Just the Final Database Write

After noticing that local errors keep becoming global failures, a natural repair is a shared entry point: every exception calls `finish(failed)`, and one place saves the status.

This standardizes the result format while leaving the decision to end the task scattered. The reader decides to fail, the note component decides to fail, and a Hook decides to fail. The shared entry point merely records their decisions. Adding the next capability can still introduce another component with implicit power to end the run.

The termination-authority work in October 2026 addressed this distinction explicitly. Each component first handles failure within its own responsibility, then passes confirmed facts to the Run lifecycle. A Run is one execution of a task. Its lifecycle has the current phase, execution facts, original resource conditions, and delivery state needed to decide whether to continue, enter bounded finalization, or end.

An Owner here means **the logical component with final responsibility for a particular decision**. It need not be a process or a single file, and it does not mean handing everything to one manager.

| Decision | Facts it needs | Authority it must not acquire along the way |
| --- | --- | --- |
| Whether a read, write, or tool invocation may proceed | Applicable identity, object, authorization, and execution conditions | Deciding whether the entire investigation still has value |
| How many resources remain available | Resources already consumed and reserved for the original task | Issuing a fresh allowance because the phase changed |
| Which body has been validly saved | The content, version, dependencies, and commitment facts | Treating a saved body as proof of complete or correct research |
| How this Run continues and ends | Those facts, the current phase, cancellation, and deadlines | Overriding other responsibilities' valid refusals or repeating unknown effects |

Centralizing termination therefore does not mean always allowing work to continue. On cancellation, a hard deadline, or the absence of a safe basis for continuation, the lifecycle must still stop the relevant execution. It can retain independent results that remain valid, but it cannot change the facts to make the task look finished.

Finalization also needs limits. Consuming the research allowance does not earn a new budget on entering finalization. Finalization cannot reopen exploration and then request another finalization pass. Existing results may need saving and limitations may need explaining, but those actions still pass through their original admission conditions. Otherwise, giving the task one more chance merely turns failure into a longer loss of control.

Another boundary is easy to miss: **a component observing the result should not acquire authority to rewrite it.** Once the task has been settled according to the facts, a failure in a notification or observation callback should leave a diagnostic record, not revise the committed outcome. Conversely, a successful notification cannot conceal a body that was never saved successfully.

The value of this refactoring was to make the connection between what happened in one step and how the whole task should end explicit. It reduced one form of error propagation. Whether the research content was good enough still required examination of the content itself.

## 4. Why Naming an Owner Does Not Remove Duplicate Decisions

A clear responsibility name does not establish that the relevant knowledge has been brought together.

After termination authority was centralized, a subsequent review found that parts of phase selection and next-request intent remained in the main loop while termination decisions lived elsewhere. Both locations had to understand when research should end, when only finalization was allowed, and why a phase could not move backward. Changing one rule still required coordinating two places.

The later adjustment moved that coordination knowledge into the existing `run-termination-owner` and removed duplicate phase state and progression logic from the main loop. **It introduced no Finalizer Agent, separate execution loop, or additional resource account.** This deepened an existing responsibility. Verification addressed behavioral equivalence and preservation of boundaries; it was not evidence of another confirmed production incident being fixed.

Why does this small step belong in a panorama? It reveals two different forms of centralization.

One merely moves code: callers still need to know every internal state and still decide outside the module what should happen. The other reduces the rules callers must understand: the main loop executes permitted actions while the corresponding responsibility interprets phase and termination rules. The latter actually reduces how many places a future change must keep in agreement.

The same distinction helps answer whether another overarching manager is needed. If a new manager must understand every tool exception, publication rule, resource type, and recovery detail, it may simply put the coupling inside a larger box. Errors become concentrated there, and so do changes.

A better boundary is: **each decision has clear responsibility, and those responsibilities cooperate through the facts they each hold**. Tools still own actual invocations, resource components still own allowances, publication still owns body-commitment facts, and the lifecycle owns the direction of the overall run. A particular authority is centralized; the cooperating responsibilities remain distinct.

There is also a condition for not extracting anything. If a small task already has its termination rules in one execution entry point, with no second interpretation or burden of coordinating phases, there is no need to create a separate named module for conceptual completeness. An abstraction deserves to remain when it actually absorbs knowledge that was scattered before. The maintenance cost explored in [Why Systems Become Harder to Evolve](https://hpoenixf.com/eff-agent-article/en/articles/code-cheaper-systems-harder-to-evolve) meets runtime fragility here: duplicated knowledge can produce conflicting decisions and amplify the next modification.

## 5. How Far Is Fault Tolerance from Antifragility?

So far, the evidence supports specific mechanisms: local rejection is less readily amplified, termination decisions have an owner, and phase coordination contains less duplication. Calling the system antifragile would still go beyond that evidence.

Taleb and Douady's [paper on fragility and antifragility](https://arxiv.org/abs/1208.1189) examines sensitivity to variability and perturbations. Antifragility requires benefiting from particular disturbances. Suffering less damage or returning to the previous state is insufficient.

Our cases let us distinguish several engineering outcomes. These are not successive levels on a maturity ladder:

| Observed outcome | What it supports | What it does not directly establish |
| --- | --- | --- |
| A change in optional research notes no longer interrupts a valid request | A more appropriate ability to tolerate this kind of change | More changes will make the system better |
| After an interruption, the system returns to a usable state under the original facts | A particular recovery mechanism works | The interruption produced a net benefit |
| A counterexample leads to changed responsibility that is adopted in a later design | The development process absorbed the lesson | The running Agent can automatically revise its own architecture |
| Within an explicit scope, later benefits attributable to disturbances exceed losses and improvement costs | A basis for further discussion of antifragility within that scope | More faults of any type or intensity are desirable |

We must specify who benefits. If a report fails and the team later learns something, the user of that report may still have experienced only a loss. Offsetting that user's loss with the team's long-term knowledge changes the subject of evaluation. A system version, its development process, and its users can face different benefits and costs.

Likewise, a research system becoming more adaptable to temporarily missing optional material does not show that it can withstand storage corruption, invalid permissions, or unbounded load. Antifragility must be attached to a particular disturbance, scope, and subject of evaluation.

In [Principles of Antifragile Software](https://arxiv.org/abs/1404.3056), Martin Monperrus distinguishes software products from development processes and proposes directions for software engineering that improves through faults. This provides a useful distinction for the article; it does not establish long-term effects in our project.

The strongest conclusion from this engineering history is that we are reducing a structure that amplifies local exceptions, while letting counterexamples influence later design. Whether this produces sustained net benefits requires comparing later problems of the same kind, maintenance burden, task delivery, and repair costs. Existing controlled verification cannot replace that longer-term observation.

## 6. How Spec and History Let a Failure Change the Next Design

A runtime can save error logs while its development process learns nothing. The next developer sees a failed request and adds another interception point. A Coding Agent reads an old description and restores a check that was deliberately removed. More material has accumulated, but design direction has not changed.

The first thing to retain is **why the judgment changed**.

For research notes, a record saying only that a check was removed can easily look like missing protection. A more useful history retains the causal chain: the original intent was to prevent a request from using stale conditions; later evidence showed that the changing object was an optional work record; the original responsibilities still checked identity, authority, and resources. The change therefore withdrew the note's additional veto over the whole dispatch, while preserving necessary admission checks.

That explanation gives a later review a chance to recognize the same mistake even when the new component is not called `Research Needs`.

Spec and History consequently serve different purposes. **The current Spec states the behavior that must hold today; History explains why an older choice was reasonable and which counterexample made it necessary to change.** Original verification records establish what was actually observed at the time. These sources can refer to each other without copying the same log into every file.

In a review of responsibility gaps after the termination work, the same reasoning was applied to Child tasks. A child task's technical termination belongs to its own responsibility. It should not remain active indefinitely merely because it produced no body, nor should a local failure determine the final state of Main or sibling tasks. In the relevant controlled case, Main could already consume valid fragments and deliver a result. The repair directly completed Child's durable terminal state and active relationship. Keeping that distinction clear avoids crediting every improvement with saving the main task.

The later design of a content-trust responsibility shows another transfer of the lesson: protect source and structural identity at the actual input boundary while explicitly withholding Run termination authority, body-veto authority, and new authorization powers. The relevant evidence here is that **an earlier lesson became a constraint on a new design**, beyond a repair to the original file.

Another decision is particularly instructive. To prevent responsibilities from overreaching again, we considered an automatic scanner. Comparing it with existing reviews and actual counterexamples did not establish that it would detect additional problems, so the proposal was withdrawn and existing design review and behavioral verification were retained. This was not a new scanner implemented and then measured for benefit. It shows that engineering experience can also support a decision to add nothing.

These experiences connect the feedback path: an exception exposes an implicit assumption, a counterexample helps locate responsibility, a repair changes behavior, and current rules together with historical explanations influence the next design. **Experience becomes useful when a later choice changes because of it.** File counts, principle counts, and record length cannot substitute for that change.

<figure>
  <picture>
    <source media="(max-width: 760px)" :srcset="withBase('/diagrams/agent-fragility-and-antifragility/runtime-engineering-feedback-en-mobile.svg')" />
    <img style="max-height: none !important; height: auto;" :src="withBase('/diagrams/agent-fragility-and-antifragility/runtime-engineering-feedback-en.svg')" alt="The runtime handles disturbances under existing rules and delivers or stops; developers use counterexamples, responsibility changes, specifications, and behavioral verification to influence the next design, without implying automatic runtime learning" />
  </picture>
  <figcaption>Figure 2 · Tolerating a disturbance and learning from it follow different paths. Developers drive the lower feedback path. Saving logs, writing rules, or recovering successfully does not by itself establish a net benefit from disturbance. Expand full-size diagram <a class="diagram-original" :href="withBase('/diagrams/agent-fragility-and-antifragility/runtime-engineering-feedback-en.svg')" target="_blank" rel="noopener noreferrer">View full diagram</a></figcaption>
</figure>

## 7. Learning Can Add Burden, So Rules Need an Exit

If every fault adds a rule that can never be withdrawn, the system does remember its history. Its memory, however, has become an increasingly thick layer of restrictions.

A new termination responsibility takes over phase decisions, but the main loop retains the old decisions. The original authorization boundary has already validated the object, but an outer layer rejects it using an obsolete field. A migration has finished, but a regression test still requires the old implementation to exist. Each mechanism has a history and may have a passing test. Together they maintain a world that has already changed.

Learning from failure therefore needs another action: preserve valid protection while removing requirements that no longer hold.

Suppose an old test asserted that a request must not be dispatched after the notes change. Once responsibility has been clarified, restoring an incorrect global rejection merely to keep that test green would reverse the improvement. Update the superseded behavioral expectation while retaining the constraints that still hold: invalid identity must not authorize execution, insufficient resources must prevent dispatch, and unknown effects must not be repeated blindly. [Documents, Code, and Tests Evolve Together](https://hpoenixf.com/eff-agent-article/en/articles/docs-code-tests-evolve-together) explains this distinction.

**An invalidated premise should leave the current constraints; the history explaining where it came from can remain.** Traceable history does not require the old mechanism to keep participating in execution.

This also helps us assess a repair's cost more precisely. Beyond fixing the current counterexample, does it add waiting, input, and decisions to every normal task? Will adding a tool require changing more callers? When the new mechanism is replaced, can it be removed without rewriting users' existing task records?

These costs are not a reason to discard necessary protection. Actual authorization, restrictions on financial execution, and the integrity of facts cannot be traded away for a better performance score. Auxiliary checks, additional Reviewers, and coordination layers, however, need an observable contribution. If an existing responsibility already solves the problem and another layer adds nothing independently useful, merging it or declining to build it can be the better design.

From this perspective, a strong signal of architectural learning is that a new counterexample clarifies responsibility and leaves future maintainers with one fewer duplicate rule to carry. Sometimes that means adding a capability. Sometimes it means deleting code and assertions that were once written with considerable care.

## 8. Verify Reduced Fragility without Creating Another Veto

Return to the original document-comparison task. If verification asks only whether an error causes a request to be rejected, rejecting every request becomes an easy implementation to pass. To judge whether protection has the right scope, observe both sides: is the dangerous effect blocked, and can independent permitted work still reach a result?

This does not require another large review platform. Inputs that distinguish the designs can be exercised in existing behavioral tests:

| Changed condition | Expected observation |
| --- | --- |
| Optional research notes change after request preparation | The change alone cannot veto dispatch; applicable identity, authority, and resource checks remain effective |
| One document cannot be read, while other independent material is available | Missing material is not described as nonexistent, dependent conclusions narrow, and an unrelated exception does not prematurely cut off other permitted work |
| An external write has an unknown outcome | No fabricated failure receipt and no direct repetition of the effect; the independence of other results is still judged by actual dependencies |
| The user cancels or a hard deadline is reached | New relevant execution stops while established facts remain; finalization cannot serve as a reason to restart model work |
| Terminal state is committed, then a notification callback fails | Diagnostics may record failure, but the callback cannot rewrite committed task facts |

For these explicit runtime boundaries, controlled faults can test causal relationships: place the fault at the actual execution boundary and observe which effect is refused and which work can still proceed. Whether a model uses the remaining material to produce a good report needs a different kind of real-task evaluation. Making a path available does not establish that the model used it well.

The [Principles of Chaos Engineering](https://principlesofchaos.org/) emphasize hypotheses about measurable steady-state behavior, challenged through controlled disturbances while limiting their impact. That method informs the verification discussed here. Fault injection can expose weaknesses or increase confidence in recovery behavior; it does not establish that more faults are better.

The scale of an experiment should fit the question. An identified false rejection caused by a working note can first be checked through a local behavioral test. Suspected problems between storage and process handoff call for the corresponding integration environment.

To make a stronger claim of long-term benefit from this development approach, observe comparable tasks and changes: whether similar responsibility errors recur less often, normal paths acquire extra burden, independent results survive faults more readily, and the benefits justify repair and maintenance costs. If measurement rules change, restore comparability first. Becoming better at recording errors must not be reported as making fewer errors. [Local Improvements Are Not System Progress](https://hpoenixf.com/eff-agent-article/en/articles/local-improvement-is-not-system-progress) provides a necessary constraint here.

## 9. Decide What the Next Failure Should Leave Behind

Looking back at the comparison task, we want the system to accommodate ordinary realities: one document is temporarily missing, an exploratory step yields no answer, or auxiliary information changes. It still needs to respect authority, resources, and user intent, deliver what can independently stand, and end accurately when it cannot proceed.

Scattered safeguards tried to protect these goals, yet old assumptions and misplaced responsibility could turn them into obstacles. Centralizing termination authority addresses who may decide the direction of the whole task. Deepening an existing module addresses who needs to know its rules. Spec, History, and behavioral verification let that change influence the next design. Together, they answer the same question: after a deviation, how can the system avoid continually spreading loss and complexity outward?

Before adding one more safeguard, follow the actual failure path: which premise did the exception break, who has authority to reject the corresponding effect, and which work does not depend on it? After the repair, examine what it adds to current rules, what it removes, and whether the next developer can understand the tradeoff.

**For the running Agent, keep failure within its appropriate scope. For the evolving engineering system, turn counterexamples into judgments that the next design can use.** Both need careful work before there is a basis for discussing benefit from disturbances. If a repair makes responsibility clearer, keeps permitted paths reachable, and lets obsolete burdens retire, we can already name the concrete improvement without first calling the system antifragile.

<!-- agent-article-sync:guidance:start -->
## Further Reading and Discussion

- [How Agent Development Differs from Backend Development](/en/articles/agent-vs-backend-development-panorama): why runtime paths vary and how their constraints remain enforced.
- [Run Termination, Stage Budgets, and Safe Recovery](https://hpoenixf.com/eff-agent-article/en/articles/agent-veto-authority-and-run-termination): how local rejection and whole-run termination divide responsibility.
- [Code Is Cheaper; Why Are Systems Harder to Evolve?](https://hpoenixf.com/eff-agent-article/en/articles/code-cheaper-systems-harder-to-evolve): duplicated knowledge, overhead on normal tasks, and retiring mechanisms.
- [Documents, Code, and Tests Move Forward Together](https://hpoenixf.com/eff-agent-article/en/articles/docs-code-tests-evolve-together): preserve valid protection while superseded requirements leave the system.

[Chinese edition](/articles/agent-fragility-and-antifragility) · [Architecture Principles and Engineering Methods](https://hpoenixf.com/eff-agent-article/en/principles)

More articles are available at the [ETF Agent reading site](https://hpoenixf.com/eff-agent-article/en/). Consider starring the [GitHub collection](https://github.com/hpoenixf/eff-agent-article), or contributing engineering counterexamples from a different setting.
<!-- agent-article-sync:guidance:end -->
