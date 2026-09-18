import { IssuePriority, IssueStatus } from './issue.model';

export interface ListResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateIssueRequest {
  projectId: string;
  title: string;
  description: string;
  status: IssueStatus;
  priority: IssuePriority;
  assigneeId: string | null;
  labelIds: string[];
}

export type PatchIssueRequest = Partial<CreateIssueRequest>;

export interface CreateCommentRequest {
  body: string;
}

export interface ApiErrorBody {
  error: string;
  message: string;
  details?: Record<string, string>;
}
