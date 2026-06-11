---
name: new-page-dev
description: 新增页面开发辅助 skill。仅在用户明确调用 /new-page-dev，或用户确认需要使用 new-page-dev 流程时启用；不得因用户提到新增页面、PRD、路由或菜单自动启用。用于 src/pages/** 下全新页面的新建，核心是页面契约、骨架、注册点、自检与交付 review。不覆盖存量页面改动（走 /page-dev）、全站级重构、跨页面通用改造。不自动 commit，ROUTE_TO_MENU_CODE_MAP 与歧义必停问用户。
---

# new-page-dev — 新页面契约与注册点交付

## 什么时候不用

默认不要因为用户提到「新增页面 / PRD / 路由 / 菜单」就自动启用本 skill。以下场景优先不用：

- 只是咨询如何建页面、讨论方案、评估影响
- 存量页面改动，应走 `/page-dev` 或普通代码改动
- 全站级重构、跨页面通用改造、单独补菜单 / 路由的小修

## 什么时候启用

只有满足以下任一条件，才进入本 skill：

1. 用户明确输入 `/new-page-dev`
2. 用户明确说「使用 new-page-dev / 走新页面流程 / 按这个 skill 开发」
3. agent 判断需求确实是全新页面交付时，先说明成本与收益，并得到用户确认

未确认时，继续普通问答或普通代码改动流程。

## 模式选择

新页面没有真正的“小改”模式；启用后先选交付强度。

| 模式 | 适用场景 | 默认动作 |
| --- | --- | --- |
| `draft` | 原型页、占位页、仅验证布局或信息架构 | 建页面骨架，可不接真实接口；不进正式菜单，不写 ADR，不强制 code-reviewer |
| `standard` | 正式新页面交付 | PRD ack、页面契约、骨架、必做注册点、scaffold 自检、静态检查、build、按风险 review |
| `full` | 高风险业务、权限/埋点/接口语义、长期业务不变量 | 在 standard 基础上追加 memory/glossary、code-reviewer、按需 ADR |

默认路由：

- 用户要「先搭个空页面 / 原型」→ `draft`
- 用户给完整 PRD 并要求正式上线页面 → `standard`
- 涉及权限、埋点、接口语义、领域术语争议、跨页面影响或审计记录 → `full`

## 通用原则

1. **不自动 commit**：只改代码、跑自检、按模式决定是否 review，提交由用户执行
2. **注册点优先**：正式新页面不得只建 `src/pages/<PageName>`；必做注册点未完成视为未交付
3. **menuCode 必问**：`ROUTE_TO_MENU_CODE_MAP[routePath]` 必须由用户确认，严禁编造
4. **共享资产走 src 根级**：services / types / interfaces / stores / hooks / constants 新增到 `src/<dir>/` 根级，不在页面内再造目录
5. **规则优先**：改动前读 `AGENTS.md` + 命中路径的 `rules/**/*.md` 原文；规则索引仅作快查

---

## draft 流程

用于原型或占位页，目标是先得到可运行页面骨架。

1. 确认页面名、路由、业务中文名；不清楚就停下问用户
2. 按 `prompts/page-template.md` 输出页面契约和最小资产清单
3. 新建 `src/pages/<PageName>/index.tsx`、`index.scss`，必要时加本页子组件
4. 默认不写真实 service / permission / spm / ADR
5. 注册策略由用户确认：临时路由 / 不进菜单 / 后续再接入正式菜单
6. 跑 `checklists/scaffold-checks.md` 中与 draft 相关的骨架检查，交付未完成注册点说明

## standard 流程

用于正式新页面交付。

1. 按 `../page-dev/prompts/prd-parse.md` 摄入 PRD
2. 按 `../page-dev/prompts/ack-template.md` 输出 PRD 理解回执，用户 ack 前不得改代码
3. 按 `prompts/page-template.md` 推导页面契约、资产清单、注册点清单
4. 读取 `references/registration-points.md` 与 `../page-dev/references/rules-index.md`，输出 `[rules-loaded]`
5. 落盘页面骨架与 `src/` 根级共享资产
6. 完成必做注册点：`App.tsx`、`menu.ts`、`common/url.ts`、`interfaces/url-params.ts`（如有 query）、`pages-map.md`
7. 按 PRD 明示补条件注册点：`spm.ts`、`permissions.ts` + `PermissionGuard`
8. 先跑 `checklists/scaffold-checks.md`，再跑 `../page-dev/checklists/static-checks.md` 与 `../page-dev/checklists/self-check.md`
9. 若涉及业务逻辑、接口字段、表单、埋点、权限、或跨 3 个以上文件，调用 code-reviewer；否则主线程给出简短 review 结论

## full 流程

用于高风险或需要沉淀业务决策的新页面。

在 `standard` 基础上追加：

1. 按 `../page-dev/prompts/memory-load.md` 加载 glossary 与同域 critical ADR，并输出 `[memory-loaded]`
2. PRD 理解回执包含「术语词典差量」；ack 后按规则 patch `references/glossary/<domain>.md`
3. 必须调用 `.claude/agents/code-reviewer.md`，传入 `git diff --no-color HEAD` 与 PRD 摘要
4. 命中 ADR 条件时，按 `docs/adr/README.md` 起草 ADR，并让用户确认是否写入

ADR 仅用于新页面长期业务约束、反直觉决策、接口语义变化、跨页面影响、权限/埋点策略，或用户明确要求留档；普通原型或简单页面不写 ADR。

## 停顿条件

命中以下任一情况，停下问用户：

- 页面名、路由、业务中文名、菜单归属不清
- 页面名 / 路由 / chunkName 与既有页面冲突
- `ROUTE_TO_MENU_CODE_MAP` menuCode 未知
- services 归属、接口字段、URL query 类型、权限点、埋点位点不清
- 用户要求正式页面但拒绝必要注册点
- 规则与既有代码冲突，或自动修复可能改变业务逻辑
- 自检失败回修 2 轮仍无法解决
- `standard/full` 的 PRD 理解回执未获用户 ack

## 引用索引

- 页面契约 / 资产清单 / 交付模板：`prompts/page-template.md`
- 停顿细则：`prompts/clarify.md`
- 注册点清单：`references/registration-points.md`
- 注册点完整度：`checklists/scaffold-checks.md`
- PRD 解析 / 回执 / memory：`../page-dev/prompts/prd-parse.md`、`../page-dev/prompts/ack-template.md`、`../page-dev/prompts/memory-load.md`
- 机械检查 / 自检：`../page-dev/checklists/static-checks.md`、`../page-dev/checklists/self-check.md`
- 规则与页面索引：`../page-dev/references/rules-index.md`、`../page-dev/references/pages-map.md`
- ADR 格式：`docs/adr/README.md`
- reviewer agent：`.claude/agents/code-reviewer.md`
