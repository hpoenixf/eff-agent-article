# From Connecting MCP to Actually Using Its Tools: Building an End-to-End Agent Integration Path

In September 2026 we saw an unusual failure: Market MCP was registered, discovery worked, and the model had not yet generated business arguments—yet its request immediately failed with **HTTP 400**.

The market service was not down. A tool's JSON Schema contained a regular expression unsupported by that model Provider. **The tool had not even been invoked, but its definition broke the entire model request**.

Weeks later, we encountered the inverse: an optional remote MCP failed, and our application's readiness endpoint also reported failure. Another regression found that a Provider descriptor had refreshed, but the next actual model request still contained the old one.

We learned to separate **connection established**, **tool discovered**, **tool visible**, and **tool result consumed**.

This article follows actual integration failures rather than describing a generic MCP SDK demo. It covers read-only research. Visibility is **not** permission, and MCP transport does not establish the authenticity of financial conclusions.

The public code exercise below lets readers inspect this path directly: local method reads, real stdio transport and report saving already run independently. Its scope is narrower than the original system discussed here; the distinction is explicit below.

MCP's [architecture documentation](https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture) distinguishes the Host coordinating capabilities, a Client maintaining the protocol connection, and a Server exposing methods. The protocol does not, by itself, prove what the model actually receives on a particular turn.

Most of our problems arose at these handoff points.

## 1. The Tool Is Registered—Why Can't the Agent See It?

Consider a **synthetic teaching example**, with simplified identifiers unrelated to live accounts.

A public fund-research task needs data from remote MCP service **sample-source**. The service exposes **strategy_query**, with business arguments:

~~~json
{
  "code": "FUND_DEMO",
  "asOf": "2026-10-01"
}
~~~

The remote service connects via **Streamable HTTP**; Portfolio and Market also connect locally through **stdio**. The same connection manager supports both transports while retaining each Server's distinct identity.

Discovery saves the Server's original method name. Host exposes a namespaced identity such as **sample-source__strategy_query** to the next layer.

Namespacing resolves collisions. **It is not admission**.

Trusted server-side configuration must authorize specific read-only methods and research scopes. The currently bound research methods and Run Grant then further constrain what the model may see.

A remote Server's self-declaration "read-only" is insufficient. The [MCP tool specification](https://modelcontextprotocol.io/specification/2026-07-28/server/tools) warns that tool annotations from untrusted Servers need careful treatment.

We use reviewed server-side policy, never a tool description or model argument, to grant access.

### Registration, admission, and visibility are separate

**tools/list** shows what a Server exposes. It does not equal **tools[]** in the next model request.

A useful three-level model is:

1. **Registered** by Server discovery.
2. **Admitted** by Host policy.
3. **Presented** in this model turn.

On **October 7, 2026**, we re-enabled **market__search_instruments**. It was still registered but excluded from local **modelTools**. After consolidating overlapping Providers, its public-instrument identification capability had no equivalent replacement, and the Agent lost necessary discovery ability.

The fix was **not** to expose all Market methods. It restored this specific useful method, leaving unrelated or retired methods restricted.

If an Agent never invokes a tool, the problem may be its visibility—not a weak Prompt.

Our inspection command therefore reports **catalog known**, **discovered count**, and **admitted count** separately. Without an actual research/Run context, tool visibility and execution are explicitly **not-evaluated**.

Likewise, **discovery failed** is not equivalent to **successfully discovered zero tools**. The former requires connection or protocol troubleshooting; the latter can be a legitimate empty catalog.

Diagnostics must reuse the real admission decisions instead of implementing another rule set.

## 2. One Schema for the Model and the Execution Host

### HTTP 400 before any business tool invocation

On **September 16, 2026**, **market__search_instruments** used Unicode property escapes **\\p{L}** and **\\p{N}** in a tool parameter pattern.

These are valid in relevant JavaScript Unicode regular-expression contexts, but the actual model route rejected them with HTTP **400**, recorded as **sub2_request_rejected**.

We ran a real A/B rather than merely interpreting an error code:

- The one-tool request containing the pattern returned **400**.
- A ten-tool request with the same pattern also returned **400**.
- Replacing the pattern with reviewed explicit character ranges made both requests return **200**.

**One incompatible tool definition can invalidate the whole request that lists it**, even if the model never selects it.

