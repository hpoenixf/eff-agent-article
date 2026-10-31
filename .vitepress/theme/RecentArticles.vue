<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import { data } from './recent-articles.data'
const { lang } = useData()
const english = computed(() => lang.value.startsWith('en'))
const entries = computed(() => english.value ? data.en : data.zh)
</script>

<template>
  <section :data-history="data.available ? 'available' : 'unavailable'" class="recent-articles" aria-labelledby="recent-articles-heading">
    <div class="recent-heading">
      <h2 id="recent-articles-heading">{{ english ? 'Recently added & updated' : '最近更新' }}</h2>
      <a :href="withBase(english ? '/en/catalog' : '/catalog')">{{ english ? 'All articles →' : '全部文章 →' }}</a>
    </div>
    <p v-if="entries.length" class="recent-note">{{ english ? 'New articles and content changes, based on source history. Prose whitespace-only edits are skipped. Dates: UTC+8.' : '根据源码历史自动汇总新增与内容更新；忽略正文空白、换行调整。日期为北京时间。' }}</p>
    <p v-else class="recent-note">{{ english ? 'Recent updates cannot be confirmed here. All articles remain available in the catalogue.' : '暂无法确认最近更新，仍可从完整目录继续阅读。' }}</p>
    <ol v-if="entries.length">
      <li v-for="entry in entries" :key="entry.slug">
        <a :href="withBase(entry.href)"><span class="recent-title">{{ entry.title }}</span><span aria-hidden="true">↗</span></a>
        <div class="recent-meta"><span class="recent-kind" :class="entry.kind">{{ entry.kind === 'new' ? (english ? 'New' : '新增') : (english ? 'Updated' : '更新') }}</span><time :datetime="entry.timestamp">{{ entry.date }}</time></div>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.recent-articles { margin: 48px 0 24px; padding-top: 24px; border-top: 1px solid var(--vp-c-divider); }
.recent-heading { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; }
.recent-heading h2 { margin: 0; border: 0; padding: 0; }
.recent-heading > a { white-space: nowrap; font-size: 14px; }
.recent-note { color: var(--vp-c-text-2); font-size: 14px; }
ol { list-style: none; margin: 0; padding: 0; }
li { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 12px 20px; align-items: center; padding: 16px 0; border-bottom: 1px solid var(--vp-c-divider); }
li > a { display: flex; gap: 12px; justify-content: space-between; min-width: 0; padding: 6px 0; text-decoration: none; line-height: 1.6; }
.recent-title { overflow-wrap: anywhere; }
li > a:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 4px; border-radius: 4px; }
.recent-meta { display: flex; align-items: center; gap: 10px; color: var(--vp-c-text-2); font-size: 12px; white-space: nowrap; }
.recent-kind { padding: 2px 8px; border-radius: 12px; background: var(--vp-c-default-soft); }
.recent-kind.new { color: var(--vp-c-brand-1); background: var(--vp-c-brand-soft); }
@media (max-width: 640px) { li { grid-template-columns: minmax(0, 1fr); gap: 4px; } li > a { min-height: 44px; align-items: center; } .recent-heading { flex-wrap: wrap; gap: 8px; } }
</style>
