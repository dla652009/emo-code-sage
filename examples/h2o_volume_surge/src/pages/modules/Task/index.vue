<template>
  <div class="task-container">
    <SearchBar ref="searchBarRef" :schema="searchSchema" @search="handleSearch" @reset="handleReset" />
    <a-table
      :row-key="record => record.id"
      :columns="columns"
      :data-source="dataList"
      :pagination="pagination"
      @change="onRequest"
      :scroll="{ x: scrollX, y: scrollY, scrollToFirstRowOnChange: true }"
      class="my-table"
      size="small"
    >
      <template #title>
        <div class="flex">
          <div class="flex-1 text-lg"></div>
          <div class="flex-none">
            <a-button class="mr-2" type="primary" @click="handleCreate()">创建任务</a-button>
          </div>
        </div>
      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex == 'project_id'">
          {{ projectOption.find(item => item.value === record.project_id)?.label }}
        </template>
        <template v-if="column.dataIndex == 'status'">
          <span class="mr-1"> {{ taskStatusOption.find(item => item.value === record.status)?.label }} </span>
          <a-popover v-if="record.status === 1">
            <template #content
              >广告创建进度：<span class="blue">{{ record.complete_num }}</span> /{{ record.output_num }}</template
            >
            <InfoCircleOutlined style="color: #1677ff" />
          </a-popover>
        </template>

        <template v-if="column.dataIndex == 'business_mode'">
          {{ businessModeOption.find(item => item.value === record.business_mode)?.label }}
        </template>
        <template v-if="column.dataIndex == 'merge_type'">
          {{ mergeTypeOption.find(item => item.value === record.merge_type)?.label }}
        </template>

        <template v-if="column.dataIndex == 'op'">
          <a-button v-if="record.status === 0" type="link" @click="handleEdit(record)">编辑</a-button>
          <!-- <a-button v-if="record.status === 0" type="link" @click="handleRun(record)">执行</a-button> -->
          <a-button type="link" @click="handleView(record)">查看</a-button>
          <a-button v-if="[0, 1, 2].includes(record.status)" type="link" @click="handleCopy(record)">复制</a-button>
          <a-button v-if="record.status === 1" type="link" @click="handleRefresh(record)">刷新</a-button>
          <a-button danger v-if="record.status === 0" type="link" @click="handleDelete(record)">删除</a-button>
        </template>
      </template>
      <template #expandedRowRender="{ record }">
        <a-table
          bordered
          :columns="innerColumns"
          :data-source="record.condition"
          :pagination="false"
          v-if="Array.isArray(record.condition)"
          style="margin: 6px"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex == 'creative_type'">
              {{ creativeTypeOption.find(item => item.value === record.creative_type)?.label }}
            </template>
            <template v-if="column.dataIndex == 'gender'">
              {{ record.creative_type < 3 ? genderOption.find(item => item.value === record.gender)?.label : '' }}
            </template>
            <template v-if="column.dataIndex == 'lang'">
              {{ record.creative_type < 3 ? langOption.find(item => item.value === record.lang)?.label : '' }}
            </template>
          </template>
        </a-table>
      </template>
    </a-table>
  </div>
  <CreateTaskModal v-model:open="taskModalVisible" :data="taskModalData" />
