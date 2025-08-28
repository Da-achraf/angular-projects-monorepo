import { NgIf } from '@angular/common';
import {
  Component,
  computed,
  ElementRef,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  signal,
  ViewChild,
} from '@angular/core';
import { fromEvent, Subject } from 'rxjs';
import { debounceTime, filter, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'ba-scanner',
  templateUrl: './scanner.component.html',
  styleUrls: ['./scanner.component.scss'],
  imports: [NgIf],
})
export class ScannerComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  @Output() scanned = new EventEmitter<{ po: string; pn: string }>();

  @ViewChild('poInput', { static: false })
  poInput!: ElementRef<HTMLInputElement>;
  @ViewChild('pnInput', { static: false })
  pnInput!: ElementRef<HTMLInputElement>;

  // Scanner state
  po = signal('');
  pn = signal('');
  activeInputType = signal<'po' | 'pn' | null>(null);
  scannerActive = signal(false);

  // Computed properties
  canProceed = computed(() => this.po() && this.pn());

  ngOnInit(): void {
    this.listenToScanner();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private listenToScanner(): void {
    fromEvent<KeyboardEvent>(document, 'keydown')
      .pipe(
        takeUntil(this.destroy$),
        filter(event => event.key === 'Enter')
      )
      .subscribe(event => {
        this.handleScanComplete(event);
      });

    fromEvent<Event>(document, 'input')
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(100),
        filter(
          event =>
            event.target === this.poInput?.nativeElement ||
            event.target === this.pnInput?.nativeElement
        )
      )
      .subscribe(event => {
        const input = event.target as HTMLInputElement;
        if (input.value.length >= 6 && /^[A-Z0-9-_]+$/i.test(input.value)) {
          this.handleScanComplete(event);
        }
      });
  }

  handleScanComplete(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input) return;

    const value = input.value.trim().toUpperCase();
    if (input === this.poInput.nativeElement) {
      this.po.set(value);
    } else if (input === this.pnInput.nativeElement) {
      this.pn.set(value);
    }
    input.blur();
  }

  onInputFocus(type: 'po' | 'pn'): void {
    this.activeInputType.set(type);
    setTimeout(() => {
      const input = type === 'po' ? this.poInput : this.pnInput;
      input?.nativeElement.focus();
      input?.nativeElement.select();
    });
  }

  onInputBlur(): void {
    // Small delay to allow for scanning completion
    setTimeout(() => {
      this.activeInputType.set(null);
      this.scannerActive.set(false);
    }, 200);
  }

  onProcessOrder(): void {
    if (!this.canProceed()) return;
    this.scanned.emit({ po: this.po(), pn: this.pn() });
    this.clearInputs();
  }

  clearInputs(): void {
    this.po.set('');
    this.pn.set('');
    if (this.poInput) this.poInput.nativeElement.value = '';
    if (this.pnInput) this.pnInput.nativeElement.value = '';
  }

  clearInput(type: 'po' | 'pn'): void {
    if (type === 'po') {
      this.po.set('');
      if (this.poInput) {
        this.poInput.nativeElement.value = '';
      }
    } else if (type === 'pn') {
      this.pn.set('');
      if (this.pnInput) {
        this.pnInput.nativeElement.value = '';
      }
    }
  }

  // Manual input methods
  onManualInput(type: 'po' | 'pn', event: any): void {
    const value = (event.target as HTMLInputElement)?.value || '';
    const cleanValue = value.trim().toUpperCase();

    if (type === 'po') {
      this.po.set(cleanValue);
    } else if (type === 'pn') {
      this.pn.set(cleanValue);
    }
  }

  processOrder() {
    if (this.canProceed()) this.scanned.emit({ pn: this.pn(), po: this.po() });
  }
}
