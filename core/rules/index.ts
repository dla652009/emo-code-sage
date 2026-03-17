import { Rule } from '../analyzer/types';
import { noConsoleLogRule } from './noConsoleLog';
import { noDebuggerRule } from './noDebugger';
import { unmanagedTimeoutRule } from './noUnmanagedTimeout';
import { largeFunctionRule } from './largeFunction';
import { noAnyRule } from './noAny';
import { duplicateImportRule } from './duplicateImport';

// 将所有的规则汇总在一个数组中暴露出去，方便主流程一次性注册
export const builtinRules: Rule[] = [
  noConsoleLogRule,
  noDebuggerRule,
  unmanagedTimeoutRule,
  largeFunctionRule,
  noAnyRule,
  duplicateImportRule
];

// 同时单独导出，方便其他地方按需引入
export { noConsoleLogRule, noDebuggerRule, unmanagedTimeoutRule, largeFunctionRule, noAnyRule, duplicateImportRule };
