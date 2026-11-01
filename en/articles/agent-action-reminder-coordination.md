# Action Reminders for Agents: From Candidate Advice to the Model Request

Halfway through a research task, an agent is comparing the holdings and fees of several funds. It has read some material, attempted calculations, and begun to organize an answer.

The runtime knows facts the model may not be able to infer reliably on its own: available requests are diminishing, the context is getting crowded, and a passage of the answer is approaching its revision limit. The work has also gone on long enough that it may be useful to revisit gaps in the evidence.

All of this can be worth telling the model. But which reminders belong in this turn? Did they actually make it into the request? And does telling the model to consider a review mean the system has approved another Reviewer call?

Our central decision in ETF Agent was to **translate runtime facts into timely advice while leaving facts, execution authority, and final delivery with their existing owners**.

That sounds like adding a few sentences to a prompt. The real work is coordinating where reminders come from, how they coexist, what fits, what was submitted, and which boundaries advice must not cross.

## 1. Long tasks need more than the initial instructions

For a short task, the initial request can often say enough: what the problem is, which tools are available, and how the answer should be formatted.

Constraints change as a longer research task proceeds:

- How many model requests have been used, and how much capacity must remain for delivery?
- Is active execution time approaching its original limit?
- Is the assembled context nearing a capacity boundary?
- How many revisions remain for published text?
- Is it time to revisit the research goal and unresolved questions?

The model cannot necessarily reconstruct all these facts from its conversation. It can see that it called a tool, for example, without knowing whether a failed external request consumed budget. It can see text without knowing that a revision has already been shown to the user but has not yet been saved in the background.

The runtime can add information to later requests to help the model adjust. Repeating every state in full on every turn, however, creates duplication, conflicting guidance, and competition for space with the task materials themselves.

