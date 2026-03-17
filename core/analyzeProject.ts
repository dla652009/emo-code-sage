import path from 'path';
import { logger } from '../utils/logger';
import { scanProject } from './scanner/projectScanner';
import { parseFile } from './parser';
import { AstAnalyzer } from './analyzer';
import { MarkdownReporter, HtmlReporter } from './reporter';
import { ConfigLoader } from './config/configLoader';
import { resolveRules } from './config/ruleResolver';

export async function analyzeProject(root: string) {
  // 0. 加载配置
  logger.start(`正在加载配置...`);
  const configLoader = new ConfigLoader();
  const config = await configLoader.loadConfig();
  logger.success(`配置加载完成`);

  // 1.扫描文件
  logger.start(`正在扫描项目: ${root}`);
  const files = await scanProject(root, {
    patterns: config.include,
    ignore: config.exclude
  });
  // files.forEach(file => logger.log(` - ${file}`)); // Reduce verbosity for large projects
  logger.success(`扫描完成，共找到 ${files.length} 个文件`);

  if (files.length === 0) {
    logger.warn('未找到任何文件，请检查路径或配置。');
    return;
  }

  // 2.解析文件
  logger.start(`正在解析 ${files.length} 个文件`);
  const asts = await Promise.all(files.map(parseFile));
  const validAsts = asts.filter(Boolean);
  logger.success(`解析完成，共解析 ${validAsts.length} 个文件`);

  // 3.分析AST 执行规则
  logger.start(`正在进行 AST 分析及执行规则...`);
  const analyzer = new AstAnalyzer();

  // 解析并注册规则
  const activeRules = resolveRules(config);
  analyzer.addRules(activeRules);

  logger.info(`已启用 ${activeRules.length} 条规则`);

  const results = analyzer.analyze(asts); // analyzer internal filters nulls
  logger.success(`规则执行完成，共发现 ${results.length} 个问题`);

  // 4.输出报告
  logger.start(`正在生成报告...`);

  // 在终端输出简要信息 (按严重程度排序)
  // TODO: results are not sorted yet here, but reporters will sort them.
  // We can sort them here for console output.
  const sortedResults = results.sort((a, b) => {
    const severityMap = { error: 2, warning: 1, info: 0 };
    return severityMap[b.severity] - severityMap[a.severity];
  });

  if (sortedResults.length > 0) {
    // Limit console output to first 20 issues to avoid spamming
    const displayResults = sortedResults.slice(0, 20);

    displayResults.forEach(result => {
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

    if (sortedResults.length > 20) {
      logger.info(`... 以及其他 ${sortedResults.length - 20} 个问题 (请查看完整报告)`);
    }
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
