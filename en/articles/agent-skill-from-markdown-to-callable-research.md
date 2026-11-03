---
description: "What separates an Agent Skill from an ordinary prompt? Follow a fund-research example through on-demand loading, Host tools, reviewed Python scripts, and their actual security boundary. Bundle packaging is optional advanced material."
readingBrief:
  takeaways:
    - "A Skill's instructions are still text; registration, discovery, progressive loading, execution, and receipts are capabilities implemented by the Host."
    - "A Skill cannot grant tools or data access; an authorized script also needs a separate review of its actual operating-system privileges."
    - "ETF Agent constrains reviewed package scripts by identity, path, timeout, and output, but that runner is not an OS sandbox; its Docker Analysis Sandbox is separate."
    - "Research can combine Skills and preserve partial results; a Bundle is only an optional packaging extension."
  appliesTo:
    - "Engineers designing Agent Skill loading, reuse, script execution, and authorization who need to separate file-format conventions from Host behavior."
  notFor:
    - "A one-off style instruction often needs only a prompt; fixed deterministic calculations generally need a function rather than a Skill system."
---
# How Is a Skill Different from a Prompt? From Loading to Script Execution

Suppose a user asks: “Compare the tracking quality of two index funds, then tell me whether they duplicate exposure in my portfolio.”

You could write a prompt asking an Agent to check share classes and benchmarks, calculate tracking error, and inspect holdings. That may work. But why inject the entire set of instructions on every request? How does the model discover which instructions to use? How can a calculation be reproduced—and who allowed its script to run?

**A Skill starts as reusable task instructions. ETF Agent adds registration, on-demand reading, controlled tool calls, and execution receipts around those instructions.** The important distinction is not “a prompt written in Markdown”; it is what the Host implements to make instructions discoverable, usable, and auditable.

## First: what actually differs from a plain prompt?

A minimal Skill may contain only a `SKILL.md`. Once the model reads it, those instructions influence its reasoning just as an ordinary prompt would. **A Skill cannot automatically execute code or bypass permission checks.** It would be equally wrong to claim that ordinary prompts cannot use tools: they can guide tool use when an Agent already has those tools.

The difference appears when a Host provides additional lifecycle mechanisms:

| Dimension | Ordinary prompt | Host-managed Skill in ETF Agent |
| --- | --- | --- |
| Discovery | Application or user inserts the text | Registered ID and brief description allow discovery |
| Context | Often injects the whole instruction | Short catalog first; full text and resources on demand |
| Reuse | Copy or concatenate text | Same Skill can be used by different requests or agents |
| Scripts | Uses tools the Agent already has | Can organize reviewed scripts and input contracts, using the same Host tools |
| Authorization and trace | Still belongs to the Host | Still belongs to the Host, linked to Skill identity, version, and actual receipts |

<a href="/diagrams/agent-skill/prompt-en.svg" aria-label="Comparison of one-off prompts and Host-managed Skills"><picture><source media="(max-width: 700px)" srcset="/diagrams/agent-skill/prompt-en-mobile.svg" /><img src="/diagrams/agent-skill/prompt-en.svg" alt="Comparison of one-off prompts and Host-managed Skills" loading="lazy" /></picture></a>

*Figure 1: the extra capability comes from loading and execution governance, not magical Markdown.*

In our fund example, the Skill can require matching share class, currency, distribution treatment, benchmark total-return series, and observation window before calculating tracking error. The model decides whether to use it; authorized tools obtain data; reviewed code computes deterministic quantities; and the Host controls access. A Skill does not replace Tools, MCP, or the Runtime.

## The smallest useful Skill

