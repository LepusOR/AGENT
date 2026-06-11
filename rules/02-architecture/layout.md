---
title: "src/Layout 布局组件规范"
description: "全局布局组件的开发规范"
tags: ["layout", "component"]
priority: medium
alwaysApply: false
version: "1.0.0"
last_updated: "2025-12-19"
---


> src/Layout/ - 布局组件

## 目录职责

提供页面布局组件（如页头、页脚、侧边栏等）。

## 文件组织

\`\`\`
Layout/
├── index.ts
├── view.ts
├── index.scss
└── model.ts
\`\`\`

## 使用说明

布局组件通常包裹页面内容，提供统一的页面框架。

\`\`\`javascript
// 使用布局
import Layout from '@/Layout';

const Page = () => {
  return (
    <Layout>
      <div>页面内容</div>
    </Layout>
  );
};
\`\`\`

## 注意事项

- 布局组件应该通用，不包含页面特定逻辑
- 如果需要页面特定布局，放在页面目录下
