---
title: "From Reading Text to Research Evidence: How We Evolved an Agent's PDF Reader"
description: "Navigable long documents, table structure, on-demand page vision, source identity and bounded acceptance evidence."
readingBrief:
  takeaways:
    - "Parsing, search coverage, page reading and model receipt are distinct facts; navigation and citations must follow delivered content rather than treating search hits as full-document review."
    - "Use text as the baseline and add tables or page images when needed, recording each scope; prove the existing Reader’s evidence gap before adding another parser."
    - "Rendering does not establish image delivery; recheck source permission at actual dispatch, and validate tool delivery, model interpretation and completed research separately."
  appliesTo:
    - "Comparing distant pages, checking table footnotes or reading scans while tracing numerical errors across acquisition, delivery, interpretation and citation."
  notFor:
    - "Treating the public selected-page text slice as a complete OCR/multimodal Reader, or extrapolating arbitrary-PDF accuracy and production cost benefits from limited samples."
---

# From Being Able to Read to Being Able to Research: Evolving PDF into Traceable Multimodal Evidence

Our initial PDF requirement for a financial-research agent was modest: fund prospectuses, index methodologies and financial statements are often published as PDFs. The agent should not claim to have analyzed an original source after seeing only a few search-result snippets.

The first design followed naturally: fetch the PDF, extract its text, and send relevant paragraphs to the model.

That can answer simple questions, but it struggles with real research. Compare metrics on the first and last pages of a report; verify the signs and units in a table; or determine whether a risk is truly absent from the document. These are no longer parsing questions alone. The important question is **whether the material received by the model supports the specific judgment it is making**.

Our PDF capability evolved in stages: original-file acquisition, resumable long-document navigation, table structure, on-demand page vision, and an evidence trail for each step.

## Reproduce the Minimal PDF Path in the Public Project