We did not simply remove **pattern**. We expressed supported Latin letters, digits, common Chinese character ranges, and necessary symbol characters in a portable form. The model-facing Schema and server argument guards reused the same source.

A regression now traverses the exposed tool definitions' pattern constraints.

The tested route exposed a specific Schema compatibility mismatch; its repair preserves upstream constraints rather than silently dropping them.

### Preserve the business Schema's meaning

Our remote teaching tool might advertise:

~~~json
{
  "type": "object",
  "$defs": {
    "FundCode": { "type": "string", "minLength": 1 }
  },
  "properties": {
    "code": { "$ref": "#/$defs/FundCode" },
    "asOf": { "type": "string", "format": "date" }
  },
  "required": ["code", "asOf"],
  "additionalProperties": false
}
~~~

If an adapter retains only familiar **type** and **properties** while dropping **$ref**, **required**, and conditional constraints, model-visible instructions silently change.

The model may then produce arguments valid under the weakened description but rejected by the actual Server. If Host weakens its execution checks too, invalid data is simply passed downstream.

We preserve supported Schema semantics and **reject incompatible tools explicitly**.

Supported local references, unions, and conditional constraints remain. Unsupported dialects, external or recursive references, and invalid reference fragments exclude only the affected tool. A malformed tool does not erase unrelated healthy methods.

This means fewer tools may be admitted until their upstream contracts or a thoroughly verified semantic-preserving adapter is corrected. That is preferable to counting unusable tools as integrated.

Host itself can add control arguments, such as **__hostResult** to choose a result view or request a refresh. Those fields are separated from vendor business parameters and stripped before the upstream call; they cannot override supplier fields.

"Schema fidelity" means the **supplier's business contract is not weakened**. It does not require literal byte equality between a model Tool definition and the Server's JSON.

Two different checks remain necessary:

- **At discovery:** Is the declared Schema supported by our adapter and validator?
- **At invocation:** Do these actual arguments satisfy the original Schema?

Neither implies compatibility with every JSON Schema dialect or model API route.

## 3. The Model's Tool Definition Must Be Bound to the Actual Call

A complete Schema still does not guarantee a correct invocation.

The catalog may refresh; a source may become unavailable; multiple vendors may provide similarly named public-market queries.

Suppose **Provider A** accepts **code/asOf** while **Provider B** has different required fields and date semantics.

If the model generated arguments against A's Tool definition and the executor transparently sends them to B after A fails, the request no longer matches the contract under which it was proposed.

Host creates a binding fingerprint from original method name, description, input/output Schema, and reviewed identity facts. Applicable parameter rules are included as required. The model turn selects an actual source and binds this descriptor.

The fingerprint is produced by **Host**, not accepted as a model-selected override.

Execution verifies the expected binding against the current source. If a Provider or Schema changed, it returns an explicit mismatch before remote dispatch. **The next turn** can see the newly authorized definition and decide whether to retry with its real arguments.

### We once displayed a stale descriptor on the next actual request

A controlled native integration reproduction found an updated underlying source descriptor, but the next **actual model request still included the old one**.

Inspection also found that the binding fingerprint had not entered the final sealed invocation contract hash. The two errors affected different handoffs:

- New model turns were assembling old Tool descriptions.
- The sealed contract did not fully describe the bound interface the model had supposedly used.

We fixed both. Each new turn obtains the currently eligible descriptor; the final request seal preserves the Host binding fingerprint. Changes within one turn still fail closed; original invocation and authorization boundaries remain.

This is stronger than testing whether a registry helper returns a fresh descriptor. The regression examines what **the actual model adapter receives**.

### Same name does not authorize silent vendor switching

In our teaching example, turn T sees and selects Provider A. If A disconnects before dispatch, sending the same call to Provider B without model reconsideration is unsafe: the definitions may differ.

We intentionally prefer an explanatory failed invocation followed by **a new model turn** using a verified current Provider.

That costs a turn, but preserves which interface justified the generated arguments.

### One tool's lifecycle in the Research path

