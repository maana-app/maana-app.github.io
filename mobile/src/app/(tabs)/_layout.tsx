import { Tabs } from 'expo-router';
import { Bag, Grid, Home, User } from '@/components/icons';
import { useApp } from '@/lib/store';
import { colors, font } from '@/lib/theme';

export default function TabsLayout() {
  const { orders } = useApp();
  const active = orders.filter(o => o.status === 'pending' || o.status === 'confirmed' || o.status === 'shipped').length;
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: colors.brand,
      tabBarInactiveTintColor: '#8A928E',
      tabBarLabelStyle: { fontFamily: font.medium, fontSize: 11 },
      tabBarStyle: { borderTopColor: colors.line },
    }}>
      <Tabs.Screen name="index" options={{ title: 'الرئيسية', tabBarIcon: ({ color }) => <Home color={String(color)} /> }} />
      <Tabs.Screen name="categories" options={{ title: 'الأقسام', tabBarIcon: ({ color }) => <Grid color={String(color)} /> }} />
      <Tabs.Screen name="orders" options={{ title: 'طلباتي', tabBarIcon: ({ color }) => <Bag color={String(color)} />, tabBarBadge: active || undefined, tabBarBadgeStyle: { backgroundColor: colors.accent, fontFamily: font.bold, fontSize: 10 } }} />
      <Tabs.Screen name="account" options={{ title: 'حسابي', tabBarIcon: ({ color }) => <User color={String(color)} /> }} />
    </Tabs>
  );
}
