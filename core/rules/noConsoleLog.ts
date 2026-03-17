import { SourceFile, SyntaxKind } from 'ts-morph';
import { Rule, RuleContext } from '../analyzer/types';

export const noConsoleLogRule: Rule = {
  name: 'no-console-log',
  description: '禁止在代码中保留 console.log',
  analyze(sourceFile: SourceFile, context: RuleContext) {
    // 找到所有的函数调用表达式
    const callExpressions = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression);

    for (const callExpr of callExpressions) {
      const expression = callExpr.getExpression();

      // 判断是否是属性访问 (如 console.log)
      if (expression.getKind() === SyntaxKind.PropertyAccessExpression) {
        const propAccess = expression.asKindOrThrow(SyntaxKind.PropertyAccessExpression);
        const objText = propAccess.getExpression().getText();
        const propName = propAccess.getName();

        if (objText === 'console' && propName === 'log') {
          // 报告问题并传入对应的 AST 节点，底层会自动计算出行列号
          context.report('发现了 console.log 调用，建议在生产环境中移除', callExpr);
        }
      }
    }
  }
};
