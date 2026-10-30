---
title: Financial Agents in Context — Systems, Lifecycles, and Accountability
description: Use a two-fund example to understand six financial Agent design choices: permissions, calculations, citations, partial results, review, and reports users can actually access.
---

# Financial Agents in Context: Systems, Lifecycles, and Accountability

Financial Agents can read financial statements, compare funds, and explain portfolio risks. Once models and tools are connected, a more important question remains: what should the Agent do autonomously, and what must software and business systems control?

**Our choice is to give research room to explore while keeping data permissions, important calculations, and real operations under control.** A model cannot change an account simply by saying so. Equally, one unread document should not leave the user with nothing.

We will use a teaching example—“Do these two funds duplicate my holdings?”—to explain six design choices. ETF Agent's conversational research layer does not trade directly. The order examples describe responsibilities that would need to be separated when connecting to business systems.

## 1. Is the user asking a question or asking to change an account?

Messages in the same chat window can represent three very different tasks.

| What the user says | What the Agent should do | What needs control |
| --- | --- | --- |
| “How do these two funds differ?” | Read sources and explain investment scope, fees, and risks | Source access and permitted uses |
| “Use my holdings to check for duplication.” | Read authorized holdings and analyze overlapping exposure | Use data only from authorized accounts |
| “Buy according to this plan.” | Pass a specific operation request to the business system | Account, product, amount, authorization, and actual execution result |

For the first two tasks, the Agent can independently investigate, compare, and calculate. The third affects real money. Permission to read research material cannot be reused as permission to place an order. Whether personalized advice is within the product's permitted service scope also needs a separate assessment; the absence of a trading button does not settle that question.

In the system, research tools are read-only by default; real operations go through separate business interfaces. Software checks permissions and limits rather than relying on a prompt that says “do not exceed your authority.” Even “go ahead” must refer to a specific plan, account, and amount. The model must not fill those gaps on its own.

If the business system has not returned a definite result, query and reconcile first. Do not place another order merely to finish the task. A model saying “bought” is not evidence of a fill.

**Research can proceed autonomously. Operations can occur only within explicit authorization.**

## 2. Give important calculations to tools, but first define what to calculate

To compare two funds' overlap, counting common companies is not enough. We also need each company's weight and how much the user has invested in each fund.

In our teaching example, fund A represents 40% of the portfolio and fund B represents 20%. Company X represents 8% and 12% of the respective funds. Assuming the disclosures use comparable periods, denominators, and coverage:

**40% × 8% + 20% × 12% = 5.6%**

Code is well suited to this calculation; the model explains it. But 5.6% has a limited meaning: using these inputs, the observed holdings of company X in the two funds contribute 5.6% exposure to the portfolio. Other portfolio assets and undisclosed holdings may add further exposure.

If A's holdings are six months old while B uses its latest disclosure, or one weight is measured against net assets and the other against equity assets, they cannot simply be added without reconciliation. Seek comparable data first. If it is unavailable, show what is known separately and explain why the numbers have not been combined.

The same applies to returns, fees, and drawdowns. Before calculating, establish the object, date, unit, and method. Afterwards, retain the inputs and outputs so the calculation can be checked.

**Python can execute a formula; it cannot establish that the inputs and method were appropriate.** More calculation tools are useful only if the model also knows when to use them and how to interpret their results.

## 3. Citations should make checking possible, not label an answer “correct”

A report with citations is easier to check than one that merely says “according to public information.” But a genuine link does not establish the conclusion.

For example, several companies appearing in both funds' top-ten holdings can support “these disclosed holdings overlap.” It cannot by itself establish “the entire portfolio is highly duplicated.” The step beyond the source still requires judgment.

A more useful research system lets the user open a citation and see the passage or table actually read, together with its reporting period. To check a number, the user should also be able to find its inputs and calculation method.

A saved report should still lead back to the evidence used at the time. If a web page later changes, the new page must not be presented as the old report's source. If the original material is genuinely unavailable, disclose the gap rather than reconstructing supposed original text from a summary.

These records answer “Where did this conclusion come from?” They do not require exposing every internal detail in the report, and they do not justify indiscriminately copying customer holdings and sensitive source text into ordinary logs.

## 4. When information is incomplete, deliver the useful part

Suppose fund A's material was retrieved, but fund B's full holdings are temporarily unavailable. Two poor answers are possible: invent a complete overlap ratio, or say only “insufficient information; analysis is impossible.”

A more useful response would be:

