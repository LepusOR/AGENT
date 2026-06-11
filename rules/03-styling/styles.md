---
description: 'src/styles 全局样式文件职责 · index.scss + iconfont.scss'
alwaysApply: false
---

# `src/styles/**` 全局样式规范

> **命名 / BEM / Modal / 间距** 见 [`css-standards.md`](./css-standards.md)。本文件只管 `src/styles/` 目录的职责边界。

---

## 🎯 核心原则

**`src/styles/**` 只能放 3 类内容**，其余一律放到组件/页面自己的 `index.scss`：

| ✅ 允许 | ❌ 禁止 |
|---|---|
| 原始标签（`html` / `body` / `a` / `*` / `h1-h6`） | 工具类（`.text-ellipsis` / `.clearfix`） |
| 应用级布局（`body` / `#root`） | 通用组件样式（`.auth-panel` / `.auth-title`） |
| UI 库覆盖（`.next-*` / `.ant-*`） | 任何业务相关 / 页面特定样式 |

---

## 📁 目录结构

```
src/styles/
├── index.scss      # 全局样式入口
└── iconfont.scss   # 图标字体（iconfont.cn）
```

只此 2 个文件。**不要**新增 `common.scss` / `theme.scss` / `utils.scss`。

---

## 📝 `index.scss` 职责

```scss
@import './iconfont';

// --- 全局重置 ---
html, body {
  min-width: 1200px;
  background: #f2f2f2;
  color: #333 !important;
  font-size: 13px !important;
  margin: 0;
  height: 100%;
}
body {
  padding-top: 61px;    // 顶部导航预留
  overflow-y: auto !important;
}
#root { min-height: 100%; }

a, a:hover, a:active, a:visited, a:focus { text-decoration: none; }
* { font-size: inherit; color: inherit; }

// --- UI 库覆盖 ---
.next-balloon-tooltip {
  background-color: #f2f3f7 !important;
  &::after { background-color: #f2f3f7 !important; }
}
.next-select { border: none !important; }
```

**扩写原则**：只加 `html` / `body` / `#root` / `.ant-*` / `.next-*` 级别的样式；业务相关的都放进组件自己的 scss。

---

## 🎨 `iconfont.scss` 职责

来自 iconfont.cn 的图标字体：`@font-face` 定义 + 基础 `.iconfont` 类 + Unicode 映射。

```tsx
<i className="iconfont iconhelp" />
<span className="iconfont icontrading-data">交易数据</span>
```

- 新增图标：更新字体 URL + 对应图标类
- 未使用的图标类应删除

---

## ✅ 常见误区修正

**误区 1**：「多个页面都要用省略号样式，抽个 `.text-ellipsis` 工具类吧」

→ ❌ 禁止。每个组件在自己 scss 里各写一份 `overflow: hidden; text-overflow: ellipsis; white-space: nowrap;` 即可（三行代码，复制成本 < 抽象成本）。

**误区 2**：「几个页面都有卡片样式，抽个 `.auth-panel` 吧」

→ ❌ 禁止。用 Antd `<Card>`，或各自 scss 写 BEM。

**误区 3**：「用 `@extend` 继承就不叫全局污染吧？」

→ ❌ 禁止。`@extend` 会编译成共享选择器，等同于定义全局类；直接写样式值。

---

## 📚 相关规范

- [`css-standards.md`](./css-standards.md) - BEM 命名 / 间距 / Modal / 第三方覆盖
- [`components.md`](../02-architecture/components.md) - 组件目录结构（每个组件一个 `index.scss`）
- [`pages.md`](../02-architecture/pages.md) - 页面 `padding: 28px 36px` + 容器 1128px
