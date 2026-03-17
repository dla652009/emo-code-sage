import { AnalysisResult } from '../analyzer/types';

export interface ReporterOptions {
  /**
   * 输出文件路径（不包含后缀名，后缀名由报告器自己决定）
   * 如果不提供，则返回生成的字符串而不写入文件
   */
  outputFile?: string;
}

export interface Reporter {
  /**
   * 报告器名称
   */
  name: string;

  /**
   * 生成报告
   * @param results 分析结果列表
   * @param options 报告选项
   * @returns 生成的报告内容（字符串）
   */
  generate(results: AnalysisResult[], options?: ReporterOptions): Promise<string>;
}
