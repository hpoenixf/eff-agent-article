<script setup lang="ts">
import { computed } from 'vue'
import { withBase } from 'vitepress'
import { collections, articleCount } from '../../book.mjs'

const props = defineProps<{ compact?: boolean; category?: string }>()
const selectedCollections = computed(() =>
  props.category ? collections.filter((entry) => entry.id === props.category) : collections
)
</script>

<template>
  <div class="catalog-headline">
    <span>CURATED READING PATHS</span>
    <strong>{{ collections.length }} 大类 · {{ articleCount }} 篇文章</strong>
  </div>
  <section v-for="(collection, collectionIndex) in selectedCollections" :key="collection.id" class="collection-block">
    <div class="collection-header">
      <div>
        <div class="collection-label">{{ collection.label }}</div>
        <h2>
          <a :href="withBase('/' + collection.id)" :aria-label="'阅读' + collection.title">
            {{ String(collectionIndex + 1).padStart(2, '0') }} / {{ collection.title }}
          </a>
        </h2>
        <p>{{ collection.subtitle }}</p>
      </div>
      <a class="collection-all" :href="withBase('/' + collection.id)">
        {{ collection.chapters.reduce((n, chapter) => n + chapter.items.length, 0) }} 篇全文 →
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
            <a :href="withBase('/articles/' + slug)">{{ label }} <span aria-hidden="true">↗</span></a>
          </li>
        </ol>
        <a v-if="compact && chapter.items.length > 3" class="chapter-more" :href="withBase('/' + collection.id)">
          查看本类其余文章 →
        </a>
      </section>
    </div>
  </section>
</template>
