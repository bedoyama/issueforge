import { IssueComment } from '../models/comment.model';
import { Issue, IssuePriority, IssueStatus, Label } from '../models/issue.model';
import { Notification } from '../models/notification.model';
import { Project } from '../models/project.model';
import { User } from '../models/user.model';
import { MockDb } from './mock.store';

export const SEED_PASSWORDS: Record<string, string> = {
  usr_ada: 'password',
  usr_linus: 'password',
  usr_grace: 'password',
  usr_margaret: 'password',
  usr_dennis: 'password',
};

const USERS: User[] = [
  { id: 'usr_ada', name: 'Ada Lovelace', email: 'ada@board.dev', role: 'admin', avatarHue: 210 },
  { id: 'usr_linus', name: 'Linus Torvalds', email: 'linus@board.dev', role: 'member', avatarHue: 25 },
  { id: 'usr_grace', name: 'Grace Hopper', email: 'grace@board.dev', role: 'viewer', avatarHue: 160 },
  { id: 'usr_margaret', name: 'Margaret Hamilton', email: 'margaret@board.dev', role: 'member', avatarHue: 280 },
  { id: 'usr_dennis', name: 'Dennis Ritchie', email: 'dennis@board.dev', role: 'member', avatarHue: 45 },
];

const PROJECTS: Project[] = [
  { id: 'prj_if', key: 'IF', name: 'IssueForge App', description: 'Tracker UI, routing, and interview surfaces', createdAt: '2026-08-01T09:00:00.000Z' },
  { id: 'prj_ds', key: 'DS', name: 'Design System', description: 'Tokens, primitives, a11y', createdAt: '2026-08-02T09:00:00.000Z' },
  { id: 'prj_api', key: 'API', name: 'Mock API', description: 'Interceptor, latency, error knobs', createdAt: '2026-08-03T09:00:00.000Z' },
  { id: 'prj_dx', key: 'DX', name: 'Developer Experience', description: 'Seed data, README, demo switcher', createdAt: '2026-08-04T09:00:00.000Z' },
];

const LABELS: Label[] = [
  { id: 'lab_bug', name: 'bug', color: '#f87171' },
  { id: 'lab_feature', name: 'feature', color: '#6ea8fe' },
  { id: 'lab_docs', name: 'docs', color: '#34d399' },
  { id: 'lab_infra', name: 'infra', color: '#fbbf24' },
  { id: 'lab_ux', name: 'ux', color: '#c084fc' },
  { id: 'lab_interview', name: 'interview', color: '#fb923c' },
];

const STATUSES: IssueStatus[] = ['todo', 'in_progress', 'in_review', 'done'];
const PRIORITIES: IssuePriority[] = ['low', 'medium', 'high', 'critical'];
const ASSIGNEES = ['usr_ada', 'usr_linus', 'usr_margaret', 'usr_dennis', null] as const;
const LABEL_CYCLE = ['lab_bug', 'lab_feature', 'lab_docs', 'lab_infra', 'lab_ux'];

const COUNTS: Record<string, number> = { prj_if: 14, prj_ds: 8, prj_api: 6, prj_dx: 4 };

const TITLES: Record<string, string[]> = {
  prj_if: [
    'linkedSignal filters reset per project',
    'httpResource board refetch',
    'Nested comments route',
    'Unsaved-changes guard on edit',
    'RxJS debounce search',
    'HasRole viewer chrome',
    'Auth interceptor attaches Bearer',
    'Resolver RedirectCommand on 404',
    'Zoneless form validity signal',
    'Lazy admin chunk',
    'Inbox poll must survive 500',
    'Demo user switcher',
    'Click-outside user menu',
    'Status select PATCH',
  ],
  prj_ds: [
    'CSS variable tokens',
    'Avatar hue without images',
    'Empty-state primitive',
    'Badge status colors',
    'Toast stacking',
    'Light theme contrast',
    'Focus rings on buttons',
    'Spinner delay',
  ],
  prj_api: [
    'Mock interceptor last in chain',
    'Latency slider 0–5000',
    'Inject 401 on *',
    '422 details shape',
    'Comments GET + POST',
    'Admin users issueCount',
  ],
  prj_dx: [
    'Demo switcher always visible',
    'README concept map',
    'Seed passwords stay in module scope',
    'Reset demo data button',
  ],
};

