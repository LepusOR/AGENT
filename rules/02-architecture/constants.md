---
description: 'src/constants 常量管理 · 用 enum 不用 as const · PascalCase · 配套 Name 映射'
alwaysApply: false
---

# `src/constants/` 常量管理

> 位置：`src/constants/`。业务类型（`User` / `MemberInfo` 等）放 `src/types.ts`；枚举 / 常量映射放这里。

---

## 🎯 核心：用 `enum`，不用 `as const`

```typescript
// ✅ 推荐
/**
 * 证书类型
 */
export enum CertType {
  /** 产品证书 */
  Product = 'PRODUCT',
  /** 管理体系证书 */
  Management = 'MANAGEMENT',
}

// ❌ 不推荐（旧写法，需要额外写类型）
export const CertType = {
  Product: 'PRODUCT',
  Management: 'MANAGEMENT',
} as const;
export type CertTypeValue = (typeof CertType)[keyof typeof CertType];
```

**为什么**：`enum` 自动生成类型、语义明确、IDE 跳转更准、代码更简洁。

---

## 📝 定义规范

### 基础

```typescript
/**
 * 会员类型
 */
export enum MemberType {
  /** 金品会员 */
  Deep = 'deep',
  /** 金牌供应商 */
  GS = 'gs',
  /** 免费会员 */
  FM = 'fm',
}
```

**要素**：
- 顶部 JSDoc
- 每个成员 `/** */` 注释
- 名 + 成员都 PascalCase
- 显式赋值

### 数字枚举（支持负数）

```typescript
export enum ModelStatus {
  /** 已删除 */
  Deleted = -1,
  /** 待审核 */
  PendingReview = 1,
  /** 已通过 */
  Approved = 2,
}
```

### 分组枚举（同一业务域下多类）

```typescript
export enum CertType {
  // ========== 证书类型 ==========
  /** 产品证书 */
  Product = 'PRODUCT',
  /** 管理体系证书 */
  Management = 'MANAGEMENT',

  // ========== 证书大类 ==========
  /** 认证检测 */
  Certification = 'CERTIFICATION',
  /** 专利 */
  Patent = 'PATENT',
}
```

### 数字开头的值：改键名，保值

```typescript
export enum MarketingScene {
  // ❌ '3DShowRoom' = '3DShowRoom'  // 枚举键不能以数字开头

  /** VR Showroom */
  VRShowRoom = '3DShowRoom', // ✅ 键名调整，值保留
}
```

---

## 🔤 命名

| 对象 | 规则 | 示例 |
|---|---|---|
| 枚举名 | PascalCase | `CertType` / `AuthRelation` |
| 成员名 | PascalCase | `PendingReview` / `Approved` |
| 成员值 | 按后端约定 | `'PRODUCT'` / `'pending_review'` / `1` |

```typescript
// ❌
export enum authRelation {}      // 小驼峰
export enum CERT_TYPE {}         // 全大写
export enum Status { pending_review = '' }  // 下划线
export enum Status { APPROVED = '' }        // 全大写成员
```

---

## 🗺️ 配套映射对象

枚举通常需要一个映射对象放**显示文案 / 配置 / URL**。

### 命名约定

- 名称文案：`SomeTypeName` / `SomeTypeText`
- 配置对象：`SomeTypeConfig`
- URL 映射：`SomeTypeImgUrlMap`

```typescript
export enum AuthRelation {
  /** 本企业增加地址 */
  Another = 'another',
  /** 增加合作工厂 */
  Partnership = 'partnership',
}

/**
 * 认证关系文案
 */
export const AuthRelationName: Record<string, string> = {
  [AuthRelation.Another]: i18n.get({ id: 'key1', dm: '同一营业执照下可以再新增一个拍摄认证地址' }),
  [AuthRelation.Partnership]: i18n.get({ id: 'key2', dm: '是贵司主营产品的生产商' }),
};

/**
 * 证书类型图标与颜色
 */
export const CertTypeConfig: Record<string, { icon: string; color: string }> = {
  [CertType.Product]: { icon: 'product-icon', color: '#1047f5' },
};
```

**必须**：映射对象显式声明 `Record<K, V>` 类型。

---

## 🧩 使用

```typescript
// ✅ 具名导入
import { CertType, AuthRelation } from '@/constants';

if (type === CertType.Product) { /* ... */ }

switch (status) {
  case ModelStatus.Approved: return '审核通过';
  default: return '未知状态';
}

function handleCert(type: CertType) { /* type 限定为 CertType 成员 */ }
```

**向后兼容**：老代码里 `if (type === 'PRODUCT')` 仍可用，新代码请用 `CertType.Product`。

---

## 🧷 特殊场景

### 包含 React 元素的映射 → 用 `.tsx`

```tsx
// src/constants/cert-icon.tsx
export const CertTypeIcon: Record<string, React.ReactElement> = {
  [CertType.Product]: <ProductIcon />,
};
```

### 大型枚举（40+ 值）

- 注释分组（`// ========== X ==========`）
- 考虑按业务维度**拆成多个枚举**

---

## 📂 文件组织

```
src/constants/
├── index.tsx            # 通用常量 / React 元素映射
├── auth-relation.ts
├── brand-protection.ts
├── capacity-video.ts
├── reverify.ts
└── url.ts
```

---

## ✅ 提交前自检

- [ ] 用 `enum`，不是 `as const`
- [ ] 名 + 成员都 PascalCase
- [ ] 顶部 JSDoc、每个成员 `/** */` 注释
- [ ] 显式指定枚举值
- [ ] 映射对象显式声明 `Record<...>`
- [ ] 映射对象命名：`Name` / `Text` / `Config` / `Map` 之一
- [ ] 含 React 元素 → 放 `.tsx`

---

## 📚 相关规范

- [`typescript.md`](../01-code-standards/typescript.md) - `src/types.ts` vs `src/constants/` 分工
- [`naming.md`](../01-code-standards/naming.md) - PascalCase 命名
- [`exports.md`](../01-code-standards/exports.md) - 具名导出
