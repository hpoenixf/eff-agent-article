---
title: "RAG Recall Looks Great. Why Doesn't That Prove an Agent Found the Right Financial Evidence?"
description: "A real ETF disclosure investigation shows why synthetic retrieval scores, authorized candidates, model consumption, and supported financial claims need separate evidence."
---

# RAG Recall Looks Great. Why Doesn't That Prove an Agent Found the Right Financial Evidence?

When evaluating retrieval for a financial research agent, I started with a straightforward question: would BM25 find more useful evidence than our existing PostgreSQL full-text retrieval fused with vector search?

The offline numbers looked impressive almost immediately. But once I checked the results against an actual ETF announcement, a more important question emerged: **What exactly does a top-ranked passage support, and did it ever reach the model's research process?**

Retrieval ranking, model consumption, answer citations, and financial judgment are four different handoffs. Treating a good score at one handoff as the success of the entire system ends RAG evaluation too early.

## 1. Why an Almost-Perfect Offline Score Did Not Settle the Architecture Decision

Our first comparison used 12 fixed questions and 48 synthetic passages. Both retrieval methods received the same candidate set. For each question, we constructed two positive relevance labels and two negative labels; the other **44 candidates remained explicitly unjudged**.

The test-only BM25 method performed very well on those constructed positives, reaching a judged-positive Recall@10 of 1. On that synthetic text, the PostgreSQL lexical channel returned no matching candidates, and the fused output performed worse against the constructed labels.

That might look like an obvious signal to switch algorithms. But it leaves at least three questions unanswered.

First, the positive examples were written for these questions. Finding them demonstrates that the method works on this text and tokenization scheme. It does not establish that it will find the right evidence in complicated fund disclosures.

