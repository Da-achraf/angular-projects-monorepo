import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filesize',
  standalone: true,
})
export class FileSizePipe implements PipeTransform {
  transform(bytes: number, decimals: number = 2): string {
    const k = 1024; // 1 KB = 1024 Bytes
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k)); // Calculate the unit index

    // Format the size with the appropriate unit
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${
      sizes[i]
    }`;
  }
}
