---
name: page-dev
description: 存量页面开发辅助 skill。仅在用户明确调用 /page-dev，或用户确认需要使用 page-dev 流程时启用；不得因用户提到 src/pages、页面 bug、小需求或 PRD 自动启用。启用后先选择 light / standard / full 模式，再按对应强度执行定位、改动、自检、review / ADR。首期范围 src/pages/** 的存量页面 bug 修复与 feat 迭代，不含重构、不含新建页面。不自动 commit，歧义必停问用户。
---

# page-dev — 存量页面开发辅助

## 什么时候不用

默认不要因为用户提到 `src/pages/**`、页面 bug、小需求、或 PRD 就自动启用本 skill。以下场景优先走普通代码改动流程：

- 文案替换、样式微调、删除无用代码、纯 lint / 类型修复
- 单文件显然修复、单点交互问题、无需 PRD 解析的小 bug
- 新建页面、大范围重构、跨 28 个页面的通用改造

## 什么时候启用

只有满足以下任一条件，才进入本 skill：

1. 用户明确输入 `/page-dev`
2. 用户明确说「使用 page-dev / 走 page-dev 流程 / 按这个 skill 开发」
3. agent 判断需求需要页面开发流程时，先说明成本与收益，并得到用户明确确认

未确认时，继续使用普通代码改动流程。

## 模式选择

启用后先选模式；用户指定模式时以用户为准，不确定时先问。

| 模式 | 适用场景 | 默认动作 |
| --- | --- | --- |
| `light` | 小 bug、单点交互、单文件 / 少量文件改动、无 PRD 或 PRD 很短 | 最小定位、最小规则读取、改动、针对性自检；不做 PRD ack / memory / glossary / ADR / code-reviewer |
| `standard` | 普通页面 bug / feat，有明确 PRD 或验收标准，预计触达多个页面内文件 | PRD 理解回执、代码现状探针、规则 checkpoint、改动、自检；按风险决定是否 code-reviewer |
| `full` | 高风险业务逻辑、接口语义变化、跨模块数据流、长期业务决策、需要沉淀 ADR | 在 standard 基础上追加项目记忆、术语词典差量、code-reviewer、ADR |

默认路由：

- 用户只说「修一下 / 调一下 / 改个文案 / 样式不对」→ 不启用本 skill；若已明确启用，则用 `light`
- 用户给出完整 PRD 且要求按页面需求开发 → `standard`
- 需求包含长期规则、领域术语争议、接口含义变化、跨页面影响或审计记录 → `full`

## 通用原则

1. **不自动 commit**：只改代码、跑自检、按模式决定是否 review，提交由用户执行
2. **歧义必停**：命中「停顿条件」或 `prompts/clarify.md` 时，停下问用户，不自动决断
3. **规则优先**：改动前读 `AGENTS.md` + 命中路径的 `rules/**/*.md` 原文；`rules/00-meta/change-principles.md` 为全局护栏
4. **复用现有资产**：细节模板、静态检查、ADR 格式、review 协议都引用现有文件，不在本文件重复维护

---

## light 流程

用于小需求。目标是快速、可控、不过度编排。

1. 用 1-3 句话复述目标；若需求、页面、业务影响不清，停下问用户
2. 定位最小改动文件，按路径读取最少相关规则
3. 给出简短计划：文件、变更点、验证方式
4. 落盘改动，保持业务逻辑最小变更
5. 执行与改动相关的最小自检；不强制跑全量 build
6. 交付改动摘要、文件清单、已跑自检、未跑项说明

默认不执行 PRD ack、项目记忆预载、glossary patch、ADR、code-reviewer。

## standard 流程

用于普通 PRD 页面 bug / feat。

1. 按 `prompts/prd-parse.md` 拉取或摄入 PRD，结构化需求
2. 按 `prompts/code-snapshot.md` 执行代码现状探针，产出 `code_snapshot`
3. 按 `prompts/ack-template.md` 输出 PRD 理解回执，并在用户 ack 前禁止进入改动
4. 按 `references/pages-map.md` 定位页面，按 `references/rules-index.md` 读取命中规则并输出 `[rules-loaded]`
5. 按 bug / feat 模板形成改动计划：`prompts/bug-template.md` / `prompts/feat-template.md`
6. 落盘改动，按 `checklists/static-checks.md` 与 `checklists/self-check.md` 自检
7. 若涉及业务逻辑、接口字段、表单、埋点、权限、或跨 3 个以上文件，调用 code-reviewer；否则主线程给出简短 review 结论

## full 流程

用于高风险或需要沉淀业务决策的页面改动。

在 `standard` 基础上追加：

1. 按 `prompts/memory-load.md` 加载 glossary 与 ADR，并输出 `[memory-loaded]`
2. PRD 理解回执包含「术语词典差量」；ack 后按规则 patch `references/glossary/<domain>.md`
3. 必须调用 `.claude/agents/code-reviewer.md`，传入 `git diff --no-color HEAD` 与 PRD 摘要
4. 命中 ADR 条件时，按 `docs/adr/README.md` 起草 ADR，并让用户确认是否写入

ADR 仅用于长期业务约束、反直觉决策、接口语义变化、跨页面影响、或用户明确要求留档；普通 bugfix 不写 ADR。

## 停顿条件

命中以下任一情况，停下问用户：

- 需求类型、目标页面、验收标准不清
- 一个 PRD 匹配多个页面，或需要跨 2 个以上页面改动
- PRD 字段 / 接口在目标页面找不到对应代码，且会影响实现判断
- 接口字段、命名、Form 结构、埋点语义、权限逻辑存在歧义
- 规则与既有代码冲突，或自动修复可能改变业务逻辑
- 自检失败回修 2 轮仍无法解决
- `standard/full` 的 PRD 理解回执未获用户 ack

## 引用索引

- PRD 解析：`prompts/prd-parse.md`
- 现状探针：`prompts/code-snapshot.md`
- 记忆预载：`prompts/memory-load.md`
- PRD 回执：`prompts/ack-template.md`
- bug / feat 模板：`prompts/bug-template.md`、`prompts/feat-template.md`
- 停顿细则：`prompts/clarify.md`
- 自检项：`checklists/static-checks.md`、`checklists/self-check.md`
- 页面与规则索引：`references/pages-map.md`、`references/rules-index.md`
- ADR 格式：`docs/adr/README.md`
- reviewer agent：`.claude/agents/code-reviewer.md`
