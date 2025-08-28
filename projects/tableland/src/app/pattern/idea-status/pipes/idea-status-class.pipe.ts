import { Pipe, PipeTransform } from '@angular/core';
import {
  IdeaStatus,
  IdeaStatusType,
} from '../../../core/idea/models/idea-status.model';

@Pipe({
  name: 'ideaStatusClasses',
})
export class IdeaStatusClassPipe implements PipeTransform {
  transform(value: IdeaStatusType): string {
    switch (value) {
      case IdeaStatus.CREATED:
        return 'bg-blue-100 text-blue-800 shadow-blue-600';
      case IdeaStatus.REJECTED:
        return 'bg-red-100 text-red-800 shadow-red-600';
      case IdeaStatus.APPROVED:
        return 'bg-green-100 text-green-800 shadow-green-600';
      case IdeaStatus.ASSIGNED:
        return 'bg-cyan-100 text-cyan-800 shadow-cyan-600';
      case IdeaStatus.IN_PROGRESS:
        return 'bg-orange-100 text-orange-800 shadow-orange-600';
      case IdeaStatus.IMPLEMENTED:
        return 'bg-lime-100 text-lime-800 shadow-lime-600';
      case IdeaStatus.OVERDUE:
        return 'bg-yellow-100 text-yellow-800 shadow-yellow-600';
      case IdeaStatus.CLOSED:
        return 'bg-teal-100 text-teal-800 shadow-teal-600';
      default:
        return 'bg-gray-100 text-gray-800 shadow-gray-600'; // Fallback class for unknown statuses
    }
  }
}
