---
title: From Multiple Experts to One Research Result - The Next Step for Multi-Layer Agents (2026 Outlook)
description: Why ETF Agent is exploring coordinated research across specialized Children, investment methods, peer challenges and personal profiles - and what remains unverified.
date: 2026-10-24
---

# From Multiple Experts to One Research Result: The Next Step for Multi-Layer Agents (2026 Outlook)

> **An architecture outlook dated October 24, 2026, not a retrospective claiming full system-level success.** This edition intentionally preserves the goals, assumptions, design choices and validation gaps known at this point. Once full-scenario evidence exists, we intend to write a separate comparison and link back here, rather than quietly rewriting yesterday's predictions as accomplishments.

Ask AI, “Is this semiconductor ETF worth buying?” A report covering industry prospects, fees and risks is no longer especially difficult to produce.

Now ask, “I own several funds already. Would this ETF buy more of the same companies? I might need this money six months from now. If you recommend buying, what evidence would make you change your mind?” The task changes substantially.

A useful answer requires **product disclosures, existing portfolio facts, funding constraints, calculations, opposing views and subsequent reassessment** to work together. The investor wants neither six disconnected expert essays nor a staged debate. They need one piece of research that clearly explains what is known, why the current judgment is warranted and what remains unresolved.

ETF Agent now has a foundation of ordinary Subagents, six investment methods, bounded Bull/Bear dialogue and user-configured agent profiles. The next question is **whether combining these mechanisms within one genuine research task produces more value than a capable Main Agent working directly with tools**.

As of this article's date, the answer is not yet established. Individual mechanisms have different levels of scoped engineering evidence, while independent qualification of end-to-end financial usefulness, cross-capability integration and cost-benefit remains open. That is exactly why this outlook is worth preserving.

## 1. Why Might an Investor Need Layered Collaboration?

Personal-investment questions rarely have only one dimension. A simple rebalance can involve three very different kinds of work.

**The first is establishing facts.** What does the investor actually hold? What benchmark does the ETF track? When was the holdings file disclosed? Does it cover the entire fund or only its ten largest positions? Sources, observation dates and coverage matter.

**The second is computing changes.** Buying with cash is not the same as replacing an existing fund. The two choices affect cash balances, asset exposure and transaction costs differently. They need calculations, not a model asserting that diversification is “better.”

**The third is judging the rationale.** Is the investor trying to increase growth exposure or reduce risk? If the two objectives conflict, which one has the user actually confirmed? What evidence would undermine the initial recommendation?

A Main Agent with suitable tools may already be capable of all three. The proposed benefit of specialized collaboration is to isolate deep local work without carrying its entire debugging history back into Main; reuse the same verified facts across methods; and bring an important challenge into synthesis before the final answer.

These are **expected benefits**, not measured improvements in speed, accuracy or returns.

## 2. What Building Blocks Exist, and What Is Still Missing?

Previous essays discuss custom agent profiles, direct Bull/Bear dialogue and investment perspectives. Seen together, they might look like four hierarchical levels: a Web Agent supervising Python, Python supervising an investing “expert,” and Bear judging everyone.

That is not our architecture. Type describes execution specialty; Perspective describes an analytical method; Role is a trusted adversarial duty within an authorized peer pair; and a user Profile supplies saved personal methodology. They can be bound to a permitted Child execution without **building another runtime, database, budget or trading privilege for each new name**.

The real gap is not a missing seventh expert. It is the usefulness of the combined workflow. The distinction matters:

| Existing foundation | Local behavior it can support | What we cannot conclude from it |
| --- | --- | --- |
| Main/Child with Web, PDF and Python | Delegation, context isolation, handoff, existing resource and authorization controls | Every complicated end-to-end study will succeed |
| Six trusted investment methods | Distinct financial analytical guidance on the same Child runtime | Six methods necessarily provide more accurate judgments |
| Bounded Bull/Bear dialogue | Independent openings, real public messages, bounded exchange and scoped durable recovery | Models will consistently discover stronger financial disconfirmation |
| Optional Research Reviewer Child | Rechecks original sources, calculations and research gaps, offering non-authoritative advice to continue, pivot or finalize | Scoped engineering acceptance does not prove financial review quality or mandatory final approval |
| User-configured Profiles | Settings, versions, frozen Run selection and Child binding on main | Full account/PG/browser/peer integration has been qualified |
| Investment Thesis and History | Original hypotheses, versions, falsification criteria and optional challenge association | Future models reliably understand and revise beliefs correctly |

