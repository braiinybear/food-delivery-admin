export type DiscountType = "PERCENTAGE" | "FLAT";

export interface CreateCouponPayload {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  maxDiscount: number;
  minOrder: number;
  usageLimit: number;
  perUserLimit: number;
  validFrom: string;
  validTo: string;
}

// 🎟️ Coupon (response)
export interface Coupon {
  id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  maxDiscount: number;
  minOrder: number;
  usageLimit: number;
  perUserLimit: number;
  timesUsed: number;

  validFrom: string;
  validTo: string;

  isActive: boolean;
  createdAt: string;
}

export type GetCouponsResponse = Coupon[];