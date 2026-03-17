import { RuleConfigValue } from '../config/types';

export const recommendedPreset: { rules: Record<string, RuleConfigValue> } = {
  rules: {
    'no-console-log': 'warning',
    'no-debugger': 'error',
    'unmanaged-timeout': 'warning',
    'large-function': ['warning', { maxSize: 50 }],
    'no-any': 'warning',
    'duplicate-import': 'error',
    'no-deep-watch': 'warning',
    'no-direct-dom': 'warning',
    'no-inline-style': 'warning',
    'too-many-props': ['warning', { max: 5 }],
    'no-v-if-with-v-for': 'error',
    'large-component': ['warning', { maxLines: 300 }]
  }
};
