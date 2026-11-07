import { BREAK_EVEN_MARKET, DELIVERY_FIRST, MAX_ORDER_KG } from './pricing';
import type { Campaign, CategoryId } from './types';

/**
 * Catalogue built from the product study (doc 22, Nov 2026 price survey).
 *
 * Pricing (study rule): the customer pays shelf price − 15 %, delivery included.
 * The app shows delivery as its own line (rule #3), so the carton price is
 *   price = 0.85 × market − 26   →   price + 26 delivery = 0.85 × market.
 *
 * Pack size (the "formula"): one sellable carton = the smallest multiple of the
 * shelf pack worth ≥ 112 SAR at market price (break-even in the study), and it
 * must stay ≤ 10 kg chargeable weight (carrier requirement).
 *   n = ceil(112 / shelf)   and   n × weight ≤ 10 kg
 * If no n satisfies both, the product loses money on its own and is listed in
 * BASKET_ONLY: it can only ship inside a mixed basket that stays under 10 kg.
 *
 * Images: empty until supplier packshots arrive (a brand tile is shown).
 * Thresholds, joined counts and timers are simulation values.
 */
const h = (hours: number) => Date.now() + hours * 3.6e6;
const r2 = (n: number) => Math.round(n * 100) / 100;

export const CATEGORIES: { id: CategoryId | 'all'; label: string }[] = [
  { id: 'all', label: 'الكل' },
  { id: 'baby', label: 'الأطفال' },
  { id: 'cleaning', label: 'المنظفات' },
  { id: 'personal', label: 'العناية' },
  { id: 'home', label: 'البيت والمطبخ' },
];

interface Sku {
  id: string; brand: string; name: string; shortName: string; unitPack: string; category: CategoryId;
  shelf: number; kg: number; inner: number; unitLabel: string; image?: string;
}

