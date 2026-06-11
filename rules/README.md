---
description: 'Cursor/Claude 规则索引（v4.0）'
alwaysApply: false
---

# rules/ - 项目开发规范

> **源位置**：`rules/**/*.md`（项目根；避免被 IDE 当 CLAUDE.md memory 预加载）
> **Cursor 镜像**：`.cursor/rules/**/*.mdc`（软链，供 Cursor 按 frontmatter 加载）

---

## 📂 目录结构

```
rules/
├── 00-meta/              # 元信息 + 全局规则（4）
├── 01-code-standards/    # 通用代码规范（7）
├── 02-architecture/      # src 目录结构规范（11）
├── 03-styling/           # 样式与视觉（4）
└── 04-cross-cutting/     # 横切关注点（5）
```

---

## 🚀 快速导航

| 我想... | 查看 |
| --- | --- |
| 了解项目架构 | [`architecture.md`](./00-meta/architecture.md) |
| 开发页面 | [`pages.md`](./02-architecture/pages.md) |
| 开发组件 | [`components.md`](./02-architecture/components.md) |
| 开发表单 | [`form.md`](./02-architecture/form.md) |
| 写样式 | [`css-standards.md`](./03-styling/css-standards.md) |
| 加埋点 | [`tracking.md`](./04-cross-cutting/tracking.md) |
| 加 i18n | [`i18n.md`](./04-cross-cutting/i18n.md) |
| 改动通用护栏 | [`change-principles.md`](./00-meta/change-principles.md) |

---

## 📋 分类明细

### 00-meta · 元信息 + 全局规则（4）

| 文件 | 说明 | 优先级 |
| --- | --- | --- |
| [README.md](./README.md) | 本文件·规则索引 | - |
| [architecture.md](./00-meta/architecture.md) | 项目架构总览 | - |
| [docs.md](./00-meta/docs.md) | `docs/` 治理文档组织 | 🟢 Low |
| [change-principles.md](./00-meta/change-principles.md) | 改动通用护栏（铁律 + 高频陷阱） | 🔴 Critical |

### 01-code-standards · 通用代码规范（7）

| 文件 | 说明 | 优先级 |
| --- | --- | --- |
| [typescript.md](./01-code-standards/typescript.md) | TypeScript 类型规范 | 🟡 Medium |
| [naming.md](./01-code-standards/naming.md) | 命名规范（文件 / 变量 / Cert 简写） | 🔴 High |
| [interfaces.md](./01-code-standards/interfaces.md) | 接口类型定义（I 前缀） | 🔴 High |
| [exports.md](./01-code-standards/exports.md) | 导出规范（禁 default） | 🟡 Medium |
| [import.md](./01-code-standards/import.md) | 导入规范（具名 + `@/`） | 🟡 Medium |
| [code-formatting.md](./01-code-standards/code-formatting.md) | Prettier / ESLint / EditorConfig | 🟢 Low |
| [url-params.md](./01-code-standards/url-params.md) | URL 参数获取 | 🟡 Medium |

### 02-architecture · src 目录结构规范（11）

| 文件 | 说明 | 优先级 |
| --- | --- | --- |
| [pages.md](./02-architecture/pages.md) | 页面开发（目录 / 埋点 / 布局） | 🔴 Critical |
| [form.md](./02-architecture/form.md) | 表单开发（Form.Item 陷阱） | 🔴 Critical |
| [components.md](./02-architecture/components.md) | 全局组件 | 🔴 High |
| [services.md](./02-architecture/services.md) | API 接口管理 | 🔴 High |
| [common.md](./02-architecture/common.md) | `src/common/**` 公共代码 | 🟡 High |
| [utils.md](./02-architecture/utils.md) | `src/utils/**` 工具函数 | 🟡 High |
| [hooks.md](./02-architecture/hooks.md) | 自定义 Hooks（useRequest / 缓存） | 🟡 Medium |
| [stores.md](./02-architecture/stores.md) | zustand 全局状态 | 🟡 Medium |
| [layout.md](./02-architecture/layout.md) | 全局布局 | 🟡 Medium |
| [constants.md](./02-architecture/constants.md) | 常量 / enum | 🟢 Low |
| [history.md](./02-architecture/history.md) | 路由历史管理 | 🟢 Low |

