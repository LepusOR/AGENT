# 注册点清单（新页面注册）

`standard/full` 必须逐项落盘；`draft` 只在用户选择临时注册时按需使用。每项给出**文件、动作、范式参考、注意事项**四栏。

---

## 1. `src/App.tsx` — 路由注册【必做】

**动作**：
- 顶部加 `lazy` import：
  ```ts
  const <PageName> = lazy(() =>
    import(/* webpackChunkName: "<chunk-kebab>" */ './pages/<PageName>').then(m => ({
      default: m.<PageName>,
    })),
  );
  ```
- 路由区加：
  ```tsx
  <Route path="<routePath>" element={<<PageName> />} />
  ```

**范式参考**：既有 `CertUpload`、`CertDetail` 等 25 个懒加载页面（`src/App.tsx` L52+）

**注意**：
- 页面组件 **named export**，所以 import 时需 `.then(m => ({ default: m.<PageName> }))` 适配 `lazy` 的 default 协议
- `webpackChunkName` 使用 kebab-case，不能与既有 chunk 同名
- `CertManage` / `CertManageOld` 特例：直接 import 不懒加载（不要参照）

---

## 2. `src/menu.ts` — 菜单注册【必做】

**动作**：
- 追加菜单项（i18n 文案）
- 填 `ROUTE_TO_MENU_CODE_MAP`（L59）：
  ```ts
  const ROUTE_TO_MENU_CODE_MAP: Record<string, string[]> = {
    ...
    '<routePath>': ['<menuCode1>', '<menuCode2>'],  // ← 必须用户确认
  };
  ```

**范式参考**：`src/menu.ts` 内既有条目

**注意（强停）**：
- `menuCode` PRD **通常不含**，必须 `AskUserQuestion` 让用户给
- **严禁自己编造** menuCode
- 路由 key 必须与 App.tsx 的 `<Route path>` **逐字符一致**

---

## 3. `src/common/url.ts` — URL 生成器【必做】

**动作**：
- 新增：
  ```ts
  export const get<PageName>Url = (query?: I<PageName>UrlParams) => {
    // 参考 getCertManageUrl / getBrandProtectionManageUrl 的动态灰度签名
  };
  ```

**范式参考**：
- 无 query：参考 `getAuthTagUrl`、`getBrandProtectionUrl`
- 有 query：参考 `getCertManageUrl(query?: ICertManageUrlParams)`、`getBrandProtectionManageUrl`

**注意**：
- 遵循现有动态灰度模式（通过函数调用，不导出常量）
- query 参数类型从 `@/interfaces/url-params` import
- 函数 named export

---

## 4. `src/interfaces/url-params.ts` — URL 参数类型【条件必做】

**动作**：仅当页面接收 query 时。
```ts
export interface I<PageName>UrlParams {
  // 按 PRD 字段列类型
}
```

**范式参考**：既有 `ICertManageUrlParams`、`IBrandProtectionManageUrlParams`

**注意**：命名模式 `I<PageName>UrlParams`，named export

---

## 5. `../page-dev/references/pages-map.md` — 索引追加【必做】

**动作**：表格追加一行
```markdown
| <PageName> | <businessName> |
```

**注意**：
- 按字母序插入（保持与既有顺序一致）
- 页面清单数量注释（文件顶部「28 个」）同步 +1

---

## 6. `src/spm.ts` — 埋点注册【条件】

**触发条件**：PRD 明确提出页面级埋点或交互埋点位点

**动作**：按既有 spm 结构追加 key。

**未触发时**：跳过，在交付摘要中注明「spm 未涉及」。

---

## 7. `src/permissions.ts` + `PermissionGuard` — 权限门【条件】

**触发条件**：PRD 明确要求权限控制

**动作**：
- `src/permissions.ts` 追加权限点
- `src/App.tsx` Route 外包 `<PermissionGuard permission={...}>`

**未触发时**：跳过，在交付摘要中注明「permissions 未涉及」。

---

## 注册点 checklist 输出样板（交付摘要用）

```
## 注册点
- [x] App.tsx      — lazy + Route 已加
- [x] menu.ts      — 菜单项 + ROUTE_TO_MENU_CODE_MAP 已加（menuCode: XXX，已与用户确认）
- [x] common/url.ts — get<Page>Url 已导出
- [x] interfaces/url-params.ts — I<Page>UrlParams 已加
- [x] pages-map.md — 已追加
- [ ] spm.ts       — 未涉及（PRD 未要求）
- [ ] permissions  — 未涉及（PRD 未要求）
```
