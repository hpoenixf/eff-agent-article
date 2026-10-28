# From Claude and Pi to Codex: Running Multi-Ecosystem Hooks Inside Our Agent Runtime

The companion [Extension Host article](020-agent-extension-host-smartphone.md) explains how ETF Agent discovers, reviews, and loads external plugins so selected Claude, Pi, and Codex extensions can run inside our own Agent.

It leaves a harder question: **once a plugin loads, how does its Hook actually execute?**

Callbacks are easy in principle. Ecosystems disagree about what their callbacks mean.

Claude Code Hooks may be external commands consuming stdin and expressing decisions through stdout, stderr, and exit codes. Pi Extensions are TypeScript modules that register asynchronous callbacks, tools, and state operations; their callbacks retain closures and session contexts. Codex supports command Hooks but differs in event payloads, matchers, and exit behavior. OpenCode has another plugin event API.

Running these extensions through ETF Agent's **Native Loop**, without launching another Claude/Pi/Codex Agent to perform the task, takes more than an **on(event, callback)** helper.

External callbacks must participate in model requests, actual tool execution, and Run completion while respecting the existing permission, resource, Recovery, and persistence contracts.

## 1. Similar Hook Names Do Not Mean Equivalent Semantics

| Scenario | Claude Code | Pi | ETF Agent |
| --- | --- | --- | --- |
| Session begins | SessionStart | session_start | SessionStart |
| User input | UserPromptSubmit | before_agent_start | UserPromptSubmit |
| Before tool execution | PreToolUse | tool_call | PreToolUse |
| After tool execution | PostToolUse | tool_result | PostToolUse |
| Before model request | No simple one-to-one command Hook | context and related events | BeforeModelRequest |
| Preparing to finish | Stop | Different turn-end semantics | Stop |

This is an approximate correspondence, not semantic equivalence or evidence that every Pi event is implemented.

For example, Pi's **before_agent_start** can affect Pi's native context handling. ETF Agent's **UserPromptSubmit** does not let a plugin rewrite the user's original request or replace Host system instructions at will.

Pi has **turn_end**, while ETF Agent has **TurnEnd**. Their ModelTurn, tool settlement, and state contracts differ. The present compatibility layer explicitly reports unsupported Pi **turn_end** semantics when the required state contract is absent, rather than returning a false success.

We separated two concepts:

**Native Lifecycle** defines *when* an event occurs in our Agent. **Compatibility Profile** defines what a foreign plugin is allowed to mean and do at that event.

Native Loop should not implement each ecosystem's protocol fields, and similar event names confer no additional Host execution rights.

## 2. Own the Lifecycle Instead of Copying One Ecosystem's Event Table

ETF Agent's Native Hook layer includes **13 lifecycle stages**, spanning load/unload, session boundaries, user input, model requests, tool calls and failures, context compaction, turn end, and Stop.

The actual insertion points matter more than the names:

- **PreToolUse** takes effect *before actual dispatch*.
- **PostToolUse** handles a tool result that already exists.
- **BeforeModelRequest** contributions must be consumed by the *actual authorized model request*.
- **Stop** may recommend continuation but cannot become another independent Run terminator.

Plugins do not inspect arbitrary Runtime internals to find their own call sites. Nor do we maintain a second tool loop for each ecosystem.

Native Runtime emits an event. Host selects approved callbacks. Compatibility adapters execute them. The original effect Owners interpret valid results.

~~~mermaid
graph TD
NativeEvent --> FrozenRegistry
FrozenRegistry --> CompatibilityProfile
CompatibilityProfile --> EffectAdmission
EffectAdmission --> CommandHookProcess
EffectAdmission --> PiExtensionProcess
CommandHookProcess --> ValidateOutcome
PiExtensionProcess --> ValidateOutcome
ValidateOutcome --> OriginalRuntimeOwner
~~~

This illustrates a main path for side-effecting callbacks. Pure callbacks need not use the durable effect executor. Output consumption remains event-specific.

### Hook ordering must not depend on Promise completion order

One tool invocation can match Global, Tool, Skill, Skill+Tool, and multiple reviewed-plugin Hooks.

If independent Promises mutate the same argument or result as they settle, semantics vary by scheduling.

Native Host first determines a stable callback sequence using registration scope, Skill/plugin identity, and Profile order, then freezes the appropriate inputs. A valid pre-tool argument transformation is applied in sequence; its effective output becomes input for the next callback.

