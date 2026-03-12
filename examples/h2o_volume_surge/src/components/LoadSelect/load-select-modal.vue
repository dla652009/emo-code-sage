<template>
  <a-form-item-rest>
    <SearchBar
      ref="searchBarRef"
      :schema="searchSchema"
      @search="handleSearch"
      @reset="handleReset"
      class="rounded-t-none"
    />
    <a-table
      size="small"
      :row-key="record => record.id"
      :row-selection="rowSelection"
      :columns="columns"
      :data-source="dataList"
      :pagination="pagination"
      @change="onRequest"
      :scroll="{ x: 1500, y: 310, scrollToFirstRowOnChange: true }"
      :key="tableKey"
      class="my-table"
    >
      <template #title>
        <div class="flex">
          <div class="flex flex-1 text-lg items-center">
            <span class="text-sm pl-2"
              >已勾选 <span class="blue mr-1">{{ selected.length }}</span
              >条</span
            >
          </div>
        </div>
      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'tag'">
          <!-- 关键词高亮 -->
          <div class="flex flex-wrap gap-1">
            <a-tag v-for="item in record.tag.split(',')" :key="item">
              <span v-html="highlightKeywords(item)"></span>
            </a-tag>
          </div>
        </template>
        <template v-else-if="column.dataIndex === 'creative_url'">
          <a-button type="link" @click="preview(record.creative_url, record.creative_name)">点击预览</a-button>
        </template>
        <template v-else-if="column.dataIndex === 'upload_days'">
          <div class="flex justify-between">
            <span>{{ record.upload_days }}</span>
            <a-popover v-if="!!record.is_alert">
              <template #content>素材已上传天数 > <span class="blue">30</span> 天</template>
              <InfoCircleOutlined style="color: #ff4d4f" />
            </a-popover>
          </div>
        </template>
      </template>
    </a-table>
  </a-form-item-rest>
  <a-modal :footer="null" v-model:open="video.visible" v-if="video.visible" class="flex justify-center">
    <video v-if="video.type === 'video'" autoplay controls width="300" height="300">
      <source :src="video.url" type="video/mp4" />
    </video>
    <img v-else :src="video.url" style="max-width: 100%; max-height: 600px" />
  </a-modal>
</template>

<script setup>
import { weightOption, creativeStatusOption, mergeStatusOption } from '@/utils/const';
import { InfoCircleOutlined } from '@ant-design/icons-vue';
import { useGetters } from '@/composables/useGetters.js';
import { message } from 'ant-design-vue';
import { compareCreativeName } from '@/utils/index.js';
import dayjs from 'dayjs';

const props = defineProps({
  selected: Array,
  api: Function,
  params: Object
});
const searchBarRef = ref(null);
const tableKey = ref(0); // 用于刷新表格
const search = ref({});
const dataList = ref([]);
const selected = ref([]);
const selectedRows = ref([]);
const video = reactive({ visible: false, url: '', type: 'video' });
// 缓存标签列表，避免重复计算
const tagLevelListCache = new Map();
// 初始化时将 props.selected 赋值给 selected
watch(
  () => props.selected,
  newVal => {
    if (Array.isArray(newVal)) {
      selected.value = [...newVal];
    }
  },
  { immediate: true }
);
watch(
  () => props.params,
  newVal => {
    handleQuery(1);
  }
);
const sort = ref({});
const pagination = reactive({
  showTotal: total =>
    h('div', null, [h('span', null, '合计：'), h('span', { class: 'blue' }, `${total} `), h('span', null, '条')]),
  current: 1,
  defaultPageSize: 20,
  total: 0
});
const rowSelection = computed(() => ({
  preserveSelectedRowKeys: true,
  selectedRowKeys: selected.value,
  onChange: onSelectChange
}));

const {
  authorOption,
  creativeTypeOption,
  contentTypeOption,
  genderOption,
  langOption,
  projectOption,
  creativeCreatorOption,
  tagLevelList
} = useGetters({
  authorOption: 'getAuthorOption',
  creativeTypeOption: 'getCreativeTypeOption',
  contentTypeOption: 'getContentTypeOption',
  genderOption: 'getGenderOption',
  langOption: 'getLangOption',
  projectOption: 'getProjectOption',
  creativeCreatorOption: 'getCreativeCreatorOption',
  tagLevelList: 'getTagLevelList'
});

