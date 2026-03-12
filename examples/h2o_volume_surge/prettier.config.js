// prettier.config.js
/**
 * @type {import('prettier').Config}
 * @see https://www.prettier.cn/docs/options.html
 */
export default {
  printWidth: 120, // 单行最大长度
  tabWidth: 2, // 一个tab代表的空格数
  useTabs: false, // 是否使用tab进行缩进，false为使用空格缩进
  semi: true, // 句末是否使用分号
  singleQuote: true, // 字符串是否使用单引号
  endOfLine: 'auto', // 行尾换行符，'auto'表示保持文件原有的换行符
  trailingComma: 'none', // 对象和数组最后一个元素后面是否加逗号，'none'表示不加
  arrowParens: 'avoid', // 箭头函数参数的处理方式，'avoid' 表示尽可能避免使用括号（除非必要）
  proseWrap: 'always', // Markdown文本是否总是换行
  experimentalTernaries: false, // 允许在三元表达式中换行（实验性功能）
  quoteProps: 'consistent', // 对象属性名是否使用引号，'consistent'表示与对象的属性值保持一致
  jsxSingleQuote: false, // 在JSX中使用双引号而不是单引号
  bracketSpacing: true, // 对象字面量的大括号内是否加空格
  bracketSameLine: false, // 多行JSX、HTML和数组字面量是否尽量把'>'或']'放在最后一行的末尾，false表示'>'或']'不与最后一个元素在同一行
  jsxBracketSameLine: false, // 在多行JSX中把'>'放在最后一行的末尾，而不是单独放在一行
  vueIndentScriptAndStyle: false, // 在.vue文件中，<script>和<style>标签是否缩进
  singleAttributePerLine: false // 在单行中是否强制单个属性（默认多个属性可以在同一行）
};
