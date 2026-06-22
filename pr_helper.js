const { Octokit } = require('@octokit/rest');

/**
 * Pull Request Helper Component
 * Interacts with the GitHub API to automate PR creation and tagging.
 */

/**
 * Opens a Pull Request for review with a clear summary.
 * 
 * @param {string} token - GitHub personal access token.
 * @param {string} targetRepo - Target repository name in format 'owner/repo'.
 * @param {object} task - The parsed task details.
 * @param {string} branchName - Name of the branch to submit.
 * @returns {Promise<string>} The opened PR HTML URL.
 */
async function createPullRequest(token, targetRepo, task, branchName) {
  const [owner, repo] = targetRepo.split('/');
  const octokit = new Octokit({ auth: token });

  const title = `AI: Implement #${task.id} - ${task.title}`;
  
  const body = `
## 🤖 Autonomous Implementation Report

This Pull Request was generated automatically by the **Autonomous GitHub Development Assistant** in response to task **#${task.id}**.

### 📋 Task Summary
*   **Title:** ${task.title}
*   **Priority:** ${task.priority.toUpperCase()}
*   **Original Description:** ${task.description}

### 🛠️ Changes Implemented
*   Code modifications generated using Gemini AI.
*   Formatting and layout standards applied.

### 🛡️ Safety & Auditing
*   Isolated feature branch used: \`${branchName}\`.
*   Direct pushes to protected branches strictly blocked.
*   **Status:** Pending human review. Please verify builds and test coverage before merging.
`;

  try {
    const { data: pr } = await octokit.pulls.create({
      owner,
      repo,
      title,
      head: branchName,
      base: 'main',
      body,
      draft: false
    });

    console.log(`Pull Request successfully opened: ${pr.html_url}`);

    // Add labels to make it visible
    await octokit.issues.addLabels({
      owner,
      repo,
      issue_number: pr.number,
      labels: ['ai-generated', 'needs-review']
    });

    return pr.html_url;
  } catch (error) {
    console.error('Error opening Pull Request:', error.message);
    throw error;
  }
}

module.exports = {
  createPullRequest
};
