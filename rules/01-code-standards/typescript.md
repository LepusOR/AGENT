---
description: 'TypeScript 规范 · any 使用边界 · 全局类型 · I 前缀适用范围'
alwaysApply: false
---

# TypeScript 开发规范

> 项目处于**渐进式类型化**阶段：允许部分 `any`，但核心类型必须用。
> API 接口类型的详细规则见 [`interfaces.md`](./interfaces.md)，本文件不重复。

---

## 🎯 核心原则

1. **容忍 `any`**：传递性代码暂时允许 `any`，标注 `// TODO: type`
2. **优先用全局类型**：`src/types.ts` / `src/constants/` 里的类型**必须**用，不得用 `any` 覆盖
3. **`I` 前缀区分接口 vs 业务**：API 数据类型带 `I` 前缀；业务模型 / Props 不带
4. **类型自包含**：Hook / Service 各自定义各自的 API 类型，不跨文件引用
5. **渐进治理**：后续统一收敛 `any`

---

## ✅ 允许 `any` 的场景

1. **传递性函数参数 / 返回值**（标 TODO）
   ```typescript
   function handleData(data: any) { /* TODO: type */ }
   function fetchData(): Promise<any> { /* TODO: type */ }
   ```
2. **暂未明确的组件 Props**
   ```typescript
   interface IComponentProps {
     config?: any;  // TODO: type
     data?: any;    // TODO: type
   }
   ```
3. **第三方库类型缺失**
   ```typescript
   function handle(config: any) { /* 外部库类型不全 */ }
   ```

---

## ❌ 禁止 `any` 的场景

### 1. 全局类型已定义

```typescript
// ❌
function getUserInfo(): any { ... }

// ✅
import { MemberInfo } from '@/types';
function getUserInfo(): MemberInfo { ... }
```

### 2. Constants 已定义枚举

```typescript
// ❌
const status: any = 1;

// ✅
import { CertStatus } from '@/constants';
const status: CertStatus = CertStatus.Approved;
```

### 3. 显而易见的基础类型

```typescript
// ❌ const name: any = 'John';
// ✅ const name: string = 'John';  // 或让 TS 推断
```

---

## 📂 全局类型管理

### `src/types.ts` — 项目级业务类型

存放跨页面复用的**业务实体**（不带 `I` 前缀）：

```typescript
// src/types.ts
export interface MemberInfo {
  memberId: string;
  memberName: string;
  companyName: string;
  locale: string;
}

// 使用
import { MemberInfo } from '@/types';
function getUserInfo(): MemberInfo { ... }
```

### `src/constants/` — 枚举与常量

```typescript
// src/constants/status.ts
export enum CertStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
}

export const STATUS_TEXT = {
  [CertStatus.Pending]: '待审核',
  [CertStatus.Approved]: '已通过',
  [CertStatus.Rejected]: '已拒绝',
} as const;
```

---

## 📝 类型定义规范

### Interface vs Type

**优先 `interface`**；联合 / 交叉 / 原始类型别名用 `type`：

```typescript
// ✅ interface（对象类型）
export interface UserInfo { id: string; name: string; }

// ✅ type（联合 / 交叉 / 别名）
export type Status = 'pending' | 'approved' | 'rejected';
export type UserWithRole = UserInfo & { role: string };
```

### 命名：PascalCase

```typescript
// ✅ MemberInfo  CertStatus  UserRole
// ❌ memberinfo  certstatus
```

### 导出

类型定义要被外部用时**必须导出**：

```typescript
// ✅
export interface MemberInfo { ... }

// ❌ interface MemberInfo { ... }  // 无 export 无法复用
```

---

## 🔤 `I` 前缀适用范围（核心）

**接口类型（网络传输数据）带 `I` 前缀；业务领域模型不带**。

| 类型 | `I` 前缀 | 示例 |
|---|---|---|
| API 响应数据 | ✅ | `ICoreRightsData` |
| API 请求参数 | ✅ | `IUserQueryParams` |
| API 列表项 | ✅ | `ICanBindCertListItem` |
| 业务实体 | ❌ | `User` / `Order` / `CoreRights` |
| 组件 Props | ❌ | `UserCardProps` |
| 配置对象 | ❌ | `AppConfig` |

