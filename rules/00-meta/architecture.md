---
description: 'cdn-auth-center 项目架构 · 技术栈 · 目录职责 · 核心链路'
alwaysApply: false
---

# 项目架构说明

> **对象**：新成员 / 跨模块协作者 / AI 助手
> 本文只讲**全貌与边界**；具体规范见 [`README.md`](../README.md) 索引。

---

## 🎯 项目定位

**cdn-auth-center**（内部名「认证中心 2.0」），B2B 国际站供应商侧的**认证 / 权益 / 营销资源入口**统一门户，承接：

- 证书管理（上传、绑定类目、验真、过期提醒）
- 金品 / 领袖 / 出口通 会员身份与权益分发
- 实力卡片 / 视频验厂 / 全景验厂 / VR 展厅 等实力展示
- 认证场景（前台买家侧）与营销活动入口
- 品牌保护入口与数据看板

域名：`i.alibaba.com/verified/*`、`crmweb.alibaba.com/deep2/*`。
Layout 最小宽度 1200px，主容器固定 1128px（见 [`css-standards.md §页面布局`](../03-styling/css-standards.md)）。

---

## 🧱 技术栈

| 层 | 选型 | 备注 |
| --- | --- | --- |
| 框架 | React 18.3 + TypeScript 5 | 全部函数组件 + Hooks，禁 Class |
| 路由 | react-router-dom 6 + history 5 | `unstable_HistoryRouter` 支持全局 history |
| 状态 | zustand 4.5 + ahooks 3 | 禁 Redux；跨页共享走 `src/stores/` |
| UI 库 | `@alife/crated-antd`（Antd 4）+ antd 5 + `@alifd/next` 1.x | 混用，优先 crated-antd |
| 表单 | antd Form + `@formily/next`（遗留） | 新代码一律 antd Form |
| 请求 | `@/common/request` + `@/hooks/useRequest` | 内置 CSRF / JSONP / 2.5s 缓存；禁裸 `fetch`/`axios` |
| 埋点 | `@ali/aes-tracker` + `src/spm.ts`（自动 PV）+ `@/common/dot`（手动） | Critical 规则 |
| i18n | `@alife/ads-common-utils`（namespace `crmweb_authcenter`） | 禁虚构 ID |
| 构建 | Webpack 5 + `@ali/hera-toolkit` 2 + esbuild-loader | 命令见 `package.json` |
| 监控 | `alife-logger`（itrace）+ web-vitals CLS/INP | `src/index.tsx` 挂全局 error/rejection |

---

## 📂 目录职责

```
src/
├── index.tsx          # 入口：createRoot + 全局错误/CLS + history 挂载
├── App.tsx            # 路由表 + 懒加载 + PermissionGuard
├── menu.ts            # 菜单 URL 改写（统一转 i.alibaba.com）
├── permissions.ts     # 页面权限表
├── spm.ts             # SPM 自动 PV
├── pages/             # 页面（28 个），一页一目录
├── components/        # 全局复用组件（PascalCase 目录 = 组件名）
├── hooks/             # 自定义 Hooks（useXxx），以 useRequest 为核心
├── services/          # API 封装（按域拆分：cert.ts / golden.ts）
├── stores/            # zustand 全局状态（按域拆分）
├── common/            # 通用工具（request/dot/i18n/url/cookie/window/logger/storage）
├── Layout/            # 全局布局（左菜单 + 顶部 + 内容区）
├── history/           # history 实例 + LocationContext + url-params
├── constants/         # 纯常量（禁放 TS 类型 / 业务逻辑）
├── styles/            # 全局样式入口（仅 reset / 字体 / 主题覆盖）
├── interfaces/        # 业务数据模型（I 前缀，跨域共享）
└── types/             # TS 类型工具 / 全局 declare（非业务数据）
```

### 职责红线

- `src/pages/**` **禁**创建 service 文件 → 所有接口放 `src/services/`
- `src/pages/xxx/components/` 只放**该页专用**组件；被 2 页以上复用立即晋升 `src/components/`
- `src/common/**` **不依赖 React**；`src/hooks/**` 依赖 React
- `src/constants/**` 仅导出字面量；业务枚举 / 文案映射也放这
- `src/interfaces/**` = **数据模型**；`src/types/**` = **类型工具 / declare 补丁**

