# Trusted Handoffs Between Financial Business Agents: Why a Router Is Not Enough

*Public funds, private funds, and insurance: business identity, permissions, context, delivery, and recovery*

> This article examines a bounded, synthetic multi-business prototype in ETF Agent, reviewed as of November 1, 2026. All accounts, operators, fund records, and eligibility evidence are fictional. The exercised engineering path uses application HTTP, the existing Agent Runtime and MCP Host, PostgreSQL, and recovery across separate operating-system processes. A deterministic scripted gateway substitutes for a live language model. These observations establish specific engineering behavior, not financial-institution compliance or investment-research quality.

Imagine a user comparing the profiles and historical net asset values of two public funds. Partway through the conversation, the user asks: “I also want to consider private-fund products, while keeping the public-fund information we just reviewed.”

An Agent Router can identify the apparent next destination: a private-fund research agent. Yet that classification does not answer whether the user may enter the private business, which parts of the first conversation may cross the boundary, whether access to public-fund data also permits reverse access to private accounts, or how to avoid duplicating work if a confirmation response disappears or a process restarts.

**Routing decides who should handle a request. A trusted handoff must also establish why that handler may act, what information may follow, what effect actually happened, and how the same work may continue later.** Instead of building a separate model loop for each business, our prototype extends the authority already held by Conversation, Run, Host, Memory, and Recovery.

The following discussion follows one synthetic request from its initial business context to a committed result. It also explains when these additional contracts are warranted—and when an ordinary Router remains sufficient.

## 1. Business domains are not Agent instances

The business story has **three domains: public funds, private funds, and insurance**. These are not interchangeable services, but neither does each domain imply precisely one process or Agent identity. Business domain and operating organization are separate dimensions. Two operators can both conduct public-fund research without gaining access to each other's conversations or business-specific knowledge.

Three representative identities are sufficient to understand the exercise:

| Business domain | Representative Agent | Contract exercised |
| --- | --- | --- |
| Public funds | `fund-cn` (operator A) | Default research entry; authorized public-fund profiles and NAV history |
| Private funds | `private-cn` (operator A) | Fresh synthetic eligibility for each new Run; restricted private information and bounded public read-only tools |
| Insurance | `insurance-cn` (operator C) | Explicit cross-operator confirmation, isolated prior business history, and limited sharing of communication preferences |

Insurance is exercised in separate synthetic PostgreSQL/HTTP scenarios; it is not presented as a fully integrated option in the lightweight demo UI. The lightweight demo centers on operator A's public-fund research and private-fund handoff. Separate controlled fixtures can establish cross-operator security properties without introducing another public-fund product category or user-facing entry merely for symmetry.

The runtime identity includes four distinct facts. `scopeId` identifies the verified user scope; `operatorId` identifies the business operator; `domain` expresses the business rules; and `agentId` identifies the particular configured top-level handler. Sharing a domain grants no cross-operator permission. Sharing a user scope grants no unrestricted business-data visibility. These facts come from trusted configuration and established identity owners, never from an Agent's self-description.

A top-level **Business Agent** is also different from a **Child expert**. A Child can work on a bounded subtask under its parent Main Run. That is not the same as assuming an independent business conversation, admission policy, and resource scope. Changing the top-level handler means creating a distinct Conversation.

There were legitimate alternatives. A single model with switched prompts is simpler, but prompt text by itself cannot enforce independently reviewable data permissions. Recasting the destination as a Child would leave it under the original Root identity. Separate Runtimes and databases might be appropriate where deployment-level isolation is required, yet would duplicate execution and recovery machinery for this prototype. We reused the existing Runtime and placed business identity and handoff decisions at the components that already own their effects. Real institutional deployment may require a stronger physical separation.

## 2. A handoff has several completion points

Continue the example. The source Conversation belongs to `fund-cn/entity-a/public-fund`, and the intended destination is `private-cn/entity-a/private`. The end-to-end path consists of distinct decisions:

| Stage | Authoritative responsibility | Boundary that matters |
| --- | --- | --- |
| Express the destination | Original user submission and Main's proposed target | Intent is not an access grant |
| Admit and confirm | Trusted configuration, eligibility reader, and Human Interaction where required | The model cannot issue its own admission |
| Commit the handoff | Original Conversation Store creates a new Conversation and bound Run | Source history and grants remain unchanged |
| Consume the target Run | Target resumes using the original handoff identity | `target-created` does not mean execution completed |
| Read and publish | Original MCP Host, source owners, and Publication | Tool visibility, dispatch, and evidence are different facts |
| Read back and recover | Original History, Control, and Recovery | A lost acknowledgment is not proof that nothing executed |

The synthetic HTTP demo supplies an exact destination intent in the current user message:

