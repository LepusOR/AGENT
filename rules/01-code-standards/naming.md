---
description: '命名规范 · 文件/变量/函数/类型 · 业务术语 Certificate → Cert'
alwaysApply: false
---

# 命名规范

> 类型命名细节（`I` 前缀适用范围等）见 [`typescript.md`](./typescript.md) / [`interfaces.md`](./interfaces.md)。
> CSS 类命名（BEM）见 [`css-standards.md`](../03-styling/css-standards.md)。

---

## 🎯 4 条原则

1. **一致性**：同一概念整个项目同一命名
2. **可读性**：清晰表达含义
3. **简洁性**：在不牺牲可读性前提下尽量短
4. **规范化**：遵循大小写惯例与项目术语表

---

## 🔤 命名速查

| 对象 | 大小写 | 示例 |
|---|---|---|
| **React 组件** | PascalCase | `CertDetail` / `CertProductList` |
| **React Hook** | camelCase，`use` 开头 | `useCertDetail` / `useCertList` |
| **函数** | camelCase，动词开头 | `getCertDetail` / `fetchCertList` / `handleSubmit` |
| **变量** | camelCase | `certDetail` / `isLoadingCertDetail` |
| **模块内常量** | UPPER_SNAKE_CASE | `API_BASE_URL` |
| **全局常量对象** | PascalCase | `export const PatentType = {}` |
| **Interface（API 类型）** | `I` + PascalCase | `ICertDetail` / `ICertListItem` |
| **Interface（业务 / Props）** | PascalCase，**无** `I` | `User` / `UserCardProps` |
| **type 别名** | PascalCase，无前缀 | `type CertStatus = 'active' \| 'inactive'` |
| **enum & 值** | PascalCase | `enum CertType { Brand, Patent }` |

> 何时带 `I` 何时不带，见 [`typescript.md`](./typescript.md) 的"I 前缀适用范围"表。

---

## 📂 文件与目录命名

| 种类 | 规则 | 示例 |
|---|---|---|
| 组件文件 | PascalCase | `CertDetail.tsx` / `CertProductList/index.tsx` |
| 工具 / Service / 接口文件 | camelCase | `util.ts` / `cookie.ts` / `cert.ts` |
| Hook 文件 | camelCase + `use` 前缀 | `useCertDetail.ts` |
| 样式文件 | 与组件同名 + `.scss` | `CertDetail.tsx` → `CertDetail.scss` |
| 页面目录 | PascalCase，**单数** | `pages/CertDetail/` / `pages/CertManage/` |
| 组件目录 | 与组件同名 PascalCase | `components/CertProductList/` |
| 功能目录（`src/` 下） | camelCase / kebab-case | `src/common/` / `src/services/` / `src/constants/` / `src/interfaces/` |

常见错：
- ❌ `pages/cert-detail/` / `pages/CertDetails/`（用单数）
- ❌ `Util.ts` / `Cookie.ts`（工具文件用 camelCase）

---

## 🔤 业务术语表（强制简写）

**从后端 API 复制名字时必须主动改简写**——这是最常犯的错。

| 完整术语 | 项目简写 |
|---|---|
| Certificate | **Cert** |
| Authentication | **Auth** |
| Configuration | Config |
| Parameter | Param |
| Property | Prop（React Props） |
| Reference | Ref |

### 🔴 Certificate → Cert（最易违反）

**全场景强制**：变量 / 函数 / 文件 / 类型 / 目录 / Hook / 组件 / 注释。

```typescript
// ✅
const certDetail, certList, certId;
function getCertDetail() {}
export const useCertRecognitionResult = () => {};
interface ICertRecognitionResultData {}

src/interfaces/cert.ts
src/pages/CertDetail/
src/hooks/useCertRecognitionResult.ts

// ❌ 从 API 名直接复制粘贴的典型错误
const certificateDetail;
function getCertificateDetail() {}
interface ICertificateDetail {}
export const useCertificateRecognitionResult = () => {}; // 最常见！
```

### 允许全拼 `Certificate` 的 3 个例外

1. **UI 文案**（i18n.dm）：`dm: 'Certificate Management'`
2. **后端 API 返回字段**：`response.data.certificateInfo`
3. **第三方库**：`import { Certificate } from 'some-library'`

### ⚠️ `Certification` ≠ `Certificate` 的简写

`Certification` 是**特定类型**（认证证书），不要当作 Certificate 的变体：

```typescript
enum CertType {
  Certification = 'CERTIFICATION', // 认证证书（大类）
  Brand = 'BRAND',
  Patent = 'PATENT',
}

interface ICertCertificationDetail extends ICertDetailBase {
  certCategory: CertType.Certification;
}

export const CertCertification = () => {};
```

---

## 🚨 常见错误对照

| ❌ 错误 | ✅ 正确 |
|---|---|
| `certificateDetail` | `certDetail` |
| `getCertificateDetail` | `getCertDetail` |
| `useCertificateData` | `useCertData` |
| `useCertificateRecognitionResult` | `useCertRecognitionResult` |
| `ICertificateRecognitionResultData` | `ICertRecognitionResultData` |
| `certificateList` | `certList` |
| `ICertificateListItem` | `ICertListItem` |
| `pages/cert-detail/` | `pages/CertDetail/` |
| `Util.ts` | `util.ts` |

---

## ✅ 提交前自检

**🔴 业务术语（第一优先级）**
- [ ] 所有证书相关：`Certificate → Cert`
- [ ] 所有认证相关：`Authentication → Auth`
- [ ] 其他术语按对照表简写
- [ ] 从 API 名复制的字段**已主动调整**

**文件 / 目录**
- [ ] 组件 / 页面目录 PascalCase（单数）
- [ ] 工具 / 接口 / Hook 文件 camelCase
- [ ] Hook 文件名以 `use` 开头
- [ ] 样式文件与组件同名

**命名**
- [ ] 变量 camelCase；全局常量 PascalCase 或 UPPER_SNAKE_CASE
- [ ] 函数 camelCase，动词开头
- [ ] React 组件 PascalCase；Hook `use` 前缀 camelCase
- [ ] API interface 带 `I` 前缀；业务 / Props 不带 `I`
- [ ] enum 名与值都是 PascalCase

---

## 📚 相关规范

- [`typescript.md`](./typescript.md) - `I` 前缀适用范围
- [`interfaces.md`](./interfaces.md) - API 类型命名细则
- [`components.md`](../02-architecture/components.md) - 组件命名 / 事件处理
- [`css-standards.md`](../03-styling/css-standards.md) - BEM 类名
- [`exports.md`](./exports.md) - 导出命名
- [`import.md`](./import.md) - 导入命名
