---
description: "Claude Code lets JavaScript drive several tool calls. A comparison using two ETF PDFs shows where programmatic orchestration reduces intermediate output and where a single ordinary read is enough."
readingBrief:
  takeaways:
    - "Code Mode lets a program use one tool result to construct the next call. Tool discovery, parallel batches, and offline analysis each solve a different problem."
    - "A single read costs less when it already contains the required evidence. Programmatic orchestration can reduce handoffs when a read depends on a previous search."
    - "A compact return still needs source identity, version, page numbers, and coverage from the actual reads. Each inner tool call retains its checks and accounting."
  appliesTo:
    - "Engineers designing tool orchestration for research agents or measuring model handoffs, tool costs, and evidence coverage."
  notFor:
    - "This offline experiment measures neither live model latency or token charges nor production isolation for general-purpose scripts."
---
# Is Claude Code's Code Mode Worth Bringing to a Research Agent?

An ETF's annual expenses often appear near the start of its documents. A question such as “What were VOO's one-, five-, and ten-year pre-tax returns at the end of 2025?” may take more work. A short initial read might reach only the cover, fees, and investment strategy. The next steps are to find the returns table in the same PDF, get a location, and read the text at that location. Tools can do all three. Handing control back to the model after each step makes it relay the same source reference and the returned cursor.

That resembles the work Claude Code's Code Mode is designed to handle. To see how much value it could bring to a research agent, we compared stepwise calls, programmatic orchestration, and a single wider read using public PDFs. The first surprise was that neither expense-ratio question needed orchestration.

## What Claude Code hands to a program

