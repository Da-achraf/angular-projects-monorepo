import { DatePipe, NgClass, TitleCasePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { RoleNamePipe } from 'projects/e-suggestion/src/app/core/auth/feature-auth/pipes/role-name.pipe';
import { DeleteDialogComponent } from 'projects/e-suggestion/src/app/pattern/dialogs/delete-dialog.component';
import { SanitizeHtmlPipe } from 'projects/e-suggestion/src/app/ui/pipes/sanitize-html.pipe';
import { Comment } from '../../../core/idea/models/comment.model';
import { CleanHtmlPipe } from '../../../ui/pipes/clean-html.pipe';
import { catchError, finalize, map, Observable, of } from 'rxjs';
import { TimeAgoPipe } from '../../../ui/pipes/time-ago.pipe';

@Component({
  selector: 'ba-comment',
  templateUrl: './comment-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgClass,
    TitleCasePipe,
    RoleNamePipe,
    SanitizeHtmlPipe,
    CleanHtmlPipe,
    DatePipe,
    TimeAgoPipe,
  ],
})
export class CommentDetailComponent {
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  // Outputs as signals for better type safety
  like = output<void>();
  dislike = output<void>();
  delete = output<number>();

  comment = input.required<Comment>();
  connectedUserId = input.required<number>();

  protected readonly commenterFullName = computed(() => {
    const commenter = this.comment()?.commenter;
    return commenter
      ? `${commenter.first_name} ${commenter.last_name}`.trim()
      : '';
  });

  protected readonly commenterRole = computed(() => {
    const commenter = this.comment()?.commenter;
    return commenter?.roles?.[0]?.name ?? '';
  });

  protected readonly canDeleteComment = computed(() => {
    const comment = this.comment();
    const userId = this.connectedUserId();
    return comment?.commenter.id === userId;
  });

  protected readonly waitingForDeletionConfirm = signal(false);

  private openDeleteConfirmation(): Observable<boolean> {
    return this.dialog
      .open(DeleteDialogComponent, {
        data: { label: 'comment' },
        minWidth: '40vw',
        maxHeight: '95vh',
      })
      .afterClosed()
      .pipe(
        map((res) => res?.type === 'delete'),
        catchError(() => of(false))
      );
  }

  onDelete(id: number) {
    this.waitingForDeletionConfirm.set(true);

    this.openDeleteConfirmation()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.waitingForDeletionConfirm.set(false))
      )
      .subscribe((shouldDelete) => {
        if (shouldDelete) {
          this.delete.emit(id);
        }
      });
  }
}
