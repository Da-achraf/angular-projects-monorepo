import { TitleCasePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { TranslatePipe, TranslationService } from '@ba/core/data-access';
import { EditorModule } from 'primeng/editor';
import { SelectModule } from 'primeng/select';
import { AttachmentUploadComponent } from 'projects/e-suggestion/src/app/pattern/attachment-upload/components/attachment-upload.component';
import { BaButtonComponent } from 'projects/e-suggestion/src/app/ui/components/button/button.component';
import { EditorComponent } from 'projects/e-suggestion/src/app/ui/components/editor/editor.component';
import { BaInputComponent } from 'projects/e-suggestion/src/app/ui/components/form/input.component';
import { LoadingComponent } from 'projects/e-suggestion/src/app/ui/components/loading/loading.component';
import { IdeaCreate } from '../../../../core/idea/models/idea.model';
import { IdeaStore } from '../../services/idea.store';

@Component({
  selector: 'ba-add-idea',
  templateUrl: './add-idea.component.html',
  styleUrl: './add-idea.component.scss',
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
    TranslatePipe,
  ],
})
export class AddIdeaComponent {
  protected readonly store = inject(IdeaStore);
  protected readonly translationService = inject(TranslationService);

  files: File[] = [];

  form = inject(FormBuilder).nonNullable.group({
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

  handleFiles(files: File[]) {
    this.files = files;
  }

  resetForm() {
    this.form.reset();
    this.files = [];
  }

  async onSubmit() {
    const ideaCreate: Omit<IdeaCreate, 'submitter_id'> = {
      ...this.form.getRawValue(),
    };
    try {
      await this.store.createIdea(ideaCreate, this.files);
      this.resetForm();
    } catch {}
  }
}