**Research Reviewer is not the same as post-publication financial review.** The former is an optional in-Run Child. The latter generates a separate financial-semantic report for a selected published answer only when explicitly invoked. Neither may authorize trades, rewrite the answer, or impose an approval gate.

Several locally functioning components are **not the same as one reliable, usable investment study**. We want that limitation to remain visible when we return to this essay in the future.

## 3. What Might One Useful Research Run Look Like?

Consider another **entirely synthetic ETF question**. An investor wants more technology exposure but may already hold many of the same companies, and must preserve cash needed in six months.

One plausible workflow starts with Main clarifying the actual goal and funding source. It then obtains qualified holdings and calculations; chooses a portfolio-risk, investment-discipline or implementation-cost method only if that perspective adds something; asks a Bull/Bear pair to test a decisive but fragile premise where worthwhile; and finally produces conditional findings with versioned reasons for later review.

The word **might** is important. We do not want every question to trigger six perspectives, several debate rounds and a full report. This is an optional, demand-driven coordination sketch, not a fixed execution DAG.

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

Reviewer in this diagram is **not mandatory final approval**. It provides bounded advice only when admitted and worth the extra cost; Main may adopt, investigate further, or deliver supported work with explicit limits. Automatic review is off by code default; an operator template selecting `advisory` does not prove live deployment or semantic quality.

If this workflow eventually passes the necessary acceptance tests, the investor should receive something like the following. **This is a desired output example, not a record of a real executed Run:**

> Verified: The ETF benchmark and holdings correspond to a stated disclosure date; part of the exposure change can be checked from current authorized portfolio material.
>
> Unknown: If some existing funds disclose only their largest holdings, we cannot claim an exact total look-through overlap. Industry concentration alone is not total portfolio volatility.
>
> Revised reason: “Buying one more fund necessarily improves diversification” is unsupported and should be withdrawn or narrowed.
>
> Investor confirmation needed: How much cash must remain available in six months, and for what purpose? The system must not invent a risk-tolerance answer.
>
> Decision support: Explain qualified changes, limits and review conditions. Do not automatically place an order.

The intended final result is straightforward to read. Making the system **actually and reliably produce it** is much harder than starting several Agents.

## 4. Where Do the Difficult Handoffs Happen?

### 4.1 A calculation finished—what did Main really receive?

“Python Child computed it” cannot by itself justify a number in the public answer. Main needs the actual input basis, observation date, result identity and missing coverage. Saving the result does not prove Main read it.

Existing ResultRef, source lineage and calculation mechanisms own different facts. The integration challenge is to ensure that the downstream specialist receives the **authorized original result** rather than an unverifiable paraphrase. We must not let each expert reconstruct a private, competing version of portfolio truth.

### 4.2 Bear spoke—did the thesis actually change?

A public peer message does not automatically mean Main adopted the challenge. The system should identify the original thesis and hypothesis, the source of the new evidence, the actual response, and Main's eventual synthesis.

A message saying “the thesis is wrong” is not itself a verified `Invalidated` assessment. We must distinguish an actual dated assessment of `Supported`, `Challenged`, `Invalidated` or `Inconclusive` from the **absence of any assessment**. An unperformed assessment must not silently become Inconclusive.

### 4.3 The user edited the profile—should an older Run change?

A saved profile can change its description and research guidance. A running task still needs to know exactly which revision was used. We have a Run-frozen identity and versioning mechanism on the implementation path; it addresses stable binding and recovery, not guaranteed semantic obedience by the model.

User-authored guidance is also not a new system privilege. Even instructions that say “always buy” or “access all sources” cannot override the Host's original data, resource, peer or trading authorization. A message from one Child cannot promote inaccessible materials into trusted content for another.

