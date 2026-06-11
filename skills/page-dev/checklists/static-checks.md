# 静态检测清单（机械项）

**用法**：

- `light`：只检查本次改动实际相关的条目
- `standard/full`：按序扫描 `git diff HEAD` 的变更文件

命中条目按「自动修复 / 停下问用户」处理。

## 检查项

| # | 规则 | 检测方式 | 匹配模式 | 处理 |
|---|---|---|---|---|
| 1 | 禁止 `import *` | grep | `^import\s+\*\s+as` | 自动改为具名 import |
| 2 | 禁止 `export default`（request.jsx 白名单） | grep | `^export\s+default` | 自动改为 named export，排除 `src/common/utils/request.jsx` |
| 3 | `data-spm` 必须带前缀 | regex | `data-spm="([^"]+)"` + 页面名匹配 | 无前缀 → 停下问用户 |
| 4 | 通用类名禁用 | grep | `\.(title\|content\|container\|image\|wrap)\b` 在 `.scss` | 提示重命名为 BEM Block |
| 5 | 深层相对路径禁用 | grep | `from ['"]\.\./\.\./` 在 `src/` 内 | 自动改为 `@/` 别名 |
| 6 | `<Form.Item>` 单直接子 | AST 或结构匹配 | `<Form.Item>[\s\S]*?<\/Form.Item>` 子节点计数 | 多子 → 停下问用户（用 `extra` 或拆分） |
| 7 | `Certificate` 全拼禁用 | grep | `\bCertificate[A-Z]` | 自动改为 `Cert`（除 UI 文案 / API 字段） |
| 8 | `i18n.get` id/dm 配对 | regex | `i18n\.get\(\{[^}]*\}\)` | 缺 id 或 dm → 停下问用户 |
| 9 | `console.log` 禁用 | grep | `\bconsole\.log\(` | 自动删除或改为 logger |
| 10 | 直接修改 `window` 禁用 | grep | `window\.\w+\s*=` | 停下问用户（改为代理层） |
| 11 | BEM 命名约束 | AST 或 stylelint | Block 全局唯一、`__Element`、`--Modifier` | 依赖 `stylelint:fix` |
| 12 | pages 下不得创建 service | Glob | `src/pages/**/services/**` | 停下问用户（移到 `src/services/`） |

## 执行方式

优先使用 Grep 工具，匹配模式见上表。复杂匹配（Form.Item 子节点计数、BEM 嵌套深度）用 AST 解析或回落到 `stylelint:fix`。

## LLM-only 项（静态不可检测）

- 命名语义化程度
- 业务逻辑是否被意外修改
- Form 字段值结构（string vs Dayjs）
- data-spm 动态值合理性
- 重构是否丢失样式

`full` 由末段 `code-reviewer` agent 覆盖；`standard` 按风险触发 code-reviewer；`light` 由主线程在交付摘要中说明已人工检查的风险点。
