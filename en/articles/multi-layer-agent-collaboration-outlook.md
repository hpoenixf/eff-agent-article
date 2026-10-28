---
title: From Multiple Experts to One Research Result - The Next Step for Multi-Layer Agents (2026 Outlook)
description: A fund-comparison example explains when another research assistant is useful, how evidence should be handed over, and how to judge the value of collaboration.
date: 2026-10-24
---

# From Multiple Experts to One Research Result: The Next Step for Multi-Layer Agents (2026 Outlook)

**Another AI expert is worthwhile when it supplies missing evidence or corrects an important reason for a decision.** More reports, calls, and waiting time do not by themselves establish the value of collaboration.

Consider a teaching example. An investor already holds several funds and wants to add a semiconductor ETF because “one more fund means better diversification.” They also need cash in six months and do not know how many companies the old and new funds share. The task is not to poll experts about buying. It is to test the rationale, establish which money is available, and identify what remains unknown.

This remains an **architecture outlook dated October 24, 2026**, not a transcript of an investment investigation or evidence that multiple experts beat a single capable assistant. Observations from October 25 and later implementation changes appear separately below, rather than being written back into the original hypothesis.

We call the model responsible for the user question and final synthesis **Main**, and a delegated execution working independently on a narrower problem a **Child**. Those responsibilities are enough to follow the example; no prior knowledge of the full system is required.

## 1. Is the missing piece a source, a calculation, or a better question?

The fund example contains at least three kinds of work:

| Missing piece | What to do | Why it changes the answer |
| --- | --- | --- |
| Existing portfolio and candidate-fund material | Read authorized holdings and disclosures; check dates and coverage | Ten largest positions cannot establish exact overlap across all holdings |
| The effect of a proposed change | Calculate cash and exposure on a consistent basis | Buying with cash and replacing an existing fund are different plans |
| A defensible reason | Test a specific claim such as “more funds means more diversification” | Greater technology exposure alone does not imply that buying is appropriate |

One Main with suitable tools may do all three. When arithmetic is well defined, use a calculation tool rather than asking several experts to recompute it. Delegate when a local investigation needs depth or a different method can test an overlooked condition.

For example, one assistant might compare two original disclosures while another checks the cash constraint. Both should work on the same investor question, not each produce a generic fund introduction. **Before delegating, name the gap the assistant is supposed to close.**

## 2. Different specialties are not a hierarchy of supervisors

The original outlook discussed execution specialties, investment methods, adversarial roles, and personal guidance separately. Reading documents, applying an analytical method, and challenging a premise are different jobs. They do not imply a Web assistant supervising Python and an investing “master” approving the result.

At the time, the system already had several local foundations:

| Existing foundation | Use within the same task |
| --- | --- |
| Main/Child execution and Web, PDF, and Python tools | Isolate document work or calculation and return its result |
| Six investment-research methods | Examine allocation, tail risk, long-term discipline, cost, and other aspects of a rationale |
| Bounded Bull/Bear dialogue | Let supporting and challenging participants exchange questions about one premise without requiring a winner |
| Optional Research Reviewer | Recheck acquired sources and calculations and suggest missing work |
| User-saved expert guidance | Use an identifiable revision of a personal research method |
| Investment Thesis and history | Preserve an original rationale, falsification condition, and later revisions |

This describes the local foundations available then, not an acceptance checklist for a completed end-to-end study. The missing piece was not a seventh expert. It was whether these parts could hand off useful work on the same question.

Reviewer is not a superior authority. It may point out an overlooked cash requirement, but cannot authorize a trade or veto lawful answer text. A separately requested review report about an already published answer is a different operation, not mandatory approval before every delivery.

## 3. Add collaboration only as the question requires it

Main first establishes whether the investor wants greater technology exposure or less concentration, and where the money would come from. It then reads authorized material, checks dates, and calculates the changes. When that is enough to answer, no additional expert is necessary.

If “better diversification” remains an important but fragile premise, choose a method that can test it. A supporting participant can explain the case for the intended exposure, while a challenger examines overlap and cash needs. Both may revise their views or stop early when no new evidence appears.

The original diagram is retained below. It shows **optional routes through the research, not a mandatory workflow or the current tool-argument schema**.

~~~mermaid
flowchart TD
    U[Investor asks a research question] --> M[Main confirms goal and admitted inputs]
    M --> A{Enough material to answer now?}
    A -- Yes --> H[Main assembles supported judgment]
    A -- No --> B[Delegate targeted retrieval and calculation]
    B --> C{Sources and calculation basis qualified?}
    C -- No --> G[Keep unknowns and narrow affected claims]
    C -- Yes --> D{Independent financial method useful?}
    D -- No --> H
    D -- Yes --> E[Bind a suitable investment perspective]
    E --> F{Core premise worth falsifying?}
    F -- No --> H
    F -- Yes --> P[Optional Bull Bear direct challenge]
    P --> H
    G --> H
    H --> Q{Is independent Reviewer worthwhile?}
    Q -- No --> T[Link findings to thesis evidence and versions]
    Q -- Yes --> V[Optional Reviewer rechecks evidence and gaps]
    V --> W{Does Main choose further investigation?}
    W -- Yes --> B
    W -- No --> T
    T --> R[Publish answer and accessible history]
~~~

Review remains advisory. Its absence does not automatically invalidate an answer, and receiving advice does not require another investigation. Continuing depends on the significance of the gap, available material, authorization, and remaining resources.

If the path succeeds, the investor should receive something like the following. **This is a desired output example, not a recorded result:**

