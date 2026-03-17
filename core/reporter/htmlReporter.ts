import fs from 'fs/promises';
import ejs from 'ejs';
import { AnalysisResult } from '../analyzer/types';
import { Reporter, ReporterOptions } from './types';
import { logger } from '../../utils/logger';
import { reportTemplateStr } from './templates/reportTemplate';

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

    // 准备模板数据
    const templateData = {
      timestamp,
      totalIssues: results.length,
      groupedResults
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
