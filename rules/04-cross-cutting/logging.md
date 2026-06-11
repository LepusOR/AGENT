---
description: '日志工具规范 · 禁 console.log · LOG + LOG_SCOPE 双控 · Hooks 用 useLog'
alwaysApply: false
---

# 日志工具规范

> **禁用 `console.log`**（线上用户也能看到，泄露敏感信息）。统一走 `src/common/logger.ts`。

---

## 🎯 设计核心：LOG + LOG_SCOPE 双控

| 开关 | 值 | 作用 |
|---|---|---|
| `LOG`（全局） | `true` / `false`（默认 `false`） | `false` 时所有日志不显示 |
| `LOG_SCOPE`（作用域） | `'api,hooks,page,aplus'` 格式 | 控制特殊 scope（带 `[Xxx]` 前缀）是否显示 |

**自动开启 `LOG`**：
- 开发环境（`IS_LOCAL === true` 或 `window.isLocal === true`）
- `localStorage.LOG === 'true'`

线上用户默认 `LOG = false`，保证不泄露。

---

## 📦 5 个函数

| 函数 | 颜色 | 场景 | 受 `LOG_SCOPE` 影响？ |
|---|---|---|---|
| `logInfo()` | 无前缀 🔵 / 特殊 scope 按前缀着色 | 信息、初始化、成功 | 特殊 scope 需配置 |
| `logWarn()` | 🟠 | 警告 | 否（`LOG=true` 始终显示） |
| `logError()` | 🔴 | 错误 / 异常 | 否 |
| `useLog()` | 同 `logInfo` | **Hook 内**状态日志，去重打印 | 同 `logInfo` |
| `useLogError()` | 🔴 | Hook 内错误 | 否 |

### `logInfo` 前缀着色规则

| 前缀 | 颜色 | 需要配置 `LOG_SCOPE`？ |
|---|---|---|
| 无 | 🔵 蓝 | ❌ 默认显示 |
| `[Hooks]` | 🟣 紫 | ✅ `hooks` |
| `[Page]` | 🟦 青 | ✅ `page` |
| `[API]` | 🟦 青 | ✅ `api` |
| `[Dot]` | 🟦 青 | ✅ `aplus` |

### 显示矩阵

| LOG | LOG_SCOPE | logInfo（普通） | logInfo（特殊） | logWarn / logError |
|---|---|---|---|---|
| `false` | any | ❌ | ❌ | ❌ |
| `true` | `''` | ✅ | ❌ | ✅ |
| `true` | `'page'` | ✅ | 只 `[Page]` | ✅ |
| `true` | `'api,hooks,page,aplus'` | ✅ | 全部 ✅ | ✅ |

---

## 📝 基础用法

```typescript
import { logInfo, logWarn, logError } from '@/common/logger';

// 默认 scope，LOG=true 即显示
logInfo('页面初始化', { userId: '123', page: 'home' });
logWarn('数据格式异常', { expected: 'array', actual: 'object' });
logError('API 请求失败', error, { url: '/api/user' });

// 特殊 scope（需对应 LOG_SCOPE）
logInfo('[API] 请求成功', { url: '/api/user', status: 200 });
logInfo('[Page] 页面数据', { authKey, cardList });
logInfo('[Dot] PV上报', { spma: 'a27gz', spmb: '40620953' });
```

---

## 🪝 Hook 里用 `useLog` / `useLogError`

**为什么**：组件每次 render 都会执行日志函数 → 重复打印。`useLog` 用 `useRef` 记录上次值，**只在变化时打印**。

```typescript
import { useLog, useLogError } from '@/common/logger';

// 组件内（无需特殊前缀）
useLog('计数器状态', count);
useLog('用户信息', userInfo, !!userInfo); // 第 3 参数：showLog，数据从无到有才打

// 自定义 Hook 内（必须加 [Hooks]）
export const useVerifiedTagCapacities = () => {
  const { data, error } = useRequest(getVerifiedTagCapacities);
  useLog('[Hooks] useVerifiedTagCapacities data', data, !!data);
  useLogError('[Hooks] useVerifiedTagCapacities error', error, !!error);
  return { data, error };
};
```

---

## 🏷️ 命名规范

### scope 描述简洁，不冗余

