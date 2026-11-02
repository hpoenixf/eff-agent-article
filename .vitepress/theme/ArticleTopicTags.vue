<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import { data } from './article-tags.data'
import { articleTopicTags } from './article-context.mjs'
const { page, lang } = useData()
const english = computed(() => lang.value.startsWith('en'))
const tags = computed(() => articleTopicTags(page.value.relativePath, data))
</script>
<template>
  <nav v-if="tags.length" class="article-topic-tags" :aria-label="english ? 'Article tags' : '文章标签'">
    <span>{{ english ? 'TAGS' : '文章标签' }}</span>
    <a v-for="tag in tags" :key="tag.id" :href="withBase((english ? '/en/' : '/') + tag.path)">
      # {{ english ? tag.en : tag.zh }}
      <small v-if="tag.id === 'open-source'"> · {{ tag.verification === 'scoped' ? (english ? 'Scoped verification' : '有限范围已验证') : (english ? 'Associated · unverified' : '有关联 · 未验证') }}</small>
    </a>
  </nav>
</template>
