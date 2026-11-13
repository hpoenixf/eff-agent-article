<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import { data } from './article-tags.data'
import { learningPathSlugs, collections } from '../../book.mjs'
import { englishTitles, englishArticlePath } from '../../book.en.mjs'
const { lang } = useData()
const english = computed(() => lang.value.startsWith('en'))
const titles = Object.fromEntries(collections.flatMap(group => group.chapters.flatMap(chapter => chapter.items)))
const entries = computed(() => learningPathSlugs.filter(slug => data.articles[slug]?.some(tag => tag.id === 'intro')).map(slug => ({ slug, title: english.value ? englishTitles[slug] || titles[slug] : titles[slug], href: english.value ? englishArticlePath(slug) : `/articles/${slug}` })))
</script>
<template><ol class="getting-started-topic"><li v-for="article in entries" :key="article.slug"><a :href="withBase(article.href)">{{ article.title }}</a></li></ol></template>
