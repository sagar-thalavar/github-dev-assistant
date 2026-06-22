require('dotenv').config();
const { fetchTaskFromIssue } = require('./task_parser');
const { scanDirectory, formatTree } = require('./repo_analyzer');
const { generateCodeChanges } = require('./ai_coder');
const { pushFeatureBranch } = require('./git_helper');
const { createPullRequest } = require('./pr_helper');
const { isWritePermitted } = require('./safety_checker');
const { generateDailyLog } = require('./contribution_generator');

async function main() {
  console.log('--- Autonomous GitHub Development Assistant Initializing ---');

  const githubToken = process.env.GITHUB_TOKEN;
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const targetRepo = process.env.TARGET_REPO;
  const issueNumber = process.env.ISSUE_NUMBER; // Passed via manual trigger

  if (!githubToken || !geminiApiKey || !targetRepo) {
    console.error('Fatal: Missing required environment variables GITHUB_TOKEN, GEMINI_API_KEY, or TARGET_REPO');
    process.exit(1);
  }

  // Enforce repository write limits (Safety check)
  if (!isWritePermitted(targetRepo)) {
    console.error('Fatal: Safety limits violated. Terminating run.');
    process.exit(1);
  }

  // Scenario A: No Issue Number (Daily Scheduled Contribution)
  if (!issueNumber) {
    console.log('No specific issue ID specified. Starting daily contribution generation...');
    
    try {
      const dailyLogFile = await generateDailyLog(geminiApiKey);
      const taskMock = {
        id: `daily-${new Date().toISOString().split('T')[0]}`,
        title: 'Daily Contribution - Learning Log',
        priority: 'low',
        description: 'Auto-generated fallback learning note for GitHub contribution activity.'
      };

      const branchName = await pushFeatureBranch('.', taskMock, [dailyLogFile]);
      const prUrl = await createPullRequest(githubToken, targetRepo, taskMock, branchName);
      
      console.log(`--- Daily contribution complete! PR: ${prUrl} ---`);
      process.exit(0);
    } catch (err) {
      console.error('Fatal: Failed to generate daily fallback contribution:', err.message);
      process.exit(1);
    }
  }

  // Scenario B: Active Task Processing
  console.log(`Starting run for Task Issue #${issueNumber}...`);
  const [owner, repo] = targetRepo.split('/');
  
  const task = await fetchTaskFromIssue(githubToken, owner, repo, parseInt(issueNumber, 10));
  console.log(`Successfully fetched task: "${task.title}"`);

  // Analyze repository structure
  const filesList = scanDirectory('.');
  const structure = formatTree(filesList);
  console.log('Repository scanning complete.');

  // AI Code Generation
  console.log('Requesting modifications from Gemini AI model...');
  const targetFiles = {}; 
  if (filesList.includes('README.md')) {
    targetFiles['README.md'] = require('fs').readFileSync('README.md', 'utf8');
  }

  const modifications = await generateCodeChanges(geminiApiKey, task, structure, targetFiles);
  console.log(`AI generated ${modifications.length} modifications.`);

  // Git Push Feature Branch
  const localRepoPath = '.';
  const branchName = await pushFeatureBranch(localRepoPath, task, modifications);

  // Open Pull Request
  const prUrl = await createPullRequest(githubToken, targetRepo, task, branchName);
  console.log(`--- Run completed successfully! PR URL: ${prUrl} ---`);
}

main().catch(err => {
  console.error('Fatal execution failure:', err);
  process.exit(1);
});
