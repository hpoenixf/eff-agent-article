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

## 全部文章的日期排序 / Catalogue date order

只有 `/catalog` 与 `/en/catalog` 提供创建／更新时间各自的升序、降序；默认仍按原目录顺序展示。日期模式对当前标签交集内的全部主类文章统一排序，不把关联阅读重复计入，也不改变分类页、主页或 `book.mjs` 顺序。缺失日期双向均置后；同一时刻按原目录顺序稳定排列。

日期继续由 `article-history.mjs` 从固定源码 HEAD 的完整 Git 主线历史派生，不存手填日期或构建时刻。创建表示当前语言版本首次纳入本站主线的版本记录，不代表原稿创作或首次线上发布时间；沿 Git 识别的重命名追溯，删除后重新建立的文件不继承旧实例日期。合并按首次在主线可见的提交计时。更新保留既有可见内容比较：纯格式和明确派生字段不刷新，标题、说明、证据与导读卡等可见内容变化仍算更新。中英文各取实际目标正文的历史；“Chinese original” 回退使用中文原文的日期。时间显示为 UTC+8，`time` 元素保留完整提交时间。历史缺失或浅克隆时显示未知，不填今天。

`article-chronology.data.ts` 只是上述 owner 的构建期投影，不是第二套文章目录或日期真值。原生带标签的 `select` 保留标准键盘语义；单测覆盖四种顺序、标签交集、未知末尾、同刻稳定、翻译回退、主线合并及改名历史。`node scripts/check-catalog-order-output.mjs` 检查真实构建产物中的中英入口与默认视图。VitePress 退出码为 0 不代表每页 SSR 无异常；检查构建日志异常与原 `postdocs:build` 全部产物门，不能只报进程完成。

The independent bilingual catalogue adds four opt-in date orders while preserving canonical category order and all-selected tag filtering. Creation means the edition's first recorded main-branch version on this site—not its original writing or live-publication date. The existing Git history owner follows recognized renames, treats a deleted/re-created path as a new lineage, and retains visible-content update semantics, including reading briefs. Unknown dates always sort last; equal timestamps retain canonical catalogue order. No article body, historical timestamp, or RSS policy is rewritten.

首页第六个入口复用现有中英 Open ETF Agent 专题，与原五个入口同属 `features`，不新增分类或推广面板；沿用桌面三列与窄屏单列规则。链接只表达可运行开源教学实现入口，不提高文章关联、测试或真实金融效果的资格。

## 页面结构化语义 / Landing structured data

`seo-content.mjs` 是 JSON-LD 的唯一构造入口，由 VitePress 的 `transformPageData` 输出。中英文首页用同一文集 URL 与 `@id` 描述双语 `WebSite`；全部文章及既有原则、开源、全景专题使用各自语言的 `CollectionPage`，复用可见标题、说明与 canonical。只有这些明确路由获得落地页语义，不给文章重复添加站点块，不把历史／合稿兼容页、贡献文档或分类页冒充新首页。生成器只替换自身标记的 script，保留其他明确编写的结构化内容；输出检查拒绝冲突的重复页级 schema，不静默吞掉它们。

既有 `Article`、OG/Twitter 和作者／图片的 opt-in 规则保持不变；不从仓库所有权推断作者、不把本站 Git 收录日期冒充原始发表日期、不把通用社交图当作每篇的真实插图。没有已核对的信息就不添加作者、日期、publisher、评分或搜索动作。校验仍检查真实 HTML 中的单份 schema、双语 URL、兼容页 noindex 与每篇明确的来源字段。

