# The Code Was Deleted. Why Was the Old Documentation Still Giving Orders to Our Agent?

*An AI-assisted engineering retrospective: helping obsolete mechanisms leave the system while making useful knowledge available when needed.*

## 1. We Removed a Feature but Kept Telling the Agent to Use It

In October 2026, we cleaned up an obsolete model-evaluation system.

Newer testing paths had already replaced it. But when we inspected the repository, we found something strange.

The old evaluation commands were still present. Running them did not evaluate anything; they merely reported that the functionality had been retired. Worse, our current development documentation still instructed engineers to run those same commands.

In other words:

**The code knew the feature was gone. The documentation still believed it was alive.**

For a human developer, this might look like an outdated instruction.

For a coding agent, it means something different.

We routinely ask coding agents to read project instructions, specifications, and task plans, then independently choose what files to edit, what commands to run, and how to verify their work.

If those documents explicitly require an obsolete mechanism, the agent may dutifully try to run it. It may even conclude that its first job is to repair and restore the missing feature.

That led me to a more important realization:

**In AI-assisted development, documentation is not only something people read. It is an input to the next agent's decisions and actions.**

Deleting a feature is not a complete retirement if its old instructions continue to influence new work.

## 2. The More Dangerous Failure: Rebuilding a Design We Had Already Replaced

We encountered a subtler variation with a market-data processing path.

That implementation once needed better handling of incomplete data. We designed a fix and accumulated some tests and development observations.

Later, the architecture evolved toward a simpler data-access route. The earlier processing layer was no longer needed.

But the old design still said something equivalent to: “The system should add this processing capability.”

That requirement was reasonable when it was written.

Under the newer architecture, though, the interface it described had already been superseded.

If we failed to distinguish a historical proposal from a current specification, we might copy the obsolete requirement back into the active contract. The next coding agent could then faithfully implement the very structure we had worked to remove.

**A design that was correct in the past is not necessarily something we should execute today.**

We did not delete the development history or pretend that the old work had been fully completed.

Instead, we preserved why the idea had been proposed, what had actually been tested, and which tasks had remained unfinished. We also made clear that the obsolete design no longer belonged to current implementation requirements.

The past remained understandable without continuing to govern the present.

That changed how I think about engineering documents:

A project should remember what it tried and why. It should not remain permanently obedient to every old proposal.

## 3. Tests Can Become the Last Defenders of an Obsolete Mechanism

Another incident came from our tests.

We had updated the agent's tool-calling protocol so that model requests, system authorization, actual execution, and returned results had clearer boundaries.

Some tests, however, still described tool use in the old format.

To keep those tests working, there was an automatic translation layer between the old and new approaches.

The translator was almost too helpful. If a test omitted certain authorization requests, evidence references, or completion signals, the old helper could fill them in according to its historical assumptions.

As a result, the tests could pass, but it became hard to answer a basic question:

Had the current agent actually performed the required steps, or had the old test helper quietly completed them on its behalf?

It was like upgrading an examination system while keeping a tool that automatically filled in some missing answers for the candidate.

A green test was no longer clear evidence of the behavior we intended to test.

We eventually replaced that implicit translation with a more explicit testing approach. Each model action was described directly, and the existing execution boundaries were tested without silently inventing missing behavior.

Important checks for authorization, evidence, and recovery were retained. What disappeared was the compatibility mechanism that had supplied hidden behavior.

The broader lesson was this:

**Tests do more than check software. They also encode what the development team believes the software should do.**

If tests are permanently shaped around an old architecture, a future coding agent may preserve or rebuild that architecture simply to keep the tests green.

So when retiring an implementation, the question should not be “Do many tests still import it?”

The better question is:

**Are those tests protecting an important behavior—or merely protecting the old way we implemented it?**

## 4. Our Own History Checker Once Asked Us to Restore Correctly Deleted Rules

We had also built automated checks to detect missing specifications, inconsistent historical records, and unfinished development work.

Those checks were intended to make our engineering knowledge more reliable.

But one run exposed a surprising mistake: some requirements that had been **properly removed** were reported as missing from the current specification.

A feature had intentionally left the system, and the checker treated that absence as a problem that needed fixing.

The problem was not a lack of strictness. The checker had misunderstood the distinction between adding and removing a rule, and it had not handled the historical effective dates correctly.

We fixed the interpretation, corrected the issues we could verify, and left other historical problems visible.

We did not rewrite old failed observations just to make the checker display all green.

That experience created another concern:

**A tool for maintaining knowledge can itself become a source of unnecessary maintenance work.**

If it cannot distinguish a document describing the past from a document governing the present, it may mistake a healthy architectural change for a regression.

