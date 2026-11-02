---
title: "Knowledge Retrieval: How Does a Document Become Citable, Revocable Research Evidence?"
description: "An end-to-end A20 Knowledge Retrieval deep dive: source rights, parsing, chunking, index health, lexical and vector retrieval, RRF and optional reranking, Host-issued evidence, revocation and diagnostic failure states."
readingBrief:
  takeaways:
    - "RAG starts with material that may lawfully be retained, identified and represented; an indexed vector does not prove that the original is complete or currently disclosable."
    - "Scope, collection and source restrictions must apply before either ranking channel's Top-K; RRF and reranking change reading order, never access rights."
    - "A retrieval hit, an actually delivered passage, a correctly supported claim and an authorized publication are different observations."
    - "Empty indexes, missing indexing, low recall, unavailable dependencies and publication-time revocation require different responses, not a generic 'no knowledge found'."
  appliesTo:
    - "Engineers building research agents and knowledge systems with updates, provenance, account isolation or auditing requirements."
    - "Teams debugging why an agent has RAG wiring but still fails to use documents reliably."
  notFor:
    - "Treating this essay as a complete, public, production-ready financial RAG implementation or an investment-answer quality certificate."
    - "Interpreting similarity, BM25 or RRF scores, or a successful tool call, as proof that a financial claim is true."
---

# Knowledge Retrieval: How Does a Document Become Citable, Revocable Research Evidence?

An investment-research agent is asked: “What changed in a fund's 2023 creation/redemption list notice? Can a later prospectus establish the scope of the change at that time?”

It may retrieve three sources: an older prospectus, the notice from the relevant year, and a later prospectus. All three mention similar field names. Yet evidence for **what changed at that point in time** usually has to come from the specific original notice and its version. A model reading only highly ranked snippets can mistake “this field appeared later” for “this was the change made then.”

That is why engineering knowledge retrieval is much more than calling a vector-search API. **A document must first be eligible for inclusion, then be represented, indexed, retrieved and delivered without losing its original identity. The resulting answer still needs citation and disclosure checks.** A failure at any stage can produce a plausible-looking answer that cannot be audited.

This article follows **A20, Knowledge Retrieval**, in ETF Agent. Its principal responsibility is to find candidate passages from an *already admitted* collection for an authorized query, while preserving real source identities and retrieval outcomes. Source admission, PDF interpretation, model reasoning, and publication or historical replay each have their own responsible owners. We follow the handoffs end to end without turning A20 into a universal RAG manager.

## 1. Four entities that must not be collapsed

| Entity | What it represents | What it does not establish |
| --- | --- | --- |
| **Knowledge Source** | Material with a known origin, purpose and approved permissions | Current holdings, NAV or execution truth |
| **Research Asset** | An acquired research file with a source identity and version | Complete parsing, successful indexing or actual model consumption |
| **Indexed Chunk** | A bounded, retrievable portion of a particular document | A complete document or all applicable conditions |
| **Knowledge Evidence** | Material actually delivered for this query, retaining provenance | That high rank establishes support for a final claim |

These objects cannot silently confer one another's authority. PDF reading can provide page text and locations without choosing the most relevant argument. A20 can find candidates without deciding which claims are warranted. A Host can bind a delivered passage to its source without making that passage an instruction to trade.

A better engineering model is **a data lifecycle intersecting an evidence-delivery lifecycle**. They meet, but they are not the same pipeline.

## 2. Offline: why review the material before indexing it?

### Source admission precedes extraction

Being able to download a public page or a research report does not automatically grant permission to retain its complete text in a local index. Some material can be represented only by metadata or a human-reviewed summary. Personal materials have further account-scope and local-processing constraints.

Earlier ETF Agent knowledge work distinguished **original content, curated summaries, and metadata-only entries**. The existence of a report in the source catalog must never be presented to the model as evidence that its original full text is available to quote.

For example, an institution's report may have a permitted, curated viewpoint card, while a regulator's public education page may have admitted original text. Both can help a research task, but the result must distinguish their representations. **A curator's summary must not become a quotation attributed to the original publisher.**

### Parsing and chunking must retain qualifying clauses

Suppose a PDF fee table is extracted into a fragment saying “management fee: 0.5%,” losing the applicable share class and footnote. More accurate retrieval of that fragment may simply produce more consistent mistakes.

An indexed unit should carry at least a logical source identity, document version, content hash, chunk position and section/page anchor. Markdown can be split by section, with bounded overlap for long sections; PDF pages require their own physical-page connection. Small chunks improve precision for exact terms but risk separating conditions. Larger chunks preserve context while consuming more model-input budget.

