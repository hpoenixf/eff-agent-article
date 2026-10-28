---
title: "When Tests Outgrow the Code: Helping Docs, Code, and Tests Evolve Together"
description: "A teaching example about exporting orders shows how requirements, implementation, and tests can evolve together while preserving valid protections and checking the result users receive."
date: 2026-10-28
---

# When Tests Outgrow the Code: Helping Docs, Code, and Tests Evolve Together

Start with a teaching example. An order list has 50 matching results, but the current page displays 20. The product requirement is to export all 50 to Excel with one click.

A developer updates the export logic, and an old test fails: it still requires the export to contain no more than one page. Someone might revert the implementation to make the test pass again. Someone else might simply change 20 to 50 in the test. The first response loses the new requirement; the second may only replace one hard-coded number with another.

Even if the backend tests pass, the page button might still pass only the current 20 rows to the export function. The file the user receives would remain incomplete.

**A single requirement change needs to address the old promise in the specification, the path the code actually follows, and the old assumptions still enforced by tests.** What to change and what to preserve must be expressed as concrete behavior. A final task item saying “update the docs and add tests” leaves too much unresolved.

The fictional order system below is a teaching example throughout. The numbers 20 and 50, the business rules, and the filenames are illustrative settings, not business incidents from ETF Agent. The project measurements and historical observations are drawn from actual materials.

## 1. When Tests Already Exceed the Implementation, Where Can Problems Remain?

We recounted ETF Agent's working set of materials that directly guide current development. Documentation includes current specifications, active designs, development and operations guides, and model instructions actually in use. Historical archives, old handoffs, one-off reports, sharing drafts, and example text inside test fixtures are treated as reference material. Known build-generated copies are also excluded from maintained implementation source.

For the committed version as of 2026-10-27, the nonblank-line counts were:

| Material | Nonblank lines | Share |
| --- | ---: | ---: |
| Development documentation and instructions, including current specifications | 49,425 | 7.28% |
| Implementation code and engineering scripts | 248,636 | 36.62% |
| Tests and test support code | 380,853 | 56.10% |

Current specifications account for 303 files and 33,025 nonblank lines, already included in the first row. Test text is about 1.53 times the size of the implementation. Code comments and documentation examples remain in the counts. These measurements describe the size of the material; they do not directly measure coverage, effort, or an ideal ratio.

They do make one question concrete: with so many explanations and safeguards already accumulated, how does a developer know which ones remain valid for the next change?

More tests can cover more faults, but they can also preserve more obsolete requirements. More documentation can explain a design, but it can also put descriptions from different versions side by side. A more complete implementation may make features easier to add, while also spreading an old assumption across the page, API, and export module.

The evolution of existing material therefore belongs inside each requirement change. Focusing only on new functionality can leave old assumptions for the next maintainer to untangle.

## 2. Clarify What “Export All” Means Before the Work Begins

Return to the teaching example.

The first version promises to export only the current page. That can be a reasonable delivery choice: the page already has those rows, so reusing them provides a simple export feature. The guide says “export the current page,” the code uses the page data, and the tests enforce a maximum of 20 rows. All three agree with the requirement at that time.

Later, a user needs to hand finance the orders that are both completed and from the current month. There are 50, spread across three pages. Exporting each page and merging the files manually becomes inconvenient, prompting a new requirement: export all matching results.

Writing only those words leaves important questions open. Does “all” mean every order or only filtered orders? Should the file include the columns currently shown on the page? What happens when there are no matches?

For this example, establish the following agreement:

> Clicking Export produces a file containing every order that matches the selected filters and that the current user is allowed to view, regardless of the current page or page size. Keep the existing export columns and their order. If no orders match, show “No orders to export.”

This states both the change and the protections that remain. The export now crosses page boundaries; filters, the user's permitted data scope, and the field requirements still apply.

**The 50 orders are a sample. The rule is “all matching orders.”** Changing the upper limit from 20 to 50 would bring the same problem back when there are 51 orders.

A test can explicitly expect 50 rows from a fixed sample. Business code must not treat 50 as the new export limit. The same number serves different purposes in those two places.

There is no need to begin with a lengthy design document. This short agreement gives development and review a shared basis. If it remains disputed, resolve that disagreement before letting the code and tests independently guess what “all” means.

## 3. Which Parts Does One Change Actually Touch?

The following filenames are illustrative. They show an executable division of work in an ordinary project:

| Location | Required work |
| --- | --- |
| `docs/order-export.md` | Replace “export the current page” with the clarified rule and remove conflicting old instructions |
| `src/orders/export-orders.ts` | Retrieve the complete data using the filters instead of processing only the page already loaded |
| The page's Export button | Pass the filters rather than continuing to hand only current-page rows to the export function |
| `tests/order-export.test.ts` | Adjust the old count assertion and check completeness, fields, filtering, and the no-data case |
| A page interaction test | Click the actual button and inspect the downloaded file, rather than only calling a backend function |