The [Agent Skills specification](https://agentskills.io/specification) requires `SKILL.md` and permits optional `scripts/`, `references/`, and `assets/`. Start with one independent Skill rather than a Bundle:

~~~text
index-fund-tracking-quality/
├── SKILL.md                  # When to use, prerequisites, limits
├── references/               # Optional benchmark conventions
└── scripts/                  # Optional reviewed calculation
    └── calculate.py
~~~

The instruction file describes eligibility, input requirements, steps, and what to do with missing evidence. Scripts are optional. Merely creating these files does not cause the Host to expose `read_skill_resource` or `run_skill_script`. **The file format is a convention; the capability is an implementation.** ETF Agent's larger internal fund package combines multiple Skills, described only in the appendix.

## How does a request actually use a Skill?

ETF Agent supports two entry routes. A user may explicitly select a registered Skill ID, such as `/index-fund-tracking-quality`. Otherwise, an ordinary natural-language request may enter Research, after which Main sees a short catalog and decides whether to read the Skill. Entry need not preload the full catalog; a simple Direct answer need not start research.

<a href="/diagrams/agent-skill/path-en.svg" aria-label="Skill discovery, reading, tool authorization, and actual execution"><picture><source media="(max-width: 700px)" srcset="/diagrams/agent-skill/path-en-mobile.svg" /><img src="/diagrams/agent-skill/path-en.svg" alt="Skill discovery, reading, tool authorization, and actual execution" loading="lazy" /></picture></a>

*Figure 2: seeing a catalog, reading instructions, receiving a grant, and running code are separate events.*

At the code boundary, the useful mental model is:

~~~text
register Skill(ID, version, contentHash)
    → project short catalog for this request
    → model calls read_skill_resource (if permitted)
    → model chooses permitted tools / run_skill_script
    → Host validates grants and the concrete invocation
    → check tool result and synthesize the answer
~~~

This is explanatory pseudocode, not a public API. A tool execution needs a real receipt. A model merely saying it “used a Skill” does not prove it read the instructions or ran the script.

## A Skill may declare data needs but cannot grant access

Tracking quality requires comparable fund NAV and benchmark total-return series; actual portfolio overlap also requires authorized portfolio weights and look-through holdings. A Skill may declare `research-scopes: [fund]` or `research-scopes: [portfolio_details]`, but these are dependencies, not consent.

Some reviewed packages use `allowed-mcp-servers` as a ceiling on declared service dependencies. That does not install a server or expand the current Run grant. Tool availability still depends on the user's permissions, Host policy, server setup, read-only rules, and the current budget.

If the user restricts the task to uploaded files, instructions cannot silently expand it into network access. Without private portfolio authorization, the proper result is “personal overlap unavailable,” not an inferred holding from chat history, nor zero.

## From instructions to an actual calculation

Tracking difference is the fund-minus-benchmark return over a comparable interval. Tracking error is the dispersion of periodic active returns, commonly annualized using their actual frequency. They must not be confused.

ETF Agent's internal reviewed fund Skill package can first ask the original `run_skill_script` tool for a Skill's input contract:

~~~json
{
  "path": "scripts/run_module.py",
  "args": ["--describe", "--module", "index-fund-tracking-quality"]
}
~~~

This describes expected fields; it does not fetch prices, access a portfolio, or compute a result. After authorized, comparable structured inputs are available, the reviewed entrypoint can compute on them:

~~~json
{
  "path": "scripts/run_module.py",
  "args": ["--module", "index-fund-tracking-quality"],
  "stdinFromToolCallId": "call_example"
}
~~~

`call_example` is illustrative, not a usable call ID. The Host resolves a completed, model-visible tool result from the same Run. Cross-Run, unfinished, ambiguous, or omitted results are rejected. A script cannot promote a made-up citation into a real source.

## Crucial question: what permissions does the script actually have?

**Admission and process isolation are different checks.** The `run_skill_script` path is intended for trusted, Host-managed package scripts, not arbitrary Python downloaded from the web. The system checks the registered package's lifecycle and content identity, the original tool grant, and a package-relative path. Canonical-path checks reject absolute paths, traversal, escaping symlinks, and non-Python targets. Execution has timeout, cancellation, bounded output, and redaction.

But the actual `runSkillPython` executor starts a **Host-side Python subprocess**. It does **not** establish an independent network, filesystem, environment-variable, or subprocess sandbox. Path validation restricts *which script is selected*, not *everything that script could access after starting*. The reviewed built-in scripts are intended to process supplied JSON without networking, package installation, or unrelated file reads; these are properties of reviewed trusted code, not OS isolation guarantees.

<a href="/diagrams/agent-skill/security-en.svg" aria-label="Trust and sandbox boundary for ETF Agent Skill scripts versus Docker Analysis Sandbox"><picture><source media="(max-width: 700px)" srcset="/diagrams/agent-skill/security-en-mobile.svg" /><img src="/diagrams/agent-skill/security-en.svg" alt="Trust and sandbox boundary for ETF Agent Skill scripts versus Docker Analysis Sandbox" loading="lazy" /></picture></a>

*Figure 3: package path checks are not a sandbox; Docker Analysis Sandbox is a distinct execution route.*

| Question | Reviewed Skill script route |
| --- | --- |
| Can a caller select an arbitrary absolute path? | No: only validated, in-package `.py` paths |
| Can a Skill declaration grant private data or new MCP tools? | No: the original Host and Run grant still control those |
| What happens on timeout or oversized output? | The call fails or its output is refused |
| Is it an independently restricted OS/network/filesystem sandbox? | **No such guarantee** from this runner |
| Does the separate Docker sandbox protect every Skill script? | No: inspect which execution route was actually used |

The actionable rule is: **review trusted packages, validate identity and grants per call, and treat untrusted/user-supplied code as a different class of workload requiring an explicit isolation contract.** The Agent Skills specification's `allowed-tools` field is experimental and Host-dependent; it is not itself a universal permission grant.

## Why attach Skill version, inputs, and sources to results?

A bare output like `{"trackingError":0.012}` does not identify the fund, share class, period, benchmark, frequency, or source. It cannot safely support a research conclusion on its own.

ETF Agent relates actual outputs to the fund identity, requested and used periods, source/tool receipts, calculation parameters, registered Skill version, and content hash. Changing annualization from 252 to 12 periods cannot be done by relabeling a result; changing Skill instructions cannot silently rewrite an already-bound Run during recovery.

**Instruction identity and Run authorization are independent.** Loading a newer Skill does not renew access to private holdings; disabling a Skill does not erase a previously lawful historical result.

## Why do Main and Subagents not share every Skill?

Main may see a short Skill catalog. A Child sees only the catalog projected through its own effective Tool Surface. Without `read_skill_resource` it cannot pretend to read remote-only instructions; without a reader or script runner it receives no Skill catalog.

A custom expert's `preferredSkills` is advisory; `preloadedSkills` requests an attempted preload. **Neither adds tools, data access, or budget.** A successful preload must satisfy registered identity, content binding, the actual Child grant, and available context capacity. Main cannot declare success before the Child's request is assembled.

For our two funds, a Child can check tracking quality within its existing grant and return evidence and gaps. Main must actually inspect and adopt that contribution before making the final claim. **One Skill is not one Agent, and one Child can use multiple Skills.** This is about Skill consumption, not a replacement for general Subagent lifecycle management.

## Does one failed Skill invalidate the whole research?

No. Verified fund facts can still be reported when the comparable benchmark series is missing; tracking error cannot be invented. Private portfolio overlap is unavailable without authorization, not zero. Malformed script input must stay a failure, not an apparently successful empty result.

~~~json
{
  "fundProfile": { "status": "available" },
  "trackingQuality": {
    "status": "insufficient",
    "missing": ["Comparable benchmark total-return series"]
  },
  "portfolioOverlap": {
    "status": "unavailable",
    "reason": "No private portfolio authorization"
  }
}
~~~

This is a teaching schema, not a production API. Instruction read, successful computation, evidence quality, Main adoption, and user delivery are distinct states. Skill composition should reuse the existing Runtime rather than introduce another job scheduler.

## What does Skill lifecycle governance solve?

In a recoverable research system, changed prerequisites, scripts, and output interpretations affect future execution. ETF Agent distinguishes registration, reviewed activation, disablement, and replacement. Even when name and version are unchanged, content hashes matter: changed bytes must not inherit an older approval.

Registration does not establish current authorization; activation does not grant private data; catalog projection does not prove instructions were read; a completed script does not prove its finding was used in the final answer. The point is traceability, not a second Runtime.

## What can readers verify in public code?

The internal fund research package, private-portfolio admission, and reviewed Python calculation path above are not automatically features of public [Open ETF Agent](https://github.com/hpoenixf/open-etf-agent).

A fixed public source revision includes a smaller `compare-guides` Skill for comparing synthetic software guide versions, checking source snapshots and numeric units, and producing a readable report. Inspect its [SKILL.md](https://github.com/hpoenixf/open-etf-agent/blob/a79e89bf709d4a2245b5a8652882a591ba467519/fixtures/skills/compare/SKILL.md) and [catalog implementation](https://github.com/hpoenixf/open-etf-agent/blob/a79e89bf709d4a2245b5a8652882a591ba467519/src/skills.mjs).

~~~bash
git clone https://github.com/hpoenixf/open-etf-agent.git
cd open-etf-agent
git checkout a79e89bf709d4a2245b5a8652882a591ba467519
npm ci --ignore-scripts --no-audit --no-fund
npm run demo -- --case skill-mcp
~~~

This offline synthetic demo uses the pinned revision's Node 26.x environment requirement and no live fund or model credentials. It demonstrates catalog discovery, Skill reading, Host source tools, and report records. It **does not** prove that private fund packages, Child preloading, or their Python security arrangements are included in the public edition.

## When should you use a Skill, a prompt, or a function?

For a one-off tone or style instruction, use a prompt. For stable deterministic input-output logic, use a function. Use a Skill when varying requests repeatedly need domain prerequisites, on-demand guidance, tool selection, and traceable results.

Ask three questions before building one: **Which recurring task does it solve? What loading and tool capabilities does the Host actually implement? What OS privileges would an executed script have?** Without answers to the last two, an elegant `SKILL.md` remains text.

## Advanced appendix: packaging multiple Skills as a Bundle

Only now does ETF Agent's internal Bundle matter. It groups independent Skills with shared assets and a `bundle.json` describing identity and version. **This is an ETF Agent packaging extension, not a prerequisite of the Agent Skills specification.**

~~~text
fund-research/
├── bundle.json               # Additional packaging metadata
├── SKILL.md
├── skills/
│   ├── index-fund-tracking-quality/
│   └── portfolio-overlap/
├── scripts/
├── references/
└── schemas/
~~~

A Bundle may share reviewed calculation entrypoints and input contracts. It does not create another Agent, take over the existing Run, or grant access to additional user data. The arguments in this article also apply to a Skill consisting of just one `SKILL.md`.
