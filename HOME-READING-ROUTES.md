# Homepage reading routes

The homepage has exactly five direct tabs: existing categories/tags, getting started,
architecture, finance, and engineering. Do not add a second route/category mode switch.
The default is categories/tags; the four other tabs are ordered recommendations, not
course completion, product readiness, or investment advice.

## Single sources
- `book.mjs`: canonical article identities, Chinese titles, categories and introductory order.
- `book.en.mjs`: English titles and actual translated paths.
- `article-tags.mjs`: existing topic/tag identities.
- `home-reading-routes.mjs`: only the four route selections, order and reader goals.
- `.vitepress/theme/HomeReaderTabs.vue`: accessible presentation and responsive layout.

When publishing or materially updating an article, consider whether it changes a route.
Keep `learningPathSlugs` as the full newcomer order, including conceptual bridges and
workshops. Never replace a canonical URL with a guessed title slug. Both translations
must exist before adding an article to these bilingual routes. Article edits do not require
copying titles into the component: they resolve from the canonical book data.

Run `node --test scripts/home-reader-tabs.test.mjs`, `npm run check:catalog`, and the
normal docs build. New tests are included in the existing catalog CI command. Verify
five tabs, arrow/Home/End keyboard navigation, visible focus, narrow mobile scrolling,
article links, and Chinese/English locale paths in the deployed site. Static render and
source checks alone are not a claim of browser-interaction acceptance.

Existing catalog, category, tag, article and historical links remain unchanged. Do not
couple homepage curation to Open product acceptance, private development or paid tests.
Deploy through the existing article CI and blog reader-source pin, preserving the current
source version and shared publisher handoff; do not create a separate public site.
