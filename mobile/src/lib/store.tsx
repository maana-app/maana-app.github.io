import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api } from './api';
import type { Campaign, Order, PaymentMethod, Profile } from './types';

interface AppState {
  ready: boolean;
  profile: Profile | null;
  campaigns: Campaign[];
  orders: Order[];
  refresh(): Promise<void>;
  signIn(p: Profile): void;
  signOut(): Promise<void>;
  join(campaignId: string, qty: number, payment: PaymentMethod): Promise<Order>;
  cancel(orderId: string): Promise<void>;
  campaign(id: string): Campaign | undefined;
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const refresh = useCallback(async () => {
    const [c, o] = await Promise.all([api.listCampaigns(), api.listOrders()]);
    setCampaigns(c);
    setOrders(o);
  }, []);

  useEffect(() => {
    (async () => {
      setProfile(await api.currentProfile());
      await refresh();
      setReady(true);
    })();
  }, [refresh]);

  const value = useMemo<AppState>(() => ({
    ready, profile, campaigns, orders, refresh,
    signIn: p => setProfile(p),
    signOut: async () => { await api.signOut(); setProfile(null); },
    join: async (id, qty, pm) => { const o = await api.joinCampaign(id, qty, pm); await refresh(); return o; },
    cancel: async id => { await api.cancelOrder(id); await refresh(); },
    campaign: id => campaigns.find(c => c.id === id),
  }), [ready, profile, campaigns, orders, refresh]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp must be used inside AppProvider');
  return v;
}
