const { Octokit } = require('@octokit/rest');

/**
 * Task Parser Component
 * Responsible for fetching task metadata from a GitHub Issue or Task file.
 */

/**
 * Parses issue body text to extract structured task parameters.
 * Supports format:
 *   Repository: owner/repo
 *   Priority: High
 *   Description: description text here...
 * 
 * @param {string} body - The markdown body of the issue.
 * @returns {object} Structured task details.
 */
function parseIssueBody(body) {
  if (!body) return {};

  const lines = body.split(/\r?\n/);
  const task = {
    repository: '',
    priority: 'medium',
    description: '',
    rawBody: body
  };

  let descriptionLines = [];
  let isParsingDescription = false;

  for (const line of lines) {
    const trimmed = line.trim();
    
    // Parse key-value metadata lines
    if (trimmed.toLowerCase().startsWith('repository:')) {
      task.repository = trimmed.split(':')[1].trim();
      isParsingDescription = false;
      continue;
    }

    if (trimmed.toLowerCase().startsWith('priority:')) {
      task.priority = trimmed.split(':')[1].trim().toLowerCase();
      isParsingDescription = false;
      continue;
    }

    if (trimmed.toLowerCase().startsWith('description:')) {
      isParsingDescription = true;
      const initialContent = trimmed.split(':').slice(1).join(':').trim();
      if (initialContent) {
        descriptionLines.push(initialContent);
      }
      continue;
    }

    // Capture multiline description block
    if (isParsingDescription) {
      descriptionLines.push(line);
    }
  }

  task.description = descriptionLines.join('\n').trim();

  // If no structured repository field is parsed, return default empty
  return task;
}

/**
 * Fetches a GitHub issue and returns it as a parsed task.
 * 
 * @param {string} token - GitHub personal access token.
 * @param {string} owner - Repository owner.
 * @param {string} repo - Repository name.
 * @param {number} issueNumber - The issue number to retrieve.
 * @returns {Promise<object>} The parsed task metadata.
 */
async function fetchTaskFromIssue(token, owner, repo, issueNumber) {
  const octokit = new Octokit({ auth: token });

  try {
    const { data: issue } = await octokit.issues.get({
      owner,
      repo,
      issue_number: issueNumber
    });

    const parsedTask = parseIssueBody(issue.body);
    
    return {
      id: issue.number,
      title: issue.title,
      labels: issue.labels.map(l => l.name),
      targetRepository: parsedTask.repository || `${owner}/${repo}`,
      priority: parsedTask.priority,
      description: parsedTask.description || issue.body,
      htmlUrl: issue.html_url
    };
  } catch (error) {
    console.error(`Error fetching issue #${issueNumber}:`, error.message);
    throw error;
  }
}

module.exports = {
  parseIssueBody,
  fetchTaskFromIssue
};
