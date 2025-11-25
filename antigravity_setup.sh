#!/usr/bin/env bash
set -e

echo "=== Project Believe (Gamebridge Biomes) Antigravity Setup ==="

# Ensure we're in the repo root
if [ ! -f "./b" ]; then
  echo "ERROR: This script must be run from the biomes-game repo root."
  exit 1
fi

echo "--- Step 1: Create Python virtual environment (.biomes-venv-310) ---"
if [ ! -d ".biomes-venv-310" ]; then
  python3 -m venv .biomes-venv-310
  echo "Virtual environment created."
else
  echo "Virtual environment already exists. Skipping."
fi

echo "--- Step 2: Activate virtual environment ---"
source .biomes-venv-310/bin/activate
echo "Venv activated."

echo "--- Step 3: Install Python dependencies (if requirements.txt exists) ---"
if [ -f "requirements.txt" ]; then
  pip install -r requirements.txt || true
  echo "Python dependencies installed."
else
  echo "No requirements.txt found. Skipping."
fi

echo "--- Step 4: Install Node dependencies ---"
if [ -f "package.json" ]; then
  npm install
  echo "Node dependencies installed."
else
  echo "No package.json found. Skipping."
fi

echo "--- Step 5: Bootstrap Biomes ./b tool ---"
./b --help >/dev/null 2>&1 || true
echo "./b tool initialized."

echo "--- Step 6: Prebuild TypeScript deps ---"
./b ts-deps || true

echo "--- Step 7: Recommended VS Code extensions output ---"
echo "To restore your Antigravity extensions, run:"
echo "    code --list-extensions > vscode-extensions.txt"
echo "    cat vscode-extensions.txt | xargs -n1 code --install-extension"

echo "=== Setup complete! ==="
