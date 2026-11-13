# Open module map maintenance

The English and Chinese introduction pages embed an interactive SVG immediately after the existing hero. Each card opens its reviewed article; the text index has the same destinations. GitHub README embeds remain previews, not interactive SVG documents.

## Source and review boundary

`data/open-etf-agent/module-map.json` pins the reviewed Open commit, its complete module-status manifest and both SVG byte hashes. It is navigation evidence, not a qualification receipt. Preserve existing article-coverage snapshots, historical evidence and article identities. Article scope can be wider than public Open implementation. Do not infer completion from a source path or promote old evidence to a new release.

## Existing release-maintainer handoff

1. Coordinate the Open writer and the sole article/blog publisher. Review the new fixed Open commit, module/call-site semantics, exact bilingual article identities and current verification limits. Do not select moving `main` as evidence.
2. Update the existing topic's `versions.json` and qualification snapshots through the existing approved `sync-open-etf-topic.mjs` process when needed. Do not manufacture qualification just to match a version.
3. Import that reviewed, remotely read-back Open commit:

   ```sh
   node scripts/sync-open-module-map.mjs --import <40-character-Open-commit>
   node scripts/sync-open-module-map.mjs --check
   npm run check:catalog
   npm run docs:build
   ```

   `--import` reads three immutable public files, copies exact SVG bytes and regenerates the two marked topic blocks. `--check` runs under `check:topic`/`check:catalog`: it checks the fixed SHA, asset hashes, topic/latest-map version agreement, actual bilingual article source presence, SVG/index URL agreement and deterministic page bytes. A new topic version with an old map fails the gate. It does not automatically infer module maturity or run paid tests.
4. Review and sensitive-scan the diff; preserve remote concurrent changes. Publish non-forcibly through the authorized sole publisher, then read back remote ref/tree/blobs and exact changed bytes. Retain the existing CI gates.
5. Only after original article CI passes, update the existing `hpoenixf/myblog-v2/reader-source.json` immutable article commit. Preserve its full edition list. Run `node scripts/reader-release.mjs source <article-checkout>`, publish through the existing authorized workflow and wait for deployment.
6. Run the blog's `node scripts/reader-release.mjs verify`, check actual bilingual topic bodies and the two SVG bytes. Check all 37 links in each SVG and sample real card clicks in both languages, including final URL and heading. State the exact sampled scope; href checks are not 74 real clicks.

This is a reviewed cross-repository import and build gate, not a new unattended publishing service. Future changes still follow the current authorization and STOP boundaries. Do not retry or route around an explicitly rejected publication.
