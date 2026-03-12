import fs from 'fs';
import path from 'path';
import { TsParser } from './tsParser';
import { VueParser } from './vueParser';

export async function parseFile(filePath: string) {
  const ext = path.extname(filePath);

  const code = fs.readFileSync(filePath, 'utf-8');

  if (ext === '.ts' || ext === '.tsx' || ext === '.js' || ext === '.jsx') {
    const tsParser = new TsParser();
    return tsParser.parse(filePath, code);
  }

  if (ext === '.vue') {
    const vueParser = new VueParser();
    return vueParser.parse(filePath, code);
  }

  return null;
}
