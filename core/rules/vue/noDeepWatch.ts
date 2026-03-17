import { SourceFile, SyntaxKind } from 'ts-morph';
import { Rule, RuleContext } from '../../analyzer/types';

export const noDeepWatchRule: Rule = {
  name: 'no-deep-watch',
  category: 'vue',
  severity: 'warning',
  description: '避免使用 deep watch，可能导致性能问题',

  analyze(sourceFile: SourceFile, context: RuleContext) {
    const calls = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression);

    for (const call of calls) {
      const expr = call.getExpression();

      if (expr.getText() === 'watch') {
        const args = call.getArguments();

        const options = args[2];

        if (options && options.getText().includes('deep: true')) {
          context.report('检测到 deep watch，建议拆分 watch 或使用 computed', call);
        }
      }
    }
  }
};
