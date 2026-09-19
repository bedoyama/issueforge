# IssueForge

[![CI](https://github.com/bedoyama/issueforge/actions/workflows/ci.yml/badge.svg)](https://github.com/bedoyama/issueforge/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Angular](https://img.shields.io/badge/Angular-22-dd0031.svg)](https://angular.dev)

A Jira-lite issue tracker built as a **modern Angular 22** interview portfolio. One product — boards, tickets, comments, search, inbox, and admin — not a bag of isolated demos.

There is **no real backend**. The app talks to itself through `HttpClient` / `httpResource` against `/api/**`. A functional interceptor owns an in-memory store (persisted to `localStorage`), fake JWTs, latency, and 401/403/500/timeout knobs.

## Requirements

- Node.js 22+ (see `.nvmrc`)
- npm 11+ (comes with the repo’s `packageManager` field)

## Quick start

```bash
npm install
npm start
```

Open [http://localhost:4200](http://localhost:4200).

```bash
npm test          # Vitest
npm run build     # production bundle
```

## Demo accounts

Password for all: `password` (kept in `src/app/core/mock-backend/mock.seed.ts`, **not** written to `localStorage`).

| Email | Role |
| --- | --- |
| `ada@board.dev` | admin |
| `linus@board.dev` | member |
| `grace@board.dev` | viewer |

Use the **Demo** switcher in the header to impersonate without retyping credentials. **Chaos** injects latency and errors.

This is a teaching app. Auth is a fake JWT in `localStorage` — see [SECURITY.md](SECURITY.md).

## Features

- Login with three roles (viewer / member / admin)
- Project list → kanban board → issue detail
- Nested **comments route** (flat list, not threads)
- Create / edit with unsaved-changes guard
- Debounced search and assignee typeahead
- Inbox with a polling notification stream
- Lazy-loaded admin users page
- Error / latency injection panel

## Stack

- Angular 22, standalone, **zoneless** (no `zone.js`)
- Signals, `httpResource` for reads, `HttpClient` + RxJS for writes
- Functional guards, resolvers, and interceptors
- Signal Forms on login; Reactive Forms on issue create/edit
- Angular CDK drag-and-drop on the board

## What to show in interviews

| Topic | Where |
| --- | --- |
| Signals / `computed` / `linkedSignal` | `issue-board.page.ts`, `auth.session.ts` |
| `effect` (prefs + directives only) | `prefs.service.ts`, `has-role.directive.ts`, `highlight-query.directive.ts` |
| `httpResource` | project list, board, detail |
| Writes via `HttpClient` | `issue.service.ts` |
| RxJS debounce | `issue-search.component.ts` |
| RxJS `switchMap` cancel | assignee typeahead on `issue-filters.component.ts` |
| RxJS poll stream | `notifications.service.ts` |
| `@if` `@for` `@empty` `@switch` `@defer` | board, lists, detail |
| Functional guards / resolver | `auth.guard.ts`, `role.guard.ts`, `unsaved-changes.guard.ts`, `issue-detail.resolver.ts` |
| Interceptors | auth → loading → toast → mock last |
| Signal Forms | `login.page.ts` |
| Reactive Forms | `issue-form.page.ts` |
| Lazy admin | `admin.routes.ts` |
| CDK drag-drop | board columns (same `PATCH` as the status select) |
| Zoneless | no `zone.js` |

Design notes: [docs/issueforge-design.md](docs/issueforge-design.md).

## License

[MIT](LICENSE) © 2026 Mauricio Bedoya
