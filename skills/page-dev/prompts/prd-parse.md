# PRD 解析与 MCP 适配契约

## 适用模式

- `light`：默认不使用本文件；小需求用自然语言复述即可
- `standard`：使用本文件拉取 / 摄入 PRD，并产出结构化 JSON
- `full`：使用本文件，并追加 `code-snapshot.md`、`memory-load.md`、`ack-template.md`

## 作用

将任意形态的 PRD（URL / 文档 ID / 纯文本）转换为结构化 JSON，供 `standard/full` 后续流程消费。

## MCP 适配契约

PRD 源：aone-km MCP Server（`https://mcp.alibaba-inc.com/aone-km/mcp`），支持语雀、alidocs（钉钉文档）等多源文档拉取。

本 skill **不硬编码** MCP 工具名。运行时流程：

1. 收到 `prd_ref` 参数（URL / ID / 文本，任一）
2. 若 `prd_ref` 明显是 aone-km URL 或文档 ID，使用 ToolSearch 搜索 `aone-km` / `km` / `document`
3. 匹配到 `mcp__aone_km__*` 工具时加载 schema 并拉取原文
4. MCP 未注册、调用失败、或用户无法配置时，降级为让用户粘贴 PRD 文本

## 输出 Schema

```json
{
  "type": "bug | feat",
  "pages": ["<PageName>"],
  "changes": {
    "fields": [],
    "columns": [],
    "filters": [],
    "bugs": []
  },
  "api_changes": {
    "service": "<service-name>",
    "method": "GET|POST|...",
    "new_params": [],
    "new_fields": []
  },
  "acceptance": ["<验收标准条目>"],
  "understanding": {
    "goal": "<一句话业务目标>",
    "target": "<改动定位：页面 + 元素>",
    "before": "<改动前现状>",
    "after": "<改动后目标>"
  },
  "assumptions": [],
  "uncertainties": [],
  "code_snapshot": {},
  "glossary_delta": {},
  "raw_prd": "<原 PRD 文本>",
  "user_ack": false
}
```

字段说明：

- `code_snapshot` 由 `code-snapshot.md` 产出；`standard/full` 在理解回执前必须填充
- `glossary_delta` 仅 `full` 使用，由 `memory-load.md` + 用户 ack 修正产出
- `user_ack` 由 `ack-template.md` 的理解回执确认后置为 `true`

## 抽取规则

1. **type 判断**
   - 关键词「修复 / bug / 修 / 错误 / 异常 / 不生效 / 不显示」→ `bug`
   - 关键词「新增 / 迭代 / 支持 / 增加 / 改为 / 加个」→ `feat`
   - 都不明确 → 停下问用户
2. **pages 匹配**：对照 `references/pages-map.md` 的页面名与中文别名
3. **fields / columns / filters**：逐条抽取，保留 PRD 原字段名
4. **acceptance**：抽取「验收 / 标准 / 预期 / 效果」等章节；无则留空并在 ack 中暴露为假设或不确定项

## 降级路径

MCP 未接入时，停下问用户：

- 粘贴完整 PRD 文本
- 取消执行

## 停下问用户

- PRD 无法识别 bug / feat 类型
- 页面名未匹配到 `references/pages-map.md`
- 关键字段缺失，例如 feat 只说「加字段」但未说字段名 / 类型

## 相关文件

- 代码现状探针：`code-snapshot.md`
- 项目记忆预载：`memory-load.md`
- PRD 理解回执：`ack-template.md`
