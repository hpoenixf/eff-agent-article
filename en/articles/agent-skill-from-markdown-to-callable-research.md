---
readingBrief:
  takeaways:
    - "Skills supply reusable methods while models synthesize, Hosts authorize and code computes; method declarations neither expand source permissions nor require one Agent per method."
    - "Entry, Main and Child progressively receive methods according to their actual tool surfaces; catalog visibility, preferences, preloading, instruction reads and execution require separate evidence."
    - "Bind calculations to method versions, parameters, sources and periods; recovery cannot substitute newer instructions, and local method failures should preserve gaps without erasing independent findings."
  appliesTo:
    - "Variable tasks with reusable domain procedures, where method packages, specialist discovery and traceable calculation handoffs are more useful than fixed formulas alone."
  notFor:
    - "Fixed-formula tasks better served by ordinary functions, or assuming the public compare-guides example includes the private fund Bundle, portfolio grants and Child preloading."
---
# A Skill Is More Than SKILL.md: Turning Research Methods into Callable Agent Capabilities

An Agent can search the web, read PDFs, invoke MCP tools, and run Python. Why would it need Skills?

Because **having tools does not mean knowing how to conduct a particular kind of research**.

Suppose a user asks: “Compare how well these two index funds track their benchmarks, then check whether they create duplicate exposure in my portfolio.”

Search tools may retrieve fund NAV series, benchmarks, and disclosed holdings. Python may calculate active-return volatility or overlap. None of those capabilities decides whether to validate the share class, currency, dividend treatment, and common observation window first. Nor do tools decide whether a personal-overlap calculation should stop when private portfolio access was not granted.

In ETF Agent, we organize reusable research methods as Skills while maintaining a clear division: **Skills define methods; the model selects and synthesizes them; the Host governs actual tools and source authorization; deterministic programs perform calculations; and the existing Runtime owns budgets, execution, and recovery.**

This is not just an article about the files inside a Skill. We will follow one research task through Entry, Main, and Child (Subagent), explaining why each sees a different method surface, how catalog entries become real reads and computations, and which claims require execution evidence rather than descriptions.

## 1. What belongs inside a Skill?