~~~mermaid
flowchart TD
    A["MCP handshake and discovery"] --> B{"Connection and catalog healthy?"}
    B -- "No" --> X["Record source unavailable"]
    B -- "Yes" --> C{"Method and Schema admitted?"}
    C -- "No" --> Y["Exclude only this tool"]
    C -- "Yes" --> D["Assemble turn tools and binding"]
    D --> E{"Model API accepts tool Schema?"}
    E -- "No" --> Z["Report request-level protocol failure"]
    E -- "Yes" --> F["Model proposes invocation"]
    F --> G{"Source and input still match binding?"}
    G -- "No" --> H["Reject dispatch and report drift"]
    G -- "Yes" --> I["Invoke MCP Server"]
    I --> J{"Result shape and capacity valid?"}
    J -- "No" --> K["Preserve explicit failure"]
    J -- "Yes" --> L["Persist eligible result"]
    H --> M["Next model turn consumes outcome"]
    K --> M
    L --> M
~~~

Admission failures exclude individual tools; binding drift blocks actual dispatch; valid results and bounded failures return to later request assembly.

## 4. Connection Infrastructure Should Not Own the Whole Application's Fate

### Why did an optional remote MCP fail the whole application's readiness check?

On **October 7, 2026**, we corrected a readiness scope error.

Previously the application readiness endpoint considered **all** MCP connections. Required local Portfolio and Market Servers might be healthy, yet an **optional remote** returned an error and overall **/api/v1/health/ready** reported **not-ready**.

An optional supplemental source was effectively granted veto authority over unrelated research.

We separated:

- **Full service status**, which still reports the remote source as unavailable.
- **Application readiness**, which depends only on explicitly required local services.

In a controlled local HTTP-failure fixture, the two required services were ready while the optional remote was unavailable; application **/ready** still passed.

This is deterministic component evidence, **not** a measured remote production outage.

Remote discovery retries are likewise bounded. Only clearly transient **TIMEOUT** and **CONNECTION_FAILED** trigger limited retries using a fresh discovery connection. Authentication failures, invalid catalogs, and final failed attempts retain their own unavailable states. Connectivity recovery never grants new source permissions.

A single **host.ts** file may contain code for transport, admission, and invocation, but that does not collapse their responsibilities:

- **Run Grant** determines eligible capabilities and sources.
- **Invocation owner** binds arguments and contracts, dispatches, and settles receipts.
- **MCP integration** owns connection, catalog, and transport.
- **Business tools** own their domain result definitions.
- **Result management** preserves source identity and eligibility.
- **Context assembly** decides which legal material enters the next model request.

A Schema incompatibility may exclude its tool; invalid arguments may reject one call; a broken connection may isolate one Provider. None automatically becomes a decision that all research is complete or all business facts are false.

### The empty Server version loophole

One local MCP admission check conditioned read-only enforcement on the presence of a valid Server version string.

A controlled regression found that an empty version could still pass the SDK handshake but bypass the independent read-only check.

We corrected this by separating **version metadata** from the mandatory read-only policy. Host records allowlist, read-only, and model visibility decisions independently. A version identifies a Server build; it does not grant execution permission.

## 5. Tool Results Must Preserve Failure Meaning

A successful synthetic Tool response might contain:

~~~json
{
  "content": [
    {
      "type": "text",
      "text": "Synthetic NAV table for illustrating result structure"
    }
  ],
  "structuredContent": {
    "columns": ["code", "date", "unit", "value"],
    "rows": [["FUND_DEMO", "2026-10-01", "CNY/share", 1.2345]]
  }
}
~~~

The remote path preserves meaningful content, structured fields, and unknown valid business fields, while checking protocol shape, declared output Schema, privacy, and final size.

Transport-private **_meta** does not automatically become research prose. Dates and units may be retained as data, but the connection layer does not certify financial freshness or truth.

Failure cases require equally precise interpretation.

| Result or processing state | Meaning passed to continued research |
| --- | --- |
| Valid structured response | Preserve data/source identity for Result and Context Owners |
| Valid empty table | Keep empty rows and schema: this query returned no records |
| **isError** | Return a safe error classification, not vendor-private error text in model context |
| Invalid protocol shape or output contract | Report invalid result; do not impersonate an empty table |
| Result over hard limit | Explicit capacity error; do not silently truncate into seemingly complete data |
| Readable result without reviewed evidence classification | May be used as permitted context, but receives no automatic grounding/citation authority |

The final case matters. A legitimate tool response is not automatically citeable evidence for public investment conclusions.

**Data can be readable without being approved as a grounding source.**

Failure isolation depends on the actual reason. A business query error may affect one invocation. A confirmed transport/protocol fault may isolate a source. Switching Providers later must remain within the lawful tool scope, with the original failure identity preserved.

