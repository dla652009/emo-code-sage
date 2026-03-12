import { ProjectScanner } from './scanner/projectScanner';
import { logger } from '../utils/logger';

export async function analyzeProject(root: string) {
  // 1.扫描文件
  logger.start(`正在扫描项目: ${root}`);
  const scanner = new ProjectScanner();
  const files = await scanner.scan(root);
  files.forEach(file => logger.log(` - ${file}`));
  logger.success(`扫描完成，共找到 ${files.length} 个文件`);
  // 2.解析文件
  // 3.分析AST
  // 4.执行规则
  // 5.输出报告
}
