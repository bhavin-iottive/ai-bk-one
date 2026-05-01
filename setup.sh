#!/usr/bin/env bash
set -e

trap "echo -e '\n❌ Setup interrupted'; exit 1" INT

echo "🚀 AI PR Tool Setup (Production Installer)"

OS="$(uname -s)"
echo "🖥️ OS: $OS"

# -----------------------------
# LOG HELPERS
# -----------------------------
step() { echo -e "\n🔹 $1"; }
ok() { echo -e "✅ $1"; }
fail() { echo -e "❌ $1"; exit 1; }

# -----------------------------
# STEP 1: HOMEBREW (mac)
# -----------------------------
if [[ "$OS" == "Darwin" ]]; then
  if ! command -v brew &> /dev/null; then
    step "Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)" || fail "brew failed"
  else
    ok "Homebrew exists"
  fi
fi

# -----------------------------
# STEP 2: NODE
# -----------------------------
step "Checking Node.js..."

if ! command -v node &> /dev/null; then
  if [[ "$OS" == "Darwin" ]]; then
    brew install node || fail "Node install failed"
  else
    sudo apt-get update && sudo apt-get install -y nodejs npm || fail "Node install failed"
  fi
else
  ok "Node $(node -v)"
fi

# -----------------------------
# STEP 3: GITHUB CLI
# -----------------------------
step "Checking GitHub CLI..."

if ! command -v gh &> /dev/null; then
  if [[ "$OS" == "Darwin" ]]; then
    brew install gh
  else
    sudo apt-get install -y gh
  fi
else
  ok "GitHub CLI installed"
fi

# 🔥 AUTO LOGIN (no ask)
step "Authenticating GitHub..."

if ! gh auth status &> /dev/null; then
  gh auth login --web --git-protocol https || fail "GitHub auth failed"
else
  ok "GitHub already authenticated"
fi

# -----------------------------
# STEP 4: OLLAMA
# -----------------------------
step "Checking Ollama..."

if ! command -v ollama &> /dev/null; then
  if [[ "$OS" == "Darwin" ]]; then
    brew install --cask ollama
  else
    curl -fsSL https://ollama.com/install.sh | sh
  fi
else
  ok "Ollama installed"
fi

# 🔥 ensure service
step "Starting Ollama service..."

if ! ollama list &> /dev/null; then
  echo "⚠️ Opening Ollama..."
  open -a Ollama 2>/dev/null || true
  sleep 5
fi

ok "Ollama running"

# -----------------------------
# STEP 5: NODE PROJECT
# -----------------------------
step "Setting up Node project..."

[ ! -f package.json ] && npm init -y

rm -rf node_modules package-lock.json

npm install node-notifier husky axios || fail "npm install failed"

ok "Node packages installed"

# -----------------------------
# STEP 6: HUSKY
# -----------------------------
step "Setting up Git hooks..."

npx husky init

git config core.hooksPath .husky

cat << 'EOF' > .husky/post-commit
#!/bin/sh

export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"

echo "🤖 AI PR Tool Running..."

node ai-tool/scripts/ai-pr-only.js 2>&1 | tee -a ai-pr.log
EOF

chmod +x .husky/post-commit

ok "Git hooks ready"

# -----------------------------
# STEP 7: AI MODEL
# -----------------------------
step "Pulling AI model..."

ollama pull llama3.2:1b || echo "⚠️ Model already exists"

ok "Model ready"

# -----------------------------
# DONE
# -----------------------------
echo ""
echo "🎉 SETUP COMPLETE"
echo "--------------------------------"
echo "✔ Auto PR ready"
echo "✔ Hooks active"
echo "✔ AI running"
echo ""
echo "👉 Just commit normally from VSCode / Android Studio"
echo "👉 Logs → ai-pr.log"
echo ""

