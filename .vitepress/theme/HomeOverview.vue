<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'

const { lang } = useData()

// Editorial selections belong here; the complete article tree stays in book.mjs.
const zh = {
  latestLabel: 'SELECTED ARTICLES · 近期精选',
  latestTitle: '最近值得读',
  catalogLabel: '查看全部文章',
  latest: [
    {
      category: '工程复盘', date: '10.26',
      title: '一个 Subagent 改动，为什么拖住了整整一天？',
      description: '从职责耦合到修改扩散，重新审视 Runtime 的维护成本。',
      href: '/articles/agent-runtime-refactor-one-day-blocked'
    },
    {
      category: '架构思考', date: '10.26',
      title: 'Agent 架构：哪些该稳定，哪些该变化？',
      description: '通过 Child、Memory 与 Provider，理解差异化演进。',
      href: '/articles/agent-differentiated-evolution-contracts'
    },
    {
      category: '研究机制', date: '10.26',
      title: '投研 Agent 的关键不是多调用工具',
      description: '从 Model、Harness 到 Loop，看研究如何随证据推进。',
      href: '/articles/etf-agent-model-harness-research-loop'
    }
  ],
  topicLabel: '专题与工具',
  topics: [
    { label: '金融可信工程', href: '/fintech' },
    { label: '架构图册', href: '/gallery' },
    { label: '写作路线图', href: '/roadmap' },
    { label: '术语速查', href: '/glossary' },
    { label: '订阅 RSS', href: '/feed.xml' }
  ],
  moreLabel: 'EXPLORE MORE',
  moreTitle: '想再深入一点？',
  moreHint: '以下内容默认收起，按需展开。',
  routesTitle: '按关注点选择阅读路线',
  routesHint: '前端、Agent 应用、系统架构与 AI 研发',
  routes: [
    {
      title: 'AI-native 前端',
      links: [
        { label: '渐进式回答', href: '/articles/agent-progressive-answer-coherence' },
        { label: '异步研究交付', href: '/articles/agent-asynchronous-research-time-bound-delivery' },
        { label: '答案发布', href: '/articles/019-agent-answer-publication' }
      ]
    },
    {
      title: 'Agent 应用开发',
      links: [
        { label: '六层全景 V3', href: '/articles/017-prompt-to-answer-six-layer-panorama-v3' },
        { label: 'Subagent 协作', href: '/articles/agent-subagent-context-specialization' },
        { label: 'Python 工作台', href: '/articles/agent-python-compute-workbench-evolution' }
      ]
    },
    {
      title: 'Agent 系统架构',
      links: [
        { label: '职责分工', href: '/articles/agent-model-runtime-mcp-skill-boundaries' },
        { label: 'Run 终结权', href: '/articles/agent-veto-authority-and-run-termination' },
        { label: '持续演化', href: '/articles/code-cheaper-systems-harder-to-evolve' }
      ]
    },
    {
      title: 'AI 辅助工程研发',
      links: [
        { label: 'Spec 与 Evidence', href: '/articles/026-agent-spec-evidence-workflow' },
        { label: '工程知识退役', href: '/articles/027-agent-context-document-history' },
        { label: '任务收敛', href: '/articles/032-ai-development-from-bug-loop-to-task-convergence' }
      ]
    }
  ],
  statusTitle: '研发动态与 Owner 状态',
  statusHint: '版本演进、验证范围与后续计划',
  statusText: '详细 Owner 状态和验收边界统一放在架构图册，待写主题集中在路线图。首页不再逐日复制研发流水账。',
  statusLinks: [
    { label: '查看架构图册', href: '/gallery' },
    { label: '查看后续选题', href: '/roadmap' }
  ],
  aboutTitle: '关于本站与联系作者',
  aboutHint: '公开内容范围、合作方式',
  aboutText: '本站公开 Agent 工程文章、阅读站源码及独立 MIT 教学实现 Open ETF Agent；不公开内部完整产品源码、运行凭据或生产指标。局部验证不等于生产级效果。',
  aboutLabel: '作者与博客',
  emailLabel: '邮件联系',
  contactLabel: '微信 hpoenixf0510',
  footnote: '工程经验与技术讨论，不构成投资建议；完整目录和历史版本均保留独立入口。'
}

