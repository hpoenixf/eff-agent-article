---
title: Code Is Cheaper; Why Are Systems Harder to Evolve?
description: A report with an optional chart attachment illustrates spreading dependencies, costs paid by ordinary tasks, and how obsolete mechanisms can actually leave a system.
---

# Code Is Cheaper; Why Are Systems Harder to Evolve?

A reporting system already generates a readable body. The next feature is a chart attachment, and an AI quickly writes the rendering function. Connecting it reveals more work: the page must interpret chart states, the save API must recognize rendering errors, scheduled jobs must wait for attachments, and every report gains another check.

Later, replacing the chart library requires changes in all those places. The original function was short. The assumptions built around it have spread throughout the system.

This is a teaching simulation. Its business setting and events explain architectural choices; they are not an ETF Agent report incident. The question is practical: **new code may be easy to produce, but someone must also maintain the knowledge added to callers, the cost imposed on ordinary tasks, and the eventual exit work.**

All of these belong in the cost of a capability.

## 1. Who Now Needs to Understand the Chart Renderer?

Adding a few conditions at each entry point can be a reasonable first delivery choice. With one page and one caller, the work is limited and easy to inspect.

Then the system adds scheduled reports and downloads of saved results. Each entry point copies similar rules: wait while a chart is queued, retry on rendering failure, and withhold the report until its attachment is ready.

Moving the rendering code into a new directory does not resolve this. Pages and jobs still understand its internal states. A change to retry policy still requires several coordinated edits.

**Encapsulation should reduce what callers need to know.**

First clarify the product agreement: the report body is independently useful, and the chart is optional. If that is the promise, callers need the body and the attachment result. They need not each interpret every rendering stage. The chart module handles its preparation, failure, and cleanup; the report module presents the results it has received.

If a particular report must contain a legally required chart to be complete, it cannot be treated as optional for convenience. The boundary follows the real promise.

When reviewing an abstraction, ask which unrelated callers would need to learn new rules if this implementation changed. If the list remains long, moving the files was only a start.

## 2. Why Did One Failed Attachment Hide the Entire Report?

Suppose the body is ready, but the renderer cannot use a font. The simplest error path throws upward, and every caller receives “report failed.”

Error handling looks consistent, but the failure now has a wider effect. A user who could have read the body receives nothing.

Under this example's optional-chart agreement, the body should remain readable. The attachment area should explain that the chart is unavailable, and a later retry should target that attachment. A save failure must still be reported accurately: generating text does not establish that it was saved.

There is a firm boundary here. If the body depends on private material without authorization, removing its citation or attachment does not make it publishable. Actual permission and content dependencies still belong to the modules responsible for them.

ETF Agent's publication work exposed a related real problem: a publisher could preserve an independently permitted body while earlier candidate filters or another failure in the same batch could still discard it. Repairing the publication function alone was insufficient. The actual entry path also needed inspection for a second rejection before reaching it. The [publication article](019-agent-answer-publication.md) covers that mechanism.

The practical repair is to trace where “chart failed” becomes “entire report failed,” then confine the refusal to the effect that component owns. Adding a coordinator does not automatically fix the scope of that decision.

## 3. An Optional Feature Can Cost Something Even When Unused

Imagine that every report creates a rendering job before checking whether the user wants a chart. Skipping the render later does not undo job registration, status queries, or added dependencies.

An agent can pay a similar cost through prompts and tool definitions: a capability may never be called while its instructions still enter every model request.

Distinguish three cases when assessing optional functionality:

| Case | What to inspect |
| --- | --- |
| The feature has not been connected | The original ordinary-report path |
| The feature exists but this task does not use it | Added jobs, queries, context, or waiting |
| The task actually uses the feature | Its result and additional cost |

In the teaching system, only a report requesting charts might enter the rendering path. Plain-text reports can retain their existing route. Comparable observations are needed to establish a latency reduction; a new switch alone does not prove it.

