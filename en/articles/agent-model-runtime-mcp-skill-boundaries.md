# From Asking the Model to Do Less to Asking Runtime to Own Less: Model, Runtime, MCP, and Skill Responsibilities

A serious Agent project often goes through two phases.

First, models appear unreliable, so developers move more state, validation, permission, and completion decisions into Runtime. Second, Runtime becomes more reliable—and much heavier. It begins to own tool definitions, business classifications, data projections, and invocation semantics as well.

Our investment-research Agent has followed that trajectory.

The first question was **what should the model stop maintaining?** The later question became **what should Runtime stop owning, even when the model should not own it either?**

By September 30, 2026, several real refactors had suggested a clear principle:

> **Model handles semantic complexity; Runtime handles process complexity; MCP owns capability complexity; Skills describe methodological complexity.**

We did not start with this architecture diagram. It emerged from mistakes and corrections.

A qualification matters: as of the **October 11** review, removal of synthetic MCP Tool layers had implementation and provider-free regression evidence, but the original change was archived **frozen incomplete**, without applying its delta. We separate implementation, regression coverage, and formal acceptance throughout this article.

## 1. Stop Making the Model Maintain Facts Runtime Already Knows

An early Research protocol asked the model to output a structured **AgentTurn** containing actions, gaps, and a completion claim:

~~~json
{
  "actions": ["search"],
  "gaps": ["Additional evidence is still needed"],
  "completionClaim": false
}
~~~

The motivation was understandable. Tool activity should be auditable. Research requires recovery. The system needs to understand why work continues or stops.

But the protocol expanded. Permissions, tool lists, evidence gaps, Publication status, subgoals, and completion conditions increasingly appeared in model output.

The model was now doing two jobs:

~~~text
Understand the user and choose the next action
+
Maintain a shadow copy of Runtime state
~~~

The second job was expensive and added no authority.

Runtime already knows which capabilities were granted, which tool calls happened, whether results returned, which Publications committed, whether a Run was canceled, and how much budget remains.

A model-generated account of these facts is only **what the model believes**. When it conflicts with Host receipts, Host facts win.

We moved Research toward a **native tool loop**. The model proposes its next Tool call. Host persists **ModelTurn**, execution results, receipts, and Publications; Runtime uses these real facts to govern Recovery and terminal state.

An internal September 20 record captured the principle:

> **Semantic decisions can belong to the model. Authority and recovery cannot.**

The goal was not to reduce the rigor of system state. It was to eliminate the model's duplicate ownership of it.

## 2. Moving Deterministic Complexity into Runtime Is Right—Until It Goes Too Far

After the native-tool-loop transition, it felt natural to say that the model should not infer anything Runtime can determine:

~~~text
Authorization
Budget
Invocation status
Cancellation
Checkpoint
Recovery
Receipt
Publication
Terminal gate
~~~

These are objective facts. For example:

~~~text
remainingReadActions = 3
~~~

A model does not need to guess the budget or whether a receipt is durable.

But **"Runtime should own deterministic process facts"** slowly became **"anything the model shouldn't own belongs in Runtime."**

Those statements are not equivalent.

The real trouble began when Runtime started redefining the **business capabilities** themselves.

## 3. First Tool Consolidation: Multiple Definitions into One Contract

On September 26, 2026, we tackled repeated capability relationships. A Tool Contract existed, but production Runtime maintained a separate capability table. New or modified Host routes had to stay aligned in both locations.

~~~text
Before:
Host catalog
+
Runtime capability table

After:
Host catalog
→ Runtime looks up its capabilities
~~~

A focused contract/Host/production suite passed **162 cases**. A wider provider-free offline batch recorded **438 files, 3,915 passing tests, and one skipped test**.

These results support removal of the duplicate capability lookup and preservation of selected provider-free routing behavior—not model quality or formal live acceptance.

The next day we found a third duplication. The relationship between Native Tool, Skill, and Host was maintained in:

~~~text
Research Tool Contract
Research Skill Context
Research Runtime Factory
~~~

A Skill's allowed MCP method might need to map through a Native Model Tool, Host Action, and capability. Web search and page read shared a Host route, so route-only reasoning risked exposing an unintended sibling tool.

The September 27 refactor consolidated those static relationships into one Tool Contract and derived Skill/Host/capability exposure:

