import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ImageUploadResponse {
  url: string;
  publicId: string;
  width: number;
  height: number;
}

@Injectable({ providedIn: 'root' })
export class UploadService {
  private readonly api = `${environment.apiUrl}/admin/upload/image`;

  constructor(private http: HttpClient) {}

  uploadProductImage(file: File): Observable<ImageUploadResponse> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<ImageUploadResponse>(this.api, form);
  }
}
