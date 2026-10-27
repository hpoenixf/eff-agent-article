# Code Is Getting Cheaper. Why Are Systems Getting Harder to Evolve?

*From DeepSeek Harness's pluggable design to the architecture principles we developed while building an Agent*

**AI reduces the cost of creating a capability. It does not automatically reduce the cost of replacing or retiring it. An architectural upgrade should preserve necessary behavior while allowing old mechanisms and their maintenance burden to leave.**

Before accepting a new design, ask: What knowledge will callers have to maintain? Which unrelated modules would need to change to replace it?

## 1. Zero to One Is Getting Easier; One to A Is Getting Harder

AI coding is changing the cost structure of software development.

A new feature that once took days can now be drafted quickly by a coding Agent: modules, interfaces, tests, and sometimes an entire architecture proposal.

**Going from zero to one is becoming easier.**

Yet systems do not feel easier to maintain. As features accumulate, modifications and architectural upgrades become harder.

The difficult transition often is not **zero → one**, but **one → A**, or even **A → zero**.

Starting fresh involves few historic dependencies. Choose an implementation, solve the immediate problem, and deliver a usable first version.

Changing an established system is different. Other modules depend on its interfaces. State has been persisted. Tests encode legacy behavior. A seemingly straightforward design change may require coordinating many independent consumers.

Removing a now-unnecessary design can be harder still.

Imagine we introduced a state manager, validation module, or dedicated execution flow for a specific problem. Later we discover existing functionality can perform the same job without that mechanism.

Can we just delete it? Often not.

Other code expects its fields, states, outputs, and even exception behavior. The module may no longer perform meaningful work, yet has become part of the system's assumptions.

A familiar trajectory follows:

~~~text
Build A
→ Add B to fix A
→ Add an Adapter to reconcile A and B
→ Introduce C while retaining A and B
~~~

We call it an upgrade, but we may only be **stacking more architecture on top of history**.

This changed how I think about three engineering abilities:

> **Creation determines how quickly a system can grow; maintenance determines how long it can survive; evolution determines how far it can go.**

AI reduces the cost of producing code. It does not automatically eliminate the dependencies, compatibility contracts, and maintenance cost that appear **after code enters a system**.

If a feature takes a day to create and weeks to retire safely, was it really cheap?

## 2. A New Feature Is a Long-Term Commitment

Developers often evaluate a feature by the implementation effort: two hundred lines and a few interfaces seem inexpensive.

But long-term cost may include new durable state and migrations, a new tool protocol for the model to learn, additional validation rules, and more failure branches requiring callers to decide whether to continue or stop.

More subtly, a design becomes an assumption held by humans, test suites, and future coding Agents.

**You can delete code without automatically deleting the assumptions that depended on it.**

We saw this when old rejection logic was retired from implementation but remained required by an obsolete Spec. A coding Agent following the old document could recreate the very mechanism we had just removed.

Code volume and system complexity are therefore different quantities.

A large **deep module**, with a small stable interface hiding substantial implementation, can simplify a system. Conversely, a tiny Validator may impose high maintenance cost if every caller must know its states, error codes, and operation order.

I increasingly ask:

> **When this capability changes or disappears, how many unrelated modules must change with it?**

That question predicts maintenance burden better than line count or module count alone.

## 3. What DeepSeek Harness Taught Us: Add, Replace, and Retire

