import { Component, effect, inject, input, untracked } from '@angular/core';
import { Assignment } from 'projects/e-suggestion/src/app/core/idea/models/assignment.model';
import { TranslatePipe } from '@ba/core/data-access';
import { BaButtonComponent } from 'projects/e-suggestion/src/app/ui/components/button/button.component';
import { AssignmentCommentsListComponent } from '../assignment-comments/assignment-comments-list/assi-comments-list.component';
import { AssignmentService } from '../assignment.service';
import { AssignmentStore } from '../assignment.store';
import { AssigneesComponent } from '../components/assignees/assignees.component';
import { AssignmentNotInitializedComponent } from '../components/assignment-not-initialized.component';
import { DueDateComponent } from '../components/due-date.component';
import { ProgressComponent } from '../progress/progress.component';

@Component({
  selector: 'ba-assignment',
  templateUrl: './assignment.component.html',
  imports: [
    AssigneesComponent,
    DueDateComponent,
    AssignmentCommentsListComponent,
    BaButtonComponent,
    AssignmentNotInitializedComponent,
    ProgressComponent,
    TranslatePipe,
  ],
  styleUrl: './assignment.component.scss',
  providers: [AssignmentService, AssignmentStore],
})
export class AssignmentComponent {
  protected readonly store = inject(AssignmentStore);

  assignment = input<Assignment | undefined>();
  ideaId = input.required<number>();

  private readonly assignmentEffect = effect(() => {
    const assignment = this.assignment();
    if (!assignment) return;

    untracked(() => this.store.setAssignment(assignment));
  });

  onAssigneesChange(assignees: number[]) {
    this.store.setTempData({ assignees });
  }

  onAssigneesPanelHide() {
    this.store.showIdeaStatusConfirmationDialog();
  }

  onDueDateChange(dueDate: Date | undefined) {
    this.store.setTempData({ dueDate: dueDate });
  }

  onProgressChange(progress: number) {
    this.store.setTempData({ progress });
  }
}