In the inspected local ingestion path, an **incompletely extracted PDF** is not silently indexed as a complete searchable document. An unsupported or partial extraction is reported as such, rather than turning missing pages into apparent absence of evidence. Tables, scanned-page OCR and visual interpretation have their own extraction contracts and qualifications.

~~~mermaid
flowchart TD
    A[Register source rights, purpose and version] --> B{What content may be retained?}
    B -- Metadata only --> C[Catalog entry without a false full-text claim]
    B -- Bounded body --> D[Parse and inspect extraction coverage]
    B -- Not allowed --> X[Reject ingestion]
    D --> E{Is the extracted original scope known?}
    E -- No --> Y[Mark incomplete and review]
    E -- Yes --> F[Chunk by section or page]
    F --> G[Persist identity, hashes and search representations]
    G --> H[Inspect live index health]
~~~

*Figure 1. Admission rights and extraction coverage come before indexing. Rejecting one source does not invalidate independent permitted sources.*

### Updating a source is not overwriting an old row

A report may be revised without changing its filename. A web page changes even more readily. Indexing must distinguish **the logical source** from **a particular version of its bytes**. Prepare the new version and its chunks, then switch eligibility under the applicable lifecycle. An archived citation still needs to identify the old version rather than silently resolving to the latest text.

**Checking for changes** should also be separate from **synchronizing material, re-embedding it and modifying the index**. An earlier lifecycle design used a read-only check and a reviewed sync action, updating affected generated material without touching manual knowledge or investment-execution ledgers.

This gives us our first diagnostic rule: a reachable database, a working embedding provider and green retrieval tests do not prove that the **current live index contains eligible chunks**. One historical local investigation found zero documents and zero chunks. That describes the state at that time; it is not a claim about the present production corpus.

## 3. Online: who chooses what between a question and its candidates?

A20 does not receive merely an arbitrary search string. It operates under a Host-bound user scope and collection, source constraints, and optional domain, time or document-version restrictions.

The following **illustrates semantics only; it is not a ready-to-call public API**:

~~~json
{
  "query": "Which exact field changed in this historical notice?",
  "collection": "reference",
  "domains": ["fund-documents"],
  "domainMode": "prefer",
  "sourceIds": ["approved-document-v2023"]
}
~~~

A `sourceIds` argument refers to the **actual logical document identity previously exposed by the system**. The values above are invented teaching placeholders, not real domain or source identifiers. Model-supplied filters may narrow Host authority but cannot broaden it; guessing a valid-looking identifier is not authorization.

### Authorization to use a tool is not evidence that it was invoked

A model can answer a general question without a knowledge lookup, or it may choose the native `search_financial_knowledge` tool. Forcing a hidden retrieval into every question just to make RAG appear is not necessary.

Instead, inspect four distinct facts: whether the tool definition entered the relevant model request, whether the model requested a call, whether the Host executed it, and whether any returned material reached the next actual model input.

A research Run can have prepared Knowledge authorization without exposing the tool on the model's current request. No lookup then occurs. Fixing BM25 would not repair that problem. **Configured, visible and invoked are different states.**

### Hard restrictions belong before Top-K

In a collection combining private materials, public references and old revisions, searching the entire corpus for Top-K and then removing forbidden results is not just a disclosure concern. Unauthorized entries may already have crowded the eligible evidence out of the candidate list.

The inspected PostgreSQL retrieval path applies collection, scope, source, purpose, status and relevant domain/version constraints while selecting candidates. **`reference` and `personal` are distinct collections; omitting the collection never silently searches private notes.**

A preferred domain with too few candidates may trigger **one bounded same-collection widening attempt**, preserving all hard restrictions. Explicit `domainMode=only`, Host-bound sources, account scope and version rules cannot be lifted by that widening. Its trigger is an insufficient candidate *count*, not a model judgment that the evidence is semantically sufficient.

### Why lexical retrieval, vectors and RRF belong together

Lexical retrieval handles exact fund codes, field names and legal terms especially well. Vectors can find related ideas expressed differently. Their raw scores have different scales and should not simply be added.

The inspected Retriever retains independent caps for both candidate channels and applies versioned **Reciprocal Rank Fusion (RRF)** to their ranks. It merges repeated instances of the same source-backed chunk by identity. An RRF score is a ranking contribution, **not the probability that a passage proves a financial claim**.

The lexical channel also has an important deployment qualification:

