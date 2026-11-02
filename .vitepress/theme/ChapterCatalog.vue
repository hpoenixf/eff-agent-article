<script setup lang="ts">
import { computed, ref } from 'vue'
import { data as tagData } from './article-tags.data'
import { data as chronologyData } from './article-chronology.data'
import { withBase } from 'vitepress'
import { collections } from '../../book.mjs'
import { catalogView, chronologicalCatalog } from './catalog-view.mjs'
import { englishCollections, englishArticlePath } from '../../book.en.mjs'
import { useData } from 'vitepress'

const { lang, page } = useData()
const isEnglish = computed(() => lang.value.startsWith('en'))
const allCollections = computed(() => isEnglish.value ? englishCollections : collections)
const pathFor = (slug: string) => isEnglish.value ? englishArticlePath(slug) : '/articles/' + slug
const categoryFor = (id: string) => (isEnglish.value ? '/en/' : '/') + id
const props = defineProps<{ compact?: boolean; category?: string }>()
const selectedTags = ref<string[]>([])
const toggleTag = (id: string) => { selectedTags.value = selectedTags.value.includes(id) ? selectedTags.value.filter(tag => tag !== id) : [...selectedTags.value, id] }
const view = computed(() => catalogView(allCollections.value, { category: props.category, selectedTags: selectedTags.value, articles: tagData.articles }))
const selectedCollections = computed(() => view.value.collections)
const canSort = computed(() => !props.category && !props.compact && ['catalog.md', 'en/catalog.md'].includes(page.value.relativePath))
const sortOrder = ref('category')
const isChronological = computed(() => canSort.value && sortOrder.value !== 'category')
const chronologicalEntries = computed(() => isChronological.value ? chronologicalCatalog(selectedCollections.value, {
  order: sortOrder.value, chronology: chronologyData.articles,
  sourcePath: (slug: string) => pathFor(slug).slice(1) + '.md'
}) : [])

</script>

<template>
  <div class="reader-catalog">
  <div class="catalog-headline">
    <span>{{ category ? (isEnglish ? 'IN THIS CATEGORY' : '本类文章') : (isEnglish ? 'ARTICLE CATALOG' : '文章目录') }}</span>
    <strong><template v-if="!category">{{ selectedCollections.length }} {{ isEnglish ? 'categories' : '大类' }} · </template>{{ view.articleCount }} {{ isEnglish ? 'articles' : '篇文章' }}</strong>
  </div>
  <div class="catalog-tag-filter" :aria-label="isEnglish ? 'Filter by article tags' : '按文章标签筛选'">
    <span>{{ isEnglish ? 'Tags · match all selected' : '标签 · 同时满足所选标签' }}</span>
    <button v-for="tag in tagData.definitions" :key="tag.id" type="button" :aria-pressed="selectedTags.includes(tag.id)" @click="toggleTag(tag.id)">{{ isEnglish ? tag.en : tag.zh }}</button>
    <button v-if="selectedTags.length" type="button" @click="selectedTags = []">{{ isEnglish ? 'Clear filters' : '清除筛选' }}</button>
  </div>
  <div v-if="canSort" class="catalog-sort">
    <label for="catalog-sort-order">{{ isEnglish ? 'Sort articles' : '文章排序' }}</label>
    <select id="catalog-sort-order" v-model="sortOrder" aria-describedby="catalog-date-note">
      <option value="category">{{ isEnglish ? 'Category order' : '按分类浏览' }}</option>
      <option value="created-desc">{{ isEnglish ? 'Created: newest first' : '创建时间：从新到旧' }}</option>
      <option value="created-asc">{{ isEnglish ? 'Created: oldest first' : '创建时间：从旧到新' }}</option>
      <option value="updated-desc">{{ isEnglish ? 'Updated: newest first' : '更新时间：从新到旧' }}</option>
      <option value="updated-asc">{{ isEnglish ? 'Updated: oldest first' : '更新时间：从旧到新' }}</option>
    </select>
    <p id="catalog-date-note">{{ isEnglish ? 'Created means this language edition’s first recorded version on the site’s main branch, following Git-recognized renames—not the original writing date. Updated follows visible content changes. Dates: UTC+8; unknown dates sort last.' : '创建指本站当前语言版本首次进入主线的记录（追溯 Git 识别的重命名），不是原稿创作日期；更新按可见内容变化计算。日期为北京时间，缺失日期始终排在末尾。' }}</p>
    <p v-if="!chronologyData.available" role="status">{{ isEnglish ? 'Reliable source history is unavailable; dates remain unknown and the original article order is preserved.' : '暂无法读取可靠的源码历史；日期保留未知，文章按原目录顺序展示。' }}</p>
  </div>
  <p v-if="!selectedCollections.length" role="status">{{ isEnglish ? 'No articles match these tags. Clear a filter to see more.' : '暂无同时符合这些标签的文章，可取消部分筛选。' }}</p>
  <ol v-if="isChronological && chronologicalEntries.length" class="catalog-chronological-list" :aria-label="isEnglish ? 'Articles in date order' : '按日期排序的文章'">
    <li v-for="entry in chronologicalEntries" :key="entry.slug" :data-article="entry.slug">
      <a class="catalog-date-title" :href="withBase(pathFor(entry.slug))">{{ entry.title }} <span v-if="isEnglish && !pathFor(entry.slug).startsWith('/en/')" class="article-original-label">(Chinese original)</span><span aria-hidden="true">↗</span></a>
      <a class="catalog-date-category" :href="withBase(categoryFor(entry.categoryId))">{{ entry.categoryTitle }}</a>
      <dl class="catalog-dates">
        <div><dt>{{ isEnglish ? 'Created on site' : '本站创建' }}</dt><dd><time v-if="entry.created" :datetime="entry.created.timestamp">{{ entry.created.date }}</time><span v-else>{{ isEnglish ? 'Unknown' : '未知' }}</span></dd></div>
        <div><dt>{{ isEnglish ? 'Updated' : '更新' }}</dt><dd><time v-if="entry.updated" :datetime="entry.updated.timestamp">{{ entry.updated.date }}</time><span v-else>{{ isEnglish ? 'Unknown' : '未知' }}</span></dd></div>
      </dl>
    </li>
  </ol>
  <template v-if="!isChronological">
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
          <li v-for="([slug, label]) in (compact ? chapter.items.slice(0, 3) : chapter.items)" :key="slug">
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
</template>

