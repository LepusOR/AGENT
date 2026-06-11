---
description: 'window 变量管理 · 代理层 src/common/window.ts · 只放身份信息 · 业务数据走接口'
alwaysApply: false
---

# Window 变量管理规范

> **代理层**：`src/common/window.ts`。**禁止**业务代码直接访问 `window.xxx`。
> **背景**：VM 模板会把后端数据注入 `window._info_` / `window._auth_` / `window._PAGE_DATA_`，历史变量 40+，业务数据与身份信息混杂，需要收敛。

---

## 🎯 两条核心

1. **只在 window 放身份信息**；业务数据/页面数据一律走接口
2. **统一用代理函数**访问（`getMemberType()` 等），禁止直接 `window._info_?.xxx`

---

## ✅ 允许放 window 的数据

**特征**：跟身份走、所有页面一样、不随业务流程变。

- 用户身份（`memberId` / `aliId` / `userId`）
- 会员等级与标识（`memberType` / `isLeader` / `isDeep` / `isCGSStar` / `isGGS` / `isLeaderSupplier`）
- 权限基础位（`isAdmin`）
- 安全信息（`ctoken`）
- 技术工具（`__itrace` / `Goldlog`）

## ❌ 不允许放 window

**特征**：某页面才用、随业务变化、能从接口拿。

- 页面级数据（`list` / `renewApplyList` / `cavoInfo` / `providerInfo`）
- 业务状态（`authSuccess` / `infostatus`）
- 业务配置 / 开关（`internationalShow` / `enableFeedsContentService`）
- 页面级权限（`isAuthority`）

---

## 🧭 判断标准（三连问）

1. 跟身份强相关？
2. 所有页面都一样？
3. 不随业务流程变？

全部 ✅ → 可放 window；任一 ❌ → 走接口。

```typescript
// ✅ 合理
window._info_.memberType = 'deep2';
window._info_.isAdmin = 'true';

// ❌ 不合理 → 改接口
window._auth_.infostatus = 'pass';       // 认证状态
window._PAGE_DATA_.list = [...];          // 页面列表
```

---

## 📝 使用规范

### 1. 禁止直接访问 `window`

```typescript
// ❌
const memberType = window._info_?.memberType;
const list = window._PAGE_DATA_?.list;

// ✅ 身份类：走代理函数
import { getMemberType } from '@/common/window';
const memberType = getMemberType();

// ✅ 业务类：走接口
import { getPageList } from '@/services/xxx';
const { data: list } = await getPageList();
```

### 2. 永远处理 `undefined`

```typescript
// ✅ 默认值
const memberType = getMemberType() || 'gs';
const isAdmin = getIsAdmin() === 'true';

// ✅ 条件判断
if (getMemberType() === 'deep2') { /* ... */ }

// ❌ 裸调用属性 / 方法
const level = getMemberType().toLowerCase(); // 可能 undefined.xxx
```

### 3. 代理函数命名

```typescript
// ✅ 语义化
export function getMemberType() { /* ... */ }
export function getIsAdmin() { /* ... */ }

// ❌ 过宽泛
export function getType() { /* ... */ }
export function getData() { /* ... */ }
```

### 4. 只读，别改

```typescript
// ❌ 污染全局
window._info_.memberType = 'newValue';

// ❌ 组件里缓存，后续不同步
const cachedType = getMemberType();  // 全局常量另当别论，模块/组件级别禁止
```

---

## 🔧 新增 / 下线变量流程

### 新增

1. **判断**：身份信息 → ✅；业务数据 → ❌（改接口）
2. 在 `src/common/window.ts` 加代理函数 + 详细注释（类型 / 业务含义 / 使用场景）
3. 加埋点追踪使用情况（用于后续评估下线）
4. 季度 Review

### 下线（VM 业务数据迁移）

```
前端改接口获取 → 监控埋点确认无调用 → 通知后端删 VM 注入 → 前端清理代理函数
```

---

## 📦 VM 注入示例

```
src/vm/
  authcenter/authOverview.htm
  deep2/verifyMemberCenter.htm
  rightcenter/right/verifiedRightCenter.htm
```

```html
<script>
  // ✅ 合理：身份
  window._info_ = {
    memberType: '$!{memberType}',
    isAdmin: '$!{isAdmin}',
  };

  // ⚠️ 待改造：业务数据应改接口
  window._auth_ = {
    infostatus: '$!{infostatus}',
    data: '$!{data}',
  };
</script>
```

---

## ❌ 禁止速查

| 禁止 | 正解 |
|---|---|
| 直接 `window.xxx` | 代理函数 |
| 新增业务数据到 window | 改接口 |
| 假设变量一定存在 | 处理 undefined / 默认值 |
| 修改 window 变量 | 只读 |
| 组件/模块缓存 window 值 | 每次调用代理函数读 |

---

## ✅ 提交前自检

- [ ] 没有 `window._info_` / `window._auth_` / `window._PAGE_DATA_` 裸调用
- [ ] 访问身份信息走 `@/common/window` 代理函数
- [ ] 业务数据全部走接口（`@/services/**`）
- [ ] 所有代理函数返回值都处理 `undefined`
- [ ] 新增的代理函数名语义化（`getXxx`）并带注释

---

## 📚 相关规范

- [`services.md`](../02-architecture/services.md) - 接口管理
- [`pages.md`](../02-architecture/pages.md) - 页面数据获取
- 源码：`src/common/window.ts` / `src/vm/**`
