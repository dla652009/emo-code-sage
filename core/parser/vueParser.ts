import { parse, compileScript } from '@vue/compiler-sfc';
import { SourceFile } from 'ts-morph';
import { TsParser } from './tsParser';
import { logger } from '@utils/logger';

export class VueParser {
  private tsParser: TsParser;

  constructor() {
    // 复用 TsParser，或者可以在这里创建新的实例
    this.tsParser = new TsParser();
  }

  /**
   * 解析 Vue 文件内容，提取 script 部分并解析为 AST
   * @param filePath Vue 文件路径
   * @param content Vue 文件内容
   * @returns ts-morph SourceFile 对象 (仅包含 script 部分)
   */
  parse(filePath: string, content: string): SourceFile | null {
    try {
      // 1. 使用 @vue/compiler-sfc 解析 .vue 文件结构
      const { descriptor, errors } = parse(content, {
        filename: filePath,
        sourceMap: false
      });

      if (errors.length > 0) {
        logger.error(`Vue SFC parse errors in ${filePath}:`, errors);
        // 可以选择抛出错误或继续尝试
      }

      // 2. 提取脚本内容
      let scriptContent = '';
      let isTs = false;

      // 优先处理 <script setup>
      if (descriptor.scriptSetup || descriptor.script) {
        try {
          // 使用 compileScript 处理 <script setup>，它会处理 defineProps 等宏
          const scriptBlock = compileScript(descriptor, {
            id: filePath,
            isProd: false,
            sourceMap: false
          });
          scriptContent = scriptBlock.content;
          isTs = scriptBlock.lang === 'ts' || scriptBlock.lang === 'tsx';
        } catch (e) {
          // 如果 compileScript 失败（例如没有 script setup），尝试回退到直接读取 content
          // 但通常 compileScript 也能处理普通 script
          logger.warn(`Failed to compile script for ${filePath}, falling back to raw content. Error: ${e}`);
          if (descriptor.scriptSetup) {
            scriptContent = descriptor.scriptSetup.content;
            isTs = descriptor.scriptSetup.lang === 'ts' || descriptor.scriptSetup.lang === 'tsx';
          } else if (descriptor.script) {
            scriptContent = descriptor.script.content;
            isTs = descriptor.script.lang === 'ts' || descriptor.script.lang === 'tsx';
          }
        }
      } else {
        // 没有 script 标签，可能是仅有 template 的组件
        return null;
      }

      // 3. 构造虚拟文件名，确保 ts-morph 正确识别语言
      const ext = isTs ? '.ts' : '.js'; // 或者 .tsx / .jsx
      // 为了避免路径冲突，可以加后缀
      const virtualFilePath = `${filePath}__virtual_script${ext}`;

      // 4. 使用 TsParser 解析脚本内容
      return this.tsParser.parse(virtualFilePath, scriptContent);
    } catch (error) {
      logger.error(`Failed to parse Vue file: ${filePath}`, error);
      throw error;
    }
  }
}
