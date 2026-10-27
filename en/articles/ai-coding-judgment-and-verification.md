# The Expensive Part of AI Coding Is Deciding What Deserves Verification

*From OpenAI's mathematical results to engineering misjudgments in ETF Agent*

**AI coding is making code and candidate answers cheaper. Trustworthy judgment does not grow in direct proportion to generation speed.**

I increasingly see an engineer's most valuable contribution shifting from how to implement a solution to three more important questions:

**Which problems are worth solving? Which assumptions must be verified? What evidence is sufficient to make a decision?**

This does not mean people should inspect every line that AI writes forever. Progress should mean letting machines handle more work that can be checked automatically, while reserving limited professional judgment for the choices that determine a system's value and risk.

Developing ETF Agent over the past two months has made this distinction much more concrete for me.

## 1. When AI Can Produce Answers at Scale, Are We Closer to Being Right?

In October 2026, OpenAI announced a substantial collection of AI-generated mathematical research results.

On October 26, it announced further results concerning the Kakeya conjecture, the Exponential Time Hypothesis (ETH), and quantum field theory. Some proofs had undergone formal checking in Lean, but the results still required further understanding, examination, and assimilation by the research community.

In its [official announcement](https://openai.com/index/building-scientific-understanding-with-academic-communities/), OpenAI described model-generated research manuscripts as **raw research data** and invited external experts to help develop the work.

That description stayed with me.

A mathematician might spend years searching for a proof strategy. AI can now explore many possibilities quickly and even produce sophisticated, complete proofs. Yet producing a proof, checking its formal logic, and establishing that it proves the proposition originally intended remain distinct tasks.

Something similar is happening in software engineering. Coding agents can implement features, propose architectures, add tests, and ask another agent to review the result. Ideas once abandoned because of implementation cost may now have a running prototype within hours.

Does that make sound technical decisions equally easy?

For the past two months, I have been using agents intensively to develop my own ETF Agent. As the system has gained capabilities, a different constraint has become increasingly apparent:

**We have no shortage of implementations. What we increasingly need is the ability to tell whether an apparently correct solution addresses the actual problem.**

The difficult cases are rarely the obvious mistakes. They are plausible conclusions that survive several checks but still do not hold up.

As candidate answers become cheaper, identifying critical assumptions, finding decisive counterexamples, and deciding whether a result deserves adoption become engineering bottlenecks.

## 2. A Completed Investment Report Whose Conclusion Had to Be Withdrawn

On October 26, we completed a real ETF Agent research validation involving background execution, a mid-run user correction, and concurrent conversations. The research finished, unrelated short questions did not interfere with it, and the user's additional requirements reached subsequent model requests.

That was genuine engineering progress.

During human review of the final report, however, we found that the model had inferred the following from the wording of two documents:

**One tracking constraint was twice as strict as the other.**

It sounded professional, perhaps even like the result of a careful comparison. But the original material did not provide sufficiently comparable quantitative evidence to support that ratio.

Two documents describing different constraints do not necessarily support a direct numerical comparison.

We subsequently had the agent reread the primary documents and withdraw the inference. The original report was not silently overwritten; the correction was saved separately.

The model had researched the topic. The code had executed. The report had been completed. The error was **turning descriptions that appeared comparable into a quantitative relationship that had not been established**.

### Finding the Hidden Premise Is the Hard Part

As an illustrative example, suppose one fund document promises strict control of tracking error while another gives a limit on a deviation measure. A model may naturally put the statements side by side and try to determine which fund is managed more strictly.

Someone familiar with the measures would first ask whether they describe the same metric, use the same calculation period, and represent targets or observed results.

Until those premises are established, precise arithmetic cannot establish the comparison.

We encountered a similar problem while developing portfolio weekly reviews: the model compared a subset's return with its percentage-point contribution to the whole portfolio, and sometimes treated the difference as evidence of a data-provider error.

Rather than add a universal financial-language validator, we revised the existing financial research guidance. The model should first check the object, time window, denominator, and method, and only then compare the figures. Where comparability is missing, it may leave the conclusion unknown rather than force an answer.

We observed the intended behavior in a limited set of real-model text cases. We did not treat that as proof that all financial interpretation problems had been solved.

The lesson is straightforward:

**Before checking an AI-generated conclusion's calculation, check whether the premises used to justify the calculation actually hold.**

This is particularly important in fields such as finance, medicine, and law. Sometimes the costly expertise is not recalculating a number. It is knowing that the quantities should never have been compared that way.

## 3. Does Adding Another Reviewer Actually Help?

An intuitive response is to add an independent reviewer: one agent writes the report, another looks for errors, and additional experts examine it from different perspectives.

That can help. But ETF Agent exposed a different failure mode.

On October 18, a controlled integration check of the Research Reviewer showed that the main agent had read the complete material, while the summary passed to the reviewer omitted an important comparison date.

The reviewer had its own context and the ability to read the original result. Yet the handoff called the original-material reader without actually delivering its materialized output to the reviewer. The model still received the incomplete summary.

In other words:

**We had created an apparently independent reviewer without giving it the information required for independent review.**

When both agents rely on the same summary with the same missing condition, agreement does not establish adequate verification.

The fix was narrow: deliver the already-read, authorized material into the reviewer's input, rather than invent another acquisition and validation system. That repaired the material handoff; it did not, by itself, establish better real-world semantic review quality.

It did change the question we asked about verification.

Previously, we might ask:

> Did the reviewer run successfully and produce an opinion?

Now we also ask:

> What did the reviewer actually see? Could it have detected the particular error we were worried about?

Those are different questions.

### Why We Did Not Make Every Research Task Pass a Mandatory Reviewer

On October 21, we also designed post-hoc citation and financial-language review as an independent, on-demand operation.

Ordinary research does not automatically need this additional review. When further examination is warranted, a selected report and its original material can be used to produce a separate review result. The review may identify concerns, but it does not directly modify the original report or automatically gain publishing or investment-decision authority.

There is a practical tradeoff here.

One actual call makes the investment in review more concrete. On October 25, during a controlled collaboration test, an independent reviewer using `deepseek-v4.1-flash` examined a fictional investment claim and identified missing premises in its reasoning about liquidity and tail losses. The reviewer examined only the text of the claim and did not read external material, so this was not verification of real-world investment facts.

The model request used **6,963 input tokens and 5,586 output tokens** and took approximately **51.6 seconds** from request start to completion. The input included 4,096 cache-read tokens; cache-write usage was not fully recorded. The record provides no verifiable charge or pricing basis, so the actual cost remains unknown. The elapsed time for this request is also not the same as the extra wait for the complete report.

One sample shows that review requires additional model usage and time; it does not establish how much an on-demand strategy saves or whether it finds errors as effectively as reviewing every report. High-consequence cases still need appropriate scrutiny. Comparing strategies requires costs, latency, and error detection to be recorded against the same tasks and evaluation criteria.

For a question about a fund's management fee, clear primary material and an explicit field may make several model-review rounds disproportionate. For a comparison of complex investment proposals, where a conclusion could materially affect asset allocation, examining the critical assumptions may justify the additional effort.

More verification is not automatically better. The effort should reflect uncertainty, the cost of being wrong, and the intended use.

**A useful verification system does not demand absolute proof from every ordinary task. It identifies the judgments that deserve additional scrutiny.**

## 4. Not All Verification Should Be Assigned to People

It would be easy to infer a permanent division of labor: AI writes, people verify. I do not agree with that conclusion.

AI and automation can also improve verification itself.

We encountered a concrete example in ETF Agent's financial calculations. For a hypothetical fee, CNY 137 multiplied by 1.5% is exactly CNY 2.055. Under the agreed rounding rule, the result should be CNY 2.06. A controlled test showed that the old floating-point calculation path produced CNY 2.05.

That does not require a financial expert to review every calculation or a smarter language model to adjudicate the amount. It requires an explicit precision and rounding contract, correct decimal handling in the original calculation module, and deterministic tests.

This is fundamentally different from the assertion that one tracking constraint is twice as strict as another. One problem already has a precise mathematical rule; the other requires judgment about whether a comparison is valid at all.

Using a reviewer indiscriminately could waste resources on the first problem without reliably resolving the second.

A better approach is to **automate correctness that can be formalized, while concentrating limited professional judgment on questions that cannot be directly reduced to those rules**.

Nor does this mean financial interpretation belongs exclusively to people forever. Models can already help propose counterexamples, examine documents, and identify inconsistencies. But an opinion is not a proof merely because a model can produce it.

## 5. What Should Engineers and Architects Do Differently?

These experiences have changed where I want code reviews and architecture reviews to begin.

We still need to examine implementation changes and tests. With AI coding, however, we can make an earlier step much clearer.

### First: What Exactly Are We Trying to Establish?

“Improve the reviewer's material handoff” is too broad.

A more useful statement is:

> Before evaluating whether two sources are comparable, the reviewer must actually receive their original comparison dates.

Now the behavior worth checking is explicit. We do not first need dozens of checks or repeated full research runs. A case whose summary omits the date while the original material contains it lets us inspect the actual reviewer input and test the critical assumption directly.

### Next: What Counterexample Would Defeat the Proposal?

This is work that coding agents are well suited to assist with. A person can state the objective; an agent can explore boundary conditions, generate counterexamples, vary inputs, and develop arguments against the proposed design.

For a claim that multiple reviewers improve research reliability, ask:

What happens when every reviewer receives the same erroneous summary? What happens when they cite the same outdated source? When the original material is unavailable, will a reviewer report insufficient evidence or still produce a confident verdict?

These questions are more useful than a general request to consider every possibility. They challenge the premises on which the proposal depends.

### Finally: How Much Evidence Is Enough for This Decision?

Some questions can be resolved by deterministic tests. Others require controlled comparisons with actual models and equivalent inputs. Still others, such as whether investment analysis is sufficient to support an action, depend on business constraints, risks, and accountability.

Those categories should not all use the same verification standard.

The question is what consequences the present decision can create, and whether the evidence is sufficient for those consequences. A low-risk, reversible internal research feature can tolerate bounded uncertainty. Actions affecting money or access permissions still require explicit authorization and execution safeguards; a model saying “verified” cannot replace them.

**Mature engineering judgment does not remove every doubt. It distinguishes the doubts that can be accepted from those that must be resolved before action.**

## 6. Judgment and Verification Capacity Are the Scarce Resources

What interests me most about OpenAI's research announcements is not the number of proofs. It is the need to organize people to understand the results, examine their premises, and turn valuable outputs into usable knowledge.

Software engineering may face a similar shift. Previously, many promising ideas never reached evaluation because implementation was too expensive. Now we can produce candidates quickly, but each may carry undiscovered assumptions and require additional verification.

When production outruns understanding and judgment, increasing code output does not necessarily improve delivery quality proportionately.

The past two months of ETF Agent development made this concrete. A completed financial report required a retraction because its comparison lacked a valid premise. An apparently independent reviewer lacked the original material necessary for meaningful scrutiny. A precision error, by contrast, could be handled by deterministic code once the rule was explicit, without another model-review layer.

These cases point to the same conclusion:

**Not every problem deserves another AI layer, not every error calls for more tests, and not every correctness question requires human judgment.**

The important task is to select an appropriate verification method and match its cost to the importance of the decision.

For engineers and architects, I would emphasize three capabilities.

**First, define what correct means.** Go beyond translating a request into tasks. Identify the business objective, hidden assumptions, and behavior that must be protected. Whether a comparison is legitimate can matter more than whether its arithmetic is right.

**Second, learn how to disprove a weak proposal efficiently.** Instead of repeatedly asking AI for supporting arguments, ask for decisive counterexamples. One example that exposes a critical flaw may be more valuable than many tests that never challenge the central assumption.

**Third, decide where verification effort belongs.** Use deterministic tools where rules are explicit. For complex interpretation, combine original material with independent scrutiny. For high-consequence actions involving money or permissions, preserve authorization, protection, and accountability.

This does not make people AI's permanent final judges. Models, formal methods, and automation can reduce the verification work people must perform directly. But while software serves real users and organizations, someone—or an explicitly accountable mechanism—must decide what to achieve, which risks are acceptable, and when action is justified.

**AI coding lowers the cost of producing proposals. It does not automatically lower the cost of making the wrong decision.**

An engineer's advantage may increasingly lie not in the volume of code personally written, but in turning valuable judgments into precise claims, effective checks, and dependable system capabilities.

Engineering efficiency should not be reduced to code generated, pull requests completed, or tests run per unit of time.

**The better goal is to solve more important problems through less wasted verification, clearer judgment, and better-founded decisions.**

As code and answers become cheaper, the expensive capability is not producing still more answers. It is being able to say:

**What is worth doing, what deserves doubt, and what justifies believing we have done it right?**

That is the direction in which I believe software engineering capability needs to develop in the AI coding era.

---

### Further Reading

- [Code Is Cheaper; Why Are Systems Harder to Evolve?](https://hpoenixf.com/eff-agent-article/en/articles/code-cheaper-systems-harder-to-evolve): the long-term cost of creation, maintenance, and architectural evolution.
- [Why More Citations Do Not Prove Reliability](https://hpoenixf.com/eff-agent-article/en/articles/ai-citations-do-not-prove-reliability): the relationship between material, attribution, and conclusions.
- [Financial Data: Time, Definitions and Reproducibility](https://hpoenixf.com/eff-agent-article/en/articles/031-fintech-data-time-and-reproducible-numbers): financial calculation, methodology, and reproducibility.

More engineering case studies are available in [ETF Agent Engineering Notes](https://github.com/hpoenixf/eff-agent-article). Stars and counterexamples that challenge these judgments are welcome.
