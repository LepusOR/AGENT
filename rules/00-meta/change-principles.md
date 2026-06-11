---
description: '代码改动通用准则 · 全局强制 · bug/feat/重构/新页面一律遵守'
alwaysApply: false
---

# 改动规范（Change Principles）

> 任何代码改动（bug / feat / 重构 / 新页面）都必须遵守。重构已基本完成，本规则留作改动护栏。

---

## 🚨 核心铁律

1. **禁改业务逻辑**：非 PRD 明确要求的逻辑变更，一律不动
2. **禁留 TODO/FIXME/伪代码**：改动必须可运行、可验证、无占位
3. **禁擅自"优化"**：不为性能/简洁主动改写已验证代码
4. **禁猜测实现**：不确定先读代码，不拍脑袋
5. **必删旧代码**：重命名 / 替换 / 搬迁后，旧文件立刻删，不留冗余
6. **禁 `@ts-ignore` / `eslint-disable` 绕错**：应定位根因，不压抑报错

## 🎨 样式改动默认"改结构不改视觉值"

- 改类名 ≠ 改样式值。除非 PRD 明确要求视觉调整，颜色/尺寸/间距保持原值
- 重构样式必须**逐块迁移**，文件行数应相近。行数断崖式减少 = 肯定丢样式
- 具体命名规范：[`03-styling/css-standards.md`](../03-styling/css-standards.md)

---

## ⚠️ 高频陷阱速查（Agent 易踩）

### 1. 导入导出不匹配 → React Error #130

- 现象：页面白屏，控制台 `Element type is invalid`
- 根因：组件是 **named export**，却被 **default import**（或反之）
- 定位：先查导入/导出方式是否成对；本项目优先 named export，详见 [`01-code-standards/exports.md`](../01-code-standards/exports.md)

### 2. Antd Table `render` 参数顺序

- 签名：`render: (value, record, index)`（第二个是行数据，不是 index）
- 易错写法：`render: (_v, _i, item)` 会把 index 当成 record，所有字段 `undefined`
- 详见 [`03-styling/crated-antd.md`](../03-styling/crated-antd.md)

### 3. `<Form.Item>` 多子元素

- `Form.Item` 只能有**一个**表单控件子元素，否则 `value/onChange` 托管失效
- 说明文案用 `extra` prop，不要塞额外 `<p>` / `<Tip>`
- 详见 [`02-architecture/form.md`](../02-architecture/form.md)

### 4. BEM Modifier 无法覆盖 `<a>` 默认样式

- `<a>` 的浏览器默认色/光标优先级高，嵌套 Modifier 可能不足以覆盖
- 禁用态需要同时 `color !important` + `pointer-events: none` + `cursor: not-allowed`
- 写法：Modifier 作为独立顶级选择器（`.block__action--disabled { ... }`），不要只嵌套在 Element 内

### 5. useRequest 数据取值

- 接口响应是 `{ hasError, content }`，`useRequest` 需提取 `content`，不要直接拿 `response.data`
- 渲染条件用原始代码的写法，不要擅自改为 `!loading && data`（缓存命中时 loading 可能不触发）
- 详见 [`02-architecture/hooks.md`](../02-architecture/hooks.md)

---

## 🔗 相关规范

- 命名 / 导入导出：[`01-code-standards/`](../01-code-standards/)
- 组件拆分 / 数据内聚：[`02-architecture/components.md`](../02-architecture/components.md)
- 样式 BEM：[`03-styling/css-standards.md`](../03-styling/css-standards.md)
- 埋点：[`04-cross-cutting/tracking.md`](../04-cross-cutting/tracking.md)

## ADR `[critical]-` 标记约束

**仅适用**：`docs/adr/<PageName>/[critical]-*.md` 文件名前缀

- **每页面 ≤ 3 条 `[critical]-` ADR**：由 code-reviewer agent 在 F. Review 阶段强制
- **触发降级**：超出 3 条时，reviewer 报告 Critical 级问题，必须人工挑选保留 3 条，其余去 `[critical]-` 前缀
- **降级判定原则**：保留"违反成本最高 / 跨页面影响最大"的 3 条
- **新增 critical 必须经用户 ack**：不允许 AI 自动加 `[critical]-` 前缀，仅在用户 ack ADR 草稿时显式选择
