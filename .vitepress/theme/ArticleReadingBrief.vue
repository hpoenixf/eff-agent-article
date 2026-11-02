<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'

type Brief = { takeaways: string[]; appliesTo: string[]; notFor: string[] }
const { frontmatter, lang } = useData()
const brief = computed(() => frontmatter.value.readingBrief as Brief | undefined)
const minutes = computed(() => frontmatter.value.readingEstimate?.minutes as number | undefined)
const english = computed(() => lang.value.startsWith('en'))
</script>

<template>
  <aside v-if="brief && minutes" class="article-reading-brief" aria-labelledby="article-reading-brief-title">
    <div class="reading-brief-heading">
      <strong id="article-reading-brief-title">{{ english ? 'Key takeaways' : '本文结论' }}</strong>
      <span class="reading-brief-time">{{ english ? `Estimated ${minutes} min read` : `预计阅读 ${minutes} 分钟` }}</span>
    </div>
    <ul class="reading-brief-takeaways">
      <li v-for="item in brief.takeaways" :key="item">{{ item }}</li>
    </ul>
    <dl class="reading-brief-fit">
      <div><dt>{{ english ? 'Useful for' : '适用' }}</dt><dd v-for="item in brief.appliesTo" :key="item">{{ item }}</dd></div>
      <div><dt>{{ english ? 'Not for' : '不适用' }}</dt><dd v-for="item in brief.notFor" :key="item">{{ item }}</dd></div>
    </dl>
    <details class="reading-brief-method">
      <summary>{{ english ? 'How reading time is estimated' : '阅读时长如何估算' }}</summary>
      <p>{{ english ? 'Based on the full body, tables and code examples: 300 Chinese characters or 200 other-language words per minute, added together and rounded up. Metadata, navigation and diagram source are excluded. Studying diagrams or running examples takes extra time.' : '按完整正文、表格及代码示例估算：每分钟 300 个汉字或 200 个其他语言词，混合内容累加后向上取整。不含元数据、导航和图表源码；精读图解或运行示例需另留时间。' }}</p>
    </details>
  </aside>
</template>

<style scoped>
.article-reading-brief { margin: 1.25rem 0 1.75rem; padding: 1rem 1.125rem; border: 1px solid var(--vp-c-divider); border-left: 3px solid var(--vp-c-brand-1); border-radius: 10px; background: var(--vp-c-bg-soft); color: var(--vp-c-text-1); font-size: .91rem; line-height: 1.65; overflow-wrap: anywhere; }
.reading-brief-heading { display: flex; flex-wrap: wrap; gap: .25rem 1rem; align-items: baseline; justify-content: space-between; }
.reading-brief-heading strong { font-size: 1rem; }
.reading-brief-time { color: var(--vp-c-text-2); font-size: .82rem; }
.article-reading-brief .reading-brief-takeaways { margin: .65rem 0 .85rem; padding-left: 1.25rem; }
.reading-brief-takeaways li + li { margin-top: .35rem; }
.reading-brief-fit { margin: 0; padding-top: .7rem; border-top: 1px solid var(--vp-c-divider); }
.reading-brief-fit > div { display: grid; grid-template-columns: 4.6rem minmax(0, 1fr); gap: 0 .5rem; }
.reading-brief-fit > div + div { margin-top: .4rem; }
.reading-brief-fit dt { font-weight: 600; }
.reading-brief-fit dd { margin: 0; grid-column: 2; }
.reading-brief-method { margin-top: .65rem; color: var(--vp-c-text-2); font-size: .78rem; }
.reading-brief-method summary { width: fit-content; cursor: pointer; }
.reading-brief-method summary:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 3px; border-radius: 2px; }
.article-reading-brief .reading-brief-method p { margin: .4rem 0 0; line-height: 1.6; }
@media (max-width: 480px) {
  .article-reading-brief { padding: .85rem; font-size: .875rem; }
  .reading-brief-fit > div { display: block; }
  .reading-brief-fit dd { margin-top: .1rem; }
}
@media print { .article-reading-brief { break-inside: avoid; } .reading-brief-method { display: none; } }
</style>
