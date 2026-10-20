<script setup lang="ts">
import { withBase } from 'vitepress'
import { chapters } from '../reading.mjs'
</script>

<template>
  <div class="chapter-grid">
    <section v-for="chapter in chapters" :key="chapter.key" class="chapter-card">
      <div class="chapter-card__eyebrow">CHAPTER {{ chapter.key }} / {{ chapter.items.length }} 篇</div>
      <h2 :id="'chapter-' + chapter.key">{{ chapter.title }}</h2>
      <p class="chapter-card__intro">{{ chapter.subtitle }}</p>
      <ol>
        <li v-for="article in chapter.items" :key="article.slug">
          <a :href="withBase('/articles/' + article.slug + '.html')">{{ article.title }}</a>
        </li>
      </ol>
    </section>
    <section class="chapter-card chapter-card--future">
      <div class="chapter-card__eyebrow">CHAPTER 06 / IN PROGRESS</div>
      <h2>下一篇，正在酝酿</h2>
      <p class="chapter-card__intro">Python、Memory、RAG、上下文压缩、Artifact 等专题，先确认独立问题与证据边界。</p>
      <a class="chapter-card__cta" :href="withBase('/roadmap.html')">查看选题预告 ↗</a>
    </section>
  </div>
</template>
