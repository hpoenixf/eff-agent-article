---
title: "How Agent Development Differs from Backend Development: From One Request to a Long-Term Personal Assistant"
description: Use Open ETF Agent v0.19, Claude Agent SDK, Codex, and LangGraph to examine how model-driven decisions change tools, state, recovery, and delivery, then explore the tradeoffs behind persistent execution, personalization, and personal assistants.
readingBrief:
  takeaways:
    - "An Agent adds a model that chooses the next step from context; trusted code must still enforce business rules, permissions, and control over external effects."
    - "Recovery must preserve the original task, evidence, and effects. An operation that was dispatched but has an unknown outcome cannot be treated as failed and repeated merely because it timed out."
    - "A long-term personal assistant should combine a persistent goal with multiple bounded executions. It can release compute while waiting and reconstruct the currently valid task conditions whenever it wakes."
    - "Personalization needs correction, invalidation, and forgetting. Preferences inform decisions, while explicit authorization determines permitted actions; they should not be merged into one free-form profile."
    - "Greater proactivity should be measured by useful progress, successful delivery, and fewer unnecessary interruptions. Pausing or remaining quiet can be the right behavior when there is no new value."
  appliesTo:
    - "Developers with a backend or full-stack background who want to understand the engineering differences between Agent applications and conventional business systems."
    - "Teams designing research assistants, long-running tasks, or personal agents who need to decide which mechanisms to build first and which to defer."
  notFor:
    - "Treating a teaching project as a deployed personal assistant, live fund-research service, or trading system, or looking for a framework performance ranking."
---

<script setup>
import { withBase } from 'vitepress'
</script>

# How Agent Development Differs from Backend Development: From One Request to a Long-Term Personal Assistant

If you have built backend applications, an Agent can look familiar at first: receive a request, retrieve information, call APIs, save a result, and return it to the user. Put a model in the middle, and it seems like a business system with a natural-language interface.

The real change appears during execution: **the developer no longer has to prescribe every next step; the model may choose one in response to material it has just seen.** Context, tool descriptions, historical summaries, and user preferences can all influence that choice.

Agent engineering therefore builds on established backend engineering while introducing a decision step with semantic uncertainty. Developers need to support exploration while giving every action a defined scope, every interruption an explanation, and every deliverable a reliable way to reach the user. A personal assistant must preserve those constraints across time and changes in the user's circumstances.

We will follow a teaching task: compare two fund disclosures and produce a report, then extend the request to “keep watching these for me, and tell me when something important changes.” The first half examines observable engineering mechanisms. The second explores the design of a long-term personal assistant. The synthetic example does not establish live investment-research or automated-trading capabilities.

