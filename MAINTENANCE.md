# 文集维护与发布

读者入口见 [README.md](README.md)。本页集中维护旧链接、双语正文、图表和正式发布链的既有约定，不计入文章目录。

## 已合并文章的旧链接

旧版 023 发布治理、runtime-natural-language-boundary 和 028 反馈专题仍保留指向现有主稿的合稿引导，**不另算正文**。不为分类调整创建旧文章副本。

## English editions / 双语发布

The Chinese originals remain at `/articles/<slug>`. Reviewed complete English translations use
`/en/articles/<slug>`; both editions share the same stable slug, canonical category and order in `book.mjs`.
`book.en.mjs` holds only English display labels and the list of **actually translated** slugs,
never a competing article index. The English catalog marks untranslated essays “Chinese original.”

- Open `?lang=en` or `?lang=zh` on a site page to set the language preference; the reader switcher stores
  `etf-agent:language` in localStorage. A URL parameter overrides storage. Direct `/en/` links select English.
- The language switch preserves equivalent article paths only when a complete translation exists.
  Otherwise the Chinese original remains visible with a clear availability notice, never a fake translation.
- For each newly approved article, publish and review both `articles/<slug>.md` and
  `en/articles/<slug>.md`, register its English title and translated slug in `book.en.mjs`,
  and run `npm run check:catalog && npm run docs:build`. English must preserve code,
  evidence status, warnings, dates, diagrams, and citation semantics. Do not label a placeholder translated.
- Existing Chinese-only articles are **not** claimed to have English translations.

### 静态 Mermaid 架构图 / Build-time diagrams

正文中保留真实的 Mermaid 源码，中英文各自维护可读节点与判断分支。运行：

```bash
npm install
npm run check:catalog
npm run docs:build
```
时，站点在构建期使用固定的 Mermaid CLI 与本机 Chrome/Chromium，批量生成内容寻址 SVG。部署页面直接显示图片；**浏览器没有 JavaScript 仍能看到图**，旧客户端 Mermaid 渲染器已退出。图源码语法错误、预期文件缺失或 SVG 校验失败会阻断构建。

本机需要 Chrome/Chromium；命令找不到浏览器时设置 `MERMAID_CHROME_PATH=/path/to/chrome` 并重试。CI 使用 Runner 自带 Chrome 和 `PUPPETEER_SKIP_DOWNLOAD=1`
避免再次下载浏览器。静态图片属于构建产物，保留文章里的 Mermaid 作为**唯一图源**，不在公开仓库另维护一份容易漂移的 SVG 正文。英文本地图不是简单复用带中文标签的图片：只有图源码与正文译文达到原有双语检查要求，才算该语言图文齐备。

### Bilingual diagrams and illustrations / 图表双语规则

Each English article is a full Markdown edition, not a summary. Mermaid source for each article is
localized **inside the corresponding language's Markdown**: Chinese diagram nodes and edge labels
in `articles/<slug>.md`, English nodes/edges in `en/articles/<slug>.md`. Technical identifiers
and stable field names remain unchanged; decision conditions, failure branches and connector counts
must match. Markdown table headings and cell descriptions are translated too.

Language-bearing `SVG`, `HTML` illustrations and image captions must be localized separately:
prefer `visuals/<slug>/...` for the Chinese edition and `visuals/en/<slug>/...` for English,
with the English article linking its localized asset. Truly language-neutral images may be shared;
do not link Chinese-labeled SVG/HTML from English pages. Diagram links, image URLs and figures
must survive GitHub Pages base-path resolution. Standalone interactive HTML visualizations need
independently localized UI labels and text; translating the linking article is not enough.

Run `npm run check:catalog` to validate canonical slugs, route tests and bilingual
visual structure (Mermaid blocks, table rows, image counts, and Chinese text in English
Mermaid/SVG/HTML). Review diagram semantics manually: structural checks cannot translate
embedded screenshots or certify semantic equivalence.

The first retrospective translation batch adds seven complete articles: long-term Memory,
RAG revocation, investment research authorization, coding-agent task convergence, the
project origin story, tool lifecycle tracing, and false-green test evidence. Combined with the
earlier tool-result essay there are **eight complete English article editions** in this batch's
snapshot; the authoritative live list is `book.en.mjs`, not this count.


## 唯一正式发布链 / One canonical publication path

公开正文只由 `hpoenixf/myblog-v2` 发布到 **[https://hpoenixf.com/eff-agent-article/](https://hpoenixf.com/eff-agent-article/)**。
本仓库是唯一文章源；每次发布由博客仓库的 `reader-source.json` 锁定已审核 source commit
及本次中英正文 SHA-256。文章源提交通过检查以后，仍须更新并提交博客发布锁，等待其
Pages 部署并读回新域名的 `reader-release.json` 和实际正文，才算发布完成。

本仓库 CI 保留目录、双语、构建检查，但给旧 `github.io` Pages 上传的只有逐页跳转，
没有第二套正文或静态应用资产。旧中英文、历史版本和图册 URL 跳到新域同路径，保留
查询参数与章节 hash。不要恢复独立正文部署，也不要用文章仓库 CI 代替新域名验收。

The article repository is the source, not a second publishing owner. The blog's immutable
release pin selects the source commit; its deployment receipt and exact public HTML bytes
must agree on the canonical domain. Legacy GitHub Pages serves redirects only.