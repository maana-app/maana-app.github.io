import type { Campaign, Tier } from './types';

/** Business rule #5: 26 SAR first carton, 12 SAR each additional (customer-facing). */
export const DELIVERY_FIRST = 26;
export const DELIVERY_EXTRA = 12;

export const deliveryFee = (qty: number) => (qty <= 0 ? 0 : DELIVERY_FIRST + DELIVERY_EXTRA * (qty - 1));

export const currentTier = (c: Campaign, extra = 0): Tier => {
  const q = c.joinedQty + extra;
  let t = c.tiers[0];
  for (const tier of c.tiers) if (q >= tier.minQty) t = tier;
  return t;
};

/** Price shown before the campaign reaches its minimum is the first tier price. */
export const currentPrice = (c: Campaign, extra = 0) => currentTier(c, extra).price;

export const nextTier = (c: Campaign, extra = 0): Tier | null => {
  const q = c.joinedQty + extra;
  return c.tiers.find(t => t.minQty > q) ?? null;
};

export const lowestPrice = (c: Campaign) => c.tiers[c.tiers.length - 1].price;

export const discountPct = (c: Campaign, price = currentPrice(c)) => Math.round((1 - price / c.marketPrice) * 100);

export const unitPrice = (cartonPrice: number, c: Campaign) => cartonPrice / c.unitsPerCarton;

export const progress = (c: Campaign) => Math.min(1, c.joinedQty / c.tiers[0].minQty);

export const formatSAR = (n: number) => {
  const r = Math.round(n * 100) / 100;
  return Number.isInteger(r) ? String(r) : r.toFixed(2);
};

export const timeLeft = (endsAt: number, now = Date.now()) => {
  const ms = Math.max(0, endsAt - now);
  const h = Math.floor(ms / 3.6e6);
  const m = Math.floor((ms % 3.6e6) / 6e4);
  const s = Math.floor((ms % 6e4) / 1e3);
  const pad = (x: number) => String(x).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
};
