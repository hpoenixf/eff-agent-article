# Stop Making the Model a State Machine: Simplifying an Agent Protocol

I originally wanted an Agent that could help me research investment funds. After connecting the model, tools, and Recovery, the hardest part was not improving the answers. It was separating **what the model should judge** from **what Runtime must know and persist**.

One refactor left me with two complementary principles:

> **Do not ask the model to maintain facts Runtime already knows.**

> **Do not pretend Runtime knows semantic facts just because someone can write a rule for them.**

The first removes the model's shadow copy of system state. The second prevents Runtime from becoming an unjustified semantic judge.

System state still needs rigorous Host persistence. What disappears is duplicated model-generated descriptions of permissions, execution results, and Publication status.

## 1. A Serious Agent Contains Two Different Types of Complexity

Our scenario is a personal investment-research Agent. It can read authorized portfolio data, documents, and public sources, and produce research. The model cannot directly authorize or execute investments.

A simplified flow is:

~~~text
User question
→ Model chooses the next information need
→ Runtime invokes permitted tools
→ Model researches further or drafts from results
→ Runtime checks objective rules and publishes or settles
~~~

Two complexities coexist.

**Semantic complexity** includes user intent, what to investigate next, conflicting evidence, clarification needs, and how to explain a conclusion.

**System complexity** includes whether a tool exists and is authorized, whether an invocation actually ran, whether a result returned and persisted, whether citations remain in scope, whether Publication committed, and whether the Run is terminal.

The fact that both are complex does not make them the same responsibility.

**Runtime** is Host-owned execution and state: permission, tool execution, persistence, authoritative evidence/numbers, Recovery, Publication, and Run settlement.

**Model** interprets, investigates, compares, proposes steps, and communicates.

~~~mermaid
graph TD
UserQuestion --> Model
Model --> Runtime
Runtime --> Tool
Tool --> Model
Runtime --> Answer
~~~

The diagram does **not** mean the model owns Runtime state. It sees current eligible tools and returned results; Host retains actual invocation, result, and state-transition facts.

## 2. How AgentTurn Became a Cognitive Tax

Simple Agents start:

~~~text
User → Model → Answer
~~~

Once tools, audit, and Recovery enter the picture, developers want to know what the model intends, which gaps remain, and whether the task is complete.

A structured **AgentTurn** seems natural:

~~~json
{
  "actions": ["search"],
  "gaps": ["More source evidence is needed"],
  "completionClaim": false
}
~~~

This was not inherently wrong at first. Runtime could validate proposed actions, log the turn, and continue.

The protocol, however, naturally grows. Reliability demands introduce state, gaps, permissions, visible tool lists, Publication status, and completion claims into every model response.

Now the model must:

~~~text
Understand and research
+
Maintain system state
~~~

The latter is usually a **state mirror**.

Runtime already knows whether capabilities are approved, tools succeeded, Publications committed, and Runs ended. A model-generated version has no independent authority.

The system now carries both:

~~~text
Model-described state
Actual Host state
~~~

Whenever they disagree, Host must win. Yet the model mirror still has to be generated, parsed, validated, and repaired.

That is the cognitive tax.

It introduces at least three problems:

1. **State drift.** Runtime denies permission, but the model's history still describes the tool as available.
2. **Wasted attention.** The model spends capacity maintaining protocol consistency instead of choosing useful research.
3. **Excessive repair scope.** One invalid field can invalidate an entire turn and provoke a full-response retry.

Fewer fields do not automatically make models smarter. The better rule is:

> **Only fields carrying semantic information uniquely supplied by the model deserve space in the model protocol.**

A teaching calculation illustrates why large protocols are demanding. If, **hypothetically**, twenty independent fields each have a 95% correctness rate, the chance all twenty are correct is **0.95^20 ≈ 35.8%**.

This is **not** a project measurement or a claim about real model reliability. It only shows why requiring many mutually dependent system-state fields deserves scrutiny.

### Let the Owner of the fact maintain it

The **model** should decide what the user means, which evidence matters next, how to formulate a search, whether findings conflict, whether to investigate further, and how to explain the conclusion.

**Runtime** should record eligible capabilities, actual calls, returned/persisted results, real Publication commits, source scope, and remaining budget/lifecycle state.

The former is open-ended judgment; the latter comprises **Host-verifiable facts**.

**The Owner of the fact maintains the fact.** The model is not a database or an authorization server.

## 3. From Full-Turn State Descriptions to Native Tool Calls

The old interaction was:

~~~text
Model
→ AgentTurn JSON
→ Runtime interprets entire turn state
~~~

The newer flow is:

~~~text
Model
→ Native Tool call
→ Host persists ModelTurn
→ Runtime executes
→ Tool result
→ Model
~~~