```typescript
// ✅ 简洁
logInfo('页面初始化', data);
logInfo('[API] 请求成功', data);
logInfo('第3步：保存数据', formData);

// ❌ 太简 / 太长
logInfo('init', data);
logInfo('这是一个非常详细的日志描述包含了很多信息', data);
```

### Hook 状态日志固定格式：`[Hooks] {HookName} {字段}`

```typescript
// ✅
useLog('[Hooks] useAuthCardCapabilityData data', data, !!data);
useLogError('[Hooks] useAuthCardCapabilityData error', error, !!error);

// ❌ 冗余描述（Hook 名 + "data/error" 已经表达了）
useLog('[Hooks] useAuthCardCapabilityData 数据加载成功', data, !!data);
```

### Hook **内部函数**里可以详细（用 `logInfo` / `logError`，不是 `useLog`）

```typescript
export const useAuthCardCapabilityData = () => {
  const fetchCardList = useCallback(async () => {
    try {
      const res = await getCardIdentityList();
      logInfo('[Hooks] useAuthCardCapabilityData 卡片列表加载成功', { cardList: res.content });
    } catch (err) {
      logError('[Hooks] useAuthCardCapabilityData 卡片列表加载失败', { error: err.message });
    }
  }, []);

  // Hook 级状态日志保持简洁
  useLog('[Hooks] useAuthCardCapabilityData data', data, !!data);
  useLogError('[Hooks] useAuthCardCapabilityData error', error, !!error);
};
```

### 日志数据用对象格式

```typescript
// ✅ 对象：便于阅读和排查
logError('API 请求失败', {
  url: '/api/user',
  method: 'POST',
  status: 500,
  error: error.message,
});

// ❌ 只有字符串，信息不足
logInfo('用户登录成功');
```

---

## 🎛️ 开关控制

```typescript
import { setLog, setLogScope } from '@/common/logger';

// 代码里
setLog(true);
setLogScope('api,hooks,page,aplus');

// 浏览器控制台（需刷新生效）
localStorage.setItem('LOG', 'true');
localStorage.setItem('LOG_SCOPE', 'api,hooks,page,aplus');
location.reload();

// 调试完收尾
localStorage.setItem('LOG', 'false');
localStorage.removeItem('LOG_SCOPE');
location.reload();
```

**调试组合**：
- 调 API → `setLogScope('api')`
- 调 Hook → `setLogScope('hooks')`
- 调埋点 → `setLogScope('aplus')`
- 调页面状态 → `setLogScope('page')`
- 全开 → `setLogScope('api,hooks,page,aplus')`

---

## ❌ 禁止做法

| 禁止 | 原因 | 正确 |
|---|---|---|
| `console.log` | 线上可见 | `logInfo` |
| 打印明文密码 / 手机号 / token | 隐私泄露 | 脱敏（如 `138****5678`） |
| 循环里大量打印 | 卡控制台 | 只打关键汇总 |
| 打印整个巨型 `rawData` | 性能差、找不到重点 | 只打必要字段 |
| 用 `logInfo` 替代埋点 | 用途不同（见下） | 埋点走 `dot()` |

---

## 🔍 日志 vs 埋点

| 对比 | 日志 | 埋点 |
|---|---|---|
| 目的 | 开发 / 调试 / 排障 | 行为分析 |
| 对象 | 开发 / 测试 | 分析师 / 产品 |
| 显示 | `LOG=true` 时 | 全量上报 |
| 工具 | `logInfo` / `logError` 等 | `dot()` / `setSpmABAndSendPV()` |

埋点规范见 [`tracking.md`](./tracking.md)。

---

## ✅ 提交前自检

- [ ] 代码里无 `console.log` / `console.error`
- [ ] 日志无敏感信息（已脱敏）
- [ ] Hook 内状态日志用 `useLog` / `useLogError`（不是 `logInfo`）
- [ ] 自定义 Hook 的状态日志加 `[Hooks]` 前缀，格式 `[Hooks] {HookName} {字段}`
- [ ] 页面级数据用 `[Page]` 前缀
- [ ] API 请求用 `[API]` 前缀
- [ ] 埋点用 `[Dot]` 前缀
- [ ] 日志数据是对象（不是单字符串）

---

## 📚 相关规范

- [`tracking.md`](./tracking.md) - 埋点（`dot`）与日志区别
- [`hooks.md`](../02-architecture/hooks.md) - Hook 模板含 `useLog` / `useLogError` 调用
- 源码：`src/common/logger.ts`
