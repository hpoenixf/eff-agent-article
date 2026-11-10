---
title: "Tools, Function Calling, MCP and Skills — How Does an Action Happen?"
description: "Follow one product-guide read through tools, function calling, MCP and Skills. Distinguish executable capabilities, call representation, connection protocols and working methods using public code."
readingBrief:
  takeaways:
    - "A tool supplies a capability. Function calling expresses a structured request that the application executes."
    - "MCP connects applications to external capabilities, while Skills provide methods and resources. Each can be adopted independently."
    - "Pair each call with its actual result. Check method loading, service connection, source acquisition and report saving separately."
    - "Begin with a local function and add service connections or reusable method packages when the task warrants them."
  appliesTo:
    - "Developers familiar with an Agent loop who want to distinguish tools, MCP and Skills."
  notFor:
    - "A complete MCP server tutorial or a security assessment of arbitrary third-party plugins."
---

# Tools, Function Calling, MCP and Skills — How Does an Action Happen?

<LearningPathNav />

You want an assistant to read product guides. Searching for an approach produces four recurring terms: Tool, Function Calling, MCP and Skill. Each description can use document reading as its example. Where should you begin?

Follow one action. The user asks for an Atlas Notes comparison, and the assistant needs the first page of version A. This is synthetic material from our public example. Establish what that action needs before assigning names to the parts.

## Start with an executable capability

The application needs code that can actually acquire the page. A teaching sketch can use an ordinary function.

```javascript
async function readPage({ documentId, page }) {
  return documentStore.readPage(documentId, page)
}
```

Here `documentStore` is a placeholder. The implementation could read a local file or access a remote document service.

To offer the capability to a model, the application also describes its name, purpose, arguments and result. The model can select it. The application checks and executes it. That controlled callable capability is a tool.

Several interfaces may use the same underlying function. A user can activate it by opening a page, and an automation script can call it directly. An Agent adds the model's selection of a next action in the context of a task.

## How the model hands a request to the program

If the model merely writes “I will read A,” the application must guess what to invoke. Function calling, also called tool calling, gives the request a structured representation containing a tool name and arguments.

The following simplified internal proposal illustrates the relationship.

```json
{
  "name": "read_page",
  "arguments": {
    "documentId": "atlas-a",
    "page": 1
  }
}
```

The provider protocol may attach call IDs, content blocks and streaming events. An adapter translates that representation into an application object, and the tool host handles it. The result is paired with the original call and supplied to a later model request.

**The model proposes the request, and the application performs the action.** Argument validity, document scope, remaining resources and actual acquisition require execution facts. A well-formed call alone cannot establish that a read succeeded. [Anthropic tool-use documentation](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview)

A tool describes what can be done. Function calling describes the model's request to do it. An in-process function is enough to start building this relationship.

## Complete the round trip for one call

Expressing a structured request completes the first half of an action. A useful tool call must also return to the model so it can decide what to do next.

For `read_page`, the model first requests page 1 of `atlas-a`. The application checks that the tool exists, its arguments satisfy the interface and the document belongs to the task's allowed scope. It then performs the read and associates the result with that call. A later request includes the original proposal and actual result, allowing the model to continue with B.

Two descriptions can easily become confused. A tool definition explains how a capability is generally used, including the meaning of `page`. A result describes this particular execution, such as acquiring page 1 of version A or discovering that a page does not exist. Even a complete definition cannot replace that returned observation.

Call IDs help complete the round trip. A single model turn may request A and B, and results may arrive in another order. The application must know which result answers which request before attaching edition, page and content to the right object. Concatenating a few successful-looking passages makes their origins harder for the next model call to distinguish.

Failures also need their specific meaning preserved. A missing page, a connection timeout and a document outside this task's scope imply different next actions. The model can adjust its approach from those observations while the application records what actually happened. A textual success label still needs corresponding acquired content.

Design both sides of a tool interface. Arguments should help the model select the right object. Results should help subsequent work determine what completed, what remains missing and where details can be checked. A single page-reading tool can demonstrate all these basic relationships.

## How MCP connects a separate program

When an independent service owns the documents, the application needs to discover its capabilities, understand arguments and obtain results. The Model Context Protocol standardizes connections between hosts and services.

On its tools path, a client can discover a server's tools and invoke them. MCP also defines other capabilities, including resources and prompts. A particular host chooses which parts it supports. [MCP architecture](https://modelcontextprotocol.io/docs/learn/architecture)

A page read can involve these handoffs.

