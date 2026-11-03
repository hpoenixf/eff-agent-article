---
title: "How Agent Development Differs from Backend Development: From One Request to a Long-Term Personal Assistant"
description: Compare backend requests and mature Agent frameworks, then follow real application cases in asynchronous delivery, human responses, memory consumption, and daily research toward a long-term personal assistant.
readingBrief:
  takeaways:
    - "An Agent adds a model that chooses the next step from context; trusted code must still enforce business rules, permissions, and control over external effects."
    - "Recovery must preserve the original task, evidence, and effects. An operation that was dispatched but has an unknown outcome cannot be treated as failed and repeated merely because it timed out."
    - "Mature frameworks already provide loops, sessions, approval, checkpoints, and observation. Compare their actual recovery and handoff semantics rather than equating a successful tool call with business correctness."
    - "Cases from our private application separate readable results, adopted responses, and memory entering later input. Mechanism correctness does not establish sustained user benefit."
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

The first half uses a teaching task to compare control: read two fund disclosures and produce a report, examining tools, state, and mature frameworks. The second turns to asynchronous delivery, human responses, memory consumption, and daily rereading already implemented in our private research application. Actual successes and counterexamples explain why the horizon expands. Teaching examples, scripted-model verification, and small real-model observations remain distinct; they do not establish live investment-research or automated-trading capabilities.

