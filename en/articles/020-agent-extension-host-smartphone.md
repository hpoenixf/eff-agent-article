---
readingBrief:
  takeaways:
    - "Compatibility profiles interpret external ecosystems while the Host connects them to the existing Runtime; plugins cannot redefine authorization, budgets or recovery."
    - "Trustworthy loading binds the actual executable bytes and authorized generation; a complete capability set becomes visible only after the batch initializes successfully."
    - "A successful callback does not prove its effect was consumed; serialize state settlement where needed, and never repeat initialization while replaying terminal history."
  appliesTo:
    - "Integrating third-party methods, tools and hooks into an existing agent while governing loading, state and cleanup."
  notFor:
    - "Using the trusted-local-package example as a sandbox guarantee, full ecosystem compatibility claim or promise of cost-free hot unloading."
---
# How Agent Extensions Enter the Host: Plugin Lifecycle and Runtime Boundaries

ETF Agent already had MCP for data access, Skills for research methods, a native tool loop, lifecycle Hooks, execution receipts, and Recovery. We could perform substantial investment research without a plugin system.

But each new capability still required bespoke decisions about discovery, registration, permissions, execution, maintenance, and upgrades. A new research method raised questions about model visibility, allowed tools, and result persistence. A pre-tool check required yet another round of lifecycle, argument, and failure-recovery decisions.

It resembled the feature-phone era: a manufacturer's firmware defined most capabilities, and adding one often meant modifying the core system.

The smartphone's real architectural contribution was not colorful App Store icons. It was a **relatively stable boundary between the operating system and independently evolving applications**.

Our goal became the Agent equivalent: **keep execution and governance in the core; allow capabilities to arrive as extensions**.

We studied Agent Plugins and the Claude, Pi, and Codex ecosystems with one firm constraint: wherever practical, run the **original extension inside our Agent Host**, not by launching a second Claude/Pi/Codex Agent to perform our task.

The result should remain *one Agent with extensions*, not a chain of loosely connected Agents.

The main article retains the original system's third-party integration design and history. A public v0.7 slice in [Open ETF Agent](https://github.com/hpoenixf/open-etf-agent) now makes a smaller lifecycle runnable: select trusted local packages, expose their contributions, read materials, save a report and release owned resources. It implements part of the lifecycle discussed below, not the original system's complete Claude, Pi or Codex compatibility layer.

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

## 2. Trustworthy Loading: Verify the Bytes That Actually Execute

Pinning versions, recording content hashes, and checking dependencies before startup are necessary when loading third-party extensions. But one further question matters: **does the loader execute the code that was reviewed?**

Pi TypeScript extensions can be loaded through Jiti. In a controlled module-resolution counterexample, plugin and dependency content locks stayed unchanged while links in the runtime environment could change the resolved module target. Checking source files was not equivalent to checking the executable result after transformation and resolution.

For extensions requiring transformation, our design uses a **reviewed-derived artifact**: bind the original package, platform dependencies, transform options, and Host identity, verify the final executable bytes, then load **those same verified bytes**. macOS ARM64 and Linux x64 dependency trees also need independent checks; a shared lockfile does not imply identical platform artifacts.

~~~ts
type ExtensionGenerationIdentity = {
  scopeId: string;
  installationId: string;
  generation: number;
  contentHash: string;
  profileRevision: string;
};
~~~

These fields distinguish approved content, the installation, and the currently admitted generation. **Trusting code and authorizing this installation to execute are separate decisions.** Upgrading a plugin does not carry forward the previous generation's execution entitlement.

