# Emo Code Sage

一个用于 Web 项目的静态代码分析工具，支持 JavaScript、TypeScript 和 Vue 文件。

## 功能特性

- 🔍 **多语言支持**：支持 JavaScript、TypeScript 和 Vue 单文件组件
- 📏 **丰富的规则集**：内置多种代码质量检测规则
- 📊 **多种报告格式**：支持 HTML 和 Markdown 报告输出
- ⚙️ **灵活配置**：支持配置文件自定义规则和预设
- 🚀 **易于集成**：可作为 CLI 工具或集成到 CI/CD 流程

## 内置规则

### JavaScript 规则

| 规则名 | 说明 | 默认级别 |
|--------|------|----------|
| `no-console-log` | 检测 console.log 语句 | warning |
| `no-debugger` | 检测 debugger 语句 | error |
| `unmanaged-timeout` | 检测未清理的 setTimeout/setInterval | warning |
| `large-function` | 检测过大的函数（默认超过 50 行） | warning |
| `duplicate-import` | 检测重复导入 | error |

### TypeScript 规则

| 规则名 | 说明 | 默认级别 |
|--------|------|----------|
| `no-any` | 检测 any 类型的使用 | warning |

### Vue 规则

| 规则名 | 说明 | 默认级别 |
|--------|------|----------|
| `no-deep-watch` | 检测深度监听的使用 | warning |
| `no-direct-dom` | 检测直接操作 DOM | warning |
| `no-inline-style` | 检测内联样式 | warning |
| `too-many-props` | 检测 props 过多（默认超过 5 个） | warning |
| `no-v-if-with-v-for` | 检测 v-if 和 v-for 同时使用 | error |
| `large-component` | 检测过大的组件（默认超过 300 行） | warning |

## 安装

```bash
npm install emo-code-sage
# 或
pnpm add emo-code-sage
# 或
yarn add emo-code-sage
```

## 使用方法

### CLI 命令

```bash
# 分析指定路径的项目
npx emo-code-sage analyze <path>

# 示例
npx emo-code-sage analyze ./src
```

### 配置文件

在项目根目录创建 `emocodesage.config.js`：

```javascript
/** @type {import('emo-code-sage').UserConfig} */
module.exports = {
  // 继承预设配置
  extends: ['recommended'],

  // 自定义规则
  rules: {
    'no-console-log': 'error',
    'no-debugger': 'off',
    'large-function': ['warning', { maxSize: 100 }]
  },

  // 包含的文件
  include: ['src/**/*.{js,ts,vue,jsx,tsx}'],

  // 排除的文件
  exclude: ['**/node_modules/**', '**/dist/**'],

  // 自定义规则
  customRules: [
    {
      name: 'my-custom-rule',
      category: 'js',
      severity: 'warning',
      analyze(sourceFile, context) {
        // 自定义分析逻辑
      }
    }
  ]
};
```

### 配置选项

| 选项 | 类型 | 说明 |
|------|------|------|
| `extends` | `string[]` | 继承的预设配置 |
| `rules` | `object` | 规则配置，可覆盖预设 |
| `include` | `string[]` | 包含的文件模式（glob） |
| `exclude` | `string[]` | 排除的文件模式（glob） |
| `customRules` | `CustomRule[]` | 自定义规则数组 |

### 规则级别

- `'off'` - 关闭规则
- `'warning'` - 警告级别
- `'error'` - 错误级别

## 报告输出

分析完成后会生成以下报告文件：

- `emo-report.html` - HTML 格式报告，可在浏览器中查看
- `emo-report.md` - Markdown 格式报告

## 开发

```bash
# 克隆仓库
git clone <repository-url>

# 安装依赖
pnpm install

# 构建
pnpm run build
```

## License

MIT
