<template>
  <a-select
    allowClear
    show-search
    mode="multiple"
    :disabled="disabled"
    v-model:value="innerValue"
    :filter-option="false"
    @search="loadData"
    @change="onChange"
    placeholder="请输入名称进行搜索"
  >
    <template #dropdownRender="{ menuNode: menu }">
      <!-- 全选按钮 -->
      <div class="px-2 py-1 border-b flex justify-between items-center">
        <span class="text-gray-600">
          {{ isAllSelected ? '已全选' : '全选当前页数据' }}
        </span>
        <a-button size="small" type="link" @click="toggleSelectAll" class="flex items-center">
          {{ isAllSelected ? '取消全选' : '全选' }}
        </a-button>
      </div>
      <a-spin :spinning="loading">
        <v-nodes :vnodes="menu" />
      </a-spin>

      <div class="flex justify-center" v-if="page < maxPage">
        <a-button type="text" @click="loadMore" class="flex items-center blue" :disabled="loading">
          <template #icon>
            <plus-outlined />
          </template>
          加载更多
        </a-button>
      </div>

      <div class="flex justify-center text-gray-400 py-2" v-else>已加载全部</div>
    </template>

    <a-select-option v-for="item in options" :key="item[valueKey]" :value="item[valueKey]" :label="item[labelKey]">
      {{ item[labelKey] }}
    </a-select-option>
  </a-select>
  <template v-if="!disabled && isModal">
    <a-button type="primary" @click="handleSelectClick" class="absolute right-[-100px]">选择素材</a-button>
    <!-- 选择素材模态框 -->
    <a-modal
      v-model:open="visible"
      title="选择素材"
      width="80%"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
      style="top: 35px"
    >
      <LoadSelectModal ref="modalRef" :selected="innerValue" :api="api" :params="props.params" />
    </a-modal>
  </template>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { debounce } from '@/utils/gatekeeper_tools.js';
import { PlusOutlined } from '@ant-design/icons-vue';
import { defineComponent } from 'vue';
import { useScopedLoading } from '@/composables/useScopedLoading';
import LoadSelectModal from './load-select-modal.vue';

const VNodes = defineComponent({
  props: { vnodes: Object },
  render() {
    return this.vnodes;
  }
});

const props = defineProps({
  modelValue: [Array, Number, String],
  api: Function,
  fieldNames: Object,
  disabled: Boolean,
  isModal: { type: Boolean, default: true },
  params: {
    type: Object,
    default: () => ({})
  },
  defaultOptions: {
    type: Array,
    default: () => []
  },
  loadingScope: String
});

const emits = defineEmits(['update:modelValue', 'update:selected-options']);

const { loading } = useScopedLoading(props.loadingScope);

const visible = ref(false);
const modalRef = ref(null); // 弹窗引用

const page = ref(1);
const page_size = ref(50);
const options = ref([]);
const total = ref(0);

const searchKeyword = ref('');
const innerValue = ref(props.modelValue);

// Cache for selected items to ensure we don't lose them when searching
const selectedItemsCache = ref(new Map());

// 字段名
const labelKey = computed(() => props.fieldNames.label);
const valueKey = computed(() => props.fieldNames.value);
const resultKey = computed(() => props.fieldNames.resultName);

// 计算最大页数
const maxPage = computed(() => Math.ceil(total.value / page_size.value));

const isAllSelected = computed(() => {
  const allValues = options.value.map(o => o[valueKey.value]);
  return allValues.length > 0 && allValues.every(v => innerValue.value?.includes(v));
});

watch(
  () => props.modelValue,
  val => (innerValue.value = val)
);

watch(
  () => props.params,
  val => {
    fetchList();
  },
  { deep: true }
);

// Update cache when options change
watch(
  options,
  newOptions => {
    if (newOptions && newOptions.length) {
      newOptions.forEach(item => {
        if (item && item[valueKey.value]) {
          selectedItemsCache.value.set(String(item[valueKey.value]), item);
        }
      });
    }
  },
  { deep: true, immediate: true }
);

