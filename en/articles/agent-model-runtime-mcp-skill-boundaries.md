# From Asking the Model to Do Less to Asking Runtime to Own Less: Model, Runtime, MCP, and Skill Responsibilities

**When adding AI to an application, the hard part is not only making it do things. It is deciding who is responsible for each thing.**

Consider a teaching example. A teammate asks an assistant to compare two fund documents and save a report. The model can understand which terms changed. A reading tool retrieves the actual files. Storage confirms whether the report was written. A single “supervisor” might appear convenient, but it becomes harder to say whose decision is authoritative when something fails.

This article asks an ordinary system-design question: **Which decisions require understanding, and which should be made from facts by tools and programs?** We begin with four roles, then revisit two actual directions in ETF Agent: asking the model to maintain too much execution state and later allowing Runtime to duplicate business-tool definitions.

Here **Model** interprets and selects; **Skill** provides a method; **MCP tools** expose available capabilities; and **Runtime** records permissions, calls, and outcomes. This is a responsibility map, not a demand to deploy four separate services. Historical claims reflect September 2026 records; a proposed replacement is not automatically a completed migration.

## 1. “I saved the report” is not proof that a file exists

An early design made the model return a structured `AgentTurn`, including the next action, evidence gaps, and a completion claim:

~~~json
{
  "actions": ["search"],
  "gaps": ["More source evidence needed"],
  "completionClaim": false
}
~~~

That was reasonable at the time. Research unfolds in steps, and the system needed to explain continuation. But as permissions, budgets, receipts, and publication status accumulated, the model was repeating state that the host already knew. What happens when its completion claim conflicts with a missing save receipt?

Research therefore moved toward native tool calls: the model proposes what to read next, while the program records the actual call, its authorization, and its outcome. **The model may revise its judgment, but its narrative cannot rewrite an executed operation.**

## 2. Programs record execution facts; they do not choose the research thesis

“How many reads remain?”, “Was the file really saved?”, and “Is this private document in scope?” have verifiable answers. Runtime and the relevant effect owner should determine them from real records rather than model guesses.

But the opposite extreme is also wrong. “Check reporting dates before comparing two funds” is a research method, not process scheduling. “Which portfolio data can be read” belongs with the tool that provides those capabilities. **Knowing how to execute a call safely does not confer authority to redefine its business meaning.**

## 3. Why maintaining the same tool definition three times hurts

The September 2026 tool cleanup exposed a practical issue: names, parameters, and routing for a single tool had multiple maintainers. Updating “read fund holdings” in one place could leave another place using an outdated name or shape.

The first improvement was to derive these mappings from one contract. That reduced drift, but it left a deeper question: **Does the remaining definition belong to the party that actually provides the data capability?**

The [tool-visibility article](/en/articles/agent-model-capability-presentation-tool-surface) examines what descriptions reach the model. Here we ask who owns those descriptions and their decisions.

## 4. When a tool can “read a specific holding,” why wrap it as “read everything”?

A portfolio tool already exposes distinct capabilities, such as listing a portfolio, reading one position, or inspecting a group of holdings. Research once placed a broader `read_portfolio` wrapper above those capabilities. The result was a second place defining what a tool meant.

Think of a library that already supports searches by title, author, and subject. A reception desk that only accepts “find me a book” can check membership and borrowing limits, but it should not invent its own conflicting catalog.

The intended direction is to let a capability provider define its tool and let Runtime retain authorization, budgets, receipts, and output limits. The historical replacement **was not fully completed in one step**: consuming discovered tool descriptions is narrower than retiring every legacy wrapper.

A useful design test is to imagine deleting the intermediate wrapper. Would the required protections still hold, while duplicate names and mappings disappear? If so, the wrapper may have been moving complexity rather than hiding it.

## 5. Four Layers, Four Kinds of Complexity

~~~mermaid
graph TD
UserQuestion --> ModelSelectsAction
SkillGuidance --> ModelSelectsAction
ModelSelectsAction --> AvailableTools
AvailableTools --> PreToolHook
PreToolHook --> McpTool
McpTool --> PostToolHook
PostToolHook --> ModelContinues
RuntimeLifecycle --> AvailableTools
RuntimeLifecycle --> PreToolHook
RuntimeLifecycle --> PostToolHook
~~~

