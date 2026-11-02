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
      href: https://hpoenixf.com/eff-agent-article/en/articles/agent-veto-authority-and-run-termination
---

# Why Can Adding Reliability Mechanisms Stop an Agent from Delivering?

This essay was consolidated on **2026-11-02**. The responsibility for local failure, checkpoint recovery, and Run termination is covered in [Run Veto Authority and Safe Recovery](agent-veto-authority-and-run-termination.md). The distinct case of **a background evidence writer deadlocking with publication** now appears in [Capturing and Reading Research Evidence](agent-research-evidence-store-lifecycle.md).

This URL remains available for existing links, but is no longer a separate searchable, canonical essay or a full English edition. The original text remains in Git history. The merge does not make all checkpoint errors ignorable or establish production reliability.

## Historical section links

These links lead to the related sections of the consolidated essays; they are not copies of the complete historical sections.

<div>
<span id="_1-start-with-what-the-user-is-waiting-for"></span>
<span id="1-start-with-what-the-user-is-waiting-for"></span>

[1. Start with What the User Is Waiting For →](agent-veto-authority-and-run-termination.md#_1-separate-a-failed-step-from-an-ended-task)

</div>

<div>
<span id="_2-how-can-an-asynchronous-write-block-publication"></span>
<span id="2-how-can-an-asynchronous-write-block-publication"></span>

[2. How Can an Asynchronous Write Block Publication? →](agent-research-evidence-store-lifecycle.md#_4-a-finite-queue-must-never-become-execution-backpressure)

</div>

<div>
<span id="_3-how-can-a-recovery-record-restrict-a-completed-action"></span>
<span id="3-how-can-a-recovery-record-restrict-a-completed-action"></span>

[3. How Can a Recovery Record Restrict a Completed Action? →](agent-veto-authority-and-run-termination.md#_7-recovery-begins-by-checking-what-happened-not-by-doing-it-again)

</div>

<div>
<span id="_4-test-reliability-mechanisms-in-reverse"></span>
<span id="4-test-reliability-mechanisms-in-reverse"></span>

[4. Test Reliability Mechanisms in Reverse →](agent-veto-authority-and-run-termination.md#_9-bring-the-principle-into-the-next-review)

</div>

<div>
<span id="_5-design-the-failure-of-the-reliability-mechanism"></span>
<span id="5-design-the-failure-of-the-reliability-mechanism"></span>

[5. Design the Failure of the Reliability Mechanism →](agent-veto-authority-and-run-termination.md#_9-bring-the-principle-into-the-next-review)

</div>

<div>
<span id="further-reading"></span>

[Further Reading →](agent-veto-authority-and-run-termination.md#_9-bring-the-principle-into-the-next-review)

</div>

[Read the complete pre-merge edition](https://github.com/hpoenixf/eff-agent-article/blob/32c3a4a1b9ab3e02452af3cc2f8875953796d670/en/articles/agent-reliability-mechanisms-without-blocking-progress.md).
