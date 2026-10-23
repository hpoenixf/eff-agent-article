<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'

type Evidence = { implementation?: string; scoped?: string; live?: string }
const { frontmatter, lang } = useData()
const evidence = computed(() => frontmatter.value.evidence as Evidence | undefined)
const english = computed(() => lang.value.startsWith('en'))
</script>

<template>
  <aside v-if="evidence && (evidence.implementation || evidence.scoped || evidence.live)"
        class="article-evidence" :aria-label="english ? 'Evidence scope reported in this article' : '本文披露的证据范围'">
    <strong class="article-evidence-label">{{ english ? 'Evidence in this article' : '本文证据范围' }}</strong>
    <span v-if="evidence.implementation" class="article-evidence-item">
      <b>{{ english ? 'Implementation' : '实现' }}</b> {{ evidence.implementation }}
    </span>
    <span v-if="evidence.scoped" class="article-evidence-item">
      <b>{{ english ? 'Scoped checks' : '限定验证' }}</b> {{ evidence.scoped }}
    </span>
    <span v-if="evidence.live" class="article-evidence-item">
      <b>{{ english ? 'Live evidence' : '真实效果' }}</b> {{ evidence.live }}
    </span>
  </aside>
</template>
