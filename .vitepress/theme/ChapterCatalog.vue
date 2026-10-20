<script setup lang="ts">
import { withBase } from 'vitepress'
import { chapters, articleCount } from '../../book.mjs'
defineProps<{ compact?: boolean }>()
</script>

<template>
  <div class="catalog-headline">
    <span>READING COLLECTION</span>
    <strong>{{ chapters.length }} 章 · {{ articleCount }} 篇</strong>
  </div>
  <div class="chapter-grid">
    <section v-for="(chapter, idx) in chapters" :key="chapter.title" class="chapter-card">
      <div class="chapter-index">{{ String(idx + 1).padStart(2, '0') }} / 06</div>
      <h3>{{ chapter.title.replace(/^\d+ · /, '') }}</h3>
      <p>{{ chapter.desc }}</p>
      <ol>
        <li v-for="([slug, label]) in (compact ? chapter.items.slice(0, 3) : chapter.items)" :key="slug">
          <a :href="withBase('/articles/' + slug)">{{ label }} <span aria-hidden="true">↗</span></a>
        </li>
      </ol>
      <a v-if="compact && chapter.items.length > 3" class="chapter-more" :href="withBase('/catalog')">全部 {{ chapter.items.length }} 篇 →</a>
    </section>
  </div>
</template>
