require('dotenv').config();
const { fetchTaskFromIssue } = require('./task_parser');
const { scanDirectory, formatTree } = require('./repo_analyzer');
const { generateCodeChanges } = require('./ai_coder');
const { pushFeatureBranch } = require('./git_helper');
const { createPullRequest } = require('./pr_helper');

async function main() {
  console.log('--- Autonomous GitHub Development Assistant Initializing ---');

  const githubToken = process.env.GITHUB_TOKEN;
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const targetRepo = process.env.TARGET_REPO;
  const issueNumber = process.env.ISSUE_NUMBER; // Passed via trigger payload

  if (!githubToken || !geminiApiKey || !targetRepo) {
    console.error('Fatal: Missing required environment variables GITHUB_TOKEN, GEMINI_API_KEY, or TARGET_REPO');
    process.exit(1);
  }

  // 1. Fetch Task
  if (!issueNumber) {
    console.log('No specific issue ID specified. Running daily contribution checks...');
    // Daily fallback check will run here in Phase 5
    process.exit(0);
  }

  console.log(`Starting run for Task Issue #${issueNumber}...`);
  const [owner, repo] = targetRepo.split('/');
  
  const task = await fetchTaskFromIssue(githubToken, owner, repo, parseInt(issueNumber, 10));
  console.log(`Successfully fetched task: "${task.title}"`);

  // 2. Analyze target repository structure
  // For sandbox testing, we scan the workspace
  const filesList = scanDirectory('.');
  const structure = formatTree(filesList);
  console.log('Repository scanning complete.');

  // 3. AI Code Generation
  console.log('Requesting modifications from Gemini AI model...');
  
  // Assemble minimal test file content (mocked or target files determined by scanning)
  const targetFiles = {}; 
  if (filesList.includes('README.md')) {
    targetFiles['README.md'] = require('fs').readFileSync('README.md', 'utf8');
  }

  const modifications = await generateCodeChanges(geminiApiKey, task, structure, targetFiles);
  console.log(`AI generated ${modifications.length} modifications.`);

  // 4. Git Push Feature Branch
  const localRepoPath = '.';
  const branchName = await pushFeatureBranch(localRepoPath, task, modifications);

  // 5. Open Pull Request
  const prUrl = await createPullRequest(githubToken, targetRepo, task, branchName);
  console.log(`--- Run completed successfully! PR URL: ${prUrl} ---`);
}

main().catch(err => {
  console.error('Fatal execution failure:', err);
  process.exit(1);
});
