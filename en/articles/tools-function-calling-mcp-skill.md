---
title: "Tools, Function Calling, MCP and Skills — How Does an Action Happen?"
description: "Follow one product-guide read through tools, function calling, MCP and Skills. Distinguish executable capabilities, call representation, connection protocols and working methods using public code."
readingBrief:
  takeaways:
    - "A tool supplies a capability. Function calling expresses a structured request that the application executes."
    - "MCP connects applications to external capabilities, while Skills provide methods and resources. Each can be adopted independently."
    - "Loading a method, discovering a tool, calling it and obtaining a result are separate observable steps."
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

## Why a Skill can still help

The assistant can now read both guides and still compare the wrong conditions. Each first page describes free and enterprise editions. Reading capability alone does not supply a sound comparison method.

A Skill packages task guidance and associated resources. A guide-comparison Skill can ask the assistant to read matching physical pages, preserve version-specific conditions and compare free and enterprise capabilities separately. [Agent Skills specification](https://agentskills.io/specification)

The public Open ETF Agent comparison Skill provides exactly this kind of method. It guides how the assistant uses material, while the host retains responsibility for actual capabilities and execution boundaries. [Pinned comparison Skill](https://github.com/hpoenixf/open-etf-agent/blob/bcc12995c83abfbd5b37b9792f5a86ab74aa788e/fixtures/skills/compare/SKILL.md)

Hosts vary in their support for Skill resource loading, scripts and tool declarations. A script in a package establishes the presence of that resource. Its execution still depends on host support and the authorization for this task.

A useful method may work entirely with local tools. An ordinary application can call an MCP service without loading a Skill. Choose according to whether the missing part is a method, a connection or an executable capability.

## Compare all four within one task

| Concept | Role in document comparison | What to observe |
| --- | --- | --- |
| Tool | Performs page reads and report saving | Arguments, results and actual artifacts |
| Function Calling | Represents the model's tool selection | Complete requests and paired results |
| MCP | Connects the external document service | Discovery, invocation and response |
| Skill | Supplies a comparison method and resources | Method loading and its effect on subsequent work |

Connecting these parts can produce an action with a method, a capability and an observable result. Rewording a tool description cannot reconnect a broken service. Installing a service also leaves the comparison method to be established.

## Observe the public example

Prepare the project using the [v0.26.0 setup in the input guide](./prompt-context-rag-memory.md#observe-the-relationship-in-open-etf-agent), then run the example.

```bash
npm run demo -- --case skill-mcp
```

It reads the comparison Skill on demand, obtains synthetic pages through an actual standard-input/output MCP fixture process and saves a report. The CLI prints the run directory. Inspect its `report.md` for the comparison and `run.jsonl` for action events.

Model actions are scripted, and the MCP fixture serves synthetic documents. The example demonstrates real program connections and result handoffs. A real model's ability to select the right method needs separate evaluation. [Pinned MCP implementation](https://github.com/hpoenixf/open-etf-agent/blob/bcc12995c83abfbd5b37b9792f5a86ab74aa788e/src/mcp.mjs) · [Current project](https://github.com/hpoenixf/open-etf-agent)

Watch when the method is loaded, which tool acquires the actual pages and whether report saving produces a receipt. These observations attach the four names to concrete behavior.

## Identify the missing part before extending the system

For a simple action, implement and register a tool. To receive explicit model requests, connect a tool-calling protocol. When another service supplies a capability, evaluate MCP integration. When related tasks repeatedly need the same method, consider packaging a Skill.

Each mechanism brings descriptions, connections or resources to maintain. Clear adoption conditions let a reader begin with a small solution and expand as actual needs arise.

Next, [History, Context, Memory and Checkpoints](./conversation-context-memory-checkpoints.md) connects another frequently confused group of concepts by asking what needs to remain after an action finishes.