### 4.4 One specialist failed—what happens to the whole study?

A missing PDF, a Child timeout or incomplete opposing evidence should not erase independent, previously authorized findings. Main may deliver usable partial research and state its limitations. On the other hand, when a user's essential requirement is not met, a polished narrative cannot truthfully count as a complete answer.

Our target is **local degradation for local failures, while overall completion remains tied to the actual user task**. Both the successful and failed paths still need validation in the same full real-world research scenario.

### 4.5 Reviewer Finds a Gap—Who Decides What Happens Next?

Bear tests a specific Thesis. Research Reviewer can independently inspect **the original materials and calculations of the broader study**, potentially finding important omissions shared by the specialists. It cannot force Main to investigate again; `finalize` is only advisory. Failure, stale advice or missing evidence must not erase independent lawful findings.

The implemented `off`, `shadow`, and `advisory` modes are different: `shadow` can execute without delivering automatic advice to Main but still consumes Root resources; `advisory` may inject advice into a later lawful Main request. Real-model quality, false positives, false negatives, and cost-benefit have not received complete acceptance.


## 5. Why We Did Not Add a Universal “Chief Expert”

The more Agents appear, the more tempting it becomes to introduce an Orchestrator to select them, route messages, own calculations, declare a winner or even authorize investment actions.

We favor a smaller evolution. Main already owns research reasoning and synthesis. The Child lifecycle owns delegation and actual peer-message facts. Existing resource governance owns budgets and termination. Result and provenance owners retain source identity; publication and history own their respective user-visible effects.

**New collaboration should deepen the necessary handoffs among these owners rather than duplicate message ledgers, result authorities and finalization decisions.**

This does not mean the composition is already simple enough. Main may still delegate redundantly, choose an unsuitable investment method or spend tokens without producing a new finding. Local runtime green tests do not establish that these semantic choices are better than Main calling tools directly.

We prefer to make these costs observable and honestly evaluable rather than conceal them behind a newly invented global semantic “judge.”

## 6. How Will We Know Whether Collaboration Is Worth It?

The strongest competing hypothesis is: **a capable Main with tools and well-managed context may already be enough**.

We want to compare three approaches on the same investor question, with a comparable original source window and measurement basis. Real failures, partial results, cost and unknown states must remain in the comparison rather than displaying only the most impressive attempt.

| Research mode | What to evaluate | Added cost or risk |
| --- | --- | --- |
| **One Main plus tools** | Can it find essential facts, weak premises and a usable answer? | Long context, debugging noise and missed challenges |
| **Main plus targeted Children** | Are retrieval and calculation easier to finish and actually consumed by Main? | Delegation, duplicated reads and lost handoff context |
| **Main plus methods and optional Bull/Bear** | Does it add material counterevidence, correct weak reasons and preserve real disagreement? | Extra model requests, waiting and agents anchoring on each other's opinions |

For these research modes, separately observe **Reviewer absent, Reviewer actually dispatched, and advice actually included and used by Main**. Only matched tasks can show whether the reviewer catches material omissions, introduces new errors, or just adds cost. Its potential effects must not be credited automatically to Bull/Bear.

First test **absolute usefulness**: did the answer satisfy the user's request; were dates and sources applicable; can calculations be reproduced; are central claims supported; and are missing information and user authorization handled correctly? Only then assess relative value: which new significant counterexample appeared, which new errors were introduced, and how much extra time, token use, money and human review were required?

Until those measurements exist, “multi-Agent is smarter,” “our accuracy improved,” and “we saved X%” are unverified claims. An outcome showing that extra collaboration rarely pays off would also be useful: simpler requests should remain with Main, and only materially difficult cases should justify the additional cost.

## 7. What Should Our Future Retrospective Compare Against This Outlook?

This article is worth retaining not because it predicts inevitable success, but because it records our criteria **before the results are known**.

A later retrospective should answer four questions:

