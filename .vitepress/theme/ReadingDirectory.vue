<script setup lang="ts">
import { computed, inject } from 'vue'
import { useData, useRoute, withBase } from 'vitepress'
import { collections } from '../../book.mjs'
import { englishCollections } from '../../book.en.mjs'
import { groupTopCategories } from './reading-directory.mjs'

type Entry = { text: string; link?: string; items?: Entry[] }
const props = defineProps<{ items?: Entry[]; nested?: boolean }>()
const { theme, lang } = useData()
const route = useRoute()
const entries = computed(() => {
  if (props.items) return props.items
  const sidebar = Array.isArray(theme.value.sidebar) ? theme.value.sidebar : []
  const en = lang.value.startsWith('en')
  return groupTopCategories(sidebar, (en ? englishCollections : collections).map(c => c.title), en ? 'Article categories' : '文章分类')
})
const closeScreen = inject<() => void>('close-screen', () => {})
function choose(event: MouseEvent) {
  closeScreen()
  const popover = (event.target as HTMLElement).closest('.directory-menu') as HTMLDetailsElement | null
  if (popover) popover.open = false
}
</script>

<template>
  <nav class="reading-directory" :class="{ nested }" :aria-label="nested ? undefined : (lang.startsWith('en') ? 'Article directory' : '文章目录')" :key="route.path">
    <template v-for="entry in entries" :key="entry.text">
      <details v-if="entry.items?.length" class="directory-group">
        <summary>{{ entry.text }}</summary>
        <ReadingDirectory :items="entry.items" nested />
      </details>
      <a v-else-if="entry.link" :href="withBase(entry.link)" @click="choose">{{ entry.text }}<span v-if="/^https?:/.test(entry.link)" aria-hidden="true"> ↗</span></a>
    </template>
  </nav>
</template>

<style scoped>
.reading-directory { display: grid; min-width: 0; }
.reading-directory > a, .directory-group > summary { display: block; min-height: 48px; padding: 14px 4px; border-bottom: 1px solid var(--vp-c-divider); color: var(--vp-c-text-1); text-decoration: none; font-size: 15px; line-height: 1.5; font-weight: 600; white-space: normal; overflow-wrap: anywhere; }
.directory-group > summary { position: relative; padding-right: 28px; list-style: none; cursor: pointer; }
.directory-group > summary::-webkit-details-marker { display: none; }
.directory-group > summary::after { content: '›'; position: absolute; right: 6px; color: var(--vp-c-text-3); font-size: 22px; line-height: 1; }
.directory-group[open] > summary::after { transform: rotate(90deg); }
.nested { padding-left: 16px; }
.nested > a { font-size: 14px; font-weight: 400; }
a:hover, summary:hover { color: var(--vp-c-brand-1); }
a:focus-visible, summary:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 2px; }
</style>

<style>
/* One mobile directory, opened by the header menu; the local bar retains only the page outline. */
@media (max-width: 959px) { .VPLocalNav .menu { display: none; } }
</style>
