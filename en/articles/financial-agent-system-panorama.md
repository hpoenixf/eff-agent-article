---
title: Financial Agents in Context — Systems, Lifecycles, and Accountability
description: Follow a portfolio question through system responsibilities, research loops, data and calculations, collaboration, trustworthy delivery, ongoing review, and business operations. Give research room to explore while controlling real effects.
---

# Financial Agents in Context: Systems, Lifecycles, and Accountability

A user asks: “I already own two technology funds. Would adding another diversify my portfolio, or buy the same risk again?”

A model can explain diversification. It can also use tools to look up funds, read holdings, and calculate overlap. Performing those actions once does not mean the question has been answered. The system still needs to know which share classes it has read, which periods the holdings cover, whether the datasets are comparable, what the calculation means, and which kind of risk concerns the user.

Then the user says, “Make that adjustment.” The task changes again. Research may now lead to an account operation involving money. Who checks the product and amount? Who approves the operation? If no definite result arrives, should the system query the original request or submit it again?

**A panoramic view of financial Agents is not a collection of more models, tools, and review modules. It connects research with business: the model can explore flexibly, while data, calculations, permissions, and real operations have distinct responsibilities.** Autonomy alone overlooks consequences; control alone can leave the user with no useful result.

We will follow a synthetic fund-portfolio case through this whole path. ETF Agent's current conversational research layer does not trade directly. Orders, settlement, and institutional approval in this article describe the intended division of responsibilities when connecting a business system, not trading capabilities already in production.

## 1. Why financial use cases need more than a different knowledge base

Agents in every domain need reliability. Coding and research tasks can also have serious consequences. Finance is not special because errors elsewhere are harmless. Its distinctive difficulty is that an ordinary question often combines **precise facts, open-ended judgment, and actions that may affect money**.

“What does this fund charge?” sounds like a single lookup, but the answer may depend on share class, distribution channel, charging conditions, and effective date. “Do these two funds duplicate each other?” goes beyond matching numbers. Shared holdings are facts; whether their overlap warrants a change depends on weights, other assets, the investment horizon, and the user's objective.

Authentic material is therefore only a starting point. A report downloaded today may describe last quarter's holdings. A change in fund NAV is not necessarily the investor's actual account return. Financial research must preserve the conditions around a number rather than compress every source into a summary without dates or definitions.

### One chat box can carry different responsibilities

| User request | What should be delivered | What must not happen silently |
| --- | --- | --- |
| “How do these funds differ?” | Sourced product explanations and comparisons | Mixing share classes, periods, or measurement bases |
| “Use my holdings to check for duplication.” | Portfolio research based on permitted account data | Treating conversational memory as current holdings |
| “Compare holding, reducing, and adding.” | Conditional analysis within the permitted service | Presenting a simulated allocation as actual holdings |
| “Carry out this plan.” | A separate business-confirmation and execution process | Turning research permission into operation authority |

The distinction is not simply whether there is a trading button. Personalized recommendations can carry separate service responsibilities. A product should define its service before deciding which data and operations to expose. The relevant institution must determine applicable qualification and review requirements.

### Some questions suit rules; others require research

Multiplying an established fee rate by an amount, checking account access, and applying a defined order limit suit deterministic code. Deciding what to investigate, which source to read first, and how to interpret conflicting views requires judgment in context.

Finance's need for control does not mean every research question should become a fixed form. A model's ability to understand language does not give it authority to decide permissions or business rules. Cooperation starts by distinguishing decisions that can be explored from decisions that must follow established rules.

For the difference between research, recommendations, and trading, see [When AI Starts Saying What to Buy](030-fintech-from-research-to-investment-advice.md).

## 2. The whole map: how models, tools, and business systems divide the work

Think of a financial Agent as a research team, but do not assign an Agent to every responsibility. Account systems hold the positions, data tools retrieve material, the model organizes analysis, calculation code applies explicit methods, and delivery mechanisms preserve the output. They cooperate without replacing one another.

![Four responsibilities: investment records, data access, research and delivery, and operational observation. Business operations require separate authorization.](../../visuals/en/financial-agent-system-panorama/reader-system.svg)

[Enlarge the responsibility map](../../visuals/en/financial-agent-system-panorama/reader-system.svg)

