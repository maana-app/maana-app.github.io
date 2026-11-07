import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, CardIc, Chev, Doc, Heart, Help, Pin } from '@/components/icons';
import { Button, Row, T } from '@/components/ui';
import { api } from '@/lib/api';
import { formatSAR } from '@/lib/pricing';
import { useApp } from '@/lib/store';
import { colors } from '@/lib/theme';

export default function Account() {
  const { profile, signOut, orders, campaign } = useApp();
  const saved = orders.filter(o => o.status !== 'refunded').reduce((s, o) => {
    const c = campaign(o.campaignId); return s + (c ? (c.marketPrice - o.unitPrice) * o.qty : 0);
  }, 0);
  const items = [
    { icon: <Pin size={22} />, title: 'العناوين', sub: profile?.addressLabel },
    { icon: <CardIc />, title: 'طرق الدفع', sub: 'Apple Pay · مدى' },
    { icon: <Heart color={colors.brand2} />, title: 'المفضلة والتنبيهات' },
    { icon: <Bell color={colors.brand2} />, title: 'الإشعارات' },
    { icon: <Help />, title: 'المساعدة والدعم', sub: 'واتساب' },
    { icon: <Doc />, title: 'الشروط والخصوصية' },
  ];
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <T w="bold" size={16} style={{ textAlign: 'center', paddingVertical: 14 }}>حسابي</T>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <Row gap={12} style={{ paddingHorizontal: 16 }}>
          <View style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center' }}><T w="bold" size={20} color="#fff">{profile?.name?.[0] ?? 'م'}</T></View>
          <View><T w="bold" size={16}>{profile?.name}</T><T size={12.5} color={colors.muted} style={{ writingDirection: 'ltr' }}>+966 {profile?.phone}</T></View>
        </Row>
        <View style={{ margin: 16, borderRadius: 16, backgroundColor: colors.brand, padding: 16 }}>
          <T size={12} color="#fff" style={{ opacity: 0.8 }}>وفّرت مع معنا</T>
          <T w="bold" size={26} color="#fff">{formatSAR(saved)} ر.س</T>
          <T size={12} color="#fff" style={{ opacity: 0.8 }}>مقارنة بأسعار السوق · {orders.length} طلب</T>
        </View>
        <View style={{ marginHorizontal: 16, borderWidth: 1, borderColor: colors.line, borderRadius: 16, overflow: 'hidden' }}>
          {items.map((it, i) => (
            <Pressable key={it.title} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderTopWidth: i ? 1 : 0, borderTopColor: colors.line }}>
              {it.icon}
              <View style={{ flex: 1 }}><T w="semibold" size={13.5}>{it.title}</T>{it.sub ? <T size={12} color={colors.muted}>{it.sub}</T> : null}</View>
              <Chev />
            </Pressable>
          ))}
        </View>
        <Button title="تسجيل الخروج" variant="ghost" onPress={signOut} style={{ margin: 16 }} />
        <T size={11} color={colors.faint} style={{ textAlign: 'center' }}>معنا · الإصدار 0.1.0 · {api.mode === 'simulation' ? 'وضع المحاكاة' : 'مباشر'}</T>
      </ScrollView>
    </SafeAreaView>
  );
}
