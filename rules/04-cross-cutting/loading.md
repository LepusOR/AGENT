---
description: 'Loading 与 Skeleton 使用规范 · 避免 CLS · 禁 Skeleton.Image · 显式 height'
alwaysApply: false
---

# Loading vs Skeleton 规范

> **核心目标**：避免 CLS（Cumulative Layout Shift），提升首屏体验。
> 本文只管"**什么时候用哪个 + 如何避免抖动**"；具体重构步骤见对应 command。

---

## 🎯 场景对照

| 场景 | 组件 | 说明 |
|---|---|---|
| 首屏加载、Tab 首切换、列表 / 卡片首次获数 | **Skeleton** | 预占空间，避免 CLS |
| 表单提交、保存、删除等**用户主动操作**的等待 | **Spin**（`<Button loading>` / `<Spin spinning>`） | 阻重复提交 / 局部反馈 |
| Antd Table 数据加载 | `<Table loading={loading}>` 内置 | 不用外包 Spin |

### 主动操作示例

```tsx
const [submitting, setSubmitting] = useState(false);

const handleSubmit = async () => {
  setSubmitting(true);
  try { await submitForm(); message.success('保存成功'); }
  finally { setSubmitting(false); }
};

<Button loading={submitting} onClick={handleSubmit}>保存</Button>
```

### 首屏 / 数据加载示例

```tsx
const { data, loading } = useRequest(fetchData);

{loading
  ? <Skeleton active paragraph={{ rows: 5 }} style={{ height: 400 }} />
  : <Content data={data} />}
```

---

## 📐 4 条 CLS 黄金法则

### 法则 1：骨架屏高度 = 空状态高度

**核心**：区块可能展示空状态时，骨架屏**高度**必须与空状态一致，避免 `Loading → 空状态` 的抖动。

```tsx
const EMPTY_STATE_HEIGHT = 200;

{loading ? (
  <div style={{ minHeight: EMPTY_STATE_HEIGHT }}>
    <Skeleton active paragraph={{ rows: 3 }} />
  </div>
) : data.length > 0 ? (
  <ContentList data={data} />     // 有数据：高度可变，用户有预期
) : (
  <NoFound desc="暂无数据" style={{ height: EMPTY_STATE_HEIGHT }} />
)}
```

> `Loading → 有数据` 允许高度变化（用户看到内容出现有预期）；**`Loading → 空状态` 的高度抖动必须消除**。

### 法则 2：容器用 `min-height` 防塌陷

```tsx
// ✅
<div style={{ minHeight: 400 }}>
  {loading ? <Skeleton active paragraph={{ rows: 5 }} /> : <Content />}
</div>

// ❌ loading 时容器可能塌陷
<div>{loading ? <Skeleton /> : <Content />}</div>
```

### 法则 3：固定容器宽度

```tsx
// ✅
<Card style={{ width: '100%', minHeight: 300 }}>
  {loading ? <Skeleton active /> : <Content />}
</Card>

// ❌ inline-block / 自适应宽度，内容加载后横向抖动
<div style={{ display: 'inline-block' }}>{loading ? <Skeleton /> : <Content />}</div>
```

### 法则 4：禁全屏 Spin 遮罩

```tsx
// ❌
<Spin spinning={loading} size="large">
  <div style={{ minHeight: '100vh' }}><Content /></div>
</Spin>

// ✅ 首屏用 Skeleton 占位
<div>
  <Header />
  {loading
    ? <div style={{ minHeight: 600 }}><Skeleton active paragraph={{ rows: 8 }} /></div>
    : <Content />}
</div>
```

---

## 🔧 4 条核心原则

### 原则 1：优先 Skeleton

Spin 是覆盖层，数据到来时会"突然出现" → CLS 明显；Skeleton 预占空间，内容平滑过渡。

### 原则 2：禁用 `<Skeleton.Image />`

实现复杂、渲染性能差、样式难控。替代：

| 场景 | 替代 | 写法 |
|---|---|---|
| 大矩形（图片位） | `Skeleton.Input` | `<Skeleton.Input active block style={{ height: 200, borderRadius: 4 }} />` |
| 小方形图标 | `Skeleton.Avatar` | `<Skeleton.Avatar active shape="square" size={60} />` |

### 原则 3：显式 `height`，不要只靠 `rows`

