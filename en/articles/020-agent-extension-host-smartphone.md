# How Agent Extensions Enter the Host: Plugin Lifecycle and Runtime Boundaries

ETF Agent already had MCP for data access, Skills for research methods, a native tool loop, lifecycle Hooks, execution receipts, and Recovery. We could perform substantial investment research without a plugin system.

But each new capability still required bespoke decisions about discovery, registration, permissions, execution, maintenance, and upgrades. A new research method raised questions about model visibility, allowed tools, and result persistence. A pre-tool check required yet another round of lifecycle, argument, and failure-recovery decisions.

It resembled the feature-phone era: a manufacturer's firmware defined most capabilities, and adding one often meant modifying the core system.

The smartphone's real architectural contribution was not colorful App Store icons. It was a **relatively stable boundary between the operating system and independently evolving applications**.

Our goal became the Agent equivalent: **keep execution and governance in the core; allow capabilities to arrive as extensions**.

We studied Agent Plugins and the Claude, Pi, and Codex ecosystems with one firm constraint: wherever practical, run the **original extension inside our Agent Host**, not by launching a second Claude/Pi/Codex Agent to perform our task.

The result should remain *one Agent with extensions*, not a chain of loosely connected Agents.

## 1. A Plugin Is More Than a Markdown File

It is tempting to describe the plugin problem as bundling Skill instructions and MCP tools.

Original third-party extensions revealed more variety:

- Claude's **Hookify** can block operations before tools run, propose continuation at Stop, and issue user-facing notices.
- Pi's **todo** registers tools, retains mutable state, and restores it when a new session begins.
- Codex's **cc-research** describes an entire research workflow: delegation, report files, source synthesis, and Stop-stage citation auditing.

A single universal Plugin JSON Schema cannot, by itself, execute all those semantics.

We separated two responsibilities:

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

## 2. First Trap: Unchanged Content Hashes Do Not Prove Unchanged Executed Code

Once the Host loads third-party code, the obvious first defense is content locking: pin versions, record hashes, verify dependencies at startup, execute only verified content.

That is necessary but not sufficient.

### The checked bytes may not be the loaded bytes

Pi TypeScript extensions can be loaded through **Jiti**. We constructed a resolve-only counterexample: plugin and dependency content locks stayed unchanged, yet links in the execution environment could alter the module that the Loader actually resolved.

~~~text
Checked plugin content: unchanged
Checked dependency content: unchanged
Actual Loader resolution target: may change
~~~

**Identical content is not identical execution identity.**

We introduced a controlled path for selected executable extensions:

~~~text
Original plugin and dependencies
  → Controlled transformation
  → Pinned transform options, runtime dependencies, and Host identity
  → Verify final executable bytes
  → Load from the exact same verified Buffer
~~~

We call the resulting object a **reviewed-derived artifact**. Its purpose is not merely translating TypeScript to JavaScript. It establishes **which code bytes were checked and actually executed**.

Platform differences made the problem concrete. On **October 9, 2026**, an original Pi/Hookify acceptance run on **macOS ARM64** was rejected by content-identity checks despite using the same source lockfile as a **Linux x64** environment.

Comparison of dependency trees revealed **11 differences**, concentrated in esbuild's platform package and the installer's hidden lock file. We retained separately reviewed dependency sets for the two platforms instead of weakening the content lock.

A plugin version is more than SemVer. Installation instance, platform-specific dependencies, executable content, and active generation all have distinct identities.

The Registry's generation identity is conceptually:

~~~ts
type ExtensionGenerationIdentity = {
  scopeId: string;
  installationId: string;
  generation: number;
  contentHash: string;
  profileRevision: string;
};
~~~

**A dynamic extension Host must separately verify approved content, executed content, and the installation generation presently entitled to run.**

## 3. Second Trap: A Hook Ran but Its Intended Effect Did Not Happen

Claude Hookify was a representative original extension for lifecycle compatibility. It participates in **PreToolUse**, **PostToolUse**, **UserPromptSubmit**, and **Stop**.

We retained the original package and executed its events through our own lifecycle executor.

The first problems were not loading failures but **output-consumption semantics**.

### 3.1 Hookify emitted a message; Host treated it as an error

One original Hookify matching test produced:

~~~text
command.unsupported-system-message
~~~

Hookify had emitted a user-facing message. Host failed to distinguish display content from execution control.

Hook outputs have different Owners:

| Hook output | Correct destination |
| --- | --- |
| Pre-tool denial | Admission of the current invocation |
| Post-tool result modification | Result projection and renewed validation |
| Model-facing additional guidance | Next model-request assembly |
| User-facing notification | Public delivery event |
| Stop-stage continuation advice | Existing Run Stop/Completion boundary |

We did not create a special notification subsystem for Hookify. User messages entered the existing event channel. Failure to display a notice must not silently erase an otherwise valid deny/block effect.

**Participating in the lifecycle does not grant a Hook ownership of the lifecycle.**

### 3.2 Failure advice was parsed but missing from the next model request

Another real Factory test used a **synthetic command Hook** to validate projection of **ToolFailure additionalContext**. It was *not* evidence that original Hookify implemented every such behavior.

