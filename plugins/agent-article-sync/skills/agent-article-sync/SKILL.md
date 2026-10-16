---
name: agent-article-sync
description: Use when preparing or synchronizing approved Agent articles, architecture diagrams, or standalone HTML between local publishing repositories and GitHub.
---

# Agent Article Sync

Prepare a reviewable, privacy-checked copy of selected Agent material for the destinations named by the user.

## Workflow

1. Resolve the canonical source and each destination from the current request or repository configuration. Do not guess a new destination or widen the selected article set.
2. Read the source collection index and lifecycle notes. Include published article candidates and requested assets; exclude glossaries, status ledgers, outlines, absorbed drafts, run artifacts, and private source data unless the user explicitly selects them.
3. Inspect `git status` in every destination before editing. Preserve all pre-existing staged, unstaged, and untracked work. Do not reset, stash, clean, or overwrite unrelated files.
4. Convert content to each destination's format. Keep article claims and caveats intact, convert article-to-article links, remove broken repository-relative links, and retain diagrams only in validated portable formats.
5. Run the bundled `scripts/privacy_scan.py` over the exact files proposed for publication. It reports candidate types and locations without printing matched values. Treat every hit as a manual review item; the scan is not proof of privacy.
6. Manually check for private holdings, account identifiers, real user data, credentials, private URLs, local paths, raw tool payloads, run IDs, and source references that reveal private evidence. Remove or generalize only the sensitive material and preserve the engineering point.
7. Validate all destination links, Markdown/MDX parsing, image references, Mermaid syntax, and standalone HTML dependencies. Review the final diff and give the user a concise content and privacy summary.
8. Commit or push only when the user asked to sync/publish to the corresponding remote. Never deploy a site, merge a pull request, or publish elsewhere based on this workflow alone.

## Destination rules

- For blog repositories, follow their frontmatter, tag/category, image, and static-asset conventions. Preserve existing publication dates when updating an existing post.
- For article repositories, prefer Markdown, a navigable README index, portable relative links, and assets stored beside the collection.
- Prefer self-contained HTML and SVG assets. Remove local source paths and internal evidence links from public copies. Keep links to external sources only when they are appropriate for the audience.
- Use a narrowly scoped asset set. A diagram must preserve its relationship and branch meaning; add nearby prose when a visual format cannot express a condition clearly.

See [the privacy review checklist](references/privacy-review.md) before finalizing public material.
