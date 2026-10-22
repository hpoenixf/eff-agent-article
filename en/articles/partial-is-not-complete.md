---
title: "The Source Had 50 Records, but the Model Saw Only 20: Debugging Silent Truncation"
description: "Completeness of finite result sets, coverage metadata, identity reconciliation, honest partial answers and regression tests."
---

# The Source Had 50 Records. Why Did the Model See Only 20?

Some agent failures are extraordinarily difficult to debug.

They produce no error, no timeout, and logs that may all say success. The model returns a coherent, seemingly complete answer. But a large portion of the required evidence was missing before inference began.

One recent example had **50 records at the source** and just **20 records in the actual model context**. The remaining 30 generated no obvious error, empty value or warning. The model simply summarized the twenty records it had.

Looking only at the final prose, one might never realize the answer was based on a partial dataset.

The lesson changed how I debug agents:

> An agent may not be “wrong after seeing all the evidence.” It may never have received the complete evidence in the first place.

The latter is often harder to see.

## At First, I Blamed Unstable Answer Quality

Initially the behavior looked like ordinary LLM variability. With similar input data, some summaries seemed comprehensive while others omitted later entries.

The obvious hypotheses were context length, model attention, model choice or stronger prompts such as “do not omit any item.”

Investigating the earlier stages showed that those interventions were aimed at the wrong place: **the model never had a chance to see the omitted records**.

~~~text
Authoritative data source
       ↓
Read / filter / quota limits
       ↓
Prepare actual model input
       ↓
Model summarization or explanation
       ↓
Final answer
~~~

The failure occurred before the LLM.

~~~mermaid
flowchart LR
  S["Authoritative data source"] --> F["Read and filter"]
  F --> Q["Entry and byte quotas"]
  Q --> I["Actual model input"]
  I --> A["Model answer"]
  Q --> C["Coverage status"]
  C --> A
~~~

Coverage must accompany the delivered content. If a downstream stage knows it loaded 20 records but not that 30 more were expected, a fluent summary hides an input gap.

The source had fifty records; an intermediate layer allowed only twenty. To the model, those twenty constituted the entire visible world. It could not infer the missing thirty, nor did it have a sound reason to warn about them.

The resulting answer was syntactically valid and might contain no obvious hallucinations, yet its **factual coverage was incomplete**. That is different from reasoning wrongly about a complete input.

## The First Check: How Much Data Did the Model Actually Receive?

Instead of changing the prompt first, we moved the check earlier and asked five basic questions:

~~~text
How many records were present at the source?
How many did the caller request?
How many actually entered the model request?
Did a byte quota truncate any content?
Were records skipped during parsing or filtering?
~~~

Previously this information was scattered through implementation details. We made it explicit:

~~~json
{
  "requested": 50,
  "loaded": 20,
  "byteComplete": true,
  "filteredCount": 0,
  "inputComplete": false,
  "reason": "entry_limit"
}
~~~

The important part is not the exact field names. It is that **code can now state that the model input does not cover the full target set**.

The model should not have to guess that fact from prose. When inputComplete is false, the subsequent answer must not pretend to draw conclusions about an entire population.

## Even 50 out of 50 Does Not Establish Answer Quality

A new temptation appears once the fields exist:

~~~text
requested = 50
loaded = 50
filtered = 0
byteComplete = true
~~~

Can we now declare that the answer is trustworthy?

No. At most, this says that according to recorded processing steps, the fifty target records entered the input without known count, byte or filter loss.

It does not prove that the model made meaningful use of all fifty. It may omit entry 47 or a crucial exception.

Nor does it prove that the conclusion is correct. Reasoning can fail even with complete input.

I therefore separate three levels of completeness:

~~~text
Is the source target set fully defined?
              ↓
Did the complete target input reach the model?
              ↓
Does the final answer correctly cover the evidence?
~~~

### Level One: The Source Set Is Defined

Examples include a user's present holdings, 120 returned database rows, sixteen sections of one document, or eight expected API pages.

