/**
 * OnePersonAI — AI-powered toolkit for solo builders.
 *
 * Main module that re-exports all public API surfaces:
 * - Config loading
 * - Prompt templates
 * - Specialized agents (market, tech, product, content)
 * - Multi-agent orchestrator
 * - CLI commands
 *
 * @module index
 */

// --- Config ---
export { loadConfig, isAoAvailable } from './utils/config.js';

// --- Prompt Templates ---
export {
  marketPrompt,
  techPrompt,
  productPrompt,
  contentPrompt,
} from './utils/prompts.js';

// --- Agents ---
export { analyzeMarket } from './agents/market.js';
export { analyzeTech } from './agents/tech.js';
export { analyzeProduct } from './agents/product.js';
export { generateContent } from './agents/content.js';

// --- Orchestrator ---
export {
  runAoAgent,
  runAllAgents,
  formatResults,
} from './orchestrator/index.js';

// --- Commands (default exports) ---
export { default as analyzeCommand } from './commands/analyze.js';
export { default as scaffoldCommand } from './commands/scaffold.js';
export { default as reviewCommand } from './commands/review.js';

/**
 * @typedef {Object} OnePersonAIConfig
 * @property {string} model - Default AI model name
 * @property {string} aoPath - Path to AO binary
 * @property {string} outputDir - Default output directory
 * @property {boolean} verbose - Enable verbose logging
 */

/**
 * @typedef {Object} AgentResult
 * @property {string} agentName - Name of the agent
 * @property {string} output - Agent output text
 * @property {boolean} success - Whether the agent succeeded
 * @property {string|null} error - Error message if failed
 * @property {number} durationMs - Execution time in milliseconds
 */

// No-op — these typedefs are for documentation/intellisense only.
