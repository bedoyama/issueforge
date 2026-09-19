# Security

IssueForge is a **demo**. Authentication is a fake unsigned JWT stored in `localStorage`. The HTTP API is an in-app interceptor. Do not use this as a production auth or backend template.

Demo passwords live in `src/app/core/mock-backend/mock.seed.ts` and are intentionally `password`. They are never written to `localStorage`.

## Reporting a vulnerability

If you find a real secret, credential, or unexpected exposure in this repository, [open a private GitHub security advisory](https://github.com/bedoyama/issueforge/security/advisories/new) or an issue if that is not available.

This project does not run a production service, so there is no SLA for fixes.
