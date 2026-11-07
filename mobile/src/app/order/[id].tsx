import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Back, Check, Chev, Doc, Help } from '@/components/icons';
import { PAYMENT_LABEL } from '@/components/OrderStatus';
import { Button, Card, Countdown, ProductImage, Row, T } from '@/components/ui';
import { formatSAR } from '@/lib/pricing';
import { useApp } from '@/lib/store';
import { colors } from '@/lib/theme';
import type { OrderStatus } from '@/lib/types';

const STEPS = [
  ['انضممت للحملة', 'تم حجز المبلغ'],
  ['اكتملت الحملة', 'يُخصم السعر النهائي'],
  ['اشترينا بالجملة', 'من الموزع المعتمد'],
  ['استلمتها شركة الشحن', 'من مستودع المورد'],
  ['خرج للتوصيل', 'نرسل لك رمز الاستلام'],
  ['تم التسليم', 'بالرمز وصورة الإثبات'],
] as const;
const REACHED: Record<OrderStatus, number> = { pending: 1, confirmed: 3, shipped: 5, delivered: 6, refunded: 1 };

export default function OrderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { orders, campaign, cancel } = useApp();
  const [ask, setAsk] = useState(false);
  const [busy, setBusy] = useState(false);
  const o = orders.find(x => x.id === id);
  const c = o ? campaign(o.campaignId) : undefined;
  if (!o || !c) return null;
  const k = REACHED[o.status];
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <Row style={{ paddingHorizontal: 12, height: 52 }}>
        <Pressable onPress={() => router.back()} style={{ padding: 10 }} accessibilityRole="button" accessibilityLabel="رجوع"><Back /></Pressable>
        <T w="bold" size={16} style={{ flex: 1, textAlign: 'center' }}>طلب {o.id}</T>
        <View style={{ width: 36 }} />
      </Row>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
        <Card>
          <Row gap={12}>
            <ProductImage uri={c.image} size={58} />
            <View style={{ flex: 1 }}>
              <T w="semibold" size={13.5}>{c.shortName} × {o.qty}</T>
              <T size={12} color={colors.muted}>{formatSAR(o.total)} ر.س · {PAYMENT_LABEL[o.payment]}</T>
              {o.status === 'pending' ? <Row gap={4}><T size={12} color={colors.muted}>الحملة تنتهي خلال</T><Countdown endsAt={c.endsAt} size={12} /></Row> : null}
            </View>
          </Row>
        </Card>
        <Card>
          <T w="bold" size={14.5} style={{ marginBottom: 14 }}>حالة الطلب</T>
          {STEPS.map(([a, b], i) => {
            const done = i < k, cur = i === k;
            return (
              <Row key={a} gap={12} style={{ alignItems: 'flex-start', paddingBottom: i < STEPS.length - 1 ? 18 : 0 }}>
                <View style={{ alignItems: 'center' }}>
                  <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: done ? colors.brand2 : cur ? colors.accent : '#C9CFCC', backgroundColor: done ? colors.brand2 : '#fff', alignItems: 'center', justifyContent: 'center' }}>
                    {done ? <Check size={13} /> : null}
                  </View>
                  {i < STEPS.length - 1 ? <View style={{ position: 'absolute', top: 24, width: 2, height: 30, backgroundColor: done ? colors.brand2 : colors.line }} /> : null}
                </View>
                <View><T w="semibold" size={13.5} color={i > k ? colors.faint : colors.ink}>{a}</T><T size={12} color={colors.muted}>{b}</T></View>
              </Row>
            );
          })}
        </Card>
        {o.status === 'pending' ? (
          <Card style={{ backgroundColor: ask ? colors.accentSoft : '#fff' }}>
            {!ask ? (
              <Pressable onPress={() => setAsk(true)} accessibilityRole="button"><T w="semibold" size={13.5} color={colors.accentText}>إلغاء الانضمام واسترداد المبلغ</T><T size={12} color={colors.muted}>متاح لين تقفل الحملة · يرجع المبلغ كامل</T></Pressable>
            ) : (
              <View>
                <T w="semibold" size={13.5}>متأكد تبي تلغي انضمامك؟</T>
                <T size={12} color={colors.muted} style={{ marginTop: 2 }}>نفك حجز {formatSAR(o.total)} ر.س فوراً، ويرجع لحسابك حسب البنك.</T>
                <Row gap={10} style={{ marginTop: 12 }}>
                  <Button title="تراجع" variant="ghost" onPress={() => setAsk(false)} style={{ flex: 1, height: 44 }} />
                  <Button title={busy ? 'جاري الإلغاء…' : 'نعم، ألغِ'} disabled={busy} onPress={async () => { setBusy(true); try { await cancel(o.id); } finally { setBusy(false); setAsk(false); } }} style={{ flex: 1, height: 44 }} />
                </Row>
              </View>
            )}
          </Card>
        ) : null}
        {o.status === 'refunded' ? <Card style={{ backgroundColor: colors.accentSoft }}><T w="semibold" size={13.5} color={colors.accentText}>تم إلغاء الطلب واسترداد المبلغ</T><T size={12} color={colors.muted}>{formatSAR(o.total)} ر.س · {PAYMENT_LABEL[o.payment]}</T></Card> : null}
        <Card style={{ paddingVertical: 4 }}>
          {[{ i: <Doc />, t: 'الفاتورة الضريبية', s: 'تُصدر بعد اكتمال الحملة' }, { i: <Help />, t: 'مساعدة في هذا الطلب', s: 'تالف، ناقص، أو إلغاء' }].map((r, j) => (
            <Row key={r.t} gap={12} style={{ paddingVertical: 12, borderTopWidth: j ? 1 : 0, borderTopColor: colors.line }}>
              {r.i}<View style={{ flex: 1 }}><T w="semibold" size={13.5}>{r.t}</T><T size={12} color={colors.muted}>{r.s}</T></View><Chev />
            </Row>
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
