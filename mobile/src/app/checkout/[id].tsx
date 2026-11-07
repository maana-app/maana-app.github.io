import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Back, CardIc, Shield } from '@/components/icons';
import { Button, Card, ProductImage, Row, T } from '@/components/ui';
import { api } from '@/lib/api';
import { currentPrice, deliveryFee, formatSAR, lowestPrice } from '@/lib/pricing';
import { useApp } from '@/lib/store';
import { colors } from '@/lib/theme';
import type { PaymentMethod } from '@/lib/types';

const METHODS: { id: PaymentMethod; title: string; sub: string; logo: string; bg: string; fg: string }[] = [
  { id: 'apple_pay', title: 'Apple Pay', sub: 'ادفع بلمسة', logo: 'Apple Pay', bg: '#000', fg: '#fff' },
  { id: 'mada', title: 'مدى', sub: 'بطاقة مدى', logo: 'mada', bg: '#fff', fg: '#1B3B6F' },
  { id: 'stc_pay', title: 'STC Pay', sub: 'محفظة STC Pay', logo: 'stc', bg: '#4F008C', fg: '#fff' },
  { id: 'card', title: 'بطاقة ائتمانية', sub: 'فيزا أو ماستركارد', logo: '', bg: colors.surface, fg: colors.ink },
];

