// bom-row.component.ts
import {
  Component,
  ElementRef,
  effect,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ba/core/data-access';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { BaButtonComponent } from 'projects/e-suggestion/src/app/ui/components/button/button.component';

@Component({
  selector: 'ba-bom-row',
  imports: [
    FormsModule,
    InputTextModule,
    ButtonModule,
    BaButtonComponent,
    TranslatePipe,
  ],
  templateUrl: 'bom-row.component.html',
  styles: [
    `
      /* Custom focus styles */
      .p-inputtext:enabled:focus {
        box-shadow: 0 0 0 0.2rem rgba(59, 130, 246, 0.2);
        border-color: #3b82f6;
      }

      /* Disabled state */
      .p-inputtext:disabled {
        background-color: #f3f4f6;
        opacity: 0.7;
      }
    `,
  ],
})
export class BomRowComponent {
  bomItem = input<any>();
  isActive = input(false);
  isVerified = input(false);
  isScanning = input(false); // New: to show loading state
  threeSCode = input<string | null>(null); // New: to display which 3S was used

  verified = output<{ position: string; s3: string }>();

  position = signal('');
  s3 = signal('');

  positionInput = viewChild<ElementRef<HTMLInputElement>>('positionInput');
  s3Input = viewChild<ElementRef<HTMLInputElement>>('s3Input');

  constructor() {
    effect(() => {
      if (this.isActive()) {
        setTimeout(() => this.positionInput()?.nativeElement.focus(), 100);
      }
    });

    // Reset inputs after successful verification
    effect(() => {
      if (this.isVerified()) {
        this.position.set('');
        this.s3.set('');
      }
    });
  }

  canVerify(): boolean {
    return (
      this.isActive() &&
      !this.isVerified() &&
      !this.isScanning() &&
      this.position().trim() !== '' &&
      this.s3().trim() !== ''
    );
  }

  focus3sInput(): void {
    this.s3Input()?.nativeElement.focus();
  }

  onVerify(): void {
    if (this.canVerify()) {
      this.verified.emit({
        position: this.position().trim(),
        s3: this.s3().trim(),
      });
    }
  }

  onPositionChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.position.set(target.value);
  }

  onS3Change(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.s3.set(target.value);
  }

  // New: Handle barcode scanner input (if needed)
  onPositionKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.focus3sInput();
    }
  }

  onS3KeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.onVerify();
    }
  }

  // New: Clear inputs manually
  clearInputs(): void {
    this.position.set('');
    this.s3.set('');
    setTimeout(() => this.positionInput()?.nativeElement.focus(), 100);
  }
}