const SKUS: Sku[] = [
  // Baby
  { id: 'pampers-premium-4', brand: 'Pampers', name: 'بامبرز بريميوم كير مقاس 4', shortName: 'بامبرز بريميوم 4', unitPack: '100 حفاضة', category: 'baby', shelf: 156.25, kg: 7.9, inner: 100, unitLabel: 'حفاضة' },
  { id: 'huggies-4', brand: 'Huggies', name: 'هقيز إكسترا كير مقاس 4', shortName: 'هقيز إكسترا كير 4', unitPack: '90 حفاضة', category: 'baby', shelf: 129.5, kg: 6.5, inner: 90, unitLabel: 'حفاضة' },
  { id: 'molfix-5', brand: 'Molfix', name: 'مولفكس حفاضات مقاس 5', shortName: 'مولفكس 5', unitPack: '88 حفاضة', category: 'baby', shelf: 134.95, kg: 7.9, inner: 88, unitLabel: 'حفاضة' },
  { id: 'babyjoy-3', brand: 'Baby Joy', name: 'بيبي جوي مقاس 3 مضغوط', shortName: 'بيبي جوي 3', unitPack: '84 حفاضة', category: 'baby', shelf: 104, kg: 4.7, inner: 84, unitLabel: 'حفاضة' },
  { id: 'pampers-wipes', brand: 'Pampers', name: 'مناديل بامبرز المبللة', shortName: 'مناديل بامبرز المبللة', unitPack: '4 × 64 منديل', category: 'baby', shelf: 56.9, kg: 1.9, inner: 256, unitLabel: 'منديل',
    image: 'https://cdn.mafrservices.com/sys-master-root/hba/ha3/50834654232606/511264_main.jpg' },
  { id: 'aptamil-1', brand: 'Aptamil', name: 'حليب أبتاميل أدفانس 1', shortName: 'أبتاميل أدفانس 1', unitPack: 'علبة 800 جم', category: 'baby', shelf: 112.7, kg: 1.1, inner: 1, unitLabel: 'علبة' },
  { id: 'nan-1', brand: 'NAN', name: 'حليب نان أوبتي برو 1', shortName: 'نان أوبتي برو 1', unitPack: 'علبة 800 جم', category: 'baby', shelf: 118.06, kg: 1.1, inner: 1, unitLabel: 'علبة' },
  { id: 'similac-3', brand: 'Similac', name: 'حليب سيميلاك جولد 3', shortName: 'سيميلاك جولد 3', unitPack: 'علبة 800 جم', category: 'baby', shelf: 105.87, kg: 1.1, inner: 1, unitLabel: 'علبة' },
  // Cleaning
  { id: 'finish-90', brand: 'Finish', name: 'أقراص فنش كوانتم للجلاية', shortName: 'فنش كوانتم', unitPack: '90 قرص', category: 'cleaning', shelf: 76.5, kg: 1.6, inner: 90, unitLabel: 'قرص' },
  { id: 'dettol-4l', brand: 'Dettol', name: 'ديتول مطهر متعدد الاستخدام', shortName: 'ديتول مطهر', unitPack: '4 لتر', category: 'cleaning', shelf: 103.5, kg: 4.5, inner: 1, unitLabel: 'عبوة' },
  { id: 'downy-3l', brand: 'Downy', name: 'داوني منعم ملابس مركّز', shortName: 'داوني مركّز', unitPack: '3 لتر', category: 'cleaning', shelf: 57.99, kg: 3.4, inner: 1, unitLabel: 'عبوة' },
  { id: 'fairy-1.5', brand: 'Fairy', name: 'فيري سائل غسيل الصحون', shortName: 'فيري 1.5 لتر', unitPack: '1.5 لتر', category: 'cleaning', shelf: 36.99, kg: 1.7, inner: 1, unitLabel: 'عبوة',
    image: 'https://cdn.mafrservices.com/sys-master-root/hbc/h4e/51126588440606/602787_main.jpg' },
  { id: 'harpic', brand: 'Harpic', name: 'هاربك منظف المراحيض', shortName: 'هاربك', unitPack: '750 مل', category: 'cleaning', shelf: 19.95, kg: 0.8, inner: 1, unitLabel: 'عبوة' },
  // Personal care
  { id: 'lux-6', brand: 'Lux', name: 'صابون لوكس', shortName: 'صابون لوكس', unitPack: '6 × 170 جم', category: 'personal', shelf: 49.5, kg: 1.1, inner: 6, unitLabel: 'صابونة' },
  { id: 'always-48', brand: 'Always', name: 'فوط أولويز الصحية', shortName: 'فوط أولويز', unitPack: '48 حبة', category: 'personal', shelf: 55.2, kg: 1.6, inner: 48, unitLabel: 'فوطة' },
  { id: 'hs-600', brand: 'Head & Shoulders', name: 'شامبو هيد آند شولدرز', shortName: 'هيد آند شولدرز', unitPack: '600 مل', category: 'personal', shelf: 31.25, kg: 0.7, inner: 1, unitLabel: 'عبوة' },
  { id: 'colgate-4', brand: 'Colgate', name: 'معجون أسنان كولجيت', shortName: 'كولجيت', unitPack: '4 × 75 مل', category: 'personal', shelf: 19.99, kg: 0.5, inner: 4, unitLabel: 'أنبوب' },
  // Home & kitchen
  { id: 'sanita-foil', brand: 'Sanita', name: 'ورق قصدير صنيتا', shortName: 'قصدير صنيتا', unitPack: '30سم × 85م', category: 'home', shelf: 46.75, kg: 1.1, inner: 1, unitLabel: 'رول' },
  { id: 'sanita-bags', brand: 'Sanita', name: 'أكياس نفايات صنيتا', shortName: 'أكياس صنيتا', unitPack: '45 كيس', category: 'home', shelf: 29.5, kg: 1.1, inner: 45, unitLabel: 'كيس' },
  { id: 'afia-2x1.5', brand: 'Afia', name: 'زيت عافية ذرة', shortName: 'زيت عافية', unitPack: '2 × 1.5 لتر', category: 'home', shelf: 59.45, kg: 3.0, inner: 2, unitLabel: 'عبوة' },
  { id: 'nido-2.25', brand: 'Nido', name: 'حليب نيدو بودرة', shortName: 'نيدو بودرة', unitPack: '2.25 كجم', category: 'home', shelf: 107.5, kg: 2.4, inner: 1, unitLabel: 'علبة' },
  { id: 'lipton-100', brand: 'Lipton', name: 'شاي ليبتون أكياس', shortName: 'شاي ليبتون', unitPack: '100 كيس', category: 'home', shelf: 22.5, kg: 0.3, inner: 100, unitLabel: 'كيس' },
];

/** Items from the study that cannot reach 112 SAR before hitting 10 kg. Basket add-ons only. */
export const BASKET_ONLY = [
  { name: 'كلوركس مبيّض 3.78 لتر', shelf: 23.99, kg: 4.2 },
  { name: 'كمفورت منعم 3 لتر', shelf: 31.35, kg: 3.4 },
  { name: 'برسيل باور جل 7 لتر', shelf: 75.77, kg: 7.5 },
  { name: 'برسيل باور جل 4.8 لتر', shelf: 69.67, kg: 5.4 },
  { name: 'أريال بلاتينيوم جل 4 لتر', shelf: 52.25, kg: 4.5 },
  { name: 'برسيل بودرة 10 كجم', shelf: 75.99, kg: 10.5 },
  { name: 'تايد بودرة 6 كجم', shelf: 73.5, kg: 6.3 },
  { name: 'أريال بودرة 6 كجم', shelf: 77.95, kg: 6.3 },
  { name: 'ديتول منظف أرضيات 3 لتر', shelf: 50, kg: 3.4 },
  { name: 'مناديل فاين 10 × 80', shelf: 36.99, kg: 4.6 },
  { name: 'ورق حمام فاين 20 رول', shelf: 42, kg: 6.9 },
  { name: 'مناشف مطبخ فاين 8 رول', shelf: 44.25, kg: 5.3 },
  { name: 'رز الشعلان بسمتي 10 كجم', shelf: 71.99, kg: 10.1 },
  { name: 'رز أبو كاس 5 كجم', shelf: 47.5, kg: 5.0 },
  { name: 'سكر الأسرة 10 كجم', shelf: 47.25, kg: 10.1 },
  { name: 'حليب المراعي طويل الأجل 12 × 1 لتر', shelf: 72, kg: 12.9 },
  { name: 'مويه نوفا 40 × 330 مل', shelf: 22.45, kg: 14 },
];

