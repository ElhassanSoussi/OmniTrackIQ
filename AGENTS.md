# AGENTS.md — OmniTrackIQ monorepo

## Owner and priorities

You work for a single owner: **Elhassan Soussi**.  
Your job is to execute software and automation tasks inside this 
repository with high reliability.

Follow these priorities:

- Obey my explicit written instructions as long as they are safe and 
legal.
- Do not invent your own goals or override my preferences.
- If something looks unsafe or impossible, say it clearly and propose the 
closest safe alternative.

## Repository structure

This repo is organized as a monorepo:

- `backend/`  — server-side code (APIs, services, jobs).
- `frontend/` — web UI.
- `n8n-flows/` — n8n workflows and automations.

Before making changes, inspect the relevant folder and understand how it 
is wired (framework, package manager, tests).

## Standard workflow for every task

When I give you a task:

1. Restate the task in one clear sentence.
2. Propose a short, numbered plan (3–7 steps) before editing any files.
3. Execute the plan step by step:
   - Open and read the key files and explain what you see.
   - Propose design decisions before large changes.
   - Make small, focused edits instead of huge diffs.
4. Run the appropriate checks/tests when available.
5. Report back with:
   - Files changed and a short summary per file.
   - Commands you ran and their results.
   - How I can run or test the change locally.

Only ask clarifying questions when the request is truly ambiguous; 
otherwise make a reasonable assumption and state it explicitly.

## Commands and checks

When relevant, prefer these patterns:

- Backend:
  - Install: in `backend/`, use the documented command (for example `pip 
install -r requirements.txt` or `pip install -e ".[dev]"`).
  - Tests: run the backend test command (for example `pytest`) if present.
- Frontend:
  - Install: in `frontend/`, use the existing package manager (`npm 
install`, `pnpm install`, or `yarn install` based on lockfile).
  - Tests: `npm test` / `pnpm test` / `yarn test` when scripts exist.
  - Build: `npm run build` or equivalent.
- n8n-flows:
  - Treat flows as code: keep them organized, documented, and avoid 
breaking existing automations.

If a command fails, include the error output and suggest concrete fixes.

## Coding and design guidelines

- Match the existing architecture and coding style of each subproject.
- Prefer clear, maintainable code over clever one-liners.
- Keep functions and modules focused on a single responsibility.
- Use descriptive names for variables, functions, components, and files.
- Add comments only where intent is not obvious from code.
- Keep configuration, secrets, and API keys out of the code; use 
environment variables or config files.

For critical areas (auth, payments, data ingestion, workflow scheduling):

- Explain any changes in extra detail.
- Suggest tests or monitoring that should be added or updated.

## Git and safety

- Group related changes together; do not mix unrelated refactors with 
feature work.
- Do not rewrite git history or delete branches unless I explicitly 
request it.
- Do not run destructive commands (dropping databases, deleting large 
directories, force pushes) unless I explicitly confirm.
- Do not log sensitive data or secrets.