<style scoped>
.catalog-tag-filter { display:flex; flex-wrap:wrap; align-items:center; gap:8px; margin:16px 0 24px; }
.catalog-tag-filter span { color:var(--vp-c-text-2); font-size:13px; }
.catalog-tag-filter button { min-height:44px; padding:8px 14px; border:1px solid var(--vp-c-divider); border-radius:22px; }
.catalog-tag-filter button[aria-pressed="true"] { background:var(--vp-c-brand-soft); border-color:var(--vp-c-brand-1); color:var(--vp-c-brand-1); }
.catalog-tag-filter button:focus-visible { outline:2px solid var(--vp-c-brand-1); outline-offset:3px; }
.catalog-sort { margin: 16px 0 24px; display: flex; flex-wrap: wrap; align-items: center; gap: 8px 12px; }
.catalog-sort label { font-weight: 600; }
.catalog-sort select { min-height: 44px; max-width: 100%; padding: 8px 32px 8px 12px; border: 1px solid var(--vp-c-divider); border-radius: 8px; background-color: var(--vp-c-bg); color: var(--vp-c-text-1); font: inherit; }
.catalog-sort select:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 3px; }
.catalog-sort p { flex-basis: 100%; margin: 0; color: var(--vp-c-text-2); font-size: 13px; line-height: 1.7; }
.reader-catalog .catalog-chronological-list { list-style: none; margin: 0; padding: 0; }
.catalog-chronological-list > li { padding: 16px 0; border-bottom: 1px solid var(--vp-c-divider); }
.catalog-date-title { display: flex; align-items: center; gap: 8px; min-height: 44px; font-weight: 600; overflow-wrap: anywhere; }
.catalog-date-title > span:last-child { margin-left: auto; flex-shrink: 0; }
.catalog-date-category { display: inline-flex; align-items: center; min-height: 44px; font-size: 13px; }
.catalog-dates { display: flex; flex-wrap: wrap; gap: 8px 24px; margin: 4px 0 0; font-size: 13px; color: var(--vp-c-text-2); }
.catalog-dates > div { display: flex; gap: 8px; }
.catalog-dates dd { margin: 0; }
.reader-catalog .catalog-headline { margin: 24px 0 12px; }
.reader-catalog .chapter-grid { grid-template-columns: minmax(0, 1fr); gap: 20px; }
.reader-catalog .chapter-card { padding: 20px; border-radius: 8px; background: transparent; }
.reader-catalog .chapter-card .chapter-title { border: 0; margin: 12px 0 8px; padding: 0; font-size: 1.22rem; line-height: 1.4; }
.reader-catalog .chapter-card:hover { transform: none; }
.reader-catalog .chapter-card li a { min-height: 44px; overflow-wrap: anywhere; }
.reader-catalog a:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 3px; }
.reader-catalog .catalog-tag-filter button { border-radius: 8px; }
@media (max-width: 767px) { .reader-catalog .chapter-card { padding: 16px; } }
</style>
