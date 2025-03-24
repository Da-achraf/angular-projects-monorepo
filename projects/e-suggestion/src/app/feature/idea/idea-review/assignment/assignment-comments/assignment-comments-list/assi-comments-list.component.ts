import {
  Component,
  effect,
  inject,
  input,
  untracked
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EditorModule } from 'primeng/editor';
import { AssignmentComment } from 'projects/e-suggestion/src/app/core/idea/models/assignment-comment.model';
import { CommentsComponent } from 'projects/e-suggestion/src/app/pattern/comments/comments-list/comments.component';
import { RadioFilterComponent } from 'projects/e-suggestion/src/app/pattern/radio-filter/radio.filter.component';
import { FilterOption } from 'projects/e-suggestion/src/app/pattern/radio-filter/types';
import { AssignmentCommentService } from '../assignment-comments.service';
import { AssignmentCommentsStore } from '../assignment-comments.store';

const Options: FilterOption[] = [
  {
    label: 'All',
    value: 'all',
  },
  {
    label: 'Yours',
    value: 'only_yours',
    title: 'Show your comments only',
  },
  {
    label: "Other's",
    value: 'only_others',
    title: "Show other's comments only",
  },
  {
    label: 'Owner',
    value: 'owner',
    title: "Show the owner's comments only",
  },
];

@Component({
  selector: 'ba-assi-comments-list',
  templateUrl: './assi-comments-list.component.html',
  styleUrl: './assi-comments-list.component.scss',
  imports: [
    EditorModule,
    FormsModule,
    RadioFilterComponent,
    CommentsComponent
  ],
  providers: [AssignmentCommentService, AssignmentCommentsStore],
})
export class AssignmentCommentsListComponent {
  protected readonly store = inject(AssignmentCommentsStore);

  assignmentId = input.required<number>();
  comments = input<AssignmentComment[]>([]);
  radioFilter = input(true);

  private readonly commentsEffect = effect(() => {
    const assignmentId = this.assignmentId();
    const comments = this.comments();

    if (!assignmentId || !comments) return;

    untracked(() => {
      this.store.setComments(comments);
      this.store.setAssignmentId(assignmentId);
    });
  });

  protected readonly radioFilterOptions = Options;
}
