---
title: "Reading a PDF Is Not the Same as Completing the Research"
description: "Navigable long documents, table structure, on-demand page vision, source identity and bounded acceptance evidence."
readingBrief:
  takeaways:
    - "Parsing, search coverage, page reading and model receipt are distinct facts; navigation and citations must follow delivered content rather than treating search hits as full-document review."
    - "Use text as the baseline and add tables or page images when needed, recording each scope; prove the existing Reader’s evidence gap before adding another parser."
    - "Rendering does not establish image delivery; use the same Run grant while checking source identity, actual input and dispatch, then validate interpretation and completion separately."
  appliesTo:
    - "Comparing distant pages, checking table footnotes or reading scans while tracing numerical errors across acquisition, delivery, interpretation and citation."
  notFor:
    - "Treating the public selected-page text slice as a complete OCR/multimodal Reader, or extrapolating arbitrary-PDF accuracy and production cost benefits from limited samples."
---

# Reading a PDF Is Not the Same as Completing the Research

Compare a metric on the first and last pages, check a table's minus signs, units and footnotes, then decide whether the report mentions a particular risk. These questions need different evidence. A search hit can locate one page without reading another; a complete set of numbers can still lose the header that gives them meaning.

The current PDF Reader is organized around one question: **which judgment is supported by the material the model actually received?** Text is the default, with tables and page images added when needed. All three share document identity but record coverage separately. This is not a pipeline that turns every PDF into images first.

Consider a teaching example of a cross-page comparison. Acquire an authorized document, obtain valid locations through search, and read both passages. If a unit depends on a merged header, add the structure or footnote; if a page is only a scan, request its image. Pass the actual delivered scope and citations to the answer owner. After reading only the first page, the next step is to obtain the other passage or narrow the conclusion, not promote “file parsed” into “whole report reviewed.”

The following sections explain the current choices and costs. Historical counterexamples retain their original scope; they are not combined into one successful end-to-end run, and the task samples below are not long-term production accuracy statistics.

## Reproduce the Minimal PDF Path in the Public Project

