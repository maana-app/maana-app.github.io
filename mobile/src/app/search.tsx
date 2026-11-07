import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, TextInput, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CampaignCard } from '@/components/CampaignCard';
import { Search } from '@/components/icons';
import { Row, T } from '@/components/ui';
import { useApp } from '@/lib/store';
import { colors, font } from '@/lib/theme';

const SUGGEST = ['حفاضات', 'بامبرز', 'منظفات', 'مناديل', 'برسيل'];
const norm = (s: string) => s.replace(/[إأآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').toLowerCase();

export default function SearchScreen() {
  const router = useRouter();
  const { campaigns } = useApp();
  const { width } = useWindowDimensions();
  const cw = (Math.min(width, 520) - 32 - 12) / 2;
  const [q, setQ] = useState('');
  const results = useMemo(() => {
    const n = norm(q.trim());
    if (!n) return [];
    const alias: Record<string, string[]> = { 'حفاض': ['baby'], 'منظف': ['cleaning'], 'مناديل': ['tissue'], 'منديل': ['tissue'] };
    const cats = Object.entries(alias).filter(([k]) => n.includes(norm(k))).flatMap(([, v]) => v);
    return campaigns.filter(c => norm(`${c.name} ${c.brand} ${c.pack}`).includes(n) || cats.includes(c.category));
  }, [q, campaigns]);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <Row style={{ paddingHorizontal: 16, paddingVertical: 8 }} gap={10}>
        <Row style={{ flex: 1, height: 44, borderRadius: 12, backgroundColor: colors.surface, paddingHorizontal: 12 }}>
          <Search />
          <TextInput value={q} onChangeText={setQ} autoFocus placeholder="ابحث عن منتج أو علامة تجارية" placeholderTextColor={colors.faint} returnKeyType="search"
            accessibilityLabel="البحث" style={[{ flex: 1, minWidth: 0, height: 44, fontFamily: font.regular, fontSize: 14, color: colors.ink, textAlign: 'right' }, Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : null]} />
        </Row>
        <Pressable onPress={() => router.back()} accessibilityRole="button" style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: 4 }}><T w="semibold" size={14} color={colors.brand2}>إلغاء</T></Pressable>
      </Row>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 24 }}>
        {!q.trim() ? (
          <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
            <T w="bold" size={14}>الأكثر بحثاً</T>
            <Row gap={8} style={{ flexWrap: 'wrap', marginTop: 10 }}>
              {SUGGEST.map(s => (
                <Pressable key={s} onPress={() => setQ(s)} accessibilityRole="button" style={{ borderWidth: 1, borderColor: colors.line, borderRadius: 99, paddingHorizontal: 14, height: 36, justifyContent: 'center' }}>
                  <T size={13}>{s}</T>
                </Pressable>
              ))}
            </Row>
          </View>
        ) : results.length ? (
          <>
            <T size={12.5} color={colors.muted} style={{ paddingHorizontal: 16, marginBottom: 10 }}>{results.length} نتيجة</T>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 12, rowGap: 18 }}>
              {results.map(c => <CampaignCard key={c.id} c={c} width={cw} />)}
            </View>
          </>
        ) : (
          <View style={{ alignItems: 'center', paddingTop: 48, paddingHorizontal: 24 }}>
            <T w="semibold" size={14}>ما فيه حملة لـ "{q}" حالياً</T>
            <T size={12.5} color={colors.muted} style={{ marginTop: 4, textAlign: 'center' }}>نضيف حملات جديدة كل أسبوع. جرّب كلمة ثانية أو تصفح الأقسام.</T>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
