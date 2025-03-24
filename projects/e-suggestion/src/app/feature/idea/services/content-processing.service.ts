import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_URL } from '@ba/core/http-client';
import { lastValueFrom, Observable } from 'rxjs';

@Injectable()
export class ContentProcessingService {
  private readonly http = inject(HttpClient);
  private readonly url = inject(API_URL);

  // Extracts images from HTML content
  extractImagesFromHtml(html: string): { type: string; data: string }[] {
    const imagePattern = /<img src="data:image\/(.*?);base64,(.*?)"/g;
    const images: { type: string; data: string }[] = [];
    let match;
    while ((match = imagePattern.exec(html)) !== null) {
      const [, type, data] = match;
      images.push({ type, data });
    }
    return images;
  }

  // Uploads an image to the server and returns the public URL
  uploadImage(base64Data: string): Observable<{ url: string }> {
    return this.http.post<{ url: string }>(`${this.url}/images/upload-image`, {
      image: base64Data,
    });
  }

  // Replaces base64 src attributes in HTML content with public URLs
  async replaceImagesInHtml(html: string): Promise<string> {
    const images = this.extractImagesFromHtml(html);
    for (const image of images) {
      const base64Str = `data:image/${image.type};base64,${image.data}`;
      const response = await lastValueFrom(this.uploadImage(base64Str));
      html = html.replace(base64Str, response.url);
    }
    return html;
  }

  // Validates an image (e.g., checks size, format)
  validateImage(base64Data: string): boolean {
    // Add validation logic here (e.g., check file size, format)
    return true; // Placeholder
  }

  // Deletes an image from the server
  deleteImage(imageUrl: string): Observable<void> {
    return this.http.delete<void>(
      `${this.url}/images/delete-image?url=${encodeURIComponent(imageUrl)}`
    );
  }
}
