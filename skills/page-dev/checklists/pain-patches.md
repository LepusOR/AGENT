# 痛点补丁扩展点

**当前状态**：首期为空，用户后续发现高频痛点时直接在本文件追加条目，无需改 SKILL.md 主体。

## Schema

```yaml
- id: <补丁唯一名，kebab-case>
  description: <一句话描述痛点>
  trigger:
    type: regex | grep | ast
    pattern: <匹配模式>
  fix:
    type: auto | ask_user
    instruction: <修复指令或给用户的选项>
  applies_to:
    - <glob 路径，如 src/pages/**/*.tsx>
  severity: critical | warning | info
  added_at: <YYYY-MM-DD>
```

## 集成位置

本文件是可选扩展点，不在主流程强制读取。只有用户明确要求使用痛点补丁库，或本文件已有正式条目时，在落盘改动后、自检前遍历条目：

1. 对每个条目，在变更文件上匹配 `trigger`
2. 命中 → 按 `fix.type` 执行：
   - `auto`：直接按 instruction 修改
   - `ask_user`：停下问用户，instruction 作为选项

## 示例条目（待启用）

```yaml
# 以下为示例，非实际启用
# - id: avoid-inline-style
#   description: 禁止 style={{}} 内联样式
#   trigger:
#     type: regex
#     pattern: 'style=\{\{'
#   fix:
#     type: ask_user
#     instruction: 移到 scss 文件 / 保留内联 / 抽成 styled
#   applies_to:
#     - src/pages/**/*.tsx
#   severity: warning
#   added_at: 2026-04-20
```

## 条目

（空 — 待用户补充痛点 top 3 后填充）
