import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Product } from '../models/product.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly siteName = 'Hilaz Hanger';
  private readonly siteUrl = environment.siteUrl ?? 'https://hilaz-hanger.vercel.app';

  setDefault(): void {
    this.setPage(
      `${this.siteName} — Premium Fashion`,
      "Hilaz Hanger — Where fantasy unfolds. Premium women's fashion in Coimbatore."
    );
  }

  setPage(pageTitle: string, description?: string, imageUrl?: string, canonicalPath?: string): void {
    this.title.setTitle(pageTitle);
    if (description) {
      this.meta.updateTag({ name: 'description', content: description });
      this.meta.updateTag({ property: 'og:description', content: description });
    }
    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({ property: 'og:site_name', content: this.siteName });
    if (imageUrl) {
      this.meta.updateTag({ property: 'og:image', content: imageUrl });
    }
    const url = canonicalPath ? `${this.siteUrl}${canonicalPath}` : this.siteUrl;
    this.meta.updateTag({ property: 'og:url', content: url });
    this.updateCanonical(url);
  }

  setProduct(product: Product): void {
    const title = product.metaTitle?.trim() || `${product.name} | ${this.siteName}`;
    const description =
      product.metaDescription?.trim() ||
      (product.description?.slice(0, 160) ?? `Shop ${product.name} at Hilaz Hanger.`);
    const image = product.images?.[0]?.url;
    this.setPage(title, description, image, `/product/${product.slug}`);
    this.setJsonLd({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description,
      image: image ? [image] : undefined,
      offers: {
        '@type': 'Offer',
        priceCurrency: 'INR',
        price: product.price,
        availability: product.totalStock && product.totalStock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      },
    });
  }

  private updateCanonical(url: string): void {
    let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  private setJsonLd(data: object): void {
    const id = 'product-jsonld';
    let script = document.getElementById(id) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = id;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(data);
  }
}
