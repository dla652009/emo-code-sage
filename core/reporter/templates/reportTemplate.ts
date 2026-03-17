export const reportTemplateStr = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>代码分析报告</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f7fa;
    }
    .header {
      background-color: #fff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }
    .header h1 {
      margin-top: 0;
      color: #2c3e50;
    }
    .meta-info {
      color: #666;
      font-size: 0.9em;
    }
    .summary-box {
      display: inline-block;
      padding: 10px 20px;
      background-color: #e74c3c;
      color: white;
      border-radius: 4px;
      font-weight: bold;
      margin-top: 10px;
    }
    .summary-box.success {
      background-color: #2ecc71;
    }
    .rule-section {
      background-color: #fff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }
    .rule-title {
      color: #2980b9;
      border-bottom: 2px solid #ecf0f1;
      padding-bottom: 10px;
      margin-top: 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background-color: #f8f9fa;
      font-weight: 600;
    }
    tr:hover {
      background-color: #f5f5f5;
    }
    .file-path {
      font-family: monospace;
      color: #e67e22;
      word-break: break-all;
    }
    .location {
      font-family: monospace;
      color: #7f8c8d;
      white-space: nowrap;
    }
    .success-message {
      text-align: center;
      padding: 40px;
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>代码分析报告</h1>
    <div class="meta-info">生成时间: <%= timestamp %></div>
    <div class="summary-box <%= totalIssues === 0 ? 'success' : '' %>">
      总计发现问题: <%= totalIssues %> 个
    </div>
  </div>

  <% if (totalIssues === 0) { %>
    <div class="success-message">
      <h2>🎉 恭喜！未发现任何问题。</h2>
      <p>您的代码质量非常棒！</p>
    </div>
  <% } else { %>
    <% for (const ruleName in groupedResults) { %>
      <div class="rule-section">
        <h2 class="rule-title">规则: <code><%= ruleName %></code> (<%= groupedResults[ruleName].length %> 个问题)</h2>
        <table>
          <thead>
            <tr>
              <th>文件</th>
              <th width="100">位置</th>
              <th>描述</th>
            </tr>
          </thead>
          <tbody>
            <% groupedResults[ruleName].forEach(function(issue) { %>
              <tr>
                <td class="file-path"><%= issue.filePath %></td>
                <td class="location">
                  <%= issue.location ? issue.location.line + ':' + issue.location.column : '-' %>
                </td>
                <td><%= issue.message %></td>
              </tr>
            <% }); %>
          </tbody>
        </table>
      </div>
    <% } %>
  <% } %>
</body>
</html>`;
