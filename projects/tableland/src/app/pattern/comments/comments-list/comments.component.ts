import { NgClass } from '@angular/common';
import { Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EditorModule } from 'primeng/editor';
import { Comment } from 'projects/e-suggestion/src/app/core/idea/models/comment.model';
import { AddCommentComponent } from 'projects/e-suggestion/src/app/pattern/comments/add-comment/add-comment.component';
import { CommentDetailComponent } from 'projects/e-suggestion/src/app/pattern/comments/comment-detail/comment-detail.component';
import { LoadingComponent } from 'projects/e-suggestion/src/app/ui/components/loading/loading.component';
import { BaButtonComponent } from '../../../ui/components/button/button.component';
import { TranslatePipe } from '@ba/core/data-access';

/**
 * Generic comments components
 *
 */

@Component({
  selector: 'ba-comments',
  templateUrl: './comments.component.html',
  styleUrl: './comments.component.scss',
  imports: [
    CommentDetailComponent,
    AddCommentComponent,
    BaButtonComponent,
    EditorModule,
    FormsModule,
    NgClass,
    LoadingComponent,
    TranslatePipe,
  ],
})
export class CommentsComponent {
  label = input('');
  comments = input.required<Comment[]>();

  loading = input(false);
  sortingOrder = input<'asc' | 'desc'>();
  connectedUserId = input.required<number>();
  viewMode = input(false);

  sortingOrderChange = output<'asc' | 'desc'>();
  addComment = output<string>();
  deleteComment = output<number>();

  protected readonly sortingTitle = computed(() =>
    this.sortingOrder() === 'desc' ? 'recent-to-old' : 'old-to-recent'
  );

  protected readonly sortingClass = computed(() =>
    this.sortingOrder() === 'desc'
      ? 'fa-arrow-down-wide-short'
      : 'fa-arrow-up-short-wide'
  );

  protected readonly createCommentTrigger = signal(false);
  protected readonly showCreateCommentEditor = computed(() =>
    this.createCommentTrigger()
  );

  protected onCommentSubmit(body: string) {
    this.createCommentTrigger.set(false);
    this.addComment.emit(body);
  }

  toggleSortingOrder() {
    const newSortingOrder = this.sortingOrder() === 'asc' ? 'desc' : 'asc';
    this.sortingOrderChange.emit(newSortingOrder);
  }
}
