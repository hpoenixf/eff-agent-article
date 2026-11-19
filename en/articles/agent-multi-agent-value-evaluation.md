---
title: "Is Multi-Agent Collaboration Worth Enabling? Measuring Dispatch, Delivery and Outcomes"
date: 2026-11-17
description: "Compare answer scores, elapsed time and tokens across 100 actual delegations, then look at where fee calculations, statistical checks and incident timelines improved or broke down."
readingBrief:
  takeaways:
    - "Across 100 actual delegations, runs took about 141 seconds longer on average and used 147.5% more known tokens. Mean scores were lower in both rounds."
    - "Four original runs delegated after the main agent had usable sources. They scored 1.25 points higher on average, with about 42.6% more model calls."
    - "Across the 19 pairs where Reviewer advice reached the main agent, the mean score was 13.21 versus 13.68, and runs ended 48.21 seconds later on average."
  appliesTo:
    - "Teams deciding whether to enable subagents or an automatic Reviewer while comparing answer quality with resource use."
  notFor:
    - "A general ranking of multi-agent frameworks or models; this is a bounded study of ten synthetic cases on a fixed model and version."
---

# Is Multi-Agent Collaboration Worth Enabling? Measuring Dispatch, Delivery and Outcomes

On the same question, does the answer improve when the main agent actually delegates? On November 16–17, 2026, we compared **100 runs that launched a subagent** with their matched runs without one. We separately compared **19 runs that received Reviewer advice** with their matches. **The runs that delegated took about 141 seconds longer on average and used 2.47 times as many known tokens. Mean scores were lower in both rounds.** The individual cases show where delegation helped: the sources were readable and the review task was specific.

## The 100 runs that actually launched a subagent

In the first round, the main agent chose to launch a subagent in 13 runs. We reran the 87 other question-repeat instances with an explicit instruction to delegate. All 87 actually launched a subagent. Each run is matched to the same question and repeat number in a run without a subagent.

| How the subagent was launched | Pairs (valid scores) | Mean with launch / 16 | Mean without launch / 16 | Score difference | Wins / ties / losses |
| --- | ---: | ---: | ---: | ---: | ---: |
| Main agent chose to delegate | 13 (13) | 11.08 | 13.92 | −2.85 | 6 / 1 / 6 |
| Rerun with explicit delegation | 87 (86) | 14.83 | 15.24 | −0.42 | 29 / 30 / 27 |

For each rerun, the evaluator scored all three answers together. The no-launch column uses the matched run with subagents disabled. The original answer from the run that chose to work alone also took part in this assessment. It averaged **15.16**, or **0.34 points** higher than the rerun that delegated. One rerun pair had no valid score. It is still included in elapsed time and usage for all 87 pairs.

The study used ten frozen synthetic document tasks, each repeated ten times. The model evaluator saw the question, sources and anonymized answers. It graded correctness, coverage, limitations and completion for a total of 16 points. Scores are shown by grading round.

### How much extra time and how many extra tokens?

| Matched pairs | Mean run-end time (with / without) | Known input + output tokens (with / without) | Research model calls (with / without) |
| --- | ---: | ---: | ---: |
| 13 original delegations | 478.98 / 336.36 s (+42.4%) | 8.57 / 3.28 million (+161.1%) | 521 / 188 |
| 87 explicitly delegated reruns | 328.10 / 187.74 s (+74.8%) | 30.98 / 12.70 million (+144.0%) | 2,002 / 923 |
| **All 100 pairs** | **347.71 / 207.06 s (+67.9%)** | **39.54 / 15.98 million (+147.5%)** | **2,523 / 1,111** |

Elapsed time runs from research start to termination, including queues and abnormal outcomes. Token totals use the reported input and output usage. One call on the rerun side lacked a usage receipt. About **92.5%** of the additional reported tokens were input tokens. Of the **1,412** extra model calls, subagents made **924** and the main agent and entry stage made the other **488**.

The run with a subagent took longer in **92 pairs**. Of the 99 pairs with valid scores, **59** scored the same or lower while taking longer and using more known tokens. The delegated side scored higher in **35 pairs**, and took longer in **32** of them. Only **two pairs** combined a higher score, a shorter run and fewer tokens.

## When did scores rise, and when did they fall?

### The sources were readable and the subagent had a specific calculation to check

The 13 original delegations can be grouped by whether the main agent had usable source text before its first delegation.

| Source state when the main agent delegated | Pairs | Mean with / without launch | Difference | Wins / ties / losses | Change in known tokens |
| --- | ---: | ---: | ---: | ---: | ---: |
| Five sources read, delegated a calculation or statistical check | 4 | 15.75 / 14.50 | **+1.25** | 4 / 0 / 0 | +12.7% |
| Delegated before reading usable text | 9 | 9.00 / 13.67 | **−4.67** | 2 / 1 / 6 | +256.9% |

In one statistical audit (N07-R05), the main agent initially got the effect of missing data on sample size backwards. The subagent recalculated it using each group's own missing-data rate and returned **394 and 373, for a total of 767**. The main agent used the figures and corrected its explanation in the final answer. The score was **16 versus 15**, with **25 versus 12** model calls. This pair shows a specific correction and the extra work that came with it.

