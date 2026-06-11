---
title: "src/history 路由历史管理规范"
description: "路由历史管理的开发规范"
tags: ["history", "router"]
priority: low
alwaysApply: false
version: "1.0.0"
last_updated: "2025-12-19"
---


> src/history/ - 路由历史管理

## 目录职责

管理路由历史记录，提供路由跳转功能。

## 使用说明

通常结合 React Router 使用，提供编程式导航。

\`\`\`javascript
// history/index.ts
import { createBrowserHistory } from 'history';

export const history = createBrowserHistory();

// 使用
import { history } from '@/history';

history.push('/auth/overview');
history.replace('/auth/detail');
history.go(-1);
\`\`\`

## 注意事项

- 优先使用 React Router 的 hooks（useNavigate）
- 仅在无法使用 hooks 的地方使用 history
