<script setup lang="ts">
import { Input, Select, DatePicker, Cascader, RangePicker } from 'ant-design-vue';
import { UpOutlined, DownOutlined } from '@ant-design/icons-vue';
import { createTransform } from './utils/transform-presets';
import { toggleCollapseAnimation } from './utils/collapse-animation';
import NumberRange from './components/NumberRange.vue';
const componentMap = {
  input: Input,
  select: Select,
  date: DatePicker,
  cascader: Cascader,
  rangePicker: RangePicker,
  numberRange: NumberRange
};

interface SchemaItem {
  /** 标签名 */
  label: string;
  /** 字段名 */
  field: string;
  /** 搜索框类型 */
  type: keyof typeof componentMap | string;
  /** 自定义渲染函数或组件，用于渲染自定义组件（优先级高于 type） */
  render?: (() => VNode) | Component;
  /** 搜索框选项 */
  options?: Record<string, any>;
  /** 提示语 */
  placeholder?: string | string[];
  /** 传递给表单项组件的属性 */
  props?: Record<string, any>;
  /** select 模式 */
  mode?: string;
  /** 是否多选 */
  multiple?: boolean;
  /** 输出值转换，支持预设或函数 */
  transform?: string | ((v: any) => any);
  /** 是否隐藏该字段 */
  hidden?: boolean;
}

interface SearchBarProps {
  /** 搜索项 */
  schema: SchemaItem[];
  /** 每列的宽度（基于 24 格布局） */
  span?: number;
  /** 表单控件间隙 */
  gutter?: number;
  /** 是否显示标签 */
  showLabel?: boolean;
  /** 是否显示搜索按钮 */
  showSearch?: boolean;
  /** 是否显示重置按钮 */
  showReset?: boolean;
  /** 默认是否展开 */
  isExpand?: boolean;
  /** 默认展开时显示的搜索项数量（不包括按钮列） */
  defaultVisibleCount?: number;
  /** 标签宽度（仅在 showLabel 为 true 时有效） */
  labelWidth?: number | string;
  /** 标签对齐方式（仅在 showLabel 为 true 时有效） */
  labelAlign?: 'left' | 'right';
  /** 尺寸 */
  size?: 'small' | 'middle' | 'large';
  defaultValues?: Record<string, any>;
}

interface SearchBarEmits {
  (e: 'search', data: Record<string, any>): void;
  (e: 'reset', data: Record<string, any>): void;
  (e: 'toggle', expanded: boolean): void;
}

const props = withDefaults(defineProps<SearchBarProps>(), {
  span: 6,
  gutter: 12,
  showLabel: false,
  showSearch: true,
  showReset: true,
  isExpand: false,
  defaultVisibleCount: 3,
  labelWidth: 70,
  labelAlign: 'right',
  size: 'middle',
  defaultValues: () => ({})
});

const emit = defineEmits<SearchBarEmits>();

const isExpanded = ref(props.isExpand);
const searchData = reactive<Record<string, any>>({});
const contentRef = ref<HTMLElement>();

const applyDefaultValues = (defaults?: Record<string, any>) => {
  if (!defaults) return;
  props.schema.forEach(item => {
    if (item.hidden) return;
    const value = defaults[item.field];
    if (value === undefined) return;
    if (item.type === 'numberRange') {
      if (Array.isArray(value)) {
        searchData[item.field] = [value[0] ?? null, value[1] ?? null];
      }
      return;
    }
    searchData[item.field] = value;
  });
};

const initSearchData = () => {
  props.schema.forEach(item => {
    // 隐藏项不初始化数据
    if (item.hidden) return;
    if (item.type === 'numberRange') {
      // 数字范围初始化为数组
      searchData[item.field] = [null, null];
    } else {
      searchData[item.field] = item.mode === 'multiple' || item.multiple ? [] : null;
    }
  });
  applyDefaultValues(props.defaultValues);
};

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value;
  toggleCollapseAnimation(contentRef.value, 300, () => {
    emit('toggle', isExpanded.value);
  });
};

// 获取非隐藏的搜索项
const visibleSchema = computed(() => {
  return props.schema.filter(item => !item.hidden);
});

// 计算当前应该显示的搜索项（不包括按钮组）
const displayedSchema = computed(() => {
  if (isExpanded.value || visibleSchema.value.length <= props.defaultVisibleCount) {
    return visibleSchema.value;
  }
  return visibleSchema.value.slice(0, props.defaultVisibleCount);
});

// 计算按钮组的 offset，使其始终在最右边
const buttonOffset = computed(() => {
  const itemsPerRow = Math.floor(24 / props.span);
  const displayedCount = displayedSchema.value.length;
  const remainder = displayedCount % itemsPerRow;

  if (remainder === 0) {
    // 如果正好占满一行，按钮组在新行，offset = 24 - span（推到最右边）
    return 24 - props.span;
  }
  // 如果当前行还有空间，按钮组在同一行，计算 offset 使其在最右边
  // 当前行已占用：remainder * span，剩余空间：24 - remainder * span
  // offset = 剩余空间 - 按钮组占用的空间
  return 24 - remainder * props.span - props.span;
});

// 是否需要显示展开/收起按钮
const showToggleButton = computed(() => {
  return visibleSchema.value.length > props.defaultVisibleCount;
});

const getComponent = (item: SchemaItem) => {
  if (item.render) return item.render;
  return componentMap[item.type as keyof typeof componentMap] || componentMap['input'];
};

