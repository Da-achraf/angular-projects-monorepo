import { Pipe, PipeTransform } from '@angular/core';
import { IdeaStatusDisplay, IdeaStatusType } from '../../../core/idea/models/idea-status.model';

@Pipe({
  name: 'ideastatus',
})
export class IdeaStatusDisplayPipe implements PipeTransform {
  
  transform(value: IdeaStatusType): string {
    return IdeaStatusDisplay[value] || value;
  }

}
