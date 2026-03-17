/** @type {import('./core/config/types').UserConfig} */
module.exports = {
  // 继承的预设配置
  extends: ['recommended'],

  // 自定义规则配置
  rules: {
    // 示例：将 no-console-log 规则设置为 error 级别
    // 'no-console-log': 'error',
    // 示例：关闭 no-debugger 规则
    // 'no-debugger': 'off',
    // 示例：配置规则选项
    // 'large-function': ['warning', { maxSize: 100 }]
  },

  // 包含的文件模式
  // include: ['src/**/*.{js,ts,vue,jsx,tsx}'],

  // 排除的文件模式
  // exclude: ['**/node_modules/**', '**/dist/**'],

  // 自定义规则实现
  customRules: [
    /*
    {
      name: 'my-custom-rule',
      category: 'js',
      severity: 'warning',
      analyze(sourceFile, context) {
        // 自定义分析逻辑
      }
    }
    */
  ]
};
