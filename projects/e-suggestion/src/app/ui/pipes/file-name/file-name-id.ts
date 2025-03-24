import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'removeFilenamePrefix',
  standalone: true,
})
export class RemoveFilenamePrefixPipe implements PipeTransform {
  transform(filename: string | undefined): string {
    if (!filename) {
      return 'NA';
    }

    // Remove the first ID (from the beginning to the first dash, including the dash)
    const dashIndex = filename.indexOf('-');
    const nameWithoutFirstId =
      dashIndex > -1 ? filename.slice(dashIndex + 1) : filename;

    return nameWithoutFirstId;
  }
}
