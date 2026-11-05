---
description: "Why can a registered tool remain invisible, or arrive with an altered interface? Follow one request from assembly to dispatch to understand independent admission baselines, shared Schemas and asynchronous aliases, then compare SDK tool selection with application-level consistency checks."
readingBrief:
  takeaways:
    - "Registration, admission, per-turn presentation and execution are four facts. Tool Surface consumes original admission decisions instead of creating another permission registry."
    - "Copy the expected descriptors independently before mutable assembly. Deep comparison can pass incorrectly if both sides share a nested Schema."
    - "Asynchronous work can remain after the last assertion. Detaching mutable controls protects dispatch without blindly deep-cloning every message."
    - "Lawful narrowing differs from arbitrary tool deletion. Rejection must also reach the original request ledger, rather than merely throwing or erasing independently valid prose."
  appliesTo:
    - "Systems with Hooks, context fitting and asynchronous preparation that need to explain and preserve the exact tools presented to the model."
  notFor:
    - "Using Tool Surface as a new authorization manager, or treating interface consistency as proof of correct tool selection, comprehension or completed research."
---
<div><a id="the-agent-has-the-tool—so-why-can-t-the-model-see-it-our-path-to-a34-tool-surface"></a><a id="the-agent-has-the-toolso-why-cant-the-model-see-it-our-path-to-a34-tool-surface"></a></div>

# The Agent Has the Tool—So Why Can't the Model See It? Our Path to Tool Surface

For a product comparison, the system has registered tools to search for products and read their profiles. You want the model to find candidates and then inspect the details. If it receives only the search tool, another instruction to “check original material” cannot supply the missing interface.

The opposite problem is subtler. A request begins with an admitted tool set, but later assembly changes a parameter definition. The model may produce a call valid under that new definition without the execution Host recognizing the interface.

Product comparison is a teaching example here. The question is **how to deliver the tools intended for this turn, rather than merely prove that they exist in a registry**. The current design derives an independent baseline from original admission facts, checks mutable assembly against it, and returns failures to the existing execution lifecycle. It does not introduce another capability-management service.

<span id="_1-the-first-failure-the-skill-mentions-a-tool-but-the-model-cannot-use-it"></span>
<span id="_2-consolidating-tool-definitions-was-only-half-the-ownership-decision"></span>

## 1. Separate the Four Places a Tool Passes Through

| Position | What it establishes | What it does not establish |
| --- | --- | --- |
| Supplier or MCP registration | Name, description and input Schema | Permission for this task |
| Original Run and Host admission | Capabilities available under the original grant, scope and phase | Unchanged presentation through later assembly |
| Model-request tool surface | Complete descriptors supplied in this turn | Invocation or permission for a particular execution |
| Host dispatch and receipt | Which call executed, was refused or remains uncertain | Correct research conclusions or model comprehension |

Tool Surface preserves consistency between the third position and the first two. Actual argument, resource and access checks remain with the execution Host. Model visibility does not remove them.

A historical integration gap made this distinction concrete. On September 27, 2026, a product-tracking Skill declared two Market MCP methods:

~~~text
market__search_instruments
market__get_instrument_profile
~~~

Research Actions and the Native static tool contract did not yet expose them. This was the break established by source inspection, not attribution of a production user incident:

~~~text
Skill declares support
        ↓
MCP tool is registered
        ↓
Native Research has no corresponding tool
        ↓
The model cannot call it through this path
~~~

A controlled path also reproduced the opposite mismatch: capability derivation announced Market availability even when Host network policy did not permit the corresponding action. Conversely, disabling Web search should not disable structured Market data. **Declaration, visibility and executability each need their own source; one “enabled” flag cannot represent all three.**

Business descriptors now come from MCP; the original Run grant and Host provide admission; Tool Surface handles this turn's presentation. A Skill mentioning one method no longer has authority to hide another already-admitted ordinary method in the same domain. Precise tool ceilings were useful on an earlier shared Web route, but an old list cannot retain authority after the interface's ownership changes.

