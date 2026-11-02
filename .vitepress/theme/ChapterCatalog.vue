<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { data as descriptionData } from './article-descriptions.data'
import { descriptionForArticle } from '../../article-description.mjs'
import { data as tagData } from './article-tags.data'
import { data as chronologyData } from './article-chronology.data'
import { withBase } from 'vitepress'
import { collections } from '../../book.mjs'
import { catalogView, chronologicalCatalog, primaryCatalogEntries, paginateCatalogEntries } from './catalog-view.mjs'
import { DEFAULT_CATALOG_SORT, readCatalogLocation, writeCatalogLocation } from './catalog-location.mjs'
import { englishCollections, englishArticlePath } from '../../book.en.mjs'
import { useData } from 'vitepress'

const { lang, page } = useData()
const isEnglish = computed(() => lang.value.startsWith('en'))
const allCollections = computed(() => isEnglish.value ? englishCollections : collections)
const pathFor = (slug: string) => isEnglish.value ? englishArticlePath(slug) : '/articles/' + slug
const categoryFor = (id: string) => (isEnglish.value ? '/en/' : '/') + id
const props = defineProps<{ compact?: boolean; category?: string }>()
const selectedTags = ref<string[]>([])
const toggleTag = (id: string) => {
  selectedTags.value = selectedTags.value.includes(id) ? selectedTags.value.filter(tag => tag !== id) : [...selectedTags.value, id]
  currentPage.value = 1
  pushLocation()
}
const clearTags = () => { if (selectedTags.value.length) { selectedTags.value = []; currentPage.value = 1; pushLocation() } }
const view = computed(() => catalogView(allCollections.value, { category: props.category, selectedTags: selectedTags.value, articles: tagData.articles }))
const selectedCollections = computed(() => view.value.collections)
const canSort = computed(() => !props.category && !props.compact && ['catalog.md', 'en/catalog.md'].includes(page.value.relativePath))
const sortOrder = ref(DEFAULT_CATALOG_SORT)
const currentPage = ref(1)
const resultsRegion = ref<HTMLElement | null>(null)
const focusResults = () => { resultsRegion.value?.focus({ preventScroll: true }) }
const isChronological = computed(() => canSort.value && sortOrder.value !== 'category')
const entryOptions = computed(() => ({ chronology: chronologyData.articles,
  sourcePath: (slug: string) => pathFor(slug).slice(1) + '.md'
}))
const allEntries = computed(() => isChronological.value
  ? chronologicalCatalog(selectedCollections.value, { ...entryOptions.value, order: sortOrder.value })
  : primaryCatalogEntries(selectedCollections.value, entryOptions.value))
const pagination = computed(() => paginateCatalogEntries(allEntries.value, { page: currentPage.value }))
const goToPage = (page: number) => { currentPage.value = paginateCatalogEntries(allEntries.value, { page }).page; pushLocation() }
const changeSort = (event: Event) => { sortOrder.value = (event.target as HTMLSelectElement).value; currentPage.value = 1; pushLocation() }
const pageNumbers = computed(() => Array.from({ length: pagination.value.pageCount }, (_, index) => index + 1))

// Hydrate the static default first, then restore the URL. A popstate never acts
// like a new user edit, and an old catalogue instance cannot write another route.
const tagIds = tagData.definitions.map(tag => tag.id)
let mounted = false
const activeLocation = () => mounted && canSort.value &&
  window.location.pathname.replace(/\.html$/, '').replace(/\/$/, '') === withBase('/' + page.value.relativePath.replace(/\.md$/, ''))
