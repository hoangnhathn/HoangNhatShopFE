import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'imagePreview'
})
export class ImagePreviewPipe implements PipeTransform {
  transform(file: File): string {
    return URL.createObjectURL(file);
  }
}
