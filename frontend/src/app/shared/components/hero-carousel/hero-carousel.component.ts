import { Component, signal, OnDestroy, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HERO_SLIDES, onImageError } from '../../../core/constants/media-urls';

interface Slide {
  image: string;
  title: string;
  subtitle: string;
  tagline: string;
}

@Component({
  selector: 'app-hero-carousel',
  standalone: true,
  imports: [RouterLink, NgClass],
  template: `
    <div class="relative mt-3 sm:mt-4 page-container rounded-xl sm:rounded-2xl overflow-hidden shadow-carousel">
      <div class="aspect-[4/3] sm:aspect-[5/3] md:aspect-[16/9] lg:aspect-[21/9] relative">
        <img
          [src]="slides[current()].image"
          [alt]="slides[current()].title"
          class="w-full h-full object-cover"
          (error)="onImageError($event)"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
        <div class="absolute bottom-0 left-0 right-0 p-5 text-white">
          <p class="text-gold text-xs font-semibold tracking-wider uppercase">{{ slides[current()].title }}</p>
          <h2 class="font-serif text-xl sm:text-2xl font-bold mt-1">{{ slides[current()].subtitle }}</h2>
          <p class="text-sm text-white/90 italic mt-1">{{ slides[current()].tagline }}</p>
          <a routerLink="/shop" class="inline-block mt-3 text-sm font-semibold underline hover:text-gold">Shop Now →</a>
        </div>
        <span class="absolute top-3 right-3 bg-black/40 text-white text-xs px-2 py-1 rounded-full">
          {{ String(current() + 1).padStart(2, '0') }} / {{ String(slides.length).padStart(2, '0') }}
        </span>
        <button type="button" class="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/30 backdrop-blur flex items-center justify-center text-white" (click)="prev()">‹</button>
        <button type="button" class="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/30 backdrop-blur flex items-center justify-center text-white" (click)="next()">›</button>
        <div class="absolute bottom-16 left-0 right-0 flex justify-center gap-1.5">
          @for (s of slides; track $index) {
            <button
              type="button"
              class="w-2 h-2 rounded-full transition-colors"
              [ngClass]="$index === current() ? 'bg-white' : 'bg-white/40'"
              (click)="current.set($index)"
              [attr.aria-label]="'Slide ' + ($index + 1)"
            ></button>
          }
        </div>
      </div>
    </div>
  `,
})
export class HeroCarouselComponent implements OnInit, OnDestroy {
  readonly String = String;
  readonly onImageError = onImageError;
  readonly slides: Slide[] = [...HERO_SLIDES];
  readonly current = signal(0);
  private timer?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.timer = setInterval(() => this.next(), 5000);
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  next(): void {
    this.current.update((i) => (i + 1) % this.slides.length);
  }

  prev(): void {
    this.current.update((i) => (i - 1 + this.slides.length) % this.slides.length);
  }
}
