<!-- AI优化师管理 -->
<template>
  <div class="task-container">
    <SearchBar
      ref="searchBarRef"
      :schema="searchSchema"
      :default-values="defaultSearchValues"
      @search="handleSearch"
      @reset="handleReset"
    />
    <a-table
      :row-key="record => record.id"
      :columns="columns"
      :data-source="tableState"
      :pagination="pagination"
      :scroll="{ x: scrollX, y: scrollY, scrollToFirstRowOnChange: true }"
      @change="handleTableChange"
      class="my-table"
      size="small"
    >
      <template #title>
        <div class="flex">
          <div class="flex-1 text-lg"></div>
          <div class="flex-none">
            <a-button class="mr-2" type="primary" @click="handleAdd()">新增工作</a-button>
          </div>
        </div>
      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'overview'">
          <div v-if="record.adset_id">【adset_id】：{{ record.adset_id }}</div>
          <div v-if="record.campaign_id">【campaign】：{{ record.campaign_id }}</div>
          <div>【预算】：{{ record.budget_amount }}</div>
        </template>
        <template v-else-if="column.dataIndex === 'op'">
          <a-button type="link" @click="handleCheck(record)">查看记录</a-button>
          <a-button danger type="link" @click="handleEnd(record)" v-if="record.status === 1">结束工作</a-button>
        </template>
      </template>
    </a-table>
  </div>
  <workCreateModal
    ref="workCreateModalRef"
    v-model:open="modal.createVisible"
    :data="modal.createModalData"
    @refresh="getList"
    @go="handleGo"
  />
  <workRecordModal
    ref="workRecordModalRef"
    v-model:open="modal.recordVisible"
    :data="modal.recordModalData"
    @go="handleGo"
  />
</template>

<script setup>
import { message, Modal } from 'ant-design-vue';
import { getAiWorkList, getAiOptimizerList, stopWork } from './api.js';
import workRecordModal from './dialogs/work-record-modal.vue';
import workCreateModal from './dialogs/work-create-modal.vue';
import { useTableScroll } from '@/composables/useTableScroll';
const route = useRoute();
const router = useRouter();
const columns = computed(() => [
  { title: '序号', dataIndex: 'id', width: 80, align: 'left' },
  { title: '优化师', dataIndex: 'optimizer_name', width: 100, align: 'left' },
  { title: '工作概览', dataIndex: 'overview', width: 250, align: 'left' },
  { title: '创建时间', dataIndex: 'create_time', width: 120, align: 'left' },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    align: 'left',
    customRender: ({ text }) => ['工作中', '已暂停'][text - 1]
  },
  { title: '操作', fixed: 'right', dataIndex: 'op', align: 'left', width: 130 }
]);
const searchData = ref({});
const defaultSearchValues = ref({});
const pagination = reactive({
  showTotal: total =>
    h('div', null, [h('span', null, '合计：'), h('span', { class: 'blue' }, `${total} `), h('span', null, '条')]),
  current: 1,
  defaultPageSize: 20,
  total: 0
});

const modal = reactive({
  createVisible: false,
  recordVisible: false,
  createModalData: null,
  recordModalData: null
});

const optimizersList = ref([]);
const tableState = ref([]);

const { scrollX, scrollY, searchBarRef } = useTableScroll({
  dataListRef: tableState
});

const searchSchema = computed(() => [
  { label: 'AI优化师', field: 'optimizer_id', type: 'select', options: optimizersList.value }
]);

const handleTableChange = () => {};

const handleAdd = () => {
  modal.createVisible = true;
};
const handleCheck = record => {
  modal.recordVisible = true;
  modal.recordModalData = { id: record.id };
};
const handleEnd = record => {
  Modal.confirm({
    title: '确认操作',
    content: '确认结束工作吗？',
    okText: '确认',
    okType: 'danger',
    onOk: async () => {
      try {
        const { data } = await stopWork({ work_id: record.id });
        if (data.error_code) return message.error(data.error_desc);
        message.success('结束工作成功');
        getList();
      } catch (error) {
        console.error(error);
        message.error('结束工作失败');
      }
    }
  });
};
const handleSearch = params => {
  searchData.value = params;
  getList(1);
};
const handleReset = params => {
  searchData.value = params;
  pagination.current = 1;
  pagination.defaultPageSize = 20;
  const query = { ...route.query };
  if ('optimizer_id' in query) delete query.optimizer_id;
  try {
    if (route.name) {
      sessionStorage.removeItem(`PERSIST_QUERY_${route.name}`);
    }
  } catch {}
  router.replace({
    path: route.path,
    query
  });
  getList();
};

const getOptimizersList = async () => {
  try {
    const { data } = await getAiOptimizerList();
    if (data.error_code) return message.error(data.error_desc);
    optimizersList.value = data.result.map(item => ({ label: item.optimizer_name, value: item.id })) || [];
    modal.createModalData = {
      options: data.result
        .filter(item => item.status === 1)
        .map(item => ({ label: item.optimizer_name, value: item.id }))
    };
  } catch (error) {
    console.error(error);
    message.error('获取优化师列表失败');
  }
};

const getList = async (page = 1) => {
  try {
    pagination.current = page;
    const params = {
      page: pagination.current,
      page_size: pagination.defaultPageSize,
      ...searchData.value
    };
    const { data } = await getAiWorkList(params);
    if (data.error_code) return message.error(data.error_desc);
    tableState.value = data.result.work_list || [];
    pagination.total = data.result.total || 0;
  } catch (error) {
    console.error(error);
    message.error('获取AI优化工作列表失败');
  }
};

const handleGo = query => {
  router.push({
    path: 'workRecord',
    query
  });
};

const initSearchData = () => {
  const optimizerId = route.query.optimizer_id;
  if (!optimizerId) return;
  const numericId = Number(optimizerId);
  const value = Number.isNaN(numericId) ? optimizerId : numericId;
  defaultSearchValues.value = { optimizer_id: value };
  searchData.value = { optimizer_id: value };
};
onActivated(() => {
  initSearchData();
  getOptimizersList();
  getList();
});
</script>
<style scoped></style>
