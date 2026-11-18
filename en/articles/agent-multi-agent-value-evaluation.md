---
title: "Is Multi-Agent Collaboration Worth Enabling? Measuring Dispatch, Delivery and Outcomes"
date: 2026-11-17
description: "A 100-pair comparison, 87 explicitly delegated runs and a separate 30-pair Reviewer study distinguish collaboration activity from answer improvements, while accounting for delivery, elapsed time and resource use."
readingBrief:
  takeaways:
    - "To evaluate enabling multi-agent collaboration by default, retain every ON/OFF case, then use actual dispatch and delivery records to explain the outcomes."
    - "Explicit delegation can increase invocation without resolving shared source-access difficulties; adopting a failure diagnosis does not complete the original task."
    - "Reviewer advice reaching the main agent's input still requires checking which judgment changed and whether the answer justified the additional resources."
    - "Record answer delivery, root-run termination and final background-request usage separately; unknown charges are not zero."
  appliesTo:
    - "Teams deciding whether to enable subagents or an automatic Reviewer while comparing answer quality with resource use."
  notFor:
    - "A general ranking of multi-agent frameworks or models; this is a bounded study of ten synthetic cases on a fixed model and version."
---

# Is Multi-Agent Collaboration Worth Enabling? Measuring Dispatch, Delivery and Outcomes

Adding a specialist and a Reviewer to a main agent sounds reassuring: one agent researches, another independently checks, and the main agent synthesizes. After the work runs, a practical question remains: what did the additional activity improve?

On November 16–17, 2026, we first compared ordinary subagents enabled versus disabled across 100 pairs. We then tested explicit delegation and ran a separate 30-pair automatic Reviewer comparison. The aggregate results showed no average scoring gain while calls and resource use increased. We also retained local positive examples worth investigating further.

The useful unit of analysis became a complete value chain: **did collaboration happen, what came back, did the main agent use it, did the answer improve, and what did it cost?** Launching a role answers only an early part of that chain.

## Start with the whole system: did enabling subagents improve answers?

The first experiment compared two product policies:

- **ON:** the main agent could choose whether to launch an ordinary subagent, or Child.
- **OFF:** ordinary Child execution was disabled, leaving the main agent to handle the task.

Reviewer was disabled in both arms. Model, fixed production source, questions, materials and resource rules were held constant. An ON run that did not delegate remained in the sample. This corresponds to a real product decision: what happens overall when this capability is available by default?

Ten synthetic source-based questions were repeated ten pairs each, producing 200 research runs. Tasks included fee calculations, statistical checks, cross-source reconciliation and event timelines. Materials were frozen; research used a real model and the existing runtime. Calls went through OpenCode Go, with the returned model alias `deepseek-v4.1-flash`.

For scoring, the paired answers were randomly labeled A/B. The evaluator received only the question, frozen sources and answers, and scored correctness, coverage, limitations and completion from 0 to 4 each, for a total of 16. Failed and unfinished cases stayed in the comparison. The evaluator was itself a model: hiding labels did not make its judgments infallible, and collaboration mentioned in an answer could reveal the treatment.

| All 100 pairs | Ordinary Child ON | OFF |
| --- | ---: | ---: |
| Mean score out of 16 | 14.78 | 15.14 |
| Total research model calls | 1,465 | 1,111 |

Enabling ordinary Child execution did not increase the average score, while research calls increased by approximately 31.9%. Calls include the main agent, children, retries and failed attempts.

This measures **the overall behavior of enabling collaboration under the existing configuration**. Both arms retained the same resource rules, but actual total calls and tokens could differ. It does not establish which arrangement is more efficient at an equal total token budget. Ten repeated questions are not one hundred independent questions and do not represent every open-ended research setting.

For the default-enablement decision, however, the result needs explaining: on these tasks, additional consumption did not produce a higher average score.

## Once enabled, how did the main agent actually use it?

Of the 100 ON runs, only 13 physically dispatched a Child, launching 23 child executions in total. The other 87 did not launch a Child.

Those 87 are not invalid multi-agent samples to discard. When the product delegates the choice to the model, non-invocation is part of that policy. Removing them silently changes the question from whether availability helps to how the cases selected for delegation performed.

The circumstances of delegation also differed.