~~~text
Three static Owners
        ↓
One Tool Contract
        ↓
Derived Skill / Host / capability exposure
~~~

The historical shorthand was **"three Owners → one Owner."** That consolidation reduced mapping drift and allowed more precise search-only versus browse-only exposure.

It was appropriate at the time, but **one Owner is only a first-order solution**.

## 4. The Deeper Question: Does the Remaining Owner Belong Here?

Portfolio MCP already offered precise scoped methods:

~~~text
portfolio__get_portfolio_overview
portfolio__get_fund_position
portfolio__get_bucket_holdings
portfolio__get_sector_exposure
~~~

These methods have meaningful names, argument schemas, and result semantics. Yet Native Research sometimes exposed another synthetic wrapper:

~~~text
read_portfolio({})
~~~

The call chain effectively became:

~~~text
MCP Tool
  ↓
Research Tool Contract
  ↓
Model Tool
  ↓
Host Action
  ↓
mapReadCall
  ↓
MCP Tool
~~~

Every layer had a plausible justification: permissions, Skill ceilings, budget enforcement, inputs, and output limits.

But **the need to govern a tool does not imply Runtime should redefine that business tool**.

Portfolio already exposed "bucket holdings"; the model saw the blunter "read_portfolio." Runtime acquired business semantics as a side effect of wanting to govern execution—and flattened the useful capability distinctions.

We applied a **deletion test**: if the synthetic layer disappeared, would complexity spread across many callers or simply disappear?

For MCP-backed business Tools, much of what vanished was duplicate names, schemas, mapping code, and Host Action identities.

The genuinely necessary governance stayed:

~~~text
Authorization
Budget
Hooks
Recovery
Receipts
Result-size bounds
~~~

Our progression therefore became:

~~~text
Three Owners → One Owner
          ↓
Wrongly placed Owner → No shadow Owner
~~~

At the October 11 review, **native-tool-surface.ts** already accepted MCP discovery descriptors and narrowed per-turn visibility. Archived verification covered selected Market, Portfolio, Web pass-through, receipts, and Recovery behavior using provider-free tests.

The associated change was nevertheless **frozen incomplete** and its delta was **not applied**. Selected implementation/regression evidence cannot establish complete production assembly, live-model acceptance, or formal closure.

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

## 8. Three Comparisons: "More Centralized" Can Still Be Wrong

### Example 1: AgentTurn → native tool loop

Before, the model maintained actions, gaps, completionClaim, and subgoals.

Afterwards, it proposed Tool calls while Runtime/Host owned execution facts.

The improvement was not merely fewer JSON fields; it was ownership of authoritative state returning to the layer that actually records it.

### Example 2: three Tool mappings → one Tool Contract

The September 27 consolidation reduced static mapping drift. Necessary—but the correct count of Owners does not answer whether the **remaining Owner** belongs at the right abstraction.

A Runtime business Tool wrapping an already well-defined MCP capability is still a shadow Owner.

### Example 3: green tests for a seam production no longer uses

Repository inspection exposed test-only legacy modules with no production consumers:

~~~text
Production:
A → B → C

Tests:
T → LegacyModule
~~~

Green tests for LegacyModule prove that its interface still matches those tests. They say nothing about whether the current production path invokes it.

We introduced **agent-retire-test-only-and-legacy-seams** to move still-valid guards back to real production entry points and delete obsolete modules.

September 30 evidence included targeted removals such as **build-context.ts**, assertion migration, and architecture-guard regressions. The original formal closure was blocked during isolated database creation, with provider-free retirement handled separately.

This was not merely a proposal, but nor does archival prove live acceptance or that all historical seams disappeared. The **28 historical guard entries** retained at that time were not a whole-repository zero-debt certificate.

As the design maxim goes: **the interface is the test surface**. When a production seam moves, tests must move to protect the current behavior rather than fossilizing obsolete architecture.

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

If a Web wrapper owns real invariants—Run-scoped source handles, read-before-find rules, revocation—those responsibilities must migrate back to the appropriate Web MCP/Gateway before deleting the wrapper.

Removing indirection should remove **duplicate Owners**, not important security checks.

## 10. Five Questions for Locating Agent Logic

