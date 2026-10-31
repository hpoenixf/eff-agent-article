<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import { panoramaSeriesSlugs } from '../../book.mjs'

const { page, lang } = useData()
const english = computed(() => lang.value.startsWith('en'))
const slug = computed(() => /^(?:en\/)?articles\/([a-z0-9-]+)\.md$/.exec(page.value.relativePath)?.[1])
const tagged = computed(() => !!slug.value && panoramaSeriesSlugs.includes(slug.value))
const tagLink = computed(() => english.value ? '/en/panorama' : '/panorama')
</script>

<template>
  <nav v-if="tagged" class="article-topic-tags" :aria-label="english ? 'Article topic tags' : '文章专题标签'">
    <span>{{ english ? 'TOPIC TAG' : '专题标签' }}</span>
    <a :href="withBase(tagLink)">{{ english ? '# Panorama Series' : '# 全景系列' }}</a>
  </nav>
</template>
