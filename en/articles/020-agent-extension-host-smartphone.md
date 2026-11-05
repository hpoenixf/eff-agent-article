---
description: "Registration alone does not make a plugin reliable. Follow executable bytes, generation retention, callback consumption, state writes and report audits through one Host, comparing static Skills, MCP services, upstream Agents and compatibility profiles."
readingBrief:
  takeaways:
    - "Choose an integration boundary first: method text, standalone services and upstream Agents each fit different needs; lifecycle compatibility has a maintenance cost."
    - "Generation publication and Run retention are distinct: the registry supports retained Runs, but the production bootstrap still lacks the full identity/release forwarding."
    - "Inspect executable bytes, actual model input and durable receipts; content locks, successful callbacks and exit zero cannot stand in for them."
    - "The public example uses trusted local packages; reviewed-derived loading and limited production profiles are not a sandbox for arbitrary third-party code."
  appliesTo:
    - "Adding methods, tools and Hooks to an existing Agent while retaining its budgets, sources, state and Recovery owners."
  notFor:
    - "Promising universal plug-and-play compatibility, cost-free hot unloading or real research quality from synthetic local examples."
---

# How Agent Extensions Enter the Host: Plugin Lifecycle and Runtime Boundaries

A todo plugin gets three successful callback results, yet only one state write commits. A research plugin's Stop script exits zero without necessarily auditing any citation. A package and its dependency lock stay unchanged, yet the loader may resolve different code.

These recorded counterexamples show that integration is more than another tool name. The Host must establish **which capability this Run selected, who consumes its outputs, how effects are saved and when resources may be released.**

The current choice runs supported extensions inside the existing Agent Runtime, reusing its tool loop, budget, source authority and Recovery. Compatibility Profiles interpret ecosystem differences; Extension Host connects the behaviors. It does not delegate the task to another Claude, Pi or Codex Agent, nor promise complete ecosystem compatibility.

