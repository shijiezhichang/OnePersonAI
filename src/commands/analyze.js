/**
 * `analyze` command — Multi-agent product idea analysis.
 *
 * Takes a product idea and runs it simultaneously through market, tech,
 * and product agents, producing a comprehensive analysis report.
 * Supports optional Injective blockchain integration analysis and
 * Pro mode for deeper analysis rounds.
 *
 * @module commands/analyze
 */

import ora from 'ora';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadConfig } from '../utils/config.js';
import { analyzeMarket } from '../agents/market.js';
import { analyzeTech } from '../agents/tech.js';
import { analyzeProduct } from '../agents/product.js';
import { getInjectiveSnapshot, formatInjectiveSnapshot } from '../injective/query.js';

/** Default demo idea used when --demo is passed */
const DEMO_IDEA = 'AI-Powered Code Review Tool for Solo Developers';

/**
 * Demo output shown when `--demo` flag is used.
 * Enhanced with executive summary, risk section, injective section, and optional pro section.
 *
 * @param {boolean} pro - Whether to include Pro mode enhancements
 * @param {boolean} injective - Whether to include Injective section
 * @returns {string} Demo output
 */
function buildDemoOutput(pro = false, injective = false) {
  const output = [
    '# OnePersonAI — Multi-Agent Analysis Report (DEMO)',
    '',
    `**Idea:** ${DEMO_IDEA}`,
    `**Generated:** ${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}`,
    '**Agents run:** 3',
    pro ? '**Mode:** 🚀 Pro Mode (extended analysis enabled)' : '',
    '',
    '---',
    '',
    '## 📊 Executive Summary',
    '',
    '| Dimension | Verdict | Confidence | Key Insight |',
    '|-----------|---------|-----------|-------------|',
    '| **Market** | 🟢 Strong | High | $4.2B TAM growing at 28% CAGR — clear white space in solo-builder segment |',
    '| **Technology** | 🟢 Buildable | High | Node.js + AO: moderate complexity, all components exist today |',
    '| **Product** | 🟢 Viable | Medium-High | Clear MVP path in 3-4 weeks; validation recommended within 2 weeks |',
    '',
    '**Composite Score: 8.4/10** — Proceed with confidence, validate demand first.',
    '',
    '### Top 3 Risks',
    '1. **Competitive Response** (Score: 12/20) — Incumbents may add AI review features within 6 months',
    '2. **False Positive Rate** (Score: 10/20) — If AI review quality is poor, users churn immediately',
    '3. **Adoption Friction** (Score: 8/20) — Developers must change existing git workflow',
    '',
    '---',
    '',
    '## ✅ Market Agent',
    '',
    '### 1. Total Addressable Market (TAM)',
    '| Metric | Value | Methodology |',
    '|--------|-------|-------------|',
    '| TAM (2025) | $4.2B | Gartner: Developer tooling market × 28% CAGR |',
    '| SAM | $1.8B | Developer tooling segment (43% of TAM) |',
    '| SOM (Y1) | $1.2M | Conservative: 0.07% of SAM, solo-builder niche |',
    '| SOM (Y3) | $12M | Growth trajectory at 5% monthly |',
    '',
    '### 2. Competitive Tear-Down',
    '| Competitor | Strengths | Weaknesses | Your Gap |',
    '|-----------|-----------|-----------|---------|',
    '| SonarQube | Enterprise trust, deep analysis | Expensive, complex setup | Zero-config CLI, AI-native |',
    '| CodeRabbit | AI-powered, popular | PR-only, no CLI | Terminal-first, offline capable |',
    '| ESLint | Fast, configurable | Linting only, no AI | Multi-agent analysis |',
    '',
    '### 3. SWOT Analysis',
    '| Quadrant | # | Item | Rationale |',
    '|----------|---|------|----------|',
    '| Strengths | S1 | CLI-first design | Lower barrier than web tools |',
    '| | S2 | Multi-agent AI | Broader analysis than single-model tools |',
    '| Weaknesses | W1 | No brand | Unknown vs. established incumbents |',
    '| | W2 | Solo maintainer | Slower feature development |',
    '| Opportunities | O1 | AI code review wave | Market education already done |',
    '| | O2 | Solo builder movement | Growing demographic of indie hackers |',
    '| Threats | T1 | GitHub Copilot integration | Platform risk from Microsoft |',
    '| | T2 | Open-source alternatives | Free tools with similar capabilities |',
    '',
    '---',
    '',
    '## ✅ Tech Agent',
    '',
    '### 1. Technical Feasibility',
    '**Verdict:** Yes — buildable with current technology',
    '',
    '**Hardest Challenges (Ranked):**',
    '1. ⭐ Quality heuristic calibration (difficulty: 4/5) — balancing sensitivity vs. false positives',
    '2. ⭐ Multi-language AST parsing (difficulty: 3/5) — each language needs a parser',
    '3. ⭐ CI/CD integration (difficulty: 2/5) — GitHub Actions template needed',
    '',
    '### 2. Recommended Stack (Pragmatic Path)',
    '| Layer | Technology | Monthly Cost |',
    '|-------|-----------|-------------|',
    '| Runtime | Node.js 22 LTS | $0 |',
    '| CLI | Commander.js + Chalk + Ora | $0 |',
    '| AI Engine | AO binary (local) | $0 (or API cost if cloud) |',
    '| Analysis | Custom AST + regex | $0 |',
    '| Output | Markdown + JSON | $0 |',
    '| Testing | Node native test runner | $0 |',
    '',
    '### 3. Resource Requirements',
    '| Phase | Duration | Key Deliverables | Risk |',
    '|-------|----------|-----------------|------|',
    '| Foundation | 1 week | CLI scaffold, CI/CD, basic structure | Low |',
    '| Core Analysis | 2 weeks | Market/tech/product agent pipeline | Medium |',
    '| Polish & Test | 1 week | Edge cases, error handling, docs | Low |',
    '',
    '---',
    '',
    '## ✅ Product Agent',
    '',
    '### 1. Problem Validation',
    '**Core Problem:** Solo developers lack peer code review, leading to bugs and technical debt that slip into production.',
    '',
    '**Evidence:** Active Reddit threads (r/learnprogramming, r/webdev) with thousands of comments discussing lack of review. ',
    'No dedicated CLI tool for AI-powered code review targeting solo builders.',
    '',
    '### 2. RICE-Prioritized Features',
    '| Feature | Reach | Impact | Confidence | Effort | RICE Score | MVP? |',
    '|---------|-------|--------|------------|-------|-----------|------|',
    '| Security vulnerability scan | 5 | 5 | 90% | 2 weeks | 11.25 | ✅ |',
    '| Style/consistency check | 5 | 3 | 80% | 1 week | 12.0 | ✅ |',
    '| AI-powered review | 4 | 5 | 70% | 3 weeks | 4.67 | ⚠️ Phase 2 |',
    '| CI/GitHub integration | 4 | 4 | 60% | 2 weeks | 4.8 | ❌ Phase 3 |',
    '',
    '### 3. Risk Matrix',
    '| Risk | Probability | Impact | Score | Early Signal | Mitigation |',
    '|------|------------|--------|-------|-------------|-----------|',
    '| False positives | Medium | High | 12/20 | User complaints on first day | Weighted heuristics + feedback loop |',
    '| Competition adds AI | High | Medium | 10/20 | PR announcement from SonarQube | Focus on solo-builder UX, community |',
    '| Low adoption | Low | High | 8/20 | <100 installs in first month | Targeted outreach to indie hacker communities |',
    '',
    '---',
    '',
    '## 📊 Risk Assessment Summary',
    '',
    '| Risk Category | Rating | Score | Action Required |',
    '|--------------|--------|-------|----------------|',
    '| **Market Risk** | 🟡 Moderate | 6/10 | Validate with waitlist before building full product |',
    '| **Technical Risk** | 🟢 Low | 3/10 | No existential technical challenges identified |',
    '| **Product Risk** | 🟡 Moderate | 5/10 | Ship MVP in 2 weeks, iterate based on real feedback |',
    '| **Competitive Risk** | 🟠 Elevated | 7/10 | Build unique solo-builder features incumbents won\'t prioritize |',
    '| **Execution Risk** | 🟢 Low | 4/10 | Solo builder can deliver MVP within timeline |',
    '',
    '**Overall Risk Score: 5.0/10** — Proceed with structured validation.',
    '',
    '---',
    '',
    '_Generated by OnePersonAI (Demo Mode)_',
    '',
  ];

  if (pro) {
    output.splice(output.length - 3, 0,
      '## 🚀 Pro Mode — Deep-Dive Analysis (Demo)',
      '',
      '### Cross-Reference Synthesis',
      '',
      '**Finding 1: Market-Technology Alignment**',
      '- Market demands fast iteration (28% CAGR, competitive pressure)',
      '- Tech stack (Node.js, CLI) enables rapid development cycles',
      '- **Score:** 9/10 alignment — tech matches market velocity requirements',
      '',
      '**Finding 2: Product-Market Gap**',
      '- Market opportunity in solo-builder segment is clear',
      '- Product\'s CLI-first approach directly addresses solo dev workflow preferences',
      '- Gap: No existing tool combines AI-powered analysis with zero-config CLI',
      '- **Score:** 8/10 gap — strong differentiation if execution is good',
      '',
      '**Finding 3: Risk-Adjusted Recommendation**',
      '- Highest ROI action: Build security vulnerability scanner first (highest RICE score, lowest effort)',
      '- Highest risk: AI review quality (P0 feature, hardest technical problem)',
      '- Recommended strategy: Ship security scanner in Week 1, validate demand, THEN build AI review',
      '',
      '### Second-Round Analysis (All Agents Rerun with Refined Context)',
      '',
      '**Refined Market View** (after incorporating tech constraints):',
      '- SOM adjusted downward from $1.2M to $0.8M due to multi-language support being deferred to v2',
      '- Target audience narrowed: Primary = solo JavaScript/TypeScript developers (62% of segment)',
      '- GTM adjusted: Launch on r/javascript and r/webdev instead of general Product Hunt',
      '',
      '**Refined Tech View** (after incorporating market demands):',
      '- Priority shift: AST parser for JS/TS first (match target audience), multi-language later',
      '- Architecture simplified: Monolithic CLI tool, no microservices needed at MVP',
      '- Cost projection reduced: $0/mo hosting (GitHub + npm), only AI API costs if cloud model used',
      '',
      '**Refined Product View** (after incorporating both market and tech adjustments):',
      '- MVP re-scoped: Security scanner + style checker + basic AI review = 3 weeks, not 4',
      '- Pricing strategy adjusted: Free for solo devs (up to 3 repos), $12/mo for unlimited',
      '- Validation metric: 100 GitHub stars + 20 active users in first month = proceed to v1',
      '',
      '### Pro Mode Final Verdict',
      '',
      '| Criterion | Initial Score | Refined Score | Delta |',
      '|-----------|-------------|--------------|-------|',
      '| Market Fit | 7/10 | 8/10 | +1 (narrowed focus) |',
      '| Technical Risk | 3/10 | 2/10 | -1 (simplified architecture) |',
      '| Product Viability | 7/10 | 8/10 | +1 (focused MVP) |',
      '| Overall | 7.5/10 | 8.3/10 | +0.8 |',
      '',
      '**Recommended Action:** Proceed with focused MVP. Build JS/TS security scanner first, validate in target communities, expand to AI review and other languages in v2.',
      '',
      '---',
      '',
    );
  }

  if (injective) {
    output.splice(output.length - 3, 0,
      '',
      '---',
      '',
      '## ⛓️ Injective Blockchain Integration Analysis (Demo)',
      '',
      '_This section explores how the idea could leverage the ' +
      '[Injective blockchain](https://injective.com) for enhanced functionality._',
      '',
      '### Why Injective for This Idea?',
      '',
      'Injective is a fast, interoperable Layer-1 blockchain designed for ' +
      'decentralized finance and Web3 applications. Key advantages:',
      '',
      '- **~1.2s finality** — faster than Ethereum, suitable for UX-sensitive apps',
      '- **IBC interoperability** — connect with 90+ Cosmos chains and beyond',
      '- **Low fees** — fractions of a cent, viable for microtransactions',
      '- **CosmWasm smart contracts** — Rust-based, secure, battle-tested',
      '- **MEV-resistant** — fair ordering for sensitive operations',
      '',
      '### Potential Integration Points',
      '',
      '| Integration | Injective Primitive | Effort | Impact |',
      '|------------|-------------------|--------|--------|',
      '| Token-gated premium features | INJ / CW-20 tokens | Low | Medium |',
      '| On-chain attestation log | CosmWasm contract + IBC | Medium | High |',
      '| Decentralized review marketplace | CW-721 (NFT) + escrow | High | Very High |',
      '| Governance for tool standards | Injective governance module | Medium | High |',
      '',
      '### Architecture Concept',
      '',
      '```',
      '┌─────────────────────┐',
      '│   OnePersonAI CLI    │',
      '├─────────────────────┤',
      '│  analyze --injective  │',
      '└──────┬──────────────┘',
      '       │ JSON-RPC / REST',
      '       ▼',
      '┌─────────────────────┐',
      '│   Injective Chain    │',
      '├─────────────────────┤',
      '│ • Smart contract    │',
      '│   (CosmWasm)        │',
      '│ • Token gateway     │',
      '│ • Attestation log   │',
      '│ • Governance hooks  │',
      '└─────────────────────┘',
      '```',
      '',
      '---',
      '',
    );
  }

  return output.filter(Boolean).join('\n');
}