Likewise, saving input space does not justify silently dropping tools already admitted for the current request or omitting necessary protections. Removing irrelevant overhead and reducing promised capability are separate decisions.

## 4. Replacement Is Finished When the Old Burden Can Leave

Now replace the old chart library. One tempting upgrade adds a wrapper that tries the new renderer and falls back to the old one. Both result formats remain, and the page understands both sets of states.

This can be a necessary transition. Without exit conditions, however, it becomes permanent maintenance of two implementations and their compatibility rules.

Record the conditions in the existing migration task: the new renderer covers chart types still in use; new jobs no longer call the old library; retained historical files remain readable; and no in-flight jobs depend on the old format. Once these conditions hold, remove the old wiring, dependency, and states used only by the retired library.

The existing retention and deletion agreements still decide what happens to saved images. Deleting a renderer does not justify deleting files users remain entitled to read.

Inspect current guides and tests too. If they still require the old library or its internal state names, the next developer or Coding Agent may recreate the retired mechanism. History can explain the original choice; current instructions should guide the current implementation.

## 5. Unloading, Replacing, and Deleting Solve Different Problems

[DeepSeek Harness's architecture documentation](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/architecture.md) describes composing models, tools, and an agent loop through Cordis plugins. Its [lifecycle documentation](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/cordis-tutorial/02-lifecycle-and-effects.md) explains that framework-managed registrations unwind when a plugin unloads, while other resources need explicit cleanup effects.

The useful lesson is to consider how a capability leaves. It does not require turning every system into plugins. For the chart example, ask three separate questions:

- **Can it clean up when disabled?** Are timers, listeners, or temporary resources still active?
- **Can it be replaced in isolation?** Can callers retain a stable result agreement?
- **Can it be removed after retirement?** Can obsolete branches, dependencies, and requirements leave?

The answers need not match. Clearing a timer cannot recall a file already sent. Replacing code cannot erase an actual operation record. Without a real replacement need, there is little reason to build a complex hot-swapping framework in advance.

## 6. Bring Five Principles into an Ordinary Review

We summarized these choices as five cautions. Each becomes a concrete review question:

| Principle | Check in the chart example |
| --- | --- |
| Do not add mechanisms merely because they are easy to build | Explain why a local change to the existing report module is insufficient |
| Do not spread complexity | Check whether pages and scheduled jobs still interpret renderer internals |
| Do not broaden a local veto | Check whether an optional attachment failure hides an independently usable body |
| Do not make ordinary tasks pay continuously | Check for jobs or waiting even when charts are not requested |
| Do not introduce capabilities without an exit | Identify which dependencies and requirements disappear after replacement |

These five rows do not need five new checkers. Rules also cost something to maintain. Use the existing design and code review.

A task to add chart attachments can state: establish the delivery relationship between body and attachment; keep rendering states inside the chart module; verify the page's behavior when an attachment fails; compare the plain-report path; and, when replacing an old library, identify live callers and exit conditions.

That gives a developer somewhere to begin and a reviewer a way to assess whether dependencies actually shrink.

**As code becomes faster to produce, ask whether the new capability makes the next change easier.** Clear entry points, accurately scoped failures, and a way for obsolete burdens to leave give a system room to keep evolving.

## Further Reading and Discussion

- [Publication: Why Answers Need an Independent Publishing System](019-agent-answer-publication.md): the mechanisms behind bodies, attachments, and publication facts.
- [Local Improvements Are Not System Progress](local-improvement-is-not-system-progress.md): check benefits and additional costs.
- [Tests Expire Too](test-lifecycle-refactoring-retirement-and-spec.md): remove obsolete requirements from routine regression runs.
- [Architecture Principles](/en/principles): see [capability introduction and exit](/en/principles#principle-7), [feature choices](/en/principles#method-1), and [knowledge retirement](/en/principles#method-6).

More articles are available in the [reading catalog](/en/catalog) and [public GitHub collection](https://github.com/hpoenixf/eff-agent-article). Consider a Star or share a counterexample if these ideas help your work.
