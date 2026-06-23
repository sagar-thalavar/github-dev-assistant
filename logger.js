const fs = require('fs');
const path = require('path');

/**
 * Logger Component
 * Manages run auditing and log persistence.
 */

const LOG_DIR = path.join(__dirname, 'logs');
const LOG_FILE = path.join(LOG_DIR, 'run.log');

/**
 * Logs a formatted message with a timestamp.
 * 
 * @param {string} level - Log level ('INFO', 'WARN', 'ERROR').
 * @param {string} message - Message body.
 */
function log(level, message) {
  const timestamp = new Date().toISOString();
  const formatted = `[${timestamp}] [${level}] ${message}`;
  
  // Output to standard console
  if (level === 'ERROR') {
    console.error(formatted);
  } else if (level === 'WARN') {
    console.warn(formatted);
  } else {
    console.log(formatted);
  }

  // Ensure log directory exists
  try {
    fs.mkdirSync(LOG_DIR, { recursive: true });
    fs.appendFileSync(LOG_FILE, formatted + '\n', 'utf8');
  } catch (err) {
    // If running in a read-only CI environment, gracefully fail logging to file
    console.warn(`[LOGGER] Unable to write log to file: ${err.message}`);
  }
}

module.exports = {
  info: (msg) => log('INFO', msg),
  warn: (msg) => log('WARN', msg),
  error: (msg) => log('ERROR', msg)
};