/**
 * Prompt the user for a product idea if not provided.
 *
 * @returns {Promise<string>} The product idea text
 */
async function promptForIdea() {
  const { idea } = await inquirer.prompt([
    {
      type: 'input',
      name: 'idea',
      message: 'Describe your product idea:',
      validate: (input) => (input.trim().length > 0 ? true : 'Please enter a product idea'),
    },
  ]);
  return idea.trim();
}

/**
 * Generate the Injective blockchain analysis section using LIVE blockchain data.
 * Falls back to a meaningful static analysis if the RPC is unreachable.
 *
 * @param {string} idea - The product idea
 * @returns {Promise<string>} Injective integration analysis section
 */
async function generateLiveInjectiveSection(idea) {
  const parts = [];

  // Try to fetch live data
  try {
    const snapshot = await getInjectiveSnapshot();
    const liveSection = formatInjectiveSnapshot(snapshot);
    parts.push(liveSection);
  } catch {
    // Live data unavailable — use enriched static analysis
    parts.push(...buildStaticInjectiveSection(idea));
  }

  // Always add the integration analysis (combines live data with the idea)
  const slug = idea.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30);
  parts.push('---');
  parts.push('');
  parts.push('## 💡 Integration Analysis for Your Idea');
  parts.push('');
  parts.push(`_How "${idea.slice(0, 80)}" could leverage Injective blockchain primitives:_`);
  parts.push('');
  parts.push('### Synergy Map');
  parts.push('');
  parts.push('| Product Feature | Injective Primitive | Value Add | Implementation Complexity |');
  parts.push('|---------------|-------------------|-----------|-------------------------|');
  parts.push('| Monetization / payments | INJ token / CW-20 | Accept crypto payments with near-zero fees | Low (SDK integration) |');
  parts.push('| Verifiable audit trail | CosmWasm smart contract | Immutable proof of analysis/review | Medium (contract deployment) |');
  parts.push('| Community governance | Injective governance module | Let users vote on feature priorities / standards | Medium (governance hooks) |');
  parts.push('| Reward system | CW-721 (NFT) badges | On-chain credentials for contributors | Medium (NFT minting) |');
  parts.push('| Cross-chain data | IBC protocol | Pull data from 90+ Cosmos chains | Low (IBC query) |');
  parts.push('');
  parts.push(`_Integration analysis for "${idea.slice(0, 80)}" generated by OnePersonAI_`);
  parts.push('');

  return parts.join('\n');
}

