---
title: "The File Is Right There. Why Can't the Agent Read It?"
date: 2026-11-18
description: "A search can come back empty even when the system knows where the source is and the model has no way to open it. Follow a real case through search, navigation, reading, and the answer."
readingBrief:
  takeaways:
    - "After a zero-hit search, confirm the target file and version, then check whether the model has a usable way to open it."
    - "A file index can carry locations the system has verified. Reading the text still uses the current task's permissions."
    - "To check whether an answer is grounded, verify that the passage reached the model and that it supports the conclusion."
  appliesTo:
    - "People who ask agents to read attachments, and engineers responsible for document handling, retrieval, or agent tools."
  notFor:
    - "Choosing a search algorithm, comparing recall, or building a general-purpose PDF reader."
---

# The File Is Right There. Why Can't the Agent Read It?

You give an agent the latest returns handbook and ask when a custom item can still be returned. The agent says it found nothing relevant. You open the attachment, turn to “Order Cancellations and Exceptions,” and find the clause right there.

Next time, narrow the request to something you can check.

> Open the latest returns handbook I attached and find the “Order Cancellations and Exceptions” section. Quote the clause about custom items and give me the page or heading, then explain when a return is allowed. If you can't open the file, tell me where you got stuck.

This request separates finding the file, reading the passage, and interpreting the rule. When debugging your own product, the same steps help you find where a change would help.

## The search came back empty. How do we read the file now?

During a follow-up multi-agent evaluation in November 2026, we revisited four cases where document reading had stalled. We inspected the first file search in each case. The model's literal search terms did not occur in the corresponding authorized sources. Search returned empty lists, and the next model requests contained those same empty lists.

We then checked how the file index was assembled. The system that managed the files already knew their exact locations. The index sent to the main agent listed the files but omitted the locations the read tool could use. The model had search and read tools, and at the time it had no separate tool for looking up file metadata. **The file and the read action were both available. The missing handoff was the address.** Related difficulties appeared in the explicit-delegation follow-up, where a child agent could take over and keep looking for the same entry point. [The multi-agent evaluation](agent-multi-agent-value-evaluation.md)

“Returns” and “cancellations” in the handbook example show how literal search can lead here. Trying synonyms or a shorter query makes sense when looking for clues across many sources. When the user has identified a particular file, the agent can also navigate directly to the relevant section. Search engines offer similar paths. Elasticsearch, for example, supports retrieving a document by ID when the target is already known. To take that kind of path, an agent needs to receive a usable location before calling the existing read tool. [Elasticsearch document lookup by ID](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-get)

## Give the agent the known location and let it read

Consider the handbook as a simplified example. The index lists “Latest Returns Handbook,” and the system knows a location the tool can read directly. Include that location in the index and the agent has a concrete next step. It can open the file at that address, obtain the text, and use that passage to interpret the exception.

In our implementation, the main and child agents each receive a file index within their own authorization scope. For a source with one readable segment, the index can include a verified exact location such as `record:1`. The read tool still checks whether the current task can read that file and segment. The index supplies an address. The passage reaches the model after the read succeeds.

There are practical tradeoffs. With two or three short files, providing their text up front can save a tool call. With long sources, several versions, or a child task that can see only part of the collection, a useful index and on-demand reading make it easier to control scope and request size. For multi-segment sources, the index also needs a way to paginate and indicate when it shows only part of the list. Our repair covers the single-segment path with a known location. We verified that the main and child agents can navigate to it within their respective permissions. The effect on live answer quality remains to be measured.

## Trace the break in four steps

| What you see | What to check next |
| --- | --- |
| Search returns an empty list | Check the query that actually ran, its scope, and the file version. If you already know the target file, try its index entry or exact location. |
| The file name is visible, but opening it fails | Check what location the model actually received, whether the tool accepts that kind of address, and whether the task has permission to read the text. |
| The tool reports a successful read, but the answer still says it couldn't find the material | Check whether the passage appears in the next model input. A read receipt, a file name, and the original text carry different information. |
| The answer quotes the source, but its conclusion is doubtful | Open the referenced version and section. Check the exceptions, the conditions, and how strong a conclusion the passage can support. |

For readers, the quickest check is to **ask for an exact quote from the file you specified and a location you can verify**. If the agent still can't open it and you have the page, share that page on its own and check how the agent interprets it.

For developers, turn the same sequence into a regression test. Make the first search return no hits, let the system supply the real location, have the agent request a read, and check whether the text reaches the next model request. Run the same file through the path with read permission absent to check the authorization boundary alongside the successful path.

Further reading: [The RAG Lifecycle: From Document Ingestion to Cited Answers](agent-knowledge-retrieval-end-to-end.md) · [Why Keep Tool Results Outside the Model Context?](tool-results-outside-model-context.md)

If this helped you find where to look, consider starring the collection. [ETF Agent Engineering Notes](https://github.com/hpoenixf/eff-agent-article)
