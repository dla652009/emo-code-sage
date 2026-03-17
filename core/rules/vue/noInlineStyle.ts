import { SourceFile } from 'ts-morph';
import { Rule, RuleContext } from '../../analyzer/types';

export const noInlineStyleRule: Rule = {
  name: 'no-inline-style',
  category: 'vue',
  severity: 'warning',
  description: '避免使用 inline style',

  analyze(sourceFile: SourceFile, context: RuleContext) {
    const text = sourceFile.getFullText();

    if (text.includes('style="')) {
      context.report('检测到 inline style，建议使用 class', sourceFile);
    }
  }
};
