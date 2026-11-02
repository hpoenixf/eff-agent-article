---
readingBrief:
  takeaways:
    - "Tool registration, Skill declarations, Host admission and actual model visibility are different facts; Tool Surface projects lawful decisions from their original Owners."
    - "Copy complete tool descriptors independently before mutable Hooks, then check early and final parity; request seals and shared mutable objects cannot authorize themselves."
    - "Reject only the malformed request assembly and settle its undispatched reservation through the original ledger; do not create another permission registry or erase legitimate published text."
  appliesTo:
    - "Investigating tools that exist in a registry but remain invisible, or Hooks, context fitting and asynchronous preparation that alter the final model-facing tool set."
  notFor:
    - "Seeking an all-purpose capability manager, or treating logical tool parity as proof of good model choices, Provider wire compatibility or newly granted permissions."
---
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

## 2. Consolidating Tool Definitions Was Only Half the Ownership Decision

Initially, Native Tool Contract, Skill Context, and Runtime Factory each maintained parts of the model-facing tool mapping. Web search and page reading even shared a `search_public_sources` Host route: **sharing an execution route does not mean the model may see the same tools**. An exact `modelToolCeiling` was a reasonable protection for those earlier synthetic Web tools.

Later, MCP Host could own discovery, Schema validation, authorization, and receipts. Rewrapping business methods such as `read_portfolio` in Runtime then created a competing interface. We returned **business-tool contracts to MCP, authorization to Run Grant/Host, and per-turn presentation to Tool Surface**. Under that new ownership, a Skill's method list no longer has authority to hide another ordinary, legitimately admitted tool in the same native MCP domain.

The two decisions are not contradictory: the old ceiling prevented sibling exposure on a shared route; the new arrangement retires an obsolete shadow restriction. **Decide whether a tool may be presented by tracing the authority that admitted it, not by preserving a list from an earlier abstraction.**

## 3. Availability Comes from Its Original Owner, Not a Plausible Diagnostic Field

Tool visibility also changes with search quotas, source permissions, and deadlines. An October 2026 controlled regression showed that an unrelated MCP result carrying fields resembling Web budget exhaustion could incorrectly hide `market__web_search` during recovery. This was not a typing failure: **diagnostic material had been promoted into availability authority**.

The current path consumes status and receipts from the original Web Gateway/Host, bound to Run, Scope, Invocation, and Connection identities. Recovery does not reconstruct permission from arbitrary MCP results. Exhausting the search quota need not prohibit reading an already authorized `sourceRef`; expiry of the overall Web window may affect both.

This was corrected at the original seam, not by appointing A34 as the Web authorization owner. It is why Tool Surface projects existing decisions instead of keeping another budget and availability cache.

## 4. Validate the Final Tool Surface Against an Independent Admission Baseline

Even when MCP Schemas, Run Grant, and Skill discovery are correct, a request still passes through Hooks, context fitting, evidence assembly, and asynchronous preparation. Controlled request-seam regressions in October 2026 generated **13 cases the old path failed to block**, including additions, removals, reordering, and Schema changes. Those were scoped tests, not 13 production incidents.

Comparing the final **request.tools** with expected descriptors is necessary. The harder question is **where the expected baseline comes from**: it must be independent of the request being checked and grounded in the original admission facts.

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

## 5. Rejecting a Mismatch Must Also Settle the Request

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

## 6. Why We Need Only a Logical Tool Surface Owner

It would have been tempting to create a unified Capability Manager responsible for registration, authorization, availability, Skills, budgets, and the final tool list.

But the previous refactors had specifically removed Runtime's shadow business-tool registry. Recreating authorization and budget state in A34 would add another competing fact source, not genuine unification.

A34 has a narrow responsibility:

> Consume capabilities already admitted by their original Owners; determine what the model should see in this turn; ensure the final logical request does not deviate.

It creates no new durable state and does not change Run Grant, MCP Schema, Web Gateway quotas, Provider routing, or Publication decisions. It may reject only the assembly of an invalid **model request**.

For **Entry**, it retains a current, restricted summary of Host capabilities. Permission to access Portfolio does not mean holdings were already read, and permission to cite a document does not mean its contents have been obtained.

For **Research**, it retains the complete legitimate list, rejecting unauthorized descriptor changes without treating valid context compression as corruption. If capacity is too small for required tools, it reports the capacity failure explicitly instead of silently dropping Top-N tools.

A34 is therefore a **logical effect Owner spanning existing files**, not a new service, database table, or permission authority.

<!-- open-etf-case:surface@e1b8e4edde724548fab16d8ca4b205379bfa7f30 -->
### Inspect the tools Child actually receives each round

The [read-only Child case at this fixed public snapshot](https://github.com/hpoenixf/open-etf-agent/blob/e1b8e4edde724548fab16d8ca4b205379bfa7f30/test/cooperation-integration.test.mjs) observes actual Gateway arguments rather than treating a registry entry as proof of visibility.

After installing dependencies according to the README at the linked fixed snapshot, run:

```bash
node --test --test-concurrency=1 --test-name-pattern='^3\.4 fixture child shares root counters and advertises only allowed read tool$' test/cooperation-integration.test.mjs
```

Both scripted model calls see only `read_page`; the root counters end at two model calls and one tool call. Child returns a derived result without its own report-save receipt. The exact test result reflects those assertions.

This covers restricted Child tool presentation and shared counters, not the complete A34 dynamic-capability design or a real model's ability to choose the right tool.
<!-- /open-etf-case -->

## 7. Conclusion: Preserve Final Visibility Without a Capability Manager

The former Tool Contract, Skill ceiling, and Web diagnostics each addressed a real issue. But as ownership changed, outdated tests had to be checked against the accepted contract rather than reinstating obsolete whitelists. The essential invariant is that **later projections cannot rewrite the original admission baseline, and a final request cannot authorize itself**.

A34's answer was **not** a larger Capability Manager. It was an independently preserved admission baseline, unconditional final tool-surface parity, and lifecycle-correct settlement of local rejection by the original execution Owner.

The resulting model separates three objects:

1. **Original admission facts:** which capabilities are lawful in this turn.
2. **Final model request:** which tools the model actually receives.
3. **Request seal and execution records:** what the system prepared, dispatched, and settled.

They can be correlated; none can impersonate the others.

**Some architecture upgrades add a necessary constraint. Others refuse to add an unnecessary Owner. A34 illustrates both.**

A34 applies [principle 2, “Complexity belongs with its rightful owner”](/en/principles#principle-2): admission evidence and final-request consistency need clear owners, but not another all-purpose Capability Manager. [Method 3, “Passing evidence through a research system”](/en/principles#method-3) helps distinguish the original admission fact, what the model actually sees, and the final dispatch receipt.

---

Further reading: [MCP Host: From Connecting a Service to Using Its Tools](https://hpoenixf.com/eff-agent-article/articles/mcp-host-from-discovery-to-consumption) · [Model, Runtime, MCP and Skill Responsibilities](https://hpoenixf.com/eff-agent-article/articles/agent-model-runtime-mcp-skill-boundaries) · [Code Is Cheaper; Why Are Systems Harder to Evolve?](https://hpoenixf.com/eff-agent-article/articles/code-cheaper-systems-harder-to-evolve)

More independent engineering cases: [ETF Agent Engineering Notes](https://github.com/hpoenixf/eff-agent-article). If these evolution problems look familiar, feel free to read, discuss, or Star the repository.
