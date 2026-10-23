# The Agent Has the Tool—So Why Can't the Model See It? Our Path to A34 Tool Surface

Integrating an MCP tool into an Agent sounds straightforward: register it, define its schema, configure permissions, and let the model invoke it.

In ETF Agent development, however, we encountered two opposite problems. **A tool existed in the system but was invisible to the model; or the model could see a tool that the Host might not actually authorize.**

We first consolidated definitions, then exposure rules, and eventually removed duplicate business-tool definitions from the Runtime so MCP could own the capability interface.

Each refactor solved a real problem. But in October 2026, we recognized a remaining gap: even correct authorization, registration, and projection cannot prove that the list ultimately sent to the model remains correct after Hooks, context fitting, and asynchronous preparation.

That gap led to **A34: Model Capability Presentation & Tool Surface**. This was not a greenfield architecture; it was the responsibility missing after several rounds of simplification.

## 1. The First Failure: The Skill Mentions a Tool, but the Model Cannot Use It

On September 27, 2026, we inspected a public product-tracking and comparison Skill. It declared two Market MCP methods:

~~~text
market__search_instruments
market__get_instrument_profile
~~~

The Skill Registry recognized both, and MCP had registered the service. It seemed natural to expect the Agent to call them when finding and comparing products.

But tracing the actual Research path showed that **research-skill-context.ts** did not map these methods into Research Actions. The Native static Tool Contract also lacked their definitions.

~~~text
Skill declares support
        ↓
MCP tool is registered
        ↓
Native Research has no corresponding tool
        ↓
The model cannot call it through this path
~~~

That was an integration gap established by source inspection, **not** an inference from a production user incident.

Our first response was to connect the missing pieces across Skill, Native Contract, and Host Action. Implementing that revealed a second contradiction: the **market** capability might be announced as available when the default MCP Market path was enabled, even though production Host network policy did not permit the action. The Factory then faced a capability declaration with no executable Host Action.

Controlled reproductions exposed mismatches between model-visible tools and executable capabilities. We also corrected the opposite boundary: disabling Web search must not automatically disable Structured Market. Fixing one mismatch does not justify permanently coupling the two capabilities.

**What began as "show the model two more tools" revealed that Skill declarations, derived capabilities, Host admission, and model-visible tool interfaces are different facts.**

## 2. The First Useful Refactor: Three Static Mappings into One Tool Contract

At that point, Native tool relationships were duplicated across three production locations:

- **research-tool-contract.ts** described model-facing tools and Host routing;
- **research-skill-context.ts** mapped Skills to research actions;
- **research-runtime-factory.ts** inferred tool requirements from Host Actions.

Adding one tool required developers to coordinate all three.

There was also a subtle exposure problem: Web search and page reading shared the **search_public_sources** Host Action. They reused an execution route at the Host layer but were distinct capabilities from the model's perspective.

A ceiling derived solely from the Host route could expose reading to a search-only Skill, or expose search to a read-only one.

We extended the unified Tool Contract with semantic capability and Skill bindings. **projectSkillExposure** then derived an exact **modelToolCeiling**, allowing us to delete the two duplicate mappings.

~~~text
Before: Tool Contract + Skill Context + Runtime Factory
                          ↓
               Three maintenance points

After: Unified Tool Contract
                ↓
       Exact Skill tool ceiling
                ↓
      Host / Capability narrow independently
~~~

Focused tests grew from **101 to 108 passing tests**. An independent RED confirmed that the exact ceiling really enforced the intended restriction.

This design was appropriate for the problems of its time: duplicate static mappings and unintended sibling exposure through a shared route.

But another question remained: **after moving three definitions into one, did that remaining definition belong to the right Owner?**

## 3. The Second Correction: Three Owners into One Was Not the Final Answer

In late September, we started retiring synthetic MCP Tools defined inside the Runtime.

Historically, to unify the Native Research protocol, Runtime rewrapped MCP business capabilities. Portfolio MCP might already expose a specific read-only holding lookup, yet Native Research would offer a generic **read_portfolio** method and map it back to MCP:

~~~text
MCP registers business tool
          ↓
Runtime redefines business Tool
          ↓
Model invokes Runtime Tool
          ↓
Runtime interprets and maps it
          ↓
Host calls original MCP Tool
~~~

The duplication had a legitimate history. Native Tool Loop and MCP transport evolved separately, and Runtime needed a common protocol for execution, permission, and recovery.

But once MCP Host handled real discovery, schema validation, read-only admission, and receipts, a second business schema created maintenance risk: names, argument schemas, meaning, and mapping could drift apart.

Our next contract became:

**MCP owns business-tool interfaces. Tool Surface projects which tools the model may see in this turn. Runtime owns lifecycle, budget, execution, and recovery facts.**

This changed how we interpreted the previous **modelToolCeiling**.

For synthetic Web tools, an exact Skill ceiling had prevented unintended sibling exposure on a shared route. For a native MCP research domain, however, a Skill mentioning one approved market method should not necessarily hide another ordinary, legitimately admitted method in the same domain.

The present contract therefore distinguishes authority from description:

