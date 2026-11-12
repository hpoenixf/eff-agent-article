# ETF Agent · Engineering Notes

**From a conversation to ongoing research: connect Agent concepts, runtime mechanisms, and engineering trade-offs.**

[中文](README.md) · English

**[Start reading →](https://hpoenixf.com/eff-agent-article/en/) · [All articles](https://hpoenixf.com/eff-agent-article/en/catalog) · [Panorama series](https://hpoenixf.com/eff-agent-article/en/panorama) · [Run the open-source examples](https://github.com/hpoenixf/open-etf-agent)**

This repository contains bilingual engineering essays, diagrams, and the ETF Agent reading site. It is for developers getting started with Agents, architects working through system boundaries, and engineers building with AI. Real user scenarios connect the mechanisms, their design rationale, and the limits of what has actually been implemented and verified.

## Start with your question

| What you want to understand | Suggested route |
| --- | --- |
| Build an initial mental model | [Agent in fifteen minutes](en/articles/agent-in-15-minutes.md) → [Where model input comes from](en/articles/prompt-context-rag-memory.md) → [How actions happen](en/articles/tools-function-calling-mcp-skill.md) |
| Distinguish follow-up chat, task continuation, and recovery | [History, memory, and checkpoints](en/articles/conversation-context-memory-checkpoints.md) → [Execution identity panorama](en/articles/agent-task-session-run-worker-schedule.md) |
| Build a report you can read back and inspect | [Research project workshop](en/articles/open-etf-agent-research-project-workshop.md) → [Report review workshop](en/articles/open-etf-agent-report-review-workshop.md) → [Runnable teaching project](https://github.com/hpoenixf/open-etf-agent#quickstart) |
| Understand a system and its long-term evolution | [Six-layer panorama V3](en/articles/017-prompt-to-answer-six-layer-panorama-v3.md) → [Architecture principles](en/principles.md) → [Spec-driven development panorama](en/articles/agent-spec-driven-development-panorama.md) |

The introductory series is a connected path, not a glossary: follow each article’s series navigation through concepts, deeper explanations, workshops, and panoramas. Use the categories below when you need a specific mechanism.

## Browse by theme and category

### Three reading tracks

{{COLLECTIONS}}

### Cross-cutting topics

{{TOPICS}}

Topics and tags are different entry points into the same articles, not extra categories or duplicate essays. The [catalogue](https://hpoenixf.com/eff-agent-article/en/catalog) supports combined tags, date ordering, and the full index.

The **[architecture atlas](https://hpoenixf.com/eff-agent-article/en/gallery)** connects capabilities and handoffs; **[principles](https://hpoenixf.com/eff-agent-article/en/principles)** support design and review; the **[editorial roadmap](https://hpoenixf.com/eff-agent-article/en/roadmap)** distinguishes revisions of existing essays from planned work.

## Recent updates

{{RECENT}}

Only the latest three articles are previewed, ordered by visible changes to their Chinese source editions on main. Translations do not count as additional articles. Dates describe repository content updates, not original authorship or live deployment. **[Full catalogue and history ordering →](https://hpoenixf.com/eff-agent-article/en/catalog)**

## Read it, then run an implementation

[Open ETF Agent](https://github.com/hpoenixf/open-etf-agent) is a separate MIT-licensed teaching implementation, evolving module by module from synthetic offline examples to reports that can be read back. This repository owns the essays and diagrams. The two repositories do not share one codebase or promise full feature parity.

### Three recent version entry points

{{VERSIONS}}

These identities come from the existing code-version lineage and link to fixed source. This README does not recertify releases or full capabilities. **[All versions and qualification boundaries](https://hpoenixf.com/eff-agent-article/en/open-etf-agent) · [Project Quickstart](https://github.com/hpoenixf/open-etf-agent#quickstart)**

### Three recent module readings

<!-- open-etf-recent-modules:start -->
{{MODULES}}
<!-- open-etf-recent-modules:end -->

This selection follows public module progression and existing coverage evidence, not article dates. A mechanism essay, limited implementation, offline checks, real-model acceptance, and site deployment are separate facts. See the [article-to-code boundaries](https://github.com/hpoenixf/open-etf-agent/blob/main/docs/articles-and-code.md).

## Local development and contributions

Reading requires no installation. To work on the collection, use Node.js 22 and run from the repository root:

```bash
npm install
npm run readme:sync
npm run check:catalog
npm run docs:build
```

The build renders Mermaid diagrams and needs a working Chrome/Chromium. Full Git history supplies reliable article dates. Edit bilingual README sources in [data/readme](data/readme): [book.mjs](book.mjs) owns category and article order, [book.en.mjs](book.en.mjs) owns English labels and translation availability, and the existing Open topic owns version identities. Regenerate after source edits rather than maintaining a second article or release list.

[Maintenance and publication](MAINTENANCE.md) · [Report an issue](https://github.com/hpoenixf/eff-agent-article/issues): include the article URL, passage, and suggested improvement; do not upload credentials, private data, or raw logs. Articles and passing tests do not establish production readiness or investment outcomes. This collection is not investment or legal advice. The separate code repository’s MIT license does not automatically apply to these essays or referenced material.

## Author and community

[hpoenixf · About and blog](https://hpoenixf.com/about). A frontend-leaning full-stack developer working on financial systems and Agent engineering.

<details>
<summary>Chinese-language WeChat community · 小飞的 AI 投研工坊</summary>

Continue reading and discussing in WeChat. Save the QR image on your phone and scan it in WeChat.

<img src="public/images/wechat-public-account.jpg" alt="QR code for the 小飞的 AI 投研工坊 WeChat publication" width="180" height="180" />

</details>

## Historical navigation

Original article URLs and complete historical editions remain available: [six-layer V2](en/articles/017-prompt-to-answer-six-layer-panorama.md) · [six-layer V1 (Chinese)](articles/017-prompt-to-answer-six-layer-panorama-v1.md). The current catalogue uses V3; historical editions and merge notices do not count as new current articles.

[Previous README snapshot](https://github.com/hpoenixf/eff-agent-article/blob/75916debf634279af4a6521569a38eb93dfff142/README.md) preserves the earlier navigation and dated updates.