The first half’s public teaching implementation baseline is **Open ETF Agent v0.19.0, verified on November 3, 2026**. References to other systems use official documentation consulted on the same date. Open ETF Agent is a local teaching project whose mechanisms can be inspected; Claude Agent SDK, Codex, OpenAI Agents SDK, and LangGraph provide different levels of runtime capability. They serve as points of comparison here, rather than a product ranking. [Release and source entry point](https://github.com/hpoenixf/open-etf-agent/releases/tag/v0.19.0)

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

### After One Run Ends, What Actually Changes in the Next?

Conventional backends also update databases, save reports, and accumulate feedback. They do not necessarily start from zero each time, and not every change in an Agent is memory. Section 1 compared how one task runs. Here we compare **what a run leaves behind and how the next run uses it**. Persistence is not learning, and sharing a database does not give every record the same lifecycle.

| What changes | What backends and Agents share, and what differs | Lifecycle and conditions for later use |
| --- | --- | --- |
| **Business data and external actions** | Both update business records, generate files, and call external services. Agent tool calls also need actual receipts; a model saying “done” does not establish an effect. | Persist under business rules and inform later queries. Authorization, transactions, idempotency, and receipts are shared foundations. |
| **Task progress and unknown outcomes** | Backends have workflow steps and retry state. Agents may additionally retain original tool proposals, actual results, call allowances, and unanswered questions. | Primarily belongs to the original task and may survive process restarts. A new Run does not automatically inherit execution authority or permission to replay unknown actions. |
| **Current context and working notes** | Programs have request variables and intermediate results. A model chooses its next step from the goals, material, tool results, and notes actually supplied to it. | Usually serves the current task. Persistence alone does not carry it into another task; explicit conversation continuation or context assembly is needed. |
| **Historical reports, sources, and logs** | Both retain history. Agents may also interpret retrieved history as material for a new task, but an old conclusion cannot replace its original evidence. | Can persist across Runs. Saving, retrieving, and using are separate steps; a saved report has not necessarily entered a new model request. |
| **Preferences and long-term memory** | Backends already use settings, customer profiles, and recommendation features. Agents can bring recalled preferences, facts, and experience into judgment and expression. | Cross-task use needs writing, retrieval, scope, correction, and invalidation mechanisms. Mentioning something does not guarantee permanent storage or use in this task. |
| **Tools, Skills, and permissions** | Both can gain capabilities through deployment or configuration. Tool descriptions and method instructions also affect how a model chooses actions. | Require explicit configuration and activation rules. Successful use does not automatically install tools, edit Skills, or expand permissions. Version contracts govern whether an existing Run adopts a change. |
| **Model and runtime configuration** | Backends also update model services, rules, and dependencies. An Agent's model version, prompt, tool schema, and context strategy can change too. | Explicit updates change the relevant configuration. An ordinary inference call does not itself update model weights; a different second answer does not establish learning. |
| **Human feedback and experience** | Both collect ratings, corrections, and business metrics. Feedback can inform rules, candidate memories, evaluation, or training; these are distinct mechanisms. | Feedback events may persist, but adoption needs its own implementation. One correction does not automatically change every future answer or constitute online training. |

Use the same two documents as a teaching example: the first comparison missed the basis of a fee figure, and a week later the user returns with revised documents. Both systems can produce different results because they read updated database records. Whether the Agent improves in another way depends on what actually happens next:

- **Only save the old report:** the new Run does not necessarily know about the omission.
- **Explicitly include the report and the user's correction in this input:** current context changes, giving the model an opportunity to check the fee basis. This is not new knowledge learned into the weights.
- **Save “state the fee basis separately” as an authorized preference and retrieve it correctly:** this creates cross-task continuity. Verify the actual model input, not just the stored record.
- **Explicitly revise the comparison Skill to require this check:** the reusable method changes. A backend can likewise add the check to its rules or workflow.

This example explains possible mechanisms; it is not a real quality evaluation. The actual Memory case in section 9 establishes bounded saving and later input consumption, without extrapolating sustained quality gains.

Thus, **backends change and Agents change. One additional distinction is that Agents hand selected history and derived material to a model for fresh interpretation as conditions for its next judgment.** This adaptability does not replace backend foundations. It increases the need to separate business facts, execution facts, and decision material. Verify not only what was saved, but what the next request actually read, why it was eligible for use, and how it affected action.

Context engineering becomes concrete once these are separated. Select information that is useful for the current decision, still valid, and traceable to a source. Preserve the ability to reread the original when needed, while omitting material that is not currently useful.

This also explains why a larger context window is only part of the answer. More capacity can retain more material, but it does not resolve conflicting content, expired preferences, misleading tool output, or repeated research automatically. Choosing what enters the next request is itself part of application behavior.

LangGraph separates thread-scoped checkpoints from cross-thread stores. Claude SDK also distinguishes conversation history from filesystem state: resuming or forking a conversation does not automatically copy or roll back files. Implementations differ, but the lesson is shared: **restoring a conversation, restoring an execution position, and restoring external work products are distinct forms of recovery.** [LangGraph persistence](https://docs.langchain.com/oss/python/langgraph/persistence) · [Claude sessions](https://code.claude.com/docs/en/agent-sdk/sessions)

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

## 5. Completion Has Three Layers, and Agent Testing Needs All Three {#three-layers-of-completion}

The report task raises at least three different questions: did execution end correctly, are the conclusions defensible, and did the user receive a readable deliverable?

A successful file-read tool only establishes that the file was read. Successfully saving a report establishes that certain bytes were saved. Even a report citing real pages does not automatically establish that every sentence is supported by those pages. Open ETF Agent retains `semanticStatus: unreviewed` in its result to separate execution completion from semantic review. [Results and readback](https://github.com/hpoenixf/open-etf-agent/blob/fbefc074f161ae8de5b93060beae5b542de31038/README.zh-CN.md)

Conventional testing still has a clear role. Permissions, arguments, calculations, transactions, recovery, and artifact integrity need deterministic assertions. The additional questions introduced by a model need task samples: did it find the right evidence, notice that two figures were not comparable, explain uncertainty, and stop appropriately when evidence was insufficient?

Then return to the user experience. Can the report be opened? Do its attachments agree with the body? If execution fails midway, can the user still read intermediate work that was already saved? A screen saying “completed” while the file cannot be downloaded has not completed delivery.

For research tasks, evaluation should not mechanically require one exact tool sequence. Under the same permissions and business constraints, a model may take different paths to the same evidence. Conversely, an impressive trace with many tool calls may fail to answer the original question. Observe goal completion, evidence quality, execution reliability, and cost together rather than optimizing whichever is easiest to count.

## 6. The Shared Lesson from Mainstream Agents: Reuse Runtime Capabilities, Retain Business Responsibility {#framework-capabilities-and-business-responsibility}

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

## 7. After the User Leaves: Separate Continuing Work from Reading Its Result {#continuing-work-and-reading-results}

The preceding section compared what frameworks provide. We now turn to problems we actually encountered in our private research application. These are steps toward responsibility across time, not a claim to have completed a personal-assistant product. Separate articles cover the cases in detail; here we focus on the experiences that changed our design judgments. Application verification is not evidence of research quality or real user benefit.

### Losing the connection must not redefine completion

It is tempting to treat the browser connection as the task's lifetime: while the page remains open, output streams; when it leaves, work seems finished. In an actual disconnect test, research continued. Completion therefore had to be determined from the original task's durable state and published body, not from the connection ending.

Another check exposed a subtler mistake. Execution capacity had been released, yet the first read still showed streaming. The original record subsequently completed and its body was saved. Observing only resource release would have confused “capacity is available” with “the result is readable,” potentially starting duplicate research. We changed the observation to wait for the original durable terminal state and publication, then closed the original runtime and read the same completed result from a separate reader process without new model requests.

The benefit is concrete: **a returning user needs the work already done, not another wait for a regenerated answer.** This establishes cold reading of a completed result, not lossless recovery from every mid-task crash. Conventional backends also run asynchronous jobs. An Agent adds another concern: preserve the evidence and result of its exploration rather than substituting a new generation for the original deliverable.

### “The report is finished” and “notify now” are different facts

Timed delivery split completion again. With delivery promised *at* a time, an early body can be saved without sending the final notification early. Delivery promised *by* a time permits early completion. If only partial work exists at the deadline, a later final report must not erase the missed deadline.

We verified these distinctions through the real application page, authentication route, and isolated database, using synthetic accounts and scripted model decisions: returning reads the original task, partial and later final delivery retain separate records, and another account cannot read the result. This tests application behavior, not a production latency guarantee or a real model's research ability.

A queue alone is therefore insufficient. Execution progress, readable results, and delivery commitments need distinct records; one “success” field cannot describe the user's experience. [Asynchronous Research and Time-Bound Delivery](/en/articles/agent-asynchronous-research-time-bound-delivery) explains this separation.

The separation also suggests a useful next horizon: a persistent goal can span many research runs while each execution retains its own scope and endpoint. What we verified is separation of the task from its connection and independent reading of its result. Organizing these into a revisable, revocable ongoing delegation still requires current authority and conditions for each trigger. The diagram places those time scales alongside an individual model request to show the additional responsibility.

<figure>
  <picture>
    <source media="(max-width: 640px)" :srcset="withBase('/diagrams/agent-vs-backend/durable-work-en-mobile.svg')" />
    <img style="max-height: none !important; height: auto;" :src="withBase('/diagrams/agent-vs-backend/durable-work-en.svg')" alt="Three timescales for a persistent goal, an individual Run, and model requests: authorized events wake bounded executions, waiting can release compute, and deliverables remain independently available" />
  </picture>
  <figcaption>Figure 3 · From verified task/result separation toward distinct persistent goals, bounded executions, and model requests. Complete ongoing delegation remains a design direction. <a class="diagram-original" :href="withBase('/diagrams/agent-vs-backend/durable-work-en.svg')" target="_blank" rel="noopener noreferrer">View the full diagram</a></figcaption>
</figure>

## 8. After the User Answers: Receipt Is Not Adoption {#human-responses-and-actual-adoption}

Once work can outlive the user connection, another wait appears: the model needs material, a scope decision, or approval. Showing a question is easy. The difficult part is getting the answer into the work that actually needs it.

We separated receiving a response from adopting it. Receipt means the system saved it; adoption means the original execution consumed it at an appropriate continuation boundary. Independent work may finish while one decision waits. An answer must not release unrelated work as a side effect.

The difference becomes especially clear with child tasks. The main task paraphrasing “you may continue” is not the same as the original specialist reading the user's full answer. Our controlled verification followed the original application, authenticated HTTP, database, and separate processes: the resumed main task first received the original answer and explicitly continued the original child; the child received it as a distinct user message rather than an arbitrary paraphrase. Retrying the same response identity with unchanged content after a lost acknowledgment returns the original acceptance rather than adding another response or dispatching the original research again. A task that has already ended requires explicit continuation, rather than being silently restarted by a late message.

**The value is that a human decision actually changes execution, while “not yet applied” remains visible.** A conventional form often treats successful submission as the end of its responsibility. An Agent handoff must also observe the downstream consumer, or the interface can say “answered” while execution proceeds under stale conditions.

These successes used synthetic data and a scripted model gateway through real application paths. They establish response ownership, handoff, and replay behavior. They do not show that a live model asks good questions, and they do not imply that automatic parking and recovery are fully enabled in production. [Durable Human Interaction](/en/articles/agent-durable-human-interaction-response-adoption) distinguishes receipt, adoption, and explicit continuation.

## 9. In the Next Conversation: How We Know Memory Was Actually Used {#saving-memory-and-later-consumption}

The first two steps preserve one task. A personal assistant also needs continuity between tasks: must the user explain the same thing every time? A memory row in a database cannot answer that question.

When optional automatic semantic learning is enabled, we place it after the original response reaching its durable terminal state so that a learning failure would not hold back an answer already ready for delivery. Personal and test memory are separate, and their ownership is bound when the conversation is created. Changing a later interface selection must not reassign an old task. Resetting test storage must not let a late job write old results into the new generation.

In a small real-model verification, we used synthetic user statements and explicit synthetic host permissions. We observed a proposed memory becoming active and then entering another conversation's actual model input. That establishes more than a successful save response: **the later consumer really received the information.** Other proposals remained candidates. In a separate ordinary self-use path, automatic learning jobs did run, but their proposals were discarded. Those observations establish processing and correct storage ownership, not another successful preference activation.

This also changed what we considered adequate verification. An answer compatible with a preference might have been written that way anyway. Inspecting the actual input establishes that memory participated. Participation still does not establish improvement: these samples did not provide controlled evidence of better long-term answers or a general ability to decide what deserves remembering.

Personalization should therefore not be measured simply by counting saved records. Avoiding repeated explanations is the potential value; provenance, scope, correction, and invalidation are part of its engineering cost. We observed bounded saving and consumption in a real-model path while retaining the cases that were not adopted. Sustained benefit remains a separate question. [Context Governance in Practice](/en/articles/agent-context-governance-actions) and [The Durable Effects of Forgetting](/en/articles/026-agent-memory-forget-durable-effects) explain why old memory can still affect later input and why deleting a record is insufficient. They are not the original records of this newly described verification.

Following this consumption path points toward an assistant that needs fewer repeated explanations while allowing users to correct old information. Provenance, scope, versions, and authorization in the diagram are not synonyms for storing more history. We verified bounded saving and later consumption; complete cross-task personalization governance and sustained benefit still require further work.

<figure>
  <picture>
    <source media="(max-width: 640px)" :srcset="withBase('/diagrams/agent-vs-backend/personalization-en-mobile.svg')" />
    <img style="max-height: none !important; height: auto;" :src="withBase('/diagrams/agent-vs-backend/personalization-en.svg')" alt="Personalization design relationships: information has provenance, scope, and versions; corrections should revoke later use of obsolete versions and recheck identified dependent summaries; authorization independently controls execution" />
  </picture>
  <figcaption>Figure 4 · How memory participates in later work, and how correction and authorization should constrain it. These engineering relationships do not turn limited samples into a complete personalization product. <a class="diagram-original" :href="withBase('/diagrams/agent-vs-backend/personalization-en.svg')" target="_blank" rel="noopener noreferrer">View the full diagram</a></figcaption>
</figure>

## 10. When the User Returns Tomorrow: Ordinary Reading Still Matters {#daily-research-and-stable-rereading}

Beyond cross-conversation memory, we built something less conspicuous: reliable return visits to daily research. It attracts less attention than automatic notifications, but directly affects whether the user is still reading the research they saw earlier.

The application separates generating today's research from reading it. After successful explicit generation, reopening or clicking again for the same account and server-side UTC date reads the original successful result. Failure and “no suitable items” remain different outcomes. An empty view must not silently count as success, and reopening a page must not authorize another generation.

Two actual problems taught us why this matters. First, long-running research held its generation lock on a normal query-pool connection, leaving its subsequent nested queries unable to obtain a connection. We introduced a separate bounded lock pool to separate lock ownership from query resources, and rechecked for an existing successful result after acquiring the lock. Second, cached cards displayed sources inconsistent with the original report's citations. The original citations were correct; the read projection was wrong. Repairing that projection restored the corresponding sources without rewriting the bodies or adding model calls. Older records lacking precise citation identities still retain their existing permitted view; this is not a claim that every historical record can be precisely rebound automatically.

**Agent reliability also lives in the parts that do not call a model.** Reading should remain reading. Correcting source display should not produce a different report. Locks, connection pools, and source identity remain backend problems even when a model sits upstream.

Limited review of the original results did not establish that daily selections were consistently good: supported relevance and limited relevance both appeared, while actual follow-up success and real user adoption were not established. We describe the achievement as improved generation, persistence, source display, and rereading, rather than a proven proactive investment-research service. [Personalized Daily Research and Its Cache](/en/articles/agent-personalized-daily-research-cache) covers the mechanism.

Reliable rereading is a starting point for a more proactive assistant, not its endpoint. A worthwhile next step is checking for change under approved conditions, investigating changes that affect the goal, and separately deciding whether the user needs to hear now. Such proactivity should permit quiet waiting and pausing a delegation. The following cycle is a design outlook motivated by the cases, not an already accepted automatic service.

<figure>
  <picture>
    <source media="(max-width: 640px)" :srcset="withBase('/diagrams/agent-vs-backend/personal-agent-cycle-en-mobile.svg')" />
    <img style="max-height: none !important; height: auto;" :src="withBase('/diagrams/agent-vs-backend/personal-agent-cycle-en.svg')" alt="A future personal Agent design: an authorized event wakes the task, current goals and permissions are reconstructed, bounded work produces checked results, value determines whether to notify or record quietly, and the task returns to durable waiting" />
  </picture>
  <figcaption>Figure 5 · A measured proactivity outlook: events trigger bounded work, value determines notification, and waiting does not require a continuously running model. <a class="diagram-original" :href="withBase('/diagrams/agent-vs-backend/personal-agent-cycle-en.svg')" target="_blank" rel="noopener noreferrer">View the full diagram</a></figcaption>
</figure>

## Looking Back: Each Wider Horizon Began with a Concrete Problem

Initially, finishing a request meant returning a result. As research grew longer, users left, so the connection's end could no longer define the work's end; results needed independent persistence and reading. When a task needed a human decision, saving a response was insufficient: we had to know whether execution had adopted it. In the next conversation, saving a memory was likewise insufficient without checking its actual input. When the user returned tomorrow, we still needed to distinguish the original result, new research, and a source-display correction.

This is how our horizon expanded from backend requests toward a long-term personal assistant. We did not begin with a capability diagram and fill its boxes. We encountered the fact that **a successful response, a successful save, and a successful model call do not individually establish that the user's work is done.** Each step extends responsibility to another consumer and a later time.

These experiences do not yet constitute a fully mature long-term assistant. Real-model quality, selection value, and sustained benefit require evaluation separate from mechanism correctness. But the direction is concrete: mature frameworks help organize exploration and recovery; backend engineering preserves facts, identity, and effects. The assistant adds responsibility for making the user's decisions and prior results trustworthy in the next piece of work. Continuity is not a model running forever. It is the user returning without having to rebuild trust from scratch.

<figure>
  <picture>
    <source media="(max-width: 640px)" :srcset="withBase('/diagrams/agent-vs-backend/horizon-en-mobile.svg')" />
    <img :src="withBase('/diagrams/agent-vs-backend/horizon-en.svg')" alt="From one request to continuing work, human collaboration, and a personal assistant: responsibility expands from a result to durable facts, human decisions, and delegations across executions" />
  </picture>
  <figcaption>Figure 6 · The horizon expands from one request to continuing work, human collaboration, and a long-term assistant. Concrete cases support the earlier steps; a complete assistant remains the goal they point toward. <a class="diagram-original" :href="withBase('/diagrams/agent-vs-backend/horizon-en.svg')" target="_blank" rel="noopener noreferrer">View the full diagram</a></figcaption>
</figure>

<!-- agent-article-sync:guidance:start -->
## Further Reading and Discussion {#further-reading-and-discussion}

For deeper exploration, continue with the [Six-Layer Invocation Panorama](/en/articles/017-prompt-to-answer-six-layer-panorama-v3), [Long-Horizon Research Panorama](/en/articles/agent-long-horizon-research-panorama), [Context Governance in Practice](/en/articles/agent-context-governance-actions), and [Client Interaction Panorama](/en/articles/agent-client-interaction-panorama). They examine request handoffs, continuing research, memory consumption, and user control respectively. The comparisons and practical lessons in this article stand on their own.

[Chinese edition](/articles/agent-vs-backend-development-panorama) · [Panorama Series](/en/panorama). If these articles and runnable examples help you, consider starring [Open ETF Agent](https://github.com/hpoenixf/open-etf-agent) or the [engineering collection](https://github.com/hpoenixf/eff-agent-article). Specific scenarios are welcome as a starting point for discussing different engineering choices.
<!-- agent-article-sync:guidance:end -->
