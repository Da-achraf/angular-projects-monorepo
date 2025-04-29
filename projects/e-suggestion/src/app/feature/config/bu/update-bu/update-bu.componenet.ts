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
import { BUUpdate } from '../../../../core/crud/bus/bu.model';

type EditEntityData = {
  entity: BUUpdate;
};

@Component({
  selector: 'ba-update-bu',
  templateUrl: 'update-bu.component.html',
  imports: [
    ReactiveFormsModule,
    BaInputComponent,
    BaButtonComponent,
    LoadingComponent,
  ],
})
export class UpdateBuComponent {
  private readonly dialogRef = inject(MatDialogRef<UpdateBuComponent>);

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
