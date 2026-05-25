import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Category } from '../models/category.model';

const FALLBACK_CATEGORIES: Category[] = [
  { id: '1', name: 'Dresses', slug: 'dresses' },
  { id: '2', name: 'Tops', slug: 'tops' },
  { id: '3', name: 'Bottoms', slug: 'bottoms' },
  { id: '4', name: 'Sets', slug: 'sets' },
];

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly api = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) {}

  getCategories(): Observable<Category[]> {
    if (environment.useMock) {
      return of(FALLBACK_CATEGORIES);
    }
    return this.http.get<Category[]>(this.api).pipe(
      map((list) => list.map((c) => ({ ...c, id: String(c.id) }))),
      catchError(() => of(FALLBACK_CATEGORIES))
    );
  }
}
