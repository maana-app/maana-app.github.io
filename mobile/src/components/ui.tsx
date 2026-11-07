import { Image } from 'expo-image';
import { useEffect, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text as RNText, View, type StyleProp, type TextProps, type TextStyle, type ViewStyle } from 'react-native';
import { colors, font, radius } from '@/lib/theme';
import { timeLeft } from '@/lib/pricing';

type W = 'regular' | 'medium' | 'semibold' | 'bold';
export function T({ w = 'regular', size = 14, color = colors.ink, style, ...p }: TextProps & { w?: W; size?: number; color?: string }) {
  return <RNText {...p} style={[{ fontFamily: font[w], fontSize: size, color, textAlign: 'left', writingDirection: 'rtl' }, style]} />;
}

export function Button({ title, sub, onPress, variant = 'primary', disabled, style, left }: {
  title: string; sub?: string; onPress?: () => void; variant?: 'primary' | 'dark' | 'ghost' | 'black'; disabled?: boolean; style?: StyleProp<ViewStyle>; left?: ReactNode;
}) {
  const bg = { primary: colors.accent, dark: colors.brand, ghost: colors.surface, black: '#000' }[variant];
  const fg = variant === 'ghost' ? colors.ink : '#fff';
  return (
    <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress}
      style={({ pressed }) => [s.btn, { backgroundColor: bg, opacity: disabled ? 0.45 : pressed ? 0.85 : 1 }, style]}>
      {left}
      <View style={{ alignItems: 'center' }}>
        <T w="bold" size={15} color={fg}>{title}</T>
        {sub ? <T w="semibold" size={11} color={fg} style={{ opacity: 0.9 }}>{sub}</T> : null}
      </View>
    </Pressable>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[s.card, style]}>{children}</View>;
}

// Retail packshots ship on a white canvas. Multiply blending drops that white
// onto whatever tint sits behind it, so no white box shows around the product.
export const blend: ViewStyle = { mixBlendMode: 'multiply' } as ViewStyle;

export function ProductImage({ uri, size, style, alt }: { uri: string; size: number; style?: StyleProp<ViewStyle>; alt?: string }) {
  return (
    <View style={[{ width: size, height: size, borderRadius: radius.md, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }, style]}>
      <Image source={{ uri }} style={[{ width: size * 0.84, height: size * 0.84 }, blend as any]} contentFit="contain" transition={150} accessibilityLabel={alt ?? 'صورة المنتج'} alt={alt ?? 'صورة المنتج'} />
    </View>
  );
}

export function Bar({ value, height = 4, color = colors.accent }: { value: number; height?: number; color?: string }) {
  return (
    <View style={{ height, borderRadius: height / 2, backgroundColor: colors.line, overflow: 'hidden' }}>
      <View style={{ width: `${Math.round(Math.min(1, Math.max(0, value)) * 100)}%`, height: '100%', backgroundColor: color, borderRadius: height / 2 }} />
    </View>
  );
}

export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), intervalMs); return () => clearInterval(t); }, [intervalMs]);
  return now;
}

export function Countdown({ endsAt, style, color = colors.muted, size = 11 }: { endsAt: number; style?: StyleProp<TextStyle>; color?: string; size?: number }) {
  const now = useNow();
  return <T size={size} color={color} style={[{ fontVariant: ['tabular-nums'] }, style]}>{timeLeft(endsAt, now)}</T>;
}

export function Row({ children, style, gap = 8 }: { children: ReactNode; style?: StyleProp<ViewStyle>; gap?: number }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', gap }, style]}>{children}</View>;
}

export function Badge({ text, bg, fg }: { text: string; bg: string; fg: string }) {
  return <View style={{ backgroundColor: bg, borderRadius: 7, paddingHorizontal: 8, paddingVertical: 2 }}><T w="bold" size={11.5} color={fg}>{text}</T></View>;
}

export const s = StyleSheet.create({
  btn: { height: 50, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, paddingHorizontal: 16 },
  card: { borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: 14, backgroundColor: colors.bg },
});