</template>
<script>
import * as Api from './api';
import { taskStatusOption, businessModeOption, mergeTypeOption, materialTypeOption } from '@/utils/const';
import { InfoCircleOutlined } from '@ant-design/icons-vue';
import { h } from 'vue';
import tableScrollMixin from '@/mixins/tableScrollMixin';
import CreateTaskModal from './components/create-task-modal.vue';
const mergeLogoOption = [
  {
    label: '是',
    value: 1
  },
  {
    label: '否',
    value: 0
  }
];
const COLUMNS = [
  { title: '序号', fixed: 'left', width: 60, align: 'left', customRender: ({ index }) => index + 1 },
  // { title: '序号',fixed: 'left', dataIndex: 'id', width:80, align: 'left' },
  { title: '任务编号', fixed: 'left', dataIndex: 'task_unique_id', width: 150, align: 'left' },
  { title: '任务名称', dataIndex: 'task_name', width: 200, align: 'center' },
  { title: '所属项目', dataIndex: 'project_id', width: 90, align: 'left' },
  { title: '业务模式', dataIndex: 'business_mode', width: 90, align: 'left' },
  { title: '拼接类型', dataIndex: 'merge_type', width: 90, align: 'left' },
  {
    title: '素材类型',
    dataIndex: 'merge_media_type',
    width: 100,
    align: 'left',
    customRender: ({ record }) =>
      record.merge_media_type ? materialTypeOption.find(item => item.value === record.merge_media_type)?.label : '--'
  },
  {
    title: '图片拼接logo',
    dataIndex: 'is_image_watermark',
    width: 100,
    align: 'left',
    customRender: ({ record }) => {
      if (record.merge_media_type === 1) return '--';
      return record.is_image_watermark ? '是' : '否';
    }
  },
  { title: 'bm-id', dataIndex: 'ad_bm_id', width: 170, align: 'left' },
  { title: '广告账户', dataIndex: 'ad_account', width: 170, align: 'left' },
  { title: 'campaign数量', dataIndex: 'campaign_num', width: 130, align: 'left' },
  { title: 'ad-sets数量/campaign', dataIndex: 'per_campaign_adset_num', width: 120, align: 'left' },
  { title: 'ads数量/每个ad-sets', dataIndex: 'per_adset_ad_num', width: 120, align: 'left',customRender: ({ record }) => record.per_adset_ad_num || '--' },
  { title: '任务状态', dataIndex: 'status', width: 100, align: 'left' },
  { title: '创建人', dataIndex: 'creator', width: 90, align: 'left' },
  { title: '创建日期', dataIndex: 'create_time', width: 130, align: 'left' },
  { title: '操作', fixed: 'right', dataIndex: 'op', align: 'left', width: 185 }
];
const INNER_COLUMNS = [
  { title: '素材库', dataIndex: 'creative_type', width: 100, align: 'left' },
  { title: '素材师', dataIndex: 'author', align: 'left', width: 150 },
  { title: '素材权重', dataIndex: 'weight', width: 100, align: 'left' },
  { title: '投放人群性别', dataIndex: 'gender', width: 100, align: 'left' },
  { title: '素材语言', dataIndex: 'lang', width: 100, align: 'left' },
  { title: '素材标签', dataIndex: 'tags', width: 200, align: 'left' }
];
export default {
  name: 'Task',
  components: { InfoCircleOutlined, CreateTaskModal },
  mixins: [tableScrollMixin],
  data() {
    return {
      columns: COLUMNS,
      innerColumns: INNER_COLUMNS,
      search: {},
      taskStatusOption,
      businessModeOption,
      mergeTypeOption,
      materialTypeOption,
      range: [],
      dataList: [],
      taskModalData: {},
      taskModalVisible: false,
      pagination: {
        showTotal: total =>
          h('div', null, [h('span', null, '合计：'), h('span', { class: 'blue' }, `${total} `), h('span', null, '条')]),
        current: 1,
        defaultPageSize: 20,
        total: 0
      }
    };
  },
  activated() {
    this.handleQuery(1);
  },
  computed: {
    searchSchema() {
      return [
        { label: '任务编号', field: 'task_unique_id' },
        { label: '任务名称', field: 'task_name' },
        { label: '所属项目', field: 'project_id', type: 'select', options: this.projectOption },
        { label: '业务模式', field: 'business_mode', type: 'select', options: this.businessModeOption },
        { label: '拼接类型', field: 'merge_type', type: 'select', options: this.mergeTypeOption },
        { label: '素材类型', field: 'merge_media_type', type: 'select', options: this.materialTypeOption },
        { label: '图片拼接logo', field: 'is_image_watermark', type: 'select', options: mergeLogoOption },
        { label: 'bm-id', field: 'ad_bm_id' },
        { label: '广告账户', field: 'ad_account' },
        {
          label: '任务状态',
          field: 'status',
          type: 'select',
          options: this.taskStatusOption.filter(item => item.value !== 3)
        },
        { label: '创建人', field: 'creator', type: 'select', options: this.taskCreatorOption },
        {
          label: '创建日期',
          field: 'created_time',
          type: 'rangePicker',
          format: 'YYYY-MM-DD',
          valueFormat: 'YYYY-MM-DD HH:mm:ss',
          transform: 'range-to-start-end'
        }
      ];
    },
    authorOption() {
      return this.$store.getters.getAuthorOption;
    },
    creativeTypeOption() {
      return this.$store.getters.getCreativeTypeOption;
    },
    genderOption() {
      return this.$store.getters.getGenderOption;
    },
    langOption() {
      return this.$store.getters.getLangOption;
    },
    projectOption() {
      return this.$store.getters.getProjectOption;
    },
    taskCreatorOption() {
      return this.$store.getters.getTaskCreatorOption;
    }
  },
  methods: {
    handleCreate() {
      this.taskModalData = { type: 1 };
      this.taskModalVisible = true;
    },
    handleSearch(searchData) {
      this.search = searchData;
      this.handleQuery(1);
    },
    handleReset(searchData) {
      this.search = searchData;
      this.pagination.current = 1;
      this.pagination.defaultPageSize = 20;
      this.handleQuery(1);
    },
    handleQuery(page = 1) {
      this.pagination.current = page;
      const params = {
        page: this.pagination.current,
        page_size: this.pagination.defaultPageSize,
        ...this.search
      };
      Api.getTaskList(params).then(({ data }) => {
        if (data.error_code) return this.$message.error(data.error_desc);
        this.dataList = data.result.task_list;
        this.pagination.total = data.result.total;
      });
    },
    onRequest(pagination) {
      this.pagination.current = pagination.current;
      this.pagination.defaultPageSize = pagination.pageSize;
      this.handleQuery(pagination.current);
    },
    async handleRefresh(record) {
      try {
        const { data } = await Api.refreshTaskProgress({ id: record.id });
        if (data.error_code) return this.$message.error(data.error_desc);
        this.$message.success('刷新成功');
        const { complete_num, task_status } = data.result;
        record.complete_num = complete_num;
        record.status = task_status;
      } catch (error) {
        this.$message.error('刷新失败');
      }
    },
    handleDelete(record) {
      let me = this;
      me.$confirm({
        title: '提示',
        content: '确定删除所选任务吗？',
        onOk() {
          Api.deleteTask({ ids: record.id }).then(({ data }) => {
            if (data.error_code) return me.$message.error(data.error_desc);
            me.$message.success('删除成功');
            me.handleQuery(me.pagination.current);
          });
        },
        onCancel() {}
      });
    },
    handleView(record) {
      this.$router.push({
        name: '查看任务',
        params: {
          id: record.id,
          type: record.merge_type
        }
      });
    },
    handleEdit(record) {
      this.$router.push({
        name: '编辑任务',
        params: {
          id: record.id,
          type: record.merge_type
        }
      });
    },
    handleRun(record) {
      let me = this;
      me.$confirm({
        title: '提示',
        content: '确定执行所选任务吗？',
        onOk() {
          Api.runTask({ id: record.id }).then(({ data }) => {
            if (data.error_code) return me.$message.error(data.error_desc);
            me.$message.success('执行成功');
            me.handleQuery(me.pagination.current);
          });
        },
        onCancel() {}
      });
    },
    handleCopy(record) {
      const { id, task_name, project_id, business_mode, merge_type, is_image_watermark, merge_media_type } = record;
      this.taskModalData = {
        id,
        type: merge_type,
        rawData: {
          task_name,
          project_id,
          business_mode,
          merge_type,
          merge_media_type: merge_media_type || null,
          is_image_watermark: merge_media_type !== 1 ? is_image_watermark : null
        }
      };
      this.taskModalVisible = true;
    }
  }
};
</script>
