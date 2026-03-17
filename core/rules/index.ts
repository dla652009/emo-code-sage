import { Rule } from '../analyzer/types';
import { noConsoleLogRule } from './noConsoleLog';

// 将所有的规则汇总在一个数组中暴露出去，方便主流程一次性注册
export const builtinRules: Rule[] = [
  noConsoleLogRule
  // TODO: 后续在这里添加更多新规则
];

// 同时单独导出，方便其他地方按需引入
export { noConsoleLogRule };
