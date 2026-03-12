import { SourceFile } from 'ts-morph';

export interface AnalysisResult<T = any> {
  filePath: string;
  items: T[];
}

export abstract class BaseAnalyzer<T = any> {
  /**
   * 分析源文件
   * @param sourceFile ts-morph 的 SourceFile 对象
   */
  abstract analyze(sourceFile: SourceFile): Promise<AnalysisResult<T>>;
}
