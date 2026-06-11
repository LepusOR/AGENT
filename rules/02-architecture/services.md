---
description: 'src/services API 层规范 · kebab-case 按路径分组 · 具名导出 · 注释 @api'
alwaysApply: false
---

# `src/services/` API 层规范

> 所有接口调用**必须**在 `src/services/**`，**严禁**在 `src/pages/**` 下创建 service 文件。
> 类型定义见 [`interfaces.md`](../01-code-standards/interfaces.md)；导入 / 导出见 [`import.md`](../01-code-standards/import.md) / [`exports.md`](../01-code-standards/exports.md)。

---

## 🎯 铁律

1. 接口调用**只放** `src/services/**`，页面目录不得出现 `service.ts`
2. 文件名 **kebab-case** + **证书简写 cert**（`cert.ts` / `cert-recommend.ts`，不是 `Certificate.ts`）
3. 按接口路径的**第二个单词**分组（见下表）
4. 方法名：**动词开头 + 语义化**（不要 `save` / `get` 裸名）
5. 具名导出，**不经** `index.ts` 中转
6. 所有调用统一走 `request`

---

## 📂 文件命名

```
/authcenter/cert/filter.json     → cert.ts
/authcenter/deep2Reserve/submit  → deep2-reserve.ts
/deep2/certRecommend/list        → cert-recommend.ts
/rightcenter/core/rights         → rightcenter.ts
```

---

## 🗂️ 接口路径分组

### `/rightcenter/*` → 统一 `rightcenter.ts`

（核心权益、商家身份、诊断、AB 测试等）

### `/authcenter/*`（按第二个单词）

| 路径 | 文件 |
|---|---|
| `/authcenter/cert/*` | `cert.ts` |
| `/authcenter/deep2Reserve/*` | `deep2-reserve.ts` |
| `/authcenter/videoUpload/*` | `video-upload.ts` |
| `/authcenter/file/*` | `file-upload.ts` |
| `/authcenter/authOverView/*` | `auth-overview.ts` |
| `/authcenter/deep2userconfig/*` | `deep2-user-config.ts` |

### `/deep2/*`（按第二个单词）

| 路径 | 文件 |
|---|---|
| `/deep2/certRecommend/*` | `cert-recommend.ts` |
| `/deep2/certRecognition/*` | `cert-recognition.ts` |
| `/deep2/capacityVideo/*` | `capacity-video.ts` |
| `/deep2/reVerify/*` | `reverify.ts` |
| `/deep2/starDirect/*` | `star-direct.ts` |
| `/deep2/verified/*` | `verified.ts` |
| `/deep2/golden/*` | `golden.ts` |
| `/deep2/authtag/*` | `authtag.ts` |
| `/deep2/industry/*` | `industry.ts` |
| `/deep2/verifiedProduct/*` | `verified-product.ts` |
| `/deep2/brandProtection/*` / `/deep2/pictureProtection/*` / `/deep2/protection/*` | `brand-protection.ts`（三路径合并） |
| `/deep2/supplier/*` | `supplier.ts` |
| `/deep2/applyinfo/*` | `auth-apply.ts` |
| `/deep2/cavoinfo/*` | `auth-video.ts` |
| `/deep2/card/*` | `auth-card.ts` |

### 其他

| 路径 | 文件 |
|---|---|
| `/series/*` | `course.ts` |
| `https://merchant-rating.alibaba.com/*` | `merchant-rating.ts` |
| `/upgrade/*` | `upgrade.ts` |

---

## 📝 方法命名 & 注释

### 命名

- **动词开头**：`get` / `query` / `submit` / `save` / `update` / `delete` / `check` / `create`
- **建议 3+ 单词**，语义清晰

```typescript
// ❌
export const save = (data) => { /* ... */ };
export const search = (data) => { /* ... */ };
export const bind = (data) => { /* ... */ };

// ✅
export const saveCert = (data) => { /* ... */ };
export const searchCertByName = (data) => { /* ... */ };
export const bindCertToProducts = (data) => { /* ... */ };
```

### 注释必填项

```typescript
/**
 * 获取证书列表
 * @description 根据条件筛选获取证书列表
 * @usage 证书管理页列表
 * @api POST /authcenter/cert/filter.json
 * @param {Object} data.conditions - 筛选条件（JSON 字符串）
 * @from cert-list.jsx          // 迁移过来的标注
 * @duplicate                    // 存在重复定义时标注
 */
export const getCertList = (data) => {
  const url = 'https://crmweb.alibaba.com/authcenter/cert/filter.json';
  return request(url, data, 'POST');
};
```

**最重要**：`@api HTTP_METHOD /path` 必填，便于 Ctrl+F 按接口定位。

---

## 🏭 请求封装

所有调用走 `request`：

```typescript
import request from './request';

export const getCertList = (data: IQueryParams) => {
  const url = 'https://crmweb.alibaba.com/authcenter/cert/filter.json';
  return request(url, data, 'POST');
};
```

**类型定义**（Hook / Service 各自的 I 前缀接口）见 [`interfaces.md`](../01-code-standards/interfaces.md)。

---

## 📦 导入 / 导出

```typescript
// ✅ 具名导出
export const getCertList = (data) => { /* ... */ };

// ❌ 默认导出
export default { getCertList };
```

```typescript
// ✅ 从具体文件导入
import { getCertList } from '@/services/cert';
import { getRightsList } from '@/services/rightcenter';

// ❌ 经 index.ts 中转
import { getCertList } from '@/services';
```

---

## ❌ 禁止

| 禁止 | 正解 |
|---|---|
| `pages/**/service.ts` | 移到 `src/services/**` |
| 重复定义同一接口 | 合并到一个文件 |
| `index.ts` 中转导出 | 具体文件具名导出 |
| 方法名 `save` / `get` / `query` 裸名 | `saveCert` / `getCertList` |
| 文件名驼峰 `getUserInfo.ts` | kebab-case `user-info.ts` |
| 文件名用 `Certificate` | 用 `cert` |

### 允许的例外

- `request.jsx`：核心请求封装保留 `.jsx`（历史原因）
- 页面目录下**非接口**的纯函数，命名 `utils.ts` / `helpers.ts`（不是 `service.ts`）

---

## ✅ 提交前自检

- [ ] 文件放在 `src/services/**`，不在 `pages/**`
- [ ] 文件名 kebab-case，证书用 `cert`
- [ ] 按路径分组规则归档
- [ ] 方法名动词开头 + 语义化
- [ ] 每个导出方法有 JSDoc，含 `@api METHOD /path`
- [ ] 具名导出 + 具体文件导入
- [ ] 调用统一走 `request`

---

## 📚 相关规范

- [`interfaces.md`](../01-code-standards/interfaces.md) - Service 类型模板（`IQueryParams` / `IResponseData`）
- [`exports.md`](../01-code-standards/exports.md) - 导出规范
- [`import.md`](../01-code-standards/import.md) - 导入规范
- [`naming.md`](../01-code-standards/naming.md) - Cert 简写等术语
