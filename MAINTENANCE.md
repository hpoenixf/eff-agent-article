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

构建前还需要 **Fontconfig（`fc-match`）与 Noto Sans CJK SC 字体**。Mermaid 在构建时测量文字；缺少中文字形时，回退字体的宽度会被写入 SVG，导致读者端的真实中文被截断。Linux / Ubuntu 可安装：

```bash
sudo apt-get update
sudo apt-get install -y --no-install-recommends fonts-noto-cjk fontconfig
fc-match -f '%{family}\n' 'Noto Sans CJK SC:lang=zh-cn'
```

最后一条命令应返回 `Noto Sans CJK SC`，而不是其他回退字体。构建脚本在渲染前检查此条件；不会将缺字渲染当作成功。macOS / Windows 若本机没有可用的 Fontconfig 与同名字体，请使用现有 Linux CI 构建，或先在自己的构建环境安装两项依赖并确保 `fc-match` 位于 PATH；不要跳过检查。原图仍是可缩放的 SVG，读者端无需安装构建工具。普通阅读预览按屏幕高度等比缩放，点击图片或“放大查看完整图”可打开完整 SVG；打印不受屏幕高度限制。

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

## Open ETF Agent topic

- English-first entry: `/en/open-etf-agent`; Chinese equivalent: `/open-etf-agent`. Keep both home entries, nav discovery, explicit language selection and base-path routing.
- `book.mjs` is the only article identity/order owner. `open-etf-topic.mjs` joins its module groups with exact public-repository snapshots in `data/open-etf-agent/`; do not hand-maintain a second article list.
- After a qualified public-code update, update the existing `.github/open-etf-code-source.json` only after the selected code commit is published and independently read back, then run `node scripts/sync-open-etf-topic.mjs --sync`. This copies `docs/verification/article-coverage.json`, `.en.json`, `article-coverage-receipts.json` and root `versions.json` byte-for-byte from that fixed public commit, after cross-checks. `node scripts/sync-open-etf-topic.mjs --check` runs in CI and rejects any snapshot that differs from its published source. No separate source-pin owner is introduced. The snapshot source commit identifies qualification, not necessarily current repository HEAD.
- Review presentation-only version captions and current stable/WIP text separately: one version, one distinct delivery focus; do not promote WIP, historical test totals, or execution receipts into release/model/investment-quality claims. Preserve `semanticStatus: unreviewed` and per-article scope. Newly cataloged articles remain unassessed unless the authoritative coverage contract says otherwise.
- Run `npm run check:topic`, `npm run check:catalog`, and `npm run docs:build`; inspect English/Chinese pages at desktop/mobile widths, keyboard focus, language switching with a saved opposite preference, and Back/Forward. Tests of this page do not replace complete deployment CI.
- Publication remains article source → canonical blog lock/build at `hpoenixf/myblog-v2` → `https://hpoenixf.com/eff-agent-article/`. No parallel website. Verify exact source/lock/CI and public HTML body, routes, links and snapshot counts after deployment.


## 自动最近更新 / Automatic recent updates

首页末尾由 VitePress content loader 从 `book.mjs` 的唯一目录、对应正文和固定源码提交的 Git 历史自动选取最近五篇。无需手填日期或另维护五篇清单；新增文章沿原流程提交并加入目录后自动进入。英文只展示 `book.en.mjs` 已登记完整译文且实际存在的英文页面。草稿、历史副本、未提交文件不进入列表；完整目录不受五篇预览限制。

`article-history.mjs` 沿用既有 RSS 的 Git 时间来源，但保留原 RSS 行为不变。首页进一步比较内容：沿固定 HEAD 的 first-parent 历史，比较文章正文与前一主线版本，保留最近内容变化的真实提交时间和新增/更新身份。合并提交只计主线可见事件。普通正文的空白/换行及明确的派生时间、布局字段（lastUpdated、updatedAt、createdAt、layout、outline、sidebar、pageClass）调整被忽略；title、description、evidence 及其他未知 frontmatter 字段保守计入内容变化。book-only 分类或目录展示调整不计为文章正文更新；围栏代码与 Mermaid 保留空白语义。此规则不是 AI 语义审核：标题措辞、链接或图源调整可能计入内容更新，也不证明功能实现或真实验收。显示日期统一为北京时间（UTC+8），HTML time 保留完整真实提交时间。日期是源码内容事件时间，不冒充线上首次部署时间。

源仓库检查与博客固定来源 checkout 均需 `fetch-depth: 0`。缺 Git、浅克隆或读取失败时输出构建 warning，首页降级为“暂无法确认最近更新”和完整目录入口；不阻断正文站点构建，也不把浅克隆边界或构建时间当文章发布时间。没有额外网络请求、定时任务、写仓权限或新增凭据。列表随原 source → blog pin → CI 部署更新；新域读回才算上线。

