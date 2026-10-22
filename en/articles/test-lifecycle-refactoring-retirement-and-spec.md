# Tests Expire Too: Move Refactoring, Retirement, and Deletion into the Spec

While cleaning up ETF Agent's tests, we encountered a failing assertion: even after an execution lease expired, a run must not enter the recovery candidate list as long as the lease record still existed.

That assertion once served a clear protective purpose: keep recovery from interfering with a run still held by an executor. The system's recovery mechanism subsequently changed, however. Runs with missing or expired leases can both be discovered. Whether recovery is permitted, and whether a run may be settled, is determined by later admission and state checks.

The current implementation and the accepted specification both support this behavior. The test was still enforcing the old contract. If our only objective had been to "make the tests green again," reverting the implementation would have silenced the failure but broken behavior the team had deliberately adopted.

We have previously discussed [how systems evolve safely and retire obsolete capabilities](code-cheaper-systems-harder-to-evolve.md) and [what passing tests can actually prove](honest-agent-evaluation.md). This cleanup pushes that discussion one step further, into the test suite itself: **when writing a Spec, we should decide not only what to add, but also how existing tests will be refactored, consolidated, retired, or deleted.**

## 1. What Is a Failing Assertion Still Protecting?

When a test fails, we normally inspect the implementation first. That is a sensible default, but it does not make every existing assertion a permanent product requirement.

The recovery test conflated two distinct stages: discovering a run worth examining and receiving permission to recover or mutate that run. An expired lease can be a reason to investigate, but it does not itself grant execution authority. Subsequent checks must still establish the current executor, the run's identity, and version constraints that prevent stale executors from writing. Reading a candidate list must not change run state.

The revised tests therefore needed to constrain several behaviors together:

- Expired leases can be listed as candidates, while active leases remain excluded.
- Reading candidates neither settles runs nor changes their existing state.
- Active executors can still renew their leases normally.

Simply changing the old assertion from "not included" to "included" would not express the full contract change. The newly permitted path and the protections that remain in force must be verified together.

We first confirmed the conflict in the in-memory implementation, then reproduced the same class of failure in a database case using an isolated PostgreSQL test container. The correction was based on an already effective behavioral contract and consistent results from both implementations. We also retained the original failure report.

The order of reasoning matters. The fact that the implementation already behaves a certain way does not prove the test should change. Without an explicit requirements change or contract basis, a failure remains an issue to investigate; it must not be erased by loosening an assertion.

## 2. How Should Migration Tests Exit After a Capability Is Retired?

Another part of the cleanup concerned LangGraph.

The project had already removed the LangGraph runtime layer. The current dependencies and production source no longer wired it in. Yet everyday tests still ran a retirement scan: it traversed the entire production source tree looking for the old package name, types, metadata, and particular historical identity strings.

That scan was valuable during migration. Removing a framework can leave dependencies, adapters, and hidden entry points behind. A focused check helps establish that the migration scope was actually addressed.

Once the migration is complete, though, its continuing maintenance value needs reassessment. The old scan repeatedly read production source files for multiple assertions and maintained parsing logic to distinguish comments, strings, and identifiers. Meanwhile, the actual research loop and recovery behavior had their own tests.

After checking the current dependencies, source code, and test wiring, we removed the retired scan. We did not add caching or build a more elaborate parser to keep it alive. The original retirement evidence and valid recovery contracts remain available, and historical identity fields were not deleted merely because their names contained 'graph'.

This cleanup required distinguishing three things: an obsolete implementation may leave, historical evidence may stay, and still-valid behavioral protections must continue. They do not have to live in the same test file.

Keeping an old scan in every regression run solely to preserve migration history makes the daily suite pay indefinitely for a finished migration. But deleting persisted readers simply because their names evoke the old framework could damage capabilities that remain in use.

When introducing a migration-specific test, it is useful to define its exit criteria at the same time: dependencies and callers have been removed, persistence compatibility has been addressed, and necessary behavior is covered through current entry points. Once those conditions hold, reconsider whether the scan still belongs in every regression run. A scan that uniquely protects a valid architectural constraint may still be worth keeping; exit criteria do not imply that all static checks should be deleted.

## 3. Five Possible Futures for an Existing Test

Test maintenance often falls into one of two extremes: retain every original test while continually adding new ones, or delete troublesome tests until the suite turns green. A better approach is to choose a disposition based on the currently valid behavior the test protects.

| Disposition | When it applies | What must remain protected |
| --- | --- | --- |
| Keep | It still protects valid behavior or a unique failure mode | Whether the change affects the original allowed, denied, or recovery path |
| Refactor | The behavior is valid, but the test depends on internals or unstable assumptions | Whether the revised test can still detect the original defect |
| Consolidate | Multiple tests prove the same contract but repeat setup or initialization | Whether unique counterexamples disappear along with duplicated code |
| Retire | An old capability is being phased out, but callers or compatibility requirements remain | Who owns completion, and under what conditions the test can be removed |
| Delete | It is entirely redundant, has no valid contractual value, or its exit criteria have been met | Whether deletion is justified and active references are cleaned up |

