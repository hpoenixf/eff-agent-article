# Why a Financial Market Data MCP Started Turning into a Research Decision System

We built a Market MCP for an investment-research Agent. It connected several quote Providers, public interfaces, and local data programs so the model could request index prices, fund NAV, and product information.

Initially we wanted an integration layer that handled vendor differences, leaving the model with a uniform set of tools.

Later, information that might have been available was repeatedly reported as **source unavailable** or **not read**. Following the execution path showed that the integration layer had begun interpreting financial fields, judging evidence completeness, planning follow-up searches, and using one failed request to suppress unrelated products.

The problem was not the number of Providers. It was **combining data access with the decision about how a research question should be answered**.

We retained multi-source capabilities but separated **open-ended research** from **deterministic, contract-bound data consumption**.

## 1. One Investment Question Needs Several Different Data Capabilities

"How has this fund performed recently?" can require fund NAV history, the tracked index's prices, holding disclosures, and product documents describing investment scope.

They refer to different objects and publication times. One Provider may not cover them all.

We integrated several classes of source: vendor MCPs, fixed public-website APIs, and Python-backed data programs.

Official CSI endpoints can supply particular index histories. Fund-company APIs may provide NAV observations for explicitly configured products. WeStock, Wind, and Python channels support their own quote-reading capabilities.

Multiple sources provide different coverage, fallback read paths, and some cross-checking. They also create cost, permission, and maintenance choices. A vendor requiring credentials is not inherently superior; another with richer fields is not automatically suitable for every question.