Recent homepage entries reuse the existing publication chain’s full Git history; existing RSS behavior is unchanged. Canonical catalogue membership, actual translated pages and draft flags filter the results. Prose whitespace-only changes and explicitly listed derived-time/layout fields do not refresh dates; reader-visible title/description, evidence and unknown metadata remain content. Catalogue-only reclassification does not refresh article history; fenced examples retain meaningful whitespace. This is a bounded content comparison, not a claim of semantic equivalence or deployment timing. Full Git history provides reliable recent entries; missing history produces a warning and catalogue fallback without preventing article builds.

### 分类与多标签并行

分类与学习路线仍由 `book.mjs` 唯一维护；标签不会移动文章或变更 URL。`article-tags.data.ts` 构建派生共享数据：金融取现有 `fintech.md` 的 canonical 本地文章链接（双语归一去重）；全景取既有 `panoramaSeriesSlugs`；开源取 `open-etf-topic.mjs` 的 coverage target 关联（含 additionalTargets）。首页入口、正文标签与目录多选筛选共用此数据。多选采用“同时满足”，可清除筛选。金融中英文专题须保持同一集合，原分类测试会核验。

开源标签表示文章有关联 target，不等于功能完整实现或正式发布；只有原资格回执认可的 limited 状态显示“有限范围已验证”，其余显示“有关联 · 未验证”。没有证据不补造 WIP / Release 身份；细节链接至原开源专题。book-only 分类变动不是文章正文更新时间，最近更新仍按文章 Git 内容规则独立派生。


## 顶部导读卡 / Article reading briefs

正式目录及保留的历史全文，每个已存在的语言版本都在自身 Markdown 的 frontmatter 维护一份 `readingBrief`：

```yaml
readingBrief:
  takeaways:
    - "逐篇通读正文后写出的第一个具体判断。"
    - "第二个独立结论，保留原文的条件和关键取舍。"
    - "第三个可帮助读者行动的结论，不虚构效果。"
  appliesTo:
    - "这篇文章能够帮助判断的具体读者任务或场景。"
  notFor:
    - "本文不回答的问题，或不能直接套用结论的条件。"
```

- 结论为 **3–5 条**，适用及不适用各 **1–2 条**；默认三条短结论和各一条边界，避免窄屏首屏再次变成长文。示例仅展示字段，不是可批量套用的成稿。
- 必须通读完整文章后提炼，尤其核对结尾、反例和实际范围；不能截取开头、复制 SEO description，或只按标题生成通用话术。结论强度不超过正文，保留设计／实现／有限验证／真实效果的区别，不借导读新增性能或投资主张。
- 现有完整英文正文在自己的 `en/articles/<slug>.md` 本地化同一语义，不共享中文文案，也不把缺失的英文全文补成摘要占位。历史全文按其自身版本提炼；旧合稿跳转页没有卡片，不改变其导航身份。
- `article-reading-brief.mjs` 是唯一校验与估时实现。它复用 VitePress 对完整正文解析后的 tokens，按每分钟 300 个汉字及 200 个其他语言词混合累加、向上取整，最低一分钟。包含段落、表格与代码示例；不含 frontmatter、注释、链接地址／HTML 属性、自动导航组件及 Mermaid 图源。图解精读、思考和运行示例另留时间，所以页面明确写“预计／Estimated”，不是实测阅读速度。
- 不在源文件手填分钟数，也不另维护摘要 JSON、第二文章目录或每文组件标记。Markdown 插件统一在原 H1 后插入 `ArticleReadingBrief`，无 H1 时置顶；原正文、章节锚点、证据字段、历史及代码资格不改。导读属于真实可见编辑内容，沿既有文章历史规则记录，不冒称算法生成的新正文或新验收。
- `npm run check:briefs` 检查全站既有语言覆盖、字段、重复结论组和估时／渲染边界；`npm run check:catalog` 已包含它。构建后的 `node scripts/check-reading-briefs.mjs --output` 核对每篇静态 HTML 中的单一卡片、完整文案和本地化时长。结构测试不能替代逐篇内容审稿；另外检查桌面／窄屏、键盘展开估时说明和语言切换。

Each existing full article edition owns its reviewed `readingBrief` in Markdown frontmatter. Read the complete body before writing 3–5 distinct conclusions and concise adoption boundaries; preserve historical scope and existing English meaning. The shared Markdown plugin inserts one server-rendered card after the title and derives an explicitly estimated reading time from that edition's full parsed body. Do not hand-enter minutes, duplicate the content registry, or promote a compatibility pointer into a new article. Source checks, local rendering, the canonical blog pin and actual public deployment remain separate verification stages.