```json
{
  "clientMessageId": "synthetic-demo-handoff",
  "content": "demo:public-comparison",
  "interactionProfile": "concurrent-conversation@1",
  "taskRestrictions": { "personalData": "deny" },
  "businessHandoffTarget": { "agentId": "private-cn" }
}
```

This fixed demo command tests an execution contract; it does **not** demonstrate a live model autonomously interpreting arbitrary investment requests. `businessHandoffTarget` constrains the destination of this specific submission. Main still has to use the trusted `request_business_handoff` control and satisfy the sealed model action, source Run, and Host checks. Merely writing “switch to private funds” in a message does not create a private business grant.

When the handoff is committed, the original Conversation Store creates a separate Conversation and its bound Run. The destination's first submission retains the exact original user text and provenance but is marked as application-derived, rather than pretending the user typed a new message in the destination. The original source Conversation, messages, and already committed answer are not rewritten.

Deduplication must use trusted source and destination identities, not simply a model-generated call ID. A repeated request after an uncertain acknowledgment must find the existing target or return an honest pending state. Creating a target, executing its Run, and committing a published answer are separate events. The browser therefore subscribes using the original target Run selector instead of submitting a fresh ordinary user message.

**Target selection is a semantic judgment; committing the handoff is a durable business effect; delivery belongs to the next execution.** A Router alone generally owns only the first.

## 3. The Manifest defines a ceiling, not a second authorization service

Each Business Agent is backed by a server-trusted Manifest: exact `agentId`, `operatorId` and `domain`, immutable prompt revision and content digest, approved Skill references, knowledge-source membership, requested MCP method names, and handoff and Memory policy.

A Manifest is important precisely because it is **not** an unrestricted grant. Three different decisions must still agree.

**Business declaration.** The chosen identity and its version must match trusted configuration. Its handoff policy constrains destinations and the maximum history-sharing mode.

**Run admission.** The verified account scope, current target eligibility where required, and compatible Manifest/policy revision establish the admitted execution. The accepted Run freezes its identity and permission version rather than allowing recovery to reinterpret it with today's configuration.

**Resource authorization.** The MCP Host and original data-source owner independently check the current Run grant, exact tool identity, source access, personal-data restrictions, bounded arguments, and resource constraints before dispatch.

These checks narrow capabilities at different stages. If a private-fund Skill says it can compare public funds, it can at most propose the two reviewed public-read methods. Without the Run's exact grant and the source owner's approval, the Host denies the call. A user-supplied `operatorId`, a model's claim of authority, or a remote tool description cannot mint an additional permission.