### 03-styling · 样式与视觉（4）

| 文件 | 说明 | 优先级 |
| --- | --- | --- |
| [css-standards.md](./03-styling/css-standards.md) | CSS / BEM（核心） | 🔴 High |
| [crated-antd.md](./03-styling/crated-antd.md) | Antd 组件使用 | 🔴 High |
| [styles.md](./03-styling/styles.md) | 全局样式文件组织 | 🟡 Medium |
| [icon.md](./03-styling/icon.md) | 图标使用 | 🟡 Medium |

### 04-cross-cutting · 横切关注点（5）

| 文件 | 说明 | 优先级 |
| --- | --- | --- |
| [tracking.md](./04-cross-cutting/tracking.md) | 埋点（PV / 自动 / 手动） | 🔴 Critical |
| [i18n.md](./04-cross-cutting/i18n.md) | 多语言 / 文案 | 🟡 Medium |
| [loading.md](./04-cross-cutting/loading.md) | Loading / Skeleton | 🟡 Medium |
| [logging.md](./04-cross-cutting/logging.md) | 日志 / 控制台 | 🟡 Medium |
| [window.md](./04-cross-cutting/window.md) | Window 变量 / VM 注入 | 🟡 Medium |

---

## 🔍 如何查找规范

### 按 src 目录

| 源目录 | 主规则 |
| --- | --- |
| `src/pages/**` | [pages.md](./02-architecture/pages.md) + [tracking.md](./04-cross-cutting/tracking.md) |
| `src/components/**` | [components.md](./02-architecture/components.md) + [css-standards.md](./03-styling/css-standards.md) |
| `src/hooks/**` | [hooks.md](./02-architecture/hooks.md) |
| `src/services/**` | [services.md](./02-architecture/services.md) |
| `src/stores/**` | [stores.md](./02-architecture/stores.md) |
| `src/common/**` | [common.md](./02-architecture/common.md) |
| `src/utils/**` | [utils.md](./02-architecture/utils.md) |
| `*.scss` / `*.css` | [css-standards.md](./03-styling/css-standards.md) |

### 按问题类型

- **命名** → [naming.md](./01-code-standards/naming.md)
- **导入导出** → [exports.md](./01-code-standards/exports.md) + [import.md](./01-code-standards/import.md)
- **类型** → [typescript.md](./01-code-standards/typescript.md) + [interfaces.md](./01-code-standards/interfaces.md)
- **样式** → [css-standards.md](./03-styling/css-standards.md)

---

## 🏷️ 优先级

- 🔴 **Critical**：必须严格遵守（埋点、页面结构、表单、改动护栏）
- 🔴 **High**：强烈推荐（命名、样式、组件、接口）
- 🟡 **Medium**：提升质量（类型、导入导出、日志）
- 🟢 **Low**：按需参考（格式化、常量、历史）

---

## ⚙️ 加载机制

- **Cursor**：读 `.cursor/rules/**/*.mdc`（软链），按 frontmatter 的 `description` / `alwaysApply` / `globs` 触发
- **Claude Code / Codex**：按 [`AGENTS.md`](../AGENTS.md) 指引（`.claude/CLAUDE.md` 软链至此），按需读 `rules/**/*.md`

---

## 🛠️ 更新规范

1. **只改 `rules/` 下的 `.md` 源文件**（不改 `.cursor/rules/*.mdc` 软链）
2. 执行同步脚本：

   ```bash
   bash scripts/sync-cursor-rules.sh
   ```

3. 新增分类时同步更新本 README + `AGENTS.md`

---

## 📜 迁移历史

- **v4.0 (2026-04-22)**：规则源从 `.claude/rules/` 迁到 `rules/`（避免 IDE memory 吞规则）；解散 `05-best-practices/` + `06-reference/`；`04-features/` → `04-cross-cutting/`
- **v3.0 (2026-01-29)**：引入子目录（00–06）；整合冗余：36 → 30

---

**版本**：4.0.0 · **维护者**：前端团队 · **更新**：2026-04-22
