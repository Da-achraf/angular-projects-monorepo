import { Component, input } from '@angular/core';

@Component({
  selector: 'ba-teoa-review-not-initialized',
  template: `
    <div class="flex flex-col items-center py-10 gap-y-4">
      <div class="relative">
        <img src="blob.png" width="100" class="z-0" />
        <div
          class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
        >
          <i class="fa-regular fa-clipboard text-[3rem] text-gray-400"></i>
        </div>
      </div>

      <div class="text-center">
        <p class="mb-1 font-bold">The TEOA review is not initialized yet!</p>
        @if (isTeoa()) {
          <p class="text-gray-500">
            Please initiate the review in order to add data
          </p>
        }
      </div>
    </div>
  `,
})
export class TeoaReviewNotInitializedComponent {
  isTeoa = input(false);
}