| Environment | Actual lexical path | What we may conclude |
| --- | --- | --- |
| Approved `pg_search` extension and BM25 index exist, and configuration allows them | Optional BM25 | Confirm the algorithm actually selected for this attempt |
| Extension/index missing or BM25 disabled | PostgreSQL FTS (`tsvector` family) | Retrieval may remain useful; do not claim BM25 was active |
| Lexical channel fails while vector results survive | Surviving permitted channel with partial status | Neither “both succeeded” nor “the entire corpus lacks evidence” |

An optional **local TEI reranker** can reorder already eligible fused candidates. It must not introduce new source text, bypass a candidate's permissions, or make a reranking score authoritative. When the service times out or fails, the existing RRF order remains available and the diagnostic state reflects that fallback. A loaded configuration or a successful synthetic ranking test is **not** evidence that real financial-answer quality has improved.

### Reading neighboring chunks does not expand an existing citation

A hit on a fee clause may require surrounding headings or footnotes. Adjacent-chunk retrieval must retain the original document, version and scope restrictions. But a larger context window does not automatically expand the literal span authorized by an earlier citation.

The Native Knowledge tool deliberately delivers **source-validated anchor passages**, not arbitrary adjacent text falsely presented as independently cited evidence. When an argument depends on an omitted footnote, table row or paragraph, the responsible reader needs to acquire a corresponding original span.

## 4. When does a candidate actually become evidence for the model?

~~~mermaid
flowchart TD
    A[Model proposes a Knowledge query] --> B{Host authorizes source and collection?}
    B -- No --> X[Deny the protected query]
    B -- Yes --> C[Lexical and vector retrieval with the same hard restrictions]
    C --> D[Deduplicate with RRF and optionally rerank]
    D --> E{Is the candidate source still current and permitted?}
    E -- No --> Y[Exclude stale candidates and preserve the gap]
    E -- Yes --> F[Bind the actually delivered source passage]
    F --> G[Model reads and forms specific claims]
    G --> H{Disclosure still allowed at commit or replay?}
    H -- No --> Z[Block protected content from display]
    H -- Yes --> I[Deliver an answer with inspectable citations]
~~~

*Figure 2. Ranking cannot bypass authorization, and reading cannot bypass publication. Every decision has an explicit unsuccessful path.*

A20's returned passages preserve the logical source, document and chunk IDs, version/hash, representation type, relevant dates and diagnostic retrieval status. The Host maps **actually delivered, authorized passages** into the current Run's citation registry. A model cannot create trusted evidence merely by inventing a citation identifier.

The chain requires four distinct observations:

| Checkpoint | Evidence that it actually happened |
| --- | --- |
| Candidate recall | Which eligible chunks each channel returned and with which statuses |
| Host/model delivery | A real tool call and the precise passages or external read references included in a subsequent real model request |
| Claim support | Whether a **specific sentence** follows from the cited original version, location and qualifying conditions |
| Authorized disclosure | Whether the current viewer may still see that source when the answer is committed or replayed |

“24 matching positions were found” does not mean “24 complete passages were read.” A literal search over an externalized result can return a complete list of offsets without the arguments surrounding them. Nor does “the answer cited source A” mean source A supports every claim in it. Claims require independent source checking and, when necessary, further reading.

The real engineering lesson from RAG revocation lies in the final checkpoint: **permission at retrieval time does not prove permission when an initial SSE chunk is sent, a response is committed or history is reopened**. An old grant or snapshot cannot replace the currently approved source record. Revocation may prohibit future disclosure; an explicit retention revocation may also require cleaning stored copies, whereas a temporary denial or unknown status must not be misinterpreted as permanent deletion.

Those are responsibilities of the existing authorization, Publication and history mechanisms. A20 must not introduce a second publishing system. For the concrete concurrent-revocation and commit-order problem, see [RAG: Revocation and Historical Replay](027-rag-revocation-publish-replay.md).

## 5. No answer? Find the earliest point where usable evidence disappeared

Treating every failure as “no match” invites repeated queries. Treating every partial failure as a total outage discards independently useful information.

| Symptom | Inspect first | Appropriate next action |
| --- | --- | --- |
| Sources appear in the catalog, but retrieval is always empty | Admission, live index, chunk count, document version | Distinguish `empty`, `not-indexed` and unavailable dependencies; repair ingestion or health |
| Exact codes match, paraphrases do not | Vector channel, embedding compatibility, query and candidate restrictions | Compare both channels against a fixed corpus, without expanding access |
| Both channels found a critical page, but final Top-K misses it | Fusion, deduplication, reranking and input bounds | Find which selection step removed it |
| Passages were returned, but the model ignored them | Tool visibility, next actual model input and external-result rereading | Repair tool delivery or consumption, not blindly BM25 |
| Retrieved text cannot be cited or shown | Current version, source validity, Host binding, commit/replay permission | Withhold the protected passage while retaining independent allowed output |
| A correct notice was cited for an overbroad claim | Effective date, field scope, later revisions and exact wording | Independently review the claim; higher recall alone will not fix it |