### A valid 2,100-row table was rejected as INVALID_RESULT

On **October 4, 2026**, a **local controlled regression** exposed the opposite of silent truncation.

A simulated remote MCP returned **2,100 rows** satisfying its declared output Schema. The encoded result was **under 32 KiB**, below Host's then-**64 KiB** output cap, yet Host returned **INVALID_RESULT**.

The validator had reused a **4,096-node traversal limit** intended for model inputs and Schema complexity. The JSON was valid and byte-small; the number of nodes was large because of the rows.

Increasing every limit would have obscured the boundary mistake.

We separated **input argument complexity** from **output data capacity**. Output still must be valid finite JSON, satisfy its original output Schema, pass privacy filtering, and fit the byte cap. It no longer inherits the model-input node budget.

Focused checks establish the local table-consumption contract, not reliable handling of every large response from a real provider.

**Preventing incomplete data and preventing false rejection of complete data are both correctness requirements.**

## 6. Observe the Next Actual Model Request

After a Tool returns, the result may still pass through persistence, projection, and context fitting.

Small results may enter the next request directly. Larger results may remain as identified stored data with authorized on-demand reading.

The existence of an MCP response does not prove the model received its needed content.

This gives a counterintuitive acceptance criterion:

> **Registration passed + Host invocation succeeded + result Schema valid is still not proof the Agent actually used the tool.**

An adapter may assemble stale Schema. Binding may be missing from the final seal. Context fitting may remove critical data while logs say "call succeeded."

We therefore observe tool descriptions and Schema at **actual model dispatch**, and check the visible receipt/output projection in the **next** request.

If a result is externalized, preserve an authorized replay reference. If an invocation fails, distinguish **empty**, **isError**, **INVALID_RESULT**, capacity denial, and source unavailable.

A synthetic integration harness starts a real local HTTP MCP, invokes it through the actual Research Factory, and uses a deterministic model stand-in to capture the next model request.

Its checks cover:

- Ordinary tables actually appearing in model context.
- Empty responses remaining semantically empty.
- Tool errors projected as safe errors.
- Invalid results and capacity failures preserving distinct causes.
- Independent healthy sources remaining usable.
- Original vendor Schema semantics and Host control fields staying separate.
- Descriptor refresh and final binding seals reflecting the actual next model turn.

The engineering checks cover tool definitions, invocation identity, and result feedback on scoped integration paths. Live provider behavior, model tool choice, and financial-data correctness require separate evaluation.

Our fixes did not produce a magically smarter MCP Client. They put errors back at the right level:

- **Request-level:** an incompatible Schema returns model HTTP 400, not a fabricated Market failure.
- **Optional-source level:** a remote disconnection does not make the application globally unavailable.
- **Invocation level:** binding mismatch cannot silently switch vendors.
- **Result level:** capacity and shape errors do not masquerade as empty data.

With a few static internal tools, not every mechanism may be necessary. Once research spans stdio, remote HTTP, several Vendors, and multiple model turns, the important question is no longer how many tool names appear in a catalog.

It is:

**Which interface did the model see, which one did Host invoke, what actually returned, and what did the next model request truly receive?**

## 7. Run Discovery, Reading and Saving in the Public Code

