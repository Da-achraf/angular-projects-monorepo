import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { BaButtonComponent } from '../../../../ui/components/button/button.component';
import { BaInputComponent } from '../../../../ui/components/form/input.component';
import { LoadingComponent } from '../../../../ui/components/loading/loading.component';
import { AreaStore } from '../../../../core/crud/areas/area.store';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'ba-add-machine',
  templateUrl: 'add-machine.component.html',
  imports: [
    ReactiveFormsModule,
    BaInputComponent,
    BaButtonComponent,
    LoadingComponent,
    SelectModule,
  ],
})
export class AddMachineComponent {
  private readonly dialogRef = inject(MatDialogRef<AddMachineComponent>);
  protected readonly allAreas = inject(AreaStore).allEntities;

  form = inject(FormBuilder).nonNullable.group({
    name: ['', Validators.required],
    area_id: [null as number | null, Validators.required],
  });

  onSubmit() {
    const body = this.form.getRawValue();
    this.dialogRef.close({ type: 'create', data: body });
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
