---
layout: page
sidebar: false
outline: false
editLink: false
search: false
head:
  - - meta
    - name: robots
      content: noindex, follow
  - - link
    - rel: canonical
      href: https://hpoenixf.com/eff-agent-article/en/articles/docs-code-tests-evolve-together
---

# Tests Expire Too: Move Refactoring, Retirement, and Deletion into the Spec

This essay was merged into [When Tests Outgrow the Code](docs-code-tests-evolve-together.md) on **2026-11-02**. The main essay now covers five treatments—**retain, refactor, consolidate, retire, and delete**—along with the recovery-candidate and LangGraph migration-scan counterexamples.

This URL remains readable for older links but is no longer separately searchable or canonical, or counted as a complete English essay. The original avatar-upload teaching example and full discussion remain in Git history. Consolidation is not a license to delete tests based on count or passing rate.

## Historical section links

These links lead to the related sections of the consolidated essays; they are not copies of the complete historical sections.

<div>
<span id="_1-find-the-behavioral-basis-before-changing-the-test"></span>
<span id="1-find-the-behavioral-basis-before-changing-the-test"></span>

[1. Find the Behavioral Basis Before Changing the Test →](docs-code-tests-evolve-together.md#do-not-discard-the-old-tests-as-a-group)

</div>

<div>
<span id="_2-inspect-the-protections-instead-of-deleting-the-group"></span>
<span id="2-inspect-the-protections-instead-of-deleting-the-group"></span>

[2. Inspect the Protections Instead of Deleting the Group →](docs-code-tests-evolve-together.md#do-not-discard-the-old-tests-as-a-group)

</div>

<div>
<span id="_3-existing-tests-have-more-than-two-possible-destinations"></span>
<span id="3-existing-tests-have-more-than-two-possible-destinations"></span>

[3. Existing Tests Have More Than Two Possible Destinations →](docs-code-tests-evolve-together.md#do-not-discard-the-old-tests-as-a-group)

</div>

<div>
<span id="_4-how-long-should-migration-checks-survive-the-old-library"></span>
<span id="4-how-long-should-migration-checks-survive-the-old-library"></span>

[4. How Long Should Migration Checks Survive the Old Library? →](docs-code-tests-evolve-together.md#_6-why-synchronization-itself-can-slow-development)

</div>

<div>
<span id="_5-make-the-decision-during-design-and-apply-it-to-files"></span>
<span id="5-make-the-decision-during-design-and-apply-it-to-files"></span>

[5. Make the Decision During Design and Apply It to Files →](docs-code-tests-evolve-together.md#_7-where-to-start-when-the-next-requirement-arrives)

</div>

<div>
<span id="_6-before-deleting-a-slow-test-look-for-repeated-work"></span>
<span id="6-before-deleting-a-slow-test-look-for-repeated-work"></span>

[6. Before Deleting a Slow Test, Look for Repeated Work →](docs-code-tests-evolve-together.md#_6-why-synchronization-itself-can-slow-development)

</div>

<div>
<span id="_7-ask-what-the-failing-test-still-guards"></span>
<span id="7-ask-what-the-failing-test-still-guards"></span>

[7. Ask What the Failing Test Still Guards →](docs-code-tests-evolve-together.md#_7-where-to-start-when-the-next-requirement-arrives)

</div>

<div>
<span id="further-reading-and-discussion"></span>

[Further Reading and Discussion →](docs-code-tests-evolve-together.md#further-reading-and-discussion)

</div>

[Read the complete pre-merge edition](https://github.com/hpoenixf/eff-agent-article/blob/32c3a4a1b9ab3e02452af3cc2f8875953796d670/en/articles/test-lifecycle-refactoring-retirement-and-spec.md).
