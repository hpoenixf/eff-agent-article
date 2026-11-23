---
description: "Use an ETF weekly report to see how a research agent handles optional market data, unavailable web sources and readback of the saved evidence."
readingBrief:
  takeaways:
    - "Narrow a claim when an optional source is unavailable. If essential evidence is missing, identify the part you cannot answer."
    - "A submission retry should use the original message identity. An unsent draft cannot change a past run."
    - "Reopen the report and check its question, body and sources, rather than merely checking that an answer once appeared."
  appliesTo:
    - "Engineers starting to integrate external sources, design report delivery or verify how an agent recovers."
  notFor:
    - "ETF investment advice or instructions for using the 0.41 web candidate as a formal release."
---
# A Useful Agent Can Tell You Which Source It Could Not Retrieve

<LearningPathNav />

Imagine writing a weekly ETF report. You have the fund prospectus and want to add a table of prices, plus the issuer's explanation for a change. The agent finds some news and reads the prospectus, but the market data service is unavailable. Should the whole report fail, or should it present a table that looks complete?

I'd rather have a clearly scoped report: what the prospectus supports, what market data is missing, and whether the news is a lead or something the agent checked against the original. If I reopen the report next week, I want the sources it actually used, not whatever the agent would find today. That connects several steps in Open ETF Agent: **narrow the claim when evidence is missing; don't rewrite history when the missing evidence arrives.**

## Market data can be optional. It cannot be a guess.

[v0.38.0](https://github.com/hpoenixf/open-etf-agent/releases/tag/v0.38.0) introduced Wind as a separate, opt-in lookup: supply one exchange-listed ETF and a date range to get daily unadjusted exchange closes. It stays out of the default research flow. The name matters more than “look up fund data.” A closing price is not fund NAV or total return. If the question asks about performance with distributions reinvested, a valid series of closing prices still doesn't answer it.

The [v0.38.1 preview](https://github.com/hpoenixf/open-etf-agent/releases/tag/v0.38.1) extended selection to a group of read-only tools. Ordinary research still does not contact Wind by default. If enabled, the integration discovers tools compatible with the account. The release record shows a real Wind screening result reaching a report that could subsequently be reopened. A script chose the tool, so this is not evidence that a real model can reliably select the right one on its own. The two steps answer different questions: What do these values mean, and can the model pick the tool that returns the right values?

Enabling everything by default is a reasonable alternative when the task requires complete data. The cost is that account access, vendor availability and network conditions now matter to every request. A task that remains answerable without a source doesn't need to pay that cost. But if the central question is to compare the actual returns of two ETFs, missing the appropriate data means you cannot compare them. Calling a source optional does not make the evidence dispensable.

## Reopen the report to see what must not change

[v0.39.0](https://github.com/hpoenixf/open-etf-agent/releases/tag/v0.39.0) brought this boundary into a local browser. The preview comes with two synthetic ETF sources and demonstrates the flow from a question to a saved report whose source excerpts can be inspected and whose Markdown can be copied or downloaded. It listens on the local machine only, is not a public web deployment, and needs no Wind account.

One useful test drops the browser's confirmation after the server has received the question. If the client retries with a new message ID, one piece of work may run twice. The preview retains the unacknowledged submission and reuses its message identity and payload on retry, rather than taking the latest draft from the input box. A draft is what I might ask next; a submitted question and saved report reflect what this run actually did. Keeping them separate lets a reader check the record later.

Use Node.js 26.8.1–26.x and run this in the v0.39.0 checkout without turning on online services:

```bash
npm ci --ignore-scripts --no-audit --no-fund
npm run gui -- --project ./test-output/local-gui --port 4179
```

Open the local address printed by the command. Generate a report using the bundled examples, then restart with the same project directory and port. See whether History leads you to the same saved answer and source. This tells you more than checking whether an answer once appeared on the screen.

## Whether to deliver after an external failure depends on the question

The 0.40 candidate work separated the deployment procedures. That didn't make it a public release. The [0.41 web candidate](https://github.com/hpoenixf/open-etf-agent/tree/9db04eff21a86ce1ccf0bfc9953a99f61fcd17b2) connects browser-based questions, optional Wind access and web retrieval while same-conversation follow-ups and PDFs are being verified. It is not a formal release; the claims here are about particular paths tested on pinned candidates.

In one hosted candidate test, Wind and web search both returned results, but a site's crawler policy blocked retrieval of the original page. The run ended without delivering a report. After the fix, an independent test asked about public IANA documentation. Search succeeded and two originals were readable; one other page was unavailable. The final answer cited the pages it could read and named the gap. Failure to retrieve an optional source shouldn't discard the parts that were verified. It doesn't mean another site can stand in for a page the user specifically required. End-to-end browser acceptance for PDF submission and report readback is still pending; an existing PDF module or local tests aren't a substitute for that check.

A same-conversation test asked, “Which two URLs did I give you in my previous message?” The model recalled both without searching the web. The boundary is recent messages from that conversation. PDF content from an earlier turn isn't carried into a later ordinary search. Continuing a conversation isn't the same as sending its whole history.

This resembles [Google SRE's degraded responses](https://sre.google/sre-book/handling-overload/): give a smaller result when a dependency cannot do its part. Research adds a constraint. One missing source might only reduce corroboration, or it might invalidate the conclusion. Whether to continue depends on **whether you have enough evidence for the part of the question you actually answer**, not on how many tools returned successfully.

A useful acceptance test is to make one optional source really fail. Check that the report narrows its claim and names the gap. Then reopen the run and verify that the report, sources and original question still match. Finally, repeat with a source the answer cannot do without, and check that the agent does not give the same conclusion anyway. That tells me more about whether it's ready for someone else to use than another tool or progress indicator.

Continue with [From the Command Line to a Research Workspace: How to Pick Up Where You Left Off](open-etf-agent-research-workbench.md).