**Investment records answer, “What does the user actually own?”** Shares, cash, and confirmed records should come from the systems responsible for those facts. The model can explain an account, but generating a new summary must not rewrite it. A “confirmed” entry in a personal investment tool is not a broker execution report.

**Data access answers, “What did this research actually obtain?”** Web pages, PDFs, market interfaces, and internal knowledge stores serve different purposes. The access layer should pass on the source, data date, read coverage, and failures accurately. Normalizing formats must not quietly become a judgment that “these materials are not professional enough, so the entire question cannot be answered.”

**Research and delivery answer, “How does this become useful?”** The main Agent understands the question, selects methods, invokes tools, and delegates bounded work when necessary. It then organizes results into an explanation. Calculation, text generation, file persistence, and the user's receipt of the result must connect in practice. Separate modules reporting success is not enough.

**Operational observation answers, “What happened, and where?”** A failed read, a calculation the model never received, saved prose, and a file the user actually obtained need inspectable records. Observation helps diagnosis. It does not choose investments for the user or obtain access to all private material merely by collecting logs.

These are responsibilities, not a requirement to deploy four microservices. A small team can implement them in one application. The important distinction is that a model reply must not simultaneously become a research opinion, an account fact, and operation authorization. Nor should a data adapter become a hidden research decision-maker.

### What frameworks, tools, and business rules each provide

Frameworks help arrange model calls, tool execution, and run state. Tools let the model retrieve material, calculate, and produce files. Research methods describe how to analyze a class of questions. Business systems maintain accounts, products, and real operations. Connecting any one of these does not supply the others automatically.

A “read fund holdings” tool provides material. A portfolio look-through method explains how to analyze it. Account access control determines whose data can be read. Putting everything in the prompt may look centralized, but it leaves the model carrying responsibilities it should not own.

Tools should also make their meaning clear. A query that explains its data date, share class, and missing coverage is easier to use correctly than an all-purpose interface returning a large collection of unexplained fields.

See [The Model Understands; Code Authorizes](011-model-understands-code-authorizes.md) for authority design, and [When a Financial Data MCP Grew into a Research Decision System](mcp-market-responsibility-retrospective.md) for the access-layer tradeoff.

## 3. How research progresses: let new evidence change the next step

Return to the question about overlapping technology funds. One sentence contains several related judgments: what the existing assets are, what the new fund adds, which risks remain unchanged, and what would change the conclusion. The Agent's value is not merely calling tools in sequence. It is deciding what to do next based on the results.

![A research loop: establish the question, obtain material, compare and calculate, then explain and deliver. Important gaps can trigger further research; independently supported parts can be delivered early.](../../visuals/en/financial-agent-system-panorama/reader-loop.svg)

[Enlarge the research loop](../../visuals/en/financial-agent-system-panorama/reader-loop.svg)

### Establish how far this question needs to go

Public material may be enough to explain product differences. “What does this do to my portfolio?” requires permitted holdings data. Without an additional investment amount, qualitative differences can still be discussed. Without account access, public products can still be researched, but the system cannot claim to have analyzed the user's actual allocation.

Clarification needs judgment too. A cash requirement in six months may change the scenario comparison and deserves early attention. A preference for a light or dark report theme should not stop research. Do what can already be answered; pause for information that materially affects the central judgment.

A useful start is not a completed form but a question that can progress: “Compare the disclosed companies and sectors across the three funds, then examine whether the new product adds different exposure; consider the cash requirement separately.” That provides direction while allowing the material to change the route.

### What was obtained determines what can be answered

Suppose fund A has full holdings, B has only a top-ten list, and C's name refers to two share classes. Joining all three tables immediately may produce an attractive overlap figure with unclear meaning. Research should first establish C's identity, describe B's disclosure coverage, and decide whether to seek more complete material.

If a fuller disclosure for B exists but covers an earlier period, a real choice appears: use an older common date that is comparable, or retain the latest known subset and qualify the conclusion. Neither choice is universally correct. Historical material may be exactly right for a question about a past allocation. A question about current risk needs the timeliness limitation beside the conclusion.

Each further search should answer a concrete question: what new information could change which judgment?

### Calculations must return to the original question

When tools return shared holdings, sector weights, or correlations, the main Agent must explain what each result establishes. Few shared stocks do not necessarily mean different risk drivers. Similar historical returns do not, by themselves, establish identical holdings.