Additional relationships in the diagram are **advisory or supporting**: SkillGuidance helps ModelSelectsAction; RuntimeLifecycle supports AvailableTools, PreToolHook, and PostToolHook.

It illustrates responsibility. Existing implementation and local regressions reflect some of this separation, but the picture is **not** evidence that all deployments, Recovery combinations, and live-model paths have passed acceptance.

### Model: semantic complexity

The model interprets intent and ambiguity:

~~~text
What is the user really asking?
What information is missing?
Which source category should be examined next?
Which side of conflicting evidence needs investigation?
How should the result be explained?
~~~

These decisions are not universally expressible as deterministic rules.

### Skill: methodological complexity

A Skill is a reusable method for a class of problems, not a data service.

For example, "Are my fund holdings redundant?" may need:

~~~text
Inspect the whole portfolio
→ Check concentration
→ Read relationship evidence for candidate funds
→ Distinguish same product, same index, and measured constituent overlap
→ State data date and coverage
~~~

Skills may declare allowed tools, required attempts, or suggested answer structure. They should not independently download holdings, own sourceRef lifecycles, cache pages, or implement Recovery.

**Skills describe how this kind of task should be approached.**

### MCP: capability complexity

MCP answers **what the system can do**.

The owner providing a business Tool should define its identity, description, input schema, and output semantics:

~~~text
portfolio__get_bucket_holdings
~~~

This method already states a concrete capability: read holdings in a Portfolio bucket. Rewrapping it as a vague Runtime business Tool and mapping it back adds no inherent value.

**MCP is a capability interface, not merely a data connector.**

### Runtime: process complexity

Runtime determines how one Run progresses:

~~~text
Phase
Budget and usage
Cancellation
Checkpoint
Recovery
Receipt
Continuation
Publication orchestration
Terminal condition
~~~

It can state:

~~~text
remainingReadActions = 3
phase = finalization-only
~~~

It should not redefine which business methods belong to Portfolio, Market, or Web merely because it owns those process facts.

## 6. One Portfolio Question, Four Different Responsibilities

Consider the **synthetic** user request:

> Which funds do I hold in my dividend/low-volatility bucket, and is the exposure too redundant?

The following is a teaching example, not a real holding record or current wire contract.

The model interprets the task:

~~~json
{
  "goal": "Inspect composition and potential redundancy in the dividend/low-volatility bucket",
  "nextStep": "Read this bucket's holdings, then fetch relationship evidence as needed"
}
~~~

The Skill provides methodology:

~~~text
Do not infer redundancy from fund names.
Separate product relationships, identical benchmarks, and measured constituent overlap.
Partial look-through coverage is not a full-portfolio overlap ratio.
~~~

MCP provides actual capabilities:

~~~text
portfolio__get_bucket_holdings
portfolio__get_portfolio_relationships
~~~

A simplified bucket-read result might be:

~~~json
{
  "bucket": "dividend_low_volatility",
  "items": [
    {
      "fundCode": "F001",
      "fundName": "Example Fund A",
      "value": 10000,
      "weight": 0.08
    },
    {
      "fundCode": "F002",
      "fundName": "Example Fund B",
      "value": 7000,
      "weight": 0.056
    }
  ],
  "coverage": {
    "requested": 2,
    "returned": 2,
    "complete": true
  }
}
~~~

Runtime does not need to decide whether "too much dividend/low-volatility exposure" is a sensible investment assessment.

It needs to establish that the Portfolio capability was granted, the tool invocation is permitted, the result was received, size limits were respected, and the receipt was persisted.

Each layer handles the complexity it actually owns.

## 7. Hooks Govern Mechanics, Not Business Semantics

Returning business capability definitions to MCP does **not** remove deterministic checks from Tool execution. **PreToolUse** and **PostToolUse** remain useful for mechanical cross-layer governance.

### PreToolUse: deterministic single-field corrections

