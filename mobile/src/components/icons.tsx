import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { colors } from '@/lib/theme';

type P = { size?: number; color?: string; stroke?: number };
const base = (size: number) => ({ width: size, height: size, viewBox: '0 0 24 24', fill: 'none' as const });

export const Home = ({ size = 24, color = colors.ink, stroke = 1.8 }: P) => (
  <Svg {...base(size)}><Path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" stroke={color} strokeWidth={stroke} strokeLinejoin="round" /></Svg>);
export const Grid = ({ size = 24, color = colors.ink, stroke = 1.8 }: P) => (
  <Svg {...base(size)}>{[[3.5, 3.5], [13.5, 3.5], [3.5, 13.5], [13.5, 13.5]].map(([x, y], i) => <Rect key={i} x={x} y={y} width={7} height={7} rx={2} stroke={color} strokeWidth={stroke} />)}</Svg>);
export const Bag = ({ size = 24, color = colors.ink, stroke = 1.8 }: P) => (
  <Svg {...base(size)}><Path d="M5 8h14l-1 12H6z" stroke={color} strokeWidth={stroke} strokeLinejoin="round" /><Path d="M9 8V6a3 3 0 0 1 6 0v2" stroke={color} strokeWidth={stroke} strokeLinecap="round" /></Svg>);
export const User = ({ size = 24, color = colors.ink, stroke = 1.8 }: P) => (
  <Svg {...base(size)}><Circle cx={12} cy={8} r={4} stroke={color} strokeWidth={stroke} /><Path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" stroke={color} strokeWidth={stroke} strokeLinecap="round" /></Svg>);
export const Bell = ({ size = 22, color = colors.ink, stroke = 1.8 }: P) => (
  <Svg {...base(size)}><Path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z" stroke={color} strokeWidth={stroke} strokeLinejoin="round" /><Path d="M10 20a2 2 0 0 0 4 0" stroke={color} strokeWidth={stroke} strokeLinecap="round" /></Svg>);
export const Search = ({ size = 19, color = colors.faint, stroke = 2 }: P) => (
  <Svg {...base(size)}><Circle cx={11} cy={11} r={6.5} stroke={color} strokeWidth={stroke} /><Path d="m20 20-4-4" stroke={color} strokeWidth={stroke} strokeLinecap="round" /></Svg>);
export const Pin = ({ size = 15, color = colors.brand2, stroke = 2 }: P) => (
  <Svg {...base(size)}><Path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z" stroke={color} strokeWidth={stroke} /><Circle cx={12} cy={10} r={2.5} stroke={color} strokeWidth={stroke} /></Svg>);
export const Plus = ({ size = 18, color = colors.brand, stroke = 2.4 }: P) => (
  <Svg {...base(size)}><Path d="M12 5v14M5 12h14" stroke={color} strokeWidth={stroke} strokeLinecap="round" /></Svg>);
export const Back = ({ size = 24, color = colors.ink, stroke = 2 }: P) => (
  <Svg {...base(size)}><Path d="m9 6 6 6-6 6" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" /></Svg>);
export const Chev = ({ size = 18, color = '#B4BBB8', stroke = 2 }: P) => (
  <Svg {...base(size)}><Path d="m15 6-6 6 6 6" stroke={color} strokeWidth={stroke} strokeLinecap="round" /></Svg>);
export const Clock = ({ size = 15, color = colors.accent, stroke = 2 }: P) => (
  <Svg {...base(size)}><Circle cx={12} cy={12} r={8.5} stroke={color} strokeWidth={stroke} /><Path d="M12 7.5V12l3 2" stroke={color} strokeWidth={stroke} strokeLinecap="round" /></Svg>);
export const Shield = ({ size = 22, color = colors.brand2, stroke = 1.8 }: P) => (
  <Svg {...base(size)}><Path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z" stroke={color} strokeWidth={stroke} strokeLinejoin="round" /><Path d="m9 12 2 2 4-4" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" /></Svg>);
export const Truck = ({ size = 22, color = colors.brand2, stroke = 1.8 }: P) => (
  <Svg {...base(size)}><Path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" stroke={color} strokeWidth={stroke} strokeLinejoin="round" /><Circle cx={7} cy={17.5} r={1.7} stroke={color} strokeWidth={stroke} /><Circle cx={17} cy={17.5} r={1.7} stroke={color} strokeWidth={stroke} /></Svg>);
export const Refund = ({ size = 22, color = colors.brand2, stroke = 1.8 }: P) => (
  <Svg {...base(size)}><Path d="M4 12a8 8 0 1 0 2.3-5.7" stroke={color} strokeWidth={stroke} strokeLinecap="round" /><Path d="M4 4v4h4" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" /></Svg>);
export const Check = ({ size = 14, color = '#fff', stroke = 3 }: P) => (
  <Svg {...base(size)}><Path d="m5 12 5 5 9-10" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" /></Svg>);
export const Heart = ({ size = 22, color = colors.ink, stroke = 1.8 }: P) => (
  <Svg {...base(size)}><Path d="M12 20s-7.5-4.6-9-9.2C2 7.4 4.4 4.5 7.6 4.5c1.9 0 3.4 1 4.4 2.5 1-1.5 2.5-2.5 4.4-2.5 3.2 0 5.6 2.9 4.6 6.3C19.5 15.4 12 20 12 20z" stroke={color} strokeWidth={stroke} strokeLinejoin="round" /></Svg>);
export const Share = ({ size = 22, color = colors.ink, stroke = 1.8 }: P) => (
  <Svg {...base(size)}><Path d="M12 3v12M7 8l5-5 5 5" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" /><Path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" stroke={color} strokeWidth={stroke} strokeLinecap="round" /></Svg>);
export const Doc = ({ size = 22, color = colors.brand2, stroke = 1.8 }: P) => (
  <Svg {...base(size)}><Path d="M6 3h8l4 4v14H6z" stroke={color} strokeWidth={stroke} strokeLinejoin="round" /><Path d="M14 3v4h4M9 12h6M9 16h6" stroke={color} strokeWidth={stroke} strokeLinecap="round" /></Svg>);
export const Help = ({ size = 22, color = colors.brand2, stroke = 1.8 }: P) => (
  <Svg {...base(size)}><Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={stroke} /><Path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17h.01" stroke={color} strokeWidth={stroke} strokeLinecap="round" /></Svg>);
export const CardIc = ({ size = 22, color = colors.brand2, stroke = 1.8 }: P) => (
  <Svg {...base(size)}><Rect x={3} y={5.5} width={18} height={13} rx={2.5} stroke={color} strokeWidth={stroke} /><Path d="M3 10h18" stroke={color} strokeWidth={stroke} /></Svg>);
export const WhatsApp = ({ size = 21 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24"><Path fill="#fff" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm4.5 12.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.1 5.1 0 0 0 1.1 2.7 11.7 11.7 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.4-.2z" /></Svg>);