// Update cache from defaultOptions
watch(
  () => props.defaultOptions,
  val => {
    if (val && val.length) {
      val.forEach(item => {
        if (item && item[valueKey.value]) {
          selectedItemsCache.value.set(String(item[valueKey.value]), item);
        }
      });
    }
    options.value = val;
  },
  {
    immediate: true,
    deep: true
  }
);

const emitSelectedOptions = (currentValue) => {
  if (!currentValue || !Array.isArray(currentValue)) {
    emits('update:selected-options', []);
    return;
  }
  const selectedObjects = currentValue
    .map(id => selectedItemsCache.value.get(String(id)))
    .filter(item => !!item);
  emits('update:selected-options', selectedObjects);
};

// Watch innerValue to emit selected options
watch(innerValue, (val) => {
  emitSelectedOptions(val);
});

const handleSelectClick = () => {
  visible.value = true;
};

// 弹窗确定按钮回调
const handleModalOk = () => {
  if (modalRef.value) {
    // 获取弹窗中选中的素材 ID 和完整数据
    const selectedIds = modalRef.value.selected;
    const selectedData = modalRef.value.selectedRows;

    // 更新选中的 ID
    innerValue.value = selectedIds;
    emits('update:modelValue', selectedIds);

    // 合并 options：保留原有 options + 新选中的数据
    const existingIds = new Set(options.value.map(o => o[valueKey.value]));
    const newOptions = selectedData.filter(item => !existingIds.has(item[valueKey.value]));
    options.value = [...options.value, ...newOptions];
  }
  visible.value = false;
};

// 弹窗取消按钮回调
const handleModalCancel = () => {
  // 重置弹窗中的选中状态为当前下拉框的值
  if (modalRef.value) {
    // 将弹窗的选中状态重置为下拉框当前的值
    modalRef.value.selected.splice(0, modalRef.value.selected.length, ...innerValue.value);
  }
  visible.value = false;
};

// 点击全选按钮
const toggleSelectAll = () => {
  if (isAllSelected.value) {
    // 取消全选 移除 options 中所有选项
    const removeSet = new Set(options.value.map(o => o[valueKey.value]));
    innerValue.value = innerValue.value.filter(v => !removeSet.has(v));
  } else {
    // 全选 合并所有 options 的 value
    const allValues = options.value.map(o => o[valueKey.value]);
    const s = new Set(innerValue.value);
    allValues.forEach(v => s.add(v));
    innerValue.value = Array.from(s);
  }

  emits('update:modelValue', innerValue.value);
};

// 请求第一页（搜索用）
const fetchList = async (searchName = null) => {
  if (props.disabled) return; // perf: 禁用时 不调接口
  page.value = 1;
  const params = {
    page: page.value,
    page_size: page_size.value,
    ...props.params
  };

  if (searchKeyword.value) {
    params[labelKey.value] = searchKeyword.value;
  }

  if (searchName) params[labelKey.value] = searchName;

  const { data } = await props.api(params, props.loadingScope);

  options.value = data.result[resultKey.value] || [];
  total.value = data.result.total || 0;
};

const loadData = debounce(name => {
  searchKeyword.value = name; // 保存当前搜索值
  fetchList(name);
}, 500);

const loadMore = async () => {
  if (page.value >= maxPage.value) return; // 保护
  page.value++;
  const params = {
    page: page.value,
    page_size: page_size.value,
    ...props.params
  };
  if (searchKeyword.value) params[labelKey.value] = searchKeyword.value;
  const { data } = await props.api(params, props.loadingScope);
  const list = data.result[resultKey.value] || [];
  options.value.push(...list);
};

const onChange = val => {
  innerValue.value = val;
  emits('update:modelValue', val);
};

// 首次加载
fetchList();
</script>
