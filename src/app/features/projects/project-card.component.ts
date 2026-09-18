import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Project } from '../../core/models/project.model';

@Component({
  selector: 'forge-project-card',
  imports: [RouterLink],
  template: `
    <a [routerLink]="['/projects', project().id]">
      <strong>{{ project().key }}</strong>
      <h3>{{ project().name }}</h3>
      <p>{{ project().description }}</p>
    </a>
  `,
  styles: `
    a { display: grid; gap: 6px; padding: 16px; background: var(--bg-elev); border: 1px solid var(--border); border-radius: 12px; color: inherit; text-decoration: none; }
    a:hover { border-color: var(--accent); }
    strong { color: var(--accent); font-size: 12px; }
    p { color: var(--text-muted); font-size: 14px; }
  `,
})
export class ProjectCard {
  readonly project = input.required<Project>();
}