Studying [DeepSeek Harness (DSH)](https://github.com/deepseek-ai/deepseek-harness) highlighted the value of a pluggable architecture.

DSH uses **Cordis** to organize model adapters, tool registries, Agent loops, and related capabilities as plugins. Applications compose capabilities using Profiles and configuration; replacing one implementation need not require rewriting the entire system.

Its lifecycle is especially instructive.

Registrations of services, tools, and event listeners are bound to plugin instances and can be revoked on unload. Extra resources can be paired with cleanup actions through **Effects**.

The system answers not only **"how do we add a capability?"** but **"how do we revoke its registrations and resources when it is no longer needed?"**

See [DSH Architecture](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/architecture.md) and [Lifecycle and Effects](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/cordis-tutorial/02-lifecycle-and-effects.md).

We did **not** conclude that our entire Runtime should become a plugin system.

**Unloadable, replaceable, and deletable are distinct properties.**

- **Unloadable:** live registrations and resources can leave an active system.
- **Replaceable:** consumers rely on a stable common contract rather than one concrete implementation.
- **Deletable:** when the capability retires, its special cases, duplicate state, and compatibility burden can actually leave the codebase.

For Agents with persistence and external side effects, unloading code cannot undo executed operations or erase historical results that remain legally readable.

The deeper DSH lesson is not "turn every function into a plugin." It is:

> **Introduce, replace, and retire independent capabilities at a small number of composition points without spreading their internal complexity through the whole system.**

A real architecture upgrade should allow **B to replace A**, preserving necessary behavior while letting the maintenance burden of A actually disappear.

## 4. Five "Do Nots" Born from Engineering Failures

We did not start with a perfect set of principles.

Building ETF Agent, we added mechanisms enthusiastically. Reliability problem? Add validation. Lack of convergence? Add control. Error concern? Add another rule or state.

Individually, these decisions often made sense. In practice, some created new failure paths, some safety checks blocked legitimate work, and some refactors moved code without changing ownership.

We summarized the resulting principles through Design Reflection and Code Review as five constraints.

### First: Do not add a mechanism merely because we can build it

AI coding makes a new Manager, Validator, Reviewer, or Planner remarkably easy to produce.

But every mechanism adds configuration, tests, maintenance, and eventual exit costs.

We considered building a **Complexity Gate** to prevent coding Agents from overengineering: an independent scorer, approvals, and automated checks.

Then we noticed the paradox: constructing a new governance subsystem **to stop new governance subsystems** would itself need strong justification.

We chose to reuse existing **Design Reflection** with lightweight reminders rather than create another complexity authority.

Likewise, finalization failures did not automatically justify a new **Finalization Agent**. We first looked at whether the existing **Run Lifecycle** could own the necessary behavior.

The habit is to ask:

> **Why are changing existing logic, making a local fix, reusing a current capability, or adjusting composition insufficient?**

Introduce necessary complexity; do not ignore existing leverage merely because new code is cheap.

### Second: Do not spread complexity into unrelated modules

A well-designed module should require callers to know **less**, not more.

We initially extracted Publication logic from a large Factory. Later review found other Runtime modules still interpreting candidate text, revisions, and rejections independently.

Moving code into a new file had not fully encapsulated responsibility.

We consolidated Publication authority and removed redundant decisions in outer layers.

Run Termination exposed a similar issue. Even after a common termination mechanism existed, Runtime retained a shadow phase state requiring synchronization. We deepened the original module rather than layering on another coordinator.

The question became:

> **If changing one rule still requires editing several unrelated callers, has its knowledge really been encapsulated?**

The value of abstraction is not shorter call sites. It is **locality of knowledge at the correct Owner**.

This is why we stopped mechanically splitting files by size. One larger deep module may be easier to evolve than several shallow pass-through layers that expose one another's details.

### Third: Do not give a local module global veto authority

This lesson cost us meaningful engineering effort.

We added many checks for reliability. Real research and controlled reproductions later showed that some guards were making decisions beyond their jurisdiction.

For example, Publication could preserve valid text while an outer batch handler threw because a different block failed, effectively rejecting the whole response.

Or a Run might exhaust its **read quota** while still retaining lawful model/final-output budget. A local tool denial was escalated into total task failure, preventing the authorized finalization path.

A Stop Hook recommendation also once gained the ability to veto completion and force another model request.

These share one problem:

**A module owning a local effect started deciding the fate of the entire task.**

We returned text-disposition authority to Publication and Run continuation/termination to their proper lifecycle Owner, eliminating shadow refusal decisions.

This does **not** relax real safety controls. Authorization, privacy, source identity, financial execution, and unknown external effects still require strict decisions by their legitimate Owners.

We revoked **unauthorized vetoes**, not necessary security checks.

When reviewing a new **throw**, **deny**, or early return, we now ask:

> **What exactly may this module refuse? Why may refusing this local effect also destroy independent, lawful results?**

### Fourth: Do not make every normal task pay for rare special cases

We call the hidden cost imposed on routine operation the **Normal Path Tax**.

A Reviewer can sometimes identify serious omissions. Forcing every simple question through another Reviewer model call may add tokens, latency, and failure opportunities without useful feedback.

Citation guards may improve traceability. But if an invalid reference automatically forces another model repair before a valid independent body can settle, the ordinary path may pay an unnecessary cost.

Some changes impose costs merely by existing: more tool descriptions, Prompt rules, or global checks can alter context capacity and model behavior without triggering an obvious failure.

A capability working does not mean it should run on every task.

When adding optional experts, Reviewers, diagnostics, or research enhancements, assess the extra normal-path cost and whether task-specific activation is more appropriate.

Net answer-quality, cost, and latency effects still require comparable evidence. Successful execution of the optional module is **not** a measured system efficiency gain.

**Optional capabilities should make tasks that actually use them bear their cost, rather than silently taxing every task forever.**

### Fifth: Do not introduce capabilities without an exit strategy

This principle follows both DSH's lifecycle example and our attempts to remove old mechanics.

Previously we prioritized how a feature integrates and passes tests. Now we also ask how it will retire if its premise becomes obsolete.

For Publication, the successful new check was not enough. We removed outer duplicate filters, forced-repair queues, and parts of earlier rules that continued governing whether valid text could exist.

Deleting production code alone is insufficient if older Specs can persuade future coding Agents to restore the retired logic. Those historical contracts must also be reconciled.

For plugins and optional Subagents, we examine whether normal research survives after new admission is disabled, how already admitted tasks settle, and whether historical results remain readable.

We are **not** demanding that every function support hot-swapping or that each hypothetical future replacement get its own Interface and Factory.

We require only that genuinely independent evolving capabilities be introduced, swapped, and retired **without forcing unrelated modules to change**.

Deletable does not mean permitted to clear state indiscriminately. Real business facts and valid results already delivered to users retain their original obligations.

Delete unneeded mechanisms and dependencies, **not history**.

## 5. Even Principles Can Add Complexity

Five engineering principles can themselves become five new Validators. If we did that, we would reproduce the problem they aim to solve.

They are primarily **design and code-review heuristics**, not five new Runtime control modules.

We use existing Design Reflection to examine facts, ownership, failures, value, and exit conditions rather than create new states and approval records for every principle.

Nor does every architectural decision demand A/B testing.

For removing redundant state, consolidating authority, and repairing deterministic invariants, precise reasoning, code review, and targeted behavioral regression can establish the intended contract.

For changes depending on model behavior—Prompts, Reviewer policy, and Subagent strategies—evaluate uncertainty, risk of error, and expected benefit to decide whether focused measurements or controlled comparisons are needed.

Verification also costs time.

**Do not demand statistical experiments to resolve deterministic design facts; do not claim empirically dependent benefits based on intuition alone.**

This is not relaxed quality. It is matching the verification method to the nature of the question.

Simplification is also not the sole objective. Real authorization, persistence, provenance, resource accounting, and safety protections may require substantial code.

Deleting them to minimize line count would not be better architecture.

The goal is **necessary complexity with correct ownership and bounded costs for optional capabilities**.

The five “do nots” therefore belong in [method 1, “Deciding whether to add a feature”](/en/principles#method-1) as design questions, not five mandatory Runtime gates. They support [principle 7, “Capabilities should be easy to introduce, replace and retire”](/en/principles#principle-7): any new mechanism should explain both the problem it solves now and the circumstances in which it could later be consolidated or deleted.

## 6. From Creating More to Continuously Renewing the System

**Judge an architectural upgrade not only by what it adds, but by which old burdens can leave.** DSH's lifecycle design illustrated the value of retirement. Our Publication and Run Termination work revealed why relocating code does not automatically reclaim dispersed decision-making authority.

For the next proposal, ask three questions: Does it solve a problem the existing capability cannot? Do callers genuinely need fewer internal rules? Can the old states, branches, and obsolete specifications stop being maintained after the replacement takes over?

Retirement has limits: authorization protections, effects that actually occurred, and historical results that must remain readable retain their obligations. Retire redundant mechanisms, not those commitments.

**Creation determines how quickly a system can grow; maintenance how long it survives; evolution how far it goes.** The durable advantage is not unlimited feature growth. It is renewal without being trapped by historical complexity.

## Further Reading and Discussion

- [Publication: Why Answers Need an Independent Publishing Mechanism](/articles/019-agent-answer-publication).
- [When Every Module Can Say No: Run Termination](agent-veto-authority-and-run-termination.md).
- [Extension Host: From Feature Phone to Plugin Platform](020-agent-extension-host-smartphone.md).
- [Agent Architecture Principles](/principles): concise design/refactoring/Code Review heuristics.

More articles at the [ETF Agent reading catalog](/catalog) and [public GitHub collection](https://github.com/hpoenixf/eff-agent-article). Contributions and counterexamples are welcome; feel free to Star the repository.
