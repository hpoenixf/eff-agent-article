---
title: "Is Multi-Agent Collaboration Worth Enabling? Measuring Dispatch, Delivery and Outcomes"
date: 2026-11-17
description: "Same-question comparisons for 100 runs that actually launched a subagent and 19 runs that received Reviewer advice, with scores, wins and losses, and elapsed time."
readingBrief:
  takeaways:
    - "Ordinary subagents launched in 100 runs. Of these, 99 pairs had valid scores. In both rounds, the runs that launched a subagent scored lower on average than their matched runs without one."
    - "Four original runs delegated after the main agent had usable sources. They scored 1.25 points higher on average, with about 42.6% more model calls."
    - "Across the 19 pairs where Reviewer advice reached the main agent, the mean score was 13.21 versus 13.68, and runs ended 48.21 seconds later on average."
  appliesTo:
    - "Teams deciding whether to enable subagents or an automatic Reviewer while comparing answer quality with resource use."
  notFor:
    - "A general ranking of multi-agent frameworks or models; this is a bounded study of ten synthetic cases on a fixed model and version."
---

# Is Multi-Agent Collaboration Worth Enabling? Measuring Dispatch, Delivery and Outcomes

On the same question, does the answer improve when the main agent actually delegates? On November 16–17, 2026, we compared **100 runs that launched a subagent** with their matched runs without one. We separately compared **19 runs that received Reviewer advice** with their matches. Here are the scores and the additional work.

## The 100 runs that actually launched a subagent

In the first round, the main agent chose to launch a subagent in 13 runs. We reran the 87 other question-repeat instances with an explicit instruction to delegate. All 87 actually launched a subagent. Each run is matched to the same question and repeat number in a run without a subagent.

| How the subagent was launched | Pairs (valid scores) | Mean with launch / 16 | Mean without launch / 16 | Score difference | Wins / ties / losses |
| --- | ---: | ---: | ---: | ---: | ---: |
| Main agent chose to delegate | 13 (13) | 11.08 | 13.92 | −2.85 | 6 / 1 / 6 |
| Rerun with explicit delegation | 87 (86) | 14.83 | 15.24 | −0.42 | 29 / 30 / 27 |

The 100 runs that launched a subagent used **2,523** research model calls, versus **1,111** for the 100 matched runs without one. The first round used 521 versus 188 calls, and the reruns used 2,002 versus 923.

For each rerun, the evaluator scored all three answers together. The no-launch column uses the matched run with subagents disabled. The original answer from the run that chose to work alone also took part in this assessment. It averaged **15.16**, or **0.34 points** higher than the rerun that delegated. One rerun pair had no valid score. Its calls are included in the totals for all 87 pairs.

The study used ten frozen synthetic document tasks, each repeated ten times. The model evaluator saw the question, sources and anonymized answers. It graded correctness, coverage, limitations and completion for a total of 16 points. Scores are shown by grading round.

### Did the main agent read the sources before delegating?

In nine of the 13 first-round runs that delegated, the main agent had yet to read any usable source text. These nine averaged **9.00 versus 13.67**. The main agent had already made 11–20 model requests. Some subagents ran into the same reading problems. They could report where they were blocked, and some answers included that limitation, but the requested timeline or calculation was still missing.

In the other four runs, the main agent read five sources before assigning a calculation or statistical check. Those four averaged **15.75 versus 14.50**, a gain of **1.25 points**, with about **42.6%** more model calls.

## The 19 runs that actually received Reviewer advice

The Reviewer checks existing research for omissions, conflicts and weak assumptions. In 19 runs, Reviewer advice was confirmed in a later main-agent input. The comparison uses the answer from the same question and repeat number without a Reviewer.

| Metric | Advice received | Matched run without Reviewer | Difference |
| --- | ---: | ---: | ---: |
| Mean score out of 16 | 13.21 | 13.68 | −0.47 |
| Mean run-end time | 306.59 s | 258.38 s | +48.21 s (+18.7%) |
| Total research model calls | 477 | 246 | +231 |

Across these 19 pairs, the advice-receiving side had **4 wins, 7 ties and 8 losses**.

On a question about earnings excluding non-recurring items, the answer that received advice scored **15**, versus **12** for its match. It distinguished the earnings definitions more clearly and flagged a breakdown that the sources did not provide. On a timeline question, the answer that received advice covered only one of five sources and scored **9**, versus **16** for its match.

## Before adding another agent, specify what it should change

These results do not negate the value of independent contexts or parallel research. Our experiment used frozen synthetic materials and still encountered navigation and runtime-continuation issues. It did not cover broad web exploration, compare different model combinations or identify the independent causal contribution of each piece of advice.

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
