---
description: 'CSS/SCSS 规范 · BEM 命名 · 间距 · 布局组件 · Modal · 反全局污染'
alwaysApply: false
---

# CSS / SCSS 规范

> **核心目标**：消灭全局样式污染，每个组件的样式完全自包含。
> **关联**：`src/styles/**` 职责见 [`styles.md`](./styles.md)；页面 padding / 容器宽度见 [`pages.md`](../02-architecture/pages.md)。

---

## 🎯 核心原则

1. **BEM 命名**（`block__element--modifier`）、**全局唯一**，禁通用类名（`.title` / `.modal` / `.card`）
2. **所见即所得**：SCSS 直接写具体值，禁 `$variable` / `@mixin` / `@extend`
3. **样式值可以相同**：多处 title 都是 `font-size: 16px` 没问题；**但类名必须各自独立**
4. **不覆盖全局**：不在页面 scss 里写 `body` / `*` / `a`（这些归 `src/styles/index.scss`）
5. **BEM 类名必须加注释**（`/* 完整类名 */`），否则浏览器 DevTools 看到的类名在代码里搜不到

---

## 📋 命名规则

### Block（根元素）

- 使用 `kebab-case`，与组件目录 PascalCase 对应（`UserCard/` → `.user-card`）
- **全局唯一**：至少 2-3 个词组合，带业务场景含义

```
✅ .cert-upload-dialog   .auth-progress-stepper   .supplier-jbp-form
❌ .dialog   .modal   .form   .card   .list   .title
```

### Element（`__`）+ Modifier（`--`）

```scss
// UserCard/index.scss
.user-card {
  padding: 16px;

  /* user-card__avatar */
  &__avatar {
    width: 48px;

    /* user-card__avatar--large */
    &--large { width: 64px; }
  }

  /* user-card--featured */
  &--featured { border: 2px solid #ff6a00; }
}
```

```tsx
// Modifier 必须和 Element 一起用，不可单独写
<div className="user-card user-card--featured">
  <div className="user-card__avatar user-card__avatar--large" />
</div>
```

### Button 后缀规则

- `type="link"` → 用 `-link` 后缀
- `type="primary"` / `"default"` 等 → 用 `-btn`（统一 `-btn`，不用 `-button`）

```tsx
<Button type="link" className="user-card__detail-link">查看</Button>
<Button type="primary" className="user-card__submit-btn">提交</Button>
```

### 常用 Modifier 词典

| 类别 | 词 |
|---|---|
| 状态 | `--active` / `--disabled` / `--loading` / `--error` / `--success` / `--warning` |
| 尺寸 | `--small` / `--medium` / `--large` |
| 变体 | `--primary` / `--secondary` / `--featured` / `--bordered` |
| 布局 | `--horizontal` / `--vertical` / `--inline` / `--block` |

---

## 🎯 选择器简洁原则

优先用纯类选择器，**不要** `element&__class`：

```scss
// ✅ 推荐
.page-name {
  &__trigger { font-size: 12px; }
}

// ❌ 避免（除非必须覆盖 `<a>` 默认样式等高优先级场景）
.page-name {
  button&__trigger { ... }
}
```

**例外**：`<a>` 默认色 / 光标优先级高，禁用态需要 `color !important` + `pointer-events: none` + `cursor: not-allowed`，且 Modifier 应作为**独立顶级选择器**而非嵌套：

```scss
.page-name {
  &__action { margin-right: 26px; }
}

// 独立出来，优先级更可控
.page-name__action--disabled {
  color: #ccc !important;
  cursor: not-allowed;
  pointer-events: none;
  text-decoration: none;
}
```

---

## 📏 间距规范

所有 `margin` / `padding` / `gap` **必须**取下列规范值，禁止 15px / 18px / 22px 等非规范值。

