import { SourceFile, SyntaxKind } from 'ts-morph';
import { Rule, RuleContext } from '../../analyzer/types';

export const tooManyPropsRule: Rule = {
  name: 'too-many-props',
  category: 'vue',
  severity: 'warning',
  description: '组件 props 过多',

  analyze(sourceFile: SourceFile, context: RuleContext) {
    const props = sourceFile.getDescendantsOfKind(SyntaxKind.PropertyAssignment);

    if (props.length > 8) {
      context.report(`检测到 ${props.length} 个 props，建议减少组件参数`, sourceFile);
    }
  }
};
