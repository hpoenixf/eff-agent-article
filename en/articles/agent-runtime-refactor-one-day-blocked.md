# Why Did One Subagent Change Hold Up Our Work for an Entire Day?

*A retrospective on an agent-runtime refactor: why a local change spread, and how to keep the next one within reasonable boundaries.*

On October 25, 2026, we set out to improve the subagent capabilities of our investment-research agent. The change appeared to concern subtask execution and handoff. In practice, it repeatedly touched recovery encoding and decoding, the in-memory store, and the PostgreSQL store, then reached main requests and child execution as well.

This was not a production outage, and not all work stopped for a day. The shared Runtime and Subagent development stream was held up: developers first had to establish which places interpreted the same rules, while parallel work had to avoid potentially overlapping changes. By evening, an initial adjustment had reached main, but we were still determining what could safely proceed in parallel the next day.

The difficulty was not a particularly complicated algorithm. **We had put code in separate files without giving every rule and every piece of state a clear owner.** Wiring that once made extension convenient, historical compatibility, and test helpers had gradually become implicit contracts that every change had to account for.

## Why did one rule spread across modules?

Whether a child task can continue after a human reply involves different questions: whether the reply was accepted, whether the task can hand off now, and how to save the result reliably. As recovery, human interaction, and different storage implementations were added, related conditions appeared in the recovery codec and both stores.

Initially, adding a check near the available data was understandable: the store knew the current record, and recovery code knew the historical format. Both needed to prevent invalid state from advancing. But when each interpreted the same business rule, changing a handoff condition meant checking every copy for consistency. Two related commits on October 25 touched the codec and both stores: a concrete sign of change spreading.

Cross-module changes are not inherently wrong. A new durable fact can reasonably change a contract, storage, and recovery. The warning is narrower: **the durable facts have not changed, yet equivalent business conditions must still be updated in multiple adapters.** The recovery codec then exceeded five thousand lines; the line count was not the root cause. More relevantly, it combined encoding and decoding with child admission and handoff planning.

