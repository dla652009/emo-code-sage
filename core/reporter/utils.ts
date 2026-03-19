import { AnalysisResult, Severity } from '../analyzer/types';

// 定义 Severity 的权重，值越大越严重
const severityWeight: Record<Severity, number> = {
  error: 3,
  warning: 2,
  info: 1
};

/**
 * 对分析结果进行排序：先按严重程度 (error > warning > info)，再按文件路径
 */
export function sortResults(results: AnalysisResult[]): AnalysisResult[] {
  return [...results].sort((a, b) => {
    // 1. 按严重程度排序 (降序)
    const weightA = severityWeight[a.severity] || 0;
    const weightB = severityWeight[b.severity] || 0;
    if (weightA !== weightB) {
      return weightB - weightA;
    }

    // 2. 按规则名称排序
    if (a.ruleName !== b.ruleName) {
      return a.ruleName.localeCompare(b.ruleName);
    }

    // 3. 按文件路径排序
    return a.filePath.localeCompare(b.filePath);
  });
}

/**
 * 对分组后的结果按组的严重程度排序
 */
export function sortGroupedResults(groupedResults: Record<string, AnalysisResult[]>): [string, AnalysisResult[]][] {
  return Object.entries(groupedResults).sort(([, issuesA], [, issuesB]) => {
    // 取每组第一个问题的严重程度作为该组的严重程度
    const severityA = issuesA[0]?.severity || 'info';
    const severityB = issuesB[0]?.severity || 'info';

    const weightA = severityWeight[severityA] || 0;
    const weightB = severityWeight[severityB] || 0;

    return weightB - weightA;
  });
}
