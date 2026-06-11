---
description: '页面开发规范 · Controller 模式 · 1128px 三层布局 · ErrorBoundary · 可见即可得'
alwaysApply: false
---

# 页面开发规范

> 只写**页面独有**规范。其余主题各有专项：
>
> - 组件拆分 / 数据内聚 → [`components.md`](./components.md)
> - Hooks / 并发缓存 → [`hooks.md`](./hooks.md)
> - 工具函数提取 → [`utils.md`](./utils.md)
> - 埋点 → [`tracking.md`](../04-cross-cutting/tracking.md)
> - 样式 / BEM → [`css-standards.md`](../03-styling/css-standards.md)
> - 改动通用护栏 → [`change-principles.md`](../00-meta/change-principles.md)

---

## 🔴 铁律

1. **函数组件**，禁 Class
2. **扁平路由**：所有页面平级放 `pages/`，不使用 HashRouter 二级路由
3. **Controller 模式**：`index.tsx` 只做数据获取 + 状态管理 + 组件拼接；业务逻辑进 `utils.ts` 或子组件
4. **必须** `renderWithErrorBoundary`
5. **埋点必填**：PV 上报 + 自动埋点；可交互元素带 `data-spm`
6. **统一布局**：`padding: 28px 36px` + `width: 1128px; margin: 0 auto`
7. **可见即可得**：UI 上几个 Tab 就拆几个独立组件，拒绝条件判断复用

---

## 📂 目录结构

```
pages/PageName/                  # PascalCase
├── index.tsx                    # 必须：Controller
├── index.scss                   # 必须：样式
├── utils.ts                     # 推荐：业务工具函数
├── types.ts                     # 可选：页面专用类型
├── config.ts                    # 可选：页面常量
└── components/                  # 页面级组件
    └── ComponentName/
        ├── index.tsx
        └── index.scss
```

**禁止**：
- `pages/PageName/container/`（统一用 `components/`）
- `pages/components/`（全局组件放 `src/components/`）
- `pages/**` 下有 `service.ts`（接口一律放 `src/services/**`）

---

## 📄 `index.tsx` 规范

### 1. 文件头注释（必填）

```typescript
/**
 * 证书管理列表页
 * 访问 path: /verified/cert/manage.htm
 * 访问参数:
 *   - conditions: 搜索条件（JSON 字符串）
 *   - page / pageSize
 * 链接案例: /verified/cert/manage.htm?page=1&pageSize=10
 */
```

### 2. 代码组织顺序

```typescript
import { buildSomeUrl } from './utils';  // utils 先导入

const PageName = () => {
  // 1. useState
  // 2. 自定义 Hooks（数据获取）
  // 3. 埋点初始化 useEffect（单独一个，与业务分离）
  // 4. 数据副作用 useEffect
  // 5. useCallback 事件处理
  // 6. useMemo 计算属性
  // 7. 提前返回（loading / error）
  // 8. return JSX
};

renderWithErrorBoundary(<PageName />, document.getElementById('app'));
```

### 3. 标准模板

```tsx
import { useEffect } from 'react';
import { setSpmABAndSendPV, registerAutoDot } from '@/common/dot';
import { renderWithErrorBoundary } from '@/components/ErrorBoundary';
import { useUserInfo } from '@/hooks/useUserInfo';
import { SomeCard } from './components/SomeCard';
import './index.scss';

const PageName = () => {
  const { data: userInfo, loading } = useUserInfo();

  useEffect(() => {
    setSpmABAndSendPV('a27gz', '40612187');
    const autoDot = registerAutoDot('both');
    autoDot.init();
    return () => autoDot.unmount();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="page-name" data-spm="page-name">
      <div className="page-name__container">
        <div className="page-name__title">页面标题</div>
        <SomeCard />
      </div>
    </div>
  );
};

renderWithErrorBoundary(<PageName />, document.getElementById('app'));
```

---

## 📐 布局（强制）

### 三层结构

```tsx
<div className="page-name" data-spm="page-name">       {/* Block：padding */}
  <div className="page-name__container">                 {/* Element：固定宽度 */}
    <div className="page-name__title">页面标题</div>     {/* Element：标题 */}
    {/* 内容 */}
  </div>
</div>
```

### 样式

```scss
.page-name {
  padding: 28px 36px;         // 强制

  &__container {
    width: 1128px;            // 强制：固定宽度，不用 max-width
    margin: 0 auto;           // 强制：居中
  }

  &__title {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 20px;
  }
}
```

### 参数

