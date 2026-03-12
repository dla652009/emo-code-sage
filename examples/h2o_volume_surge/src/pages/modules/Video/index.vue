<template>
  <div class="task-container">
    <SearchBar ref="searchBarRef" :schema="searchSchema" @search="handleSearch" @reset="handleReset" />
    <a-table
      :row-key="record => record.id"
      :columns="columns"
      :data-source="dataList"
      :pagination="pagination"
      :row-selection="rowSelection"
      @change="onRequest"
      :scroll="{ x: scrollX, y: scrollY, scrollToFirstRowOnChange: true }"
      :key="tableKey"
      class="my-table"
      size="small"
    >
      <template #title>
        <div class="flex">
          <div class="flex flex-1 text-lg items-center">
            <!-- <span class="mr-3">成片视频列表</span> -->
            <span class="text-sm mr-2 border-r border-[#bfbfbf] px-2"
              >已勾选 <span class="blue mr-1">{{ selected.length }}</span
              >条</span
            >
            <!-- <a-button type="link" @click="clearSelected()">清空已选</a-button> -->
            <div class="mr-2 text-sm flex gap-2">
              <div>
                上钩率：<span class="blue">{{ videoInsight?.hook_rate || '--' }} </span>
              </div>
              <div>
                总花费金额：<span class="blue"
                  >{{ videoInsight?.cost >= 0 ? Number(videoInsight?.cost).toLocaleString() : '--' }}
                </span>
              </div>
              <div>
                roi：<span class="blue">{{ videoInsight?.roi || '--' }}</span>
              </div>
              <div>
                链接点击率：<span class="blue">{{ videoInsight?.click_rate || '--' }} </span>
              </div>
              <div>
                付费率：<span class="blue">{{ videoInsight?.pay_rate || '--' }} </span>
              </div>
              <div>
                cpm：<span class="blue"
                  >{{ videoInsight?.cpm >= 0 ? Number(videoInsight?.cpm).toLocaleString() : '--' }}
                </span>
              </div>
            </div>
            <a-tooltip title="默认汇总近14天数据">
              <a-button
                type="primary"
                @click="getVideoInsight()"
                :loading="$isLoading('loading-insight')"
                size="small"
                class="flex items-center"
              >
                <template #icon><QuestionCircleOutlined /></template>
                汇总</a-button
              >
            </a-tooltip>
          </div>
          <div class="flex-none">
            <a-button class="mr-2" type="primary" @click="handleCreateTask()">创建任务</a-button>
          </div>
        </div>
      </template>
      <template #bodyCell="{ text, column, record }">
        <template v-if="column.dataIndex == 's3_url'">
          <a-button v-if="record.s3_url" type="link" @click="preview(record.s3_url)">点击预览</a-button>
        </template>
        <template v-else-if="['total_cost', 'cpm'].includes(column.dataIndex)">
          <!-- 千分位 -->
          <span class="blue">{{ text?.replace(/\B(?=(\d{3})+(?!\d))/g, ',') }}</span>
        </template>
        <template v-if="column.dataIndex === 'hook_tag'">
          <!-- 关键词高亮 -->
          <div v-if="record.hook_tag" class="flex flex-wrap gap-1">
            <a-tag v-for="item in record.hook_tag.split(',')" :key="item">
              <span v-html="highlightKeywords(item)"></span>
            </a-tag>
          </div>
          <span v-else>--</span>
        </template>
        <template v-if="column.dataIndex == 'project_id'">
          {{ projectOption.find(item => item.value === record.project_id)?.label || '--' }}
        </template>
        <template v-if="column.dataIndex == 'gender'">
          {{ genderOption.find(item => item.value === record.gender)?.label || '--' }}
        </template>
        <template v-if="column.dataIndex == 'lang'">
          {{ langOption.find(item => item.value === record.lang)?.label || '--' }}
        </template>
        <template v-if="column.dataIndex == 'op'">
          <a-button disabled="!record.s3_url" type="link" @click="handleCopy(record)">复制成片视频链接</a-button>
        </template>
      </template>
    </a-table>
    <a-modal :footer="null" v-model:open="Video.visible" v-if="Video.visible" class="flex justify-center">
      <video v-if="Video.type === 'video'" autoplay controls width="300" height="300">
        <source :src="Video.url" type="video/mp4" />
      </video>
      <img v-else :src="Video.url" style="max-width: 100%; max-height: 600px" />
    </a-modal>
    <CreateTaskModal v-model:open="createTaskModal.visible" :data="createTaskModal.data" />
  </div>
