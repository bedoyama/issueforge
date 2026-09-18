import { ApiErrorBody, CreateCommentRequest, CreateIssueRequest, PatchIssueRequest } from '../models/api.model';
import { AuthResponse, SessionUser } from '../models/auth.model';
import { IssueComment } from '../models/comment.model';
import { Issue, IssuePriority, IssueStatus } from '../models/issue.model';
import { Notification } from '../models/notification.model';
import { Role, ROLE_RANK, User } from '../models/user.model';
import { mintJwt, parseJwt } from './fake-jwt';
import { SEED_PASSWORDS } from './mock.seed';
import { MockDb, MockStore } from './mock.store';

export type AuthLevel = 'public' | 'user' | 'member' | 'admin';

export interface HandlerCtx {
  params: Record<string, string>;
  query: URLSearchParams;
  body: unknown;
  user: SessionUser | null;
  store: MockStore;
}

export interface HandlerResult {
  status: number;
  body?: unknown;
}

interface RouteDef {
  method: string;
  pattern: string;
  auth: AuthLevel;
  handler: (ctx: HandlerCtx) => HandlerResult;
}

const STATUSES = new Set<IssueStatus>(['todo', 'in_progress', 'in_review', 'done']);
const PRIORITIES = new Set<IssuePriority>(['low', 'medium', 'high', 'critical']);

function err(status: number, error: string, message: string, details?: Record<string, string>): HandlerResult {
  const body: ApiErrorBody = { error, message, details };
  return { status, body };
}

