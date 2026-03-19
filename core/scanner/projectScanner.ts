import fs from 'fs';
import fg from 'fast-glob';
import path from 'path';
import { logger } from '@utils/logger';

export interface ScannerOptions {
  /**
   * 自定义 glob 模式
   * 如果提供，将忽略 extensions 选项
   */
  patterns?: string[];

  /**
   * 要扫描的文件扩展名 (当 patterns 未提供时生效)
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
   * 扫描指定目录下的文件，或者直接返回单文件
   * @param targetPath 要扫描的目录或文件路径
   * @returns 匹配的文件路径列表
   */
  async scan(targetPath: string): Promise<string[]> {
    const { extensions, ignore, absolute, patterns } = this.options;

    // 确保路径格式正确
    const absolutePath = path.resolve(targetPath);

    try {
      // 检查路径是否存在
      const stats = await fs.promises.stat(absolutePath);

      // 如果是文件，直接返回（前提是符合扩展名要求）
      if (stats.isFile()) {
        return [absolutePath];
      }

      // 如果是目录，则进行 glob 扫描
      let scanPatterns: string[];

      if (patterns && patterns.length > 0) {
        scanPatterns = patterns;
      } else {
        // 构建默认 glob 模式
        scanPatterns = [`**/*.{${extensions?.join(',')}}`];
      }

      const files = await fg(scanPatterns, {
        cwd: absolutePath,
        ignore,
        absolute,
        onlyFiles: true
      });

      return files;
    } catch (error) {
      logger.error(`Error scanning path ${targetPath}:`, error);
      throw error;
    }
  }
}

export function scanProject(root: string, options?: ScannerOptions) {
  const scanner = new ProjectScanner(options);
  return scanner.scan(root);
}
