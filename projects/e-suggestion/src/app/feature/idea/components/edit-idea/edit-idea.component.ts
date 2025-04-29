import { TitleCasePipe } from '@angular/common';
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
import { AttachmentUploadComponent } from 'projects/e-suggestion/src/app/pattern/attachment-upload/components/attachment-upload.component';
import { DeleteDialogComponent } from 'projects/e-suggestion/src/app/pattern/dialogs/delete-dialog.component';
import { BaButtonComponent } from 'projects/e-suggestion/src/app/ui/components/button/button.component';
import { EditorComponent } from 'projects/e-suggestion/src/app/ui/components/editor/editor.component';
import { BaInputComponent } from 'projects/e-suggestion/src/app/ui/components/form/input.component';
import { LoadingComponent } from 'projects/e-suggestion/src/app/ui/components/loading/loading.component';
import { lastValueFrom } from 'rxjs';
import { Idea, IdeaUpdate } from '../../../../core/idea/models/idea.model';
import { IdeaCaptionComponent } from '../../idea-review/components/idea-caption.component';
import { IdeaService } from '../../services/idea.service';
import { IdeaStore } from '../../services/idea.store';
import { TranslationService } from 'projects/e-suggestion/src/app/core/translation/translation.service';

@Component({
  selector: 'ba-edit-idea',
  templateUrl: './edit-idea.component.html',
  styleUrl: './edit-idea.component.scss',
  imports: [
    BaButtonComponent,
    ReactiveFormsModule,
    BaInputComponent,
    LoadingComponent,
    SelectModule,
    EditorModule,
    MatDividerModule,
    AttachmentUploadComponent,
    EditorComponent,
    TitleCasePipe,
    IdeaCaptionComponent,
    TranslatePipe,
  ],
})
export class EditIdeaComponent {
  id = input<number>();

  protected readonly store = inject(IdeaStore);
  private readonly ideaService = inject(IdeaService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  protected readonly translationService = inject(TranslationService);

  protected readonly idea = signal<Idea | null>(null);
  protected attachments = computed(() => this.idea()?.attachments);

  private files: File[] = [];

  protected form = inject(FormBuilder).nonNullable.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    category: ['', Validators.required],
    department: ['', Validators.required],
    actual_situation: ['', [Validators.required]],
  });

  categories = signal([
    'Qualité',
    'Coût (Waste)',
    'Efficience',
    'Sécurité',
    'Environment',
    '5S',
  ]);

  departments = signal([
    'Production',
    'Quality',
    'Process',
    'Tools Shop',
    'Maintenance',
    'Tool & Die',
    'Warehouse',
    'SC',
    'Other',
  ]);

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

  private async loadIdea() {
    const id = this.id();
    if (!id) return;

    const response = await lastValueFrom(this.ideaService.loadOne(id));
    if (response.data) {
      this.idea.set(response.data as Idea);
    }
  }

  private readonly initializeIdeaFormEffect = effect(() => {
    const idea = this.idea();
    if (idea) {
      this.patchForm(idea);
    }
  });

  private patchForm(idea: Idea) {
    this.form.patchValue(idea);
  }

  handleFiles(files: File[]) {
    this.files = files;
    this.form.markAsDirty();
  }

  async onAttachmentDelete(id: number) {
    await this.store.deleteAttachment(id);
    await this.loadIdea();
  }

  async onSaveChanges() {
    const ideaUpdate: Partial<IdeaUpdate> = {
      ...this.form.getRawValue(),
      id: this.idea()?.id,
      action: 'modified',
    };
    await this.store.updateIdea(ideaUpdate, this.files);
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
