---
title: "Stop Making the Model a State Machine: Simplifying an Agent Protocol"
description: "Model-owned semantics, Host-owned execution facts, native tool calls, finish proposals and the dangers of Runtime semantic guesses."
---

# Stop Making the Model a State Machine: An Agent Protocol Simplification

Originally I wanted an agent to help research investment funds. After adding models, tools and recovery logic, the hardest part was not expanding its answers. It was deciding **which judgments belong to the model and which facts the Runtime must preserve**.

After one refactoring, I wrote down a rule:

> **Do not make the model maintain facts the Runtime already knows.**

It must be paired with another:

> **Do not make the Runtime pretend to know what it cannot know just because a rule can be written.**

The first removes model-maintained state mirrors. The second prevents the Runtime from becoming a fake semantic judge. The Host still persists system state; we remove the model's redundant descriptions of permissions, tool outcomes and publication status.

## Two Kinds of Complexity in a Serious Agent

Consider a personal investment research agent. It can read a portfolio and public or authorized research materials and form conclusions, but the model itself cannot execute investments.

A simplified sequence:

~~~text
User asks a question
→ Model identifies useful evidence and next steps
→ Runtime executes authorized tools
→ Model studies returned results and explains conclusions
→ Runtime checks objective boundaries and publishes or ends
~~~

The task has two different kinds of complexity.

**Semantic complexity** concerns the user's real intention, useful next sources, contradictions between documents, when to clarify, and how to explain a conclusion.

**System complexity** concerns tool registration and authorization, actual dispatch, durable result receipts, citation eligibility, committed publication and final Run state.

Both are difficult. Difficulty does not make them the responsibility of the same owner.

The **Runtime** is the Host-owned execution and state layer. It owns authorization, tool execution, persistence, authority over provenance and numeric facts, recovery, publication and terminal-state transitions.

The **Model** interprets, investigates, compares, proposes next steps and writes explanations.

~~~mermaid
flowchart TD
  U["User question"] --> M["Model"]
  M --> R["Runtime"]
  R --> T["Tool"]
  T --> M
  R --> A["Answer"]
~~~

The arrows do not mean the model owns Runtime state. It receives tools and returned results that it is currently allowed to use. The Host preserves actual calls, results and state transitions.

## Why AgentTurn Became a Cognitive Tax

Early agents start with a light path:

~~~text
User → Model → Answer
~~~

After tools, audit and recovery, it seems useful to ask what the model intends to do, what is missing and whether a turn is complete.

A structured AgentTurn emerges:

~~~json
{
  "actions": ["search"],
  "gaps": ["Another source is needed"],
  "completionClaim": false
}
~~~

At first this is not a mistake. Runtime can validate proposed actions and record turns.

The problem is continuous growth of the protocol. As reliability requirements increase, state, missing data, permissions, available tools, publication status and completion declarations are all added to model output.

The model then does two jobs:

~~~text
Interpret and research
       +
Maintain a mirror of system state
~~~

The second is usually redundant. Runtime already knows whether a capability was admitted, an invocation succeeded, an answer was committed and the Run ended.

Forcing the model to report these facts every turn creates two versions:

~~~text
State described by the model
Actual state owned by Runtime
~~~

When they conflict, Runtime must win. The model version is not authoritative, yet it still needs tokens, parsing, validation and repair.

That is the **cognitive tax**.

It causes three recurring failures:

1. **Mirror drift:** Runtime revokes a tool while the model's historical state still calls it available.
2. **Attention diverted to protocol:** Model effort goes into consistency fields instead of research.
3. **Whole-turn retries:** One mismatched field can escalate a local problem into regeneration of the entire protocol.

Fewer fields do not guarantee a smarter model. The narrower lesson is:

> **Only fields that convey genuinely model-owned semantic information belong in the model's protocol.**

If one assumes, for illustration only, that each field is 95% correct and independent, then twenty fields all being correct has probability **0.95^20 ≈ 35.8%**. This is **not an observed metric or a reliability estimate for any model**. It merely illustrates why adding dependent system-state obligations to structured output deserves caution.

### Facts Belong with Their Owners

The model should judge:

- What the user is trying to accomplish.
- Which evidence to seek next.
- How to formulate a search.
- Whether sources conflict.
- Whether further investigation is worthwhile.
- How to explain the result.

Runtime should establish:

- Which tools exist and are authorized now.
- Which invocation actually happened.
- Which outputs returned and were persisted.
- Which answers were committed.
- Whether citations remain eligible.
- Whether budgets and Run state permit continuation.

One set requires open semantic judgment; the other consists of facts the Host can independently establish.

**Who owns a fact maintains that fact.** A model is neither the database nor the permission system.

