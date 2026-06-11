---
description: 'docs/ 治理过程文档组织规范'
alwaysApply: false
---

# 文档与开发记录规范

---

## 🎯 核心理念

`docs/` 存放**治理过程文档**（重构、迁移、规范化等），作为工程演变的素材和历史记录。

> **关键原则**：A 改成 B 时，**B 的样子就是开发要求**。

---

## 📂 目录结构

```
docs/
├── {分支名}/              # 按分支组织（kebab-case）
│   ├── analysis.md
│   ├── plan.md
│   └── progress.md
└── archived/              # 历史归档（可选）
```

**示例**：

```
docs/
├── feature-mock-system/
│   ├── analysis.md
│   ├── plan.md
│   └── progress.md
├── refactor-services/
│   ├── before-after.md
│   └── migration.md
└── upgrade-react18/
    └── upgrade-steps.md
```

---

## 📝 命名规范

| 层级 | 规则 | 示例 |
| --- | --- | --- |
| 分支文件夹 | `kebab-case`，用分支名 | `feature-mock-system/` ✅ / `新功能/` ❌ |
| 文档文件 | `kebab-case`，语义化 | `analysis.md` ✅ / `1.md` ❌ / `temp.md` ❌ |

---

## 💡 文档内容结构

每份治理文档包含四段：

### 1. 改什么

```markdown
- `services/xxx.js` → `services/xxx.ts`
- 组件 `Dialog` → `CertUploadDialog`
- CSS 类 `.modal` → `.cert-upload-modal`
```

### 2. 为什么

```markdown
- 组件命名要有场景含义，避免重名
- CSS 类名要全局唯一，防样式冲突
```

### 3. 怎么改

```markdown
1. 搜索所有 `.js` 文件
2. 逐个改为 `.ts`
3. 修复类型错误
4. 验证编译通过
```

### 4. 潜在规范（最重要）

通过「修改前 vs 修改后」对比，体现开发标准：

````markdown
### 修改前 ❌

```typescript
export const save = function(data) { ... }
```

### 修改后 ✅

```typescript
export const saveCert = function(data) { ... }
```

**潜在规范**：方法命名要语义化，避免过于简单的 `save` / `get` / `set`。
````

**✅ 后的代码 = 我们的开发标准。修改方向 = 规范要求。**

---

## 🎯 使用场景

| 场景 | 用途 |
| --- | --- |
| 新一轮治理 | 查 `docs/refactor-xxx/`，了解上次怎么改，避免重复踩坑 |
| 新人理解规范 | 通过「改前 vs 改后」理解项目规范要求 |
| 追踪演变 | 按分支文档的时间线还原功能迭代与设计决策 |

---

## ✅ 提交前自检

- [ ] 放在 `docs/{分支名}/` 下
- [ ] 文件名 `kebab-case`
- [ ] 四段齐全：改什么 / 为什么 / 怎么改 / 潜在规范
- [ ] 含「修改前 vs 修改后」对比示例
- [ ] 对比能体现开发规范

---

**核心**：治理文档让 Cursor 和开发者都能理解「工程如何演变 / 规范如何形成 / 正确代码是什么样」。
