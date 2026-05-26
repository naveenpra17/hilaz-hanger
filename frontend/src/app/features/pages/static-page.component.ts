import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, tap } from 'rxjs/operators';
import { STATIC_PAGES } from '../../core/content/brand-content';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-static-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page-container-narrow page-section pb-20">
      <a routerLink="/" class="text-sm text-burgundy-600 mb-4 inline-block min-h-[44px] flex items-center">← Home</a>
      <h1 class="font-serif text-2xl sm:text-3xl font-bold text-burgundy-900 mb-6">{{ page()?.title }}</h1>
      <div class="prose prose-sm max-w-none text-gray-700 whitespace-pre-line leading-relaxed">{{ page()?.body }}</div>
    </div>
  `,
})
export class StaticPageComponent {
  private route = inject(ActivatedRoute);
  private seo = inject(SeoService);

  readonly page = toSignal(
    this.route.paramMap.pipe(
      map((p) => {
        const slug = p.get('slug') ?? '';
        return STATIC_PAGES[slug] ?? { title: 'Page not found', description: '', body: 'This page could not be found.' };
      }),
      tap((page) => {
        const slug = this.route.snapshot.paramMap.get('slug') ?? '';
        this.seo.setPage(page.title, page.description || undefined, undefined, `/page/${slug}`);
      })
    ),
    { initialValue: STATIC_PAGES['about'] }
  );

}
