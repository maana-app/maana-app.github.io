import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import { colors } from '@/lib/theme';
import { allInPrice, currentPrice, discountPct, formatSAR, progress } from '@/lib/pricing';
import type { Campaign } from '@/lib/types';
import { Plus } from './icons';
import { Bar, Countdown, ProductImage, Row, T } from './ui';

export function CampaignCard({ c, width }: { c: Campaign; width: number }) {
  const router = useRouter();
  const price = currentPrice(c);
  const open = () => router.push({ pathname: '/campaign/[id]', params: { id: c.id } });
  return (
    <Pressable onPress={open} style={{ width }} accessibilityRole="button" accessibilityLabel={`${c.shortName} ${formatSAR(allInPrice(c, price))} ريال شامل التوصيل`}>
      <View>
        <ProductImage uri={c.image} size={width} brand={c.brand} gallery={c.gallery} />
        <View style={{ position: 'absolute', top: 8, right: 8, backgroundColor: colors.accent, borderRadius: 7, paddingHorizontal: 7, paddingVertical: 1 }}>
          <T w="bold" size={11} color="#fff">-{discountPct(c, price)}%</T>
        </View>
        <View importantForAccessibility="no-hide-descendants" aria-hidden
          style={{ position: 'absolute', bottom: 8, left: 8, width: 36, height: 36, borderRadius: 11, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
            shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 3 }}>
          <Plus />
        </View>
      </View>
      <T w="medium" size={13} numberOfLines={2} style={{ marginTop: 8, minHeight: 36, lineHeight: 18 }}>{c.shortName} · {c.pack}</T>
      <Row gap={6} style={{ marginTop: 3, alignItems: 'baseline' }}>
        <T w="bold" size={16}>{formatSAR(allInPrice(c, price))}</T>
        <T w="semibold" size={11}>ر.س</T>
        <T size={12} color={colors.faint} style={{ textDecorationLine: 'line-through' }}>{formatSAR(c.marketPrice)}</T>
      </Row>
      <T size={10.5} color={colors.muted}>شامل التوصيل</T>
      <View style={{ marginTop: 6 }}><Bar value={progress(c)} /></View>
      <Row style={{ justifyContent: 'space-between', marginTop: 4 }}>
        <T size={11} color={colors.muted}><T w="semibold" size={11} color={colors.accentText}>{c.joinedQty}</T>/{c.tiers[0].minQty} انضموا</T>
        <Countdown endsAt={c.endsAt} />
      </Row>
    </Pressable>
  );
}
