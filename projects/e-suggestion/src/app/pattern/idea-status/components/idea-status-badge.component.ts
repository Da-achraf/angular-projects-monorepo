import { NgClass } from '@angular/common';
import { Component, input } from '@angular/core';
import { IdeaStatusType } from '../../../core/idea/models/idea-status.model';
import { IdeaStatusClassPipe } from '../pipes/idea-status-class.pipe';
import { IdeaStatusIconPipe } from '../pipes/idea-status-icon.pipe';
import { IdeaStatusDisplayPipe } from '../pipes/idea-status.pipe';

@Component({
  selector: 'ba-idea-status',
  template: `
    @if(status(); as status) {
      <span
        class="px-3 py-2 w-fit text-nowrap flex items-center gap-x-2 text-xs font-bold rounded-md shadow cursor-pointer"
        [ngClass]="status | ideaStatusClasses"
      >
        <i [ngClass]="status | ideaStatusIcon" class="fa-solid mr-1"></i>
        {{ status | ideastatus }}
      </span>
    }
  `,
  imports: [
    NgClass,
    IdeaStatusClassPipe,
    IdeaStatusDisplayPipe,
    IdeaStatusIconPipe,
  ],
})
export class IdeaStatusBadgeComponent {
  status = input<IdeaStatusType>();
}
