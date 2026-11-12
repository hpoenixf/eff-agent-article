#!/usr/bin/env python3
"""Render the article's five integration diagrams in both languages and sizes."""
from pathlib import Path
from html import escape

OUT = Path(__file__).resolve().parents[1] / 'public/diagrams/half-hour-research'
INK, MUTED, GREEN, BLUE, AMBER = '#15353d', '#49636b', '#21796a', '#356e9b', '#9a651a'

class Drawing:
    def __init__(self, title, subtitle, mobile=False, height=480):
        self.w, self.h, self.mobile = (390 if mobile else 980), height, mobile
        self.parts = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{self.w}" height="{height}" viewBox="0 0 {self.w} {height}" role="img" aria-labelledby="title desc">',
                      f'<title id="title">{escape(title)}</title><desc id="desc">{escape(subtitle)}</desc>',
                      f'<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="{GREEN}"/></marker></defs>',
                      '<g font-family="system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,PingFang SC,Microsoft YaHei,sans-serif">',
                      f'<rect width="{self.w}" height="{height}" rx="20" fill="#f3f7f5"/>']
        self.text(24 if mobile else 28, 36 if mobile else 43, title, 23 if mobile else 30, True)
        self.text(24 if mobile else 28, 62 if mobile else 74, subtitle, 15 if mobile else 18, color=MUTED)
    def text(self, x, y, value, size=18, bold=False, color=INK):
        self.parts.append(f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{700 if bold else 400}" fill="{color}">{escape(value)}</text>')
    def card(self, x,y,w,h,title,lines=(),accent=GREEN,size=None):
        self.parts.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="13" fill="#fff" stroke="#d5e2dd"/>')
        self.parts.append(f'<rect x="{x}" y="{y+13}" width="4" height="{h-26}" rx="2" fill="{accent}"/>')
        self.text(x+16,y+29,title,20 if self.mobile else 23,True,accent)
        for n,line in enumerate(lines): self.text(x+16,y+54+25*n,line,size or (17 if self.mobile else 18))
    def arrow(self, points, label=None, label_xy=None):
        self.parts.append(f'<polyline points="{points}" fill="none" stroke="{GREEN}" stroke-width="2.2" stroke-linejoin="round" marker-end="url(#arrow)"/>')
        if label: self.text(*label_xy,label,15 if self.mobile else 16,color=MUTED)
    def note(self, y, lines):
        for n,line in enumerate(lines): self.text(24 if self.mobile else 28,y+23*n,line,16 if self.mobile else 18,color=MUTED)
    def save(self, name, lang):
        self.parts.extend(['</g>','</svg>'])
        (OUT/f'{name}-{lang}{"-mobile" if self.mobile else ""}.svg').write_text('\n'.join(self.parts)+'\n')


def overview(lang,mobile):
    zh=lang=='zh'
    d=Drawing('一项任务，沿同一循环交付' if zh else 'One task, one research loop',
              ('原问题持续可见，观察改变下一步' if zh else 'Keep the task visible; let observations guide work') if not mobile else ('观察接到下一轮，正文走原发布路径' if zh else 'Observe, decide, and deliver'),mobile,640 if mobile else 470)
    if mobile:
        d.card(30,86,330,64,'原始要求与补充' if zh else 'Original task and additions',['每一轮都保留适用要求' if zh else 'Keep applicable requirements visible'])
        d.arrow('195,150 195,177')
        d.card(30,178,330,77,'模型选择下一步' if zh else 'Model chooses the next step',['读取、计算，或提出交付' if zh else 'Read, calculate, or propose delivery'])
        d.arrow('125,255 125,307','继续取证' if zh else 'Investigate',(137,283))
        d.card(30,310,154,100,'工具执行' if zh else 'Execute', ['原权限与预算' if zh else 'Existing grants', '返回真实状态' if zh else 'Actual outcome'],size=16)
        d.card(206,310,154,100,'记录观察' if zh else 'Record', ['结果、定位' if zh else 'Result, locator', '失败或未知' if zh else 'Failure / unknown'],size=16)
        d.arrow('184,360 206,360')
        d.arrow('360,358 378,358 378,216 360,216')
        d.text(209,438,'观察进入后继请求' if zh else 'Feed the next request',15,color=MUTED)
        d.arrow('30,216 12,216 12,507 30,507')
        d.card(30,472,330,105,'保存正文，用户读取' if zh else 'Save and retrieve the answer', ['模型提出交付后，沿原发布模块提交' if zh else 'Use the original publication path', '提交后的版本可供页面与历史读取' if zh else 'Read the committed answer version'],size=16)
        d.note(608,['局部失败作为观察返回，不自动终止整题' if zh else 'Local failure is an observation, not a Run stop.'])
    else:
        d.card(28,110,240,110,'原始任务' if zh else 'Original task',['原文与补充每轮提供' if zh else 'Requirements and additions','适用限制保持可见' if zh else 'Applicable restrictions'])
        d.card(350,110,260,110,'模型判断' if zh else 'Model judgment',['选择读取、计算或交付' if zh else 'Read, calculate, or deliver','研究问题随证据调整' if zh else 'Revise questions with evidence'])
        d.card(690,110,260,110,'工具执行' if zh else 'Tool execution',['沿原权限与预算执行' if zh else 'Existing grants and budgets','如实返回结果或失败' if zh else 'Actual result or failure'])
        d.arrow('268,162 350,162')
        d.arrow('610,162 690,162','取证' if zh else 'Investigate',(625,145))
        d.card(690,300,260,110,'记录观察' if zh else 'Record observations',['结果身份、版本与定位' if zh else 'Identity, version, locator','失败和未知继续保留' if zh else 'Keep failure and unknown facts'])
        d.arrow('820,220 820,300')
        d.arrow('690,352 652,352 652,253 550,253 550,220','进入下一轮' if zh else 'Next request',(668,280))
        d.card(350,300,260,110,'保存与交付' if zh else 'Save and deliver',['沿原发布路径提交正文' if zh else 'Commit through publication','版本与回执由原模块维护' if zh else 'Original version and receipt owner'])
        d.arrow('430,220 430,300','提出交付' if zh else 'Propose delivery',(445,274))
        d.card(28,300,240,110,'用户取得报告' if zh else 'User retrieves report',['页面和历史读取已提交版本' if zh else 'Page and history read the commit','预览不代替持久保存' if zh else 'Preview is not a durable commit'])
        d.arrow('350,352 268,352')
        d.note(448,['局部失败先回到观察；是否继续研究由模型判断，执行边界由原模块负责。' if zh else 'Return local failures as observations. The model judges research; existing owners enforce execution.'])
    d.save('research-loop',lang)


def correction(lang,mobile):
    zh=lang=='zh'
    d=Drawing('新要求到来，只替代旧请求' if zh else ('Hand off a correction' if mobile else 'A correction supersedes one request'),
              ('保存原话，后继采用，旧效果如实结算' if zh else 'Save the message; adopt it next; preserve effects') if not mobile else ('请求中断与停止研究分别处理' if zh else 'Request interruption is not a Run stop'),mobile,600 if mobile else 405)
    titles=['接收定向纠偏','处理旧请求','后继请求采用'] if zh else ['Receive correction','Handle the old request','Adopt in the successor']
    lines=([['保存完整原话与目标研究','记录接收顺序及纠偏版本'],['未派发旧提议在安全边界停止','已完成结果保留，未知仍计账'],['完整原话进入实际获准请求','可继续取证，报告另行检查']] if zh else
           [['Save exact text and target Run','Retain reception order and revision'],['Stop obsolete undispatched work','Keep completed and unknown effects'],['Full text reaches admitted input','Continue research; review the answer']])
    if mobile:
        lines=([['保存原话，绑定目标研究','接收不等于模型已经采用'],['未派发旧提议在安全边界停止','已完成结果与未知消耗保留'],['原文进入实际获准的后继请求','仍可继续取证，报告另行检查']] if zh else
               [['Save exact text and target Run','Reception alone is not adoption'],['Stop obsolete undispatched work','Keep settled and unknown effects'],['Full text reaches admitted input','Continue, then review the report']])
        for i in range(3):
            y=90+i*145;d.card(30,y,330,112,titles[i],lines[i],accent=GREEN if i!=1 else BLUE,size=16)
            if i<2:d.arrow(f'195,{y+112} 195,{y+141}')
        d.note(550,['显式停止和真实期限仍由原控制路径处理' if zh else 'Explicit stop and deadlines keep their owners.', '重新准入不会清零消耗或重做未知请求' if zh else 'Readmission does not reset or replay usage.'])
    else:
        for i in range(3):d.card(28+i*322,115,280,150,titles[i],lines[i],accent=GREEN if i!=1 else BLUE)
        d.arrow('308,186 350,186');d.arrow('630,186 672,186')
        d.note(322,['用户停止研究、旧请求被纠偏替代，是不同的控制事实。' if zh else 'A user stop and a superseded request are different control facts.', '继承原权限、预算与期限；交接成功仍不等于模型遵循正确。' if zh else 'Original grants, usage, and deadlines remain. Adoption alone does not establish correct reasoning.'])
    d.save('correction-handoff',lang)


def budget(lang,mobile):
    zh=lang=='zh'
    d=Drawing('下一次请求，三种事实一起看' if zh else ('Can the next call run?' if mobile else 'Admit the next call from all three views'),
              ('同一资源记录的不同视图，不另建三套预算' if zh else 'Views of existing records, not three new ledgers') if not mobile else ('有总余额，仍需核对阶段与期限' if zh else 'A balance alone does not admit a call'),mobile,645 if mobile else 510)
    titles=['真实请求消耗','当前阶段机会','时间与输入容量'] if zh else ['Physical request usage','Phase opportunities','Time and input capacity']
    lines=([['已发出请求仍计入消耗','未知调用不因发布而退款'],['探索与收尾分别表达','发布结算仅作用于原请求'],['期限和输入硬容量仍生效','内层有次数不代表外层允许']] if zh else
           [['Dispatched calls remain charged','Unknown calls retain occupancy'],['Research and finalization differ','Settle the original request only'],['Deadline and hard input bounds','An inner count is not full admission']])
    if mobile:
        titles=['真实模型请求','当前阶段机会','期限与输入容量'] if zh else ['Physical calls','Phase opportunities','Deadline and input capacity']
        lines=([['已用和未知占用保留'],['探索与收尾分别核对'],['其他硬边界仍然适用']] if zh else [['Keep spent and unknown usage'],['Check research and finalization'],['Other hard limits still apply']])
        for i in range(3):d.card(30,88+91*i,330,76,titles[i],lines[i])
        d.arrow('195,346 195,382')
        d.card(30,385,330,82,'原资源模块共同核对' if zh else 'Original resource owner',['在下一次真实请求准入边界检查' if zh else 'Check at actual request admission'],accent=BLUE,size=16)
        d.arrow('125,467 125,501');d.arrow('266,467 266,501')
        d.card(30,504,156,94,'获准调用' if zh else 'Admitted',['按当前阶段执行' if zh else 'Current phase'],size=15)
        d.card(204,504,156,94,'无法新调用' if zh else 'No new call',['提供已有成果' if zh else 'Saved results'],accent=AMBER,size=15)
        d.note(626,['释放专用占用，不抹去真实请求消耗' if zh else 'Releasing a reserve does not erase usage.'])
    else:
        for i in range(3):d.card(28+322*i,108,280,125,titles[i],lines[i],size=17)
        for x in [168,490,812]:d.arrow(f'{x},233 {x},263 490,263 490,286')
        d.card(275,289,430,77,'原资源模块在实际请求边界核对' if zh else 'Check at actual request admission',['消费同一有效记录，不在提醒里重新授予额度' if zh else 'Use effective records; reminders do not grant capacity'],accent=BLUE,size=17)
        d.arrow('395,366 395,395 232,395 232,412');d.arrow('585,366 585,395 748,395 748,412')
        d.card(28,415,408,65,'获准：按当前阶段执行' if zh else 'Admitted: execute in the current phase')
        d.card(544,415,408,65,'无法新调用：提供已提交成果' if zh else 'No new call: expose committed results',accent=AMBER)
    d.save('budget-views',lang)


def publication(lang,mobile):
    zh=lang=='zh'
    d=Drawing('正文提交与可选观测分开' if zh else ('Keep capture optional' if mobile else 'Keep optional capture off the commit path'),
              ('保护必要存储，局部处理可选采集冲突' if zh else 'Protect required storage; isolate capture contention') if not mobile else ('观测失败可见，独立正文继续可读' if zh else 'Visible capture loss; preserved committed text'),mobile,590 if mobile else 470)
    if mobile:
        titles=['模型生成正文','原发布事务提交','页面与历史读取'] if zh else ['Model produces text','Publication commits','Page and history read']
        lines=[['提交原候选及内容身份'],['保存正文、版本和原回执'],['读取已提交的当前版本']] if zh else [['Submit the original candidate'],['Save text, revision, and receipt'],['Retrieve the committed version']]
        for i in range(3):
            y=86+96*i;d.card(30,y,330,74,titles[i],lines[i],size=16)
            if i<2:d.arrow(f'195,{y+74} 195,{y+92}')
        d.card(30,400,330,113,'可选采集：冲突时局部回滚' if zh else 'Capture: local rollback', ['释放本次事务锁，记录采集失败' if zh else 'Release locks; record capture failure','不把采集成功当作正文提交前提' if zh else 'Capture success is not a commit prerequisite'],accent=AMBER,size=16)
        d.note(546,['正文自身的必要存储失败，仍是交付失败' if zh else 'Required answer-storage failure still matters.'])
    else:
        d.text(28,101,'必要正文路径' if zh else 'Required answer path',17,True)
        titles=['生成候选正文','原发布事务提交','用户读取已提交版本'] if zh else ['Produce candidate text','Publication commits','Read the committed version']
        lines=[['原候选进入发布模块'],['正文、版本与回执一起保存'],['提交与客户端呈现分别记录']] if zh else [['Original publication owner'],['Save text, revision, and receipt'],['Commit and rendering are distinct']]
        for i in range(3):d.card(28+i*322,117,280,101,titles[i],lines[i],size=17)
        d.arrow('308,166 350,166');d.arrow('630,166 672,166')
        d.text(28,269,'可选采集独立处理，不成为上方提交的先决条件' if zh else 'Optional capture remains independent of the required commit',17,True,AMBER)
        titles=['采集一份观测','该处锁冲突则回滚','留下有限失败事实'] if zh else ['Capture one observation','Roll back on that contention','Retain a bounded failure fact']
        lines=[['采集可失败，不能伪装已保存'],['释放本次采集持有的事务锁'],['后续独立采集仍可尝试']] if zh else [['Do not label failed capture stored'],['Release this capture transaction’s locks'],['Later independent capture may succeed']]
        for i in range(3):d.card(28+i*322,285,280,101,titles[i],lines[i],accent=AMBER,size=17)
        d.arrow('308,335 350,335');d.arrow('630,335 672,335')
        d.note(435,['必要正文存储失败不能被跳过；已提交正文按原回执读回，不因日志缺失盲目重发。' if zh else 'Required storage cannot be skipped. Read committed text by receipt; missing logs do not justify replay.'])
    d.save('publication-isolation',lang)


def evaluation(lang,mobile):
    zh=lang=='zh'
    d=Drawing('怎样验证模型真的改判？' if zh else ('Did the reasoning change?' if mobile else 'Test changed reasoning, not just a number'),
              ('教学测试流程；数值来自合成配对案例' if zh else 'Proposed teaching test; values from a synthetic paired case') if not mobile else ('数值来自合成案例，流程用于检验改判' if zh else 'Teaching test with synthetic-case values'),mobile,615 if mobile else 430)
    titles=['旧版资料与结论','更正材料到来','逐版检查判断'] if zh else ['Original finding','Release the correction','Review each version']
    lines=([['差额 −0.5 个百分点','先保存实质结论，而非读取提示','再释放更正材料'],['新差额 −0.9 个百分点','检查新版实际进入模型输入','已有来源版本保留'],['数值与依赖解释都要检查','费用贡献仍为未知','不能推断费用能否解释差额']] if zh else
           [['Gap: −0.5 percentage points','Save a substantive finding first','Then release revised material'],['Gap: −0.9 percentage points','Verify the new input actually arrived','Retain original source versions'],['Review numbers and explanations','Fee contribution remains unknown','Do not infer its explanatory power']])
    if mobile:
        lines=([['差额 −0.5 个百分点','先保存实质结论，不以读取提示代替'],['新差额 −0.9 个百分点','确认新版材料进入实际模型输入'],['核对数字、依赖解释与未知项','材料仍未给出费用贡献']] if zh else
               [['Gap: −0.5 percentage points','Save a substantive finding, not a plan'],['Gap: −0.9 percentage points','Verify actual arrival of revised material'],['Check values, reasoning, and unknowns','Fee contribution is still unknown']])
        for i in range(3):
            y=90+i*144;d.card(30,y,330,112,titles[i],lines[i],accent=GREEN if i!=2 else BLUE,size=16)
            if i<2:d.arrow(f'195,{y+112} 195,{y+140}')
        d.note(557,['改对差额，不自动使费用归因正确' if zh else 'A corrected gap does not validate attribution.', '这是评测判断，不是新的正文发布门' if zh else 'This evaluates reasoning; it is not a publish gate.'])
    else:
        for i in range(3):d.card(28+i*322,116,280,166,titles[i],lines[i],accent=GREEN if i!=2 else BLUE,size=16)
        d.arrow('308,193 350,193');d.arrow('630,193 672,193')
        d.note(339,['新版数据已读到、数字已更新、解释有依据，需要分别核对。' if zh else 'Check arrival of revised evidence, updated values, and supported reasoning separately.', '评阅用于比较逐版回答，不在生产运行中新增关键词门或强制复核。' if zh else 'Review compares answer versions; it adds no production keyword gate or mandatory review.'])
    d.save('evidence-revision',lang)

if __name__ == '__main__':
    OUT.mkdir(parents=True,exist_ok=True)
    for render in [overview,correction,budget,publication,evaluation]:
        for language in ['zh','en']:
            for narrow in [False,True]:render(language,narrow)
    print('Generated 20 SVGs: five figures, two languages, desktop and narrow layouts.')