In nine of the 13 invoking runs, the main agent had not obtained a usable source-body read receipt before its first delegation. It had already issued 11–20 model requests, encountered repeated locator or reading difficulties, and then asked a Child for help. Some children encountered similar problems.

An additional execution did not automatically create a usable evidence path. If the difficulty is locating the material correctly, passing the problem along may repeat the attempt to find an entry point. The actual navigation and reading path needs inspection; more specialists do not establish that it works.

The other four delegations happened after the main agent had usable body-read receipts for five sources. Their tasks leaned toward calculation or statistical verification. Relative to their paired OFF runs, these four averaged 1.25 points higher with approximately 42.6% more calls. They offer a specific positive lead: **additional verification may be more useful when materials are available, the subtask is clear and the result can be checked.**

These were small groups formed after execution. The main agent often delegated after encountering difficulties, so invoking and non-invoking runs were not directly comparable. Four positive examples cannot establish a general strategy. Their value is in identifying conditions worth testing next.

## Would explicitly requiring delegation help?

A 13% invocation rate suggests another possible explanation: perhaps collaboration could help, but the main agent was reluctant to use it.

We therefore added an explicit delegation requirement to the 87 question-repeat instances whose original ON run had not launched a Child. We ran them again and retained the original ON and OFF answers. All 87 new runs launched children, producing 109 child executions. This moved the investigation from whether the capability was used to what happened after use.

Quality was compared through a common three-answer blinded assessment within each grading call. There were 86 valid scored instances: the new explicitly delegated answers averaged **14.83**, versus **15.16** for the original non-invoking ON answers. The 87 new research runs used **2,002 model calls**, compared with **944** for the corresponding original ON runs, an increase of approximately 112.1%. Valid grading instances and research-call totals have different denominators.

The original ON mean here comes from the common reassessment in this supplement; it should not be spliced directly into the earlier scoring round. This was also a selected non-invoking subset, with a new instruction compared against historical answers, so it does not identify the independent causal effect of a Child. The observed result is narrower: explicitly requiring delegation increased invocation, without increasing the mean score in this supplement.

The meaning of “adopted” matters. Some children returned a diagnosis of failed source reading, which the main agent incorporated as a limitation in its answer. The handoff happened and the answer honestly described the difficulty, but the requested timeline or numerical reconstruction was still missing.

Adopting a failure diagnosis can be correct behavior without improving completion of the original task. Contribution assessment must continue: which answer claim became more accurate or complete, or which otherwise plausible error was ruled out?

## Reviewer launched and advice arrived. Did the benefit appear?

An ordinary Child handles a local task. A Reviewer checks existing research for omissions, contradictions and weak assumptions. They should not be treated as one intervention.

We ran a separate 30-pair Reviewer experiment: the same ten questions, three pairs each. Ordinary Child execution was hidden in both arms. ON enabled the existing automatic advisory mode; OFF disabled Reviewer. No “please review” instruction was added to the user question, and the main agent was not forced to wait for review.

| Reviewer comparison, 30 pairs | ON | OFF |
| --- | ---: | ---: |
| Mean score out of 16 | 14.10 | 14.43 |
| Mean run-end time, including abnormal outcomes | 250.86 s | 229.25 s |
| Total research model calls | 659 | 350 |
| Known input-plus-output token subtotal | 8,260,489 | 5,351,548 |

The known ON token subtotal was approximately 54.4% higher than OFF. Eleven ON requests additionally lacked final usage receipts and cannot be counted as zero. The percentage describes known subtotals, not an exact total-cost increase; tokens are not a cash invoice either.

Each arm had 28 runs marked complete by the runtime. ON also had two partial runs, while OFF had two failed runs; all were retained in the primary comparison. Among the 27 pairs where both arms completed, ON still scored lower and mean run-end time was approximately 13.2% longer. Timing includes shared-provider queues and evidence writes, rather than pure model inference latency.

The collaboration records were more detailed:

- All 30 ON runs physically launched Reviewer, with 41 child executions in total.
- Twenty-nine executions had final completion evidence.
- Twenty-four complete advice summaries were confirmed in subsequent main-agent inputs, across 19 research runs.

These numbers have different units. Forty-one executions are not 41 research runs; 29 completions are not 29 advice deliveries. Advice reaching an input does not establish that the main agent changed its judgment because of it.

