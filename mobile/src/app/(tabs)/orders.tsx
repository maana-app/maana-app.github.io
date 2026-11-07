import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bag, Chev } from '@/components/icons';
import { PAYMENT_LABEL, StatusBadge } from '@/components/OrderStatus';
import { Button, ProductImage, Row, T } from '@/components/ui';
import { formatSAR } from '@/lib/pricing';
import { useApp } from '@/lib/store';
import { colors } from '@/lib/theme';

export default function Orders() {
  const router = useRouter();
  const { orders, campaign } = useApp();
  const [tab, setTab] = useState<'current' | 'past'>('current');
  const list = orders.filter(o => (tab === 'current') === !['delivered', 'refunded'].includes(o.status));

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <T w="bold" size={16} style={{ textAlign: 'center', paddingVertical: 14 }}>طلباتي</T>
      <Row gap={0} style={{ marginHorizontal: 16, backgroundColor: colors.surface, borderRadius: 12, padding: 4 }}>
        {(['current', 'past'] as const).map(k => (
          <Pressable key={k} onPress={() => setTab(k)} style={{ flex: 1, height: 34, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: tab === k ? '#fff' : 'transparent' }}>
            <T w="semibold" size={13} color={tab === k ? colors.ink : colors.muted}>{k === 'current' ? 'الحالية' : 'السابقة'}</T>
          </Pressable>
        ))}
      </Row>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        {list.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 48 }}>
            <Bag size={56} color="#C9CFCC" stroke={1.4} />
            <T w="semibold" size={14} style={{ marginTop: 10 }}>{tab === 'current' ? 'ما عندك طلبات حالياً' : 'ما فيه طلبات سابقة'}</T>
            <T size={12.5} color={colors.muted} style={{ marginTop: 4 }}>انضم لحملة ووفّر على مقاضي بيتك</T>
            {tab === 'current' ? <Button title="تصفح الحملات" onPress={() => router.navigate('/')} style={{ marginTop: 14, height: 40, borderRadius: 10 }} /> : null}
          </View>
        ) : list.map(o => {
          const c = campaign(o.campaignId);
          return (
            <Pressable key={o.id} onPress={() => router.push({ pathname: '/order/[id]', params: { id: o.id } })} style={{ borderWidth: 1, borderColor: colors.line, borderRadius: 16, padding: 14 }}>
              <Row style={{ justifyContent: 'space-between' }}><T size={12.5} color={colors.muted}>طلب {o.id}</T><StatusBadge status={o.status} /></Row>
              <Row gap={12} style={{ marginTop: 10 }}>
                {c ? <ProductImage uri={c.image} size={58} brand={c.brand} gallery={c.gallery} /> : null}
                <View style={{ flex: 1 }}>
                  <T w="semibold" size={13.5}>{c?.shortName} × {o.qty}</T>
                  <T size={12} color={colors.muted}>{formatSAR(o.total)} ر.س · {PAYMENT_LABEL[o.payment]}</T>
                </View>
                <Chev />
              </Row>
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
