---
description: '埋点规范 · PV / 自动埋点 / data-spm 命名 / Modal 按钮 / 条件渲染'
alwaysApply: false
---

# 埋点规范

> 双通道上报：**AEM**（阿里云监控）+ **Aplus**（黄金令箭）。
> 工具封装：`src/common/dot.ts`（旧代码可能从 `@/common/logger` 导入，兼容）。

---

## 📦 核心 API

| 导出 | 用途 |
|---|---|
| `setSpmABAndSendPV(spma, spmb)` | 设置页面 SPM + 上报 PV |
| `registerAutoDot('exp' \| 'clk' \| 'both')` | 注册自动曝光 / 点击埋点 |
| `dot(eventId, params?, gmKey?, syncAem?, syncAplus?)` | 手动埋点 |
| `stringify(params)` | 序列化 `data-params` 值 |

---

## 1️⃣ PV 上报（必须）

每个页面入口**都要**上报 PV，建议和自动埋点同一个 `useEffect`：

```typescript
import { setSpmABAndSendPV, registerAutoDot } from '@/common/dot';

useEffect(() => {
  setSpmABAndSendPV('a27gz', '40620953');  // spma, spmb
  const autoDot = registerAutoDot('both'); // 推荐 both
  autoDot.init();
  return () => autoDot.unmount();
}, []);
```

> 此 `useEffect` **只做埋点**，不要混业务逻辑。

---

## 2️⃣ 自动埋点 · `data-spm` / `data-params`

```tsx
import { stringify } from '@/common/dot';

<div data-spm="cert-manage-upload-btn">上传</div>
<div data-spm="vr-model-list-banner" data-params={stringify({ c1: 'a', c2: 'b' })} />
```

| 属性 | 必填 | 说明 |
|---|---|---|
| `data-spm` | ✅ | 事件唯一标识，**全局唯一** |
| `data-params` | ❌ | 自定义参数，键必须是 `c1` ~ `c10`，必须用 `stringify()` |

---

## 3️⃣ `data-spm` 命名规则

### 格式：`a` 或 `a_b`

- `a`：语义化标记串，`-` 连接的 2-4 个单词
- `b`：业务标识，用于区分同类中的不同实例
- `_` 连接 `a` 和 `b`

### 🔴 铁律：必须带前缀，保证全局唯一

| 场景 | 前缀 | 示例 |
|---|---|---|
| 页面级元素 | 页面名 | `cert-manage-upload-btn` / `showroom-list-card` |
| 页面级组件 | 页面-组件 或 组件名 | `cert-product-list-submit-btn` |
| 全局组件 | 组件名 | `message-success` / `error-tips-icon` |

```tsx
// ✅
<button data-spm="cert-manage-upload-btn">上传</button>
<a data-spm="cert-manage-view-more-link" href="/lessons">更多</a>

// ❌
<button data-spm="upload-btn">...</button>   // 无前缀，易冲突
<button data-spm="btn1">...</button>         // 无语义
<button data-spm="uploadCertBtn">...</button> // 必须 kebab-case
```

### 常用后缀

| 场景 | 后缀 |
|---|---|
| 按钮 | `-btn` |
| 链接 | `-link` |
| 卡片 | `-card` |
| 操作 | `-action` |
| 切换 | `-toggle` |
| 列表项 | `-item`（无限 id）或 `-item_${enum}`（枚举） |

---

## 4️⃣ 🔴 循环元素：看数据来源，不看字段名

### 判断

| 数据来源 | 可预知所有值？ | 做法 |
|---|---|---|
| 代码写死（const / enum / 固定数组） | ✅ | 放 `data-spm` 的 `b` 部分 |
| 接口返回（`useRequest` / API） | ❌ | 用基础 `data-spm` + `data-params` |

**关键**：字段名叫 `code` / `key` / `id` 不重要，**来源**才是判断依据。`MarketingScene.FindFactory`（枚举）和 `item.code`（API）都叫 code，但前者放 `data-spm`，后者必须放 `data-params`。

### ✅ 固定配置 → 进 `data-spm`

```tsx
const tabs = [{ key: 'overview' }, { key: 'detail' }, { key: 'history' }];

tabs.map(item => (
  <div data-spm={`page-name-tab_${item.key}`}>{item.label}</div>
));

// 枚举
Object.entries(sceneConfig).map(([scene]) => (
  <div data-spm={`marketing-scene-item_${scene}`} />
));

// 固定步骤 index
steps.map((step, index) => (
  <div data-spm={`guide-step_${index}`} />
));
```

### ✅ 接口数据 → 用 `data-params`

```tsx
const { data: certList } = useCertList(); // API

certList?.map(item => (
  <div
    data-spm="cert-manage-cert-item"
    data-params={stringify({ c1: item.certId, c2: item.certName })}
  >
    {item.certName}
  </div>
));
```

### ❌ 常见错误

```tsx
// ❌ 无限 ID 进 data-spm → 埋点 ID 爆炸
<div data-spm={`item_${item.productId}`} />
<div data-spm={`cert-item_${item.certId}`} />

// ❌ 接口 code 当固定配置用
<div data-spm={`equity-action_${item.code}`} /> // code 来自 API，开发时不知道有哪些
```

---

## 5️⃣ 特殊场景