- Original **Run Grant**, Host, source, and stage-resource facts determine admission.
- Skills describe methods, activation, and resources; their method lists do not independently revoke approved ordinary canonical MCP siblings.
- Tool Surface **presents** decisions made by those original authorities.

This is the more important correction. **An old constraint can lose its former authority when its abstraction layer and Owner change.**

Architecture evolution cannot just preserve every historical limitation and then add compatibility layers. Rules tied to responsibilities that no longer exist must also retire.

## 4. Another Trap: Why Did Typed Diagnostics Still Hide Web Tools?

Tool visibility is affected by dynamic availability as well as static registration.

Web search/read availability used to be reconstructed from **disabledTools** at several call sites. We later moved search quotas and expiration into typed Owner facts and projected them through the Effective Contract.

That was better than scattered string checks but still left a risk. Further validation on **October 21, 2026** found Live and Recovery paths that reinterpreted diagnostic fields. A tool result **unrelated to Web** could contain fields resembling search-budget exhaustion, Web expiry, or provider attempts and thereby incorrectly hide **market__web_search** during Recovery.

Controlled RED cases at three production assembly seams reproduced this. The model did not misunderstand a tool; the system incorrectly promoted diagnostic payloads into availability authority.

The fix consumes negative facts from the original Web Gateway/Host, bound to the relevant **Run, Scope, Invocation, and Connection** identities. Recovery restores sealed trusted receipts rather than parsing arbitrary MCP results to rediscover Web state.

The distinction between failure branches matters:

- Exhausting the **search** budget need not prevent browsing a previously authorized **sourceRef**.
- Expiration of the **runtime window** may constrain both search and browsing.
- The Gateway still enforces invocation constraints independently.

**A typed field is not automatically an authoritative field. Who produced it and under which identity it is consumed matter more than its type.**

A34 did not personally fix this unrelated bug. The incident explains why we refused to introduce another cache of permissions, budgets, or availability facts in A34.

## 5. If Admission Is Correct, Is the Final Model Request Correct?

Suppose MCP owns schemas, Run Grant is correct, Skills no longer act as an extra whitelist, and Web availability is based on original Host facts.

The Research request still passes through context fitting, Hooks, evidence assembly, current Publication context, asynchronous preparation, and request sealing before reaching the Provider.

A legitimate early tool list can be silently changed along the way.

During our October 21 review, **native-tool-surface.ts** already implemented a stably ordered projection and **assertNativeToolSurfaceParity**. But the actual request path depended on optional callbacks. In particular, the no-Hook path lacked an unconditional final parity guarantee.

Two facts should not be conflated. **At review time we had not identified a real production incident where a model tool was unexpectedly removed.** This was first a contract and ownership gap. Rather than immediately invent another Manager, we built counterexamples against the real request adapter.

The first controlled RED injected tool additions, deletions, renaming, reordering, description changes, and Schema changes immediately before dispatch. In **13 cases** that should have blocked mismatches, the old path still reached simulated Gateway dispatch.

Those are **13 reproducible test failures**, not 13 production incidents.

## 6. Why a Single Last-Minute Comparison Is Insufficient

The intuitive solution is to compare the expected tool list with **request.tools** just before dispatch.

The hard question is not *how* to compare; it is **where the expected list comes from**.

### A request seal cannot authorize its own contents

If the final request generates the seal used to validate that same request, the comparison merely proves consistency between an object and its own snapshot:

~~~text
Mutated actual tool list
          ↓
Seal the mutated list
          ↓
Compare request against its seal
          ↓
The mutation may pass
~~~

A seal records execution facts. It does **not** grant tool authorization again.

### Expected and actual descriptors cannot share a mutable Schema

Another controlled RED demonstrated a reference-aliasing problem. If expected and actual tool descriptors share the same nested Schema object, a Hook that modifies the Provider **inputSchema** in place changes *both sides*. A deep comparison can then pass incorrectly.

The expected baseline therefore needs an independent copy of the full descriptor **before** mutable Hooks and projections, derived from the original Effective Contract admission decision.

A further RED established that **read_tool_result** cannot simply be introduced by a Hook. The original Host/context-fitting entry must first establish that the readback control is permitted; it is then included in the same independent baseline.

### Why keep both early and final checks?

This is intentional duplication at different lifecycle points, not a case of mechanically preserving redundant checks:

- **Early parity** runs after extension projection and before legitimate Owner revalidation. It prevents an unauthorized Hook mutation from being "laundered" by later assembly.
- **Final parity** runs after later context, evidence, and asynchronous preparation. It checks that the actual logical model request still matches the legally narrowed admission result. It runs **even with no optional Hook**.

Checks cover tool **count, order, names, complete descriptions, and input Schema**. A34 reuses the existing **ChatToolDefinition[]** and request adapter rather than introducing another tool-schema registry.

The comparison operates on the logical tool surface **before Provider wire serialization**. Valid Provider-specific wire encodings remain the model invocation Owner's responsibility. Logical parity must not prohibit legitimate encoding differences.

This resembles the engineering structure of a **time-of-check/time-of-use (TOCTOU)** problem, but our evidence concerns later projection and shared mutable objects. It should not be described as a proven production concurrency attack.

