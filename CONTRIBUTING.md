# Contributing to Project

Welcome! 👋 Thank you for contributing to this project. Please read this guide to understand how to contribute efficiently.

---

## 1. Code Style & Guidelines

### **General**
- Use **single quotes** for all strings.
- Follow **camelCase** for variables and functions.
- Use **PascalCase** for classes and React components.
- No `console.log` or commented-out code in commits.
- Every function/method must have **JSDoc/TSDoc** comments.

### **Frontend**
- Follow React/TypeScript best practices.
- Use functional components over class components.
- Component names must match file names.
- Keep folder structure organized:
```

frontend/src/components/
frontend/src/pages/
frontend/src/services/
frontend/src/utils/

```

### **Backend**
- Node.js / Express / TypeScript standard.
- Keep controllers, services, and routes separated.
- Folder structure:
```

backend/src/controllers/
backend/src/routes/
backend/src/services/
backend/src/models/
backend/src/utils/

```
- All API routes must have validation and proper error handling.

---

## 2. Git & Branching

- **Branching Rules**
- `main` → Production (protected)
- `dev` → Development integration
- `feature/<feature-name>` → New features
- `bugfix/<bug-name>` → Bug fixes
- `hotfix/<hotfix-name>` → Critical production fixes
- `release/x.y.z` → Pre-prod releases

- **Commit Message Format (Conventional Commits)**
```

<type>: <short description>

````
- `feat:` for new features
- `fix:` for bug fixes
- `refactor:` for code refactoring
- `docs:` for documentation changes
- `chore:` for non-code changes
- `test:` for test additions
- Example:
  ```
  feat: add login API with JWT
  fix: handle null pointer exception in user service
  ```

- **Push Guidelines**
- Always pull latest `dev` before starting.
- Rebase `dev` into your feature branch before PR.

---

## 3. Pull Request (PR) Guidelines

- PRs must target `dev` branch.
- Minimum **1 reviewer** approval required.
- PRs should not exceed **300 lines of code**.
- Must pass all **CI tests**.
- Use the PR template in `.github/PULL_REQUEST_TEMPLATE.md`.
- Include Jira/story link in the PR description.

---

## 4. Code Reviews

- Reviewers must check:
- Code logic and functionality
- Proper comments and JSDoc
- Linting and formatting
- Test coverage
- No commented-out or debug code
- Provide constructive feedback.

---

## 5. Testing

- **Unit Tests**
- Required for new code
- Minimum coverage: **80%**
- **Integration Tests**
- Validate API contracts
- **Frontend Tests**
- Use Jest + React Testing Library
- **Backend Tests**
- Use Jest / Mocha / Chai

---

## 6. Documentation

- Update `README.md` or docs folder for:
- New APIs
- New environment variables
- Changes in architecture or design
- Keep documentation **clear and concise**.

---

## 7. Code Ownership

- Refer to `.github/CODEOWNERS` for reviewers and responsibilities.
- Code owners must approve PRs in their area before merging.

---

## 8. Miscellaneous

- Follow **DRY principle** (Don’t Repeat Yourself)
- Follow **KISS principle** (Keep It Simple, Stupid)
- Communicate blockers early in **standups** or on Teams/Slack.

---

Thank you for following the guidelines! 🙏  
