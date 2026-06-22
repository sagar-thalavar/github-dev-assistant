const assert = require('assert');
const { isWritePermitted } = require('../safety_checker');

/**
 * Unit tests for Safety Checker
 */
function runTests() {
  console.log('Running Safety Checker unit tests...');

  // Test Case 1: Permitted sandbox repos
  assert.strictEqual(isWritePermitted('sagar-thalavar/ai-lab'), true);
  assert.strictEqual(isWritePermitted('sagar-thalavar/contribution-repo'), true);
  assert.strictEqual(isWritePermitted('sagar-thalavar/github-dev-assistant'), true);

  // Test Case 2: Blocked protected repos
  assert.strictEqual(isWritePermitted('sagar-thalavar/portfolio'), false);
  assert.strictEqual(isWritePermitted('sagar-thalavar/production-website'), false);
  assert.strictEqual(isWritePermitted('other-owner/random-repo'), false);

  // Test Case 3: Edge cases (empty, undefined, invalid formats)
  assert.strictEqual(isWritePermitted(''), false);
  assert.strictEqual(isWritePermitted(null), false);
  assert.strictEqual(isWritePermitted('single-string-no-slash'), false);
  assert.strictEqual(isWritePermitted('too/many/slashes/in/name'), false);

  console.log('Safety Checker tests passed successfully! ✅');
}

try {
  runTests();
} catch (error) {
  console.error('Test execution failed! ❌', error);
  process.exit(1);
}