The point of this table is to make synchronization inspectable. A reviewer can identify whether the old wording remains, whether the button still uses the old entry point, and whether the test merely changes one number.

It does not require every listed file to change on every task. If the export module already supports the complete dataset and only the page passes the current page, the fix belongs in the page call and its tests. If the new rule is already effective but an old test still limits the export to one page, correct that test using the current requirement and preserve the correct implementation.

The specification needs to change when the product promise changes. A local repair of already agreed behavior can use the current agreement. Explicitly deciding that a checked component needs no modification is a valid outcome too.

### Do Not Discard the Old Tests as a Group

Suppose the existing tests require:

- Export only the current page, with at most 20 rows.
- Export only orders that match the filters.
- Never export orders that the current user is not allowed to view.
- Preserve the agreed column names and order.

The new requirement directly replaces the first item. The others remain valid and deserve attention: if filtering is lost while retrieving additional pages, a wider export can include more incorrect data.

Replace the current-page assertion, preserve the filtering, access-scope, and field checks, and add a check for completeness across pages. Removing the old quantity limit does not justify deleting the entire test file.

Andrew Trenk's Google Testing Blog article [“Test Behavior, Not Implementation”](https://testing.googleblog.com/2013/08/testing-on-toilet-test-behavior-not.html) discusses organizing tests around externally visible behavior. Here we must also ask whether the behavior a test enforces has been replaced by the approved requirement change.

### Give the Implementation a Real Chance to Fail the Test

If the new test prepares only 10 orders, both the old and new implementations may export them successfully. It does not distinguish whether the feature has actually changed.

A more discriminating sample prepares 50 matching orders across pages of 20, 20, and 10. Add orders that do not match the status or date filters, and orders that the current user is not allowed to view.

Then check:

| Scenario | Expected observation |
| --- | --- |
| The current page contains 20 rows, while 50 orders match | The file contains all 50 |
| The current page or page size changes | The matching dataset remains the same |
| The dataset includes orders outside the filters | Those orders are absent from the file |
| The dataset includes orders the user cannot view | Those orders are absent from the file |
| No orders match | The user receives an explicit message |

Checking only that the file contains 50 rows is insufficient. Repeated pages and a missing last page can still produce the same count. Compare the order IDs in the file with the prepared set to verify that nothing is missing, duplicated, or added from outside the expected set.

Those expectations come from the business sample prepared before the export runs. If the test generates its expected result by calling the same internal data-preparation method used by the export, both sides may omit the third page and still agree.

This is the independent constraint tests need to provide: they must have an opportunity to identify an implementation error, rather than simply repeat its calculation.

## 4. After the Backend Tests Pass, Follow the Path to the User's File

Passing the module tests above does not immediately establish that the export feature is complete.

In this simulated system, imagine a common omission: the backend can now export the full filtered dataset, but the page button still calls an old method and passes the current 20 rows. A test that directly calls the new export function passes, while a user clicking the button still receives only one page.

The path that needs verification is concrete:

1. Open the order page and select “current month” and “completed.”
2. Confirm that results span several pages while only one page is displayed.
3. Click the page's Export button.
4. Read the actual downloaded file and compare its full set of order IDs and export fields.

Observing this far answers what the user receives. A success message, a successful API response, and the existence of a file each establish that one part of the path completed. None alone establishes that the file content meets the requirement.

This does not mean every test should begin in a browser. Module tests can quickly exercise combinations of filtering and cross-page aggregation. A page test can concentrate on the button, parameter passing, and the final file. Different test layers address different questions instead of repeating the same large scenario everywhere.

The example also shows why a failure should first be localized. If the file contains one page, check what the page passed, which pages the backend retrieved, and what data was finally written. Do not automatically increase every timeout, repeat requests, or ask a model to try again without identifying the difference.

**A fix should change the condition that caused the failure.** If the button still calls the old entry point, the repair must connect the user's action to the correct path and leave a check capable of detecting the same omission.

## 5. How the Three Move Each Other Forward, One Round at a Time

Connecting the stages of the export feature reveals the feedback between documentation, implementation, and tests.

In the first round, the specification says “export the current page,” the implementation does so, and the tests check the one-page limit. They satisfy the requirement of that version.

In the second round, actual use creates a need to export all filtered results. This changes the specification and invalidates the old test's quantity restriction. The developer needs to update data retrieval and the page call. Tests add a cross-page sample while retaining filtering and access-scope protections.

In the third round, module tests show that the new method handles the full dataset, but page interaction reveals that the old button has not been connected. That observation drives a call-path repair and a check on the final file.

Suppose a later request introduces “export selected orders only.” The developer should not immediately rewrite the “export all” assertion. First decide whether this is a new optional action or a replacement for the original feature, then specify which orders each entry point should export. Code and tests need a clear product decision to follow.

This is the iterative evolution discussed here: a real need or a counterexample changes a judgment, and the change reaches the relevant materials and execution paths. New experience can revise a specification; a test can expose a missing implementation connection; and the result the user receives checks whether the change worked.

