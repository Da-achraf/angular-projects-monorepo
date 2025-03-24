import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  OnDestroy,
  inject,
} from '@angular/core';
import { FormErrorsStore } from '../forms-errors.store';
import { v4 as uuidv4 } from 'uuid';

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
  styleUrl: './list-error.component.scss',
})
export class ListErrorsComponent implements OnDestroy {
  protected readonly formErrorsStore = inject(FormErrorsStore);

  @HostBinding('attr.hostID') // <-- Add HostBinding
  hostId = uuidv4();

  ngOnDestroy() {
    this.formErrorsStore.setErrors({});
  }
}
