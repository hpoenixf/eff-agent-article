---
description: "How does a follow-up become a legitimate new task? A practical guide to message idempotency, conversation history, clarification binding, and explicit Agent Run continuation."
articleMetadata:
  author:
    name: "hpoenixf"
    url: "https://hpoenixf.com/about"
readingBrief:
  takeaways:
    - "One Conversation may contain multiple Runs; reading an earlier answer does not grant permission to continue its task, and an ordinary follow-up normally starts an independent execution."
    - "Admission depends on durable message identity and original text: an identical retry reads the existing record, while a changed message or parent Run under the same ID is a conflict."
    - "Explicit Continue requires a verified parent Run, matching conversation scope, eligible terminal status, and recorded authorization; it creates a linked new Run rather than restarting its parent."
    - "Historical summaries, original requests, saved results, and current evidence are distinct; missing provenance must narrow reusable context instead of manufacturing continuity."
  appliesTo:
    - "Agent applications with persistent conversations and independent Runs that need follow-ups, clarification, retries, and explicit continuation."
    - "Engineers investigating mixed-up tasks, duplicate retries, unintended permission inheritance, or broken interrupted research."
  notFor:
    - "Stateless single-turn chatbots, or systems that expect history alone to safely replay external effects."
    - "Treating a public educational CLI as an implementation of the full Web-based cross-Run Continue mechanism described here."
---

# Keep Chatting Is Not Keep Executing: Agent Conversation Admission and Task Continuation

A user says, “What if we look at just the past year?” That sounds like a straightforward follow-up. For an Agent, however, three different questions arise: **Is it a new user message? Does it require a new execution? May it reuse the previous research's permissions and results?**

Mixing these up can seem harmless until a client retries after a timeout, a long research task is interrupted, or the user switches topics. Then the system may repeat work, inherit the wrong permissions, or hand the model a continuation that has lost the original research question.

This article draws on ETF Agent's A02 conversation admission and task continuation. The principle is **conversation continuity helps people keep talking; execution identity tells the system precisely which task is running. Only explicit, verified lineage can justify inheriting what is needed to continue an earlier Run.**

## 1. First, separate three easily confused objects

Consider this **illustrative teaching scenario**, not a production trace:

> First: Compare Fund A and Fund B over three years, including the time basis of their data.
>
> Second: What if we look at just one year?
>
> Third: The previous report stopped halfway. Continue that comparison.

All three messages appear in one chat, yet they do not necessarily belong to the same execution.

| Object | What it retains | What it does not imply |
| --- | --- | --- |
| **Conversation** | Visible messages, history, and associated Runs | Only one execution may exist in the conversation |
| **Message** | Submitted original text and a stable ID, such as `clientMessageId` | Every network submission creates a new Run |
| **Run** | One admitted execution, its authorization, budget, progress, and outcome | The next message automatically inherits that Run's rights |

A Conversation may contain several Runs. Neither message order nor reply order proves parent-child task lineage.

Two more concepts matter. A **history reference** lets a new question consume eligible earlier context; **task continuation** explicitly associates a new Run with a particular old one as the same research task. A historical answer may help the model resolve the pronoun “that,” but it does not itself authorize old private sources or replay a previous tool call.

This is why attaching every new message to the latest Run is unsafe: the last research may still be working in the background while the user asks an independent question.

Here is a task relationship diagram. **Solid lines show message ownership; the dashed line shows explicit, verified continuation.** This is not a database schema.

```mermaid
flowchart TD
    C["One Conversation"]
    C --> U1["Message 1: Compare three years"]
    C --> U2["Message 2: Use one year"]
    C --> U3["Message 3: Explicit Continue"]
    U1 --> R1["Run A"]
    U2 --> R2["Run B - independent execution"]
    U3 --> R3["Run C - new linked execution"]
    R1 -. "Continue after parent verification" .-> R3
```

*Figure 1. A continuous conversation does not imply one continuous execution. Run B can use permitted history without inheriting Run A; Run C needs verified parentage.*

## 2. Establish a new message's identity before interpreting its meaning

Suppose the browser submits a message but loses the HTTP response. If the server uses matching text alone to identify retries, it can create duplicate research. If every repeated sentence is deduplicated, an intentionally repeated question may disappear.

A safer design assigns a stable ID to the **submission intent**. Retrying keeps the same ID. The server verifies that ID against the previously admitted original text, conversation, and continuation binding.

| Admission condition | Required outcome |
| --- | --- |
| New ID; valid conversation and subject | Attempt durable admission of a message and a new Run |
| Same ID, same original text, same fixed relationship | Read the existing message and Run instead of creating another |
| Same ID, different text | Reject the conflict; do not overwrite the original |
| Same ID, different explicit parent Run | Reject the conflict; do not reattach the task |
| Unknown admission receipt | Reconcile using the **same** ID before attempting more work |

The last row is important. A database timeout does not mean a transaction definitely failed. Some outcomes mean “not admitted”; others mean “the caller cannot tell.” Only durable reconciliation can resolve the latter.

