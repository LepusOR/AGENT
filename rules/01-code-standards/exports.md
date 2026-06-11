---
description: '导出规范 · 禁 export default · 全部具名导出'
alwaysApply: false
---

# 导出（Export）规范

> 导入规范见 [`import.md`](./import.md)；命名规范见 [`naming.md`](./naming.md)。

---

## 🎯 核心原则

**禁止 `export default`，全部使用具名导出（Named Export）**。

### 为什么？

| 问题 | default | named |
| --- | --- | --- |
| IDE 引用统计 | ❌ 不准确 | ✅ 精确 |
| 重命名一致性 | ❌ 导入可任意起名 | ✅ 强制统一 |
| 全局重构 | ❌ 难以查找替换 | ✅ 一键重命名 |
| Tree Shaking | ⚠️ 部分打包器不友好 | ✅ 更友好 |

---

## ✅ 正确写法

### 函数 / Hook（camelCase，动词开头 / `use` 开头）

```typescript
export const getMemberId = () => getCookie('memberId');
export const formatDate = (date: Date) => { /* ... */ };

export const useAuth = () => { /* ... */ };
export const useCertList = () => { /* ... */ };
```

### 组件（PascalCase）

```tsx
export const UserCard = ({ user }: UserCardProps) => (
  <div className="user-card">{user.name}</div>
);

// 多组件同文件
export const UserCardHeader = ({ title }) => <h3>{title}</h3>;
export const UserCardBody = ({ children }) => <div>{children}</div>;
```

### 类型（PascalCase，API 类型加 `I` 前缀，详见 [`typescript.md`](./typescript.md)）

```typescript
export interface IGetCertListResponse { /* API 响应 */ }
export interface UserCardProps { /* 业务 / Props */ }
export type CertStatus = 'pending' | 'approved' | 'rejected';
```

### 常量（PascalCase；enum 优先，详见 [`constants.md`](../02-architecture/constants.md)）

```typescript
export enum CertStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
}

export const ApiBaseUrl = 'https://crmweb.alibaba.com';
export const CertStatusText: Record<CertStatus, string> = {
  [CertStatus.Pending]: '待审核',
  [CertStatus.Approved]: '已通过',
  [CertStatus.Rejected]: '已拒绝',
};
```

### API 服务（camelCase，动词开头；详见 [`services.md`](../02-architecture/services.md)）

```typescript
// src/services/cert.ts
export const getCertList = (data: IGetCertListRequest) =>
  request<IGetCertListResponse>(url, data, 'POST');

export const saveCert = (data: ISaveCertRequest) =>
  request<ISaveCertResponse>(url, data, 'POST');
```

---

## ❌ 禁止

### 1. `export default`

```typescript
// ❌
export default function getMemberId() { /* ... */ }
export default { getMemberId, getLocale };
const UserCard = () => <div />;
export default UserCard;

// ✅
export const getMemberId = () => { /* ... */ };
export const UserCard = () => <div />;
```

### 2. default + named 混用

```typescript
// ❌
export const getCookie = () => { /* ... */ };
export default getMemberId;
```

### 3. 创建 `index.ts` 做二次导出

```typescript
// ❌ src/common/index.ts
export { getMemberId } from './cookie';
export { dot } from './dot';

// ✅ 直接从源文件导入
import { getMemberId } from '@/common/cookie';
import { dot } from '@/common/dot';
```

---

## ⚠️ 允许 `export default` 的唯一例外

**`src/services/request.jsx`**（历史遗留，新代码不得新增）：

```typescript
function request(url, data, method) { /* ... */ }
export default request;
```

---

## ✅ 提交前自检

- [ ] 无 `export default`（除 `request.jsx`）
- [ ] 无 default + named 混用
- [ ] 无 `index.ts` 二次导出
- [ ] 函数 / Hook 名 = camelCase
- [ ] 组件名 = PascalCase（详见 [`components.md`](../02-architecture/components.md)）
- [ ] 常量名 = PascalCase；API 类型带 `I` 前缀

---

## 📚 相关规范

- [`import.md`](./import.md) - 导入规范
- [`naming.md`](./naming.md) - 命名规范
- [`typescript.md`](./typescript.md) - `I` 前缀 / 类型导出
- [`constants.md`](../02-architecture/constants.md) - 常量 / enum 导出
- [`services.md`](../02-architecture/services.md) - API 服务导出
- [`components.md`](../02-architecture/components.md) - 组件导出