The public v0.7 slice in [Open ETF Agent](https://github.com/hpoenixf/open-etf-agent) demonstrates only trusted-local-package selection, activation, method/source reads, reports and cleanup. The following separates current production lanes, historical observations and that smaller runnable example.

## 1. Choose the Boundary Before Building a Full Host

Giving the model a research method and importing an extension with session state have different costs.

| Integration | When it fits better | Boundary to account for |
| --- | --- | --- |
| Static Skill or method text | The value is a procedure, checklist or source guide | The Host separately supplies required tools and artifact flow; text does not execute callbacks |
| Independent MCP service | Capability fits tools, resources or prompts and should work across applications | The service retains its lifecycle; client sessions are not automatically the local extension's state |
| Use the upstream Agent | Full native-ecosystem behavior matters most, and its separate loop is acceptable | Task handoff, context, budget and result identity need explicit coordination; it is not a native Host extension |
| This Host's compatibility profile | Selected tool, Hook, session-state or research-file semantics must reuse this Runtime | Maintain protocol, authority and effect mappings, and disclose unsupported APIs and versions |

[MCP architecture](https://modelcontextprotocol.io/specification/2025-06-18/architecture) already defines Hosts, isolated client connections, server tools/resources/prompts and capability negotiation, with security and authorization decisions at the Host. It is not a stateless tool list. It simply does not automatically interpret Pi `SessionStart`, Claude Stop or a particular research script's filesystem conventions.

This project chooses profiles because those extra semantics matter while research should still settle through one Runtime. The cost is explicit, maintained compatibility scope. One JSON Schema does not make runtime behaviors equivalent. A simple data capability will often be cheaper to expose directly through MCP.

<span id="_1-a-plugin-is-more-than-a-markdown-file"></span>
<span id="_6-what-the-extension-host-ultimately-owns"></span>
<span id="how-the-public-slice-avoids-half-installed-capabilities"></span>

## 2. From Declarations to a Run: Publish and Retain Generations

The input is not just a tool definition. Three original extensions require different runtime semantics:

- Claude's **Hookify** can block operations before tools run, propose continuation at Stop, and issue user-facing notices.
- Pi's **todo** registers tools, retains mutable state, and restores it when a new session begins.
- Codex's **cc-research** describes an entire research workflow: delegation, report files, source synthesis, and Stop-stage citation auditing.

A single universal Plugin JSON Schema cannot, by itself, execute all those semantics.

The current boundary separates two responsibilities:

**Compatibility Profiles** interpret the external ecosystem's conventions. **Extension Host** admits and connects approved behaviors to our existing execution system.

~~~mermaid
graph TD
PluginPackage --> ParseCompatibility
ParseCompatibility --> ApproveIdentity
ApproveIdentity --> GenerationRegistry
GenerationRegistry --> ExtensionHost
ExtensionHost --> SkillsMcpTools
ExtensionHost --> LifecycleHooks
SkillsMcpTools --> NativeRuntime
LifecycleHooks --> NativeRuntime
~~~

Agent Plugins **1.0.0** offers a portable core package convention, with Skills and MCP as basic elements. Ecosystem-specific Hooks, tools, and session state belong to the corresponding Claude/Pi/Codex Profile. We also reserve a Profile entry for OpenCode.

We do **not** promise perfect compatibility with every extension in every ecosystem. We prioritize useful behaviors that can legitimately operate through the current Host.

The fundamental rule is that **a plugin may offer methods, request tools, and register callbacks; it may not redefine our budget, source authorization, execution receipts, or Recovery contract**.

Fresh admission checks installation, review and content identity, then stages registrations. Async initialization and `PluginLoad` must succeed before publication. Atomicity covers **one installation generation’s registration set**, not all installations globally: unrelated installations can proceed, some profiles admit locally unavailable components, and production Codex separately requires all configured mandatory components. Approval, tool execution and budget remain with their original owners.

Upgrade and disable have a counterintuitive distinction: **stopping new Runs from acquiring a generation does not mean destroying the generation an existing Run uses.** The registry implements retained Run snapshots and generation references, also covered by the corresponding direct-Factory test. Disable removes fresh admission and aborts incomplete initialization; a generation retained by an existing Run is neither aborted nor cleaned up merely for that reason, and is not rebound to the new version. It drains after original Runs release their references and it is neither enabled nor retained. Actual cancellation, deadlines and execution constraints remain with the Run owner.

Consequently, “disabled” is not “fully released.” Cleanup cannot claim completion while a Run retains the generation. Stable same-Run authorization applies to the originally selected scope; new Runs and versions still require independent admission.

**The production wiring has a verified gap.** Factory supplies Run identity and admitted generations and invokes release at the end, but the bootstrap facade actually injected by the server forwards only scope. It drops the Run/generation arguments and does not forward `releaseRun`. This is a fixed-source finding, not a newly executed failure experiment. Retention is therefore implemented in the registry and direct path, not established across all production composition. Older package-spec disable fencing also cannot replace the newer Run-lifetime contract. The general production path still needs that engineering connection.

### Public Slice: A Batch Must Not Become Half Installed

Contribution declarations, activation and cleanup are not inventions unique to Agents. For example, [VS Code's extension documentation](https://code.visualstudio.com/api/get-started/extension-anatomy) already distinguishes declarative contributions, activation events and `activate` / `deactivate`. The local problem here is more specific: **a batch of capabilities enters one research Runtime; a later package failing must not leave an earlier package's partially assembled surface visible to the model.**

The public implementation checks the entire descriptor batch first: package identity, tool-name collisions, input Schemas, Skill body identity, Hook phases and limits, and every selected file's content identity. Only then does the first activation begin. Tools and Skills are declared up front; `activate` cannot return extra contributions afterward. The API returns the frozen capability set and bindings only after every activation succeeds. If a later descriptor is invalid, the first package never even starts activating.

If failure occurs later—after the first package acquired resources but while the second activates—cleanup callbacks registered through `deferRelease` execute in reverse order. One cleanup failure does not suppress the remaining callbacks, and `PLUGIN_RELEASE_FAILED` remains visible rather than becoming a clean-release result. The [lifecycle cases](https://github.com/hpoenixf/open-etf-agent/blob/5f70dc0b4760ad70ef211f4823828ab2fee5c525/test/plugins.test.mjs) preserve a concrete reentrancy defect: a cleanup callback that triggered `release` again could make the earlier implementation repeat cleanup. The implementation now stores a shared release Promise before entering callbacks, so concurrent calls or non-awaiting reentrancy reuse that cleanup attempt.

“Atomic publication” means **the capability set returned by this API**, not transactional rollback of arbitrary JavaScript effects. Trusted packages retain process privileges and must promptly register acquired resources. This is not a sandbox and cannot forcibly stop an arbitrary synchronous infinite loop. A Run retains its selected function references, metadata and package bindings for its lifecycle. Selecting a later version does not rebind the earlier Run; release is not hot-unloading an active task.

<span id="_2-trustworthy-loading-verify-the-bytes-that-actually-execute"></span>

## 3. Why Unchanged Hashes Can Still Lead to Different Code

Pinning versions, recording content hashes, and checking dependencies before startup are necessary when loading third-party extensions. But one further question matters: **does the loader execute the code that was reviewed?**

Pi TypeScript extensions can be loaded through Jiti. In a controlled module-resolution counterexample, plugin and dependency content locks stayed unchanged while links in the runtime environment could change the resolved module target. Checking source files was not equivalent to checking the executable result after transformation and resolution.

The reviewed-derived lane binds the original package, platform dependencies, transform options and Host identity. It reads the artifact within a bound, checks its length and digest, and passes source decoded from **that same verified buffer** to the fixed loader for evaluation, rather than reopening a filename after checking it. macOS ARM64 and Linux x64 dependency trees still require separate checks; a shared lockfile does not imply identical platform artifacts.

~~~ts
type ExtensionGenerationIdentity = {
  scopeId: string;
  installationId: string;
  generation: number;
  contentHash: string;
  profileRevision: string;
};
~~~

These fields distinguish content, installation and selected generation. **Trusting executable bytes and authorizing a Run to use them are separate decisions.** A new version cannot borrow old approval; retaining an existing Run binding does not approve a new version.

The public teaching slice has a narrower contract. In v0.7, [`plugins.mjs`](https://github.com/hpoenixf/open-etf-agent/blob/5f70dc0b4760ad70ef211f4823828ab2fee5c525/src/plugins.mjs) accepts explicitly imported, trusted local JavaScript descriptors and checks the selected module file hash. It does not include the reviewed TypeScript transformation loader or certify arbitrary third-party dependency closures.

Current production composition explicitly refuses original-source loading without the separately reviewed execution lane. The reviewed-derived Pi lane accepts configured local/state behavior; the declarative Codex lane admits listed Skills, bounded commands and report tools rather than arbitrary source modules, MCP configurations or tools. A lower-level adapter being available for qualification does not establish default production admission for that path.

The current Pi adapter hosts the reviewed module instance through `PiHeadlessProcess`, with process exit confirmed by the original lifecycle. This differs from the public slice’s trusted in-process JavaScript descriptors.

Same-buffer evaluation solves “check what you actually use,” not code isolation. An observed loader digest does not automatically approve every module cache, hook and execution path in the deployed Host. Running arbitrary untrusted code requires a real isolation solution; renaming a content lock cannot provide one.

<span id="_3-a-hook-matters-only-when-its-effect-reaches-the-right-consumer"></span>

## 4. Find the Consumer After a Callback Succeeds

Claude Hookify participates in `PreToolUse`, `PostToolUse`, `UserPromptSubmit`, and `Stop`. These names do not give every Hook output the same authority:

| Hook output | Where its effect is settled |
| --- | --- |
| Pre-tool denial | Original tool admission |
| Post-tool result change | Result projection and renewed validation |
| Model-facing guidance | Next model-request assembly |
| User-facing notice | Existing delivery event |
| Stop-stage continuation advice | Original Run termination boundary |

Original Hookify once emitted a user-facing notice that Host treated as an error. In a separate controlled check using a **synthetic command Hook**, parsed tool-failure advice failed to appear in the next actual model request. The latter was not an acceptance test of original Hookify. Together, the cases show that **a callback running does not prove that its effect reached its intended consumer**.

We corrected consumption through the existing event and asynchronous-context paths, without building a second publication, authorization, or completion system for Hooks. An original tool failure remains a failure; advice reaching model input is not new financial evidence. Verification must follow actual tool actions, final model requests, and user delivery events rather than stopping at "the Hook ran."

A useful check follows each output one step further: did advice enter the actual request, did a user notice become an existing delivery event, and did state mutation obtain its storage receipt? Conversely, needing advisory text must not give a plugin authority to redefine tool success, publish a body or finish the entire research. Necessary safety restrictions and approved execution retain their original permission boundaries; an ecosystem event name grants none of them automatically.

<span id="_4-stateful-extensions-write-ordering-and-historical-replay-are-different-contracts"></span>

## 5. Order State Writes Without Reinitializing History

Pi's todo extension gave a decisive counterexample: in one controlled run, **three callbacks succeeded, but only one state-persistence receipt was committed and two writes conflicted**. Several operations had interleaved writes to the same plugin instance. We did not serialize the whole Agent; `state:write` tools now settle as ordered singletons in the relevant turn while independent reads remain concurrent.

Another case arose in PostgreSQL recovery. Reading **an already-terminal Run** incorrectly followed the new-Run initialization path and invoked a side-effecting `SessionStart` again. The corrected boundaries are:

- Genuinely new Run: invoke initialization, restore existing todo state, and allow new operations and receipts.
- Historical replay of a terminal Run: check original committed receipts and content identity under the original Run grant, honor independently applicable display restrictions, and create no new initialization effect.

This does not disable Hooks for legitimate fresh runs. Run identity decides whether any new effect is appropriate. **Concurrent invocations need not have concurrent commits; reading history does not authorize re-execution.**

The chosen constraint is narrow: order settlement of shared-state writes, rather than serializing every read and every plugin. This limits write throughput on that state, but conflicts no longer hide behind several apparently successful callbacks. Higher write concurrency would need mergeable operations or a conflict policy from the state owner; a tool's parallel eligibility cannot imply concurrent side-effect commits are safe.

<span id="_5-research-plugins-need-a-method-and-controlled-artifacts-not-a-second-filesystem"></span>

## 6. Make Report Handoffs and Audit Qualification Explicit

Codex `cc-research` is more than a list of tools. Its method spans planning, Researchers collecting Sources and Claims, a Synthesizer writing a report, and a Stop-stage citation audit. Putting Skill text into model context does not implement those handoffs.

Compatibility belongs in a bounded Profile. For example, a single-line `description` containing a colon was rejected by a strict YAML parser; the adapter handles only the specific form the original ecosystem accepts, without silently rewriting the third-party file or its hash. More importantly, working files such as `sources-*.jsonl`, `claims-*.jsonl`, and `report.md` need not imply arbitrary Shell or workspace permissions.

We exposed narrowly scoped report operations through the existing Artifact Owner:

~~~text
report_write_strand
report_write_document
report_read
report_view
~~~

Each write has a role scope, logical identity, immutable version, and original source dependencies. A Child writes only its assigned strand; a Synthesizer reads the fixed view authorized for the original Run; Main selects versions and coordinates handoffs. Actual model dispatch checks the durable Run grant, the Child’s admitted subset, source identity, and execution conditions. Later changes to external permission tables do not shrink the same Run’s grant. A new Run or an out-of-scope resource still needs explicit admission; missing bytes, a changed version, or a content-hash mismatch remain read failures. A file on disk, or a source ID mentioned in prose, is not a durable receipt or permission grant.

**Byte identity and structured equality** are also different: PostgreSQL JSONB may change object-key order without changing an object's values, while original file hashes and signed bytes must still match exactly.

The following audit evidence uses the original script, synthetic material and a scripted Gateway. It qualifies a controlled mechanical path, not real-model research quality or ordinary live HTTP acceptance.

Stop auditing is where “the script ran” is most easily inflated into “research passed.” Original `audit.py` can exit zero through complete/abandoned, stale-input or anti-loop bypasses. Normal Skill completion retains its complete-status bypass; it is not a mandatory quality gate. The script also reads file modification times, so materializing an old report must not turn its durable timestamp into “just created.”

The recorded controlled path now extends beyond first feedback: original Stop exits 2 for a bad citation, the feedback reaches the next actual Main request, and Main saves one repair through the original file effect. A **separately admitted audit event** then runs the unchanged script against the exact repaired seven-file snapshot. It uses `stop_hook_active=false`; the six control/evidence files retain their identities across the repair, while the original bad-citation exit 2 and repaired success remain separate observations. The continuation turn's own `true / exit 0` remains only an anti-loop exemption, not an audit of the repaired report.

This specific same-view repair chain has controlled evidence. It does not authorize automatic production re-audits or establish quality for arbitrary RootRuns. Each new snapshot still binds original view/report receipts, ancestry, durable times, actual cwd/command and input digests, with event-specific process admission and effect confirmation. Settled replay reuses its receipt; an unknown effect must not be blindly dispatched again.

<span id="run-two-packages-and-inspect-their-actual-results"></span>

## 7. Run Two Packages and Inspect Methods, Sources, Reports and Cleanup

The [current main README](https://github.com/hpoenixf/open-etf-agent/blob/main/README.md) is the continuing entry point. The commands below pin the published v0.7 commit so later interface changes do not alter this example. Local qualification used Node.js 26.11.1. Package metadata supports 26.8.1–26.x, which is not a claim that every patch version was tested in the same environment.

```bash
git clone https://github.com/hpoenixf/open-etf-agent.git open-etf-agent-plugin-demo
cd open-etf-agent-plugin-demo
git checkout --detach 5f70dc0b4760ad70ef211f4823828ab2fee5c525
npm ci --ignore-scripts --no-audit --no-fund
npm run session -- start --session runs/plugin-article --case trusted-plugins
```

Initial installation may access npm. The example uses synthetic documents and a scripted Gateway, with no remote model calls. SQLite, method reads, tool execution and file persistence are real. Use a new demonstration session directory, not existing research data.

[`example-plugins.mjs`](https://github.com/hpoenixf/open-etf-agent/blob/5f70dc0b4760ad70ef211f4823828ab2fee5c525/src/example-plugins.mjs) supplies two original packages: one reads a synthetic document method and page; the other reads an ETF method and material explicitly labeled as invented. They do not start another Agent or mistake Skill registration for an actual method read. [`durable-demo.mjs`](https://github.com/hpoenixf/open-etf-agent/blob/5f70dc0b4760ad70ef211f4823828ab2fee5c525/src/durable-demo.mjs) first invokes both method-reading tools, then acquires sources and calls the existing `save_report`. The ETF fixture is neither market-data integration nor an investment conclusion.

The terminal JSON's `directory` identifies this Run. Open its `report.md` and `manifest.json` to inspect the report, two acquired methods and two original sources. `receipt` is an actual file receipt; `pluginRelease.status` reports cleanup for this activation. The two example packages acquire no additional external resources, so their `released` status alone cannot establish arbitrary resource cleanup. To inspect mid-activation failure, reverse cleanup and cleanup errors, run the lifecycle cases independently rather than the whole project suite:

```bash
node --test --test-concurrency=1 test/plugins.test.mjs
```

Package bindings are also recorded in the same SQLite Session. Replace `run-YOUR_ID` below with the actual `runId` printed by `start`, then inspect `definition.bindings.plugins` for package IDs, versions, descriptor versions and content hashes:

```bash
npm run session -- inspect --session runs/plugin-article --run run-YOUR_ID
```

[`runtime.mjs`](https://github.com/hpoenixf/open-etf-agent/blob/5f70dc0b4760ad70ef211f4823828ab2fee5c525/src/runtime.mjs) connects the published tools and Hooks to the existing loop and releases that selected package set when the invocation ends. This is the reproducible capability: **trusted contributions reach the actual method/source owners and produce a readable report plus cleanup results through the original Runtime**. Package lifecycle and durable Run cancellation/recovery remain separate responsibilities; see the [public control-handoff slice](https://hpoenixf.com/eff-agent-article/en/articles/agent-control-events-durable-owner-adoption) for the latter. One plugin example does not establish cross-ecosystem compatibility, background scheduling or real-model adoption quality.

<!-- open-etf-case:plugins@e1b8e4edde724548fab16d8ca4b205379bfa7f30 -->
### Verify that two packages enter the same Host

The [plugin integration case at this fixed public snapshot](https://github.com/hpoenixf/open-etf-agent/blob/e1b8e4edde724548fab16d8ca4b205379bfa7f30/test/plugins.test.mjs) sends two trusted package contributions through the ordinary Runtime and Host, beyond merely loading them.

After installing dependencies according to the README at the linked fixed snapshot, run:

```bash
node --test --test-concurrency=1 --test-name-pattern='^7\.1 two trusted packages use the ordinary Host and acquired source/method owners$' test/plugins.test.mjs
```

It reads two methods and two synthetic sources, saves a report, checks the two source and two method entries in `manifest.json`, and verifies resource release. The terminal should report this exact test as passing.

The case establishes trusted local-package integration with one execution path. It supplies neither a sandbox for third-party code nor full Claude, Pi, or Codex ecosystem qualification.
<!-- /open-etf-case -->

<span id="_7-who-owns-an-extension-s-effects"></span>
<span id="companion-essay-executing-hooks-across-ecosystems"></span>
<span id="historical-evidence-and-scope"></span>

## 8. Extensions Add Behavior, Not a Second Set of System Facts

Once a profile is chosen, the important question is not how many plugins are registered, but whether each behavior fits the existing responsibility split:

~~~text
Model        Understands the task and chooses next steps
Skill        Supplies research methods and task instructions
MCP / Tool   Supplies concrete invocable capabilities
Plugin Host  Adapts third-party capabilities and lifecycle callbacks
Runtime      Owns execution, budget, cancellation, and Recovery
Application  Owns user, source, and durable business facts
~~~

Checks can follow the user path: does failed activation leave visible tools; does upgrading silently rebind an old Run; does advice reach the actual request; does each state write have its receipt; does terminal History create initialization effects; and are cleanup failures recorded accurately? These establish behavior instead of using registration or test counts as proxies for engineering value.

[VS Code Extension Host](https://code.visualstudio.com/api/advanced-topics/extension-host) also distinguishes local Node, web and remote hosts, selecting location by capability and environment. The useful lesson is that “the same extension” does not imply identical execution conditions everywhere. This project's profiles, reviewed loading and public trusted packages have separate boundaries, not a universal cross-platform sandbox guarantee.

[Principle 7, “Capabilities should be easy to introduce, replace and retire”](/en/principles#principle-7) means controlled responsibilities and lifecycle here. New methods do not recreate Runtime; stopping fresh admission does not erase retained Run bindings; release needs evidence. It does not mean arbitrary extensions can be hot-unloaded for free.

The plugin examples retain their October 12, 2026 observation window, calibrated against current generation and Run-authorization behavior. Report-audit qualification uses the separately identified later controlled chain. Directories, files and data examples are teaching simplifications. Historical engineering records are not new experiments in this revision and do not establish full ecosystem compatibility or real-model adoption quality.

The companion [Hooks Across Claude, Pi, and Codex](agent-multi-ecosystem-hook-execution.md) covers command-protocol differences, original Pi Factory execution, killable subprocesses and durable effects. This article focuses on which facts retain their original owners when those behaviors enter one Host.
