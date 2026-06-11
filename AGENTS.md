---
description:
alwaysApply: true
---

# Codex / Agent 规则入口

规则权威索引。执行代码改动时，以 `rules/**/*.md` 原文为准。

---

## 规则源

- **实际源**：`rules/**/*.md`（项目根，单一维护点）
  - 不放 `.claude/` 下 → 避免被 IDE 当 CLAUDE.md memory 预加载
- **Cursor 镜像**：`.cursor/rules/**/*.mdc`（软链，由 `scripts/sync-cursor-rules.sh` 生成）
- **Skill 源**：`.claude/skills/**`；`.cursor/skills` 为目录软链
- **AI 入口**：本文件（`AGENTS.md`）；`.claude/CLAUDE.md` 软链至本文件，单一维护点

详见 [`.cursor/README.md`](./.cursor/README.md) · 完整清单见 [`rules/README.md`](./rules/README.md)。

---

## 执行原则（强制）

1. 规则权威源：`rules/**/*.md`（完整清单见 [`rules/README.md`](./rules/README.md)）
2. 冲突优先级：`alwaysApply` > `critical` > `high` > `medium` > `low`
3. 即将改代码前，**按改动路径 / 任务类型**读取匹配规则（见下"路径 → 规则映射"）
4. 不得用摘要替代细则：发生代码改动时，本文件只做索引，细节以 `.md` 原文为准

---

## 加载策略（按需读取，严禁预读）

> 本节优先级最高，覆盖任何"必读"措辞。

1. **闲聊 / 问答 / 纯解释**：默认**不读任何 `rules/**/*.md`**；除非用户明确要求解释某个规则文件或规则条款
2. **代码改动**：仅在**动手前**，按改动路径读**最少**相关规则
3. **规则 / 流程 / 文档优化建议**：如不实际改文件，不读 `rules/**/*.md`
4. **禁止**：
   - "以防万一"批量读取规则目录
   - 因为看到路径映射表就读全部规则
5. **路径映射**：见下"路径 → 规则映射"，**需要时再查**
6. **全量清单**：见 [`rules/README.md`](./rules/README.md)，仅作索引，不整表加载

---

## 业务知识载体（按需加载，由 skill 自动）

不属于 `rules/**` 但参与 page-dev / new-page-dev intake 阶段：

- **业务术语词典**：`references/glossary/<domain>.md` × 6（cert / strength / deep / reverify / brand / misc-rights）
- **业务决策档案 (ADR)**：`docs/adr/<PageName>/<date>-<slug>.md`

加载规则见：

- `references/glossary/README.md`
- `docs/adr/README.md`
- `.claude/skills/page-dev/prompts/prd-parse.md`「项目记忆预载」章节

**人工修改这两类文件**：直接编辑即可，git history 兜底 audit；skill 下次 intake 时自动重新加载新内容。

---

## 存量 / 新页面开发

`src/pages/**` 改动优先走 skill，避免裸开发：

- 存量 bug / feat：`/page-dev`（`.claude/skills/page-dev/SKILL.md`）
- 全新页面：`/new-page-dev`（`.claude/skills/new-page-dev/SKILL.md`）
- 只要本轮将修改 `src/pages/**`，必须先读取对应 skill 的 `SKILL.md`；若只是解释页面代码或定位问题，不强制进入 skill 流程
- 流程：PRD 解析 → 代码定位 / 骨架 → 改动 → 自检 → `code-reviewer` 报告
- **不自动 commit**；涉及业务语义、埋点口径、视觉还原目标、接口契约不明时，必须停问用户；纯代码结构和局部实现细节可按现有模式自行决策

---

## 全局强制规则（Always Apply）

1. 改动不得改变业务逻辑（除 PRD 明确要求）；不留 TODO / FIXME / 占位伪代码
2. 样式改动默认**改结构不改视觉值**，除非任务明确要求视觉调整
3. 仅当发生代码改动时，读取 [`change-principles.md`](./rules/00-meta/change-principles.md)；未改代码时只参考本节摘要

---

## 路径 → 规则映射（执行时必查）

只有当即将修改对应路径文件时，才读取下表规则；仅查看、解释、评审思路时不读取。
读取规则前先用 `rg --files rules | rg '/<规则文件名>$'` 定位实际路径，不得猜测分类目录。

| 路径 / 任务 | 必读 |
| --- | --- |
| `src/pages/**` | `pages.md` + `tracking.md` + 相关样式 / 命名 |
| `src/components/**` | `components.md` + `css-standards.md` |
| `src/hooks/**` | `hooks.md` + `interfaces.md` |
| `src/services/**` | `services.md` + `interfaces.md` |
| `src/common/**` | `common.md` + `01-code-standards/*` |
| `src/utils/**` | `utils.md` + `01-code-standards/*` |
| `src/history/**` | `history.md` |
| `src/constants/**` | `constants.md` |
| `src/styles/**` | `styles.md` |
| `*.scss` / `*.css` | `css-standards.md` |
| 表单（Form / Form.Item） | `form.md`（🔴 Critical） |
| 埋点改动 | `tracking.md`（🔴 Critical） |
| i18n 文案 | `i18n.md` |
| `window` 全局变量 | `window.md` |
| URL 参数 / query | `url-params.md` |
| `references/glossary/**` | 只读；写入由 page-dev / new-page-dev skill 经用户 ack 自动 patch |
| `docs/adr/**` | 只读；写入由 page-dev / new-page-dev F 阶段经用户 ack 自动落盘 |

**路径前缀**：上表 `*.md` 均为 `rules/<分类>/*.md` 简写；分类见 [`rules/README.md`](./rules/README.md)。

---

## 高风险规则提醒（🔴 直接影响质量）

1. **i18n**：禁虚构不存在的 ID；无可靠 ID 时允许直接中文
2. **埋点**：`data-spm` 必须语义化 + 全局唯一；页面 / 组件前缀不可省
3. **Form**：
   - `Form.Item` 只放一个直接表单控件子元素
   - 不破坏 Form 托管的 `value` / `onChange`
4. **导入导出**：named export / import；禁 `import *`；禁 `export default`（仅 `request.jsx` 例外）；`src/` 内用 `@/` 别名
5. **SCSS**：BEM 命名；禁通用类名（`.title` / `.box`）；禁全局污染

---

## 使用说明

1. 本文件 = 索引，不替代 `.md` 细则
2. 冲突以对应 `.md` 为准
3. 新增 / 删除 `rules/**` 文件后：
   ```bash
   bash scripts/sync-cursor-rules.sh
   ```
   并同步更新 [`rules/README.md`](./rules/README.md)
