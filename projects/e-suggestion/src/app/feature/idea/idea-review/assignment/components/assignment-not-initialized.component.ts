import { Component, input } from '@angular/core';
import { TranslatePipe } from 'projects/e-suggestion/src/app/core/translation/translate.pipe';

@Component({
  selector: 'ba-assignment-not-initialized',
  template: `
    <div class="flex flex-col items-center gap-y-4 py-10">
      <div class="relative">
        <img src="blob.png" width="100" class="z-0" />
        <div
          class="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 transform">
          <i class="fa-regular fa-calendar-xmark text-[3rem] text-gray-400"></i>
        </div>
      </div>

      <div class="text-center">
        <p class="mb-1 font-bold">{{ 'assignment-not-started' | translate }}</p>
        @if (isCommittee()) {
          <p class="text-gray-500">
            {{ 'start-assignment-prompt' | translate }}
          </p>
        }
      </div>
    </div>
  `,
  imports: [TranslatePipe],
})
export class AssignmentNotInitializedComponent {
  isCommittee = input(false);
}