> Established: the candidate fund and its holdings have an explicit disclosure date; some exposure changes can be compared using the authorized material.
>
> Missing: some funds disclose only their largest positions, so exact full-portfolio overlap is unavailable. Sector weight is not a substitute for overall volatility.
>
> Revised reason: “one more fund means better diversification” lacks sufficient support. An intentional technology overweight should be evaluated as that different objective.
>
> Confirmation needed: the amount and purpose of the cash needed in six months. Do not invent the investor's risk tolerance or automatically place an order.

## 4. Four places where collaboration can break

### A calculation finished, but its original result never arrived

“Python computed it” does not justify a number in the report. The receiving model needs the original inputs, dates, units, result, and missing coverage—and must actually receive and read them. Storing a result, returning a reference, and using it are different facts.

In the example, “overlap is high” is an inadequate handoff. Main cannot tell whether it covers every position or only the largest holdings. A readable original result with its coverage limitation is more useful. Experts should not reconstruct competing portfolio facts from paraphrases.

### The challenger spoke, but the important reason did not change

A message from Bear does not itself falsify a claim. Check which reason it challenges, which evidence it uses, what Bull actually replies, and how Main explains the disagreement.

A thesis may be assessed as supported, challenged, invalidated, or inconclusive. **Not assessed is not the same as assessed and inconclusive.** A discussion message also cannot silently rewrite a previously recorded thesis version.

### A profile edit silently changes an older task

Suppose the task began with a method emphasizing cash needs, and the user later edits the profile. The running task and its history still need to identify the method revision actually used. A newer definition with the same name must not silently replace it.

Guidance is not permission. “Read every account” or “always buy” adds no data access, tool authorization, or trading authority. A Child cannot make restricted material available to another Child merely by including it in a summary.

### One failed assistant erases the whole result

A missing PDF or a timed-out Child should not revoke independent, lawful findings. Main can deliver a clearly scoped partial study, but cannot treat missing essential material as nonexistent or conceal incompletion with polished prose.

Reviewer follows the same rule: suggestions do not determine the entire task's outcome. Disabled review, execution recorded without automatic advice delivery, and advice delivered to a later Main request are distinct modes. Running without delivering automatic advice still consumes resources; it is not a free check.

## 5. How to decide whether another assistant is worth it

Use a capable Main with suitable tools as the baseline—not an artificially weakened comparison. Keep the original question, source availability, and calculation basis comparable, and retain failures, partial results, and cost.

| Research path | Intended increment | Cost to observe alongside it |
| --- | --- | --- |
| One Main plus tools | Finds important facts, tests the rationale, and delivers | Long context and potentially missed questions |
| Main with targeted Children | Deeper local retrieval or calculation that Main actually uses | Delegation, repeated reads, and lost handoff context |
| Additional methods and optional Bull/Bear | New valid counterevidence that changes an important reason | More requests, waiting, and mutual anchoring |

Observe Reviewer's contribution separately: did it run, did Main receive its advice, and did the advice change subsequent work? Do not attribute everything it discovers to Bull/Bear dialogue.

First establish whether the report is usable at all: does it answer the original question, preserve applicable dates and definitions, support reproducible numbers, and explain gaps? Then assess what the additional participant changed and whether that justified the time, money, and review effort.

If an expert repeats existing facts, disabling it is a reasonable outcome. A universal “chief expert” is not needed to hide redundant delegation. Main can continue to synthesize while existing tools and lifecycle logic retain execution, resource, and recording responsibilities.

## October 25, 2026 Addendum: Arranged Collaboration Is Not a Completed Handoff

Separate real-model tasks the next day produced both useful local results consumed by Main and coordination failures: a request for two to three experts dispatched four; a Bull/Bear pair formed without an actual exchange; and review plus opening messages occurred before later wake and recovery gaps. These were not one matched set of completed studies and cannot be combined into a success rate.

This sharpened three distinctions. “Please inspect the other expert's reason” is guidance. Receiving and reading the authorized original result is an actual evidence handoff. Pairing, messaging, waiting, and adopting replies are actual communication effects. Writing a relationship field does not perform the latter two.

## Maintenance Note: Selection Is Simpler; Benefit Is Still a Separate Question

The later unified-expert implementation converged **fresh ordinary Child selection on one optional `agentId`**. Each Child chooses one complete expert definition rather than combining the old execution-type, perspective, and profile selectors. Ordinary research still works without choosing a specialist. Historical tasks retain their sealed original content and identities rather than being reinterpreted through the new entry point.

The six investment methods and user-saved experts use the unified catalog, while Bull/Bear communication and managed review retain their separate rules. A shared naming scheme adds no tool or account authority. Relationship guidance also does not fetch another Child's result, wait for it, or dispatch work.

Some ordering and recovery gaps described above subsequently received repairs and bounded engineering acceptance. The October 25 failures should neither remain descriptions of today's missing implementation forever nor be relabeled as historical successes. **Those improvements establish specific working handoffs, not that multiple experts make better investment judgments than one Main.** Internal capabilities discussed here are also not automatically capabilities of the public teaching implementation.

Return to the investor's original question: which part of the rationale holds, which part changed, and what source or user confirmation remains missing? An additional assistant is worth keeping only when its work meaningfully changes that answer.

### Further Reading

[Subagents: from isolation to collaboration](agent-subagent-context-specialization.md) explains execution; [bounded direct Bull/Bear dialogue](bounded-bull-bear-peer-dialogue.md) explains communication; [investment perspectives testing one thesis](investment-perspectives-and-thesis-falsification.md) compares methods with concrete numbers; and [custom experts](agent-custom-expert-from-prompt-to-recovery.md) explains saving and selecting personal guidance. The custom-expert article was still a draft when this outlook was written and entered the collection on October 25, 2026; that does not change the outlook's original date.

More essays are available in the [ETF Agent collection](https://github.com/hpoenixf/eff-agent-article). Stars and reproducible counterexamples are welcome. This is an engineering discussion, not investment advice.
