import { Component, computed, input } from '@angular/core';

type Size = ('xs' | 'sm' | 'lg' | 'xl' | '2xl' | '3xl') | string;

@Component({
  selector: 'ba-loading',
  template: `
    @if (loading()) {
      <div
        class="h-12 w-12 animate-spin rounded-full border-b-2 border-orange-500"></div>

      <!-- <i
        ngClass="text-{{ size() }}"
        class="fa-solid fa-sun text-orange-400 animate-spin"></i> -->
    }
  `,
  styleUrl: 'loading.component.scss',
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
