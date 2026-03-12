<template>
  <table class="task-table">
    <thead>
      <tr>
        <th width="120px">广告系列组序号</th>
        <th>{{ type === 'material' ? '分配素材' : '投放语言' }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-if="!props.numbers">
        <td colspan="2">
          <a-empty :image="simpleImage" :description="props.noDataText" />
        </td>
      </tr>
      <tr v-for="(item, index) in getNumbers" :key="index">
        <td>优秀素材-{{ index + 1 }}</td>
        <td>
          <a-select
            v-model:value="currentDetails[index]"
            mode="multiple"
            style="width: 100%"
            :placeholder="type === 'material' ? '请分配素材' : '请选择投放语言'"
            :options="getOptions(index)"
            :status="getValidationStatus(index)"
            :show-search="true"
            :option-filter-prop="getOptionFilterProp"
            :field-names="fieldNames"
            :disabled="props.disabled"
            allowClear
            @search="(val) => handleSearch(val, index)"
            @dropdownVisibleChange="(open) => handleDropdownVisibleChange(open, index)"
          >
            <template #dropdownRender="{ menuNode: menu }">
              <div class="px-2 py-1 border-b flex justify-between items-center">
                <span class="text-gray-600">
                  {{ isAllSelected(index) ? '已全选' : '全选当前页数据' }}
                </span>
                <a-button size="small" type="link" @click="toggleSelectAll(index)" class="flex items-center">
                  {{ isAllSelected(index) ? '取消全选' : '全选' }}
                </a-button>
              </div>
              <v-nodes :vnodes="menu" />
            </template>
          </a-select>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
import { Empty } from 'ant-design-vue';
const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE;
const VNodes = defineComponent({
  props: { vnodes: Object },
  render() {
    return this.vnodes;
  }
});

const props = defineProps({
  numbers: {
    type: Number,
    default: 0
  },
  disabled: {
    type: Boolean,
    default: false
  },
  noDataText: {
    type: String,
    default: '请设置ad-sets数量，表格总行数 = ad-sets效量/每个campaign'
  },
  type: {
    type: String,
    default: 'material' // 'material' | 'language'
  },
  options: {
    type: Array,
    default: () => []
  },
  fieldNames: {
    type: Object,
    default: () => ({ label: 'name', value: 'id' })
  },
  taskType: {
    type: Number,
    default: 1
  }
});

const getOptionFilterProp = computed(() => {
  return props.type === 'material' ? (props.taskType === 2 ? 'creative_name' : 'task_log_name') : 'label';
});

const formState = defineModel('formState', { type: Object, default: () => ({}) });

const dataKey = computed(() => (props.type === 'material' ? 'ad_assign_info' : 'adset_locale_info'));

const getNumbers = computed(() => props.numbers || 0);

const currentDetails = computed({
  get: () => {
    if (!formState.value[dataKey.value]) {
      formState.value[dataKey.value] = [];
    }
    return formState.value[dataKey.value];
  },
  set: val => {
    formState.value[dataKey.value] = val;
  }
});

// Ensure the array has the correct length when numbers change
watch(
  () => props.numbers,
  newVal => {
    if (!currentDetails.value) {
      currentDetails.value = [];
    }

    const targetLength = newVal || 0;

    if (targetLength < currentDetails.value.length) {
      currentDetails.value = currentDetails.value.slice(0, targetLength);
    }

    for (let i = 0; i < targetLength; i++) {
      if (!currentDetails.value[i]) {
        currentDetails.value[i] = [];
      }
    }
  },
  { immediate: true }
);

function getOptions(rowIndex) {
  let availableOptions = [];
  if (props.type === 'material') {
    // Exclude materials selected in OTHER rows
    const allSelected = (currentDetails.value || []).flatMap((val, idx) =>
      idx !== rowIndex && Array.isArray(val) ? val : []
    );

    availableOptions = props.options.filter(opt => !allSelected.includes(opt[props.fieldNames.value]));
  } else {
    availableOptions = [...props.options];
  }

  return availableOptions;
}

const searchTexts = ref({});

function handleSearch(val, index) {
  searchTexts.value[index] = val;
}

function handleDropdownVisibleChange(open, index) {
  if (!open) {
    searchTexts.value[index] = '';
  }
}

function getFilteredOptions(index) {
  const options = getOptions(index);
  const searchText = searchTexts.value[index];

  if (!searchText) {
    return options;
  }

  const filterProp = getOptionFilterProp.value;
  const key = filterProp === 'label' ? props.fieldNames.label : filterProp;

  return options.filter(opt => {
    const val = opt[key];
    return val && String(val).toLowerCase().includes(searchText.toLowerCase());
  });
}

function isAllSelected(index) {
  const options = getFilteredOptions(index);
  const val = currentDetails.value[index] || [];
  const allValues = options.map(opt => opt[props.fieldNames.value]);
  return allValues.length > 0 && allValues.every(v => val.includes(v));
}

function toggleSelectAll(index) {
  const options = getFilteredOptions(index);
  const allValues = options.map(opt => opt[props.fieldNames.value]);

  if (isAllSelected(index)) {
    // Deselect all: Remove current options from the selection
    // Note: We only remove visible options, in case there are hidden selections (though unlikely in this context)
    const removeSet = new Set(allValues);
    currentDetails.value[index] = (currentDetails.value[index] || []).filter(v => !removeSet.has(v));
  } else {
    // Select all: Add all visible options to selection
    const s = new Set(currentDetails.value[index] || []);
    allValues.forEach(v => s.add(v));
    currentDetails.value[index] = Array.from(s);
  }
}

function getValidationStatus(index) {
  if (formState.value.showValidation) {
    const val = currentDetails.value[index];
    if (!val || val.length === 0) {
      return 'error';
    }
  }
  return '';
}
</script>

<style lang="scss" scoped>
.task-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #e5e5e5;
  thead {
    background-color: #f5f5f5;
  }
  th,
  td {
    border: 1px solid #e5e5e5;
    padding: 6px;
    text-align: left;
  }
}
</style>
