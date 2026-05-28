/** Bundled placeholder — never 404s (unlike external Unsplash links). */
export const PLACEHOLDER_PRODUCT = 'assets/placeholder-product.svg';

/** Hero slides — use stable Unsplash IDs; fallback to local SVG on error in component. */
export const HERO_SLIDES = [
  {
    image: 'assets/bannerimg.png',
    title: 'New Collection',
    subtitle: 'Premium Fashion',
    tagline: 'Where fantasy unfolds',
  },
  {
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80',
    title: 'Special Offer',
    subtitle: 'Buy 3 OR MORE ITEMS & Receive 10% OFF',
    tagline: 'Where fantasy unfolds',
  },
  {
    image: 'https://images.unsplash.com/photo-1595777457583-95e059fdfcdc?auto=format&fit=crop&w=1200&q=80',
    title: 'Trending Styles',
    subtitle: 'Premium Mulmul & Silk Sets',
    tagline: 'Elevate your everyday elegance',
  },
] as const;

export function onImageError(event: Event): void {
  const img = event.target as HTMLImageElement | null;
  if (!img || img.src.includes('placeholder-product.svg')) return;
  img.src = PLACEHOLDER_PRODUCT;
}
