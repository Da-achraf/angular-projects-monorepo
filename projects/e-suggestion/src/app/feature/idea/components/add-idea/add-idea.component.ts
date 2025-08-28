import { TitleCasePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { TranslatePipe, TranslationService } from '@ba/core/data-access';
import { EditorModule } from 'primeng/editor';
import { SelectModule } from 'primeng/select';
import { CategoryStore } from 'projects/e-suggestion/src/app/core/crud/categories/category.store';
import { DepartmentStore } from 'projects/e-suggestion/src/app/core/crud/departments/department.store';
import { AttachmentUploadComponent } from 'projects/e-suggestion/src/app/pattern/attachment-upload/components/attachment-upload.component';
import { BaButtonComponent } from 'projects/e-suggestion/src/app/ui/components/button/button.component';
import { EditorComponent } from 'projects/e-suggestion/src/app/ui/components/editor/editor.component';
import { BaInputComponent } from 'projects/e-suggestion/src/app/ui/components/form/input.component';
import { LoadingComponent } from 'projects/e-suggestion/src/app/ui/components/loading/loading.component';
import { IdeaCreate } from '../../../../core/idea/models/idea.model';
import { IdeaStore } from '../../services/idea.store';
import { nonZeroValidator } from '../../utils/form.util';

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
  protected readonly departmentStore = inject(DepartmentStore);
  protected readonly categoryStore = inject(CategoryStore);
  protected readonly translationService = inject(TranslationService);

  files: File[] = [];

  form = inject(FormBuilder).nonNullable.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    department_id: [0, [Validators.required, nonZeroValidator]],
    category_id: [0, [Validators.required, nonZeroValidator]],
    actual_situation: ['', [Validators.required]],
  });

  protected categories = this.categoryStore.allEntities;

  protected departments = this.departmentStore.allEntities;

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
