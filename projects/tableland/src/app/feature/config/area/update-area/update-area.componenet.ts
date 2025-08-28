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
import { BaButtonComponent } from '../../../../ui/components/button/button.component';
import { BaInputComponent } from '../../../../ui/components/form/input.component';
import { LoadingComponent } from '../../../../ui/components/loading/loading.component';
import { AreaUpdate } from '../../../../core/crud/areas/area.model';

type EditEntityData = {
  entity: AreaUpdate;
};

@Component({
  selector: 'ba-update-area',
  templateUrl: 'update-area.component.html',
  imports: [
    ReactiveFormsModule,
    BaInputComponent,
    BaButtonComponent,
    LoadingComponent,
  ],
})
export class UpdateAreaComponent {
  private readonly dialogRef = inject(MatDialogRef<UpdateAreaComponent>);

  private readonly data = signal(inject<EditEntityData>(MAT_DIALOG_DATA));

  private entity = computed(() => this.data()?.entity);

  entityEffect = effect(() => {
    const entity = this.entity();
    if (!entity) return;

    untracked(() => {
      this.form.patchValue({
        ...entity,
      });
    });
  });

  form = inject(FormBuilder).nonNullable.group({
    name: ['', Validators.required],
  });

  onSubmit() {
    const body = this.form.getRawValue();
    this.dialogRef.close({ type: 'update', data: body });
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
