import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Row, T } from '@/components/ui';
import { api } from '@/lib/api';
import { colors, font } from '@/lib/theme';

export default function Login() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const valid = /^5\d{8}$/.test(phone);

  const send = async () => {
    setErr(''); setBusy(true);
    try { await api.sendOtp(phone); router.push({ pathname: '/otp', params: { phone } }); }
    catch (e: any) { setErr(e.message ?? 'تعذّر الإرسال'); }
    finally { setBusy(false); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, paddingHorizontal: 22 }}>
        <Image source={require('../../assets/img/logo.png')} style={{ width: 92, height: 46, marginTop: 12 }} contentFit="contain" />
        <T w="bold" size={24} style={{ marginTop: 26 }}>أهلاً بك في معنا</T>
        <T size={13.5} color={colors.muted} style={{ marginTop: 6, lineHeight: 22 }}>اشترِ مقاضي بيتك الشهرية بسعر الجملة.{'\n'}سجّل دخولك برقم جوالك.</T>
        <T w="semibold" size={12.5} style={{ marginTop: 26, marginBottom: 8 }}>رقم الجوال</T>
        <Row style={{ height: 54, borderWidth: 1.5, borderColor: phone ? colors.brand : colors.line, borderRadius: 14, paddingHorizontal: 14, direction: 'ltr' }}>
          <T w="semibold" size={16} style={{ paddingRight: 10, borderRightWidth: 1, borderRightColor: colors.line, writingDirection: 'ltr' }}>+966</T>
          <TextInput value={phone} onChangeText={t => setPhone(t.replace(/\D/g, '').slice(0, 9))} keyboardType="number-pad" placeholder="5X XXX XXXX"
            placeholderTextColor={colors.faint} autoFocus textContentType="telephoneNumber" autoComplete="tel"
            style={[{ flex: 1, minWidth: 0, height: 50, fontFamily: font.medium, fontSize: 16, color: colors.ink, textAlign: 'left', writingDirection: 'ltr' }, Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : null]} />
        </Row>
        {err ? <T size={12.5} color={colors.accent} style={{ marginTop: 8 }}>{err}</T> : null}
        <View style={{ flex: 1 }} />
        <Button title={busy ? 'جاري الإرسال…' : 'إرسال رمز التحقق'} onPress={send} disabled={!valid || busy} />
        <T size={11.5} color={colors.muted} style={{ textAlign: 'center', marginVertical: 14 }}>
          بالمتابعة توافق على <T w="semibold" size={11.5} color={colors.brand2}>الشروط والأحكام</T> و<T w="semibold" size={11.5} color={colors.brand2}>سياسة الخصوصية</T>
        </T>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
