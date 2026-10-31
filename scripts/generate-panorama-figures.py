#!/usr/bin/env python3
"""Reproduce the localized editorial SVG plates used by the five panorama essays."""
from pathlib import Path
from html import escape
import math

ROOT = Path(__file__).resolve().parents[1]
INK = '#16362f'
MUTED = '#4e665e'
PAPER = '#f7f8f2'
BORDER = '#cddbd1'
FONT = 'Noto Sans CJK SC, PingFang SC, Microsoft YaHei, Arial, sans-serif'
THEMES = {
    'observability': ('#236e9d', '#dcecf4', '可观测全景', 'Observability', '调用、缺口与原始事实', 'Requests, gaps and facts'),
    'evaluation': ('#a66b21', '#f5ead5', '测评全景', 'Evaluation', '让证据与声明相称', 'Match evidence to claims'),
    'citations': ('#1f806d', '#ddf0e7', '引用全景', 'Citations', '让关键主张可以回查', 'Make claims checkable'),
    'subagents': ('#7054a0', '#eae3f5', 'Subagent 全景', 'Subagents', '局部自主，成果交接', 'Local work, real handoffs'),
    'long-research': ('#a3523d', '#f6e3da', '超长研究全景', 'Long Research', '跨越窗口，保留进展', 'Continue across time')
}

