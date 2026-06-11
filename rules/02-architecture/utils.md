---
description: 'pages/<X>/utils.ts 页面级工具函数 · 业务逻辑归属 · 跨页面引用'
alwaysApply: false
---

# `pages/<X>/utils.ts` 页面级工具函数规范

> **目标**：把组件里碍眼的业务逻辑搬到 `utils.ts`，让 `index.tsx` 专注渲染。
> **定位**：**业务相关的纯函数**，与 `common/util.ts`（技术通用）分家。

---

## 🎯 该不该放 `utils.ts`？

### ✅ 放 `pages/<X>/utils.ts`

- URL 拼接 / 参数组装
- 业务数据格式化 / 映射（API → UI）
- 业务条件判断（权限 / 状态 / 阶段）
- 复杂计算逻辑（输入输出明确的纯函数）

### ❌ 不放 `utils.ts`

| 内容 | 正确位置 |
|---|---|
| 技术性通用工具（formatDate / debounce） | `src/common/util.ts` |
| API 请求 | `src/services/` |
| 数据获取（副作用） | `src/hooks/` |
| 组件渲染逻辑 | 组件内 |
| 全局常量 | `src/constants/` |

### ⚠️ 何时不用建 `utils.ts`？

页面逻辑极简时**不要为了建而建**：

```typescript
// ✅ 简单页面，内联即可，无需 utils.ts
const SimplePage = () => {
  const { data } = useData();
  const title = data?.title || '默认';
  const detailUrl = `/detail.htm?id=${data?.id}`;
  return <a href={detailUrl}>{title}</a>;
};
```

---

## 📋 文件模板

```typescript
// pages/CertDetail/utils.ts

// ============== URL 处理 ==============
/**
 * 构建证书编辑页 URL
 * @param certDetail - 证书详情
 * @param params - URL 额外参数
 */
export const buildCertEditUrl = (certDetail: ICertDetail, params: IUrlParams): string => {
  const urlParams = new URLSearchParams({
    source: params.source || '',
    type: certDetail.certType || '',
  }).toString();
  let url = `/verified/cert/upload.htm?${urlParams}&edit=true`;
  if (certDetail.certId) url += `&certId=${certDetail.certId}`;
  return url;
};

// ============== 数据格式化 ==============
export const formatCertStatus = (status: number): string =>
  status === 1 ? '已认证' : '未认证';

// ============== 条件判断 ==============
export const canEditCert = (cert: ICert): boolean =>
  cert.status !== 'EXPIRED' && cert.authLevel >= 2;

// ============== 计算 ==============
export const calculateEstimatedHeight = (items: IItem[], itemHeight = 62, perRow = 5): number => {
  if (!items?.length) return 44;
  return Math.max(44, Math.ceil(items.length / perRow) * itemHeight + 20);
};
```

---

## 📝 编写铁律

1. **必须是纯函数**：相同输入 → 相同输出，无副作用，不读/改外部状态（`window.x` / `globalThis` 都不碰）
2. **必须有 JSDoc**：`@param` + `@returns`，关键的还要 `@example`
3. **完整类型标注**：禁 `any`；参数 / 返回值必须显式
4. **按功能分组注释**：用 `// ============== URL 处理 ==============` 分段，便于 Ctrl+F

### 命名前缀规范

| 类型 | 前缀 | 示例 |
|---|---|---|
| 构建 URL | `build` | `buildCertEditUrl` |
| 格式化 | `format` | `formatCertStatus` |
| 转换数据 | `transform` | `transformCertData`（或用 `format`，统一） |
| 条件判断 | `is` / `can` / `has` / `should` | `isCertExpired` / `canEditCert` |
| 取值 | `get` | `getCertStatusColor` |
| 计算 | `calculate` / `compute` | `calculateEstimatedHeight` |
| 校验 | `validate` | `validateCertData` |

---

## 🎯 `utils.ts` vs `common/util.ts` vs `hooks/` vs `services/`

| 情况 | 归属 |
|---|---|
| 技术性 & 通用（离开本项目仍可用） | `src/common/util.ts` |
| 业务相关纯函数（即使多页面共享） | 目标页面的 `pages/X/utils.ts` |
| 使用 React Hooks / 有副作用 / 取数据 | `src/hooks/` |
| 发 HTTP 请求 | `src/services/` |

**关键判断**：**技术 vs 业务**。多个页面都用 `formatDate` → 升到 `common/`；多个页面都用 `formatCertStatus` → **留在 `CertDetail/utils.ts`**，其他页面跨引用。

### 正反例

```typescript
// ✅ common/util.ts：技术性、通用
export const formatDate = (d: Date, fmt: string) => { /* 无业务 */ };
export const debounce = <T extends Function>(fn: T, wait: number) => { /* 无业务 */ };

// ❌ 业务逻辑放 common 是错的
export const formatCertStatus = (s: number) => (s === 1 ? '已认证' : '未认证');
// ↑ "证书" 是业务概念，应放 pages/CertDetail/utils.ts
```

---

## 🔗 跨页面引用规则

### 核心原则：**链接打开谁，拼接规则就放谁那里**

| 场景 | URL 拼接位置 |
|---|---|
| 列表页 → 详情页 | 详情页的 `utils.ts` |
| 详情页 → 编辑页 | 编辑页的 `utils.ts` |
| 多个页面 → 同一目标页 | 目标页的 `utils.ts`（大家跨引用） |
| 4+ 个页面都用 + **技术性** | 升到 `common/url.ts` |

### 正例

```typescript
// pages/CertDetail/utils.ts：自己定义
export const buildCertDetailUrl = (certId: string, params?: { source?: string }) => {
  const urlParams = new URLSearchParams({ certId, source: params?.source || '' });
  return `/verified/cert/detail.htm?${urlParams}`;
};

// pages/CertManage/index.tsx：跨页面引用
import { buildCertDetailUrl } from '@/pages/CertDetail/utils';

const handleView = (id: string) => {
  window.location.href = buildCertDetailUrl(id, { source: 'list' });
};
```

### 反例

- ❌ `buildCertDetailUrl` 放在 `CertManage/utils.ts`（链接打开的不是 CertManage）
- ❌ 两个页面各定义一份 `buildCertDetailUrl`（重复维护）
- ❌ 只有 2 个页面用就升到 `common/url.ts`（过早抽象）
- ❌ 循环依赖：`pages/A/utils` ↔ `pages/B/utils` 互相引用 → 单向依赖

---

## ✅ 提交前自检

- [ ] 确认有建 `utils.ts` 的收益（不要为建而建）
- [ ] 纯函数：无副作用 / 不依赖全局状态
- [ ] 所有函数 JSDoc 完整、类型完整
- [ ] 命名符合前缀规范（`build*` / `format*` / `is*` / `can*` ...）
- [ ] 业务函数**没**错放 `common/`
- [ ] 跨页面引用链接拼接时，拼接函数放在**目标页面** `utils.ts`
- [ ] 无循环依赖

---

## 📚 相关规范

- [`pages.md`](./pages.md) - 页面目录结构
- [`hooks.md`](./hooks.md) - Hook 规范
- [`services.md`](./services.md) - Service 规范
- [`common.md`](./common.md) - `src/common/**` 公共工具
- [`interfaces.md`](../01-code-standards/interfaces.md) - 类型定义
