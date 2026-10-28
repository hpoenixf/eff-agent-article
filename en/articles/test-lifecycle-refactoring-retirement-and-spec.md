---
title: "Tests Expire Too: Move Refactoring, Retirement, and Deletion into the Spec"
description: A teaching example adding PNG avatars shows how to distinguish obsolete requirements from valid protections and decide what happens to existing tests during design.
---

# Tests Expire Too: Move Refactoring, Retirement, and Deletion into the Spec

Avatar uploads originally support JPEG only. PNG support is added, and an old test fails: “A PNG upload should be rejected.”

Reverting the implementation to restore a passing test loses the new requirement. Deleting the entire format-test group may also remove protection against files pretending to be images.

The following is a teaching simulation; its business setting, files, and events are illustrative. The question is: **when a requirement changes, does an existing test still protect a valid promise? Retain valid protection, revise superseded requirements, and consider retiring checks that serve only an old mechanism.**

Make those decisions during design and specification work where possible, rather than guessing from red tests after implementation.

## 1. Find the Behavioral Basis Before Changing the Test

A failure can mean an implementation defect, an incorrect test premise, or an intentional requirement change. Inspect the actual difference, then consult the approved behavior.

“Support PNG” needs clarification: existing JPEG files remain supported; decodable PNG files can upload; existing size limits and user isolation remain; misleading extensions and damaged content are still rejected.

The new requirement replaces “reject every PNG.” It does not invalidate the other protections.

Without that requirement, the implementation allowing PNG is not sufficient reason to change the assertion. Code and tests still need an independent product agreement.

ETF Agent's test cleanup encountered a related conflict. At the time, a missing or expired execution claim could make a task eligible for inspection, while an old assertion excluded some of those tasks. Expiry did not establish that the previous executor had stopped. Revising the assertion also had to preserve protection for active execution and the distinction between discovering a candidate and obtaining permission to recover or modify it. A wider discovery condition did not relax later admission checks.

The avatar example expresses the same judgment in a familiar setting: allowing a format does not make everything labeled PNG trustworthy.

## 2. Inspect the Protections Instead of Deleting the Group

Expand the old tests into behaviors and their treatment becomes clearer:

| Existing requirement | Treatment | Reason |
| --- | --- | --- |
| Valid JPEG uploads succeed | Retain | The new requirement does not remove JPEG support |
| Every PNG is rejected | Replace with a valid-PNG success case | The product's supported formats have changed |
| An image-like extension with invalid content is rejected | Retain and cover the new format | Adding a format must not bypass content checks |
| Files beyond the existing size limit are rejected | Retain | Format support does not change the capacity promise |
| Users can modify only their own avatars | Retain | Format support does not widen operation permissions |

The PNG positive case should pass through the real upload entry point. Read the saved result and establish that it opens as an image. A successful backend-function response can miss a page that still accepts JPEG only.

Negative samples should distinguish implementations too. Rename invalid content as PNG and verify that it still fails. Together, valid and counterfeit PNG samples test the new allowance and the existing protection.

Expected results come from independently prepared and checked samples. Asking the decoder under test to generate its own correct answer can make both sides share the same error.

## 3. Existing Tests Have More Than Two Possible Destinations

Five treatments are useful when selected by current behavior:

| Treatment | When it applies | Action in the avatar example |
| --- | --- | --- |
| Retain | A valid requirement or unique counterexample remains | Keep rejection of cross-user avatar changes |
| Refactor | The requirement is valid but the test depends on internal structure | Replace a private-decoder-name assertion with checks on a valid upload result |
| Consolidate | Several tests repeat the same behavioral proof | Share stateless sample setup and consolidate repeated assembly without losing format-specific counterexamples |
| Retire | An old implementation is leaving but still has real dependencies | Keep old-library migration checks until an explicit exit point |
| Delete | The test is redundant, has no current requirement, or has met exit conditions | Remove an obsolete assertion requiring the old function to exist |

Andrew Trenk's [“Test Behavior, Not Implementation”](https://testing.googleblog.com/2013/08/testing-on-toilet-test-behavior-not.html) explains the value of testing external behavior. Renaming a decoder should not invalidate an unchanged upload promise.

Order is not always an implementation detail, however. “Do not report success before saving succeeds” is behavior the user depends on. A test uniquely protecting it should remain.