The fixed public v0.11 candidate of Open ETF Agent implements a small slice of this article in [fixed public source](https://github.com/hpoenixf/open-etf-agent/tree/9a00106703233754553acc04e49ead79fbe92cf9): explicitly select one local text-layer PDF, read a selected physical page, preserve the original file and page-text identities, and deliver them through the existing Result, report and Artifact owners. It reuses `pdf2json@4.1.0` rather than writing a PDF parser or copying the full research-reader system.

After installing and building that version, run `node dist/src/cli.mjs --case local-pdf --output runs/article-pdf` to read page one of the bundled synthetic PDF; add `--pdf-page 3` to select physical page three explicitly. An operator can instead choose a local file with `--pdf /absolute/path/document.pdf`. The tool accepts a page number, not a model-selected path or URL. Use a fresh output directory for each experiment.

The [independent installation and readback record](https://github.com/hpoenixf/open-etf-agent/blob/9a00106703233754553acc04e49ead79fbe92cf9/docs/verification/integrated-install-pdf.safe.json) checks reports, source-text hashes and original PDF bytes for pages one and three of the synthetic file. A script chooses actions; parsing, saving and independent-process readback actually execute. This is not acceptance evidence for model understanding or real fund research, nor a guarantee for arbitrary PDFs.

**The public slice does not include OCR, page images, geometric tables, search navigation, remote-file acquisition or cross-process recovery of an active parse.** The following sections explain the original system's broader design and historical observations; they are not a list of capabilities already shipped in public v0.11.

<!-- open-etf-case:pdf-local@e1b8e4edde724548fab16d8ca4b205379bfa7f30 -->
### Check the selected page and original file

The [exact provider-free CLI/readback case](https://github.com/hpoenixf/open-etf-agent/blob/e1b8e4edde724548fab16d8ca4b205379bfa7f30/test/pdf-cli.test.mjs) checks a local synthetic text-layer PDF through the CLI and a fresh read-only process. Install dependencies using the README at that fixed execution snapshot, then run:

```bash
node --test --test-concurrency=1 --test-name-pattern='^11\.3 PDF CLI exits then a fresh process verifies page report and original binary$' test/pdf-cli.test.mjs
```

This verifies only selected physical-page text, the saved report and original PDF byte readback. It does not qualify this article's full Reader, OCR, page images, layout, tables, PDF search, remote acquisition, multimodal interpretation or active-parse recovery.
<!-- /open-etf-case -->

<span id="from-being-able-to-read-to-being-able-to-research-evolving-pdf-into-traceable-multimodal-evidence"></span>
<span id="_1-reuse-the-research-pipeline-not-a-separate-agent-for-pdfs"></span>

## 1. Choose an Evidence Representation Before Paying for More Parsing

| What needs checking? | Start with | Retain this limitation |
| --- | --- | --- |
| Passages, dates and explicit figures | Text with valid page or passage locations | It establishes only the returned scope |
| Row/column membership, merged headers or notes | Same-page table structure alongside text | `no-tables` need not mean no usable text; successful extraction need not preserve meaning |
| Scanned characters, charts or visual layout | Page images in an authorized rendering environment | Rendering and delivery are separate; recognition can still be wrong |

PDF is a document container. A PDF can come from the public web, an authorized research file, or a tool attachment. Despite their different entry points, all should share the existing concepts of source identity, permission and research-result delivery.

Sharing the research interface means extensions primarily change **which evidence representations the same document can provide**, rather than turning PDF processing into a second research system.

The earliest failure illustrates this decision. A roughly **3.85 MiB** official PDF was rejected *before parsing* by a generic **2 MiB** web-response limit. Raising the limit globally would have helped that PDF but also expanded network-resource exposure for ordinary web pages.

That repair verified the PDF response type and aligned the limits for file acquisition, decoding and parser input at **10 MiB**. Ordinary web pages, parse time, returned characters and model context retained their separate constraints. That addressed the known problem in that implementation, not arbitrarily large PDFs. In the current source examined here, this PDF path is capped at 15 MiB while the corresponding Spec still says 10 MiB. Those sources disagree; neither the deployed limit nor a current guarantee should be inferred from the old value.

Our first lesson was: **documents may share a research interface while resource policies remain specific to their actual content types**. Obtaining a file does not grant unlimited parsing, token budgets or permission to read protected data.

<span id="_2-from-finding-one-sentence-to-navigating-a-long-document"></span>

## 2. Search Locates the Next Read, Not Proof of Complete Understanding

A report spanning dozens of pages need not fit one return. A simple keyword query can find an entry point, but a claim that a risk is absent also requires knowing what was searched and what was actually read.

During a WMO report question, the model supplied the requested number and an automated evaluator marked the answer correct. A review of the tool trace told a different story: the model treated its keyword-search hits as the full scope checked, and inferred that material it had never actually read was absent from the report.

A number can be correct while the claimed research process does not support the surrounding conclusion.

Simply returning more text does not solve this. Larger reports increase context pressure, while extra characters still do not say which pages were scanned, which paragraphs were returned, or what remains entirely unchecked.

The current Reader separates the results of three operations:

- **Search** reports hits and the actual scanning range. A cursor tied to the original query can continue through later pages when necessary.
- **Locate** provides valid page and passage coordinates issued by the Reader, rather than accepting arbitrary page references invented by a model.
- **Read** delivers available body text together with source identity and the real reading range. Pages not read remain explicitly unread.

This matters operationally. We saw the model try to read an unsigned page location and receive INVALID_LOCATOR. The corresponding replay without model calls retained the original invalid requests, obtained legitimate locators for pages **18 and 19** through search, and successfully read the text. This demonstrated a usable recovery path, not a newly passing rerun of that live model task. A useful recovery instruction is better than silently accepting a forged location.

Another subtle issue concerns coordinates. A parser knowing the original page of a passage does not mean the text ultimately shown to the model still has the same offsets. Slicing, capacity trimming and redaction may change them. In one actual response, a quotation from page **3** was labeled page **2**.

The current path computes page ranges from **the content actually delivered**. If a transformation cannot preserve coordinates, it must not expose obsolete offsets.

“Document parsed,” “search range covered,” “page read” and “model request received the text” are distinct facts. Together they make cross-page comparisons and page citations defensible. We still do not claim that searching every page is the same as semantically understanding the whole report.

<span id="_3-structured-tables-complement-text-reading"></span>

## 3. Compare Parsers Against the Same Claim, Not the Number of Tables

Financial tables make semantic preservation especially important. PDFs tend to preserve glyphs and drawing coordinates, but may not identify which figures belong in the same column. As the [pypdf documentation on text extraction](https://pypdf.readthedocs.io/en/stable/user/extract-text.html) explains, extracting text is not equivalent to recovering table semantics.

Asking a model to “look carefully” cannot reliably restore row/column relationships already lost at the input stage.

Instead, the same PDF can expose table structure on demand alongside text: which page contains a table, which rows and columns were actually returned, and which content was omitted because of capacity limits.

This does not supersede text reading. A no-tables result from the structure detector may still leave useful plain text. Even when a table is accurately delivered, the model can make mistakes: an index-document exercise passed five correct table rows to the request, but the eventual count was still wrong.

That distinction changes diagnosis. Structural extraction, data delivery, model interpretation and evidential support are different checkpoints. Not every numerical failure is a Parser defect.

A mature document converter is a reasonable alternative. [Docling's architecture](https://docling-project.github.io/docling/concepts/architecture/) separates format backends, conversion pipelines and document representation; its [table export example](https://docling-project.github.io/docling/_generated/examples/export_tables/) feeds DataFrames, CSV and HTML. That is a direct route when the task is offline batch conversion for downstream consumers. It also supports [offline operation after model prefetching](https://docling-project.github.io/docling/usage/advanced_options/#model-prefetching-and-offline-usage). It is a configurable option, not an opaque all-document scan.

Our local system already had query continuation, delivered-scope records and source binding. A second parser therefore needed an identifiable evidence gap to fill. One comparison used **the same public PDFs, physical pages, and manually checked headers and footnotes** to evaluate the existing Reader against Docling. Neither “newer is better” nor “our Reader gets everything right” fits the result. For the index document, plain text lost same-row holdings relationships; the existing table reader preserved them. Docling extracted the cells but missed some annual-header classifications and a footnote. In a fund quarterly report, both preserved the relevant notes and neither joined the table continued across pages. Both retained ten rows on another checked page pair, while Docling still missed header flags. **Table extraction matters when it preserves the relationships needed to support a claim—not when it merely returns more tables.**

Docling is therefore connected only as a **disabled-by-default, optional table supplement**. An operator must explicitly enable it in a restricted offline environment; it reads only previously authorized pages, and failure does not displace the existing Reader's result. Scoped engineering and public-document checks show that the optional path can operate, not that it improves financial answers. Scanned/OCR documents were outside this comparison. The transferable choice is to **prove which critical evidence the default path lacks before adding another parser**.

An optional parser adds resource coordination as well as dependency maintenance. Serial operations within one Reader protect its cache and cursors, but do not limit parsing Workers started simultaneously by public PDF reads, research files and other entry points.

Text and table parsers currently use a shared, process-level bounded executor that controls active Workers and queue capacity. Waiting remains subject to caller cancellation and an absolute deadline. Individual Readers continue owning their queries, caches and sources.

The goal was not to claim an unmeasured throughput improvement. It was to place resource ownership correctly: **when several entry points share infrastructure, the common execution layer must own aggregate limits rather than leaving each caller to impose its own**.

<span id="_4-from-text-reading-to-on-demand-page-vision"></span>

## 4. Image Availability, Permission and Dispatch Are Different Facts

Long-document navigation and tables do not fully address scans, charts and complex layouts. Page-level supplementation lets a vision-capable model see an original page when needed. A task requiring offline whole-document OCR should use a corresponding conversion workflow rather than treating this Reader as that engine.

We deliberately did not make “render every page and send every image” the default. For text-readable reports, that wastes parsing and image capacity while making citations, page coordinates and provenance harder to maintain.

The design supplements text with optional table structures and page images within the original Run scope. Page rendering is disabled by default and needs an explicitly enabled, qualified environment. All three paths feed the same research evidence chain, but each records its **own actual coverage**.

~~~mermaid
flowchart TD
  A["Authorized document"] --> R["PDF Reader"]
  R --> T["Text evidence"]
  R --> B["Structured table evidence"]
  R --> I["Page image evidence"]
  T --> P["Authorized source projection"]
  B --> P
  I --> P
  P --> M["Model research"]
  M --> D["Published answer"]
~~~

The three evidence paths are optional capabilities, not mandatory successive steps for every research question.

The difficult part is **image identity and dispatch timing**. The current same-Run path uses the Host's recorded grant, including suspension and recovery; it does not query current ACL state before every send. Source, scope, original PDF identity, page-image identity and actual request images must still correspond. A valid original grant does not make missing bytes available or authorize an unrelated Run.

One historical counterexample needs its original context. Under the older dynamic-revocation contract, a source had been revoked but a stale image was still sent. The repair then aligned current-source validation and physical dispatch with the source owner's execution boundary. Same-Run immediate revocation is no longer today's contract. A different lesson still applies: once a request physically starts, it must leave a dispatch fact even if a later transaction fails; failure cannot rewrite it into “never sent.”

A separate scanned-document case exposed an image-only source that was first registered without a content hash. Subsequent integrity checking denied the read, and **zero images actually reached the model input**. Calling this a vision-model misread would be incorrect: the model never saw an image. Later acceptance work checked rendering, source identity, actual image inclusion and recognition outcomes separately.

The capability is therefore **controlled page-by-page visual reading**, not a standalone whole-document OCR engine. Sending an image does not certify every scanned number.

<span id="_5-research-tasks-not-tool-contracts-alone-demonstrate-usefulness"></span>

## 5. Separate Acquisition, Delivery and Interpretation When Diagnosing Errors

A successful tool return establishes one step. Diagnose acquisition, delivered content, model interpretation, page references and final answers separately; each established fact narrows the next question. Whether the mechanisms improve answers requires real-model tasks.

In mid-October 2026, controlled evaluation used real models, public financial sources and synthetic documents with independently verifiable answers. Several examples are instructive:

| Research question | Observed result | What it does not prove |
| --- | --- | --- |
| Dates, metrics, conclusions and page references in a six-page report | The reader finished and the target fields matched | Robustness across every PDF layout |
| Comparing metrics at opposite ends of a 36-page report | Correct page references, figures and difference within **nine model requests** | Deep semantic review of all 36 pages |
| A scanned financial table and chart | Real page images reached the request; specified numbers, units and trends were largely correct | Complete character accuracy or interpretations strictly bounded to the original text |

These were capability-acceptance samples, not statistics for large-scale financial-document success. We also observed misread scan indices, overextended table interpretations and repeated searches that exhausted run budgets.

Surprisingly, one failed short-report test was not caused by the PDF Reader at all. An older evaluation script enforced an extra **four-model-request limit**, while the product Runtime allowed more. The evaluator killed a legitimate research process first. Once that conflicting outer restriction was removed, the six-page task completed normally.

Also check whether the evaluator's own limits have changed the behavior being tested.

**Tool execution, model comprehension and research completion are not interchangeable**.

<span id="_6-how-is-the-current-pdf-reader-different"></span>

## 6. When Is a More Complex Reader Worthwhile?

If the task only needs a selected page from a clean text-layer PDF, direct extraction is usually simpler; the public exercise preserves precisely that slice. For offline whole-document conversion, evaluate an existing converter and its outputs before building interactive navigation.

Query continuation and coverage records become valuable when research repeatedly compares distant passages, checks headers against footnotes, or must distinguish “not found” from “not read.” They cost query state, source identities, parser queues and separate coverage records; they can also require more model turns. An architecture diagram cannot establish that those costs already buy a higher success rate.

Three decisions capture the current approach:

1. Start with the simplest adequate representation. Add structure for missing relationships and images for missing visual information.
2. Compare the same page, header and proposed claim before deciding that a second parser adds value.
3. When an answer is wrong, inspect the material actually sent before deciding whether to change extraction, interpretation or execution limits.

Real-model samples have completed multipage reading, cross-page comparisons and some scanned-table and chart questions. Other records contain recognition errors, overextended interpretations and non-convergent exploration. They support discussion of specific mechanisms, not a long-term production success rate or overall cost-benefit conclusion.

**Search identifies where to read next. The Reader records what was actually delivered. The model interprets the material; it does not invent provenance or coverage facts.**
