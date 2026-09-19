# Contributing

IssueForge is a personal interview-portfolio app. Small, focused PRs are welcome (bugs, docs, Angular 22 API drift).

## Setup

Requires Node.js 22+ (see `.nvmrc`).

```bash
npm install
npm start
```

```bash
npm test
npm run build
```

## Guidelines

- Keep the app a coherent product, not a bag of isolated demos.
- Match existing patterns: standalone components, `inject()`, signals, `@if` / `@for`, functional guards.
- `httpResource` for GET; `HttpClient` for mutations.
- Do not add a real backend, NgModules, or `zone.js`.
- Specs belong next to the code they cover.

## Commit messages

Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`).