This resembles the resource- and attribute-based decisions described by NIST in [SP 800-162, Attribute Based Access Control (ABAC)](https://csrc.nist.gov/pubs/sp/800/162/upd2/final). Our adaptation deliberately reuses the existing Host, Run, and source owners; it does not claim to implement a generic ABAC platform or introduce a second policy engine.

## 4. Private eligibility and human consent answer different questions

The private-fund path requires an admission decision that ordinary language cannot supply. “I qualify as an investor,” or a remembered risk preference, is not proof of eligibility.

The prototype uses a trusted synthetic, read-only eligibility source. It produces `eligible`, `ineligible`, `pending`, `expired`, or `unavailable` with the relevant user scope, target operator, evidence revision, and effective window. Only a current, matching `eligible` result admits a **new** private Run. All other states prevent new private-model, private-knowledge, and private-MCP execution. They do not invalidate independently permitted public-fund research in the source Conversation. The entry gate cannot be replaced by a final model sentence apologizing for lack of permission.

Eligibility is also distinct from **confirmation of a specific handoff**, which in turn is distinct from **permission to disclose the source conversation**.

A same-operator handoff with no increased sharing can be automatic under trusted policy, but an automatic transition still passes private eligibility. Cross-operator transitions default to a typed human confirmation and isolated prior history. The interaction binds the exact source message, destination, operator, configuration revision, correction revision, and expiry. A confirmation is not a standing grant to all future data or a trading authorization.

Ordinary free-text “I agree” cannot substitute for the bound `confirmed` response. An expired confirmation, a decision invalidated by a corrected user intent, or a response for another account cannot be replayed to create a destination. If the acknowledgment is uncertain, the system reads the original interaction receipt and retries only with the same decision identity.

A real institution would need its own regulated suitability checks, legal definitions, disclosure rules, and potentially dynamic revocation. The prototype establishes the engineering relation **trusted synthetic eligibility → admission of a new Run**, not regulatory certification.

## 5. Directed MCP access: reuse public facts without sharing private power

Complete isolation is sometimes too restrictive. A qualified private-fund researcher may legitimately need the public profiles and historical NAVs of two funds. Sharing those bounded public observations is not the same as inheriting another operator's business authority.

The synthetic public-fund provider exposes exactly two read-only methods: `public_fund__get_fund_profile` and `public_fund__get_nav_history`. Calls accept reviewed fictional fund identifiers (`SYN-FUND-ALPHA` and `SYN-FUND-BETA`) and bounded date ranges. They do not accept free-form prompts, private customer details, account holdings, or arbitrary source references. The fixed dataset makes the original tool inputs, provenance, and resulting publication inspectable without real investors or suppliers.

The permission relationship is **directional**. A currently admitted private Run can call the specifically allowed public-fund methods through the Host. An ungranted public-fund identity cannot thereby call `private_fund__list_holdings` or read private knowledge, History, or Memory. The same rule applies when a prompt-injected page requests a forbidden method or someone crafts a direct Host call: tool descriptions cannot override the dispatch authority.

Public-fund evidence does not require private-account access. Conversely, private context must not be smuggled into a public supplier query as an argument, URL, or result field. The supplier sees the reviewed structured identifiers and options, not the private research's entire conversation.

If that optional public data source is unavailable, the honest output is a **local evidence gap** for that comparison—not a private-eligibility failure and not a reason to erase independently authorized content. Admission failure and supplier failure have different owners and different effects.

## 6. Three context-sharing modes without copying the original Conversation

The user wants to “continue where we left off.” Copying every message from the source Conversation into a new system prompt is tempting, but old history may contain original user text, committed assistant publications, transient tool payloads, expired source references, summaries, or operator-specific business data.

The handoff policy supports three distinct projections:

| Mode | What the target may receive | What it does not grant |
| --- | --- | --- |
| `isolated` | No previous business-conversation history by default | No implicit old prompts, tool outputs, or business Memory |
| `selective` | Explicitly selected messages or committed content, each rechecked against source and purpose | No laundering of refused material through a fresh summary |
| `full` | The complete **authorized set** from one specified source Conversation | Not access to all operators, attachments, tools, or private databases |

`full` is not shorthand for “copy all chats.” It still requires the trusted user scope, a permitted operator and purpose, and independent source-read rights. The positive full-sharing path was exercised under a bounded same-operator PostgreSQL composition. Cross-operator sharing defaults to isolation; even same-operator sharing is not permission-free.

Original user text remains byte-for-byte tied to its source message. Previous assistant content is re-read from the committed Publication, with its revision and digest checked. A tool cache, unverified memory-derived statement, or newly generated summary cannot impersonate an original publication. The target receives a scoped model-input projection; the source messages are not copied into the new Conversation's message table, and its old Run grant is not inherited.

Capacity introduces a further distinction: an authorized source collection can be larger than the model input that fits this turn. The design preserves original reference identities and handles capacity omission as complete items, rather than truncating the middle of a source and calling it fully consumed. The final answer's omission of sensitive words is not enough to prove isolation; the actual fitted gateway input and provenance receipts must be checked.

### Memory has its own lifecycle and ownership

Business Memory is governed separately from historical message projection. The synthetic prototype permits only narrowly typed, explicitly confirmed **global communication preferences**, such as response language or verbosity, to be shared across appropriate Agents. Risk preferences, insurance needs, and private research facts retain business/operator ownership, source provenance, and independent write and read purposes.

An unknown legacy Memory record cannot become global simply because its text or label says “shared.” Correction, forgetting, expiry, and temporary mode continue to apply. In bounded model-input observations, the insurance Agent received a confirmed communication preference while the source conversation text, operator A risk records, unconfirmed candidates, and unattributed legacy material remained excluded. That demonstrates scoped input behavior, not insurance-advice quality.

## 7. The UI must distinguish creation, execution, publication, and evidence

A new Conversation appearing in a list does not complete the user's job. Four different facts must be visible or recoverable:

- **Target created:** One destination Conversation and its bound original Run exist, but research has not necessarily executed.
- **Target executed:** The permitted model and tool requests actually produced effects, but an answer has not necessarily been committed.
- **Answer published:** The original Publication stored the accepted body, and History can read it back; the complete original source passages may still be unavailable.
- **Evidence identified:** Citations retain original result identity and available source metadata, but they do not guarantee that a full underlying passage can be opened.

In the lightweight HTTP demo, the browser subscribes to the original destination with `businessHandoffRunId`, the same `clientMessageId`, and the unchanged user content. It does not create a second ordinary message. Returning to the source, reopening the target, or refreshing the page should read the same committed Run, not trigger another research task.

View navigation is not an authorization event. A subscription can remain tied to its original Run while the user views another conversation; delayed delivery must not overwrite the currently displayed conversation. Once the original History owner confirms that Run's terminal result, an old “subscription unconfirmed” transport warning should not hide the committed outcome. Conversely, an unresolved transport failure must not be silently promoted to success.

For financial evidence, a citation also needs an honest display boundary. A public-fund result can be attributed to a registered structured tool and a data date even if the original passage was not retained. Showing a source label is different from opening its full raw content. A model must not invent a passage just to make the citation clickable.

Controlled browser and HTTP cases observed distinct source and target conversations, an independent target answer, two public-fund source identities, and consistent History on reopening. Confirmation, refusal, lost acknowledgments, and recovery were exercised in separate bounded scenarios. None of these alone constitutes a fully deployed, public three-business application.

## 8. Recovery continues an admitted Run; a new Run needs new admission

A handoff may pause for a human answer or survive an interrupted worker. Reconstructing “approximately the same request” from today's configuration is dangerous: the target identity, sources, or permission version may have changed, and repeating an uncertain effect may create duplicate work.

The cold-recovery exercise used **two independent OS processes**. Process A stored the source Conversation, destination handoff, frozen business Run, original grants, and selected context in PostgreSQL, then parked at a blocking human question and exited. Process B subsequently accepted the answer through the original HTTP endpoint and resumed the same Run through Control, SQL discovery, and Recovery. No temporary in-memory grant was transmitted from A to B.

Recovery checked the exact Run identity together with the source message, admitted business configuration, target handoff, and selected-context receipt. The resumed scripted gateway received the approved original user text and the human response; unselected assistant history did not enter the input. Within the business identities and revisions qualified by that exercise, the already accepted Run retained its frozen grant instead of being readmitted under current settings.

A **new** independent private-fund request is different. It reads the current eligibility source again. When the synthetic qualification expired, a new Run was refused while the previously admitted Run kept its original identity and followed the existing cancellation, budget, and recovery contract.

This does not imply universal exactly-once execution for every external side effect or real-time revocation during an existing Run. Irreversible actions and real institutional eligibility require stronger business-specific mechanisms. The generalizable distinction is narrower but crucial: **resume a proven old execution under its recorded authority; admit a new execution under current authority.**

## 9. What the engineering evidence proves

The original multi-business Handoff OpenSpec completed its bounded engineering close and was archived. Its recorded evidence includes focused offline execution, PostgreSQL/HTTP scenarios, a genuine process-A-exits/process-B-resumes window, and selected browser interactions. These observations support an end-to-end engineering claim under synthetic identities, fixed data, and scripted model behavior: the original Conversation/Run/Host path can commit, consume, publish, and recover a scoped business handoff.

They do not establish a live model's investment reasoning, real qualified-investor checks, licensed product integrations, ongoing production recovery rates, or physical separation among regulated entities.

For engineers authorized to use the private prototype, the lightweight local option is:

```bash
cd agent-app
DEMO_BUSINESS_HANDOFF=true npm run demo:api
```

It uses fictional accounts, a deterministic gateway, in-process synthetic fund sources, and a loopback listener. It must not be reverse-proxied into a public service. The internal HTTP runbook creates a default Conversation, submits one source request with `businessHandoffTarget`, reads the resulting destination's Run selector, subscribes to that exact Run, and compares committed Publication and History. This lightweight option is not the full PostgreSQL cross-operator confirmation, insurance, Memory, and cold-recovery environment. The writing of this article did not independently rerun that command.

The public [Open ETF Agent](https://github.com/hpoenixf/open-etf-agent) is a separate teaching implementation and does **not** currently provide an equivalent complete multi-business handoff. This article is a documented synthetic engineering case, not a claim that readers can already install the entire architecture from that public repository.

## 10. When is a Router enough?

If one authorized user is asking one research Agent to switch between “explain this NAV series” and “summarize this report,” a Router or a different Skill inside the same Agent may be the correct, simpler design. Separate Conversations, eligibility readers, Memory ownership, approval receipts, and recovery protocols are not justified merely because a diagram looks cleaner with several Agents.

Additional contracts become necessary when the transition changes **business admission, operating authority, data ownership, disclosure purposes, or durable effects**. At that point the Router can remain a semantic entry point, but it must not become an implicit source of authority.

This choice has real engineering costs: versioned identities, deduplicated handoff effects, source-by-source checks, old-versus-new Run lifecycle rules, and precise UI state. We kept those costs at the existing authority owners rather than introducing another model loop, another Memory engine, or a competing permission service.

Return to the opening user request. Successfully moving from public-fund research to private-fund research is not merely selecting the correct Agent name. It means the destination is admitted, the appropriate original facts cross the boundary, bounded public evidence remains usable, user confirmation is attributed to the right request, and recovery preserves the identity of what already happened. **Once those facts have trusted owners, the Router itself can stay simple.**

Further reading: [Models Understand; Code Authorizes](/en/articles/011-model-understands-code-authorizes) and [After an Agent Asks: Durable Human Response Adoption](/en/articles/agent-durable-human-interaction-response-adoption). Questions and Stars are welcome at the [ETF Agent Engineering Notes repository](https://github.com/hpoenixf/eff-agent-article).
