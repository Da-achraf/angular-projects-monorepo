import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_URL, ApiService } from '@ba/core/http-client';
import { lastValueFrom } from 'rxjs';
import { Idea } from '../../../core/idea/models/idea.model';
import { AttachementCreate } from '../models/attachement.model';

@Injectable()
export class AttachementService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${inject(API_URL)}`;
  private readonly apiService = inject(ApiService)

  // async upload(attachment: AttachementCreate) {
  async upload(attachment: AttachementCreate, file: File) {
    const formData = new FormData();
    formData.append('file', file); // Append the file
    formData.append('uploaded_by', attachment.uploaded_by.toString()); // Append the user ID
    return lastValueFrom(
      this.http.post<Idea>(
        `${this.baseUrl}/ideas/${attachment.idea_id}/attachments`,
        formData
      )
    );
  }

  async deleteOne(id: number) {
    return lastValueFrom(this.apiService.delete(`/attachments/${id}`))
  }
}