<span id="_4-validate-the-final-tool-surface-against-an-independent-admission-baseline"></span>
<span id="a-request-seal-cannot-authorize-its-own-contents"></span>

## 2. How One Request Is Assembled Today

Tool Surface is more than a single comparison against the final array. The main path is:

| Step | Action | Why it belongs here |
| --- | --- | --- |
| Project original admission | Obtain complete names, descriptions, Schemas and order | Do not recreate permission from Skill prose or arbitrary diagnostics |
| Copy an independent baseline | Preserve admitted descriptors before mutable Hooks | Later mutation must not change the comparison standard too |
| Check after extension projection | Validate tools and protected control inputs | Detect unauthorized changes before legitimate rebuilding can hide them |
| Let original owners narrow lawfully | Apply existing phase and resource decisions | Narrowing cannot introduce an unadmitted capability |
| Preserve another independent baseline | Copy the legally narrowed descriptors | Provide a standard for later context, evidence and asynchronous preparation |
| Detach controls and check finally | Validate the actual logical request after late preparation | Protect against late drift and retained mutable aliases |
| Dispatch through the existing model layer | Encode the provider protocol | Logical parity does not require identical wire bytes across protocols |

Comparison covers count, order, names, full descriptions and input Schemas. Checking names alone misses `query` changing from a string to a number; checking only Schemas misses description changes that may influence selection.

The `read_tool_result` control follows the same rule. The original Host or context-fitting path can admit it under the appropriate conditions. A Hook cannot earn that permission merely by inserting its name into the request.

A final request seal remains useful, but it answers “what was prepared,” not “what was admitted”:

~~~text
Mutated actual tool list
          ↓
Seal the mutated list
          ↓
Compare request against its seal
          ↓
The mutation may pass
~~~

The independent baseline, final request and seal can be correlated. None can stand in for the others.

<span id="expected-and-actual-descriptors-cannot-share-a-mutable-schema"></span>
<span id="why-keep-both-early-and-final-checks"></span>

## 3. Why Deep Comparison Can Produce a False Equality

The easily missed issue is not the comparison algorithm. It is whether the compared objects are independent.

A controlled regression used a supplier Schema whose nested `properties.query` initially required a string. A Hook replaced it with a number definition in place. If expected and actual descriptors reference the same nested object, both change together. Even a strict comparator then sees “number equals number.”

Copying only the outer array does not solve this. The current path copies complete admitted descriptors independently before mutable projection. It copies again after legitimate narrowing so later assembly cannot share the new comparison standard.

This resembles a time-of-check/time-of-use, or TOCTOU, problem. The evidence here concerns controlled request mutation and object aliases, not a demonstrated production concurrency attack.

Early and final checks therefore serve different purposes. Early checking prevents an unauthorized change from being concealed by later rebuilding. Final checking catches changes introduced by late asynchronous preparation. Later assembly still exists without an optional Hook, so the final check cannot disappear with that switch. Legitimate message compaction changes messages, not tool descriptors, and should not be rejected as tool drift.

## 4. Why Detach Objects After Reaching the Last Check?

“We checked at the end of the adapter” sounds sufficient, but the adapter does not necessarily write the network request itself. A Factory wrapper can still await another operation before entering the model SDK.

A controlled regression at the actual SDK serialization boundary found that a Hook retained a reference to the request. After adapter validation, that reference could still append an unadmitted tool or alter a description. A previously recorded tool hash could remain unchanged while the tools about to be sent had changed.

The current response is not another authorization layer at every boundary. It is to **detach mutable controls before the last check**: copy the request envelope and message array, deep-copy tool descriptors, output Schema and reasoning configuration, then check the object used downstream. The old Hook alias can no longer change dispatch through the same control object.

Why not deep-clone the entire request? Some image, compaction and evidence relationships depend on message identity and live in side structures such as WeakMaps. Replacing every message object can preserve its text while losing the association that explains where it came from. This path retains the identities required by the original message owners. Source envelopes that specifically need copying carry their proofs through their own path; generic JSON cloning is not a substitute.

