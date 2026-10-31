<script setup lang="ts">
import { computed, ref } from 'vue'
import { data as tagData } from './article-tags.data'
import { withBase } from 'vitepress'
import { collections } from '../../book.mjs'
import { catalogView } from './catalog-view.mjs'
import { englishCollections, englishArticlePath } from '../../book.en.mjs'
import { useData } from 'vitepress'

const { lang } = useData()
const isEnglish = computed(() => lang.value.startsWith('en'))
const allCollections = computed(() => isEnglish.value ? englishCollections : collections)
const pathFor = (slug: string) => isEnglish.value ? englishArticlePath(slug) : '/articles/' + slug
const categoryFor = (id: string) => (isEnglish.value ? '/en/' : '/') + id
const props = defineProps<{ compact?: boolean; category?: string }>()
const selectedTags = ref<string[]>([])
const toggleTag = (id: string) => { selectedTags.value = selectedTags.value.includes(id) ? selectedTags.value.filter(tag => tag !== id) : [...selectedTags.value, id] }
const view = computed(() => catalogView(allCollections.value, { category: props.category, selectedTags: selectedTags.value, articles: tagData.articles }))
const selectedCollections = computed(() => view.value.collections)

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
  <p v-if="!selectedCollections.length" role="status">{{ isEnglish ? 'No articles match these tags. Clear a filter to see more.' : '暂无同时符合这些标签的文章，可取消部分筛选。' }}</p>
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
  </div>
</template>

<style scoped>
.catalog-tag-filter { display:flex; flex-wrap:wrap; align-items:center; gap:8px; margin:16px 0 24px; }
.catalog-tag-filter span { color:var(--vp-c-text-2); font-size:13px; }
.catalog-tag-filter button { min-height:44px; padding:8px 14px; border:1px solid var(--vp-c-divider); border-radius:22px; }
.catalog-tag-filter button[aria-pressed="true"] { background:var(--vp-c-brand-soft); border-color:var(--vp-c-brand-1); color:var(--vp-c-brand-1); }
.catalog-tag-filter button:focus-visible { outline:2px solid var(--vp-c-brand-1); outline-offset:3px; }
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