## 7. If Rejection Succeeds, Why Can the Run Still Fail?

The first A34 implementation had another regression.

After detecting a mismatch, the adapter threw a protocol error and correctly stopped dispatch. Tool parity was protected. But an asynchronous-preparation regression test found that one path failed to report definitive non-dispatch through the existing **onProviderRequestFailure** lifecycle.

By that point, Runtime might already have created a reservation and request identity. Throwing an exception does not guarantee that those existing accounting effects close correctly.

We reused the original **pre_dispatch_rejected** callback to close the reservation for a request known never to have been sent. The original Main/Child request ledger owns that closure; A34 does not issue a competing receipt or acquire resource-accounting authority.

~~~text
Tool surface mismatch
          ↓
Reject only this model request preparation
          ↓
Original request Owner records definitive non-dispatch
          ↓
Original Runtime decides whether to continue, recover, or terminate
~~~

A34 also does not delete independently valid publishable text merely because one attempted model request was malformed.

**A new safety guard that rejects correctly but fails to settle the lifecycle effects of its own rejection can still break the system.**

## 8. Why We Chose a Logical Owner Instead of a Capability Manager

It would have been tempting to create a unified Capability Manager responsible for registration, authorization, availability, Skills, budgets, and the final tool list.

But the previous refactors had specifically removed Runtime's shadow business-tool registry. Recreating authorization and budget state in A34 would add another competing fact source, not genuine unification.

A34 has a narrow responsibility:

> Consume capabilities already admitted by their original Owners; determine what the model should see in this turn; ensure the final logical request does not deviate.

It creates no new durable state and does not change Run Grant, MCP Schema, Web Gateway quotas, Provider routing, or Publication decisions. It may reject only the assembly of an invalid **model request**.

For **Entry**, it retains a current, restricted summary of Host capabilities. Permission to access Portfolio does not mean holdings were already read, and permission to cite a document does not mean its contents have been obtained.

For **Research**, it retains the complete legitimate list, rejecting unauthorized descriptor changes without treating valid context compression as corruption. If capacity is too small for required tools, it reports the capacity failure explicitly instead of silently dropping Top-N tools.

A34 is therefore a **logical effect Owner spanning existing files**, not a new service, database table, or permission authority.

## 9. Handling Outdated Tests

The implementation did not end with one effortless green run.

Broader regression testing exposed outdated assertions. They contradicted the accepted contract on historical Skill ceilings, current guidance, and legitimate Deep controls.

We did not restore obsolete business rules just to make tests pass. We compared each failing assertion against the current accepted contract, preserved the underlying negative safeguards, and corrected outdated expectations.

Targeted checks established consistency and local rejection behavior in the tested request paths—not the model's research quality.

Even when the model sees exactly the correct tools, it can still choose the wrong method or fail the research task. That is a different layer of performance and must not borrow confidence from A34's GREEN tests.

## 10. The Lesson Was Not "Add Another Validator"

We started by assuming that a registered MCP tool mentioned by a Skill was usable. In reality, the Native/Host seam missed a capability.

We unified definitions and introduced an exact Skill ceiling. Then we discovered that one remaining definition can still live with the wrong Owner.

We removed shadow business Tools from Runtime and returned business capability interfaces to MCP. That required us to retire the former whitelist semantics where they no longer applied to native MCP domains.

Dynamic availability taught us that typed diagnostics cannot appoint themselves as authority. Controlled pre-dispatch REDs then showed that neither early legality nor final request sealing alone proves final legality.

A34's answer was **not** a larger Capability Manager. It was an independently preserved admission baseline, unconditional final tool-surface parity, and lifecycle-correct settlement of local rejection by the original execution Owner.

The resulting model separates three objects:

1. **Original admission facts:** which capabilities are lawful in this turn.
2. **Final model request:** which tools the model actually receives.
3. **Request seal and execution records:** what the system prepared, dispatched, and settled.

They can be correlated; none can impersonate the others.

**Some architecture upgrades add a necessary constraint. Others refuse to add an unnecessary Owner. A34 illustrates both.**

A34 applies [principle 3, “Complexity belongs with its rightful owner”](/en/principles#principle-3): admission evidence and final-request consistency need clear owners, but not another all-purpose Capability Manager. [Method 3, “Passing evidence through a research system”](/en/principles#method-3) helps distinguish the original admission fact, what the model actually sees, and the final dispatch receipt.

---

Further reading: [MCP Host: From Connecting a Service to Using Its Tools](https://hpoenixf.github.io/eff-agent-article/articles/mcp-host-from-discovery-to-consumption) · [Model, Runtime, MCP and Skill Responsibilities](https://hpoenixf.github.io/eff-agent-article/articles/agent-model-runtime-mcp-skill-boundaries) · [Code Is Cheaper; Why Are Systems Harder to Evolve?](https://hpoenixf.github.io/eff-agent-article/articles/code-cheaper-systems-harder-to-evolve)

More independent engineering cases: [ETF Agent Engineering Notes](https://github.com/hpoenixf/eff-agent-article). If these evolution problems look familiar, feel free to read, discuss, or Star the repository.