function buildIssues(): Issue[] {
  const issues: Issue[] = [];
  for (const project of PROJECTS) {
    const count = COUNTS[project.id];
    for (let i = 0; i < count; i++) {
      const n = i + 1;
      const nn = String(n).padStart(2, '0');
      const createdAt = new Date(Date.parse('2026-09-01T09:00:00.000Z') + i * 3_600_000).toISOString();
      const interview =
        n === 1 || (project.id === 'prj_if' && n >= 1 && n <= 6);
      issues.push({
        id: `iss_${project.key.toLowerCase()}_${nn}`,
        number: n,
        projectId: project.id,
        title: TITLES[project.id][i] ?? `${project.key}-${n}`,
        description: `Seed issue ${project.key}-${n} for the IssueForge interview demo.`,
        status: STATUSES[i % 4],
        priority: PRIORITIES[i % 4],
        assigneeId: ASSIGNEES[i % 5],
        reporterId: 'usr_ada',
        labelIds: interview ? ['lab_interview'] : [LABEL_CYCLE[i % 5]],
        createdAt,
        updatedAt: createdAt,
      });
    }
  }
  return issues;
}

function buildComments(issues: Issue[]): IssueComment[] {
  const targets = [
    ...Array(4).fill('iss_if_01'),
    ...Array(3).fill('iss_if_02'),
    ...Array(3).fill('iss_if_03'),
    ...Array(2).fill('iss_ds_01'),
    ...Array(2).fill('iss_api_01'),
    ...Array(2).fill('iss_dx_01'),
    'iss_if_04',
    'iss_if_05',
  ] as string[];
  const authors = ['usr_linus', 'usr_margaret', 'usr_dennis', 'usr_ada'];
  return targets.map((issueId, i) => {
    const n = i + 1;
    const issue = issues.find((iss) => iss.id === issueId)!;
    const createdAt = new Date(Date.parse(issue.createdAt) + (i + 1) * 600_000).toISOString();
    return {
      id: `cmt_${String(n).padStart(2, '0')}`,
      issueId,
      authorId: authors[i % authors.length],
      body: `Comment ${n} on ${issueId}`,
      createdAt,
    };
  });
}

function buildNotifications(): Notification[] {
  const recipients = ['usr_ada', 'usr_linus', 'usr_grace', 'usr_margaret', 'usr_dennis'];
  const actors = ['usr_linus', 'usr_margaret', 'usr_dennis', 'usr_ada', 'usr_linus'];
  const types = ['assigned', 'commented'] as const;
  const notifications: Notification[] = [];
  let n = 1;
  for (const userId of recipients) {
    for (let k = 0; k < 2; k++) {
      const actorId = actors[(n + k) % actors.length] === userId ? 'usr_ada' : actors[(n + k) % actors.length];
      const safeActor = actorId === userId ? 'usr_dennis' : actorId;
      notifications.push({
        id: `ntf_${String(n).padStart(2, '0')}`,
        userId,
        type: types[k % 2],
        issueId: k === 0 ? 'iss_if_01' : 'iss_if_02',
        actorId: safeActor === userId ? 'usr_margaret' : safeActor,
        read: false,
        createdAt: new Date(Date.parse('2026-09-10T12:00:00.000Z') + n * 120_000).toISOString(),
      });
      n += 1;
    }
  }
  notifications.push(
    {
      id: 'ntf_11',
      userId: 'usr_ada',
      type: 'assigned',
      issueId: 'iss_if_01',
      actorId: 'usr_linus',
      read: true,
      createdAt: '2026-09-09T10:00:00.000Z',
    },
    {
      id: 'ntf_12',
      userId: 'usr_ada',
      type: 'commented',
      issueId: 'iss_if_02',
      actorId: 'usr_margaret',
      read: true,
      createdAt: '2026-09-09T11:00:00.000Z',
    },
  );
  return notifications;
}

export function createSeedDb(): MockDb {
  const issues = buildIssues();
  return {
    users: USERS.map((u) => ({ ...u })),
    projects: PROJECTS.map((p) => ({ ...p })),
    labels: LABELS.map((l) => ({ ...l })),
    issues,
    comments: buildComments(issues),
    notifications: buildNotifications(),
    issueSeqByProject: { ...COUNTS },
  };
}
