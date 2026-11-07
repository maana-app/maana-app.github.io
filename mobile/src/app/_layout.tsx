import { IBMPlexSansArabic_400Regular, IBMPlexSansArabic_500Medium, IBMPlexSansArabic_600SemiBold, IBMPlexSansArabic_700Bold, useFonts } from '@expo-google-fonts/ibm-plex-sans-arabic';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, I18nManager, Platform, View } from 'react-native';
import { AppProvider, useApp } from '@/lib/store';
import { colors } from '@/lib/theme';

if (Platform.OS !== 'web' && !I18nManager.isRTL) {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
}

function Root() {
  const { ready, profile } = useApp();
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('lang', 'ar');
    }
  }, []);
  if (!ready) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}><ActivityIndicator color={colors.brand} /></View>;
  const authed = !!profile;
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Protected guard={!authed} redirectTo="/">
        <Stack.Screen name="login" />
        <Stack.Screen name="otp" />
      </Stack.Protected>
      <Stack.Protected guard={authed} redirectTo="/login">
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="campaign/[id]" />
        <Stack.Screen name="checkout/[id]" />
        <Stack.Screen name="joined/[orderId]" options={{ gestureEnabled: false }} />
        <Stack.Screen name="order/[id]" />
        <Stack.Screen name="search" options={{ animation: 'fade' }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function Layout() {
  const [loaded] = useFonts({ IBMPlexSansArabic_400Regular, IBMPlexSansArabic_500Medium, IBMPlexSansArabic_600SemiBold, IBMPlexSansArabic_700Bold });
  if (!loaded) return null;
  return (
    <AppProvider>
      <StatusBar style="dark" />
      <Root />
    </AppProvider>
  );
}