In the reruns, the same statistical audit had **three wins and three ties across six pairs**. A fee comparison had **four wins and five ties across nine pairs**. In one fee pair, the scores were **16 versus 13**. Both answers calculated a crossover of about **438 days**. The higher-scoring answer explained that it depended on flat net asset values and service fees continuing beyond the first year. The original main-agent-only answer also scored **16** in the same assessment. A single agent had already reached that quality on this case.

### The main agent was stuck and the subagent inherited the same reading problem

In the nine original runs in this group, the main agent had already made **11–20 requests** before delegating. Some subagents hit the same locator and reading errors. On one portfolio concentration case (N03-R08), two subagents reported that they could not read the material, and the main agent included the diagnosis in its answer, which scored **4**. Its match read the documents and calculated the concentration and stress losses, scoring **16**. The handoff delivered a diagnosis. The requested calculations were still missing.

In the reruns, the largest losses concentrated in two tasks that required reconstructing facts from multiple records.

| Rerun task | Valid pairs | Mean with / without delegation | Difference | Wins / ties / losses |
| --- | ---: | ---: | ---: | ---: |
| Multi-source incident timeline | 6 | 8.33 / 15.17 | **−6.83** | 2 / 0 / 4 |
| Investor total return and execution history | 9 | 13.89 / 15.22 | **−1.33** | 3 / 1 / 5 |

One incident-timeline pair scored **1 versus 16**. The delegated answer confirmed a reading problem and omitted the incident impact, recovery time and request outcome. The matched answer used timestamps, health checks and provider records to distinguish service recovery from request completion. On one total-return pair, the scores were **2 versus 14**. The delegated answer gave a general framework and left the two share-class returns uncalculated. These two tasks together lost **53 points**, while the other 71 scored rerun pairs gained **17 points**. That explains how **29 wins and 27 losses** still produced a mean drop of **0.42 points**. The largest gaps came from answers that missed substantial parts of the task.

## The 19 runs that actually received Reviewer advice

The Reviewer checks existing research for omissions, conflicts and weak assumptions. In 19 runs, Reviewer advice was confirmed in a later main-agent input. The comparison uses the answer from the same question and repeat number without a Reviewer.

| Metric | Advice received | Matched run without Reviewer | Difference |
| --- | ---: | ---: | ---: |
| Mean score out of 16 | 13.21 | 13.68 | −0.47 |
| Mean run-end time | 306.59 s | 258.38 s | +48.21 s (+18.7%) |
| Total research model calls | 477 | 246 | +231 |
| Known input + output tokens | 6.45 million | 3.91 million | +65.0% |

Across these 19 pairs, the advice-receiving side had **4 wins, 7 ties and 8 losses**. Four model calls on that side lacked usage receipts.

On a question about earnings excluding non-recurring items, the answer that received advice scored **15**, versus **12** for its match. It distinguished the earnings definitions more clearly and flagged a breakdown that the sources did not provide. On a timeline question, the answer that received advice covered only one of five sources and scored **9**, versus **16** for its match.

## Before adding another agent, specify what it should change

These runs offer two design leads. When the evidence is already available, delegate the verification of a particular claim. When the task is stuck at source discovery, restoring access is usually more relevant, especially for a timeline that depends on joining several records. The groups here were identified from the run records and show where the gains and losses occurred.

Task differences matter. In [How we built our multi-agent research system](https://www.anthropic.com/research/multi-agent-research-system), Anthropic connects multi-agent benefits with independent directions that can be explored in parallel, while discussing additional token consumption and the limitations imposed by shared context and task dependencies. Its internal tasks, model mix and evaluation differ from ours, so the results cannot be compared directly. The useful question remains: does the task need broader exploration, or more accurate reading of materials already available?

Based on these observations, I would make delegation more specific.

If the main agent already has materials and needs to check fee conditions, recompute figures or find a counterexample to a claim, give the Child a defined verification target and a checkable result. A generic request to “look for any problems” makes it difficult to distinguish a filled evidence gap from a restatement of existing conclusions.

If the main agent is stuck at the source entry point, inspect actual navigation and read receipts first. A Child may help locate the material, but observe whether it obtains useful new evidence. Passing the task along does not establish that the original blockage is resolved.

Following the actual requests later exposed a break in the document-reading path. The system knew the file location, but the model's index omitted it. The single-segment navigation path has been repaired. Its effect on live answers is still to be measured. [The File Is Right There. Why Can't the Agent Read It?](agent-document-navigation-after-empty-search.md)

When evaluating a Reviewer, check whether its advice reached the main agent, then compare what each final answer actually covered. In the two cases above, the differences were visible in how the answers handled earnings definitions and source coverage.

**Launching a specialist establishes collaboration capability. Whether it is worth enabling depends on new evidence, independent verification or useful counterevidence reaching the main agent and improving an outcome that matters.** Time, tokens and unknown charges belong in that decision too.

Before adding the next role, choose a consequential conclusion you want it to improve. Trace the actual input, the child's findings and the final answer, then compare with the role disabled. That is how to find whom the extra collaboration helped, where it helped and whether that help was worth the cost.

Further reading: [Independent subagent contexts and handoffs](agent-subagent-context-specialization.md) · [Checking whether specialist findings were used](agent-subagent-contribution-evidence.md) · [Expert, Subagent, Review and Judge](agent-expert-subagent-review-judge.md) · [Attributing the cost of a report](agent-report-cost-attribution.md)

More engineering notes are available in the [ETF Agent article collection](https://github.com/hpoenixf/eff-agent-article). If this article helped, consider giving the collection a Star.
