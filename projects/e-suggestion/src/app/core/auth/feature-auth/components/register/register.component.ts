import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  OnInit,
  untracked,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ListErrorsComponent } from '@ba/core/forms';
import { SelectModule } from 'primeng/select';
import { BaButtonComponent } from 'projects/e-suggestion/src/app/ui/components/button/button.component';
import { BaInputComponent } from '../../../../../ui/components/form/input.component';
import { BUStore } from '../../../../crud/bus/bu.store';
import { PlantStore } from '../../../../crud/plants/plant.store';
import { AuthStore } from '../../../data-access/auth.store';
import { RoleStore } from '../../../data-access/role.store';
import { RoleNamePipe } from '../../pipes/role-name.pipe';
import { RoleEnum } from '../../../data-access/auth.model';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    ListErrorsComponent,
    BaInputComponent,
    BaButtonComponent,
    SelectModule,
    RoleNamePipe,
  ],
})
export class RegisterComponent {
  protected readonly store = inject(AuthStore);
  readonly #buStore = inject(BUStore);
  readonly #plantStore = inject(PlantStore);
  readonly #roleStore = inject(RoleStore);

  readonly bus = this.#buStore.allEntities;
  readonly plants = this.#plantStore.allEntities;
  readonly roles = this.#roleStore.allEntities;

  readonly form = inject(FormBuilder).nonNullable.group({
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    te_id: ['TE', [Validators.required, Validators.pattern(/^TE\d{6}$/)]],
    bu_id: [null as number | null, Validators.required],
    role_id: [null as number | null, Validators.required],
    plant_id: [null as number | null, Validators.required],
  });

  private readonly userRoleEffect = effect(() => {
    const submitterRoleId = this.roles().find(
      (r) => r.name === RoleEnum.SUBMITTER
    )?.id;

    if (!submitterRoleId) return;
    untracked(() => this.form.controls.role_id.patchValue(submitterRoleId));
  });

  onSubmit() {
    this.store.register(this.form.getRawValue());
  }
}
