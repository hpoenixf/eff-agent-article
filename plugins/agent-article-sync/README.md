# Agent Article Sync plugin

A skill-only Codex plugin for preparing privacy-reviewed article, diagram, and standalone HTML copies for explicitly approved blog and GitHub destinations.

- Skill: `skills/agent-article-sync/SKILL.md`
- Privacy candidate scanner: `scripts/privacy_scan.py`
- Manual review checklist: `skills/agent-article-sync/references/privacy-review.md`

The scanner is advisory. It reports candidate locations without printing their values and does not approve publication. The workflow preserves existing destination changes and never deploys or publishes a site by itself.
