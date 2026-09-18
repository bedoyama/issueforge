import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateIssueRequest, PatchIssueRequest } from '../../core/models/api.model';
import { IssueComment } from '../../core/models/comment.model';
import { Issue } from '../../core/models/issue.model';

@Injectable({ providedIn: 'root' })
export class IssueService {
  private readonly http = inject(HttpClient);

  create(body: CreateIssueRequest): Observable<Issue> {
    return this.http.post<Issue>('/api/issues', body);
  }

  patch(id: string, body: PatchIssueRequest): Observable<Issue> {
    return this.http.patch<Issue>(`/api/issues/${id}`, body);
  }

  addComment(issueId: string, body: string): Observable<IssueComment> {
    return this.http.post<IssueComment>(`/api/issues/${issueId}/comments`, { body });
  }
}