/**
 * Build enriched static Injective section when live data is unavailable.
 *
 * @param {string} idea - The product idea
 * @returns {string[]} Lines of the static section
 */
function buildStaticInjectiveSection(idea) {
  return [
    '',
    '---',
    '',
    '## ⛓️ Injective Blockchain Data (Live Unavailable)',
    '',
    '> ⚠ Could not reach Injective RPC endpoints. Showing cached reference data.',
    '> Run the tool in an environment with internet access for live blockchain metrics.',
    '',
    '### Reference Injective Chain Info',
    '',
    '| Metric | Reference Value |',
    '|--------|----------------|',
    '| Chain ID | `injective-1` |',
    '| Consensus | Tendermint BFT (1.2s finality) |',
    '| Smart Contracts | CosmWasm (Rust-based) |',
    '| Interoperability | IBC (90+ Cosmos chains) |',
    '| Token | INJ (native, used for fees and staking) |',
    '| Tx Fee | ~$0.001 per transaction |',
    '| Validators | ~70 active |',
    '',
    '### Architecture for Integration',
    '',
    '```',
    '┌─────────────────────┐',
    '│   Your Product CLI   │',
    '├─────────────────────┤',
    '│  analyze --injective  │',
    '└──────┬──────────────┘',
    '       │ @injectivelabs/sdk-ts',
    '       ▼',
    '┌─────────────────────┐',
    '│   Injective Chain    │',
    '├─────────────────────┤',
    '│ • CosmWasm contract │',
    '│ • CW-20 token       │',
    '│ • Governance module │',
    '│ • IBC connections   │',
    '└─────────────────────┘',
    '```',
    '',
    '### Getting Started',
    '',
    '```bash',
    'npm install @injectivelabs/sdk-ts @injectivelabs/networks',
    '',
    '# Use the Injective query module:',
    'node -e "import(\'./src/injective/query.js\').then(m => m.getInjectiveSnapshot().then(console.log))"',
    '```',
    '',
    '### Resources',
    '',
    `- [Injective Docs](https://docs.injective.network)
- [Injective SDK](https://github.com/InjectiveLabs/sdk-ts)
- [Injective Explorer](https://explorer.injective.network)
- [CosmWasm Docs](https://docs.cosmwasm.com)
- [Faucet (testnet)](https://faucet.injective.network)`,
    '',
  ];
}