Appropriate examples:

~~~text
2026/9/30 → 2026-09-30
1万 (ten thousand) → 10000
Security-code normalization after a market is explicitly selected
Human-reviewed one-to-one enum aliases
~~~

These are stable when the field is identified, the mapping is unique, and no full-sentence interpretation is needed.

Inappropriate example:

~~~text
"Tencent has fallen a lot recently"
→ Guess the user meant 0700.HK and wants to consider reducing exposure
~~~

That is semantic interpretation and belongs to the model.

### PostToolUse: narrow and preserve, do not rebuild the business model

Useful behaviors include sensitive-field removal, bounded result projection, final size checks, and preservation of **coverage/provenance**.

If every tool result needs fresh classification, aggregation, pagination, or business-meaning reconstruction inside PostToolUse, that is evidence the Tool Interface may be wrong.

Return to MCP and define a scenario-appropriate view instead of growing a second business layer in Runtime/Hooks.

## 8. Two changes, one lesson: centralization alone is not the goal

| Earlier choice | Why it became fragile | Better ownership |
| --- | --- | --- |
| Model reports both next action and execution status | “Done” could disagree with the actual tool receipt | Model proposes; the program records the effect |
| Multiple copies of a tool definition | Renaming one field requires coordinated changes | Derive presentations and calls from one capability definition |
| Broad research wrapper around existing business tools | Specific capabilities are hidden by a duplicate vocabulary | Tools describe capabilities; Runtime keeps execution protections |

This is not an argument for removing every wrapper. Keep one if it has a distinct, necessary responsibility; remove it when it merely repeats another owner's decisions.

## 9. Clearer Ownership Does Not Weaken Failure or Permission Boundaries

### Private tools must remain invisible before authorization

The target design excludes private Portfolio Tools from the per-turn Tool Surface before a capability grant. They may appear in the next ModelTurn after authorization. PreToolUse still checks that the **actual invocation** is permitted.

**Visibility is not authorization.**

### Ambiguous mechanical canonicalization must stop

Date, amount, security code, or exact aliases may be normalized if the mapping is deterministic. If interpretation or multiple plausible mappings are involved, return structured correction feedback and let the model decide.

### Oversized results must be explicitly unavailable

A complete portfolio list must not silently become "Top N" merely because the full result would not fit the model context.

**Complete-or-unavailable** is safer than a misleading apparent success.

### Removing wrappers must not erase Web source state

If a Web wrapper owns Run-scoped source-handle validation, read-before-find rules, and denial of invalidated or revoked Web source handles, those responsibilities must migrate to the appropriate Web MCP/Gateway before the wrapper is removed. Revoking a Web source handle is not revoking the Host-recorded Run grant: under the current authorization contract, that grant remains valid throughout the same Run and its recovery.

Removing indirection should remove **duplicate Owners**, not important security checks.

## 10. Five Questions for Locating Agent Logic

1. **Does this require interpreting meaning?** If yes, **Model**: user intent, investigation choice, conflicting evidence, explanation.
2. **Does it describe how this task class should be performed?** If yes, **Skill**: investment-overlap analysis, tool-attempt guidance, answer structure.
3. **Does it define what the system can do?** If yes, **MCP/capability Owner**: read portfolios, query funds, browse pages, fetch constituents.
4. **Is it an objective state of the running task?** If yes, **Runtime**: budgets, cancellation, receipts, checkpoints, Recovery, terminal settlement.
5. **If this layer were deleted, where would its complexity go?** If it spreads to callers, the layer may be valuable. If absorbed by a deeper Owner, deepen that Owner. If all that disappears is mapping, copied schemas, aliases, and tests for dead paths, deletion is probably right.

The fifth question prevents "three Owners → one" from becoming the end of architecture review. **One Owner can still be the wrong Owner.**

## 11. How Does This Responsibility Map Compare with Existing Agent Frameworks?

The Model / Skill / MCP / Runtime split above is an **ownership map derived from real maintenance problems**. It is not a required layout for every framework, nor is it mandated by an external protocol.

