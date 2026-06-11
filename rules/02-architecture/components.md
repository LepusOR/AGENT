---
description: 'src/components 全局 / src/pages/xxx/components 页面级 · 命名 · 数据内聚 · 事件处理'
alwaysApply: false
---

# `src/components` & 页面级组件规范

> **关联规范**：导出方式 → [`exports.md`](../01-code-standards/exports.md)；类型定义 → [`interfaces.md`](../01-code-standards/interfaces.md)；BEM 样式 → [`css-standards.md`](../03-styling/css-standards.md)。

---

## 📌 两级组件架构

| 类型 | 位置 | 使用范围 | 特征 |
|---|---|---|---|
| **全局** | `src/components/` | 多页面共用 | 无业务逻辑 |
| **页面级** | `src/pages/<PageName>/components/` | 单页面 | 可含业务 |

- **严禁** `src/pages/components/`（归属不清）
- 页面级组件晋升：`src/pages/X/components/Foo/` → `src/components/Foo/`，然后全局替换导入路径（从 `../components/Foo` 改 `@/components/Foo`）

---

## 🎯 命名铁律

### 1. 目录用 PascalCase

```
✅ src/components/UserCard/  src/components/CertUploadDialog/
❌ src/components/user-card/  userCard/  user_card/
```

### 2. 组件名 2+ 单词，带业务前缀

```
✅ CertDialog  SubmitButton  DataTable  StatusBadge
❌ Card  List  Modal  Button   // 易与 Antd/Fusion 基础组件重名
```

### 3. 严禁与 UI 组件库同名

```
❌ Dialog / Button / Table / Message（与 @alifd/next / antd 冲突）
✅ CertDialog / SubmitButton / DataTable / SuccessMessage
```

**唯一例外**：包裹基础组件做全局替换（统一埋点 / 主题 / hack）：

```typescript
// src/components/Message/index.tsx
import { Message as NextMessage } from '@alifd/next';
const Message = {
  show: (content: string) => {
    dot({ eventId: 'message_show' });
    return NextMessage.show(content);
  },
};
export { Message };
```

---

## 📁 目录结构

### 全局组件

```
src/components/UserCard/
├── index.tsx        # 组件入口
├── index.scss       # BEM 样式
└── types.ts         # 可选：复杂组件单独类型文件
```

**带子组件**（仅一层嵌套，禁套娃）：

```
src/components/DataTable/
├── index.tsx
├── index.scss
├── components/
│   ├── TableHeader/index.tsx    # 仅 DataTable 内部使用
│   └── TableRow/index.tsx
└── types.ts

❌ src/components/DataTable/components/TableRow/components/  # 禁止二级嵌套
```

### 页面级组件

```
src/pages/DeepRights/
├── index.jsx          # 页面入口（空壳）
├── index.scss
├── config.ts
└── components/
    ├── DeepRightsPage/index.tsx   # 主组件（业务逻辑）
    ├── RightsList/index.tsx
    └── RightsCard/index.tsx
```

---

## 📦 组件基础模板

```typescript
// src/components/StatusBadge/index.tsx
import React from 'react';
import './index.scss';

export interface IStatusBadgeProps {
  status: 'success' | 'warning' | 'error';
  text: string;
}

/**
 * 状态徽章
 * @description 展示成功 / 警告 / 错误三种状态
 * @example <StatusBadge status="success" text="已通过" />
 */
export const StatusBadge: React.FC<IStatusBadgeProps> = ({ status, text }) => (
  <span className={`status-badge status-badge--${status}`}>{text}</span>
);
```

**铁律**：
- **具名导出**（不用 `export default`）：Tree Shaking / IDE 重构 / 引用追踪更友好
- **组件名 = 导出名**：禁止 `export { LabelGuide as AuthTag }` 这种无意义重命名
- **必有 JSDoc**：`@description` + `@example` 至少一项
- **Props 类型用 `I` 前缀**（`IStatusBadgeProps`），详见 [`interfaces.md`](../01-code-standards/interfaces.md)

### ⚠️ 导入 / 导出必须匹配

`named export ↔ { X }` / `default export ↔ X`。**不匹配会报 React Error #130，页面白屏且极难定位**。迁移代码时**禁用 sed 批量改导出**，必须逐个确认源文件。详见 [`exports.md`](../01-code-standards/exports.md) 与 [`change-principles.md`](../00-meta/change-principles.md#1-导入导出不匹配--react-error-130)。

---

## 🎬 事件处理函数命名

### 组件内部：`handle` 前缀 + 动词 + 名词

```typescript
// ✅ 推荐
const handleClick = () => {};
const handleShowImg = () => {};
const handleShowVideo = (url: string) => {};
const handleSwitchChange = (checked: boolean) => {};
const handleDeleteItem = (id: string) => {};

// ❌ 禁止
const imgShow = () => {};        // 动词在后
const showImg = () => {};        // 缺 handle 前缀
const onShowImg = () => {};      // on 只用于 props
const _handleShowImg = () => {}; // 下划线前缀
```

