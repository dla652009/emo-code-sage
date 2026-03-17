import { SourceFile } from 'ts-morph';
import { Rule, RuleContext } from '../../analyzer/types';

export const noVIfWithVForRule: Rule = {
  name: 'no-v-if-with-v-for',
  category: 'vue',
  severity: 'warning',
  description: '避免在同一元素上同时使用 v-if 和 v-for',

  analyze(sourceFile: SourceFile, context: RuleContext) {
    const text = sourceFile.getFullText();

    const pattern = /v-for=.*v-if=|v-if=.*v-for=/;

    if (pattern.test(text)) {
      context.report('检测到 v-if 与 v-for 同时使用，建议使用 computed 过滤列表', sourceFile);
    }
  }
};
