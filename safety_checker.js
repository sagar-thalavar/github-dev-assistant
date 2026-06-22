/**
 * Safety & Governance Checker Component
 * Enforces execution boundaries and repository write permissions.
 */

// Approved sandbox repositories where write-actions are permitted
const APPROVED_SANDBOX_REPOS = [
  'ai-lab',
  'contribution-repo',
  'github-dev-assistant'
];

/**
 * Checks if a target repository is authorized for autonomous code modifications.
 * 
 * @param {string} targetRepo - Repository string in format 'owner/repo'
 * @returns {boolean} True if write operations are safe, False otherwise.
 */
function isWritePermitted(targetRepo) {
  if (!targetRepo) return false;

  const parts = targetRepo.split('/');
  if (parts.length !== 2) return false;

  const repoName = parts[1].toLowerCase();
  
  // Verify target is inside our approved sandbox list
  const isApproved = APPROVED_SANDBOX_REPOS.includes(repoName);
  
  if (!isApproved) {
    console.warn(`[SAFETY SHIELD] Write actions are BLOCKED for repository: "${targetRepo}". This repository is classified as Protected/Critical. Only sandbox repositories can be modified in v1.`);
  } else {
    console.log(`[SAFETY SHIELD] Write authorization approved for sandbox repository: "${targetRepo}".`);
  }

  return isApproved;
}

module.exports = {
  isWritePermitted,
  APPROVED_SANDBOX_REPOS
};
