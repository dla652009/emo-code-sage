import dayjs from 'dayjs';

// 服务于 SearchBar 结果转换的预设
const TRANSFORM_PRESETS = {
  /** 原样返回 */
  'identity': (value: any) => value,

  /** 数组 → 字符串 "a,b,c" */
  'array-to-string': (value: any[]) => {
    if (!Array.isArray(value)) return value;
    return value.join(',');
  },

  /** 数组 → 数字字符串 "1,2,3"（过滤空值） */
  'array-to-number-string': (value: any[]) => {
    if (!Array.isArray(value)) return value;
    return value.filter(v => v !== undefined && v !== null).join(',');
  },

  /** 日期范围 → { start_time, end_time } */
  'range-to-start-end': (value: any[]) => {
    if (!Array.isArray(value)) return value;
    return {
      start_time: value?.[0] ? dayjs(value[0]).startOf('day').format('YYYY-MM-DD HH:mm:ss') : null,
      end_time: value?.[1] ? dayjs(value[1]).endOf('day').format('YYYY-MM-DD HH:mm:ss') : null
    };
  },

  /** 去前后空格 */
  'trim': (value: string) => {
    if (typeof value !== 'string') return value;
    return value.trim();
  },

  /** a-cascader 末尾数据字符串格式 */
  'cascader-to-string': (value: any[]) => {
    if (!Array.isArray(value)) return value;
    return value
      .map(item => {
        if (Array.isArray(item) && item.length > 0) return item[item.length - 1];
        return item;
      })
      .join(',');
  },
  /** a-cascader 末尾数据数组格式 */
  'cascader-to-array': (value: any[]) => {},

  /** 数字范围 → { xxx_start, xxx_end } */
  'number-range-to-start-end': (value: any[], field: string) => {
    if (!Array.isArray(value)) return value;
    return {
      [`${field}_start`]: value?.[0] ?? null,
      [`${field}_end`]: value?.[1] ?? null
    };
  }
} as const;

export function createTransform(transform?: string | ((v: any, f: string) => any)) {
  // 如果没有 transform，默认 identity
  if (!transform) return TRANSFORM_PRESETS.identity;

  // 是字符串 → 使用预设
  if (typeof transform === 'string') {
    const preset = TRANSFORM_PRESETS[transform as keyof typeof TRANSFORM_PRESETS];
    if (!preset) {
      console.warn(`[SearchBar] Unknown transform preset: ${transform}`);
      return TRANSFORM_PRESETS.identity;
    }
    return preset;
  }

  // 自定义函数
  if (typeof transform === 'function') {
    return transform;
  }

  // fallback
  return TRANSFORM_PRESETS.identity;
}