function toSession(user: User): SessionUser {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

function matchPattern(pattern: string, pathname: string): Record<string, string> | null {
  const pSeg = pattern.split('/').filter(Boolean);
  const uSeg = pathname.split('/').filter(Boolean);
  if (pSeg.length !== uSeg.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < pSeg.length; i++) {
    if (pSeg[i].startsWith(':')) params[pSeg[i].slice(1)] = decodeURIComponent(uSeg[i]);
    else if (pSeg[i] !== uSeg[i]) return null;
  }
  return params;
}

function requireFields(title: string, status: unknown, priority: unknown): Record<string, string> {
  const details: Record<string, string> = {};
  if (!title || title.trim().length < 3) details['title'] = 'minLength 3';
  if (title && title.length > 120) details['title'] = 'maxLength 120';
  if (!status || !STATUSES.has(status as IssueStatus)) details['status'] = 'required';
  if (!priority || !PRIORITIES.has(priority as IssuePriority)) details['priority'] = 'required';
  return details;
}

function notify(db: MockDb, recipientId: string | null | undefined, actorId: string, issueId: string, type: Notification['type']): void {
  if (!recipientId || recipientId === actorId) return;
  const n = db.notifications.length + 1;
  db.notifications.push({
    id: `ntf_${String(n).padStart(2, '0')}_${Date.now()}`,
    userId: recipientId,
    type,
    issueId,
    actorId,
    read: false,
    createdAt: new Date().toISOString(),
  });
}

export const MOCK_ROUTES: RouteDef[] = [
  {
    method: 'POST',
    pattern: '/api/auth/login',
    auth: 'public',
    handler: ({ body, store }) => {
      const { email, password } = (body ?? {}) as { email?: string; password?: string };
      const user = store.snapshot().users.find((u) => u.email.toLowerCase() === email?.toLowerCase());
      if (!user || SEED_PASSWORDS[user.id] !== password) {
        return err(401, 'invalid_credentials', 'Email or password is wrong.');
      }
      const token = mintJwt({ sub: user.id, email: user.email, role: user.role });
      const res: AuthResponse = { token, user: toSession(user) };
      return { status: 200, body: res };
    },
  },
  {
    method: 'POST',
    pattern: '/api/auth/logout',
    auth: 'user',
    handler: () => ({ status: 204 }),
  },
  {
    method: 'GET',
    pattern: '/api/auth/me',
    auth: 'user',
    handler: ({ user }) => ({ status: 200, body: user }),
  },
  {
    method: 'POST',
    pattern: '/api/auth/impersonate',
    auth: 'user',
    handler: ({ body, store }) => {
      const userId = (body as { userId?: string })?.userId;
      const target = store.snapshot().users.find((u) => u.id === userId);
      if (!target) return err(404, 'not_found', 'User not found.');
      const token = mintJwt({ sub: target.id, email: target.email, role: target.role });
      const res: AuthResponse = { token, user: toSession(target) };
      return { status: 200, body: res };
    },
  },
  {
    method: 'GET',
    pattern: '/api/users',
    auth: 'user',
    handler: ({ query, store }) => {
      const q = (query.get('q') ?? '').toLowerCase();
      let users = store.snapshot().users;
      if (q) users = users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
      return { status: 200, body: users };
    },
  },
  {
    method: 'GET',
    pattern: '/api/admin/users',
    auth: 'admin',
    handler: ({ store }) => {
      const db = store.snapshot();
      const body = db.users.map((u) => ({
        ...u,
        issueCount: db.issues.filter((i) => i.assigneeId === u.id).length,
      }));
      return { status: 200, body };
    },
  },
  {
    method: 'GET',
    pattern: '/api/projects',
    auth: 'user',
    handler: ({ store }) => ({ status: 200, body: store.snapshot().projects }),
  },
  {
    method: 'GET',
    pattern: '/api/projects/:id',
    auth: 'user',
    handler: ({ params, store }) => {
      const project = store.snapshot().projects.find((p) => p.id === params['id']);
      if (!project) return err(404, 'not_found', 'Project not found.');
      return { status: 200, body: project };
    },
  },
  {
    method: 'GET',
    pattern: '/api/labels',
    auth: 'user',
    handler: ({ store }) => ({ status: 200, body: store.snapshot().labels }),
  },
  {
    method: 'GET',
    pattern: '/api/issues',
    auth: 'user',
    handler: ({ query, store }) => {
      const projectId = query.get('projectId');
      const q = (query.get('q') ?? '').toLowerCase();
      const status = query.get('status') ?? '';
      const assigneeId = query.get('assigneeId') ?? '';
      const page = Math.max(1, Number(query.get('page') ?? '1') || 1);
      const pageSize = Math.min(100, Math.max(1, Number(query.get('pageSize') ?? '50') || 50));
      let items = store.snapshot().issues;
      if (projectId) items = items.filter((i) => i.projectId === projectId);
      if (q) items = items.filter((i) => i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q));
      if (status) items = items.filter((i) => i.status === status);
      if (assigneeId === 'unassigned') items = items.filter((i) => i.assigneeId === null);
      else if (assigneeId) items = items.filter((i) => i.assigneeId === assigneeId);
      const total = items.length;
      const start = (page - 1) * pageSize;
      return { status: 200, body: { items: items.slice(start, start + pageSize), total, page, pageSize } };
    },
  },
  {
    method: 'GET',
    pattern: '/api/issues/:id/comments',
    auth: 'user',
    handler: ({ params, store }) => {
      const issue = store.snapshot().issues.find((i) => i.id === params['id']);
      if (!issue) return err(404, 'not_found', 'Issue not found.');
      const comments = store
        .snapshot()
        .comments.filter((c) => c.issueId === params['id'])
        .slice()
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      return { status: 200, body: comments };
    },
  },
  {
    method: 'POST',
    pattern: '/api/issues/:id/comments',
    auth: 'member',
    handler: ({ params, body, user, store }) => {
      const issue = store.snapshot().issues.find((i) => i.id === params['id']);
      if (!issue) return err(404, 'not_found', 'Issue not found.');
      const text = ((body as CreateCommentRequest | null)?.body ?? '').trim();
      if (!text) return err(422, 'validation', 'Comment is invalid.', { body: 'required' });
      const comment: IssueComment = {
        id: `cmt_${Date.now()}`,
        issueId: issue.id,
        authorId: user!.id,
        body: text,
        createdAt: new Date().toISOString(),
      };
      store.mutate((db) => {
        db.comments.push(comment);
        notify(db, issue.assigneeId, user!.id, issue.id, 'commented');
        notify(db, issue.reporterId, user!.id, issue.id, 'commented');
      });
      return { status: 201, body: comment };
    },
  },
  {
    method: 'GET',
    pattern: '/api/issues/:id',
    auth: 'user',
    handler: ({ params, store }) => {
      const issue = store.snapshot().issues.find((i) => i.id === params['id']);
      if (!issue) return err(404, 'not_found', 'Issue not found.');
      return { status: 200, body: issue };
    },
  },
  {
    method: 'POST',
    pattern: '/api/issues',
    auth: 'member',
    handler: ({ body, user, store }) => {
      const req = (body ?? {}) as CreateIssueRequest;
      const details = requireFields(req.title ?? '', req.status, req.priority);
      const db = store.snapshot();
      const project = db.projects.find((p) => p.id === req.projectId);
      if (!project) return err(404, 'not_found', 'Project not found.');
      if (req.assigneeId && !db.users.some((u) => u.id === req.assigneeId)) {
        details['assigneeId'] = 'unknown user';
      }
      const unknownLabels = (req.labelIds ?? []).filter((id) => !db.labels.some((l) => l.id === id));
      if (unknownLabels.length) details['labelIds'] = 'unknown label';
      if (Object.keys(details).length) return err(422, 'validation', 'Issue is invalid.', details);
      const now = new Date().toISOString();
      let created!: Issue;
      store.mutate((d) => {
        const next = (d.issueSeqByProject[req.projectId] ?? 0) + 1;
        d.issueSeqByProject[req.projectId] = next;
        created = {
          id: `iss_${project.key.toLowerCase()}_${String(next).padStart(2, '0')}`,
          number: next,
          projectId: req.projectId,
          title: req.title.trim(),
          description: req.description ?? '',
          status: req.status,
          priority: req.priority,
          assigneeId: req.assigneeId ?? null,
          reporterId: user!.id,
          labelIds: req.labelIds ?? [],
          createdAt: now,
          updatedAt: now,
        };
        d.issues.push(created);
        notify(d, created.assigneeId, user!.id, created.id, 'assigned');
      });
      return { status: 201, body: created };
    },
  },
  {
    method: 'PATCH',
    pattern: '/api/issues/:id',
    auth: 'member',
    handler: ({ params, body, user, store }) => {
      const patch = (body ?? {}) as PatchIssueRequest;
      const existing = store.snapshot().issues.find((i) => i.id === params['id']);
      if (!existing) return err(404, 'not_found', 'Issue not found.');
      const details: Record<string, string> = {};
      if (patch.title !== undefined && patch.title.trim().length < 3) details['title'] = 'minLength 3';
      if (patch.status !== undefined && !STATUSES.has(patch.status)) details['status'] = 'invalid';
      if (patch.priority !== undefined && !PRIORITIES.has(patch.priority)) details['priority'] = 'invalid';
      if (patch.assigneeId && !store.snapshot().users.some((u) => u.id === patch.assigneeId)) {
        details['assigneeId'] = 'unknown user';
      }
      if (Object.keys(details).length) return err(422, 'validation', 'Issue is invalid.', details);
      let updated!: Issue;
      store.mutate((db) => {
        const issue = db.issues.find((i) => i.id === params['id'])!;
        const prevAssignee = issue.assigneeId;
        Object.assign(issue, {
          ...patch,
          title: patch.title?.trim() ?? issue.title,
          updatedAt: new Date().toISOString(),
        });
        updated = { ...issue };
        if (patch.assigneeId && patch.assigneeId !== prevAssignee) {
          notify(db, patch.assigneeId, user!.id, issue.id, 'assigned');
        }
        if (patch.status && patch.status !== existing.status) {
          notify(db, issue.assigneeId, user!.id, issue.id, 'status_changed');
        }
      });
      return { status: 200, body: updated };
    },
  },
  {
    method: 'GET',
    pattern: '/api/notifications',
    auth: 'user',
    handler: ({ user, store }) => {
      const items = store
        .snapshot()
        .notifications.filter((n) => n.userId === user!.id)
        .slice()
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      return { status: 200, body: items };
    },
  },
  {
    method: 'PATCH',
    pattern: '/api/notifications/:id',
    auth: 'user',
    handler: ({ params, body, user, store }) => {
      const found = store.snapshot().notifications.find((n) => n.id === params['id'] && n.userId === user!.id);
      if (!found) return err(404, 'not_found', 'Notification not found.');
      const read = (body as { read?: boolean })?.read ?? true;
      let updated!: Notification;
      store.mutate((db) => {
        const n = db.notifications.find((x) => x.id === params['id'])!;
        n.read = read;
        updated = { ...n };
      });
      return { status: 200, body: updated };
    },
  },
];

