export type NotificationType = 'assigned' | 'commented' | 'mentioned' | 'status_changed';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  issueId: string;
  actorId: string;
  read: boolean;
  createdAt: string;
}