The fixed public v0.11 candidate of Open ETF Agent implements a small slice of this article in [fixed public source](https://github.com/hpoenixf/open-etf-agent/tree/9a00106703233754553acc04e49ead79fbe92cf9): explicitly select one local text-layer PDF, read a selected physical page, preserve the original file and page-text identities, and deliver them through the existing Result, report and Artifact owners. It reuses `pdf2json@4.1.0` rather than writing a PDF parser or copying the full research-reader system.

After installing and building that version, run `node dist/src/cli.mjs --case local-pdf --output runs/article-pdf` to read page one of the bundled synthetic PDF; add `--pdf-page 3` to select physical page three explicitly. An operator can instead choose a local file with `--pdf /absolute/path/document.pdf`. The tool accepts a page number, not a model-selected path or URL. Use a fresh output directory for each experiment.

The [independent installation and readback record](https://github.com/hpoenixf/open-etf-agent/blob/9a00106703233754553acc04e49ead79fbe92cf9/docs/verification/integrated-install-pdf.safe.json) checks reports, source-text hashes and original PDF bytes for pages one and three of the synthetic file. A script chooses actions; parsing, saving and independent-process readback actually execute. This is not acceptance evidence for model understanding or real fund research, nor a guarantee for arbitrary PDFs.

**The public slice does not include OCR, page images, geometric tables, search navigation, remote-file acquisition or cross-process recovery of an active parse.** The following sections preserve the original system's broader design evolution and observations; they are not a list of capabilities already shipped in public v0.11.

<!-- open-etf-case:pdf-local@e1b8e4edde724548fab16d8ca4b205379bfa7f30 -->
### Check the selected page and original file

The [exact provider-free CLI/readback case](https://github.com/hpoenixf/open-etf-agent/blob/e1b8e4edde724548fab16d8ca4b205379bfa7f30/test/pdf-cli.test.mjs) checks a local synthetic text-layer PDF through the CLI and a fresh read-only process. Install dependencies using the README at that fixed execution snapshot, then run:

```bash
node --test --test-concurrency=1 --test-name-pattern='^11\.3 PDF CLI exits then a fresh process verifies page report and original binary$' test/pdf-cli.test.mjs
```

This verifies only selected physical-page text, the saved report and original PDF byte readback. It does not qualify this article's full Reader, OCR, page images, layout, tables, PDF search, remote acquisition, multimodal interpretation or active-parse recovery.
<!-- /open-etf-case -->

## 1. Reuse the Research Pipeline, Not a Separate Agent for PDFs

PDF is a document container. A PDF can come from the public web, an authorized research file, or a tool attachment. Despite their different entry points, all should share the existing concepts of source identity, permission and research-result delivery.

Otherwise each document type gets its own tools, citation implementation and definition of trustworthiness. By sharing the research interface, later extensions primarily change **which evidence representations the same document can provide**, rather than turning PDF processing into a second research system.

The earliest failure illustrates this decision. A roughly **3.85 MiB** official PDF was rejected *before parsing* by a generic **2 MiB** web-response limit. Raising the limit globally would have helped that PDF but also expanded network-resource exposure for ordinary web pages.

Instead, after verifying that the response was a PDF, we aligned the limits for file acquisition, decoding and parser input at **10 MiB**. Ordinary web pages, parse time, returned characters and model context retained their separate constraints. That solved the known problem for that implementation; it did not promise support for arbitrarily large PDFs.

Our first lesson was: **documents may share a research interface while resource policies remain specific to their actual content types**. Obtaining a file does not grant unlimited parsing, token budgets or permission to read protected data.

## 2. From Finding One Sentence to Navigating a Long Document

When the agent began handling reports spanning dozens of pages, direct text extraction and a single keyword search became insufficient.

During a WMO report question, the model supplied the requested number and an automated evaluator marked the answer correct. A review of the tool trace told a different story: the model treated its keyword-search hits as the full scope checked, and inferred that material it had never actually read was absent from the report.

A number can be correct while the claimed research process does not support the surrounding conclusion.

Simply returning more text does not solve this. Larger reports increase context pressure, while extra characters still do not say which pages were scanned, which paragraphs were returned, or what remains entirely unchecked.

We evolved the Reader into a navigable interface:

- **Search** reports hits and the actual scanning range. A cursor tied to the original query can continue through later pages when necessary.
- **Locate** provides valid page and passage coordinates issued by the Reader, rather than accepting arbitrary page references invented by a model.
- **Read** delivers available body text together with source identity and the real reading range. Pages not read remain explicitly unread.

This matters operationally. We saw the model try to read an unsigned page location and receive INVALID_LOCATOR. It could proceed only after obtaining legitimate locators for pages **18 and 19** through search, then reading the relevant text. A useful recovery instruction is better than silently accepting a forged location.

Another subtle issue concerns coordinates. A parser knowing the original page of a passage does not mean the text ultimately shown to the model still has the same offsets. Slicing, capacity trimming and redaction may change them. In one actual response, a quotation from page **3** was labeled page **2**.

Later changes recomputed page ranges from **the content actually delivered**. If a transformation cannot preserve coordinates, it must not expose obsolete offsets.

“Document parsed,” “search range covered,” “page read” and “model request received the text” thus became distinct facts. Together they make cross-page comparisons and page citations defensible. We still do not claim that searching every page is the same as semantically understanding the whole report.

## 3. Structured Tables Complement Text Reading

The next financial-document problem was tables. PDFs tend to preserve glyphs and drawing coordinates, but may not identify which figures belong in the same column. As the [pypdf documentation on text extraction](https://pypdf.readthedocs.io/en/stable/user/extract-text.html) explains, extracting text is not equivalent to recovering table semantics.

We did not try to fix missing row/column relationships merely by prompting the model to “look carefully.” Information lost at the input stage cannot be reliably reconstructed through phrasing.

Instead, the same PDF can expose table structure on demand alongside text: which page contains a table, which rows and columns were actually returned, and which content was omitted because of capacity limits.

This does not supersede text reading. A no-tables result from the structure detector may still leave useful plain text. Even when a table is accurately delivered, the model can make mistakes: an index-document exercise passed five correct table rows to the request, but the eventual count was still wrong.

That distinction changes diagnosis. Structural extraction, data delivery, model interpretation and evidential support are different checkpoints. Not every numerical failure is a Parser defect.

We later compared the existing Reader with Docling using **the same public PDFs, physical pages, and manually checked headers and footnotes**. The outcome challenged the assumption that a newer parser must be better: the existing Reader preserved the examined row relationships and notes, while Docling could extract tables and values yet missed important header classifications and note associations. **Table extraction matters when it preserves the relationships needed to support a claim—not when it merely returns more tables.**

Docling was therefore connected only as a **disabled-by-default, optional table supplement**. An operator must explicitly enable it in a restricted offline environment; it reads only previously authorized pages, and failure does not displace the existing Reader's result. Scoped engineering and public-document checks show that the optional path can operate, not that it improves financial answers. Scanned/OCR documents were outside this comparison. The transferable choice is to **prove which critical evidence the default path lacks before adding another parser**.

Tables also introduced resource coordination. Serial operations within one Reader protect its cache and cursors, but do not limit parsing Workers started simultaneously by public PDF reads, research files and other entry points.

We connected text and table parsers to a shared, process-level bounded executor that controls active Workers and queue capacity. Waiting remains subject to caller cancellation and an absolute deadline. Individual Readers continue owning their queries, caches and sources.

The goal was not to claim an unmeasured throughput improvement. It was to place resource ownership correctly: **when several entry points share infrastructure, the common execution layer must own aggregate limits rather than leaving each caller to impose its own**.

## 4. From Text Reading to On-Demand Page Vision

Long-document navigation and structured tables still cannot fully address scans, charts and complex layouts. We therefore added the ability to let a vision-capable model see an original rendered page when the task warrants it.

We deliberately did not make “render every page and send every image” the default. For text-readable reports, that wastes parsing and image capacity while making citations, page coordinates and provenance harder to maintain.

The design supplements text with optional table structures and page images, provided the task needs them and the current rendering environment is authorized. All three paths feed the same research evidence chain, but each records its **own actual coverage**.

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

The hardest visual issue was **image identity and dispatch timing**. A rendered image is not necessarily included in a model request. Permission valid at initial page acquisition may have been revoked by the time an asynchronous send actually begins.

In a concurrent counterexample, a source was revoked but a stale page image was still dispatched. We later aligned current source validation and physical dispatch with the original source owner's execution boundary. A request that physically started must leave a real dispatch fact even if a later transaction fails; failure cannot rewrite it into “never sent.”

A separate scanned-document case exposed an image-only source that was first registered without a content hash. Subsequent integrity checking denied the read, and **zero images actually reached the model input**. Calling this a vision-model misread would be incorrect: the model never saw an image. Later acceptance work checked render result, current source authorization, actual image inclusion and recognition outcomes separately.

The capability is therefore **controlled page-by-page visual reading**, not a standalone whole-document OCR engine. Sending an image does not certify every scanned number.

## 5. Research Tasks, Not Tool Contracts Alone, Demonstrate Usefulness

These mechanisms turn a PDF from a parseable file into a navigable, locatable research source with optional visual evidence. Whether they improve answers requires independent real-model tasks.

In mid-October 2026, controlled evaluation used real models, public financial sources and synthetic documents with independently verifiable answers. Several examples are instructive:

| Research question | Observed result | What it does not prove |
| --- | --- | --- |
| Dates, metrics, conclusions and page references in a six-page report | The reader finished and the target fields matched | Robustness across every PDF layout |
| Comparing metrics at opposite ends of a 36-page report | Correct page references, figures and difference within **nine model requests** | Deep semantic review of all 36 pages |
| A scanned financial table and chart | Real page images reached the request; specified numbers, units and trends were largely correct | Complete character accuracy or interpretations strictly bounded to the original text |

These were capability-acceptance samples, not statistics for large-scale financial-document success. We also observed misread scan indices, overextended table interpretations and repeated searches that exhausted run budgets.

Surprisingly, one failed short-report test was not caused by the PDF Reader at all. An older evaluation script enforced an extra **four-model-request limit**, while the product Runtime allowed more. The evaluator killed a legitimate research process first. Once that conflicting outer restriction was removed, the six-page task completed normally.

The evaluation sequence changed accordingly: verify file acquisition, actual text or image delivery, model interpretation, citation range and final output in order. Separately examine whether the evaluator's own limits have changed the behavior being tested.

**Tool execution, model comprehension and research completion are not interchangeable**.

## 6. How Is the Current PDF Reader Different?

At first we wanted to put PDF text into the model's context. Now we want to provide **checkable evidence for a specific research question**.

The original text capability remains, while additional layers address content-specific resource limits, cross-page navigation and coverage, structured tables, on-demand vision, source identity and final-content coordinates. We try to place complexity with the Reader, parser executor or source owner that already owns the relevant facts. Research Runtime coordinates without having to interpret PDF-specific semantics itself.

Some real-model samples demonstrate successful multipage reading, cross-page comparison, scanned tables and chart questions. Other evidence still shows unstable recognition, interpretive scope and convergence on harder tasks. There is no reliable long-term production success rate or measured overall cost-benefit comparison.

Nevertheless the original requirement yielded an extensible design:

**Search tells the model where it can read next. The Reader says what was actually delivered. The model interprets the material. Provenance and coverage are not facts the model may invent.**

As documents grow more complex, that separation is more valuable than adding an ever-more-powerful “PDF tool.”
