---
name: i18n-add
description: 新增 i18n 文案闭环 skill。用户提供待国际化中文文案、改动范围，或请求「新增多语言 / 导出 i18n CSV / 把中文改成 i18n」时使用：强制拉取最新语言 JSON 到 cache，精确查重判断 reuse/create/ambiguous，先输出待确认文案名单让用户删除不需要项或选择复用候选，确认后只为 create 文案导出固定 CSV，并同步把最终名单中的代码文案替换为符合 rules/04-cross-cutting/i18n.md 的 i18n.get。不自动 commit；未确认名单不得写 CSV 或改代码。
---

# i18n-add — 新增文案确认、CSV 导出、代码替换

## 目标

把“新增 i18n 文案”做成可审计闭环：

1. 拉取最新语言 JSON 到 `.i18n-cache`
2. 判断候选中文是否确实需要新增
3. 让用户确认最终文案名单，可删除不需要处理的文案
4. 仅将确需新增的文案导出为固定 CSV
5. 同步修改代码，用 `i18n.get({ id, dm })` 替换最终名单中的中文文案

**成功标准**：

- 用户已确认最终文案名单
- `create` 文案都有合法且不冲突的新 id
- CSV 只包含 `create` 文案
- `reuse` 文案只改代码，不进 CSV
- `skip` / 未确认 / unresolved ambiguous 文案不写 CSV、不改代码
- 不自动 commit

## 适用范围

- 页面 / 组件 / 常量中的用户可见中文文案新增 i18n
- 跨 namespace 复用已存在文案，避免重复造 id
- 输出翻译平台增量 CSV

**不覆盖**：批量旧代码重构、删除 id、修改已有 dm、翻译平台版本治理。

## 状态模型

| 状态 | 含义 | 代码改动 | CSV |
| --- | --- | --- | --- |
| `reuse` | 精确命中唯一现有 id | 替换为命中 id | 不写 |
| `create` | 未命中，需在 `crmweb_authcenter` 新增 id | 替换为新 id | 写入 |
| `ambiguous` | 命中多个候选 id | 用户选定后转 `reuse`，否则不处理 | 不写 |
| `skip` | 用户确认不处理 | 不改 | 不写 |

## 固定流程：Plan → Confirm → Apply

### 0. 规则加载

如果本轮会修改代码，先按 `AGENTS.md` 读取最少相关规则：

- 全局：`rules/00-meta/change-principles.md`
- i18n：`rules/04-cross-cutting/i18n.md`
- 若改动路径命中 `src/pages/**`、`src/components/**`、`*.scss` 等，再按 `AGENTS.md` 路径映射读取对应规则

### 1. Prep：强制拉最新 cache

执行：

```bash
bash .claude/skills/i18n-add/scripts/fetch-cache.sh --force
```

产物：`.i18n-cache/{namespace}.json`，已剥 JSONP 壳，可直接 `JSON.parse`。

失败处理：

- 有可用旧 cache：可询问用户是否基于旧 cache 继续，并在最终说明标注 cache 非最新
- 无可用 cache：停止，让用户重试或处理网络问题

### 2. Plan：查重、推断前缀、生成确认名单

把候选中文写入临时 JSON。若已知道 element，优先用 `items`；只知道中文时用 `texts`，脚本会标记 `needs: ["element"]`。

```json
{
  "items": [
    { "text": "提交", "element": "btn.submit", "sourceFile": "src/components/X/index.tsx" }
  ],
  "lang": "zh_CN"
}
```

执行：

```bash
node .claude/skills/i18n-add/scripts/plan.mjs \
  .i18n-cache \
  .claude/skills/i18n-add/config.json \
  /tmp/i18n-input.json \
  --source-dir src/components/CenterStar \
  --out .i18n-output/i18n-plan-<run-stamp>.json
```

`plan.mjs` 会：

- 精确查重，判断 `reuse` / `ambiguous` / `create`
- 扫描 `--source-dir` 下现有 `i18n.get`，推断最常见 id 前缀，例如 `crmweb.authCenter.center`
- 对有 `element` 的 create 文案生成 `suggestedId`
- 检查 `suggestedId` 是否在 4 个 namespace 全量 key 中冲突
- 标记 `codeMode`：`text-only` 只生成 CSV；`code-linked-candidate` 需要人工确认具体替换点后再改代码

查重规则：

- 只查 `matchLang` 等于输入语言的 namespace
- `value.trim() === input.trim()` 才算命中
- 多命中为 `ambiguous`，不得隐式按优先级选择
- 不把全量 `allKeys` 贴给用户；需要临时调试时才直接使用 `lookup.mjs --include-keys`

输出给用户确认的名单必须包含：

```text
[create] 认证已提交
建议 id: crmweb.<module>.<page>.<element>
来源: src/pages/...

[reuse] 取消
复用 id: crmweb.authCenter.dialog.cancel
来源: src/components/...

[ambiguous] 确定
候选:
1. crmweb.authCenter.dialog.ok
2. company-info.confirm
```

**确认前禁止写 CSV、禁止改代码。**