[Anthropic's discussion of context engineering](https://www.anthropic.com/research/effective-context-engineering-for-ai-agents) describes selecting information appropriate to each turn, avoiding both vague instructions and a prompt packed with hard-coded edge cases. Action reminders address one part of that problem: **selecting what the model should notice now from changing execution facts**.

## 2. Why reminders moved out of budget management

At first, reminders naturally lived alongside the resource budget. Budget management already tracked requests and time, so it could calculate when to warn the model about remaining capacity.

That was a reasonable arrangement while reminders mostly concerned resources. The budget module knew the original limits, usage, and capacity reserved for delivery; generating early guidance there was straightforward.

Then the sources of reminders expanded.

The system began limiting repeated revisions to published text. Whether a passage could still be changed depended on limits and actual modifications maintained by publication, not on the number of model requests. At another point in a task, the system might suggest reviewing the work so far; that is not a new budget either.

Keeping all reminders in budget management would require that module to understand increasingly unrelated facts, including revisions, review, ordering, and deduplication. If every owner instead appended its own prompt, reminders could repeat or give conflicting advice in the same turn.

We therefore brought **reminder coordination** together: the existing modules continue to maintain their facts, while the coordinator chooses which facts warrant guidance, how to express it, and which reminders have actually been submitted.

| Responsibility | What it owns |
| --- | --- |
| Resource management | Request and time facts, and the corresponding execution constraints |
| Publication | Revision limits, actual changes, and related availability |
| Action reminder coordination | Reminders and review candidates derived from existing facts |
| Runtime | Model-request assembly and admission of tools or a Reviewer |
| Recovery | Reconstructing submitted reminder facts from the original execution records |

Coordination does not create an all-purpose controller. It does not maintain a second budget, decide whether text may be published, or gain authority to dispatch a model merely by generating advice.

## 3. Different reminders can coexist without competing for the last word

Consider an **illustrative teaching scenario**.

An agent is comparing funds. At the start of a turn, the system observes that:

- research requests have entered a higher-consumption stage;
- the current context is close to an application-level capacity threshold;
- a passage of the answer has used part of its revision allowance;
- the research has reached a work-review point.

A simple implementation could prioritize the categories and choose just one per turn. That loses useful information. Context pressure and revision pressure are different: the model may need to know both that material might not fit and that a passage should be revised carefully.

We therefore allow **different types of reminder to coexist in the same turn**. Their order makes presentation and capacity fitting stable; it does not mean the first type logically displaces the others.

Within one type, however, deduplication matters. If a measurement crosses several thresholds at once, the system should express the **highest stage currently reached**, rather than replaying every missed threshold. The model needs its present situation, not a queue of outdated alerts.

Units must remain separate as well. Request count, active time, serialized context bytes, and revision count have different denominators and meanings. Adding them into a vague single “remaining budget” would erase those distinctions.

## 4. Separate current state from advice to act

Not every reminder should follow the same deduplication policy.

Some information is **current state**. Suppose a passage has used at least half of its revision allowance and the model may continue working with it over several turns. Mentioning the constraint once and then removing it entirely may leave the model without it when it matters later.

Other information is **action advice**. A suggestion to revisit the research goal, for instance, may become less useful if it has already entered a request and is repeated turn after turn.

We therefore treat them separately:

- Continue to present necessary, relevant quota state once its conditions are met.
- Decide whether to repeat action advice using its type and prior submission record.

Deduplicating an optional prompt must not silently erase the underlying state. The model may not need “check the revision count” every turn, but it can still need to know that revision capacity for relevant text is limited.

There is another boundary: **a passage reaching its revision limit does not mean the whole research task must end**. Existing text, possible additions, and the finish path remain subject to the publication and runtime owners. A reminder can describe a local constraint; it cannot turn it into a global stop.

## 5. A candidate reminder is not one the model has seen

This is the easiest step to overlook.

A model request has limited capacity. The system may generate several reminders and then fit them alongside the task, tool results, and necessary state. If space is tight, some optional reminders may be omitted.

Continue the teaching example: the system generates “request capacity is tight” and “context is near its threshold,” but only the first fits in the final request.

The appropriate record is then:

| Reminder | Status this turn | Subsequent handling |
| --- | --- | --- |
| Request capacity is tight | Actually included in the request | Record the submitted watermark for that type |
| Context is near the threshold | Candidate generated but omitted | Do not record as delivered; reassess during a later naturally admitted request |

If both are marked delivered **when the candidates are generated**, the system will later believe the model saw the context reminder even though it never did. The mistake may not cause a program error, but it quietly corrupts recovery and deduplication.

We split the path into distinct steps:

1. Generate candidates from the original facts.
2. Combine and deduplicate them into concise guidance.
3. Fit them with the rest of the context.
4. Record only reminders actually submitted in the final request.
5. On later turns or recovery, decide whether to repeat using the type and its original basis.

“In the request” only means the system submitted the guidance. **It does not establish that the model understood, adopted, or correctly acted on it.** Assessing whether reminders improve behavior requires observing subsequent model actions and results; a submission record alone cannot establish that effect.

Likewise, if submission is uncertain, the system cannot assume a reminder was missed merely to resend it, or create an extra free request for that purpose. Reminders follow the original execution and recovery mechanisms rather than opening a route around the budget.

## 6. After compaction, measure the context that actually remains

Context reminders have a subtler timing issue.

Suppose the system finds a request too large and prepares to compact older history. The compaction candidate looks effective: the crowded material becomes shorter, and measured pressure appears to fall.

But a candidate is not necessarily adopted. A final check may find that it does not save enough space, or that the state has changed. The system then falls back to the larger original material.

If the reminder still reflects the **unadopted compaction candidate**, it may describe a request different from the one the model receives: the model sees the larger context, while the guidance was calculated against the smaller candidate.

Our approach measures context after the system has decided whether to adopt or fall back from compaction, using the required state in the final request, and then fits optional reminders again. The reminder describes the material about to be sent, not an intermediate candidate that was later discarded.

The measurement is the application's actual serialized bytes; it is not presented as an exact token count returned by the model provider. The measures can be related, but they are not the same. When reliable token usage is unavailable, the system does not invent it.

The lesson is more specific than “measure more accurately”: **does the guidance describe the request that will actually be sent, or an intermediate version that was abandoned?**

## 7. Reminders, Reviewers, and user notifications are separate

A long task may also raise the question of whether another model should review the work.

An action reminder can suggest that Main revisit the goal or examine evidence gaps. Coordination can also produce a Reviewer candidate from existing execution facts. Between that candidate and dispatch, however, the runtime still checks admission: whether automatic review is enabled, whether budget remains, whether another review is already running, and so on.

The distinction is:

- A **reminder** advises the current model.
- A **Reviewer candidate** indicates that known conditions make review worth considering.
- **Reviewer dispatch** is an actual execution subject to existing admission.
- A **user notification** belongs to user-facing delivery.

These may occur during the same research task, but they do not substitute for one another. “Consider a review” does not mean another model was called. Reviewer advice does not automatically make the answer correct, nor does it mean a user has been notified.

The separation also has a practical consequence: omitting a reminder from a model request should not automatically cancel an independent Reviewer candidate. Conversely, a submitted reminder is not a license to dispatch a Reviewer.

## 8. When this mechanism is useful

Action reminders suit tasks where **execution facts change and the model has reason to adapt its work accordingly**.

During long research, they can draw attention to delivery as resources diminish, encourage selective use of materials as context fills, and discourage unnecessary rewrites when revision capacity is limited.

The mechanism has a cost. The system must maintain reliable fact sources, distinguish state from advice, and preserve accurate enough records through fitting and recovery. For a simple question answered in one or two turns, this coordination may be unnecessary.

More importantly, reminders improve how the model receives information; they do not replace deterministic constraints. The existing owners must still enforce budget limits, tool permissions, revision admission, and execution state. Ignoring a reminder must not grant the model additional authority.

In ETF Agent, these responsibility boundaries and the reminder submission path have been verified under controlled conditions. Whether reminders consistently improve model judgment in real research still requires observation of actual model runs.

Return to the fund comparison. As capacity tightens, context grows, and revision room decreases, the system can turn those changes into concise guidance in the request the model actually receives. The model can use that information to choose how to continue, while the existing rules still govern resources, review, and delivery.

**A good action reminder helps the model understand its current situation without claiming authority to decide that situation itself.**

## Further reading

[Run Budget and Constraint Governance](./agent-runtime-constraint-governance-v2.md) explains budget and finalization responsibilities; [Main Context Compaction](./agent-main-run-context-compaction.md) discusses summary adoption and the boundaries of original facts. Visit and star the [ETF Agent Engineering Library](https://github.com/hpoenixf/eff-agent-article) to join the discussion.
