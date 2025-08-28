import { NgClass } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { LoadingComponent } from '../loading/loading.component';

@Component({
  selector: 'ba-button',
  templateUrl: './button.component.html',
  imports: [NgClass, LoadingComponent],
})
export class BaButtonComponent {
  // Inputs
  type = input<'button' | 'submit' | 'reset'>('button');
  label = input<string>('');
  title = input<string>('');
  disabled = input<boolean>(false);
  isLoading = input<boolean>(false);
  icon = input<string | null>(null); // Font Awesome icon class (e.g., "fa fa-check")
  iconPosition = input<'left' | 'right'>('left');
  buttonClass = input<string>('bg-secondary-100 text-white hover:bg-secondary');
  customClass = input<string>('');
  ariaLabel = input<string>(''); // For accessibility

  // Output
  onClick = output<Event>();

  // Computed properties
  isDisabled = computed(() => this.disabled() || this.isLoading());

  buttonClasses = computed(() => {
    const baseClasses = this.buttonClass();
    const customClasses = this.customClass();
    const disabledClasses = this.isDisabled()
      ? 'pointer-events-none select-none opacity-60'
      : '';
    return `${baseClasses} ${customClasses} ${disabledClasses}`;
  });

  shouldShowLeftIcon = computed(() => {
    const icon = this.icon();
    const isLoading = this.isLoading();
    const iconPosition = this.iconPosition();
    return (
      (isLoading && iconPosition === 'left') ||
      (icon && iconPosition === 'left')
    );
  });

  shouldShowRightIcon = computed(() => {
    const icon = this.icon();
    const isLoading = this.isLoading();
    const iconPosition = this.iconPosition();
    return (
      (isLoading && iconPosition === 'right') ||
      (icon && iconPosition === 'right')
    );
  });

  leftIconClasses = computed(() => {
    const icon = this.icon();
    const label = this.label();
    return `${icon} ${label ? 'mr-2' : ''}`;
  });

  rightIconClasses = computed(() => {
    const icon = this.icon();
    const label = this.label();
    return `${icon} ${label ? 'ml-2' : ''}`;
  });
}
