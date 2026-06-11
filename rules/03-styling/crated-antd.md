---
description: 'Antd5 + @alife/crated-antd 使用指引 · 组件映射 · API 差异 · 图标迁移速查'
alwaysApply: false
---

# Antd5 + Crated-Antd 使用指引

> 本项目已完成从 Fusion 到 Antd5/Crated-Antd 的迁移。本文档作为**组件使用速查**和**历史迁移 API 差异**参考。

---

## 🎯 核心原则

- 大部分组件从 `antd` 导入
- 定制容器组件（`Container` / `PageHeader` / `QueryForm` / `Bulletin` ...）从 `@alife/crated-antd` 导入
- 图标从 `@alife/icbu-common-icon-react` 或兼容层 `@alife/crated-seller-icon` 导入
- 根组件必须包 `ConfigProvider`
- 全局 `message` / `modal` / `notification` 用 `App.useApp()`，不用静态方法

---

## 🔧 入口配置

```bash
tnpm i -S antd@5 @alife/crated-antd@26 @alife/crated-seller-icon@2
```

```tsx
import { ConfigProvider } from '@alife/crated-antd';
import zh_CN from '@alife/crated-antd/locale/zh_CN';

export default function App() {
  return (
    <ConfigProvider locale={zh_CN}>
      <YourApp />
    </ConfigProvider>
  );
}
```

支持语言包：`en_US` / `zh_CN` / `zh_TW` / `vi_VN`。

---

## 🆕 Crated-Antd 原创组件

从 `@alife/crated-antd` 导入：

| 组件 | 用途 |
|---|---|
| `ConfigProvider` | 必须：根组件包裹，全局配置 |
| `Container` | 页面容器，`size`: `large`(1366) / `medium`(1128) / `small`(936) |
| `PageHeader` | 页面标题 + 面包屑 + 返回按钮 |
| `Bulletin` | 页面顶部公告 |
| `BottomSpacer` | 页面底部留白 |
| `QueryForm` | 配合 Table 的查询表单 |
| `Upload` | 业务 Upload（含上传方法配置） |
| `CardTitle` / `CardHeading` | 卡片标题 / 子块标题 |
| `CapsuleTabs` | 胶囊样式 Tab |
| `ArrowSteps` | 箭头形步骤条 |
| `CheckCardGroup` / `RadioCardGroup` | 卡片式多选 / 单选 |
| `CheckableTagGroup` | 可选标签组 |
| `ScrollShadow` | 滚动阴影（Modal 内常用） |
| `SnapBar` / `SnapBarGroup` | 侧边悬浮操作 |
| `TableImage` / `TableListBlock` | Table 内图片 / 批量操作 |

---

## 🔄 组件映射（Fusion → Antd）

| Fusion | Antd | 备注 |
|---|---|---|
| `Button` | `Button` | 默认 `shape="round"` |
| `NumberPicker` | `InputNumber` | 改名 |
| `Range` | `Slider` | 改名 |
| `Box` | `Flex` | `spacing` → `gap` |
| `Dialog` | `Modal` | 默认居中；`visible` → `open` / `onClose` → `onCancel` |
| `Loading` | `Spin` | 改名 |
| `Tab` | `Tabs` | 子元素 → `items` 属性 |
| `Nav` | `Menu` | 改名 |
| `Step` | `Steps` | 改名 |
| `Message`（JSX） | `message`（静态方法 / `App.useApp()`） | 不再是 JSX 组件 |
| `Balloon` | `Tooltip` | `trigger` JSX → `children` 包裹 |
| `Select` | `Select` | `dataSource` → `options` |
| `Field` | 删除 | Antd 不需要，直接 `Form.Item name="xxx"` |
| `Table` 子元素 `Table.Column` | `Table` `columns` 属性 | |
| `Grid.Row/Col` | `Row/Col` | |
| `Card` / `Descriptions` / `Tag` / `Badge` / `Avatar` / `Tooltip` / `Popover` / `Drawer` / `Progress` / `Breadcrumb` / `Pagination` / `Collapse` / `Input` / `Checkbox` / `Radio` / `Switch` / `DatePicker` / `TimePicker` | 同名，从 `antd` 导入 | |

---

## 📝 API 差异速查

### Button

```tsx
// Fusion
<Button type="secondary">次要</Button>
<Button text>文字</Button>

// Antd
<Button color="primary" variant="outlined">次要</Button>
<Button type="text">文字</Button>
<Button type="link">链接</Button>
```

### Form（不再需要 Field）

```tsx
// Antd
<Form labelCol={{ span: 4 }} wrapperCol={{ span: 8 }}>
  <Form.Item label="名称" name="name" required>
    <Input />
  </Form.Item>
</Form>
```

### Table（`columns` 属性）

```tsx
<Table
  dataSource={data}
  rowKey="id"  // 默认已是 "id"，非 "id" 时需指定
  columns={[{ dataIndex: 'name', title: '名称' }]}
/>
```

### Modal（`open` + `onCancel` + 默认居中）