Here the concept of a complete target set has a concrete meaning.

### Level Two: The Model Input Covers the Target Set

This is the main engineering issue in this article.

Did the entire holdings list reach the next stage? Did a 120-row query silently yield the first 100? Did an eight-page API read fail on page seven while the system still marked the job complete?

### Level Three: The Final Answer Is Correct

Does the model omit an item, cite the wrong passage or misattribute a result? Those questions still require independent evaluation.

inputComplete=true is **not** a certificate of model quality. It merely prevents obviously incomplete input from masquerading as a normal complete answer.

## Counting Records Alone Can Also Produce False Completeness

Consider an expected set:

~~~text
A B C D E
~~~

The intermediate result contains:

~~~text
A B C D D
~~~

Both have five entries. requested == loaded, but E is missing and D appears twice.

If the target finite set has stable identities, add identity reconciliation:

~~~json
{
  "expectedCount": 5,
  "loadedCount": 5,
  "expectedIdsHash": "sha256:...",
  "loadedIdsHash": "sha256:...",
  "inputComplete": false,
  "reason": "identity_mismatch"
}
~~~

A real system need not use a hash specifically. Item-ID sets, page cursors, snapshot versions, offset ranges, continuation tokens or the source system's revision may provide the appropriate identity proof.

**Equal counts are a useful signal, not sufficient evidence**. Getting 100 rows does not prove they are the *correct* 100 rows.

## Some Research Tasks Have No Enumerable Universe

This contract needs an important scope limit.

It works for holdings lists, database queries, file manifests, paginated APIs, specified documents and bounded tool results—things where “complete” has a defined meaning.

But consider:

> Find every important piece of information on the internet about this company.

There is no naturally enumerable set of all relevant pages. A search engine returning twenty results does not mean the world contains only twenty relevant documents.

Here an appropriate statement is **“the current search plan was executed,”** not **“all relevant knowledge was covered.”**

**Process completion, complete input for a finite target and complete knowledge of the world are three different concepts.**

## Three Ways Data Disappears Silently

### 1. Entry-Count Truncation

The most obvious case is fifty source entries meeting a twenty-entry cap. The other thirty vanish before inference.

Without preserving the original count, subsequent stages may have no evidence of the loss.

### 2. Byte-Count Truncation

A second case is subtler. The number of entries is below the entry cap, but a few entries are long. Once a byte budget is reached, the tail is removed.

The system may still report:

~~~text
requested = 20
loaded = 20
~~~

But the twentieth record is only half present.

Count completeness and byte completeness must be measured independently.

### 3. Filtering and Parsing Discards

One record may have malformed data, a missing field, incompatible schema or a transformation that throws and gets silently caught.

The pipeline may skip that record and still produce a well-formed input. The denominator changed invisibly.

That is why “read succeeded” is an inadequate status. It could mean the network request succeeded, at least one record loaded, every expected record loaded, or every expected byte survived. Those claims differ substantially.

## Quotas Cannot Simply Be Increased Forever

The easiest initial fix for fifty records being cut to twenty is to change the limit to sixty. That solved the immediate example.

It does not mean the lesson is “always allow more context.”

Longer input has higher latency and token costs, may distribute model attention more thinly, makes retries more expensive, and allows extreme input to exhaust a request.

A useful quota is not an infinitely large quota. It is one that makes **incomplete work observable**.

When a dataset exceeds a safe one-shot size, a better pattern may be:

~~~text
Read in batches
→ Record coverage per batch
→ Store structured intermediate results
→ Aggregate at the end
~~~

Rather than:

~~~text
Discover truncation
→ Increase the limit
→ Discover truncation again later
~~~

The problem is not that limits exist. **The problem is silent limits**.

## A Regression Test for Tail Loss

The mechanism became more reliable when we deliberately constructed a failing input.

For an entry limit of sixty, prepare **65 records** and place decisive information in the final few entries. This forces an old truncating implementation to reveal itself.

The assertion should not stop at “the function returned a result.” It should inspect:

