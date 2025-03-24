import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ListErrorsComponent } from '@ba/core/forms';
import { BaButtonComponent } from 'projects/e-suggestion/src/app/ui/components/button/button.component';
import { BaInputComponent } from 'projects/e-suggestion/src/app/ui/components/form/input.component';
import { PasswordFieldComponent } from 'projects/e-suggestion/src/app/ui/components/form/password-field.component';
import { LoginUser } from '../../../data-access/auth.model';
import { AuthStore } from '../../../data-access/auth.store';

@Component({
  selector: 'ba-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    ListErrorsComponent,
    BaButtonComponent,
    BaInputComponent,
    PasswordFieldComponent,
  ],
})
export class LoginComponent {
  // protected readonly store = inject(AuthStore);

  // form = inject(FormBuilder).nonNullable.group({
  //   email: ['', [Validators.email, Validators.required]],
  //   te_id: ['TE', [Validators.required, Validators.pattern(/^TE\d{6}$/)]],
  //   password: ['', [Validators.required, Validators.minLength(8)]],
  // });

  // onSubmit() {
  //   if (!this.form.valid) return;

  //   const formValue = this.form.getRawValue();

  //   const body: LoginUser = {
  //     username: formValue.email,
  //     password: formValue.password,
  //   };
  //   this.store.login(body);
  // }

  protected readonly store = inject(AuthStore);

  private atLeastOneValidator: ValidatorFn = (
    control: AbstractControl
  ): ValidationErrors | null => {
    const email = control.get('email')?.value;
    const te_id = control.get('te_id')?.value;
    return email || te_id ? null : { atLeastOneRequired: true };
  };

  form = inject(FormBuilder).nonNullable.group(
    {
      email: ['', [Validators.email]],
      te_id: ['', [Validators.pattern(/^TE\d{6}$/)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    },
    { validators: [this.atLeastOneValidator] }
  );

  ngOnInit() {
    // Clear the other field when one starts being filled
    this.form.get('email')?.valueChanges.subscribe(value => {
      if (value) this.form.get('te_id')?.reset();
    });

    this.form.get('te_id')?.valueChanges.subscribe(value => {
      if (value) this.form.get('email')?.reset();
    });
  }

  onSubmit() {
    if (!this.form.valid) return;

    const formValue = this.form.getRawValue();
    const body = {
      username: formValue.email || formValue.te_id,
      password: formValue.password,
    };

    this.store.login(body);
  }
}
