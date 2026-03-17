import { SourceFile, Node } from 'ts-morph';

export type Severity = 'error' | 'warning' | 'info';
export type Category = 'js' | 'ts' | 'vue';
export interface RuleContext {
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
}

export interface Rule {
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
   * 规则执行主体
   * @param sourceFile 当前处理的 ts-morph SourceFile
   * @param context 分析上下文
   */
  analyze(sourceFile: SourceFile, context: RuleContext): void;
}

export interface AnalysisResult {
  /**
   * 触发结果的规则名称
   */
  ruleName: string;

  /**
   * 规则类别
   */
  category: Category;

  /**
   * 规则严重程度
   */
  severity: Severity;

  /**
   * 相关的文件路径
   */
  filePath: string;

  /**
   * 结果描述信息
   */
  message: string;

  /**
   * 具体的代码位置信息（行号、列号等）
   */
  location?: {
    line: number;
    column: number;
  };
}
