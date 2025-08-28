import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_REQUEST_DELAY, ApiResponse, Response } from '@ba/core/data-access';
import { API_URL, ApiService } from '@ba/core/http-client';
import { delay, lastValueFrom, map, Observable, tap } from 'rxjs';
import {
  Idea,
  IdeaCreate,
  IdeaUpdate,
} from '../../../core/idea/models/idea.model';
import { ContentProcessingService } from './content-processing.service';
import { QueryParamType } from '../../../core/api/api.model';

@Injectable()
export class IdeaService {
  readonly #http = inject(HttpClient);
  readonly #url = inject(API_URL);

  readonly #apiService = inject(ApiService);
  readonly #contentService = inject(ContentProcessingService);
  readonly #requestDelay = inject(API_REQUEST_DELAY);

  load(
    page: number,
    pageSize: number,
    queryParams?: QueryParamType
  ): Observable<Response<Idea>> {
    const params = {
      page: page.toString(),
      items_per_page: pageSize.toString(),
      ...queryParams,
    };

    return this.#apiService.get('/ideas', { queryParams: params }).pipe(
      map(resp => resp as Response<Idea>),
      map(resp => ({ ...resp, content: resp.content as Idea[] })),
      map(resp => ({
        ...resp,
        content: resp.content.map(u => ({
          ...u,
          created_at: new Date(u.created_at),
        })),
      })),
      tap(console.log),
      delay(this.#requestDelay)
    );
  }

  loadOne(id: number): Observable<ApiResponse<Idea>> {
    return this.#apiService
      .get(`/ideas/${id}`)
      .pipe(map(resp => resp as ApiResponse<Idea>));
  }

  deleteOne(id: number): Observable<ApiResponse<Idea>> {
    return this.#apiService
      .delete(`/ideas/${id}`)
      .pipe(map(resp => resp as ApiResponse<Idea>));
  }

  delete(ids: number[]): Observable<ApiResponse<Idea>> {
    return this.#apiService
      .batchDelete('/ideas', ids)
      .pipe(map(resp => resp as ApiResponse<Idea>));
  }

  update(ideaBody: Partial<IdeaUpdate>) {
    return this.#apiService
      .put<Idea>(`/ideas/${ideaBody.id}?action=${ideaBody.action}`, ideaBody)
      .pipe(map(resp => resp as ApiResponse<Idea>));
  }

  save(ideaBody: IdeaCreate) {
    return this.#apiService.post<Idea, Partial<Idea>>('/ideas', ideaBody);
  }

  async createIdea(idea: IdeaCreate) {
    // Process images in actual_situation
    idea.actual_situation = await this.#contentService.replaceImagesInHtml(
      idea.actual_situation as string
    );

    // Process images in description
    idea.description = await this.#contentService.replaceImagesInHtml(
      idea.description as string
    );

    // Submit the idea to the backend
    return lastValueFrom(
      this.#http.post<ApiResponse<Idea>>(`${this.#url}/ideas`, idea)
    );
  }

  async updateIdea(idea: Partial<IdeaUpdate>) {
    // Process images in actual_situation
    idea.actual_situation = await this.#contentService.replaceImagesInHtml(
      idea.actual_situation as string
    );

    // Process images in description
    idea.description = await this.#contentService.replaceImagesInHtml(
      idea.description as string
    );

    // Submit the idea to the backend
    return lastValueFrom(
      this.#http.put<ApiResponse<Idea>>(
        `${this.#url}/ideas/${idea.id}?action=${idea.action}`,
        idea
      )
    );
  }
}