export default function Checkout() {
  const { id, qty: q0 } = useLocalSearchParams<{ id: string; qty?: string }>();
  const router = useRouter();
  const { campaign, profile, join } = useApp();
  const c = campaign(id);
  const [qty, setQty] = useState(Math.max(1, Number(q0) || 1));
  const [pm, setPm] = useState<PaymentMethod>('apple_pay');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  if (!c) return null;

  const price = currentPrice(c);
  const sub = price * qty;
  const fee = deliveryFee(qty);
  const total = sub + fee;
  const saving = (c.marketPrice - price) * qty;

  const pay = async () => {
    setErr(''); setBusy(true);
    try {
      const o = await join(c.id, qty, pm);
      router.replace({ pathname: '/joined/[orderId]', params: { orderId: o.id } });
    } catch (e: any) { setErr(e.message ?? 'تعذّر إتمام الحجز'); }
    finally { setBusy(false); }
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <Row style={{ paddingHorizontal: 12, height: 52 }}>
        <Pressable onPress={() => router.back()} style={{ padding: 10 }} accessibilityRole="button" accessibilityLabel="رجوع"><Back /></Pressable>
        <T w="bold" size={16} style={{ flex: 1, textAlign: 'center' }}>تأكيد الانضمام</T>
        <View style={{ width: 36 }} />
      </Row>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 24 }}>
        <Card>
          <Row gap={12}>
            <ProductImage uri={c.image} size={64} />
            <View style={{ flex: 1 }}>
              <T w="semibold" size={13.5}>{c.shortName}</T>
              <T size={12} color={colors.muted}>{c.pack}</T>
              <T w="semibold" size={12} color={colors.accentText}>{formatSAR(price)} ر.س للكرتون · قد ينزل إلى {formatSAR(lowestPrice(c))}</T>
            </View>
            <Row gap={0} style={{ borderWidth: 1, borderColor: colors.line, borderRadius: 12, height: 44 }}>
              <Pressable onPress={() => setQty(x => Math.min(9, x + 1))} accessibilityRole="button" accessibilityLabel="زيادة" style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}><T w="bold" size={18} color={colors.brand}>+</T></Pressable>
              <T w="bold" size={15}>{qty}</T>
              <Pressable onPress={() => setQty(x => Math.max(1, x - 1))} accessibilityRole="button" accessibilityLabel="إنقاص" style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}><T w="bold" size={18} color={colors.brand}>−</T></Pressable>
            </Row>
          </Row>
          {qty === 1 ? <T size={12} color="#7A5200" style={{ marginTop: 10, backgroundColor: colors.goldSoft, padding: 8, borderRadius: 8 }}>تنبيه: رسوم التوصيل على كرتون واحد 26 ر.س. كل كرتون إضافي توصيله 12 ر.س بس.</T> : null}
        </Card>

        <Card>
          <Row style={{ justifyContent: 'space-between' }}><T w="bold" size={14.5}>عنوان التوصيل</T><T w="semibold" size={12} color={colors.brand2}>تغيير</T></Row>
          <T size={13} style={{ marginTop: 6 }}>{profile?.addressLabel}</T>
          <T size={12} color={colors.muted}>العنوان الوطني: {profile?.nationalAddress}</T>
        </Card>

        <View>
          <T w="bold" size={15} style={{ marginBottom: 4 }}>طريقة الدفع</T>
          {METHODS.map(m => {
            const on = m.id === pm;
            return (
              <Pressable key={m.id} onPress={() => setPm(m.id)} accessibilityRole="radio" accessibilityState={{ checked: on }} aria-checked={on}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderWidth: 1.5, borderColor: on ? colors.brand : colors.line, backgroundColor: on ? '#F6FAF8' : '#fff', borderRadius: 14, marginTop: 8 }}>
                <View style={{ width: 58, height: 30, borderRadius: 7, backgroundColor: m.bg, borderWidth: m.id === 'mada' ? 1 : 0, borderColor: '#DDE', alignItems: 'center', justifyContent: 'center' }}>
                  {m.logo ? <T w="bold" size={10.5} color={m.fg}>{m.logo}</T> : <CardIc size={20} color={colors.ink} />}
                </View>
                <View style={{ flex: 1 }}><T w="semibold" size={13.5}>{m.title}</T><T size={11.5} color={colors.muted}>{m.sub}</T></View>
                <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: on ? 6 : 2, borderColor: on ? colors.brand : '#C9CFCC' }} />
              </Pressable>
            );
          })}
        </View>

        <Card>
          {[['المنتجات (' + qty + ' كرتون)', formatSAR(sub)], ['التوصيل', formatSAR(fee)]].map(([a, b]) => (
            <Row key={a} style={{ justifyContent: 'space-between', paddingVertical: 5 }}><T size={13.5}>{a}</T><T size={13.5}>{b} ر.س</T></Row>
          ))}
          <Row style={{ justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: colors.line, borderStyle: 'dashed', marginTop: 6, paddingTop: 11 }}>
            <T w="bold" size={15}>يُحجز الآن</T><T w="bold" size={15}>{formatSAR(total)} ر.س</T>
          </Row>
          <Row style={{ justifyContent: 'space-between', paddingTop: 5 }}><T size={12.5} color={colors.ok}>توفيرك مقارنة بالسوق</T><T size={12.5} color={colors.ok}>{formatSAR(saving)} ر.س</T></Row>
        </Card>

        <Row gap={7} style={{ alignItems: 'flex-start' }}>
          <Shield size={16} /><T size={12} color={colors.muted} style={{ flex: 1, lineHeight: 19 }}>نحجز المبلغ فقط. لا يُخصم إلا إذا اكتملت الحملة، وإذا نزل السعر يُخصم السعر الأقل ويرجع الفرق.{api.mode === 'simulation' ? ' (وضع المحاكاة: لا يتم أي دفع حقيقي)' : ''}</T>
        </Row>
        {err ? <T size={12.5} color={colors.accentText}>{err}</T> : null}
      </ScrollView>
      <SafeAreaView edges={['bottom']} style={{ borderTopWidth: 1, borderTopColor: colors.line, paddingHorizontal: 16, paddingTop: 10 }}>
        <Button title={`احجز ${formatSAR(total)} ر.س`} sub={METHODS.find(m => m.id === pm)!.title} variant={pm === 'apple_pay' ? 'black' : 'primary'} onPress={pay} disabled={busy} style={{ marginBottom: 6 }} />
      </SafeAreaView>
      <Modal visible={busy} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,.35)', alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 18, padding: 22, alignItems: 'center', width: 260 }}>
            <ActivityIndicator color={colors.brand} />
            <T w="semibold" size={14} style={{ marginTop: 10 }}>جاري حجز المبلغ…</T>
            <T size={12} color={colors.muted} style={{ marginTop: 4, textAlign: 'center' }}>{METHODS.find(m => m.id === pm)!.title}</T>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
