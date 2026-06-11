# 页面轻量索引（src/pages/）

用于 PRD → 目标页面的匹配。PRD 中的中文/业务名通过此表映射到实际目录。

## 约定

- 路径：`src/pages/<PageName>/`
- 典型结构：`index.tsx` + `index.scss` + `components/`
- hooks / services / stores / types 多从 `src/` 根级共享

## 页面清单（28 个）

| 目录名                  | 业务名（中文/别名线索）  |
| ----------------------- | ------------------------ |
| `AuthCardCapability`    | 实力卡片配置             |
| `AuthTag`               | 实力标签                 |
| `BrandProtection`       | 品牌保护                 |
| `BrandProtectionManage` | 品牌保护管理             |
| `CapacityVideo`         | 实力多媒体管理           |
| `CategoryVideoInfo`     | 金品诚企产品品类视频确认 |
| `CertBindCategory`      | 证书关联类目             |
| `CertDetail`            | 证书详情                 |
| `CertManage`            | 证书管理                 |
| `CertManageOld`         | 证书管理（旧）           |
| `CertRecommend`         | 证书推荐                 |
| `CertUpdateCategory`    | 证书更新类目             |
| `CertUpload`            | 证书上传                 |
| `Deep`                  | 金品认证                 |
| `DeepIndustry`          | 行业竞争力               |
| `DeepReportConfig`      | 认证报告配置             |
| `DeepRights`            | 金品权益中心             |
| `Index`                 | 认证首页                 |
| `NotFound`              | 404 页                   |
| `ReVerify`              | 补验列表                 |
| `ReVerifyDetail`        | 补验详情                 |
| `ReVerifyUpload`        | 报告补验                 |
| `RightAmapShop`         | 高德权益                 |
| `RightCenter`           | 专属权益                 |
| `ShowroomContribute`    | VR展厅投稿               |
| `ShowroomList`          | VR展厅列表               |
| `StarDirectGuaranteed`  | 星级保效                 |
| `StrengthCertification` | 实力认证                 |

## 匹配策略

1. PRD 中出现目录名 → 精确匹配
2. PRD 中出现中文业务名 → 按上表模糊匹配
3. 匹配到多个或 0 个 → 调 AskUserQuestion（见 `prompts/clarify.md` 场景 2/4）

## 维护

- 新增页面 → 在此表追加一行
- 重命名页面 → 更新表
- 本表为轻量索引，**非单页架构文档**；深入单页改动请读该页 `index.tsx`
