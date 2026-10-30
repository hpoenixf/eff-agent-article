// Deterministic six-layer learning maps for three bilingual article stages.
// Source snapshot is fixed; each rendered chip links to an actual v0.15 source file.
import { mkdirSync, writeFileSync } from 'node:fs';
const STAGES={
  "intro": {
    "title": {
      "zh": "ETF Agent｜入门：六层最小 Agent Loop",
      "en": "ETF Agent | Beginner: A Minimal Six-Layer Loop"
    },
    "subtitle": {
      "zh": "从 T1 比较 A/B 文档开始，只画已经展示的输入、上下文、决策、工具和报告回读。",
      "en": "Follow the T1 A/B document comparison: intake, context, decisions, tools, and report readback."
    },
    "lane": {
      "zh": "第 1 站：用户任务 → Gateway / Runtime → Tool Host → report.md",
      "en": "Stage 1: User task → Gateway / Runtime → Tool Host → report.md"
    },
    "footer": {
      "zh": "固定代码：Open ETF Agent v0.15.0。T1 默认由脚本模拟模型动作；真实执行读页、工具与报告保存。图中不包含未验证的生产能力。",
      "en": "Pinned code: Open ETF Agent v0.15.0. T1 scripts the model actions, while page reads, tools, and report writing execute. Unverified product capabilities are omitted."
    },
    "columns": [
      {
        "title": {
          "zh": "输入与任务",
          "en": "Task Intake"
        },
        "hint": {
          "zh": "只看命令行",
          "en": "CLI scope"
        },
        "color": "#2A6DB5",
        "items": [
          {
            "layer": 0,
            "title": {
              "zh": "CLI：比较 A/B",
              "en": "CLI: Compare A/B"
            },
            "detail": {
              "zh": "选择 T1 合成文档案例",
              "en": "Select the synthetic T1 case"
            },
            "file": "src/cli.mjs",
            "focus": true
          }
        ]
      },
      {
        "title": {
          "zh": "上下文",
          "en": "Context"
        },
        "hint": {
          "zh": "回合衔接",
          "en": "Turn-by-turn"
        },
        "color": "#2D8D79",
        "items": [
          {
            "layer": 1,
            "title": {
              "zh": "Context：本轮材料",
              "en": "Context: Turn Input"
            },
            "detail": {
              "zh": "已有问题与已取得的材料",
              "en": "Question and observed material"
            },
            "file": "src/context.mjs",
            "focus": true
          },
          {
            "layer": 2,
            "title": {
              "zh": "工具结果进入下一轮",
              "en": "Results Feed Next Turn"
            },
            "detail": {
              "zh": "Runtime 更新循环输入",
              "en": "Runtime updates the loop input"
            },
            "file": "src/runtime.mjs",
            "focus": true
          }
        ]
      },
      {
        "title": {
          "zh": "模型与循环",
          "en": "Model & Loop"
        },
        "hint": {
          "zh": "选择与调度",
          "en": "Decision & orchestration"
        },
        "color": "#7556B8",
        "items": [
          {
            "layer": 2,
            "title": {
              "zh": "Gateway：取得下一步",
              "en": "Gateway: Next Action"
            },
            "detail": {
              "zh": "T1 默认接脚本模型",
              "en": "T1 uses scripted model actions"
            },
            "file": "src/gateway.mjs",
            "focus": true
          },
          {
            "layer": 2,
            "title": {
              "zh": "Runtime：重复循环",
              "en": "Runtime: Repeat Loop"
            },
            "detail": {
              "zh": "动作 → 工具 → 再判断",
              "en": "Action → tool → next decision"
            },
            "file": "src/runtime.mjs",
            "focus": true
          }
        ]
      },
      {
        "title": {
          "zh": "工具执行",
          "en": "Tool Execution"
        },
        "hint": {
          "zh": "权限与读取",
          "en": "Checks & reads"
        },
        "color": "#C18432",
        "items": [
          {
            "layer": 3,
            "title": {
              "zh": "Tool Host：校验执行",
              "en": "Tool Host: Check & Run"
            },
            "detail": {
              "zh": "只有获准动作进入工具",
              "en": "Only permitted actions run"
            },
            "file": "src/tools.mjs",
            "focus": true
          },
          {
            "layer": 3,
            "title": {
              "zh": "read_page：读取 A/B",
              "en": "read_page: Read A/B"
            },
            "detail": {
              "zh": "取得两版原文及来源",
              "en": "Acquire both pages and sources"
            },
            "file": "src/tools.mjs",
            "focus": true
          }
        ]
      },
      {
        "title": {
          "zh": "结果与阅读",
          "en": "Results & Readback"
        },
        "hint": {
          "zh": "先证明已保存",
          "en": "Persist before claiming"
        },
        "color": "#AD527F",
        "items": [
          {
            "layer": 3,
            "title": {
              "zh": "Result：页内容与来源",
              "en": "Result: Page & Source"
            },
            "detail": {
              "zh": "原始材料保留来源身份",
              "en": "Keep source identity with text"
            },
            "file": "src/results.mjs",
            "focus": true
          },
          {
            "layer": 4,
            "title": {
              "zh": "report.md：保存结果",
              "en": "report.md: Save Report"
            },
            "detail": {
              "zh": "文件产物是真正的执行效果",
              "en": "A real written artifact"
            },
            "file": "src/report.mjs",
            "focus": true
          },
          {
            "layer": 5,
            "title": {
              "zh": "CLI：打开报告",
              "en": "CLI: Open Report"
            },
            "detail": {
              "zh": "检查文档比较结论",
              "en": "Inspect the comparison result"
            },
            "file": "src/cli.mjs",
            "focus": true
          }
        ]
      }
    ]
  },
  "intermediate": {
    "title": {
      "zh": "ETF Agent｜进阶：十组模块落入六层",
      "en": "ETF Agent | Intermediate: Ten Modules Across Six Layers"
    },
    "subtitle": {
      "zh": "保留入门 Loop 主干；突出方法、MCP、资料与记忆、Session / Worker、Child 和产物回读。",
      "en": "Keep the introductory loop and highlight methods, MCP, evidence, memory, sessions, workers, child agents, and artifacts."
    },
    "lane": {
      "zh": "第 2 站：浅色是入门基础；彩色是进阶新增能力",
      "en": "Stage 2: Muted chips are basics; colored chips are new intermediate capabilities"
    },
    "footer": {
      "zh": "同一 v0.15 固定版本；T1、skill-mcp、retrieve-reread、specialist 是不同演示，不代表一次 Run 同时运行十组能力。",
      "en": "Same pinned v0.15 snapshot. T1, skill-mcp, retrieve-reread, and specialist are separate demos—not one Run exercising every module."
    },
    "columns": [
      {
        "title": {
          "zh": "任务与会话",
          "en": "Task & Session"
        },
        "hint": {
          "zh": "从一次命令到持久任务",
          "en": "Beyond one process"
        },
        "color": "#2A6DB5",
        "items": [
          {
            "layer": 0,
            "title": {
              "zh": "CLI：接收任务",
              "en": "CLI: Submit Task"
            },
            "detail": {
              "zh": "保留入门任务入口",
              "en": "Existing task entry"
            },
            "file": "src/cli.mjs",
            "focus": false
          },
          {
            "layer": 1,
            "title": {
              "zh": "Session：记录任务",
              "en": "Session: Store Run"
            },
            "detail": {
              "zh": "保存身份、进度与约束",
              "en": "Persist identity and progress"
            },
            "file": "src/session.mjs",
            "focus": true
          },
          {
            "layer": 2,
            "title": {
              "zh": "Worker：驱动执行",
              "en": "Worker: Drive Run"
            },
            "detail": {
              "zh": "交回既有 Runtime",
              "en": "Reuse the existing Runtime"
            },
            "file": "src/worker.mjs",
            "focus": true
          }
        ]
      },
      {
        "title": {
          "zh": "方法与连接",
          "en": "Methods & MCP"
        },
        "hint": {
          "zh": "可复用方法与外部工具",
          "en": "Methods & external tools"
        },
        "color": "#2F9182",
        "items": [
          {
            "layer": 1,
            "title": {
              "zh": "Skill：方法说明",
              "en": "Skill: Reusable Method"
            },
            "detail": {
              "zh": "按任务加载研究步骤",
              "en": "Load task-specific guidance"
            },
            "file": "src/skills.mjs",
            "focus": true
          },
          {
            "layer": 3,
            "title": {
              "zh": "MCP：连接工具",
              "en": "MCP: Tool Connection"
            },
            "detail": {
              "zh": "服务端提供工具接口",
              "en": "Connect a tool provider"
            },
            "file": "src/mcp.mjs",
            "focus": true
          }
        ]
      },
      {
        "title": {
          "zh": "资料与记忆",
          "en": "Evidence & Memory"
        },
        "hint": {
          "zh": "原文、上下文、偏好",
          "en": "Sources, context, memory"
        },
        "color": "#26859B",
        "items": [
          {
            "layer": 1,
            "title": {
              "zh": "Context：组装本轮",
              "en": "Context: Project Input"
            },
            "detail": {
              "zh": "入门已有的回合材料",
              "en": "Existing turn-by-turn material"
            },
            "file": "src/context.mjs",
            "focus": false
          },
          {
            "layer": 1,
            "title": {
              "zh": "Memory：允许的偏好",
              "en": "Memory: Allowed Preferences"
            },
            "detail": {
              "zh": "跨任务记忆单独治理",
              "en": "Separately governed memory"
            },
            "file": "src/memory.mjs",
            "focus": true
          },
          {
            "layer": 3,
            "title": {
              "zh": "Result：保留来源",
              "en": "Result: Keep Provenance"
            },
            "detail": {
              "zh": "读取结果不等于摘要",
              "en": "Original result ≠ summary"
            },
            "file": "src/results.mjs",
            "focus": true
          }
        ]
      },
      {
        "title": {
          "zh": "模型与循环",
          "en": "Model & Loop"
        },
        "hint": {
          "zh": "继续复用基础执行",
          "en": "The same core loop"
        },
        "color": "#775AB7",
        "items": [
          {
            "layer": 2,
            "title": {
              "zh": "Gateway：模型动作",
              "en": "Gateway: Model Action"
            },
            "detail": {
              "zh": "模型层接口",
              "en": "Model-facing interface"
            },
            "file": "src/gateway.mjs",
            "focus": false
          },
          {
            "layer": 2,
            "title": {
              "zh": "Runtime：下一回合",
              "en": "Runtime: Next Turn"
            },
            "detail": {
              "zh": "复用既有 Loop",
              "en": "Reuse the existing loop"
            },
            "file": "src/runtime.mjs",
            "focus": false
          }
        ]
      },
      {
        "title": {
          "zh": "工具与检查",
          "en": "Tools & Checks"
        },
        "hint": {
          "zh": "权限在代码侧",
          "en": "Code enforces bounds"
        },
        "color": "#C18432",
        "items": [
          {
            "layer": 3,
            "title": {
              "zh": "Tool Host：受控调用",
              "en": "Tool Host: Guard Calls"
            },
            "detail": {
              "zh": "校验动作和参数",
              "en": "Validate calls and inputs"
            },
            "file": "src/tools.mjs",
            "focus": false
          },
          {
            "layer": 3,
            "title": {
              "zh": "read_page：读页",
              "en": "read_page: Page Read"
            },
            "detail": {
              "zh": "可回查的合成资料",
              "en": "Traceable synthetic sources"
            },
            "file": "src/tools.mjs",
            "focus": false
          }
        ]
      },
      {
        "title": {
          "zh": "专家协作",
          "en": "Child Collaboration"
        },
        "hint": {
          "zh": "专门核对一块问题",
          "en": "Bounded fact check"
        },
        "color": "#7359BE",
        "items": [
          {
            "layer": 2,
            "title": {
              "zh": "Main → Child",
              "en": "Main → Child"
            },
            "detail": {
              "zh": "委派局部来源核对",
              "en": "Delegate a source-check task"
            },
            "file": "src/specialist-child.mjs",
            "focus": true
          },
          {
            "layer": 3,
            "title": {
              "zh": "Child：只读 A/B",
              "en": "Child: Read A/B Only"
            },
            "detail": {
              "zh": "自己的 Loop 与限定工具",
              "en": "Own loop and restricted tools"
            },
            "file": "src/child.mjs",
            "focus": true
          }
        ]
      },
      {
        "title": {
          "zh": "产物与阅读",
          "en": "Artifacts & Readback"
        },
        "hint": {
          "zh": "保存并可再次打开",
          "en": "Persist and reopen"
        },
        "color": "#AB4D7D",
        "items": [
          {
            "layer": 4,
            "title": {
              "zh": "Artifact：保存报告",
              "en": "Artifact: Save Report"
            },
            "detail": {
              "zh": "写入事实与自然语言分离",
              "en": "Stored output is a real effect"
            },
            "file": "src/artifacts.mjs",
            "focus": true
          },
          {
            "layer": 5,
            "title": {
              "zh": "CLI：回读报告",
              "en": "CLI: Reopen Report"
            },
            "detail": {
              "zh": "只显示已有演示入口",
              "en": "Read a saved demo report"
            },
            "file": "src/reader-cli.mjs",
            "focus": false
          }
        ]
      }
    ]
  },
  "deep": {
    "title": {
      "zh": "ETF Agent｜深入：证据、执行与专家交接",
      "en": "ETF Agent | Deep Dive: Evidence, Execution, and Delegation"
    },
    "subtitle": {
      "zh": "重点画出源文与派生意见、Main/Child 边界、受限读页、Session/Worker，以及可验证的报告回读。",
      "en": "Focus on source-vs-claim lineage, Main/Child scope, bounded reads, Session/Worker, and verified report readback."
    },
    "lane": {
      "zh": "第 3 站：彩色框突出新增的交接契约，而不是凭空增加生产模块",
      "en": "Stage 3: Colored chips focus on new handoff contracts—not imagined production modules"
    },
    "footer": {
      "zh": "v0.15 的 source_check、v0.10 的 ResultRef 计算和 Worker 示例相互独立；本图是机制映射，不是单次运行 Trace 或 Web 产品能力承诺。",
      "en": "v0.15 source_check, v0.10 ResultRef calculation, and Worker examples are separate. This is a mechanism map, not one Run trace or a Web product claim."
    },
    "columns": [
      {
        "title": {
          "zh": "任务与 Session",
          "en": "Task & Session"
        },
        "hint": {
          "zh": "身份与受支持恢复",
          "en": "Identity & supported resume"
        },
        "color": "#2A6DB5",
        "items": [
          {
            "layer": 0,
            "title": {
              "zh": "specialist-cli 发起",
              "en": "specialist-cli: Run"
            },
            "detail": {
              "zh": "v0.15 独立来源核对示例",
              "en": "v0.15 specialist example"
            },
            "file": "src/specialist-cli.mjs",
            "focus": false
          },
          {
            "layer": 1,
            "title": {
              "zh": "Session：原 Run",
              "en": "Session: Original Run"
            },
            "detail": {
              "zh": "不以新进程重授权限",
              "en": "No re-grant on process restart"
            },
            "file": "src/session.mjs",
            "focus": false
          },
          {
            "layer": 2,
            "title": {
              "zh": "Worker：已知进度",
              "en": "Worker: Known Progress"
            },
            "detail": {
              "zh": "独立执行示例",
              "en": "Separate execution example"
            },
            "file": "src/worker.mjs",
            "focus": false
          }
        ]
      },
      {
        "title": {
          "zh": "Context / Loop",
          "en": "Context / Loop"
        },
        "hint": {
          "zh": "基础组件保持不变",
          "en": "Same execution engine"
        },
        "color": "#2D8D79",
        "items": [
          {
            "layer": 1,
            "title": {
              "zh": "Context：获准材料",
              "en": "Context: Allowed Material"
            },
            "detail": {
              "zh": "只投影本轮所需内容",
              "en": "Project eligible turn input"
            },
            "file": "src/context.mjs",
            "focus": false
          },
          {
            "layer": 2,
            "title": {
              "zh": "Gateway / Runtime",
              "en": "Gateway / Runtime"
            },
            "detail": {
              "zh": "复用逐轮模型工具循环",
              "en": "Reuse the model-tool loop"
            },
            "file": "src/runtime.mjs",
            "focus": false
          }
        ]
      },
      {
        "title": {
          "zh": "Main 决策",
          "en": "Main Decisions"
        },
        "hint": {
          "zh": "整体问题不外包",
          "en": "Main owns synthesis"
        },
        "color": "#7758B9",
        "items": [
          {
            "layer": 2,
            "title": {
              "zh": "Main → source_check",
              "en": "Main → source_check"
            },
            "detail": {
              "zh": "通过 Tool 调用核对专家",
              "en": "Delegate via a bounded tool"
            },
            "file": "src/specialist-demo.mjs",
            "focus": true
          },
          {
            "layer": 4,
            "title": {
              "zh": "Main → save_report",
              "en": "Main → save_report"
            },
            "detail": {
              "zh": "专家结束后汇总写入",
              "en": "Main writes after the child returns"
            },
            "file": "src/specialist-demo.mjs",
            "focus": true
          }
        ]
      },
      {
        "title": {
          "zh": "Child 专家",
          "en": "Child Specialist"
        },
        "hint": {
          "zh": "独立但受限的循环",
          "en": "An independent bounded loop"
        },
        "color": "#7B59BE",
        "items": [
          {
            "layer": 1,
            "title": {
              "zh": "Child：只许读 A/B",
              "en": "Child: A/B Only"
            },
            "detail": {
              "zh": "可用工具仅 read_page",
              "en": "Only read_page is allowed"
            },
            "file": "src/specialist-child.mjs",
            "focus": true
          },
          {
            "layer": 2,
            "title": {
              "zh": "Child：自己的 Loop",
              "en": "Child: Own Loop"
            },
            "detail": {
              "zh": "预算与范围独立受控",
              "en": "Separate bounded execution"
            },
            "file": "src/child.mjs",
            "focus": true
          },
          {
            "layer": 3,
            "title": {
              "zh": "source_check：回交",
              "en": "source_check: Return"
            },
            "detail": {
              "zh": "原文和派生核对意见",
              "en": "Original pages + derived notes"
            },
            "file": "src/specialist-child.mjs",
            "focus": true
          }
        ]
      },
      {
        "title": {
          "zh": "工具与边界",
          "en": "Tools & Bounds"
        },
        "hint": {
          "zh": "拒绝越界优先",
          "en": "Reject out-of-scope"
        },
        "color": "#BE8735",
        "items": [
          {
            "layer": 3,
            "title": {
              "zh": "Host：验证工具范围",
              "en": "Host: Check Tool Scope"
            },
            "detail": {
              "zh": "来源、预算、参数约束",
              "en": "Source, budget, input limits"
            },
            "file": "src/tools.mjs",
            "focus": false
          },
          {
            "layer": 3,
            "title": {
              "zh": "read_page：保留原文",
              "en": "read_page: Original Pages"
            },
            "detail": {
              "zh": "按文档身份和页码留证",
              "en": "Record document and page IDs"
            },
            "file": "src/tools.mjs",
            "focus": true
          }
        ]
      },
      {
        "title": {
          "zh": "结果与复算",
          "en": "Result & Calculation"
        },
        "hint": {
          "zh": "来源不等于判断",
          "en": "Evidence is not opinion"
        },
        "color": "#288B9C",
        "items": [
          {
            "layer": 3,
            "title": {
              "zh": "ResultRef：来源身份",
              "en": "ResultRef: Source Identity"
            },
            "detail": {
              "zh": "原始数据与选择区分",
              "en": "Separate source and selection"
            },
            "file": "src/results.mjs",
            "focus": true
          },
          {
            "layer": 3,
            "title": {
              "zh": "计算：独立演示",
              "en": "Calculation: Separate Demo"
            },
            "detail": {
              "zh": "选区 → 数值 → 报告 CSV",
              "en": "Selection → numbers → CSV"
            },
            "file": "src/calculation.mjs",
            "focus": true
          },
          {
            "layer": 4,
            "title": {
              "zh": "派生意见 ≠ 原文",
              "en": "Derived Notes ≠ Sources"
            },
            "detail": {
              "zh": "证据不足应保留缺口",
              "en": "Preserve missing evidence"
            },
            "file": "src/child-results.mjs",
            "focus": true
          }
        ]
      },
      {
        "title": {
          "zh": "报告与回读",
          "en": "Report & Readback"
        },
        "hint": {
          "zh": "写入与可见分开",
          "en": "Commit before readback"
        },
        "color": "#AC507F",
        "items": [
          {
            "layer": 4,
            "title": {
              "zh": "Artifact：保存回执",
              "en": "Artifact: Save Receipt"
            },
            "detail": {
              "zh": "Main 报告的持久结果",
              "en": "Persisted Main report"
            },
            "file": "src/artifacts.mjs",
            "focus": false
          },
          {
            "layer": 5,
            "title": {
              "zh": "specialist-cli read",
              "en": "specialist-cli: Read"
            },
            "detail": {
              "zh": "按 Run 查看来源和正文",
              "en": "Read Run sources and report"
            },
            "file": "src/specialist-cli.mjs",
            "focus": true
          }
        ]
      }
    ]
  }
};
const LAYERS=[
  {
    "id": "L1",
    "zh": "任务输入与触发",
    "en": "Task Intake & Triggers",
    "hz": "CLI 输入",
    "he": "CLI entry",
    "y": 307,
    "h": 176
  },
  {
    "id": "L2",
    "zh": "身份、会话与上下文",
    "en": "Identity, Session & Context",
    "hz": "范围 · 状态 · 资料",
    "he": "Scope · state · context",
    "y": 489,
    "h": 215
  },
  {
    "id": "L3",
    "zh": "Agent 决策与运行",
    "en": "Agent Decisions & Runtime",
    "hz": "Model · Main · Child",
    "he": "Model · Main · Child",
    "y": 710,
    "h": 263
  },
  {
    "id": "L4",
    "zh": "工具与领域能力",
    "en": "Tools & Domain Capabilities",
    "hz": "Host · 读取 · 证据",
    "he": "Host · reads · evidence",
    "y": 979,
    "h": 295
  },
  {
    "id": "L5",
    "zh": "结果发布与交付",
    "en": "Result Publication & Delivery",
    "hz": "本例：保存报告",
    "he": "Demo: persist report",
    "y": 1280,
    "h": 175
  },
  {
    "id": "L6",
    "zh": "用户界面",
    "en": "User Interface",
    "hz": "本例：CLI 回读",
    "he": "Demo: CLI readback",
    "y": 1461,
    "h": 178
  }
];
function escSvg(v){return String(v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;")}
function svgText(x,y,txt,size=19,weight=560,fill="#172D46",anchor="start"){return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" fill="${fill}" font-family="Noto Sans CJK SC,Noto Sans SC,Microsoft YaHei,Arial,sans-serif" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}">${escSvg(txt)}</text>`}
function renderSvg(stage,lang){
 const z=STAGES[stage],en=lang==="en",out=[],width=2960,height=1754;
 const W=width, margins=252, right=33, gap=12, count=z.columns.length, cw=(W-margins-right-(count-1)*gap)/count;
 const p=(s)=>out.push(s);
 p(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${height}" viewBox="0 0 ${W} ${height}" role="img" aria-labelledby="stage-title stage-desc">`);
 p(`<title id="stage-title">${escSvg(z.title[lang])}</title><desc id="stage-desc">${escSvg(z.subtitle[lang])}</desc>`);
 p('<style>.stage-link{cursor:pointer;text-decoration:none}.stage-link:hover rect:first-of-type,.stage-link:focus-visible rect:first-of-type{stroke-width:4;filter:brightness(.96)}.stage-link:focus-visible{outline:none}</style>');
 p(`<rect width="${W}" height="${height}" fill="#F6F8FC"/>`);
 p(`<rect width="${W}" height="128" fill="#0F203D"/>`);
 p(svgText(42,64,z.title[lang],35,790,"#FFFFFF"));
 p(svgText(43,105,z.subtitle[lang],19,460,"#BDCEE4"));
 p(`<rect x="34" y="141" width="2892" height="43" rx="9" fill="#E7EDF7"/>`);
 p(svgText(56,169,z.lane[lang],19,680,"#245A97"));
 p(svgText(2905,169,en?"Pinned Open ETF Agent v0.15.0":"Open ETF Agent v0.15.0 固定版本",16,540,"#465673","end"));
 for(const [i,layer] of LAYERS.entries()){
  p(`<rect x="30" y="${layer.y}" width="2900" height="${layer.h}" rx="12" fill="${i%2?"#EFF3F9":"#FFFFFF"}"/>`);
  p(`<rect x="39" y="${layer.y+12}" width="187" height="${layer.h-24}" rx="8" fill="#E8EFFA"/>`);
  p(svgText(56,layer.y+45,layer.id,26,760,"#2563A9"));
  p(svgText(56,layer.y+81,en?layer.en:layer.zh,en?15:17,730,"#172C46"));
  p(svgText(56,layer.y+109,en?layer.he:layer.hz,13,490,"#64748B"));
  if(i<5) p(svgText(126,layer.y+layer.h+8,"↓",21,540,"#AAB6C7","middle"));
 }
 for(const [index,col] of z.columns.entries()){
  const x=margins+index*(cw+gap);
  const emphasized=col.items.some(item=>item.focus);
  p(`<rect x="${x.toFixed(1)}" y="194" width="${cw.toFixed(1)}" height="98" rx="8" fill="#F6F9FC" stroke="#BBC8D6" stroke-width="1.4" stroke-dasharray="5 5"/>`);
  p(`<rect x="${x.toFixed(1)}" y="194" width="${cw.toFixed(1)}" height="6" rx="3" fill="${col.color}"/>`);
  p(svgText(x+18,229,col.title[lang],en?20:22,760,"#193149"));
  p(svgText(x+18,262,col.hint[lang],en?15:16,500,"#64748B"));
  if(emphasized){
   p(`<rect x="${(x+cw-72).toFixed(1)}" y="207" width="57" height="24" rx="12" fill="#E8F5F0" stroke="#63AE9B" stroke-width=".8"/>`);
   p(svgText(x+cw-43.5,224,en?"NEW":stage==="intro"?"核心":"新增",12,730,"#147B61","middle"));
  }
  p(`<rect x="${(x+2).toFixed(1)}" y="297" width="${(cw-4).toFixed(1)}" height="1350" rx="8" fill="${col.color}" fill-opacity="${emphasized?".035":".015"}"/>`);
  for(const layer of LAYERS){
   const items=col.items.filter(it=>it.layer===LAYERS.indexOf(layer));
   if(!items.length)continue;
   const innerTop=layer.y+18, innerH=layer.h-36, sep=12;
   const cardH=Math.min(106,(innerH-sep*(items.length-1))/items.length);
   for(let j=0;j<items.length;j++){
    const it=items[j], xx=x+11, ww=cw-22, yy=innerTop+j*(cardH+sep);
    const main=it.focus,fill=main?"#EAF5F3":"#F9FAFC",stroke=main?col.color:"#B6C2CE";
    const base="https://github.com/hpoenixf/open-etf-agent/blob/74bd5aa455ccaeb2994eb22aa744affde660bfa2/";
    const url=base+it.file, label=it.title[lang];
    p(`<a class="stage-link" href="${escSvg(url)}" target="_blank" rel="noopener noreferrer" aria-label="${escSvg(label+" — "+it.file)}"><title>${escSvg(label+" — "+it.file)}</title>`);
    p(`<rect x="${xx.toFixed(1)}" y="${yy.toFixed(1)}" width="${ww.toFixed(1)}" height="${cardH.toFixed(1)}" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="${main?2.5:1.6}"/>`);
    p(`<rect x="${(xx+1).toFixed(1)}" y="${(yy+2).toFixed(1)}" width="7" height="${(cardH-4).toFixed(1)}" rx="3" fill="${main?col.color:"#9DAFC0"}"/>`);
    const tlen=label.length, titleSize=(en?(tlen>30?17:tlen>24?19:21):(tlen>15?18:21));
    p(svgText(xx+20,yy+Math.min(36,cardH*.40),label,titleSize,730,"#17334B"));
    const description=it.detail[lang];
    const detailSize=en?(description.length>34?14:15):15;
    p(svgText(xx+20,yy+Math.min(65,cardH-13),description,detailSize,480,"#5C6F84"));
    p(`</a>`);
   }
  }
 }
 p(`<rect x="30" y="1650" width="2900" height="90" rx="10" fill="#FFFFFF" stroke="#DCE5ED" stroke-width="1"/>`);
 p(`<rect x="50" y="1672" width="115" height="35" rx="8" fill="#E6F4F0" stroke="#80B7A9" stroke-width="1"/>`);
 p(svgText(108,1695,en?"SCOPE":"范围",17,740,"#246F5D","middle"));
 p(svgText(187,1686,z.footer[lang],en?15:16,480,"#465673"));
 p(svgText(187,1714,en?"Colored = emphasized here; muted = already introduced. Every linked chip points to pinned source code.":"彩色框 = 本篇重点；浅灰框 = 已介绍的基础。实线标签均链接固定源码，不把规划能力画成已支持模块。",15,500,"#637489"));
 p(`</svg>`);
 return out.join("");
}
const directory = new URL('../visuals/learning-stage-maps/',import.meta.url);
mkdirSync(directory,{recursive:true});
for (const stage of Object.keys(STAGES)) for (const lang of ['zh','en']) {
  writeFileSync(new URL(stage+'-'+lang+'.svg',directory),renderSvg(stage,lang),'utf8');
}
console.log('Generated six bilingual learning-stage SVGs');
