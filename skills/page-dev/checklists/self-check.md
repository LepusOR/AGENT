# Self-check 执行序列

## 适用模式

- `light`：执行与改动相关的最小自检，可说明未跑全量 build
- `standard`：执行静态检查与必要 npm scripts，默认跑 build
- `full`：执行完整序列，build 不得跳过

## light 自检

按改动类型选择最小验证，不做无关全量扫描：

1. 对照已读取规则做人工自检：无 TODO/FIXME、无业务逻辑外溢、无无关文件改动
2. 对变更文件执行相关 grep，例如 `import *`、`export default`、`console.log`、通用 className
3. 若改 Form / data-spm / i18n / scss，读取对应规则并做定向检查
4. 有现成低成本命令时运行局部 lint / 类型检查；没有则在交付中说明未跑原因

## standard 自检

1. **规则断言**：对照 `[rules-loaded]` 清单，抽查每条规则的关键风险
2. **静态 grep**：按 `static-checks.md` 扫描变更文件
3. **npm scripts**：默认按序运行：

```bash
npm run classname-comment:fix
npm run stylelint:fix
npm run lint:fix
npm run build
```

若用户明确要求跳过耗时命令，或本地环境缺依赖，交付时必须说明。

## full 自检

执行 `standard` 全部步骤，且：

- 不得跳过 `build`
- 不得跳过 code-reviewer 前的 `git diff --no-color HEAD`
- 若 ADR / glossary 有写入，也纳入静态检查和 diff 摘要

## 回修策略

- 第 1 轮：按 stderr 或静态命中自动修复
- 第 2 轮：读关键报错详情做二次修复
- 超过 2 轮：停下问用户，并附失败命令、stderr 关键 5-10 行、已尝试修复、候选方案

## 失败分类

| 失败类型 | 常见原因 | 回修思路 |
|---|---|---|
| `lint:fix` | 未引入变量、`any` 过度、命名不符 | 按 ESLint rule id 定位规则 |
| `stylelint:fix` | 非 BEM、全局选择器污染 | 改 block 前缀，控制嵌套 |
| `build` | 类型不匹配、缺字段 | 查 `types.ts`；PRD 未定义字段类型时停下问用户 |
| `classname-comment:fix` | BEM 注释缺失 | 自动补注释 |

## 不做的事

- 不用 `// @ts-ignore` 或 `eslint-disable` 绕错
- 不在 self-check 阶段改动与需求无关的文件
- 不把未运行的检查说成已通过
