# 路径 → 规则映射索引

**权威源**：`AGENTS.md` + `rules/**/*.md` 原文。本文件仅提供快查映射；如与权威源冲突，以 `AGENTS.md` 和对应规则原文为准。

## 通用基座

`standard/full` 的 TS/TSX 改动预载：

- `01-code-standards/code-formatting.md`
- `01-code-standards/naming.md`
- `01-code-standards/import.md`
- `01-code-standards/exports.md`
- `01-code-standards/typescript.md`

`light` 只读取本次改动实际命中的最小规则集。

## 路径映射

按需读取，禁止为防万一批量预读。

| 改动路径 | 必读规则 |
|---|---|
| `src/pages/**` | `02-architecture/pages.md` + `02-architecture/layout.md` + `04-cross-cutting/tracking.md` |
| `src/components/**` | `02-architecture/components.md` + `03-styling/css-standards.md` |
| `src/hooks/**` | `02-architecture/hooks.md` + `01-code-standards/interfaces.md` |
| `src/services/**` | `02-architecture/services.md` + `01-code-standards/interfaces.md` |
| `src/common/**` | `02-architecture/common.md` + `01-code-standards/*` |
| `src/utils/**` | `02-architecture/utils.md` + `01-code-standards/*` |
| `src/history/**` | `02-architecture/history.md` |
| `src/constants/**` | `02-architecture/constants.md` |
| `src/stores/**` | `02-architecture/stores.md` |
| `src/styles/**` | `03-styling/styles.md` |
| `**/*.scss`、`**/*.css` | `03-styling/css-standards.md` + `03-styling/crated-antd.md` |
| 含 `<Form>` / `<Form.Item>` | `02-architecture/form.md` |
| 含 Icon 使用 | `03-styling/icon.md` |
| 含 Loading 态 | `04-cross-cutting/loading.md` |
| 含日志 / logger | `04-cross-cutting/logging.md` |
| URL query 参数 | `01-code-standards/url-params.md` |
| 埋点 data-spm | `04-cross-cutting/tracking.md`（critical） |
| i18n 文案 | `04-cross-cutting/i18n.md` |
| `window` 全局 | `04-cross-cutting/window.md` |
| 外部文档引用 | `00-meta/docs.md` |

## 全局强制（Always Apply）

`00-meta/change-principles.md`：所有改动必读。

- 改动不改业务逻辑（非 PRD 要求）
- 禁止 TODO/FIXME/占位伪代码
- 替换后必删旧代码
- 样式默认「改结构不改视觉值」
- 禁 `@ts-ignore` / `eslint-disable` 绕错

## 冲突优先级

`alwaysApply` > `critical` > `high` > `medium` > `low`

## 高风险速查

1. **i18n**：禁虚构 ID，无可靠 ID 直接写中文
2. **data-spm**：必带页面/组件前缀，全局唯一
3. **Form.Item**：仅一个直接控件子，说明用 `extra`
4. **命名/导入导出**：named export、禁 `import *`、`src/` 内用 `@/`
5. **SCSS**：必 BEM，禁通用类名污染

## 31 规则清单

### 00-meta（元信息 / 全局规则）
- `README.md`、`architecture.md`、`docs.md`、`change-principles.md`（全局强制）

### 01-code-standards（通用代码规范）
- `code-formatting.md`、`exports.md`、`import.md`、`interfaces.md`、`naming.md`、`typescript.md`、`url-params.md`

### 02-architecture（src 目录结构规范）
- `common.md`、`components.md`、`constants.md`、`form.md`、`history.md`、`hooks.md`、`layout.md`、`pages.md`、`services.md`、`stores.md`、`utils.md`

### 03-styling（样式与视觉）
- `crated-antd.md`、`css-standards.md`、`icon.md`、`styles.md`

### 04-cross-cutting（横切关注点 / 基础能力）
- `i18n.md`、`loading.md`、`logging.md`、`tracking.md`、`window.md`
