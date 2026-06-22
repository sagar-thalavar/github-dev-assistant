const assert = require('assert');
const { parseIssueBody } = require('../task_parser');

/**
 * Unit tests for Task Parser
 */
function runTests() {
  console.log('Running Task Parser unit tests...');

  // Test Case 1: Standard structured body
  const body1 = `
Repository: sagar-thalavar/ai-lab
Priority: High
Description: Build a navigation component for the portfolio site.
  `;
  const result1 = parseIssueBody(body1);
  assert.strictEqual(result1.repository, 'sagar-thalavar/ai-lab');
  assert.strictEqual(result1.priority, 'high');
  assert.strictEqual(result1.description, 'Build a navigation component for the portfolio site.');

  // Test Case 2: Multiline description
  const body2 = `
Repository: test-owner/test-repo
Priority: Low
Description:
First line of details.
Second line of details.
  `;
  const result2 = parseIssueBody(body2);
  assert.strictEqual(result2.repository, 'test-owner/test-repo');
  assert.strictEqual(result2.priority, 'low');
  assert.strictEqual(result2.description, 'First line of details.\nSecond line of details.');

  // Test Case 3: Empty body handling
  const result3 = parseIssueBody('');
  assert.deepStrictEqual(result3, {});

  console.log('All tests passed successfully! ✅');
}

try {
  runTests();
} catch (error) {
  console.error('Test execution failed! ❌', error);
  process.exit(1);
}
