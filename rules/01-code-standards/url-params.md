---
description: URL 参数接口类型定义规范,参数文档维护在接口类型中
alwaysApply: false
---

# URL 参数接口定义规范

> **核心原则**：接口定义即文档，所有参数信息都应该在接口中体现，文件头注释只保留业务说明和示例。

---

## 📋 为什么要这样做？

### 问题：文件头注释 vs 接口定义

**❌ 旧方式：信息重复且容易不一致**

```typescript
/**
 * 证书详情页
 * @param {string} certId - 证书ID（必填）
 * @param {string} certNo - 证书编号（必填）
 */

export interface ICertDetailParams {
  certId: string;
  certNo: string;
}
```

**问题**：
1. ❌ 信息重复，维护成本高
2. ❌ 容易不一致（改了接口忘记改注释）
3. ❌ IDE 智能提示只能看到接口注释
4. ❌ 导入类型后，文件头注释完全看不到

---

### ✅ 新方式：单一事实来源

接口定义（在 url-params.ts 中）即文档，所有信息都在接口注释中。

**优势**：
1. ✅ 单一事实来源，维护成本低
2. ✅ IDE 智能提示完整展示参数信息
3. ✅ 导入类型后仍能看到完整注释
4. ✅ 类型即文档，强制同步更新

---

## 📚 相关文档

- [迁移指南](../../docs/url-params-migration-guide.md)
- [url-params.ts](../../src/common/url-params.ts)
- [TypeScript 接口规范](./interfaces.md)
