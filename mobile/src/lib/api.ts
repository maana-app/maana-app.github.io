import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { SEED_CAMPAIGNS } from './catalog';
import { currentPrice, deliveryFee } from './pricing';
import type { Campaign, Order, PaymentMethod, Profile } from './types';

/**
 * Backend contract for the customer app.
 * - SimulatedApi: local, no network, no real payment (project rule: everything simulated until approved).
 * - SupabaseApi: production path, enabled only when EXPO_PUBLIC_SUPABASE_URL / _ANON_KEY are set.
 *   Payments are never captured from the app; the server authorises via the gateway and captures on campaign success.
 */
export interface Api {
  readonly mode: 'simulation' | 'live';
  sendOtp(phone: string): Promise<void>;
  verifyOtp(phone: string, code: string): Promise<Profile>;
  signOut(): Promise<void>;
  currentProfile(): Promise<Profile | null>;
  listCampaigns(): Promise<Campaign[]>;
  joinCampaign(campaignId: string, qty: number, payment: PaymentMethod): Promise<Order>;
  listOrders(): Promise<Order[]>;
}

const K = { profile: 'ma3na.profile', orders: 'ma3na.orders', joined: 'ma3na.joined' };
const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

class SimulatedApi implements Api {
  readonly mode = 'simulation' as const;
  static readonly OTP = '4827';

  async sendOtp(phone: string) {
    if (!/^5\d{8}$/.test(phone)) throw new Error('رقم الجوال لازم يبدأ بـ 5 ويتكوّن من 9 أرقام');
    await wait(600);
  }
  async verifyOtp(phone: string, code: string) {
    await wait(500);
    if (code !== SimulatedApi.OTP) throw new Error('الرمز غير صحيح');
    const p: Profile = { phone, name: 'نورة القحطاني', addressLabel: 'المنزل · حي النرجس، الرياض', nationalAddress: 'RNRA 4321' };
    await AsyncStorage.setItem(K.profile, JSON.stringify(p));
    return p;
  }
  async signOut() { await AsyncStorage.removeItem(K.profile); }
  async currentProfile() {
    const raw = await AsyncStorage.getItem(K.profile);
    return raw ? (JSON.parse(raw) as Profile) : null;
  }
  private async joinedMap(): Promise<Record<string, number>> {
    return JSON.parse((await AsyncStorage.getItem(K.joined)) || '{}');
  }
  async listCampaigns() {
    const j = await this.joinedMap();
    return SEED_CAMPAIGNS.map(c => ({ ...c, joinedQty: c.joinedQty + (j[c.id] || 0) }));
  }
  async joinCampaign(campaignId: string, qty: number, payment: PaymentMethod) {
    const c = SEED_CAMPAIGNS.find(x => x.id === campaignId);
    if (!c) throw new Error('الحملة غير موجودة');
    if (qty < 1 || qty > 9) throw new Error('الكمية من 1 إلى 9 كراتين');
    if (Date.now() > c.endsAt) throw new Error('الحملة انتهت');
    await wait(1200); // gateway authorisation (simulated)
    const unit = currentPrice(c);
    const fee = deliveryFee(qty);
    const orders = await this.listOrders();
    const order: Order = {
      id: `MN-${10480 + orders.length + 2}`, campaignId, qty, unitPrice: unit, deliveryFee: fee,
      total: unit * qty + fee, payment, status: 'pending', createdAt: Date.now(),
    };
    await AsyncStorage.setItem(K.orders, JSON.stringify([order, ...orders]));
    const j = await this.joinedMap();
    j[campaignId] = (j[campaignId] || 0) + qty;
    await AsyncStorage.setItem(K.joined, JSON.stringify(j));
    return order;
  }
  async listOrders() {
    return JSON.parse((await AsyncStorage.getItem(K.orders)) || '[]') as Order[];
  }
}

class SupabaseApi implements Api {
  readonly mode = 'live' as const;
  constructor(private sb: SupabaseClient) {}
  async sendOtp(phone: string) {
    const { error } = await this.sb.auth.signInWithOtp({ phone: `+966${phone}` });
    if (error) throw error;
  }
  async verifyOtp(phone: string, code: string) {
    const { error } = await this.sb.auth.verifyOtp({ phone: `+966${phone}`, token: code, type: 'sms' });
    if (error) throw error;
    const p = await this.currentProfile();
    if (!p) throw new Error('تعذّر تحميل الملف الشخصي');
    return p;
  }
  async signOut() { await this.sb.auth.signOut(); }
  async currentProfile() {
    const { data: u } = await this.sb.auth.getUser();
    if (!u.user) return null;
    const { data } = await this.sb.from('profiles').select('phone,full_name,address_label,national_address').eq('id', u.user.id).single();
    return data ? { phone: data.phone, name: data.full_name ?? '', addressLabel: data.address_label ?? '', nationalAddress: data.national_address ?? '' } : null;
  }
  async listCampaigns() {
    const { data, error } = await this.sb.from('campaign_feed').select('*').order('ends_at');
    if (error) throw error;
    return (data ?? []).map((r: any): Campaign => ({
      id: r.id, brand: r.brand, name: r.name, shortName: r.short_name, pack: r.pack, category: r.category, image: r.image_url,
      marketPrice: Number(r.market_price), tiers: r.tiers, unitsPerCarton: r.units_per_carton, unitLabel: r.unit_label,
      joinedQty: r.joined_qty, endsAt: new Date(r.ends_at).getTime(),
    }));
  }
  async joinCampaign(campaignId: string, qty: number, payment: PaymentMethod) {
    // Server-side RPC validates price, delivery fee and campaign state; the app never sends prices.
    const { data, error } = await this.sb.rpc('join_campaign', { p_campaign: campaignId, p_qty: qty, p_payment: payment });
    if (error) throw error;
    return mapOrder(data);
  }
  async listOrders() {
    const { data, error } = await this.sb.from('orders').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapOrder);
  }
}
const mapOrder = (r: any): Order => ({
  id: r.code, campaignId: r.campaign_id, qty: r.qty, unitPrice: Number(r.unit_price), deliveryFee: Number(r.delivery_fee),
  total: Number(r.total), payment: r.payment_method, status: r.status, createdAt: new Date(r.created_at).getTime(),
});

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const api: Api = url && key
  ? new SupabaseApi(createClient(url, key, { auth: { storage: AsyncStorage, persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } }))
  : new SimulatedApi();

export const SIM_OTP = SimulatedApi.OTP;
