---
description: '全局状态管理 · zustand · 精准订阅 · 三层初始化策略 · 禁 Context'
alwaysApply: false
---

# 全局状态管理（Zustand）

> **技术选型已定**：用 `zustand`，不用 React Context。
> **目录**：`src/globalStore/`，当前主要管 **Feature 配置**。

---

## 🎯 核心铁律

1. **用 zustand**，不用 Context
2. **精准订阅**：组件里 `useGlobalStore((state) => state.xxx.yyy)`，不要订整个 state
3. 非组件场景用 `useGlobalStore.getState()`
4. 状态**不可变**：用 `setState`，不要直接改属性
5. **不滥用全局**：能局部 `useState` 就不放全局；全局状态保持**扁平**

---

## 📦 基本用法

### 创建 Store

```typescript
import { create } from 'zustand';

interface GlobalStoreState {
  globalFeature: FeatureConfig;
}

const initialState: GlobalStoreState = {
  globalFeature: initFeatureConfig,
};

export const useGlobalStore = create<GlobalStoreState>(() => initialState);
```

### 组件中：精准订阅

```typescript
// ✅ 最佳：只订阅具体字段
const someKey = useGlobalStore((state) => state.globalFeature.someKey);

// ✅ 多字段用 shallow
import { shallow } from 'zustand/shallow';
const { key1, key2 } = useGlobalStore(
  (state) => ({ key1: state.globalFeature.key1, key2: state.globalFeature.key2 }),
  shallow,
);

// ❌ 订整个 state / 整个对象 → 任何变更都 re-render
const state = useGlobalStore();
const globalFeature = useGlobalStore((s) => s.globalFeature);
```

### 非组件中：`getState`

```typescript
// 工具函数、service 等
export const checkPermission = (key: string) => {
  const { globalFeature } = useGlobalStore.getState();
  return globalFeature[key];
};
```

### 更新：`setState`

```typescript
// 整体替换
useGlobalStore.setState(() => ({ globalFeature: newFeature }));

// 基于当前状态 merge
useGlobalStore.setState((state) => ({
  globalFeature: { ...state.globalFeature, ...partialFeature },
}));
```

---

## 🏗️ 项目实践：Feature 配置（三层策略）

**优先级**：localStorage < `window._feature`（VM 注入） < 接口（异步覆盖，最高）

```typescript
const localFeatureConfig = localGet<FeatureConfig>(FEATURE_CACHE_KEY, {});

const initFeatureConfig: FeatureConfig = {
  ...localFeatureConfig,          // 1. localStorage 业务权限缓存
  ...(window as any)._feature,    // 2. VM 注入的身份识别
  // 3. 接口异步覆盖（getFeatureAndABtest 中）
};
```

### 异步刷新 + 身份字段保护

```typescript
export const getFeatureAndABtest = async () => {
  try {
    const res: any = {};
    const { feature = {} } = _.get(res, 'data', {});

    const mergedFeature: FeatureConfig = {
      ...(window as any)._feature,                        // 保留身份
      ..._.omit(feature, ['ggs', 'vgs', 'vsgs', 'asgs']), // 接口只覆盖非身份字段
    };

    useGlobalStore.setState(() => ({ globalFeature: mergedFeature }));
    (window as any)._feature = mergedFeature;  // 老代码兼容
    localSet(FEATURE_CACHE_KEY, feature);

    return res?.data;
  } catch (e) {
    console.error('getFeatureAndABtest error:', e);
  }
};
```

**设计点**：
- 三层缓存：localStorage / `window._feature`（老代码兼容） / zustand（新代码）
- 身份字段（`ggs` / `vgs` / `vsgs` / `asgs`）由 VM 注入，接口**不覆盖**
- 新代码统一用 `useGlobalStore`，老代码继续读 `window._feature`

---

## 🧩 扩展 Store

```typescript
interface GlobalStoreState {
  globalFeature: FeatureConfig;
  userInfo: UserInfo | null;      // 新增字段
  settings: Settings;
}

const initialState: GlobalStoreState = {
  globalFeature: initFeatureConfig,
  userInfo: null,
  settings: {},
};

export const useGlobalStore = create<GlobalStoreState>(() => initialState);

// 对外暴露便捷 setter
export const setUserInfo = (userInfo: UserInfo) =>
  useGlobalStore.setState({ userInfo });

export const updateSettings = (settings: Partial<Settings>) =>
  useGlobalStore.setState((state) => ({
    settings: { ...state.settings, ...settings },
  }));
```

---

## ❌ 禁止

```typescript
// ❌ 1. React Context
const GlobalContext = createContext();
export const useGlobalStore = () => useContext(GlobalContext);

// ❌ 2. 订整个 state（任何变更都 re-render）
const state = useGlobalStore();

// ❌ 3. 直接改属性（zustand 不可变）
const state = useGlobalStore.getState();
state.globalFeature.someKey = 'x';

// ❌ 4. 条件 / 循环里调 hook（违反 Rules of Hooks）
if (cond) { const s = useGlobalStore(); }
```

---

## 🐛 调试

```typescript
// 开发环境下挂全局便于控制台调试
window.__globalStore__ = useGlobalStore;

// 控制台
__globalStore__.getState();
__globalStore__.setState({ globalFeature: { /* ... */ } });
```

---

## ✅ 提交前自检

- [ ] 新增状态字段在 `GlobalStoreState` 接口里声明
- [ ] 组件里**精准订阅**（选具体字段或 `shallow` 多字段）
- [ ] 非组件里用 `getState`
- [ ] 更新用 `setState`，没有直接改属性
- [ ] 没有 `createContext` / `useContext`
- [ ] 状态扁平，无深层嵌套
- [ ] 没有在全局存可计算的冗余数据

---

## 📚 相关规范

- [`hooks.md`](./hooks.md) - 接口数据走 Hook，不进全局 Store
- [`typescript.md`](../01-code-standards/typescript.md) - 类型安全
- [`exports.md`](../01-code-standards/exports.md) - 具名导出
- [Zustand 官方文档](https://zustand.docs.pmnd.rs/)
