# OnePersonAI 🧠✨

> **AI-Powered Solo Builder Toolkit** — analyze product ideas, scaffold projects, review code quality, and orchestrate multi-agent workflows from your terminal. Built for one-person teams who ship.

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/shijiezhichang/onepersonai/pulls)
[![CLI](https://img.shields.io/badge/CLI-Commander.js-blueviolet)](https://github.com/tj/commander.js)

---

## 🚀 Quick Start

```bash
# Clone and install
git clone https://github.com/shijiezhichang/onepersonai.git
cd onepersonai
npm install

# Try it in demo mode (no AI required)
npm start -- analyze --demo
```

No external API keys needed to start. The `--demo` flag shows a full sample report instantly.

---

## ✨ Features

| Command | Description |
|---|---|
| `analyze` | 🧪 Run any product idea through 3 AI agents (market, tech, product) simultaneously |
| `scaffold` | 🏗️ Generate complete project structure from a plan or template |
| `review` | 📋 Review code for quality, security, and structural issues in any directory |

### Why OnePersonAI?

Solo builders don't have a team to brainstorm, review, or plan with. OnePersonAI gives you **AI agent colleagues** that analyze your ideas from every angle — market fit, technical feasibility, and product strategy — so you can make better decisions and ship faster.

---

## 📦 Installation

### Prerequisites

- **Node.js 18+** (ESM support required)
- _(Optional)_ **AO binary** at `/usr/bin/ao` — for full AI-powered analysis.
  - All agents work in fallback mode without AO, providing template-based analysis.

### Setup

```bash
# Clone the repo
git clone https://github.com/shijiezhichang/onepersonai.git
cd onepersonai

# Install dependencies
npm install

# Make CLI globally accessible (optional)
npm link
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

# Save report to file
npm start -- analyze "AI code reviewer" --out report.md

# Use a specific model (requires AO)
npm start -- analyze "SaaS for freelancers" --model claude-3-opus
```

**Sample output:**
```bash
$ npm start -- analyze "AI code reviewer" --demo

🧪 Demo Mode — Showing example output

# OnePersonAI — Multi-Agent Analysis Report (DEMO)

**Generated:** 2025-01-15 10:30:00
**Agents run:** 3

---

## ✅ Market Agent (1420ms)

### 1. Total Addressable Market (TAM)
- **Market Size:** $4.2B by 2027 (CAGR 28%)
```

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
```

**Sample output:**
```bash
$ npm start -- review .

📋 OnePersonAI — Code Review

Found 6 source files out of 12 total

📊 Summary
  Files scanned: 6
  Total lines:   1,234
  Total issues:  3
    🟡 2 warnings
    🔵 1 suggestion
```

---

## 🧠 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   OnePersonAI CLI                        │
│              bin/onepersonai.js (Commander.js)           │
└─────────────────────┬───────────────────────────────────┘
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
4. **Results** are collected and formatted into a unified Markdown report
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

## 🛠️ Development

```bash
# Run tests (when Jest is configured)
npm test

# Lint and format
npm run lint

# Run in development mode with file watching
node --watch bin/onepersonai.js
```

---

## 🧪 Hackathon Notes

This project was built for the **Injective Solo AI Builder Sprint**. Key design decisions:

- **ESM throughout** — modern Node.js module system with `type: "module"`
- **Graceful degradation** — all agents work with or without the AO binary
- **Beautiful CLI** — chalk colors, ora spinners, structured output
- **Self-reviewing** — the `review` command can audit its own codebase
- **Zero config to start** — works out of the box with `npm install && npm start -- analyze --demo`
- **One-person focus** — every feature serves solo builders who need maximum impact

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