~~~text
requested = 65
loaded = 60
inputComplete = false
reason = entry_limit
~~~

For byte truncation:

~~~text
byteComplete = false
inputComplete = false
reason = byte_truncated
~~~

For dropped records:

~~~text
filteredCount > 0
inputComplete = false
reason = filtered
~~~

Such tests matter because tiny fixtures of five or ten entries may never exercise a truncation branch. The first time that branch is taken might otherwise be in production.

## Partial Results Must Not Automatically Mean “No Answer”

I also revised an earlier, overly conservative rule.

Initially we said that incomplete input should permit only a draft, never a definite conclusion. That is safer than pretending to know the full set, but too broad.

Partial evidence does not invalidate *every* possible claim.

Suppose we have read eighty of a hundred holdings. We cannot say “these are your complete portfolio exposures.” But if asked whether any of the **read eighty** is a gold ETF, we can accurately say:

> No gold ETF was found in the eighty currently read holdings. Twenty holdings remain unread, so this does not establish that the complete portfolio has no gold exposure.

The correct constraint is **the scope of the claim**, not the rhetorical confidence of every sentence.

~~~text
Complete input
→ May answer about the complete target set

Partial input
→ Answer only about the covered subset
→ Disclose the missing subset
→ Never promote a subset finding to a universe-wide claim
~~~

The program is not meant to police literary tone; it is meant to preserve claim scope.

## The Result Was a Small Coverage-Checking Layer

For finite target sets, retain a few facts before model inference:

~~~json
{
  "sourceSnapshot": "snapshot-id",
  "requestedCount": 50,
  "loadedCount": 50,
  "filteredCount": 0,
  "byteComplete": true,
  "identityComplete": true,
  "inputComplete": true
}
~~~

If critical facts do not agree:

~~~json
{
  "requestedCount": 65,
  "loadedCount": 60,
  "filteredCount": 0,
  "byteComplete": true,
  "identityComplete": false,
  "inputComplete": false,
  "reason": "entry_limit"
}
~~~

Downstream processing can then avoid claiming full coverage, narrow claims, expose gaps in the UI, choose to paginate or stop, and report exactly where the missing data occurred.

The model need not reconstruct how these states were computed. It needs the explicit fact:

> The input covers 60 of 65 records; five remain missing.

Code must determine where 60 and 65 came from.

## What This Change Proved—and Did Not Prove

In the original controlled window, we observed:

- Reproduction of the silent **50 → 20** loss.
- A **65-record** tail-loss fixture consistently triggering incomplete status.
- Truncation-focused tests moving from **6 failed / 2 passed** to **8 passed** in that window.
- Related regression checks passing at that time.

These observations show that a previously silent form of data loss became detectable and testable.

They do **not** establish that the model will never overlook an entry, that every answer is correct, that existing quotas suit every production workload, that open-ended web search can be proven complete, or that current values are optimal in production.

Online-quality samples and very large real workloads were not yet collected. Those gaps should remain gaps.

An engineering retrospective should not turn one demonstrated fix into certification of five adjacent unknowns.

## Final Reflection

I used to ask first whether the model's answer was right. Now I ask one question earlier:

> What exactly did it see before answering?

A coherent answer may be a reasonable summary of incomplete input; the model may not be the component that failed.

The system lost data before inference and failed to tell anyone.

The principle is straightforward:

> **For a task with a defined complete dataset, establish input coverage before evaluating answer quality.**

The complementary limit matters just as much:

> **Complete input proves the model had the opportunity to see everything. It does not prove it understood everything or answered correctly.**

Respecting both avoids replacing one form of false completeness with another form of false certainty.

---

## Evidence Scope

The quantities in this article come from a controlled engineering verification window. They illustrate silent truncation, coverage checks and testing methods, not production performance or universal quota recommendations.

The intended scope is finite, defined target sets: portfolios, database records, file lists, fixed documents and API pages. Open-ended web research needs separate search-plan progress semantics rather than an unsupported claim of complete factual coverage.
