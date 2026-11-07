import type { Campaign, CategoryId } from './types';

/**
 * Seed campaigns used in simulation mode.
 * Prices are working assumptions (marketPrice from retailer listings, Oct 2026);
 * images are retailer packshots for internal simulation only — replace with supplier assets before launch.
 * Campaign duration is capped at 48h (decision #14).
 */
const h = (hours: number) => Date.now() + hours * 3.6e6;

export const CATEGORIES: { id: CategoryId | 'all'; label: string }[] = [
  { id: 'all', label: 'الكل' },
  { id: 'baby', label: 'الأطفال' },
  { id: 'cleaning', label: 'المنظفات' },
  { id: 'home', label: 'المنزل' },
  { id: 'tissue', label: 'المناديل' },
];

export const SEED_CAMPAIGNS: Campaign[] = [
  { id: 'pampers-4', brand: 'Pampers', name: 'بامبرز حفاضات مقاس 4', shortName: 'بامبرز مقاس 4', pack: 'كرتون 96 حفاضة', category: 'baby',
    image: 'https://lemon.sa/image/cache/catalog/031279064-700x700.jpg', marketPrice: 89.7,
    tiers: [{ minQty: 250, price: 68 }, { minQty: 400, price: 65 }, { minQty: 600, price: 63 }], unitsPerCarton: 96, unitLabel: 'حفاضة', joinedQty: 363, endsAt: h(30.2) },
  { id: 'pampers-5', brand: 'Pampers', name: 'بامبرز راحة متكاملة مقاس 5', shortName: 'بامبرز مقاس 5', pack: 'كرتون 2 × 46 حفاضة', category: 'baby',
    image: 'https://lemon.sa/image/cache/catalog/03148823-700x700.jpg', marketPrice: 134.56,
    tiers: [{ minQty: 300, price: 102 }, { minQty: 500, price: 98 }, { minQty: 800, price: 95 }], unitsPerCarton: 92, unitLabel: 'حفاضة', joinedQty: 212, endsAt: h(11.5) },
  { id: 'pampers-wipes', brand: 'Pampers', name: 'مناديل بامبرز المبللة', shortName: 'مناديل بامبرز المبللة', pack: 'كرتون 12 × 64 منديل', category: 'baby',
    image: 'https://cdn.mafrservices.com/sys-master-root/hba/ha3/50834654232606/511264_main.jpg', marketPrice: 165,
    tiers: [{ minQty: 200, price: 125 }, { minQty: 350, price: 119 }, { minQty: 500, price: 115 }], unitsPerCarton: 12, unitLabel: 'علبة', joinedQty: 88, endsAt: h(41) },
  { id: 'persil', brand: 'Persil', name: 'برسيل جل 2.9 لتر', shortName: 'برسيل جل 2.9 لتر', pack: 'كرتون 4 × 2.9 لتر', category: 'cleaning',
    image: 'https://cdn.mafrservices.com/pim-content/SAU/media/product/649233/1740495603/649233_main.jpg', marketPrice: 123.96,
    tiers: [{ minQty: 300, price: 94 }, { minQty: 500, price: 90 }, { minQty: 800, price: 87 }], unitsPerCarton: 4, unitLabel: 'عبوة', joinedQty: 181, endsAt: h(26) },
  { id: 'fairy', brand: 'Fairy', name: 'فيري ليمون 1.5 لتر', shortName: 'فيري ليمون 1.5 لتر', pack: 'كرتون 6 × 1.5 لتر', category: 'cleaning',
    image: 'https://cdn.mafrservices.com/sys-master-root/hbc/h4e/51126588440606/602787_main.jpg', marketPrice: 187.5,
    tiers: [{ minQty: 200, price: 142 }, { minQty: 350, price: 136 }, { minQty: 500, price: 131 }], unitsPerCarton: 6, unitLabel: 'عبوة', joinedQty: 96, endsAt: h(44) },
  { id: 'clorox', brand: 'Clorox', name: 'كلوركس مبيّض 1.89 لتر', shortName: 'كلوركس 1.89 لتر', pack: 'كرتون 6 × 1.89 لتر', category: 'home',
    image: 'https://cdn.mafrservices.com/sys-master-root/hd6/h0f/12779008032798/83569_main.jpg', marketPrice: 77.94,
    tiers: [{ minQty: 240, price: 59 }, { minQty: 400, price: 56 }, { minQty: 600, price: 54 }], unitsPerCarton: 6, unitLabel: 'عبوة', joinedQty: 140, endsAt: h(18.7) },
  { id: 'fine-kitchen', brand: 'Fine', name: 'فاين ورق مطبخ', shortName: 'فاين ورق مطبخ', pack: 'كرتون 3 × 8 رول', category: 'tissue',
    image: 'https://cdn.mafrservices.com/sys-master-root/h0d/h45/15636987117598/666457_main.jpg', marketPrice: 116.25,
    tiers: [{ minQty: 200, price: 88 }, { minQty: 350, price: 84 }, { minQty: 500, price: 81 }], unitsPerCarton: 24, unitLabel: 'رول', joinedQty: 64, endsAt: h(47) },
  { id: 'fine-facial', brand: 'Fine', name: 'مناديل فاين الناعمة', shortName: 'مناديل فاين الناعمة', pack: 'كرتون 4 × 5 علب', category: 'tissue',
    image: 'https://cdn.mafrservices.com/pim-content/SAU/media/product/744487/1745164803/744487_main.jpg', marketPrice: 89,
    tiers: [{ minQty: 300, price: 67 }, { minQty: 500, price: 64 }, { minQty: 800, price: 62 }], unitsPerCarton: 20, unitLabel: 'علبة', joinedQty: 158, endsAt: h(35) },
];