</template>
<script>
import * as Api from './api';
import { h } from 'vue';
import { mapGetters } from 'vuex';
import { channelOption } from '@/utils/const';
import tableScrollMixin from '@/mixins/tableScrollMixin';
import CreateTaskModal from '@/pages/modules/Task/components/create-task-modal.vue';
import { scopedLoadingMixin } from '@/mixins/scopedLoadingMixin';
import { QuestionCircleOutlined } from '@ant-design/icons-vue';

export default {
  name: 'Task',
  mixins: [tableScrollMixin, scopedLoadingMixin],
  components: {
    CreateTaskModal,
    QuestionCircleOutlined
  },
  data() {
    return {
      sort: {},
      search: {},
      range: [],
      dataList: [],
      pagination: {
        showTotal: total => {
          return h('div', null, [
            h('div', null, []),
            h('div', null, [
              h('span', null, '合计：'),
              h('span', { class: 'blue' }, `${total} `),
              h('span', null, '条')
            ])
          ]);
        },
        current: 1,
        defaultPageSize: 20,
        total: 0
      },
      Video: {
        visible: false,
        url: '',
        type: 'video'
      },
      createTaskModal: {
        visible: false,
        data: {}
      },
      fieldNames: {
        label: 'name',
        value: 'name',
        children: 'children'
      },
      tagsOption: [],
      creatorOption: [], // 创建人列表
      selected: [],
      selectedRows: [], // 全量数据
      rowSelection: { preserveSelectedRowKeys: true, selectedRowKeys: this.selected, onChange: this.onSelectChange },
      tableKey: 0,
      channelOption,
      videoInsight: null // 统计
    };
  },
  activated() {
    this.handleQuery(1);
  },
  computed: {
    searchSchema() {
      return [
        { label: '成片编号', field: 'task_log_unique_id' },
        { label: '成片名称', field: 'task_log_name' },
        { label: '任务编号', field: 'task_unique_id' },
        { label: '任务名称', field: 'task_name' },
        { label: '所属项目', field: 'project_id', type: 'select', options: this.projectOption },
        {
          label: 'Hook/成片库标签体系',
          field: 'hook_content_type',
          type: 'select',
          options: this.contentTypeOption
        },
        {
          label: 'Hook/成片库标签',
          field: 'hook_tag',
          type: 'cascader',
          options: this.tagLevelList,
          multiple: true,
          fieldNames: {
            label: 'name',
            value: 'name',
            children: 'children'
          },
          maxTagCount: 'responsive',
          showCheckedStrategy: 'SHOW_CHILD',
          expandTrigger: 'hover',
          showSearch: this.showSearch,
          transform: 'cascader-to-string'
        },
        {
          label: '筛选渠道',
          field: 'filter_channel',
          type: 'select',
          options: this.channelOption
        },
        {
          field: 'hook_rate',
          type: 'numberRange',
          placeholder: ['开始上钩率', '结束上钩率'],
          min: 1,
          max: 100,
          transform: 'number-range-to-start-end'
        },
        {
          field: 'cost',
          type: 'numberRange',
          placeholder: ['开始花费金额', '结束花费金额'],
          min: 1,
          transform: 'number-range-to-start-end'
        },
        {
          field: 'cpm',
          type: 'numberRange',
          placeholder: ['开始cpm金额', '结束cpm金额'],
          min: 1,
          transform: 'number-range-to-start-end'
        },
        {
          field: 'click_rate',
          type: 'numberRange',
          placeholder: ['开始点击率', '结束点击率'],
          min: 1,
          max: 100,
          transform: 'number-range-to-start-end'
        },
        {
          field: 'pay_rate',
          type: 'numberRange',
          placeholder: ['开始付费率', '结束付费率'],
          min: 1,
          max: 100,
          transform: 'number-range-to-start-end'
        },
        {
          field: 'roi',
          type: 'numberRange',
          placeholder: ['开始roi', '结束roi'],
          min: 1,
          max: 1000,
          transform: 'number-range-to-start-end'
        },
        { label: '投放人群性别', field: 'gender', type: 'select', options: this.genderOption },
        { label: '素材语言', field: 'lang', type: 'select', options: this.langOption },
        { label: 'Hook库素材文件名称', field: 'hook_creative_name' },
        { label: '卖点库素材文件名称', field: 'sell_creative_name' },
        { label: '尾页库素材文件名称', field: 'end_creative_name' },
        { label: '音乐库素材文件名称', field: 'music_creative_name' },
        { label: 'Hook/成片库素材师', field: 'hook_creative_author', type: 'select', options: this.authorOption },
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
    columns() {
      return [
        { title: '序号', fixed: 'left', width: 60, align: 'center', customRender: ({ index }) => index + 1 },
        { title: '成片视频', fixed: 'left', dataIndex: 's3_url', width: 90, align: 'center' },
        { title: '成片编号', fixed: 'left', dataIndex: 'task_log_unique_id', width: 150, align: 'center' },
        { title: '成片名称', fixed: 'left', dataIndex: 'task_log_name', width: 200, align: 'center' },
        {
          title: '任务编号',
          dataIndex: 'task_unique_id',
          width: 140,
          align: 'center',
          customRender: ({ text }) => text || '--'
        },
        {
          title: '任务名称',
          dataIndex: 'task_name',
          width: 200,
          align: 'center',
          customRender: ({ text }) => text || '--'
        },
        { title: '所属项目', dataIndex: 'project_id', width: 100, align: 'center' },
        {
          title: 'Hook/成片库标签体系',
          dataIndex: 'hook_content_type',
          width: 120,
          align: 'left',
          customRender: ({ text }) => this.contentTypeOption.find(item => item.value === text)?.label || '--'
        },
        { title: 'Hook/成片库标签', dataIndex: 'hook_tag', width: 150, align: 'left' },
        { title: 'Hook库素材拼接次数', dataIndex: 'hook_merge_count', width: 110, align: 'left' },
        { title: '筛选渠道', dataIndex: 'filter_channel_name', width: 130, align: 'left' },
        { title: '上钩率', dataIndex: 'hook_rate', width: 100, align: 'right', sorter: true },
        { title: '花费金额', dataIndex: 'total_cost', width: 110, align: 'right', sorter: true },
        { title: 'roi', dataIndex: 'roi', width: 100, align: 'right', sorter: true },
        { title: '链接点击率', dataIndex: 'click_rate', width: 120, align: 'right', sorter: true },
        { title: '付费率', dataIndex: 'payment_rate', width: 100, align: 'right', sorter: true },
        { title: 'cpm', dataIndex: 'cpm', width: 100, align: 'right', sorter: true },
        { title: '投放人群性别', dataIndex: 'gender', width: 120, align: 'left' },
        { title: '素材语言', dataIndex: 'lang', width: 100, align: 'left' },
        {
          title: 'Hook库素材文件名称',
          dataIndex: 'hook_creative_name',
          width: 200,
          align: 'left',
          customRender: ({ text }) => text || '--'
        },
        {
          title: '卖点库素材文件名称',
          dataIndex: 'sell_creative_name',
          width: 200,
          align: 'left',
          customRender: ({ text }) => text || '--'
        },
        {
          title: '尾页库素材文件名称',
          dataIndex: 'end_creative_name',
          width: 200,
          align: 'left',
          customRender: ({ text }) => text || '--'
        },
        {
          title: '音乐库素材文件名称',
          dataIndex: 'music_creative_name',
          width: 200,
          align: 'left',
          customRender: ({ text }) => text || '--'
        },
        {
          title: 'Hook/成片库素材师',
          dataIndex: 'hook_creative_author',
          width: 120,
          align: 'left',
          customRender: ({ text }) => text || '--'
        },
        { title: '创建人', dataIndex: 'creator', width: 100, align: 'left', customRender: ({ text }) => text || '--' },
        { title: '生成日期', dataIndex: 'create_time', width: 130, align: 'left' }
        // { title: '操作', fixed: "right", dataIndex: 'op', align: 'left', width: 150 },
      ];
    },
    showSearch() {
      return {
        limit: 999999,
        filter: (inputValue, path) => {
          return path.some(option => option.name.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);
        }
      };
    },
    ...mapGetters({
      authorOption: 'getAuthorOption',
      contentTypeOption: 'getContentTypeOption',
      creativeTypeOption: 'getCreativeTypeOption',
      genderOption: 'getGenderOption',
      langOption: 'getLangOption',
      projectOption: 'getProjectOption',
      taskCreatorOption: 'getTaskCreatorOption',
      tagLevelList: 'getTagLevelList'
    })
  },
  methods: {
    onSelectChange(keys, rows) {
      this.selected = keys;
      this.selectedRows = rows;
    },
    handleCreateTask() {
      // 创建任务
      if (!this.selectedRows.length) return this.$message.info('请先选择成片视频');
      this.createTaskModal.data = { type: 3, selected: this.selectedRows };
      this.createTaskModal.visible = true;
    },
    handleSearch(searchData) {
      this.search = searchData;
      this.handleQuery(1);
    },
    handleReset(searchData) {
      this.search = searchData;
      this.range = [];
      this.pagination.current = 1;
      this.pagination.defaultPageSize = 20;
      // this.clearSelected();
      this.handleQuery(1);
    },
    clearSelected() {
      if (!this.selected.length) return;
      this.selected = [];
      this.selectedRows = [];
      this.tableKey += 1; // 用于修复表格重置后选项不清除问题
    },
    async getVideoInsight() {
      try {
        const { data } = await Api.getVideoInsight(this.search, 'loading-insight');
        if (data.error_code) return this.$message.error(data.error_desc);
        this.videoInsight = data.result;
      } catch (error) {
        console.error(error);
      }
    },
    handleQuery(page = 1) {
      this.pagination.current = page;
      let params = {
        page: this.pagination.current,
        page_size: this.pagination.defaultPageSize,
        ...this.search,
        ...this.sort
      };
      Api.getVideoList(params).then(({ data }) => {
        if (data.error_code) return this.$message.error(data.error_desc);
        this.dataList = data.result.task_log_list;
        this.pagination.total = data.result.total;
      });
    },
    onRequest({ current, pageSize }, _filters, { field, order }, { action }) {
      let page = 1;
      switch (action) {
        case 'sort':
          if (!order) {
            this.sort = {};
            break;
          }
          const orderMap = {
            ascend: 'asc',
            descend: 'desc'
          };
          const filedMap = {
            total_cost: 'cost',
            payment_rate: 'pay_rate'
          };
          this.sort = { sort_field: filedMap[field] || field, sort_order: orderMap[order] };
          break;
        case 'paginate':
          page = current;
          this.pagination.current = current;
          this.pagination.defaultPageSize = pageSize;
          break;
      }
      this.handleQuery(page);
    },
    handleCopy(record) {
      navigator.clipboard.writeText(record.s3_url);
      this.$message.success('复制成功');
    },
    preview(url) {
      this.Video.url = url;
      const isVideo = /\.(mp4|mov|avi|wmv|flv|mkv)$/i.test(url);
      this.Video.type = isVideo ? 'video' : 'image';
      this.Video.visible = true;
    },
    highlightKeywords(val) {
      if (!val) return '';
      let keywords = [];
      const searchData = this.search;

      if (searchData.hook_tag) {
        if (Array.isArray(searchData.hook_tag)) {
          searchData.hook_tag.forEach(t => {
            if (Array.isArray(t)) {
              keywords.push(t[t.length - 1]);
            } else {
              keywords.push(t);
            }
          });
        } else if (typeof searchData.hook_tag === 'string') {
          keywords = searchData.hook_tag.split(',');
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
    }
  },
  watch: {
    $route() {
      this.clearSelected();
    }
  }
};
</script>

<style scoped>
.ant-cascader {
  width: 100%;
}
</style>
