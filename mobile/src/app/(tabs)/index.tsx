import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CampaignCard } from '@/components/CampaignCard';
import { Bell, Check, Grid, Pin, Search, Shield } from '@/components/icons';
import { blend, Button, ProductImage, Row, T } from '@/components/ui';
import { CATEGORIES } from '@/lib/catalog';
import { allInPrice, currentPrice, formatSAR } from '@/lib/pricing';
import { useApp } from '@/lib/store';
import { colors } from '@/lib/theme';
import type { CategoryId } from '@/lib/types';

const BANNERS = [
  { bg: '#E8F3EE', fg: '#0B3D33', title: 'سلة البيبي بسعر الجملة', sub: 'بامبرز بريميوم + مناديل مبللة · 181 ر.س شامل التوصيل', cta: 'تسوّق الآن', ctaBg: '#0B3D33', ids: ['basket-baby', 'pampers-wipes'] },
  { bg: '#FDECE8', fg: '#7A2A1E', title: 'منظفات الشهر في سلة وحدة', sub: 'فنش وداوني وفيري · وفّر 31 ر.س', cta: 'شوف السلال', ctaBg: '#C23F2C', ids: ['basket-dishes', 'fairy-1.5'] },
  { bg: '#FFF4D9', fg: '#5A3F00', title: 'السعر شامل التوصيل', sub: 'طلب وحد لين 10 كجم يوصلك في شحنة وحدة', cta: 'كيف تشتغل؟', ctaBg: '#5A3F00', ids: ['basket-home'] },
];