const en = {
  latestLabel: 'SELECTED ARTICLES',
  latestTitle: 'Fresh perspectives',
  catalogLabel: 'Browse all articles',
  latest: [
    {
      category: 'ENGINEERING', date: 'OCT 26',
      title: 'Why did one Subagent change block a day of work?',
      description: 'How scattered ownership and cross-cutting changes raise runtime maintenance costs.',
      href: '/en/articles/agent-runtime-refactor-one-day-blocked'
    },
    {
      category: 'ARCHITECTURE', date: 'OCT 26',
      title: 'What should stay stable—and what should change?',
      description: 'A different evolution strategy for Child, Memory, and Provider.',
      href: '/en/articles/agent-differentiated-evolution-contracts'
    },
    {
      category: 'RESEARCH LOOP', date: 'OCT 26',
      title: 'A research agent needs more than tools',
      description: 'How Model, Harness, and Loop advance a question as evidence changes.',
      href: '/en/articles/etf-agent-model-harness-research-loop'
    }
  ],
  topicLabel: 'Explore topics',
  topics: [
    { label: 'Trustworthy fintech', href: '/en/fintech' },
    { label: 'Architecture gallery', href: '/en/gallery' },
    { label: 'Writing roadmap', href: '/en/roadmap' },
    { label: 'Glossary', href: '/en/glossary' },
    { label: 'Subscribe via RSS', href: '/en/feed.xml' }
  ],
  moreLabel: 'EXPLORE MORE',
  moreTitle: 'Go a little deeper',
  moreHint: 'Open any section when you need it.',
  routesTitle: 'Choose a path by interest',
  routesHint: 'Frontend, Agent apps, architecture, and AI-assisted engineering',
  routes: [
    {
      title: 'AI-native frontend',
      links: [
        { label: 'Progressive answers', href: '/en/articles/agent-progressive-answer-coherence' },
        { label: 'Background delivery', href: '/en/articles/agent-asynchronous-research-time-bound-delivery' },
        { label: 'Publication (Chinese original)', href: '/articles/019-agent-answer-publication' }
      ]
    },
    {
      title: 'Agent application development',
      links: [
        { label: 'Six-layer map V3', href: '/en/articles/017-prompt-to-answer-six-layer-panorama-v3' },
        { label: 'Subagent collaboration', href: '/en/articles/agent-subagent-context-specialization' },
        { label: 'Python workbench', href: '/en/articles/agent-python-compute-workbench-evolution' }
      ]
    },
    {
      title: 'Agent system architecture',
      links: [
        { label: 'Responsibility split', href: '/en/articles/agent-model-runtime-mcp-skill-boundaries' },
        { label: 'Run termination', href: '/en/articles/agent-veto-authority-and-run-termination' },
        { label: 'Sustainable evolution', href: '/en/articles/code-cheaper-systems-harder-to-evolve' }
      ]
    },
    {
      title: 'AI-assisted engineering',
      links: [
        { label: 'Spec and evidence', href: '/en/articles/026-agent-spec-evidence-workflow' },
        { label: 'Retiring old knowledge', href: '/en/articles/027-agent-context-document-history' },
        { label: 'Task convergence', href: '/en/articles/032-ai-development-from-bug-loop-to-task-convergence' }
      ]
    }
  ],
  statusTitle: 'Development updates and Owner status',
  statusHint: 'Evolution, evidence scope, and future work',
  statusText: 'The architecture gallery maintains the detailed Owner inventory and evidence scope. Planned writing lives in the roadmap instead of a daily changelog on this homepage.',
  statusLinks: [
    { label: 'Architecture gallery', href: '/en/gallery' },
    { label: 'Writing roadmap', href: '/en/roadmap' }
  ],
  aboutTitle: 'About this site and the author',
  aboutHint: 'Scope, contact, and collaboration',
  aboutText: 'This site publishes engineering notes and an independent MIT-licensed teaching implementation, Open ETF Agent. Full product source, credentials, and production metrics are not public; local checks are not production guarantees.',
  aboutLabel: 'Author and blog',
  emailLabel: 'Email',
  contactLabel: 'WeChat hpoenixf0510',
  footnote: 'Engineering discussion, not investment advice. Full reading paths and historical editions remain available.'
}