Claude Code's Code Mode lets the model write JavaScript for the `REPL` tool to execute. The program can make calls in parallel or wait for a result and use it to construct the next call. It might find the file containing a function, edit it, and run the test. The model continues from the program's return value. Users can still inspect the underlying calls and the script. This is an experimental feature and is off by default. The official docs separately describe `ToolSearch`, which loads deferred tool definitions, and `Workflow`, which coordinates subagents. [Code Mode](https://code.claude.com/docs/en/code-mode) · [Tools reference](https://code.claude.com/docs/en/tools-reference)

Orca 0.5.22 takes a narrower approach. Its `run_script` exposes four local read-only tools, the runtime checks each call, and the script selects what to return to the model. A research agent can adopt the execution pattern with its own source grants and evidence contracts. [Orca 0.5.22 design](https://github.com/echoVic/orca-agent/blob/v0.5.22/docs/superpowers/specs/2026-11-18-code-mode-design.md)

Our research agent can already run independent reads in one model turn. It can also pass stored, authorized results directly to isolated Python for computation. Code Mode adds a third path: **the next argument is unknown until an earlier call returns, and once it arrives, an existing tool can proceed.** A result cursor fits this case. Choosing which issuer, share class, or reporting period answers a question still calls for model judgment.

## Two PDFs and three ways to read them

The experiment used two public issuer documents. The VOO file was the April 28, 2026 summary prospectus. The SPY file was the fact sheet as of September 30, 2026. We froze the PDF bytes and ran both the stepwise and programmatic paths through the same Market MCP read interface and actual PDF text extraction. The sources were preselected, and both paths used the same search terms and read limits. [Vanguard VOO summary prospectus](https://personal1.vanguard.com/pub/Pdf/sp968.pdf) · [State Street SPY fact sheet](https://www.ssga.com/library-content/products/factsheets/etfs/us/factsheet-us-en-spy.pdf)

1. **Stepwise reads.** Read up to 3,500 characters, find the phrase, then read from the match cursor. Return all three results to the caller.
2. **Programmatic orchestration.** Make the same three calls. The program consumes the first two results and gives the caller the final one.
3. **Single read.** Use the initial short read for the expense queries. For the returns query, try a separate read of up to 22,000 characters and check whether the same page text is available.

| Target and physical PDF page | Stepwise | Programmatic | Single read |
| --- | ---: | ---: | ---: |
| VOO annual operating expenses of 0.03%, page 2 | 14,303 B | 5,327 B | 7,449 B, short read |
| SPY gross expense ratio of 0.0945%, page 1 | 15,521 B | 5,611 B | 8,404 B, short read |
| VOO pre-tax returns table, page 6 | 14,279 B | 5,316 B | 17,401 B, wider read |

The table counts bytes of MCP result JSON sent to the caller, excluding internal audit fields. For each target, the stepwise and programmatic versions retrieved the same page and text. Both made three tool calls and loaded the frozen PDF bytes once. No model participated. These are measurements of tool output, while actual model rounds, cache-adjusted token usage, costs, and user wait times need a live comparison.

The expense queries show why the stepwise path alone is a poor baseline. The program returned a smaller result, but the first short read already contained each answer. An ordinary call could have avoided two more operations. Page 6 of the VOO prospectus makes the trade-off clearer. The short read missed the pre-tax return rows. A single wider read got them, but sent back more bytes than the three bounded results combined. The program kept the three operations and returned about 5.3 KB. The wider read saved tool operations, while the targeted sequence saved result bytes.

## Keep the receipts and give the model evidence

In this example, a program can use the exact `sourceRef` and then pass the cursor returned by `find`. The successful final read supplies the excerpt behind a claim about the table. The title match provides navigation. A truncated first read, a missing keyword, and a failed target read each need to remain visible as such. “No match in the pages searched” provides a narrower conclusion than “the document does not disclose this.”

We also checked several boundaries. A different run could not reuse the source reference. A search of the read cache required an initial read, and an invented cursor returned an error. A no-match result retained the searched page range, and a valid read could still proceed after a rejected call. These are behaviors of the existing read interface. The pilot called that interface directly, outside the complete research runtime, recovery, and publication paths.

A production path would need each inner call to follow the original tool's run grant, source version, argument validation, and remaining budget. The program can return less to the model while the execution record retains each call's identity and receipt. Cancellation can then distinguish completed reads from pending ones. Recovery can reuse available results, and the model can see which evidence needs another approach. Claude Code's documentation likewise retains tool-specific permission rules and hooks. It points out that the auto-mode classifier cannot see values computed at runtime. [Claude Code permission checks](https://code.claude.com/docs/en/code-mode#permission-checks)

## Start with one chain

We implemented the sequence as a `find_and_read` operation on the public PDF reader. The model selects the document and supplies a literal phrase. In one call, the reader prepares the text, locates the first match, and reads from the issued cursor. The result uses the ordinary read's text, page numbers, coverage, and source identity. A miss returns the searched range. The citation path uses the source text that was actually read.

After wiring the operation into the research runtime, we replayed both paths with a fixed sequence of model calls. The pre-tax returns on page 6 of the VOO filing took three outer Browse calls stepwise and one with the new operation. Each path acquired the PDF once and recorded two Browse debits. Both answers carried an issuer citation. For the SPY fee on page 1, both paths used a single ordinary read. The first case shows where an intermediate handoff can be removed. The second illustrates when a simple read already does the job.

## Let the model write the call sequence

A fixed operation gives the developer control of the call sequence. Code Mode lets the model submit a program that reads tool results, chooses the next step, and selects what to return. We tried the same JavaScript against both PDFs. The SPY fee appeared on the first page, so the program returned it immediately. The first VOO read missed the returns table, so the program searched for the literal phrase and read from the resulting cursor. Both paths retained the same page number, excerpt, and issuer source as the stepwise version.

The existing nested tool interface was the main reuse point in the research runtime. The program requests public searches and reads through that interface. Each child call goes through the ordinary permission checks, hooks, budget debits, and receipts. The program can return a small excerpt with its original citation. In a replay, the actual read produced a source link in the answer. A fabricated reference produced no source link, and the independently deliverable text was preserved.

A program can return while a read is still running. In one test the worker cancelled that read as the program exited, and the parent call lost the result it already had. The adapter now lets the original executor settle the outstanding reads before it hands back the program result. The user can still receive the evidence already obtained.

The next step brought historical fund prices and instrument profiles into the same read-only interface. One program can request both in parallel, select the fields it needs, and return a compact result with the original citations. In a local test, one price request failed while the successful calls still supplied data and a usable citation. The program used the supplier tools and input schemas visible in that turn. The ordinary permissions, budgets, and receipts still applied.

That exposes a problem across turns. A program can read and filter results in one execution, but the receipt and citation serve different purposes when a later step needs the data. A citation identifies the source. Reading the data back also requires the exact read, version, and rows. We now attach the original view to the child receipt, so a program can return a summary and its original result reference together. A later turn can select a range from the captured version without contacting the supplier again. In the local PostgreSQL test, this worked for a large result, and another run under the same account could not retrieve it. We then passed references from both acquisition paths to the existing isolated Python tool and selected the same two synthetic NAV rows. Both calculations returned 110.0 and retained their respective source versions. A missing reference was refused before Python ran.

For debugging, the existing run evidence index links each child read to its parent. It distinguishes settled reads from those whose outcomes remain unknown. Inspecting those records requires no repeat dispatch.

A program also needs to know which arguments the current supplier accepts. For the same market data tool, one supplier might require `ticker` and another `symbol`. A program can now look up the input schema by name in the current turn's tool catalog and build its request from that definition. The ordinary execution path still validates arguments and permissions. In the test, both argument forms reached their respective suppliers. Hidden tools stayed out of the catalog, and an oversized definition returned a clear status while other reads could continue.

## What the model does when Code Mode is available

We then gave a live model two questions about the public PDFs. Each question ran once with direct tools and once with Code Mode available, using the same document, permissions, and runtime budget. All four answers gave the requested figures and cited the corresponding issuer pages.

Both VOO runs made 17 model requests. The enabled run called the program tool once. The program tried another search after the shared search budget was exhausted and returned the failed search result. The ordinary reader supplied the returns table. The SPY fee was on the first page, and the enabled run used direct tools throughout. The two SPY runs made nine and ten model requests, respectively.

The results separate whether the model sees the tool, chooses to use it, and obtains the needed evidence through it. Scripted replay shows that intermediate results can stay out of the model context when the sequence is known. In these two live pairs, letting the model choose yielded no observed drop in request count. Nine of 53 requests failed in transport and returned no usage, so the records cannot support a full token or cost comparison. A fixed composition still needs a same-version comparison before we can judge which approach fits this read chain best.
