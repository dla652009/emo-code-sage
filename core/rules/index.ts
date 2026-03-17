import { Rule } from '../analyzer/types';
import { noConsoleLogRule } from './js/noConsoleLog';
import { noDebuggerRule } from './js/noDebugger';
import { unmanagedTimeoutRule } from './js/noUnmanagedTimeout';
import { largeFunctionRule } from './js/largeFunction';
import { duplicateImportRule } from './js/duplicateImport';

import { noAnyRule } from './ts/noAny';

import { largeComponentRule } from './vue/largeComponent';
import { noDeepWatchRule } from './vue/noDeepWatch';
import { noDirectDomRule } from './vue/noDirectDom';
import { noVIfWithVForRule } from './vue/noVIfWithVFor';
import { noInlineStyleRule } from './vue/noInlineStyle';
import { tooManyPropsRule } from './vue/tooManyProps';

export const builtinRules: Rule[] = [
  noConsoleLogRule,
  noDebuggerRule,
  unmanagedTimeoutRule,
  largeFunctionRule,
  noAnyRule,
  duplicateImportRule,
  noDeepWatchRule,
  noDirectDomRule,
  noInlineStyleRule,
  tooManyPropsRule,
  noVIfWithVForRule,
  largeComponentRule
];

// 同时单独导出，方便其他地方按需引入
export {
  noConsoleLogRule,
  noDebuggerRule,
  unmanagedTimeoutRule,
  largeFunctionRule,
  noAnyRule,
  duplicateImportRule,
  noDeepWatchRule,
  noDirectDomRule,
  noInlineStyleRule,
  tooManyPropsRule,
  noVIfWithVForRule,
  largeComponentRule
};
