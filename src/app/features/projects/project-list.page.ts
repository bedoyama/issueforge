import { httpResource } from '@angular/common/http';
import { Component } from '@angular/core';
import { Project } from '../../core/models/project.model';
import { EmptyState } from '../../shared/ui/empty-state.component';
import { Spinner } from '../../shared/ui/spinner.component';
import { ProjectCard } from './project-card.component';

@Component({
  selector: 'forge-project-list',
  imports: [ProjectCard, Spinner, EmptyState],
  templateUrl: './project-list.page.html',
  styleUrl: './project-list.page.css',
})
export class ProjectListPage {
  protected readonly projects = httpResource<Project[]>(() => '/api/projects');
}
