import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError, timer } from 'rxjs';
import { catchError, delay, map, retry } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Product, ProductPage } from '../models/product.model';
import { MOCK_PRODUCTS } from '../data/mock-products';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly api = `${environment.apiUrl}/products`;
  private readonly useMock = environment.useMock;

  constructor(private http: HttpClient) {}

  getProducts(params: {
    page?: number;
    size?: number;
    search?: string;
    filter?: string;
    sort?: string;
    category?: string;
  } = {}): Observable<ProductPage> {
    if (this.useMock) {
      return of(this.mockPage(params)).pipe(delay(200));
    }
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') httpParams = httpParams.set(k, String(v));
    });
    return this.http.get<ProductPage>(this.api, { params: httpParams }).pipe(
      retry({ count: 2, delay: (_err, i) => timer((i + 1) * 1500) }),
      map((page) => ({
        ...page,
        content: (page.content ?? []).map((p) => this.normalize(p)),
      })),
      catchError((err) => throwError(() => err))
    );
  }

  getRelated(productId: string, limit = 4): Observable<Product[]> {
    return this.http
      .get<Product[]>(`${this.api}/${productId}/related`, { params: { limit: String(limit) } })
      .pipe(map((list) => list.map((p) => this.normalize(p))));
  }

  getBySlug(slug: string): Observable<Product> {
    if (this.useMock) {
      const p = MOCK_PRODUCTS.find((x) => x.slug === slug) ?? MOCK_PRODUCTS[0];
      return of(p).pipe(delay(150));
    }
    return this.http
      .get<Product>(`${this.api}/slug/${slug}`)
      .pipe(map((p) => this.normalize(p)));
  }

  getById(id: string): Observable<Product> {
    if (this.useMock) {
      const p = MOCK_PRODUCTS.find((x) => x.id === id) ?? MOCK_PRODUCTS[0];
      return of(p).pipe(delay(150));
    }
    return this.http.get<Product>(`${this.api}/${id}`).pipe(map((p) => this.normalize(p)));
  }

  create(product: Record<string, unknown>): Observable<Product> {
    return this.http.post<Product>(this.api, product).pipe(map((p) => this.normalize(p)));
  }

  update(id: string, product: Record<string, unknown>): Observable<Product> {
    return this.http.put<Product>(`${this.api}/${id}`, product).pipe(map((p) => this.normalize(p)));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  private normalize(p: Product): Product {
    return {
      ...p,
      id: String(p.id),
      labels: p.labels ?? [],
      sizes: p.sizes ?? [],
      colors: this.parseColors(p.colors),
      images: (p.images ?? []).map((img) => ({
        ...img,
        isPrimary: (img as { isPrimary?: boolean }).isPrimary ?? (img as { primary?: boolean }).primary ?? false,
      })),
      variants: (p.variants ?? []).map((v) => ({ ...v, id: String(v.id) })),
    };
  }

  private parseColors(colors: unknown): Product['colors'] {
    if (!colors) return [];
    if (Array.isArray(colors)) return colors;
    if (typeof colors === 'string') {
      try {
        const parsed = JSON.parse(colors);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  }

  private mockPage(params: {
    page?: number;
    size?: number;
    search?: string;
    filter?: string;
  }): ProductPage {
    let items = [...MOCK_PRODUCTS];
    const search = params.search?.toLowerCase();
    if (search) {
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.brand?.toLowerCase().includes(search)
      );
    }
    if (params.filter === 'low-stock') {
      items = items.filter((p) => (p.totalStock ?? 0) <= 5 && (p.totalStock ?? 0) > 0);
    } else if (params.filter === 'out-of-stock') {
      items = items.filter((p) => (p.totalStock ?? 0) === 0);
    } else if (params.filter === 'active') {
      items = items.filter((p) => p.active);
    } else if (params.filter === 'inactive') {
      items = items.filter((p) => !p.active);
    }
    const size = params.size ?? 10;
    const page = params.page ?? 0;
    const start = page * size;
    return {
      content: items.slice(start, start + size),
      totalElements: items.length,
      totalPages: Math.ceil(items.length / size) || 1,
      number: page,
      size,
    };
  }
}
