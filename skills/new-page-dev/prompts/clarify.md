# AskUserQuestion 触发场景清单（new-page-dev）

命中任一条时停下问用户，不得自动决断。每次停顿必须给出具体上下文（文件路径、行号、候选方案），不使用「是否继续」类空泛问法。

## 通用场景

1. **页面契约不完整**
   - 缺页面名、路由、业务中文名、菜单归属线索
   - 选项：用户输入 / 采用候选推导 / 取消
2. **命名或路由冲突**
   - `pageName`、`routePath`、`webpackChunkName` 与既有页面冲突
   - 选项：改名（给出推荐） / 改走 `/page-dev` / 取消
3. **services / types 归属不明**
   - 不确定扩展既有 `src/services/<x>.ts` 还是新建 domain service
   - 选项：扩展现有 / 新建 / 用户指定
4. **接口字段或 query 类型不清**
   - 字段类型、可空性、枚举值、URL query shape 不明确
   - 选项：按 PRD 推断 / 用户补充 / 暂不实现该字段
5. **规则与既有代码冲突**
   - 例：注册点范式与现有代码局部不一致
   - 选项：遵循现有局部范式 / 遵循规则原文 / 用户决策
6. **自检无法自动修复**
   - 回修 2 轮仍失败，或自动修复可能改变业务逻辑
   - 选项：展示失败项供用户决策 / 手动修复 / 跳过本项并记录

## draft 专属

1. **注册策略不清**
   - draft 是否需要临时 route、是否进入 menu、是否只建页面目录
   - 选项：只建页面目录 / 加临时 route / 直接走 standard
2. **用户要求 draft 但又要求正式注册**
   - 选项：升级为 standard / 保持 draft 并记录未注册 / 取消

## standard / full 专属

1. **PRD 获取失败**
   - 选项：粘贴 PRD 原文 / 取消
2. **PRD 理解回执未经 ack**
   - 按 `../page-dev/prompts/ack-template.md` 输出回执
   - 选项：「全部正确，继续」(推荐) / 「需要修正」/ 「中止」
   - 未 ack 不得改代码
3. **必做注册点被拒绝或无法落盘**
   - 包括 `App.tsx`、`menu.ts`、`common/url.ts`、`pages-map.md`、有 query 时的 `interfaces/url-params.ts`
   - 选项：继续补齐 / 降级为 draft / 取消
4. **条件注册点未明示**
   - PRD 未说明是否需要 `spm.ts` 或 `permissions.ts`
   - 选项：不需要（推荐，PRD 未明示） / 需要并提供细节 / 升级 full 讨论

## menuCode 强停

`ROUTE_TO_MENU_CODE_MAP[routePath]` 的 menuCode 必须由用户确认。

- 上下文：`src/menu.ts` 中 route 到 menuCode 的映射
- 严禁编造，即使用户说「看着办」也要继续追问
- 选项：用户输入 menuCode 列表 / 暂不加入此 map 并降级为 draft / 取消

## full 专属

1. **术语懒搜跨域未命中**
   - 选项：用户提供代码标识 / 标注为新术语并确认 AI 推断 / 中止
2. **ADR 草稿需要确认**
   - 选项：采纳并写入 / 编辑后写入 / 本次不留 ADR
3. **权限 / 埋点策略影响跨页面约束**
   - 选项：按既有同域页面范式 / 用户指定新策略 / 暂缓该能力
