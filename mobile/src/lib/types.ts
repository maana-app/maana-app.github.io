export type CategoryId = 'baby' | 'cleaning' | 'personal' | 'home';

export interface Tier {
  /** Minimum cartons for this price to apply */
  minQty: number;
  /** Price per carton in SAR, VAT inclusive */
  price: number;
}

export interface Campaign {
  id: string;
  brand: string;
  name: string;
  shortName: string;
  pack: string;
  category: CategoryId;
  /** Packshot URL (every campaign must have one) */
  image: string;
  /** Shipping weight of one carton in kg: max(actual, volumetric) from the product study */
  weightKg: number;
  /** For mixed baskets: packshots of what is inside (collage) */
  gallery?: string[];
  /** For mixed baskets: what is inside */
  contents?: string;
  /** Reference market price per carton (SAR) */
  marketPrice: number;
  /** Ascending minQty; tiers[0] is the minimum to succeed */
  tiers: Tier[];
  unitsPerCarton: number;
  unitLabel: string;
  joinedQty: number;
  endsAt: number;
}

export type OrderStatus =
  | 'pending'      // joined, campaign running, amount authorised
  | 'confirmed'    // campaign succeeded, captured at final price
  | 'shipped'
  | 'delivered'
  | 'refunded';    // campaign failed or cancelled

export type PaymentMethod = 'apple_pay' | 'mada' | 'stc_pay' | 'card';

export interface Order {
  id: string;
  campaignId: string;
  qty: number;
  unitPrice: number;
  deliveryFee: number;
  total: number;
  payment: PaymentMethod;
  status: OrderStatus;
  createdAt: number;
}

export interface Profile {
  phone: string;
  name: string;
  addressLabel: string;
  nationalAddress: string;
}