```tsx
<Modal open={open} title="标题" onCancel={onClose}>...</Modal>
```

### Tabs（`items` 属性）

```tsx
<Tabs items={[
  { key: '1', label: '标签1', children: '内容1' },
  { key: '2', label: '标签2', children: '内容2' },
]} />
```

### message / Modal.confirm（必须 `App.useApp()`）

```tsx
const { message, modal } = App.useApp();
message.success('操作成功');
modal.confirm({ title: '确认删除？', onOk: handleDel });
```

> 避免直接 `import { message } from 'antd'` 调静态方法，否则主题 / 上下文丢失。

### Spin / InputNumber / Flex

```tsx
<Spin spinning={loading}>...</Spin>
<InputNumber defaultValue={10} />
<Flex gap={16}>...</Flex>
```

### Tooltip（children 包裹触发元素）

```tsx
// ✅
<Tooltip title="提示">
  <IconHelp style={{ fontSize: 14 }} />
</Tooltip>

// ❌ Antd Tooltip 不支持 trigger 接收 JSX
```

### 属性名变更速查

| Fusion | Antd |
|---|---|
| `visible` | `open` |
| `onClose` | `onCancel` |
| `onVisibleChange` | `onOpenChange` |
| `dataSource`（Select） | `options` |
| `primaryKey` | `rowKey` |
| `trigger`（Balloon） | `children`（Tooltip） |

---

## 🎨 图标迁移速查

> 详见 [`icon.md`](./icon.md)。本地常用映射：

```tsx
// Fusion
import { Icon } from '@alifd/next';
<Icon type="help" size="small" />

// Antd + crated-seller-icon
import { IconHelp } from '@alife/crated-seller-icon';
<IconHelp style={{ fontSize: 14 }} />
```

**易错映射**（命名与 Fusion type 不对应）：

| Fusion `type` | 正确组件名 | 易错点 |
|---|---|---|
| `help` | `IconHelp` | ❌ `IconQuestion` 不存在 |
| `prompt` | `IconWarningFill` | 实心警告 |
| `arrow-up` | `IconUpArrow` | ❌ `IconArrowUp` 不存在 |
| `arrow-down` | `IconDownArrow` | ❌ `IconArrowDown` 不存在 |
| `arrow-left` | `IconLeftArrow` | ❌ `IconArrowLeft` 不存在 |
| `arrow-right` | `IconRightArrow` | ❌ `IconArrowRight` 不存在 |
| `ashbin` / `delete` | `IconDelete` | 两个 type 对应同一图标 |
| `picture` | `IconImage` | - |
| `icon-moving` | `IconMenu` | 拖拽图标 |

尺寸不再用 `size` 属性，改 `style={{ fontSize }}`（通用图标除外）。

---

## 📐 页面布局模板

```tsx
import { Button, Card, Table } from 'antd';
import { ConfigProvider, Container, PageHeader, Bulletin, BottomSpacer } from '@alife/crated-antd';

export default function Page() {
  return (
    <ConfigProvider>
      <Container size="large">
        <PageHeader title="页面标题" style={{ marginBottom: 16 }} />
        <Bulletin items={[{ content: '公告内容' }]} style={{ marginBottom: 16 }} />
        <Card>
          <Table dataSource={data} columns={columns} />
        </Card>
        <BottomSpacer />
      </Container>
    </ConfigProvider>
  );
}
```

查询表单配合 Table：

```tsx
<QueryForm
  fields={[
    { label: '关键词', name: 'keyword', type: 'input' },
    { label: '状态', name: 'status', type: 'select', options: [...] },
  ]}
  onSearch={handleSearch}
/>
```

---

## ⚠️ 常见陷阱

1. **Button 默认胶囊**：不用手写 `shape="round"`，想要方形要 `shape="default"`
2. **Modal 默认居中**：不用 `centered`
3. **Table `rowKey` 默认 `"id"`**：数据主键非 id 时必须显式传
4. **`message` / `modal` 必须 `App.useApp()`**：静态方法在部分场景拿不到 ConfigProvider 主题
5. **Tooltip 不接 `trigger` JSX**：用 `children` 包裹触发元素
6. **`visible` → `open`**：Modal / Drawer / Popover 全部
7. **Select `dataSource` → `options`**
8. **Tabs 子元素方式失效**：必须用 `items` 数组
9. **Space.Compact 替代 ButtonGroup**

---

## 📋 验证清单

- [ ] 根组件用 `ConfigProvider` 包裹
- [ ] 无残留 `@alifd/next` 导入
- [ ] Modal / Drawer 用 `open` 而非 `visible`
- [ ] `message.xxx()` 来自 `App.useApp()`
- [ ] Tabs / Table 用 `items` / `columns` 属性
- [ ] 图标命名符合映射表

---

## 📚 相关规范

- [`icon.md`](./icon.md) - 图标库 `@alife/icbu-common-icon-react` 详细规范
- [`css-standards.md`](./css-standards.md) - BEM / Modal 样式
- [`pages.md`](../02-architecture/pages.md) - `Container` / `PageHeader` 用法