## From Full-Turn Descriptions to Native Tool Calls

The old pattern was:

~~~text
Model → AgentTurn JSON → Runtime interprets the whole state
~~~

A smaller protocol is:

~~~text
Model → Native tool call
      → Host seals the ModelTurn
      → Runtime executes
      → Tool result
      → Model
~~~

The difference is deeper than using an SDK's native function-call syntax. The model no longer describes the complete current system state. It proposes **the next semantic action**.

For example, it may search, then read the resulting source, then publish eligible text, and finally propose finishing:

~~~text
search(...)
read(...)
publish(...)
finish()
~~~

The protocol moves from “describe your entire workflow state” to “perform the next sensible step.”

### Removing AgentTurn Does Not Remove ModelTurn

We removed the full-turn **state protocol produced by the model**, not the durable **ModelTurn boundary owned by the Host**.

After a complete model response, the Host still records its content, tool proposals, order, which actions actually executed, which outputs were persisted and their receipts.

Therefore:

~~~text
Model does not maintain state
                ≠
System does not maintain state
~~~

If anything, durable system facts become more important. Recovery must use what actually happened, not what a model previously claimed happened.

## finish() Is a Proposal, Not a Terminal-State Write

The old completionClaim=true could be misunderstood as the model declaring the task officially complete.

The clearer finish() call means only:

> **The model believes semantic research can end.**

It is a proposal. It grants no authority to set terminal state.

Runtime then checks conditions it can objectively verify: has a formal output been submitted, are current citations eligible, are invocations settled, and is the Run allowed to enter a terminal state?

It should not use that gate to decide whether the user's question was answered deeply enough, whether every risk was explained or whether counterexamples were exhaustively examined. Those are semantic judgments, not independently known Host facts.

The terminal gate should be strict without pretending to be omniscient. It may reject an objectively unsafe transition; it must not masquerade as a universal answer-quality judge.

## Permissions, Tool Visibility and Capability Changes

Dynamic capability admission is one of the clearest Runtime responsibilities.

Suppose a model sees only basic tools and proposes two actions in one response:

~~~text
1. Request document-reading capability
2. Ask the user for more information
~~~

Runtime executes the first action, and document capability is approved. The visible tool set for the next turn may now include search_document and read_document.

The second action, proposed against the **old tool contract**, must not simply cross into the new one.

That is not because Runtime semantically judges asking a question inappropriate. It is because of an objective contract change:

~~~text
Old tool contract ≠ new tool contract
~~~

The deterministic boundary is:

~~~text
Capability approved
→ Tool contract changes
→ Remaining actions from the old response are not executed
→ Start a new ModelTurn
→ Let the model decide against the new tool set
~~~

This protects the scope and tools available **when the proposal was made**. It does not predetermine whether the model should search or clarify next.

Tool visibility follows the same ownership split. Runtime derives the actual tools[] for each turn from the user's permission, task policy, source availability and approved capabilities. The model does not maintain an availableTools mirror.

~~~text
Permissions → Runtime owns
Tool visibility → Runtime derives
Tool selection → Model decides
~~~

This prevents mirror drift while making permission changes explicit tool-contract boundaries.

## Local Errors Should Produce Local Outcomes

A heavy turn protocol commonly creates:

~~~text
One invalid field
→ Entire AgentTurn invalid
→ Repair request
→ Regenerate the full protocol
~~~

Native tool calls can often be evaluated separately.

If **Call A** is valid but **Call B** has invalid parameters, a more appropriate sequence is:

~~~text
Execute A and persist its result
Return a safe, attributable error for B
Begin another ModelTurn
Let the model decide whether to repair B
~~~

Repair remains possible, but it becomes normal model reasoning over tool feedback, not a hidden second Runtime turn protocol.

Local fault isolation prevents one parameter mistake from requiring regeneration of an entire description of the world.

## Compaction Must Not Rewrite Host Facts

The same principle applies to history compaction. A model may summarize old conversation, but the user's original constraints must not be rewritten by a summary model and then treated as new system facts.

When Runtime has the original input, it decides how to preserve or omit it. It should not transfer fact ownership to another model.

## Four Stages of Protocol Evolution

| Stage | Shape | Benefit and cost |
| --- | --- | --- |
| Prompt-only agent | User → Model → Answer | Natural but limited engineering control |
| Structured agent | Structured model output → Runtime → tools | Validation, audit and recovery become possible |
| Heavy-protocol agent | State, permissions and completion declarations included each turn | Extensive detail, but expensive state mirroring |
| Native tool-call agent | Model proposes calls; Runtime owns facts | Keeps engineering controls without forcing the model to mirror them |

The last stage is **not** a return to an uncontrolled prompt-only agent. It retains persistence, audit, permission checks, recovery and terminal gates, while removing duplicate model-side status maintenance.

