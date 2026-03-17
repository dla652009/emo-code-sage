import { SourceFile, SyntaxKind } from 'ts-morph';
import { Rule, RuleContext } from '../../analyzer/types';

export const noDebuggerRule: Rule = {
  name: 'no-debugger',
  category: 'js',
  severity: 'error',
  description: '禁止在代码中使用 debugger',

  analyze(sourceFile: SourceFile, context: RuleContext) {
    const nodes = sourceFile.getDescendantsOfKind(SyntaxKind.DebuggerStatement);

    for (const node of nodes) {
      context.report('发现 debugger 语句，建议移除', node);
    }
  }
};
