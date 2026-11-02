---
title: "The Full RAG Lifecycle: From Knowledge Ingestion to a Trustworthy Agent Answer"
description: "Follow an ETF-notice research task through corpus building, authorized hybrid retrieval, actual model consumption, source-bound publication and evidence-based evaluation—including when to skip RAG altogether."
readingBrief:
  takeaways:
    - "RAG is not a straight line from chunks and embeddings to a model: source versions, query retrieval, evidence delivery and ongoing governance operate on different facts and timescales."
    - "Constrain source, version, purpose and readable scope before retrieval; BM25, vectors, RRF and reranking only change candidate selection, never permission or factual support."
    - "A retrieved hit, a passage actually read by the model, a valid citation, a supported claim and currently authorized disclosure require separate evidence; diagnose the earliest point of loss."
    - "Prefer direct reading when the few known originals are manageable; add indexes, hybrid retrieval and reranking only for observed recall or context problems, with usable fallback paths."
  appliesTo:
    - "Architects building agents that answer questions across changing document versions, with traceable sources and multi-turn research."
    - "Engineering leads who must separate retrieval quality, authorization, evidence, evaluation and user-visible delivery in finance or enterprise knowledge products."
  notFor:
    - "Claiming the public Open ETF Agent offers the complete private RAG system, or that this article certifies production financial research or regulatory compliance."
    - "Treating retrieval scores, completed calls or synthetic results as direct measures of factual correctness, investment quality or proven model improvement."
---

# The Full RAG Lifecycle: From Knowledge Ingestion to a Trustworthy Agent Answer

One question may lead a retrieval system to three seemingly relevant fund documents: a 2021 prospectus, a 2023 update notice and a 2025 prospectus. The user asks, “What exactly changed in 2023? Can the later document establish the scope of that historical change?”

Sending all three documents to a model does not necessarily improve its answer. The newest document is not necessarily direct evidence of an earlier event. A hit on “cash substitution” is not proof that the passage covers the change in question. Even a correctly resolved citation can accompany an inference that incorrectly turns a later description into the original reason for the amendment.

This scenario comes from a bounded ETF Agent investigation using real research materials. **The core challenge is not retrieving more chunks: it is preserving what a document can actually establish as it moves through acquisition, indexing, retrieval, reading and delivery.**

This panorama looks at retrieval-augmented generation (RAG) as a system rather than a vector-search component. It connects a corpus-building lifecycle, an online retrieval lifecycle, an evidence-consumption and answer-delivery lifecycle, and evaluation and governance that cross the other three. They interact, but a single “RAG Manager” should not take ownership of all their decisions.

This is neither a vector-database tutorial nor a code walkthrough of A20, the Knowledge Retrieval module. The questions here are **how the complete system collaborates, where responsibilities must remain separate, and when not to add complexity**. The historical fund-notice setting follows previously reviewed public materials; illustrative records, design choices and unexecuted branches are teaching explanations, not new live-model results.

## 1. The big picture: one user question, four kinds of work

The user sees a question and an answer. Underneath are at least four distinct kinds of work.

| Lifecycle | Starts with | Leaves behind | Common mistaken conclusion |
| --- | --- | --- | --- |
| **Corpus building** | Acquired and permitted materials, intended purpose and version | Original identities, locatable passages, indexes and health observations | An existing file means its complete text is searchable |
| **Online retrieval** | The current question and authorized search scope | Ordered candidates, partial/failure states and source anchors | High ranking proves a particular claim |
| **Evidence use and delivery** | Actual tool results arriving in the model request | Read ranges, source bindings, concrete claims and a reopenable answer | Tool success means the model used the evidence correctly |
| **Evaluation and governance** | Source changes, observed failures or quality questions | Version decisions, matched comparisons, disclosure outcomes and qualified findings | Better recall in one test means better research |

These are not necessarily four sequential backend services. Corpus building generally predates the question. Evaluation can happen offline. Permissions can change after the model has read a passage. Some questions do not need retrieval at all.