export const packSize = (shelf: number) => Math.ceil(BREAK_EVEN_MARKET / shelf);
export const sellableAlone = (shelf: number, kg: number) => packSize(shelf) * kg <= MAX_ORDER_KG;

const ma3naPrice = (market: number) => r2(0.85 * market - DELIVERY_FIRST);

// Simulation: campaign minimum (cartons), joined so far, hours left (≤ 48, decision #14)
const SIM: Record<string, [number, number, number]> = {
  'pampers-premium-4': [200, 143, 30], 'huggies-4': [150, 61, 41], 'molfix-5': [150, 97, 22], 'babyjoy-3': [120, 38, 45],
  'pampers-wipes': [150, 112, 12], 'aptamil-1': [200, 176, 9], 'nan-1': [200, 84, 33], 'similac-3': [150, 52, 39],
  'finish-90': [250, 188, 16], 'dettol-4l': [120, 70, 27], 'downy-3l': [150, 44, 46], 'fairy-1.5': [150, 102, 20], 'harpic': [120, 31, 47],
  'lux-6': [150, 66, 35], 'always-48': [150, 93, 24], 'hs-600': [120, 40, 43], 'colgate-4': [120, 57, 31],
  'sanita-foil': [120, 49, 38], 'sanita-bags': [120, 72, 19], 'afia-2x1.5': [150, 118, 14], 'nido-2.25': [150, 81, 29], 'lipton-100': [120, 26, 47],
  'basket-baby': [150, 109, 21], 'basket-dishes': [150, 77, 34], 'basket-sanitize': [120, 58, 40], 'basket-care': [120, 45, 44], 'basket-home': [120, 33, 46],
};

const fromSku = (s: Sku): Campaign => {
  const n = packSize(s.shelf);
  const market = r2(n * s.shelf);
  const [min, joined, hrs] = SIM[s.id];
  return {
    id: s.id, brand: s.brand, name: s.name, shortName: s.shortName, category: s.category, image: s.image ?? '',
    pack: n > 1 ? `كرتون ${n} × ${s.unitPack}` : s.unitPack,
    weightKg: r2(n * s.kg), marketPrice: market, tiers: [{ minQty: min, price: ma3naPrice(market) }],
    unitsPerCarton: n * s.inner, unitLabel: s.unitLabel, joinedQty: joined, endsAt: h(hrs),
  };
};

// Mixed baskets: the first four are from the study; "basket-home" shows how a
// losing item (Clorox) rides along with dense items and still stays under 10 kg.
const basket = (id: string, name: string, contents: string, category: CategoryId, market: number, kg: number, image = ''): Campaign => {
  const [min, joined, hrs] = SIM[id];
  return {
    id, brand: 'سلة معنا', name, shortName: name, pack: `${contents} · ${kg} كجم`, contents, category, image,
    weightKg: kg, marketPrice: market, tiers: [{ minQty: min, price: ma3naPrice(market) }],
    unitsPerCarton: 1, unitLabel: 'سلة', joinedQty: joined, endsAt: h(hrs),
  };
};

export const SEED_CAMPAIGNS: Campaign[] = [
  ...SKUS.filter(s => sellableAlone(s.shelf, s.kg)).map(fromSku),
  basket('basket-baby', 'سلة البيبي', 'بامبرز بريميوم مقاس 4 + مناديل مبللة 4×64', 'baby', 213.15, 9.8),
  basket('basket-dishes', 'سلة الصحون والغسيل', 'فنش 90 قرص + داوني مركّز 3 لتر + فيري 1.5 لتر × 2', 'cleaning', 208.47, 8.4),
  basket('basket-sanitize', 'سلة التعقيم', 'ديتول مطهر 4 لتر + هاربك × 2 + فيري + فنش', 'cleaning', 256.89, 9.5),
  basket('basket-care', 'سلة العناية', 'هيد آند شولدرز × 2 + لوكس 6 + كولجيت 4 × 2 + أولويز 48', 'personal', 207.18, 5.2),
  basket('basket-home', 'سلة البيت', 'كلوركس 3.78 لتر + فنش 90 قرص + فيري 1.5 لتر + هاربك × 2', 'cleaning', 177.38, 9.1),
];
