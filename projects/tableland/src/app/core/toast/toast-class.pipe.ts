import { Pipe, PipeTransform } from '@angular/core';
import { SeverityMap } from './toast.data';

@Pipe({
  name: 'toastClass',
})
export class ToastClassPipe implements PipeTransform {
  transform(severity: string) {
    return (
      SeverityMap[severity as keyof typeof SeverityMap] || SeverityMap.info
    );
  }
}