This is a shallow module: files and interfaces exist, yet a developer still needs to understand many internal conditions to change behavior safely. In [Module Assembly](https://martinfowler.com/ieeeSoftware/moduleAssembly.pdf), Martin Fowler describes modules as hiding implementation details their callers need not know. Our specific problem comes down to **who interprets the rule**: moving a judgment to another file does not by itself consolidate decision-making.

The subsequent design clarified the split: human interaction supplies the fact that a reply was accepted; Child interprets the subtask handoff rule; the store reads facts and commits the result inside its existing lock or transaction; and the Run lifecycle still decides the state of the overall execution. Consolidating interpretation does not remove transaction, concurrency-version, or idempotency protections.

**Prevention rule:** For every new or changed state transition, identify the source of facts, the single business interpreter, and the module responsible for committing. Check whether both stores must copy equivalent conditions; adapter-specific locks, transactions, and storage constraints may still be necessary. Apply a deletion test in review: after removing a forwarding layer or duplicate check, must the caller still know the rule? If so, the boundary has not really been tightened.

## Shared state defeats file boundaries

`ProductionRunContext` then held multiple groups of mutable runtime state. Several modules received the whole object, could read fields owned by others, and depended on initialization order. The Factory also handled user Memory caching, waiting, usage deduplication, and summaries. Passing the entire context was convenient during assembly: a new capability could reach existing information. The cost was that consumers could depend on internal state they did not own.

Separate files therefore did not imply independent change. A field change could reach several callers, and initialization order could become an agreement absent from the interface. Dividing work by directory alone can let different files modify the same logical object concurrently.

One migration example shows how subtle the boundary can be. The publication module moved candidate content into private state, but an object returned to callers still shared an internal reference. Changing the preview could therefore change the internal candidate. A private field does not automatically prevent outside mutation through a reference.

**Prevention rule:** Let the module responsible for an invariant own its state, exposing necessary operations and read-only facts. Check for mutable references escaping in return values, as well as callback binding, dependency-read timing, and construction order. A seam should let a caller express what it needs done, without requiring it to know which fields to modify or which initialization sequence to follow. Add an interface when it supports an actual substitution or responsibility boundary; do not rename the whole context as dependencies and pass it through, or introduce a universal manager just to encapsulate it.

There is a trade-off: narrower interfaces cost design and migration effort, and some shared read-only facts really do cross boundaries. The question is whether callers must understand another module's state machine, not whether an interface can be made smaller.

## Old compatibility promises quietly become permanent costs

Recovery must interpret requests left by earlier code as well as current execution. Each retained reader adds another branch to understand and verify during future rule changes; deleting one can also damage real work awaiting recovery.

The system was not yet formally launched. The team decided to retire old pending Main `@39` and `@44` readers for which no current consumer was needed. At the same time, original HIO `@41` and composed Child `@43` sealed requests that still required reading had to retain their original identity, arguments, and tool descriptions. Changed bindings should cause rejection, not a new current-protocol wrapper that makes history appear valid.

The key is not the age of a version number, but **whether the commitment still has a consumer and which facts recovery must faithfully retain**. Prelaunch does not automatically mean there are no durable records to protect; the project owner's statement that there were no real users does not replace an examination of the actual durable-data scope.

**Prevention rule:** When adding a compatibility branch, record its consumer, historical facts to preserve, verification method, and retirement conditions. Revisit actual readers and durable records. Before removal, distinguish unused development protocols from sealed requests that still need recovery; verify the latter's original identity and binding instead of constructing a plausible old record in the current shape. When the actual data scope cannot be established, keep it unknown rather than calling an absence of findings proof of absence.

## Tests inherit obsolete contracts too

One PostgreSQL scenario appeared to show a handoff problem: a child was still running when a human reply arrived, and the test failed. Investigation found an extra 1.5-second whole-run wait limit in the helper; it fired before the final business assertion. After the helper's waiting behavior was corrected, the same scenarios passed with the original stage controls and assertions retained. This supports the diagnosis of a test-helper deadline; it does not mean every similar failure is a test problem.

Other old tests still created children with `type: "web"`, while the current entry point used `agentId`. They were rejected before reaching the recovery behavior they were meant to test. Adding a production compatibility branch in response could turn a retired test input back into a product promise; simply deleting the failing tests could lose valuable recovery, authorization, and concurrency protections.

[Martin Fowler's discussion of contract tests](https://martinfowler.com/bliki/ContractTest.html) notes that a test double can drift from the real service it represents. Our example is not identical, but the concern is related: test entry points and helpers also have contracts that need maintenance when production interfaces change.

**Prevention rule:** When an interface changes, review test producers, data, and helpers together, and construct inputs through the real current assembly path. For a failure, first determine whether it occurred in preparation, waiting, or the target assertion; then assess it against the current contract as a production defect, an obsolete test, or insufficient evidence. Preserve business assertions and negative protections when migrating inputs; do not weaken them merely to get green. Coordinate asynchronous tests with explicit stage conditions and retain a reasonable outer timeout.

## Parallel work depends on boundaries, not just headcount

Coupling eventually became a collaboration problem. To avoid people or coding agents concurrently reshaping shared runtime state, the team temporarily assigned a broad Research Runtime area to one owner that afternoon and redirected other work. That reduced overwrite risk, but also made some work without a direct conflict wait. The later handoff narrowed the restriction: stable interfaces remained usable, while genuinely overlapping changes or shared invariants needed coordination.

The lesson is not that collaboration always creates conflicts, or that only one person may touch a file. Changes in different files can share a single state rule; changes in different parts of one file need not conflict in substance. Git can reveal textual conflicts, but it cannot determine whether two pieces of code independently changed the same business decision.

**Prevention rule:** Before parallel work begins, identify each task's rule ownership, state writers, interfaces, and durable facts, then define concrete write scopes and an integration owner. When a shared invariant or interface is changing, agree on the contract and integration order first; consumers of stable boundaries can continue. Handoffs should identify the source baseline, uncommitted changes, dependencies, and verification scope. During integration, inspect semantic overlap as well as automatic mergeability. Restrict concurrent writing only where actual conflict requires it, rather than locking an entire system to one person indefinitely.

## Leave each problem with the right owner

Subsequent changes consolidated Child handoff rules, reduced shared Run state and the Factory's exposure to Memory internals, and retired some old readers. On October 27, the refactor **completed its formal engineering checks without a live model**, including the declared offline, PostgreSQL, and mock tests and type checks. **That does not establish production deployment, live-model research quality, or faster maintenance.** The deployment and historical-data inventory remains unverified, and no change in maintenance time was measured.

For the next change, we want to notice a few observable signals earlier: an equivalent condition appears in a second adapter; a new module needs to change another's internal fields; an old protocol remains without an identifiable consumer; a test fails before reaching its business assertion; or parallel tasks keep expanding one another's write scope.

These signals do not require an immediate rewrite of everything. They are a prompt to establish the boundaries of rules, state, historical commitments, and collaboration before the change spreads further. Whether a local modification stays local often depends on those decisions.

## Further reading

[What Should Stay Stable—and What Should Change—in an Agent Architecture?](agent-differentiated-evolution-contracts.md) discusses evolution contracts across modules. [Tests Expire Too](test-lifecycle-refactoring-retirement-and-spec.md) explores how to retain valid protections while retiring obsolete assertions.

This article is part of [ETF Agent Engineering Notes](https://hpoenixf.com/eff-agent-article/en/articles/agent-runtime-refactor-one-day-blocked). If these engineering cases are useful, consider starring the [public article repository](https://github.com/hpoenixf/eff-agent-article).

The corresponding architectural discussion is [Core Principle 2: complexity belongs with its rightful owner](/en/principles#principle-2).
