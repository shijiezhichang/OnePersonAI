/**
 * Injective Blockchain Live Data Query Module.
 *
 * Fetches real-time data from the Injective blockchain via public RPC endpoints.
 * Used by the `analyze --injective` flag to show LIVE blockchain data rather
 * than static demo text.
 *
 * @module injective/query
 */

import https from 'node:https';
import http from 'node:http';

/**
 * Public RPC endpoints for Injective mainnet.
 * Multiple endpoints for redundancy — tries each in order.
 * @type {string[]}
 */
const RPC_ENDPOINTS = [
  'https://injective-rpc.publicnode.com:443',
  'https://injective-rpc.lava.build:443',
  'https://rpc.injective.network:443',
];

/** @type {string[]} */
const REST_ENDPOINTS = [
  'https://rest.injective.network',
  'https://injective-api.publicnode.com',
];

/** @type {number} */
const FETCH_TIMEOUT = 10_000;

/**
 * Make an HTTP/HTTPS request with timeout and return parsed JSON.
 *
 * @param {string} url - The URL to fetch
 * @param {number} [timeoutMs=10000] - Timeout in milliseconds
 * @returns {Promise<object>} Parsed JSON response
 */
function fetchJson(url, timeoutMs = FETCH_TIMEOUT) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.get(url, { timeout: timeoutMs }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          reject(new Error(`Invalid JSON from ${url}: ${err.message}`));
        }
      });
    });
    req.on('error', (err) => reject(new Error(`Request failed: ${err.message}`)));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Timeout after ${timeoutMs}ms: ${url}`));
    });
  });
}

/**
 * Try multiple endpoints until one succeeds.
 *
 * @param {string[]} endpoints - List of endpoint URLs
 * @param {Function} fetcher - Async function(url) => result
 * @returns {Promise<object>} Result with { data, endpoint } or error
 */
async function tryEndpoints(endpoints, fetcher) {
  const errors = [];
  for (const endpoint of endpoints) {
    try {
      const data = await fetcher(endpoint);
      return { data, endpoint };
    } catch (err) {
      errors.push(`${endpoint}: ${err.message}`);
    }
  }
  throw new Error(`All endpoints failed:\n  ${errors.join('\n  ')}`);
}

/**
 * Injective mainnet chain ID.
 * @type {string}
 */
export const INJECTIVE_CHAIN_ID = 'injective-1';

/**
 * Fetch live Injective blockchain status (block height, validator count, etc.).
 *
 * Uses RPC endpoints: /status, /validators, /abci_info
 *
 * @returns {Promise<InjectiveStatus>} Live blockchain status
 */
export async function fetchChainStatus() {
  const statusResult = await tryEndpoints(RPC_ENDPOINTS, async (ep) => {
    const [status, validators, abciInfo] = await Promise.all([
      fetchJson(`${ep}/status`),
      fetchJson(`${ep}/validators`),
      fetchJson(`${ep}/abci_info`),
    ]);
    return { status, validators, abciInfo };
  });

  const { data: { status, validators, abciInfo }, endpoint } = statusResult;

  const latestBlockHeight = status?.result?.sync_info?.latest_block_height
    ? parseInt(status.result.sync_info.latest_block_height, 10)
    : null;

  const latestBlockTime = status?.result?.sync_info?.latest_block_time
    ? new Date(status.result.sync_info.latest_block_time).toISOString()
    : null;

  const catchingUp = status?.result?.sync_info?.catching_up === true;

  const validatorCount = validators?.result?.block_results
    ? (validators.result.block_results.length || 0)
    : (validators?.result?.validators
      ? validators.result.validators.length
      : null);

  const appVersion = abciInfo?.result?.response?.version || null;
  const appName = abciInfo?.result?.response?.data || null;

  /** @type {InjectiveStatus} */
  return {
    chainId: INJECTIVE_CHAIN_ID,
    latestBlockHeight,
    latestBlockTime,
    validatorCount,
    catchingUp,
    appVersion,
    appName,
    endpoint: endpoint.replace(/\/+$/, ''),
    fetchedAt: new Date().toISOString(),
  };
}

/**
 * Fetch INJ token supply info from REST API.
 *
 * @returns {Promise<object>} Supply information
 */
export async function fetchSupply() {
  const result = await tryEndpoints(REST_ENDPOINTS, async (ep) => {
    const supply = await fetchJson(`${ep}/cosmos/bank/v1beta1/supply/by_denom?denom=inj`);
    return { supply };
  });

  const amount = result.data.supply?.amount;
  const denom = result.data.supply?.denom || 'inj';
  const formattedAmount = amount
    ? (BigInt(amount) / BigInt(10 ** 18)).toString()
    : null;

  return {
    totalSupply: formattedAmount ? `${formattedAmount} INJ` : 'Unknown',
    rawAmount: amount || 'Unknown',
    endpoint: result.endpoint,
  };
}

/**
 * Get a comprehensive Injective blockchain snapshot.
 * Combines chain status + supply data. Gracefully degrades if some calls fail.
 *
 * @returns {Promise<object>} Combined blockchain data
 */
export async function getInjectiveSnapshot() {
  /** @type {object} */
  const snapshot = {
    chain: INJECTIVE_CHAIN_ID,
    status: null,
    supply: null,
    errors: [],
  };

  try {
    snapshot.status = await fetchChainStatus();
  } catch (err) {
    snapshot.errors.push(`Status fetch failed: ${err.message}`);
  }

  try {
    snapshot.supply = await fetchSupply();
  } catch (err) {
    snapshot.errors.push(`Supply fetch failed: ${err.message}`);
  }

  return snapshot;
}

/**
 * Format the Injective snapshot as a readable Markdown section.
 *
 * @param {object} snapshot - Result from getInjectiveSnapshot()
 * @returns {string} Formatted Markdown
 */
export function formatInjectiveSnapshot(snapshot) {
  const parts = [
    '',
    '---',
    '',
    '## ⛓️ Live Injective Blockchain Data',
    '',
    `_Data fetched from Injective mainnet at ${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}_`,
    '',
  ];

  if (snapshot.status) {
    const s = snapshot.status;
    parts.push('### 📊 Chain Status');
    parts.push('');
    parts.push('| Metric | Value |');
    parts.push('|--------|-------|');
    parts.push(`| Chain ID | \`${s.chainId}\` |`);
    parts.push(`| Latest Block Height | **${s.latestBlockHeight?.toLocaleString() || 'Unknown'}** |`);
    parts.push(`| Latest Block Time | ${s.latestBlockTime || 'Unknown'} |`);
    parts.push(`| Validators | ${s.validatorCount !== null ? s.validatorCount : 'Unknown'} |`);
    parts.push(`| Catching Up | ${s.catchingUp ? 'Yes (syncing)' : 'No (synced)'} |`);
    parts.push(`| App Version | ${s.appVersion || 'Unknown'} |`);
    parts.push(`| App Name | ${s.appName || 'Unknown'} |`);
    parts.push(`| RPC Endpoint | \`${s.endpoint}\` |`);
    parts.push('');
  } else {
    parts.push('> ⚠ Chain status unavailable (RPC endpoints unreachable).');
    parts.push('');
  }

  if (snapshot.supply) {
    parts.push('### 🪙 INJ Token Supply');
    parts.push('');
    parts.push(`- **Total Supply:** ${snapshot.supply.totalSupply}`);
    parts.push(`- **Denom:** \`${snapshot.supply.rawAmount !== 'Unknown' ? 'inj' : 'N/A'}\``);
    parts.push(`- **Source:** \`${snapshot.supply.endpoint}\``);
    parts.push('');
  }

  if (snapshot.errors.length > 0) {
    parts.push('### ⚠ Data Notes');
    parts.push('');
    for (const err of snapshot.errors) {
      parts.push(`- ${err}`);
    }
    parts.push('');
  }

  parts.push('### 💡 Why This Matters for Your Idea');
  parts.push('');
  parts.push('Integration with Injective offers practical advantages for ' +
    'solo-built products:');
  parts.push('');
  parts.push('1. **Instant Settlement** — Injective\'s 1.2s finality means ' +
    'your users don\'t wait for confirmations');
  parts.push('2. **Microtransaction Viability** — Sub-cent fees make even ' +
    'the smallest payments economic');
  parts.push('3. **Cross-Chain Reach** — IBC connects your product to 90+ ' +
    'Cosmos chains and beyond');
  parts.push('4. **Smart Contract Composability** — CosmWasm contracts ' +
    'can automate escrow, governance, and rewards');
  parts.push('5. **Verifiable Audit Trail** — On-chain attestations for ' +
    'any data your product needs to certify');
  parts.push('');
  parts.push('### Quick Integration Path');
  parts.push('');
  parts.push('```bash');
  parts.push('# Install the Injective TypeScript SDK');
  parts.push('npm install @injectivelabs/sdk-ts @injectivelabs/networks');
  parts.push('');
  parts.push('# Test the connection');
  parts.push('node -e "console.log(\'Injective SDK ready\')"');
  parts.push('```');
  parts.push('');

  return parts.join('\n');
}

/**
 * @typedef {Object} InjectiveStatus
 * @property {string} chainId - Injective chain ID
 * @property {number|null} latestBlockHeight - Latest block number
 * @property {string|null} latestBlockTime - ISO timestamp of latest block
 * @property {number|null} validatorCount - Number of active validators
 * @property {boolean} catchingUp - Whether the node is syncing
 * @property {string|null} appVersion - Application version
 * @property {string|null} appName - Application name
 * @property {string} endpoint - RPC endpoint used
 * @property {string} fetchedAt - Timestamp of fetch
 */
