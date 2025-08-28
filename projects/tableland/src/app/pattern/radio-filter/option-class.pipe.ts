import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'optionClass',
  standalone: true,
})
export class FilterOptionClassPipe implements PipeTransform {
  transform(optionValue: string, selectedOption: string | undefined): string {
    const baseClasses =
      'peer-checked:bg-gradient-to-r peer-checked:from-[#FFA500] peer-checked:to-[#FF4500] peer-checked:text-white text-gray-700 p-2 rounded-lg transition duration-150 ease-in-out';
    return selectedOption === optionValue
      ? `${baseClasses} bg-gradient-to-r from-[#FFA500] to-[#FF4500] text-white`
      : baseClasses;
  }
}
