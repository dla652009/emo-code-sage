import { SourceFile, SyntaxKind } from 'ts-morph';
import { Rule, RuleContext } from '../../analyzer/types';

export const noDirectDomRule: Rule = {
  name: 'no-direct-dom',
  category: 'vue',
  severity: 'warning',
  description: '避免直接操作 DOM',

  analyze(sourceFile: SourceFile, context: RuleContext) {
    const calls = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression);

    for (const call of calls) {
      const text = call.getText();

      if (text.includes('document.querySelector') || text.includes('document.getElementById')) {
        context.report('检测到直接 DOM 操作，建议使用 ref', call);
      }
    }
  }
};
