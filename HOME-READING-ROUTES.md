# Homepage topic previews

The homepage has five direct tabs: categories, getting started, architecture, finance,
and engineering. No second route/category mode switch is needed. The four topic tabs
show five article cards and a sixth, lower-right “View all” card on desktop. Mobile
preserves that DOM order in one column. All complete topic pages retain original URLs.

## Single sources
- `book.mjs`: canonical identities, Chinese titles, category membership and introductory order.
- `book.en.mjs`: English titles and actual translated paths.
- `article-tags.mjs` and its content loader: shared tag membership for badges, catalog and home.
- Intro follows `learningPathSlugs`; the new `/getting-started` topic lists the entire set.
- Architecture and engineering tags inherit the existing editorial thinking/engineering
  categories, not title-keyword guesses. Their existing category pages are the complete topics.
- Finance uses the exact same tag data as `FinanceTopic`, including authored finance tags.
- `home-reading-routes.mjs`: labels, topic destinations and five-item previews only.

Publishing new articles in those authoritative sources updates the previews automatically.
Preview order is canonical editorial order, not a separate manual shortlist. Recent updates
remain source-history ordered, displayed two columns on wide screens and one on mobile.
Do not equate reading order, category membership or publication with product acceptance.

The redundant hero “15-minute” CTA and homepage pill row are removed from rendering;
article, tag, gallery, source and catalog destinations remain available through existing
navigation and topic pages. Images are compact. Hover feedback respects reduced motion;
tabs preserve arrow/Home/End keyboard navigation and visible focus.

Run targeted home/tag tests, the complete catalog checks and normal docs build. Check the
actual browser at desktop/mobile widths, both languages and reduced motion. Static SSR
checks do not constitute browser interaction acceptance. Deploy using the existing article
CI and blog reader-source pin, not a new site, and coordinate with the unique publisher.
