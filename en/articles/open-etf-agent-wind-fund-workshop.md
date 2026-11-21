---
description: "Start with one ETF closing price, distinguish fund screening, market prices, NAV and primary evidence, and see how to give a research agent scoped, read-only Wind tools."
readingBrief:
  takeaways:
    - "When the fund identifier and desired field are known, use the corresponding lookup. Screen first only when the research universe is still open."
    - "An exchange close is not fund NAV. Check the instrument, trading date and price basis before interpreting a number."
    - "Attribute structured market data to its provider, but never present it as an original document you did not retrieve and check."
  appliesTo:
    - "Integrating public ETF data into a research agent or assessing what a financial MCP integration actually proved."
  notFor:
    - "Redistributing Wind data without permission, single-stock or account operations, or guaranteeing the model will pick the right tools."
---
# Letting an Agent Research Funds: Why One Market Data Endpoint Is Not Enough

“Find a few ETFs with similar exposure, then compare how they have performed lately” is one sentence, but not one data request. The first part is about finding candidates. The second asks for time series on specific funds. A tool that can only return closing prices may produce genuine numbers yet still tell us nothing about why a fund qualified, how its NAV performed, or which fund is more suitable.

Open ETF Agent started with a deliberately narrow entry point: specify one identifier and date range and look up exchange closes. That answers one clear question and makes the retrieval path independently testable without a model. A research task can then choose among distinct data tools while carrying their measurement basis into the report.

## Run one direct lookup first

From the [Open ETF Agent v0.38.0](https://github.com/hpoenixf/open-etf-agent/releases/tag/v0.38.0) checkout, install the dependencies with the supported Node.js version. Start by reading the help. Run the actual query only if you are authorized to access Wind and can provide `WIND_API_KEY` securely to the local process. Do not put the key in command arguments, project files, or logs.

```bash
npm ci
npm run wind:fund -- --help
npm run wind:fund -- 588200.SH 2026-06-01 2026-06-05
```

This example asks for one ETF's **unadjusted exchange closes** in the specified window. Check that the dates are in range, that the values use the intended unadjusted close basis, and whether the response independently identifies the fund. If the identity field says `request-only`, the request specified the instrument, but the result did not independently confirm it. Dates without trades are not filled with zeros. See the [manual lookup contract pinned to the release](https://github.com/hpoenixf/open-etf-agent/blob/v0.38.0/docs/wind-fund-mcp.md).

This command neither sends the Wind response to a model automatically nor writes it to research history. When I know the fund identifier and need one fact, I would still use this short path. There is no need to involve a model just to fetch it.

## Offer multiple tools, not one catch-all query

Return to “find some funds, then compare their performance.” Split it into three decisions: **screen the universe, identify the instruments, and choose the right measurement**. In this teaching example, screening finds candidates and profiles confirm what the selected identifiers represent. Use price bars for secondary-market price movement. Use the appropriate NAV or performance series for fund-share NAV performance, rather than substituting exchange closes. This illustrates how to choose a tool; it is not a live, multi-tool investment recommendation.

Why not expose the entire Wind catalog? The catalog says what the service offers, not whether this research task may use it, whether an account has access, or how its response may be cited. The research integration provides scoped read-only fund tools. A project explicitly opts in, its worker discovers compatible tools when needed, and each call sends the structured parameters it needs rather than forwarding the entire prompt or attachments. Several tools can be combined, but the adapter does not expose accounts, trading, or unrestricted passthrough. The trade-off is that adding a financial field requires checking both its request constraints and the meaning of its result. For research that must account for each source, this is a better place to make that decision than in model prose.

## A report reopening does not mean an original document was retrieved

Three outcomes can all look like “no table to use” in a user interface, but a report should distinguish them:

| Observation | How to interpret it |
| --- | --- |
| A successful query explicitly returns an empty table | No rows matched this search. That does not establish that no relevant fund exists. |
| Access denied, rate limit, or an unverifiable response shape | The run did not obtain usable data. That is not an empty table. |
| Verifiable structured records returned | Attribute the data to the provider and state its basis. If you did not obtain an original document separately, do not invent a citation for one. |

The research integration and the released manual command are separate paths. In one controlled run of the **0.38.1 candidate**, a script selected the fund screening tool in place of a model, Wind returned real structured records, and the saved research report could be opened in a separate read. That demonstrated an enabled external tool making it through the research workflow and a report surviving readback. It did not demonstrate the model independently choosing the sequence above, and the vendor records were not presented as numbered primary-document citations.

For the next financial data source, I would test three things separately: **the tool fetches the intended measurement, the research workflow actually consumes it, and a fresh process reopens the report with attribution intact.** A failure in the first step is not a reason to tweak the prompt. A failure in the last cannot be fixed by generating a report that merely looks complete.

Continue with [MCP integration from discovery to use](./mcp-host-from-discovery-to-consumption), [reading old reports after source files change](./open-etf-agent-material-version-workshop), and the [Open ETF Agent source](https://github.com/hpoenixf/open-etf-agent).
