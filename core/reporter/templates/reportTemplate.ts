export const reportTemplateStr = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>代码分析报告 - Emo Code Sage</title>
  <style>
    :root {
      --primary-color: #3498db;
      --success-color: #2ecc71;
      --warning-color: #f39c12;
      --error-color: #e74c3c;
      --info-color: #3498db;
      --text-color: #2c3e50;
      --bg-color: #f5f7fa;
      --card-bg: #ffffff;
      --border-color: #ecf0f1;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: var(--text-color);
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
      background-color: var(--bg-color);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      margin-bottom: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 2.5em;
      font-weight: 700;
    }
    .meta-info {
      margin-top: 10px;
      opacity: 0.8;
      font-size: 0.9em;
    }
    .summary-cards {
      display: flex;
      gap: 20px;
      margin-top: 20px;
      justify-content: center;
    }
    .summary-card {
      background: rgba(255,255,255,0.2);
      padding: 10px 20px;
      border-radius: 8px;
      backdrop-filter: blur(5px);
    }
    .rule-section {
      background-color: var(--card-bg);
      padding: 25px;
      border-radius: 12px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.05);
      margin-bottom: 25px;
      transition: transform 0.2s;
    }
    .rule-section:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }
    .rule-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2px solid var(--border-color);
      padding-bottom: 15px;
      margin-bottom: 15px;
    }
    .rule-title {
      color: var(--text-color);
      margin: 0;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .severity-badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.85em;
      font-weight: 600;
      color: white;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .severity-error { background-color: var(--error-color); box-shadow: 0 2px 4px rgba(231, 76, 60, 0.3); }
    .severity-warning { background-color: var(--warning-color); box-shadow: 0 2px 4px rgba(243, 156, 18, 0.3); }
    .severity-info { background-color: var(--info-color); box-shadow: 0 2px 4px rgba(52, 152, 219, 0.3); }
    
    .category-badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 0.85em;
      font-weight: 600;
      color: #34495e;
      background-color: #ecf0f1;
      margin-left: 10px;
      text-transform: uppercase;
      border: 1px solid #bdc3c7;
    }

    table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      margin-top: 15px;
    }
    th {
      background-color: #f8f9fa;
      padding: 12px 15px;
      text-align: left;
      font-weight: 600;
      color: #7f8c8d;
      border-bottom: 2px solid var(--border-color);
    }
    td {
      padding: 12px 15px;
      border-bottom: 1px solid var(--border-color);
      vertical-align: top;
    }
    tr:last-child td {
      border-bottom: none;
    }
    tr:hover td {
      background-color: #f8f9fa;
    }
    .file-path {
      font-family: 'Consolas', 'Monaco', monospace;
      color: #e67e22;
      font-weight: 500;
    }
    .location {
      font-family: 'Consolas', 'Monaco', monospace;
      color: #95a5a6;
      white-space: nowrap;
      font-size: 0.9em;
    }
    .message {
      color: #34495e;
    }
    .success-message {
      text-align: center;
      padding: 60px;
      background-color: var(--card-bg);
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }
    .success-icon {
      font-size: 4em;
      margin-bottom: 20px;
      display: block;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🔮 Emo Code Sage 报告</h1>
    <div class="meta-info">生成时间: <%= timestamp %></div>
    <div class="summary-cards">
      <div class="summary-card">
        <span style="font-size: 1.2em">🔍</span> 发现问题: <strong><%= totalIssues %></strong>
      </div>
      <div class="summary-card">
        <span style="font-size: 1.2em">🛡️</span> 涉及规则: <strong><%= sortedGroupedResults ? sortedGroupedResults.length : Object.keys(groupedResults).length %></strong>
      </div>
    </div>
  </div>

  <% if (totalIssues === 0) { %>
    <div class="success-message">
      <span class="success-icon">🎉</span>
      <h2>完美！代码质量非常棒</h2>
      <p>本次扫描未发现任何问题，继续保持！</p>
    </div>
  <% } else { %>
    <% 
      // 兼容旧逻辑，如果没有 sortedGroupedResults 则手动转换
      const entries = typeof sortedGroupedResults !== 'undefined' 
        ? sortedGroupedResults 
        : Object.keys(groupedResults).map(name => ({
            ruleName: name, 
            issues: groupedResults[name],
            severity: groupedResults[name][0].severity || 'warning'
          }));
    %>

    <% entries.forEach(function(entry) { %>
      <div class="rule-section">
        <div class="rule-header">
          <h2 class="rule-title">
            <% if (entry.severity === 'error') { %>🔴<% } else if (entry.severity === 'warning') { %>🟡<% } else { %>🔵<% } %>
            &nbsp;<%= entry.ruleName %>
            <span class="category-badge">📂 <%= entry.category || 'unknown' %></span>
          </h2>
          <span class="severity-badge severity-<%= entry.severity %>"><%= entry.severity %></span>
        </div>
        
        <table>
          <thead>
            <tr>
              <th width="40%">📄 文件路径</th>
              <th width="15%">📍 位置</th>
              <th>💡 描述</th>
            </tr>
          </thead>
          <tbody>
            <% entry.issues.forEach(function(issue) { %>
              <tr>
                <td class="file-path"><%= issue.filePath %></td>
                <td class="location">
                  <%= issue.location ? issue.location.line + ':' + issue.location.column : '-' %>
                </td>
                <td class="message"><%= issue.message %></td>
              </tr>
            <% }); %>
          </tbody>
        </table>
      </div>
    <% }); %>
  <% } %>
</body>
</html>`;
