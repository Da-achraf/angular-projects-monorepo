import {
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { EditorModule } from 'primeng/editor';
import { SelectModule } from 'primeng/select';
import { BaButtonComponent } from 'projects/e-suggestion/src/app/ui/components/button/button.component';
import { BaInputComponent } from 'projects/e-suggestion/src/app/ui/components/form/input.component';
import { LoadingComponent } from 'projects/e-suggestion/src/app/ui/components/loading/loading.component';
import { Idea } from '../../../../core/idea/models/idea.model';
import { ContentProcessingService } from '../../services/content-processing.service';
import { IdeaService } from '../../services/idea.service';

@Component({
  selector: 'ba-idea-details',
  templateUrl: './idea-details.component.html',
  styleUrl: './idea-details.component.scss',
  imports: [
    BaButtonComponent,
    ReactiveFormsModule,
    BaInputComponent,
    LoadingComponent,
    SelectModule,
    EditorModule,
    MatDividerModule,
  ],
  providers: [IdeaService, ContentProcessingService],
})
export class IdeaDetailsComponent {
  private readonly dialogRef = inject(MatDialogRef<IdeaDetailsComponent>);
  private readonly fb = inject(FormBuilder);

  protected idea = signal<Idea>(inject(MAT_DIALOG_DATA)?.idea);

  protected isEditMode = signal(false);
  protected isReadonly = computed(() => !this.isEditMode());

  ideaEffect = effect(() => {
    const idea = this.idea();
    untracked(() => this.form.patchValue(idea));
  });

  form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    actual_situation: ['', [Validators.required]],
  });

  toggleEditMode(ev: Event) {
    this.isEditMode.set((ev.target as HTMLInputElement).checked);
  }

  edit() {
    this.dialogRef.close({ type: 'edit' });
  }

  delete() {
    this.dialogRef.close({ type: 'delete' });
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
