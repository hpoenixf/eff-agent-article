---
title: "The RAG lifecycle now has one combined article"
search: false
outline: false
---

<script setup>
import { onMounted } from 'vue'
import { withBase } from 'vitepress'

onMounted(() => {
  window.location.replace(withBase('/en/articles/agent-knowledge-retrieval-end-to-end') + window.location.hash)
})
</script>

# The RAG lifecycle now has one combined article

The panorama and knowledge-retrieval articles are combined into one path through acquisition, parsing, chunking, indexing, queries, retrieval, reranking, context, citations, evaluation and updates.

[Read the combined article: The RAG Lifecycle: From Document Ingestion to Cited Answers](agent-knowledge-retrieval-end-to-end.md)

Existing bookmarks and section links remain usable. With JavaScript enabled, this page carries the original fragment to the combined article. The matching links below also work directly.

<span id="the-full-rag-lifecycle-from-knowledge-ingestion-to-a-trustworthy-agent-answer"></span>

[The Full RAG Lifecycle: From Knowledge Ingestion to a Trustworthy Agent Answer](agent-knowledge-retrieval-end-to-end.md#the-full-rag-lifecycle-from-knowledge-ingestion-to-a-trustworthy-agent-answer)

<span id="_1-the-big-picture-one-user-question-four-kinds-of-work"></span>

[1. The big picture: one user question, four kinds of work](agent-knowledge-retrieval-end-to-end.md#_1-the-big-picture-one-user-question-four-kinds-of-work)

<span id="_2-before-knowledge-enters-the-system-what-do-we-actually-possess"></span>

[2. Before knowledge enters the system: what do we actually possess?](agent-knowledge-retrieval-end-to-end.md#_2-before-knowledge-enters-the-system-what-do-we-actually-possess)

<span id="a-report-has-three-distinct-identities"></span>

[A report has three distinct identities](agent-knowledge-retrieval-end-to-end.md#a-report-has-three-distinct-identities)

<span id="extraction-coverage-matters-more-than-the-number-of-chunks"></span>

[Extraction coverage matters more than the number of chunks](agent-knowledge-retrieval-end-to-end.md#extraction-coverage-matters-more-than-the-number-of-chunks)

<span id="updating-a-source-is-a-conditional-state-change"></span>

[Updating a source is a conditional state change](agent-knowledge-retrieval-end-to-end.md#updating-a-source-is-a-conditional-state-change)

<span id="_3-an-online-query-is-not-search-the-user-s-text-across-everything"></span>

[3. An online query is not “search the user's text across everything”](agent-knowledge-retrieval-end-to-end.md#_3-an-online-query-is-not-search-the-user-s-text-across-everything)

<span id="why-hard-filters-must-precede-top-k"></span>

[Why hard filters must precede Top-K](agent-knowledge-retrieval-end-to-end.md#why-hard-filters-must-precede-top-k)

<span id="lexical-search-vectors-fusion-and-reranking-solve-different-problems"></span>

[Lexical search, vectors, fusion and reranking solve different problems](agent-knowledge-retrieval-end-to-end.md#lexical-search-vectors-fusion-and-reranking-solve-different-problems)

<span id="_4-what-often-disappears-is-proof-that-the-model-actually-saw-the-chunk"></span>

[4. What often disappears is proof that the model actually saw the chunk](agent-knowledge-retrieval-end-to-end.md#_4-what-often-disappears-is-proof-that-the-model-actually-saw-the-chunk)

<span id="externalized-results-make-the-model-read-it-especially-easy-to-overclaim"></span>

[Externalized results make “the model read it” especially easy to overclaim](agent-knowledge-retrieval-end-to-end.md#externalized-results-make-the-model-read-it-especially-easy-to-overclaim)

<span id="which-parts-of-an-answer-are-genuinely-supported"></span>

[Which parts of an answer are genuinely supported?](agent-knowledge-retrieval-end-to-end.md#which-parts-of-an-answer-are-genuinely-supported)

<span id="_5-a-document-can-lose-disclosure-eligibility-after-the-model-has-read-it"></span>

[5. A document can lose disclosure eligibility after the model has read it](agent-knowledge-retrieval-end-to-end.md#_5-a-document-can-lose-disclosure-eligibility-after-the-model-has-read-it)

<span id="_6-divide-responsibilities-rather-than-invent-a-rag-manager-for-everything"></span>

[6. Divide responsibilities rather than invent a RAG manager for everything](agent-knowledge-retrieval-end-to-end.md#_6-divide-responsibilities-rather-than-invent-a-rag-manager-for-everything)

<span id="_7-evaluate-where-evidence-was-first-lost"></span>

[7. Evaluate where evidence was first lost](agent-knowledge-retrieval-end-to-end.md#_7-evaluate-where-evidence-was-first-lost)

<span id="_8-when-is-full-rag-worth-it—and-when-should-we-keep-things-simple"></span>

[8. When is full RAG worth it—and when should we keep things simple?](agent-knowledge-retrieval-end-to-end.md#_8-when-is-full-rag-worth-it—and-when-should-we-keep-things-simple)

<span id="_9-walk-the-2023-notice-question-through-the-system-again"></span>

[9. Walk the 2023 notice question through the system again](agent-knowledge-retrieval-end-to-end.md#_9-walk-the-2023-notice-question-through-the-system-again)

[The fixed pre-merge edition](https://github.com/hpoenixf/eff-agent-article/blob/a629e450e9e3a505089b54d68a14eaecf3b9a2fb/en/articles/rag-end-to-end-system-panorama.md)
