# 代码现状探针

## 适用模式

- `light`：只在定位不清时做最小 grep，不要求产出完整 `code_snapshot`
- `standard/full`：PRD 理解回执前必须产出 `code_snapshot`

## 目标

在用户 ack 前用真实代码事实校准需求理解，避免只凭 PRD 猜实现。

## 探测范围

按 `pages` 匹配到 `src/pages/<PageName>/` 后，只读与 PRD 直接相关的部分：

1. 页面入口：`src/pages/<PageName>/index.tsx` 的 state、主要子组件树
2. 类型：同目录 `types.ts` 中与 PRD 字段同名 / 近义的定义
3. 字段相关代码：Form、Table column、筛选定义、报错文案、className
4. 服务层：PRD 涉及接口时定位 `src/services/<xxx>.ts` 方法签名
5. SCSS：仅 PRD 涉及视觉变化时探测

## 大文件规避

单文件超过 200 行时，不主线程通读。委托 Explore agent，并要求只返回：

- 与目标字段 / 元素相关的 `file:line`
- 不超过 5 行的代码片段
- 与本次改动有关的事实说明

## 输出 Schema

```json
{
  "<file_path>": {
    "summary": "<该文件当前职责，1-2 句>",
    "evidence": [
      {
        "loc": "<file:line-line>",
        "snippet": "<≤ 5 行代码>",
        "note": "<与本次改动相关的关键事实>"
      }
    ]
  }
}
```

## 缺失处理

- feat：字段 / 接口未命中时，写入 `assumptions[]`
- bug：报错文案 / 元素 / 字段未命中时，写入 `uncertainties[]`，ack 阶段要求用户补充

`standard/full` 的理解回执中，「改动前」必须引用 `code_snapshot` 的 `file:line` 或 ≤ 5 行 snippet。