```text
The MCP client discovers read_page
→ the application presents permitted tools to the model
→ the model proposes a structured call
→ the tool host requests the page through the MCP client
→ the server returns content
→ the application supplies the result to the next model turn
```

The provider's function-calling protocol and the MCP connection serve different boundaries. An application can receive a model request through the former and acquire an external capability through the latter. The model can also call a local application tool without an MCP connection.

MCP is useful for independent service integration, standard client reuse and capabilities shared across hosts. Direct registration is often simpler for a small function used only within the current process.

## Why function calling and MCP appear in the same path

The application connects two protocol-facing sides. One receives tool requests from a model provider. The other requests documents from the program supplying them. MCP primarily helps make the service-facing connection reusable.

For example, the model may see a tool called `mcp_read_page`. The application receives that request, checks its arguments and invokes the server's `read_page` through an MCP client. The host maintains the name mapping. The model does not need to maintain the MCP connection, and the document service does not need to interpret a particular provider's streaming event format.

This lets different hosts reuse a document service, while a host can organize capabilities from several sources into a task-appropriate tool set. The costs include connection lifecycle management, error translation and tool mapping. Standardization reduces differences across repeated integrations. The actual service still needs deployment, configuration and maintenance.

Discovering tools establishes that a client obtained a capability list. The host must still select what is available for this task, handle authentication and access scope, and decide how results are presented to the model. A service inventory cannot independently expand access already granted by the user.

Local tools are straightforward to understand and debug when the application reads two fixed files in its own process. Independent services, cross-host reuse and multiple client integrations make MCP more attractive. Choose from the actual deployment relationship. Tool count alone says little about whether another protocol is warranted.

## Why a Skill can still help

The assistant can now read both guides and still compare the wrong conditions. Each first page describes free and enterprise editions. Reading capability alone does not supply a sound comparison method.

