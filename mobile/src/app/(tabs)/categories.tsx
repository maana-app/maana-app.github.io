import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CampaignCard } from '@/components/CampaignCard';
import { T } from '@/components/ui';
import { CATEGORIES } from '@/lib/catalog';
import { useApp } from '@/lib/store';
import { colors } from '@/lib/theme';

export default function Categories() {
  const { campaigns } = useApp();
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <T w="bold" size={16} style={{ textAlign: 'center', paddingVertical: 14 }}>الأقسام</T>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {CATEGORIES.slice(1).map(k => {
          const items = campaigns.filter(c => c.category === k.id);
          if (!items.length) return null;
          return (
            <View key={k.id} style={{ marginBottom: 18 }}>
              <T w="bold" size={16} style={{ paddingHorizontal: 16, marginBottom: 10 }}>{k.label}</T>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}>
                {items.map(c => <CampaignCard key={c.id} c={c} width={138} />)}
              </ScrollView>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
