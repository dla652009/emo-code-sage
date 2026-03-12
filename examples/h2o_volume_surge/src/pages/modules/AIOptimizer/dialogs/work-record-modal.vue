<template>
  <a-modal title="工作记录" width="80%" @cancel="handleCancel">
    <a-table
      :columns="columns"
      :data-source="tableState"
      :pagination="false"
      size="small"
      :scroll="{ y: 200 }"
      :loading="loading"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'op'">
          <a-button type="link" @click="handleCheckRecord(record)">查看记录</a-button>
          <a-button v-if="record.status === 4" type="link" @click="handleCheckTask(record)">查看任务</a-button>
        </template>
      </template>
    </a-table>
    <template #footer>
      <a-button @click="handleCancel">关闭</a-button>
    </template>
  </a-modal>
</template>

<script setup>
import { message } from 'ant-design-vue';
import { getOperationLogList } from '../api.js';
import { useScopedLoading } from '@/composables/useScopedLoading.js';
const router = useRouter();
const { loading } = useScopedLoading('loading-record-list');
const columns = computed(() => [
  { title: '序号', dataIndex: 'id', width: 80, align: 'left' },
  { title: '类型', dataIndex: 'operation_type', width: 100, align: 'left' },
  { title: '概览', dataIndex: 'operation_summary', width: 250, align: 'left' },
  { title: '创建时间', dataIndex: 'create_time', width: 120, align: 'left' },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    align: 'left',
    customRender: ({ text }) => ['对话思考中', '新建任务中', '任务执行中', '任务执行完毕'][text - 1]
  },
  { title: '操作', fixed: 'right', dataIndex: 'op', align: 'left', width: 130 }
]);
const emit = defineEmits(['update:open', 'update:data', 'go']);
const props = defineProps({
  data: {
    type: Object,
    default: () => ({})
  }
});

const tableState = ref([]);

const getList = async () => {
  try {
    const { data } = await getOperationLogList({ work_id: props.data.id }, 'loading-record-list');
    if (data.error_code) return message.error(data.error_desc);
    tableState.value = data.result || [];
  } catch (error) {
    console.error(error);
    message.error('获取工作记录失败');
  }
};
const handleCheckRecord = record => {
  emit('go', { work_id: record.work_id, operation_id: record.id, status: record.status });
  handleCancel();
};
const handleCheckTask = () => {
  handleCancel();
  router.push({ name: 'TaskList' });
};
const handleCancel = () => {
  emit('update:open', false);
  tableState.value = [];
};
watch(
  () => props.data,
  data => {
    if (!data?.id) return;
    getList();
  }
);
</script>
