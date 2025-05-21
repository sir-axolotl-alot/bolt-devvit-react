#!/usr/bin/env jsh
// setup-devvit.jsh - Devvit project setup script with best practices for jsh
// Exits on error, unset variable, or failed pipeline
set('-euo', 'pipefail')

// Function to print error messages in red
function error(msg) {
  echo(`\033[0;31mERROR:\033[0m ${msg}`)
}

// Check devvit.yaml for YOUR_APP_NAME
if (grep('YOUR_APP_NAME', 'devvit.yaml')) {
  error("devvit.yaml contains 'YOUR_APP_NAME'. Please update devvit.yaml with your actual app name before proceeding.")
  exit(1)
}

// Check package.json dev:devvit command for YOUR_SUBREDDIT_NAME
try {
  let devScript = jq('-r', '.scripts["dev:devvit"]', 'package.json')
  if (devScript.includes('YOUR_SUBREDDIT_NAME')) {
    error("package.json dev:devvit script contains 'YOUR_SUBREDDIT_NAME'. Please update package.json with your subreddit name before proceeding.")
    exit(1)
  }
} catch {
  error("No dev:devvit script found in package.json.")
  exit(1)
}

// Check if user is logged in to devvit
if (!test('-f', `${env.HOME}/.devvit/token`)) {
  error("Devvit login token not found. Please log in to devvit (run 'devvit login') before proceeding.")
  exit(1)
}

echo('\033[0;32mAll checks passed. Devvit setup is ready!\033[0m')

npm('run', 'dev')