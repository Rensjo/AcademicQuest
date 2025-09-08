#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting AcademicQuest Desktop Development Environment\n');

// Function to start a process
function startProcess(command, args, cwd, name, color) {
  console.log(`${color}Starting ${name}...${'\x1b[0m'}`);
  
  const process = spawn(command, args, {
    cwd: cwd,
    stdio: 'inherit',
    shell: true
  });

  process.on('error', (err) => {
    console.error(`${color}${name} failed to start:${'\x1b[0m'}`, err);
  });

  process.on('close', (code) => {
    console.log(`${color}${name} exited with code ${code}${'\x1b[0m'}`);
  });

  return process;
}

// Colors for output
const colors = {
  blue: '\x1b[34m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  reset: '\x1b[0m'
};

// Check if we should start the web dev server
const startWeb = process.argv.includes('--web') || process.argv.includes('-w');

if (startWeb) {
  // Start web development server
  const webPath = path.join(__dirname, '..', 'web');
  console.log(`${colors.blue}Web server path: ${webPath}${colors.reset}`);
  
  setTimeout(() => {
    startProcess('npm', ['run', 'dev'], webPath, 'Web Dev Server', colors.blue);
  }, 1000);

  // Wait a bit for web server to start, then start electron
  setTimeout(() => {
    startProcess('npm', ['run', 'dev'], __dirname, 'Electron App', colors.green);
  }, 3000);
} else {
  // Just start electron (assumes web server is already running)
  startProcess('npm', ['run', 'dev'], __dirname, 'Electron App', colors.green);
}

// Handle exit gracefully
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down development environment...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down development environment...');
  process.exit(0);
});