// 监听 tagLevelList 变化，清除缓存
watch(
  () => tagLevelList.value,
  () => {
    tagLevelListCache.clear();
  }
);

const showSearch = computed(() => ({
  limit: 999999,
  filter: (inputValue, path) => {
    return path.some(option => option.name.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);
  }
}));

// 根据 content_type 和 creative_type 过滤标签列表
const getTagLevelListByParams = () => {
  const { content_type, creative_type } = props.params || {};

  if (!content_type || !creative_type) {
    // 如果参数不完整，返回完整的标签树
    return tagLevelList.value || [];
  }

  // 生成缓存key
  const cacheKey = `${content_type}_${creative_type}`;

  // 检查缓存
  if (tagLevelListCache.has(cacheKey)) {
    return tagLevelListCache.get(cacheKey);
  }

  const label = creativeTypeOption.value?.find(item => item.value === creative_type)?.label;
  const levelList = tagLevelList.value?.filter(tag => tag.content_type === content_type) || [];
  const result = levelList?.[0]?.children?.filter(tag => tag.name === label) || [];
  const finalResult = result?.[0]?.children || [];

  // 存入缓存
  tagLevelListCache.set(cacheKey, finalResult);

  return finalResult;
};

const searchSchema = computed(() => [
  { label: '素材编号', field: 'creative_unique_id' },
  { label: '素材文件名', field: 'creative_name' },
  { label: '素材权重', field: 'weight', type: 'select', options: weightOption },
  {
    label: '素材师',
    field: 'author_id',
    type: 'select',
    options: authorOption.value,
    mode: 'multiple',
    transform: 'array-to-string'
  },
  {
    label: '素材标签',
    field: 'tag',
    type: 'cascader',
    options: getTagLevelListByParams(),
    multiple: true,
    fieldNames: {
      label: 'name',
      value: 'name',
      children: 'children'
    },
    maxTagCount: 'responsive',
    showCheckedStrategy: 'SHOW_CHILD',
    expandTrigger: 'hover',
    showSearch: showSearch.value,
    transform: 'cascader-to-string'
  },
  { label: '素材拼接状态', field: 'merge_status', type: 'select', options: mergeStatusOption },
  {
    field: 'merge_count',
    type: 'numberRange',
    placeholder: ['开始拼接次数', '结束拼接次数'],
    min: 0,
    transform: 'number-range-to-start-end'
  },
  {
    field: 'upload_days',
    type: 'numberRange',
    placeholder: ['开始已上传天数', '结束已上传天数'],
    min: 0,
    transform: 'number-range-to-start-end'
  },
  { label: '创建人', field: 'creator', type: 'select', options: creativeCreatorOption.value },
  {
    label: '创建日期',
    field: 'created_time',
    type: 'rangePicker',
    format: 'YYYY-MM-DD',
    valueFormat: 'YYYY-MM-DD HH:mm:ss',
    allowEmpty: [true, true],
    transform: 'range-to-start-end'
  }
]);
const optionMaps = computed(() => {
  const createMap = options => new Map(options.map(item => [item.value, item.label]));
  return {
    creativeType: createMap(creativeTypeOption.value),
    contentType: createMap(contentTypeOption.value),
    gender: createMap(genderOption.value),
    lang: createMap(langOption.value),
    status: createMap(creativeStatusOption)
  };
});
const columns = computed(() => [
  { title: '序号', fixed: 'left', width: 70, align: 'left', customRender: ({ index }) => index + 1 },
  { title: '素材切片', fixed: 'left', dataIndex: 'creative_url', width: 100, align: 'left' },
  { title: '素材编号', dataIndex: 'creative_unique_id', width: 150, align: 'left' },
  {
    title: '素材文件名称',
    dataIndex: 'creative_name',
    width: 200,
    align: 'center',
    sorter: true
  },
  { title: '素材标签', dataIndex: 'tag', width: 200, align: 'left' },
  {
    title: '标签体系',
    dataIndex: 'content_type',
    width: 100,
    align: 'left',
    customRender: ({ text }) => optionMaps.value.contentType.get(text)
  },
  {
    title: '素材库',
    dataIndex: 'creative_type',
    width: 100,
    align: 'left',
    customRender: ({ text }) => optionMaps.value.creativeType.get(text)
  },
  { title: '素材权重', dataIndex: 'weight', width: 100, align: 'left' },
  { title: '素材师', dataIndex: 'author_name', width: 150, align: 'left' },
  {
    title: '投放人群性别',
    dataIndex: 'gender',
    width: 120,
    align: 'left',
    customRender: ({ text }) => optionMaps.value.gender.get(text)
  },
  {
    title: '素材语言',
    dataIndex: 'lang',
    width: 100,
    align: 'left',
    customRender: ({ text }) => optionMaps.value.lang.get(text)
  },
  {
    title: '拼接状态',
    dataIndex: 'merge_status',
    width: 100,
    align: 'left',
    customRender: ({ text }) => ['未拼接', '已拼接'][text]
  },
  {
    title: '拼接次数',
    dataIndex: 'merge_count',
    width: 110,
    align: 'left',
    sorter: true
  },
  {
    title: '已上传天数',
    dataIndex: 'upload_days',
    width: 120,
    align: 'left',
    sorter: true
  },
  { title: '创建人', dataIndex: 'creator', width: 100, align: 'left' },
  {
    title: '创建日期',
    dataIndex: 'create_time',
    width: 130,
    align: 'left',
    sorter: true
  },
  {
    title: '素材状态',
    dataIndex: 'status',
    width: 100,
    align: 'left',
    customRender: ({ text }) => optionMaps.value.status.get(text)
  }
]);

