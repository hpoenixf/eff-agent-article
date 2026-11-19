<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import { collections } from '../../book.mjs'
import { englishCollections } from '../../book.en.mjs'
import { catalogView } from './catalog-view.mjs'

const { lang } = useData()
const english = computed(() => lang.value.startsWith('en'))
// Use the full locale catalogue, not a route preview, tag filter or translations combined.
const count = computed(() => catalogView(english.value ? englishCollections : collections).articleCount)
</script>

<template>
  <div class="home-catalog-action">
    <a :href="withBase(english ? '/en/catalog' : '/catalog')">
      <span>{{ english ? 'View all articles' : '查看全部文章' }}</span>
      <span class="home-catalog-action__count">{{ english ? `${count} articles` : `${count} 篇` }}</span>
      <span aria-hidden="true">→</span>
    </a>
  </div>
</template>

<style scoped>
.home-catalog-action { grid-column: 1 / -1; margin-top: 24px; }
.home-catalog-action a {
  display: inline-flex; align-items: center; justify-content: center; flex-wrap: wrap;
  gap: 8px 12px; max-width: 100%; min-height: 48px; padding: 12px 20px;
  border-radius: 8px; background: var(--vp-c-brand-1); color: var(--vp-c-bg);
  font-size: 15px; line-height: 1.5; font-weight: 600; text-decoration: none;
}
.home-catalog-action a:hover { background: var(--vp-c-brand-2); }
.home-catalog-action a:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 4px; }
.home-catalog-action__count { font-size: 13px; font-weight: 500; }
@media (max-width: 639px) { .home-catalog-action a { width: 100%; } }
</style>
