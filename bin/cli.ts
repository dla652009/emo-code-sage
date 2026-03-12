#!/usr/bin/env node

import { Command } from 'commander';
import { analyzeProject } from '../core/analyzeProject';
import path from 'path';

const program = new Command();

program
  .command('analyze')
  .argument('<path>', '要分析的项目路径')
  .action(async targetPath => {
    const absolutePath = path.resolve(targetPath);
    await analyzeProject(absolutePath);
  });

program.parse();
