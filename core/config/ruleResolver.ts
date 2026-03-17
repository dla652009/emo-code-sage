import { Rule, Severity } from '../analyzer/types';
import { ResolvedConfig, RuleConfigValue } from './types';
import { builtinRules } from '../rules';

export function resolveRules(config: ResolvedConfig): Rule[] {
  // Combine built-in rules with custom rules from config
  const allRulesMap = new Map<string, Rule>();

  builtinRules.forEach(rule => allRulesMap.set(rule.name, rule));
  config.customRules.forEach(rule => allRulesMap.set(rule.name, rule));

  const activeRules: Rule[] = [];

  // Iterate over configured rules
  for (const [ruleName, ruleConfig] of Object.entries(config.rules)) {
    const rule = allRulesMap.get(ruleName);

    if (!rule) {
      // Configured rule not found (maybe a typo or a plugin rule not loaded)
      // For now, just ignore it, or log a warning
      console.warn(`Warning: Rule "${ruleName}" not found in available rules.`);
      continue;
    }

    const severity = getSeverity(ruleConfig);
    if (severity === 'off') {
      continue;
    }

    const options = getOptions(ruleConfig);

    // Create a shallow copy of the rule with resolved configuration
    const activeRule: Rule = {
      ...rule,
      severity,
      options: options // If undefined, AstAnalyzer will fall back to defaultOptions
    };

    activeRules.push(activeRule);
  }

  return activeRules;
}

function getSeverity(config: RuleConfigValue): Severity | 'off' {
  if (Array.isArray(config)) {
    return config[0];
  }
  return config as Severity | 'off';
}

function getOptions(config: RuleConfigValue): any {
  if (Array.isArray(config) && config.length > 1) {
    return config[1];
  }
  return undefined;
}
