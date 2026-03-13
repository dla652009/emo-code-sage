/**
 * 项目扫描器
 */
import fg from 'fast-glob';
import path from 'path';
import { logger } from '../../utils/logger';

export interface ScannerOptions {
  /**
   * 要扫描的文件扩展名
   * @default ['js', 'ts', 'vue', 'jsx', 'tsx']
   */
  extensions?: string[];

  /**
   * 忽略的模式
   * @default ['**\/node_modules/**', '**\/dist/**', '**\/.git/**']
   */
  ignore?: string[];

  /**
   * 是否返回绝对路径
   * @default true
   */
  absolute?: boolean;
}

export class ProjectScanner {
  private options: ScannerOptions;

  constructor(options: ScannerOptions = {}) {
    this.options = {
      extensions: ['js', 'ts', 'vue', 'jsx', 'tsx'],
      ignore: ['**/node_modules/**', '**/dist/**', '**/.git/**'],
      absolute: true,
      ...options
    };
  }

  /**
   * 扫描指定目录下的文件
   * @param dirPath 要扫描的根目录路径
   * @returns 匹配的文件路径列表
   */
  async scan(dirPath: string): Promise<string[]> {
    const { extensions, ignore, absolute } = this.options;

    // 构建 glob 模式，例如: "**/*.{js,ts,vue,jsx,tsx}"
    const pattern = `**/*.{${extensions?.join(',')}}`;

    // 确保路径格式正确
    const cwd = path.resolve(dirPath);

    try {
      const files = await fg(pattern, {
        cwd,
        ignore,
        absolute,
        onlyFiles: true
      });

      return files;
    } catch (error) {
      logger.error(`Error scanning directory ${dirPath}:`, error);
      throw error;
    }
  }
}

export function scanProject(root: string) {
  const scanner = new ProjectScanner();
  return scanner.scan(root);
}