~~~mermaid
flowchart TD
    A[Admitted source material and version] --> B[Extract locatable passages and build an index]
    C[User question and permitted sources for this Run] --> D[Constrained candidate retrieval]
    B --> D
    D --> E[Actually delivered passages and source bindings]
    E --> F[Model checks the question and forms claims]
    F --> G{Disclosure still allowed at commit time?}
    G -- Yes --> H[Save an inspectable answer]
    G -- No --> I[Withhold protected content and describe the gap]
    H --> J[Recheck eligibility when history is viewed again]
~~~

*Figure 1. The corpus and the user task meet at retrieval. Authorization to disclose is not an automatic continuation of a previously successful search.*

This picture explains why “we added RAG, but users do not experience it” and “retrieval recall is good, but the answer is unreliable” can describe completely different failures.

## 2. Before knowledge enters the system: what do we actually possess?

### A report has three distinct identities

For the historical notice, the **original file** is the acquired bytes. A **research asset** describes where they came from, which logical source and version they represent and how much was extracted. The **knowledge index** is a bounded representation built for lookup.

A filename, URL or title does not uniquely identify a content version. A URL can be overwritten, a PDF can be revised, and an old-page citation must not silently become a passage from the newest version when someone reopens a report.

The system must also distinguish **original text, curated summaries and metadata-only catalog entries**. If licensing or permission review does not establish the right to retain an institutional report in full, a reviewed summary and source link may be appropriate. A catalog entry cannot be advertised to the model as a searchable original quotation. Those representations carry different evidential weight.

For fund research, this matters especially because a historical notice may establish a historical change but cannot become today's NAV, portfolio position or trading instruction. A Knowledge Source is explanatory evidence, not another authority over the investment ledger.

### Extraction coverage matters more than the number of chunks

Chunking divides longer documents into searchable passages. Short chunks may find exact fields but drop preceding conditions; large ones retain context but increase irrelevant text and model-input cost. PDF tables also have headers, footnotes, physical page numbers and potentially cross-page dependencies.

If the parser extracts only “fee: 0.5%” while omitting the applicable share class, more precise retrieval may simply make the mistake more repeatable. **When extraction coverage is unknown, absence from the extracted text is not evidence of absence from the original.**

An indexed unit should therefore retain enough information to find its logical source, document version, content hash, section or page, passage range and representation type. A claim requiring the complete table or a footnote must trigger a read of the appropriate original range, not a substitution of a convenient search snippet for the whole page.

### Updating a source is a conditional state change

The 2025 prospectus does not overwrite the 2023 notice. A sensible update checks source changes and retention rights, prepares the new version and its searchable representation, and activates it only when the applicable requirements are met. Historical versions remain subject to their own retention and readback contracts.

Early ETF Agent knowledge-lifecycle work already distinguished **read-only change inspection** from a **reviewed synchronization operation**. That prevents every freshness check from rebuilding embeddings and prevents knowledge maintenance from becoming an investment-execution entry point. Failure of one independent source need not erase valid information from others.

A recorded diagnostic incident makes this tangible. In September 2026, one local inspection found the relevant supporting services available but zero knowledge documents and chunks indexed. Historical tests and implemented interfaces did not magically populate the corpus for that query. This was an observation at the time, not a claim about today's corpus state.

**Inspect corpus and index health before debating search algorithms.** Switching to BM25, a larger reranker or a different MCP transport cannot create material that is not there.

## 3. An online query is not “search the user's text across everything”

Return to the user's question: “Which fields were changed in 2023?” It contains at least three consequential constraints: **the fund, the historical date, and the need for a change notice rather than an arbitrary prospectus**.

The model may break the task into smaller questions: what the contemporaneous notice states, how earlier documents described the fields, and whether later documents merely provide background. Such decomposition is a research choice. It does not expand the authorized source set, and it does not require a separate planning model for every question.

### Why hard filters must precede Top-K

Imagine an index with public fund notices and private research notes available to only one account. Searching across all entries for Top-K and filtering out the private hits afterward can leak information and distort results: forbidden hits may already have displaced eligible notices from the candidate list.

Hard constraints therefore belong before ranking: account scope, `reference` versus `personal` collection, source purpose, effective version, document status and explicit source restrictions. The user or model may narrow those constraints but cannot enlarge the Host's permissions through search arguments.

The inspected A20 contract permits **one bounded widening attempt** when a domain preference yields too few eligible candidates, but only within the same authorized collection and original hard restrictions. Explicit `only` mode cannot be relaxed. A sufficient candidate *count* is not a claim that the research has enough semantic evidence.

