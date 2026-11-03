<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import { chapters } from '../../book.mjs'
import { englishArticlePath, englishTitles } from '../../book.en.mjs'
import { taggedArticleSlugs } from '../../finance-membership.mjs'
import { descriptionForArticle } from '../../article-description.mjs'
import { data as tags } from './article-tags.data'
import { data as descriptions } from './article-descriptions.data'
const { lang } = useData()
const english = computed(() => lang.value.startsWith('en'))
const items = chapters.flatMap(chapter => chapter.items)
const titles = new Map(items)
const members = taggedArticleSlugs(tags, 'finance', items.map(([slug]) => slug))
const cards = computed(() => members.map(slug => {
  const href = english.value ? englishArticlePath(slug) : '/articles/' + slug
  return { slug, href, title: english.value ? englishTitles[slug] : titles.get(slug),
    description: descriptionForArticle(descriptions.articles, href),
    chineseOriginal: english.value && !href.startsWith('/en/') }
}))
</script>

<template>
  <section class="finance-topic-list" :aria-label="english ? 'All finance-tagged articles' : '全部金融标签文章'">
    <p>{{ english ? `${cards.length} articles, in the main reading order.` : `共 ${cards.length} 篇，按主目录阅读顺序排列。` }}</p>
    <ul>
      <li v-for="card in cards" :key="card.slug">
        <h3><a :href="withBase(card.href)">{{ card.title }}</a><small v-if="card.chineseOriginal"> · Chinese original</small></h3>
        <p>{{ card.description }}</p>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.finance-topic-list ul { list-style: none; padding: 0; }
.finance-topic-list li { padding: .5rem 0 1rem; border-bottom: 1px solid var(--vp-c-divider); }
.finance-topic-list h3 { margin: .5rem 0; font-size: 1.08rem; line-height: 1.6; }
.finance-topic-list li p { margin: .4rem 0; color: var(--vp-c-text-2); }
.finance-topic-list small { font-size: .8rem; font-weight: normal; }
</style>