| External reference | Public focus | Comparison with this design |
| --- | --- | --- |
| [Anthropic · Building Effective Agents](https://www.anthropic.com/research/building-effective-agents) | Distinguishes predetermined code-path workflows from agents that dynamically choose actions, and recommends adding orchestration complexity only when it has a demonstrable benefit. | We likewise do not force all research through a fixed Planner or Reviewer. Our native loop lets models choose research actions while the Host owns actual execution facts. |
| [OpenAI Agents SDK](https://openai.github.io/openai-agents-python/) | Provides agents, tools, handoffs, guardrails, sessions, tracing, and extensible orchestration primitives. | Those primitives can cover many of the same use cases. The question here is **who ultimately owns state, authorization, and committed effects**, not whether another agent-orchestration abstraction can be created. |
| [Official MCP specification](https://modelcontextprotocol.io/specification) | Specifies Host/Client/Server integration and mechanisms for exposing tools and resources. | MCP describes how capabilities are connected and invoked. Financial authorization, portfolio conventions, source revocation, and effect receipts still require explicit application and capability ownership. An MCP connection is not by itself business authorization. |

The **common ground** is simple, composable, inspectable tool-and-model loops. The **additional engineering choice** here is to place durable task identity, eligible effects, and recovery with their appropriate owners so that Runtime does not become a second business-decision layer. This is a comparison of design questions, not a benchmark proving one SDK faster, safer, or more accurate.

A practical rule follows: reuse an existing SDK loop, handoff, and tool runtime when they already satisfy the task. Add the smallest adapter only when verifiable financial authorization, artifact readback, or recovery requirements are not met by that responsibility split, and make the adapter's eventual removal possible. The contract of the task matters more than a framework's brand or its number of modules.

## 12. Separate the Current Structure from Historical Attempts

Native tool execution, tool contracts, and Host capability lookup have undergone real consolidation, reducing duplicate tool mappings and admission decisions. Earlier designs also left partially wired mechanisms without completing the full cutover. The presence of some code does not mean an entire architecture migration was deployed.

The case explains **why even one remaining tool definition can live with the wrong Owner**. Controlled regressions alone do not prove that models select tools better, investment research improves, or engineering costs fall. The transferable lesson is how to decide whether a capability calls for a new layer, a relocation, or deletion.

## Conclusion: Decide Who Owns the Next Rule

Moving from AgentTurn to native tool calls taught us to let models research while Runtime records what happened. The second half matters equally: **Runtime being able to do something does not make it the owner of that action's business meaning.**

Whether an API returned fund data is a tool or source fact. Whether another risk measure is needed is a research judgment. Whether a proposed action was authorized and executed belongs with the owner of its effect.

The division can be summarized as:

~~~text
Model   → Semantic complexity
Skill   → Methodological complexity
MCP     → Capability complexity
Runtime → Process complexity
~~~

When reviewing a Validator, Tool, Hook, or Skill, ask: **Does this rule interpret user meaning? Does it define a reusable method or capability? Or does it govern this run's permissions, sequence, and receipts?** Different answers should not collapse into another central manager.

**Let each layer maintain the knowledge it truly owns without requiring others to decide it again.** That is more sustainable than continually moving rules into Runtime. See [principle 2](/en/principles#principle-2) and [method 2](/en/principles#method-2).

## Further Reading

- [Don't Turn the Model into a State Machine](./runtime-model-protocol-boundary-agent-article-v2.md)
- [Run Budget and Constraint Governance](./agent-runtime-constraint-governance-v2.md)

## Reading and implementation scope (October 2026)

This essay draws lessons from ETF Agent's design history; it does not claim that every proposed migration became fully active. To inspect a bounded public example, see [Open ETF Agent's fixed v0.11 source](https://github.com/hpoenixf/open-etf-agent/tree/5f42c33892d57ed05e8cd09cad48573e6901995b) and [current instructions](https://github.com/hpoenixf/open-etf-agent/blob/main/README.md). Its document comparison, result consumption, and local PDF demonstrations use synthetic inputs and scripted actions; they are not the full private investment-research system or evidence of real-model quality.