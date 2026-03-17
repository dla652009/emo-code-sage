import fs from 'fs/promises';
import { AnalysisResult } from '../analyzer/types';
import { Reporter, ReporterOptions } from './types';
import { logger } from '../../utils/logger';

export class MarkdownReporter implements Reporter {
  name = 'markdown';

  async generate(results: AnalysisResult[], options?: ReporterOptions): Promise<string> {
    const timestamp = new Date().toLocaleString();
    let content = `# 📊 代码分析报告\n\n`;
    content += `> 🕒 生成时间: ${timestamp}\n\n`;

    // 概览部分
    content += `## 📈 概览\n\n`;
    const totalIssues = results.length;
    const ruleCount = new Set(results.map(r => r.ruleName)).size;

    content += `- 🔍 总计发现问题: **${totalIssues}** 个\n`;
    content += `- 🛡️ 涉及规则数量: **${ruleCount}** 个\n\n`;

    if (totalIssues > 0) {
      content += `## 📝 问题详情\n\n`;

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

      for (const [ruleName, issues] of Object.entries(groupedResults)) {
        content += `### 🚫 规则: \`${ruleName}\`\n\n`;
        content += `> 发现 **${issues.length}** 处违规\n\n`;
        content += `| 📄 文件路径 | 📍 位置 | 💡 描述 |\n`;
        content += `| :--- | :---: | :--- |\n`;

        issues.forEach(issue => {
          const loc = issue.location ? `${issue.location.line}:${issue.location.column}` : '-';
          // 使用完整路径，并对路径中的反斜杠进行处理以适应 Markdown
          const filePath = issue.filePath.replace(/\\/g, '/');
          content += `| \`${filePath}\` | ${loc} | ${issue.message} |\n`;
        });
        content += `\n`;
      }
    } else {
      content += `## 🎉 完美！\n\n`;
      content += `✨ 恭喜！代码质量非常棒，未发现任何问题。\n`;
    }

    if (options?.outputFile) {
      const fullPath = `${options.outputFile}.md`;
      try {
        await fs.writeFile(fullPath, content, 'utf-8');
        logger.success(`Markdown 报告已生成: ${fullPath}`);
      } catch (error) {
        logger.error(`生成 Markdown 报告失败: ${error}`);
      }
    }

    return content;
  }
}