The trade-off is deliberate: controls are independent, while original owners maintain data identity. Every new control field needs an explicit copying and validation responsibility. “We copied the request” cannot mean every body or semantic property is protected. The regression inspected real SDK serialization using synthetic transport, not a real-model quality evaluation.

<span id="_3-availability-comes-from-its-original-owner-not-a-plausible-diagnostic-field"></span>

## 5. When Fewer Tools Is the Correct Result

Complete presentation does not require one immutable tool list forever. It requires **original-owner authority for lawful changes, without arbitrary removal of required tools**.

Three situations differ:

- **Phase or resource changes:** the original contract may narrow this turn's surface. Assembly cannot expand it to a capability that was never admitted.
- **Context capacity:** if required tools do not fit, report an explicit capacity result instead of silently keeping the first N business tools. The current path can omit an explicitly optional progress-notification control after a particular capacity failure. That is not permission for arbitrary Hook deletion.
- **Trusted availability changes:** exhausted search quota may disable search while leaving an already-admitted `sourceRef` readable. The overall Web deadline may affect both. The decision comes from original Web Gateway/Host facts bound to this execution, not a budget-looking field in an arbitrary tool result.

The last distinction comes from a controlled counterexample: an unrelated MCP result carried a diagnostic resembling quota exhaustion and incorrectly hid Web search during recovery. The repair belongs at the original availability source. Tool Surface must not add another budget cache or invent a new same-Run authorization policy under the name of revalidation.

Entry's capability summary is still just a summary. Access to Portfolio does not mean holdings have been read; permission to use a document reference does not mean its contents have arrived. Research's full descriptors and Entry's restricted capability hints serve different positions. Metadata is not a successful read receipt.

<span id="_5-rejecting-a-mismatch-must-also-settle-the-request"></span>

## 6. After Rejection, One More Effect Remains

A mismatched request has been prevented from dispatching. Is the guard finished? Not necessarily: the original execution flow may already have established a request identity and resource reservation during preparation.

An asynchronous-preparation regression found exactly that gap. The adapter refused dispatch correctly but omitted the original request's definitive non-dispatch record. Throwing does not automatically settle the reservation.

A mismatch now reports `pre_dispatch_rejected` through the existing `onProviderRequestFailure` callback for the original Main/Child ledger to handle. Adapter calls without the corresponding durable lifecycle can report only a local protocol failure. A resolved callback is not, by itself, proof that a durable reservation existed and was settled.

~~~text
Tool surface mismatch
          ↓
Reject only this model request preparation
          ↓
Original request Owner records definitive non-dispatch
          ↓
Original Runtime decides whether to continue, recover, or terminate
~~~

The guard rejects this invalid request assembly. The original runtime decides whether to continue, recover or terminate. Independently valid prose is not erased because one subsequent request had a tool-surface mismatch.

The transferable lesson is to find where the existing system records “this did not happen” whenever adding a refusal guard. Otherwise, the access boundary may hold while the lifecycle retains an unresolved state.

<span id="_6-why-we-need-only-a-logical-tool-surface-owner"></span>

## 7. When to Use the SDK Directly, and When This Protection Helps

Mature SDKs already offer dynamic tool-selection mechanisms. This is a comparison against today's requirements, not a claim that the project historically benchmarked these products on the same task.

| Mechanism | Strong fit | What the application still decides |
| --- | --- | --- |
| OpenAI Agents SDK `is_enabled` | Enable tools from context, preferences or runtime conditions | Argument/resource authorization inside tools, and the policy behind visibility |
| Vercel AI SDK `activeTools` and `prepareStep` | Keep a typed registry while selecting per-step subsets and adjusting messages or model settings | Which changes are intended configuration and which are drift in its own assembly pipeline |
| MCP `tools/list`, change notifications and `tools/call` | Standard supplier discovery, descriptors and invocation | How discovery connects to task admission and the final request |
| Independent baseline and detachment here | Multiple mutable extensions, context processors and asynchronous wrappers sharing one request | Copy boundaries, lawful narrowing and original-request failure settlement |

