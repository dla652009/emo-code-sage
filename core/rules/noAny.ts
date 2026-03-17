import { SourceFile, SyntaxKind } from 'ts-morph';
import { Rule, RuleContext } from '../analyzer/types';

export const noAnyRule: Rule = {
  name: 'no-any',
  description: '检测 any 类型的使用',

  analyze(sourceFile: SourceFile, context: RuleContext) {
    const anyTypes = sourceFile.getDescendantsOfKind(SyntaxKind.AnyKeyword);

    for (const node of anyTypes) {
      context.report('检测到 any 类型，建议使用更具体的类型', node);
    }
  }
};
