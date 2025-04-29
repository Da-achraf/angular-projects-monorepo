import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'ba-logo',
  template: `
    <img
      class="cursor-pointer"
      [routerLink]="['/home']"
      [height]="height()"
      [width]="width()"
      [src]="src()" />

    <!-- <div class="flex items-center gap-x-5 w-fit" [ngClass]="containerClasses()">
      <a
        [routerLink]="['/home']"
        class="flex cursor-pointer text-nowrap items-center whitespace-nowrap text-2xl font-black"
        [ngClass]="anchorClasses()"
      >
        <i class="fa-solid fa-lightbulb mr-1 rotate-180 text-xl"></i>
        Goo<span class="font-black" [ngClass]="labelClasses()">dI</span>deas
      </a>
    </div> -->
  `,
  imports: [RouterLink],
  styles: [
    `
      :host {
        display: block;
        width: fit-content;
      }
    `,
  ],
})
export class LogoComponent {
  height = input(50);
  width = input(180);
  type = input<'dark' | 'light'>('dark');
  src = computed(() =>
    this.type() === 'dark' ? 'logo-dark.png' : 'logo-light.png'
  );

  // bg = input<'light' | 'dark'>('light');
  // protected readonly anchorClasses = computed(() =>
  //   this.bg() === 'light' ? 'text-primary' : 'text-gray-200'
  // );
  // protected readonly labelClasses = computed(() =>
  //   this.bg() === 'light' ? 'text-orange-500' : 'text-orange-400'
  // );
  // protected readonly containerClasses = computed(() =>
  //   this.bg() === 'light' ? '' : 'bg-primary'
  // );
}
