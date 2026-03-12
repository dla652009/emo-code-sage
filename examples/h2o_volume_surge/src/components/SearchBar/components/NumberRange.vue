<script setup lang="ts">
import { message } from 'ant-design-vue';

interface NumberRangeProps {
  /** 最小值 */
  minValue?: number | null;
  /** 最大值 */
  maxValue?: number | null;
  /** 最小值占位符 */
  minPlaceholder?: string;
  /** 最大值占位符 */
  maxPlaceholder?: string;
  /** 尺寸 */
  size?: 'small' | 'middle' | 'large';
  /** 是否禁用 */
  disabled?: boolean;
  /** 最小值限制 */
  min?: number;
  /** 最大值限制 */
  max?: number;
  /** 步长 */
  step?: number;
  /** 精度 */
  precision?: number;
}

interface NumberRangeEmits {
  (e: 'update:minValue', value: number | null): void;
  (e: 'update:maxValue', value: number | null): void;
  (e: 'change', value: [number | null, number | null]): void;
}

const props = withDefaults(defineProps<NumberRangeProps>(), {
  minValue: null,
  maxValue: null,
  minPlaceholder: '最小值',
  maxPlaceholder: '最大值',
  size: 'middle',
  disabled: false,
  min: undefined,
  max: undefined,
  step: 1,
  precision: 0
});

const emit = defineEmits<NumberRangeEmits>();

const handleMinChange = (value: number | null) => {
  emit('update:minValue', value);
  emit('change', [value, props.maxValue ?? null]);
};

const handleMaxChange = (value: number | null) => {
  emit('update:maxValue', value);
  emit('change', [props.minValue ?? null, value]);
};

const handleMinBlur = () => {
  // 失焦时校验:最小值不能大于最大值
  if (props.minValue !== null && props.maxValue !== null && props.minValue > props.maxValue) {
    message.warning(`${props.minPlaceholder}不能大于${props.maxPlaceholder}`);
    emit('update:minValue', null);
    emit('change', [null, props.maxValue]);
  }
};

const handleMaxBlur = () => {
  // 失焦时校验:最大值不能小于最小值
  if (props.maxValue !== null && props.minValue !== null && props.maxValue < props.minValue) {
    message.warning(`${props.maxPlaceholder}不能小于${props.minPlaceholder}`);
    emit('update:maxValue', null);
    emit('change', [props.minValue, null]);
  }
};
</script>

<template>
  <div class="flex gap-2">
    <a-input-number
      :value="props.minValue"
      @update:value="handleMinChange"
      @blur="handleMinBlur"
      :placeholder="props.minPlaceholder"
      class="flex-1"
      :size="props.size"
      :disabled="props.disabled"
      :min="props.min"
      :max="props.max"
      :step="props.step"
      :precision="props.precision"
      :controls="false"
      allow-clear
    />
    <span class="flex items-center">-</span>
    <a-input-number
      :value="props.maxValue"
      @update:value="handleMaxChange"
      @blur="handleMaxBlur"
      :placeholder="props.maxPlaceholder"
      class="flex-1"
      :size="props.size"
      :disabled="props.disabled"
      :min="props.min"
      :max="props.max"
      :step="props.step"
      :precision="props.precision"
      :controls="false"
      allow-clear
    />
  </div>
</template>

<style scoped>
.flex {
  display: flex;
}

.flex-1 {
  flex: 1;
}

.gap-2 {
  gap: 8px;
}

.items-center {
  align-items: center;
}
</style>
