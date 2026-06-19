# Autonomous GitHub Development Assistant

An autonomous, AI-powered development assistant designed to run entirely on cloud infrastructure (GitHub Actions, GitHub Issues, PRs) without requiring a running laptop. It autonomously picks up tasks, writes code, validates changes, and creates Pull Requests for review.

---

## 🎯 Core Objectives
*   **Daily Contributions:** Guarantee at least one meaningful contribution per day.
*   **Safety-First Workflows:** Never modify production code directly; all changes must go through isolated branches and Pull Requests.
*   **Mobile-First Review:** Enable the user to review, comment on, and merge Pull Requests using a mobile device (GitHub Mobile app).
*   **Zero-Cost Execution:** Stay within free-tier limits (such as GitHub Actions free minutes) with no paid servers or VPS dependencies.

---

## 🛡️ Safety & Governance
1.  **Repository Classification:**
    *   **Sandbox Repositories (`ai-lab`, `contribution-repo`):** Full AI write access permitted.
    *   **Protected/Production Repositories:** Read-only initially; Pull Request creation only after proving stability (e.g., 30 successful sandbox runs).
2.  **Strict Limits:** The system is explicitly forbidden from force-pushing, modifying environment secrets, database schemas, deployment pipelines, or authentication logic.
3.  **Confidence Check:** If the AI has low confidence in a task implementation, it will abort code changes and open a standard issue requesting human clarification.

---

## 📐 High-Level Architecture

```
User (Creates Task / Issue)
  │
  ▼
GitHub Issue / Task Bank
  │
  ▼
GitHub Action Execution Runner
  ├── Task Parser (Ingests task metadata)
  ├── Repo Analyzer (Builds codebase structure map)
  ├── AI Coder (Interacts with LLM to generate precise diffs)
  └── Git & PR Helper (Creates feature branch, commits, opens PR)
  │
  ▼
GitHub Pull Request (Human Review -> Mobile/Desktop Merge)
```

---

## 📅 Implementation Roadmap

### Phase 1: Sandbox & Authentication Setup
*   Configure the repository structure and test projects.
*   Set up repository secrets (LLM API keys, GitHub Personal Access Tokens).
*   Write basic helper scripts for repo cloning and authentication checks.

### Phase 2: Task Ingestion & Parser
*   Implement `task_parser` to download and parse issues/markdown templates.
*   Standardize task formatting (Target Repository, Title, Priority, Description).

### Phase 3: Repo Context & AI Integration
*   Build a repo context generator that respects token window sizes.
*   Configure the LLM agent prompt loop to output precise, scoped file edits.
*   Enforce safety checks preventing edits to protected/forbidden files.

### Phase 4: Git & Pull Request Automation
*   Implement automatic feature branch generation (`feature/task-id-short-desc`).
*   Create automated conventional commit messages (e.g., `feat(ui): add mobile menu`).
*   Open Pull Requests populated with rich implementation summaries, test logs, and rollback guides.

### Phase 5: Daily Contribution Engine
*   Setup daily Cron workflows in GitHub Actions.
*   Define the fallback execution pipeline (generating markdown learning notes, components, or utilities if no tasks are open).

### Phase 6: Error Handling & Logging
*   Implement pipeline retries and failure reporting.
*   Maintain execution logs in a centralized status repository.

---

## 🧪 Verification Plan
*   **Unit Testing:** Verify parser accuracy and safety boundaries.
*   **Pre-flight Verification:** Run `npm run build` or `npm run lint` on the generated code before pushing it to GitHub.
*   **End-to-End Test:** Create a mock issue, verify that the action picks it up, writes correct code, pushes the branch, opens a PR, and lets the user review/merge it successfully.
