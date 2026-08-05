# Contributing to Eminence — Hair Salon & Academy

## 🌿 Git Branching Workflow

This project follows a **Git Flow–style** branching model for a team of 2 developers working in parallel across a monorepo (`frontend/`, `crm/`, `backend/`, `firebase/`).

---

## Branch Structure

| Branch Pattern | Purpose | Base Branch | Merges Into |
|---|---|---|---|
| `main` | Production-ready code | — | — |
| `dev` | Integration & testing | `main` | `main` |
| `feature/*` | New features | `dev` | `dev` |
| `fix/*` | Bug fixes | `dev` | `dev` |
| `hotfix/*` | Urgent production fixes | `main` | `main` + `dev` |

---

## Day-to-Day Workflow

### 1. Before Starting Any Work

Always pull the latest `dev` branch first:

```bash
git checkout dev
git pull origin dev
```

### 2. Create a New Branch

For a **new feature**:
```bash
git checkout -b feature/your-feature-name dev
```

For a **bug fix**:
```bash
git checkout -b fix/describe-the-bug dev
```

For an **urgent production hotfix**:
```bash
git checkout -b hotfix/describe-the-issue main
```

### 3. Work & Commit

Make your changes, commit frequently with clear messages:

```bash
git add .
git commit -m "feat: add men's product gallery to Hair Systems section"
```

**Commit message prefixes:**
- `feat:` — New feature
- `fix:` — Bug fix
- `hotfix:` — Urgent production fix
- `refactor:` — Code restructuring
- `style:` — UI/CSS changes
- `docs:` — Documentation updates
- `chore:` — Maintenance / dependencies

### 4. Push & Create a Pull Request

```bash
git push origin feature/your-feature-name
```

Then open a **Pull Request on GitHub** targeting the `dev` branch.

> ⚠️ **Never push directly to `main`.** All changes go through `dev` first.

### 5. Code Review

- The other developer reviews the PR
- Address any feedback, then merge into `dev`

### 6. Release to Production

When `dev` is stable and tested:

```bash
git checkout main
git pull origin main
git merge dev
git push origin main
git checkout dev
```

---

## Hotfix Workflow

For critical production bugs that can't wait for the normal cycle:

```bash
# Create hotfix from main
git checkout -b hotfix/critical-bug main

# Fix the issue, commit
git add .
git commit -m "hotfix: fix payment processing error"

# Merge into main
git checkout main
git merge hotfix/critical-bug
git push origin main

# Also merge into dev so the fix is included
git checkout dev
git merge hotfix/critical-bug
git push origin dev

# Clean up
git branch -d hotfix/critical-bug
git push origin --delete hotfix/critical-bug
```

---

## Monorepo Guidelines

| Folder | Owner | Notes |
|---|---|---|
| `frontend/` | Both | React app (Eminence website) |
| `backend/` | Both | FastAPI server |
| `crm/` | Both | CRM dashboard |
| `firebase/` | Both | Firebase config & cloud functions |

- Prefix commit messages with the folder when helpful: `feat(frontend): add video gallery`
- If your change spans multiple folders, use a general prefix: `feat: integrate product API`

---

## Quick Reference

```
main ────────────────────────────────────► (production)
  │
  └── dev ───────────────────────────────► (integration)
        │         │
        ├── feature/video-gallery         (merged back to dev)
        ├── fix/navbar-alignment          (merged back to dev)
        └── feature/admin-products        (merged back to dev)
```

---

## Rules Summary

1. ✅ Always pull latest `dev` before starting work
2. ✅ Create a new branch from `dev` for each task
3. ✅ Push feature/fix branches and create PRs into `dev`
4. ✅ Only merge `dev` → `main` when ready for production
5. ❌ Never commit directly to `main`
6. ❌ Never commit directly to `dev` (use feature branches)
