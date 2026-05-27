/**
 * Multi-Agent Orchestrator.
 *
 * Runs concurrent subprocesses of the AO binary (`/usr/bin/ao`) with
 * agent-specific prompts and collects their output.  Supports timeouts,
 * error propagation, and result aggregation.
 *
 * @module orchestrator/index
 */

import { spawn } from 'node:child_process';
import { loadConfig } from '../utils/config.js';

/**
 * Options for running an AO agent.
 * @typedef {Object} AgentOptions
 * @property {string} model - The AI model to use (e.g., 'gpt-4o', 'claude-3')
 * @property {string} agentName - Human-readable name for logging
 * @property {number} [timeout=60000] - Max milliseconds to wait before killing
 */

/**
 * Result from a single agent run.
 * @typedef {Object} AgentResult
 * @property {string} agentName - Name of the agent
 * @property {string} output - Standard output from the agent
 * @property {boolean} success - Whether it completed without error
 * @property {string|null} error - Error message if failed
 * @property {number} durationMs - Wall-clock execution time
 */

/**
 * Run a single AO agent process.
 *
 * Spawns `ao "prompt" --model <model>` and returns stdout.
 *
 * @param {string} prompt - The full prompt text to send
 * @param {AgentOptions} options - Agent configuration
 * @returns {Promise<string>} Agent output text
 * @throws {Error} If AO is not found, times out, or returns non-zero
 */
export function runAoAgent(prompt, options) {
  return new Promise((resolve, reject) => {
    const config = loadConfig();
    const timeout = options.timeout || 60_000;

    // Sanitize prompt: replace double quotes to avoid shell issues
    const sanitizedPrompt = prompt.replace(/"/g, '\\"');

    const child = spawn(config.aoPath, [sanitizedPrompt, '--model', options.model], {
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: false,
      timeout,
    });

    let stdout = '';
    let stderr = '';
    const timer = setTimeout(() => {
      child.kill('SIGTERM');
      reject(new Error(`Agent "${options.agentName}" timed out after ${timeout}ms`));
    }, timeout);

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0) {
        resolve(stdout.trim());
      } else {
        const errMsg = stderr.trim() || `AO exited with code ${code}`;
        reject(new Error(`Agent "${options.agentName}" failed: ${errMsg}`));
      }
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      reject(new Error(`Agent "${options.agentName}" could not start: ${err.message}`));
    });
  });
}

/**
 * Run multiple agents simultaneously and collect all results.
 *
 * @param {Array<{prompt: string, name: string}>} agents - Agents to run
 * @param {object} [globalOptions] - Shared options for all agents
 * @param {string} [globalOptions.model] - AI model override
 * @param {number} [globalOptions.timeout=60000] - Per-agent timeout
 * @returns {Promise<AgentResult[]>} Results from all agents
 */
export async function runAllAgents(agents, globalOptions = {}) {
  const config = loadConfig();
  const model = globalOptions.model || config.model;
  const timeout = globalOptions.timeout || 60_000;

  const promises = agents.map(({ prompt, name }) => {
    const start = Date.now();
    return runAoAgent(prompt, { model, agentName: name, timeout })
      .then((output) => ({
        agentName: name,
        output,
        success: true,
        error: null,
        durationMs: Date.now() - start,
      }))
      .catch((err) => ({
        agentName: name,
        output: '',
        success: false,
        error: err.message,
        durationMs: Date.now() - start,
      }));
  });

  // Run all concurrently
  return Promise.all(promises);
}

/**
 * Format agent results into a human-readable report.
 *
 * @param {AgentResult[]} results - Results from runAllAgents
 * @returns {string} Formatted report text
 */
export function formatResults(results) {
  const parts = ['# OnePersonAI — Multi-Agent Analysis Report', ''];
  const now = new Date().toISOString().replace(/T/, ' ').replace(/\.\d+Z/, '');
  parts.push(`**Generated:** ${now}`);
  parts.push(`**Agents run:** ${results.length}`);
  parts.push('');

  let successCount = 0;
  let failCount = 0;

  for (const result of results) {
    const status = result.success ? '✅' : '❌';
    const label = result.agentName.charAt(0).toUpperCase() + result.agentName.slice(1);
    parts.push(`---`);
    parts.push(`## ${status} ${label} Agent (${result.durationMs}ms)`);
    parts.push('');

    if (result.success) {
      parts.push(result.output);
    } else {
      parts.push(`> ⚠  Agent failed: ${result.error}`);
      parts.push('');
      parts.push('Run with `--model` to try a different AI model, or check that AO is properly installed.');
    }
    parts.push('');

    if (result.success) successCount++;
    else failCount++;
  }

  parts.push('---');
  parts.push(`**Summary:** ${successCount} succeeded, ${failCount} failed`);
  parts.push('_Generated by OnePersonAI_');

  return parts.join('\n');
}
