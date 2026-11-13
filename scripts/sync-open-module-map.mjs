// Presentation import only. Open's reviewed manifest and SVG remain the source.
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve,dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const begin='<!-- open-module-map:start -->',end='<!-- open-module-map:end -->';
const snapshot=JSON.parse(await readFile(resolve(root,'data/open-etf-agent/module-map.json'),'utf8'));
if(snapshot.schemaVersion!==1||snapshot.repository!=='hpoenixf/open-etf-agent'||!/^[a-f0-9]{40}$/.test(snapshot.sourceCommit??''))throw Error('Fixed Open import commit required');
const m=snapshot.manifest;
const kinds={zh:{'module-article':'模块专文',overview:'导读','open-walkthrough':'Open 练手篇',workshop:'专题练手篇'},en:{'module-article':'Module article',overview:'Overview','open-walkthrough':'Open walkthrough',workshop:'Workshop'}};
for(const [p,hash] of Object.entries(snapshot.assets)){
 if(!/^visuals\/open-etf-agent\/module-map(?:\.zh-CN)?\.svg$/.test(p))throw Error('Unexpected map asset');
 const bytes=await readFile(resolve(root,p));if(createHash('sha256').update(bytes).digest('hex')!==hash)throw Error('Map asset differs from imported Open bytes');
}
for(const lang of ['zh','en']){
 const zh=lang==='zh',file=zh?'open-etf-agent.md':'en/open-etf-agent.md',asset='visuals/open-etf-agent/module-map'+(zh?'.zh-CN':'')+'.svg';
 const svg=await readFile(resolve(root,asset),'utf8'),dims=svg.match(/viewBox="0 0 (\d+) (\d+)"/);
 if(!dims)throw Error('Map viewBox missing');
 const label=zh?'Open ETF Agent 六层模块地图：点击模块阅读对应文章':'Open ETF Agent six-layer map: select a module to read its article';
 let block=`${begin}\n<div class="vp-doc" style="max-width: 1440px; margin: 24px auto; padding: 0 24px;">\n\n<a id="module-map"></a>\n## ${zh?'按模块与能力阅读六层地图':'Read the six-layer map by module and capability'}\n\n${zh?'点击图内卡片进入对应文章；可全屏展开、缩放和滚动。图中是 Open 的有界公开实现，不代表专文所述全部能力已开源或通过验收。':'Select a card to open its corresponding article. Expand, zoom and scroll the map. The map describes bounded Open implementation, not a claim that every capability in the article is public or qualified.'}\n\n${zh?'当前范围':'Current scope'}: **v${m.reviewedVersion}** · [${zh?'固定导航源':'Fixed navigation source'}](https://github.com/hpoenixf/open-etf-agent/tree/${snapshot.sourceCommit}) · [${zh?'代码与验证边界':'Code and verification limits'}](https://github.com/hpoenixf/open-etf-agent/blob/${snapshot.sourceCommit}/docs/module-status${zh?'.zh-CN':''}.md)\n\n<PanoramaViewer src="/eff-agent-article/${asset}" label="${label}" :canvas-width="${dims[1]}" :canvas-height="${dims[2]}">\n<div style="overflow: auto; max-width: 100%;">\n<object type="image/svg+xml" data="/eff-agent-article/${asset}" style="display:block;width:1320px;max-width:none;height:${Math.round(1320*Number(dims[2])/Number(dims[1]))}px;" aria-label="${label}">\n<a href="/eff-agent-article/${asset}">${zh?'打开可点击 SVG':'Open clickable SVG'}</a>\n</object>\n</div>\n</PanoramaViewer>\n\n[${zh?'在独立页面打开图':'Open the interactive SVG directly'}](/eff-agent-article/${asset})\n\n<details>\n<summary>${zh?'逐模块文章入口（与图内链接一致）':'Article links by module (same destinations as the map)'}</summary>\n\n`;
 for(const layer of m.layers){block+=`### ${layer.id} · ${layer.title[lang]}\n\n`;for(const c of m.cards.filter(c=>c.layer===layer.id)){
 const a=c.article;if(!a){block+=`- **${c.name}**: ${zh?'无公开对应文章':'No corresponding public article'}\n`;continue;}
 const path=`${zh?'':'en/'}articles/${a.slug}.md`;const body=await readFile(resolve(root,path),'utf8');if(body.length<200)throw Error('Empty article edition '+path);
 const url=`https://hpoenixf.com/eff-agent-article/${zh?'':'en/'}articles/${a.slug}`;
 if(!svg.includes(url))throw Error('Article index and SVG differ: '+c.id);
 block+=`- **${c.name}** → [${a.title[lang]}](${url}) · ${kinds[lang][a.kind]??a.kind}\n`;
 }block+='\n';}
 block+=`</details>\n\n${zh?'虚线卡片是同一 Owner 的调用位置，不另算独立模块。文章链接属于阅读导航，不改变已有文章覆盖资格与历史验收记录。GitHub README 中的图仅作预览，图内交互在本页提供。':'Dashed cards represent call-sites of existing owners, not additional modules. Article links provide reading navigation only; existing coverage qualification and historical evidence remain unchanged. The GitHub README image is a preview; interactive card navigation is available here.'}\n\n</div>\n${end}`;
 const p=resolve(root,file),old=await readFile(p,'utf8');if(old.split(begin).length!==2||old.split(end).length!==2||old.indexOf(end)<old.indexOf(begin))throw Error('Missing topic map markers');
 const next=old.slice(0,old.indexOf(begin))+block+old.slice(old.indexOf(end)+end.length);
 if(process.argv.includes('--check')){if(old!==next)throw Error('Stale topic map: '+file);}else await writeFile(p,next);
}
console.log('Open module map topic and article links verified');