### Lexical search, vectors, fusion and reranking solve different problems

For exact expressions such as “510500,” “PCF” and “creation cash substitution premium,” lexical search remains useful. Vector retrieval may help with different wording referring to the same change.

The two channels' scores are not directly interchangeable. Reciprocal Rank Fusion (RRF) combines their ranks and deduplicates candidates by the appropriate source, version and chunk identity. It decides what to inspect first, not the probability that a claim is true.

In the inspected private ETF Agent Knowledge path, the lexical channel may choose BM25 only if PostgreSQL's `pg_search` extension and BM25 index actually exist and configuration allows its use. Otherwise it retains PostgreSQL full-text search (FTS). Code-level support alone cannot establish which algorithm any individual query actually used.

An optional reranker reads **the same already authorized candidates** to improve their ordering. It addresses cases where the right passage was retrieved but lost before the final usable Top-K. It cannot retrieve a source absent from the candidate pool, create new provenance or authorize a passage. If the optional local TEI reranker is unavailable, retaining the original RRF order is a legitimate fallback.

Hybrid retrieval is therefore not inherently preferable to simpler full-text search. It adds embedding and index maintenance, reranking calls, latency and a larger debugging surface. Its value depends on a demonstrated failure at a particular stage of real user tasks.

## 4. What often disappears is proof that the model actually saw the chunk

Retrieval can return passages while the user still receives an uncited answer. The problem may occur after retrieval.

An agent must distinguish at least four events: the Host authorizes Knowledge; the tool is actually exposed in the relevant model request; the model calls it and receives a result; and a later real model input actually carries usable material. Missing one of these does not establish that the model “refused to search.”

One historical research inspection found that the Host had prepared Knowledge authorization but did not expose the tool definition on that model request. A later, separate Run provided persistent evidence of real Knowledge calls and material consumption. That is a **tool-presentation and delivery** problem, not something a different embedding model would fix.

### Externalized results make “the model read it” especially easy to overclaim

When a tool result is too large, the Host may keep the content outside the model input and provide a reference or a searchable locator. A subsequent literal search can return a complete list of matching *offsets* without returning the arguments surrounding them.

A retrieval hit, an offset found in external storage, and a real reread of the original passage are three levels of evidence. Only a passage **actually delivered in this Run and still permitted for use** can receive a source-bound, inspectable citation identity for that consumption. Model-generated source identifiers, references from old Runs and document titles that were never read do not confer this authority.

This does not mean placing whole documents into every model request. Start with the smallest sufficient passage. When the question depends on a title, preceding condition, table footnote or another version, expand precisely along the original source and preserve the new actual read range.

### Which parts of an answer are genuinely supported?

In the existing 510500 notice case, a reviewed page of the 2023 notice directly supported descriptions of specific changes to field names. The later 2025 prospectus contained related fields, but served as background about a later version; by itself, it could not establish every reason for or consequence of the 2023 change.

A **teaching example of claim review** makes the distinction clearer than a retrieval score:

| Proposed answer claim | Material and scope of review | Appropriate output |
| --- | --- | --- |
| The 2023 notice modified cash-substitution field names and added a corresponding discount field | The contemporary notice page directly supports the specified field change | Cite that historical version and limit the answer to the reported list-field change |
| Related fields also appear in a later prospectus | The later version supplies background and possible consistency evidence | Label it as later material rather than reversing chronology |
| Therefore the full motivation, market impact and current holdings are known | The inspected excerpts do not support those stronger conclusions | Leave the gaps explicit instead of asserting them |

The table demonstrates **claim-by-claim evidence review**, not a claim that an automatic evaluator independently scored every statement or that a new real model Run was performed. The actual reviewer still needs the original text, time, scope and wording.

## 5. A document can lose disclosure eligibility after the model has read it

A user may reopen an old conversation hours later. They may also revoke access to a private document while a response is being generated. There are at least three distinct times: **the original source was readable, the answer could be disclosed at commit, and the saved answer could be shown to the later viewer**.

An old citation does not replace a new permission decision. A controlled revocation test in September 2026 revealed a specific failure: historical replay already withheld revoked material, but the first streaming delivery could still release a protected passage. Fixing this class of window requires checking eligibility where a disclosure effect is committed, with a meaningful ordering relative to concurrent revocation.

