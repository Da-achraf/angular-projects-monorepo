import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { Router } from '@angular/router';
import { EditorModule } from 'primeng/editor';
import { SelectModule } from 'primeng/select';
import { TranslatePipe } from 'projects/e-suggestion/src/app/core/translation/translate.pipe';
import { TranslationService } from 'projects/e-suggestion/src/app/core/translation/translation.service';
import { AttachmentUploadComponent } from 'projects/e-suggestion/src/app/pattern/attachment-upload/components/attachment-upload.component';
import { DeleteDialogComponent } from 'projects/e-suggestion/src/app/pattern/dialogs/delete-dialog.component';
import { BaButtonComponent } from 'projects/e-suggestion/src/app/ui/components/button/button.component';
import { ContentDisplayComponent } from 'projects/e-suggestion/src/app/ui/components/content-display.component';
import { LoadingComponent } from 'projects/e-suggestion/src/app/ui/components/loading/loading.component';
import { lastValueFrom } from 'rxjs';
import { Idea } from '../../../../core/idea/models/idea.model';
import { IdeaCaptionComponent } from '../../idea-review/components/idea-caption.component';
import { IdeaService } from '../../services/idea.service';
import { IdeaStore } from '../../services/idea.store';

@Component({
  selector: 'ba-idea-detail',
  templateUrl: './idea-detail.component.html',
  styleUrl: './idea-detail.component.scss',
  imports: [
    BaButtonComponent,
    ReactiveFormsModule,
    LoadingComponent,
    SelectModule,
    EditorModule,
    MatDividerModule,
    AttachmentUploadComponent,
    ContentDisplayComponent,
    IdeaCaptionComponent,
    TranslatePipe,
  ],
})
export class IdeaDetailComponent {
  id = input<number>();

  protected readonly store = inject(IdeaStore);

  private readonly fb = inject(FormBuilder);
  private readonly ideaService = inject(IdeaService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly translationService = inject(TranslationService);

  protected readonly idea = signal<Idea | null>(null);
  protected readonly attachments = computed(() => this.idea()?.attachments);

  files: File[] = [];

  form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    actual_situation: ['', [Validators.required]],
  });

  private async loadIdea() {
    const id = this.id();
    if (!id) return;

    const response = await lastValueFrom(this.ideaService.loadOne(id));
    if (response.data) {
      this.idea.set(response.data as Idea);
    }
  }

  private readonly loadIdeaEffect = effect(async () => {
    const id = this.id();
    if (!id) return;

    untracked(async () => {
      try {
        await this.loadIdea();
      } catch {
        this.router.navigate(['/app/ideas/list']);
      }
    });
  });

  private readonly initializeEffect = effect(() => {
    const idea = this.idea();
    if (idea) {
      this.patchForm(idea);
    }
  });

  private patchForm(idea: Idea) {
    this.form.patchValue({
      title: idea.title,
      description: idea.description,
      actual_situation: idea.actual_situation,
    });
  }

  edit(id: number) {
    this.router.navigateByUrl(`/app/ideas/${id}/edit`);
  }

  delete(id: number) {
    this.dialog
      .open(DeleteDialogComponent, {
        data: { label: 'idea' },
        minWidth: '40vw',
        maxHeight: '95vh',
      })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: res => {
          if (res && res?.type === 'delete') {
            this.store.deleteOne(id);
            this.router.navigateByUrl('/app/ideas');
          }
        },
      });
  }
}
