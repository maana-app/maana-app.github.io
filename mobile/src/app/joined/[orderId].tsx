import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, Share, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check, WhatsApp } from '@/components/icons';
import { PAYMENT_LABEL, StatusBadge } from '@/components/OrderStatus';
import { Button, Card, Countdown, ProductImage, Row, T } from '@/components/ui';
import { formatSAR } from '@/lib/pricing';
import { useApp } from '@/lib/store';
import { colors } from '@/lib/theme';

export default function Joined() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();
  const { orders, campaign } = useApp();
  const o = orders.find(x => x.id === orderId);
  const c = o ? campaign(o.campaignId) : undefined;
  if (!o || !c) return null;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg, paddingHorizontal: 16 }}>
      <View style={{ alignItems: 'center', paddingTop: 48 }}>
        <View style={{ width: 76, height: 76, borderRadius: 38, backgroundColor: colors.okSoft, alignItems: 'center', justifyContent: 'center' }}><Check size={38} color={colors.ok} stroke={2.6} /></View>
        <T w="bold" size={21} style={{ marginTop: 18 }}>انضممت للحملة</T>
        <T size={13.5} color={colors.muted} style={{ marginTop: 6, textAlign: 'center', lineHeight: 22 }}>حجزنا {formatSAR(o.total)} ر.س على {PAYMENT_LABEL[o.payment]}.{'\n'}نبلغك أول ما تكتمل الحملة، ولن يُخصم شيء قبلها.</T>
      </View>
      <Card style={{ marginTop: 24 }}>
        <Row gap={12}>
          <ProductImage uri={c.image} size={58} brand={c.brand} gallery={c.gallery} />
          <View style={{ flex: 1 }}><T w="semibold" size={13.5}>{c.shortName} × {o.qty}</T><T size={12} color={colors.muted}>طلب رقم {o.id}</T><Row gap={4}><T size={12} color={colors.muted}>الحملة تقفل خلال</T><Countdown endsAt={c.endsAt} size={12} /></Row></View>
          <StatusBadge status={o.status} />
        </Row>
      </Card>
      <Pressable onPress={() => Share.share({ message: `انضميت لحملة ${c.name} على معنا. انضم وخلّ السعر ينزل علينا كلنا!` })}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.mint, borderRadius: 16, padding: 12, marginTop: 14 }}>
        <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: '#25D366', alignItems: 'center', justifyContent: 'center' }}><WhatsApp /></View>
        <View style={{ flex: 1 }}><T w="semibold" size={13.5}>عجّل الحملة: شاركها مع أهلك</T><T size={12.5} color="#36524A">كل ما زاد العدد نزل السعر عليك وعليهم</T></View>
      </Pressable>
      <View style={{ flex: 1 }} />
      <Button title="عرض طلباتي" variant="ghost" onPress={() => router.replace('/orders')} />
      <Button title="متابعة التسوق" variant="dark" onPress={() => router.replace('/')} style={{ marginTop: 10, marginBottom: 8 }} />
    </SafeAreaView>
  );
}
