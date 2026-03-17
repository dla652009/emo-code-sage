import path from 'path';
import { logger } from '../utils/logger';
import { scanProject } from './scanner/projectScanner';
import { parseFile } from './parser';
import { AstAnalyzer } from './analyzer';
import { builtinRules } from './rules';
import { MarkdownReporter, HtmlReporter } from './reporter';

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

  // 3.分析AST 执行规则
  logger.start(`正在进行 AST 分析及执行规则...`);
  const analyzer = new AstAnalyzer();

  // 注册所有内置规则
  analyzer.addRules(builtinRules);

  const results = analyzer.analyze(asts);
  logger.success(`规则执行完成，共发现 ${results.length} 个问题`);

  // 4.输出报告
  logger.start(`正在生成报告...`);

  // 在终端输出简要信息
  if (results.length > 0) {
    results.forEach(result => {
      const loc = result.location ? `:${result.location.line}:${result.location.column}` : '';
      const message = `[${result.ruleName}] ${result.filePath}${loc} - ${result.message}`;

      if (result.severity === 'error') {
        logger.error(message);
      } else if (result.severity === 'warning') {
        logger.warn(message);
      } else {
        logger.info(message);
      }
    });
  } else {
    logger.success(`🎉 未发现任何问题。`);
  }

  // 导出 Markdown 和 HTML 报告到当前工作目录下的 emo-report
  const reportBaseName = path.resolve(process.cwd(), 'emo-report');

  const mdReporter = new MarkdownReporter();
  await mdReporter.generate(results, { outputFile: reportBaseName });

  const htmlReporter = new HtmlReporter();
  await htmlReporter.generate(results, { outputFile: reportBaseName });

  logger.success(`所有报告生成完毕！`);
}
