import { Component, input, output } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { environment } from 'projects/e-suggestion/src/environments/environment';
import { LoadingComponent } from '../../../ui/components/loading/loading.component';
import { RemoveFilenamePrefixPipe } from '../../../ui/pipes/file-name/file-name-id';
import { FilenameTruncatePipe } from '../../../ui/pipes/file-name/file-name-truncate.pipe';
import { FileSizePipe } from '../../../ui/pipes/file-size.pipe';
import { Attachement } from '../models/attachement.model';
import { TranslatePipe } from '../../../core/translation/translate.pipe';

@Component({
  selector: 'ba-attachment-upload',
  templateUrl: './attachment-upload.component.html',
  styleUrl: './attachment-upload.component.scss',
  imports: [
    FilenameTruncatePipe,
    RemoveFilenamePrefixPipe,
    FileSizePipe,
    MatTooltipModule,
    LoadingComponent,
    TranslatePipe,
  ],
})
export class AttachmentUploadComponent {
  attachments = input<Attachement[]>();
  viewOnly = input(false);

  isDeletingAttachment = input(false);

  filesChanged = output<File[]>();
  files: any[] = [];

  delete = output<number>();

  // Handle file selection
  onFileSelected(event: any) {
    const selectedFiles = event.target.files;
    this.processFiles(selectedFiles);
  }

  // Handle file drop
  onDrop(event: DragEvent) {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files) {
      this.processFiles(files);
    }
  }

  // Prevent default behavior for drag over
  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  deleteFile(index: number) {
    this.files.splice(index, 1);
    this.emitFilesChanged();
  }

  viewFile(file: File) {
    const fileURL = URL.createObjectURL(file);
    window.open(fileURL, '_blank');

    // Clean up the URL after opening
    setTimeout(() => {
      URL.revokeObjectURL(fileURL);
    }, 100);
  }

  viewAttachment(filePath: string) {
    window.open(`${environment.apiUrl}/${filePath}`, '_blank');
  }

  // Process selected or dropped files
  processFiles(files: FileList) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      this.files.push({
        name: file.name,
        file: file,
        size: (file.size / 1024).toFixed(2), // Convert to KB
        progress: 0,
      });
    }

    // Emit the list of files to the parent component
    this.emitFilesChanged();
  }

  private emitFilesChanged() {
    this.filesChanged.emit(this.files.map(f => f.file));
  }
}