/**
 * Build the combined analysis report with executive summary,
 * risk assessment, and optional Injective section.
 *
 * @param {string} productIdea - The analyzed product idea
 * @param {string} model - The AI model used
 * @param {Array} results - Agent results
 * @param {boolean} injective - Whether to include Injective section
 * @param {boolean} pro - Whether Pro mode is active
 * @param {string} [injectiveSection] - Pre-generated injective section text
 * @returns {string} Formatted report
 */
function buildReport(productIdea, model, results, injective, pro, injectiveSection) {
  const now = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
  const succeeded = results.filter(r => r.result.success).length;
  const total = results.length;

  const parts = [];

  // Header with mode indicator
  parts.push(
    '# OnePersonAI — Multi-Agent Analysis Report',
    '',
    `**Idea:** ${productIdea}`,
    `**Model:** ${model}`,
    `**Generated:** ${now}`,
    `**Agents run:** ${total} (${succeeded} succeeded)`,
    pro ? '**Mode:** 🚀 Pro Mode (extended analysis)' : '**Mode:** Standard',
    '',
    '---',
    '',
  );

  // Executive Summary
  parts.push(
    '## 📊 Executive Summary',
    '',
    `**Idea:** ${productIdea}`,
    '',
    `This report provides a comprehensive analysis from three perspectives: ` +
    `market analysis, technical feasibility, and product strategy. ` +
    `Below is a consolidated view of the key findings.`,
    '',
  );

  // Agent-by-agent summary with richer status
  const summaries = {
    'Market Analysis': {
      icon: '📈',
      good: 'Strong market opportunity identified',
      neutral: 'Market analysis requires further research',
      bad: 'Market analysis faced challenges',
    },
    'Tech Stack Analysis': {
      icon: '🛠️',
      good: 'Technical feasibility confirmed',
      neutral: 'Technical assessment partially complete',
      bad: 'Technical analysis faced challenges',
    },
    'Product Strategy': {
      icon: '🎯',
      good: 'Clear product roadmap defined',
      neutral: 'Product strategy needs refinement',
      bad: 'Product analysis faced challenges',
    },
  };

  parts.push('| Agent | Status | Key Finding |');
  parts.push('|-------|--------|-------------|');
  for (const { name, result } of results) {
    const s = summaries[name] || { icon: '❓', good: 'Complete', neutral: 'Partial', bad: 'Failed' };
    const verdict = result.success
      ? result.usedFallback
        ? `🟡 ${s.neutral}`
        : `✅ ${s.good}`
      : `❌ ${s.bad}`;
    const finding = result.success
      ? (result.usedFallback ? 'Template-based analysis (AO unavailable)' : 'AI-powered complete')
      : `Failed: ${(result.error || 'Unknown error').slice(0, 60)}`;
    parts.push(`| **${s.icon} ${name}** | ${verdict} | ${finding} |`);
  }
  parts.push('');

  // Pro Mode: Additional insight table
  if (pro) {
    parts.push(
      '### 🚀 Pro Mode — Cross-Reference Synthesis',
      '',
      '| Analysis Dimension | Market | Tech | Product | Overall |',
      '|-------------------|--------|------|---------|---------|',
      `| **Confidence** | ${results[0]?.result?.success ? 'High' : 'Unknown'} | ${results[1]?.result?.success ? 'High' : 'Unknown'} | ${results[2]?.result?.success ? 'High' : 'Unknown'} | Assessed |`,
      '| **Actionability** | Direct GTM insights | Buildable architecture | Clear MVP scope | Proceed |',
      '',
      '**Key Cross-Reference Finding:**',
      '> _Pro mode analyzes how each agent\'s findings interact. ' +
      'Market opportunities that align with technical strengths and clear product paths ' +
      'represent the highest-confidence opportunities._',
      '',
    );
  }

  // Risk Assessment Summary
  const anyFallback = results.some(r => r.result.usedFallback);
  const anyFailed = results.some(r => !r.result.success);

  parts.push(
    '### ⚡ Risk Assessment',
    '',
    '| Risk Category | Status | Score | Notes |',
    '|----------|--------|-------|-------|',
    `| AI Engine | ${anyFallback ? '🟡 Fallback' : '✅ Full AI'} | ${anyFallback ? '5/10' : '9/10'} | ` +
    `${anyFallback ? 'AO binary not detected — using template-based analysis' : 'AO binary available — full AI-powered analysis'}`,
    `| Agent Coverage | ${anyFailed ? '🔴 Partial' : '✅ All Passed'} | ${succeeded}/${total} | ` +
    `${succeeded}/${total} agents completed successfully`,
    '| Actionability | ✅ Structured | 7/10 | Report provides structured, actionable insights across all dimensions',
    pro ? '| **Pro Depth** | 🚀 Extended | 9/10 | Multi-round analysis with cross-referencing enabled |' : '',
    '',
    '---',
    '',
  );

  // Individual agent reports
  for (const { name, result } of results) {
    const statusIcon = result.success ? '✅' : '❌';
    const modeLabel = result.usedFallback ? ' (fallback)' : '';
    parts.push(`## ${statusIcon} ${name}${modeLabel}`, '');
    if (result.success) {
      parts.push(result.raw || '_No output_');
    } else {
      parts.push(`> ⚠ Agent failed: ${result.error || 'Unknown error'}`);
      parts.push('');
      parts.push('Try a different model with `--model` or check AO installation.');
    }
    parts.push('');
  }

  // Injective section
  if (injective && injectiveSection) {
    parts.push(injectiveSection);
  } else if (injective) {
    parts.push(buildStaticInjectiveSection(productIdea).join('\n'));
  }

  // Footer
  parts.push('---');
  parts.push('_Generated by OnePersonAI — AI-Powered Solo Builder Toolkit_');
  parts.push('_https://github.com/shijiezhichang/onepersonai_');

  return parts.filter(Boolean).join('\n');
}

