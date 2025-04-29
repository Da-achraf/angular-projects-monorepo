import { NgClass } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import {
  ControlContainer,
  FormControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { InputErrorsComponent } from '@ba/core/forms';
import { TranslatePipe } from '../../../core/translation/translate.pipe';

type InputType = 'text' | 'password';

@Component({
  selector: 'ba-password',
  template: `
    <div class="flex flex-col">
      <div
        class="flex items-center overflow-hidden rounded-md border-2 bg-white text-sm shadow transition focus-within:border-primary-200">
        <input
          [type]="inputType()"
          [formControl]="control()"
          [placeholder]="'password-placeholder' | translate"
          class="w-full appearance-none border-none border-gray-300 bg-white px-0 py-3 text-base text-gray-700 placeholder-gray-400 outline-none focus:outline-none" />
        <button
          class="group flex h-full items-center bg-white px-2 py-1 focus-within:outline-none">
          <button
            (click)="onEnter($event)"
            (keydown.enter)="onEnter($event)"
            [ngClass]="icon()"
            class="fa-solid rounded-lg p-2 text-gray-400 transition-all duration-300 focus-within:outline-none hover:cursor-pointer hover:bg-gray-50 group-focus-within:bg-gray-100"></button>
        </button>
      </div>
      <ba-input-errors [control]="control()" />
    </div>
  `,
  styles: [
    `
      input {
        @apply w-full appearance-none border-none border-gray-300 bg-white px-4 py-3 text-base text-gray-700 placeholder-gray-400 outline-none focus:outline-none;
      }
    `,
  ],
  imports: [InputErrorsComponent, ReactiveFormsModule, NgClass, TranslatePipe],
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true }),
    },
  ],
})
export class PasswordFieldComponent {
  control = input.required<FormControl>();

  protected inputType = signal<InputType>('password');
  protected icon = computed(() =>
    this.inputType() === 'password' ? 'fa-eye' : 'fa-eye-slash'
  );

  protected onEnter(ev: Event) {
    ev.preventDefault();
    ev.stopPropagation();
    ev.stopImmediatePropagation();

    this.toggleInputType();
  }

  private toggleInputType() {
    this.inputType.update(v => (v === 'password' ? 'text' : 'password'));
  }
}