| 值 | 用途 |
|---|---|
| **2px** | 正文与图标间距 |
| **4px** | 标题与图标间距 |
| **8px** | 组件内小元素（图标/徽章/小按钮） |
| **12px** | 表单项之间 / 标签之间 |
| **16px** | 区块 / 段落之间 / 表单区块 |
| **20px** | 卡片之间（垂直/水平） / 筛选区↔表格 |
| **24px** | 卡片内 padding / 表格↔分页 |
| **36px** | 页面↔卡片 / 大型区块 |

**场景速查**：

| 场景 | 间距 |
|---|---|
| 正文 + Icon | 2px |
| 标题 + Icon | 4px |
| Button 内部 | 8px（Antd 自动） |
| 表单项 `<Form.Item>` marginBottom | 12px |
| 卡片之间 | 20px |
| 卡片内 padding | 24px（Card 默认） |

---

## 🎯 布局组件（Card / Container）

**铁律**：原生 `<div>` 不得手写 `background: #fff` + `border-radius: 8px` + `padding: 24px` + `box-shadow`，全部用 Antd `Card`。

### Card 决策树

```
是功能组件（PageHeader / Bulletin / Table）？ → ❌ 不包 Card，直接用
是容器 div？
  ├─ scss 中有卡片样式（bg/radius/padding/shadow）→ ✅ 换成 <Card>，删原 scss
  └─ 无特殊样式 → ❌ 保持 <div>
```

```tsx
import { Card, Button } from 'antd';
import { CardTitle, CardHeading, Container } from '@alife/crated-antd';

<Card
  title={<CardTitle title="标题" tooltip="提示" />}
  extra={<Button type="primary">操作</Button>}
>
  <CardHeading style={{ marginBottom: 12 }}>分组 1</CardHeading>
  {/* ... */}
</Card>
```

### Container

- `size="large"` 1366 / `"medium"` 1128 / `"small"` 936（默认 large）
- 禁止用 `<div style={{ maxWidth, margin: '0 auto' }}>` 手写

```tsx
<Container size="large">
  <PageHeader title="页面" style={{ marginBottom: 16 }} />
  <Bulletin items={[...]} style={{ marginBottom: 16 }} />
  <Card>
    <Table dataSource={[...]} />
  </Card>
</Container>
```

---

## 🔧 SCSS 六条铁律

### 1. 嵌套不超过 3 层

```scss
// ❌ &__header → &__title → &__icon
// ✅ &__header-title-icon（扁平 + 连字符）
```

### 2. Modifier 附加在 Element 上，禁止单独用

```tsx
// ❌ <button className="user-card__btn--primary">
// ✅ <button className="user-card__btn user-card__btn--primary">
```

### 3. 禁跨 Block 引用

```scss
// ❌ .user-card { .cert-card__title { ... } }
// ✅ 组件组合，各自管各自的样式
```

### 4. 用 `&` 简化嵌套（见 Block 章节示例）

### 5. **BEM 类名必须加注释**

```scss
.verified-scene-show-module {
  /* verified-scene-show-module-title */
  &-title { font-size: 18px; }

  /* verified-scene-show-module__more-link */
  &__more-link {
    /* verified-scene-show-module__more-link-icon */
    &-icon { font-size: 12px; }
  }
}
```

**理由**：`&-xxx` / `&__xxx` 嵌套后，浏览器 DevTools 看到的是完整类名（如 `verified-scene-show-module-footer-btn`），但代码里搜不到。注释 = 搜索锚点。

**自动化**：

```bash
npm run classname-comment           # 全量补注释
npm run classname-comment -- --dry-run    # 预览
```

### 6. 所有样式值直接写入

```scss
// ❌ $spacing-md / @include text-ellipsis
// ✅ padding: 16px;  overflow: hidden; text-overflow: ellipsis;
```

---

## 🚨 全局样式污染（必防）

### 反例

```tsx
// ❌ 使用通用类名
<div className="media-manage">
  <span className="title">标题</span>   {/* 被 Antd .title { margin-bottom: 24px } 污染 */}
</div>
```