In that test, the tool failed, the Hook adapter executed once, and the suggestion was parsed. Yet the next model request submitted to the Gateway lacked the approved instruction:

~~~text
Actual next gateway request
lacks AUTHORIZED_FAILURE_SUGGESTION
~~~

The Hook did run; its **result failed to cross the last consumption seam**.

We corrected the existing asynchronous context projection and request assembly. The final request carried the approved source-attributed suggestion while preserving the original tool-failure fact. It neither turned failure into success nor promoted the suggestion into new financial evidence.

We later saw the same pattern in RAG, tool results, and Memory: **producing output and actually consuming it in the next model request are distinct observable facts**.

Tests for extensions therefore need to inspect real tool actions, final model-request content, and user-visible events—not only assert that a callback ran.

## 4. Third Trap: Pi Changed How We Think About Plugin State

Pi's **todo** extension is a small but excellent stateful test: add tasks, list them, and restore state in a new session.

It exposed two important failures.

### 4.1 Three successful callbacks; only one persisted item

An original todo test on **October 9, 2026** produced:

| Observation | Before correction |
| --- | ---: |
| Successful plugin callbacks | 3 |
| State-persistence receipts | 1 |
| State conflicts | 2 |
| Finally persisted todo items | 1 |

Callbacks ran, but their shared plugin-instance writes interleaved incorrectly.

We did not serialize the entire Agent. We reused the Native executor to settle tools with **state:write** permission as **ordered singletons within the relevant turn**, keeping ordinary read-only tools concurrent.

After the correction, the same original example persisted the intended state, revisions advanced in sequence, and terminal replay added no new writes.

**Concurrent tool invocation does not mean concurrent side effects are safe.** Ordering should follow the shared state and authoritative receipts, not a blanket queue for every plugin call.

### 4.2 A terminal Run replayed SessionStart and created a new effect

Next we tested original todo state recovery against PostgreSQL. The first pass persisted tool receipts and state. We closed the original connections/Factory, created fresh database connections, Registry, and Factory, then replayed **the same already-terminal Run**.

The first real test failed with:

~~~text
hook.effect_recovery_unavailable
~~~

Host followed the normal "start a Run" path and invoked side-effecting **SessionStart** before returning previously committed results.

But this was **terminal replay**, not new execution. It intentionally had no fresh effect executor.

We separated two paths:

~~~text
Genuinely new Run
  → SessionStart
  → Restore todo from historical state
  → Invoke tools and commit new receipts

Replay of an already-terminal Run
  → Read original durable receipts
  → Check current display and authorization eligibility
  → Return existing results, without initialization Hooks
~~~

We did not disable SessionStart globally. It remains necessary for a real new Run; it is skipped only where no new lifecycle effect is allowed.

The test itself had also mistaken transient Publication material for a durable result. We corrected the comparison to wait for actual background persistence and then read the committed receipt.

Both corrections express one principle: **Recovery consumes effects that already happened; a retry or new Run may create new effects.**

For stateful extensions, this distinction matters more than superficial API compatibility.

## 5. Fourth Trap: Codex Plugins Can Depend on a Whole Research Workflow

Claude primarily tested Hook behavior; Pi tested tools and state. Codex **cc-research** raised a different problem: an entire research method.

Its workflow roughly involved:

~~~text
Create a plan
  → Delegate Researchers
  → Collect sources and claims
  → Synthesize source records
  → Synthesizer writes a report
  → Stop Hook audits citations
  → Revise and deliver using feedback
~~~

Placing its Skill text in model context alone could not implement those behaviors. It required authorized file operations, role handoffs, and an auditable view of reports.

### 5.1 One colon made the original Skill fail parsing

The original **SKILL.md** contained an ordinary unquoted **description** scalar with a colon followed by a space. Our strict YAML parser rejected it.

An illustrative example:

~~~yaml
name: research
description: Research: a complete workflow
~~~

Inspection of the Codex Skill parser showed a limited compatibility behavior: try strict parsing; if it fails in a qualifying description scalar, quote **that specific single-line field** and parse again.

We implemented this only in the Codex Profile. Other invalid YAML is not silently "auto-healed." The original body, file bytes, and content hash remain intact.

**Compatibility should model what the original ecosystem actually accepts, not modify third-party source files behind the user's back.**

### 5.2 The original plugin wants files; we did not want to grant it a whole Shell

cc-research exchanges logical files resembling:

~~~text
runs/<id>/
  meta.json
  plan.md
  sources-web-1.jsonl
  claims-web-1.jsonl
  sources-web-2.jsonl
  claims-web-2.jsonl
  report.md
~~~

A writable shell workspace would be the easiest integration. But ETF Agent already had an Artifact Repository, receipts, source authorization, and cancellation. A second unconstrained filesystem would create competing persistence facts.

We added narrow report interfaces through the existing Artifact Owner:

~~~text
report_write_strand
report_write_document
report_read
report_view
~~~

Files have constrained types, logical identities, immutable versions, and original source dependencies.

