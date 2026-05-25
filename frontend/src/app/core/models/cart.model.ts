export interface CartItem {
  id: string;
  variantId: string;
  productId: string;
  productName: string;
  productSlug: string;
  imageUrl?: string;
  size: string;
  colorName?: string;
  unitPrice: number;
  quantity: number;
  stockQuantity: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}