`rows` 约每行 40px，经常低估真实高度 → loading → 内容时仍有 CLS。

```tsx
// ❌ 约 240px，通常偏小
<Skeleton active paragraph={{ rows: 6 }} />

// ✅ 显式 height
<Skeleton active paragraph={{ rows: 6 }} style={{ height: 400 }} />
<Skeleton active style={{ height: 400 }} />
```

**确定高度**：
1. 首选：DevTools 测量真实内容 `height`
2. 备选参考：

| 组件类型 | 建议高度 |
|---|---|
| 简单卡片（标题 + 几行文本） | 200–300 |
| 表单 / 中型列表 | 400–500 |
| 图表 / 富内容 | 500–800 |
| 全屏内容 | 800+ |

### 原则 4：用 BEM 类名，不手写内联卡片样式

```tsx
// ❌ 手复制一份内联样式，和真实组件易不一致
<div style={{ background: '#fff', borderRadius: 8, padding: '20px 24px' }}>
  <Skeleton active />
</div>

// ✅ 导入子组件 scss，用 BEM
import './components/GlobalSiteComplianceCert/index.scss';
<div className="global-site-compliance-cert">
  <div className="global-site-compliance-cert__container">
    <Skeleton active style={{ height: 400 }} />
  </div>
</div>
```

---

## 📊 动态高度策略

| 优先级 | 策略 | 场景 |
|---|---|---|
| 1 | **基于空状态高度** | 有空状态的模块（列表、卡片） |
| 2 | **基于设计稿固定高度** | 结构确定的卡片（统计、概览） |
| 3 | **基于数据结构预估**（`items.length * itemHeight`） | 列表类，数据量已知 |

```tsx
// 策略 3 示例
const estimatedHeight = useMemo(() => {
  if (loading) return 400;       // 预估
  return data.length * 80;       // 实际
}, [loading, data]);

{loading
  ? <div style={{ minHeight: estimatedHeight }}><Skeleton active paragraph={{ rows: 5 }} /></div>
  : <List data={data} />}
```

### Skeleton 行数速查

| 内容 | `rows` | 高度约 |
|---|---|---|
| 单行标题 | 1 | 40px |
| 普通卡片 | 3–4 | 150–200 |
| 列表 / 表格 | 5–8 | 250–400 |
| 详情页 | 10–15 | 500–750 |
| **空状态占位** | 固定 height | 200（与 NoFound 一致） |

---

## ❌ 常见错误

| 错误 | 症状 | 修复 |
|---|---|---|
| 全屏 Spin 遮罩 | 内容突现，CLS 明显 | Skeleton + minHeight |
| 骨架屏 400 vs 空状态 200 | `Loading → 空状态` 抖 200px | 两边用同一 `HEIGHT` 常量 |
| 只用 `rows` 控制高度 | 加载完内容高度突变 | 显式 `style={{ height }}` |
| `Skeleton.Image` | 渲染卡顿 | `Skeleton.Input` / `Skeleton.Avatar` |
| 首屏用 `<Spin>` 遮住内容 | CLS 0.35+ | `{loading ? <Skeleton /> : <Content />}` |
| inline-block 容器 | 横向抖动 | 固定宽度 / `width: 100%` |

---

## ✅ 提交前自检

**Loading（Spin）使用**
- [ ] 只用于用户主动操作后的等待
- [ ] 不用于首屏 / Tab 首切换
- [ ] 不做全屏遮罩

**Skeleton 使用**
- [ ] 首屏 / 列表 / 卡片的数据加载都用 Skeleton
- [ ] 有空状态时，骨架屏 `height` = 空状态 `height`
- [ ] 容器有 `minHeight`，防塌陷
- [ ] **显式** `style={{ height }}`，不只靠 `rows`
- [ ] 不使用 `Skeleton.Image`
- [ ] 用 BEM 类名（导入子组件 scss），不手写内联卡片样式

**验证**
- [ ] DevTools Performance CLS < 0.1（Good）
- [ ] `Loading → 空状态` 视觉无跳动
- [ ] 横向无抖动

---

## 📚 相关规范

- [`css-standards.md`](../03-styling/css-standards.md) - BEM / Modal
- [`crated-antd.md`](../03-styling/crated-antd.md) - `Spin` / `Skeleton` API
- [`pages.md`](../02-architecture/pages.md) - 页面容器宽度