The [Open ETF Agent public code repository](https://github.com/hpoenixf/open-etf-agent) provides a narrow, independently runnable path: discover and explicitly read a local comparison method, acquire pages from two synthetic documents through a real MCP stdio child process, and save a sourced report through the same Runtime. It makes several handoffs in this article observable without claiming to port the original system's full remote integration.

The distinction is deliberate: **a scripted fixture proposes actions in a fixed order; transport and file effects actually execute**. Reading a Skill does not show that a model learned its method. Starting an MCP child does not show that a real model independently chose to use it. This experiment helps developers inspect integration before evaluating answer quality.

### Run it and inspect the actual artifacts

Use Node.js 26.11.1–26.x in a separate directory:

```bash
git clone https://github.com/hpoenixf/open-etf-agent.git open-etf-agent-mcp-demo
cd open-etf-agent-mcp-demo
git checkout --detach a10d4f1bd1ecc39224272156221fe29792b64094
npm ci --ignore-scripts --no-audit --no-fund
npm run demo -- --case skill-mcp
```

Initial installation may access npm; the installed case needs no remote model. The console prints the actual Run directory. Open its `report.md` and `manifest.json` to compare the report with the method, document versions and pages actually read. This case acquires only the first page of each document. Its recorded tool sequence is:

```text
list_skills → read_skill → mcp_read_page → mcp_read_page → save_report
```

`manifest.json` also preserves the model-side call ID and the SDK protocol request ID; these are not the same identifier. The console's `mcp.closed` records closure of the child owned by this invocation, while `semanticStatus: unreviewed` preserves the fact that report content has not undergone semantic review. A single completion status cannot establish correctness at every layer.

### Inspect three boundaries in the code

In [`src/mcp.mjs`](https://github.com/hpoenixf/open-etf-agent/blob/a10d4f1bd1ecc39224272156221fe29792b64094/src/mcp.mjs), catalog pagination is actually consumed, but extra discovered methods do not automatically receive permission. Only the allowlisted `read_page` is accepted, and its remote input Schema must match the narrow local binding. A returned page must match the requested document and page as well as its own content hash. Otherwise a complete but wrong page could become a trusted source.

[`src/extensions.mjs`](https://github.com/hpoenixf/open-etf-agent/blob/a10d4f1bd1ecc39224272156221fe29792b64094/src/extensions.mjs) connects method reads, MCP page reads and saving to the existing Runtime rather than introducing a separate execution loop. The [protocol boundary cases](https://github.com/hpoenixf/open-etf-agent/blob/a10d4f1bd1ecc39224272156221fe29792b64094/test/mcp.test.mjs) also show how wrong pages, duplicate catalog entries, stdout pollution and cancellation are rejected or cleaned up. They test transport and identity handling under controlled inputs, not the security of arbitrary third-party services.

This pinned checkout is a maintenance version for a reason directly related to the article: the earlier scripted report acquired only page one but asserted an offline-editing condition present only on page two. The [maintenance record](https://github.com/hpoenixf/open-etf-agent/blob/a10d4f1bd1ecc39224272156221fe29792b64094/docs/verification/v02-maintenance-observations.md) preserves that counterexample. The correction removed the unsupported sentence instead of treating “the catalog knows page two exists” as “page two was read.” This was not an improvement in model semantics; the report fixture needed to respect the source scope it demonstrated.

The slice pins official SDK 1.32.2 and [MCP protocol 2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25/server/tools). It launches only the repository's allowlisted server, not the remote HTTP, OAuth or full Schema adaptation described earlier. The [first live-model batch](https://github.com/hpoenixf/open-etf-agent/blob/d075068ac99a6c798d012c46bff4fe0c33eb9979/docs/verification/live-v01-v05-first-batch.md) did not exercise MCP either. What can be reproduced now is discovery, admission, real transport, source checks and file persistence. Whether a real model selects and uses those tools correctly during research remains a separate question.

<!-- open-etf-case:mcp@62b70d1a512ad97fc560ed0bf84351cc091ae048 -->
### Follow acquisition and saving through the real stdio path

The [CLI at this fixed public snapshot](https://github.com/hpoenixf/open-etf-agent/blob/62b70d1a512ad97fc560ed0bf84351cc091ae048/src/cli.mjs) connects Skill reading, MCP discovery, and original-page acquisition in one runnable slice.

After installing dependencies according to the README at the linked fixed snapshot, run:

```bash
node src/cli.mjs --case skill-mcp --output runs/article-mcp
```

Terminal JSON provides the `directory`, report receipt, and `mcp` shutdown result. Read `report.md` and `manifest.json` to check that the cited pages were acquired through the synthetic stdio service, rather than merely named in a tool descriptor.

Process startup, protocol exchanges, and saved artifacts are real local operations; tool selection is scripted. No financial account, remote data service, or paid model is connected.
<!-- /open-etf-case -->

## Continue Reading

- [Bringing Personal Holdings into a Read-Only Financial MCP](/articles/portfolio-mcp-readonly-investment-data)
- [Why a Market Data MCP Became a Research Decision System](mcp-market-responsibility-retrospective.md)

<!-- agent-article-sync:guidance:start -->
## Further Reading and Discussion

[Read the independent article collection](https://hpoenixf.com/eff-agent-article/) with catalog and architecture diagrams.

All articles and diagrams live in the [GitHub repository](https://github.com/hpoenixf/eff-agent-article). If useful, feel free to Star it or discuss a counterexample through Issues.
<!-- agent-article-sync:guidance:end -->
