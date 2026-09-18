import { Injectable } from '@angular/core';
import { IssueComment } from '../models/comment.model';
import { Issue, Label } from '../models/issue.model';
import { Notification } from '../models/notification.model';
import { Project } from '../models/project.model';
import { User } from '../models/user.model';
import { createSeedDb } from './mock.seed';

export const DB_KEY = 'issueforge.db';

export interface MockDb {
  users: User[];
  projects: Project[];
  labels: Label[];
  issues: Issue[];
  comments: IssueComment[];
  notifications: Notification[];
  issueSeqByProject: Record<string, number>;
}

export interface RequestLogEntry {
  at: string;
  method: string;
  url: string;
  status: number;
}

@Injectable({ providedIn: 'root' })
export class MockStore {
  private db: MockDb;
  readonly log: RequestLogEntry[] = [];

  constructor() {
    this.db = this.load();
  }

  snapshot(): MockDb {
    return this.db;
  }

  replace(db: MockDb): void {
    this.db = db;
    this.persist();
  }

  mutate(fn: (db: MockDb) => void): void {
    fn(this.db);
    this.persist();
  }

  record(method: string, url: string, status: number): void {
    this.log.unshift({ at: new Date().toISOString(), method, url, status });
    if (this.log.length > 20) this.log.pop();
  }

  reset(): void {
    localStorage.removeItem(DB_KEY);
    this.db = createSeedDb();
    this.persist();
    this.log.length = 0;
  }

  private load(): MockDb {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) {
      const seeded = createSeedDb();
      localStorage.setItem(DB_KEY, JSON.stringify(seeded));
      return seeded;
    }
    try {
      const parsed = JSON.parse(raw) as Partial<MockDb>;
      return {
        users: parsed.users ?? [],
        projects: parsed.projects ?? [],
        labels: parsed.labels ?? [],
        issues: parsed.issues ?? [],
        comments: parsed.comments ?? [],
        notifications: parsed.notifications ?? [],
        issueSeqByProject: parsed.issueSeqByProject ?? {},
      };
    } catch {
      const seeded = createSeedDb();
      localStorage.setItem(DB_KEY, JSON.stringify(seeded));
      return seeded;
    }
  }

  private persist(): void {
    localStorage.setItem(DB_KEY, JSON.stringify(this.db));
  }
}
