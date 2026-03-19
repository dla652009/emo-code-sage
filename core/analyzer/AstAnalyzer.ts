import { SourceFile, Node } from 'ts-morph';
import { Rule, AnalysisResult, RuleContext } from './types';
import { logger } from '@utils/logger';

export class AstAnalyzer {
  private rules: Rule[] = [];
  private results: AnalysisResult[] = [];

  /**
   * 注册单个规则
   */
  addRule(rule: Rule) {
    this.rules.push(rule);
  }

  /**
   * 批量注册规则
   */
  addRules(rules: Rule[]) {
    this.rules.push(...rules);
  }

  /**
   * 提取 AST 分析阶段：对解析后的文件集执行规则
   * @param sourceFiles 解析出的 ts-morph SourceFile 列表
   */
  analyze(sourceFiles: (SourceFile | null)[]): AnalysisResult[] {
    // 过滤掉解析失败（null）的文件
    const validFiles = sourceFiles.filter((f): f is SourceFile => f !== null);

    logger.info(`AST Analyzer: 开始对 ${validFiles.length} 个文件执行 ${this.rules.length} 条规则`);

    validFiles.forEach(sourceFile => {
      const filePath = sourceFile.getFilePath();

      this.rules.forEach(rule => {
        // 构建当前规则执行的上下文
        const context: RuleContext = {
          filePath,
          options: rule.options || rule.defaultOptions, // 优先使用注入的选项，否则使用默认选项
          report: (message: string, node?: Node) => {
            // 清理可能存在的虚拟后缀（如 Vue 文件的 __virtual_script.js）
            const cleanFilePath = filePath.replace(/__virtual_script\.(ts|js|tsx|jsx)$/, '');

            const result: AnalysisResult = {
              ruleName: rule.name,
              category: rule.category,
              severity: rule.severity || 'warning',
              filePath: cleanFilePath,
              message
            };

            // 如果提供了 Node，可以提取具体的行列号信息
            if (node) {
              const startLine = node.getStartLineNumber();
              const startPos = node.getStart();
              const sourceFileText = sourceFile.getFullText();

              // 简单计算列号（当前行起始到节点起始的距离）
              let lineStart = sourceFileText.lastIndexOf('\n', startPos) + 1;
              if (lineStart < 0) lineStart = 0;
              const column = startPos - lineStart + 1;

              result.location = {
                line: startLine,
                column
              };
            }

            this.results.push(result);
          }
        };

        try {
          // 执行规则逻辑
          rule.analyze(sourceFile, context);
        } catch (error) {
          logger.error(`执行规则 ${rule.name} 于文件 ${filePath} 失败:`, error);
        }
      });
    });

    return this.results;
  }

  /**
   * 获取分析结果
   */
  getResults(): AnalysisResult[] {
    return this.results;
  }
}
