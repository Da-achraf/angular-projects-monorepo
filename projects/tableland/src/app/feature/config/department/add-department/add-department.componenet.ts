import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { BaButtonComponent } from '../../../../ui/components/button/button.component';
import { BaInputComponent } from '../../../../ui/components/form/input.component';
import { LoadingComponent } from '../../../../ui/components/loading/loading.component';

@Component({
  selector: 'ba-add-department',
  templateUrl: 'add-department.component.html',
  imports: [
    ReactiveFormsModule,
    BaInputComponent,
    BaButtonComponent,
    LoadingComponent,
  ],
})
export class AddDepartmentComponent {
  private readonly dialogRef = inject(MatDialogRef<AddDepartmentComponent>);

  form = inject(FormBuilder).nonNullable.group({
    name: ['', Validators.required],
  });

  onSubmit() {
    const body = this.form.getRawValue();
    this.dialogRef.close({ type: 'create', data: body });
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
