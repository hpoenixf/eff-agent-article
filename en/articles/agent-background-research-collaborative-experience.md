# Keep Chatting: Taking the Stop Button Out of the Way—Adding Async Background Research to an Agent in a Day

**A useful personal agent should not let a long-running research task monopolize the conversation.** Once users delegate a task, they should still be able to ask something else, check the research, and add new requirements without losing the original work—or sending a response or control action to the wrong task.

While building ETF Agent, we learned that **the hardest part is not running two model requests at once. It is preserving the relationship between each user intention and the execution that owns it.**

Here is the interaction we demonstrated:

- “Why did Nasdaq fall sharply?” starts a longer research task.
- “What is the relationship between gold and US Treasuries?” receives its own foreground answer without waiting for that research.
- “Please compare this with the sharp fall in A-shares” is handed to the original research rather than answered as an unrelated question.

![Foreground chat and background research proceed independently](../../visuals/en/agent-background-research-collaborative-experience/interaction-flow.png)

*Interaction illustration: independent questions get separate responses; explicit adjustments reach the original research. Spacing does not represent elapsed time.*

In the interface, the background-research entry remains visible, the gold-and-Treasuries answer appears in the main conversation, and the A-share addition receives a “Handed to the research model” receipt. Users do not need to terminate one job simply to continue chatting. **A real Stop control still exists—it belongs to the specific task, not the entire input box.**

The “one day” in the title refers to connecting this concurrent interaction **on top of an existing ETF Agent with a research loop, tools, durable history, recovery and answer publication**. It does not mean the entire research agent was built from scratch in a day.

## 1. Delegated Research Should Not Turn the Chat Box into a Progress Indicator

Earlier ETF Agent infrastructure could already keep research running after users left the page. But the frontend still organized input around a single global “generating” state. With background work active, new messages tended to be treated as corrections to that one Run.

This produced an odd product mismatch: **the server could work independently, but the user was still forced to wait around that work.**

We considered three apparent shortcuts. Preempting old answers when a new message arrived would disrupt important research just because the user had an incidental question. Queuing short questions still required waiting. A permanent foreground coordinator agent would introduce another long-lived context and lifecycle to reconcile with research, control and recovery.

We chose a narrower model: **one conversation can contain multiple executions with independent identities rather than one permanently busy foreground agent.**

Long research stays in the existing Research Run. Short questions receive their own execution identity. Streaming connections show progress; they do not own the decision to continue or stop a task. Closing a panel, switching conversations or losing a network connection does not cancel accepted research.

![English reconstruction of background research and a foreground answer](../../visuals/en/agent-background-research-collaborative-experience/foreground-conversation.png)

*The research entry remains visible while the main conversation displays a separate completed answer. This is an English reconstruction of the original screenshot, not a new model run.*

We did not add a new background-task ledger. We reused existing Run, control, recovery and Publication identities. The new work mainly established **which message belongs to which task, what the user intends to do now, and which view should receive an update**.

## 2. Is the Next Message a New Question or a Change to Existing Research?

This is the most easily overlooked—and most important—distinction.

“Nasdaq research is running” is a system fact. “How do gold and Treasuries relate?” is a new user question. The first must not automatically determine the meaning of the second.

The ordinary entry model still interprets natural-language intent. But **when the user explicitly selects a task, the system should not ask the model to guess that target again**:

| User action | Intended behavior |
| --- | --- |
| Ask a separate short question in the main chat | Answer independently; do not automatically inject its answer into background research |
| Add a requirement in the original research panel | Handoff directly to that task's correction path |
| Say “include the A-share decline as well” in normal conversation | Identify and target the relevant Run; ask when the reference is genuinely ambiguous |
| Click Stop on a particular research task | Address that task's control mechanism directly, without model interpretation |

The implementation has a Coord outcome for these coordinating operations. Coord is not a second permanent agent and does not own another research state.

Capacity also matters: accepting more user intentions **does not imply unlimited parallel execution**. The initial setup allowed three short interactions and one background research task. Short-interaction slots, a Run's research budget, and Provider capacity are distinct resources. When no background slot is available, an independent new research request must be declined explicitly—not silently converted into an addition to an old task.

The product lesson is straightforward: **do not use “the page is busy” as a substitute for interpreting the user's intent, or use one global loading state to describe several distinct tasks.**

## 3. “Adjustment Received” Is Not “Research Adopted the Adjustment”

When a user says “Please also compare the A-share decline,” the system saves the **original user message**, then connects its identity to the intended research.

Why not have the entry model rewrite it into a compact instruction? A paraphrase may drop dates, subjects and constraints. If a request is retried after its receipt is lost, it may also deliver the same change twice. We let the entry decide **which task is being changed**, while the material delivered to research comes from the persisted original message. A legitimate retry reads the prior receipt instead of creating another correction.

![English reconstruction of an adjustment and its handoff receipt](../../visuals/en/agent-background-research-collaborative-experience/research-adjustment.png)

*The original message and handoff receipt remain in the conversation; research keeps its own execution and history. This is a translated reconstruction, not a new run.*

Even then, the system should not claim that the model has understood and fulfilled the new request. There are three separate facts:

**The message was saved** means it was retained. **The next model request actually contained it** establishes that the handoff reached the researcher. **The final report satisfied it** is a further question about evidence and research quality.

That also explains why ordinary foreground conversation is not automatically part of ongoing research. Short interactions use the eligible history snapshot available at submission. Only an explicitly handed-off adjustment enters a later request for the original research. An answer that finishes later cannot retroactively change the context an earlier request actually saw.

## 4. Real Concurrency Is Not Several Spinners on the Same Screen