The public implementation baseline is **Open ETF Agent v0.19.0, verified on November 3, 2026**. References to other systems use official documentation consulted on the same date. Open ETF Agent is a local teaching project whose mechanisms can be inspected; Claude Agent SDK, Codex, OpenAI Agents SDK, and LangGraph provide different levels of runtime capability. They serve as points of comparison here, rather than a product ranking. [Release and source entry point](https://github.com/hpoenixf/open-etf-agent/releases/tag/v0.19.0)

## 1. Start with One Task to See How Control Changes

Suppose a user asks: “Compare these two fund documents, explain what changed, include sources, and save a report.”

When the rules are clear, a backend program can do this perfectly well: read the specified files, validate dates and fields, perform fixed calculations, and populate a report template. Missing fields produce an error; cases requiring human judgment enter an approval workflow. This approach is straightforward to test and reproduce.

An open-ended task may reveal its real problem only after the documents have been read. The reporting dates may differ, a table may disclose only some items, or the two documents may use different denominators for “growth.” The system must decide whether to read more of the original text, find a comparable basis, choose another analytical method, or present a qualified conclusion.

This is where a model can help: it can propose new research actions based on what it observes. It can also misunderstand the gap, choose the wrong tool, or produce a fluent conclusion without enough evidence.

| Engineering question | A rule-driven business workflow | Additional responsibility when a model makes decisions |
| --- | --- | --- |
| How is the next step chosen? | Code, rules, and workflows define the branches | Validate actions proposed during execution and observe whether they advance the task |
| How does input affect behavior? | Fields and business state enter explicit logic | Natural-language material, summaries, and tool results also influence decisions |
| What state must be saved? | Business objects, transactions, and workflow progress | Also retain the actual model input, original proposals, original results, and uncertain effects |
| What happens when a call fails? | Retry, compensate, or escalate according to the API's semantics | First distinguish not dispatched, completed, and outcome unknown, then decide whether to continue |
| What counts as completion? | Explicit business conditions are satisfied | Check execution facts, answer quality, and the deliverable the user can actually obtain |
| How are costs controlled? | Requests, resources, queues, and quotas | Also bound the cumulative work of searching, summarizing, subtasks, and review |

These are not mutually exclusive approaches. Workflow engines already support dynamic branches, asynchronous work, and long-running tasks. An Agent can also sit inside a fixed workflow. The change is that **some control decisions come from a model, and the conditions shaping those decisions change throughout execution.**

<figure>
  <picture>
    <source media="(max-width: 640px)" :srcset="withBase('/diagrams/agent-vs-backend/decision-loop-en-mobile.svg')" />
    <img style="max-height: none !important; height: auto;" :src="withBase('/diagrams/agent-vs-backend/decision-loop-en.svg')" alt="A rule-driven workflow compared with an Agent observation loop: the model proposes actions, the host validates and executes them, and results return to the model, with separate paths for rejection and delivery" />
  </picture>
  <figcaption>Figure 1 · The model can explore possible decisions while the system controls the conditions for execution. These groups describe responsibilities; they do not require separate services. <a class="diagram-original" :href="withBase('/diagrams/agent-vs-backend/decision-loop-en.svg')" target="_blank" rel="noopener noreferrer">View the full diagram</a></figcaption>
</figure>

## 2. A Minimal Agent Is an Observation Loop; the Hard Parts Surround Its Handoffs

A model request may return an answer or propose tool calls. The runtime receives the proposal, validates it, invokes the tools, and includes the actual results in the next model input. Each new observation can change the next choice, until the task delivers a result, waits, or stops.

Claude Agent SDK exposes the loop, tools, and context management used by Claude Code. The OpenAI Agents SDK runner likewise continues through tool calls, handoffs, and final output. Today, you may not need to build the loop from scratch, but you still need to understand which responsibilities it leaves to the application. [Claude SDK](https://code.claude.com/docs/en/agent-sdk/overview) · [OpenAI runner](https://developers.openai.com/api/docs/guides/agents/running-agents)

In Open ETF Agent, for example, the model may propose reading a page, performing a calculation, or saving a report. The tool host checks the allowed tools, document scope, and arguments, while the runtime records actual dispatch and results. A model saying “the report has been saved” and a host retaining a file receipt that supports readback are two different kinds of evidence. [Public runtime and tool implementation](https://github.com/hpoenixf/open-etf-agent/tree/fbefc074f161ae8de5b93060beae5b542de31038/src)

### A tool interface also teaches the model how to act

The caller of a conventional API is usually programmed against an established contract. A model also infers a tool's purpose from its name, parameter descriptions, and return format. A universal tool called `query` may leave the model to guess resource boundaries, pagination, time conventions, and failure semantics.

A better tool interface makes important distinctions visible. “Read one page of an authorized document,” for example, is easier to constrain than “read any path.” Returning the document version, page number, and completeness information also supports later checks better than returning an unexplained string.

Open ETF Agent's `read_result` reads back an original result already obtained, rather than silently fetching the latest content at the same location. Source-bound calculations retain their input references, and a CSV can consume that same calculation result. This makes it possible to reconcile the numbers in the report, the numbers in the attachment, and the evidence actually read at the time. [Tool contract](https://github.com/hpoenixf/open-etf-agent/blob/fbefc074f161ae8de5b93060beae5b542de31038/src/tools.mjs)

### Skills, MCP, and permissions answer different questions

A Skill can package a reusable method: what to check first, how to compare results, how to handle gaps, and which templates or resources to use. MCP provides a protocol for connecting external tools and data. Both can improve how an Agent works, but neither by itself establishes that the current user has authorized a particular action.

We should also avoid presenting one project's rules as universal across platforms. In Open ETF Agent, a Skill does not expand the original grant. Claude SDK allows the host to pre-approve tools through trusted project or personal Skill `allowed-tools` configuration, subject to organizational settings. Authority comes from trusted configuration and policy accepted by the host; an instruction embedded in external source material cannot claim the same status. [Claude Skill mechanism](https://code.claude.com/docs/en/agent-sdk/skills)

Codex expresses another useful distinction clearly: the sandbox limits the files, network, and other resources execution can reach, while the approval policy determines when further approval is required. Approval and execution isolation serve different purposes. A more capable model cannot replace either one. [Codex execution boundaries](https://learn.chatgpt.com/docs/agent-approvals-security)

## 3. Manage Both What Happened and What the Model Can See Now

Backend engineers are used to treating the database as the source of truth. An Agent also has a limited working view: the context actually supplied to this model request.

A document being in the database does not mean the model has seen it. A passage appearing in one request does not mean it remains visible in every later request. A summary saying “already verified” cannot substitute for the original verification result.

To understand the distinction, separate four kinds of information without immediately creating four separate services:

| Information | Its role in the task | What it cannot replace |
| --- | --- | --- |
| Original evidence | The documents, pages, versions, and calculation inputs read at the time | A model-generated synthesis cannot become the original source |
| Execution facts | Proposals, dispatches, receipts, remaining allowances, and terminal status | A conversation summary cannot determine whether an operation actually occurred |
| Current context | The goal, material, progress, and unresolved questions needed for this model request | Its capacity is limited; it cannot be the only copy of the full history |
| Cross-task memory | Preferences, facts, and experience that may remain useful later | It cannot replace current instructions or authorization for an operation |

Context engineering becomes concrete once these are separated. Select information that is useful for the current decision, still valid, and traceable to a source. Preserve the ability to reread the original when needed, while omitting material that is not currently useful.

This also explains why a larger context window is only part of the answer. More capacity can retain more material, but it does not resolve conflicting content, expired preferences, misleading tool output, or repeated research automatically. Choosing what enters the next request is itself part of application behavior.

LangGraph separates thread-scoped checkpoints from cross-thread stores. Claude SDK also distinguishes conversation history from filesystem state: resuming or forking a conversation does not automatically copy or roll back files. Implementations differ, but the lesson is shared: **restoring a conversation, restoring an execution position, and restoring external work products are distinct forms of recovery.** [LangGraph persistence](https://docs.langchain.com/oss/python/langgraph/persistence) · [Claude sessions](https://code.claude.com/docs/en/agent-sdk/sessions)

## 4. Longer Tasks Make “We Do Not Yet Know What Happened” More Important

Consider a familiar backend problem. An authorized operation has been sent to an external system. The other side may have completed it, but a network failure prevents the local process from receiving a receipt.

For a query, reading again may be acceptable, although the new result may describe a different point in time. For sending an email, creating an order, or changing a calendar, repeating the operation may create a second effect. Asking the model to think again cannot fill this information gap.

Dispatch is the crucial boundary. If an action was definitively rejected before dispatch, it may be possible to correct the arguments or retry when conditions allow. If dispatch produced a reliable result, continue from that result. If the result is uncertain after dispatch, retain that uncertainty instead of interpreting a local timeout as remote failure.

<figure>
  <picture>
    <source media="(max-width: 640px)" :srcset="withBase('/diagrams/agent-vs-backend/unknown-outcome-en-mobile.svg')" />
    <img style="max-height: none !important; height: auto;" :src="withBase('/diagrams/agent-vs-backend/unknown-outcome-en.svg')" alt="Dispatch separates an unexecuted operation from one with a receipt or an unknown outcome: reconcile an unknown operation before repeating it, and do not release remote capacity solely because of a local timeout" />
  </picture>
  <figcaption>Figure 2 · An unknown outcome is a real state that needs handling. The local process stopping does not establish that the external action stopped. <a class="diagram-original" :href="withBase('/diagrams/agent-vs-backend/unknown-outcome-en.svg')" target="_blank" rel="noopener noreferrer">View the full diagram</a></figcaption>
</figure>

Since its durable-recovery design, Open ETF Agent has recorded the original Run's proposals, tool dispatch, result commitment, and result consumption separately. If a complete proposal was saved, recovery can continue consuming that proposal. If a tool was dispatched and its outcome is unknown, re-executing it would not establish recovery of the original operation. Only adapters that explicitly support reconciliation can check whether that operation completed. Restarting does not refresh the original authorization, budget, or deadline. [Recovery design](https://github.com/hpoenixf/open-etf-agent/blob/fbefc074f161ae8de5b93060beae5b542de31038/openspec/changes/v07-trusted-recovery/design.md) · [Runtime recovery branches](https://github.com/hpoenixf/open-etf-agent/blob/fbefc074f161ae8de5b93060beae5b542de31038/src/runtime.mjs)

This is not a general guarantee of exactly-once external execution. Database state and an external action usually do not share a transaction. Business idempotency keys, result queries, or an explicit human reconciliation path may still be required. LangGraph's documentation makes the same concern concrete: resuming a node containing `interrupt()` can rerun code. Even when a side effect is placed after approval, a failure after the external write succeeds but before the node finishes can still cause a duplicate write. [LangGraph interrupts and side effects](https://docs.langchain.com/oss/python/langgraph/interrupts)

For Agents, the appeal of autonomous retries can obscure this problem. Sometimes a good runtime should prevent the model from taking further action: the original operation needs reconciliation before another attempt becomes meaningful.

## 5. A Real Lesson from v0.19: Supporting Model Work Can Also Fail to Converge

When context grows, a common approach is to use another model call to summarize it so the main task can continue. Summarization may sound like a purely internal optimization.

Open ETF Agent v0.19's live verification record preserves a counterexample. A report had already been saved, but the main Agent had not finished, and the system repeatedly generated managed summaries. When a later summary reached the local role allowance, the request had already entered Admission's dispatch record. An ordinary exception did not establish that nothing had happened remotely, so the unknown outcome still had to be retained. [Retained failure and design changes](https://github.com/hpoenixf/open-etf-agent/blob/fbefc074f161ae8de5b93060beae5b542de31038/openspec/changes/v019-module-composition/design.md)

The problem was not simply an allowance that was too small. If summaries keep processing the same material, raising the allowance only lets repetition continue longer. The fix needed to answer two more specific questions: which original content does this summary cover, and has any evidence worth processing again arrived since the last summary?

The current implementation retains and validates the summary's coverage, original-content identity, and source and Memory dependencies. When no new evidence arrives, it can reuse a working projection that remains valid. The summary-attempt count belongs to the original Run, and the limit is checked before reserving another model call. At the limit, the runtime attempts to reuse an existing valid projection or fall back to bounded context. Groups containing unknown outcomes or side effects are not freely compacted away. [Composition contract and summary behavior](https://github.com/hpoenixf/open-etf-agent/blob/fbefc074f161ae8de5b93060beae5b542de31038/docs/composition.zh-CN.md)

The lesson extends to retrieval, review, and subagents: **work that supports the main task must share that task's accountability and resource limits.** Limiting the main conversation while allowing unlimited summarization or expert calls can still produce work that never converges.

Open ETF Agent's root budget currently controls model and tool call allowances. It is not a complete token or monetary ledger. Production applications should also account for actual provider usage, time, and charges. Setting a call limit does not by itself establish precise cost control.

## 6. Completion Has Three Layers, and Agent Testing Needs All Three

The report task raises at least three different questions: did execution end correctly, are the conclusions defensible, and did the user receive a readable deliverable?

A successful file-read tool only establishes that the file was read. Successfully saving a report establishes that certain bytes were saved. Even a report citing real pages does not automatically establish that every sentence is supported by those pages. Open ETF Agent retains `semanticStatus: unreviewed` in its result to separate execution completion from semantic review. [Results and readback](https://github.com/hpoenixf/open-etf-agent/blob/fbefc074f161ae8de5b93060beae5b542de31038/README.zh-CN.md)

Conventional testing still has a clear role. Permissions, arguments, calculations, transactions, recovery, and artifact integrity need deterministic assertions. The additional questions introduced by a model need task samples: did it find the right evidence, notice that two figures were not comparable, explain uncertainty, and stop appropriately when evidence was insufficient?

Then return to the user experience. Can the report be opened? Do its attachments agree with the body? If execution fails midway, can the user still read intermediate work that was already saved? A screen saying “completed” while the file cannot be downloaded has not completed delivery.

For research tasks, evaluation should not mechanically require one exact tool sequence. Under the same permissions and business constraints, a model may take different paths to the same evidence. Conversely, an impressive trace with many tool calls may fail to answer the original question. Observe goal completion, evidence quality, execution reliability, and cost together rather than optimizing whichever is easiest to count.

## 7. The Shared Lesson from Mainstream Agents: Reuse Runtime Capabilities, Retain Business Responsibility

Framework comparisons become more useful after these mechanisms are understood. The question can shift from “Which has more features?” to “Who owns this responsibility?”

| System | The engineering choice it illustrates here | Questions the application still needs to answer |
| --- | --- | --- |
| Open ETF Agent v0.19 | Inspectable original results, Run state, and bounded combinations demonstrate research execution | Which combinations are actually supported, which remain future designs, and whether the report has business value |
| Claude Agent SDK | Reuse Claude Code's loop, tools, sessions, permissions, and subagents | How to host the process, bind business identities, connect domain tools, and evaluate the result |
| Codex | Execute work in a real workspace while separating execution boundaries from approval policy | Which changes satisfy the request, which checks justify delivery, and when publishing is permitted |
| OpenAI Agents SDK | Organize models, tools, handoffs, and final output inside an application | How to persist application state, constrain external actions, and manage the task lifecycle |
| LangGraph | Combine deterministic nodes and model decisions through graph state, checkpoints, and interrupts | Which nodes can safely repeat, how external side effects are deduplicated, and how business state evolves |

The specific capabilities in the table come from the official documentation and pinned public code linked earlier. The final column contains engineering questions derived from them; it does not imply that the frameworks deliberately exclude those concerns.

Subagents deserve the same treatment. A subagent can investigate an independent question with a smaller context and specialized methods or tools, then return its findings to the main task. Claude SDK explicitly provides this context separation. Open ETF Agent implements a bounded, single-level source-checking subtask that retains the parent's authorization boundary and shares the root budget. [Claude subagents](https://code.claude.com/docs/en/agent-sdk/subagents) · [Public Child implementation](https://github.com/hpoenixf/open-etf-agent/blob/fbefc074f161ae8de5b93060beae5b542de31038/src/child.mjs)

Ordinary concurrent functions may be sufficient to read two files in parallel. An additional Agent becomes more compelling when a subproblem needs independent investigation, specialized methods, or substantial context isolation. Each extra model role also adds handoffs, cost, and disagreements to resolve. The main task must still assess whether the returned opinion is grounded and whether the final report actually uses it.

## 8. A Personal Assistant Begins with “Keep Doing This for Me”

Now extend the original request:

> “Every Friday, check whether these two documents have been updated. Focus on changes that would alter the previous assessment, keep the report short, and retain sources. If nothing important has changed, there is no need to interrupt me.”

The earlier task ended with a report. This request establishes an ongoing delegation: the system must retain the goal, return to work at the right time, understand the user's presentation preferences, and decide whether a notification is worthwhile.

Here, a **personal agent** means an assistant that maintains continuity around one person's goals and constraints across interactions, tasks, and time. A bot that saves chat history or a scheduler that runs a fixed script every day covers only part of that role.

A personal Agent needs at least three kinds of continuity. **Execution continuity** preserves what happened. **Continuity of understanding** lets it use personal information that is still valid. **Continuity of delegation** establishes what it remains authorized to do in the future. These are three perspectives on responsibility, not a requirement to create three separate modules.

When accepting an ongoing delegation, natural language should become an agreement the user can inspect and change. The following teaching example represents a record saved by an application after the relevant scope has been confirmed. It is not an existing Open ETF Agent API, and a model producing these fields would not grant authority:

```json
{
  "goal": "Continue comparing changes in the two selected sources",
  "schedule": { "timezone": "Asia/Shanghai", "rule": "Every Friday at 09:00" },
  "allowedActions": ["read_selected_sources", "save_report"],
  "delivery": {
    "channel": "in_app",
    "notifyWhen": "New evidence is substantial enough to affect the existing assessment"
  },
  "preferenceRef": { "id": "research-style", "revision": 3 },
  "status": "active"
}
```

“Keep the report short” affects presentation. “Only these two documents” limits sources. “Every Friday” defines a trigger. Permission to save defines an action scope. Notifications use the in-app delivery method confirmed by the user; a notification condition does not give the model access to arbitrary messaging channels. Deciding which changes merit a notification also needs criteria the user can understand and adjust. Putting all of this into an ever-growing system prompt makes it difficult both to change the agreement and to explain what justified a particular action.

### A goal can persist while each execution remains bounded

A long-term goal may produce many executions, each containing multiple model requests. Their lifetimes differ: the goal may last for months, an execution may take a few minutes or include a period of waiting, and each model request handles a finite current context.

<figure>
  <picture>
    <source media="(max-width: 640px)" :srcset="withBase('/diagrams/agent-vs-backend/durable-work-en-mobile.svg')" />
    <img style="max-height: none !important; height: auto;" :src="withBase('/diagrams/agent-vs-backend/durable-work-en.svg')" alt="Three timescales for a persistent goal, an individual Run, and model requests: authorized events wake bounded executions, waiting can release compute, and deliverables remain independently available" />
  </picture>
  <figcaption>Figure 3 · A goal can persist while computation happens intermittently. This is a general design perspective, not a claim that v0.19 already provides a complete long-term-goal product. <a class="diagram-original" :href="withBase('/diagrams/agent-vs-backend/durable-work-en.svg')" target="_blank" rel="noopener noreferrer">View the full diagram</a></figcaption>
</figure>

There is usually no need to keep the model thinking while waiting for a new disclosure, a user response, or the time window for the next authorized execution. The system can save state, release execution resources, and wait for an authorized event to wake it. Persistence should retain responsibility, original facts, and the conditions under which work can continue.

Resuming an unfinished execution and starting a new round of research must also remain distinct. If the original task has not expired and its recovery conditions are satisfied, a restarted process can continue that execution. Receiving new material next week will often call for a linked new execution with new evidence versions and its own budget. Extending one Run indefinitely must not make an old authorization or deadline valid forever.

Open ETF Agent's Worker drives the original Run. Its ordinary-response mechanism can save a pending question and exit the driver. Schedule supports an explicit wake after confirmation and then delegates execution to the original Worker. These are concrete building blocks, but v0.19 has no resident background scheduling service, and **Response and Schedule do not yet have a joint waiting protocol that supports arbitrary composition**. [Supported composition boundaries](https://github.com/hpoenixf/open-etf-agent/blob/fbefc074f161ae8de5b93060beae5b542de31038/docs/composition.zh-CN.md)

That gap matters. Supporting “execute at the scheduled time” and supporting “wait for your answer” does not automatically create the full lifecycle of “start on schedule, wait when a question arises, continue after a reply, and allow cancellation throughout.” Composition must also handle duplicate events, expired replies, revocation, and the order in which recovery occurs.

User-facing products already expose related capabilities. ChatGPT Tasks supports one-time or recurring work and supported event triggers, along with task management and pausing. Connecting an application does not by itself create a trigger. This illustrates why ongoing delegation needs explicit triggers and a management interface rather than relying on a model to remember “from now on.” [Official Tasks documentation](https://help.openai.com/en/articles/10291617-scheduled-tasks-in-chatgpt)

## 9. Personalization Is Tested When the User Changes Their Mind

“Remember that I like short answers” is the easiest part of personalization to demonstrate. A long-term assistant will more often encounter change: the user moves to another project, cancels a plan, or simply wants a full derivation this time.

The system should distinguish stable preferences, temporary circumstances, current requirements, and execution authority. Preferences can supply defaults, while explicit current requirements can override them. Temporary circumstances need a scope and an expiry condition. Authorization must come through a trusted channel rather than being inferred from a profile.

For example, “I usually read only the summary” does not mean the user never wants detail. Having once followed a topic does not justify tracking it forever. A preference for trying new things does not authorize an assistant to buy services or send messages on the user's behalf.

### Memory needs sources, scope, and a way to correct it

Personal information may come from an explicit user statement, a single observed action, or a model's inference. These sources carry different levels of confidence. One click should not immediately become a long-term preference, and an inference should not turn into “the user said this” through repeated retelling.

A useful design direction is to make important memories answer four questions: where did this come from, in which situations does it apply, when was it updated, and is it still valid? Users should be able to inspect and correct it, and a task should be able to bypass it temporarily. Not everything discussed belongs in long-term memory.

ChatGPT's official Memory documentation already describes reviewing, correcting, and deleting relevant memories. It also distinguishes memories from their source conversations: deleting a chat does not necessarily delete a separately saved memory. This is evidence of a real product-management need; the specific available controls still vary by account and settings. [Official Memory documentation](https://help.openai.com/en/articles/8590148-memory-in-chatgpt)

### Forgetting involves later use, not only deleting a database row

Suppose the user saved a preference for short reports in a particular project, then explicitly corrected that project's preference to require full derivations. Even after the memory store is corrected, the old preference may remain in historical tool results or a summary of “user habits,” then enter the next model request again.

Open ETF Agent makes a useful distinction through typed Memory identities and versions. When constructing later model input, it filters invalid content and invalidates working notes that depend on an old memory version. It checks not only what the current retrieval returned, but also whether old material re-enters working context through other known dependency paths. [Memory projection implementation](https://github.com/hpoenixf/open-etf-agent/blob/fbefc074f161ae8de5b93060beae5b542de31038/src/memory-projection.mjs) · [Actual-input verification](https://github.com/hpoenixf/open-etf-agent/blob/fbefc074f161ae8de5b93060beae5b542de31038/test/memory-consumer.test.mjs)

<figure>
  <picture>
    <source media="(max-width: 640px)" :srcset="withBase('/diagrams/agent-vs-backend/personalization-en-mobile.svg')" />
    <img style="max-height: none !important; height: auto;" :src="withBase('/diagrams/agent-vs-backend/personalization-en.svg')" alt="Personal information enters current context according to its source, scope, and version; corrections invalidate later use of old content and dependent summaries, while a separate authorization path controls execution" />
  </picture>
  <figcaption>Figure 4 · Understanding the user and receiving authorization have separate sources. Corrections affect later use; they cannot retract content already sent or rewrite historical reports. <a class="diagram-original" :href="withBase('/diagrams/agent-vs-backend/personalization-en.svg')" target="_blank" rel="noopener noreferrer">View the full diagram</a></figcaption>
</figure>

The boundary is equally concrete. Exported reports remain historical artifacts. Bytes already sent to a model cannot be recalled, and the program cannot guarantee that it identifies every trace of an old preference in arbitrary natural-language text. Dependency invalidation is an implementable mechanism; it does not establish the removal of every semantic influence.

This is why personalization goes deeper than adding a vector database. Retrieval helps find potentially relevant history. The application must also decide whether that history still applies today. The longer a personal assistant operates, the more important that second question becomes.

## 10. Proactivity Should Advance the User's Work and Respect Their Attention

Once scheduled or event-driven execution is available, an Agent can easily appear industrious: a report every day, a notification for every change, and a question whenever something is ambiguous.

But the user delegated work, not a desire to receive more messages. In our example, producing another similar report when the sources have not changed may add no value. An immediate notification about an insignificant change may interrupt the user unnecessarily. If a decision really is needed, a vague “something has changed” leaves the research burden with the user.

Proactivity therefore includes at least three judgments: whether there is a new fact, whether it affects the current goal, and whether it merits interrupting the user now. Being able to recommend an action also does not imply authority to execute that recommendation.

When OpenAI introduced Pulse in 2025, it demonstrated a direction based on asynchronous research informed by memory, feedback, and connected applications, followed by personalized updates. This article cites that product design, not the original preview eligibility as evidence of today's availability. The engineering question is clear: how can earlier interests keep serving a current goal without producing suggestions that follow an already-finished project forever? [Pulse announcement](https://openai.com/index/introducing-chatgpt-pulse/)

### An ongoing delegation can consist of many quiet, bounded executions

<figure>
  <picture>
    <source media="(max-width: 640px)" :srcset="withBase('/diagrams/agent-vs-backend/personal-agent-cycle-en-mobile.svg')" />
    <img style="max-height: none !important; height: auto;" :src="withBase('/diagrams/agent-vs-backend/personal-agent-cycle-en.svg')" alt="A future personal Agent design: an authorized event wakes the task, current goals and permissions are reconstructed, bounded work produces checked results, value determines whether to notify or record quietly, and the task returns to durable waiting" />
  </picture>
  <figcaption>Figure 5 · A general design outlook: events drive bounded work, while notification remains a separate decision. This is not a list of features already implemented in v0.19. <a class="diagram-original" :href="withBase('/diagrams/agent-vs-backend/personal-agent-cycle-en.svg')" target="_blank" rel="noopener noreferrer">View the full diagram</a></figcaption>
</figure>

The initial implementation of this cycle can be quite simple. When a timer wakes the task, first check the source versions and whether the goal or applicable conditions have changed. If none of these changed, the task can return to waiting. Otherwise, select the necessary context and ask the model to address the new question. Generate an update for the user only when the agreed significance conditions are met.

Missing material may require waiting for the source to become available. A decision reserved for the user may require assembling concrete options and tradeoffs before asking. An operation with an unknown outcome after dispatch needs reconciliation of its original result. These pauses have different causes; they should not all appear as an endlessly spinning “thinking” indicator.

When the user changes the goal, the assistant must do more than append the new request to the end of the chat. Work that has not yet been dispatched should be reconsidered under current conditions. Where necessary, stop the old task and establish a new execution. Effects that have already occurred and receipts whose outcomes remain unknown still require honest handling; they cannot disappear from the record because the user says “never mind.”

For this kind of personal assistant, I would watch whether users repeat themselves less, important changes are identified in time, deliverables are usable, corrections affect later behavior, and unnecessary notifications decline. These are proposed product-evaluation directions, not outcomes that can be established by one demonstration or a count of API calls.

## 11. The Engineering Focus Will Expand from Running a Model to Maintaining a Delegation

The following points are judgments and possibilities derived from the preceding mechanisms. They are not commitments on Open ETF Agent's completed roadmap or a universal architecture that every vendor will adopt.

### Software may increasingly organize interaction around goals

Today, much work requires users to carry context between documents, calendars, files, and messages. One promising direction for personal Agents is to keep the user focused on a persistent goal. Opening that goal would show what changed, which conclusions need updating, and which decision is still missing.

For example, an ongoing research task could prepare a comparison when new material arrives, offer a verifiable update when the user returns, and present concrete options for what to do next. The user would concentrate on adjusting the goal and making key tradeoffs, while the system handles mechanical coordination between tools. This is a product possibility, not a cross-application capability already demonstrated by this article's example.

The emphasis of application development may change accordingly. Alongside pages that people can navigate, applications will need business capabilities an Agent can use accurately and execution records that people can understand and act on. Interfaces remain important: they help clarify goals, compare options, and withdraw delegations.

### General runtime capabilities will become easier to reuse; domain responsibility will remain

Current official documentation already provides concrete signals. OpenAI Agents API offers a managed Codex harness that handles sessions, orchestration, context compaction, and recovery. Claude distinguishes Agent SDK, which runs in an application-operated process, from Managed Agents. [OpenAI Agents API](https://developers.openai.com/api/docs/guides/agents-api/overview) · [Claude runtime options](https://code.claude.com/docs/en/agent-sdk/overview)

From this, it is reasonable to expect more teams to reuse general loops, execution environments, and persistence infrastructure, while spending more effort on what constitutes a correct business action. Managed infrastructure does not transfer every responsibility: which material may be read, which changes merit a notification, which analytical conventions a report uses, and how incorrect results are corrected still depend on the product.

Three questions make a useful starting point for technology selection: who saves the state, who owns external effects, and who judges success? Clear answers can prevent more rework than another round of framework substitutions.

### User models may become inspectable, revisable working information

A personal Agent may understand more about its user over time, but that understanding should not become an invisible profile the user cannot inspect. For information that affects consequential behavior, I would favor retaining sources and versions so the user can understand why it was used, how to correct it, and where it should not apply.

This does not require a complex relationship graph for every preference. A simple assistant can start with a few explicit settings. More automatic memory formation becomes worthwhile when cross-task memory actually reduces repeated work and the team can handle correction and opting out.

Feedback also needs careful interpretation. “This answer is too long” may apply only to the current task. “That suggestion is wrong” may indicate a source problem, a flawed method, or a changed goal. Every piece of feedback should not become a permanent preference, and one positive response cannot justify expanding the system's authority on its own.

### Models and tools will change; old delegations cannot be silently rewritten

A long-term personal assistant may outlive a particular model version or tool interface. After an upgrade, the scope accepted for an old task, effects that already occurred, and results still owed to the user remain relevant.

Open ETF Agent v0.19's upgrade rules already touch this problem. Original run definitions bind versions, and incompatible older readers reject newer definitions. Original PDF recovery material must retain bytes and pages; a summary or hash alone cannot reconstruct the original working material. Reading an old deliverable and continuing an old execution also have different requirements. [Upgrade guide](https://github.com/hpoenixf/open-etf-agent/blob/fbefc074f161ae8de5b93060beae5b542de31038/docs/upgrade-guide.zh-CN.md)

A longer-lived product may need to finish old tasks before switching versions, retain a bounded compatible execution environment, or perform an explicit, recorded migration. A migration that changes task scope needs applicable authorization again. A model upgrade cannot justify silently reinterpreting an old commitment on the grounds that the natural-language meaning seems close enough.

### Mature autonomy should include appropriate stopping and exit

An assistant that becomes more proactive about finding information should also be easy to pause. Better use of preferences should come with ways to export, correct, and delete them. Long-term goal tracking should include recognizing that a goal is complete or no longer matters.

This changes the interface. Users need to see more than conversation: active delegations, the next trigger, what the assistant is waiting for, what has been delivered, and how to change or end the work. The interface participates in task control. Implementing mechanisms on the server and then collapsing all their states into chat bubbles loses that distinction.

I expect a mature personal Agent to be defined by **sound judgment in fulfilling an ongoing delegation**: making independent progress where it can, staying quiet when there is no new value, bringing concrete material when the user must decide, and changing subsequent work when the user changes their mind.

## 12. If You Start Today, What Should Come First and What Can Wait?

Return to the comparison of two documents. An ambition to build a personal assistant does not require the first version to include scheduling, long-term memory, multiple Agents, and automatic learning all at once.

| Current, concrete need | A viable starting point | When an additional mechanism becomes worthwhile |
| --- | --- | --- |
| Fixed inputs and clear rules | A conventional service with deterministic tools; use a model to explain results if needed | Execution must identify an unforeseen gap, select a method, or investigate further |
| One open-ended task | One Agent, a small set of controlled tools, an explicit budget, and readable saved artifacts | The task spans processes, waits for people, or creates effects that cannot be freely repeated |
| Reuse preferences across interactions | Explicit settings and narrowly scoped memory | Automatic memory adds meaningful value and can be corrected, invalidated, and disabled |
| A clearly independent subproblem | First check whether one Agent and ordinary concurrency are sufficient | Independent context or specialized methods materially improve the overall deliverable |
| Keep following a goal | An explicit delegation, event triggers, bounded execution, and notification conditions | One execution is already reliable, and another round has genuinely new information or value |

Every stage must protect permissions and control external effects. They are not optional additions to postpone until the product matures. Complexity that has not yet earned its place can wait.

To connect this article with the code, start with the offline synthetic-document comparison described in the v0.19 documentation. It requires Node.js **26.8.1–26.x**. The following is the documented entry point for that version, not a new live-model experiment conducted for this article:

```bash
git clone --branch v0.19.0 --depth 1 https://github.com/hpoenixf/open-etf-agent.git
cd open-etf-agent
npm ci --ignore-scripts --no-audit --no-fund
npm run build
npm run demo -- --case document-compare
```

The CLI prints the run directory. The documentation specifies that it contains `report.md`, `manifest.json`, and `run.jsonl`. Focus on concrete observations: what does the report cite, can the actual file be read back, and which facts remain if a step fails? The default uses a scripted model fixture and requires no model key. It helps explain the engineering path; it does not evaluate a live model's research capability. [Pinned-version instructions](https://github.com/hpoenixf/open-etf-agent/blob/fbefc074f161ae8de5b93060beae5b542de31038/README.zh-CN.md) · [Current project entry point](https://github.com/hpoenixf/open-etf-agent)

When the user needs one report, deliver that report well first. When the user asks you to keep watching, extend the goal, memory, triggers, and authorization across time. Each added mechanism can then answer a real user need.

Backend engineering experience will continue to matter: state, transactions, queues, isolation, idempotency, observability, and delivery remain essential. The new challenge is to keep a system that changes its next step in response to language and context accountable for its actions, while staying aligned with what the user wants today.

<!-- agent-article-sync:guidance:start -->
## Further Reading and Discussion

For deeper exploration, continue with the [Six-Layer Invocation Panorama](/en/articles/017-prompt-to-answer-six-layer-panorama-v3), [Long-Horizon Research Panorama](/en/articles/agent-long-horizon-research-panorama), [Context Governance in Practice](/en/articles/agent-context-governance-actions), and [Client Interaction Panorama](/en/articles/agent-client-interaction-panorama). They examine request handoffs, continuing research, memory consumption, and user control respectively. The comparisons and outlook in this article stand on their own.

[Chinese edition](/articles/agent-vs-backend-development-panorama) · [Panorama Series](/en/panorama). If these articles and runnable examples help you, consider starring [Open ETF Agent](https://github.com/hpoenixf/open-etf-agent) or the [engineering collection](https://github.com/hpoenixf/eff-agent-article). Specific scenarios are welcome as a starting point for discussing different engineering choices.
<!-- agent-article-sync:guidance:end -->
