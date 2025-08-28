import { TitleCasePipe } from '@angular/common';
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
import {
  UpdateUser,
  User,
} from 'projects/e-suggestion/src/app/core/auth/data-access/auth.model';
import { Role } from 'projects/e-suggestion/src/app/core/auth/data-access/role.model';
import { RoleNamePipe } from 'projects/e-suggestion/src/app/core/auth/feature-auth/pipes/role-name.pipe';
import { BU } from 'projects/e-suggestion/src/app/core/crud/bus/bu.model';
import { Department } from 'projects/e-suggestion/src/app/core/crud/departments/department.model';
import { Plant } from 'projects/e-suggestion/src/app/core/crud/plants/plant.model';
import { BaButtonComponent } from 'projects/e-suggestion/src/app/ui/components/button/button.component';
import { BaInputComponent } from 'projects/e-suggestion/src/app/ui/components/form/input.component';
import { LoadingComponent } from 'projects/e-suggestion/src/app/ui/components/loading/loading.component';

interface EditUserData {
  user: User;
  bus: BU[];
  plants: Plant[];
  roles: Role[];
  departments: Department[];
}

@Component({
  selector: 'ba-edit-user',
  templateUrl: './edit-user.component.html',
  imports: [
    BaButtonComponent,
    TitleCasePipe,
    ReactiveFormsModule,
    BaInputComponent,
    LoadingComponent,
    RoleNamePipe,
    SelectModule,
  ],
  styles: [
    `
      :host {
        @apply rounded-none;
      }
    `,
  ],
})
export class EditUserDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<EditUserDialogComponent>);

  private readonly data = signal(inject<EditUserData>(MAT_DIALOG_DATA));

  protected readonly bus = computed(() => this.data().bus);
  protected readonly plants = computed(() => this.data().plants);
  protected readonly departments = computed(() => this.data().departments);
  protected readonly roles = computed(() => this.data().roles);
  protected readonly user = computed<Partial<User>>(() => {
    const user = this.data().user;
    return { ...user, roles_ids: user.roles.map(r => r.id) };
  });

  userEffect = effect(() => {
    const user = this.user();
    if (!user) return;

    untracked(() => {
      this.form.patchValue({
        ...user,
        plant_id: user.plant?.id,
        bu_id: user.bu?.id,
        department_id: user.department?.id,
        role_id: user.roles ? user.roles[0].id : null,
      });
    });
  });

  form = inject(FormBuilder).nonNullable.group({
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    te_id: ['TE', [Validators.required, Validators.pattern(/^TE\d{6}$/)]],
    plant_id: [null as number | null, Validators.required],
    department_id: [null as number | null, Validators.required],
    bu_id: [null as number | null, Validators.required],
    role_id: [null as number | null, Validators.required],
  });

  saveChanges() {
    const updatedData = this.form.getRawValue() as UpdateUser;
    this.dialogRef.close({
      type: 'update',
      data: { ...updatedData, id: this.user().id },
    });
  }

  delete() {
    this.dialogRef.close({ type: 'delete' });
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