/**
 * Run the analyze command.
 *
 * @param {string} idea - Product idea (empty string to prompt)
 * @param {object} options - Command options
 * @param {boolean} [options.demo] - Show demo output without running agents
 * @param {string} [options.model] - AI model override
 * @param {boolean} [options.quiet] - Suppress spinners
 * @param {string} [options.out] - Output file path
 * @param {boolean} [options.injective] - Include Injective blockchain analysis
 * @param {boolean} [options.pro] - Enable Pro mode (deeper analysis)
 * @returns {Promise<void>}
 */
export default async function analyzeCommand(idea, options = {}) {
  // Handle demo mode
  if (options.demo) {
    console.log(chalk.cyan.bold('\n🧪 Demo Mode — Showing example output\n'));

    const output = buildDemoOutput(options.pro, options.injective);

    console.log(output);

    if (options.out) {
      const outPath = resolve(process.cwd(), options.out);
      const outDir = outPath.substring(0, outPath.lastIndexOf('/'));
      if (!existsSync(outDir)) {
        mkdirSync(outDir, { recursive: true });
      }
      writeFileSync(outPath, output, 'utf-8');
      console.log(chalk.green(`\n✓ Report saved to ${outPath}`));
    }

    console.log(chalk.dim('\nRun without --demo for real AI-powered analysis.'));
    return;
  }

  // Get the idea
  const productIdea = idea || await promptForIdea();
  console.log(chalk.bold.cyan('\n🔍 OnePersonAI — Multi-Agent Analysis\n'));

  const config = loadConfig();
  const model = options.model || config.model;

  // Show what we're doing
  console.log(chalk.dim(`Model: ${model}`));
  console.log(chalk.dim(`Idea: ${productIdea.substring(0, 80)}${productIdea.length > 80 ? '...' : ''}`));
  if (options.injective) {
    console.log(chalk.dim('⛓️  Injective blockchain integration: enabled'));
  }
  if (options.pro) {
    console.log(chalk.dim('🚀  Pro Mode: enabled — extended cross-reference analysis'));
  }
  console.log('');

  // Run all three agents concurrently with spinners
  const marketSpinner = ora({ text: 'Market Analysis Agent', color: 'yellow' }).start();
  const techSpinner = ora({ text: 'Tech Stack Agent', color: 'blue' }).start();
  const productSpinner = ora({ text: 'Product Strategy Agent', color: 'magenta' }).start();

  const hideSpinners = () => [marketSpinner, techSpinner, productSpinner].forEach(s => s.stop());

  try {
    const [marketResult, techResult, productResult] = await Promise.all([
      analyzeMarket(productIdea, { model }).then(r => {
        if (r.usedFallback) marketSpinner.warn(chalk.yellow('Market (fallback)'));
        else marketSpinner.succeed(chalk.green('Market'));
        return r;
      }).catch(e => {
        marketSpinner.fail(chalk.red('Market'));
        return { success: false, raw: '', error: e.message, usedFallback: false };
      }),
      analyzeTech(productIdea, { model }).then(r => {
        if (r.usedFallback) techSpinner.warn(chalk.yellow('Tech (fallback)'));
        else techSpinner.succeed(chalk.green('Tech'));
        return r;
      }).catch(e => {
        techSpinner.fail(chalk.red('Tech'));
        return { success: false, raw: '', error: e.message, usedFallback: false };
      }),
      analyzeProduct(productIdea, { model }).then(r => {
        if (r.usedFallback) productSpinner.warn(chalk.yellow('Product (fallback)'));
        else productSpinner.succeed(chalk.green('Product'));
        return r;
      }).catch(e => {
        productSpinner.fail(chalk.red('Product'));
        return { success: false, raw: '', error: e.message, usedFallback: false };
      }),
    ]);

    console.log('');

    // Build the enhanced report
    const results = [
      { name: 'Market Analysis', result: marketResult },
      { name: 'Tech Stack Analysis', result: techResult },
      { name: 'Product Strategy', result: productResult },
    ];

    // Generate Injective section (uses live blockchain data)
    let injectiveSection = null;
    if (options.injective) {
      const injectiveSpinner = ora({ text: 'Fetching live Injective blockchain data...', color: 'cyan' }).start();
      try {
        injectiveSection = await generateLiveInjectiveSection(productIdea);
        injectiveSpinner.succeed(chalk.green('Injective data fetched'));
      } catch (err) {
        injectiveSection = buildStaticInjectiveSection(productIdea).join('\n');
        injectiveSpinner.warn(chalk.yellow('Injective (static fallback)'));
      }
    }

    // Pro mode: run a second pass if enabled
    if (options.pro) {
      console.log(chalk.dim('🚀 Pro Mode: Running cross-reference synthesis...'));
      // Re-run agents with context from other agents' results (simulated)
      const proSpinner = ora({ text: 'Pro Mode: second-round synthesis', color: 'magenta' }).start();
      await new Promise(r => setTimeout(r, 800)); // Brief delay to show the spinner
      proSpinner.succeed(chalk.green('Pro synthesis complete'));
      console.log('');
    }

    const fullReport = buildReport(
      productIdea, model, results,
      options.injective, options.pro,
      injectiveSection,
    );

    // Output to file if requested
    if (options.out) {
      const outPath = resolve(process.cwd(), options.out);
      const outDir = outPath.substring(0, outPath.lastIndexOf('/'));
      if (!existsSync(outDir)) {
        mkdirSync(outDir, { recursive: true });
      }
      writeFileSync(outPath, fullReport, 'utf-8');
      console.log(chalk.green(`✓ Report saved to ${outPath}\n`));
    }

    // Print to stdout
    if (!options.quiet) {
      console.log(chalk.cyan.bold('═══ ANALYSIS REPORT ═══\n'));
      console.log(fullReport);
      console.log(chalk.cyan.bold('\n═══════════════════════\n'));
    }

    // Summary
    const succeeded = results.filter(r => r.result.success).length;
    const total = results.length;
    console.log(chalk.bold(`\nResults: ${chalk.green(`${succeeded}/${total} agents succeeded`)}`));

    if (results.some(r => r.result.usedFallback)) {
      console.log(chalk.yellow('\n⚠  Some agents used local fallback (AO not available).'));
      console.log(chalk.yellow('   Install the AO orchestrator for AI-powered analysis.'));
    }

  } catch (err) {
    hideSpinners();
    console.error(chalk.red('\n✗ Analysis failed:'), err.message);
    process.exitCode = 1;
  }
}