### 3. Confirm：用户确认最终名单

用户可：

- 删除不需要处理的文案 → `skip`
- 接受 `create`
- 接受 `reuse`
- 为 `ambiguous` 选择候选 id
- 要求调整新 id 的 element 命名

最终名单必须无 unresolved `ambiguous`，否则停止。

### 4. Generate ids：仅 create 生成新 id

目标 namespace 固定为 `crmweb_authcenter`，模板：

```text
crmweb.{module}.{page}.{element}
```

规则：

- `src/pages/{module}/{page}/...`：从路径推 module/page，转 camelCase
- 非 `src/pages/**`：优先用 `plan.mjs --source-dir` 从现有 i18n id 推断前缀；若无法推断，停问用户
- `{element}` 使用语义名：`title` / `desc` / `btn.submit` / `label.companyName` / `placeholder.keyword` / `tooltip.xxx` / `msg.success` / `msg.error`
- 禁止 `.v2` / `.new` 这类版本后缀
- 用 `plan.mjs` 输出的 `conflicts` 检查 4 个 namespace 全量 key 冲突；任一 namespace 已存在不同 value，必须改更精确语义或停问用户

### 5. Apply：先写 CSV，再改代码

#### 5.1 CSV 导出

只把最终名单中 `status=create` 的行写入 CSV：

```bash
node .claude/skills/i18n-add/scripts/rows-from-plan.mjs \
  .i18n-output/i18n-plan-<run-stamp>.json \
  --out .i18n-output/i18n-create-rows-<run-stamp>.json
```

```bash
node .claude/skills/i18n-add/scripts/append-csv.mjs \
  .i18n-output <run-stamp> .i18n-output/i18n-create-rows-<run-stamp>.json
```

`rows.json`：

```json
[
  {
    "appName": "crmweb",
    "id": "crmweb.authCenter.overview.title",
    "zh_CN": "认证首页",
    "group": "authcenter",
    "status": "create",
    "sourceFile": "src/pages/AuthCenter/Overview/index.tsx"
  }
]
```

输出：

- `.i18n-output/i18n-new-<run-stamp>.csv`
- `.i18n-output/i18n-new-<run-stamp>.json` manifest

CSV 固定格式：

```csv
AppName,Key,Simplified Chinese,Group
crmweb,crmweb.authCenter.overview.title,认证首页,authcenter
```

硬规则：

- `reuse` / `skip` / `ambiguous` 不得进入 CSV
- `AppName` 默认 `crmweb`，`Group` 默认 `authcenter`，可在 `config.json` 的 `csv` 字段维护
- 同 Key + 同 Simplified Chinese + 同 AppName/Group 重复写入时去重
- 同 Key 对应不同 Simplified Chinese / AppName / Group 时报错

导出后校验：

```bash
node .claude/skills/i18n-add/scripts/validate-output.mjs \
  .i18n-output/i18n-new-<run-stamp>.csv
```

#### 5.2 代码替换

按 `rules/04-cross-cutting/i18n.md` 写：

```ts
i18n.get({ id: 'crmweb.authCenter.overview.title', dm: '认证首页' })
```

带变量：

```ts
i18n.get({ id: 'crmweb.welcome.message', dm: '欢迎 {name}' }, { name: userName })
```

要求：

- `dm` 保留当前场景中文原文
- 复用其它 namespace 的 id 时，`dm` 仍填当前中文原文
- 使用对象参数，不用数字占位符
- 不手写 `.replace`
- 不把复杂 HTML 塞进单条 dm；拆分文案或保留结构

禁止：

```ts
i18n.get({ id: 'key', dm: '{0}已提交' }, name)
i18n.get({ id: 'key', dm }).replace(...)
```

### 6. 交付说明

最终回复包含：

- CSV 路径
- 新增 rows 数
- 复用 rows 数
- skip rows 数
- 修改的代码文件
- 执行过的校验命令
- 若 cache 非最新，明确标注

## 配置

`.claude/skills/i18n-add/config.json`：

- `namespaces.{name}.url`：语言 JSON 下载地址
- `namespaces.{name}.matchLang`：匹配语言
- `namespaces.{name}.writable`：是否可新增；仅 `crmweb_authcenter: true`
- `csv.appName` / `csv.group`：CSV 默认 `AppName` / `Group` 列值
- `cacheTtlHours`：只作为非强刷兜底，主流程使用 `--force`

## 相关文件

- 规则：`rules/04-cross-cutting/i18n.md`
- i18n 入口：`src/common/i18n.ts`
- 缓存：`.i18n-cache/*.json`（`.gitignore`）
- 输出：`.i18n-output/i18n-new-*.csv` / `.json`（`.gitignore`）
- 下载脚本：`scripts/fetch-cache.sh`
- 计划脚本：`scripts/plan.mjs`
- rows 生成脚本：`scripts/rows-from-plan.mjs`
- 查重脚本：`scripts/lookup.mjs`
- CSV 追加脚本：`scripts/append-csv.mjs`
- CSV 校验脚本：`scripts/validate-output.mjs`