const copy = computed(() => lang.value.startsWith('en') ? en : zh)
</script>

<template>
  <section class="home-overview" :aria-label="copy.latestTitle">
    <div class="home-overview__heading">
      <div>
        <p class="home-overview__eyebrow">{{ copy.latestLabel }}</p>
        <h2>{{ copy.latestTitle }}</h2>
      </div>
      <a class="home-overview__all" :href="withBase(lang.startsWith('en') ? '/en/catalog' : '/catalog')">
        {{ copy.catalogLabel }} <span aria-hidden="true">↗</span>
      </a>
    </div>

    <div class="home-overview__cards">
      <a v-for="item in copy.latest" :key="item.href" class="home-overview__card" :href="withBase(item.href)">
        <span class="home-overview__meta">{{ item.category }} <span aria-hidden="true">·</span> {{ item.date }}</span>
        <strong>{{ item.title }}</strong>
        <span class="home-overview__desc">{{ item.description }}</span>
        <span class="home-overview__read">{{ lang.startsWith('en') ? 'Read article' : '阅读文章' }} <span aria-hidden="true">↗</span></span>
      </a>
    </div>

    <nav class="home-overview__topics" :aria-label="copy.topicLabel">
      <span class="home-overview__topics-label">{{ copy.topicLabel }}</span>
      <a v-for="topic in copy.topics" :key="topic.href" :href="withBase(topic.href)">{{ topic.label }} <span aria-hidden="true">↗</span></a>
    </nav>

    <div class="home-overview__more">
      <p class="home-overview__eyebrow">{{ copy.moreLabel }}</p>
      <div class="home-overview__more-heading">
        <h2>{{ copy.moreTitle }}</h2>
        <p>{{ copy.moreHint }}</p>
      </div>

      <details class="home-overview__details">
        <summary><span><strong>{{ copy.routesTitle }}</strong><small>{{ copy.routesHint }}</small></span></summary>
        <div class="home-overview__routes">
          <div v-for="route in copy.routes" :key="route.title" class="home-overview__route">
            <h3>{{ route.title }}</h3>
            <a v-for="link in route.links" :key="link.href" :href="withBase(link.href)">{{ link.label }} <span aria-hidden="true">↗</span></a>
          </div>
        </div>
      </details>

      <details class="home-overview__details">
        <summary><span><strong>{{ copy.statusTitle }}</strong><small>{{ copy.statusHint }}</small></span></summary>
        <div class="home-overview__detail-body">
          <p>{{ copy.statusText }}</p>
          <div class="home-overview__detail-links">
            <a v-for="link in copy.statusLinks" :key="link.href" :href="withBase(link.href)">{{ link.label }} <span aria-hidden="true">↗</span></a>
          </div>
        </div>
      </details>

      <details class="home-overview__details">
        <summary><span><strong>{{ copy.aboutTitle }}</strong><small>{{ copy.aboutHint }}</small></span></summary>
        <div class="home-overview__detail-body">
          <p>{{ copy.aboutText }}</p>
          <div class="home-overview__detail-links">
            <a href="https://hpoenixf.com/about">{{ copy.aboutLabel }} <span aria-hidden="true">↗</span></a>
            <a href="mailto:hpoenixf@foxmail.com">{{ copy.emailLabel }} <span aria-hidden="true">↗</span></a>
            <span>{{ copy.contactLabel }}</span>
          </div>
        </div>
      </details>
    </div>
    <p class="home-overview__footnote">{{ copy.footnote }}</p>
  </section>
</template>
