import fs from 'fs/promises';
import ejs from 'ejs';
import { AnalysisResult } from '../analyzer/types';
import { Reporter, ReporterOptions } from './types';
import { logger } from '@utils/logger';
import { reportTemplateStr } from './templates/reportTemplate';
import { sortGroupedResults } from './utils';

export class HtmlReporter implements Reporter {
  name = 'html';

  async generate(results: AnalysisResult[], options?: ReporterOptions): Promise<string> {
    const timestamp = new Date().toLocaleString();

    // 按规则分组
    const groupedResults = results.reduce(
      (acc, curr) => {
        if (!acc[curr.ruleName]) {
          acc[curr.ruleName] = [];
        }
        acc[curr.ruleName].push(curr);
        return acc;
      },
      {} as Record<string, AnalysisResult[]>
    );

    // 对分组结果进行排序 (Error > Warning > Info)
    // 转换为数组以便模板遍历时保持顺序
    const sortedGroupedResults = sortGroupedResults(groupedResults).map(([ruleName, issues]) => ({
      ruleName,
      issues,
      category: issues[0].category,
      severity: issues[0].severity || 'info'
    }));

    // 准备模板数据
    const templateData = {
      timestamp,
      totalIssues: results.length,
      groupedResults, // 保留原始对象以防模板需要
      sortedGroupedResults // 新增排序后的数组供新模板使用
    };

    try {
      // 渲染 HTML
      const htmlContent = ejs.render(reportTemplateStr, templateData);

      if (options?.outputFile) {
        const fullPath = `${options.outputFile}.html`;
        await fs.writeFile(fullPath, htmlContent, 'utf-8');
        logger.success(`HTML 报告已生成: ${fullPath}`);
      }

      return htmlContent;
    } catch (error) {
      logger.error(`生成 HTML 报告失败: ${error}`);
      throw error;
    }
  }
}
