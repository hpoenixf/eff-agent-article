---
description: "Follow one ETF premium-and-discount question through Open ETF Agent: choose a research mode, tell a search preview from a source excerpt, and reopen the answer that was actually saved."
readingBrief:
  takeaways:
    - "Start in Standard when you have one source and a focused question. Use Deep when the question needs several checks."
    - "Treat search results as leads. A retrieved excerpt is not the whole page, and reading it does not make the answer correct."
    - "To recover the same answer, open the original conversation. Saving the answer and completing the task are separate outcomes."
  appliesTo:
    - "Open ETF Agent readers who want an answer they can check and return to later."
  notFor:
    - "Readers expecting live quotes, a full linked-PDF exercise, or independent verification of every financial claim in this article."
---
# From First Question to Readback: Research You Can Reopen in Open ETF Agent

<LearningPathNav />

You ask, “Why might an ETF trade at a premium or a discount?” After you get an answer, three questions matter. What passage did the agent actually read? Which parts are its own interpretation? If you refresh the page, will you see the same answer? Length tells you nothing about any of these, but they determine whether you can build on the work.

[The previous article](https://hpoenixf.com/eff-agent-article/en/articles/open-etf-agent-research-workbench) covered conversations, follow-ups, daily comparisons, and isolated accounts. This one follows a shorter path through v0.44.0 to v0.47.0: ask once, check what the answer rests on, and find the original again.

## Try it locally: refreshing does not rerun the research

With Node.js 26.8.1–26.x and npm, install the fixed [v0.47.0 release](https://github.com/hpoenixf/open-etf-agent/releases/tag/v0.47.0):

```bash
git clone --branch v0.47.0 --depth 1 https://github.com/hpoenixf/open-etf-agent.git open-etf-agent-reading
cd open-etf-agent-reading
npm ci --ignore-scripts --no-audit --no-fund
npm run gui -- --project ./test-output/local-gui --port 4179
```

Open the local address printed by the command, start a conversation, and select the built-in synthetic tracking document. Ask: “Is this document about how the ETF tracks its benchmark or about the price it trades at?” The offline script does not understand the question or fetch real prices. It generates a report from the selected example and includes a passage from that source. This is a practice run: open a citation, find the saved report, then refresh and reopen the same turn from History. You can also stop the service and restart with the same project directory and port. The original question, report, and citations should be available without sending the question again.

Since v0.44.0, the workspace has rendered saved Markdown reports directly. Later releases pinned the composer to the bottom and let you collapse History and Sources separately to save space on a narrow screen. Charts are optional. Daily closing prices on a chart come from tool data for that turn; missing values stay blank rather than being inferred from the answer. You do not need a chart for this exercise.

## In the online workspace, ask what the source actually says

If you have already followed the [online workspace guide](https://github.com/hpoenixf/open-etf-agent/blob/v0.47.0/docs/local-gui-live.md) to configure a model and public web tools you are authorized to use, start a separate online project and try a question that does not require live data. Paste the link to the [Investor.gov bulletin on ETFs](https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins-24) along with the prompt:

> Using only this bulletin, explain how an ETF’s trading price differs from its net asset value per share and why it might trade at a premium or discount. Tell me what you actually read. If you could not verify something from the source, say so. Do not look up today’s prices.

This is an exercise you can try, not a new live evaluation run for this article. If the website does not return readable source text, see how the workspace reports that gap. The built-in offline mode does not visit the bulletin.

**Which mode should you choose?** With one known source and a focused question, try Standard. When you are not sure whether a lookup is necessary, use Auto. Choose Deep when you need to compare the bulletin, a fund prospectus, and exchange documentation, then explain what each can establish. The composer has offered these three modes since v0.45.0. Reasoning effort is a separate model setting and is shown only in supported configurations. It is not another name for Deep research and does not guarantee accuracy.

When the original is a PDF, make one more check: does the citation point to a **physical page** in the file? For a table value, can you identify the original row, column, and unit on that page? The v0.47.0 exercise above still covers webpage excerpts only. The separate [v1.0.5 workshop](./open-etf-agent-filing-to-checkable-chart) walks through page citations and recomputing a number.

## Read progress without mixing up three kinds of evidence

| What the workspace observed | What you can conclude | What you cannot conclude |
| --- | --- | --- |
| A search found a result | You have a lead worth checking | The agent read the original |
| A webpage returned a readable excerpt | The turn obtained that passage | The agent read the entire page or interpreted it correctly |
| The saved answer opens again | The original answer was delivered and can be revisited | Someone independently checked its facts, reasoning, or causal claims |

Since v0.46.0, Deep research progress distinguishes between reading source text, checking without finding readable text, and saving and reading back the answer. If the retrieved excerpt says only that trading prices can be above or below net asset value, use it to support only that point. If you do not have the passage explaining arbitrage, mark that explanation as unverified instead of filling in the argument with a search preview.

Webpages can be long. In v0.47.0, the same turn can continue into the next excerpt of the retained page without requesting the page again. The two excerpts therefore need not come from separate downloads. Continuation requires the exact position issued by the system. If the retained original is missing or its bytes no longer match, the agent will not fetch today’s page and pass it off as the old evidence. This feature is not a clickable list of precisely linked passages in the UI, or an online PDF reader.

## When reopening the answer, ask what was saved at the time

Once an answer appears, reopen the original conversation from History. Check the question and answer from that same turn. Do not resubmit the question just to see whether the model says something similar. An online free-form answer may be saved without a separate Markdown report. A report is downloadable only if one was made and saved.

v0.47.0 separates **whether the answer was confirmed saved** from **whether the task finished normally**. If cancellation or a later failure interrupts the task after the answer has been saved, the answer stays readable, but the task must not be marked complete on that account. Conversely, seeing text in progress is not proof it was saved. When the task specifically requires a report, a readable answer is no substitute. The server can read one saved answer directly without relying on other History entries being readable. That does not add a recovery button to the current interface.

Keep the stable release, staging and production separate, too. The commands above use a fixed stable release from GitHub. Staging is for advance verification; production should be checked on its own after rollout. To put your workspace on a server, see the [deployment guide](https://hpoenixf.com/eff-agent-article/en/articles/open-etf-agent-staged-deployment) for authentication and network setup. Do not expose the local port directly. After upgrading, open the original conversation, answer, and report first. A new paid question is not a substitute for that check.

## Take a published report with you

Reopening a conversation helps when you still have the original project. From v0.67.0, you can export a Run you can already read. The report body sits in Markdown alongside an index that keeps the original numbers of public citations. A Web extraction chunk has its own position. Physical page and section remain blank when the source did not record them.

Copy the entire directory and verify it offline. Keep the export's manifest digest separately if you need to detect replacement of the whole bundle. A changed digest tells you that the files differ. The research claims still need a reader's review. [Export and verify a report](https://github.com/hpoenixf/open-etf-agent/blob/v0.67.0/docs/offline-report-bundle.md)

## Five releases, five problems this walkthrough addresses

| Release | What it adds to this walkthrough |
| --- | --- |
| [v0.44.0](https://github.com/hpoenixf/open-etf-agent/releases/tag/v0.44.0) | Read saved reports as Markdown and use same-turn tool data in charts. |
| [v0.45.0](https://github.com/hpoenixf/open-etf-agent/releases/tag/v0.45.0) | Choose Auto, Standard, or Deep when asking a question. |
| [v0.46.0](https://github.com/hpoenixf/open-etf-agent/releases/tag/v0.46.0) | Distinguish source text read, checks without readable text, and saved-answer readback. |
| [v0.46.1](https://github.com/hpoenixf/open-etf-agent/releases/tag/v0.46.1) | Collapse History and Sources without losing access to the composer or Stop. |
| [v0.47.0](https://github.com/hpoenixf/open-etf-agent/releases/tag/v0.47.0) | Continue a retained page in the same turn and read a confirmed saved answer independently. |

The next time you check a piece of research, ask: **Do I need new evidence, or do I need the evidence and answer from last time?** The first calls for new research. For the second, start with History. For implementation details, see the [v0.47.0 verification notes](https://github.com/hpoenixf/open-etf-agent/blob/v0.47.0/docs/verification/v047-retained-web-and-answer-delivery.md).

[Star the project on GitHub if it is useful](https://github.com/hpoenixf/open-etf-agent).

Next exercise: [The Agent Answered. How Do You Know It Delivered?](./open-etf-agent-prove-delivery.md).
