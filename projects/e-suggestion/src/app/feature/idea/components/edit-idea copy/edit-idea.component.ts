import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EditorModule } from 'primeng/editor';
import { SelectModule } from 'primeng/select';
import { AttachmentUploadComponent } from 'projects/e-suggestion/src/app/pattern/attachment-upload/components/attachment-upload.component';
import { BaButtonComponent } from 'projects/e-suggestion/src/app/ui/components/button/button.component';
import { BaInputComponent } from 'projects/e-suggestion/src/app/ui/components/form/input.component';
import { LoadingComponent } from 'projects/e-suggestion/src/app/ui/components/loading/loading.component';
import { lastValueFrom } from 'rxjs';
import { Idea, IdeaUpdate } from '../../../../core/idea/models/idea.model';
import { IdeaService } from '../../services/idea.service';
import { IdeaStore } from '../../services/idea.store';

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
    RouterLink,
    AttachmentUploadComponent,
  ],
})
export class EditIdeaComponent2 {
  private readonly fb = inject(FormBuilder);
  private readonly ideaStore = inject(IdeaStore);
  private readonly ideaService = inject(IdeaService);
  private readonly router = inject(Router);
  private readonly ideaId = signal(
    inject(ActivatedRoute).snapshot.params['id']
  );

  protected readonly loading = this.ideaStore.isLoading;
  protected readonly idea = signal<Idea | null>(null);
  protected attachments = computed(() => this.idea()?.attachments);

  files: File[] = [];

  form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    actual_situation: ['', [Validators.required]],
  });

  constructor() {
    this.loadIdea();
    this.initializeEffect();
  }

  private async loadIdea() {
    const ideaId = this.ideaId();
    if (!ideaId) return;

    try {
      const response = await lastValueFrom(this.ideaService.loadOne(ideaId));
      if (response.data) {
        this.idea.set(response.data as Idea);
      }
    } catch {
      this.router.navigate(['/app/ideas/list']);
    }
  }

  private initializeEffect() {
    effect(() => {
      const idea = this.idea();
      if (idea) {
        this.patchForm(idea);
      }
    });
  }

  private patchForm(idea: Idea) {
    this.form.patchValue({
      title: idea.title,
      description: idea.description,
      actual_situation: idea.actual_situation,
    });
  }

  handleFiles(files: File[]) {
    this.files = files;
    this.form.markAsDirty();
  }

  async onAttachmentDelete(id: number) {
    await this.ideaStore.deleteAttachment(id);
    await this.loadIdea();
  }

  async onSubmit() {
    const ideaUpdate: Partial<IdeaUpdate> = {
      ...this.form.getRawValue(),
      id: this.idea()?.id,
    };
    await this.ideaStore.updateIdea(ideaUpdate, this.files);
  }
}
