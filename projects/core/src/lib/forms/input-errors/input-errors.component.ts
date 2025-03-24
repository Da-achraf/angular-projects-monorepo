import { KeyValuePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  input,
} from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { ErrorMapperPipe } from './error-mapper.pipe';
import { IsErrorVisibleDirective } from './is-error-visible.directive';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'ba-input-errors',
  standalone: true,
  template: `
    <div *isErrorVisible="control()">
      <ul>
        @for (error of control().errors | keyvalue; track error) {
        <li class="input-error" data-e2e-id="error">
          {{ error.key | errorMapper : error.value }}
        </li>
        }
      </ul>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [KeyValuePipe, ErrorMapperPipe, IsErrorVisibleDirective],
  styleUrl: './input-errors.component.scss',
})
export class InputErrorsComponent {
  readonly control = input.required<AbstractControl>();

  @HostBinding('attr.hostID')
  hostId = uuidv4();
}