const locationState = () => ({ sort: sortOrder.value, tags: selectedTags.value, page: pagination.value.page })
const locationPath = () => window.location.pathname + window.location.search + window.location.hash
function restoreLocation() {
  if (!activeLocation()) return
  const state = readCatalogLocation(window.location.href, tagIds)
  sortOrder.value = state.sort
  selectedTags.value = state.tags
  currentPage.value = state.page
  currentPage.value = pagination.value.page
  const target = writeCatalogLocation(window.location.href, locationState(), tagIds)
  if (target !== locationPath()) window.history.replaceState(window.history.state, '', target)
}
function pushLocation() {
  if (!activeLocation()) return
  const target = writeCatalogLocation(window.location.href, locationState(), tagIds)
  if (target === locationPath()) return
  // VitePress uses scrollPosition when traversing history; preserve its state.
  const state = { ...window.history.state, scrollPosition: window.scrollY }
  window.history.replaceState(state, '')
  window.history.pushState(state, '', target)
}
onMounted(() => {
  if (typeof window === 'undefined') return
  mounted = true
  restoreLocation()
  window.addEventListener('popstate', restoreLocation)
})
watch(() => page.value.relativePath, () => {
  if (!mounted) return
  selectedTags.value = []; sortOrder.value = DEFAULT_CATALOG_SORT; currentPage.value = 1
  restoreLocation()
}, { flush: 'post' })
onUnmounted(() => { if (mounted) window.removeEventListener('popstate', restoreLocation); mounted = false })
</script>

