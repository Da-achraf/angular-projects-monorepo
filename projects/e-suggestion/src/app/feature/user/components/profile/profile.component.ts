import { Component, effect, inject, untracked } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ba/core/data-access';
import { FloatLabelModule } from 'primeng/floatlabel';
import { SelectModule } from 'primeng/select';
import { AuthStore } from 'projects/e-suggestion/src/app/core/auth/data-access/auth.store';
import { UsersStore } from 'projects/e-suggestion/src/app/core/auth/data-access/services/users.store';
import { BUStore } from 'projects/e-suggestion/src/app/core/crud/bus/bu.store';
import { DepartmentStore } from 'projects/e-suggestion/src/app/core/crud/departments/department.store';
import { PlantStore } from 'projects/e-suggestion/src/app/core/crud/plants/plant.store';
import { BaButtonComponent } from 'projects/e-suggestion/src/app/ui/components/button/button.component';
import { BaInputComponent } from 'projects/e-suggestion/src/app/ui/components/form/input.component';

@Component({
  selector: 'ba-profile',
  imports: [
    ReactiveFormsModule,
    BaInputComponent,
    FloatLabelModule,
    BaButtonComponent,
    SelectModule,
    TranslatePipe,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {
  protected readonly store = inject(UsersStore);
  protected readonly authStore = inject(AuthStore);

  readonly #buStore = inject(BUStore);
  readonly #plantStore = inject(PlantStore);
  readonly #departmentStore = inject(DepartmentStore);

  readonly bus = this.#buStore.allEntities;
  readonly plants = this.#plantStore.allEntities;
  readonly departments = this.#departmentStore.allEntities;

  readonly form = inject(FormBuilder).nonNullable.group({
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    email: ['', [Validators.email]],
    bu_id: [null as number | null, Validators.required],
    plant_id: [null as number | null, Validators.required],
    department_id: [null as number | null, Validators.required],
  });

  private userEffect = effect(() => {
    const user = this.authStore.user();
    if (!user) return;

    untracked(() => {
      this.form.patchValue({
        ...user,
        plant_id: user.plant?.id,
        bu_id: user.bu?.id,
        department_id: user.department?.id,
      });
    });
  });

  onSubmit() {
    const body = {
      id: this.authStore.user().id,
      ...this.form.getRawValue(),
    };

    console.log(body);

    this.store.update(body);
  }
}
