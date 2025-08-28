import { Pipe, PipeTransform } from '@angular/core';
import {
  IdeaStatus,
  IdeaStatusType,
} from '../../../core/idea/models/idea-status.model';

@Pipe({
  name: 'ideaStatusIcon',
})
export class IdeaStatusIconPipe implements PipeTransform {
  transform(status: IdeaStatusType): string {
    switch (status) {
      case IdeaStatus.CREATED:
        return 'fa-clipboard-check';
      case IdeaStatus.REJECTED:
        return 'fa-circle-xmark';
      case IdeaStatus.APPROVED:
        return 'fa-circle-check';
      case IdeaStatus.ASSIGNED:
        return 'fa-bookmark';
      case IdeaStatus.IN_PROGRESS:
        return 'fa-spinner';
      case IdeaStatus.IMPLEMENTED:
        return 'fa-leaf';
      case IdeaStatus.OVERDUE:
        return 'fa-hourglass-half';
      case IdeaStatus.CLOSED:
        return 'fa-lock';
      default:
        return 'fa-question-circle'; // Fallback icon
    }
  }
}
