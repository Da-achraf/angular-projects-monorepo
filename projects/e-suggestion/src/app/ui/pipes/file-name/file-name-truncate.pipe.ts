import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filenameTruncate',
  standalone: true,
})
export class FilenameTruncatePipe implements PipeTransform {
  transform(filename: string | undefined, maxLength: number = 30): string {
    if (!filename) {
      return 'NA';
    }

    if (filename.length <= maxLength) {
      return filename;
    }

    // Proceed with the original truncation logic
    const extension =
      filename.lastIndexOf('.') > -1
        ? filename.slice(filename.lastIndexOf('.'))
        : '';

    const nameWithoutExt = filename.slice(0, filename.lastIndexOf('.'));
    const truncateLength = maxLength - extension.length - 3; // 3 for the ellipsis

    if (truncateLength <= 0) {
      return filename; // If maxLength is too small, return the filename without the first ID
    }

    const start = Math.ceil(truncateLength / 2);
    const end = Math.floor(truncateLength / 2);

    return `${nameWithoutExt.slice(0, start)}...${nameWithoutExt.slice(
      -end
    )}${extension}`;
  }
}