### 子组件 Props：`on` 前缀

```typescript
export interface IChildProps {
  onClick?: () => void;
  onClose?: () => void;
  onSubmit?: (values: any) => void;
}

// 父组件
<Child
  onClick={handleClick}       // props 用 on
  onSubmit={handleSubmit}
/>
```

**速查表**：

| 场景 | 内部 handler | 子组件 prop |
|---|---|---|
| 点击 | `handleClick` | `onClick` |
| 提交 | `handleSubmit` | `onSubmit` |
| 确认 | `handleConfirm` | `onConfirm` |
| 取消 | `handleCancel` | `onCancel` |
| 开关 | `handleSwitchChange` | `onChange` |
| 输入 | `handleInputChange` | `onChange` |
| 打开弹窗 | `handleOpenModal` | `onOpen` |
| 关闭弹窗 | `handleCloseModal` | `onClose` |
| 加载更多 | `handleLoadMore` | `onLoadMore` |

---

## 🧬 组件数据内聚原则（重要）

> **铁律**：谁使用数据，谁负责获取。组件能自己取的，**不要**通过 props 传。

### Hook 内聚

```typescript
// ❌ 父组件取，props 传递
const Parent = () => {
  const { data } = useSupplierIdentity();
  return <Child data={data} />;
};

// ✅ 子组件内部取（利用 useRequest cacheKey 天然去重）
const Child = () => {
  const { data } = useSupplierIdentity();
  return <div>{data.companyName}</div>;
};
```

### 全局函数内聚

全局可调函数（`getIsLeaderSupplier` / `getCookie` / `getUrlParam` / `getLoginId` 等）**不要**在父组件读完 props 传：

```typescript
// ❌ const isLeader = getIsLeaderSupplier(); return <Child isLeader={isLeader} />
// ✅ 组件内部直接 const isLeader = getIsLeaderSupplier();
```

### 判断矩阵

| 数据来源 | 父组件是否也用 | 多组件共享 | 内聚？ |
|---|---|---|---|
| Hook | 否 | 否 | ✅ 内部取 |
| Hook | 否 | 是 | ✅ 各自内部取（cacheKey 去重） |
| Hook | 是 | 是 | ❌ 父取并传 props |
| 全局函数 | 否 | - | ✅ 内部取 |
| 全局函数 | 是 | - | 🟡 父取并传，OK |

### 合理的 Props（不要内聚）

- **回调函数**：`onShow={() => setVisible(true)}`
- **配置/模式**：`mode="edit"` / `disabled={true}`
- **父组件也需要基于该数据做分支**的场景

---

## 🎨 样式规范（要点）

- 每个组件目录必有 `index.scss`，用 BEM（详见 [`css-standards.md`](../03-styling/css-standards.md)）
- Block 命名与目录对应：`UserCard/` → `.user-card`
- **组件内使用 Modal 时**：
  - 必须 `className: 'component-name__dialog'` + `closable: true`
  - Modal 样式在 scss 里**平级定义**（Modal 挂在 body 下，不在组件内）

```scss
.component-name {
  // 组件内样式
}

// ============== Modal（平级，非嵌套）==============
.component-name__dialog {
  width: 400px !important;
  .ant-modal-body { padding: 24px !important; }
}
```

---

## 🚚 引用规范

```typescript
// ✅ 全局组件：@ 别名
import { StatusBadge } from '@/components/StatusBadge';

// ✅ 页面级组件：相对路径
import { RightsList } from '../components/RightsList';

// ❌ 跨多级相对路径
import { StatusBadge } from '../../../components/StatusBadge';
```

**禁循环依赖**：A ⇄ B 共享逻辑 → 抽到 `shared.ts`，各自 `import { shared } from './shared'`。

---

## ✅ 创建新组件自检

- [ ] 分清全局 / 页面级，位置正确
- [ ] 目录 PascalCase，组件名 2+ 单词，不与 UI 库重名
- [ ] 具名导出（`export const X`），组件名 = 导出名
- [ ] 有 JSDoc（`@description` / `@example`）
- [ ] Props 类型带 `I` 前缀
- [ ] `index.scss` 用 BEM，Modal 样式平级定义
- [ ] 事件处理：内部 `handle*`，props `on*`
- [ ] 数据优先内聚（Hook / 全局函数内部调用）
- [ ] 引用用 `@/components/*`（全局）或相对路径（页面级）

---

## 📚 相关规范

- [`exports.md`](../01-code-standards/exports.md) - 具名导出 / React Error #130 防范
- [`interfaces.md`](../01-code-standards/interfaces.md) - Props 类型 `I` 前缀
- [`form.md`](./form.md) - Form 场景 `useCallback` / `useEffect` 陷阱
- [`hooks.md`](./hooks.md) - Hook 单一职责 / 兜底值
- [`pages.md`](./pages.md) - 页面级组件组织
- [`css-standards.md`](../03-styling/css-standards.md) - BEM / Modal / 第三方覆盖
- [`change-principles.md`](../00-meta/change-principles.md) - 改动铁律与高频陷阱