“Not currently displayable” must also be distinguished from “an explicit retention revocation requires stored-copy cleanup.” A temporary access failure or unknown permission does not imply permanent deletion. Conversely, an explicit retention revocation cannot be implemented only as a UI hiding rule if old summaries can be exposed through another history path.

This is not an invitation for RAG to take over Publication or history. Existing publication mechanisms own committed answer content; conversation-delivery mechanisms own later replay. Previously retrieved passages do not bypass either. **Bytes already sent to a browser cannot be retroactively recalled**, so protection cannot depend solely on a correct future replay.

For purely public, unchanging documents, elaborate revocation coupling may be unnecessary. But when materials are revisable, revocable or account-scoped, the disclosure contract needs to be explicit rather than an optional afterthought.

## 6. Divide responsibilities rather than invent a RAG manager for everything

At the system level, RAG is a collaboration among existing capabilities, not another execution engine.

| Responsibility | Facts it owns | Decisions it must not inherit |
| --- | --- | --- |
| A17 research assets and A18/A19 reading | File identity, versions, acquisition and actual page/extraction coverage | Whether a model's conclusion is sound |
| Source permissions and A04 Run authorization | Source/collection rights and the admitted capabilities for this Run | Which research strategy a model needs |
| **A20 Knowledge Retrieval** | Eligible candidates, ordering, retrieval status and original anchors | Whether research is complete or trading is permitted |
| A16 result and citation management | Actually delivered result identities, original/derived relationships and readback references | Arbitrary upgrades to source authority |
| A03 Main research decisions | Whether to investigate further, which versions to compare and what claims require support | New permissions or invented facts |
| A23 Publication and A24 History | Committed content, delivery and controlled later views | Modification of originals or a new investigation during replay |

This is a **responsibility map, not a requirement to deploy a new service for every code**. Several concerns may live in one process, and a single authorized tool call can cross several interfaces.

Similarly, MCP is a tool connectivity and invocation mechanism. Wrapping a Retriever in an MCP server does not populate an empty index or ensure its result enters the actual model input. The decisive facts are acquisition, authorization, invocation, delivery and source identity, not the transport's name.

## 7. Evaluate where evidence was first lost

When the user does not receive a verifiable answer, a single aggregate score rarely identifies the repair. Find **the first observable stage where the required evidence disappeared**.

~~~mermaid
flowchart TD
    A[Answer lacks supporting evidence] --> B{Does the index contain eligible original passages?}
    B -- No --> C[Inspect admission, parsing and index health]
    B -- Yes --> D{Does the candidate set contain the key passage?}
    D -- No --> E[Inspect filters, lexical and vector recall]
    D -- Yes --> F{Did the model actually read the required text?}
    F -- No --> G[Inspect fusion, truncation and result rereading]
    F -- Yes --> H{Does the original directly support this claim?}
    H -- No --> I[Read further, narrow the claim or mark unknown]
    H -- Yes --> J[Verify citation identity and current disclosure rights]
~~~

*Figure 2. Source absence, candidate omissions, missing model delivery and semantic mistakes need different repairs.*

Use different denominators and evidence at the different stages:

- **Index and candidates:** Can an admitted original be located and searched? Did judged positive passages enter the candidate set? Recall@K, Hit@K and MRR@K only make sense for the specified judged set and granularity.
- **Actual consumption:** Was the tool visible and called? Which relevant passages entered a real model input? Were externalized results reread to the needed text rather than merely searched for offsets?
- **Answer and citations:** Does each claim have direct support from the correct version? Did later background material become a false historical justification? Were any claims invented or overstated?
- **User task and cost:** Was the actual question fully answered and the result delivered? What did it cost in time, calls and tokens, preferably under matched questions and source dates?

A previous RQ-08 evaluation fixed three source versions into a comparable candidate scope and observed ranking across 306 indexed chunks and actual Knowledge calls. But the chunks lacked complete human relevance judgments, and some readback confirmed only matching locations. Those observations **do not establish improved real-world Recall or more accurate financial answers**.

