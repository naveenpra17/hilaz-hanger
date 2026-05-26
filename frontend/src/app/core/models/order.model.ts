export type OrderSource = 'WEBSITE' | 'WHATSAPP' | 'PHONE' | 'INSTAGRAM' | 'WALKIN' | 'FRIEND' | 'OTHER';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'ONGOING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type PaymentStatus = 'UNPAID' | 'PAID' | 'REFUNDED';

export interface OrderItem {
  id?: string;
  productId?: string;
  variantId?: string;
  productName: string;
  size?: string;
  colorName?: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  imageUrl?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  orderSource: OrderSource;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  subtotal: number;
  shippingPrice: number;
  discount: number;
  total: number;
  shippingStreet: string;
  shippingCity: string;
  shippingPincode: string;
  notes?: string;
  paid: boolean;
  delivered: boolean;
  couponCode?: string;
  items: OrderItem[];
  createdAt: string;
}

export interface CheckoutRequest {
  items: { variantId: string; quantity: number }[];
  shippingStreet: string;
  shippingCity: string;
  shippingPincode: string;
  shippingPrice: number;
  discount: number;
  couponCode?: string;
  paymentMethod: string;
  notes?: string;
}

export interface CheckoutResponse {
  order: Order;
  razorpayOrderId?: string;
  razorpayKeyId?: string;
  amountPaise?: number;
  requiresPayment: boolean;
}

export interface VerifyPaymentRequest {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface CreateOfflineOrderRequest {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  orderSource: OrderSource;
  items: { variantId: string; quantity: number }[];
  shippingStreet: string;
  shippingCity: string;
  shippingPincode: string;
  shippingPrice: number;
  discount: number;
  paymentMethod: string;
  paid: boolean;
  delivered: boolean;
  notes?: string;
}

export interface DashboardStats {
  totalOrders: number;
  monthlyOrders: { label: string; count: number }[];
  orderStatusBreakdown: { status: string; count: number }[];
  paymentStatusBreakdown: { status: string; count: number }[];
  topCustomers: { name: string; revenue: number }[];
  recentOrders: Order[];
}
