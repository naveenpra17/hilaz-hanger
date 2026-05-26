import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { tap } from 'rxjs/operators';

export interface StoreConfig {
  storeName: string;
  phone: string;
  email: string;
  whatsappNumber: string;
  whatsappMessage: string;
  instagramUrl: string;
  address: string;
}

@Injectable({ providedIn: 'root' })
export class StoreConfigService {
  private readonly api = `${environment.apiUrl}/store/config`;
  private readonly configSignal = signal<StoreConfig | null>(environment.store ?? null);

  readonly config = this.configSignal.asReadonly();

  constructor(private http: HttpClient) {
    if (!this.configSignal()) {
      this.load().subscribe();
    }
  }

  load() {
    return this.http.get<StoreConfig>(this.api).pipe(tap((c) => this.configSignal.set(c)));
  }

  whatsappUrl(customMessage?: string): string {
    const c = this.configSignal() ?? environment.store;
    if (!c?.whatsappNumber) return 'https://wa.me';
    const digits = c.whatsappNumber.replace(/\D/g, '');
    const text = encodeURIComponent(customMessage ?? c.whatsappMessage ?? 'Hi Hilaz Hanger!');
    return `https://wa.me/${digits}?text=${text}`;
  }

  instagramUrl(): string {
    return this.configSignal()?.instagramUrl ?? environment.store?.instagramUrl ?? 'https://www.instagram.com/hilazhanger';
  }
}