All three can also preserve the same wrong assumption. A specification may vaguely require “a successful export,” the implementation may equate success with “a file was generated,” and the test may only check file existence. Internally they agree, yet they still do not answer whether the file contains the orders the user needs.

Alongside consistency, preserve the ability to ask different questions: the specification asks what the user needs, tests examine the promise through concrete samples, and the implementation must produce the result. Their corrections move an apparently finished feature toward something usable.

## 6. Why Synchronization Itself Can Slow Development

After fixing the feature, the next change can remain difficult if the maintenance structure stays the same.

Continue with the simulated project. Export column names are separately maintained in page configuration, backend export code, and several guides. Adding a column requires manual updates everywhere. An omission can leave the page and file inconsistent.

For a structure that must agree exactly, maintain one production field definition and let both the page and export code consume it. When multiple files are genuinely needed, generate the copies during the build and check the output. People edit the designated source instead of letting copies evolve independently.

Tests still need an independent judgment. If a test imports that same definition as its expected result, a missing required column can be absent from the page, the export, and the test together. Share the production definition while independently checking agreed column names, order, and content in important business examples.

Other repetition is better replaced by references. The observed result of one export check need not be copied into a design, task list, summary, and history entry. Keep the result where observations are recorded, track completion in the task list, and link from other pages when necessary.

Tom Manshreck's [documentation chapter in *Software Engineering at Google*](https://abseil.io/resources/swe-book/html/ch10.html) discusses incorporating documentation into the engineering workflow. In everyday maintenance, this also means reducing manual synchronization points and distinguishing what can be generated from what needs independent checking.

Historical material has a different role. Useful lessons include why the first version exported only one page, what usage need prompted the change, and why a row-count check could still miss an error. These judgments help later developers understand the trade-offs. Repeatedly recording that “the export tests passed” adds material without necessarily adding the same value.

Old checks also need exit conditions. Suppose the project has a check created only to confirm that an old export library has been removed. After the migration, inspect whether old callers are gone and current behavior remains protected, then decide whether that check still belongs in routine regression runs. Slow or failing tests do not by themselves justify deletion; obsolete requirements should not permanently occupy the regression suite either.

## 7. Where to Start When the Next Requirement Arrives

A task to change “export the current page” into “export all filtered results” can begin with the description below. It remains a teaching example:

> Expand the order export to include every order matching the current filters that the current user is allowed to view, regardless of the page. Update the original scope description while preserving filtering, access scope, and field requirements. Inspect the page button and backend export method to locate any path that still handles only the current page. Replace the old quantity assertion with a sample spanning three pages; check the complete order-ID set for omissions and duplicates, and retain exclusions for nonmatching and unauthorized orders. Finally, click the button from the page and inspect the downloaded file. Preserve implementations that already behave correctly and change only the parts that have fallen out of step.

This identifies the goal, protections, likely omission points, test sample, and completion conditions. A developer can locate the work, and a reviewer can assess its result.

There is no need to start by creating another set of forms. Record three things in the existing task: how the behavior changes, which old requirements remain or are replaced, and what input and observation point will verify the result. New API, permission, or data agreements should follow the project's existing design and verification process.

Completion should also be reviewable. In this example, the result should establish that cross-page data is exported completely, filters and access scope have not widened, the page button reaches the correct path, and the downloaded content matches the agreement. If a layer was not verified, retain that gap. Changes to both code and documentation files do not alone establish completion.

ETF Agent's actual materials contain similar forms of drift: configuration changes while tests retain old amounts, a code transition requiring updates to 19 current documents, and tests that do not pass through the execution path users actually use. The order-export example translates these relationships into a familiar development scenario.

Returning to the Export button, a failing test should prompt us to ask whether the old quantity limit still applies. A success message should prompt us to inspect which orders are in the file. A request to update documentation should identify the old statement that no longer holds.

**Moving all three forward should be observable: the data the user needs is actually exported, valid protections remain in place, and obsolete requirements no longer force the implementation backward.** Judgments tied to inputs, files, and results help an accumulated body of documentation, code, and tests remain useful to development.

<!-- agent-article-sync:guidance:start -->
## Further Reading and Discussion

- [Specs, Evidence and Verifiable Engineering Closure](026-agent-spec-evidence-workflow.md): maintain behavioral agreements, observed execution, and completion judgments separately.
- [Engineering Knowledge: Context, Memory and Retirement](027-agent-context-document-history.md): distinguish knowledge that should guide current work from material kept for reference.
- [Tests Expire Too: Move Refactoring, Retirement, and Deletion into the Spec](test-lifecycle-refactoring-retirement-and-spec.md): examine the basis for changing or retiring existing tests.
- [Chinese edition](/articles/docs-code-tests-evolve-together) · [Architecture Principles and Engineering Methods](/en/principles)

Join the discussion in the [GitHub collection](https://github.com/hpoenixf/eff-agent-article). If these engineering examples help your work, consider giving the repository a Star.
<!-- agent-article-sync:guidance:end -->
