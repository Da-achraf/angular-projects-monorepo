import { NgClass } from '@angular/common';
import { Component, computed, input } from '@angular/core';

type Size = ('xs' | 'sm' | 'lg' | 'xl' | '2xl' | '3xl') | string;

@Component({
  selector: 'ba-loading',
  template: `
    @if (loading()) {
      <i
        ngClass="text-{{ size() }}"
        class="fa-solid fa-snowflake text-blue-400 animate-spin"></i>
    }
  `,
  styleUrl: 'loading.component.scss',
  imports: [NgClass],
})
export class LoadingComponent {
  loading = input(true);
  size = input<Size>('lg');
  color = input('');
  classColor = input('primary-200');

  classes = computed(() => {
    return `text-${this.size()} text-${this.classColor()} text-[${this.color()}]`;
  });
}
