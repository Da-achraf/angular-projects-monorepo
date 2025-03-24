import { Component, inject, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EditorComponent } from 'projects/e-suggestion/src/app/ui/components/editor/editor.component';
import { BaButtonComponent } from 'projects/e-suggestion/src/app/ui/components/button/button.component';

@Component({
  selector: 'ba-add-comment',
  standalone: true,
  templateUrl: './add-comment.component.html',
  imports: [EditorComponent, ReactiveFormsModule, BaButtonComponent],
})
export class AddCommentComponent {
  body = output<string>();

  protected form = inject(FormBuilder).group({
    comment: ['', [Validators.required]],
  });

  protected onSumit() {
    const value = this.form.getRawValue().comment;
    if (value) {
      this.body.emit(value);
    }
  }
}
