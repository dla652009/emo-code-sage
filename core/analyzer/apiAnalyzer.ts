import { BaseAnalyzer, AnalysisResult } from './baseAnalyzer';
import {
  SourceFile,
  SyntaxKind,
  CallExpression,
  Node
  //   ObjectLiteralExpression,
  //   PropertyAssignment,
  //   StringLiteral
} from 'ts-morph';

export interface ApiCallInfo {
  method: string; // GET, POST, PUT, DELETE, etc.
  url: string; // 请求的 URL
  line: number; // 代码行号
  code: string; // 完整的调用代码
}

export class ApiAnalyzer extends BaseAnalyzer<ApiCallInfo> {
  async analyze(sourceFile: SourceFile): Promise<AnalysisResult<ApiCallInfo>> {
    const items: ApiCallInfo[] = [];

    // 查找所有的函数调用表达式
    const callExpressions = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression);

    for (const callExpr of callExpressions) {
      const apiInfo = this.extractApiInfo(callExpr);
      if (apiInfo) {
        items.push(apiInfo);
      }
    }

    return {
      filePath: sourceFile.getFilePath(),
      items
    };
  }

  private extractApiInfo(callExpr: CallExpression): ApiCallInfo | null {
    const expression = callExpr.getExpression();
    const text = expression.getText();
    const args = callExpr.getArguments();

    let method = '';
    let url = '';

    // 1. 处理 fetch 调用
    if (text === 'fetch') {
      method = 'GET'; // 默认
      if (args.length > 0) {
        url = this.extractUrlFromNode(args[0]);

        if (args.length > 1) {
          const options = args[1];
          if (Node.isObjectLiteralExpression(options)) {
            const methodProp = options.getProperty('method');
            if (methodProp && Node.isPropertyAssignment(methodProp)) {
              const initializer = methodProp.getInitializer();
              if (
                initializer &&
                (Node.isStringLiteral(initializer) || Node.isNoSubstitutionTemplateLiteral(initializer))
              ) {
                method = initializer.getLiteralValue().toUpperCase();
              }
            }
          }
        }
      } else {
        return null; // fetch 没有参数，忽略
      }
    }
    // 2. 处理 axios.get, http.post 等调用
    // 匹配 .get, .post, .put, .delete, .patch, .head, .options 结尾的方法
    else {
      const match = text.match(/\.(get|post|put|delete|patch|head|options)$/i);
      if (match) {
        method = match[1].toUpperCase();
        if (args.length > 0) {
          url = this.extractUrlFromNode(args[0]);
        } else {
          return null; // 没有 URL 参数，忽略
        }
      } else if (text.match(/axios|request/i) && !text.includes('.')) {
        // 处理直接调用 axios(config) 或 axios(url, config) 的情况
        // 这里简化处理，假设第一个参数是 URL 或者配置对象包含 url
        if (args.length > 0) {
          const arg0 = args[0];
          if (Node.isStringLiteral(arg0) || Node.isNoSubstitutionTemplateLiteral(arg0)) {
            url = arg0.getLiteralValue();
            method = 'GET'; // 默认为 GET
          } else if (Node.isObjectLiteralExpression(arg0)) {
            // axios({ url: '/api', method: 'post' })
            const urlProp = arg0.getProperty('url');
            if (urlProp && Node.isPropertyAssignment(urlProp)) {
              const init = urlProp.getInitializer();
              if (init) url = this.extractUrlFromNode(init);
            }
            const methodProp = arg0.getProperty('method');
            if (methodProp && Node.isPropertyAssignment(methodProp)) {
              const init = methodProp.getInitializer();
              if (init && (Node.isStringLiteral(init) || Node.isNoSubstitutionTemplateLiteral(init))) {
                method = init.getLiteralValue().toUpperCase();
              } else {
                method = 'GET';
              }
            } else {
              method = 'GET';
            }
          }
        }
      } else {
        return null;
      }
    }

    if (!url && !method) return null;

    return {
      method,
      url,
      line: callExpr.getStartLineNumber(),
      code: callExpr.getText()
    };
  }

  private extractUrlFromNode(node: Node): string {
    if (Node.isStringLiteral(node) || Node.isNoSubstitutionTemplateLiteral(node)) {
      return node.getLiteralValue();
    }
    if (Node.isTemplateExpression(node)) {
      return node.getText(); // 返回原始模板字符串，如 `api/${id}`
    }
    return node.getText(); // 变量名或其他表达式
  }
}
