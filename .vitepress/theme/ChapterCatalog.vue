<script setup lang="ts">
import { computed } from 'vue'
import { withBase } from 'vitepress'
import { collections, articleCount } from '../../book.mjs'
import { englishCollections, englishArticlePath } from '../../book.en.mjs'
import { useData } from 'vitepress'

const { lang } = useData()
const isEnglish = computed(() => lang.value.startsWith('en'))
const allCollections = computed(() => isEnglish.value ? englishCollections : collections)
const pathFor = (slug: string) => isEnglish.value ? englishArticlePath(slug) : '/articles/' + slug
const categoryFor = (id: string) => (isEnglish.value ? '/en/' : '/') + id
const props = defineProps<{ compact?: boolean; category?: string }>()
const selectedCollections = computed(() =>
  props.category ? allCollections.value.filter((entry) => entry.id === props.category) : allCollections.value
)
</script>

<template>
  <div class="catalog-headline">
    <span>CURATED READING PATHS</span>
    <strong>{{ collections.length }} {{ isEnglish ? 'categories' : '大类' }} · {{ articleCount }} {{ isEnglish ? 'articles' : '篇文章' }}</strong>
  </div>
  <section v-for="(collection, collectionIndex) in selectedCollections" :key="collection.id" class="collection-block">
    <div class="collection-header">
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
        <h3>{{ chapter.title }}</h3>
        <p>{{ chapter.desc }}</p>
        <ol>
          <li v-for="([slug, label]) in (compact ? chapter.items.slice(0, 3) : chapter.items)" :key="slug">
            <a :href="withBase(pathFor(slug))">{{ label }} <span v-if="isEnglish && !pathFor(slug).startsWith('/en/')" class="article-original-label">(Chinese original)</span> <span aria-hidden="true">↗</span></a>
          </li>
        </ol>
        <a v-if="compact && chapter.items.length > 3" class="chapter-more" :href="withBase('/' + collection.id)">
          {{ isEnglish ? 'More articles →' : '查看本类其余文章 →' }}
        </a>
      </section>
    </div>
  </section>
</template>
