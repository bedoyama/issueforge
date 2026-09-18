import { Pipe, PipeTransform } from '@angular/core';
import { IssuePriority, IssueStatus } from '../../core/models/issue.model';

const STATUS: Record<IssueStatus, string> = {
  todo: 'To do',
  in_progress: 'In progress',
  in_review: 'In review',
  done: 'Done',
};

const PRIORITY: Record<IssuePriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

@Pipe({ name: 'statusLabel', pure: true })
export class StatusLabelPipe implements PipeTransform {
  transform(value: IssueStatus | IssuePriority): string {
    return STATUS[value as IssueStatus] ?? PRIORITY[value as IssuePriority] ?? value;
  }
}
