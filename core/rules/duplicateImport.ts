import { SourceFile } from 'ts-morph';
import { Rule, RuleContext } from '../analyzer/types';

export const duplicateImportRule: Rule = {
  name: 'duplicate-import',
  description: '检测重复 import',

  analyze(sourceFile: SourceFile, context: RuleContext) {
    const imports = sourceFile.getImportDeclarations();

    const map = new Map<string, number>();

    for (const imp of imports) {
      const module = imp.getModuleSpecifierValue();

      const count = map.get(module) || 0;

      map.set(module, count + 1);
    }

    for (const [module, count] of map) {
      if (count > 1) {
        context.report(`模块 "${module}" 被重复 import`, sourceFile);
      }
    }
  }
};
