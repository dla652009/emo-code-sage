import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['bin/cli.ts'],
  // 输出格式，支持 CommonJS (cjs) 和 ES Module (esm)
  format: ['cjs', 'esm'],
  // 生成类型声明文件 (.d.ts)
  dts: true,
  // 代码分割，CLI 工具通常不需要分割，设为 false 可以打成单个文件
  splitting: false,
  // 生成 source map 文件，方便调试
  sourcemap: true,
  // 每次构建前清理输出目录 (dist)
  clean: true,
  // 注入 Node.js 的一些 shim (如 __dirname, __filename 等)，对 ESM 格式很有用
  shims: true,
  // 不压缩代码，方便阅读和调试。生产环境可以设为 true
  minify: false
});