<template>
  <div class="reader-catalog" :class="{ 'reader-catalog--index': canSort }">
  <header v-if="canSort" class="catalog-page-heading">
    <h1 :id="isEnglish ? 'article-catalog' : '全部文章'">{{ isEnglish ? 'Article Catalog' : '全部文章' }}</h1>
    <div class="catalog-heading-summary"><span>{{ isEnglish ? 'ARTICLE CATALOG' : '文章目录' }}</span><strong>{{ selectedCollections.length }} {{ isEnglish ? 'categories' : '大类' }} · {{ view.articleCount }} {{ isEnglish ? 'articles' : '篇文章' }}</strong></div>
  </header>
  <div v-else class="catalog-headline">
    <span>{{ category ? (isEnglish ? 'IN THIS CATEGORY' : '本类文章') : (isEnglish ? 'ARTICLE CATALOG' : '文章目录') }}</span>
    <strong><template v-if="!category">{{ selectedCollections.length }} {{ isEnglish ? 'categories' : '大类' }} · </template>{{ view.articleCount }} {{ isEnglish ? 'articles' : '篇文章' }}</strong>
  </div>
  <div v-if="canSort" class="catalog-intro"><slot name="intro" /></div>
  <div :class="canSort ? 'catalog-toolbar' : 'catalog-filters'">
  <div class="catalog-tag-filter" :aria-label="isEnglish ? 'Filter by article tags; match all selected' : '按文章标签筛选，同时满足所选标签'">
    <span>{{ canSort ? (isEnglish ? 'Tags' : '标签') : (isEnglish ? 'Tags · match all selected' : '标签 · 同时满足所选标签') }}</span>
    <button v-for="tag in tagData.definitions" :key="tag.id" type="button" :aria-pressed="selectedTags.includes(tag.id)" @click="toggleTag(tag.id)">{{ isEnglish ? tag.en : tag.zh }}</button>
    <button v-if="canSort || selectedTags.length" class="catalog-clear" type="button" :aria-label="isEnglish ? 'Clear filters' : '清除筛选'" :aria-disabled="canSort && !selectedTags.length ? true : undefined" @click="clearTags"><span v-if="canSort" aria-hidden="true">×</span><template v-else>{{ isEnglish ? 'Clear filters' : '清除筛选' }}</template></button>
  </div>
  <div v-if="canSort" class="catalog-sort">
    <label for="catalog-sort-order">{{ isEnglish ? 'Sort' : '排序' }}</label>
    <div class="catalog-select-shell">
    <select id="catalog-sort-order" :value="sortOrder" @change="changeSort" aria-describedby="catalog-date-note">
      <option value="category" :selected="sortOrder === 'category'">{{ isEnglish ? 'Catalogue order' : '目录顺序' }}</option>
      <option value="created-desc" :selected="sortOrder === 'created-desc'">{{ isEnglish ? 'Created: newest first' : '创建时间：从新到旧' }}</option>
      <option value="created-asc" :selected="sortOrder === 'created-asc'">{{ isEnglish ? 'Created: oldest first' : '创建时间：从旧到新' }}</option>
      <option value="updated-desc" :selected="sortOrder === 'updated-desc'">{{ isEnglish ? 'Updated: newest first' : '更新时间：从新到旧' }}</option>
      <option value="updated-asc" :selected="sortOrder === 'updated-asc'">{{ isEnglish ? 'Updated: oldest first' : '更新时间：从旧到新' }}</option>
    </select>
    </div>
    <details class="catalog-help">
      <summary :aria-label="isEnglish ? 'About filters and article dates' : '标签与文章日期说明'"><span aria-hidden="true">?</span></summary>
      <div class="catalog-help-content">
        <p>{{ isEnglish ? 'Articles must match all selected tags. Changing tags or order returns to page 1.' : '文章同时满足所有已选标签；更改标签或排序后回到第1页。' }}</p>
        <p id="catalog-date-note">{{ isEnglish ? 'Created means this language edition’s first recorded version on the site’s main branch, following Git-recognized renames—not the original writing date. Updated follows visible content changes. Dates: UTC+8; unknown dates sort last.' : '创建指本站当前语言版本首次进入主线的记录（追溯 Git 识别的重命名），不是原稿创作日期；更新按可见内容变化计算。日期为北京时间，缺失日期始终排在末尾。' }}</p>
      </div>
    </details>
  </div>
  </div>
  <p v-if="canSort && !chronologyData.available" class="catalog-history-note" role="status">{{ isEnglish ? 'Reliable source history is unavailable; dates remain unknown and the original article order is preserved.' : '暂无法读取可靠的源码历史；日期保留未知，文章按原目录顺序展示。' }}</p>
  <div v-if="canSort" class="catalog-page-summary">
    <p role="status" aria-live="polite" aria-atomic="true">{{ isEnglish ? `Showing ${pagination.start}–${pagination.end} of ${pagination.total} articles` : `显示 ${pagination.start}–${pagination.end} 篇，共 ${pagination.total} 篇` }}<template v-if="pagination.pageCount"> · {{ isEnglish ? `Page ${pagination.page} of ${pagination.pageCount}` : `第 ${pagination.page} / ${pagination.pageCount} 页` }}</template></p>
    <a href="#catalog-results" @click="focusResults">{{ isEnglish ? 'Go to results' : '查看文章' }} ↓</a>
  </div>
  <div ref="resultsRegion" :id="canSort ? 'catalog-results' : undefined" :role="canSort ? 'region' : undefined" :tabindex="canSort ? -1 : undefined" :aria-label="canSort ? (isEnglish ? 'Article results' : '文章结果') : undefined">
  <p v-if="!selectedCollections.length" role="status">{{ isEnglish ? 'No articles match these tags. Clear a filter to see more.' : '暂无同时符合这些标签的文章，可取消部分筛选。' }}</p>
  <ol v-if="canSort && pagination.items.length" class="catalog-article-list" :aria-label="isChronological ? (isEnglish ? 'Articles in date order' : '按日期排序的文章') : (isEnglish ? 'Articles in catalogue order' : '按目录顺序排列的文章')">
    <li v-for="entry in pagination.items" :key="entry.slug" :data-article="entry.slug">
      <a class="catalog-date-title" :href="withBase(pathFor(entry.slug))" :aria-describedby="'catalog-description-' + entry.slug">{{ entry.title }} <span v-if="isEnglish && !pathFor(entry.slug).startsWith('/en/')" class="article-original-label">(Chinese original)</span><span aria-hidden="true">↗</span></a>
      <p :id="'catalog-description-' + entry.slug" class="article-list-description" :data-description-for="pathFor(entry.slug)" :title="descriptionForArticle(descriptionData.articles, pathFor(entry.slug))">{{ descriptionForArticle(descriptionData.articles, pathFor(entry.slug)) }}</p>
      <div class="catalog-entry-meta">
      <a class="catalog-date-category" :href="withBase(categoryFor(entry.categoryId))">{{ entry.categoryTitle }}</a>
      <dl class="catalog-dates">
        <div><dt>{{ isEnglish ? 'Site created' : '本站创建' }}</dt><dd><time v-if="entry.created" :datetime="entry.created.timestamp">{{ entry.created.date }}</time><span v-else>{{ isEnglish ? 'Unknown' : '未知' }}</span></dd></div>
        <div><dt>{{ isEnglish ? 'Updated' : '更新' }}</dt><dd><time v-if="entry.updated" :datetime="entry.updated.timestamp">{{ entry.updated.date }}</time><span v-else>{{ isEnglish ? 'Unknown' : '未知' }}</span></dd></div>
      </dl>
      </div>
    </li>
  </ol>
  <template v-if="!canSort">
  <section v-for="(collection, collectionIndex) in selectedCollections" :key="collection.id" class="collection-block">
    <div v-if="!category" class="collection-header">
      <div>
        <div class="collection-label">{{ collection.label }}</div>
        <h2>
          <a :href="withBase(categoryFor(collection.id))" :aria-label="(isEnglish ? 'Read ' : '阅读') + collection.title">
            {{ String(collectionIndex + 1).padStart(2, '0') }} / {{ collection.title }}
          </a>
        </h2>
        <p>{{ collection.subtitle }}</p>
      </div>
      <a class="collection-all" :href="withBase(categoryFor(collection.id))">
        {{ collection.chapters.reduce((n, chapter) => n + chapter.items.length, 0) }} {{ isEnglish ? 'articles' : '篇全文' }} →
      </a>
    </div>
    <div class="chapter-grid">
      <section v-for="(chapter, chapterIndex) in collection.chapters" :key="chapter.title" class="chapter-card">
        <div class="chapter-index">
          {{ String(chapterIndex + 1).padStart(2, '0') }} / {{ String(collection.chapters.length).padStart(2, '0') }}
        </div>
        <component :is="category ? 'h2' : 'h3'" class="chapter-title">{{ chapter.title }}</component>
        <p>{{ chapter.desc }}</p>
        <ol>
          <li v-for="([slug, label]) in (compact ? chapter.items.slice(0, 3) : chapter.items)" :key="slug" :data-article="canSort ? slug : undefined">
            <a :href="withBase(pathFor(slug))">{{ label }} <span v-if="isEnglish && !pathFor(slug).startsWith('/en/')" class="article-original-label">(Chinese original)</span> <span aria-hidden="true">↗</span></a>
          </li>
        </ol>
        <div v-if="!compact && chapter.related?.length" class="chapter-related">
          <p class="chapter-related-label">{{ isEnglish ? 'Related reading · primary category elsewhere' : '关联阅读 · 正文归属其他主类' }}</p>
          <ol>
            <li v-for="([slug, label]) in chapter.related" :key="slug">
              <a :href="withBase(pathFor(slug))">{{ label }} <span v-if="isEnglish && !pathFor(slug).startsWith('/en/')" class="article-original-label">(Chinese original)</span> <span aria-hidden="true">↗</span></a>
            </li>
          </ol>
        </div>
        <a v-if="compact && chapter.items.length > 3" class="chapter-more" :href="withBase(categoryFor(collection.id))">
          {{ isEnglish ? 'More articles →' : '查看本类其余文章 →' }}
        </a>
      </section>
    </div>
  </section>
  </template>
  </div>
  <nav v-if="canSort && pagination.pageCount > 1" class="catalog-pagination" :aria-label="isEnglish ? 'Article catalogue pages' : '文章目录分页'">
    <button type="button" :disabled="pagination.page === 1" aria-controls="catalog-results" @click="goToPage(pagination.page - 1)">{{ isEnglish ? 'Previous' : '上一页' }}</button>
    <div class="catalog-page-numbers">
      <button v-for="number in pageNumbers" :key="number" type="button" :aria-current="pagination.page === number ? 'page' : undefined" :aria-label="isEnglish ? `Page ${number}` : `第 ${number} 页`" aria-controls="catalog-results" @click="goToPage(number)">{{ number }}</button>
    </div>
    <button type="button" :disabled="pagination.page === pagination.pageCount" aria-controls="catalog-results" @click="goToPage(pagination.page + 1)">{{ isEnglish ? 'Next' : '下一页' }}</button>
  </nav>
  <details v-if="canSort && allEntries.length" class="catalog-all-links">
    <summary>{{ isEnglish ? `All ${allEntries.length} matching article links` : `全部 ${allEntries.length} 篇匹配文章链接` }}</summary>
    <ul><li v-for="entry in allEntries" :key="entry.slug"><a :href="withBase(pathFor(entry.slug))">{{ entry.title }} <span v-if="isEnglish && !pathFor(entry.slug).startsWith('/en/')" class="article-original-label">(Chinese original)</span></a></li></ul>
  </details>
  <div v-if="canSort" class="catalog-footnote"><slot name="footer" /></div>
  </div>