Deleting a test does not mechanically require adding a replacement. An assertion that merely fixes the old location of a file and protects no current contract can disappear outright. But a unique counterexample that protects cross-account isolation cannot be dropped merely because it makes the suite slow.

Refactoring should place assertions back on a stable behavioral interface wherever possible. Google's Andrew Trenk discussed this principle in [*Test Behavior, Not Implementation*](https://testing.googleblog.com/2013/08/testing-on-toilet-test-behavior-not.html): when internal implementation changes without changing externally observable behavior, tests generally should not be forced to change with it.

Call ordering likewise depends on meaning. Whether an internal helper runs first or second may be an implementation detail; the rule that "success must not be reported before persistence succeeds" is externally meaningful behavior worth protecting.

Nor should we assume that a higher-level test is automatically stronger when consolidating tests. An end-to-end case may cross more modules without asserting one unique error condition. The basis for consolidation is defect coverage, not the test layer or line count.

## 4. Make Test Dispositions Concrete While Writing the Spec

If test cleanup waits until implementation is finished, the developer must simultaneously contend with the new behavior, old assertions, shared fixtures, and acceptance selections. Deciding which tests should exit at that point can turn into an improvised response to the latest failure.

The design stage is a better time to answer those questions, because behavioral differences and responsibility boundaries are being clarified. For example, when changing recovery-candidate reads, the design should explain why the old test excluded expired leases, which stage the new contract allows them to enter, where the active-lease protection remains, and how the in-memory and database cases express those constraints.

For each affected test group, these answers can be captured briefly in the existing design decision or execution plan: "file, disposition, rationale, retained coverage or exit condition." There is no need to create a new ledger for every assertion.

Once an execution seam is clear, write or revise the executable cases in the same round, and update affected fixtures, helper functions, test runners, and active selections. If the interface still has unresolved questions, record the specific gap and the earliest point at which a real test can run. Avoid empty shells or tests left permanently skipped as placeholders.

Changing only the Spec template is not enough. Later stages must carry through the same decision:

- **Implementation** keeps using the tests prepared during design and checks whether earlier execution records apply to the current inputs.
- **Review** examines production code, tests, fixtures, and selected suites together, checking that unique counterexamples were not lost.
- **Acceptance** confirms the dispositions were implemented and the retained assertions still constrain the correct behavior.

Shared fixtures deserve particular care: inspect their consumers before making changes. Extracting repeated setup into one helper may reduce code, but introducing shared mutable state at the same time can cause more tests to interfere with one another.

We have incorporated these requirements into the existing Spec-writing, implementation, review, and acceptance guidance. They also apply to ordinary small fixes; cleaning up a few assertions does not require a new full Spec. Whether the practice sustainably reduces rework remains something to observe in real changes.

## 5. Recovering Costs from Repeated Reads and Real-Time Waiting

The cleanup also uncovered an audit process that read every test source file once to build a content map and then read the same files again during classification.

No test contract needed changing here. Reusing the contents from the first read removed duplicate I/O while leaving the original classification and assertions intact.

Time fixtures warranted separate treatment. An in-memory recovery case had previously relied on a short real-time wait to let a lease expire. We changed it to advance a controlled clock. The database case instead set the expiration time on its own test lease directly, then let the real database run the candidate query.

[Vitest's date-mocking documentation](https://vitest.dev/guide/mocking/dates) shows how to control system time and restore the real clock. But time manipulation has to match where the actual decision occurs: mocking the application clock does not automatically change PostgreSQL's clock. A database test needs to control the facts the database actually reads.

These changes eliminated identifiable duplicate work and real waiting. Individual runs became somewhat faster, but that is not enough evidence to estimate long-term engineering time saved. We still need comparable observations of execution time, environment failures, and repeat runs. The number of files deleted is not itself a measure of benefit.

Test selections must change along with file dispositions. If the last case in a file is removed, test runners and active plans must not keep pointing to it. If a shared fixture changes, its affected consumers need coverage. Merely excluding slow tests from the default selection usually postpones rather than removes the maintenance cost.

The next time we write a Spec, we can begin by opening the existing tests and articulating the promise each group of assertions protects. Only then should we decide whether they still constrain the new design, need a different expression, or should exit along with an obsolete mechanism. **That makes test maintenance part of design work instead of a debt we chase after implementation.**

---

Related reading: [system evolution and retiring old capabilities](code-cheaper-systems-harder-to-evolve.md) · [the evidence behind passing tests and evaluations](honest-agent-evaluation.md). If this essay helps, consider starring the [engineering library on GitHub](https://github.com/hpoenixf/eff-agent-article).
