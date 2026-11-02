<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import EvidenceScope from './EvidenceScope.vue'
import ArticleTopicTags from './ArticleTopicTags.vue'
import OpenSourceBridge from './OpenSourceBridge.vue'
import { data } from './article-tags.data'
import { articleEvidence, articleTopicTags, openSourceExample } from './article-context.mjs'

const { page, frontmatter, lang } = useData()
const english = computed(() => lang.value.startsWith('en'))
const visible = computed(() => Boolean(articleEvidence(frontmatter.value)
  || articleTopicTags(page.value.relativePath, data).length
  || openSourceExample(page.value.relativePath)))
</script>

<template>
  <details v-if="visible" :key="page.relativePath" class="article-context">
    <summary>{{ english ? 'Evidence, tags & source code' : '证据、标签与源码' }}</summary>
    <div class="article-context__content">
      <EvidenceScope />
      <ArticleTopicTags />
      <OpenSourceBridge />
    </div>
  </details>
</template>

<style scoped>
.article-context { margin: 0 0 1rem; border-bottom: 1px solid var(--vp-c-divider); color: var(--vp-c-text-2); font-size: .85rem; }
.article-context > summary { width: fit-content; min-height: 36px; padding: .4rem 0; cursor: pointer; line-height: 1.65; }
.article-context > summary:hover { color: var(--vp-c-brand-1); }
.article-context > summary:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 3px; border-radius: 2px; }
.article-context__content { padding: .35rem 0 .75rem; }
.article-context__content :deep(aside:first-child), .article-context__content :deep(nav:first-child) { margin-top: 0; }
@media (pointer: coarse) { .article-context > summary { min-height: 44px; } }
</style>