const getProps = (item: SchemaItem) => {
  const rootProps: (keyof SchemaItem)[] = ['label', 'type'];
  const props: Record<string, any> = {
    ...item,
    placeholder: item.placeholder || getPlaceholder(item.label, item.type),
    size: size.value
  };

  if (item.type === 'select' && item.options) props.options = normalizeOptions(item.options as any[]);

  // numberRange 特殊处理：将占位符数组转换为 minPlaceholder 和 maxPlaceholder
  if (item.type === 'numberRange') {
    const placeholders = props.placeholder as string[];
    props.minValue = searchData[item.field]?.[0] ?? null;
    props.maxValue = searchData[item.field]?.[1] ?? null;
    props.minPlaceholder = item.props?.minPlaceholder || placeholders?.[0] || '最小值';
    props.maxPlaceholder = item.props?.maxPlaceholder || placeholders?.[1] || '最大值';
    delete props.placeholder;
    delete props.mode;
    delete props.multiple;
  } else {
    props.value = searchData[item.field];
  }

  rootProps.forEach(key => delete props[key]);
  return props;
};
const normalizeOptions = (options: any[]) => {
  return options.map(item => {
    if (typeof item === 'string' || typeof item === 'number') {
      // 如果是字符串数组，自动生成 label/value
      return { label: item, value: item };
    }

    // 如果本身已经包含 label/value，则原样使用
    if ('label' in item && 'value' in item) {
      return item;
    }

    // 如果后台返回 id/name 之类的结构
    const label = item.label ?? item.name ?? item.title ?? '';
    const value = item.value ?? item.id ?? item.key ?? label;

    return { label, value };
  });
};
const getPlaceholder = (label: string, type: SchemaItem['type']) => {
  if (['select', 'cascader'].includes(type)) return `请选择${label}`;
  if (type === 'rangePicker') return ['开始日期', '结束日期'];
  if (type === 'numberRange') return ['最小值', '最大值'];
  return `请输入${label}`;
};

const formatSearchData = () => {
  const result: Record<string, any> = {};

  props.schema.forEach(item => {
    // 跳过隐藏项
    if (item.hidden) return;
    const value = searchData[item.field];
    const transformer = createTransform(item.transform);
    const formatted = transformer(value, item.field);
    // transform 可能返回 object（例如 range），需要拆开
    if (typeof formatted === 'object' && formatted !== null && !Array.isArray(formatted)) {
      Object.assign(result, formatted);
    } else {
      result[item.field] = formatted;
    }
  });

  return result;
};
const onSearch = () => {
  const data = formatSearchData();
  emit('search', data);
};
const onReset = () => {
  // 仅重置非隐藏项的数据
  visibleSchema.value.forEach(item => {
    if (item.type === 'numberRange') {
      searchData[item.field] = [null, null];
    } else {
      searchData[item.field] = item.mode === 'multiple' || item.multiple ? [] : null;
    }
  });
  emit('reset', {});
};

initSearchData();

const { showLabel, gutter, span, size } = toRefs(props);

watch(
  () => props.schema,
  () => {
    // 清空现有数据
    Object.keys(searchData).forEach(key => delete searchData[key]);
    initSearchData();
  },
  { deep: true }
);

watch(
  () => props.defaultValues,
  value => {
    applyDefaultValues(value);
  },
  { deep: true }
);

defineExpose({
  searchData
});
</script>
<template>
  <div class="p-4 pb-1 relative bg-white rounded-lg mb-2">
    <div ref="contentRef">
      <a-row :gutter="gutter">
        <template v-for="(item, index) in displayedSchema">
          <a-col :span="span" class="mb-2" v-if="!item.hidden" :key="`item-${index}`">
            <template v-if="showLabel">
              <label>{{ `${item.label}：` }}</label>
            </template>
            <component
              :is="getComponent(item)"
              v-bind="getProps(item)"
              @keyup.enter="onSearch"
              allow-clear
              class="w-full"
              @update:value="(val: any) => (searchData[item.field] = val)"
              @update:min-value="(val: any) => (searchData[item.field][0] = val)"
              @update:max-value="(val: any) => (searchData[item.field][1] = val)"
            />
          </a-col>
        </template>
        <a-col :span="span" :offset="buttonOffset">
          <div class="flex justify-end">
            <a-button :size="size" v-if="showReset" class="mr-4" @click="onReset">重置</a-button>
            <a-button :size="size" v-if="showSearch" type="primary" @click="onSearch">查询</a-button>
          </div>
        </a-col>
      </a-row>
    </div>

    <!-- 展开/收起按钮 -->
    <div v-if="showToggleButton" class="toggle-button-wrapper">
      <div class="toggle-button" @click="toggleExpanded">
        <up-outlined v-if="isExpanded" />
        <down-outlined v-else />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.toggle-button-wrapper {
  position: absolute;
  bottom: -5px;
  left: 50%;
  transform: translate(-50%, 50%);
  z-index: 10;
}

.toggle-button {
  width: 48px;
  height: 24px;
  background: linear-gradient(135deg, #ffffff 0%, #fafafa 100%);
  border: 1px solid #e8e8e8;
  border-top: none;
  border-bottom-left-radius: 24px;
  border-bottom-right-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  color: #888;
  font-size: 12px;

  &:hover {
    background: linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%);
    border-color: #d8d8d8;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
    color: #555;
    transform: translateY(-1px);
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
  }
}
</style>
