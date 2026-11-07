export type CategoryId = 'baby' | 'cleaning' | 'home' | 'tissue';

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
  image: string;
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
