// setup-devvit.js - Devvit project setup script for Node.js
// This script performs checks and runs 'npm run dev'.
// It uses Node.js's built-in modules and has no external dependencies.

const fs = require('fs');
const path = require('path');
const { execSync, exec } = require('child_process');
const os = require('os');

// Function to print error messages in red to the console
function error(msg) {
  // Using ANSI escape codes for red text: \x1b[0;31m for red, \x1b[0m to reset
  console.error(`\x1b[0;31mERROR:\x1b[0m ${msg}`);
  process.exit(1); // Exit the script with an error code
}

// Function to print success messages in green to the console
function success(msg) {
  // Using ANSI escape codes for green text: \x1b[0;32m for green, \x1b[0m to reset
  console.log(`\x1b[0;32m${msg}\x1b[0m`);
}

// --- Main script execution ---

console.log('Starting Devvit project setup checks...');

// 1. Check devvit.yaml for 'YOUR_APP_NAME' placeholder
try {
  const devvitYamlContent = fs.readFileSync('devvit.yaml', 'utf8');
  if (devvitYamlContent.includes('YOUR_APP_NAME')) {
    error("devvit.yaml contains 'YOUR_APP_NAME'. Please update devvit.yaml with your actual app name before proceeding.");
  }
  console.log('devvit.yaml check passed.');
} catch (e) {
  if (e.code === 'ENOENT') {
    error("devvit.yaml not found. Please ensure it exists in the current directory.");
  } else {
    error(`Error reading devvit.yaml: ${e.message}`);
  }
}

// 2. Check package.json dev:devvit command for 'YOUR_SUBREDDIT_NAME' placeholder
try {
  const packageJsonContent = fs.readFileSync('package.json', 'utf8');
  const packageJson = JSON.parse(packageJsonContent);

  const devScript = packageJson.scripts && packageJson.scripts['dev:devvit'];

  if (!devScript) {
    error("No 'dev:devvit' script found in package.json. Please ensure it's defined.");
  }

  if (devScript.includes('YOUR_SUBREDDIT_NAME')) {
    error("package.json dev:devvit script contains 'YOUR_SUBREDDIT_NAME'. Please update package.json with your subreddit name before proceeding.");
  }
  console.log('package.json dev:devvit script check passed.');
} catch (e) {
  if (e.code === 'ENOENT') {
    error("package.json not found. Please ensure it exists in the current directory.");
  } else if (e instanceof SyntaxError) {
    error(`Error parsing package.json: It might be malformed JSON. ${e.message}`);
  } else {
    error(`Error checking package.json: ${e.message}`);
  }
}

// 3. Check if user is logged in to Devvit (by checking for token file)
try {
  const devvitTokenPath = path.join(os.homedir(), '.devvit', 'token');
  if (!fs.existsSync(devvitTokenPath)) {
    error(`You're not logged in to Reddit. Please log in to devvit (run 'npm run login') before proceeding.`);
  }
  console.log('Devvit login token check passed.');
} catch (e) {
  error(`Error checking Devvit login token: ${e.message}`);
}

// All checks passed
success('All preliminary checks passed. Devvit setup is ready!');
console.log('Attempting to run `npm run deploy`...');

// 4. Execute 'npm run deploy' first
const deployProcess = exec('npm run devvit:upload', (error, stdout, stderr) => {
  if (error) {
    console.error(`\x1b[0;31mError executing 'npm run deploy':\x1b[0m\n${stderr}`);
    process.exit(1);
  }
  console.log(`stdout: ${stdout}`);
  console.error(`stderr: ${stderr}`);
  // After successful deploy, run dev:all
  runDevAll();
});

deployProcess.stdout.pipe(process.stdout);
deployProcess.stderr.pipe(process.stderr);

deployProcess.on('close', (code) => {
  if (code !== 0) {
    console.error(`\x1b[0;31m'npm run deploy' process exited with code ${code}\x1b[0m`);
    process.exit(1);
  }
});

deployProcess.on('error', (err) => {
  error(`Failed to start 'npm run deploy' process: ${err.message}`);
});

function runDevAll() {
  console.log('Attempting to run `npm run dev:all`...');
  const npmProcess = exec('npm run dev:all', (error, stdout, stderr) => {
    if (error) {
      console.error(`\x1b[0;31mError executing 'npm run dev:all':\x1b[0m\n${stderr}`);
      process.exit(1);
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
  });
  npmProcess.stdout.pipe(process.stdout);
  npmProcess.stderr.pipe(process.stderr);
  npmProcess.on('close', (code) => {
    if (code !== 0) {
      console.error(`\x1b[0;31m'npm run dev:all' process exited with code ${code}\x1b[0m`);
    } else {
      success(`'npm run dev:all' process exited successfully.`);
    }
  });
  npmProcess.on('error', (err) => {
    error(`Failed to start 'npm run dev:all' process: ${err.message}`);
  });
}

