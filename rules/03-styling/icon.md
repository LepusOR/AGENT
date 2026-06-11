---
description: '图标使用规范 · @alife/icbu-common-icon-react · 按需导入 · 默认尺寸 1.2858em'
alwaysApply: false
---

# 图标使用规范

> 项目统一图标库：`@alife/icbu-common-icon-react`（1300+ 图标）。
> 禁止使用其他图标库、禁止直接引 SVG 文件。

---

## 🎯 5 条核心原则

1. ✅ 统一 `@alife/icbu-common-icon-react`
2. ✅ 按需具名导入（不要 `import *`）
3. ✅ 默认不传 `size`，跟随字体大小（`1.2858em`）
4. ✅ 语义化命名：选业务匹配的图标（`IconDelete` vs `IconClose`）
5. ✅ 通用图标优先；需要与 Antd 视觉一致时用 antd-icons 子路径

---

## 📦 导入方式

### 通用图标（首选）

```typescript
import { IconAdd, IconClose, IconHelp } from '@alife/icbu-common-icon-react';

<IconAdd />
<IconClose size={16} color="#FF6A00" />
```

**命名**：`Icon + PascalCase`（`IconAdd` / `IconDelete` / `IconHelp` / `IconWarning`）

### Antd 风格图标（需要与 Antd 视觉一致时）

```typescript
import CheckOutlined from '@alife/icbu-common-icon-react/es/antd-icons/icons/CheckOutlined';
import InfoCircleFilled from '@alife/icbu-common-icon-react/es/antd-icons/icons/InfoCircleFilled';

<CheckOutlined style={{ color: '#52c41a' }} />
```

**命名**：`功能 + Outlined/Filled`

### ❌ 禁止

```typescript
// ❌ 全量导入
import * as Icons from '@alife/icbu-common-icon-react';

// ❌ default 导入
import IconAdd from '@alife/icbu-common-icon-react';

// ❌ 直接引 SVG
import AddSvg from './add.svg';
```

---

## 🎨 IconProps

```typescript
interface IconProps {
  size?: number | string;     // 默认 1.2858em
  color?: string;             // 默认 currentColor（继承父元素）
  rotate?: number | string;   // 旋转角度（度）
  spin?: boolean;             // 旋转动画
  className?: string;
  style?: CSSProperties;
}
```

### size

```tsx
<IconAdd />              // 1.2858em 跟随 fontSize
<IconAdd size={16} />    // 小图标（按钮 / 输入框）
<IconAdd size={20} />    // 中
<IconAdd size={24} />    // 标准
<IconAdd size={32} />    // 大
```

**⚠️ 2026.1.5 破坏性变更**：默认尺寸从 `24px` 改为 `1.2858em`，**受父元素 fontSize 影响**。老代码如依赖固定 24px 须显式传 `size={24}`。

### color

```tsx
<IconAdd color="#FF6A00" />                 // 主色（项目）
<IconAdd color="#52c41a" />                 // 成功
<IconAdd color="#faad14" />                 // 警告
<IconAdd color="#ff4d4f" />                 // 错误
<IconAdd color="var(--primary-color)" />    // 变量

// 推荐：继承父元素
<span style={{ color: '#FF6A00' }}><IconAdd /></span>
```

### rotate / spin

```tsx
<IconDown rotate={collapsed ? 0 : 180} />
<IconLoading spin />
```

### className（优于 style）

```tsx
<IconAdd className="page-name__icon" />
```

```scss
.page-name__icon {
  margin-right: 8px;

  &--disabled { opacity: 0.5; cursor: not-allowed; }
}
```

---

## 📋 常用图标速查

### 基础操作

| 组件 | 用途 |
|---|---|
| `IconAdd` | 新增 |
| `IconClose` | 关闭（弹窗 / 标签） |
| `IconDelete` | 删除 |
| `IconEdit` | 编辑 |
| `IconSave` | 保存 |
| `IconUpload` / `IconDownload` | 上传 / 下载 |
| `IconRefresh` | 刷新 |
| `IconSearch` | 搜索 |

### 状态提示

| 组件 | 推荐颜色 |
|---|---|
| `IconSuccess` / `CheckCircleFilled` | `#52c41a` |
| `IconWarning` | `#faad14` |
| `IconError` | `#ff4d4f` |
| `IconInfo` / `InfoCircleFilled` | `#1047f5` |
| `IconHelp` / `QuestionCircleOutlined` | `#999` |
| `IconNotification` | 默认 |