```mermaid
flowchart TD
    A["Receive ID and original message"] --> B{"Was this ID admitted?"}
    B -->|Yes| C{"Same text and continuation link?"}
    C -->|Yes| D["Read existing message and Run"]
    C -->|No| E["Reject identity conflict"]
    B -->|No| F["Attempt durable admission"]
    F --> G{"Is the commit outcome known?"}
    G -->|Yes| H["Return durable identity"]
    G -->|No| I["Keep original ID; reconcile persisted facts"]
```

*Figure 2. The message idempotency gate. Losing a network response is not proof that the persistent write failed.*

This is closely related to idempotent APIs in distributed systems. Amazon's Builders' Library, [*Making retries safe with idempotent APIs*](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/), discusses how the same request ID with different parameters must be recognized as a conflict. Agents have another dimension: the task relationship and corresponding context must also remain consistent.

## 3. An ordinary follow-up, a clarification, and explicit Continue take different routes

The model interprets the user's intended question. The Host verifies whether a requested relationship to a previous execution actually exists. A02 does not infer permission to inherit a Run by reading the semantics of a chat message.

This diagram begins **after message identity admission**. It shows task association, not final authorization for model or tool dispatch.

```mermaid
flowchart TD
    A["New message identity admitted"] --> B{"Valid pending clarification?"}
    B -->|Yes| C["Verify and bind clarification source"]
    B -->|No| D{"Explicit Continue selected?"}
    D -->|No| E["Create ordinary new Run"]
    D -->|Yes| F{"Verifiable parent Run and authorization?"}
    F -->|Yes| G["Create linked new Run"]
    F -->|No| H["Reject this continuation"]
    C --> I["Hand off to Runtime"]
    E --> I
    G --> I
```

*Figure 3. The Host chooses a verifiable task relationship; the Runtime still applies authorization, resource, and execution rules.*

### 3.1 Ordinary follow-up: use history without inheriting the task

“What if we look at just one year?” may use the authorized conversation history to identify the two previously discussed funds. It can still be a separate Run: the **current user's original text** becomes the new goal, and current Host constraints govern that execution.

The older design risk was equating “uses history” with “continues the old task.” An October 2026 change separated the two. Ordinary chat may access approved history without asserting `continuationOfRunId`. A `parentRunId` recorded to identify a context source is not a permission-inheritance switch or proof that the tasks are the same.

In financial research, this distinction is crucial. The model may learn that the last report covered three years, but the report's data version, permissions, and validity period cannot become current simply because the user's wording is conversational.

### 3.2 Clarification: reply to a question that was actually registered

Suppose the last Run asks, “Compare cumulative or annualized returns?” and durably records a pending clarification. The user's answer, “Annualized,” can be associated with that **verified pending record**.

The system must first know that an actual question is outstanding and who owns it. A sentence that sounds like a clarification is not enough to create that fact.

If the pending state cannot be read or verified, no confirmed choice may be invented. A permitted fallback must obey the real admission contract, not turn ordinary chat text into a business approval.

### 3.3 Explicit Continue: derive a new Run from earlier research

A product may expose an explicit **Continue** action for an interrupted comparison. It must identify the exact parent Run. In the fuller system, `continuationOfRunId` expresses this declaration; a historical `parentRunId`, the latest message, or an inferred wish to “keep going” is insufficient.

Even a supplied parent ID must be verified: the same Conversation and scope, an eligible durable terminal state, recorded Main execution, and the originally granted source and tool limits. Completed and partial results have applicable conditions; narrowly specified transport disconnections and lost execution ownership can also qualify. Generic failures, user cancellation, and arbitrary still-running tasks do not qualify simply because someone presses Continue.

**Continue creates a linked new Run; it does not reopen the parent's phases, budget, or tool receipts.** Inherited rights and restrictions are reconciled against authoritative stored records and current admission limits. Consent that must be requested again cannot be silently copied.

## 4. Which earlier materials may the new Run take along?

Once the relationship is valid, the model needs useful context. That does not justify dumping the entire chat database into its input.

| Historical material | How a new Run may use it |
| --- | --- |
| Original user request | Carry forward the original goal only after identity and content-hash checks |
| Published previous answer | Use visible, capacity-bounded historical conclusions and qualifications |
| Historical summaries and open questions | Use as provenance-bound working hints, not verified current facts |
| Saved calculations and source material | Read via result and source validation, with bounded scope and historical labeling |

History compaction may omit earlier replies; a working summary may lose essential detail. A02 should not repair those gaps by making up a coherent narrative. It maintains the task relationship, while context projection decides what evidence may enter the next request. The research model then adapts its answer to what it has.

The engineering history supplies a concrete counterexample. After eligibility for a narrowly interrupted Run was expanded, a focused test found that the new Run reached Main **without receiving the original question**. More prompt instructions would not restore missing task identity. The later correction checked the parent's original text hash, authorization, and context binding before allowing the original request into the new execution. These were controlled code and scripted-Gateway observations, not a production incident rate.

A second counterexample involves conflicting parent projections: a research record may show a partial result while the Conversation projection lacks the matching interruption reason. The admission path cannot just trust whichever one allows progress. A focused regression expects refusal with no extra execution. It does not assume that normal producers emit those deliberately inconsistent synthetic states.

