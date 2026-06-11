---
description: '导入规范 · 具名导入 · 禁 import * · @ 别名 · 禁相对路径'
alwaysApply: false
---

# 导入（Import）规范

> 导出规范见 [`exports.md`](./exports.md)；类型导入细节见 [`typescript.md`](./typescript.md)。

---

## 🎯 4 条铁律

1. **具名导入**：`import { x } from '...'`，禁 `import x from '...'`（例外见下）
2. **禁 `import *`**：用什么导什么
3. **`src/` 内用 `@/` 别名**：禁相对路径跨目录
4. **按需导入**：只导需要的，IDE 清理未用

---

## ✅ 正确写法

```typescript
// ✅ 具名导入
import { getMemberId, getLocale } from '@/common/cookie';

// ✅ 多项合并为一行
import { UserCard, UserCardHeader, UserCardBody } from '@/components/UserCard';

// ✅ @ 别名
import { getCertList } from '@/services/cert';

// ✅ 类型导入用 type
import type { MemberInfo } from '@/types';
import { type UserCardProps } from '@/components/UserCard';
```

### 第三方库同样按需

```typescript
// ✅
import { isEmpty, isArray } from 'lodash-es';
import { Button, Dialog, Message } from '@alifd/next';

// ❌
import * as _ from 'lodash';
_.isEmpty(value);
```

---

## 📋 导入顺序

```typescript
// 1. React / 核心库
import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

// 2. 第三方 UI
import { Button, Modal, message } from 'antd';

// 3. 第三方工具
import { isEmpty, isArray } from 'lodash-es';

// 4. 项目内部（按字母或功能分组）
import { getMemberId, getLocale } from '@/common/cookie';
import { dot, setSpmABAndSendPV } from '@/common/dot';
import { UserCard } from '@/components/UserCard';
import { CertStatus } from '@/constants/status';
import { useAuth } from '@/hooks/useAuth';
import { getCertList } from '@/services/cert';
import type { MemberInfo } from '@/types';

// 5. 样式 / 静态资源（最后）
import './index.scss';
```

---

## ❌ 禁止

### 1. `import *`

```typescript
// ❌
import * as cookie from '@/common/cookie';
import * as util from '@/common/util';
import * as queryString from 'query-string';

cookie.getMemberId();
util.isEmpty(value);

// ✅
import { getMemberId } from '@/common/cookie';
import { isEmpty } from '@/common/util';
import { parse } from 'query-string';
```

### 2. `src/` 内用相对路径

```typescript
// ❌
import { getMemberId } from '../../../common/cookie';
import { UserCard } from '../../components/UserCard';

// ✅
import { getMemberId } from '@/common/cookie';
import { UserCard } from '@/components/UserCard';
```

**例外**：同级或父级一层（`./utils` / `./components/X`）可以用相对路径。

### 3. 从 `index.ts` 中转导入

```typescript
// ❌ 项目禁止设置 index.ts 做二次导出
import { getMemberId } from '@/common';
import { getCertList } from '@/services';

// ✅ 直接从源文件
import { getMemberId } from '@/common/cookie';
import { getCertList } from '@/services/cert';
```

### 4. 未使用的导入

IDE 保存时自动清理（`unused-imports/no-unused-imports`）。

---

## ⚠️ 允许默认导入的 3 个例外

```typescript
// 1. React
import React from 'react';
import ReactDOM from 'react-dom';

// 2. request.jsx（历史原因）
import request from '@/services/request';

// 3. 样式 / 静态资源
import './index.scss';
import logo from '@/assets/logo.png';
```

其他场景一律具名导入。

---

## 🛠️ `@` 别名配置

```javascript
// webpack.config.js
resolve: {
  alias: { '@': path.resolve(__dirname, 'src') },
}
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  }
}
```

---

## 💡 IDE 自动优化

- **VSCode / Cursor**：`Shift + Option/Alt + O` = Organize Imports（去重 / 排序 / 清理未用）
- 配合 lint-staged 的 `eslint --fix` 自动处理

---

## ✅ 提交前自检

- [ ] 所有导入都是**具名**（例外：React / `request.jsx` / 样式 / 静态资源）
- [ ] 没有 `import * as ...`
- [ ] `src/` 跨目录用 `@/` 别名，不用 `../../..`
- [ ] 同一文件多项导入合并为一行
- [ ] 类型导入用 `import type` 或 `import { type }`
- [ ] 无未使用的导入
- [ ] 导入顺序：核心库 → UI → 工具 → 项目内 → 样式

---

## 📚 相关规范

- [`exports.md`](./exports.md) - 导出规范
- [`typescript.md`](./typescript.md) - TypeScript 类型导入
- [`common.md`](../02-architecture/common.md) - common/ 导入模式
- [`services.md`](../02-architecture/services.md) - services/ 导入模式