Consolidation also requires more than comparing test levels. A page test may traverse more modules without exercising cross-user edits or damaged files. It replaces another test only if it can still detect that test's unique fault.

Deletion does not require one new test per removed test. Redundant assertions without a current requirement can leave directly. Counterexamples protecting isolation, persistence, or other necessary behavior need equivalent or stronger coverage first.

## 4. How Long Should Migration Checks Survive the Old Library?

Suppose avatar processing once used an old image library. Scanning dependencies and callers during migration helps find missed wiring.

After migration, reconsider a routine regression check that still traverses the source tree looking for obsolete packages, types, and filenames. What current requirement does it protect?

ETF Agent removed a comparable retirement scan after moving away from its LangGraph runtime layer. The cleanup checked dependencies, production wiring, and current behavioral tests rather than building a more complex parser to preserve the scan. Historical identities and data still requiring readers were not deleted merely because their names looked related.

For the avatar system, record exit conditions in the existing migration task: new requests no longer call the old library; retained historical avatars remain usable; current-entry tests cover necessary behavior; and no real consumer still needs an unhandled old format. Once those conditions hold, remove checks serving only the library's retirement.

A scan that uniquely protects a valid architectural constraint can remain. Exit conditions prompt reassessment; they do not declare that every static check expires.

An old package name in a comment is not a live runtime dependency. Deleting tests does not establish that migration is complete either. Check those dependency facts independently.

## 5. Make the Decision During Design and Apply It to Files

Open the existing upload tests while designing PNG support. Record affected files, treatments, reasons, and retained coverage in the current task. No assertion-by-assertion register is needed.

An executable teaching task can say:

> Update the format agreement to accept JPEG and PNG while retaining size limits, content checks, and user isolation. Replace the old PNG rejection with a valid-PNG positive case. Keep JPEG and protected negative cases, adding invalid content disguised as PNG. Inspect the page's file-selection restriction and actual upload entry point, then read the saved image. Check consumers before changing shared samples. If the old decoder library also retires, identify remaining historical readers and exit conditions separately.

This connects new behavior to existing tests. Once interfaces are clear, prepare executable cases in the same design round. If an issue remains unresolved, record the gap and earliest executable point. A permanently skipped placeholder is not coverage.

Later stages reuse that decision. Implementation checks new allowances and retained protection. Review examines production code, assertions, samples, and selection changes together. Acceptance checks whether treatments were applied and retained cases were actually collected and executed. Each stage does not need another copied checklist.

Small repairs can use the same reasoning without creating a complete design project for a few assertions. Interface, data, or permission changes still follow the project's existing process.

## 6. Before Deleting a Slow Test, Look for Repeated Work

A slow test may read the same source files twice, repeatedly construct an expensive environment, or wait in real time merely to reach an expiry condition.

Preserve the behavioral assertions while removing such work: reuse content already read in the same operation, consolidate genuinely repeated setup, and control time instead of waiting unnecessarily. Shared helpers should avoid mutable state that allows tests to contaminate one another.

Time control must affect the place making the decision. An application fake clock does not automatically change a database clock. A database test must expose the intended expiry facts to the database itself. Running faster should not change what is being checked.

Update runners and active selections too. If the last case is deleted but configuration still points to its file, retirement is incomplete. Moving slow cases out of the default selection often just postpones their cost.

Assess savings through comparable runs. Fewer files alone do not establish less development time.

## 7. Ask What the Failing Test Still Guards

The “PNG should be rejected” failure now has a defensible treatment. The product accepts valid PNG, so replace the old format restriction. Keep invalid-content, size, and user-isolation protection. Then follow the page upload through to its saved result.

The earlier article on [evolving docs, code, and tests together](docs-code-tests-evolve-together.md) explains coordination. This article adds a decision for each affected test group: its future needs to be explicit, rather than only adding new cases.

**Tests remain useful when they protect current commitments and evolve as those commitments change.** Obsolete requirements should not force implementations backward, and valid protections should not disappear simply because they obstruct a green run.

## Further Reading and Discussion

[System evolution and capability retirement](code-cheaper-systems-harder-to-evolve.md) · [Testing and evaluation](honest-agent-evaluation.md) · [Architecture principles and engineering methods](/en/principles)

Discuss examples in the [GitHub engineering collection](https://github.com/hpoenixf/eff-agent-article), and consider a Star if the article helps your work.