---

## 🔄 核心链路

### 请求

```
页面 → useXxxData hook → service.xxx() → request() → { content | data }
                                       ↘ 自动注入 CSRF / ctoken
                                       ↘ JSONP 走 puck 适配
```

- 缓存：同 `cacheKey` 2.5s 内并发去重 + 结果复用（`src/hooks/useRequest.ts`）
- 错误：`response.hasError` 或 `success === false` 触发 `setError`，**不抛异常**
- CSRF：`getCsrfToken()` 拉 `crmweb.alibaba.com/authcenter/basic/getCsrfToken.json` 并缓存

### 路由

```
HistoryRouter + LocationProvider
  → Routes (App.tsx，全懒加载)
  → PermissionGuard (permissions.ts)
  → Layout (menu.ts + Suspense)
  → pages/Xxx/index.tsx
```

### 埋点（Critical）

```
页面挂载 → spm.ts 自动 PV（data-spm 根节点 + 路由）
交互    → 元素 data-spm / data-params → 自动点击埋点
手动    → @/common/dot → dot(eventId, params)
```

**铁律**：页面根节点必有 `data-spm`；可交互元素 `data-spm` **语义化 + 全局唯一**。

### 样式

```
页面 index.scss (.page-name 根作用域)
  → 子组件 index.scss (BEM .block__element)
  → 无全局污染（BEM 保证类名唯一）
```

禁全局 reset、通用类（`.title` / `.box` / `.card`）、`@import` 变量 / mixin。

---

## 🔒 跨模块约定

**命名** — 组件 `PascalCase/`、hook `useXxx.ts`、service / store / 常量 `kebab-case.ts`；CSS = BEM + `kebab-case`；事件 = 内部 `handleXxx`、props `onXxx`

**导入导出** — 组件一律 `export { Xxx }`（导入导出不匹配 → **React Error #130**）；工具函数 named export，禁 default、禁 `import *`；`src/` 内用 `@/` 别名

**提交** — 不自动 commit，除非用户显式要求；commit 风格参考最近 10 条 `git log`

**工具链** — 优先 `tnpm`（内网源，比 npm 快）；脚本见 `package.json`

**多语言** — 当前阶段多语言优先级低；新增文案**禁虚构 i18n ID**，直接写中文

---

## 🧭 开发入口

| 场景 | 入口 |
| --- | --- |
| 新建页面 | `/new-page-dev` skill 或 [`pages.md`](../02-architecture/pages.md) |
| 存量页面改动 | `/page-dev` skill 或 [`pages.md`](../02-architecture/pages.md) + [`change-principles.md`](./change-principles.md) |
| 新接口 | [`services.md`](../02-architecture/services.md) → 新建 `services/xxx.ts` + `hooks/useXxx.ts` |
| 新组件 | [`components.md`](../02-architecture/components.md)（先判断全局 vs 页面级） |
| 改样式 | [`css-standards.md`](../03-styling/css-standards.md)（BEM + 具体值） |
| 加埋点 | [`tracking.md`](../04-cross-cutting/tracking.md)（data-spm 规范） |
| 任何改动护栏 | [`change-principles.md`](./change-principles.md)（铁律 + 高频陷阱，**改结构不改视觉值**） |

---

## 📐 设计原则

1. **所见即所得**：SCSS 写具体值，禁变量 / mixin / 主题抽取
2. **数据内聚**：谁用数据谁取，不靠 props 传递全局可取数据
3. **重构保值**：结构优化为主，不改业务逻辑、不改视觉值
4. **不留占位**：禁 TODO / FIXME / 伪代码 / 未完成替换
5. **单一职责**：页面只编排，业务在组件，数据在 hook，接口在 service

---

## 🔄 维护

**更新时机**：新增顶层目录 / 核心链路变化 / 技术栈主版本升级 → 必须更新本文件。
**其他**：单个规则细节 → 改对应 `xx-xxx/*.md`，不必动本文件。
