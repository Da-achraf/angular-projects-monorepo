import { NgClass, NgStyle } from '@angular/common';
import { Component, effect, inject, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { DrawerModule } from 'primeng/drawer';
import { EditorModule } from 'primeng/editor';
import { SelectModule } from 'primeng/select';
import { BaButtonComponent } from 'projects/e-suggestion/src/app/ui/components/button/button.component';
import { LoadingComponent } from 'projects/e-suggestion/src/app/ui/components/loading/loading.component';
import { AssignmentComponent } from '../../assignment/assignment/assignment.component';
import { IdeaCommentsComponent } from '../../idea-comments/components/idea-comments/idea-comments.component';
import { IdeaReviewStore } from '../../idea-review.store';
import { TeoaReviewComponent } from '../../teoa-review/teao-review/teoa-review.component';
import { IdeaCaptionComponent } from '../idea-caption.component';
import { RatingMatrixComponent } from '../rating-matrix/rating-matrix.component';

@Component({
  selector: 'ba-idea-review',
  templateUrl: './idea-review.component.html',
  styleUrl: './idea-review.component.scss',
  imports: [
    BaButtonComponent,
    ReactiveFormsModule,
    LoadingComponent,
    SelectModule,
    EditorModule,
    MatDividerModule,
    IdeaCommentsComponent,
    DrawerModule,
    RatingMatrixComponent,
    IdeaCaptionComponent,
    NgClass,
    NgStyle,
    AssignmentComponent,
    TeoaReviewComponent,
  ],
  providers: [IdeaReviewStore],
})
export class IdeaReviewComponent {
  /**
   * Binding the path parameter 'id' to our input property 'id'
   * is possible because we set withComponentInputBinding in routing configs.
   *
   */
  id = input<number>();

  protected readonly store = inject(IdeaReviewStore);

  protected readonly idea = this.store.idea;

  /**
   * This effect sets the received `ideaId` (via input) to the `ideaId` signal inside the store.
   * This automatically triggers loading the idea from the backend because of the reactive nature
   * of the `rxMethod` (`_loadIdea`) called in the store's init hook.
   *
   */
  private readonly loadIdeaTriggerEffect = effect(async () => {
    const id = this.id();
    if (!id) return;

    this.store.setIdeaId(id);
  });
}
