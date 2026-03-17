import { Rule } from '../analyzer/types';

export type RuleSeverity = 'off' | 'info' | 'warning' | 'error';

export type RuleConfigValue = RuleSeverity | [RuleSeverity, ...any[]];

export interface UserConfig {
  /**
   * 继承的预设
   */
  extends?: string[];

  /**
   * 规则配置
   * key: 规则名称
   * value: 严重程度 或 [严重程度, 选项]
   */
  rules?: Record<string, RuleConfigValue>;

  /**
   * 自定义规则实现
   */
  customRules?: Rule[];

  /**
   * 包含的文件模式
   */
  include?: string[];

  /**
   * 排除的文件模式
   */
  exclude?: string[];
}

export interface ResolvedConfig {
  rules: Record<string, RuleConfigValue>;
  customRules: Rule[];
  include: string[];
  exclude: string[];
}