Once the input box is available again, another assumption breaks: **the order in which answers appear may differ from the order in which they were submitted or executed.**

If two short questions are submitted together and the second finishes first, the frontend cannot assume that “the latest assistant message” belongs to the latest Run. Questions, answers, tool progress and controls must retain their own execution associations.

We encountered a concrete handoff failure: the page created a temporary answer row, and a history read replaced it with the persisted message. Subsequent streaming updates still targeted the temporary row ID and could no longer find the answer. We repaired the connection **through the original Run and its current message**, while preserving the answer's own publication identity.

Similar ordering problems occur when a terminal notification arrives before the database view catches up, or an old history request returns after a more recent snapshot. Bounded read-only follow-up reads and frontend read-order protections keep a temporary gap from becoming an apparent failed task—and stop an older snapshot from overwriting newer content. Reading does not restart model research.

Admission itself exposed a different issue: an early concurrency observation rejected a short interaction despite available slots, because a brief database-lock contention was interpreted as unavailable admission. We allowed bounded serialization of the existing admission transaction, rather than covertly queuing a user task.

These defects point to the same architectural shift: **once a conversation can host several executions, message identity, result ownership and resource occupancy must not be inferred from screen order.**

## 5. One Cancelled Request Nearly Terminated the Entire Research

The most instructive Runtime failure occurred when the user corrected a task while a model request was in flight.

The correction mechanism needs the **current request** to yield at a safe point, so that the complete new requirement can enter a later model request. It does not need to terminate the whole research Run.

But in one real research execution, the correction was saved and the current request was cooperatively interrupted. An adapter flattened that **request-local preemption** into a generic cancellation. Runtime then entered a closeout-only phase and stopped gathering evidence despite remaining research resources. The result was partial, not the complete comparison the user wanted.

The mistake came from conflating different effects:

- **The user explicitly stops research:** the original Run ends and must not be restarted by a late correction.
- **A current request yields to a new instruction:** the Run retains its original permissions, budgets, completed effects and unknown usage, then continues researching if eligible.

We repaired the handoff of the actual preemption cause. Subsequent requests can now continue under the original research admission rules rather than being forced prematurely into finalization.

For Runtime engineers, the general lesson matters more than the error string: **the lifetime of one model request is not the lifetime of the user's research task.** A generic cancellation cannot make that broader decision on the task's behalf.

## 6. A Better Conversation Experience Is Not Proof of Better Financial Research

In the original Nasdaq demonstration, the gold-and-Treasuries explanation was readable independently and the A-share requirement reached the research. But the resulting report did not obtain the A-share market and fund-flow evidence needed for a same-day comparison. It delivered a qualified framework rather than a complete empirical comparison.

![English reconstruction of the report's missing-data statement](../../visuals/en/agent-background-research-collaborative-experience/evidence-boundary.png)

*This records a real limitation in the original demonstration: the adjustment was handed off, but the requested data comparison remained incomplete. The image is an English reconstruction, not fresh verification.*

A **separate financial-research qualification on October 26, 2026** then provided stronger interaction evidence. One background research task overlapped with three short questions, and all completed under their own identities. The original targeted correction reached subsequent research model inputs; the short answers did not leak into background inputs. The report and conversation history were read back in a real browser. The corresponding scoped engineering acceptance was completed and archived.

But completion did not certify the financial analysis. Manual review found that the model inferred one tracking constraint was “twice as strict” from two documents' wording without a sufficient comparable quantitative basis. A subsequent, separately accounted continuation reread first-party material, withdrew that inference and retained the correction alongside—not over—the original report.

The two experiences make three outcomes distinct: **the foreground remains usable; the original research continues under the right identity; the final research claims are actually supported.** Passing one does not establish the other two. These observations also do not certify long-term production reliability or comprehensive financial accuracy.

## 7. Copy the Task Relationships, Not Just the Background Panel

For a Chat product adding this experience, I would prioritize three decisions.

**Give long-running research its own lifetime.** Once accepted, the task is held by server-side state. A foreground connection is how the user watches it, not why it exists. Stop must have an explicit target.

**Route new messages according to their actual intent.** Independent questions stay independent; targeted corrections retain the original message and Run identity. Receipt, model adoption and final fulfillment are different facts. When capacity is exhausted, decline an ineligible new task instead of silently changing its target.

**Organize out-of-order content by execution identity.** Later questions may finish first, history may replace temporary rows, and termination may precede an updated read view. None should mix answers, drop content or trigger duplicate work.

None of this requires inventing another permanent foreground “super-agent.” It requires the original research, control, publication and history owners to refer to the same real tasks.

**A good personal agent is not one that keeps the input box occupied while it says “I'm thinking.” It is one that lets you delegate complex work, keep talking, change the assignment when appropriate, and return to the actual result that belongs to that task.**

That is what makes asynchronous background research a meaningful product experience—and the architecture worth building beneath it.

---

Further reading: [Asynchronous research timing and offline delivery](agent-asynchronous-research-time-bound-delivery.md) covers scheduled delivery and later retrieval; [Progressive answer coherence](agent-progressive-answer-coherence.md) examines how one answer can be revised coherently. This article focuses on **foreground conversation, background task identity and correction while research continues**.

<!-- agent-article-sync:guidance:start -->
## Further reading and discussion

Read the published [English article](https://hpoenixf.com/eff-agent-article/en/articles/agent-background-research-collaborative-experience) and [Chinese original](https://hpoenixf.com/eff-agent-article/articles/agent-background-research-collaborative-experience). For more engineering examples, see the [ETF Agent article collection](https://github.com/hpoenixf/eff-agent-article); GitHub Stars are welcome.
<!-- agent-article-sync:guidance:end -->
