export type IssueStatus = 'todo' | 'in_progress' | 'in_review' | 'done';
export type IssuePriority = 'low' | 'medium' | 'high' | 'critical';

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface Issue {
  id: string;
  number: number;
  projectId: string;
  title: string;
  description: string;
  status: IssueStatus;
  priority: IssuePriority;
  assigneeId: string | null;
  reporterId: string;
  labelIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BoardFilterSlice {
  query: string;
  status: IssueStatus | null;
  assigneeId: string | null;
}

export const EMPTY_BOARD_FILTERS: BoardFilterSlice = {
  query: '',
  status: null,
  assigneeId: null,
};

export const ISSUE_STATUSES: IssueStatus[] = ['todo', 'in_progress', 'in_review', 'done'];
export const ISSUE_PRIORITIES: IssuePriority[] = ['low', 'medium', 'high', 'critical'];
