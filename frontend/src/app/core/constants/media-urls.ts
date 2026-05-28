/** Bundled placeholder — never 404s (unlike external Unsplash links). */
export const PLACEHOLDER_PRODUCT = 'assets/placeholder-product.svg';

/** Hero slides — use stable Unsplash IDs; fallback to local SVG on error in component. */
export const HERO_SLIDES = [
  {
    image: 'assets/bannerimg.png',
    title: 'New Collection',
    subtitle: 'Premium Fashion',
    tagline: 'Where fantasy unfolds',
  }
] as const;

export function onImageError(event: Event): void {
  const img = event.target as HTMLImageElement | null;
  if (!img || img.src.includes('placeholder-product.svg')) return;
  img.src = PLACEHOLDER_PRODUCT;
}