```scss
// ❌ 被迫用 !important 覆盖被污染的 margin
.media-manage {
  .title {
    margin-bottom: 0 !important;
  }
}
```

### 正例

```tsx
<div className="verified-media-manage">
  <span className="verified-media-manage__title">标题</span>
</div>
```

```scss
.verified-media-manage {
  /* verified-media-manage__title */
  &__title {
    font-size: 16px;
    margin: 0;          // 无需 !important
  }
}
```

**记住**：
- ✅ 样式值可以重复（多处 title 都 `font-size: 16px` OK）
- ❌ 类名不可通用（每个组件必须带自己的 Block 前缀）
- ⚠️ 重构改类名**不动样式值**，否则视觉会变

---

## 🎨 覆盖第三方组件（Antd / Fusion）

**本项目不用 CSS Modules，不要写 `:global()`**，直接嵌套即可。

```scss
// ✅ 正确
.page-name {
  &__container {
    .ant-divider-horizontal {
      margin: 16px 0 !important;
    }
    .ant-tabs-nav {
      margin-bottom: 0 !important;
    }
  }
}

// ❌ 错误：:global() 在本项目不生效
.page-name {
  &__container {
    :global(.ant-divider-horizontal) { ... }
  }
}
```

---

## ⚠️ Modal 规范（极易踩坑）

### 1. 必须显式设置 `closable: true`

`Modal.info / success / error / warning` 设了 `icon: null` / `footer: null` 时，默认可能不显示关闭按钮，**用户关不掉弹窗**：

```typescript
Modal.info({
  width: 800,
  content: <VideoPlayer src={url} />,
  footer: null,
  icon: null,
  closable: true,       // ✅ 必须显式设
  maskClosable: true,
});
```

### 2. 必须指定 `className`，且样式**平级定义**

Modal 挂载在 `<body>` 下、不在页面 DOM 树内，页面 Block 嵌套对它无效：

```typescript
// TSX
Modal.confirm({
  className: 'auth-card-capability__dialog',   // 必须
  content: (
    <div className="auth-card-capability__dialog-content">
      <div className="auth-card-capability__dialog-tip">...</div>
    </div>
  ),
  centered: true,
  onOk: handleSave,
});
```

```scss
// SCSS：Modal 样式必须和页面 Block 平级，不能嵌套在内！
.auth-card-capability {
  padding: 28px 36px;
  // 页面内样式...
}

// ============== Modal 样式（平级，body 下，需 !important 覆盖 Antd 默认）==============
.auth-card-capability__dialog {
  width: 480px !important;

  .ant-modal-body {
    padding: 24px !important;
  }
}

.auth-card-capability__dialog-content { line-height: 22px; }
.auth-card-capability__dialog-tip     { color: #666; margin-bottom: 16px; }
```

**className 命名**：`{page}__{dialog-purpose}`，如 `cert-manage__delete-confirm`、`capacity-video__player-modal`。

---

## ✅ 提交前自检

- [ ] 所有类名带 Block 前缀（全局唯一），无 `.title` / `.modal` 等通用名
- [ ] 所有 `margin` / `padding` / `gap` 值在规范表内
- [ ] 嵌套不超过 3 层
- [ ] 所有 `&-xxx` / `&__xxx` 都有 `/* 完整类名 */` 注释（或跑 `npm run classname-comment`）
- [ ] 无 `$variable` / `@mixin` / `@extend` / `:global()`
- [ ] 所有 `Modal` 有 `closable: true` + `className`，Modal 样式平级定义
- [ ] 手写卡片样式的 `<div>` 已换成 `<Card>`
- [ ] 页面外层用 `<Container>`，不用手写 max-width / margin auto

---

## 📚 相关规范

- [`styles.md`](./styles.md) - `src/styles/**` 全局样式组织
- [`pages.md`](../02-architecture/pages.md) - 页面 padding 28px 36px / 容器 1128px
- [`crated-antd.md`](./crated-antd.md) - Antd 组件映射
- [`components.md`](../02-architecture/components.md) - 组件目录结构
