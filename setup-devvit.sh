#!/usr/bin/env bash
# setup-devvit.sh - Devvit project setup script with best practices
# Exits on error, unset variable, or failed pipeline
set -euo pipefail

# Function to print error messages in red
error() {
  echo -e "\033[0;31mERROR:\033[0m $1" >&2
}

# Check devvit.yaml for YOUR_APP_NAME
if grep -q 'YOUR_APP_NAME' devvit.yaml; then
  error "devvit.yaml contains 'YOUR_APP_NAME'. Please update devvit.yaml with your actual app name before proceeding."
  exit 1
fi

# Check package.json dev:devvit command for YOUR_SUBREDDIT_NAME
if jq -e '.scripts["dev:devvit"]' package.json >/dev/null 2>&1; then
  if jq -r '.scripts["dev:devvit"]' package.json | grep -q 'YOUR_SUBREDDIT_NAME'; then
    error "package.json dev:devvit script contains 'YOUR_SUBREDDIT_NAME'. Please update package.json with your subreddit name before proceeding."
    exit 1
  fi
else
  error "No dev:devvit script found in package.json."
  exit 1
fi

# Check if user is logged in to devvit
if [ ! -f "$HOME/.devvit/token" ]; then
  error "Devvit login token not found. Please log in to devvit (run 'devvit login') before proceeding."
  exit 1
fi

echo -e "\033[0;32mAll checks passed. Devvit setup is ready!\033[0m"

npm run dev