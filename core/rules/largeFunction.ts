import { SourceFile } from 'ts-morph';
import { Rule, RuleContext } from '../analyzer/types';

export const largeFunctionRule: Rule = {
  name: 'large-function',
  description: '检测函数过大',

  analyze(sourceFile: SourceFile, context: RuleContext) {
    const functions = sourceFile.getFunctions();

    for (const fn of functions) {
      const body = fn.getBody();

      if (!body) continue;

      const lines = body.getText().split('\n').length;

      if (lines > 80) {
        context.report(`函数 ${fn.getName()} 过大 (${lines} 行)，建议拆分`, fn);
      }
    }
  }
};