## 5. We Started Giving Different Kinds of Knowledge Different Jobs

After these experiences, we stopped treating “more complete documentation” as the only goal.

Different materials should answer different questions.

| Material | The question it primarily answers |
| --- | --- |
| **Current source code** | How is the system actually implemented today? |
| **Current specification** | What behavior is the system presently expected to uphold? |
| **Development plan** | What are we proposing to change next? |
| **Test evidence** | What was actually demonstrated for a particular version and environment? |
| **Historical record** | Why was a decision made, and what went wrong at the time? |
| **Reusable method** | How might we approach a similar problem in the future? |

All of them are valuable. None should silently impersonate another.

A design document from three months ago can explain why we chose a fixed renderer then. It cannot establish that a fixed renderer is still required now.

A test that passed on an old revision can describe what was observed on that revision. It cannot prove that today's code has passed the same test.

A historical incident may suggest where to investigate a similar problem. It should not automatically require the current system to adopt the old repair.

**Preserving history is not the same as granting history permanent decision-making authority.**

## 6. Let Old Knowledge Exit and New Knowledge Enter Only When Useful

We began treating these as two sides of the same development habit.

### Retiring a Mechanism Means Checking More Than Source Code

When a feature is removed, we also check whether current development instructions still demand it, whether tests depend on obsolete implementation details, and whether tool guidance still teaches the agent to use its old interface.

If there are no real consumers, we try to remove the obsolete entry point and unnecessary compatibility layers.

At the same time, we retain legitimate behavior checks, necessary historical readers, and original evidence.

The target of removal is outdated rules and dependencies—not the facts of what already happened.

### New Knowledge Should Not Automatically Become a Global Rule

The opposite direction matters just as much.

Every bug fix can produce a lesson. But if we place every lesson in the global instructions read by every coding agent, that file quickly becomes an enormous rulebook.

A task that only changes a small frontend interaction may end up reading months of database incidents, evaluation failures, and research-runtime debugging notes.

The volume of material grows while its relevance to the current task falls.

We adopted a more restrained approach.

Routine work starts from a small set of essential constraints and the documents relevant to the current task. Historical design discussions and incident records are retrieved only when they help resolve a specific question.

Methods with broad, repeated value may become reusable guidance.

A routine local fix can remain in its own task evidence. It does not automatically deserve promotion into a universal architectural principle.

This changed how we view long-term engineering memory.

Its purpose is not to make a coding agent carry the entire past in every prompt. It is to make trustworthy, still-applicable knowledge discoverable when the agent actually needs it.

## 7. Maintaining Knowledge Is Part of Maintaining the Ability to Evolve

AI-assisted coding makes new code cheaper to produce.

But once that code enters a repository, documentation, tests, conventions, and developer habits begin to form around it.

Future architectural upgrades may therefore be blocked by more than source-code dependencies.

The obstacle might be an old requirement, a stale test, or a development instruction that no longer describes the system.

We once thought that maintaining engineering knowledge mostly meant helping an agent remember more.

Now I think it requires two capabilities at the same time:

**Make genuinely useful experience easy to find, and stop obsolete knowledge from interfering with current development.**

Current rules should guide today's implementation. Historical records should explain yesterday's decisions.

An old design can be understood without being automatically rebuilt.

A new lesson can be saved without being loaded into every agent's context.

A long-lived AI-assisted project needs more than a coding agent that can produce better code. It needs an engineering knowledge system that can update itself.

**The goal is not for the system to remember all of the past forever. It is for the past to help us build the present without constraining the future.**

---

*Evidence boundary: This retrospective is based on real engineering records from the retirement of old evaluation entry points, an obsolete market-data design, implicit test compatibility layers, and a historical-rule checker that misinterpreted valid removals. Each outcome is limited to its original verification scope. It does not establish that every piece of outdated engineering knowledge has been eliminated.*

## Further Reading

For how useful engineering knowledge is selectively retained and retrieved, see [On-Demand Documentation and Long-Term Engineering Memory](https://hpoenixf.github.io/eff-agent-article/en/articles/027-agent-context-document-history). For the broader cost of removing old structures, see [Code Is Cheaper; Why Are Systems Harder to Evolve?](https://hpoenixf.github.io/eff-agent-article/articles/code-cheaper-systems-harder-to-evolve) (Chinese original). A companion essay, [Why We Split a Large Weekly-Review Spec into Three Phases](https://hpoenixf.github.io/eff-agent-article/en/articles/agent-weekly-review-staged-delivery), examines how to keep ambitious development from getting stuck on peripheral features.

More case studies are available in the [ETF Agent Engineering Notes](https://github.com/hpoenixf/eff-agent-article). If this work is useful, consider giving the project a **Star**.