class Plate:
    def __init__(self, theme, lang, height, title, subtitle=''):
        self.accent, self.tint, *_ = THEMES[theme]
        self.lang, self.height = lang, height
        self.parts = [f'<svg xmlns="http://www.w3.org/2000/svg" width="640" height="{height}" viewBox="0 0 640 {height}" role="img" aria-labelledby="title description" lang="{lang}">',
            f'<title id="title">{escape(title)}</title><desc id="description">{escape(subtitle or title)}</desc>',
            f'<defs><pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="{BORDER}" opacity=".45"/></pattern><linearGradient id="wash" x2="1" y2="1"><stop stop-color="{PAPER}"/><stop offset="1" stop-color="{self.tint}"/></linearGradient><filter id="shadow" x="-30%" y="-30%" width="160%" height="180%"><feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="{INK}" flood-opacity=".09"/></filter><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M1 1 L8 5 L1 9" fill="none" stroke="{self.accent}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></marker></defs>',
            f'<rect width="640" height="{height}" rx="24" fill="{PAPER}"/><rect x="1" y="1" width="638" height="{height-2}" rx="23" fill="url(#grid)" stroke="{BORDER}"/>']
        self.text(40, 48, 'AGENT / PANORAMA', 17, self.accent, 700, spacing=2)
        self.text(40, 100, title, 35, INK, 750)
        if subtitle: self.text(40, 140, subtitle, 25, MUTED)
    def text(self, x, y, lines, size=30, color=INK, weight=500, anchor='start', spacing=0):
        if isinstance(lines, str): lines = lines.split('\n')
        for i, line in enumerate(lines):
            self.parts.append(f'<text x="{x}" y="{y+i*size*1.35:g}" font-family="{FONT}" font-size="{size}" font-weight="{weight}" fill="{color}" text-anchor="{anchor}" letter-spacing="{spacing}">{escape(line)}</text>')
    def rect(self, x,y,w,h,fill='white',stroke=BORDER,r=18,shadow=False):
        self.parts.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" stroke="{stroke}" stroke-width="1.5"'+(' filter="url(#shadow)"' if shadow else '')+'/>')
    def path(self,d,color=None,width=2.5,dashed=False,arrow=False):
        self.parts.append(f'<path d="{d}" fill="none" stroke="{color or self.accent}" stroke-width="{width}" stroke-linecap="round" stroke-linejoin="round"'+(' stroke-dasharray="7 7"' if dashed else '')+(' marker-end="url(#arrow)"' if arrow else '')+'/>')
    def circle(self,x,y,r,fill=None,stroke=None,width=2):
        self.parts.append(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill or self.tint}" stroke="{stroke or self.accent}" stroke-width="{width}"/>')
    def card(self,y,title,detail='',number=None,h=112,x=40,w=560,size=32):
        self.rect(x,y,w,h,shadow=True)
        tx=x+26
        if number:
            self.circle(x+36,y+37,19,self.tint,self.tint)
            self.text(x+36,y+44,str(number),19,self.accent,750,'middle')
            tx=x+70
        self.text(tx,y+45,title,size,INK,700)
        if detail:self.text(x+26,y+84,detail,26,MUTED)
    def down(self,y1,y2,x=320):self.path(f'M{x} {y1} V{y2}',arrow=True)
    def note(self,y,lines):self.text(40,y,lines,26,self.accent,600)
    def save(self,theme,name):
        folder=ROOT/'visuals'/('en' if self.lang=='en' else '')/f'panorama-{theme}'
        folder.mkdir(parents=True,exist_ok=True)
        (folder/f'{name}.svg').write_text('\n'.join(self.parts+['</svg>'])+'\n')

def pair(lang,zh,en):return en if lang=='en' else zh

def cover(theme,lang,ordinal):
    accent,tint,zh,en,subzh,suben=THEMES[theme]
    p=Plate(theme,lang,420,pair(lang,zh,en),pair(lang,subzh,suben))
    p.rect(24,174,592,218,'url(#wash)',tint,22)
    p.text(46,292,f'{ordinal:02}',112,accent,750)
    p.text(48,354,pair(lang,'整体地图 · 关键取舍','MAPS / TRADE-OFFS'),22,accent,650)
    cx,cy=448,276
    if theme=='observability':
        for r in (84,58,30):p.circle(cx,cy,r,'none',accent,1.5)
        p.path(f'M{cx-100} {cy} H{cx+105}',width=1,dashed=True)
        p.path(f'M{cx} {cy-96} V{cy+94}',width=1,dashed=True)
        p.path('M337 313 L373 282 L409 302 L448 235 L490 263 L552 219',width=4)
        for x,y in [(337,313),(409,302),(448,235),(552,219)]:p.circle(x,y,7,'white',accent,3)
        p.circle(490,263,10,tint,accent,2)
    elif theme=='evaluation':
        for x,y,h in [(346,255,82),(426,218,119),(506,268,69)]:
            p.rect(x,y,57,h,'white',accent,9,True)
            p.path(f'M{x+12} {y+23} l10 10 l20 -22',width=3)
        p.path('M327 347 H586',width=2)
        p.circle(375,215,14,tint,accent)
        p.circle(535,225,14,'none',accent)
        p.path('M535 218 V226 M535 232 V232',width=3)
    elif theme=='citations':
        p.rect(353,208,139,143,tint,accent,13)
        p.rect(369,192,139,143,'white',accent,13,True)
        p.rect(387,231,102,27,tint,tint,4)
        for y in (217,274,293,312):p.path(f'M388 {y} H485',width=2)
        p.path('M489 245 H526 Q546 245 546 266 V278',width=3,arrow=True)
        p.rect(515,288,66,54,'white',accent,12,True)
        p.path('M531 307 H565 M531 321 H553',width=2)
    elif theme=='subagents':
        for x,y in [(337,238),(544,218),(542,337)]:
            p.path(f'M{cx} {cy} L{x} {y}',width=3)
            p.circle(x,y,28,'white',accent,2)
            p.path(f'M{x-8} {y} h16 M{x} {y-8} v16',width=2)
        p.circle(cx,cy,48,accent,accent)
        p.path(f'M{cx-17} {cy+2} l12 12 l25 -27',color='white',width=4)
        p.circle(cx,cy,66,'none',accent,1)
    else:
        p.path('M447 277 C394 191 326 221 339 283 C352 348 407 332 447 277 C489 216 552 217 563 270 C579 347 492 355 447 277',width=20,color=tint)
        p.path('M447 277 C394 191 326 221 339 283 C352 348 407 332 447 277 C489 216 552 217 563 270 C579 347 492 355 447 277',width=3,color=accent)
        for x,y in [(340,275),(447,277),(563,270)]:p.circle(x,y,10,'white',accent,3)
        p.path('M538 215 l20 4 l-8 18',width=3)
    p.save(theme,'cover')

def observability(lang):
    t='observability'
    p=Plate(t,lang,650,pair(lang,'同一项研究，两条事实路径','One task, two fact paths'))
    p.rect(40,134,560,68,p.tint,p.tint,14)
    p.text(320,178,pair(lang,'沿原 Run 与调用身份关联','Correlate original Run / call IDs'),28,p.accent,650,'middle')
    p.path('M170 202 V244',arrow=True);p.path('M470 202 V244',arrow=True)
    p.rect(40,252,266,225,shadow=True);p.rect(334,252,266,225,shadow=True)
    p.text(62,297,pair(lang,['原始执行记录'],['Execution','records']),30,INK,750)
    p.text(62,382,pair(lang,['工具效果','正文版本','原始回执'],['Tool effects','Answer versions','Original receipts']),27,MUTED)
    p.text(356,297,pair(lang,['遥测诊断副本'],['Telemetry','copies']),30,INK,750)
    p.text(356,382,pair(lang,['模型轮次','实际输入输出','缺口与导出'],['Model turns','Actual input/output','Gaps and export']),27,MUTED)
    p.path('M170 477 V516 H470 V477',dashed=True)
    p.rect(40,538,560,80,p.tint,p.tint,16)
    p.text(320,588,pair(lang,'空查询不抹除已提交效果','An empty query undoes no effect'),28,p.accent,650,'middle')
    p.save(t,'fact-paths')
    p=Plate(t,lang,1000,pair(lang,'异步采集，不同阶段','An asynchronous pipeline'))
    labels=[('Agent 事件','Agent events'),('采集适配器','Capture adapter'),('批量导出器','Batch exporter'),('接收接口','Ingestion API')]
    for i,(zh,en) in enumerate(labels):
        y=140+i*100;p.card(y,pair(lang,zh,en),h=70,size=31)
        if i<3:p.down(y+70,y+94)
    p.path('M320 510 V534 H171 V560',arrow=True);p.path('M320 534 H469 V560',arrow=True)
    for x,zh,en in [(40,'事件存储','Event storage'),(334,'接收队列','Event queue')]:
        p.rect(x,566,266,74);p.text(x+133,612,pair(lang,zh,en),29,INK,650,'middle')
    p.path('M173 640 V667 H320 V686',arrow=True);p.path('M467 640 V667 H320',width=2.5)
    for y,zh,en in [(694,'后台处理','Worker'),(794,'ClickHouse','ClickHouse'),(894,'追踪回读','Trace readback')]:
        p.card(y,pair(lang,zh,en),h=70,size=31)
        if y<894:p.down(y+70,y+94)
    p.save(t,'ingestion')

def evaluation(lang):
    t='evaluation'
    p=Plate(t,lang,710,pair(lang,'一项任务，四份判断','One task, four judgments'))
    rows=[('执行状态','Execution state','结束、失败或中断','Ended, failed or interrupted'),('证据取得','Evidence acquired','实际来源、输入与缺口','Actual sources, inputs and gaps'),('内容质量','Content quality','事实、推理与任务相关性','Facts, reasoning and relevance'),('用户交付','User delivery','可见、保存与重新取得','Visible, saved and retrievable')]
    for i,(zh,en,dzh,den) in enumerate(rows):p.card(140+i*132,pair(lang,zh,en),pair(lang,dzh,den),str(i+1))
    p.note(687,pair(lang,'分别保留，不能平均成一盏绿灯','Retain each judgment separately'))
    p.save(t,'four-axes')
    p=Plate(t,lang,720,pair(lang,'从声明选择验证','Choose checks for the claim'))
    p.card(140,pair(lang,'本次表述的范围','Scope of the claim'),h=72)
    p.path('M320 212 V234 H171 V256',arrow=True);p.path('M320 234 H469 V256',arrow=True)
    for x,zh,en in [(40,'局部隔离检查',['Isolated','checks']),(334,'真实边界检查',['Real-boundary','checks'])]:
        p.rect(x,266,266,105);p.text(x+133,309,pair(lang,zh,en),29,INK,650,'middle')
    p.path('M173 371 V395 H320 V413',arrow=True);p.path('M467 371 V395 H320')
    p.card(420,pair(lang,'限定范围的观察','Scoped observation'),h=72)
    p.path('M320 492 V515 H127 V537',arrow=True);p.path('M320 515 V537',arrow=True);p.path('M320 515 H513 V537',arrow=True)
    for x,zh,en,dzh,den in [(40,'有依据','Supported','有限结论','Scoped claim'),(233,'已知失败',['Known','failure'],'定向修复','Repair'),(426,'缺失证据',['Missing','evidence'],'补充观察','Observe')]:
        p.rect(x,545,174,137,p.tint,p.tint,15)
        p.text(x+87,582,pair(lang,zh,en),27,INK,700,'middle')
        p.text(x+87,657,pair(lang,dzh,den),25,p.accent,600,'middle')
    p.save(t,'evidence-path')

def citations(lang):
    t='citations'
    p=Plate(t,lang,730,pair(lang,'引用的四个核查问题','Four citation questions'))
    rows=[('来源真实吗？','Is the source authentic?','对象、日期与取得记录','Object, date and acquisition'),('引用对应吗？','Is attribution correct?','实际读到的版本与片段','Version and passage actually read'),('材料支持主张吗？','Does it support the claim?','推理、口径与限定条件','Reasoning, basis and conditions'),('回答切题吗？','Does it answer the task?','回到用户原来的问题','Return to the original question')]
    for i,(zh,en,dzh,den) in enumerate(rows):
        p.card(140+i*134,pair(lang,zh,en),pair(lang,dzh,den),str(i+1),size=30)
        if i<3:p.down(252+i*134,267+i*134)
    p.note(708,pair(lang,'前一项成立，不自动推出后一项','One check does not imply the next'))
    p.save(t,'four-questions')
    p=Plate(t,lang,890,pair(lang,'从资料版本到读者核查','From source to reader'))
    p.card(140,pair(lang,'有身份的资料版本','An identified source version'),pair(lang,'来源、对象与时点','Source, object and time'))
    p.down(252,275)
    p.card(284,pair(lang,'实际交付的片段','The passage actually exposed'),pair(lang,'表头、单位、页码与脚注','Headers, units, pages and notes'))
    p.path('M320 396 V420 H170 V445',arrow=True);p.path('M320 420 H470 V445',arrow=True)
    for x,zh,en,dzh,den in [(40,'直接复述','Direct statement','保留原文范围','Retain source scope'),(334,'派生计算','Calculation','保留输入关系','Retain input lineage')]:
        p.rect(x,455,266,118);p.text(x+133,501,pair(lang,zh,en),29,INK,650,'middle');p.text(x+133,548,pair(lang,dzh,den),25,MUTED,500,'middle')
    p.path('M173 573 V600 H320 V620',arrow=True);p.path('M467 573 V600 H320')
    p.card(628,pair(lang,'最终正文中的主张','Claim in the final answer'),pair(lang,'范围与标记对应最终文本','Ranges match the transformed text'),size=30)
    p.down(740,763)
    p.card(772,pair(lang,'读者可以回查','Reader can inspect the basis'),pair(lang,'呈现来源，不认证语义','Present sources; do not certify truth'),size=30)
    p.save(t,'lifecycle')

def subagents(lang):
    t='subagents'
    p=Plate(t,lang,880,pair(lang,'一个主问题，独立工作单元','One goal, independent work'))
    p.card(140,pair(lang,'用户目标 → Main','User goal → Main'),pair(lang,'决定直接执行或委派','Choose direct work or delegation'))
    p.path('M320 252 V278 H173 V304',arrow=True);p.path('M320 278 H467 V304',arrow=True)
    p.rect(40,314,266,204,shadow=True);p.rect(334,314,266,204,shadow=True)
    p.text(62,361,pair(lang,'直接使用工具',['Direct','tool use']),31,INK,700)
    p.text(62,447,pair(lang,['简单问题','沿原工具回执'],['Simple work','Original tool receipts']),26,MUTED)
    p.text(356,361,pair(lang,'Child 独立执行',['Independent','Child']),31,INK,700)
    p.text(356,447,pair(lang,['共同运行时','方法 + 获准工具'],['Shared runtime','Method + tools']),25,MUTED)
    p.down(518,551,x=467)
    p.rect(334,561,266,85,p.tint,p.tint,16);p.text(467,611,pair(lang,'成果与依据交接','Result handoff'),29,INK,650,'middle')
    p.path('M173 518 V675 H320 V696',arrow=True);p.path('M467 646 V675 H320')
    p.card(704,pair(lang,'Main 综合 → 用户回答','Main synthesis → User answer'),size=28,detail=pair(lang,'局部成果回到原主问题','Bring local findings back to the goal'))
    p.note(856,pair(lang,'共享原预算与授权，不复制资源','Share root resources and grants'))
    p.save(t,'architecture')
    p=Plate(t,lang,960,pair(lang,'依赖决定顺序，复核按需','Dependencies before roles'))
    p.card(140,pair(lang,'Main 组织研究问题','Main frames the research'),h=72,size=30)
    p.path('M320 212 V236 H173 V260',arrow=True);p.path('M320 236 H467 V260',arrow=True)
    for x,zh,en in [(40,['披露核查','基金文件'],['Disclosures','Fund documents']),(334,['选择组合资料'],['Portfolio','inputs'])]:
        p.rect(x,270,266,112);p.text(x+133,314,pair(lang,zh,en),29,INK,650,'middle')
    p.path('M173 382 V405 H320 V426',arrow=True);p.path('M467 382 V405 H320')
    p.card(434,pair(lang,'对齐口径 → 计算比较','Align basis → Calculate'),h=72,size=30)
    p.down(506,531)
    p.card(539,pair(lang,'Main 综合已有发现','Main synthesizes findings'),h=72,size=30)
    # Source findings can enter synthesis without waiting for the calculation.
    p.path('M40 326 H20 V575 H34',width=2,dashed=True,arrow=True)
    p.path('M320 611 V638 H173 V663',arrow=True);p.path('M320 638 H467 V663',arrow=True)
    p.rect(40,673,266,96,p.tint,p.tint);p.text(173,713,pair(lang,'直接交付',['Direct','delivery']),30,INK,650,'middle')
    p.rect(334,673,266,96);p.text(467,713,pair(lang,'可选复核',['Optional','review']),30,INK,650,'middle')
    p.down(769,794,x=467)
    p.rect(334,802,266,112);p.text(467,842,pair(lang,['重新判断','需要时定向补查'],['Reassess','Follow up if useful']),27,INK,600,'middle')
    p.path('M600 858 H622 V575 H606',dashed=True,arrow=True)
    p.save(t,'dependencies')
    p=Plate(t,lang,1010,pair(lang,'交回成果，也交回缺口','Return findings and gaps'))
    p.card(140,pair(lang,'Child 自主工作','Child works independently'),h=72,size=30)
    p.path('M320 212 V236 H173 V260',arrow=True);p.path('M320 236 H467 V260',arrow=True)
    p.rect(40,270,266,95);p.text(173,310,pair(lang,'有依据的发现',['Supported','findings']),29,INK,650,'middle')
    p.rect(334,270,266,95);p.text(467,310,pair(lang,'局部失败',['Local','failure']),29,INK,650,'middle')
    p.down(365,390,x=467)
    p.rect(334,400,266,135,p.tint,p.tint);p.text(467,443,pair(lang,['可修复则有限修复','否则明确缺口'],['Repair if permitted','Otherwise report gaps']),26,INK,600,'middle')
    p.path('M600 435 H620 V176 H606',dashed=True,arrow=True)
    p.path('M173 365 V567 H320 V588',arrow=True);p.path('M467 535 V567 H320')
    p.card(596,pair(lang,'成果交接','Result handoff'),pair(lang,'摘要、原始依据、产物与缺口','Summary, evidence, artifacts, gaps'),size=31)
    p.down(708,731)
    p.card(739,pair(lang,'Main 综合与按需回读','Main synthesizes and rereads'),h=72,size=28)
    p.path('M600 760 H620 V838 H604',dashed=True,arrow=True)
    p.path('M40 776 H20 V868 H34',arrow=True)
    p.card(826,pair(lang,'发布独立获准的回答','Publish the permitted answer'),h=72,size=29)
    p.note(946,pair(lang,['修复受原预算与取消约束','回读依据不等于复制全部历史'],['Repair respects budget and cancellation','Reread evidence, not every local step']))
    p.save(t,'handoff')

def long_research(lang):
    t='long-research'
    p=Plate(t,lang,750,pair(lang,'四个对象，各自保留身份','Four objects, distinct identities'))
    rows=[('用户任务','User task','原文、限制、目标与调整','Original text, limits and adjustments'),('执行 Run','Execution Run','授权、资源、工具与终态','Grants, resources, tools and status'),('工作上下文','Working context','可压缩、外置和按需回读','Compact, externalize and reread'),('正文与产物','Answers and artifacts','保存、版本与实际取得','Save, version and obtain results')]
    for i,(zh,en,dzh,den) in enumerate(rows):p.card(140+i*134,pair(lang,zh,en),pair(lang,dzh,den),str(i+1),size=30)
    p.note(718,pair(lang,'它们相关联，不是四个串行阶段','Linked objects, not four serial stages'))
    p.save(t,'four-objects')
    p=Plate(t,lang,790,pair(lang,'继续工作，先认清关系','What is being continued?'))
    rows=[('重新打开页面','Reconnect to observe',['读取原任务与已有成果','不产生一次新执行'],['Read original task and results','Do not create new execution']),('同一 Run 恢复','Recover the same Run',['原授权、预算、回执与所有权','已提交效果不重复执行'],['Original grants, budget and receipts','Do not repeat committed effects']),('显式新 Run 接续','Continue in a linked new Run',['保留原问题与合法背景','新身份，不重放旧效果'],['Original question and permitted context','New identity; no replay of old effects'])]
    for i,(zh,en,dzh,den) in enumerate(rows):
        y=140+i*180;p.rect(40,y,560,158,shadow=True);p.text(64,y+46,pair(lang,zh,en),29,INK,700);p.text(64,y+93,pair(lang,dzh,den),25,MUTED)
    p.rect(40,706,560,60,p.tint,p.tint,14);p.text(320,745,pair(lang,'普通新问题 → 独立准入','Ordinary new task → Own admission'),26,p.accent,650,'middle')
    p.save(t,'continuity')
    p=Plate(t,lang,870,pair(lang,'一份可行动的工作交接','An actionable working handoff'))
    p.rect(40,148,560,674,'white',BORDER,20,True)
    rows=[('原始问题','Original question','保留用户原文与限制','Retain exact user text and limits'),('结论与条件','Findings and conditions','哪些成立，适用于什么范围','What holds, and within which scope'),('已有结果','Existing results','可回读的来源、回执与产物','Readable sources, receipts and artifacts'),('失败与未知','Failures and unknowns','失败方法、未知效果与消耗','Failed approaches, unsettled effects'),('尚未解决','Unresolved work','会改变判断的关键缺口','Gaps that could change the conclusion'),('下一步','Next steps','可执行方向，不新增授权','Actionable directions, no new grants')]
    for i,(zh,en,dzh,den) in enumerate(rows):
        y=197+i*106;p.circle(70,y-8,6,p.accent,p.accent);p.text(92,y,pair(lang,zh,en),31,INK,700);p.text(64,y+43,pair(lang,dzh,den),25,MUTED)
        if i<5:p.path(f'M64 {y+64} H576',BORDER,1)
    p.save(t,'handoff')

if __name__=='__main__':
    count=0
    for lang in ('zh','en'):
        for ordinal,theme in enumerate(THEMES,1):cover(theme,lang,ordinal)
        for build in (observability,evaluation,citations,subagents,long_research):build(lang)
    print('Generated 34 localized SVG figures (17 Chinese, 17 English).')