The key change is not merely switching API syntax. The model stops describing **the entire current system state**. It proposes a next semantic action:

~~~text
search(...)
read(...)
publish(...)
finish(...)
~~~

Which tool is appropriate depends on the current evidence and permission set.

### Removing AgentTurn does not remove Host ModelTurn

We retired a model-generated whole-turn state protocol. We did **not** remove the Host-owned durable **ModelTurn**.

After a model response closes, Host still records:

~~~text
ModelTurn content
Proposed tool invocations
Invocation ordering
Which operations executed
Which results persisted
Execution receipts
~~~

**Model no longer maintains system state ≠ system no longer maintains state.**

Recovery should depend more strictly on real persisted events, not on what the model claimed previously happened.

## 4. finish() Proposes Completion; It Does Not Set Terminal State

The old field **completionClaim = true** was easy to read as a declaration that the model had completed the task.

A clearer protocol allows a tool call:

~~~text
finish()
~~~

It means:

> **The model believes the semantic investigation can finish.**

This is a proposal, not authority to write a terminal business fact.

Runtime then checks objective termination gates:

~~~text
Does a formal output exist?
Are current citations eligible?
Are there unsettled invocations?
Does this Run currently permit a terminal transition?
~~~

Runtime must **not** use the gate to pretend it can objectively determine whether the user question was completely answered, enough risks were discussed, or every meaningful counterexample was investigated.

Termination guards must be strict about the facts they own and modest about the semantic ones they do not.

Runtime may refuse an objectively unsafe termination. It cannot silently impersonate a judge of answer quality.

## 5. Permissions, Visibility, and Dynamic Tool Contracts

Dynamic capabilities illustrate this separation particularly clearly.

Suppose the model sees only basic tools and proposes, in one response:

~~~text
1. Request document capability
2. Ask the user for more information
~~~

Runtime executes the first action and approves document access. A subsequent turn can now see:

~~~text
search_document
read_document
~~~

The second action proposed under the old tool contract must not cross that admission change merely because it appeared in the same model response.

The issue is not whether clarification is semantically good. The objective fact is:

~~~text
Old tool contract ≠ New tool contract
~~~

A safe progression is:

~~~text
Capability approved
→ Tool contract changes
→ Stop executing remaining actions from old response
→ Start a new ModelTurn
→ Model chooses next step under the new visible tools
~~~

This guards the permission and tool scope under which each action was proposed. It does not preselect whether the next action should search or clarify.

Runtime derives the actual per-turn tool set from current user authorization, task constraints, source state, and approved capabilities.

The model does not maintain an **availableTools** shadow state; its next request receives the real **tools[]**.

Keep three separate concepts:

~~~text
Permission      → Host / Runtime maintains
Tool visibility → Host / Runtime derives
Tool selection  → Model decides
~~~

This prevents drift while treating capability changes as explicit contract transitions.

## 6. Local Errors Should Have Local Effects

A heavyweight turn protocol often behaves like:

~~~text
One invalid field
→ Entire AgentTurn invalid
→ Repair
→ Regenerate complete state description
~~~

Native tool calls can be evaluated individually.

For example:

~~~text
Call A: valid
Call B: invalid arguments
~~~

The preferred outcome is:

~~~text
Execute A and persist its result
Return a safe attributable error for B
Begin next ModelTurn
Let the model decide whether to correct B
~~~

Error correction remains possible. But it is ordinary reasoning over an observed tool result, not a hidden second full-turn protocol.

Local failure isolation avoids regenerating the world's supposed state merely to fix one argument.

## 7. Historical Compaction Must Not Rewrite Host Facts

The same ownership rule applies to context compression.

A model may summarize earlier answers, but the user's original constraints must not be silently replaced by a summarizer's rephrasing and then treated as an authoritative system fact.

Runtime already stores original inputs. It must decide how they remain represented or are omitted rather than transferring fact ownership to a separate model.

## 8. Four Stages of Agent Protocol Evolution

| Stage | Shape | Trade-off |
| --- | --- | --- |
| Prompt-only Agent | User → Model → Answer | Natural, limited engineering control |
| Structured Agent | Structured model output → Runtime → Tools | Validation, audit, and Recovery become possible |
| Heavy protocol Agent | State, permissions, completion claims in every model response | Comprehensive but increasingly burdensome state mirror |
| Native-tool Agent | Model proposes calls; Runtime keeps factual state | Engineering boundaries remain; model mirroring disappears |

The final stage is **not** a return to a prompt-only Agent. It preserves persistence, audit, authorization, Recovery, and terminal checks, while eliminating redundant model ownership.

## 9. Do Not Turn Every Semantic Question into a Runtime Rule

