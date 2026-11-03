---
title: "How Agent Development Differs from Backend Development: From One Request to a Long-Term Personal Assistant"
description: Follow one task from a backend request to a personal assistant, comparing Claude Agent SDK, OpenAI Agents SDK, and LangGraph through tools, collaboration, and recovery, and the responsibilities each wider horizon adds.
readingBrief:
  takeaways:
    - "An Agent adds a model that chooses the next step from context; trusted code must still enforce business rules, permissions, and control over external effects."
    - "Recovery must preserve the original task, evidence, and effects. An operation that was dispatched but has an unknown outcome cannot be treated as failed and repeated merely because it timed out."
    - "Mature frameworks already provide loops, sessions, approval, checkpoints, and observation. Compare their actual recovery and handoff semantics rather than equating a successful tool call with business correctness."
    - "Personalization needs correction, invalidation, and forgetting. Preferences inform decisions, while explicit authorization determines permitted actions; they should not be merged into one free-form profile."
    - "From one request to a personal assistant, the scope of responsibility expands across time and decisions. Goals can persist, executions remain bounded, and users must be able to modify or withdraw a delegation."
  appliesTo:
    - "Developers with a backend or full-stack background who want to understand the engineering differences between Agent applications and conventional business systems."
    - "Teams designing research assistants, long-running tasks, or personal agents who need to understand runtime frameworks, business responsibility, and delegations across time."
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

We will follow a teaching task: compare two fund disclosures and produce a report, then extend the request to “keep watching these for me, and tell me when something important changes.” We first examine how tools change control, then how long-running work crosses interruptions and human waiting, and finally why a personal assistant must reconsider goals and conditions over time. The synthetic example does not establish live investment-research or automated-trading capabilities.