The [Agent Skills specification](https://agentskills.io/specification) uses `SKILL.md` to describe a method, with optional resources such as `scripts/`, `references/`, and `assets/`. Its important design choice is **progressive disclosure**: expose a short name and description first, then read full instructions and support files only when useful.

But `SKILL.md` is the entry point, not a complete execution architecture. A financial research application may also need calculations, consistent semantics, and several independently selectable methods. ETF Agent's internal fund-research Bundle uses this layout, with some directories omitted for readability:

~~~text
fund-research/
├── bundle.json
├── SKILL.md
├── skills/
│   ├── fund-research-planner/
│   ├── index-fund-profile/
│   ├── index-fund-tracking-quality/
│   └── portfolio-overlap/
├── scripts/
├── references/
├── schemas/
└── templates/
~~~

At the internally reviewed version, the Bundle is 1.3.0 and includes one planning entry and fourteen independently selectable research methods.

| Element | What it owns | What it does not own |
| --- | --- | --- |
| `SKILL.md` | Steps, prerequisites, evidence requirements, and limitations | Data access grants or a model execution loop |
| `bundle.json` | Package identity, version, modules, and shared resource locations | Extra scheduling or an execution ledger |
| Submethods | Specific tasks such as tracking quality and portfolio overlap | A mandatory Agent per method |
| `references/`, `schemas/` | Supporting knowledge and input/output contracts | Automatic source certification |
| `scripts/` | Deterministic processing of supplied structured inputs | Private-data acquisition or Host replacement |
| `templates/` | Reusable presentation formats | Declaring the research delivered |

A user asking only about tracking quality can select that method without a full planner. A broader fund report can combine several methods. **A sub-Skill is not a Subagent, and a Bundle is not another task scheduler.**

## 2. How does a method enter a real research run?

There are two entry paths, but not two authorization systems.

For **explicit selection**, the user supplies a registered Skill ID, for example:

~~~text
/index-fund-tracking-quality
~~~

The original ingress parses the actual API field or slash command, validates registration identity, version, and content, and binds the chosen method to this Research run. An Entry model need not guess again whether the user intended to invoke the method. An explicitly validated startup instruction can enter the trusted startup context, still subject to higher-level safety requirements and the original Run authorization.

For **ordinary natural language**, the user may simply ask, “How well do these funds track?” Entry primarily decides between Direct and Research. It does not preload the entire Skill catalog or force a method based on a keyword heuristic. Once in Research, Main receives a short catalog and may choose to read a method or continue ordinary research. The instruction body read on demand appears as an ordinary controlled tool result in the next context, not as newly elevated system authority.

~~~mermaid
flowchart TD
    A["User question"] --> B{"Explicit Skill selection?"}
    B -->|"Yes"| C["Validate identity and bind method"]
    B -->|"No"| D["Entry chooses Direct / Research"]
    D -->|"Research"| E["Main receives short catalog"]
    D -->|"Direct"| F["Ordinary direct answer"]
    E --> G["Read a method if useful, or research"]
    C --> H["Original Run and Host Tool Surface"]
    G --> H
    H --> I{"Tools and sources authorized?"}
    I -->|"Yes"| J["Read evidence and compute as needed"]
    I -->|"No"| K["Preserve missing or unauthorized parts"]
    J --> L["Synthesize appropriately scoped findings"]
    K --> L
    L --> M["Original publication and delivery"]
~~~

Four distinct events matter: **method discovery, instruction injection or reading, tool authorization, and actual method consumption**. The first two help the model know what it could do. The third decides what it may do. The fourth requires real tool calls, observed results, and synthesis. None proves that the next event occurred.

## 3. Why does the same Skill look different to Entry, Main, and a Subagent?

Return to the index-fund task. Main needs public data to compare two funds and may delegate a tracking-quality check to a Child. “The Skill is registered” cannot be shortened to “Main and Child can both read and run it.”

### 3.1 Entry, Main, and Child do not share one complete prompt

| Execution position | What it actually sees or receives | What that does not establish |
| --- | --- | --- |
| Entry | Ordinary Direct/Research routing, or an explicitly validated selected method | The full catalog was not preloaded for ordinary entry |
| Main | A Host-projected short catalog with IDs, names, and descriptions; on-demand reading | A visible entry is not a grant, adoption, or execution |
| Child | Its own bound expert entry and task, plus a catalog filtered by **that Child's effective tool surface** | It does not inherit every Skill Main could see |
| Custom expert | Profile options `preferredSkills` and `preloadedSkills` | Neither expands tools, sources, or budget |
| Resumed request | Previously bound instructions, content identity, and real receipts, subject to context fitting | A new Skill release cannot silently replace old bound content |

The important point is that Child discovery depends on **the Child's own effective Tool Surface**. The current mechanism projects a summary catalog according to these rules:

- If the Child has `read_skill_resource`, it can discover summaries of the registered methods in its bound catalog that it can attempt to read.
- If it lacks that reader but has `run_skill_script`, it sees only methods backed by a local package root; a remote-only method is not presented as readable.
- If neither tool is present, no Skill catalog is projected. The Child may still carry out other authorized work.

These rules filter **discoverability**, not execution permission. A catalog entry does not bypass resource identity, version, scope, or permission checks during an actual read. Likewise, running a script still passes through the original script tool's controls.

There is a related but distinct notion: a managed Child expert may have a frozen package entry of its own. Its `agentId` identifies an expert, not a Skill file path and certainly not a new tool grant.

### 3.2 Request projection decides what the model actually received

Main and eligible Children receive their short catalog as a model message marked `host-skill-catalog`. The envelope provides `skillId`, name, and description, plus `omittedCount` when the request cannot fit every entry. It is a per-request catalog view, not a system prompt containing every method instruction.

Here is a simplified **teaching example**, not a captured production payload:

~~~json
{
  "kind": "host-skill-catalog",
  "skills": [
    { "skillId": "index-fund-tracking-quality", "name": "Tracking Quality", "description": "Check comparable tracking data" }
  ],
  "omittedCount": 2
}
~~~

The two omitted entries above are illustrative, not an actual observed count. Request projection tests each catalog item against the input capacity. Omitted entries must remain explicitly represented as omissions; if even the required catalog envelope will not fit, the existing request-capacity error applies. The model must not be told it saw the full catalog when it did not.

The model can subsequently call `read_skill_resource` for valid method instructions. That produces a traceable tool result; it does not run the calculation. A later reference to a Skill by name is also not evidence that the read succeeded.

### 3.3 Custom expert preference, preload, and authorization differ

A custom fund expert can declare:

~~~json
{
  "preferredSkills": ["index-fund-tracking-quality"],
  "preloadedSkills": ["index-fund-tracking-quality"]
}
~~~

`preferredSkills` is advisory model guidance. **It does not load the instruction body, hide other authorized methods, or create an allowlist.** `preloadedSkills` explicitly asks for an instruction body at Child startup, but only through the original registered resource, actual Child grant, content binding, and request-capacity checks.

If a preload is unavailable, the specific limitation is reported locally rather than fetching an arbitrary path or claiming the instructions were loaded. If full instructions will not fit, the current projector omits the **complete item** instead of silently truncating it to a misleading fragment.

Importantly, context fitting happens while constructing the actual Child model request. Main cannot truthfully announce at `spawn_subagent` admission time that a future Child preload has already fitted and appeared.

A Profile can guide a specialist's method choice; it cannot grant portfolio holdings, additional external services, or extra execution budget.

### 3.4 What the Child did must still be handed back as an actual result

This flow is a **mechanism illustration**, not a recorded live fund-research session or trade:

~~~mermaid
flowchart TD
    U["User: tracking and overlap"] --> E["Entry: Research"]
    E --> M["Main: method catalog and public evidence"]
    M --> S["Delegate Child: scoped task and original grants"]
    S --> C{"Does Child have the reader?"}
    C -->|"Yes"| R["Read permitted Skill instructions"]
    C -->|"No"| N["Do not claim a read; work with available tools"]
    R --> T{"Required data and script available?"}
    T -->|"Yes"| X["Call actual tools and inspect results"]
    T -->|"No"| G["State gaps; retain valid findings"]
    N --> H["Return summary, refs, and unresolved gaps"]
    X --> H
    G --> H
    H --> M2["Main decides adoption and synthesis"]
    M2 --> P["Original publication mechanism"]
~~~

A Child can return a summary, evidence references, artifact references, and unresolved gaps through `submit_subagent_result`. But **a Child submission does not prove Main used its findings in the final answer**. That needs a separate look at what Main actually received, referenced, and incorporated. Expert names, relationship hints, and self-reported Skill use are not substitutes.

This is the useful composition: Skills provide reusable methods; a Child provides a separate model context and execution segment; Main integrates real contributions. One Child may use multiple permitted Skills; Main can also use a Skill directly. There is no requirement to construct one Agent per method. The general Child lifecycle and multi-expert orchestration are separate topics; this section concerns method transfer.

## 4. A Skill may request data but may not grant access to it

Tracking quality commonly needs a fund NAV series and a comparable benchmark total-return series. Portfolio overlap additionally needs actual portfolio weights and underlying holdings observed at appropriate dates.

A method may declare `research-scopes: [fund]` or `research-scopes: [portfolio_details]`. These express domain dependencies, **not user consent or authorization**. Some reviewed packages also declare `allowed-mcp-servers`, an upper bound on dedicated MCP services associated with that method. Actual tool calls still depend on the Run grant, Host policy, available server configuration, read-only constraints, current phase, and resource budget.

If the user authorized public fund research but not private portfolio details, the Agent may review product identity, public fees, benchmarks, and permissible return series. It cannot calculate how much these funds overlap in **the user's actual holdings**. It must not reconstruct private positions from old chat, stale RAG summaries, or assumed weights, nor report unknown overlap as zero.

Similarly, a user request to use only uploaded files cannot be expanded into outside network access just because a method declared an MCP server. **Method declarations do not expand grants, and grants do not oblige the model to use a method.**

## 5. From instructions to calculation: how does a Skill produce results?

Some financial decisions require model judgment; some calculations should be repeatable programs. For index funds, consider:

- **Tracking Difference:** the difference between fund and benchmark returns over a comparable interval.
- **Tracking Error:** the volatility of periodic active returns, usually annualized according to the actual observation frequency.
- **Relative wealth evolution:** the relative progression of fund and benchmark cumulative wealth paths.

These are different metrics. In particular, tracking error is not the fund's return minus its benchmark return on one day.

A reviewed packaged script can first describe the method's expected inputs:

~~~json
{
  "path": "scripts/run_module.py",
  "args": ["--describe", "--module", "index-fund-tracking-quality"]
}
~~~

This inspects an input contract; **it does not download market data, access private holdings, or compute actual tracking quality**. Once permitted structured data has been acquired, the script may perform deterministic processing. Large data can be passed using `stdinFromToolCallId`, which points to an actual **completed and model-readable tool result in the same Run**:

~~~json
{
  "path": "scripts/run_module.py",
  "args": ["--module", "index-fund-tracking-quality"],
  "stdinFromToolCallId": "call_example"
}
~~~

`call_example` is an illustrative placeholder, not a valid call ID. The Host resolves the real receipt and sends the serialization **actually projected to the model** to the script's standard input. It rejects cross-Run, incomplete, ambiguous, or omitted references. Host-private raw captures do not thereby become accessible.

Script paths must remain relative to the approved package and pass path checks. Calls remain subject to original time limits, cancellation, resources, and execution receipts. **A trusted-package script runner is not a general sandbox for arbitrary untrusted Python.** A managed Child expert package may use the isolated Analysis Sandbox; that does not imply every Skill script uses the same isolation mechanism.

## 6. Why must a calculation retain method, parameters, and source identity?

Imagine an output containing only `{"trackingError": 0.012}`. The next research step cannot know which fund or share class it describes, the observation window, the benchmark version, or whether daily or monthly returns and which annualization parameters were used.

Method results should therefore carry the object and share-class identity, periods (requested, used, and as-of), input references, sources, parameter identity, and actual calculation status. The Bundle uses such context to connect computations; the outer Host independently enforces real source authorization and identity. Internal declarations cannot invent valid external citations.

A changed share class or benchmark version requires fresh analysis. Changing the annualization assumption from 252 periods a year to 12 cannot be done by relabeling the result. Likewise, a method with the same name may have changed its instructions: registration version, content hash, and the actually used instruction body matter.

On recovery, the method bound to an older Run must not silently be replaced with the newest release. At the same time, **method-content identity and Run-authorization identity are independent**. Reading a new method version cannot renew permission; disabling a Skill does not automatically erase already lawfully published research.

## 7. Should one failed method invalidate the whole research task?

The fund comparison may encounter three different limitations.

Fund identity and fees have been verified, but no comparable benchmark total-return series is available. The Agent can publish product facts but cannot substitute a price-only index and announce formal tracking error.

Portfolio details were not authorized. Personal overlap is unavailable, not zero. A script may also fail on malformed input; empty output must not be rewritten as zero returns or a successful computation.

This is a **teaching schema, not a production API**:

~~~json
{
  "research": "Comparison of two specified index funds",
  "findings": {
    "fundProfile": { "status": "available" },
    "trackingQuality": {
      "status": "insufficient",
      "missing": ["Comparable benchmark total-return series"]
    },
    "portfolioOverlap": {
      "status": "unavailable",
      "reason": "Private portfolio details were not authorized"
    }
  }
}
~~~

A failure in one method should not erase adjacent valid findings. A Child may hand back verified facts alongside unresolved gaps, and Main decides what is useful in the final report. Method reading, successful execution, evidenced conclusions, actual Main adoption, and successful artifact delivery are **different events**. They use the original receipts rather than a new rule requiring every sub-Skill to succeed before publishing an answer.

## 8. Skill lifecycle governance is not Markdown file management

Editing one Markdown file may be sufficient for a personal script. It is less sufficient in a system with package installation, recoverable work, and private data sources: changes to a method's premises, helper script, dependency ceiling, or output interpretation affect later execution.

ETF Agent distinguishes lifecycle states such as `draft`, `active`, `disabled`, and `superseded`. Registration, reviewed activation, and real execution remain separate. Even when a name and version string have not changed, changed content hashes must not inherit prior approval.

| Event | What it confirms | What it cannot prove |
| --- | --- | --- |
| Registration | A method exists at a particular identity and version | It is active or authorized |
| Activation | A candidate may be legally selected under existing review | The user's data is readable |
| Projection or reading | A request actually received a catalog or method body | The model executed it |
| Execution and handoff | Actual tool results and Child receipts can be located | Main adopted them or the user received them |

Disabling a method generally prevents new ineligible use. Historical readback and recovery of unexecuted actions remain governed separately by the original version, grants, receipts, and publication rules. The objective is recognizable method evolution, not a second Runtime.

## 9. What can be reproduced from the open-source implementation?

The fund Bundle, private-portfolio admission, and reviewed Python calculation path discussed above are internal. They are **not all features of the public [Open ETF Agent](https://github.com/hpoenixf/open-etf-agent)**.

A fixed public v0.2 source revision does contain a smaller example. The `compare-guides` Skill guides an Agent comparing two synthetic software-guide versions: read the real source snapshots, keep free and enterprise conditions distinct, verify units and numeric differences, then save a report whose sources can be read back.

Its [fixed SKILL.md](https://github.com/hpoenixf/open-etf-agent/blob/a79e89bf709d4a2245b5a8652882a591ba467519/fixtures/skills/compare/SKILL.md) and [Skill catalog implementation](https://github.com/hpoenixf/open-etf-agent/blob/a79e89bf709d4a2245b5a8652882a591ba467519/src/skills.mjs) are directly inspectable.

Using Node.js 26.11.1 (or a compatible later 26.x release) according to that revision's engine requirement:

~~~bash
git clone https://github.com/hpoenixf/open-etf-agent.git
cd open-etf-agent
git checkout a79e89bf709d4a2245b5a8652882a591ba467519
npm ci --ignore-scripts --no-audit --no-fund
npm run demo -- --case skill-mcp
~~~

This is an offline synthetic demonstration and needs neither live fund data nor model credentials. It illustrates “catalog discovery → method reading → Host source retrieval → report → execution records.” It does not establish that the private Bundle, Child preloading, or fund computations have been published in the open-source edition.

## 10. When is a Skill worthwhile, and when is ordinary code enough?

For fixed inputs, a deterministic formula, and a stable output, an ordinary function is often simpler. Skills become useful when the wording and shape of tasks vary, domain judgment matters, and reusable steps and evidence prerequisites still exist.

In fund research that includes confirming share class, benchmark, and periods before comparison; distinguishing tracking difference from tracking error; accounting for unknown look-through exposure; and limiting claims when evidence is insufficient. In specialist collaboration it also means **the Child is not the owner of the method, and the method is not an execution permission**. The Child can have an independent context, discover and combine methods under its own tool surface, and return work for Main to actually consume.

The practical design decisions are:

- Keep methods that require model understanding, selection, and synthesis in Skills.
- Keep deterministic calculations in controlled code; use the original tools for public data, private sources, and external actions.
- Leave tool authorization, content binding, budgets, recovery, and publication with the existing Host and Runtime.
- Observe catalog exposure, instruction reads, tool execution, Child handoff, and final adoption separately.

A method contract may be verifiable without the model always selecting the right method. A calculation may be reproducible without its financial inputs being correct. Those qualities require separate evaluation.

## Conclusion

If an Agent already has tools, why does it still need Skills?

Tools answer “what can I call?” Skills help the model answer “how should I organize this kind of research?” To become more than elaborate prompt packaging, a Skill system must also distinguish **who saw a method, who was permitted to execute it, who actually read its instructions, who produced results, and who used those results in the final research**.

ETF Agent's goal is not a Skill system with ever-growing implicit powers. It is an extensible library of research methods without duplicate execution authorities. A new method describes its premises, steps, inputs, and results; the existing owners continue to provide permissions, computations, receipts, and delivery.

---

**Further reading**

- [Agent Skills Specification](https://agentskills.io/specification): File structure and progressive disclosure.
- [Model / Runtime / MCP / Skill Responsibilities](./agent-model-runtime-mcp-skill-boundaries.md): The four-role mental model.
- [Subagent Panorama](./agent-subagent-context-specialization.md): Independent Child context, lifecycle, and actual handoffs.
- [A Custom Expert Should Be More Than a Prompt Field](./agent-custom-expert-from-prompt-to-recovery.md): Profiles, frozen bindings, and recovery.
- [Extension Host](./020-agent-extension-host-smartphone.md): Registration and package lifecycle.
- [Open ETF Agent](https://github.com/hpoenixf/open-etf-agent): Public minimal implementation and source. If useful, explore the repository and give it a GitHub Star.
