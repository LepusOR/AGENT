---
description: 'Antd Form 陷阱 · Form.Item 单子元素 · 禁止手写 value/onChange · DatePicker getValueFromEvent'
alwaysApply: false
---

# Antd Form 隐蔽陷阱 & 最佳实践

> **血的教训**：本页所有坑**编译不报错 / UI 正常**，但 `onValuesChange` 静默失败，表单提交拿不到值。浪费过整天的人都记录于此。

---

## 🔴 铁律 1：`Form.Item` 只能有**一个**直接子元素

多个子元素时，Form.Item 无法识别哪个是表单控件 → **不注入 `value` / `onChange`** → `getValueFromEvent` 永不触发 → 提交字段 `undefined`。

说明信息用 **`extra` 属性**，不要作为子元素：

```tsx
// ❌ 致命
<Form.Item name="field" label="标签">
  <DatePicker />
  <p>提示内容</p>   {/* 导致 Form.Item 完全失效 */}
</Form.Item>

// ✅ 首选：extra
<Form.Item name="field" label="标签" extra={<p>提示内容</p>}>
  <DatePicker />
</Form.Item>

// ✅ 兜底：移出（布局可能不理想）
<>
  <Form.Item name="field" label="标签"><DatePicker /></Form.Item>
  <p>提示内容</p>
</>
```

### 为什么推荐 `extra`

- 语义正确 / 自动布局 / 响应式 / 可访问性好
- Antd 原生支持，无副作用

---

## 🔴 铁律 2：表单控件**不要手写** `value` / `onChange`

Form.Item 会**自动注入** `value` 和 `onChange`。手写会**覆盖注入**，机制失效。

### ❌ 错误全家桶

```tsx
// Input / TextArea / Select 都一样
export const FormCertNo = ({ value, onChange, disabled }: IProps) => (
  <CertFormItem name="certNo" label="证书编号">
    <Input
      value={value}                              // ❌ 覆盖注入
      onChange={(e) => onChange?.(e.target.value)} // ❌ 覆盖注入
      disabled={disabled}
    />
  </CertFormItem>
);

export interface IProps {
  value?: string;                        // ❌ props 就不该有
  onChange?: (v: string) => void;        // ❌ props 就不该有
  disabled?: boolean;
}
```

### ✅ 正确

```tsx
export const FormCertNo = ({ disabled }: IProps) => (
  <CertFormItem name="certNo" label="证书编号">
    <Input disabled={disabled} />
  </CertFormItem>
);

export interface IProps {
  disabled?: boolean;  // 只留业务配置
}
```

**适用所有受 Form.Item 管理的控件**：`Input` / `TextArea` / `Select` / `DatePicker` / `InputNumber` / `Checkbox` / `Radio` / `Switch` ...

---

## 🔴 铁律 3：DatePicker 值格式转换走 `getValueFromEvent` + `getValueProps`

`DatePicker` 的 `onChange` 返回 `Dayjs` 对象，但表单通常存字符串（如 `'2026-01-15'`）。**不要**在 `<DatePicker>` 上手写 `onChange` 转字符串，那样会触发铁律 2。

```tsx
import dayjs, { Dayjs } from 'dayjs';

export const FormCertExpiredDate = ({ disabled, showTip }: IProps) => (
  <CertFormItem
    name="expiredDate"
    label="到期时间"
    extra={showTip ? <p>产品证书说明…</p> : undefined}
    // Dayjs → 字符串，存入表单
    getValueFromEvent={(value: Dayjs | null) =>
      value ? value.format('YYYY-MM-DD') : ''
    }
    // 字符串 → Dayjs，喂给 DatePicker 渲染
    getValueProps={(value: string | Dayjs | null) => ({
      value: value ? (typeof value === 'string' ? dayjs(value) : value) : null,
    })}
  >
    <DatePicker id="expiredDate" disabled={disabled} />
  </CertFormItem>
);
```

**关键**：`getValueFromEvent` / `getValueProps` 必须**成对出现**；`<DatePicker>` 上**不要**手写 `onChange` / `value`。

---

## 🧩 依赖其他字段 → `Form.Item shouldUpdate`

子控件 Props 需要依赖表单里另一个字段时：

```tsx
<Form.Item noStyle shouldUpdate={(prev, cur) => prev.availableDate !== cur.availableDate}>
  {({ getFieldValue }) => (
    <FormCertExpiredDate
      availableDate={getFieldValue('availableDate')}
      certType={CertType.Product}
    />
  )}
</Form.Item>
```

---

## ✅ 标准模板

### Input / Select / TextArea

```tsx
export const FormXxx = ({ disabled, options }: IFormXxxProps) => (
  <CertFormItem name="fieldName" label="字段标签">
    <Input disabled={disabled} />
    {/* 或 Select options={options} / TextArea */}
  </CertFormItem>
);

export interface IFormXxxProps {
  disabled?: boolean;
  options?: { label: string; value: string }[];
  // ❌ 没有 value / onChange
  // ✅ 可加 className / validator 等业务配置
}
```

### DatePicker（带提示）

见上方铁律 3 代码，直接复制。

---

## 🔍 出问题怎么定位

### 1. 确认 `onValuesChange` 是否触发

```tsx
<Form
  form={form}
  onValuesChange={(changed, all) => console.log('[Form] change', changed, all)}
>
```

改字段值后**没日志** = 铁律 1 / 2 / 3 之一被破坏。

### 2. 检查 Props 接口

```tsx
// 红色警报：出现 value / onChange = 大概率有问题
export interface IProps {
  value?: string;           // ❌
  onChange?: (v: any) => void; // ❌
}
```

### 3. 检查控件 JSX

```tsx
// 红色警报
<Input value={...} onChange={...} />
<Select value={...} onChange={...} />
<DatePicker onChange={...} />
```

### 4. DatePicker 专项：给 `getValueFromEvent` 加日志

```tsx
getValueFromEvent={(v: Dayjs | null) => {
  console.log('[expiredDate] getValueFromEvent', v);
  return v ? v.format('YYYY-MM-DD') : '';
}}
```

- 改值后**有日志** → 正常
- 改值后**无日志** → 铁律 1 或 2 被破坏（Form.Item 没能注入 onChange）

---

## 🔥 Code Review 检查清单

### Props 接口

- [ ] ❌ 不出现 `value?: any`
- [ ] ❌ 不出现 `onChange?: (...) => void`
- [ ] ✅ 只有业务配置（`options` / `disabled` / `validator` / `className`）

### 控件 JSX

- [ ] `<Input>` / `<Select>` / `<TextArea>` / `<DatePicker>` / `<InputNumber>` **没有** `value=` / `onChange=`

### Form.Item 子元素（最致命）

- [ ] 🔴 只有**一个**直接子元素（表单控件）
- [ ] 🔴 说明信息走 `extra` 属性
- [ ] ✅ 必须移外面的，用 Fragment 包

### DatePicker 专项

- [ ] `getValueFromEvent` + `getValueProps` **成对出现**
- [ ] `<DatePicker>` 上**无** `value=` / `onChange=`

### 功能验证

- [ ] 改字段值后 `onValuesChange` 触发
- [ ] `changedValues` 含该字段新值
- [ ] 提交时字段值正确
- [ ] `rules` 验证正常

---

## 📚 相关规范

- [`components.md`](./components.md) - 组件命名 / Props `I` 前缀
- [`hooks.md`](./hooks.md) - `useCallback` 引用稳定性
- [`interfaces.md`](../01-code-standards/interfaces.md) - Props 类型定义
- [`exports.md`](../01-code-standards/exports.md) - 具名导出