Second, we cannot treat 44 unjudged candidates as irrelevant. The result describes retrieval of **judged positives**, not complete recall across the corpus. This is a known problem in information retrieval evaluation; [Buckley and Voorhees's NIST paper on incomplete relevance judgments](https://www.nist.gov/publications/retrieval-evaluation-incomplete-information) discusses why incomplete labeling changes what an evaluation can support.

Finally, even a fair candidate comparison cannot tell us whether the model will request, understand, and correctly use the retrieved evidence.

Our decision at that point was therefore not "BM25 wins; replace production retrieval." It was **to retain the existing retrieval path until a real-document experiment could establish an actual benefit**.

A subsequent, separate engineering change did introduce a conditional BM25 lexical path. Where PostgreSQL has the ParadeDB `pg_search` extension and a BM25 index, it can use BM25 for lexical candidates; otherwise it explicitly falls back to the existing full-text search. Vector retrieval and Reciprocal Rank Fusion (RRF) remain in place. That is a bounded implementation change, not proof that BM25 improves financial research quality.

## 2. One Question, Three Fund Documents, and Different Kinds of Support

We then investigated an approved public-fund research task concerning ETF code **510500** and a **February 2023 update to the ETF Portfolio Composition File (PCF)**. The task was to identify the changed fields and the limits of what the announcement actually established.

Our retrieval corpus included a 2021 prospectus, the 2023 announcement, and a later 2025 prospectus.

At that point, lexical similarity alone was not enough.

Page 1 of the 2023 announcement directly identifies the affected ETF and the field changes: the former cash-substitution premium field was revised into a subscription cash-substitution premium field, and a redemption cash-substitution discount field was added. The announcement's stated scope is the PCF version update. For this question, the page offers **direct support**.

A sample in the later 2025 prospectus contains related fields. It is useful **context**, but it does not, by itself, establish the complete cause, extent, or consequences of the 2023 change. Nor can a later prospectus be treated as today's live portfolio holdings.

Both documents can contain similar terms. Both can rank highly. But in financial research, **"contains a matching term" and "supports this specific historical claim" are different judgments**.

Our bounded source review therefore kept distinctions such as *direct support*, *context only*, and *unjudged*. We did not turn every retrieved page into a positive or negative relevance label.

## 3. Make Sure the Systems Rank the Same Thing

The initial real-document comparison had another subtle problem: the offline BM25 experiment ranked **whole PDF pages**, whereas production retrieval ranked indexed **chunks**.

One page may produce multiple chunks. A top-five list of pages is not directly comparable to a top-five list of chunks. The denominators differ before either ranking method has done anything wrong.

We later fixed the comparison domain for the same authorized RQ-08 task: three source versions containing **306 eligible indexed chunks**. Offline BM25, PostgreSQL lexical retrieval, and the production vector-plus-lexical RRF diagnostic could then be inspected against the same eligible candidates. Their ordering and selected outputs were retained separately.

This gave us a more defensible diagnostic question: **Which retrieval stage failed to surface the material we expected?**

For that query and configuration, PostgreSQL lexical search returned no candidates, while the fused production retriever still returned five results. The material corresponding to page 1 of the 2023 announcement—the page independently reviewed as directly supportive—ranked first in both BM25 and the fused result.

So a zero-result lexical channel does not mean "production RAG cannot find the evidence." Nor does a high BM25 rank for a later prospectus page make that page sufficient to prove an earlier historical change.

BM25 is a term-based retrieval approach; RRF combines the ranks of results from multiple retrieval methods. Their raw scores are not interchangeable, and neither score is the probability that a passage supports a financial claim. The foundations are described in [Robertson and Zaragoza's review of BM25](https://doi.org/10.1561/1500000019) and [Cormack, Clarke, and Büttcher's RRF paper](https://doi.org/10.1145/1571941.1572114).

Crucially, the 306 chunks did **not** receive comprehensive independent relevance labels. We retained inspectable rankings, but did not turn them into real-corpus Recall, MRR, or evidence of improved answer quality.

## 4. "The Tool Is Authorized" Is Not "The Agent Used It"

Ranking is only part of the research workflow. We must also examine what happens when the agent runs.

In one normal HTTP study, the Host recorded Knowledge access for the Run, but the model's entry request did not expose any tool definitions. The study finished after one model request, with no tool calls or knowledge sources.

This is not evidence that "the model chose not to search." **A Host grant, a tool definition actually visible in a model request, and a tool call proposed by the model are three different facts.** Changing BM25 tokenization cannot fix a missing tool surface.

A later, independent RQ-08 study did naturally invoke Knowledge. Durable records showed **15 executed knowledge-search calls**. Thirteen results could be associated with result-review messages in later model inputs. Two additional Child results appeared in later inputs without the same review messages. Subsequent inspection established that they were initially projected as **external references rather than inline text**. The existing projection rules do not attach review messages to that reference form, so this difference should no longer be described as an unexplained missing cue.

Interestingly, the initial SSE summary for that Run contained an empty tool-call array. Looking only at that summary would miss the actual calls. Following the durable action records and captured model inputs gave a more complete account.

We can now say that retrieval happened in actual model-driven execution, and knowledge results reached later model requests—not just test doubles. But **a passage appearing in input does not prove that a particular conclusion was grounded in that passage**. Answer-level review is still required.

### Finding 24 locations is not reading 24 passages of evidence

We then inspected the recorded model inputs from that RQ-08 run without launching another model execution. Two Knowledge results initially delivered with `residency=external` were each queried once through `read_tool_result`. These were `kind=literal-search` responses, reporting **24/24** and **46/46** matches respectively, both with `complete=true` and `capacityLimited=false`.

Reading `complete=true` alone might suggest that the source had been fully consumed. Both results also carried `sourceComplete=false`: what was complete was **the match list for that particular literal search**, not the underlying original document or the entire prior tool result. The entries supplied paths and offsets; the observed matches contained the same short term without surrounding paragraphs. These readbacks establish that the model searched for locations, not that it read the complete argument around each location.

A separate observation in the same study went further: an inline Knowledge passage from the 2023 announcement entered a Child request, then a Main request, and the two field changes it described appeared in the final answer. That establishes a bounded correspondence from **a particular source passage → both levels of model input → corresponding statements in the answer**, beyond a successful tool call alone.

It is still not an independent review of the complete answer. It does not verify every citation or financial conclusion, nor full consumption of the two external results. The number of matched locations must not be treated as a citation-quality score.

### A connected reranker still needs evidence of use in real research

By October 31, 2026, the local TEI reranker had processed permitted synthetic candidates through the existing Retriever, and a newly started API had loaded its `local-tei` settings. Five synthetic Chinese questions placed their corresponding candidates first without changing candidate membership. A controlled unavailable-endpoint case preserved the original RRF order.

These observations cover reranking calls, source eligibility, and fallback behavior—not improved retrieval quality for real funds. The checks used synthetic repository and embedding ports. At that checkpoint, no real Research Run through the new API had been observed returning `rerankerStatus=applied`. Loaded configuration, a successful standalone Retriever call, and consumption in user research are distinct states.

### Integrating Ragas does not automatically yield a quality score

The optional Ragas entry can validate samples in an isolated process, and a real SDK metric has separately been exercised with synthetic source IDs. The operator path for recorded cases still provides no real Judge quality score: original recordings and retrieval identities are not yet sufficient for a matched evaluation, and the four semantic metrics remain unassessed.

A constructed metric value must not be inserted into a real-research score. Nor does connecting Ragas alongside the existing DeepEval adapter establish a quality benefit. The new capability is a removable evaluation integration; claim support still requires original sources, actual model inputs, and final-answer review.

## 5. Five Questions to Ask Before Trusting a RAG Evaluation

| Evaluation boundary | Evidence to collect |
| --- | --- |
| Source eligibility | Which source, version, research date, authorization scope, and available passages were used? |
| Candidate comparability | Did both methods rank the same eligible candidate set, with the same chunk granularity? |
| Relevance judgment | Which passages directly support the question, which are merely context, and which remain unjudged? |
| Model consumption | Was the tool visible and invoked? Did the model receive match locations, selected text, or the complete source, and is that coverage inspectable? |
| Final claim | Which evidence supports each answer claim, and how were missing or incorrect claims independently reviewed? |

If the first two boundaries are not fixed, a BM25-versus-RRF experiment may simply compare different materials. Without the third, an attractive Recall figure may be a property of constructed labels. Without the last two, even an excellent retrieval evaluation remains confined to the retriever.

My preferred sequence is to freeze the question and source versions, apply the same Run-specific eligibility constraints, and compare the resulting candidates. Independent reviewers then identify which passages support which claims, leaving unreviewed passages unjudged. Only afterward do we inspect real model requests, citations, and final answers.

A matched experiment with fixed task, model configuration, authorization, and data-as-of becomes worthwhile **when we want to claim that changing retrieval improves the final answer**. It should measure quality and cost, not just ranking.

This is slower than adding a new index and publishing a score table. But it distinguishes "retrieval did not find the passage," "the source was ineligible," "the model never called the tool," and "the model cited an unsupported claim"—four problems that demand different fixes.

## 6. BM25 Can Now Be Wired In. Why Isn't That Proof of Better Research?

This work does not show that BM25 is useless, or that our existing fused retrieval is necessarily sufficient.

The synthetic rankings differed sharply. In the reviewed real announcement, however, both methods surfaced the directly supportive page. Actual model-driven Knowledge calls have also occurred. We even observed one announcement passage reach Child and Main inputs, with its two field-change statements appearing in the answer. Complete citation support and financial-semantic quality still have not received independent evaluation.

We therefore did not replace the entire RAG architecture on the strength of synthetic scores. The later BM25 implementation is a **conditional lexical channel**: it operates when the PostgreSQL extension and index are available, while vector retrieval and RRF remain unchanged. The primary local PostgreSQL instance inspected during that change did not have `pg_search` installed, so it still used the existing full-text search.

**Being able to activate a retrieval algorithm is not the same as showing a measurable research-quality benefit in normal use.**

The next time an agent returns many RAG hits but an unreliable answer, I will start with a narrower question: **Where did the required evidence disappear—or did it arrive correctly, only for the conclusion to remain unsupported?**

Until we can answer that, a higher retrieval score tells us too little about what to fix.

---

Further reading: [Do Green Tests and a Model Response Mean the Agent Succeeded?](honest-agent-evaluation.md) · [Why Revoked Documents May Still Reappear in Historical Answers](027-rag-revocation-publish-replay.md)