We then compared the 19 advice-receiving ON runs with their own paired OFF runs. ON averaged **13.21**, versus **13.68** for OFF: four wins, seven ties and eight losses, with mean run-end time approximately 18.7% longer.

In these records, missing delivery alone cannot explain the absence of average benefit. The advice-receiving subset also showed no average scoring improvement. But receipt is a post-execution grouping: longer tasks have more opportunity to receive advice, and the question mix differs. Comparing receiving and non-receiving groups directly cannot establish that advice made answers worse.

Local positive examples still deserve attention. On a question involving earnings definitions after excluding non-recurring items, ON scored 15 and OFF 12. The evaluator found that ON distinguished the relevant definitions more clearly and did not treat an unavailable breakdown as known. Reviewer advice did arrive in that run, but this alone cannot attribute the entire score difference to Reviewer.

Conversely, on a timeline question, ON received advice but covered only one of five sources, scoring 9 against OFF's 16. The presence of review did not ensure that the essential materials were fully used.

## The main task ended before all collaboration receipts were final

Another observation was easy to misread: the snapshot saved when the main task ended did not yet contain final status for some Reviewer requests. Independently saved request receipts later recorded failure or timeout.

Eleven requests with missing usage had received HTTP 200, but their streams were subsequently interrupted without final usage. Looking only at the root-run snapshot misses later request status; looking only at HTTP 200 suggests an incorrectly complete success.

Three observations therefore need separate records: when the user receives the answer, when the root run ends, and when already-dispatched background requests obtain final status and usage receipts. These times can coincide, but need not.

This does not imply that every answer should wait for Reviewer. A short main task may already have enough evidence, and waiting for late generic advice may only delay delivery. A better observation method preserves the actual answer-delivery time while continuing to reconcile dispatched requests and charges, retaining unknowns explicitly. Existing records do not identify the precise cause of every stream interruption.

Treating root completion as completion of all collaboration can omit background consumption. Forcing every answer to wait for every Reviewer, merely to produce tidy terminal records, would change the product behavior being measured.

## Before adding another agent, specify what it should change

These results do not negate the value of independent contexts or parallel research. Our experiment used frozen synthetic materials and still encountered navigation and runtime-continuation issues. It did not cover broad web exploration, compare different model combinations or identify the independent causal contribution of each piece of advice.

Task differences matter. In [How we built our multi-agent research system](https://www.anthropic.com/research/multi-agent-research-system), Anthropic connects multi-agent benefits with independent directions that can be explored in parallel, while discussing additional token consumption and the limitations imposed by shared context and task dependencies. Its internal tasks, model mix and evaluation differ from ours, so the results cannot be compared directly. The useful question remains: does the task need broader exploration, or more accurate reading of materials already available?

Based on these observations, I would make delegation more specific.

If the main agent already has materials and needs to check fee conditions, recompute figures or find a counterexample to a claim, give the Child a defined verification target and a checkable result. A generic request to “look for any problems” makes it difficult to distinguish a filled evidence gap from a restatement of existing conclusions.

If the main agent is stuck at the source entry point, inspect actual navigation and read receipts first. A Child may help locate the material, but observe whether it obtains useful new evidence. Passing the task along does not establish that the original blockage is resolved.

If automatic Reviewer is being considered as a default, make all ON/OFF outcomes the primary comparison, then explain them through invocation, delivery and concrete answer changes. Do not select only successful advice-receiving cases, and do not equate a runtime's “complete” label with a well-answered user question.

**Launching a specialist establishes collaboration capability. Whether it is worth enabling depends on new evidence, independent verification or useful counterevidence reaching the main agent and improving an outcome that matters.** Time, tokens and unknown charges belong in that decision too.

Before adding the next role, choose a consequential conclusion you want it to improve. Trace the actual input, the child's findings and the final answer, then compare with the role disabled. That is how to find whom the extra collaboration helped, where it helped and whether that help was worth the cost.

Further reading: [Independent subagent contexts and handoffs](agent-subagent-context-specialization.md) · [Checking whether specialist findings were used](agent-subagent-contribution-evidence.md) · [Expert, Subagent, Review and Judge](agent-expert-subagent-review-judge.md) · [Attributing the cost of a report](agent-report-cost-attribution.md)

More engineering notes are available in the [ETF Agent article collection](https://github.com/hpoenixf/eff-agent-article). If this article helped, consider giving the collection a Star.
