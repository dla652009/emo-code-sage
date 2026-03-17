import { SourceFile } from 'ts-morph';
import { Rule, RuleContext } from '../../analyzer/types';

export const largeComponentRule: Rule = {
  name: 'large-component',
  category: 'vue',
  severity: 'warning',
  description: '组件文件过大，建议拆分',

  analyze(sourceFile: SourceFile, context: RuleContext) {
    const lines = sourceFile.getFullText().split('\n').length;

    if (lines > 400) {
      context.report(`组件文件过大 (${lines} 行)，建议拆分组件`, sourceFile);
    }
  }
};
