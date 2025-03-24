import { Component, effect, inject, input, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EditorModule } from 'primeng/editor';
import { TeoaComment } from 'projects/e-suggestion/src/app/core/idea/models/teoa-comment.model';
import { CommentsComponent } from 'projects/e-suggestion/src/app/pattern/comments/comments-list/comments.component';
import { TeoaCommentStore } from '../teoa-comment.store';
import { TeoaCommentService } from '../teoa-comment.service';

@Component({
  selector: 'ba-teoa-comments',
  templateUrl: './teoa-comments.component.html',
  styleUrl: './teoa-comments.component.scss',
  imports: [CommentsComponent, EditorModule, FormsModule],
  providers: [TeoaCommentService, TeoaCommentStore]
})
export class TeoaCommentsComponent {
  store = inject(TeoaCommentStore);

  viewMode = input(false);
  teaoReviewId = input.required<number>();
  comments = input<TeoaComment[]>([]);

  private readonly commentsEffect = effect(() => {
    const reviewId = this.teaoReviewId();
    const comments = this.comments();

    if (!reviewId || !comments) return;

    untracked(() => {
      this.store.setComments(comments);
      this.store.setTeoaReviewId(reviewId);
    });
  });
}