1. **Was the end-to-end task delivered?** From an ordinary Chat request through admitted sources, calculations, specialist findings, publication, requested files and fresh-session History, can we retrieve the real results and preserve partial/unknown states?
2. **Did opinions actually affect the analysis?** Which exact thesis was challenged, who revised it and why—or did we merely generate more paragraphs?
3. **Was the extra cost justified?** Relative to Main alone, did quality gains outweigh time, model usage, tools and human review?
4. **Can we retreat to a simpler design?** If optional method and peer admission is disabled, do ordinary research and legitimately stored history remain usable?

At that point, we should publish a **separate retrospective with matched comparisons and actual failure cases**, linked back here. We should not overwrite this dated outlook. That allows architecture decisions to be tested against reality rather than always being rewritten into success stories afterward.

**Real multi-Agent collaboration is not keeping more Agents busy. It is assigning necessary work around one investor question, and bringing genuinely important evidence, disagreement and uncertainty back into a single understandable result.**

As of October 24, 2026, that is our direction and hypothesis—not an established end-to-end business outcome.


## October 25, 2026 Addendum: Collaboration Dependencies Are More Than Relationship Fields

The original text preserves the October 24 outlook. The following day's real-model work produced positive examples of independent method Children, Main consuming two specialist findings, and sandboxed Python artifact delivery. It also retained failures: a request for two or three experts dispatched four; a Bull/Bear pair formed without an actual challenge-and-reply exchange; and a Reviewer-first sequence recorded both openings but encountered later wake/recovery gaps. These observations belong to separate tasks and should not be combined into a success rate or called mature collaboration.

At least three kinds of dependency have different owners. A **method relationship** describes complementing, challenging, reviewing, or handing off work. The proposed [expert usage guidance Spec](https://github.com/hpoenixf/etf-agent/blob/main/openspec/changes/agent-add-expert-usage-guidance/design.md) calls its soft hint `relationHint`; it does not automatically wait or create a DAG. A **result dependency** requires Main to obtain a real upstream `taskRef` and pass lawful `inputRefs` downstream. A **protocol dependency** belongs to Peer pairing, messages and turns, or to original HIL answers and safe points; prose does not substitute for these effects. A separate [collaboration experience Spec](https://github.com/hpoenixf/etf-agent/blob/main/openspec/changes/agent-improve-expert-collaboration-experience/design.md) proposes delegation guidance and autonomous Child task-description updates. Those remain implementation plans.

A distinct essay may eventually be warranted, once a real upstream → downstream consumption → Main synthesis chain exists alongside a missing-wait, wrong-reference, or recovery failure case, with comparable input and cost/quality observations across no hint, soft hints, and explicit handoff. Only then can we answer who owns expert dependencies, rather than introducing another parameter.

---

### Related work and evidence limits

For the local building blocks, read [Subagents: from isolation to collaboration](agent-subagent-context-specialization.md), [bounded direct Bull/Bear dialogue](bounded-bull-bear-peer-dialogue.md) and [investment perspectives testing one thesis](investment-perspectives-and-thesis-falsification.md). The user-defined expert essay was still a draft at the date of this outlook. On October 25, it was published as [A Custom Expert Should Be More Than a Prompt Field](agent-custom-expert-from-prompt-to-recovery.md), an implementation study distinct from this larger collaboration outlook.

The supported engineering scope and still-open gates are recorded in ETF Agent's [investment-perspective specification](https://github.com/hpoenixf/etf-agent/blob/main/openspec/specs/investment-perspective-subagents/spec.md), [peer-dialogue verification](https://github.com/hpoenixf/etf-agent/blob/main/openspec/changes/archive/2026-10-23-agent-add-bounded-adversarial-peer-dialogue/verify.md), [custom-profile verification](https://github.com/hpoenixf/etf-agent/blob/main/openspec/changes/agent-add-user-subagent-profiles/verification.md) and [financial research quality tasks](https://github.com/hpoenixf/etf-agent/blob/main/openspec/changes/agent-qualify-financial-research-quality/tasks.md). These sources support individual facts, not completion of this entire workflow.

More work is available in the [ETF Agent article collection](https://github.com/hpoenixf/eff-agent-article); Stars are welcome. This is an architecture outlook, not investment advice or a claim of validated production investment-research quality.