const handleSearch = searchData => {
  search.value = searchData;
  handleQuery(1);
};
const handleReset = searchData => {
  search.value = searchData;
  pagination.current = 1;
  pagination.defaultPageSize = 20;
  handleQuery(1);
};
const handleQuery = async (page = 1) => {
  pagination.current = page;
  const params = {
    page: pagination.current,
    page_size: pagination.defaultPageSize,
    ...props.params,
    ...search.value,
    ...sort.value
  };
  const { data } = await props.api(params);
  if (data.error_code) return message.error(data.error_desc);
  dataList.value = data.result.creative_list;
  pagination.total = data.result.total;
};
const onRequest = ({ current, pageSize }, _filters, { field, order }, { action }) => {
  let page = 1;

  switch (action) {
    case 'sort':
      if (!order) {
        sort.value = {};
        break;
      }
      const orderMap = {
        ascend: 'asc',
        descend: 'desc'
      };
      sort.value = { sort_field: field, sort_order: orderMap[order] };
      break;
    case 'paginate':
      page = current;
      pagination.current = current;
      pagination.defaultPageSize = pageSize;
      break;
  }
  handleQuery(page);
};
const onSelectChange = (keys, rows) => {
  selected.value = keys;
  selectedRows.value = rows;
};
const highlightKeywords = val => {
  if (!val) return '';
  let keywords = [];
  const searchData = search.value;

  if (searchData.tag) {
    if (Array.isArray(searchData.tag)) {
      searchData.tag.forEach(t => {
        if (Array.isArray(t)) {
          keywords.push(t[t.length - 1]);
        } else {
          keywords.push(t);
        }
      });
    } else if (typeof searchData.tag === 'string') {
      keywords = searchData.tag.split(',');
    }

    // 去重并过滤空值
    keywords = [...new Set(keywords)].filter(k => k);

    if (keywords.length > 0) {
      // 转义正则特殊字符
      const safeKeywords = keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      const reg = new RegExp(safeKeywords.join('|'), 'gi');
      return val.replace(reg, match => `<span style="color: #ff4d4f; font-weight: bold;">${match}</span>`);
    }
  }
  return val;
};
const preview = (url, name) => {
  video.url = url;
  const isVideo = /\.(mp4|mov|avi|wmv|flv|mkv)$/i.test(name || url);
  video.type = isVideo ? 'video' : 'image';
  video.visible = true;
};
handleQuery(1);

defineExpose({
  selected,
  selectedRows
});
</script>