The Run also binds the chosen plugin generation. A plugin upgraded mid-call must not slip a new callback into an old invocation. Execution and Recovery then share a stable identity basis.

<!-- open-etf-case:hooks@e1b8e4edde724548fab16d8ca4b205379bfa7f30 -->
### Return Hook argument changes to the original Host

The [Host argument-change case at this fixed public snapshot](https://github.com/hpoenixf/open-etf-agent/blob/e1b8e4edde724548fab16d8ca4b205379bfa7f30/test/cooperation-integration.test.mjs) checks one basic boundary: a Hook may propose a change, but the original Host still validates what executes.

After installing dependencies according to the README at the linked fixed snapshot, run:

```bash
node --test --test-concurrency=1 --test-name-pattern='^3\.3 Host revalidates effective Hook arguments and preserves original call$' test/cooperation-integration.test.mjs
```

A permitted change moves the page from 1 to 2 while retaining both `original` and `effective` arguments. Another change requests page 99 and must return `rejected` before dispatch. The exact test checks both paths.

This runs a local Hook chain, not a Claude/Codex command Hook or a Pi Factory. It does not qualify cross-ecosystem lifecycle compatibility.
<!-- /open-etf-case -->

## 3. Claude and Codex: Command Hooks Require Separate Dialect Adapters

Claude and Codex command Hooks are **processes**, not JavaScript functions registered inside Runtime.

Their controlled execution path is:

~~~text
Native event
  → Match event against allowed matchers
  → Construct ecosystem-specific stdin JSON
  → Verify command identity and effect authorization
  → Launch a controlled process
  → Collect exit code, stdout, and stderr
  → Interpret the dialect's result
  → Return to the original execution Owner
~~~

### 3.1 Do not serialize raw Host Context as Hook input

Codex may request fields such as **turn_id**, **model**, and **permission_mode**. Some Claude events expect a **transcript_path**.

We separate protocol field mapping in **command-hook-profile.ts** from event projection in **command-hook-lifecycle.ts**.

Tool arguments sent to the Hook should be the actual effective arguments, not arbitrary copies of earlier model proposals. A Claude transcript path must come from an authorized Host export; lacking one, the Hook is explicitly denied rather than being handed an unapproved private filesystem path.

The same protocol field can represent different access privileges inside the native product versus our Host. Compatibility must not bridge those privileges implicitly.

### 3.2 Exit codes do not have universal meanings

In Claude command Hooks, **exit code 2** can block **PreToolUse**; at **Stop** it may carry continuation feedback. A **PostToolUse** callback cannot retrospectively erase a tool effect that already happened.

Codex's output, tool aliases, and matchers have different constraints, including compatibility labels such as **Bash**, **Edit**, and **Write** for selected execution tools.

We validate events, matchers, input fields, output structures, and exit behavior per dialect rather than applying Claude's semantics to Codex wholesale.

Unsupported combinations, including **PostToolUseFailure** in the current Codex dialect adapter, are reported explicitly.

**Partial Codex command-protocol support is not full execution acceptance for all original Codex Hook plugins.**

### 3.3 Commands need durable effect identities

A command can create external effects. If its response is lost, blindly retrying the process may duplicate those effects.

Reviewed command identity, input, and effect type are bound to the original invocation, confirmation, and receipt. Process cancellation, timeout, exit status, and actual external effects are recorded separately.

Sending **kill** neither rolls back an external operation nor proves the process never ran. The dedicated command executor manages its process lifecycle; the Native original receipt remains the authority for settled effects.

## 4. Pi Is Different: Execute the Actual TypeScript Factory

A Pi Extension is not just a command-Hook configuration. It directly registers events and tools:

~~~ts
export default function (pi) {
  pi.on("session_start", async (_event, ctx) => {
    // Initialize or restore session-scoped state
  });
  pi.registerTool({
    name: "todo",
    // Argument schema and the real execute callback
  });
}
~~~

This is a schematic example, not the original todo plugin source.

A real **execute** callback may share closures, module variables, and **ctx.sessionManager** with event handlers. Merely scanning source for function names and replacing them with homegrown mock callbacks cannot prove the original extension executed.

We load a reviewed original module, execute its Factory, accept its genuinely registered eligible tools/events, and connect those to the ETF Agent Native Host.

### Headless does not mean launching another Pi Agent

Our Agent already owns its model, tool loop, and Run history. We only need Pi's extension mechanism—not Pi's second model loop.

The headless adapter supplies contextual, tool, and state interfaces backed by actual Host Owners. Missing interactive UI, session-tree, or dynamic-registration semantics are not replaced with no-op success.

Scoped verification of the original Pi todo supports **add/list** and state handling. **session_tree** and the **/todos** command retain explicit unsupported records. We do not need to implement the entire Pi product for one extension.

Pi's nested **ctx.tools** invocations still pass through original Host permission, budget, source identity, and receipt checks. There is no hidden privileged route for plugins.

## 5. The Hardest Problem: How Do We Actually Stop an Asynchronous Hook?

Trusted callbacks were initially allowed to run inside Node.js. AbortSignal, deadlines, and **Promise.race()** can end a wait, but **they do not prove the callback stopped running**.

Consider:

~~~ts
async function hook() {
  await Promise.resolve();
  while (true) {
    // Keep consuming CPU indefinitely
  }
}
~~~

If that code blocks the main thread, even timers cannot run, let alone user Stop or Publication.

An initial VM guard limited synchronous entry, but it did not cover every CPU loop entered *after await*. It was not a guarantee of isolation from native blocking behavior.

### Put the entire reviewed Pi activation in a terminable process

On **October 17, 2026**, we moved the production Pi Loader's reviewed module, Factory, session callbacks, and tool closures into a **persistent child process**.

Why not simply serialize each callback using **toString()** and send it to a Worker? Original callbacks capture module closures, session state, and Host capability handles. Reconstructing an isolated function can silently change their behavior.

The responsibilities became:

~~~text
Pi child process
  Retains original module and closures
  Runs registered callbacks
  Requests Host capabilities over bounded RPC

ETF Host
  Checks account, Run, source, authorization, plugin generation
  Executes genuinely permitted tool/state effects
  Persists authoritative receipts
  Handles cancellation, timeout, and process retirement
~~~

On cancellation or timeout, Host can retire the activation, terminate its **POSIX process group**, and observe actual shutdown or leftovers.

External effects already initiated by callbacks are **not** thereby undone. If cleanup outcome remains uncertain, record **unknown**.

This design has costs. Retiring one shared activation process invalidates other sessions depending on it; they must explicitly reactivate. Old closures must not be silently replayed. It is also **not** a sandbox for untrusted code: descendants escaping the process group and uninterruptible kernel waits are outside any absolute termination guarantee.

Scoped checks covered CPU use, native blocking, cancellation, descendant-process termination, and PostgreSQL publication boundaries. The broader offline run still contained baseline failures, so no repository-wide pass is claimed.

**The terminable-process contract applies to the reviewed production Pi Loader. Manually registered trusted Host-only closures have not all moved to this isolation mechanism.** We cannot describe every JavaScript Hook as forcibly process-isolated.

## 6. Hooks with Effects Cannot Simply Run Again During Recovery

Once a plugin can manipulate state, tools, and files, a callback may have already committed something even if no response arrived.

ETF Agent Native Recovery already tracks original actions and receipts. We reused that mechanism, rather than inventing another Hook ledger.

**durable-extension-effects.ts** binds reviewed extension state, file, command, and nested-tool effects to original Run resources and execution identities.

Settled results are reused. Unknown effects remain unknown, not automatically reissued. Generation, original arguments, and effect identity must match; an upgraded same-name Hook cannot adopt the old invocation.

A genuinely new Run may execute **SessionStart**. Replaying a completed terminal Run should instead read existing receipts, without performing initialization again or mutating todo state.

We once reproduced exactly that error: an original Pi todo completed and persisted, yet terminal replay triggered **SessionStart** and failed because the history-only path correctly lacked a new Effect Executor.

The correction preserved SessionStart for real new sessions and prevented it from running on terminal replay.

**Recovery consumes facts that already happened. It does not stage a reenactment of the former lifecycle.**

## 7. A Real Combination: Hookify and Pi Todo in One Native Run

Testing command Hooks, Pi Factories, and state recovery individually is not proof that extensions from different ecosystems coexist.

We used two unmodified original plugin components—official Claude **Hookify** and Pi **todo**—plus a clearly labeled **synthetic Pi nested knowledge-read** component to exercise Host controls.

The experiment used a synthetic account, scripted model, actual original plugin bytes, and an **in-memory store**. It involved no real investor data or paid model calls.

One approved combination produced:

| Observation | Recorded result |
| --- | --- |
| Original Hookify notices | 4 |
| Effect confirmations through the synthetic authentication flow | 4 |
| Original Pi todo tool invocations | 2 |
| Todo-state commits | 2, with advancing revisions |
| Explicitly synthetic nested knowledge read | 1 |
| The Run | Completed normally and persisted |

Three properties matter more than the counts.

First, Hookify and todo ran through the **same Native Factory and Host**. The nested tool retained original source, budget, and parent/child identity; plugins did not mint independent tool authorization.

Second, Hookify notifications followed the user-display path, not the research-evidence path. A failed notice display cannot erase a legitimate tool restriction.

Third, recreating Registry/Factory and reading the completed result from the **same in-memory store** did not increase model requests, todo calls, state commits, notices, confirmations, or nested reads. Disabling Hookify still allowed todo and the approved nested read to complete independently.

This was **not** PostgreSQL operating-system-level cold Recovery and did not cover every original plugin. Subsequent Pi termination and PostgreSQL Publication tests covered different seams; their pass counts cannot be added into a fictional "full ecosystem production acceptance."

The supported conclusion is narrower and useful: **selected original Claude/Pi extension subsets can execute, create legal effects, and replay receipts inside one ETF Agent Native Run.**

## 8. Why We Did Not Build One Universal Hook API

It initially seemed attractive to define one JSON Hook abstraction for all ecosystems.

Their differences reach beyond event names: Claude/Codex command processes have distinct exit codes and matchers; Pi has a Factory, closures, and session state; some Hooks transform arguments, some modify results, and some just send advice. Cancellation and Recovery must also preserve external effects.

A universal structure would either erase important semantics or gradually accumulate ecosystem-specific exceptions.

We retained three separate responsibilities:

- **Compatibility Profile:** interpret only explicitly supported event, input, output, and failure semantics of a specific ecosystem.
- **Lifecycle Executor:** select and order callbacks, freeze inputs, invoke commands/callbacks, enforce deadlines, and report local failures.
- **Original Runtime/Effect Owner:** authorize actual tools, validate what enters model context, settle committed effects, and choose Run continuation or termination.

Our contribution is not a new theory of Hooks. It is engineering **interoperation without replacing the original Agent Loop or losing original execution facts**.

As of October 2026, Claude Hookify and supported Pi subsets have original-package, Factory, controlled-process, and scoped PostgreSQL/process evidence. Codex dialect compatibility is **not** blanket acceptance of original plugins. OpenCode's executable Profile has **not** received equivalent acceptance.



**Supporting an Agent plugin means more than invoking a callback: the new Host must let it produce valid effects with explicit, verifiable semantics.**

## Further Reading

- [Companion: Extension Host and Plugin Lifecycle](020-agent-extension-host-smartphone.md).
- [Native Hook lifecycle](https://github.com/hpoenixf/etf-agent/blob/main/agent-app/src/server/application/research-runtime/tool-lifecycle-hooks.ts).
- [Claude/Codex command dialect](https://github.com/hpoenixf/etf-agent/blob/main/agent-app/src/server/extensions/command-hook-profile.ts).
- [Pi headless adapter](https://github.com/hpoenixf/etf-agent/blob/main/agent-app/src/server/extensions/pi-headless-adapter.ts) and [terminable process](https://github.com/hpoenixf/etf-agent/blob/main/agent-app/src/server/extensions/pi-headless-process.ts).
- [Original Hookify + todo acceptance](https://github.com/hpoenixf/etf-agent/blob/main/openspec/changes/archive/2026-10-09-agent-add-compatible-extension-host/artifacts/original-cross-profile-host-acceptance-2026-10-08.safe.json) and [Pi termination acceptance](https://github.com/hpoenixf/etf-agent/blob/main/openspec/changes/archive/2026-10-17-agent-repair-portfolio-lineage-and-publication-diagnostics/artifacts/pi-terminable-execution-20261017.md).
- Official protocols: [Claude Code Hooks](https://code.claude.com/docs/en/hooks), [Pi Extensions](https://pi.dev/docs/latest/extensions), [Codex Hooks](https://learn.chatgpt.com/docs/hooks), [OpenCode Plugins](https://docs.opencode.ai/docs/plugins/).

---

[Chinese original on the author's blog](https://hpoenixf.com/blog/agent-multi-ecosystem-hook-execution) · [Module collection](https://hpoenixf.com/eff-agent-article/modules) · [Star the public article repository](https://github.com/hpoenixf/eff-agent-article).