export function dispatchMock(
  method: string,
  url: string,
  body: unknown,
  authorization: string | null,
  store: MockStore,
): HandlerResult {
  const parsed = new URL(url, 'http://local.issueforge');
  const pathname = parsed.pathname;
  const route = MOCK_ROUTES.find((r) => r.method === method && matchPattern(r.pattern, pathname));
  if (!route) return err(404, 'not_found', `No mock route for ${method} ${pathname}`);

  let user: SessionUser | null = null;
  if (route.auth !== 'public') {
    const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;
    const payload = token ? parseJwt(token) : null;
    if (!payload || payload.exp * 1000 < Date.now()) {
      return err(401, 'unauthorized', 'Missing or expired token.');
    }
    const dbUser = store.snapshot().users.find((u) => u.id === payload.sub);
    if (!dbUser) return err(401, 'unauthorized', 'Unknown subject.');
    user = toSession(dbUser);
    const need: Role = route.auth === 'admin' ? 'admin' : route.auth === 'member' ? 'member' : 'viewer';
    if (ROLE_RANK[user.role] < ROLE_RANK[need]) {
      return err(403, 'forbidden', 'You do not have permission to do that.');
    }
  }

  const params = matchPattern(route.pattern, pathname) ?? {};
  return route.handler({ params, query: parsed.searchParams, body, user, store });
}
