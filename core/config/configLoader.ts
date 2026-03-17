import { cosmiconfig } from 'cosmiconfig';
import { UserConfig, ResolvedConfig, RuleConfigValue } from './types';
import { recommendedPreset } from '../presets/recommended';
import { logger } from '../../utils/logger';

const MODULE_NAME = 'emocodesage';

export class ConfigLoader {
  private explorer = cosmiconfig(MODULE_NAME);

  async loadConfig(filePath?: string): Promise<ResolvedConfig> {
    try {
      const result = filePath ? await this.explorer.load(filePath) : await this.explorer.search();

      if (result && result.config) {
        logger.info(`Loaded configuration from ${result.filepath}`);
        return this.resolveConfig(result.config as UserConfig);
      }
    } catch (error) {
      logger.error('Failed to load configuration:', error);
    }

    logger.info('No configuration found, using default settings.');
    return this.resolveConfig({});
  }

  private resolveConfig(userConfig: UserConfig): ResolvedConfig {
    // 1. Start with defaults
    let rules: Record<string, RuleConfigValue> = {};
    const customRules = userConfig.customRules || [];
    const include = userConfig.include || ['**/*.{js,ts,vue,jsx,tsx}'];
    const exclude = userConfig.exclude || ['**/node_modules/**', '**/dist/**'];

    // 2. Apply extends (Presets)
    const presetsToExtend = userConfig.extends || ['recommended'];

    for (const presetName of presetsToExtend) {
      if (presetName === 'recommended') {
        rules = { ...rules, ...recommendedPreset.rules };
      } else {
        // TODO: Support loading other presets (e.g., from npm packages)
        logger.warn(`Preset ${presetName} not supported yet.`);
      }
    }

    // 3. Apply user rules (overrides)
    if (userConfig.rules) {
      Object.entries(userConfig.rules).forEach(([name, config]) => {
        rules[name] = config;
      });
    }

    return {
      rules,
      customRules,
      include,
      exclude
    };
  }
}