This does not make retrieval engineering metrics useless. They are valuable for identifying a better algorithm at a particular stage. The user's trustworthy research result depends on additional steps: model consumption, semantic support and final delivery.

## 8. When is full RAG worth it—and when should we keep things simple?

A well-designed system should be able to justify capabilities it **does not** use.

| Task conditions | Prefer first | Upgrade only when |
| --- | --- | --- |
| A few short documents, known sources and versions, explicit clauses | Read the original directly or use bounded keyword location | Length, repeated use or context limits cause real evidence omissions |
| A larger corpus with mostly exact codes, titles and field names | A catalog, authorization filters and lexical retrieval | Paraphrases and alternative wording repeatedly cause measured misses |
| Lexical search misses equivalent expressions within an approved corpus | Add vector candidates and reproducible fusion | The observed semantic-recall gap is worth additional indexing and computation |
| Relevant passages consistently reach candidates but fall out of final Top-K | Test reranking on the same authorized candidates | Matched evaluations show gains that justify added latency, cost and failure modes |
| Account-scoped, revocable or historically replayed material | Maintain source eligibility checks at the original authorization and disclosure stages | Never disable hard restrictions merely because retrieval is thin or expensive |

A two-page notice does not need to become hundreds of vectors before a model can read its clauses. A much larger versioned corpus with repeated questions may justify an index, permission-bearing metadata, embeddings and bounded reranking.

When should an optional mechanism be withdrawn? If reranking has no reliably observable incremental benefit, fall back to deterministic fusion. If vector search adds confusion and operational cost without helping the task set, retain lexical search for now. If the user has already identified the original document, read it rather than insisting on a search to “use AI.”

But distinguish **optional complexity** from **mandatory constraints**. Source rights, account separation, version identity, actual read coverage and lawful disclosure at publication must not be removed to save tokens.

## 9. Walk the 2023 notice question through the system again

Return to the original user task: establish what changed in 2023.

The corpus side retains the contemporaneous notice and its version. Retrieval locates it within the authorized source set and may also find earlier and later prospectuses. The model should use only the actual contemporary passage for direct claims about the change, label later materials as background and keep unsupported inferences open. Commit-time disclosure and subsequent readback still obey their respective current authorization rules.

The task does not need “a trustedness score for every RAG document.” It needs **every necessary handoff to preserve an inspectable relation rather than inflate the previous step's successful status into final correctness**.

In the private ETF Agent implementation, we can inspect knowledge ingestion, PostgreSQL/pgvector and lexical fusion, bounded Native Knowledge calls, Host source bindings and relevant disclosure checks. Historical observations also identify empty indexes, missing tool exposure, candidate/model-consumption gaps and revocation races. Together they are not a certification of production financial-research quality.

The separate public [Open ETF Agent](https://github.com/hpoenixf/open-etf-agent) offers only a smaller learning slice: scoped lexical retrieval over synthetic documents, original-page rereading and source-linked reports. The complete private RAG stack should not be presented as reproducible from the public repository. Readers can start with the [fixed v0.15.0 lexical retrieval implementation](https://github.com/hpoenixf/open-etf-agent/blob/v0.15.0/src/retrieval.mjs) and [module guide](https://github.com/hpoenixf/open-etf-agent/blob/v0.15.0/docs/module-guide.md) to inspect the minimal candidate–original–report relationship.

**The engineering purpose of RAG is not to route every question through more machinery. It is to prevent relevant facts from disappearing between sources, rights, ranking, reading and delivery when retrieval is actually needed.** For a real user task, being able to say “which version I found, what the model actually read, what supports this sentence, and what remains unknown” is the complexity worth preserving.

---

Further reading: [A20 Knowledge Retrieval: From Corpus Admission to Citable Evidence](/en/articles/agent-knowledge-retrieval-end-to-end) · [RAG Recall, BM25 and Financial-Evidence Evaluation](/en/articles/rag-retrieval-evaluation-evidence) · [Document Revocation and Historical Replay](/en/articles/027-rag-revocation-publish-replay) · [A17 Research Assets](/en/articles/agent-research-assets-identity-version-lifecycle) · [Agent Citation Design](/en/articles/ai-citations-do-not-prove-reliability). Each explores retrieval, evaluation, revocation, file identity or citation internals; this article explains how they work together to complete one research task.
