import { SourceFile, Node } from 'ts-morph';

export type Severity = 'error' | 'warning' | 'info';
export type Category = 'js' | 'ts' | 'vue';

export interface RuleContext<TOptions = any> {
  /**
   * 当前分析的文件路径
   */
  filePath: string;

  /**
   * 报告一个分析发现或错误
   * @param message 描述信息
   * @param node 相关的 AST 节点 (可选)
   */
  report(message: string, node?: Node): void;

  /**
   * 规则配置选项
   */
  options?: TOptions;
}

export interface Rule<TOptions = any> {
  /**
   * 规则名称
   */
  name: string;

  /**
   * 类别
   */
  category: Category;

  /**
   * 规则严重程度
   * @default 'warning'
   */
  severity?: Severity;

  /**
   * 规则描述
   */
  description?: string;

  /**
   * 默认选项
   */
  defaultOptions?: TOptions;

  /**
   * 运行时选项 (由配置系统注入)
   */
  options?: TOptions;

  /**
   * 规则执行主体
   * @param sourceFile 当前处理的 ts-morph SourceFile
   * @param context 分析上下文
   */
  analyze(sourceFile: SourceFile, context: RuleContext<TOptions>): void;
}

export interface AnalysisResult {
  /**
   * 规则名称
   */
  ruleName: string;

  /**
   * 规则类别
   */
  category: Category;

  /**
   * 严重程度
   */
  severity: Severity;

  /**
   * 文件路径
   */
  filePath: string;

  /**
   * 问题描述
   */
  message: string;

  /**
   * 位置信息
   */
  location?: {
    line: number;
    column: number;
  };
}
