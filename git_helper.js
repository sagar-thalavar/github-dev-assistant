const simpleGit = require('simple-git');
const fs = require('fs');
const path = require('path');

/**
 * Git Helper Component
 * Automates branch checkouts, file writes, committing, and pushing.
 */

/**
 * Prepares a clean feature branch, writes modifications, commits, and pushes them.
 * 
 * @param {string} localRepoPath - Local directory where repository is cloned.
 * @param {object} task - The task object.
 * @param {Array<object>} modifications - Array of file modifications [{ path, content }].
 * @returns {Promise<string>} The created branch name.
 */
async function pushFeatureBranch(localRepoPath, task, modifications) {
  const git = simpleGit(localRepoPath);

  // Define clean branch name: feature/task-{id}-{short-title}
  const cleanTitle = task.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const branchName = `feature/task-${task.id}-${cleanTitle}`;

  try {
    // 1. Checkout main branch and pull latest changes
    await git.checkout('main');
    await git.pull();

    // 2. Create and checkout feature branch
    await git.checkoutLocalBranch(branchName);
    console.log(`Created and checked out branch: ${branchName}`);

    // 3. Write modified files locally
    for (const mod of modifications) {
      const fullPath = path.join(localRepoPath, mod.path);
      
      // Ensure directory exists
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });
      
      // Write file contents
      fs.writeFileSync(fullPath, mod.content, 'utf8');
      console.log(`Applied modification: ${mod.path}`);
    }

    // 4. Git add and commit changes
    await git.add('.');
    
    const commitMsg = `feat(ui): implement task #${task.id} - ${task.title}`;
    await git.commit(commitMsg);
    console.log(`Committed: "${commitMsg}"`);

    // 5. Push branch to remote
    await git.push('origin', branchName, { '--set-upstream': null });
    console.log(`Pushed branch ${branchName} to origin`);

    // Return to main branch locally for cleanliness
    await git.checkout('main');

    return branchName;
  } catch (error) {
    console.error('Error during git branch operations:', error.message);
    throw error;
  }
}

module.exports = {
  pushFeatureBranch
};
