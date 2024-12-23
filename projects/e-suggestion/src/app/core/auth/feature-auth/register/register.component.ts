import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { InputErrorsComponent, ListErrorsComponent } from "@ba/core/forms";
import { AuthStore } from "../../data-access/auth.store";

@Component({
    selector: 'app-register',
    standalone: true,
    templateUrl: './register.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterLink, ReactiveFormsModule, ListErrorsComponent, InputErrorsComponent]
})
export class RegisterComponent {

    readonly #authStore = inject(AuthStore);
    readonly #fb = inject(FormBuilder);

    form = this.#fb.nonNullable.group({
        first_name: ['', Validators.required],
        last_name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
    });

    onSubmit() {
        this.#authStore.register(this.form.getRawValue());
    }
}