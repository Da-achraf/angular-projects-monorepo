import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { InputErrorsComponent, ListErrorsComponent } from "@ba/core/forms";
import { LoginUser } from "../../data-access/auth.model";
import { AuthStore } from "../../data-access/auth.store";

@Component({
    selector: '',
    standalone: true,
    templateUrl: './login.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterLink, ReactiveFormsModule, InputErrorsComponent, ListErrorsComponent]
})
export class LoginComponent {

    readonly #authStore = inject(AuthStore);
    readonly #fb = inject(FormBuilder);


    form = this.#fb.nonNullable.group({
        email: ['', [Validators.email, Validators.required]],
        password: ['', [Validators.required, Validators.minLength(8)]],
    });

    ngOnInit() {
        this.form.statusChanges.subscribe(status => console.log('status: ', status))

    }

    onSubmit() {
        console.log('submitted login form: ', this.form.getRawValue())
        const formValue = this.form.getRawValue()

        const body: LoginUser = { username: formValue.email, password: formValue.password }
        this.#authStore.login(body);
    }
}