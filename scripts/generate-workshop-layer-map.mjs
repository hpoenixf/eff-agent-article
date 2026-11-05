// The workshop uses the same architecture layer names and order as the other stages.
// Exercises remain examples within a layer; they are not a second architecture.
import { writeFileSync } from 'node:fs'
import { sixLayerNames } from './six-layer-names.mjs'
const examples = {
  zh: [
    ['提出任务', '问题文件 → submit', ['提交只保存；work 才执行。']],
    ['锁定范围', '项目 · Run · manifest', ['资料、权限和预算不随恢复重置。']],
    ['决定下一步', 'Main · 工具循环 · Child', ['模型选择动作，执行仍受原约束。']],
    ['取得依据', '选定文本 · Memory · 受限核对', ['偏好与 Child 判断不能冒充原文。']],
    ['留下成果', '报告文件 · Publication 回执', ['说“完成”不等于报告已经保存。']],
    ['重新打开', 'CLI 回读 · 本地只读 Reader', ['关闭执行进程后，仍可读持久结果。']]
  ],
  en: [
    ['Request work', 'Question file → submit', ['Submission saves; work executes.']],
    ['Bind the scope', 'Project · Run · manifest', ['Recovery retains sources,', 'permissions and budgets.']],
    ['Choose the next step', 'Main · tool loop · Child', ['Model choices remain', 'within the original grant.']],
    ['Acquire evidence', 'Text · Memory · bounded checks', ['Preferences and Child opinions', 'cannot replace the source.']],
    ['Keep the deliverable', 'Report · Publication receipt', ['An answer is not a saved report.']],
    ['Open it again', 'CLI · local read-only Reader', ['Read persisted results', 'after the execution process exits.']]
  ]
}
const escape = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
const text = (x, y, label, size = 18, weight = 500, fill = '#172C46', attributes = '') => `<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${fill}" ${attributes}>${escape(label)}</text>`
function render(language, mobile) {
  const en = language === 'en', width = mobile ? 390 : 1280, height = mobile ? 956 : 840
  const title = en ? 'Workshop: the same six layers' : '练手篇：同一套六层架构'
  const scope = en ? 'v0.20 local project · the bounded subset used here' : 'v0.20 本地项目 · 本练习实际使用的有界子集'
  const out = [`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc">`,
    `<title id="title">${title}</title><desc id="desc">${scope}</desc>`,
    '<style>text{font-family:"Noto Sans CJK SC","Noto Sans SC","Microsoft YaHei",Arial,sans-serif}</style>',
    `<rect width="${width}" height="${height}" fill="#F6F8FC"/>`,
    `<rect width="${width}" height="${mobile ? 100 : 102}" fill="#0F203D"/>`]
  out.push(text(mobile ? 18 : 32, mobile ? 35 : 46, title, mobile ? 22 : 30, 760, '#FFFFFF'))
  if (mobile) {
    out.push(text(18, 64, en ? 'v0.20 local project' : 'v0.20 本地项目', 15, 500, '#BDCEE4'))
    out.push(text(18, 86, en ? 'Only the bounded subset used here' : '本练习实际使用的有界子集', 14, 500, '#BDCEE4'))
    out.push(text(18, 126, en ? 'Architecture layer → workshop example' : '统一架构层 → 本次练习示例', 16, 650, '#245A97'))
  } else {
    out.push(text(32, 79, scope, 18, 500, '#BDCEE4'))
    out.push('<rect x="24" y="114" width="1232" height="36" rx="8" fill="#E7EDF7"/>')
    out.push(text(40, 139, en ? 'Stage 4: the same layer names and order; the actions below are examples within them.' : '第 4 站：层名与层序沿用统一架构；下方动作是各层中的练习示例。', 18, 650, '#245A97'))
    out.push(text(42, 178, en ? 'Architecture layer' : '统一架构层', 17, 700))
    out.push(text(338, 178, en ? 'Workshop example' : '本次练习', 17, 700))
    out.push(text(790, 178, en ? 'What to check' : '检查要点', 17, 700))
  }
  for (const [index, layer] of sixLayerNames.entries()) {
    const [action, mechanism, checks] = examples[language][index]
    const y = (mobile ? 144 : 192) + index * (mobile ? 124 : 92)
    out.push(`<g data-layer-id="${layer.id}" data-layer-name="${escape(layer[language])}" data-layer-top="${y}">`)
    if (mobile) {
      out.push(`<rect x="12" y="${y}" width="366" height="118" rx="8" fill="${index % 2 ? '#EFF3F9' : '#FFFFFF'}" stroke="#DCE5ED"/>`)
      out.push(text(24, y + 24, layer.id, 17, 760, '#2563A9'))
      out.push(text(62, y + 24, layer[language], 17, 730))
      out.push(text(24, y + 48, action, 16, 700, '#17334B'))
      out.push(text(24, y + 70, mechanism, en ? 15 : 15.5, 600, '#17334B'))
      checks.forEach((line, i) => out.push(text(24, y + 91 + i * 17, line, 14, 450, '#5C6F84')))
    } else {
      out.push(`<rect x="24" y="${y}" width="1232" height="84" rx="9" fill="${index % 2 ? '#EFF3F9' : '#FFFFFF'}"/>`)
      out.push(`<rect x="32" y="${y + 6}" width="274" height="72" rx="7" fill="#E8EFFA"/>`)
      out.push(text(46, y + 31, layer.id, 21, 760, '#2563A9'))
      out.push(text(46, y + 60, layer[language], en ? 20 : 21, 730))
      out.push(text(338, y + 32, action, 23, 730, '#17334B'))
      out.push(text(338, y + 62, mechanism, 19, 550, '#5C6F84'))
      checks.forEach((line, i) => out.push(text(790, y + (checks.length > 1 ? 32 : 46) + i * 25, line, en ? 19 : 20, 500, '#465673')))
    }
    out.push('</g>')
  }
  if (mobile) {
    out.push(text(18, 917, en ? 'Responsibility layers, not six services.' : '六层是职责地图，不是六个服务。', 13.5, 500, '#465673'))
    out.push(text(18, 939, en ? 'Not a complete production or finance platform.' : '本地练习不等于完整生产或金融平台。', 13.5, 500, '#465673'))
  } else {
    out.push('<rect x="24" y="760" width="1232" height="64" rx="8" fill="#FFFFFF" stroke="#DCE5ED"/>')
    out.push(text(42, 786, en ? 'Keep the report, original task and traceable sources.' : '带走报告、原任务与可回查来源。', 19, 650, '#246F5D'))
    out.push(text(42, 811, en ? 'The layers describe responsibilities, not six services or a complete production or finance platform.' : '六层是职责地图，不是六个服务；本地练习不等于完整生产或金融平台。', 17, 500, '#465673'))
  }
  return out.join('\n') + '\n</svg>\n'
}
for (const language of ['zh', 'en']) for (const mobile of [false, true]) {
  writeFileSync(new URL(`../public/diagrams/open-workshop/six-layers-${language}${mobile ? '-mobile' : ''}.svg`, import.meta.url), render(language, mobile))
}
console.log('Generated workshop maps with the canonical six-layer display vocabulary')
