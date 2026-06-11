---
description: '接口类型定义 · 只定义一个 interface · I 前缀 · 自包含 · 可见即可得'
alwaysApply: false
---

# 接口类型定义规范

> 适用于所有 API 相关类型（Hook / Service 响应与请求参数）。

---

## 🎯 4 条核心规范

### 1. 只定义一个 interface（最重要）

**API 响应类型只定义一个 `export interface`，所有嵌套结构直接内联**。接口是一次性的，不复用。

```typescript
// ✅ 正确：一个 interface，嵌套内联
export interface ICapacityVideosData {
  groupVideoList: {
    group: { identity: string; name: string; order: number };
    videos: {
      video: { videoId: string; isShow: boolean };
      tags: {
        identity: string;
        name: string;
        group: { identity: string; name: string };
      }[];
    }[];
  }[];
  unShowCount: number;
}

// ❌ 错误：分层定义，跳来跳去才能看全
export interface ICapacityVideoTag { ... }
export interface ICapacityVideo { tags: ICapacityVideoTag[]; ... }
export interface ICapacityVideoGroup { videos: ICapacityVideo[]; ... }
export interface ICapacityVideosData { groupVideoList: ICapacityVideoGroup[]; }
```

### 2. `I` 前缀必须

```typescript
// ✅ IUserData  IQueryParams  IListItem
// ❌ UserData   QueryParams   Data
```

### 3. 类型自包含（不跨文件引用）

Hook 和 Service 各自定义各自的类型，**不要** `import type` 跨文件。

```typescript
// ❌ 错误：Hook 引用 Service 类型
import { getUserData, type IUserData } from '@/services/user';

// ✅ 正确：Hook 自己定义
import { getUserData } from '@/services/user';
export interface IUserData { id: string; name: string; }
```

### 4. 可见即可得

打开文件就能看到完整类型，无需跳转。嵌套 3-4 层也比拆分可读。

---

## 📋 标准模板

### Hook

```typescript
import useRequest from './useRequest';
import { getApiName } from '@/services/xxx';

export interface IResponseData {
  id: string;
  name: string;
  items: { id: string; title: string }[];
}

export const useApiName = () => {
  const { data, loading, error, run } = useRequest<IResponseData>(getApiName, {
    cacheKey: 'api_name',
  });
  return { data, loading, error, refresh: run };
};
```

### Service

```typescript
import { request } from '@/common/request';

export interface IQueryParams {
  page: number;
  size: number;
  keyword?: string;
}

export interface IResponseData {
  total: number;
  items: { id: string; name: string }[];
}

/**
 * 获取数据列表
 * @api POST /api/data/list.json
 */
export const getDataList = (params: IQueryParams) =>
  request('https://example.com/api/data/list.json', params, 'POST');
```

---

## ⚠️ 三种允许多个 interface 的场景

### 1. 响应 + 请求参数

请求参数与响应是**完全不同的概念**，可以并存：

```typescript
export interface IReVerifyListParams {
  pageIndex: number;
  pageSize: number;
  authStatus?: string | null;
}

export interface IReVerifyListData {
  totalCount: number;
  result: { id: number; authStatus: string }[];
}
```

### 2. 业务状态类型（非 API 响应）

`useState` 管理的本地状态可以多个独立 interface：

```typescript
export interface ICategoryItem { label: string; value: string | number; }
export interface ICategory { label?: string; value?: string | number; }

const [category, setCategory] = useState<ICategory>({});
const [categoryList, setCategoryList] = useState<ICategoryItem[]>([]);
```

### 3. 内部类型提取 → 用索引类型

需要引用子类型时**用索引类型**，不要拆 interface：

```typescript
export interface ICertCheckData {
  certList: { certId: string; certNo: string; certName: string }[];
}

// ✅ 索引类型提取
export type ICertItem = ICertCheckData['certList'][number];

// ❌ 拆成独立 interface 引用
```

---

## ❌ 常见错误对照表

| 错误 | 正确 | 排查 |
|---|---|---|
| 分层定义多个 interface | 只 1 个，嵌套内联 | 每个 hook / service 文件 `grep -c "^export interface"` 应为 1（响应）或 2（响应+参数） |
| 缺 `I` 前缀 | `IXxxData` | `grep "^export interface [^I]"` |
| 跨文件 `import type` | 各自独立定义 | `grep "import.*type I" src/hooks/ src/services/` |
| 数组元素单独定义 | `xxx: { ... }[]` 内联 | 看 interface 属性类型是否出现自定义 `IXxxItem` 名字 |
| 可选字段没 `?` | `email?: string` | - |

---

## ✅ 结构清晰的小建议

**分组用注释分隔**（不拆 interface）：

```typescript
export interface IUserData {
  // 基本信息
  id: string;
  name: string;

  // 个人资料
  profile: {
    avatar: string;
    bio: string;
  };

  // 统计信息
  stats: {
    followers: number;
    following: number;
  };
}
```

**扁平化过度同样不好**：`avatar` / `bio` / `followers` 全平铺在一层会让语义消失。

---

## 📚 相关规范

- [`typescript.md`](./typescript.md) - TypeScript 通用规范
- [`hooks.md`](../02-architecture/hooks.md) - Hook 模板与兜底值
- [`services.md`](../02-architecture/services.md) - Service 组织方式
- [`exports.md`](./exports.md) - 导出规范
