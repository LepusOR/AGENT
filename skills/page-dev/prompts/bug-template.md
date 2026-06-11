# Bug 修复流程模板

## 适用

PRD type = `bug` 时走此流程。

- `light`：只定位直接缺陷点和最小修复，不要求完整组件树 / 数据流
- `standard/full`：按下方完整模板执行

## 流程

### 1. 复现路径定位

`light` 产出：

- 目标文件
- 命中代码片段
- 疑似缺陷点
- 最小验证方式

`standard/full` 产出：
- **入口文件**：用户操作触发的顶层页面/组件
- **组件树**：从入口到疑似缺陷组件的调用链
- **数据流**：涉及的 hook / service / store
- **疑似缺陷点**：2-3 个候选位置，标注优先级

格式：

```
入口：src/pages/<Page>/index.tsx
  └─ components/<Child>/index.tsx
      └─ hook: src/hooks/<useXxx>.ts
          └─ service: src/services/<xxx>.ts (API: <url>)
疑似缺陷：
  - [高] <文件:行> <问题描述>
  - [中] <文件:行> <问题描述>
```

### 2. 最小改动原则

- 优先**定点修复**，不顺带重构
- 不改 `types.ts` 结构（除非缺陷就在类型不匹配）
- 不新增抽象（工具函数、自定义 hook），除非修复必需
- 不改动与 bug 无关的 scss

### 3. 回归自检

- 若修改了条件分支：人工列出所有分支并标注是否覆盖
- 若修改了异步处理：列出所有 await 点与 error path
- 若修改了数据取值：grep 同一 API 返回值的其他使用点，确认一致

### 4. 验收映射

`standard/full` 将 PRD acceptance 条目逐条映射到改动点。一条验收 = 一处改动或一组改动。遗漏 → 停下问用户。

## 禁止事项

- 禁止「顺手重构」，触发全局强制规则 `change-principles.md` 冲突
- 禁止加 TODO/FIXME 推迟修复
- 禁止用宽泛 try/catch 掩盖异常（应定位根因）
