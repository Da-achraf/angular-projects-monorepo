import { NgClass } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import {
  ControlContainer,
  FormControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { InputErrorsComponent } from '@ba/core/forms';

type InputType = 'text' | 'password';

@Component({
  selector: 'ba-password',
  template: `
    <div class="flex flex-col">
      <div
        class="text-sm flex items-center overflow-hidden shadow rounded-md border-2 bg-white transition focus-within:border-primary-200"
      >
        <input
          [type]="inputType()"
          [formControl]="control()"
          placeholder="Password (minimum 8 characters)"
          class="w-full border-none outline-none appearance-none border-gray-300 bg-white py-3 px-0 text-base text-gray-700 placeholder-gray-400 focus:outline-none"
        />
        <button
          class="flex items-center bg-white h-full py-1 px-2 focus-within:outline-none group"
        >
          <button
            (click)="onEnter($event)"
            (keydown.enter)="onEnter($event)"
            [ngClass]="icon()"
            class="text-gray-400 rounded-lg fa-solid p-2 transition-all focus-within:outline-none duration-300 group-focus-within:bg-gray-100 hover:bg-gray-50 hover:cursor-pointer"
          ></button>
        </button>
      </div>
      <ba-input-errors [control]="control()" />
    </div>
  `,
  styles: [
    `
      input {
        @apply w-full border-none outline-none appearance-none border-gray-300 bg-white py-3 px-4 text-base text-gray-700 placeholder-gray-400 focus:outline-none;
      }
    `,
  ],
  imports: [InputErrorsComponent, ReactiveFormsModule, NgClass],
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
    this.inputType.update((v) => (v === 'password' ? 'text' : 'password'));
  }
}
