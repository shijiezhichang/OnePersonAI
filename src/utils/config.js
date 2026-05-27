/**
 * Config loader for OnePersonAI.
 *
 * Reads configuration from a `.onepersonairc` JSON file (user home dir, then CWD)
 * and/or environment variables.  Environment variables take precedence.
 *
 * @module utils/config
 */

import { readFileSync, existsSync, accessSync, constants } from 'node:fs';
import { homedir } from 'node:os';
import { resolve } from 'node:path';

/** @typedef {import('../index.js').OnePersonAIConfig} OnePersonAIConfig */

/**
 * Default configuration values.
 * @type {OnePersonAIConfig}
 */
const DEFAULTS = {
  model: 'gpt-4o',
  aoPath: '/usr/bin/ao',
  outputDir: './output',
  verbose: false,
};

/**
 * Attempt to load a `.onepersonairc` file from a directory.
 * @param {string} dir - Directory to look in
 * @returns {Partial<OnePersonAIConfig>|null} Parsed config or null
 */
function loadRcFile(dir) {
  const candidates = [
    resolve(dir, '.onepersonairc'),
    resolve(dir, '.onepersonairc.json'),
  ];
  for (const filePath of candidates) {
    if (existsSync(filePath)) {
      try {
        const raw = readFileSync(filePath, 'utf-8');
        return JSON.parse(raw);
      } catch (err) {
        console.warn(`⚠  Warning: Could not parse config file ${filePath}: ${err.message}`);
      }
    }
  }
  return null;
}

/**
 * Load and merge configuration from all sources.
 *
 * Precedence (highest to lowest):
 * 1. Environment variables  (ONEPERSONAI_MODEL, ONEPERSONAI_AO_PATH, etc.)
 * 2. `.onepersonairc` in CWD
 * 3. `.onepersonairc` in user home directory
 * 4. Built-in defaults
 *
 * @returns {OnePersonAIConfig} Resolved configuration
 */
export function loadConfig() {
  const homeRc = loadRcFile(homedir());
  const cwdRc  = loadRcFile(process.cwd());

  /** @type {OnePersonAIConfig} */
  const config = {
    ...DEFAULTS,
    ...(homeRc || {}),
    ...(cwdRc || {}),
  };

  // Environment variable overrides
  const { env } = process;
  if (env.ONEPERSONAI_MODEL)       config.model    = env.ONEPERSONAI_MODEL;
  if (env.ONEPERSONAI_AO_PATH)     config.aoPath   = env.ONEPERSONAI_AO_PATH;
  if (env.ONEPERSONAI_OUTPUT_DIR)  config.outputDir = env.ONEPERSONAI_OUTPUT_DIR;
  if (env.ONEPERSONAI_VERBOSE) {
    config.verbose = env.ONEPERSONAI_VERBOSE === 'true' || env.ONEPERSONAI_VERBOSE === '1';
  }

  return config;
}

/**
 * Quick check whether the AO binary exists and is executable.
 * @returns {boolean} True if AO is available
 */
export function isAoAvailable() {
  try {
    const config = loadConfig();
    accessSync(config.aoPath, constants.X_OK);
    return true;
  } catch {
    return false;
  }
}
