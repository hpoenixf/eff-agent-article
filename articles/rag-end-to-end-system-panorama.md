---
title: "RAG 全链路已合并到知识检索主稿"
search: false
outline: false
---

<script setup>
import { onMounted } from 'vue'
import { withBase } from 'vitepress'

onMounted(() => {
  window.location.replace(withBase('/articles/agent-knowledge-retrieval-end-to-end') + window.location.hash)
})
</script>

# RAG 全链路已合并到知识检索主稿

全景与知识检索专题现已合为一篇，沿资料接入、解析、切块、索引、查询、召回、重排、上下文、生成引用和评测更新展开。

[阅读全文：RAG 全链路：从文档入库到可引用回答](agent-knowledge-retrieval-end-to-end.md)

旧收藏与章节链接继续可用。页面启用脚本时会带着原章节位置转到合稿；也可以使用下面的对应入口。

<span id="rag-全链路全景-从知识入库到可信回答-一套-agent-检索系统如何工作"></span>

[RAG 全链路全景：从知识入库到可信回答，一套 Agent 检索系统如何工作？](agent-knowledge-retrieval-end-to-end.md#rag-全链路全景-从知识入库到可信回答-一套-agent-检索系统如何工作)

<span id="一、先建立全景-一条问题链-四种不同的工作"></span>

[一、先建立全景：一条问题链，四种不同的工作](agent-knowledge-retrieval-end-to-end.md#一、先建立全景-一条问题链-四种不同的工作)

<span id="二、知识进入系统之前-先回答-我们究竟拥有什么"></span>

[二、知识进入系统之前，先回答“我们究竟拥有什么”](agent-knowledge-retrieval-end-to-end.md#二、知识进入系统之前-先回答-我们究竟拥有什么)

<span id="一份报告有三种身份"></span>

[一份报告有三种身份](agent-knowledge-retrieval-end-to-end.md#一份报告有三种身份)

<span id="解析覆盖比-chunk-数量更重要"></span>

[解析覆盖比 chunk 数量更重要](agent-knowledge-retrieval-end-to-end.md#解析覆盖比-chunk-数量更重要)

<span id="更新是一个有条件的状态变化"></span>

[更新是一个有条件的状态变化](agent-knowledge-retrieval-end-to-end.md#更新是一个有条件的状态变化)

<span id="三、在线查询不是-拿用户输入去搜全库"></span>

[三、在线查询不是“拿用户输入去搜全库”](agent-knowledge-retrieval-end-to-end.md#三、在线查询不是-拿用户输入去搜全库)

<span id="权限过滤为什么应在-top-k-之前"></span>

[权限过滤为什么应在 Top-K 之前](agent-knowledge-retrieval-end-to-end.md#权限过滤为什么应在-top-k-之前)

<span id="词法、向量、融合和精排解决的是不同问题"></span>

[词法、向量、融合和精排解决的是不同问题](agent-knowledge-retrieval-end-to-end.md#词法、向量、融合和精排解决的是不同问题)

<span id="四、最容易消失的不是-chunk-而是-模型实际看到它-的事实"></span>

[四、最容易消失的不是 chunk，而是“模型实际看到它”的事实](agent-knowledge-retrieval-end-to-end.md#四、最容易消失的不是-chunk-而是-模型实际看到它-的事实)

<span id="外置结果尤其容易制造-读过了-的假象"></span>

[外置结果尤其容易制造“读过了”的假象](agent-knowledge-retrieval-end-to-end.md#外置结果尤其容易制造-读过了-的假象)

<span id="一条答案里-哪些部分真的能说"></span>

[一条答案里，哪些部分真的能说？](agent-knowledge-retrieval-end-to-end.md#一条答案里-哪些部分真的能说)

<span id="五、模型读过之后-资料仍可能失去披露资格"></span>

[五、模型读过之后，资料仍可能失去披露资格](agent-knowledge-retrieval-end-to-end.md#五、模型读过之后-资料仍可能失去披露资格)

<span id="六、四条链路怎样分工-而不是造一个包办一切的-rag-manager"></span>

[六、四条链路怎样分工，而不是造一个包办一切的 RAG Manager？](agent-knowledge-retrieval-end-to-end.md#六、四条链路怎样分工-而不是造一个包办一切的-rag-manager)

<span id="七、评测要沿-证据第一次在哪儿丢失-展开"></span>

[七、评测要沿“证据第一次在哪儿丢失”展开](agent-knowledge-retrieval-end-to-end.md#七、评测要沿-证据第一次在哪儿丢失-展开)

<span id="八、什么时候采用完整-rag-什么时候应该主动保持简单"></span>

[八、什么时候采用完整 RAG，什么时候应该主动保持简单？](agent-knowledge-retrieval-end-to-end.md#八、什么时候采用完整-rag-什么时候应该主动保持简单)

<span id="九、重新走完那份-2023-年公告研究"></span>

[九、重新走完那份 2023 年公告研究](agent-knowledge-retrieval-end-to-end.md#九、重新走完那份-2023-年公告研究)

[翻修前的固定版本](https://github.com/hpoenixf/eff-agent-article/blob/a629e450e9e3a505089b54d68a14eaecf3b9a2fb/articles/rag-end-to-end-system-panorama.md)
