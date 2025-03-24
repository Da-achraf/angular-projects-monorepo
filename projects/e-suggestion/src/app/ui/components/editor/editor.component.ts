import { Component, computed, forwardRef, inject, input } from '@angular/core';
import {
  AbstractControl,
  ControlContainer,
  ControlValueAccessor,
  FormsModule,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  ValidationErrors,
  Validator,
} from '@angular/forms';
import { EditorModule } from 'primeng/editor';
import { LoadingComponent } from '../loading/loading.component';

@Component({
  selector: 'ba-editor',
  templateUrl: 'editor.component.html',
  styleUrl: 'editor.component.scss',
  imports: [EditorModule, ReactiveFormsModule, FormsModule, LoadingComponent],
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true }),
    },
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EditorComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => EditorComponent),
      multi: true,
    },
  ],
})
export class EditorComponent implements ControlValueAccessor, Validator {
  formControlName = input<string | null>(null);
  placeholder = input<string>('');
  readOnly = input<boolean>(false);

  minHeight = input<string | undefined>(undefined);
  maxHeight = input<string | undefined>(undefined);

  editorMinHeight = computed(() =>
    this.readOnly() ? 'auto' : this.minHeight() ? this.minHeight() : '200px'
  );

  editorMaxHeight = computed(() =>
    this.maxHeight() ? this.maxHeight() : '500px'
  );

  // Internal value for the editor
  protected _value: string = '';

  // Placeholders for the callbacks
  private _onChange: (value: any) => void = () => {};
  private _onTouched: () => void = () => {};
  private _onValidatorChange: () => void = () => {};

  // Write value from the form model into the view
  writeValue(value: any): void {
    if (value !== undefined) {
      this._value = value;
    }
  }

  // Register a callback for when the value changes
  registerOnChange(fn: (value: any) => void): void {
    this._onChange = fn;
  }

  // Register a callback for when the control is touched
  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  registerOnValidatorChange(fn: () => void): void {
    this._onValidatorChange = fn;
  }

  // Optional: Set the disabled state of the control
  setDisabledState?(isDisabled: boolean): void {
    // Implement if needed
  }

  // Handle changes from the p-editor component
  onTextChange(event: any): void {
    this._value = event.htmlValue; // Update the internal value with the new HTML content
    this._onChange(this._value); // Notify Angular of the change
    this._onTouched(); // Notify Angular that the control has been touched
    this._onValidatorChange(); // Trigger validation
  }

  validate(control: AbstractControl): ValidationErrors | null {
    const value = control.value;

    /**
     * '<p></p>' is considered a not valid value for the editor because
     *  it's produced when the user types something and deletes it all (empty value)
     *
     * */
    if (!value || value.length === 0 || value === '<p></p>') {
      return { invalidEditorBody: true };
    }

    return null; // Return null if valid
  }
}
