# 项目记忆预载

## 适用模式

- `light`：不使用
- `standard`：默认不使用；只有用户明确要求查历史决策时使用
- `full`：强制使用

## 目标

在高风险页面改动前加载业务术语和历史 ADR，避免重复推翻既有约束。

## 加载规则

按 `pages` 推导 `domain`（见 `references/glossary/README.md`），加载：

1. **域 glossary**：完整读 `references/glossary/<domain>.md`
2. **页面 ADR**：`docs/adr/<PageName>/` 中最近 3 条非 critical ADR
3. **critical ADR**：全部 `[critical]-` 前缀文件
4. **字段命中 ADR**：用 PRD 字段名 grep ADR 文件名和 H1，命中项顶替最老基线

`Index` / `NotFound` 页跳过 glossary；ADR 路径仍按页面名读取。

## 术语懒搜

PRD 中文术语未命中目标域 glossary 时：

1. 扩搜其他 5 域 glossary
2. 仍未命中时写入 `assumptions[]`
3. 用户在理解回执中纠正后，进入 `glossary_delta.additions[]`

## 输出声明

`full` 模式加载完成后必须输出：

```text
[memory-loaded]
- domain: <domain>
- glossary: references/glossary/<domain>.md (<n> 条术语)
- adr-baseline: <file1>, <file2>, <file3>
- adr-critical: <[critical]-file1>, ...
- adr-field-hit: <命中条目，无则写「无」>
```

未输出 `[memory-loaded]` 不得进入 PRD 理解回执。

## 词典差量

PRD 理解回执中包含「术语词典差量」：

- ack 通过 → patch `references/glossary/<domain>.md`
- ack 拒绝 → 不写
- 写入失败 → warning 提示用户手动补，不阻塞主流程

`glossary_delta.modifications[].field` 仅允许：`别名`、`语义`、`引用页`。
