# OnePersonAI 🧠✨

> **AI-Powered Solo Builder Toolkit** — analyze product ideas, scaffold projects, review code quality, and orchestrate multi-agent workflows from your terminal. Built for one-person teams who ship.

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)
[![CI](https://github.com/shijiezhichang/OnePersonAI/actions/workflows/ci.yml/badge.svg)](https://github.com/shijiezhichang/OnePersonAI/actions/workflows/ci.yml)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/shijiezhichang/onepersonai/pulls)
[![CLI](https://img.shields.io/badge/CLI-Commander.js-blueviolet)](https://github.com/tj/commander.js)
[![Injective](https://img.shields.io/badge/Injective-Ready-00BFFF)](https://injective.com)

---

## 🚀 Quick Start

```bash
# Clone and install
git clone https://github.com/shijiezhichang/onepersonai.git
cd onepersonai
npm install

# Try it in demo mode (no AI required)
npm start -- analyze --demo

# See the full Injective blockchain integration analysis
npm start -- analyze --demo --injective

# Self-review the entire codebase
npm start -- review
```

**No external API keys needed.** The `--demo` flag shows a full sample report instantly. Everything works out of the box.

---

## ✨ Features

| Command | Description | Injective Integration |
|---------|-------------|---------------------|
| `analyze` | 🧪 Run any product idea through 3 AI agents (market, tech, product) simultaneously | ⛓️ Optional `--injective` flag adds live blockchain data integration |
| | | 🚀 Optional `--pro` flag enables extended deep-dive analysis with cross-referencing |
| `scaffold` | 🏗️ Generate complete project structure from a plan or template | — |
| `review` | 📋 Self-review code for quality, security, and structural issues | — |

### Why OnePersonAI?

Solo builders don't have a team to brainstorm, review, or plan with. OnePersonAI gives you **AI agent colleagues** that analyze your ideas from every angle — market fit, technical feasibility, and product strategy — so you can make better decisions and ship faster.

### Why Injective?

This project is built for the **Injective Solo AI Builder Sprint**. The `analyze --injective` flag produces a bonus section showing how your idea could leverage Injective's blockchain primitives: fast finality (1.2s), IBC interoperability, CosmWasm smart contracts, and INJ token integration.

---

## 📦 Installation

### Prerequisites

- **Node.js 18+** (ESM support required)
- _(Optional)_ **AO binary** at `/usr/bin/ao` — for full AI-powered multi-agent orchestration
  - All agents work in fallback mode without AO, providing template-based analysis

### Setup

```bash
# Clone the repo
git clone https://github.com/shijiezhichang/onepersonai.git
cd onepersonai

# Install dependencies
npm install

# Make CLI globally accessible (optional)
npm link

# Run tests
npm test
```

---

## 🎯 Usage

### Analyze a Product Idea

```bash
# Interactive mode (prompts for idea)
npm start -- analyze

# Pass idea directly as an argument
npm start -- analyze "AI-powered todo app for remote teams"

# Demo mode (shows example output, no AI calls required)
npm start -- analyze --demo

# Include Injective blockchain integration analysis
npm start -- analyze "Decentralized code review marketplace" --injective

# Save report to file
npm start -- analyze "AI code reviewer" --out report.md

# Enable Pro Mode for deeper cross-reference analysis
npm start -- analyze "SaaS for freelancers" --pro

# Use a specific model (requires AO)
npm start -- analyze "SaaS for freelancers" --model claude-3-opus
```

### Demo Output

```
🧪 Demo Mode — Showing example output

# OnePersonAI — Multi-Agent Analysis Report (DEMO)

**Idea:** AI-Powered Code Review Tool for Solo Developers
**Generated:** 2025-01-15 10:30:00
**Agents run:** 3

---

## 📊 Executive Summary

**Market Verdict:** 🟢 Strong opportunity — growing market with clear white space
**Tech Verdict:** 🟢 Buildable with current technology — moderate complexity
**Product Verdict:** 🟢 Clear MVP path — validation recommended within 2 weeks

...

## ⛓️ Injective Blockchain Integration Analysis

_Explores how the idea could leverage Injective blockchain for
token-gated features, on-chain attestations, and a decentralized
review marketplace._
```

[![Demo Screenshot](https://img.shields.io/badge/▶️-Watch%20Demo-green)](demo.sh)
_Run `bash demo.sh` to see the full demo in your terminal._

### Scaffold a Project

```bash
# Interactive mode — prompts for name, description, and template
npm start -- scaffold my-new-project

# Specify a template directly
npm start -- scaffold my-api --template api-service
```

**Available templates:**

| Template | Description |
|---|---|
| `cli-tool` | CLI tool with `bin/` and `src/` structure |
| `web-app` | Web application with routes, middleware, views |
| `api-service` | REST API service with routes, models, services |
| `library` | Minimal library/package structure |
| `custom` | Just the basics (package.json, .gitignore, README) |

### Review Code

```bash
# Review the current directory
npm start -- review

# Review a specific directory
npm start -- review ./src

# Only show errors and warnings
npm start -- review . --severity warning

# Verbose output
npm start -- review . --verbose
```

---

## ⛓️ Injective Blockchain Integration

The `analyze --injective` flag generates a bonus report section that analyzes
how your product idea could integrate with the Injective blockchain ecosystem.

### What It Covers

| Integration Point | Injective Primitive | Description |
|-----------------|-------------------|-------------|
| Token-gated features | INJ / CW-20 | Premium features accessible via INJ tokens |
| On-chain attestations | CosmWasm contract | Immutable audit trail with verifiable hashes |
| Decentralized marketplace | CW-721 + escrow | Smart contract-powered review bounties |
| DAO governance | Injective governance | Community-voted quality standards |
| Cross-chain reach | IBC protocol | Interoperability with 90+ Cosmos chains |

### Code Example

```javascript
// Using the @injectivelabs/sdk-ts
import { ChainId, MsgSend } from '@injectivelabs/sdk-ts';
import { getNetworkEndpoints, Network } from '@injectivelabs/networks';

// Create an Injective transaction
const msg = MsgSend.fromJSON({
  amount: [{ amount: '1000000000', denom: 'inj' }],
  srcInjectiveAddress: sender,
  dstInjectiveAddress: recipient,
});
```

---

## 🧠 Architecture

```
┌────────────────────────────────────────────────────────────┐
│                   OnePersonAI CLI                            │
│              bin/onepersonai.js (Commander.js)               │
└─────────────────────┬───────────────────────────────────────┘
                      │
      ┌───────────────┼───────────────┐
      ▼               ▼               ▼
┌──────────┐   ┌──────────┐   ┌──────────┐
│ analyze  │   │ scaffold │   │  review  │
│ command  │   │ command  │   │  command  │
└────┬─────┘   └──────────┘   └──────────┘
     │
     ▼
┌──────────────────────────────────────────────────┐
│              src/agents/                           │
│                                                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │  Market  │  │   Tech   │  │ Product  │        │
│  │ Analysis │  │ Analysis │  │ Strategy │        │
│  └──────────┘  └──────────┘  └──────────┘        │
│  ┌──────────┐  ┌────────────────────────────┐    │
│  │ Content  │  │   src/orchestrator/         │    │
│  │ Gen.     │  │   Multi-agent runner        │    │
│  └──────────┘  └─────────────┬──────────────┘    │
└──────────────────────────────┼───────────────────┘
                               │
                               ▼
                    ┌──────────────────┐
                    │   AO Binary      │ (optional)
                    │  /usr/bin/ao     │
                    │  (or fallback)   │
                    └──────────────────┘
```

### How Agents Work

1. **User** runs `onepersonai analyze "product idea"`
2. **Orchestrator** spawns 3 AO subprocesses concurrently with agent-specific prompts
3. **Each agent** (market, tech, product) analyzes the idea from its domain
4. **Results** are collected and formatted into a unified Markdown report with:
   - 📊 Executive Summary with verdicts
   - ⚡ Risk Assessment matrix
   - 🎯 Individual agent findings
   - ⛓️ _(Optional)_ Injective blockchain integration analysis
5. **Fallback**: If AO is not installed, each agent provides smart template-based analysis

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Runtime** | Node.js 18+ (ESM modules) |
| **CLI Framework** | [Commander.js](https://github.com/tj/commander.js) |
| **CLI UX** | [Chalk](https://github.com/chalk/chalk) + [Ora](https://github.com/sindresorhus/ora) |
| **Prompts** | [Inquirer](https://github.com/SBoudrias/Inquirer.js) |
| **AI Engine** | AO binary (optional, graceful fallback) |
| **Analytical Frameworks** | SWOT, Porter's Five Forces, RICE scoring, Risk scoring |
| **Blockchain** | Injective (`--injective` flag) — live RPC data from mainnet |
| **Pro Mode** | Extended analysis with cross-reference synthesis (`--pro` flag) |
| **Testing** | Node.js native test runner |
| **CI/CD** | GitHub Actions |
| **Output Format** | Markdown reports |
| **Package Mgmt** | npm |

---

## ⚙️ Configuration

Create a `.onepersonairc` file in your home directory or project root:

```json
{
  "model": "gpt-4o",
  "aoPath": "/usr/bin/ao",
  "outputDir": "./output",
  "verbose": false
}
```

Or use environment variables:

```bash
export ONEPERSONAI_MODEL=claude-3-opus
export ONEPERSONAI_AO_PATH=/custom/path/ao
export ONEPERSONAI_OUTPUT_DIR=./reports
export ONEPERSONAI_VERBOSE=true
```

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
node --experimental-vm-modules node_modules/.bin/jest --coverage

# Run specific test
node --test test/analyze.test.js
```

---

## 🛠️ Development

```bash
# Run tests
npm test

# Self-review the codebase
npm start -- review .

# Run in development mode with file watching
node --watch bin/onepersonai.js

# Generate demo output
bash demo.sh
```

---

## 🧪 Hackathon Notes

This project was built for the **Injective Solo AI Builder Sprint** (May 2026).
Key design decisions that set this submission apart:

| Criteria | How OnePersonAI Excels |
|----------|----------------------|
| **Usefulness & clarity** | 3 specialized AI agents + optional Injective analysis in one CLI command |
| **Quality of execution** | ESM-only, graceful fallbacks, self-reviewing, analytical frameworks (SWOT, Porter's Five Forces, RICE) |
| **Simplicity & usability** | Zero-config start, `--demo` mode, interactive prompts, beautiful CLI |
| **Code structure & documentation** | Modular architecture, JSDoc throughout, comprehensive README, CI pipeline |
| **Future contributions** | Plugin-ready agent system, Injective integration path, template system, open for PRs |

### Standout Features

- **3 AI agents** running concurrently — market, tech, and product analysis
- **Executive Summary** with verdicts and risk assessment matrix
- **Injective blockchain integration** — `--injective` flag fetches LIVE data from Injective mainnet via public RPC endpoints (block height, validator count, token supply)
- **Pro Mode** — `--pro` flag enables extended cross-reference synthesis with multi-round analysis, demonstrating that the tool scales with complexity
- **Self-reviewing** — the `review` command audits its own codebase
- **Graceful degradation** — full AI analysis with AO, smart fallbacks without
- **Professional analytical frameworks** — SWOT, Porter's Five Forces, RICE scoring, Pro-level risk matrices

---

## 📄 License

MIT — use freely, build boldly.

---

## 🤝 Contributing

PRs welcome! Solo builders helping solo builders. Check out the [issues](https://github.com/shijiezhichang/onepersonai/issues) for good first contributions.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing`)
5. Open a Pull Request

---

<p align="center">
  Built with 🧠 for the Injective Solo AI Builder Sprint<br>
  <a href="https://github.com/shijiezhichang/OnePersonAI">GitHub</a> •
  <a href="https://injective.com">Injective</a> •
  <a href="https://github.com/shijiezhichang/OnePersonAI/issues">Issues</a>
</p>