A web-researcher Child may write only its assigned source/claim strand; a Synthesizer reads currently authorized fixed views and writes its report. Main selects versions and coordinates handoffs.

A file existing on disk does not imply a durable commit. Writing **source_ids** in prose does not authorize those sources.

We found a race as well: when an evidence producer was disabled just before Main's next model dispatch, a permission check at an earlier read was insufficient. The original producer and dependency had to be rechecked **at actual dispatch**.

The report interfaces are **source- and receipt-bound file effects**, not merely helper functions for arbitrary file I/O.

### 5.3 PostgreSQL JSONB changed key order and broke report readback

In Recovery testing, JSON objects saved and read through PostgreSQL **JSONB** could change their key insertion order.

Stringifying them for equality incorrectly made structurally identical objects appear different:

~~~json
{"source":"A","version":1}
~~~

Versus:

~~~json
{"version":1,"source":"A"}
~~~

The JSON object semantics are equal despite different text order.

We switched the relevant check to **structural deep equality**: fields, types, values, and array order remain significant; **object insertion order** is not business identity.

The general rule is to distinguish byte-sensitive artifacts, signed content, and hashes from structured persisted objects whose equivalent representation need not use identical key order.

### 5.4 Stop Hook exit code zero may mean "audit skipped"

Original cc-research **audit.py** checks citations during Stop. But an exit code of **0** can occur on reentrancy guards, completion-state checks, stale-input skips, and other non-audit paths.

~~~text
Process exit 0
  ≠ Citation audit executed
  ≠ Citation audit passed
  ≠ Research content is correct
~~~

The script also uses filesystem modification times to decide freshness. Re-materializing an old report into a temporary directory can reset mtime to "now" and silently change the audit.

The controlled view must preserve original persistence times; command and working-directory bindings must be revalidated rather than silently rewriting paths or clocks.

The original script's full correction chain remains subject to **separate acceptance**. This article reports the observed dependency assumptions and Host design, not a blanket citation-audit success claim.

## 6. What the Extension Host Ultimately Owns

After these cases, its responsibilities are much clearer:

**Package discovery** identifies Core, Skill, MCP, and selected Profile content. A declaration being discovered does not mean it is running.

**Approval and content identity** determine which installation generation may execute. Review records, content locks, actual loaded bytes, and permissions must be independently checkable. An installation entry is not current approval; upgrading cannot inherit execution rights from an obsolete generation.

**Generation Registry** publishes the present set of capabilities. Async initialization first stages registrations; only a successful initialization atomically publishes them. A half-initialized plugin cannot leave a half-visible tool set.

**Lifecycle and tool adapters** connect callbacks to actual execution: Pre decisions apply before calls, Post decisions to result projection, notices to user events, Stop advice to the existing termination boundary. Every tool remains governed by Native identity, budgets, and cancellation.

**Durable Effects** settle plugin state, report writes, and command effects through the original execution receipts. Recovery reuses settled facts; a successful callback or transient file cannot be relabeled "completed" without its authoritative commit.

In one sentence:

> **Extension Host is the compatibility and governance seam between outside ecosystems and the existing Agent Runtime—not a second Agent.**

It permits new behaviors without embedding each third-party plugin's private state machine, permissions, and tool loop into Research Runtime.

## 7. Who Owns an Extension's Effects?

Our original question was how to support more third-party plugins. The actual work confronted loader identity, Hook output consumption, state-write ordering, terminal replay, constrained file exchange, and external scripts' assumptions about clocks and filesystems.

These look unrelated. All ask the same thing:

**Who makes an external capability's behavior an authoritative system fact?**

Our preferred split is:

~~~text
Model        Understands the task and chooses next steps
Skill        Supplies research methods and task instructions
MCP / Tool   Supplies concrete invocable capabilities
Plugin Host  Adapts third-party capabilities and lifecycle callbacks
Runtime      Owns execution, budget, cancellation, and Recovery
Application  Owns user, source, and durable business facts
~~~

Third-party extensions may define methods, tools, and callbacks without erasing the existing safety boundaries.

The smartphone can evolve continuously not because it shipped with every application, but because applications can rely on a reusable execution substrate.

The same holds for Agents:

**An Agent's long-term evolution depends less on how many features it embeds than on how continuously it can absorb new capabilities while keeping core complexity under control.**

## Companion Essay: Executing Hooks Across Ecosystems

This article covers extension packages, generation identity, and the Extension Host design. The companion [Hooks Across Claude, Pi, and Codex](agent-multi-ecosystem-hook-execution.md) covers command protocol differences, original Pi Factory execution, killable subprocesses, durable effects, and Recovery. The two articles complement one another.

## Historical Evidence and Scope

The implementation window is **October 12, 2026**. Observed problems come from recorded engineering verification; simplified directories, file examples, and data values serve explanatory purposes.

Evidence categories include plugin lifecycle and Pi terminal replay; approval versus executable identity; platform dependency hashing; original Hookify/Pi test outcomes; Codex report file/Main/Child recovery; and Extension Package Registry, Command Hook Lifecycle, and Report Adapter implementations.