1. **Does this require interpreting meaning?** If yes, **Model**: user intent, investigation choice, conflicting evidence, explanation.
2. **Does it describe how this task class should be performed?** If yes, **Skill**: investment-overlap analysis, tool-attempt guidance, answer structure.
3. **Does it define what the system can do?** If yes, **MCP/capability Owner**: read portfolios, query funds, browse pages, fetch constituents.
4. **Is it an objective state of the running task?** If yes, **Runtime**: budgets, cancellation, receipts, checkpoints, Recovery, terminal settlement.
5. **If this layer were deleted, where would its complexity go?** If it spreads to callers, the layer may be valuable. If absorbed by a deeper Owner, deepen that Owner. If all that disappears is mapping, copied schemas, aliases, and tests for dead paths, deletion is probably right.

The fifth question prevents "three Owners → one" from becoming the end of architecture review. **One Owner can still be the wrong Owner.**

## 11. What This Case Proves—and What It Cannot Prove

| Classification | Recorded evidence | Supported conclusion | Unsupported extrapolation |
| --- | --- | --- | --- |
| Verified | September 20 native-tool-loop provider-free regression: **416 files, 3,348 tests passed** | Reduced model state mirroring while keeping Host authorization, Recovery, and terminal boundaries | Live model quality, PostgreSQL restart coverage, or formal acceptance |
| Verified | September 26 capability consolidation: **162 focused tests**; wider offline batch **438 files / 3,915 passed / 1 skipped** | Duplicate capability lookup can be retired with selected provider-free routing preserved | Quantified development efficiency or production bug-rate improvement |
| Verified | September 27 Native Tool exposure: focused tests **101 → 108 passing** | Consolidating three static mappings reduces drift | The surviving Owner must be the correct final Owner |
| Partially verified; acceptance incomplete | Synthetic-layer archival record with partial implementation and provider-free regression; retirement **frozen, delta not applied** | Selected tool-surface, MCP identity, receipt, and Recovery changes existed | Formal closure, complete production integration, or live acceptance |
| Verified selections; live not verified | Legacy-seams archival verification of deletion, migrated assertions, architecture guards, and local regression | Selected unconsumed modules were removed and checks moved to current Owners | All legacy code gone or prior isolated live quick-run completed |
| Scope of this article | Agent ownership and engineering architecture | A useful model for migrating responsibilities | Investment advice quality, latency, cost, or business benefit |

Two opposite reporting mistakes are easy to make: a sound target design is **not** automatically implemented; conversely, code already exercised by selected regressions should not be described as mere theory.

State each implemented change together with its recorded scope, frozen archival status, and live-verification gap.

## Conclusion: Put Complexity with the Right Owner

Our earlier principle was:

> **Do not ask the model to maintain facts Runtime already knows.**

That helped us move from a heavyweight AgentTurn protocol to native tool calling.

Evolution added a second principle:

> **Runtime being able to execute something does not mean it should own that business concept.**

A helpful shorthand is:

~~~text
Model   → Semantic complexity
Skill   → Methodological complexity
MCP     → Capability complexity
Runtime → Process complexity
~~~

Hooks govern mechanical interactions, while Tool Surface presents the authorized capabilities of the current turn.

Good Agent architecture does not make complexity vanish or force all of it into Runtime.

**The Owner of a fact maintains that fact. The provider of a capability defines its interface. Tasks that require interpretation belong to the model.**

Moving from "let the model think about fewer system facts" to "let Runtime own fewer business concepts" is the same deeper move: **returning complexity to the layer best suited to bear it**.

## Further Reading

- [Don't Turn the Model into a State Machine](./runtime-model-protocol-boundary-agent-article-v2.md)
- [Run Budget and Constraint Governance](./agent-runtime-constraint-governance-v2.md)

## Evidence Sources

- September 20, 2026: Native Tool Loop, semantic decisions versus authority and Recovery.
- September 26, 2026: canonical Host catalog ownership of Research tool capabilities.
- September 27, 2026: Native Tool exposure consolidated into one Tool Contract.
- agent-remove-synthetic-mcp-tool-layer proposal and design.
- agent-retire-test-only-and-legacy-seams proposal.
- Native Tool lifecycle-hooks specification.
- Synthetic-layer partial verification and frozen retirement boundary.
- Legacy-seams verification and retirement records.
- Current Native Tool Surface implementation.
