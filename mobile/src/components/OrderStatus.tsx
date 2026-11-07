import { colors } from '@/lib/theme';
import type { OrderStatus, PaymentMethod } from '@/lib/types';
import { Badge } from './ui';

export const STATUS: Record<OrderStatus, { label: string; bg: string; fg: string }> = {
  pending: { label: 'الحملة جارية', bg: colors.goldSoft, fg: '#7A5200' },
  confirmed: { label: 'اكتملت الحملة', bg: colors.okSoft, fg: colors.ok },
  shipped: { label: 'في الطريق', bg: colors.okSoft, fg: colors.ok },
  delivered: { label: 'تم التسليم', bg: '#F0F2F1', fg: '#4B5651' },
  refunded: { label: 'مسترد', bg: colors.accentSoft, fg: '#B23B2D' },
};

export const PAYMENT_LABEL: Record<PaymentMethod, string> = { apple_pay: 'Apple Pay', mada: 'مدى', stc_pay: 'STC Pay', card: 'بطاقة ائتمانية' };

export function StatusBadge({ status }: { status: OrderStatus }) {
  const s = STATUS[status];
  return <Badge text={s.label} bg={s.bg} fg={s.fg} />;
}
