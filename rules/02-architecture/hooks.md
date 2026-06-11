---
description: 'src/hooks 自定义 Hooks 规范 · useRequest 陷阱 · 并发缓存 · 兜底值'
alwaysApply: false
---

# `src/hooks/**` 规范

> **设计目标**：Hook = 数据源 + 参数拼接 + 格式化。组件只管渲染。
> **类型定义规范**（I 前缀 / 自包含 / 只定义一个 interface）见 [`interfaces.md`](../01-code-standards/interfaces.md)。

---

## 🎯 核心理念

1. **职责分离**：Hook 负责「取数据 + 拼参数 + 格式化」；组件负责「渲染 + 交互」
2. **Hook 是数据源，不是数据仓库**：多个组件独立 `useXxx()`，通过 `cacheKey` 天然去重
3. **1 Hook = 1 接口**：不在 Hook 里做多接口整合（整合在页面层）
4. **获取/更新都可以封装 Hook**：获取自动请求；更新用 `manual: true`，额外返回包装后的 `saveXxx(params)`

---

## 🚀 并发缓存模式（项目核心机制）

### 设计目的

多个组件同时需要同一份数据时，**不通过 props 传递**，各自独立 `useXxx()`，`useRequest` 基于 `cacheKey` 自动：
- 并发去重（同一时刻只发一次请求）
- 5 秒内结果共享（命中缓存，不重发）

### 对比

```typescript
// ❌ 传统：父组件统一取，props 向下传
const Parent = () => {
  const { data } = useUserInfo();
  return <><A data={data} /><B data={data} /><C data={data} /></>;
};

// ✅ 项目做法：各自声明所需，互不感知
const A = () => { const { data } = useUserInfo(); return <div>{data.name}</div>; };
const B = () => { const { data } = useUserInfo(); return <div>{data.email}</div>; };
const C = () => { const { data } = useUserInfo(); return <div>{data.phone}</div>; };
// 3 个 Hook 调用，只发 1 次请求
```

---

## 🚨 `useRequest` 核心陷阱（必读）

**`useRequest` 使用 `cacheKey` 时，`data` 已自动提取 `response.content`，直接访问业务字段即可。**

### 数据流

| 阶段 | API 原始返回 | `useRequest` 处理后 | 访问方式 |
|---|---|---|---|
| 成功 | `{ hasError: false, content: { name: '...' } }` | `data = { name: '...' }` | `data.name` |
| 失败 | `{ hasError: true, message: '...' }` | `data = null, error = {...}` | `error.message` |

### 常见错误速查

| ❌ 错误写法 | 原因 | ✅ 正确 |
|---|---|---|
| `data.content.xxx` | 多余 `.content`，已提取 | `data.xxx` |
| `if (data?.hasError)` | 错误信息在 `error` 不在 `data` | `if (error)` |
| `useMemo(() => rawData?.content, ...)` | 多余 useMemo | 直接用 `data` |
| `if ((rawData as any)?.content)` | 多余防御 | 直接用 `data` |

```typescript
// ❌ 错误全家桶
export const useCertCheckData = () => {
  const { data: rawData, loading, error } = useRequest(getInitData, { cacheKey: 'cert_check' });
  const data = useMemo(() => {
    if (!rawData) return null;
    if ((rawData as any)?.hasError) return null;
    if ((rawData as any)?.content) return (rawData as any).content.certCounts;
    return null;
  }, [rawData]);
  return { data, loading, error };
};

// ✅ 正确
export const useCertCheckData = () => {
  const { data, loading, error } = useRequest(getInitData, { cacheKey: 'cert_check' });
  return { certCounts: data?.certCounts || {}, loading, error };
};
```

---

## 📦 `useRequest` API

