import { logger } from '../utils/logger';
import { scanProject } from './scanner/projectScanner';
import { parseFile } from './parser';

export async function analyzeProject(root: string) {
  // 1.扫描文件
  logger.start(`正在扫描项目: ${root}`);
  const files = await scanProject(root);
  files.forEach(file => logger.log(` - ${file}`));
  logger.success(`扫描完成，共找到 ${files.length} 个文件`);

  // 2.解析文件
  logger.start(`正在解析 ${files.length} 个文件`);
  const asts = await Promise.all(files.map(parseFile));
  logger.success(`解析完成，共解析 ${asts.filter(Boolean).length} 个文件`);
  // 3.分析AST
  // 4.执行规则
  // 5.输出报告
}
