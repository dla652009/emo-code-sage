<!-- AI优化师管理 -->
<template>
  <div class="">
    <a-table
      :row-key="record => record.id"
      :columns="columns"
      :data-source="tableState"
      :pagination="false"
      class="my-table"
    >
      <template #title>
        <div class="flex">
          <div class="flex-1 text-lg"></div>
          <div class="flex-none"></div>
        </div>
      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex == 'op'">
          <a-button type="link" @click="handleSwitch(record)">{{ ['关闭', '开启'][record.status - 1] }}</a-button>
          <a-button type="link" @click="handleCheck(record)">查看工作</a-button>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup>
import { message, Modal } from 'ant-design-vue';
import { getAiOptimizerList, switchStatus } from './api.js';

const router = useRouter();
const columns = computed(() => [
  { title: '优化师名称', dataIndex: 'optimizer_name', width: 100, align: 'left' },
  { title: '职能范围', dataIndex: 'optimizer_function', width: 250, align: 'left' },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    align: 'left',
    customRender: ({ text }) => ['工作中', '已关闭'][text - 1]
  },
  { title: '操作', fixed: 'right', dataIndex: 'op', align: 'left', width: 100 }
]);

const tableState = ref([]);

const getList = async () => {
  try {
    const { data } = await getAiOptimizerList();
    if (data.error_code) return message.error(data.error_desc);
    tableState.value = data.result || [];
  } catch (error) {
    console.error(error);
    message.error('获取优化师列表失败');
  }
};
const handleSwitch = async record => {
  try {
    Modal.confirm({
      title: '确认操作',
      content: `确认${['关闭', '开启'][record.status - 1]}优化师${record.optimizer_name}吗？`,
      okText: '确认',
      okType: 'danger',
      onOk: async () => {
        const { data } = await switchStatus({ optimizer_id: record.id, status: record.status === 1 ? 2 : 1 });
        if (data.error_code) return message.error(data.error_desc);
        message.success('操作成功');
        getList();
      }
    });
  } catch (error) {
    console.error(error);
    message.error('操作失败');
  }
};
const handleCheck = record => {
  router.push({
    path: 'work',
    query: { optimizer_id: record.id }
  });
};
onActivated(() => {
  getList();
});
</script>
<style scoped></style>
