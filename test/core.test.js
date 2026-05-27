/**
 * Tests for OnePersonAI utility functions.
 *
 * Uses Node.js native test runner (Node 18+).
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// --- Prompt tests ---

describe('Prompts', () => {
  it('marketPrompt should return a string with the idea embedded', async () => {
    const { marketPrompt } = await import('../src/utils/prompts.js');
    const result = marketPrompt('test idea');
    assert.ok(typeof result === 'string', 'marketPrompt returns a string');
    assert.ok(result.includes('test idea'), 'prompt contains the idea text');
    assert.ok(result.includes('SWOT'), 'prompt includes SWOT analysis');
    assert.ok(result.includes("Porter"), 'prompt includes Porter');
  });

  it('techPrompt should return a detailed tech analysis prompt', async () => {
    const { techPrompt } = await import('../src/utils/prompts.js');
    const result = techPrompt('AI chatbot');
    assert.ok(result.includes('AI chatbot'), 'prompt contains the idea');
    assert.ok(result.includes('Feasibility'), 'prompt includes feasibility');
    assert.ok(result.includes('Tech Stack'), 'prompt includes tech stack');
  });

  it('productPrompt should include RICE scoring', async () => {
    const { productPrompt } = await import('../src/utils/prompts.js');
    const result = productPrompt('task manager');
    assert.ok(result.includes('RICE'), 'prompt includes RICE framework');
    assert.ok(result.includes('MVP'), 'prompt includes MVP section');
    assert.ok(result.includes('Risk'), 'prompt includes risk section');
  });

  it('contentPrompt should return content with optional context', async () => {
    const { contentPrompt } = await import('../src/utils/prompts.js');
    const result = contentPrompt('my app', { audience: 'developers' });
    assert.ok(result.includes('my app'), 'prompt contains the idea');
    assert.ok(result.includes('developers'), 'prompt includes extra context');
    assert.ok(result.includes('README'), 'prompt includes README section');
  });
});

// --- Config tests ---

describe('Config', () => {
  it('loadConfig should return default values', async () => {
    const { loadConfig } = await import('../src/utils/config.js');
    const config = loadConfig();
    assert.ok(typeof config === 'object', 'config is an object');
    assert.ok(typeof config.model === 'string', 'config.model is a string');
    assert.ok(typeof config.verbose === 'boolean', 'config.verbose is boolean');
    assert.ok(config.aoPath.includes('ao'), 'config.aoPath contains ao');
  });

  it('isAoAvailable should return boolean', async () => {
    const { isAoAvailable } = await import('../src/utils/config.js');
    const result = isAoAvailable();
    assert.ok(typeof result === 'boolean', 'isAoAvailable returns boolean');
  });
});

// --- CLI tests ---

describe('CLI Entry Point', () => {
  const cliPath = new URL('../bin/onepersonai.js', import.meta.url).pathname;

  it('should show help output', async () => {
    const { execSync } = await import('node:child_process');
    const output = execSync(`node ${cliPath} --help`, {
      encoding: 'utf-8',
    });
    assert.ok(output.includes('analyze'), 'help contains analyze command');
    assert.ok(output.includes('scaffold'), 'help contains scaffold command');
    assert.ok(output.includes('review'), 'help contains review command');
  });

  it('should show version', async () => {
    const { execSync } = await import('node:child_process');
    const output = execSync(`node ${cliPath} --version`, {
      encoding: 'utf-8',
    });
    assert.ok(output.includes('1.0.0'), 'version is 1.0.0');
  });

  it('analyze --demo should produce a report with executive summary', async () => {
    const { execSync } = await import('node:child_process');
    const output = execSync(`node ${cliPath} analyze --demo`, {
      encoding: 'utf-8',
    });
    assert.ok(output.includes('Executive Summary'), 'report has executive summary');
    assert.ok(output.includes('Market Agent'), 'report has market agent');
    assert.ok(output.includes('Tech Agent'), 'report has tech agent');
    assert.ok(output.includes('Product Agent'), 'report has product agent');
  });

  it('analyze --demo --injective should include Injective section', async () => {
    const { execSync } = await import('node:child_process');
    const output = execSync(`node ${cliPath} analyze --demo --injective`, {
      encoding: 'utf-8',
    });
    assert.ok(output.includes('Injective'), 'report has Injective section');
    assert.ok(output.includes('Blockchain'), 'report mentions blockchain');
  });
});

// --- Orchestrator tests ---

describe('Orchestrator', () => {
  it('formatResults should format agent results', async () => {
    const { formatResults } = await import('../src/orchestrator/index.js');
    const results = [
      {
        agentName: 'market',
        output: '# Market Analysis\n\nGreat market.',
        success: true,
        error: null,
        durationMs: 1500,
      },
      {
        agentName: 'tech',
        output: '',
        success: false,
        error: 'AO not found',
        durationMs: 500,
      },
    ];
    const formatted = formatResults(results);
    assert.ok(formatted.includes('Market'), 'formatted contains market agent name');
    assert.ok(formatted.includes('Great market'), 'formatted contains market output');
    assert.ok(formatted.includes('AO not found'), 'formatted includes error message');
    assert.ok(formatted.includes('1 succeeded'), 'formatted has summary');
  });
});

// --- Index re-exports ---

describe('Module Index', () => {
  it('should re-export all public API surfaces', async () => {
    const api = await import('../src/index.js');
    assert.ok(typeof api.marketPrompt === 'function', 'exports marketPrompt');
    assert.ok(typeof api.techPrompt === 'function', 'exports techPrompt');
    assert.ok(typeof api.productPrompt === 'function', 'exports productPrompt');
    assert.ok(typeof api.contentPrompt === 'function', 'exports contentPrompt');
    assert.ok(typeof api.analyzeMarket === 'function', 'exports analyzeMarket');
    assert.ok(typeof api.analyzeTech === 'function', 'exports analyzeTech');
    assert.ok(typeof api.analyzeProduct === 'function', 'exports analyzeProduct');
    assert.ok(typeof api.generateContent === 'function', 'exports generateContent');
    assert.ok(typeof api.loadConfig === 'function', 'exports loadConfig');
    assert.ok(typeof api.isAoAvailable === 'function', 'exports isAoAvailable');
    assert.ok(typeof api.runAoAgent === 'function', 'exports runAoAgent');
    assert.ok(typeof api.runAllAgents === 'function', 'exports runAllAgents');
    assert.ok(typeof api.formatResults === 'function', 'exports formatResults');
  });
});
