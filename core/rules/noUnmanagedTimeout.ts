import { SourceFile, SyntaxKind } from 'ts-morph';
import { Rule, RuleContext } from '../analyzer/types';

export const unmanagedTimeoutRule: Rule = {
  name: 'unmanaged-timeout',
  severity: 'info',
  description: '检测未管理的 setTimeout 调用',

  analyze(sourceFile: SourceFile, context: RuleContext) {
    const calls = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression);

    for (const call of calls) {
      const expr = call.getExpression();

      if (expr.getText() === 'setTimeout') {
        context.report('发现 setTimeout 调用，建议确保组件卸载时清理定时器', call);
      }
    }
  }
};
