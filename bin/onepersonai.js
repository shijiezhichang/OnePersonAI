#!/usr/bin/env node

/**
 * OnePersonAI — AI-powered toolkit for solo builders.
 *
 * CLI entry point using Commander.js.
 * Commands: analyze, scaffold, review
 *
 * @module bin/onepersonai
 */

import { program } from 'commander';
import chalk from 'chalk';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load package.json for version info
const pkgPath = resolve(__dirname, '..', 'package.json');
const pkg = existsSync(pkgPath)
  ? JSON.parse(readFileSync(pkgPath, 'utf-8'))
  : { version: '1.0.0', description: 'AI-powered toolkit for solo builders' };

// --- Import commands (lazy-loaded for performance) ---
async function loadAnalyze() {
  const mod = await import('../src/commands/analyze.js');
  return mod.default;
}

async function loadScaffold() {
  const mod = await import('../src/commands/scaffold.js');
  return mod.default;
}

async function loadReview() {
  const mod = await import('../src/commands/review.js');
  return mod.default;
}

// --- Configure CLI ---

program
  .name('onepersonai')
  .description(chalk.bold.cyan(pkg.description))
  .version(pkg.version, '-v, --version', 'Display version number')
  .helpOption('-h, --help', 'Display help information')
  .addHelpText('after', () => {
    return `\n${chalk.bold('Resources:')}
  ${chalk.dim('Documentation:')} https://github.com/shijiezhichang/onepersonai
  ${chalk.dim('Report issues:')} https://github.com/shijiezhichang/onepersonai/issues
`;
  });

// --- analyze command ---

program
  .command('analyze [idea...]')
  .description('Analyze a product idea with multi-agent AI (market, tech, product)')
  .option('--demo', 'Show demo output without running real agents')
  .option('-m, --model <model>', 'AI model to use (default: from config)')
  .option('-o, --out <file>', 'Save report to file')
  .option('-q, --quiet', 'Suppress output (use with --out)')
  .action(async (ideaWords, cmdOptions) => {
    const idea = ideaWords ? ideaWords.join(' ') : '';
    try {
      const analyzeCmd = await loadAnalyze();
      await analyzeCmd(idea, {
        demo: cmdOptions.demo || false,
        model: cmdOptions.model || undefined,
        out: cmdOptions.out || undefined,
        quiet: cmdOptions.quiet || false,
      });
    } catch (err) {
      console.error(chalk.red(`\n✗ analyze command failed: ${err.message}`));
      process.exitCode = 1;
    }
  });

// --- scaffold command ---

program
  .command('scaffold [directory]')
  .description('Generate a new project structure from a plan or template')
  .option('-n, --name <name>', 'Project name')
  .option('-d, --description <text>', 'Project description')
  .option('-t, --template <template>', 'Template type (cli-tool, web-app, api-service, library)')
  .option('-f, --force', 'Overwrite existing files without asking')
  .action(async (directory = '.', cmdOptions) => {
    try {
      const scaffoldCmd = await loadScaffold();
      await scaffoldCmd(directory, {
        name: cmdOptions.name || undefined,
        description: cmdOptions.description || undefined,
        template: cmdOptions.template || undefined,
        force: cmdOptions.force || false,
      });
    } catch (err) {
      console.error(chalk.red(`\n✗ scaffold command failed: ${err.message}`));
      process.exitCode = 1;
    }
  });

// --- review command ---

program
  .command('review [directory]')
  .description('Review code quality, structure, and security in a directory')
  .option('-v, --verbose', 'Show detailed information')
  .option('-s, --severity <level>', 'Minimum severity (error, warning, info)', 'info')
  .action(async (directory = '.', cmdOptions) => {
    try {
      const reviewCmd = await loadReview();
      await reviewCmd(directory, {
        verbose: cmdOptions.verbose || false,
        severity: cmdOptions.severity || 'info',
      });
    } catch (err) {
      console.error(chalk.red(`\n✗ review command failed: ${err.message}`));
      process.exitCode = 1;
    }
  });

// --- Parse and execute ---

program.parse(process.argv);

// Show help if no command given
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