## Runtime Must Not Convert Every Semantic Question into a Rule

Protocol simplification has a second side. Removing model-owned system facts does not authorize Runtime to decide every open semantic question.

**A deterministic implementation is not necessarily an objective judgment.**

### Matching a Phrase Is Not Verifying a Fact

A seemingly sensible rule might flag an answer like “your portfolio currently has no exposure to this asset” when the portfolio was not read, based on substrings such as “your portfolio” and “currently no holdings.”

But the same wording can appear as a hypothesis, quotation, negation or educational example. String matching can reject legitimate teaching material and miss equivalent claims phrased differently.

Adding more keywords and repair loops does not solve the more basic question: **does this module possess the evidence to certify that judgment?**

Personal holdings must come from an authorized portfolio read, source identity, time basis and status binding. Free text may explain the facts; it cannot manufacture permissions, certified amounts or portfolio identity.

### Execution Receipts Are Separate from Prose

If a model writes “I have completed the rebalance for you,” no trade occurs merely because the sentence exists.

The system must check the explicit request, user confirmation, execution tool and actual receipt—not infer real-world state from words such as “completed” or “ordered.”

Receipts also cannot collapse into “receipt exists = success; receipt missing = never executed.” Confirmed execution, confirmed nonexecution, failure and **unknown effects** require distinct records. Missing a receipt is not enough to conclude that an external action did not occur.

A text/receipt conflict is an explanation-quality problem. It does not justify altering the ledger or treating prose as execution evidence. None of this changes investment execution permissions.

### Passing a Keyword Repair Does Not Prove Semantic Correction

Suppose the first answer states an unsupported current value and a keyword rule rejects it. On the second attempt, the model removes the number and writes a vague sentence that the rule no longer matches.

The mechanical repair may pass, but the underlying factual problem might not be solved—only the wording changed.

Similarly, source retrieved, model input populated and citation attached establish traceability, not truth of interpretation. If a source says A and the answer says B, perfect citation identity does not make B supported.

The [citation reliability essay](ai-citations-do-not-prove-reliability.md) explores this distinction.

### Which Text Checks Are Still Appropriate?

IDs, cursors, protocol markers, JSON syntax, length limits and explicitly protected literals are suitable for deterministic checks.

Even syntax or capacity failures should constrain only the relevant field or effect. They must not automatically acquire power to erase independently eligible answer text or terminate an entire useful Run.

When reviewing a hard rule, ask:

1. Who provided its input?
2. Which effect does this module actually own?
3. Does paraphrasing the same meaning change its decision?
4. Did a repair change the underlying fact or merely its wording?

Keep concrete permission, scope, numeric authority and persistence rules. Let the model and semantic reviewers evaluate whether a source supports a conclusion or whether research is sufficient.

## A Hard Outer Shell and a Flexible Semantic Core

A healthier agent is **hard outside, soft inside**.

Runtime strictly maintains:

~~~text
Permissions, tool contracts, scope, persistence, execution receipts,
recovery, publication and terminal state
~~~

The model handles:

~~~text
Interpretation, investigation, comparison, doubt,
additional source reads and explanation
~~~

Strict execution controls keep system claims honest. An open semantic space lets the model do the work it is genuinely good at.

## Five Code Review Questions

Before adding a model field or Runtime state rule, ask:

1. Who truly owns this information? Can Runtime determine it uniquely?
2. If Runtime already knows it, why make the model output a mirror?
3. Is the field uniquely semantic information from the model, or a fact that has already occurred?
4. Is finish() a semantic completion proposal, or a covert write to terminal state?
5. Does recovery depend on actual persisted facts and execution receipts, or the model's self-reported state?

If the answers are unclear, protocol weight or ownership is probably creeping in.

## What This Upgrade Did Not Prove

Clearer ownership boundaries do not, by themselves, establish improved model quality, cost, latency or financial research.

Reducing protocol fields is not direct evidence that answers became smarter, research became deeper or token spending fell. Those claims require comparable real evaluations.

The change directly clarifies:

~~~text
Which fields the model no longer maintains
Which objective facts the Host now owns
Which recovery paths no longer depend on model claims
Which permission and publication constraints are objectively enforceable
~~~

Protocol architecture and product impact must be evaluated separately.

## Conclusion

Two rules are enough to steer this style of protocol:

> **Do not ask the model to maintain facts the Runtime already knows.**

> **Do not make Runtime pretend to know things it cannot know.**

The model interprets questions, compares sources and chooses next steps. Runtime preserves what actually executed, which permissions applied and what answers committed.

Keeping that division precise lets the protocol become smaller without discarding the durable facts needed for recovery.