### 方向 / 加载

| 组件 | 用途 |
|---|---|
| `IconUp` / `IconDown` / `IconLeft` / `IconRight` | 基础方向 |
| `IconUpArrow` / `IconDownArrow` / `IconLeftArrow` / `IconRightArrow` | 带箭头 |
| `IconLoading`（+ `spin`） | 加载 |

---

## 💡 典型场景

### 按钮内图标

```tsx
// 图标 + 文字
<Button type="primary">
  <IconAdd size={16} />
  <span style={{ marginLeft: 4 }}>新增</span>
</Button>

// 纯图标
<Button type="text" icon={<IconDelete size={16} />} />

// 加载态
<Button loading={loading}>
  {loading ? <IconLoading spin size={16} /> : <IconSave size={16} />}
  保存
</Button>
```

### 输入框

```tsx
<Input prefix={<IconSearch size={16} color="#999" />} placeholder="搜索..." />
<Input suffix={<IconHelp size={16} color="#999" />} />
```

### 可折叠面板

```tsx
<div onClick={() => setCollapsed(!collapsed)}>
  标题 <IconDown rotate={collapsed ? 0 : 180} />
</div>
```

### 表格操作列

```tsx
<Space>
  <a onClick={() => handleEdit(record)}><IconEdit size={16} /></a>
  <a onClick={() => handleDelete(record)}><IconDelete size={16} color="#ff4d4f" /></a>
</Space>
```

### 状态展示（配表驱动）

```tsx
const STATUS_CONFIG = {
  success: { Icon: CheckCircleFilled, color: '#52c41a', text: '通过' },
  warning: { Icon: IconWarning, color: '#faad14', text: '待审' },
  error:   { Icon: IconError, color: '#ff4d4f', text: '失败' },
};

const { Icon, color, text } = STATUS_CONFIG[status];
return <span style={{ color }}><Icon size={16} /> {text}</span>;
```

---

## 🎯 尺寸与间距速查

| 场景 | size | 间距 |
|---|---|---|
| 按钮图标 | 16 | 文字 marginLeft 4px |
| 输入框图标 | 16 | Antd 自动 |
| 标题图标 | 20-24 | 与标题 marginRight 4px |
| 表格操作列 | 16 | Space size={8} |
| 提示图标 | 16-20 | 与文字 marginLeft 4px |
| 默认 | 不传 | - |

---

## ⚠️ 注意事项

1. **默认尺寸已改**（1.2858em）：需固定 24px 的显式传 `size={24}`
2. **不要内联固定尺寸样式**：`style={{ width: 16 }}` → 改 `size={16}`
3. **命名冲突**：通用 `IconClose` 与 antd-icons `CloseOutlined` 并存时用别名：
   ```typescript
   import { IconClose as IconCloseCommon } from '@alife/icbu-common-icon-react';
   import CloseOutlined from '@alife/icbu-common-icon-react/es/antd-icons/icons/CloseOutlined';
   ```
4. **无障碍**：纯图标交互加 `title` 或外层包 `Tooltip`
   ```tsx
   <Tooltip title="删除">
     <a onClick={handleDelete}><IconDelete size={16} /></a>
   </Tooltip>
   ```
5. **升级图标库前**：查 CHANGELOG；重点看命名变化（历史上 `IconQuestion` → `IconHelp` 就是破坏性）

---

## 🚀 新增图标（高级）

新 SVG 图标需走图标库生成流程，**不要直接引 SVG 文件**：

1. SVG 放 `source/icbu-common-icon-react/figma/<分类>/name.svg`（kebab-case）
2. `cd source/icbu-common-icon-react && npm run generate:meta`
3. 检查 `metadata.json` / `src/icons/index.tsx` 有新组件
4. 代码中 `import { IconNewName } from '@alife/icbu-common-icon-react'`

SVG 要求：kebab-case 命名、无空格/特殊字符、尽量只含 `<path>`。

---

## 📚 相关规范

- [`crated-antd.md`](./crated-antd.md) - Antd 组件使用 + Fusion Icon → 新图标映射速查
- [`css-standards.md`](./css-standards.md) - BEM / 间距规范
- [`components.md`](../02-architecture/components.md) - 组件结构
