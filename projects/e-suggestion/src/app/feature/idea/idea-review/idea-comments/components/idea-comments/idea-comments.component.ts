import {
  Component,
  effect,
  inject,
  input,
  untracked
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Comment } from 'projects/e-suggestion/src/app/core/idea/models/comment.model';
import { CommentsComponent } from 'projects/e-suggestion/src/app/pattern/comments/comments-list/comments.component';
import { RadioFilterComponent } from 'projects/e-suggestion/src/app/pattern/radio-filter/radio.filter.component';
import { FilterOption } from 'projects/e-suggestion/src/app/pattern/radio-filter/types';
import { IdeaCommentService } from '../../services/idea-comment.service';
import { IdeaCommentsStore } from '../../services/idea-comments.store';

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
];

@Component({
  selector: 'ba-idea-comments',
  templateUrl: './idea-comments.component.html',
  styleUrl: './idea-comments.component.scss',
  imports: [FormsModule, RadioFilterComponent, CommentsComponent],
  providers: [IdeaCommentService, IdeaCommentsStore],
})
export class IdeaCommentsComponent {
  protected readonly store = inject(IdeaCommentsStore);

  ideaId = input.required<number>();
  comments = input.required<Comment[]>();

  componentEffect = effect(() => {
    const ideaId = this.ideaId();
    const comments = this.comments();
    if (!ideaId || !comments) return;

    untracked(() => {
      this.store.setComments(comments);
      this.store.setIdeaId(ideaId);
    });
  });

  protected readonly radioFilterOptions = Options;
}
