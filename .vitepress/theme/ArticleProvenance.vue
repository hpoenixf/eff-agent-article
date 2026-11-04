<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import { articleBreadcrumbs, editorialMetadata } from '../../seo-content.mjs'

const { page, frontmatter, lang } = useData()
const english = computed(() => lang.value.startsWith('en'))
const breadcrumbs = computed(() => articleBreadcrumbs({ relativePath: page.value.relativePath, title: page.value.title }))
// No repository-owner, Git timestamp, deployment-time or fallback author inference.
const metadata = computed(() => breadcrumbs.value.length ? editorialMetadata(frontmatter.value.articleMetadata) : {})
</script>

<template>
  <div v-if="breadcrumbs.length" class="article-provenance">
    <nav class="article-breadcrumbs" :aria-label="english ? 'Breadcrumb' : '面包屑导航'">
      <ol>
        <li v-for="(item, index) in breadcrumbs" :key="item.url">
          <span v-if="index" class="article-breadcrumbs__separator" aria-hidden="true">/</span>
          <span v-if="index === breadcrumbs.length - 1" aria-current="page">{{ item.name }}</span>
          <a v-else :href="item.url">{{ item.name }}</a>
        </li>
      </ol>
    </nav>
    <div v-if="metadata.author || metadata.datePublished || metadata.dateModified" class="article-byline">
      <span v-if="metadata.author" class="article-byline__author">{{ english ? 'Author: ' : '作者：' }}<a :href="metadata.author.url" rel="author">{{ metadata.author.name }}</a></span>
      <span v-if="metadata.datePublished" class="article-byline__published">{{ english ? 'Published: ' : '发布于：' }}<time :datetime="metadata.datePublished">{{ metadata.datePublished }}</time></span>
      <span v-if="metadata.dateModified" class="article-byline__modified">{{ english ? 'Updated: ' : '更新于：' }}<time :datetime="metadata.dateModified">{{ metadata.dateModified }}</time></span>
    </div>
  </div>
</template>

<style scoped>
.article-provenance { margin: 0 0 1rem; color: var(--vp-c-text-2); font-size: .8rem; line-height: 1.7; }
.article-breadcrumbs ol { display: flex; flex-wrap: wrap; gap: .2rem .5rem; list-style: none; padding: 0; margin: 0; }
.article-breadcrumbs li { min-width: 0; overflow-wrap: anywhere; }
.article-breadcrumbs__separator { margin-right: .5rem; color: var(--vp-c-text-3); }
.article-byline { display: flex; flex-wrap: wrap; gap: .3rem 1rem; margin-top: .4rem; }
.article-provenance a { color: var(--vp-c-brand-1); text-decoration: underline; text-underline-offset: 3px; }
.article-provenance a:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 3px; }
</style>
