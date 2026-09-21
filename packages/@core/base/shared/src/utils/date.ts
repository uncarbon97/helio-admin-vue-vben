import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';

dayjs.extend(utc);
dayjs.extend(timezone);

type FormatDate = Date | dayjs.Dayjs | number | string;

type Format =
  | 'HH'
  | 'HH:mm'
  | 'HH:mm:ss'
  | 'YYYY'
  | 'YYYY-MM'
  | 'YYYY-MM-DD'
  | 'YYYY-MM-DD HH'
  | 'YYYY-MM-DD HH:mm'
  | 'YYYY-MM-DD HH:mm:ss'
  | (string & {});

export function formatDate(time?: FormatDate, format: Format = 'YYYY-MM-DD') {
  if (time === undefined || time === null || time === '') {
    return '';
  }
  try {
    // helium customization: 后端按 X-i18n-Timezone 头返回前端当前时区的时刻文本（如 2026-09-21T01:58:27-04:00），
    // 前端不做任何时区换算，直接按串内墙钟格式化；
    // 【显示时刻的时区偏移】为"是"时保留尾部偏移后缀，为"否"时裁切（如 2026-09-21 01:58:27）
    let dayjsInput: FormatDate = time;
    let offsetText = '';
    if (typeof time === 'string') {
      offsetText = extractZoneSuffix(time);
      dayjsInput = time.replace(ZONE_SUFFIX_REGEX, '');
    }
    const date = dayjs.isDayjs(dayjsInput) ? dayjsInput : dayjs(dayjsInput);
    if (!date.isValid()) {
      throw new Error('Invalid date');
    }
    let result = date.format(format);
    // helium customization: 偏移后缀仅在含时刻的格式下拼接（纯日期格式无意义）；非字符串入参无原始偏移可保留，退化为本地偏移
    if (isShowTimezoneOffset() && format.includes('HH')) {
      result += offsetText || date.format('Z');
    }
    return result;
  } catch (error) {
    console.error(`Error formatting date: ${error}`);
    return String(time ?? '');
  }
}

export function formatDateTime(time?: FormatDate) {
  return formatDate(time, 'YYYY-MM-DD HH:mm:ss');
}

/**
 * helium customization: 时刻字符串尾部的时区偏移后缀（如 -04:00、+0530、Z）
 */
const ZONE_SUFFIX_REGEX = /(Z|[+-]\d{2}:?\d{2})$/;

/**
 * helium customization: 提取时刻字符串尾部的时区偏移文本，统一归一为 ±HH:mm 形式；无偏移返回空串
 */
const extractZoneSuffix = (time: string) => {
  const match = ZONE_SUFFIX_REGEX.exec(time)?.[0];
  return match === 'Z' ? '+00:00' : (match ?? '');
};

export function isDate(value: any): value is Date {
  return value instanceof Date;
}

export function isDayjsObject(value: any): value is dayjs.Dayjs {
  return dayjs.isDayjs(value);
}

/**
 * 获取当前时区
 * @returns 当前时区
 */
export const getSystemTimezone = () => {
  return dayjs.tz.guess();
};

/**
 * helium customization: 获取指定时区相对 UTC 的偏移分钟数（按当前日期计算，自动兼容夏令时/冬令时）
 * @param timezone IANA 时区字符串
 * @returns 偏移分钟数，如上海 +480、纽约夏令时 -240
 */
export const getTimezoneOffsetMinutes = (timezone: string) => {
  return dayjs().tz(timezone).utcOffset();
};

/**
 * 自定义设置的时区
 */
let currentTimezone = getSystemTimezone();

/**
 * 设置默认时区
 * @param timezone
 */
export const setCurrentTimezone = (timezone?: string) => {
  currentTimezone = timezone || getSystemTimezone();
  dayjs.tz.setDefault(currentTimezone);
};

/**
 * 获取设置的时区
 * @returns 设置的时区
 */
export const getCurrentTimezone = () => {
  return currentTimezone;
};

/**
 * helium customization: 是否在时刻字段尾部展示时区偏移后缀
 * 取值复用后端框架级 YesOrNoEnum，默认否；localStorage 持久化
 */
const SHOW_TIMEZONE_OFFSET_STORAGE_KEY = 'HELIUM_SHOW_TIMEZONE_OFFSET';

let showTimezoneOffset = (() => {
  try {
    return (
      typeof localStorage !== 'undefined' &&
      localStorage.getItem(SHOW_TIMEZONE_OFFSET_STORAGE_KEY) === '1'
    );
  } catch {
    return false;
  }
})();

export const isShowTimezoneOffset = () => showTimezoneOffset;

export const setShowTimezoneOffset = (value: number) => {
  showTimezoneOffset = value === 1;
  try {
    localStorage.setItem(
      SHOW_TIMEZONE_OFFSET_STORAGE_KEY,
      value === 1 ? '1' : '0',
    );
  } catch {
    // 忽略存储异常（如隐私模式），仅影响持久化
  }
};
