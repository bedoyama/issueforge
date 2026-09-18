# IssueForge

A Jira-lite **issue tracker** built as a modern Angular 22 interview portfolio. There is no real backend: the app talks to itself through `HttpClient` / `httpResource` against `/api/**`. A functional interceptor owns an in-memory store (persisted to `localStorage`), fake JWTs, latency, and 401/403/500/timeout knobs.

## Run

```bash
npm install
npm start
```

Open [http://localhost:4200](http://localhost:4200).

```bash
npm test
npm run build
```

## Demo accounts

Password for all: `password` (kept in `mock.seed.ts`, **not** written to `localStorage`).

| Email | Role |
| --- | --- |
| `ada@board.dev` | admin |
| `linus@board.dev` | member |
| `grace@board.dev` | viewer |

Use the **Demo** switcher in the header to impersonate without retyping credentials. **Chaos** injects latency and errors.

## Nested comments

Comments are a nested **route** (`.../issues/:id/comments`), a flat list, not threads.

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

Full design: [docs/issueforge-design.md](docs/issueforge-design.md).