> Fund A's holdings and sector distribution are available, so we can explain its concentration. Fund B's full holdings are still missing, so a complete overlap ratio cannot yet be calculated. The available material for B can still support a comparison of investment scope and fees.

The user receives useful information and can see what is missing. Missing data is not presented as an absence of risk, and a partial gap does not erase completed research.

One important change in our publication design was to **keep a local problem local**. Repair a broken citation display. Mark a metric as unavailable when its required input is missing. If a later tool call fails, retain the material already delivered.

This does not permit disclosing unauthorized data. Customer information that the system is not allowed to use—and content dependent on it—cannot be released in the name of providing a partial answer.

The distinction is straightforward: is analysis material missing, or is permission to use it absent? The first calls for narrower conclusions while retaining other results. The second requires restricting the relevant data use and disclosure.

## 5. Use multiple Agents and human review where judgment is needed

Checking a management fee does not require a bull, a bear, and a judge. Testing an investment hypothesis may justify additional perspectives.

Suppose the user's reasoning is “Buying another technology fund will diversify my portfolio.” A supporting perspective can examine whether it adds different assets. A challenging perspective can check whether underlying holdings still overlap or near-term cash needs have been overlooked. The useful question is: what evidence would invalidate the original rationale?

Several Agents reading the same incomplete material cannot create missing facts by agreeing. Check the data and calculations first, then examine contested assumptions through different methods. A majority vote does not make an answer correct.

Human review also depends on the situation. Ordinary research need not wait for a person to approve every statement by default. Real operations that require human review should trigger it according to established business rules; a model's confidence cannot waive it.

When review raises an issue, the report can gain evidence, explain a disagreement, or be revised. Review should not casually become another switch that makes the entire research result disappear.

## 6. Evaluate the research result the user can actually access

A successful model call, a finished script, and a generated report file are intermediate steps. Returning to the original question, the user needs to know where the funds overlap, how much can currently be calculated, and whether that finding changes the rationale for the allocation.

A useful delivery lets the user understand the main conclusion, inspect key evidence, see important gaps, and open and find the report again. Tool-call records alone do not answer the question. Nor does “file generated” help if the file cannot be opened.

Testing should include more than complete data and successful requests. Deliberately omit one fund's full disclosure, supply data from different dates, or fail a follow-up read. Check whether the system still delivers the correct parts instead of inventing facts or clearing the answer.

Once citation and calculation capabilities exist, the next question is whether **the model chooses the right method, understands the result, and turns it into the explanation the user needs**. That is closer to research quality than adding another general review layer.

## Start with one useful research task

For “Do these two funds duplicate my holdings?”, the Agent should retrieve material, use calculation tools, compare and explain results, and present what is known alongside what is not. A research conclusion must not rewrite holdings, but the search for perfect evidence must not indefinitely prevent an answer either.

Existing Agent frameworks can provide the foundation. There is no need to build an entire financial platform first. Choose a specific question, connect data and calculations, deliver the report, and add capabilities in response to actual defects. When business operations become necessary, separate responsibilities with the existing account, risk, and order systems.

**A good financial Agent must do both: help the user complete as much useful research as possible, and avoid unauthorized operations on behalf of the user or business system.** Safety and usability must both be tested along that concrete task.

## Further reading

For permissions, see [The Model Understands; Code Authorizes](011-model-understands-code-authorizes.md). For data and calculations, see [Financial AI's Most Dangerous Appearance of Expertise: Real Data, Wrong Numbers](031-fintech-data-time-and-reproducible-numbers.md) and [Why Research Reports Can Still Be Wrong After an Agent Calls Python](financial-agent-python-result-consumption.md). For partial delivery, see [Why an Agent Needs an Independent Publication System After Generating an Answer](019-agent-answer-publication.md).

For implementation details, the existing [system responsibility map](../../visuals/en/financial-agent-system-panorama/system-map.svg), [research and business lifecycle diagram](../../visuals/en/financial-agent-system-panorama/lifecycle.svg), and [evidence map](../../visuals/en/financial-agent-system-panorama/evidence-map.svg) remain available. Orange dashed elements represent institutional targets, not live trading capabilities. Interface examples and the detailed discussion remain in the [original technical edition](https://github.com/hpoenixf/eff-agent-article/blob/9d46273da85bddaa6c5c432581c916496edd9cc1/en/articles/financial-agent-system-panorama.md).

[Financial technology topic](https://hpoenixf.com/eff-agent-article/en/fintech) · [中文原文](https://hpoenixf.com/eff-agent-article/articles/financial-agent-system-panorama) · [GitHub](https://github.com/hpoenixf/eff-agent-article)
