---
description: 'src/common 公共工具 · 只放技术性通用函数 · 具名导出 · 禁 index.ts 代理'
alwaysApply: false
---

# `src/common/` 公共工具规范

> **定位**：只放**技术性 / 通用**函数，能离开本项目继续用。
> **业务函数**（`formatCertStatus` / `buildCertDetailUrl` 等）放 `pages/<X>/utils.ts`，详见 [`utils.md`](./utils.md)。

---

## 🎯 5 条铁律

1. **技术 vs 业务分家**：`common/` 只放技术工具，业务函数留在 `pages/<X>/utils.ts`
2. **无 `index.ts` 代理**：所有调用直接来自具体文件，IDE 能精确统计引用数
3. **具名导出 + 具名导入**：禁默认导出对象
4. **按能力分类**：有明确类别 → 独立 `.ts` 文件；通用无分类 → 进 `util.ts`
5. **克制无聊封装**：对已有 API 做简单一层包装不要做

---

## 🧭 `common/` 还是 `pages/<X>/utils.ts`？

**一个判断**：离开本项目能直接复用吗？

| `src/common/` ✅ | `pages/<X>/utils.ts` ❌ |
|---|---|
| `formatDate` / `debounce` / `deepClone` / `retry` / `throttle` / `curry` | `formatCertStatus` / `canApplyDeepAuth` |
| 纯技术，不涉业务规则 | 带业务概念（证书 / 权益 / 认证） |
| 任何项目都能用 | 离开项目就没意义 |

```typescript
// ✅ common/：纯技术
export const formatDate = (date: Date, format: string) => { /* ... */ };
export const debounce = <T extends Function>(fn: T, wait: number): T => { /* ... */ };

// ❌ 业务逻辑错放 common
export const formatCertStatus = (s: number) => (s === 1 ? '已认证' : '未认证');
export const buildCertDetailUrl = (id: string) => `/verified/cert/detail.htm?certId=${id}`;
```

---

## 📂 主要文件

| 文件 | 职责 |
|---|---|
| `cookie.ts` | Cookie 读写 / 用户信息 |
| `i18n.ts` | 国际化 |
| `util.ts` | 通用工具（无明确分类） |
| `constant.ts` | 常量定义 |
| `logger.ts` | 日志 |
| `dot.ts` | 埋点（PV / 自动 / 手动） |
| `window.ts` | Window 变量代理层 |
| `aes.ts` | AES 埋点初始化 |
| `itrace.ts` | itrace 监控上报 |
| `mtop.ts` | mtop 接口封装 |
| `request.jsx` | 通用请求封装 |

---

## 📝 代码规范

### 导出 / 导入

```typescript
// ✅ 具名导出
export const getMemberId = () => getCookie('memberId');
export const getLocale = () => getCookie('locale') || 'zh_CN';

// ❌ 默认导出对象
export default { getMemberId, getLocale };

// ✅ 具名导入，从具体文件
import { getMemberId, getLocale } from '@/common/cookie';
import { dot, setSpmABAndSendPV } from '@/common/dot';

// ❌ 默认导入代理对象 / index 中转
import cookie from '@/common/cookie';
import { getMemberId } from '@/common';
```

**目的**：每个函数都能 IDE 精确定位所有引用，方便评估删除 / 重构影响。

### 命名

- camelCase，**动词开头**（`get` / `set` / `check` / `format` / `parse` ...）

```typescript
// ✅
export const getMemberId = () => {};
export const formatDate = () => {};
export const checkPermission = () => {};

// ❌
export const mid = () => {};
export const fmt = () => {};
export const check = () => {};
```

### TSDoc 注释

```typescript
/**
 * 获取当前用户 Member ID
 * @returns Member ID
 */
export const getMemberId = (): string => getCookie('memberId');

/**
 * 格式化日期
 * @param date - 日期对象或字符串
 * @param format - 格式化模板，如 'YYYY-MM-DD'
 * @returns 格式化后的字符串
 */
export const formatDate = (date: Date | string, format = 'YYYY-MM-DD'): string => {
  /* ... */
};
```

---

## ❌ 禁止

| 禁止 | 说明 |
|---|---|
| 业务函数放 `common/` | 违反"技术 vs 业务"分家原则 |
| `src/common/index.ts` 中转 | 破坏引用统计 |
| `export default { ... }` | 隐藏引用关系 |
| `cookie.getMemberId()` 代理式调用 | 与默认导出同病 |
| 只调一次还硬塞进 `common` | 就近放调用处 |
| 对已有 API 无意义包装 | 如 `export const Alert = (c) => Dialog.alert({ content: c })` |

---

## 🧱 依赖关系

```
pages → components / services / hooks / common
components / services / hooks → common
common ⤺ 不依赖上层
```

- ✅ `pages` 可用 `components` / `services` / `hooks` / `common`
- ✅ `components` / `services` / `hooks` 可用 `common`
- ❌ `common` **不**依赖 `pages` / `components`
- ❌ `components` **不**依赖 `pages`

---

## ✅ 提交前自检

- [ ] 函数是技术性 & 通用（能离开项目复用）
- [ ] 有明确能力分类 → 独立文件；无则入 `util.ts`
- [ ] 具名导出 + 具名导入，无 `export default {}`
- [ ] 无 `src/common/index.ts` 或经它中转
- [ ] 无对已有 API 的无意义一层包装
- [ ] 所有导出函数有 TSDoc 注释

---

## 📚 相关规范

- [`utils.md`](./utils.md) - `pages/<X>/utils.ts` 业务工具函数
- [`exports.md`](../01-code-standards/exports.md) - 导出规范
- [`import.md`](../01-code-standards/import.md) - 导入规范
- [`naming.md`](../01-code-standards/naming.md) - 命名