[OpenAI's conditional-enabling documentation](https://openai.github.io/openai-agents-python/tools/#conditional-tool-enabling) also distinguishes visibility from authorization that depends on particular arguments and resources. [AI SDK tool-calling documentation](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling#active-tools) describes per-step selection; the [MCP 2025-06-18 Tools specification](https://modelcontextprotocol.io/specification/2025-06-18/server/tools) defines discovery and invocation. These operate at different layers from application consistency checks. Missing this project's internal fields does not make them inadequate.

For a few fixed tools sent directly to an SDK without shared mutable extensions, explicit configuration and tool-side authorization are often simpler. Our extra complexity comes from our own longer assembly chain: retaining extensions and context processing while preventing them from rewriting independent admission facts. Copying, comparison and additional boundary tests are the cost, not a free guarantee of a better model.

## 8. Start with a Small Public Exercise

<!-- open-etf-case:surface@e1b8e4edde724548fab16d8ca4b205379bfa7f30 -->
### Inspect the tools Child actually receives each round

The [read-only Child case at this fixed public snapshot](https://github.com/hpoenixf/open-etf-agent/blob/e1b8e4edde724548fab16d8ca4b205379bfa7f30/test/cooperation-integration.test.mjs) observes actual Gateway arguments rather than treating a registry entry as proof of visibility.

After installing dependencies according to the README at the linked fixed snapshot, run:

```bash
node --test --test-concurrency=1 --test-name-pattern='^3\.4 fixture child shares root counters and advertises only allowed read tool$' test/cooperation-integration.test.mjs
```

Both scripted model calls see only `read_page`; the root counters end at two model calls and one tool call. Child returns a derived result without its own report-save receipt. The exact test result reflects those assertions.

This covers restricted Child tool presentation and shared counters, not the complete Model Capability Presentation and Tool Surface design or a real model's ability to choose the right tool.
<!-- /open-etf-case -->

The [current public README](https://github.com/hpoenixf/open-etf-agent/blob/main/README.md) remains the usage entry. The command and assertions above belong to the linked fixed snapshot; do not combine different versions into one claimed run.

<span id="_7-conclusion-preserve-final-visibility-without-a-capability-manager"></span>

## 9. What to Ask During the Next Investigation

When the model does not use a tool, locate four facts first: was it discovered, admitted for this execution, actually presented in the turn, and dispatched for the particular call? Do not infer permission failure from non-selection or infer delivery from successful registration.

For request assembly, preserve three test cases: illegal descriptor changes must fail, lawful message fitting must pass, and rejection must produce the right original-ledger result. Also place an asynchronous wait after validation and try to mutate a retained reference. Comparing arrays only before the function returns may miss the actual dispatch gap.

That is [principle 2, “Complexity belongs with its rightful owner”](/en/principles#principle-2) here: make final presentation someone's clear responsibility without duplicating authorization and budgets. [Method 3, “Passing evidence through a research system”](/en/principles#method-3) separates admission evidence, the actual request and dispatch receipts so the missing connection can be located.

---

Further reading: [MCP Host: From Connecting a Service to Using Its Tools](https://hpoenixf.com/eff-agent-article/articles/mcp-host-from-discovery-to-consumption) · [Model, Runtime, MCP and Skill Responsibilities](https://hpoenixf.com/eff-agent-article/articles/agent-model-runtime-mcp-skill-boundaries) · [Code Is Cheaper; Why Are Systems Harder to Evolve?](https://hpoenixf.com/eff-agent-article/articles/code-cheaper-systems-harder-to-evolve)

More independent engineering cases: [ETF Agent Engineering Notes](https://github.com/hpoenixf/eff-agent-article). If these evolution problems look familiar, feel free to read, discuss, or Star the repository.