### Balloon / Tooltip 内容要显式埋点

```tsx
// ✅ 用 span 包裹，添加 data-spm
<Balloon trigger={<IconHelp />}>
  <span data-spm="star-info-balloon-content">{tipText}</span>
</Balloon>

// ❌ 内容无埋点
<Balloon trigger={<IconHelp />}>{tipText}</Balloon>
```

### 条件渲染区块必须埋点

三元 / `&&` / 空状态切换都要能追踪展示了哪个分支：

```tsx
// ✅
{displayStatus === 1 && <div data-spm="star-pending-card"><PendingCard /></div>}
{displayStatus === 2 && <div data-spm="star-effective-card"><EffectiveCard /></div>}

{list.length > 0
  ? <div data-spm="star-list"><List /></div>
  : <div data-spm="star-empty"><Empty /></div>}

// ❌ 无法追踪展示分支
{displayStatus === 1 && <PendingCard />}
```

### onClick 有分支 → `data-params` 上报分支条件

```tsx
// ✅ 方案 A：上报分支条件
<Button
  onClick={() => status === 5 ? open('/a') : open('/b')}
  data-spm="star-detail-btn"
  data-params={stringify({ c1: status })}
/>

// ✅ 方案 B：拆成两个 data-spm（更好）
{status === 2
  ? <Button data-spm="star-simple-publish-btn">极简发品</Button>
  : <Button data-spm="star-open-btn" data-params={stringify({ c1: status })}>立即开启</Button>}

// ❌ 不知道用户走了哪个分支
<Button onClick={() => isVip ? openVip() : showDialog()} data-spm="action-btn" />
```

### 🔴 Modal 按钮必须埋点

所有 `Modal.info / success / error / warning / confirm` 的 OK / Cancel **必须**通过 `okButtonProps` / `cancelButtonProps` 带 `data-spm`：

```tsx
Modal.confirm({
  title: '确认删除',
  className: 'cert-manage__delete-confirm',
  okButtonProps: {
    'data-spm': 'cert-manage__delete-confirm-ok-btn',
  },
  cancelButtonProps: {
    'data-spm': 'cert-manage__delete-confirm-cancel-btn',
  },
  onOk: handleDelete,
});
```

**命名**：`{前缀}__{modal 描述}-{ok|cancel}-btn`（双下划线与 BEM Modal className 对齐）。

---

## 6️⃣ 手动埋点（`dot`）

适合在业务逻辑里主动触发：

```typescript
import { dot } from '@/common/dot';

dot('form_submit_success', { c1: formId, c2: userId }, 'CLK');
dot('api_error', { c1: apiUrl, c2: errorCode }, 'OTHER');
```

| 参数 | 必填 | 默认 | 说明 |
|---|---|---|---|
| `eventId` | ✅ | - | 事件唯一标识 |
| `params` | ❌ | - | `c1`-`c10` |
| `gmKey` | ❌ | `'OTHER'` | `'EXP'` / `'CLK'` / `'OTHER'` |
| `syncAem` | ❌ | `true` | 上报 AEM |
| `syncAplus` | ❌ | `true` | 上报 Aplus |

---

## ❌ 常见错误速查

| 错误 | 修复 |
|---|---|
| 无限 ID 放 `data-spm`（`item_${productId}`） | 基础 `data-spm` + `data-params` |
| 驼峰 / 无意义命名（`submitBtn` / `btn1`） | kebab-case + 语义化 + 前缀 |
| `data-params` 直接传对象 | 必须 `stringify()` |
| 条件渲染区块无埋点 | 包一层 `<div data-spm="xxx">` |
| Modal OK / Cancel 无埋点 | 通过 `okButtonProps` / `cancelButtonProps` |
| Balloon 内容无埋点 | `<span data-spm>` 包裹 |

---

## ✅ 提交前自检

- [ ] 页面有 PV 上报（`setSpmABAndSendPV`）
- [ ] 埋点初始化独立 `useEffect`，不混业务
- [ ] 所有卡片 / 模块 / 可点击元素有 `data-spm`
- [ ] `data-spm` 带前缀、kebab-case、全局唯一
- [ ] 循环元素：固定配置 → `data-spm`；接口数据 → `data-params`
- [ ] Balloon / Tooltip 内容 `<span data-spm>` 包裹
- [ ] 条件渲染区块加 `data-spm`
- [ ] onClick 分支逻辑通过 `data-params` 上报或拆多个 `data-spm`
- [ ] 🔴 Modal 的 OK / Cancel 均有 `data-spm`

---

## 🐛 调试

```javascript
// 开启埋点日志
localStorage.setItem('LOG_LEVEL', 'all');       // 所有日志
localStorage.setItem('LOG_LEVEL', '>=aplus');   // 只埋点
// 刷新生效

// 网络面板筛选 goldlog / aem，看 spm-cnt / c1 / c2
// 验证注入
console.log(window.goldlog);
document.querySelectorAll('[data-autolog]').length;
```

---

## 📚 相关规范

- [`pages.md`](../02-architecture/pages.md) - 页面初始化 `useEffect` 位置
- [`css-standards.md`](../03-styling/css-standards.md) - Modal `className` 命名（埋点命名对齐 BEM）
- 工具源码 `src/common/dot.ts`
