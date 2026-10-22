---
title: "When an AI Says What to Buy: The Boundary Between Research, Investment Advice and Trading"
description: "Data authorization, financial calculation and externally effective actions require distinct business and technical controls."
---

# When AI Starts Saying “What to Buy,” How Far Is a Research Assistant from Investment Advice and Trading?

> **Reading note:** This is a discussion of product and engineering boundaries, not legal advice, securities investment advice or a representation of financial-services licensing. Applicable rules depend on current official regulations, the entity concerned and its jurisdiction.
>
> **Series:** Fintech and Compliance (primary theme), with architectural implications.

Asking an agent to look up fund information and asking it to decide which fund a user should buy might look like a single prompt change: “Make a recommendation from these sources.” Architecturally, though, the difference is not tone. It is **the service promise, the authorized subject, responsibility for facts, and who may produce an actual economic effect**.

While developing a personal ETF research assistant, we repeatedly encountered the ambiguous phrase *helping investment decisions*. It can mean explaining the differences between public indexes or finding overlapping portfolio exposures. It can also mean making a personalized recommendation about a security, quantity and action—or sending an order. Collapsing all these activities into one “investment analysis” tool leaves the product's actual service unclear, regardless of how fluent the model sounds.

## 1. Similar Questions Can Require Very Different Permissions

Consider three requests.

“How are the CSI 300 and CSI 500 indexes constructed differently?” This is generally explainable using approved public sources.

“Compare the risks of two allocations given my holdings and time horizon.” This needs authorization to use current personal holdings and investment goals, along with explicit dates, assumptions and limitations in the result.

“Buy according to that plan on my behalf.” This requests a change to the state of an external financial account. Research permission, a statement of buying intent, and the existence of a trading API do not individually grant execution authority.

In ETF Agent, we separated the action a model *understands* from what the Host *admits*. Native research does not inherently authorize trades. The design described here is a **read-only research-system choice**, not evidence of a securities advisory license, and not proof that adding a disclaimer makes personalized recommendations legally acceptable.

## 2. The Legal Boundary Cannot Be Guessed from Keywords

The China Securities Regulatory Commission's [Interim Provisions on Securities Investment Advisory Business](https://www.csrc.gov.cn/csrc/c101838/c1022038/content.shtml), effective from 2011, address securities investment advisory business. The [Measures for the Administration of Suitability of Securities and Futures Investors](https://www.csrc.gov.cn/csrc/c106256/c1653849/content.shtml) impose obligations on covered operators supplying securities/futures products or services, including investor understanding, classification of offerings, risk disclosure and suitability matching.

**Who and what a rule applies to matters.** Not every public financial knowledge answer automatically constitutes regulated securities advisory business; it also does not follow that every AI output must be referred to a human. The provider's status, content of the service, business model, jurisdiction and specific regulatory framework all matter. Business and legal teams must assess the applicable classification.

A production system should define the product's permitted services first and implement the corresponding admission flows. The model must not bypass those flows by inferring that the user is “just chatting.” Equally, a handful of regular expressions containing “buy” or “return” should not indiscriminately reject legitimate financial education questions.

## 3. From Financial Facts to External Action: At Least Three Separate Decisions

A reasonable research pathway can be decomposed as follows:

~~~mermaid
flowchart TD
  Q["User request"] --> S["Define research scope"]
  S --> R["Authorize public sources and portfolio reads"]
  R --> C["Calculate exposures and state assumptions"]
  C --> P["Publish analysis within research scope"]
  P --> B{"Separate business and action authorization?"}
  B -- "Not authorized" --> N["Stop at analysis; no external effect"]
  B -- "Independently authorized" --> A["External action under separate contract"]
~~~

**First: data admission.** Which public files can be read? Is private portfolio access authorized for this user? Is the data fresh? A model may propose queries, but saying “I have permission” does not create permission.

**Second: interpretation and computation.** Portfolio look-through exposures, fees, daily returns and drawdowns need an explicit data window and calculation method. Deterministic calculation can reduce particular numerical errors, but it cannot decide an appropriate allocation on the user's behalf.

**Third: the action boundary.** Research text, general risk warnings, personalized investment advice and actual order execution do not inherit the same approval and confirmation just because they use the same report. Activities requiring distinct qualifications or higher authorization must pass through a separate business contract. If the system has no such authorized action, its model-facing tool surface must not pretend one exists.

The final “external action” node is a **conceptual boundary**, not evidence that today's ETF Agent can place trades.

## 4. Compliance Must Not Make Every Useful Answer Disappear

If a user asks about a public fund metric and authorization for private data fails, the public explanation need not stop. If one source's eligibility is unknown, that should not automatically mean the model cannot answer anything. Through repeated work on publication and authorization, we learned to apply restrictions along actual data dependencies and action types rather than letting one rejection erase an entire research task.

There are risks in both directions. A permissive system may dress unsupported, ineligible or unauthorized claims as professional advice. An excessively restrictive one may emit only empty disclaimer templates, withholding otherwise legitimate and useful factual explanations.

Real runs have still shown incomplete research evidence, incomplete numerical reasoning, and citations not consistently matched claim by claim. We can deliver the verified parts alongside known gaps. We cannot claim that rejecting uncertain facts improved investment returns.

## 5. Regulatory Entities and Engineering Practices Are Different Things

On June 18, 2026, China's National Financial Regulatory Administration published its [Guiding Opinions on the Secure Development and Application of AI in Banking and Insurance](https://www.nfra.gov.cn/cn/view/pages/ItemDetail.html?docId=1261784&generaltype=1&itemId=4216). These emphasize user-side responsibility and risk-tiered governance for the banks, insurers and other entities within their stated scope. They cannot automatically replace rules for the securities industry. Lessons may transfer technically without making all financial institutions subject to identical legal duties.

What engineers can establish is an **auditable business-capability boundary**: who the user is; what data is accessed; which assumptions the output declares; whether a side effect occurred; and when another regulated business process is required. The model proposes. The product contract authorizes. External actions require independently verifiable consent and execution facts.

For a personal research agent, saying “we currently provide research, not trades on your behalf” is not a weakness. It aligns what is promised with what is actually available. For teams expanding toward advisory or execution, the same line reveals why adding a buy/sell tool is insufficient: product, compliance and execution responsibility must be redesigned first.