There is another half to protocol simplification: removing model-owned system facts does **not** authorize Runtime to decide all meaning.

**Deterministic implementation is not the same as objective judgment.**

### Matching strings does not establish factual assertions

A tempting rule might look for phrases such as "your portfolio," "current holdings," and "you do not hold" when a model has not read holdings, then demand portfolio evidence.

But the same sentence could be a hypothetical example, quotation, negation, or genuine claim. Keyword checks may falsely reject examples while alternative wording bypasses the restriction.

Adding more keywords and repair turns does not answer the ownership question: **what evidence gives this rule authority to classify the statement?**

Personal holdings must come from authorized portfolio reads, source identity, time definitions, and actual state binding. Free text may interpret facts but cannot mint permission, trusted monetary values, or holding identities.

### Execution receipts and answer wording are different facts

The model writing "I've completed the adjustment" cannot execute an investment operation.

The system must check the explicit proposal, user confirmation, execution call, and actual receipt—not parse "completed" or "ordered" as proof of a world effect.

Receipt outcomes also cannot be reduced to "receipt present = success, absent = not executed." Confirmed execution, known non-execution, failure, and unknown effects all matter. Absence of a receipt does not alone prove nothing happened.

This concerns fact ownership; it grants **no new investment-execution permission**.

When prose conflicts with recorded state, improve the explanation. Do not rewrite the ledger or convert the prose into an execution receipt.

### A passed text-rule repair does not prove a semantic correction

Suppose a first answer states a current figure and triggers a keyword rule. A second answer removes the number, substitutes vague language, and passes.

The mechanical check changed. That does not prove the underlying belief or conclusion was corrected; the model may simply have rephrased.

Likewise, source readback, inclusion in model input, and valid citations prove a traceability path, not correct interpretation of the evidence.

The source may say **A** while the answer says **B**, even with an authentic citation. See [Why Citations Don't Prove Reliability](ai-citations-do-not-prove-reliability.md).

### Where mechanical text checks remain appropriate

IDs, cursors, protocol markers, JSON syntax, length, and explicitly protected literal values remain suitable for deterministic validation.

But a syntax/size issue should affect the corresponding field or effect. It should not automatically gain authority to delete independent valid answer text or abort finalization.

When reviewing a hard rule, ask who supplied its input, which effect the module owns, whether paraphrasing changes the outcome, and whether repair changes **facts or wording**.

Retain strict permissions, scopes, monetary authority, and persistence rules. Leave semantic questions about support and completeness to the model and appropriate review.

## 10. Hard Outside, Soft Inside

A better design is **hard on the outside and soft on the inside**.

The outer Runtime strictly governs:

~~~text
Permissions
Tool contracts
Scope
Persistence
Execution receipts
Recovery
Publication
Terminal state
~~~

The inner model handles:

~~~text
Understanding
Investigation
Comparison
Skepticism
Follow-up
Explanation
~~~

Strict execution boundaries keep the system honest. Open semantic space lets the model do the work it is actually good at.

## 11. Five Questions for Code Review

Before adding a model field or another Runtime state, ask:

1. Who truly owns this information, and can Runtime determine it uniquely?
2. If Runtime already knows it, why make the model output a shadow copy?
3. Is this field a model-only semantic judgment or a fact that happened?
4. Is **finish()** a semantic proposal, or an unauthorized write to terminal state?
5. Does Recovery use durable facts and receipts or the model's self-reported history?

Unclear answers are a sign the protocol is growing heavy or crossing a responsibility boundary.

## 12. What This Refactor Did Not Prove

Clearer ownership does **not** establish better model intelligence, lower costs, shorter latency, or higher investment-research quality.

Fewer fields cannot alone prove deeper research or higher success rates.

The directly supported architectural claims are:

~~~text
Which states the model no longer maintains
Which facts Host now owns
Which Recovery paths no longer depend on self-reported state
Which permission and Publication gates are objectively enforced
~~~

Protocol design and real-world product value require separate evidence.

This protocol reduction is an application of [principle 1, “The model interprets meaning; the system owns objective facts”](/en/principles#principle-1). We stopped asking the model to reproduce execution state while keeping permissions, receipts and Recovery facts under Host authority; string rules do not become semantic judgments just because they are deterministic.

## Conclusion

Two rules are enough to anchor this redesign:

> **Do not ask the model to maintain facts Runtime already knows.**

> **Do not pretend Runtime knows semantic facts it cannot establish.**

The model should understand the question, compare evidence, and choose next steps. Runtime should remember which calls really happened, whether permission is valid, and whether text committed.

Separating them makes the model protocol lighter **without discarding the facts required for reliable Recovery**.
