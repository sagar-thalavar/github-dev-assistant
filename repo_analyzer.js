const fs = require('fs');
const path = require('path');

/**
 * Repository Analyzer Component
 * Analyzes the local workspace of a target repository to build structure context for the LLM.
 */

// Directories to ignore during scanning
const DEFAULT_IGNORE = [
  'node_modules',
  '.git',
  '.next',
  'build',
  'dist',
  'out',
  'coverage',
  '.env',
  '.env.local'
];

/**
 * Recursively scans a directory to build a file tree structure.
 * 
 * @param {string} dir - The directory path to scan.
 * @param {string} relativeTo - The root path to compute relative paths against.
 * @param {Array<string>} ignoreList - List of folders/files to ignore.
 * @returns {Array<string>} Flat list of file paths.
 */
function scanDirectory(dir, relativeTo = dir, ignoreList = DEFAULT_IGNORE) {
  let files = [];
  
  if (!fs.existsSync(dir)) return files;

  const list = fs.readdirSync(dir);

  for (const item of list) {
    if (ignoreList.includes(item)) continue;

    const fullPath = path.join(dir, item);
    const relativePath = path.relative(relativeTo, fullPath);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files = files.concat(scanDirectory(fullPath, relativeTo, ignoreList));
    } else {
      files.push(relativePath.replace(/\\/g, '/')); // normalize to unix slashes
    }
  }

  return files;
}

/**
 * Formats the scanned file list into a clean text hierarchy for LLM prompting.
 * 
 * @param {Array<string>} fileList - List of normalized file paths.
 * @returns {string} Text outline of repository structure.
 */
function formatTree(fileList) {
  return fileList.map(f => `- ${f}`).join('\n');
}

module.exports = {
  scanDirectory,
  formatTree
};
