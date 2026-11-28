import type { BuiltinThemeType, TimezoneOption } from '@vben-core/typings';

import { getTimezoneOffsetMinutes } from '@vben-core/shared/utils';

interface BuiltinThemePreset {
  color: string;
  darkPrimaryColor?: string;
  primaryColor?: string;
  type: BuiltinThemeType;
}

const BUILT_IN_THEME_PRESETS: BuiltinThemePreset[] = [
  {
    color: 'hsl(212 100% 45%)',
    type: 'default',
  },
  {
    color: 'hsl(245 82% 67%)',
    type: 'violet',
  },
  {
    color: 'hsl(347 77% 60%)',
    type: 'pink',
  },
  {
    color: 'hsl(42 84% 61%)',
    type: 'yellow',
  },
  {
    color: 'hsl(231 98% 65%)',
    type: 'sky-blue',
  },
  {
    color: 'hsl(161 90% 43%)',
    type: 'green',
  },
  {
    color: 'hsl(240 5% 26%)',
    darkPrimaryColor: 'hsl(0 0% 98%)',
    primaryColor: 'hsl(240 5.9% 10%)',
    type: 'zinc',
  },
  {
    color: 'hsl(181 84% 32%)',
    type: 'deep-green',
  },
  {
    color: 'hsl(211 91% 39%)',
    type: 'deep-blue',
  },
  {
    color: 'hsl(18 89% 40%)',
    type: 'orange',
  },
  {
    color: 'hsl(0 75% 42%)',
    type: 'rose',
  },
  {
    color: 'hsl(0 0% 25%)',
    darkPrimaryColor: 'hsl(0 0% 98%)',
    primaryColor: 'hsl(240 5.9% 10%)',
    type: 'neutral',
  },
  {
    color: 'hsl(215 25% 27%)',
    darkPrimaryColor: 'hsl(0 0% 98%)',
    primaryColor: 'hsl(240 5.9% 10%)',
    type: 'slate',
  },
  {
    color: 'hsl(217 19% 27%)',
    darkPrimaryColor: 'hsl(0 0% 98%)',
    primaryColor: 'hsl(240 5.9% 10%)',
    type: 'gray',
  },
  {
    color: '',
    type: 'custom',
  },
];

/**
 * 时区选项
 */
// helium customization: 偏移量用 dayjs 时区数据按当前日期计算，自动兼容夏令时/冬令时（如纽约夏令时 UTC-4、冬令时 UTC-5），不依赖浏览器 Intl
const formatOffset = (offsetMinutes: number) => {
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const abs = Math.abs(offsetMinutes);
  const hours = String(Math.floor(abs / 60)).padStart(2, '0');
  const minutes = String(abs % 60).padStart(2, '0');
  return `UTC${sign}${hours}:${minutes}`;
};

const buildTimezoneOption = (timezone: string): TimezoneOption => {
  const offsetMinutes = getTimezoneOffsetMinutes(timezone);
  return {
    offset: offsetMinutes / 60,
    label: `${timezone}(${formatOffset(offsetMinutes)})`,
    timezone,
  };
};

// helium customization: 时区仅保留北京（首选）/纽约，其余上游演示项移除
const DEFAULT_TIME_ZONE_OPTIONS: TimezoneOption[] = [
  'Asia/Shanghai',
  'America/New_York',
].map((timezone) => buildTimezoneOption(timezone));

export const COLOR_PRESETS = [...BUILT_IN_THEME_PRESETS].slice(0, 7);

export { BUILT_IN_THEME_PRESETS, DEFAULT_TIME_ZONE_OPTIONS };

export type { BuiltinThemePreset };