A Skill packages task guidance and associated resources. A guide-comparison Skill can ask the assistant to read matching physical pages, preserve version-specific conditions and compare free and enterprise capabilities separately. [Agent Skills specification](https://agentskills.io/specification)

The public Open ETF Agent comparison Skill provides exactly this kind of method. It guides how the assistant uses material, while the host retains responsibility for actual capabilities and execution boundaries. [Pinned comparison Skill](https://github.com/hpoenixf/open-etf-agent/blob/bcc12995c83abfbd5b37b9792f5a86ab74aa788e/fixtures/skills/compare/SKILL.md)

Hosts vary in their support for Skill resource loading, scripts and tool declarations. A script in a package establishes the presence of that resource. Its execution still depends on host support and the authorization for this task.

A useful method may work entirely with local tools. An ordinary application can call an MCP service without loading a Skill. Choose according to whether the missing part is a method, a connection or an executable capability.

## How a Skill makes a method reusable

After several guide comparisons, the same reminders may recur. Read matching physical pages, distinguish free and enterprise editions, preserve baselines and units for numbers, and acquire both original versions before saving. These can become a method loaded for relevant tasks.

Instead of keeping the full method in every task's system instructions, expose a concise Skill name and applicability description. Read the detailed method for a comparison task, then load associated resources when needed. Different tasks can obtain guidance selectively, and maintainers can identify the file responsible for a particular working practice.

A method can describe what to do first, what to observe and when to reread material. It may also package a template or helper script. Packaged resources and the actions actually supported and permitted by this host require separate checks. A Skill that recommends document reading still needs a real tool capable of reading those documents.

Suppose the method says to save a report, while the user requested an explanation in chat. Saving still follows the current task's allowed scope. Writing instructions inside a Skill cannot create file-write permission. Likewise, a sentence inside an acquired guide asking for all files to be sent externally remains acquired data handled within the host's existing boundaries.

The method's quality needs observations from subsequent work. A loading record establishes that its text was read. The actions and report can further show whether comparison conditions were retained. A model might load a method and omit a condition, or complete the task through another reasonable path. Assess adoption through concrete behavior and artifacts.

The public comparison Skill is short. It brings edition conditions, numeric comparisons and source acquisition together in one observable task. Methods worth maintaining over time should come from recurring experience with a clear scope of applicability.

## Compare all four within one task

| Concept | Role in document comparison | What to observe |
| --- | --- | --- |
| Tool | Performs page reads and report saving | Arguments, results and actual artifacts |
| Function Calling | Represents the model's tool selection | Complete requests and paired results |
| MCP | Connects the external document service | Discovery, invocation and response |
| Skill | Supplies a comparison method and resources | Method loading and its effect on subsequent work |

Connecting these parts can produce an action with a method, a capability and an observable result. Rewording a tool description cannot reconnect a broken service. Installing a service also leaves the comparison method to be established.

## Connect the method, capability and result in one comparison

Return to the user's request to compare free-edition export formats in A and B and save a report. The application prepares the permitted tools and method catalogue, then the model starts working with those options.

After seeing the comparison Skill's description, the model can read its instructions about matching pages, separating editions and retaining sources. The method organizes subsequent work. Acquiring a page still requires a tool proposal that the application passes to an actual document capability.

When documents are supplied through MCP, the host uses its client to read A and then B. Each response remains associated with its call, edition and page. With both results, the model can organize export formats separately from the requirement for an online connection.

Finally, the model requests report saving. The application performs the save and returns an artifact and receipt. The user now has an actual result to open. A statement that the report was saved should be traceable to that save operation.

| Observation | What it establishes |
| --- | --- |
| A comparison Skill appears in the catalogue | An available method entry |
| Its detailed instructions are read | Method text entered the work process |
| Page tools return A and B | Both versions needed for comparison were acquired |
| Saving returns an artifact receipt | The save operation produced a corresponding result |
| The report preserves edition and online conditions | Comparison content is available for review against the requirements |

These observations occur at different points and can fail independently. A working method catalogue with an unreachable document service calls for connection inspection. Acquired pages followed by mixed edition conditions call for examination of the method, request and generation. A completed report the user cannot open calls for checking artifact saving and reading.

Following one action avoids changing every component whenever the assistant performs poorly. Each concept corresponds to an observable position, making the reason for a later adjustment easier to explain.

## Observe the public example

Prepare the project using the [v0.26.0 setup in the input guide](./prompt-context-rag-memory.md#observe-the-relationship-in-open-etf-agent), then run the example.

```bash
npm run demo -- --case skill-mcp
```

It reads the comparison Skill on demand, obtains synthetic pages through an actual standard-input/output MCP fixture process and saves a report. The CLI prints the run directory. Inspect its `report.md` for the comparison and `run.jsonl` for action events.

Model actions are scripted, and the MCP fixture serves synthetic documents. The example demonstrates real program connections and result handoffs. A real model's ability to select the right method needs separate evaluation. [Pinned MCP implementation](https://github.com/hpoenixf/open-etf-agent/blob/bcc12995c83abfbd5b37b9792f5a86ab74aa788e/src/mcp.mjs) · [Current project](https://github.com/hpoenixf/open-etf-agent)

Watch when the method is loaded, which tool acquires the actual pages and whether report saving produces a receipt. These observations attach the four names to concrete behavior.

## Inspect connection success and task quality separately

Start in the journal with method loading, then find the two document reads and report saving. The public example exposes `mcp_read_page` to the model and maps it to `read_page` on the service. That small naming difference makes the host's connection work visible. [Extension and example assembly](https://github.com/hpoenixf/open-etf-agent/blob/bcc12995c83abfbd5b37b9792f5a86ab74aa788e/src/extensions.mjs)

Then open the report. Check whether free and enterprise conditions remain separate, the online requirement is retained and the evidence comes from snapshots actually acquired in this run. These observations concern the comparison's content. A successful service connection cannot substitute for them.

Two teaching variations clarify the distinction. If the Skill is available but the document tool is unavailable, the assistant has a method while lacking its execution channel. If the document connection works without loading a method, page-reading capability remains available, while the comparison approach must come from the current instructions and model judgment. Changing one condition at a time reveals how method and capability contribute.

When integrating your own service, first obtain a real read from an ordinary client, inspect its returned object and then connect it to the model-call loop. When packaging your own Skill, establish its applicable tasks, required capabilities and expected user-visible artifact. This sequence helps locate connection issues separately from method issues.

Every layer brings maintenance. Tool interfaces must track underlying behavior, model-facing descriptions must remain understandable, MCP connections must fit service deployment, and Skills must reflect experience and available capabilities. Let each layer solve a problem that has actually appeared so the complete action remains understandable as it evolves.

## Identify the missing part before extending the system

For a simple action, implement and register a tool. To receive explicit model requests, connect a tool-calling protocol. When another service supplies a capability, evaluate MCP integration. When related tasks repeatedly need the same method, consider packaging a Skill.

Each mechanism brings descriptions, connections or resources to maintain. Clear adoption conditions let a reader begin with a small solution and expand as actual needs arise.

Next, [History, Context, Memory and Checkpoints](./conversation-context-memory-checkpoints.md) connects another frequently confused group of concepts by asking what needs to remain after an action finishes.