Research can continue when a result exposes an important gap. If the remaining gap cannot currently be resolved, deliver what is known. When resources are nearly exhausted, organizing existing findings should take priority over spending the last opportunity on low-value repetitive searching.

A user may add, “I am replacing one fund, not adding new money.” The research objective must change accordingly. Previous sources need not be discarded, but scenario calculations must use the replacement premise. Reusing valid work without retaining an invalid assumption matters more than simply running more turns.

Continuing from tool feedback is a common Agent pattern. Anthropic discusses that loop and stopping conditions in [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents). The financial adaptation is to let the model choose the research route while code maintains actual permissions, resources, and execution records—not to make code judge every investment opinion.

For the task-progression mechanism, see [How Models and Research Loops Work Together](etf-agent-model-harness-research-loop.md).

## 4. Data, calculation, and judgment must connect

Moving arithmetic into Python is valuable. “A calculation tool was called” is not evidence of research quality, however. The chain that matters is what the input describes, whether the method applies, which qualifications remain attached to the result, and whether the final explanation changes its meaning.

### Put numbers back into their objects and dates

Suppose A represents 40% of the portfolio and B represents 20%. Company X has weights of 8% and 12% in those two funds. Under the teaching assumption that disclosure periods, denominators, asset coverage, and weight meanings are comparable:

**40% × 8% + 20% × 12% = 5.6%**

Given those inputs, the observed X holdings in A and B contribute a combined 5.6% exposure to the portfolio. This is not the overall overlap rate between the two funds. Nor is it necessarily X's final exposure across the whole portfolio: other assets or undisclosed positions may contribute more.

If one weight uses fund net assets and the other uses equity assets, they cannot simply be added. When disclosure dates differ, use comparable material or identify the result as an estimate from different disclosures—not as an exact current holding.

Financial data involves at least three times: when something happened, when it was disclosed, and when the system retrieved it. Reading an old report today does not make its positions current. Reviewing a past decision must not use information that was unavailable then to supply a retrospective rationale.

### Before simulating a change, establish where the money comes from

Researching a new fund C raises another easily overlooked question: is the user adding money or reallocating existing assets? The denominators differ. A new percentage cannot simply be added to the old allocation.

Use simplified units. A portfolio totals 100. Moving 20 from existing cash into C leaves the total at 100, so C represents 20%. Keeping the existing portfolio and adding 20 of new money raises the total to 120; C is approximately 16.7%, and the old asset weights also change. This teaching calculation ignores fees and price changes; it is not an operation recommendation.

Likewise, a portfolio rising from 100 to 110 has not necessarily earned 10% if money was contributed in between. A fee estimate cannot take a rate and ignore share class, holding period, or charging conditions. Many financial errors concern what is being calculated, not the ability to multiply or divide.

### Share-class fees and distributions: product rules change the answer