```typescript
interface RequestOptions<P = any> {
  manual?: boolean;        // 是否手动触发（默认 false）
  ready?: boolean;         // 是否准备好执行（默认 true）
  params?: P;              // 默认参数
  cacheKey?: string;       // 并发缓存 key（必填，用于去重）
  productLineId?: number;
}

interface FetchResult<TData, TParams> {
  data: TData | null;
  loading: boolean;
  error: any;
  run: (params?: TParams) => Promise<TData>;
  hasFirstLoaded: boolean;
}

function useRequest<TData, TParams>(
  requestFn: (params?: TParams, productLineId?: number) => Promise<any>,
  options?: RequestOptions<TParams>
): FetchResult<TData, TParams>;
```

### 缓存规则

- **并发去重**：同一时刻多个组件调同一 `cacheKey` → 只发 1 次，结果共享
- **结果缓存**：5 秒内相同 `cacheKey + params` → 命中缓存（5s 后重发）
- **失败不缓存**：`hasError: true` 时下次调用会重发

---

## 📋 业务 Hook 标准模板

```typescript
import useRequest from '@/hooks/useRequest';
import { useMemo } from 'react';
import dayjs from 'dayjs';
import { apiFunction } from '@/services/xxx';

export interface IBusinessData {
  name: string;
  count: number;
  items: { id: number; value: string }[];
}

export const useBusinessData = (params?: { userId?: string }) => {
  const { data: rawData, loading, error, run } = useRequest(apiFunction, {
    cacheKey: `business_data_${params?.userId || 'default'}`,
    params: {
      tableName: 'some_table',
      filters: [{ field: 'status', value: 'active' }],
      ...params,
    },
  });

  // 返回必有兜底值，组件无需空值检查
  const data = useMemo<IBusinessData>(() => ({
    name: rawData?.name || '',
    count: rawData?.count || 0,
    items: rawData?.items || [],
  }), [rawData]);

  return { data, loading, error, refresh: run };
};
```

---

## 🔴 兜底值规范（必须）

**Hook 返回数据必须是结构一致、带兜底值的对象**，禁止返回 `null` / `undefined`。

| 字段类型 | 兜底值 | 示例 |
|---|---|---|
| 字符串 | `''` | `name: raw?.name \|\| ''` |
| 数字 | `0` | `count: raw?.count \|\| 0` |
| 布尔 | `false` | `isActive: raw?.isActive \|\| false` |
| 数组 | `[]` | `list: raw?.list \|\| []` |
| 对象 | `{}` 或明确默认结构 | `user: raw?.user \|\| { name: '', age: 0 }` |

**优势**：组件端 `data.list.map(...)` 直接写，不用 `data?.list?.map?.(...)` 层层 `?.`。

---

## 🏗️ 架构铁律：1 Hook = 1 接口

### ✅ 正确：单接口单 Hook，页面层整合

```typescript
// hooks/useCardIdentityList.ts
export const useCardIdentityList = () => {
  const { data, loading, error, run } = useRequest(getCardIdentityList, {
    cacheKey: 'card_identity_list',
  });
  return { data, loading, error, refresh: run };
};

// hooks/useCardExtraInfo.ts
export const useCardExtraInfo = () => { /* 同上结构 */ };

// 页面层组合
const AuthCardCapability = () => {
  const { data: identity } = useCardIdentityList();
  const { data: extra, refresh } = useCardExtraInfo();
  const { saveConfig } = useSaveAuthCardConfig();

  const [authKey, setAuthKey] = useState('unselected');
  // 页面层整合 identity + extra，处理 UI 状态和业务逻辑
};
```

### ❌ 错误：Hook 里整合多个接口 + UI 状态 + 业务逻辑

```typescript
// 反例：100+ 行的巨型 Hook
export const useAuthCardCapabilityData = () => {
  // 1. 多个接口
  const fetchCardList = useCallback(...);
  const fetchExtraInfo = useCallback(...);
  // 2. 整合
  useEffect(() => { Promise.all([...]); }, []);
  // 3. UI 状态
  const updateAuthKey = useCallback(...);
  // 4. 业务操作
  const saveConfig = useCallback(...);
  return { data, updateAuthKey, refreshExtraInfo, saveConfig };
};
// 问题：不可复用、过度定制、修改一处影响多处
```

### 判断标准