### 为什么区分？

接口类型是**传输形式**、一次性、结构随后端变；业务类型是**领域模型**、长期稳定、含行为。

```typescript
// ✅ API 响应
export interface ICoreRightsData {
  rfqOpportunity: { rightName: string; currentCnt: number };
}

// ✅ 业务领域模型（无前缀）
export class CoreRights {
  constructor(data: ICoreRightsData) { ... }
  hasRfqQuota(): boolean { ... }
}

// ✅ Props（无前缀）
export interface UserCardProps {
  user: User;
  onEdit?: (id: string) => void;
}
```

### 常见错

```typescript
// ❌ 业务类加 I 前缀
export class IUser { ... }

// ❌ Props 加 I 前缀
export interface IUserCardProps { ... }

// ❌ API 响应不加 I 前缀
export interface CoreRightsData { ... }
```

> API 类型的**只定义一个 / 内联嵌套 / 自包含**规则详见 [`interfaces.md`](./interfaces.md)，本文件不重复。

---

## 🎨 组件类型

### Props

```typescript
export interface UserCardProps {
  user: MemberInfo;
  onEdit?: (id: string) => void;
  className?: string;
}

export const UserCard: React.FC<UserCardProps> = ({ user, onEdit }) => { ... };
```

### 事件处理

```typescript
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => { ... };
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => { ... };
```

### 数据展示 vs 业务组件

```typescript
// 数据展示：直接拿接口数据
interface RightCardProps {
  data: ICoreRightsData;
  loading: boolean;
}

// 业务组件：用领域模型
interface RightCardProps {
  rights: CoreRights;
  onAction?: () => void;
}
```

---

## 📚 常用范式

```typescript
// RequestResponse 包装（src/common/request.ts）
export interface RequestResponse<T = any> {
  hasError: boolean;
  message: string;
  errors?: { code: string; msg: string }[];
  content?: T;
}

// Service
export interface ICoreRightsData { rfqOpportunity: { rightName: string; currentCnt: number } }
export const getCoreRights = (): Promise<RequestResponse<ICoreRightsData>> =>
  request('https://.../coreRights.json');

// Hook
export const useCoreRights = () =>
  useRequest<ICoreRightsData>(getCoreRights, { cacheKey: 'core_rights' });
```

---

## 🚫 禁止做法速查

| 禁止 | 正解 |
|---|---|
| 滥用 `any`（已有类型定义） | 用 `src/types.ts` / `src/constants/` |
| 类型不导出 | 必须 `export` |
| camelCase 类型名 | PascalCase |
| 多处重复定义同业务类型 | 统一 `src/types.ts` |
| API 数据类型缺 `I` 前缀 | `ICoreRightsData` / `IUserQueryParams` |
| 业务类型 / Props 加 `I` 前缀 | `User` / `UserCardProps` |
| 业务逻辑直接用接口类型 | 适配为业务类型再用 |

---

## 🔍 提交前自检

- [ ] 已有全局类型 → 用它（不用 `any`）
- [ ] `constants/` 有枚举 → 用它
- [ ] 基础类型（string/number/boolean）不要 `any`
- [ ] 用到 `any` 的都标了 `// TODO: type`
- [ ] 需要外部使用的类型都 `export`
- [ ] API 数据类型带 `I` 前缀；业务 / Props 不带
- [ ] API 类型定义符合 [`interfaces.md`](./interfaces.md)（只定义一个 interface / 自包含 / 内联嵌套）

---

## 📖 相关规范

- [`interfaces.md`](./interfaces.md) - API 类型定义细则（必读）
- [`naming.md`](./naming.md) - 命名规范
- [`constants.md`](../02-architecture/constants.md) - 枚举与常量组织
- [`services.md`](../02-architecture/services.md) - Service 类型模板
- [`hooks.md`](../02-architecture/hooks.md) - Hook 类型模板

---

**当前策略**：渐进式类型化，容忍临时 `any`，核心类型必用
**未来目标**：统一收敛 `any`，提升类型覆盖率