Retriever statuses `grounded`, `partial`, `no-evidence` and `unavailable` describe **retrieval outcomes**. Here, `grounded` indicates that material satisfied the Retriever's evidence contract, **not** that an investment assertion has been established. Index health uses a different diagnostic vocabulary: `ready`, `partial`, `empty`, `not-indexed` and `unavailable`. They measure different things.

A useful engineering objective is not just one Recall@K score but the **earliest observed loss of original evidence capable of supporting the claim**. Freeze the data version, candidate granularity, human-judgment coverage and task authorization before comparing BM25, RRF or reranking and then measuring the actual answer.

In one inspected 510500 fund-notice evaluation, 306 chunks from the same authorized candidate scope were compared. However, the chunks did not have complete human relevance judgments, so those ranks could not establish true recall or financial-answer correctness. Algorithm comparison and end-to-end research quality are separate questions. The evidence and limits are developed in [RAG Retrieval Evaluation: A Relevant Text Is Not Yet Financial Evidence](rag-retrieval-evaluation-evidence.md).

## 6. From this architecture to one runnable minimum

The public learning repository [Open ETF Agent](https://github.com/hpoenixf/open-etf-agent) is **not** a complete public reproduction of the private A20 system. It offers a much narrower but inspectable slice: **scoped lexical search over synthetic document pages, rereading original pages, and source-linked report output**. It does not provide the complete PostgreSQL/pgvector, BM25, RRF, TEI, personal-knowledge permission or revocation/publication integration discussed above.

Start with the [fixed v0.15.0 minimal lexical search implementation](https://github.com/hpoenixf/open-etf-agent/blob/v0.15.0/src/retrieval.mjs), then use the [public module guide](https://github.com/hpoenixf/open-etf-agent/blob/v0.15.0/docs/module-guide.md) for the original-page retrieval example. After installing and building with the Node.js version stated in the README, run this in a fresh output directory:

~~~sh
npm run demo -- --case retrieve-reread --query "offline editing"
~~~

This CLI uses scripted synthetic materials to exercise actual retrieval and readback. It is not a Knowledge service ready for live financial materials, and it does not prove a model used every candidate correctly. Qualification of the full private A20 chain requires separate permitted evidence of source/index status, Host execution, actual model-input projection, and citation/publication behavior. The smaller public example cannot be used as a substitute for those missing observations.

## 7. The architectural trap: inventing a RAG manager that owns everything

RAG can easily become a giant module responsible for every search, tool choice, knowledge state, quality verdict and publishing approval. That looks convenient but merges incompatible sources of authority:

- **Source and version owners** keep control of original content, document lifecycle and permission facts.
- **A20 Retriever** owns eligible candidates, ranking, retrieval outcomes and accurate source identities.
- **Model/Main** decides what to investigate next, whether material supports a claim and whether another authorized read is useful. Candidate count cannot declare the research complete.
- **Host citation and Publication/History** own actual evidence delivery, lawful disclosure and inspectable replay. They do not inherit old permission forever.

If a cross-cutting capability is needed, connect the stages through an observable **evidence funnel** rather than introducing another state machine that can overrule their contracts.

Reliable retrieval is not about searching more every time. It is about being able to answer: **Which original version supports this sentence? Why could this Run read it? What did the model actually see? Why can the current viewer still see it? And at which missing piece of evidence should we stop claiming certainty?**

---

Related reading: [A17 Research Assets: Source and Version](agent-research-assets-identity-version-lifecycle.md) · [PDF: From Text to Evidence](024-agent-pdf-from-text-to-evidence.md) · [Independent Citation and Claim Review](ai-citations-do-not-prove-reliability.md) · [RAG Revocation and Historical Replay](027-rag-revocation-publish-replay.md) · [RAG Retrieval Evaluation](rag-retrieval-evaluation-evidence.md)

*Evidence boundary: This end-to-end account joins verified ETF Agent mechanisms and bounded historical observations. Optional BM25 and local reranking behavior varies by environment; production model consumption and semantic investment-answer quality cannot be inferred from code presence or controlled ranking tests. The scope of the public teaching implementation is separately identified above.*