## 5. One example, end to end

The following JSON is **illustrative, not the real HTTP contract or database schema**:

```json
{
  "conversationId": "conv-8",
  "clientMessageId": "msg-103",
  "content": "Continue the interrupted fund comparison using its original time basis",
  "continuationOfRunId": "run-102"
}
```

The Host first reads `run-102` within the authorized conversation. The durable status and interruption reason, original user request, Main activity, and permissions must make it an eligible parent. If admission succeeds, `msg-103` is associated with a **new** `run-103` that records the direct parent link. Verified original-task text and bounded historical materials can then be assembled into the new model request. Its new operations still obey the applicable Run-level constraints.

Change one condition and the outcome changes:

- **Retry `msg-103` with identical text and parent:** return the existing identity, not another `run-103`.
- **Retry `msg-103` but change its parent to `run-099`:** reject conflicting identity rather than reassigning research.
- **Use a parent the user explicitly cancelled or one from another conversation:** an explicit Continue request cannot bypass eligibility; the old answer remains under its existing visibility rules.
- **Use an eligible parent whose saved results lack valid source versions:** the task link and material eligibility are separate questions. Missing historical data must not be presented as current market evidence.

**A successful continuation proves a task relationship, not the accuracy of a financial conclusion.** Fund NAV, comparison windows, benchmark definitions, and their effective dates still require independent research checks.

## 6. "Resume" hides two fundamentally different operations

There are at least two meanings of “continuing” an Agent task.

**Same-Run Recover / Resume:** Following a process exit or ownership change, the system uses the **same Run** and its original checkpoint, lease, dispatched calls, and persisted receipts. It settles only safely executable work; it never assumes that an external call with an unknown outcome did not occur.

**Cross-Run Continue:** A user explicitly chooses to continue earlier research. The system verifies the parent identity and eligibility, then creates a **new linked Run**. It may use eligible historical materials, but does not restart the parent's executor or replay completed tools.

```mermaid
flowchart TD
    A["Existing Run A"] --> B{"Which kind of continuation?"}
    B -->|Recover / Resume| C["Still Run A"]
    B -->|Continue| D["Create new Run B"]
    C --> E["Check old checkpoint and receipts"]
    D --> F["Verify parent, original text, grant, and sources"]
    E --> G["Proceed only with safely executable remaining work"]
    F --> H["Handle new request without replaying old effects"]
```

*Figure 4. Recover preserves one execution's identity. Continue establishes a new execution with an explicitly verified parent link. Neither may pretend an unknown external effect never happened.*

These paths cannot safely share an ambiguous `resumePrevious()` interface. One is governed by the execution-recovery contract, the other by message identity, task lineage, and new-Run admission.

## 7. What can readers reproduce in public code?

The [Open ETF Agent public repository](https://github.com/hpoenixf/open-etf-agent) contains a durable Session example. Using its fixed public commit [`34124cef`](https://github.com/hpoenixf/open-etf-agent/tree/34124cefc6df289e08518173789210b45a716451) and [Session implementation](https://github.com/hpoenixf/open-etf-agent/blob/34124cefc6df289e08518173789210b45a716451/src/session.mjs), install Node.js 26.8.1–26.x and run:

```bash
git clone https://github.com/hpoenixf/open-etf-agent.git
cd open-etf-agent
npm ci --ignore-scripts --no-audit --no-fund
npm run build
npm run session -- start --session runs/a02-boundary-demo --case durable-report
```

Copy the actual Run ID from the output:

```bash
npm run session -- inspect --session runs/a02-boundary-demo --run RUN_ID
npm run session -- resume --session runs/a02-boundary-demo --run RUN_ID
```

This demonstrates **the persisted state and Resume of one Run**, not the full A02 multi-turn HTTP Conversation / Continue experience. The public educational project uses local SQLite and an offline scripted Gateway. It lets readers examine fundamental identity and execution contracts without claiming that the richer private system's Web-based admission and cross-Run continuation are shipped in that CLI. The moving public entry point is [main](https://github.com/hpoenixf/open-etf-agent/tree/main), with further details in the [module guide](https://github.com/hpoenixf/open-etf-agent/blob/main/docs/module-guide.zh-CN.md).

## 8. A02 does not decide what the model should do

It is tempting to blend chat history, task identity, recovery, and permission inheritance in the name of a smooth experience. But a complex Agent needs **natural-language continuity and execution-fact continuity to cooperate without impersonating one another**.

A02 should answer narrow, verifiable questions: Has this original message already been admitted? Which trusted conversation owns it? What task relationship can be established? Which conflict must be refused?

It does not decide whether research is semantically sufficient, issue tool grants, replay earlier side effects, or erase a legitimate published answer when historical material becomes unavailable. Research judgment belongs to the model; permissions and budgets to their original Host owners; execution termination, context fitting, and publication to their respective owners.

For the next multi-turn Agent review, ask: **Can retry after a lost response create another Run? Can an ordinary follow-up inherit an unrelated task? Can explicit Continue prove the parent's original text, authorization, and interruption reason?** If not, repair identity and handoff contracts before introducing a more elaborate Planner.