The public implementation baseline is **Open ETF Agent v0.19.0, verified on November 3, 2026**. References to other systems use official documentation consulted on the same date. Open ETF Agent is a local teaching project whose mechanisms can be inspected; Claude Agent SDK, Codex, OpenAI Agents SDK, and LangGraph provide different levels of runtime capability. They serve as points of comparison here, rather than a product ranking. [Release and source entry point](https://github.com/hpoenixf/open-etf-agent/releases/tag/v0.19.0)

## 1. Start with One Task to See How Control Changes {#_1-start-with-one-task-to-see-how-control-changes}

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

## 2. A Minimal Agent Is an Observation Loop; the Hard Parts Surround Its Handoffs {#_2-a-minimal-agent-is-an-observation-loop-the-hard-parts-surround-its-handoffs}

A model request may return an answer or propose tool calls. The runtime receives the proposal, validates it, invokes the tools, and includes the actual results in the next model input. Each new observation can change the next choice, until the task delivers a result, waits, or stops.

Claude Agent SDK exposes the loop, tools, and context management used by Claude Code. The OpenAI Agents SDK runner likewise continues through tool calls, handoffs, and final output. Today, you may not need to build the loop from scratch, but you still need to understand which responsibilities it leaves to the application. [Claude SDK](https://code.claude.com/docs/en/agent-sdk/overview) · [OpenAI runner](https://developers.openai.com/api/docs/guides/agents/running-agents)

In Open ETF Agent, for example, the model may propose reading a page, performing a calculation, or saving a report. The tool host checks the allowed tools, document scope, and arguments, while the runtime records actual dispatch and results. A model saying “the report has been saved” and a host retaining a file receipt that supports readback are two different kinds of evidence. [Public runtime and tool implementation](https://github.com/hpoenixf/open-etf-agent/tree/fbefc074f161ae8de5b93060beae5b542de31038/src)

### A tool interface also teaches the model how to act {#a-tool-interface-also-teaches-the-model-how-to-act}

The caller of a conventional API is usually programmed against an established contract. A model also infers a tool's purpose from its name, parameter descriptions, and return format. A universal tool called `query` may leave the model to guess resource boundaries, pagination, time conventions, and failure semantics.

A better tool interface makes important distinctions visible. “Read one page of an authorized document,” for example, is easier to constrain than “read any path.” Returning the document version, page number, and completeness information also supports later checks better than returning an unexplained string.

Open ETF Agent's `read_result` reads back an original result already obtained, rather than silently fetching the latest content at the same location. Source-bound calculations retain their input references, and a CSV can consume that same calculation result. This makes it possible to reconcile the numbers in the report, the numbers in the attachment, and the evidence actually read at the time. [Tool contract](https://github.com/hpoenixf/open-etf-agent/blob/fbefc074f161ae8de5b93060beae5b542de31038/src/tools.mjs)

### Skills, MCP, and permissions answer different questions {#skills-mcp-and-permissions-answer-different-questions}

A Skill can package a reusable method: what to check first, how to compare results, how to handle gaps, and which templates or resources to use. MCP provides a protocol for connecting external tools and data. Both can improve how an Agent works, but neither by itself establishes that the current user has authorized a particular action.

We should also avoid presenting one project's rules as universal across platforms. In Open ETF Agent, a Skill does not expand the original grant. Claude SDK allows the host to pre-approve tools through trusted project or personal Skill `allowed-tools` configuration, subject to organizational settings. Authority comes from trusted configuration and policy accepted by the host; an instruction embedded in external source material cannot claim the same status. [Claude Skill mechanism](https://code.claude.com/docs/en/agent-sdk/skills)

Codex expresses another useful distinction clearly: the sandbox limits the files, network, and other resources execution can reach, while the approval policy determines when further approval is required. Approval and execution isolation serve different purposes. A more capable model cannot replace either one. [Codex execution boundaries](https://learn.chatgpt.com/docs/agent-approvals-security)

## 3. Manage Both What Happened and What the Model Can See Now {#_3-manage-both-what-happened-and-what-the-model-can-see-now}

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

<span id="_5-a-real-lesson-from-v0-19-supporting-model-work-can-also-fail-to-converge"></span>

Context management also changes resource allocation. Summaries, specialist checks, and additional retrieval are real work and belong to the same task budget; limiting only the main conversation is insufficient. Open ETF Agent encountered repeated summaries of unchanged material after a report was saved but before the main task ended. Its repair validated and reused a still-applicable summarized range rather than simply increasing the call allowance. The lesson is that context-maintenance mechanisms need stopping conditions too. The teaching implementation primarily bounds call allowances, not a complete token or monetary ledger. [Design history](https://github.com/hpoenixf/open-etf-agent/blob/fbefc074f161ae8de5b93060beae5b542de31038/openspec/changes/v019-module-composition/design.md)

## 4. Longer Tasks Make “We Do Not Yet Know What Happened” More Important {#_4-longer-tasks-make-we-do-not-yet-know-what-happened-more-important}

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

Durable recovery also widens the horizon toward human collaboration. If the two documents use incomparable reporting conventions, the Agent can explain the difference and ask the user to choose a scope. That is not an execution failure, nor a reason for the model to keep guessing. Preserve the specific question and its options, wait for a reply, then verify that it still belongs to the current task and valid conditions. A checkpoint prevents lost progress; it does not make the user’s decision. Being able to continue does not mean continuing is appropriate now.

For Agents, the appeal of autonomous retries can obscure this problem. Sometimes a good runtime should prevent the model from taking further action: the original operation needs reconciliation before another attempt becomes meaningful.

## 5. Completion Has Three Layers, and Agent Testing Needs All Three {#_6-completion-has-three-layers-and-agent-testing-needs-all-three}

The report task raises at least three different questions: did execution end correctly, are the conclusions defensible, and did the user receive a readable deliverable?

A successful file-read tool only establishes that the file was read. Successfully saving a report establishes that certain bytes were saved. Even a report citing real pages does not automatically establish that every sentence is supported by those pages. Open ETF Agent retains `semanticStatus: unreviewed` in its result to separate execution completion from semantic review. [Results and readback](https://github.com/hpoenixf/open-etf-agent/blob/fbefc074f161ae8de5b93060beae5b542de31038/README.zh-CN.md)

Conventional testing still has a clear role. Permissions, arguments, calculations, transactions, recovery, and artifact integrity need deterministic assertions. The additional questions introduced by a model need task samples: did it find the right evidence, notice that two figures were not comparable, explain uncertainty, and stop appropriately when evidence was insufficient?

Then return to the user experience. Can the report be opened? Do its attachments agree with the body? If execution fails midway, can the user still read intermediate work that was already saved? A screen saying “completed” while the file cannot be downloaded has not completed delivery.

For research tasks, evaluation should not mechanically require one exact tool sequence. Under the same permissions and business constraints, a model may take different paths to the same evidence. Conversely, an impressive trace with many tool calls may fail to answer the original question. Observe goal completion, evidence quality, execution reliability, and cost together rather than optimizing whichever is easiest to count.

## 6. The Shared Lesson from Mainstream Agents: Reuse Runtime Capabilities, Retain Business Responsibility {#_7-the-shared-lesson-from-mainstream-agents-reuse-runtime-capabilities-retain-business-responsibility}

Mature frameworks provide much more than a model call inside a loop. Sessions, tool execution, human approval, context management, recovery, and tracing already have reusable implementations. The important differences concern **the unit of execution, who chooses the next step, and where application-specific constraints enter the process**. We will keep using the document-comparison task as a teaching example. The comparison describes documented capabilities, not a benchmark we ran for this article.

### Claude Agent SDK: give an executable assistant a working environment

Claude Agent SDK reuses Claude Code's tools, loop, and context management. Rather than assembling messages, parsing tool calls, and restarting the loop yourself, you embed an executor that can read and write files, run commands, and use extension tools. The framework compacts history as context approaches its limit. This removes loop-management work from the application, but earlier details may be lost; important business constraints should not exist only in an early conversational turn. [Agent loop](https://code.claude.com/docs/en/agent-sdk/agent-loop)

For our comparison, the application could prepare a separate working directory and let the Agent read two documents, perform controlled calculations when needed, and produce a report. A specialized subagent can investigate a question in a separate context before the main Agent integrates its findings. The benefit is not that more roles automatically produce better reasoning. It is the separation of long material and specialized methods from the main context. Ordinary concurrency can still handle simple parallel file reads. [Subagents](https://code.claude.com/docs/en/agent-sdk/subagents)

The execution environment needs careful design. `allowedTools` supplies automatic approval rules, not a strict statement that no other tools exist. Calls approved by earlier rules may not reach `canUseTool`. If a tenant-scope check must run for every relevant call, choose an interception point that actually covers that path, such as a `PreToolUse` hook, and validate business identity again in the tool backend. Permission rules also do not replace filesystem and network isolation. [Permissions](https://code.claude.com/docs/en/agent-sdk/permissions) · [Hooks](https://code.claude.com/docs/en/agent-sdk/hooks) · [Secure deployment](https://code.claude.com/docs/en/agent-sdk/secure-deployment)

This model fits tasks that require an Agent to keep operating in a working environment. However, `resume` and `fork` do not replace workspace management: forking conversation history neither copies nor rolls back the filesystem. Two candidate reports still need separate workspaces or versioned artifacts if they must not overwrite one another. [Sessions](https://code.claude.com/docs/en/agent-sdk/sessions)

### OpenAI Agents SDK: connect model collaboration to an application's service calls

OpenAI Agents SDK supplies the execution loop, function tools, handoffs, sessions, approval, and tracing. Existing backend services can expose tools for reading authorized material, calculating comparable metrics, and saving a report. Function signatures and descriptions become a model-visible parameter contract, while the services retain their data-access and write rules. The framework accepts model proposals and advances the loop; it does not require the business database to become conversation history. [Tools](https://openai.github.io/openai-agents-python/tools/)

Collaboration has two distinct structures. With an agent used as a tool, the main Agent retains control, receives the specialist's result, and continues comparing and writing. A handoff transfers conversational control to the recipient. The first fits “check the reporting basis, then let me finish the report”; the second fits “this request now belongs to another service.” Handoffs also require a decision about history: the default conversation may not be suitable for every specialist, so filter inputs deliberately. Compressing history is not the same as removing sensitive information. [Handoffs](https://openai.github.io/openai-agents-python/handoffs/)

State support also goes beyond making the application save every message itself. A Session can load and persist conversation history automatically. A run awaiting human approval can pause as a serializable `RunState`, which the application stores and later resumes. These address conversation history and resumable execution state respectively, not one interchangeable business transaction. Suppose saving a report is allowed automatically but sending it externally needs approval. Bind that approval to the recipient, report version, and action, authenticate the approver on the server, and prevent replay of an old approval. Deserializing a state object does not perform those checks. [Sessions](https://openai.github.io/openai-agents-python/sessions/) · [Human approval](https://openai.github.io/openai-agents-python/human_in_the_loop/)

For waits that span process restarts or long periods, the SDK also documents integration paths with durable workflow systems such as Temporal. Distinguish three layers: Sessions retain conversations, `RunState` preserves resumable execution state, and durable orchestration infrastructure supports long-running execution and wake-ups. The SDK is not merely an in-memory loop, but serializing its state alone does not deploy a reliable background execution service. [Long-running and durable execution](https://openai.github.io/openai-agents-python/running_agents/)

Guardrails and tracing make checks and diagnosis easier, but their scope matters. The default parallel input check can overlap Agent execution. If no tool may run before the check passes, use blocking validation. An input guardrail is not a check on every tool call; individual actions still need the corresponding tool pipeline or backend validation. Traces expose model calls, tools, and handoffs, but do not replace tenant authorization or establish answer correctness. Their inputs and outputs may contain sensitive material, so the application must decide what to retain. [Guardrails](https://openai.github.io/openai-agents-python/guardrails/) · [Tracing](https://openai.github.io/openai-agents-python/tracing/)

### LangGraph: put uncertain decisions inside a recoverable process

LangGraph organizes work through graph state, nodes, and persistence. It can express a predefined workflow or let a model choose tools dynamically. The comparison task could contain stages for reading, checking the reporting basis, asking the user when necessary, calculating, and drafting. Give the model the decisions that need semantic judgment; deterministic calculations can remain ordinary code nodes. The graph's value is not forcing every task down one path. It makes explicit which transitions may be chosen autonomously and which must stop for input. [Workflows and agents](https://docs.langchain.com/oss/python/langgraph/workflows-agents)

A checkpointer retains execution state within a thread; a store holds cross-thread data. Persistence has tradeoffs too: synchronous and asynchronous writes have different failure windows. Having a checkpoint mechanism does not mean every step has already been durably committed. Choose the persistence mode according to the recovery requirements of approvals and external writes. [Persistence modes](https://docs.langchain.com/oss/python/langgraph/checkpointers)

An `interrupt()` can pause for input and resume under the original thread identity, but the interrupted node restarts from its beginning rather than continuing from the paused line. Suppose a report was sent successfully and the process crashed before the node committed. Recovery can reach the send operation again. Placing the send after approval is not enough; the destination still needs a stable idempotency key or a way to query the original result. A query returning no result yet is not proof that nothing happened. If the outcome remains uncertain, preserve that uncertainty rather than automatically repeating the action. The framework answers where work resumes; the business interface answers whether the effect already occurred. [Interrupts and side effects](https://docs.langchain.com/oss/python/langgraph/interrupts)

### The Agent label does not imply the same division of responsibility

| Need within the task | Reusable framework capability | Decisions retained by the application |
| --- | --- | --- |
| Work inside a file and tool environment | Claude SDK's loop, context, permissions, and subagents | Workspace isolation, source scope, artifact versions, and business identity |
| Bring existing services into model decisions | OpenAI Agents SDK's tools, collaboration, Sessions, approval, and traces | Approval targets, business idempotency, sensitive data, and acceptance of results |
| Embed dynamic research in a long-running process | LangGraph's state, checkpoints, conditional paths, and interrupts | Which nodes may repeat, reconciliation of unknown effects, and state migration |

Codex likewise illustrates why execution boundaries and approval policy should be distinguished. Permission to run a command does not imply access to every file and network destination. A successful command does not establish that a change meets the product's requirements. Workspaces, validation, and publication have their own conditions. [Codex security boundaries](https://learn.chatgpt.com/docs/agent-approvals-security)

These capabilities overlap; the table offers comparison lenses, not exclusive categories. Open ETF Agent remains an inspectable teaching example: original evidence, shared budgets, unknown outcomes, and bounded compositions can be followed through pinned source. Its limitations must not be projected onto mature frameworks. The useful comparison asks who stores and verifies the same document, approval, and external effect in the chosen framework.

## 7. A Personal Assistant Begins with “Keep Doing This for Me” {#_8-a-personal-assistant-begins-with-keep-doing-this-for-me}

The system can now explore a task, retain execution state, and pause for a person when necessary. One question remains: **after this report has been delivered, why should it work again, and what should the next execution inherit or reconsider?**

Now the user says, “Every Friday, check these two documents for updates. Tell me about important changes, keep the report short, and include sources.” This establishes an ongoing delegation, not a longer model loop. A personal Agent derives continuity from persistent goals, currently valid personal information, and authorized actions, rather than conversation history alone.

That delegation should be inspectable and editable. Friday is a trigger; the two documents define source scope; a short report is a presentation preference; important changes define a delivery condition. A preference does not authorize sending messages, and a timer cannot decide on the user's behalf what deserves attention. Keeping those distinctions explicit makes it possible to change the right part when the user changes their mind. A different notification channel or a wider source scope also changes the delegation; neither should be inferred automatically from an old preference.

### A goal can persist while each execution remains bounded {#a-goal-can-persist-while-each-execution-remains-bounded}

This wider horizon has a cost. The caller of a request is often still present, while the user behind a standing delegation may already have changed plans. When a trigger fires, the application must check whether the goal remains valid, not merely reload an old prompt. Another scheduled trigger must not silently bypass a decision still reserved for the user.

A goal may last for months. An execution handles this round's material and conditions, while a model request handles the current context. Compute can be released while waiting for a disclosure or the user's input. What persists is the delegation and the basis for continuing, not an indefinitely running thought process.

<figure>
  <picture>
    <source media="(max-width: 640px)" :srcset="withBase('/diagrams/agent-vs-backend/durable-work-en-mobile.svg')" />
    <img style="max-height: none !important; height: auto;" :src="withBase('/diagrams/agent-vs-backend/durable-work-en.svg')" alt="Three timescales for a persistent goal, an individual Run, and model requests: authorized events wake bounded executions, waiting can release compute, and deliverables remain independently available" />
  </picture>
  <figcaption>Figure 3 · A goal can persist while computation happens intermittently. This is a general design perspective, not a claim that v0.19 already provides a complete long-term-goal product. <a class="diagram-original" :href="withBase('/diagrams/agent-vs-backend/durable-work-en.svg')" target="_blank" rel="noopener noreferrer">View the full diagram</a></figcaption>
</figure>

Recovering an unfinished execution and starting next week's research are different operations. The former retains original evidence and effects that already occurred. The latter uses new source versions, a new budget, and currently valid authority. Extending one Run indefinitely confuses those responsibilities.

Open ETF Agent's Worker, response mechanism, and Schedule supply some building blocks: explicitly wake a confirmed task, or save a question and wait for an answer. However, v0.19 has no resident background scheduler, and Response and Schedule do not have a freely composable joint waiting protocol. Separate support for due-time execution and human replies does not automatically create a complete long-running process with cancellation, expiry, and recovery. [Composition boundaries](https://github.com/hpoenixf/open-etf-agent/blob/fbefc074f161ae8de5b93060beae5b542de31038/docs/composition.md)

## 8. Personalization Is Tested When the User Changes Their Mind {#_9-personalization-is-tested-when-the-user-changes-their-mind}

An ongoing delegation adds another change: information about the user can expire. Usually wanting a summary does not mean full derivations are unnecessary today. Having once followed a project does not justify tracking it forever. Stable preferences provide defaults, current instructions can override them, and temporary circumstances need a scope. Authority must still come from a trusted source.

### Memory needs sources, scope, and a way to correct it {#memory-needs-sources-scope-and-a-way-to-correct-it}

Important memories should distinguish an explicit user statement from an observation or a model inference, and explain when they were updated and where they apply. One click cannot establish a permanent preference. Repeated citation cannot turn an inference into the user's own words. Users need ways to inspect, correct, or temporarily bypass these memories.

### Forgetting involves later use, not only deleting a database row {#forgetting-involves-later-use-not-only-deleting-a-database-row}

Suppose the user changes a project's preference from short reports to full derivations. The old preference may remain in historical tool results or working summaries. Updating only the retrieval store leaves other input paths untouched, so the system may still behave as though the correction never happened.

Open ETF Agent uses typed Memory identities and versions to filter invalid material from later model input and invalidate working notes dependent on an old memory. This protects known consumption paths. Bytes already sent to a model cannot be recalled, and old reports remain historical artifacts; it does not establish that every trace in arbitrary natural-language text has been removed. [Memory projection](https://github.com/hpoenixf/open-etf-agent/blob/fbefc074f161ae8de5b93060beae5b542de31038/src/memory-projection.mjs) · [Actual-input verification](https://github.com/hpoenixf/open-etf-agent/blob/fbefc074f161ae8de5b93060beae5b542de31038/test/memory-consumer.test.mjs)

<figure>
  <picture>
    <source media="(max-width: 640px)" :srcset="withBase('/diagrams/agent-vs-backend/personalization-en-mobile.svg')" />
    <img style="max-height: none !important; height: auto;" :src="withBase('/diagrams/agent-vs-backend/personalization-en.svg')" alt="Personal information enters current context according to its source, scope, and version; corrections invalidate later use of old content and dependent summaries, while a separate authorization path controls execution" />
  </picture>
  <figcaption>Figure 4 · Understanding the user and receiving authorization have separate sources. Corrections affect later use; they cannot retract content already sent or rewrite historical reports. <a class="diagram-original" :href="withBase('/diagrams/agent-vs-backend/personalization-en.svg')" target="_blank" rel="noopener noreferrer">View the full diagram</a></figcaption>
</figure>

Memory also introduces a scope cost. Information permitted in one project should not automatically enter another project or specialist context. The application must balance knowing more about the user against including only what the current task needs. Retaining more history can improve continuity, but it can also carry irrelevant material, stale inferences, and sensitive information into later work.

Retrieval asks which past material can be found. Personalization must also ask whether that past still applies today. This is an additional responsibility of service across time, not a problem solved merely by choosing a larger vector database.

## 9. Proactivity Should Advance the User's Work and Respect Their Attention {#_10-proactivity-should-advance-the-user-s-work-and-respect-their-attention}

Continuing work after the user leaves does not mean every execution deserves a notification. In our comparison task, generating another report without updated sources adds little. Immediately sending a trivial change can simply create another interruption. Proactivity requires separate judgments about whether there is a new fact, whether it affects the current goal, and whether the user should read about it now.

### An ongoing delegation can consist of many quiet, bounded executions {#an-ongoing-delegation-can-consist-of-many-quiet-bounded-executions}

<figure>
  <picture>
    <source media="(max-width: 640px)" :srcset="withBase('/diagrams/agent-vs-backend/personal-agent-cycle-en-mobile.svg')" />
    <img style="max-height: none !important; height: auto;" :src="withBase('/diagrams/agent-vs-backend/personal-agent-cycle-en.svg')" alt="A future personal Agent design: an authorized event wakes the task, current goals and permissions are reconstructed, bounded work produces checked results, value determines whether to notify or record quietly, and the task returns to durable waiting" />
  </picture>
  <figcaption>Figure 5 · A general design outlook: events drive bounded work, while notification remains a separate decision. This is not a list of features already implemented in v0.19. <a class="diagram-original" :href="withBase('/diagrams/agent-vs-backend/personal-agent-cycle-en.svg')" target="_blank" rel="noopener noreferrer">View the full diagram</a></figcaption>
</figure>

After an authorized event wakes the task, check source versions, the goal, and applicable conditions. If nothing changed, keep waiting. Otherwise, assemble the necessary context, investigate the impact, and deliver according to the agreed significance conditions. Waiting for a source, waiting for a user decision, and reconciling an unknown effect are different pauses, not one generic “thinking” state.

When the user says to pause a project, undispatched work should stop advancing the old goal. Effects that already occurred and uncertain receipts must remain accurately recorded. Product evaluation should return to the user: less repeated explanation, effective corrections, timely delivery of important changes, and fewer unnecessary interruptions. A count of model calls cannot answer those questions.

<span id="software-may-increasingly-organize-interaction-around-goals"></span>

<span id="user-models-may-become-inspectable-revisable-working-information"></span>

<span id="mature-autonomy-should-include-appropriate-stopping-and-exit"></span>

## 10. The Engineering Focus Will Expand from Running a Model to Maintaining a Delegation {#_11-the-engineering-focus-will-expand-from-running-a-model-to-maintaining-a-delegation}

This is an outlook derived from the mechanisms above, not a list of completed v0.19 product features. A personal assistant could keep new evidence, changed conclusions, and pending decisions attached to one persistent goal, reducing the need to carry context between applications. Its interface would do more than display answers: it would explain the current delegation, reasons for waiting, and the next trigger, and let the user change or end the work.

### General runtime capabilities will become easier to reuse; domain responsibility will remain {#general-runtime-capabilities-will-become-easier-to-reuse-domain-responsibility-will-remain}

The framework examples already show this division. Loops, sessions, checkpoints, and tool scheduling can be reused. Source eligibility, calculation conventions, significance judgments, and external effects still belong to the product. As it becomes easier to build an Agent that acts, it becomes more important to specify when it should not continue.

### Models and tools will change; old delegations cannot be silently rewritten {#models-and-tools-will-change-old-delegations-cannot-be-silently-rewritten}

A persistent goal may outlive a model version or interface. An upgrade does not erase the original task's scope, source material, or effects. Open ETF Agent's versioned run definitions and older-reader refusal rules offer a concrete reminder: reading an old deliverable and continuing its execution have different compatibility requirements. A summary or hash also cannot reconstruct original PDF bytes and pages. [Upgrade guide](https://github.com/hpoenixf/open-etf-agent/blob/fbefc074f161ae8de5b93060beae5b542de31038/docs/upgrade-guide.md)

For example, a newer model that searches better does not authorize a task originally limited to two files to browse the internet. A tool upgrade that adds notifications does not mean an older delegation approved sending them. An upgrade changes available capabilities; the current delegation still determines which may be used.

A product may finish existing tasks before switching versions or perform an explicit migration. If migration changes scope, obtain applicable authority again. A mature personal assistant does not silently enlarge its profile and permissions. It helps the user understand why it continues, why it waits, and how to withdraw the delegation.

<span id="_12-if-you-start-today-what-should-come-first-and-what-can-wait"></span>

## Looking Back: How Our Engineering Horizon Expands

We began with a request: validate its input, execute business rules, and return a result. An open-ended task widens that horizon. Material can reveal a new question, so the system must choose its next step from observations. Tools become interfaces for model-guided exploration, rather than only stages in a predetermined call chain.

The task can then extend across processes and human waiting. We must preserve more than a response: original evidence, effects that already occurred, and the conditions for continuing. A long-term personal assistant extends the horizon again. One goal generates multiple executions, and the user may change their mind. Each wake-up needs a fresh judgment about what remains valid, when to work, and when to stay quiet.

<figure>
  <picture>
    <source media="(max-width: 640px)" :srcset="withBase('/diagrams/agent-vs-backend/horizon-en-mobile.svg')" />
    <img :src="withBase('/diagrams/agent-vs-backend/horizon-en.svg')" alt="From one request to continuing work, human collaboration, and a personal assistant: responsibility expands from a result to durable facts, human decisions, and delegations across executions" />
  </picture>
  <figcaption>Figure 6 · Each earlier endpoint becomes a condition the next horizon must preserve. Responsibility expands; the model need not run continuously. <a class="diagram-original" :href="withBase('/diagrams/agent-vs-backend/horizon-en.svg')" target="_blank" rel="noopener noreferrer">View the full diagram</a></figcaption>
</figure>

**A wider horizon does not replace established engineering. It expands the time span and decisions for which the system accepts responsibility.** Databases, transactions, idempotency, isolation, and observability still support the system, while mature frameworks make many runtime capabilities reusable. The developer's additional task is to connect model exploration to those mechanisms, so that a correct individual action can become an understandable, proportionate, and revocable ongoing delegation.

<!-- agent-article-sync:guidance:start -->
## Further Reading and Discussion {#further-reading-and-discussion}

For deeper exploration, continue with the [Six-Layer Invocation Panorama](/en/articles/017-prompt-to-answer-six-layer-panorama-v3), [Long-Horizon Research Panorama](/en/articles/agent-long-horizon-research-panorama), [Context Governance in Practice](/en/articles/agent-context-governance-actions), and [Client Interaction Panorama](/en/articles/agent-client-interaction-panorama). They examine request handoffs, continuing research, memory consumption, and user control respectively. The comparisons and outlook in this article stand on their own.

[Chinese edition](/articles/agent-vs-backend-development-panorama) · [Panorama Series](/en/panorama). If these articles and runnable examples help you, consider starring [Open ETF Agent](https://github.com/hpoenixf/open-etf-agent) or the [engineering collection](https://github.com/hpoenixf/eff-agent-article). Specific scenarios are welcome as a starting point for discussing different engineering choices.
<!-- agent-article-sync:guidance:end -->
