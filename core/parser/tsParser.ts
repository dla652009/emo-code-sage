import { Project, SourceFile, ScriptTarget, ModuleKind } from 'ts-morph';
import { logger } from '../../utils/logger';

export class TsParser {
  private project: Project;

  constructor() {
    this.project = new Project({
      compilerOptions: {
        target: ScriptTarget.ESNext,
        module: ModuleKind.ESNext,
        allowJs: true,
        skipLibCheck: true,
        noEmit: true
      },
      skipAddingFilesFromTsConfig: true,
      useInMemoryFileSystem: true // 使用内存文件系统，避免影响实际文件
    });
  }

  /**
   * 解析 TypeScript/JavaScript 代码内容
   * @param filePath 文件路径（虚拟路径或真实路径）
   * @param content 代码内容
   * @returns ts-morph SourceFile 对象
   */
  parse(filePath: string, content: string): SourceFile {
    try {
      // 创建或更新源文件
      // overwrite: true 允许重复解析同一个路径
      const sourceFile = this.project.createSourceFile(filePath, content, {
        overwrite: true
      });
      return sourceFile;
    } catch (error) {
      logger.error(`Failed to parse TS file: ${filePath}`, error);
      throw error;
    }
  }

  /**
   * 获取 ts-morph Project 实例
   */
  getProject(): Project {
    return this.project;
  }
}
