import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Back } from '@/components/icons';
import { Row, T } from '@/components/ui';
import { SIM_OTP, api } from '@/lib/api';
import { useApp } from '@/lib/store';
import { colors, font } from '@/lib/theme';

export default function Otp() {
  const { phone = '' } = useLocalSearchParams<{ phone: string }>();
  const router = useRouter();
  const { signIn, refresh } = useApp();
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  const [secs, setSecs] = useState(60);
  const input = useRef<any>(null);

  useEffect(() => { const t = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000); return () => clearInterval(t); }, []);
  useEffect(() => {
    if (code.length !== 4) return;
    (async () => {
      try { const p = await api.verifyOtp(phone, code); await refresh(); signIn(p); }
      catch (e: any) { setErr(e.message ?? 'الرمز غير صحيح'); setCode(''); }
    })();
  }, [code]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <Pressable onPress={() => router.back()} style={{ padding: 14 }} accessibilityLabel="رجوع"><Back /></Pressable>
      <View style={{ paddingHorizontal: 22 }}>
        <T w="bold" size={24}>أدخل رمز التحقق</T>
        <T size={13.5} color={colors.muted} style={{ marginTop: 6 }}>أرسلنا رمزاً من 4 أرقام إلى <T w="semibold" size={13.5} style={{ writingDirection: 'ltr' }}>+966 {phone}</T></T>
        <Pressable onPress={() => input.current?.focus()}>
          <Row gap={10} style={{ justifyContent: 'center', marginTop: 22, direction: 'ltr' }}>
            {[0, 1, 2, 3].map(i => (
              <View key={i} style={{ width: 58, height: 64, borderRadius: 14, borderWidth: 1.5, borderColor: i === code.length ? colors.brand : colors.line, alignItems: 'center', justifyContent: 'center' }}>
                <T w="bold" size={24}>{code[i] ?? ''}</T>
              </View>
            ))}
          </Row>
        </Pressable>
        <TextInput ref={input} value={code} onChangeText={t => { setErr(''); setCode(t.replace(/\D/g, '').slice(0, 4)); }} keyboardType="number-pad" autoFocus
          textContentType="oneTimeCode" autoComplete="sms-otp" style={{ position: 'absolute', opacity: 0, height: 1, width: 1, fontFamily: font.regular }} />
        {err ? <T size={12.5} color={colors.accent} style={{ textAlign: 'center', marginTop: 12 }}>{err}</T> : null}
        <T size={12.5} color={colors.muted} style={{ textAlign: 'center', marginTop: 18 }}>
          {secs ? <>إعادة الإرسال بعد <T w="bold" size={12.5} color={colors.brand2}>0:{String(secs).padStart(2, '0')}</T></> : <T w="bold" size={12.5} color={colors.brand2} onPress={() => { setSecs(60); api.sendOtp(phone); }}>إعادة إرسال الرمز</T>}
        </T>
        {api.mode === 'simulation' ? (
          <View style={{ marginTop: 26, backgroundColor: colors.goldSoft, borderRadius: 12, padding: 12 }}>
            <T size={12.5} color="#7A5200">وضع المحاكاة: ما فيه رسائل حقيقية. الرمز هو <T w="bold" size={12.5} color="#7A5200">{SIM_OTP}</T></T>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}
