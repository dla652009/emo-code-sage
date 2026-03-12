<template>
  <div class="creative-list-container">
    <SearchBar
      ref="searchBarRef"
      :schema="searchSchema"
      @search="handleSearch"
      @reset="handleReset"
      class="rounded-t-none"
    />
    <a-table
      :row-key="record => record.id"
      :row-selection="rowSelection"
      :columns="columns"
      :data-source="dataList"
      :pagination="pagination"
      @change="onRequest"
      :scroll="{ x: scrollX, y: scrollY, scrollToFirstRowOnChange: true }"
      :key="tableKey"
      class="my-table"
      size="small"
    >
      <template #title>
        <div class="flex">
          <div class="flex flex-1 text-lg items-center">
            <!-- <span class="mr-3">素材列表</span> -->
            <span class="text-sm mr-2"
              >已勾选 <span class="blue mr-1">{{ selected.length }}</span
              >条</span
            >
            <a-button type="link" @click="clearSelected()">清空已选</a-button>
          </div>
          <div class="flex-none">
            <a-button class="mr-2" type="primary" @click="handleUpload()">批量上传</a-button>
            <a-button class="mr-2" type="primary" @click="handleCreateTask()">创建任务</a-button>
            <a-button class="mr-2" :disabled="selected.length === 0" type="primary" @click="handleDelete()"
              >批量删除</a-button
            >
            <a-button class="mr-2" :disabled="selected.length === 0" type="primary" @click="handleBatchWeight()"
              >批量修改权重</a-button
            >
          </div>
        </div>
      </template>
      <template #headerCell="{ column }">
        <template v-if="column.dataIndex === 'not_match_tag'">
          <span>
            未匹配标签
            <a-tooltip>
              <template #title>
                处理方案：<br />1、修改素材名称重新匹配标签；<br />2、将未匹配标签创建为系统标签。
              </template>
              <QuestionCircleOutlined style="color: #faad14" />
            </a-tooltip>
          </span>
        </template>
      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'creative_url'">
          <a-button type="link" @click="preview(record)">点击预览</a-button>
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
        <!-- <template v-if="column.dataIndex === 'tag'">
          <div v-html="highlightKeywords(record.tag)"></div>
        </template> -->
        <template v-else-if="column.dataIndex === 'tag'">
          <div class="flex flex-wrap gap-1">
            <template v-if="record.tag">
              <a-tag v-for="item in record.tag.split(',')" :key="item">
                <span v-html="highlightKeywords(item)"></span>
              </a-tag>
            </template>
            <span v-else>--</span>
          </div>
        </template>
        <template v-else-if="column.dataIndex === 'not_match_tag'">
          <template v-if="record.not_match_tag">
            <div class="flex flex-wrap gap-1 items-center">
              <a-tag v-for="item in record.not_match_tag.split(',')" :key="item" color="orange">
                {{ item }}
              </a-tag>
              <a-button
                type="primary"
                shape="circle"
                size="small"
                class="flex items-center justify-center add-tag-btn"
                @click="handleAddTag(record)"
              >
                <PlusOutlined />
              </a-button>
            </div>
          </template>
          <span v-else>--</span>
        </template>
        <template v-else-if="column.dataIndex === 'op'">
          <a-button v-if="record.status !== 2" type="link" @click="handleEdit(record)">编辑</a-button>
          <a-button v-if="record.status !== 2" type="link" @click="handleWeight(record)">修改权重</a-button>
          <a-button type="link" @click="handleStatus(record)">{{ record.status === 3 ? '启用' : '禁用' }}</a-button>
          <a-button type="link" @click="handleWeightHistory(record)">权重历史</a-button>
          <a-button type="link" @click="handleCopy(record)">复制链接</a-button>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script>
