# 🤖 Local AI PR & Code Review Tool Setup Guide

Welcome! This guide will walk you through setting up the fully local, automated AI Pull Request and Code Review system.

---

## ⚙️ 1. Automatic Setup & Installation

We have created a single `setup.sh` script that acts as an autonomous installer. It automatically detects missing dependencies, installs them, and wires up everything for you.

Run the following command in the root of your project:
```bash
./setup.sh
```

**What the script does automatically:**
- **Auto-Installs Prerequisites:** Detects your OS and uses `brew` (macOS) or `apt-get` (Linux) to install Node.js, GitHub CLI, and Ollama if they are missing.
- **Node Setup:** Removes old `node_modules` and runs a fresh `npm install`.
- **Git Hooks:** Installs Husky, initializes the `.husky` directory, sets your `core.hooksPath`, and makes the hook executable.
- **AI Model Setup:** Automatically pulls the lightweight **`llama3.2:1b`** model (~1.3GB) which saves massive space compared to older models while maintaining great performance.

---

## 🔑 2. One-Time GitHub Configuration

If you have never used the GitHub CLI before, you must authenticate it once. Run this in your terminal:
```bash
gh auth login
```
*(Follow the prompts: select "GitHub.com" -> "HTTPS" -> "Login with a web browser")*

---

## 🚀 3. How to Use

The AI runs locally and is designed to stay out of your way during normal development. Regular commits are **instant** and won't trigger the AI.

**To trigger the AI PR/Review, simply include `[ai-pr]` anywhere in your commit message!**

```bash
git commit -m "finished login feature [ai-pr]"
```

**What happens next?**
1. Your branch is automatically pushed to GitHub.
2. If you **don't** have an open PR, the AI generates a minimal PR title and summary, and creates the PR via GitHub CLI.
3. If you **do** have an open PR, the AI generates a strict code review and posts it as a comment on your PR.

**Custom Rules:**
Open `ai-tool/config/review-guidelines.json` and customize the `focusAreas` array. The AI will strictly follow these team rules when reviewing your PR diffs!

---

## 🛠️ 4. Troubleshooting Common Errors

### ❌ Error: `GitHub CLI (gh) is not installed` or `Ollama is not installed`
**Cause:** Graphical Git clients (like SourceTree or GitHub Desktop) on macOS do not inherit your terminal's `PATH`.
**Fix:** The `setup.sh` script automatically adds the typical Homebrew PATH to your `.husky/post-commit` file to fix this.

### ❌ Error: Connection Refused (Ollama)
**Cause:** The Ollama engine isn't running in the background.
**Fix:** Make sure the Ollama application is actually open and running in your system tray/menu bar before committing with `[ai-pr]`.
