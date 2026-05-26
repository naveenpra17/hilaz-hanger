export interface Coupon {
  id: string;
  code: string;
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number;
  minOrderAmount?: number;
  maxUses?: number;
  usedCount: number;
  active: boolean;
  expiresAt?: string;
}

export interface ValidateCouponResponse {
  valid: boolean;
  message: string;
  discountAmount: number;
  discountType?: string;
  discountValue?: number;
}