The [MCP tool specification](https://modelcontextprotocol.io/specification/2026-07-28/server/tools) defines tool identity, description, input Schema, discovery, and invocation. It does not determine which financial object/date a number represents or which evidence is sufficient to calculate an answer.

A common integration entry was reasonable for transport, authentication, rate limits, and invocation records. The question was **how much business interpretation this common layer should own**.

## 2. What "Multi-Provider Support" Actually Means

The following is a source-code capability inventory, **not a claim of current live connectivity or successful online acceptance for every channel**.

| Source | Integration path | Current capability and activation boundary |
| --- | --- | --- |
| **WeStock** | MCP Client with server-held OAuth credentials | Structured path retains historical quotes; default composition can disable it. Actual use depends on credentials, authorization, and vendor availability |
| **Wind** | MCP Client and selected service methods | Historical prices in the structured path; requires API Key and enabled configuration, placed in a later source tier |
| **BaoStock** | Fixed Python bridge through controlled subprocess | Included by default in structured composition; retains selected China-market historical quote support |
| **yfinance** | Fixed Python bridge | Included by default in structured composition; static order prefers it for US-market historical quotes |
| **CSI public data** | Bounded HTTP requests to fixed CSI domains | Selected China-market index history; not universal coverage of all CSI products |
| **Fund-company public APIs** | Fixed organizations/domains, product codes, and NAV routes | Current configuration supports **Huatai-PineBridge** and **Southern Asset Management**; requires explicit supported code/route |
| **AKShare** | Standalone public fund-unit-NAV tool through a fixed Python program | Optional component implemented; trusted composition must confirm allowed public-data use and source terms; **not yet injected into the default Market process entry** |

Here a **Provider** accepts a defined request, reads its particular source, and returns a candidate result.

The upstream vendor need not expose MCP itself. A controlled HTTP or Python program can be wrapped in our own Market MCP.

But one Provider interface does **not** imply identical coverage. The cited structured WeStock/Wind/BaoStock/yfinance adapters mainly retain **historical quote** reads. Fund-company adapters provide NAV for configured products.

Earlier broad routes for product profiles, snapshots, constituents, and macro research have been retired. Historical types still decodeable in code must not be advertised as currently executable tools.

AKShare shows why capability claims need boundaries. Its fund-unit-NAV result retains original fields, dependency versions, source revision, and actual returned coverage.

Currency, share class, dividend events, and publication time remain **unknown until verified**. Output rows are bounded; omitted rows and the next segment start date are disclosed explicitly.

This is a traceable NAV sample, **not automatically a complete total-return series**. The component exists as an optional integration, not proof of default activation.

## 3. How a Common Interface Gradually Acquired Research Authority

The original goal was similar inputs and outputs for similar model requests regardless of Provider.

To do that, adapters converted unified requests into vendor parameters and transformed returned tables/fields into internal financial objects.

Each additional rule had a local rationale:

- Vendor field differs: add an alias.
- Unit differs: normalize it.
- Table nested deeply: extract records.
- Required field absent: decide whether the result is usable.
- Result incomplete: decide whether another source should be queried.

The last two steps subtly changed ownership.

| Added integration behavior | The decision it began making |
| --- | --- |
| Select vendor API by an internal product class | Which business method applies to the instrument? |
| Transform complex tables into canonical fields | What do these vendor fields mean financially? |
| Check completeness of a unified result | Does this research question require the missing data? |
| Automatically fetch other sources | Which follow-up investigation is most useful? |
| Avoid a Provider after result anomalies | Can failure on this request represent the health of the whole channel? |

Not all adaptation is wrong. Explicit, deterministic historical-price consumers still need input conversion and validation.

The problem is applying the same transformations to **open-ended research**, before the model has even seen the source material.

"Model understands, program executes" did not prevent this drift, because our definition of "execution" had quietly grown to include product classification, completeness judgments, and planning.

## 4. A Missing-Source Report Revealed Three Different Problems

Some real research tasks could not verify a fund's index affiliation and reported that sources were unavailable.

We did not immediately blame vendor downtime. We traced which API was chosen, what it returned, and why our internal adapter accepted or rejected it.

**First**, one WeStock path mapped an internal generic **fund** type to an ETF-specific interface. An ETF is a fund, but not every fund is an ETF. The error occurred at **interface selection**. Adding more product exceptions would make the integration layer a larger vendor-business classification engine.

**Second**, Providers sometimes returned multi-row tables or unfamiliar fields while the adapter expected a fixed single-record shape. **Source returned data** and **adapter accepted data** are separate facts. Mapping the second failure to "source has no data" denied the model a chance to interpret the original material.

**Third**, early failure avoidance keys used **vendor + operation type**. Even some shape mismatches could enter that record. One failed product query might suppress other products' requests to the same operation.

Source inspection supported that failure-propagation path. It did **not** establish that every historical read failure had the same cause.

The local repair narrowed failure keys to concrete requests and stopped treating generic schema mismatch as equivalent vendor avoidance. The larger redesign separated research material reading from deterministic consumption.

## 5. Two Coexisting Paths: Local Market MCP and Native Providers

We did not replace every Provider with a new universal interface.

We retained **two paths for different contracts**.

### Path A: our Market MCP for defined, structured requests

It exposes stable operations such as looking up known instruments or retrieving price/NAV history. Behind them are fixed HTTP, Python bridge, or vendor adapters.

Deterministic consumers need identifiable instruments, time windows, and bounded result schemas. Those contracts are still useful.

### Path B: approved native Provider tools for open research

Host projects approved original tools, descriptions, and Schemas from the currently bound source. The model builds arguments and interprets returned materials under that actual interface.

A remote MCP may connect directly to Host; it need not be rewrapped into a local synthetic Market provider.

~~~mermaid
graph TD
ResearchModel --> McpHost
McpHost --> LocalMarket
McpHost --> NativeSource
LocalMarket --> StructuredProviders
StructuredProviders --> BoundedEvidence
NativeSource --> NativeEvidence
BoundedEvidence --> ResearchModel
NativeEvidence --> ResearchModel
~~~

Host holds MCP connections, permission checks, and invocation. The two branches are **alternative modes of consumption**, not a requirement that every research task call all sources.

A native tool's stable public name does **not** erase the original Provider-specific argument contract.

If a model generated arguments against Provider A, the program must not silently send them to B after A fails. A new model turn should see B's current approved tool definition and choose a valid call.

Mechanical pre/post handling still makes sense: unambiguous formatting corrections, privacy filtering, and output bounds. It should preserve original/effective arguments and final validation.

If Hooks start guessing product types, filling missing financial fields, or deciding which research to perform, they are rebuilding the very business adapter layer we retired.

The native research route does **not** inherit the structured path's tiered auto-fallback.

## 6. How the Remaining Structured Path Selects Several Sources

### Restrict the request, then select candidates

A structured request identifies operation, instrument code, market, type, date window, and measurement basis.

Same code in another market—or NAV versus index price—is not the same result.

The executor first filters enabled Providers that declare support for the operation. It then selects candidates based on request-scoped failure records and source tier.

The first tier includes public interfaces and common channels. Wind may be placed in a later tier when configured.

Within a tier, a bounded number of Providers run concurrently in priority order; tiers are sequential, with a **shared overall deadline**.

The current limit is **at most three concurrent Providers per tier**.

Static historical-quote ranking prefers yfinance for US markets and WeStock elsewhere, while specialized CSI/fund-company adapters retain high priority for their supported objects.

These are implementation choices, not eternal vendor-quality rankings.

### Choose one primary result, not a stitched-together "truth"

Candidate data must first pass instrument and basis checks.

Primary-result ranking considers actual coverage, source priority, and data date. It is not just "first response wins" or "latest timestamp always wins."

A complete valid first-tier result can stop further work. If only partial, stale, or conflicting results appear, the executor retains that partial evidence and tries an approved later tier while time remains.

If no tier produces a complete result, the prior partial result is returned. **The current implementation does not perform a second global ranking of all partial results across tiers**.

This fallback stays inside **the same explicitly bounded data request**. It does not change the user's question or decide to research a different fund.

Whether data supports a broader conclusion or justifies researching something else remains the model's job.

### Cache results without pretending they are current

Equivalent structured requests use stable keys; in-flight identical reads deduplicate, and completed data can be stored in memory or configured disk cache.

The current default reuse window is **24 hours**. Cache hits expose status and age. The source observation date is **not rewritten as today**.

If refresh fails, an existing result may be returned as **partial/stale** with an explicit refresh failure reason.

If the request is cache-only and no local result exists, report unavailable. Do not secretly access the network.

Failure avoidance uses **vendor + normalized request**, with a default **three-hour window**. The structured path does not treat generic **INVALID_RESULT** as the same retryable failure classification, nor reuse a failure for unrelated products.

Native research isolation follows individual invocations and proven connection faults instead. These policies should not be conflated.

### Source agreement is limited evidence, not a certificate for an entire time series

The structured path compares candidate terminal values only where instrument, market, type, and basis align.

Its local bands classify relative end-value differences:

- At most **0.05%**: agreement.
- At most **0.5%**: minor deviation.
- Greater: conflict.

A large conflict downgrades the tier's result to partial and avoids presenting the selected value as uncontroversial.

These are **local project thresholds**, not universal accuracy standards for financial market data.

The comparison has **not** been extended to trading-day-by-trading-day agreement and does not independently require candidates' terminal dates to be identical. Consumers must inspect actual dates.

A status of **confirmed** must not be misread as full-series validation.

A coverage check for a requested window likewise does not establish that every expected trading day is present or every observation final.

## 7. One Synthetic End-to-End Example

Suppose the model requests daily CSI 300 index prices for a defined window and wishes to compute the interval change:

~~~json
{
  "code": "000300",
  "market": "CN",
  "type": "index",
  "from": "2026-09-01",
  "to": "2026-09-30",
  "frequency": "daily",
  "metrics": ["interval_return"]
}
~~~

**All prices and Provider responses below are synthetic teaching values, not real market observations.**

Assume no cached result. The first tier selects three Providers:

| Candidate | Synthetic observation | Consequence |
| --- | --- | --- |
| **CSI adapter** | Correct object/basis; first 4,000, final 4,080 | Eligible primary result |
| **WeStock adapter** | Same object and dates; first 4,000, final 4,081.2 | End-value difference about **0.03%**, inside local agreement band |
| **BaoStock adapter** | This request timed out | Record local failure; other accepted candidates remain usable |

Primary ranking may select the CSI sequence. The interval return from its first and last prices is:

~~~text
4080 / 4000 - 1 = 0.02 = 2%
~~~

The first tier satisfies the current request, so there is no need to invoke Wind.

A simplified result view:

~~~json
{
  "status": "available",
  "instrument": {
    "code": "000300",
    "market": "CN",
    "type": "index"
  },
  "basis": "market_price",
  "source": "csindex",
  "actualFrom": "2026-09-01",
  "actualTo": "2026-09-30",
  "intervalReturn": 0.02,
  "corroboration": "confirmed",
  "cache": "miss"
}
~~~

The model receives not merely "up 2%" but the **instrument, actual dates, price basis, Provider identity, and limited corroboration state**.

This is selected **index-price interval change**, not the investor's actual fund return. Additional sources do not eliminate date or permission checks.

Changing one condition changes the result:

- **End values disagree beyond the conflict band.** Tier results become partial. The same bounded request can try a permitted later tier if time remains; it does not invent an average market "truth."
- **Only old cache exists and refresh fails.** The original dates remain, status becomes stale. The model may describe historical figures but cannot claim to have fetched the latest quote.
- **Source was never successfully read.** Unavailable, unsupported operation, and valid empty results remain distinct. Skipped or timed-out Providers are no proof that market data do not exist.

This is the real utility of multi-source integration: several candidates can contribute to one constrained read, while the chosen origin, coverage, and uncertainty survive into downstream reasoning.

## 8. What the Redesign Delivered and What It Cost

When the original retrospective was first drafted, native protocol consumption remained a target. Subsequent engineering acceptance covered native descriptor/content preservation, invocation-level isolation, narrow tool pre/post processing, retirement of Research normalization paths, and selected persistence/Recovery handoffs.

The structured path still has explicit consumers; we did not merely hide old logic under a different filename.

A concrete counterexample during refactoring was a legal **2,100-row** native result under **32 KiB** rejected because its output Schema check reused a **4,096-node** model-input budget.

The bytes were within the legitimate output allowance; an unrelated complexity limit still vetoed the result. The repair aligned output traversal with the existing result-byte budget while keeping Schema, privacy, and final size checks.

This is integration engineering worth preserving after removing semantic adaptation: the correct fix was **a validator scope correction**, not a new financial-field mapper.

The recorded acceptance paths are controlled engineering checks, including provider-free transport and Recovery tests. They do **not** replace live vendor authorization, long-term service availability, or real-model research-quality tests with different Schemas.

The trade-off is genuine. Native tools require models to understand more source variation; tool descriptions and context capacity become more important. Deterministic consumers still maintain their strict local schemas.

The work has not disappeared. It has moved to Owners that can justify it: transport handles protocol and resources; dedicated data producers handle stable formats; the model handles research interpretation and next-step choice.

The next time we add a Provider, we will first ask which real data gap it fills, then decide whether it belongs in native MCP, fixed HTTP, or a Python bridge.

When reading fails, we will distinguish arguments, protocol, object identity, missing data, and connection health before deciding what to modify.

**Only when a specific deterministic consumer actually needs a stable financial structure should we add a dedicated transformation.**

A Market MCP can connect many sources and supply reliable inputs for well-defined calculations. Its maintainability depends on consistently separating **read facts**, **calculation premises**, and **judgments that only make sense in the research context**.

## Continue Reading

- [From MCP Connection to Model Consumption](mcp-host-from-discovery-to-consumption.md)
- [A Read-Only Portfolio MCP](portfolio-mcp-readonly-investment-data.md)
- [The Dangerous Professionalism of Incorrect Financial Numbers](031-fintech-data-time-and-reproducible-numbers.md)
- [Why an Agent Can Run Python and Still Miscalculate](financial-agent-python-result-consumption.md)
- [A Trustworthy Evidence Chain for Financial Agents](financial-agent-trustworthy-evidence-chain.md)

<!-- agent-article-sync:guidance:start -->
## Further Reading and Discussion

Read adjacent essays and diagrams at the [article collection](https://hpoenixf.github.io/eff-agent-article/).

The [GitHub repository](https://github.com/hpoenixf/eff-agent-article) hosts these materials; Stars and issue discussions are welcome.
<!-- agent-article-sync:guidance:end -->
