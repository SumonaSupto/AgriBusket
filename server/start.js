#!/usr/bin/env node

// Clean startup script for the server
// This script handles deprecation warnings and ensures clean startup

// Suppress punycode deprecation warning
const originalEmit = process.emit;
process.emit = function (name, data, ...args) {
  if (
    name === 'warning' &&
    typeof data === 'object' &&
    data.name === 'DeprecationWarning' &&
    data.message.includes('punycode')
  ) {
    return false;
  }
  return originalEmit.apply(process, [name, data, ...args]);
};

// Start the server
require('./server.js');