这是 [Schema.org WebSite](https://schema.org/WebSite) 与 [CollectionPage](https://schema.org/CollectionPage) 的页面语义补齐，不是搜索排名或富媒体结果承诺。[Google site-name 规则](https://developers.google.com/search/docs/appearance/site-names) 不支持子目录级独立站名，因此文集首页的 WebSite 不代替 `hpoenixf.com` 根站点的身份，也不为此迁移 URL。[Article 指南](https://developers.google.com/search/docs/appearance/structured-data/article) 要求按真实适用信息添加字段，不用虚构信息凑齐推荐项。

The shared JSON-LD owner describes the bilingual collection website and its actual catalogue/topic pages without changing URLs, article provenance or date ownership. The rendered-output gate checks exact single schemas and route isolation. This subdirectory's semantic markup does not claim Google's domain-level site-name eligibility, rich-result visibility or a ranking improvement.

### 目录工具栏与分页 / Catalogue toolbar and pagination

只有中英文独立目录使用统一标签 chips、样式化原生 select 与原生 details 帮助；窄屏可换行，不实现第二套下拉键盘模型。帮助保留标签交集及创建／更新时间的真实语义。分类页、首页、正文不受分页影响。

沿同一目录先执行标签交集，再完整排序，最后每页显示 20 篇主文章；默认目录顺序保留原分类与篇目顺序，以逐篇卡片呈现，分类页仍保留章节分组。`catalog-view.mjs` 的纯函数只投影现有目录，不修改目录顺序、日期或正文。筛选、清除及排序变化回到第 1 页；页号越界自动收敛，0 项显示空状态，未知日期与同刻稳定规则不变。分页有总数／范围／页数、禁用边界按钮、`aria-current` 和动态状态；不强制滚动或抢焦点，结果区有可聚焦的锚点入口。

同一个筛选与排序后的完整列表也在原生 details 中输出全部正文链接。首屏 20 篇与完整链接都存在于 SSR HTML，关闭 JavaScript 仍能展开并访问后页文章；不靠只有点击后才生成的链接维持收录，不另造 URL、第二套目录或重复全文。中英链接及 Chinese original 回退保持原路由 owner。验证纯函数的 0／1／20／21／多页边界、实际 Vue 事件状态切换、SSR 首屏和完整链接；轻量渲染宿主不替代浏览器视觉、焦点与键盘实测。

The independent bilingual catalogue filters, sorts, then paginates 20 primary articles at a time. Its compact toolbar retains native select/details semantics. A server-rendered, user-expandable list of every matching article keeps later pages accessible without JavaScript; it is a projection of the existing registry, not a second index or duplicate full text. Category/home behavior and article/date ownership stay unchanged.

独立目录采用宽版容器，标题与动态统计同排，宽屏双列／窄屏单列；每卡分类和真实创建／更新日期在同一底部信息区。桌面控件可见高度 36px，粗指针与手机保持 44px 触控目标；焦点样式和原生操作语义不变。


## 列表简介 / Authored list descriptions

正式目录中每个已存在语言版本的 Markdown frontmatter `description` 是列表简介的唯一编辑源。最近更新与全部文章通过 `article-descriptions.data.ts` 共用 `article-description.mjs` 的构建期投影；不另建摘要清单，不截取首段、拼接标题或顶部导读结论。英文采用自身完整译文的简介，缺英文全文的目录入口继续使用真实中文原文及其简介，不伪造英文版本。历史副本与兼容跳转不因列表覆盖而改写。

简介需通读完整正文后概述文章的具体问题、主要机制与必要边界，不能把设计、有限示例或合成数据写成已验证效果。已有准确简介不为凑字数改写；文章实质变化时一并复核对应语言。顶部 `readingBrief` 负责结论与适用判断，不能由一句简介替代。

界面用 CSS 显示约两行，保留完整 DOM 文本、标题链接的 `aria-describedby` 和原生完整提示；不在数据层截字。`npm run check:descriptions` 拒绝缺项、重复、标题或单条结论冒充简介，并测试共享来源；该门纳入 `check:catalog`。构建后 `node scripts/check-article-descriptions.mjs --output` 核对中英文首页和全部文章的实际完整文本及关联。结构检查不替代全文编辑审校或真实浏览器验收。

简介是可见内容，仍按原 `article-history.mjs` 规则记录更新，不排除本次修改或回写历史日期。正文、目录顺序、分页、标签和日期 owner 均保持不变。

Each canonical language edition owns its authored `description`. Recent updates and the independent catalogue consume the same build-time index; missing descriptions fail validation rather than becoming title, first-paragraph or reading-brief excerpts. Two-line CSS presentation retains full accessible text. Review the complete article and its qualifications before authoring a description; accurate existing text need not be padded. Visible description edits remain content updates under the existing history owner.
