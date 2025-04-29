// progress.component.ts
import { Component, computed, input, model } from '@angular/core';
import { TranslatePipe } from 'projects/e-suggestion/src/app/core/translation/translate.pipe';

@Component({
  selector: 'ba-progress',
  templateUrl: './progress.component.html',
  styleUrl: './progress.component.scss',
  imports: [TranslatePipe],
})
export class ProgressComponent {
  // Model for two-way binding
  value = model(0);

  // Input signals
  min = input(0);
  max = input(100);
  disabled = input(false);

  // Computed values
  displayValue = computed(() => {
    const val = this.value();
    return Math.max(this.min(), Math.min(val, this.max()));
  });

  displayPercentage = computed(() => {
    const range = this.max() - this.min();
    return ((this.displayValue() - this.min()) / range) * 100;
  });

  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.value.set(Number(input.value));
  }
}