</template>

<style scoped>
.catalog-tag-filter { display:flex; flex-wrap:wrap; align-items:center; gap:8px; margin:16px 0 24px; }
.catalog-tag-filter span { color:var(--vp-c-text-2); font-size:13px; }
.catalog-tag-filter button { min-height:44px; padding:8px 14px; border:1px solid var(--vp-c-divider); border-radius:22px; }
.catalog-tag-filter button[aria-pressed="true"] { background:var(--vp-c-brand-soft); border-color:var(--vp-c-brand-1); color:var(--vp-c-brand-1); }
.catalog-tag-filter button:focus-visible { outline:2px solid var(--vp-c-brand-1); outline-offset:3px; }
.catalog-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px 20px; margin: 16px 0 8px; padding: 10px 12px; border: 1px solid var(--vp-c-divider); border-radius: 14px; background: var(--vp-c-bg-soft); }
.catalog-toolbar .catalog-tag-filter { margin: 0; gap: 6px; }
.catalog-toolbar .catalog-tag-filter > span { margin-right: 4px; white-space: nowrap; }
.reader-catalog .catalog-toolbar .catalog-tag-filter button { padding: 7px 12px; border-radius: 999px; background: var(--vp-c-bg); font-size: 13px; line-height: 1.3; }
.reader-catalog .catalog-toolbar .catalog-tag-filter button[aria-pressed="true"] { background: var(--vp-c-brand-soft); }
.reader-catalog .catalog-toolbar .catalog-clear { min-width: 44px; font-size: 20px; }
.catalog-toolbar .catalog-clear[aria-disabled="true"] { opacity: .4; cursor: default; }
.catalog-sort { display: flex; align-items: center; gap: 8px; flex-shrink: 0; min-width: 0; }
.catalog-sort label { color: var(--vp-c-text-2); font-size: 13px; white-space: nowrap; }
.catalog-select-shell { position: relative; min-width: 0; }
.catalog-select-shell::after { content: ''; position: absolute; right: 14px; top: 17px; width: 7px; height: 7px; border-right: 1.5px solid var(--vp-c-text-2); border-bottom: 1.5px solid var(--vp-c-text-2); transform: rotate(45deg); pointer-events: none; }
.catalog-sort select { appearance: none; min-height: 44px; width: 210px; max-width: 100%; padding: 9px 34px 9px 12px; border: 1px solid var(--vp-c-divider); border-radius: 9px; background: var(--vp-c-bg); color: var(--vp-c-text-1); font: inherit; font-size: 13px; cursor: pointer; }
.catalog-sort select:hover { border-color: var(--vp-c-brand-1); }
.catalog-sort select:focus-visible, .catalog-help summary:focus-visible, .catalog-pagination button:focus-visible, .catalog-all-links summary:focus-visible, #catalog-results:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 3px; }
.catalog-help { position: relative; }
.catalog-help summary { display: flex; align-items: center; justify-content: center; width: 44px; min-height: 44px; border-radius: 50%; color: var(--vp-c-text-2); cursor: pointer; list-style: none; font-weight: 600; }
.catalog-help summary::marker { content: ''; }
.catalog-help summary::-webkit-details-marker { display: none; }
.catalog-help summary:hover, .catalog-help[open] summary { background: var(--vp-c-brand-soft); color: var(--vp-c-brand-1); }
.catalog-help-content { position: absolute; z-index: 2; right: 0; top: calc(100% + 8px); width: min(360px, calc(100vw - 48px)); padding: 14px 16px; border: 1px solid var(--vp-c-divider); border-radius: 12px; background: var(--vp-c-bg); box-shadow: 0 8px 24px #00000012; }
.catalog-help-content p, .catalog-history-note { margin: 0; color: var(--vp-c-text-2); font-size: 13px; line-height: 1.7; }
.catalog-help-content p + p { margin-top: 8px; }
.catalog-page-summary { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 4px 12px; margin: 8px 0 20px; color: var(--vp-c-text-2); font-size: 13px; }
.catalog-page-summary p { margin: 0; }
.catalog-page-summary a { display: inline-flex; align-items: center; min-height: 44px; white-space: nowrap; }
.catalog-pagination, .catalog-page-numbers { display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 6px; }
.catalog-pagination { margin: 28px 0 16px; }
.catalog-pagination button { min-width: 44px; min-height: 44px; padding: 8px 12px; border: 1px solid var(--vp-c-divider); border-radius: 8px; font-size: 13px; }
.catalog-pagination button[aria-current="page"] { color: var(--vp-c-brand-1); border-color: var(--vp-c-brand-1); background: var(--vp-c-brand-soft); font-weight: 600; }
.catalog-pagination button:disabled { opacity: .45; cursor: not-allowed; }
.catalog-all-links { margin: 20px 0; border-top: 1px solid var(--vp-c-divider); padding-top: 12px; }
.catalog-all-links summary { padding: 12px 0; min-height: 44px; color: var(--vp-c-text-2); cursor: pointer; font-size: 13px; }
.catalog-all-links ul { columns: 2; column-gap: 32px; }
.catalog-all-links li { break-inside: avoid; }
.catalog-all-links a { display: inline-flex; align-items: center; min-height: 44px; font-size: 13px; overflow-wrap: anywhere; }
/* Independent catalogue only: full-width, compact cards; category views stay grouped. */
.reader-catalog--index { width: 100%; max-width: 1240px; margin: 0 auto; padding: 32px 24px 48px; }
.catalog-page-heading { display: flex; align-items: baseline; justify-content: space-between; flex-wrap: wrap; gap: 12px 24px; margin: 0 0 10px; }
.catalog-page-heading h1 { margin: 0; font-size: clamp(28px, 3vw, 36px); line-height: 1.25; letter-spacing: -.02em; font-weight: 700; }
.catalog-heading-summary { display: flex; align-items: baseline; flex-wrap: wrap; gap: 8px; margin-left: auto; color: var(--vp-c-text-2); font-size: 13px; }
.catalog-heading-summary strong { color: var(--vp-c-text-1); font-weight: 600; }
.catalog-intro :deep(p), .catalog-footnote :deep(p) { margin: 6px 0; color: var(--vp-c-text-2); font-size: 14px; line-height: 1.7; }
.catalog-intro :deep(.resume-reading) { margin: 12px 0; }
.catalog-footnote { margin-top: 24px; }
.reader-catalog--index .catalog-toolbar { margin-top: 16px; padding: 6px 8px; border-radius: 10px; }
.reader-catalog--index .catalog-toolbar .catalog-tag-filter button { min-height: 36px; padding: 5px 10px; }
.reader-catalog--index .catalog-toolbar .catalog-clear { min-width: 36px; }
.reader-catalog--index .catalog-sort select { min-height: 36px; padding: 6px 32px 6px 10px; }
.reader-catalog--index .catalog-select-shell::after { top: 13px; }
.reader-catalog--index .catalog-help summary { width: 36px; min-height: 36px; }
.reader-catalog--index .catalog-page-summary { margin: 4px 0 12px; }
.reader-catalog--index .catalog-page-summary a { min-height: 32px; }
.reader-catalog .catalog-article-list { display: grid; grid-template-columns: minmax(0, 1fr); gap: 12px; list-style: none; margin: 0; padding: 0; }
.catalog-article-list > li { min-width: 0; display: flex; flex-direction: column; gap: 12px; padding: 14px 16px; border: 1px solid var(--vp-c-divider); border-radius: 10px; background: var(--vp-c-bg); }
.catalog-date-title { display: flex; align-items: flex-start; gap: 8px; min-height: 44px; font-size: 16px; line-height: 1.5; font-weight: 600; color: var(--vp-c-text-1); overflow-wrap: anywhere; }
.catalog-date-title:hover { color: var(--vp-c-brand-1); }
.catalog-date-title > span:last-child { margin-left: auto; flex-shrink: 0; color: var(--vp-c-brand-1); }
.catalog-entry-meta { display: flex; align-items: baseline; justify-content: space-between; flex-wrap: wrap; gap: 6px 12px; margin-top: auto; }
.catalog-date-category { display: inline-flex; align-items: center; min-height: 24px; font-size: 12px; color: var(--vp-c-brand-1); }
.catalog-dates { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 4px 6px; margin: 0 0 0 auto; font-size: 12px; line-height: 1.6; color: var(--vp-c-text-2); font-variant-numeric: tabular-nums; }
.catalog-dates > div { display: inline-flex; gap: 4px; white-space: nowrap; }
.catalog-dates > div + div::before { content: '·'; margin-right: 2px; }
.catalog-dates dt, .catalog-dates dd { display: inline; margin: 0; }
@media (min-width: 960px) { .reader-catalog .catalog-article-list { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (pointer: coarse), (max-width: 640px) {
  .reader-catalog--index .catalog-toolbar .catalog-tag-filter button, .reader-catalog--index .catalog-sort select, .reader-catalog--index .catalog-help summary { min-height: 44px; }
  .reader-catalog--index .catalog-toolbar .catalog-clear, .reader-catalog--index .catalog-help summary { min-width: 44px; }
  .reader-catalog--index .catalog-select-shell::after { top: 17px; }
  .reader-catalog--index .catalog-page-summary a, .catalog-date-category { min-height: 44px; }
}
@media (max-width: 640px) {
  .reader-catalog--index { padding: 24px 16px 40px; }
  .catalog-page-heading { gap: 8px 16px; }
  .catalog-heading-summary { font-size: 12px; }
  .catalog-article-list > li { padding: 12px; }
}
.reader-catalog .catalog-headline { margin: 24px 0 12px; }
.reader-catalog .chapter-grid { grid-template-columns: minmax(0, 1fr); gap: 20px; }
.reader-catalog .chapter-card { padding: 20px; border-radius: 8px; background: transparent; }
.reader-catalog .chapter-card .chapter-title { border: 0; margin: 12px 0 8px; padding: 0; font-size: 1.22rem; line-height: 1.4; }
.reader-catalog .chapter-card:hover { transform: none; }
.reader-catalog .chapter-card li a { min-height: 44px; overflow-wrap: anywhere; }
.reader-catalog a:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 3px; }
.reader-catalog .catalog-tag-filter button { border-radius: 8px; }
@media (max-width: 767px) {
  .reader-catalog .chapter-card { padding: 16px; }
  .catalog-toolbar { flex-wrap: wrap; gap: 8px; }
  .catalog-sort { width: 100%; }
  .catalog-select-shell { flex: 1; }
  .catalog-sort select { width: 100%; }
  .catalog-all-links ul { columns: 1; }
}
</style>
