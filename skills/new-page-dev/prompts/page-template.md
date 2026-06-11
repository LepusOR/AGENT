# 新页面契约模板

本文件只维护新页面的契约、资产清单和交付摘要模板；流程编排见 `SKILL.md`。

## 适用模式

- `draft`：填写页面名、路由、业务名、最小骨架资产
- `standard`：填写完整页面契约、必做注册点、条件注册点
- `full`：在 standard 基础上补充领域、术语、ADR / 权限 / 埋点决策

## 页面契约 Schema

```json
{
  "type": "new-page",
  "mode": "draft | standard | full",
  "pageName": "<PascalCase，如 CertAppeal>",
  "routePath": "</kebab/path，如 /certification/cert-appeal>",
  "businessName": "<中文业务名>",
  "menuHint": "<菜单归属线索>",
  "domain": "<cert|strength|deep|reverify|brand|misc-rights|unknown>",
  "fields": [],
  "apis": [],
  "query": [],
  "permissions": null,
  "needsSpm": false,
  "understanding": {
    "goal": "",
    "target": "",
    "acceptance": []
  },
  "assumptions": [],
  "uncertainties": [],
  "user_ack": false
}
```

## 命名契约

| 项 | 规则 | 示例 |
| --- | --- | --- |
| 目录名 | PascalCase | `CertAppeal` |
| 路由 | kebab-case，和目录语义一致 | `/certification/cert-appeal` |
| chunkName | kebab-case，不能与既有 chunk 重名 | `cert-appeal` |
| 组件导出 | named export | `export const CertAppeal = () => ...` |
| SCSS root | kebab-case BEM block | `.cert-appeal` |
| i18n 前缀 | page camel | `crmweb.certAppeal.*` |
| data-spm | page kebab + 组件 + 动作 | `cert-appeal-form-submit` |
| URL 函数 | named export | `getCertAppealUrl` |
| URL query type | interface | `ICertAppealUrlParams` |

## 资产清单模板

```markdown
## 资产清单

### 页面内
- `src/pages/<PageName>/index.tsx`
- `src/pages/<PageName>/index.scss`
- `src/pages/<PageName>/components/<Component>/index.tsx`（按需）

### 共享资产
- `src/services/<domain>.ts`：新增 / 扩展接口
- `src/types/*`：业务类型（按需）
- `src/interfaces/url-params.ts`：query 类型（按需）
- `src/hooks/*` / `src/stores/*` / `src/constants/*`：按需，禁止放在页面目录下自建共享层

### 必做注册点
- `src/App.tsx`
- `src/menu.ts`
- `src/common/url.ts`
- `../page-dev/references/pages-map.md`
- `src/interfaces/url-params.ts`（有 query 时）

### 条件注册点
- `src/spm.ts`：PRD 明确页面级埋点时
- `src/permissions.ts` + `PermissionGuard`：PRD 明确权限控制时
```

## PRD 回执补充项

`standard/full` 使用 `../page-dev/prompts/ack-template.md` 时，新增页面回执必须额外包含：

- 页面名 / 路由 / 业务中文名
- 菜单归属线索
- 必做注册点列表
- 条件注册点是否需要：spm / permissions
- `ROUTE_TO_MENU_CODE_MAP` 的 menuCode 是否已知；未知必须列为不确定项

## 注册点 Checklist

```markdown
## 注册点
- [ ] App.tsx — lazy + Route
- [ ] menu.ts — 菜单项
- [ ] menu.ts — ROUTE_TO_MENU_CODE_MAP（menuCode 已由用户确认）
- [ ] common/url.ts — get<PageName>Url
- [ ] interfaces/url-params.ts — I<PageName>UrlParams（有 query 时）
- [ ] pages-map.md — 追加页面索引
- [ ] spm.ts — 已新增 / 未涉及
- [ ] permissions — 已新增 / 未涉及
```

## 交付摘要模板

```markdown
## 新页面交付摘要

- 模式：draft / standard / full
- 业务名：<businessName>
- 路由：<routePath>
- 页面目录：`src/pages/<PageName>/`
- 新建文件：<清单>
- 修改文件：<清单，标注注册点>
- 注册点：<Checklist>
- 自检：<已执行命令 / 未执行说明>
- Review：<code-reviewer 或主线程结论>
- 未 commit：是
```
