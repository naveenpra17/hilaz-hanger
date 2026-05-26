import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    fbq?: FbqFn;
    _fbq?: FbqFn;
  }
}

interface FbqFn {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  loaded?: boolean;
  version?: string;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private gaReady = false;
  private pixelReady = false;

  constructor(private router: Router) {}

  init(): void {
    this.initGa();
    this.initMetaPixel();
  }

  event(name: string, params?: Record<string, string | number>): void {
    window.gtag?.('event', name, params);
    window.fbq?.('trackCustom', name, params);
  }

  trackPurchase(value: number, currency = 'INR'): void {
    window.fbq?.('track', 'Purchase', { value, currency });
    window.gtag?.('event', 'purchase', { value, currency });
  }

  private initGa(): void {
    const id = environment.gaMeasurementId;
    if (!id || this.gaReady) return;
    this.gaReady = true;

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer ?? [];
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    };
    window.gtag('js', new Date());
    window.gtag('config', id, { send_page_view: false });

    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe((e) => {
      window.gtag?.('event', 'page_view', { page_path: (e as NavigationEnd).urlAfterRedirects });
    });
  }

  private initMetaPixel(): void {
    const pixelId = environment.metaPixelId;
    if (!pixelId || this.pixelReady) return;
    this.pixelReady = true;

    const fbq: FbqFn = function (...args: unknown[]) {
      if (fbq.callMethod) {
        fbq.callMethod(...args);
      } else {
        fbq.queue.push(args);
      }
    };
    fbq.queue = [];
    fbq.loaded = true;
    fbq.version = '2.0';
    window.fbq = fbq;
    if (!window._fbq) window._fbq = fbq;

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(script);

    window.fbq('init', pixelId);
    window.fbq('track', 'PageView');

    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
      window.fbq?.('track', 'PageView');
    });
  }
}
