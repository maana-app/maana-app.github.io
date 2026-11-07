import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Share as RNShare, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Back, Clock, Heart, Refund, Share, Shield, Truck, WhatsApp } from '@/components/icons';
import { Bar, Card, Countdown, Row, T } from '@/components/ui';
import { currentPrice, discountPct, formatSAR, nextTier, unitPrice } from '@/lib/pricing';
import { useApp } from '@/lib/store';
import { colors } from '@/lib/theme';

// Simulation feed. In production this comes from real joins, showing first name + district only with the customer's consent (PDPL).
const FEED = ['نورة من حي النرجس انضمت قبل دقيقتين', 'أبو فهد من الملقا أضاف 3 كراتين', 'ريم من الياسمين انضمت الآن', 'أسرة من جدة · الروضة انضمت قبل 5 دقائق'];

export default function CampaignScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { campaign } = useApp();
  const c = campaign(id);
  const [qty, setQty] = useState(2);
  const [feed, setFeed] = useState(0);
  useEffect(() => { const t = setInterval(() => setFeed(f => (f + 1) % FEED.length), 3000); return () => clearInterval(t); }, []);
  if (!c) return null;

  const price = currentPrice(c);
  const next = nextTier(c);
  const min = c.tiers[0].minQty;
  const share = () => RNShare.share({ message: `انضم معي لحملة ${c.name} على معنا بـ ${formatSAR(price)} ر.س بدل ${formatSAR(c.marketPrice)}. كل ما زاد العدد نزل السعر.` });

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <Row style={{ paddingHorizontal: 12, height: 52 }}>
        <Pressable onPress={() => router.back()} style={{ padding: 6 }} accessibilityLabel="رجوع"><Back /></Pressable>
        <View style={{ flex: 1 }} />
        <Pressable style={{ padding: 6 }} accessibilityLabel="المفضلة"><Heart /></Pressable>
        <Pressable onPress={share} style={{ padding: 6 }} accessibilityLabel="مشاركة"><Share /></Pressable>
      </Row>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={{ backgroundColor: colors.surface, height: 320, alignItems: 'center', justifyContent: 'center' }}>
          <Image source={{ uri: c.image }} style={{ width: '74%', height: 250 }} contentFit="contain" transition={200} />
          <Row gap={5} style={{ position: 'absolute', top: 12, right: 12, backgroundColor: '#fff', borderRadius: 9, paddingHorizontal: 9, paddingVertical: 5 }}>
            <Clock /><Countdown endsAt={c.endsAt} color={colors.accent} size={12} />
          </Row>
        </View>

        <View style={{ paddingHorizontal: 16, paddingTop: 14 }}>
          <T w="semibold" size={12} color={colors.brand2}>{c.brand}</T>
          <T w="bold" size={18} style={{ marginTop: 2, lineHeight: 26 }}>{c.name}</T>
          <T size={12.5} color={colors.muted} style={{ marginTop: 3 }}>{c.pack} · أصلي ومختوم من الموزع المعتمد</T>
          <Row gap={8} style={{ marginTop: 10, alignItems: 'baseline' }}>
            <T w="bold" size={26} color={colors.accent}>{formatSAR(price)}</T>
            <T w="bold" size={13} color={colors.accent}>ر.س</T>
            <T size={14} color={colors.faint} style={{ textDecorationLine: 'line-through' }}>{formatSAR(c.marketPrice)}</T>
            <View style={{ backgroundColor: colors.accentSoft, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 }}><T w="bold" size={12} color={colors.accent}>وفّر {discountPct(c, price)}%</T></View>
          </Row>
          <T size={12.5} color={colors.muted} style={{ marginTop: 3 }}>
            ≈ <T w="semibold" size={12.5} color={colors.ok}>{unitPrice(price, c).toFixed(2)} ر.س</T> لكل {c.unitLabel} · في السوق {unitPrice(c.marketPrice, c).toFixed(2)} · شامل الضريبة
          </T>
        </View>

        <Card style={{ marginHorizontal: 16, marginTop: 14 }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <T w="bold" size={14.5}>الشراء الجماعي</T>
            <T w="semibold" size={12} color={colors.accent}>{c.joinedQty < min ? `باقي ${min - c.joinedQty} كرتون وتكتمل` : next ? `باقي ${next.minQty - c.joinedQty} للسعر ${next.price} ر.س` : 'وصلت أقل سعر'}</T>
          </Row>
          <View style={{ marginTop: 12 }}><Bar value={c.joinedQty / (next?.minQty ?? c.joinedQty)} height={8} /></View>
          <Row style={{ justifyContent: 'space-between', marginTop: 7 }}>
            <T size={12.5} color={colors.muted}><T w="bold" size={12.5}>{c.joinedQty}</T> كرتون محجوز</T>
            <Row gap={4}><T size={12.5} color={colors.muted}>تنتهي خلال</T><Countdown endsAt={c.endsAt} size={12.5} /></Row>
          </Row>
          <Row gap={8} style={{ marginTop: 12 }}>
            {c.tiers.map((t, i) => {
              const cur = t.price === price && c.joinedQty >= t.minQty;
              const nx = next?.minQty === t.minQty;
              return (
                <View key={t.minQty} style={{ flex: 1, borderWidth: 1, borderStyle: nx ? 'dashed' : 'solid', borderColor: cur ? colors.brand : nx ? colors.accent : colors.line, backgroundColor: cur ? colors.mint : '#fff', borderRadius: 12, paddingVertical: 9, alignItems: 'center' }}>
                  <T w="bold" size={17} color={cur ? colors.brand : colors.ink}>{t.price}</T>
                  <T size={11} color={colors.muted}>{i === 0 ? 'الحد الأدنى · ' : ''}{t.minQty} كرتون</T>
                </View>
              );
            })}
          </Row>
          <Row gap={7} style={{ marginTop: 12 }}>
            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: colors.ok }} />
            <T size={12} color="#4B5651">{FEED[feed]}</T>
          </Row>
        </Card>

        <Pressable onPress={share} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.mint, borderRadius: 16, padding: 12, marginHorizontal: 16, marginTop: 14 }}>
          <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: '#25D366', alignItems: 'center', justifyContent: 'center' }}><WhatsApp /></View>
          <View style={{ flex: 1 }}>
            <T w="semibold" size={13.5}>شاركها مع أهلك</T>
            <T size={12.5} color="#36524A">{next ? `كل كرتون يقرّب الحملة من سعر ${next.price} ر.س للجميع` : 'ساعد غيرك يلحق السعر'}</T>
          </View>
        </Pressable>

        <Card style={{ marginHorizontal: 16, marginTop: 14, paddingVertical: 4 }}>
          {[
            { icon: <Truck />, t: 'التوصيل لباب بيتك', s: 'خلال 2–5 أيام عمل من إغلاق الحملة · 26 ر.س لأول كرتون و12 لكل إضافي' },
            { icon: <Refund />, t: 'ما اكتملت الحملة؟', s: 'يرجع مبلغك كامل تلقائياً لنفس وسيلة الدفع' },
            { icon: <Shield />, t: 'منتج أصلي ومختوم', s: 'نشتري من الموزع المعتمد · فاتورة ضريبية باسمك' },
          ].map((r, i) => (
            <Row key={r.t} gap={12} style={{ paddingVertical: 12, borderTopWidth: i ? 1 : 0, borderTopColor: colors.line, alignItems: 'flex-start' }}>
              {r.icon}<View style={{ flex: 1 }}><T w="semibold" size={13.5}>{r.t}</T><T size={12} color={colors.muted} style={{ lineHeight: 18 }}>{r.s}</T></View>
            </Row>
          ))}
        </Card>
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={{ borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: '#fff' }}>
        <Row gap={10} style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 6 }}>
          <Row gap={0} style={{ borderWidth: 1, borderColor: colors.line, borderRadius: 14, height: 50 }}>
            <Pressable onPress={() => setQty(q => Math.min(9, q + 1))} style={{ width: 40, height: 50, alignItems: 'center', justifyContent: 'center' }} accessibilityLabel="زيادة"><T w="bold" size={20} color={colors.brand}>+</T></Pressable>
            <T w="bold" size={16} style={{ minWidth: 20, textAlign: 'center' }}>{qty}</T>
            <Pressable onPress={() => setQty(q => Math.max(1, q - 1))} style={{ width: 40, height: 50, alignItems: 'center', justifyContent: 'center' }} accessibilityLabel="إنقاص"><T w="bold" size={20} color={colors.brand}>−</T></Pressable>
          </Row>
          <Row gap={0} style={{ flex: 1, height: 50, borderRadius: 14, overflow: 'hidden' }}>
            <Pressable onPress={() => router.push({ pathname: '/checkout/[id]', params: { id: c.id, qty: String(qty) } })} style={{ flex: 1, height: 50, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}>
              <T w="bold" size={16} color="#fff">{formatSAR(price * qty)} ر.س</T>
              <T w="semibold" size={11} color="#fff" style={{ opacity: 0.9 }}>انضم بسعر المجموعة</T>
            </Pressable>
            <View style={{ width: '36%', height: 50, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
              <T w="bold" size={14} color="#8A928E" style={{ textDecorationLine: 'line-through' }}>{formatSAR(c.marketPrice * qty)}</T>
              <T size={10.5} color={colors.muted}>سعر السوق</T>
            </View>
          </Row>
        </Row>
      </SafeAreaView>
    </SafeAreaView>
  );
}