import * as Api from '../api';
import { weightOption, creativeStatusOption, mergeStatusOption, mediaTypeOption } from '@/utils/const';
import dayjs from 'dayjs';
import { h } from 'vue';
import { mapGetters } from 'vuex';
import { InfoCircleOutlined, PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons-vue';
import tableScrollMixin from '@/mixins/tableScrollMixin';
export default {
  name: 'CreativeList',
  mixins: [tableScrollMixin],
  components: { InfoCircleOutlined, PlusOutlined, QuestionCircleOutlined },
  props: {
    contentType: {
      type: Number,
      required: true
    }
  },
  emits: ['upload', 'preview', 'weight', 'batch-weight', 'weight-history', 'add-tag', 'create-task'],
  data() {
    return {
      sort: {},
      search: {},
      weightOption,
      mediaTypeOption,
      mergeStatusOption,
      creativeStatusOption,
      dataList: [],
      pagination: {
        showTotal: total =>
          h('div', null, [h('span', null, '合计：'), h('span', { class: 'blue' }, `${total} `), h('span', null, '条')]),
        current: 1,
        defaultPageSize: 20,
        total: 0
      },
      selected: [],
      selectedRows: [],
      rowSelection: { preserveSelectedRowKeys: true, selectedRowKeys: this.selected, onChange: this.onSelectChange },
      tableKey: 0,
      // 缓存标签列表，避免重复计算
      tagLevelListCache: new Map()
    };
  },
  activated() {
    this.handleQuery(this.pagination.current);
  },
  computed: {
    isHasSystem() {
      return this.contentType > 0;
    },
    optionMaps() {
      const createMap = options => new Map(options.map(item => [item.value, item.label]));
      return {
        creativeType: createMap(this.creativeTypeOption),
        contentType: createMap(this.contentTypeOption),
        gender: createMap(this.genderOption),
        lang: createMap(this.langOption),
        status: createMap(this.creativeStatusOption),
        mediaType: createMap(this.mediaTypeOption)
      };
    },
    columns() {
      const isSortDisabled = this.search.tag && this.search.tag.length > 0;
      const getSortOrder = field => {
        if (isSortDisabled) return false;
        if (this.sort.sort_field === field) {
          return this.sort.sort_order === 'asc' ? 'ascend' : 'descend';
        }
        return false;
      };
      return [
        { title: '序号', fixed: 'left', width: 60, align: 'left', customRender: ({ index }) => index + 1 },
        { title: '素材切片', fixed: 'left', dataIndex: 'creative_url', width: 90, align: 'left' },
        { title: '素材编号', dataIndex: 'creative_unique_id', width: 140, align: 'left' },
        {
          title: '素材文件名称',
          dataIndex: 'creative_name',
          width: 200,
          align: 'center',
          sorter: !isSortDisabled,
          sortOrder: getSortOrder('creative_name')
        },
        { title: '素材标签', dataIndex: 'tag', width: 200, align: 'left' },
        { title: '未匹配标签', dataIndex: 'not_match_tag', width: 200, align: 'left' },
        {
          title: '标签体系',
          dataIndex: 'content_type',
          width: 90,
          align: 'left',
          customRender: ({ text }) => this.optionMaps.contentType.get(text)
        },
        {
          title: '素材格式',
          dataIndex: 'media_type',
          width: 90,
          align: 'left',
          customRender: ({ text }) => this.optionMaps.mediaType.get(text)
        },
        {
          title: '素材库',
          dataIndex: 'creative_type',
          width: 90,
          align: 'left',
          customRender: ({ text }) => this.optionMaps.creativeType.get(text)
        },
        { title: '素材权重', dataIndex: 'weight', width: 90, align: 'left' },
        { title: '素材师', dataIndex: 'author_name', width: 120, align: 'left' },
        {
          title: '投放人群性别',
          dataIndex: 'gender',
          width: 120,
          align: 'left',
          customRender: ({ text }) => this.optionMaps.gender.get(text)
        },
        {
          title: '素材语言',
          dataIndex: 'lang',
          width: 90,
          align: 'left',
          customRender: ({ text }) => this.optionMaps.lang.get(text)
        },
        {
          title: '拼接状态',
          dataIndex: 'merge_status',
          width: 90,
          align: 'left',
          customRender: ({ text }) => ['未拼接', '已拼接'][text]
        },
        {
          title: '拼接次数',
          dataIndex: 'merge_count',
          width: 110,
          align: 'left',
          sorter: !isSortDisabled,
          sortOrder: getSortOrder('merge_count')
        },
        {
          title: '已上传天数',
          dataIndex: 'upload_days',
          width: 120,
          align: 'left',
          sorter: !isSortDisabled,
          sortOrder: getSortOrder('upload_days')
        },
        { title: '创建人', dataIndex: 'creator', width: 80, align: 'left' },
        {
          title: '创建日期',
          dataIndex: 'create_time',
          width: 120,
          align: 'left',
          sorter: !isSortDisabled,
          sortOrder: getSortOrder('create_time')
        },
        {
          title: '素材状态',
          fixed: 'right',
          dataIndex: 'status',
          width: 90,
          align: 'left',
          customRender: ({ text }) => this.optionMaps.status.get(text)
        },
        { title: '操作', fixed: 'right', dataIndex: 'op', align: 'left', width: 180 }
      ];
    },
    searchSchema() {
      return [
        { label: '素材编号', field: 'creative_unique_id' },
        { label: '素材文件名', field: 'creative_name' },
        {
          label: '标签体系',
          field: 'content_type',
          type: 'select',
          options: this.contentTypeOption,
          hidden: this.contentType > 0
        },
        { label: '素材格式', field: 'media_type', type: 'select', options: this.mediaTypeOption },
        { label: '素材库', field: 'creative_type', type: 'select', options: this.creativeTypeOption },
        { label: '素材权重', field: 'weight', type: 'select', options: this.weightOption },
        {
          label: '素材师',
          field: 'author_id',
          type: 'select',
          options: this.authorOption,
          mode: 'multiple',
          transform: 'array-to-string'
        },
        { label: '投放人群性别', field: 'gender', type: 'select', options: this.genderOption },
        { label: '素材语言', field: 'lang', type: 'select', options: this.langOption },
        {
          label: '素材标签',
          field: 'tag',
          type: 'cascader',
          options: this.tagLevelListByContentType(),
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
        { label: '素材拼接状态', field: 'merge_status', type: 'select', options: this.mergeStatusOption },
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
        {
          label: '素材状态',
          field: 'status',
          type: 'select',
          options: this.creativeStatusOption.filter(item => item.value !== 2)
        },
        { label: '创建人', field: 'creator', type: 'select', options: this.creativeCreatorOption },
        {
          label: '创建日期',
          field: 'created_time',
          type: 'rangePicker',
          format: 'YYYY-MM-DD',
          valueFormat: 'YYYY-MM-DD HH:mm:ss',
          transform: 'range-to-start-end',
          allowEmpty: [true, true],
          placeholder: ['开始日期', '结束日期']
        }
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
      creativeTypeOption: 'getCreativeTypeOption',
      contentTypeOption: 'getContentTypeOption',
      genderOption: 'getGenderOption',
      langOption: 'getLangOption',
      projectOption: 'getProjectOption',
      creativeCreatorOption: 'getCreativeCreatorOption',
      tagLevelList: 'getTagLevelList'
    })
  },
  methods: {
    tagLevelListByContentType() {
      if (!this.contentType) {
        return this.tagLevelList;
      }

      const cacheKey = `search_${this.contentType}`;

      if (this.tagLevelListCache.has(cacheKey)) {
        return this.tagLevelListCache.get(cacheKey);
      }

      const levelList = this.tagLevelList.filter(tag => tag.content_type === this.contentType);
      const finalResult = levelList?.[0]?.children || [];

      this.tagLevelListCache.set(cacheKey, finalResult);

      return finalResult;
    },
    onSelectChange(keys, rows) {
      this.selected = keys;
      this.selectedRows = rows;
    },
    handleSearch(searchData) {
      this.search = searchData;
      if (this.search.tag && this.search.tag.length) {
        this.sort = {};
      }
      this.handleQuery(1);
    },
    handleReset(searchData) {
      this.search = searchData;
      this.pagination.current = 1;
      this.pagination.defaultPageSize = 20;
      this.handleQuery(1);
    },
    clearSelected() {
      if (!this.selected.length) return;
      this.selected = [];
      this.selectedRows = [];
      this.tableKey += 1;
    },
    handleQuery(page = 1) {
      this.pagination.current = page;
      const params = {
        page: this.pagination.current,
        page_size: this.pagination.defaultPageSize,
        ...this.search,
        ...this.sort
      };
      if (this.isHasSystem) params.content_type = this.contentType;
      Api.getCreativeList(params).then(({ data }) => {
        if (data.error_code) return this.$message.error(data.error_desc);
        this.dataList = data.result.creative_list;
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
          this.sort = { sort_field: field, sort_order: orderMap[order] };
          break;
        case 'paginate':
          page = current;
          this.pagination.current = current;
          this.pagination.defaultPageSize = pageSize;
          break;
      }
      this.handleQuery(page);
    },
    preview(record) {
      this.$emit('preview', { url: record.creative_url, name: record.creative_name });
    },
    handleUpload() {
      this.$emit('upload', this.contentType);
    },
    handleCreateTask() {
      const CREATIVE_TYPE_FINISHED = 5;
      const STATUS_DELETED = 2;
      const STATUS_DISABLED = 3;
      if (!this.selectedRows.length) return this.$message.info('未勾选素材 请先选择成片素材');
      if (this.selectedRows.some(item => item.status === STATUS_DELETED))
        return this.$message.info('已勾选的素材包含了"已删除"素材，请重新调整。');
      const notCompletedIds = this.selectedRows
        .filter(item => item.creative_type !== CREATIVE_TYPE_FINISHED)
        .map(item => `【${item.creative_unique_id}】`);
      const disabledIds = this.selectedRows
        .filter(item => item.status === STATUS_DISABLED)
        .map(item => `【${item.creative_unique_id}】`);
      const contentType = this.selectedRows[0].content_type;
      if (this.selectedRows.some(item => item.content_type !== contentType)) {
        this.$message.info('请选择相同标签体系下的成片素材');
        // this.clearSelected();
        return;
      }

      const tipNodes = this.getTips(notCompletedIds, disabledIds);

      if (notCompletedIds.length || disabledIds.length) {
        this.$message.info(tipNodes);
        return;
      }
      this.$emit('create-task', this.selectedRows);
    },
    getTips(notCompletedIds, disabledIds) {
      let tips = [];
      if (notCompletedIds.length) {
        tips = ['已勾选素材包含了非成片素材', notCompletedIds.toString(), '，请重新调整'];
      } else if (disabledIds.length) {
        tips = ['已勾选素材包含了已禁用素材', disabledIds.toString(), '，请重新调整'];
      }
      const nodes = h('div', null, [
        h('span', null, tips[0]),
        h('span', { class: 'blue' }, tips[1]),
        h('span', null, tips[2])
      ]);
      return nodes;
    },
    handleDelete() {
      this.$confirm({
        title: '提示',
        content: '确定删除所选素材吗？若包含已拼接素材不可删除将执行禁用',
        onOk: () => {
          Api.deleteCreative({ ids: this.selected.join(',') }).then(({ data }) => {
            if (data.error_code) return this.$message.error(data.error_desc);
            this.handleQuery(this.pagination.current);
            this.clearSelected();
            this.$message.success('删除成功');
          });
        },
        onCancel() {}
      });
    },
    handleBatchWeight() {
      let selectedList = this.dataList.filter(item => this.selected.includes(item.id));
      let hasDeleteList = [];
      selectedList.map(item => {
        if (item.status == 2) hasDeleteList.push(item.creative_unique_id);
      });
      const tipsNods = h('div', null, [
        h('span', null, '素材'),
        h(
          'span',
          { class: 'blue' },
          hasDeleteList.map(item => `【${item}】`)
        ),
        h('span', null, '已删除，不可修改权重，请重新勾选')
      ]);
      if (hasDeleteList.length > 0) return this.$message.error(tipsNods);

      this.$emit('batch-weight', {
        ids: this.selected.join(','),
        isMulti: true
      });
    },
    handleEdit(record) {
      this.$router.push({
        name: '编辑素材',
        params: { id: record.id }
      });
    },
    handleWeight(record) {
      this.$emit('weight', {
        ids: record.id,
        currentWeight: record.weight,
        creative_unique_id: record.creative_unique_id,
        creative_name: record.creative_name,
        date: dayjs(new Date()),
        isMulti: false
      });
    },
    handleStatus(record) {
      this.$confirm({
        title: '提示',
        content: `确定${record.status === 3 ? '启用' : '禁用'}素材吗？`,
        onOk: () => {
          Api.updateStatus({
            ids: record.id,
            status: record.status === 3 ? 1 : 3
          }).then(({ data }) => {
            if (data.error_code) return this.$message.error(data.error_desc);
            this.handleQuery(this.pagination.current);
            this.$message.success(`${record.status === 3 ? '启用' : '禁用'}成功`);
          });
        },
        onCancel() {}
      });
    },
    handleAddTag(record) {
      this.$emit('add-tag', { ...record });
    },
    handleWeightHistory(record) {
      this.$emit('weight-history', record);
    },
    handleCopy(record) {
      navigator.clipboard.writeText(record.creative_url);
      this.$message.success('复制成功');
    },
    highlightKeywords(val) {
      if (!val) return '';
      let keywords = [];
      const searchData = this.search;

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
    }
  },
  watch: {
    tagLevelList() {
      this.tagLevelListCache.clear();
    },
    $route() {
      this.clearSelected();
    }
  }
};
</script>

<style scoped lang="scss">
.add-tag-btn {
  min-width: 18px !important;
  width: 18px;
  height: 18px;
  font-size: 12px;
}
</style>
