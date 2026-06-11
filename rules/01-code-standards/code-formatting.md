---
description: '格式化工具链 · EditorConfig + Prettier + ESLint · 职责分离 · 配置一致'
alwaysApply: false
---

# 代码格式化工具链

> 三件套分工：**EditorConfig**（编辑器输入）、**Prettier**（格式化）、**ESLint**（质量）。

---

## 🎯 职责分工

| 工具 | 职责 | 时机 | 修改文件 |
|---|---|---|---|
| **EditorConfig** | 缩进 / 行尾 / 字符集 / 末尾空行 | 输入时实时 | ❌ |
| **Prettier** | 代码格式化（引号 / 分号 / 行宽 / 括号） | 保存时 | ✅ |
| **ESLint** | 质量 / 逻辑 / 最佳实践 | 保存 / 提交前 | ✅ 部分 |

**执行顺序**：EditorConfig 输入时生效 → Prettier 保存时格式化 → ESLint 修复余下问题（通过 `plugin:prettier/recommended` 集成 Prettier）。

---

## 📋 项目当前配置

### `.editorconfig`

```ini
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false

[package.json]
insert_final_newline = false
```

### `.prettierrc`

```json
{
  "singleQuote": true,
  "semi": true,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "printWidth": 100,
  "jsxBracketSameLine": false
}
```

### `.eslintrc.js`（要点）

```javascript
{
  extends: [
    '@ali/eslint-config-att/typescript/react',
    'plugin:prettier/recommended', // 必须放最后，覆盖冲突的格式规则
    'plugin:import/recommended',
  ],
  plugins: ['prettier', 'import', 'unused-imports'],
  rules: {
    'no-undef': 'error',
    'no-empty': 'error',
    'import/order': 'error',
    'unused-imports/no-unused-imports': 'warn',
  },
}
```

---

## ⚖️ 配置一致性铁律

### 缩进必须三处一致

| 配置项 | EditorConfig | Prettier |
|---|---|---|
| 缩进样式 | `indent_style = space` | `useTabs: false` |
| 缩进大小 | `indent_size = 2` | `tabWidth: 2` |

**改一处要同步改另一处**。不一致会导致输入/保存间相互覆盖，格式反复横跳。

### ESLint **不要**配格式规则

```javascript
// ❌ 禁止：与 Prettier 冲突
rules: {
  indent: ['error', 2],
  quotes: ['error', 'single'],
  semi: ['error', 'always'],
}

// ✅ 格式规则全交给 Prettier；ESLint 只管质量
```

---

## 🛠️ 编辑器 / CI 集成

### VSCode（`.vscode/settings.json`）

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "[javascript]":       { "editor.defaultFormatter": "esbenp.prettier-vscode" },
  "[typescript]":       { "editor.defaultFormatter": "esbenp.prettier-vscode" },
  "[javascriptreact]":  { "editor.defaultFormatter": "esbenp.prettier-vscode" },
  "[typescriptreact]":  { "editor.defaultFormatter": "esbenp.prettier-vscode" }
}
```

**顺序**：先 Prettier（`formatOnSave`）→ 后 ESLint（`fixAll.eslint`）。

### `package.json` + lint-staged

```json
{
  "scripts": {
    "prettier": "prettier --write ./src/**/*.{js,jsx,ts,tsx}",
    "lint": "eslint --ext .js,.jsx,.ts,.tsx ./src",
    "lint:fix": "eslint --fix --ext .js,.jsx,.ts,.tsx ./src"
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["prettier --write", "eslint --fix"]
  }
}
```

### `.prettierignore`

```
build
dist
node_modules
public
*.min.js
*.min.css
```

---

## ❓ 常见问题

**Q：EditorConfig 和 Prettier 的缩进配置重复了，会冲突吗？**
不会。EditorConfig 在输入时生效，Prettier 在格式化时生效（覆盖输入结果）。两者**值必须一致**。

**Q：ESLint 已集成 Prettier，还需要 `.prettierrc` 吗？**
需要。`.prettierrc` 是 Prettier 自身的配置源，ESLint 通过 `plugin:prettier/recommended` 读取这个配置。

**Q：为什么要三个工具？不能只用 ESLint？**
职责不同：编辑器输入规则、代码格式化、代码质量检查，各司其职且跨编辑器 / 跨语言能力差异很大。

---

## ✅ 配置一致性自检

- [ ] `.editorconfig` `indent_style = space` 与 `.prettierrc` `useTabs: false` 一致
- [ ] `.editorconfig` `indent_size` 与 `.prettierrc` `tabWidth` 一致
- [ ] `.eslintrc.js` 末尾包含 `plugin:prettier/recommended`
- [ ] `.eslintrc.js` 没有 `indent` / `quotes` / `semi` 这类格式规则
- [ ] VSCode `formatOnSave: true` + `source.fixAll.eslint: true`
- [ ] `.prettierignore` 覆盖构建产物
- [ ] `lint-staged` 先 prettier 再 eslint

---

## 📚 相关文档

- [EditorConfig](https://editorconfig.org/)
- [Prettier](https://prettier.io/)
- [ESLint](https://eslint.org/)
- [Prettier 与 ESLint 集成](https://prettier.io/docs/en/integrating-with-linters.html)
