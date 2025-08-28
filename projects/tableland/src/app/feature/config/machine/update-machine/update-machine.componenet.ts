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
import { SelectModule } from 'primeng/select';
import { AreaStore } from 'projects/tableland/src/app/core/crud/areas/area.store';
import { MachineUpdate } from '../../../../core/crud/machines/machine.model';
import { BaButtonComponent } from '../../../../ui/components/button/button.component';
import { BaInputComponent } from '../../../../ui/components/form/input.component';
import { LoadingComponent } from '../../../../ui/components/loading/loading.component';

type EditEntityData = {
  entity: any;
};

@Component({
  selector: 'ba-update-machine',
  templateUrl: 'update-machine.component.html',
  imports: [
    ReactiveFormsModule,
    BaInputComponent,
    BaButtonComponent,
    LoadingComponent,
    SelectModule,
  ],
})
export class UpdateMachineComponent {
  private readonly dialogRef = inject(MatDialogRef<UpdateMachineComponent>);

  protected readonly allAreas = inject(AreaStore).allEntities;

  private readonly data = signal(inject<EditEntityData>(MAT_DIALOG_DATA));

  private entity = computed(() => this.data()?.entity);

  entityEffect = effect(() => {
    const entity = this.entity();
    if (!entity) return;

    untracked(() => {
      this.form.patchValue({
        ...entity,
        area_id: entity.area.id,
      });
    });
  });

  form = inject(FormBuilder).nonNullable.group({
    name: ['', Validators.required],
    area_id: [null as number | null, Validators.required],
  });

  onSubmit() {
    const body = this.form.getRawValue();
    this.dialogRef.close({ type: 'update', data: body });
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