export default function Home() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const W = Math.min(width, 520);
  const { campaigns, orders, profile } = useApp();
  const [cat, setCat] = useState<CategoryId | 'all'>('all');
  const [slide, setSlide] = useState(0);
  const list = useMemo(() => campaigns.filter(c => cat === 'all' || c.category === cat), [campaigns, cat]);
  const soon = useMemo(() => [...campaigns].sort((a, b) => a.endsAt - b.endsAt).slice(0, 5), [campaigns]);
  const lastOrder = orders[0];
  const again = campaigns.find(c => c.id === (lastOrder?.campaignId ?? 'pampers-premium-4'));
  const byId = (id: string) => campaigns.find(c => c.id === id);
  const bw = W - 34;
  const cw = (W - 32 - 12) / 2;
  const open = (id: string) => router.push({ pathname: '/campaign/[id]', params: { id } });

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView stickyHeaderIndices={[0]} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
        <View style={{ backgroundColor: colors.bg, paddingHorizontal: 16, paddingTop: 6, paddingBottom: 10 }}>
          <Row gap={10}>
            <Image source={require('../../../assets/img/logo.png')} style={{ width: 60, height: 30 }} contentFit="contain" alt="معنا" accessibilityLabel="معنا" />
            <View style={{ flex: 1 }}>
              <T size={11} color={colors.muted}>التوصيل إلى</T>
              <Row gap={4}><Pin /><T w="semibold" size={13} numberOfLines={1}>{profile?.addressLabel}</T></Row>
            </View>
            <Pressable style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }} accessibilityRole="button" accessibilityLabel="الإشعارات" hitSlop={4}><Bell /></Pressable>
          </Row>
          <Pressable onPress={() => router.push('/search')} accessibilityRole="search" accessibilityLabel="البحث" style={{ marginTop: 10, height: 44, borderRadius: 12, backgroundColor: colors.surface, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Search /><T size={13.5} color={colors.faint}>ابحث عن حفاضات، منظفات، مناديل…</T>
          </Pressable>
          <Row gap={14} style={{ justifyContent: 'center', marginTop: 9 }}>
            {['دفع آمن', 'منتجات أصلية', 'يرجع مبلغك إذا ما اكتملت'].map(t => (
              <Row key={t} gap={4}><Check size={13} color={colors.ok} /><T w="semibold" size={11.5} color={colors.ok}>{t}</T></Row>
            ))}
          </Row>
        </View>

        <FlatList horizontal data={BANNERS} keyExtractor={b => b.title} showsHorizontalScrollIndicator={false} snapToInterval={bw + 10} decelerationRate="fast"
          contentContainerStyle={{ paddingHorizontal: 16, gap: 10, paddingTop: 4 }}
          onScroll={e => setSlide(Math.round(Math.abs(e.nativeEvent.contentOffset.x) / (bw + 10)))} scrollEventThrottle={32}
          renderItem={({ item: b }) => (
            <Pressable onPress={() => open(b.ids[0])} style={{ width: bw, height: 150, borderRadius: 16, backgroundColor: b.bg, padding: 16, overflow: 'hidden', justifyContent: 'space-between' }}>
              <View style={{ maxWidth: '56%' }}>
                <T w="bold" size={16.5} color={b.fg} style={{ lineHeight: 23 }}>{b.title}</T>
                <T size={12} color={b.fg} style={{ opacity: 0.85, marginTop: 3 }}>{b.sub}</T>
              </View>
              <View style={{ alignSelf: 'flex-start', backgroundColor: b.ctaBg, borderRadius: 9, paddingHorizontal: 12, paddingVertical: 6 }}><T w="bold" size={12} color="#fff">{b.cta}</T></View>
              <Row gap={0} style={{ position: 'absolute', left: 8, bottom: -4, alignItems: 'flex-end' }}>
                {b.ids.map((id, i) => byId(id)?.image ? <View key={id} style={{ marginLeft: i ? -6 : 0, backgroundColor: b.bg }}><Image source={{ uri: byId(id)!.image }} style={[{ width: i ? 78 : 96, height: i ? 78 : 96 }, blend as any]} contentFit="contain" /></View> : null)}
              </Row>
            </Pressable>
          )} />
        <Row gap={5} style={{ justifyContent: 'center', marginTop: 9 }}>
          {BANNERS.map((_, i) => <View key={i} style={{ width: i === slide ? 16 : 6, height: 6, borderRadius: 3, backgroundColor: i === slide ? colors.brand : '#D9DDDB' }} />)}
        </Row>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 14, marginTop: 16 }}>
          {CATEGORIES.map(k => {
            const on = k.id === cat;
            const sample = k.id === 'all' ? undefined : campaigns.find(c => c.category === k.id && !!c.image);
            return (
              <Pressable key={k.id} onPress={() => setCat(k.id)} style={{ width: 66, alignItems: 'center', gap: 6 }} accessibilityState={{ selected: on }}>
                <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: on ? colors.brand : 'transparent', overflow: 'hidden' }}>
                  {sample ? <Image source={{ uri: sample.image }} style={[{ width: 46, height: 46 }, blend as any]} contentFit="contain" /> : <Grid color={colors.brand} size={26} />}
                </View>
                <T w={on ? 'bold' : 'medium'} size={12} color={on ? colors.brand : colors.ink}>{k.label}</T>
              </Pressable>
            );
          })}
        </ScrollView>

        {cat === 'all' ? (
          <>
            <Row style={{ justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 20, marginBottom: 10 }}>
              <T w="bold" size={16}>تقفل قريباً</T><T w="semibold" size={12} color={colors.accentText}>لا تفوّت السعر</T>
            </Row>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}>
              {soon.map(c => <CampaignCard key={c.id} c={c} width={138} />)}
            </ScrollView>
            {again ? (
              <>
                <T w="bold" size={16} style={{ paddingHorizontal: 16, marginTop: 20, marginBottom: 10 }}>اطلب مرة ثانية</T>
                <Pressable onPress={() => open(again.id)} style={{ marginHorizontal: 16, borderWidth: 1, borderColor: colors.line, borderRadius: 14, padding: 10 }}>
                  <Row gap={12}>
                    <ProductImage uri={again.image} size={56} brand={again.brand} gallery={again.gallery} />
                    <View style={{ flex: 1 }}>
                      <T w="semibold" size={13.5}>{again.shortName} · {again.pack}</T>
                      <T size={12} color={colors.muted}>الحملة مفتوحة الآن بـ {formatSAR(allInPrice(again))} ر.س شامل التوصيل</T>
                    </View>
                    <Button title="انضم" variant="dark" onPress={() => open(again.id)} style={{ height: 36, borderRadius: 10, paddingHorizontal: 14 }} />
                  </Row>
                </Pressable>
              </>
            ) : null}
          </>
        ) : null}

        <Row style={{ justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 20, marginBottom: 10 }}>
          <T w="bold" size={16}>{cat === 'all' ? 'كل الحملات' : CATEGORIES.find(k => k.id === cat)?.label}</T>
          <T w="semibold" size={12.5} color={colors.brand2}>{list.length} حملة</T>
        </Row>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 12, rowGap: 18 }}>
          {list.map(c => <CampaignCard key={c.id} c={c} width={cw} />)}
        </View>

        <Row gap={10} style={{ margin: 16, marginTop: 22, borderRadius: 14, backgroundColor: colors.mint, padding: 12 }}>
          <Shield /><T size={12.5} color="#26443A" style={{ flex: 1 }}><T w="bold" size={12.5} color="#26443A">ضمان معنا: </T>إذا ما اكتملت الحملة يرجع مبلغك كامل تلقائياً.</T>
        </Row>
      </ScrollView>
    </SafeAreaView>
  );
}