| 项 | 值 | 说明 |
|---|---|---|
| Layout 最小宽度 | 1200 | 全局 Layout 控制 |
| 页面 padding | `28px 36px` | 强制 |
| 容器宽度 | **1128**（= 1200 − 36×2） | 固定，**不用** `max-width` |
| 容器居中 | `margin: 0 auto` | 强制 |

**为什么固定 1128**：Layout 最小 1200，大屏下若容器自适应会导致子模块宽度不可控、对齐错乱。固定后右侧留空但内容对齐一致。

### 容器命名

`__container`（首选）/ `__main-body` / `__section` / `__box`

---

## 🎯 可见即可得

**UI 上几个 Tab → 代码几个独立组件**；接受代码冗余，拒绝条件判断复用。

```tsx
// ❌ 伪复用：共享状态 + 满屏条件判断
const [listData, setListData] = useState([]);
const [picListData, setPicListData] = useState([]);
const [tabKey, setTabKey] = useState('brand');

const showDetail = id => {
  const detail = (tabKey === 'brand' ? listData : picListData).find(/* ... */);
};
const submitFunc = { brand: confirmDialogShow, picture: confirmImgDialogShow };

// ✅ 独立组件：主文件只管 Tab 切换
<Tabs onChange={setTabKey} activeKey={tabKey}>
  <Tab key="brand"><BrandProtectionTab /></Tab>
  <Tab key="picture"><OriginalPictureProtectionTab /></Tab>
</Tabs>
```

**接受冗余的场景**：不同业务逻辑 / 不同数据结构 / 不同交互流程
**不接受**：纯 UI 可参数化的组件、完全相同的业务逻辑（提 Hook）、工具函数（提 utils）、常量

---

## ✅ 错误处理

| 错误 | 谁捕获 | 处理 |
|---|---|---|
| React 组件错误 | ErrorBoundary（自动） | 降级 UI + 上报 itrace / AEM |
| 全局 JS 错误 | `window.onerror`（自动） | 上报，不中断 |
| Promise 未处理 | `unhandledrejection`（自动） | 上报，不中断 |
| **业务错误** | **try-catch + Message** | **必须手动处理** |

```typescript
const handleSubmit = async () => {
  try {
    await submitForm();
    Message.success('提交成功');
  } catch (error) {
    Message.error('提交失败，请稍后重试');
  }
};

renderWithErrorBoundary(<PageName />, document.getElementById('app'));
```

---

## 📊 数据获取 & 业务逻辑

- **数据**：优先自定义 Hook（`useXxx`）。`useRequest` 自带**并发缓存**：多个组件同时调同一个 Hook 只发一次请求，**不用**父组件取完再 props 下发。详见 [`hooks.md`](./hooks.md)。
- **业务逻辑**：`index.tsx` 只做渲染编排；URL 拼接 / 数据格式化 / 复杂计算进 `pages/<X>/utils.ts`。详见 [`utils.md`](./utils.md)。

```tsx
const PageName = () => {
  const { data, loading, error } = useUserInfo();
  const { data: certList } = useCertList();

  if (loading) return <Loading />;
  if (error) return <ErrorPage />;
  return <Content data={data} certList={certList} />;
};
```

---

## ✔️ 提交前自检

**结构**
- [ ] 页面目录 PascalCase
- [ ] 用 `renderWithErrorBoundary` 渲染
- [ ] 函数组件，无 Class
- [ ] `pages/**` 下无 `service.ts`

**布局**
- [ ] 根元素 `padding: 28px 36px`
- [ ] 主容器 `width: 1128px; margin: 0 auto`（不用 `max-width`）
- [ ] 三层结构齐全：`.page-name` / `__container` / `__title`
- [ ] 大屏下内容不变宽

**埋点**（详见 tracking.md）
- [ ] PV 上报 `setSpmABAndSendPV`
- [ ] 自动埋点 `registerAutoDot('both')` + unmount 清理
- [ ] 可交互元素有语义化 `data-spm`
- [ ] 埋点初始化独立 `useEffect`

**代码质量**
- [ ] 复杂业务逻辑已进 `utils.ts`
- [ ] 数据获取用 Hook，不手动 fetch
- [ ] 业务错误 try-catch + `Message`
- [ ] 无 lint 错误

---

## 🔗 相关规范

- [`components.md`](./components.md) - 组件开发
- [`hooks.md`](./hooks.md) - Hooks + 并发缓存
- [`services.md`](./services.md) - 接口管理
- [`utils.md`](./utils.md) - 工具函数
- [`change-principles.md`](../00-meta/change-principles.md) - 改动通用护栏
- [`tracking.md`](../04-cross-cutting/tracking.md) - 埋点
- [`css-standards.md`](../03-styling/css-standards.md) - BEM + 布局细节
