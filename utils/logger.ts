import { createConsola, type ConsolaInstance } from 'consola';

/**
 * 统一的日志工具
 */
export const logger: ConsolaInstance = createConsola({
  level: 3, // Info level by default
  formatOptions: {
    colors: true,
    compact: false,
    date: false
  }
  // 可以在这里配置更多的 consola 选项，例如自定义 reporter
});

export default logger;
