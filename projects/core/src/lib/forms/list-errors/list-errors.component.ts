import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, effect, inject } from '@angular/core';
import { FormErrorsStore } from '../forms-errors.store';

@Component({
  selector: 'ba-list-errors',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (formErrorsStore.errors().length > 0) {
    <ul class="list-container">
        @for (error of formErrorsStore.errors(); track error) {
        <li class="list-item">
            {{ error }}
        </li>
        }
    </ul>
    }
  `,
  host: { 'hostID': crypto.randomUUID().toString() },
  styleUrl: './list-error.component.scss'
})
export class ListErrorsComponent implements OnInit, OnDestroy {
  protected readonly formErrorsStore = inject(FormErrorsStore);

  errorsEffect = effect(() => {
    const errors = this.formErrorsStore.errors()

    console.log('Errors from effect inside ListErrorsComponent: ', errors)
  })

  ngOnInit(): void {
    console.log('initiating ListErrorsComponent, errors: ', this.formErrorsStore.errors())
  }

  ngOnDestroy() {
    console.log('destroying ListErrorsComponent, errors: ', this.formErrorsStore.errors())
    this.formErrorsStore.setErrors({});
  }
}