The public teaching slice has a narrower contract. In v0.7, [`plugins.mjs`](https://github.com/hpoenixf/open-etf-agent/blob/5f70dc0b4760ad70ef211f4823828ab2fee5c525/src/plugins.mjs) accepts explicitly imported, trusted local JavaScript descriptors and checks the selected module file hash. It does not include the reviewed TypeScript transformation loader or certify arbitrary third-party dependency closures.

## 3. A Hook Matters Only When Its Effect Reaches the Right Consumer

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

## 4. Stateful Extensions: Write Ordering and Historical Replay Are Different Contracts

Pi's todo extension gave a decisive counterexample: in one controlled run, **three callbacks succeeded, but only one state-persistence receipt was committed and two writes conflicted**. Several operations had interleaved writes to the same plugin instance. We did not serialize the whole Agent; `state:write` tools now settle as ordered singletons in the relevant turn while independent reads remain concurrent.

Another case arose in PostgreSQL recovery. Reading **an already-terminal Run** incorrectly followed the new-Run initialization path and invoked a side-effecting `SessionStart` again. The corrected boundaries are:

- Genuinely new Run: invoke initialization, restore existing todo state, and allow new operations and receipts.
- Historical replay of a terminal Run: read committed receipts, recheck current display eligibility, and create no new initialization effect.

This does not disable Hooks for legitimate fresh runs. Run identity decides whether any new effect is appropriate. **Concurrent invocations need not have concurrent commits; reading history does not authorize re-execution.**

## 5. Research Plugins Need a Method and Controlled Artifacts, Not a Second Filesystem

Codex `cc-research` is more than a list of tools. Its method spans planning, Researchers collecting Sources and Claims, a Synthesizer writing a report, and a Stop-stage citation audit. Putting Skill text into model context does not implement those handoffs.

Compatibility belongs in a bounded Profile. For example, a single-line `description` containing a colon was rejected by a strict YAML parser; the adapter handles only the specific form the original ecosystem accepts, without silently rewriting the third-party file or its hash. More importantly, working files such as `sources-*.jsonl`, `claims-*.jsonl`, and `report.md` need not imply arbitrary Shell or workspace permissions.

We exposed narrowly scoped report operations through the existing Artifact Owner:

~~~text
report_write_strand
report_write_document
report_read
report_view
~~~

Each write has a role scope, logical identity, immutable version, and original source dependencies. A Child writes only its assigned strand; a Synthesizer reads the currently authorized fixed view; Main selects versions and coordinates handoffs. The original source must be rechecked at actual model dispatch if revocation could have occurred. A file on disk, or a source ID mentioned in prose, is not a durable receipt or permission grant.

**Byte identity and structured equality** are also different: PostgreSQL JSONB may change object-key order without changing an object's values, while original file hashes and signed bytes must still match exactly.

Finally, a zero exit code from the original `audit.py` Stop Hook may mean the audit was skipped—not that citations were audited or the research was correct. The script also uses original file timestamps; materializing an old report must not make it appear fresh. Full acceptance of the original script's correction chain remains a separate task.

**Supporting a research plugin is about placing its method, files, source dependencies, and audit in the existing record of what actually happened—not merely making every command runnable.**

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

### How the public slice avoids half-installed capabilities

Contribution declarations, activation and cleanup are not inventions unique to Agents. For example, [VS Code's extension documentation](https://code.visualstudio.com/api/get-started/extension-anatomy) already distinguishes declarative contributions, activation events and `activate` / `deactivate`. The local problem here is more specific: **a batch of capabilities enters one research Runtime; a later package failing must not leave an earlier package's partially assembled surface visible to the model.**

The public implementation checks the entire descriptor batch first: package identity, tool-name collisions, input Schemas, Skill body identity, Hook phases and limits, and every selected file's content identity. Only then does the first activation begin. Tools and Skills are declared up front; `activate` cannot return extra contributions afterward. The API returns the frozen capability set and bindings only after every activation succeeds. If a later descriptor is invalid, the first package never even starts activating.

If failure occurs later—after the first package acquired resources but while the second activates—cleanup callbacks registered through `deferRelease` execute in reverse order. One cleanup failure does not suppress the remaining callbacks, and `PLUGIN_RELEASE_FAILED` remains visible rather than becoming a clean-release result. The [lifecycle cases](https://github.com/hpoenixf/open-etf-agent/blob/5f70dc0b4760ad70ef211f4823828ab2fee5c525/test/plugins.test.mjs) preserve a concrete reentrancy defect: a cleanup callback that triggered `release` again could make the earlier implementation repeat cleanup. The implementation now stores a shared release Promise before entering callbacks, so concurrent calls or non-awaiting reentrancy reuse that cleanup attempt.

“Atomic publication” means **the capability set returned by this API**, not transactional rollback of arbitrary JavaScript effects. Trusted packages retain process privileges and must promptly register acquired resources. This is not a sandbox and cannot forcibly stop an arbitrary synchronous infinite loop. A Run retains its selected function references, metadata and package bindings for its lifecycle. Selecting a later version does not rebind the earlier Run; release is not hot-unloading an active task.

### Run two packages and inspect their actual results

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

This Extension Host choice reflects [principle 7, “Capabilities should be easy to introduce, replace and retire”](/en/principles#principle-7): new capabilities join existing execution and authorization paths without recreating Runtime each time. Controlled lifecycle and ownership do not imply that every plugin can be hot-unloaded without cost.

## Companion Essay: Executing Hooks Across Ecosystems

This article covers extension packages, generation identity, and the Extension Host design. The companion [Hooks Across Claude, Pi, and Codex](agent-multi-ecosystem-hook-execution.md) covers command protocol differences, original Pi Factory execution, killable subprocesses, durable effects, and Recovery. The two articles complement one another.

## Historical Evidence and Scope

The implementation window is **October 12, 2026**. Observed problems come from recorded engineering verification; simplified directories, file examples, and data values serve explanatory purposes.

Evidence categories include plugin lifecycle and Pi terminal replay; approval versus executable identity; platform dependency hashing; original Hookify/Pi test outcomes; Codex report file/Main/Child recovery; and Extension Package Registry, Command Hook Lifecycle, and Report Adapter implementations.