If a user plans to hold a fund's A or C share class for eighteen months, which has lower total cost? “A is for long-term holders and C is for short-term holders” is not a calculation rule. Identify the exact share class, sales channel, discount, holding period and applicable terms, then compare using deterministic methods. The [CSRC's revised fund sales fee provisions](https://www.csrc.gov.cn/csrc/c101954/c7606091/content.shtml), issued December 31, 2025 and effective January 1, 2026, end sales service fees on non-money-market fund shares held longer than one year. Product contracts, effective dates and transitional arrangements still need checking; a regulation summary is not a fund-specific quote.

The holding period does not necessarily begin when a subscription button is pressed. The [Shenzhen CSRC explains](https://www.csrc.gov.cn/shenzhen/c105614/c7602071/content.shtml) that fund holding duration generally follows the **subscription and redemption confirmation dates**. Confirmation is commonly T+1, but special products can take longer. After a fund [distribution](https://investor.amac.org.cn/community/tzzhdzthd/ylj/202307/t20230706_14858.html), per-share NAV generally falls correspondingly, while cash distributions or reinvestment change the investor's cash or unit holdings. Comparing two displayed NAV points alone does not establish the investor's actual return.


### Accurate code still needs correct interpretation

Amounts and fees need explicit precision, rounding, and accounting treatment. Performance analysis must identify whether distributions are included. Risk scenarios must state their assumptions. Reusable calculation tools reduce duplicate implementations and make independent recomputation possible.

Returning a bare number is still insufficient. Method, units, input coverage, and limitations need to reach the subsequent research. A calculation from top-ten holdings must remain a calculation on the disclosed sample. A loss under an assumed shock must remain a scenario, not become a forecast in the report.

Use deterministic methods for important calculations. The [A33 exact Numeric kernel](agent-numeric-kernel-exact-units-rounding.md) handles explicit units, rounding and residuals; it does not select financial formulas or require number-by-number certification of ordinary prose. A failed calculation affects judgments that depend on it; it should not disqualify the entire report from delivery.

### Multiple sources help resolve differences; they are not a quota

If two providers return different performance figures, check share class, period, currency, and return basis first. NAV performance and a distribution-reinvested return can differ without either being wrong. Two matching values may both repeat the same original source; counting links does not establish independence.

A better approach is to use sources appropriate to each important fact and investigate conflicts that could change the conclusion. A clear official fee provision need not trigger repetitive searches to satisfy an “at least two sources” rule. Unresolved differences should remain visible with their implications rather than letting the model select one arbitrarily.

See [Financial Numbers, Dates, and Definitions](031-fintech-data-time-and-reproducible-numbers.md) for data and exact calculations, and [Why Research Reports Can Still Be Wrong After Calling Python](financial-agent-python-result-consumption.md) for result interpretation.

## 5. Multiple Agents and human review: add a new angle of examination

Do not add roles merely to complete an architecture. Looking up a management fee, explaining an indicator, or comparing a page of material usually does not require a bull, a bear, and a judge.

As a task becomes complex, multiple Agents can perform two different kinds of work. One processes material, such as reading two long reports separately. The other tests a hypothesis, such as investigating “the new fund adds diversification” versus “the new fund adds more of the same exposure.”

In our example, a supporting perspective can look for different companies or sectors in C. A challenging perspective can examine overlap, near-term cash needs, and concentration. The synthesis should identify which evidence holds and what new information would change the judgment, not count how many “experts” agree.

### Return the basis, not just an opinion

If a child Agent returns only “overlap is not serious,” the main Agent cannot tell what it examined. A useful handoff identifies the material compared, the method used, the observed facts, unresolved gaps, and the extent of support for the conclusion.

The main Agent must also reconcile apparent disagreement. One assistant may report “high technology exposure” while another reports “different underlying companies.” Both can be true: they address sector concentration and company overlap. Averaging the statements or asking a judge to vote away the difference does not solve it.

Parallelism is not necessarily cheaper either. Task partitioning, material transfer, and synthesis have costs. Collaboration is worthwhile when it contributes an examination that was missing or genuinely distributes independently executable material work.

### Human involvement has different meanings

A user saying “I need money in six months” changes the research conditions. A specialist checking methods and recommendations reviews the research. A business approver authorizing a specific operation permits a controlled effect. One “confirm” button should not blur all three.

A review interface should expose the disputed claim, associated material, calculation assumptions, and differences between revisions. A long report plus an approve button does not necessarily create meaningful review. Conversely, ordinary research should not become unavailable because an optional Reviewer did not run.

For method selection across research perspectives, see [Multiple Investment Perspectives Testing a Thesis](investment-perspectives-and-thesis-falsification.md).

## 6. Safety and usefulness: constrain the actual risk

Suppose A's material has been read but B's full holdings are unavailable. Two extremes both fail: inventing a complete overlap rate, or returning only “insufficient information; cannot analyze.”

A more useful response explains A's concentration, compares the available investment mandates and fees, and identifies what is missing for a full overlap calculation. It neither treats missing data as zero nor erases completed work because part of the question remains unanswered.

We made this adjustment in publication governance: handle a broken citation attachment as an attachment problem, preserve a missing input as a gap in its metric, and do not erase independently delivered content when a later tool fails. **The scope of a restriction should follow the actual dependency, not grant a local problem veto power over the entire research task.**

| Problem | What should be limited | What can continue |
| --- | --- | --- |
| Full holdings are missing | A complete overlap rate and definite conclusions depending on it | Disclosed subsets, product differences, and a gap explanation |
| Two datasets are not directly comparable | Unsupported merging or ranking | Separate presentation and an explanation of the different bases |
| Citation details temporarily cannot open | No fabricated passage or claim of completed verification | Independent prose whose permissions and content identity hold |
| Private material is not authorized | Its access, use, and dependent disclosure | Public research independent of that material |
| A real operation's outcome is unknown | No blind repetition of a potentially monetary effect | Querying the original request, reconciliation, and reporting uncertainty |

### Trustworthy material is not entitled to issue instructions

A research report can be genuine and a page can come from a recognized institution while its text remains research material. A page saying “ignore the original rules” or requesting customer information should not thereby become a system instruction. Suitability as a cited source and authority to change tool permissions are separate questions.

OWASP's discussion of [indirect prompt injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection/) describes the risk of external pages and files influencing model behavior. Besides teaching the model to distinguish material from instructions, applications need programmatic controls over actual access, transmission, and operations. A reminder in a prompt is not enough.

### Exposing less data need not mean helping less

Portfolio research may require position weights without requiring identity-document numbers, bank-card numbers, or the complete account ledger. Controlling scope when reading, passing only necessary material to child tasks, and avoiding indiscriminate copies of private text in diagnostics are more concrete measures than asking the model to “remember to redact” at the end.

A denied private-account read does not automatically prohibit public fund research. Code enforces data and operation boundaries while the model continues within the permitted scope. That combination serves both safety and usefulness.

See [The Independent Answer Publication System](019-agent-answer-publication.md) for local delivery handling, and [Content Trust and Prompt Injection](agent-content-trust-prompt-injection.md) for material versus instructions.

## 7. From reports to business: evidence, delivery, and real operations

The user may see one report, but the system needs to connect three kinds of content: facts supplied by original material, calculations produced by tools, and judgments synthesized by the model. They can appear in the same paragraph without becoming interchangeable.

![Research output and business action are separate. Original material, calculations, and reports can be inspected together; a new operation request enters independent business checks, execution, and actual-result recording.](../../visuals/en/financial-agent-system-panorama/reader-handoff.svg)

[Enlarge the research-to-business handoff](../../visuals/en/financial-agent-system-panorama/reader-handoff.svg)

### Checking one sentence should not require reading a complete run log

For the 5.6% exposure, the inspection path should identify both disclosures, the portfolio weights, the calculation, and its coverage limits. For “adding the fund may not improve diversification,” it must also show which results support the judgment, which assumptions it adds, and what would change it.

This is why a citation should offer more than an external link. Pages change, documents can be long, and table footnotes may determine what a number means. Returning to the actual passage, page, and version used is a more useful basis for inspectable research.

A citation is not a certificate of correctness, however. “The top ten holdings overlap” does not directly establish that “the entire portfolio should be changed.” After locating the evidence, the reader still has to examine whether the interpretation exceeds what it supports. Engineering connects the inspection path; research explains the reasoning. [E04 evidence retention](agent-research-evidence-store-lifecycle.md) provides permissioned request copies and readback; it does not replace original result identity, source eligibility or business facts.

### Generated, saved, and received are different facts

Prose appearing on the page does not prove it was saved. A file generated on the server does not prove the user can open it. A later failed call does not mean content already received should disappear.

Delivery should identify the current facts: which content was saved, which file is available, and what remains incomplete. Preserve visible content and report a persistence problem when saving fails. Identify an unavailable file as a file problem instead of covering the entire research task with an ambiguous “failed” status.

Users may not care how many stages the call chain has. They do care whether today's conclusion can be found tomorrow, whether citations correspond to the original material, and whether the file is actually available.

### Reading a report does not automatically enter a trading workflow

Read-only research can end with report delivery. A specific user operation request starts a separate business process: establish the exact plan, account, product, and amount; apply relevant permission, risk, and approval rules; then have the business system execute and retain its actual outcome.

“Agree with the analysis,” “order submitted,” “partially filled,” and “fully filled” are different facts. Confirmation should refer to a specific operation version. A changed plan or amount should not continue borrowing the earlier confirmation. When the result is unknown, query and reconcile the original request rather than place another order to finish the conversation quickly.

Review records therefore need to explain who proposed what, which material informed it, which operation version was approved, and what actually happened. This does not depend on obtaining all hidden model reasoning or regenerating an identical answer. Formal institutional audit also needs its own record-integrity, access, and retention arrangements; ordinary conversation logs do not automatically provide them.

### Financial-institution responsibility cannot be outsourced to the model

For applicable mainland Chinese securities and fund operators, Articles 43–44 of the [CSRC's information-technology management rules](https://www.csrc.gov.cn/csrc/c106256/c1653896/content.shtml) state that outsourced technology services do not remove the operator's legal responsibility. Important systems must remain under its control, with plans for changing service providers. As an engineering implication, a model's research conclusion or conversational acknowledgment must not replace the original business system's account checks, suitability requirements, approval and actual-outcome records. This is a **mapping from regulatory responsibilities to system design**, not a claim that the rules prescribe Agent module names or that ETF Agent can trade.


See [A Trustworthy Evidence Chain for Financial Agents (Chinese original)](../../articles/financial-agent-trustworthy-evidence-chain.md) and [Why Answers with Many Citations Can Still Be Unreliable](ai-citations-do-not-prove-reliability.md).

## 8. From one answer to ongoing research: retain the rationale, not only the conclusion

A month later, the user asks, “What about now?” If the system remembers only that it previously said “overlap is high,” it may repeat an old conclusion or invent an earlier rationale from today's market information.

Ongoing research should retain the original objects, material, assumptions, conclusion, and conditions for changing the judgment. An earlier conclusion might be “C does not currently add clearly different company exposure.” A change in C's index, a reduced position in A, or a new complete disclosure may all justify another analysis.

### Keep three kinds of information separate

User preferences can be relatively stable—for example, wanting the conclusion first or preferring low-cost products—but remain editable. Holdings change with transactions and prices and must be read from current permitted data. Research judgments belong to a particular analysis, with their own dates, basis, and conditions.

Putting all three in a continually overwritten “user profile” invites mistakes. Having owned technology funds does not establish a confirmed long-term preference for high risk. A model's earlier suggestion to watch an indicator does not mean the user agreed to act on it.

When the user says, “This is only a temporary allocation,” preserve that correction and let later research use the new condition. Do not silently rewrite the old report to make it appear to have known all along. Historical records support comparison of changing judgments, not proof that every judgment was right.

### Scheduled research should not merely rewrite the report on schedule

A weekly review's valuable question is, “What has changed since last time that deserves a new judgment?” It can examine allocation, product terms, important disclosures, and the user's funding plans instead of reintroducing the same funds in new prose every week.

Without new material facts, it can say that no basis for revising the earlier judgment has yet appeared. That is not proof that risk is absent. When an important change occurs, explain which earlier assumption it affects rather than appending a news item to the report.

Reopening an old report and continuing unfinished research also need to remain separate. One reads an existing result; the other may create new tool calls, cost, and data use. Opening history must not silently authorize execution or upgrade old material into current facts.

These designs create the possibility of an ongoing research assistant, but long-term judgment quality still needs real evaluation. For the mechanisms and examples, see [Does the Agent Remember Why It Reached Last Week's Conclusion?](agent-weekly-thesis-history-continuous-research.md).

## 9. How to tell whether the system improved: count errors and useful delivery

Readable sources, successful Python execution, and persisted reports all deserve testing. Together, they still do not automatically establish that the user's question was solved. For “does the new fund improve diversification?”, listing three product profiles or producing a long report is insufficient.

The research should identify the compared objects, known changes, important gaps, and conditions that would change the conclusion. Evaluate complementary perspectives rather than using one total score to decide whether the answer can appear.

| Evaluation perspective | What actually matters | A tempting but inadequate substitute |
| --- | --- | --- |
| Execution and delivery | Connected materials, calculations, prose, files, and history | A successful model API response |
| Financial research | Appropriate objects, dates, methods, numbers, and interpretation | Python was called; citations are plentiful |
| User value | The original question was answered; less work remains for the user | Long prose, many roles, a complete-looking template |
| Safety and cost | No unauthorized effects; further research and review are worthwhile | More refusals mean more safety; longer runs mean deeper research |

### Good tests include cases that should not be refused

Test complete-data cases, but also partial holdings, mismatched disclosure periods, a failed calculation, and interrupted file persistence. The desired behavior is not universal refusal. It is retaining correct parts, not inventing unknowns, and not spreading a safety restriction to unrelated content.

Without B's full holdings, does the report qualify its overlap conclusion while retaining comparisons of fees and mandate? If one citation detail is damaged, is only that inspection path affected? These cases expose product harm from excessive control.

Failed attempts must remain in the record. Counting only completed reports hides how many blank responses, timeouts, and repeated questions users experienced. Quality and delivery deserve separate observations: a delivered answer can be wrong, and an undelivered answer is not successful merely because it contains no incorrect claims.

### Repair the stage that actually failed

The same wrong conclusion could result from missing data, a misread date, an incorrect formula, a result that never reached the model, or a reversed final interpretation. Repairs to retrieval, algorithms, result transfer, and model guidance address different causes.

Turn real mistakes into small inspectable cases: the original question, its inputs, the unsupported sentence, and the independently established expectation. Reuse these cases when changing models, prompts, or methods, then add variants not used during debugging to see whether the improvement only fits the original question.

A model Reviewer can supply another opinion. “No issue found” must not automatically become correctness certification. User acceptance, professional review, and model evaluation should remain distinct. The goal is an accumulation of facts that guides the next repair, not a polished scorecard every round.

## 10. Adoption: finish one useful research task before expanding business effects

A panorama is not a purchasing checklist. Teams do not need long-term memory, multiple Agents, an audit platform, and trading systems before testing value. Start with a concrete task whose material can be obtained, method explained, and output checked.

Fund comparison is one candidate. Establish share classes and periods, obtain the necessary material, perform relevant analyses, and let the user receive and question the report. If full-holdings retrieval is the bottleneck, fix that. If the bottleneck is interpretation, improve method use and explanation. Adding more roles does not replace diagnosis.

### From read-only research to employee collaboration and controlled operations

Read-only work first connects material, calculation, and delivery. Employee collaboration then adds role-specific access, professional opinions, revisions, and handoffs. Only when real business handling is required should the system connect further to existing customer, product, risk, approval, order, and outcome systems.

Institutional adoption also needs people to maintain product facts, resolve professional disagreements, handle exceptions, and decide when a human takes over. This is not about adding approval stamps to every report. It is about identifying who handles which kind of problem. If an employee must look up every number again after receiving the report, impressive tool activity may save little work.

The first two stages can create value independently of automated trading. Conversely, connecting an order API does not mean the third stage is ready. Expand capability with explicit business objectives and consequences the organization can handle, not with the number of boxes in an architecture diagram.

### Tie investment to the help actually delivered

Cost includes data access, waiting, specialist review, operations, and repeated requests for user information—not only model calls. Compare what similar tasks actually accomplish and how much manual intervention remains, rather than looking only at price per request.

Use simple paths for simple questions and greater depth for important disputed ones. Keep complexity where it is needed. Frameworks, models, and providers can change, but important material, methods, report versions, and unresolved business records should remain understandable and retrievable under the relevant permissions.

For a research practice such as ETF Agent, existing citation, calculation, and delivery mechanisms are a foundation. The more valuable next investment is making them work together consistently on real questions, not adding another universal module to issue the final verdict on every answer.

## Conclusion: depth lies in connecting the work

Return to the opening question. The user needs more than three fund descriptions. They need to understand which known exposures change, which risks remain, which material is missing, and what they still need to clarify.

Models, tools, and business systems must cooperate. Disagreements require research; operations require authorization. Every part matters, but none can declare the whole system successful on its own.

**Give research room to explore, control permissions and real operations, and deliver known results, important gaps, and the reasons behind the judgment together.** That complete path is where a financial Agent's value should be tested.

---

## Continue reading

This article follows one research task to connect the system. For implementation detail, continue with [the six-layer request panorama](017-prompt-to-answer-six-layer-panorama-v3.md), [financial evidence chains (Chinese original)](../../articles/financial-agent-trustworthy-evidence-chain.md), and [cross-period research](agent-weekly-thesis-history-continuous-research.md). The original [detailed system map](../../visuals/en/financial-agent-system-panorama/system-map.svg), [dual-lifecycle diagram](../../visuals/en/financial-agent-system-panorama/lifecycle.svg), and [evidence map](../../visuals/en/financial-agent-system-panorama/evidence-map.svg) remain technical references. Orange dashed elements denote institutional targets, not live trading capabilities. The [original technical edition](https://github.com/hpoenixf/eff-agent-article/blob/9d46273da85bddaa6c5c432581c916496edd9cc1/en/articles/financial-agent-system-panorama.md) retains interface examples and extended discussion.

[Financial technology topic](https://hpoenixf.com/eff-agent-article/en/fintech) · [中文版](https://hpoenixf.com/eff-agent-article/articles/financial-agent-system-panorama) · [GitHub](https://github.com/hpoenixf/eff-agent-article)
