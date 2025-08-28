import { NgClass, NgStyle } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { TranslationService } from '@ba/core/data-access';

@Component({
  selector: 'ba-score-card',
  template: `
    <div class="flex min-w-60">
      <div
        class="flex w-full max-w-full flex-col break-words rounded-lg border bg-white text-gray-600 shadow-lg">
        <div class="relative p-3">
          <div
            [ngStyle]="gradientStyle()"
            [ngClass]="{'left-2': isRtl()}"
            class="absolute -mt-10 h-12 w-12 rounded-xl bg-gradient-to-tr text-center text-white shadow-lg">
            <i
              [ngClass]="icon()"
              class="fa-solid absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] transform text-2xl"></i>
          </div>
          <div class="pt-1 text-right">
            <p class="text-sm font-light capitalize">{{ label() }}</p>
            <h4 class="text-2xl font-semibold tracking-tighter xl:text-2xl">
              {{ score() }}
            </h4>
          </div>
        </div>
      </div>
    </div>
  `,
  imports: [NgClass, NgStyle],
})
export class ScoreCardComponent {
  label = input.required<string>();
  score = input.required<number>();
  icon = input.required<string>();
  color = input.required<string>();

  private readonly dir = inject(TranslationService).dir
  protected readonly isRtl = computed(() => this.dir() === 'rtl')

  gradientStyle = computed(() => ({
    backgroundImage: `linear-gradient(to top right, ${this.color()}aa, ${this.color()})`,
  }));
}
