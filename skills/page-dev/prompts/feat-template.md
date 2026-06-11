# Feat 迭代流程模板

## 适用

PRD type = `feat` 时走此流程。

- `light`：只处理明确的小型 UI / 交互 / 字段微调，不强制四象限
- `standard/full`：按下方完整模板执行

## 流程

### 1. 影响面

`light` 只列直接触达文件与验证方式。

`standard/full` 必须核查四类文件，缺一象限都可能留下隐患：

| 象限 | 位置 | 触达条件 |
|---|---|---|
| **services** | `src/services/<xxx>.ts` | 新增参数 / 新增字段 / 新接口 |
| **types** | `<page>/types.ts` 或 `src/types/` | 接口入参/出参结构变化 |
| **components** | `<page>/components/**` | UI 可见变化（新字段/列/筛选/按钮） |
| **scss** | `<page>/index.scss` 或子组件 scss | 布局/样式变化 |

输出：

```
象限影响面：
  services: ✅/❌ <文件路径> <变更点>
  types:    ✅/❌ <文件路径> <变更点>
  components: ✅/❌ <文件路径> <变更点>
  scss:     ✅/❌ <文件路径> <变更点>
```

### 2. 字段/列/筛选 前后对照表

`standard/full` 对三类高频 feat 场景，必须输出前后对照：

**新增字段（Form）**

| 字段名 | 类型 | 必填 | 默认值 | i18n id | data-spm |
|---|---|---|---|---|---|
| ... | ... | ... | ... | ... | ... |

**新增列（Table）**

| 列名 | dataIndex | 宽度 | render 特殊 | i18n id |
|---|---|---|---|---|

**新增筛选项**

| 筛选名 | 控件 | URL 参数 key | reset 值 |
|---|---|---|---|

### 3. 三类机械项样板

严格遵循项目现有写法：

```tsx
// i18n
{i18n.get({ id: 'crmweb.<page>.<key>', dm: '中文文案' })}

// data-spm（必须带页面或组件前缀）
<Button data-spm="<page>-<component>-<action>">...</Button>

// Form.Item 单直接子
<Form.Item name="field" label={...}>
  <Input placeholder="..." />
</Form.Item>
```

### 4. 验收映射

`standard/full` 将 PRD acceptance 逐条映射到 UI/数据/API 层改动。任一条未覆盖 → 停下问用户。

## 禁止事项

- 禁止在 `src/pages/<Page>/` 下创建 service 文件（services 集中在 `src/services/`）
- 禁止虚构 i18n id（无可靠 id 时直接中文）
- 禁止 Form.Item 包多个直接子（说明用 `extra` 属性）
- 禁止通用类名如 `.title` `.content`（必 BEM 前缀）
