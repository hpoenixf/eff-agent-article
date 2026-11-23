---
description: "Follow one ETF tracking question through the local research workspace. Learn to distinguish drafts, saved reports, follow-ups, daily baselines and separate account workspaces."
readingBrief:
  takeaways:
    - "To check what yesterday's answer said, reopen its report and sources. Start a new run only when there is a new research question."
    - "Daily comparison uses the most recent verifiable completed report for the same question version. A failed run is not evidence of no change, and editing the question starts a new baseline."
    - "Two people asking the same question should see their own histories. The single-user offline exercise needs no account module."
  appliesTo:
    - "First-time Open ETF Agent readers and developers exploring how one-off answers become ongoing research."
  notFor:
    - "Real-time investment judgments or setting up a public multi-user production service."
---
# From the Command Line to a Research Workspace: How to Pick Up Where You Left Off

<LearningPathNav />

On Monday you ask an agent, “How well did this ETF track its benchmark? What should I look for in the prospectus?” On Tuesday you add, “What changed since yesterday?” That sounds like one more chat message, but now the system needs to know which report actually finished yesterday, what it cited, and whether today’s question is still the same one. Once someone else uses the workspace, the system also needs to know whose history this is.

Moving Open ETF Agent from the command line to a browser was more than moving buttons to a web page. The [introductory Wind article](https://hpoenixf.com/eff-agent-article/en/articles/open-etf-agent-wind-fund-workshop) explains how to get fund data on the correct measurement basis. This article asks what happens after you get a result: how to reopen it, follow up on the original sources, ask the same question again tomorrow, and give another person a workspace of their own. We’ll use one tracking question throughout. The first exercise uses the bundled examples and needs neither an API key nor real fund data.

## First: see whether you can find yesterday’s report

Use Node.js 26.8.1–26.x with the [pinned v0.39.0 release](https://github.com/hpoenixf/open-etf-agent/releases/tag/v0.39.0):

```bash
git clone --branch v0.39.0 --depth 1 https://github.com/hpoenixf/open-etf-agent.git
cd open-etf-agent
npm ci --ignore-scripts --no-audit --no-fund
npm run gui -- --project ./test-output/local-gui --port 4179
```

Open the local address printed by the command. Start a conversation, select the bundled synthetic tracking source, and enter the question above. You’ll get a sample report with a source. An offline script builds it from the source you selected. It does not interpret the question, fetch live market data or call a model. This is an exercise in using the workspace, not judging how an ETF performed.

Open source [1], then copy or download the report. Reload the page, or restart the server with the same project directory and port. In the original conversation, you should find the original question, the saved answer and its source. Try opening another conversation and typing half a question without sending it, then switch back. Drafts stay in the browser and are separate for each conversation; they do not follow you to another browser. **A draft is what you might ask next. History is what the agent has already done.** Keeping them separate preserves unfinished input without letting an edit quietly change completed research. See the [local workspace guide](https://github.com/hpoenixf/open-etf-agent/blob/v0.39.0/docs/local-gui.md).

## Second: a follow-up is not a rerun

If you want to ask, “Which sentence in the prospectus supports yesterday’s conclusion?”, you can follow up in the same conversation in the [v0.41.0 single-operator workspace](https://github.com/hpoenixf/open-etf-agent/releases/tag/v0.41.0). The default launch still runs the offline demo. To use a real model or external research tools, explicitly enable them as described in the [workspace guide](https://github.com/hpoenixf/open-etf-agent/blob/v0.41.0/docs/local-gui-live.md) and use a separate project directory for live work. Do not expose the local listener to the internet.

The workspace brings along recent questions and answers from that conversation, not the entire history library, and the interface can show recorded execution progress. Two actions are easy to confuse: **reopening yesterday’s report reads the saved result; sending today’s follow-up starts new work.** If you only want to know what it said yesterday, reopen it first. Start a new run when the existing evidence cannot answer the next question. Release acceptance covered non-PDF paths; it did not establish browser PDF acceptance or update a hosted deployment.

## Third: leave the question for tomorrow and keep the baseline in history

If you want to check the same thing every day, try phrasing the question as, “Check this ETF’s tracking performance. Tell me what has changed since the last report, and identify any gaps in the evidence.” Save it in [v0.42.0 Daily Research](https://github.com/hpoenixf/open-etf-agent/blob/v0.42.0/docs/local-gui-daily-watch.md). This is for the trusted single-operator live workspace. Choosing a time in Beijing time and saving does not send a model request by itself. Automatic execution has to be enabled in the workspace and on the service; it may use your model allowance.

The important choice is not “what time every day?” but “which result counts as the comparison?” If the question and run permissions stay the same, the workspace looks for the most recent verifiable completed result for that watch. If Tuesday’s run failed but Monday’s report can still be reopened, Wednesday compares against Monday and shows the actual baseline date. It does not treat Tuesday’s failure as evidence of no change. Change the question to “Did the fees change?” and you start a new baseline. Even changing the wording back later does not restore the old comparison chain. Yesterday’s report gives you a baseline; it is not proof of a new fact today.

Email is a separate, optional delivery path. Research completion and email delivery are different states. The [v0.42.0 release](https://github.com/hpoenixf/open-etf-agent/releases/tag/v0.42.0) verified synthetic SMTP only, not receipt at an external mailbox. For a first check, open the original conversation and baseline report from the watch card. You can do that without configuring email.

## A different person starts in a different workspace

So far, you have been the only operator. If someone else asks the same ETF question, the system should not show them your report simply because they used the same wording. [v0.43.0](https://github.com/hpoenixf/open-etf-agent/releases/tag/v0.43.0) adds a separately launched, invite-only local account workspace using Better Auth and Node SQLite. Each account has its own project, history and reports, and logging out revokes the server-side session. The default offline workspace and ordinary installation are unchanged. The release does not activate hosted accounts or migrate existing production data. If you only want to practise reopening a report, there is no need to install the account module.

To pick up the research next time, first check whether you can **reopen the original report, follow the citations back to the sources it used, and identify which previous result you are reusing**. Then decide whether you need a follow-up, a daily comparison, or a separate account. Otherwise, the more the page looks like a research workspace, the harder it can be to answer a simple question: “Which run produced what I’m looking at?”

Continue with [Deploy Open ETF Agent from Scratch: Run the Research Workspace on Your Own Server](open-etf-agent-staged-deployment.md). · [Star the project on GitHub if it is useful](https://github.com/hpoenixf/open-etf-agent)
