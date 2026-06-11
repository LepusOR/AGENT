# 脚手架 / 注册点完整度自检

先于 `static-checks.md` 与 npm 序列执行。

- `draft`：只检查页面骨架、命名契约，以及已选择的临时注册点
- `standard/full`：检查页面骨架、命名契约、必做注册点、条件注册点说明

任一应完成项 ❌ → 回填补齐；无法自动补齐 → 停问用户。

## 1. 页面骨架

- [ ] `src/pages/<PageName>/index.tsx` 存在
- [ ] `index.tsx` 使用 named export（`export const <PageName>`），**无 `export default`**
- [ ] 组件函数名 = 目录名 = named export 名（三处一致）
- [ ] `index.tsx` 顶层 JSX 有 root class，className 与目录 kebab-case 对齐
- [ ] `src/pages/<PageName>/index.scss` 存在，root selector 使用 BEM block
- [ ] import 使用 `@/` 别名（不使用 `../../../`）
- [ ] 无 `import *`

## 2. 命名契约自洽

- [ ] i18n key 前缀统一：`crmweb.<pageCamel>.*`
- [ ] `data-spm` 段前缀统一：`<page-kebab>-*`
- [ ] SCSS root class 与 `<page-kebab>` 一致
- [ ] 目录 PascalCase、路由 kebab-case，两者转换一致

## 3. 注册点：必做 5 项（standard/full）

- [ ] `src/App.tsx`：
  - [ ] 已加 `lazy(() => import(/* webpackChunkName: "<chunk>" */ './pages/<PageName>').then(m => ({ default: m.<PageName> })))`
  - [ ] 已加 `<Route path="<routePath>" element={...} />`
  - [ ] 已包裹 `<Suspense>` 或沿用既有 fallback
- [ ] `src/menu.ts`：
  - [ ] 已追加 menu 项（含 i18n 文案）
  - [ ] `ROUTE_TO_MENU_CODE_MAP[routePath]` 已由用户确认 menuCode 并写入（未确认 → 强停 S8）
- [ ] `src/common/url.ts`：
  - [ ] 已新增 `get<PageName>Url(query?)`
  - [ ] 签名与既有 `getCertManageUrl` / `getBrandProtectionManageUrl` 保持一致（动态灰度范式）
  - [ ] 如有 query，从 `@/interfaces/url-params` import 类型
- [ ] `src/interfaces/url-params.ts`：
  - [ ] 如有 query，已新增 `I<PageName>UrlParams` 并 export
- [ ] `../page-dev/references/pages-map.md`：
  - [ ] 表格已追加一行：`| <PageName> | <businessName> |`

## 4. 注册点：条件 2 项（standard/full）

- [ ] `src/spm.ts`：仅当 PRD 要求页面级埋点时，已新增对应 key（未要求 → 跳过，注明）
- [ ] `src/permissions.ts` + `PermissionGuard`：仅当 PRD 明示权限控制时（未要求 → 跳过，注明）

## 5. 共享资产新增位置

- [ ] services 新增在 `src/services/*.ts`，**不在** `src/pages/<PageName>/services/`
- [ ] types / interfaces 新增在 `src/types/*` 或 `src/interfaces/*`
- [ ] hooks / stores / constants 同上，走 `src/` 根级

## 6. 规则反向 grep

- [ ] `rtk grep -rn 'export default' src/pages/<PageName>/` 空
- [ ] `rtk grep -rn 'import \*' src/pages/<PageName>/` 空
- [ ] `rtk grep -rn 'TODO\|FIXME' src/pages/<PageName>/` 空
- [ ] `rtk grep -rn '<PageName>' src/App.tsx src/menu.ts src/common/url.ts` 各有命中（≥1 条）

## 输出格式

执行后输出 Markdown 报告：

```
## Scaffold Checks
- 模式：draft / standard / full
- 页面骨架：6/6 ✅
- 命名契约：4/4 ✅
- 必做注册点：5/5 ✅
- 条件注册点：spm（跳过）/ permissions（跳过）
- 共享资产位置：3/3 ✅
- 规则反向 grep：4/4 ✅
```

任一项失败 → 列出具体未满足条目 + 建议修复。