| 放 Hook | 放页面层 |
|---|---|
| 单接口参数拼接 | 多接口数据整合 |
| 单接口返回值格式化 | 多接口联动调用 |
| 单接口兜底值 / 错误处理 | UI 状态管理（选中/展开等） |
|  | 业务逻辑（点击保存后的连锁动作） |

---

## 🔄 获取 vs 更新

### 获取：自动请求 Hook

```typescript
export const useCardIdentityList = () => {
  return useRequest(getCardIdentityList, { cacheKey: 'card_identity_list' });
  // manual 默认 false，组件挂载自动发起
};
```

### 更新：`manual: true` + 包装函数

```typescript
export const useSaveAuthCardConfig = () => {
  const { loading, error, run } = useRequest(saveAuthCardConfig, {
    cacheKey: 'save_auth_card_config',
    manual: true,
  });

  const saveConfig = useCallback(async (params: ISaveParams) => {
    const res = await run({ data: JSON.stringify(params) });
    if (res && !res.hasError) {
      message.success('保存成功');
      return true;
    }
    message.error('保存失败');
    return false;
  }, [run]);

  return { saveConfig, loading, error };
};
```

**为什么更新也封装 Hook？** 统一错误处理 + 消息提示，避免组件里重复写。

---

## 📝 命名规范

### Hook 文件 / 函数名

- `use` + PascalCase：`useUserInfo` / `useCertList` / `useAccountInterval`
- 文件名与导出一致：`src/hooks/useUserInfo.ts` → `export const useUserInfo`
- 禁止：`getUserInfo` / `user-info.ts` / `userInfo.ts`

### 数据格式转换函数

**统一用 `format` 前缀**，禁止 `set` / `convert` / `transform`：

```typescript
const formatProductCertList = (data: any[]) =>
  data.map(item => ({ label: item.name, value: item.id }));

const formatCertNameOptionsMap = (data: any[]) =>
  data.reduce((acc, item) => ({ ...acc, [item.key]: item.names }), {});
```

---

## 🎛️ 高级用法

### 条件请求（`ready`）

```typescript
export const useUserInfo = (userId: string) => useRequest(getUserInfo, {
  cacheKey: `user_info_${userId}`,
  ready: !!userId,     // userId 存在才发
  params: { userId },
});
```

### 手动触发（`manual`）

```typescript
export const useUserList = () => useRequest(getUserList, {
  manual: true,
  cacheKey: 'user_list',
});

// 使用
const { data, loading, run } = useUserList();
<Button onClick={() => run({ pageSize: 10 })}>加载</Button>
```

### 暴露刷新方法

```typescript
export const useUserInfo = () => {
  const { data, loading, run } = useRequest(getUserInfo, { cacheKey: 'user_info' });
  return { data, loading, refresh: run };
};
```

### 依参数变化 → `cacheKey` 带参

```typescript
export const useCertList = (status: string) => useRequest(getCertList, {
  cacheKey: `cert_list_${status}`,   // 参数变化 → cacheKey 变 → 重发
  params: { status },
});
```

---

## ⚠️ 注意事项

1. **`cacheKey` 必填且唯一**：包含关键参数（如 `productLineId` / `status`），避免数据串扰
2. **缓存时间不可配**：默认 5 秒，不透出以保持行为确定性
3. **Hook 之间禁相互依赖**：需要共享逻辑时提取为普通工具函数
4. **类型安全**：`useRequest<IUserInfo>(...)` 显式传泛型，不要靠推断
5. **最小化返回**：只返回组件真正需要的字段，不要原样透传整个 `rawData`

---

## 📚 相关规范

- [`interfaces.md`](../01-code-standards/interfaces.md) - 接口类型 I 前缀 / 自包含 / 只定义一个 interface
- [`services.md`](./services.md) - API 请求函数定义
- [`form.md`](./form.md) - Form 场景下 `useCallback` / `useEffect` 引用稳定性陷阱
- [`change-principles.md`](../00-meta/change-principles.md) - `useRequest` 数据取值等通用陷阱
