export interface ProductColor {
  name: string;
  hex: string;
}

export interface ProductImage {
  id?: string;
  url: string;
  sortOrder?: number;
  isPrimary?: boolean;
}

export interface ProductVariant {
  id?: string;
  colorName?: string;
  colorHex?: string;
  size: string;
  stockQuantity: number;
  priceOverride?: number;
}

export interface Product {
  id: string;
  name: string;
  brand?: string;
  slug: string;
  description?: string;
  fabric?: string;
  colorInfo?: string;
  price: number;
  compareAtPrice?: number;
  categoryId?: string;
  categoryName?: string;
  active: boolean;
  expressShipping?: boolean;
  labels: string[];
  sizes: string[];
  colors: ProductColor[];
  images: ProductImage[];
  variants?: ProductVariant[];
  ratingAvg?: number;
  reviewCount?: number;
  createdAt?: string;
  totalStock?: number;
  metaTitle?: string;
  metaDescription?: string;
}

export interface ProductPage {
  content: Product[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
