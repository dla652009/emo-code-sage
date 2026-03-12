<template>
  <div class="task-container">
    <SearchBar ref="searchBarRef" :schema="searchSchema" @search="handleSearch" @reset="handleReset" />
    <div>
      <a-table
        :row-key="record => record.id"
        :columns="columns"
        :data-source="dataList"
        :pagination="pagination"
        :locale="locale"
        :scroll="{ x: scrollX, y: scrollY, scrollToFirstRowOnChange: true }"
        @change="onRequest"
        class="my-table"
        size="small"
      >
        <template #title>
          <div class="flex">
            <div class="flex-1 text-lg"></div>
            <div class="flex-none">
              <a-button class="mr-2" type="primary" @click="handleAdd()">新增</a-button>
            </div>
          </div>
        </template>
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex == 'category_type'">
            {{ categoryTypeOption.find(item => item.value === record.category_type)?.label }}
          </template>
          <template v-if="column.dataIndex == 'status'">
            {{ statusOption.find(item => item.value === record.status)?.label }}
          </template>
          <template v-if="column.dataIndex == 'op'">
            <a-button type="link" @click="handleEdit(record)">编辑</a-button>
            <a-button type="link" @click="handleStatus(record)">{{ ['禁用', '启用'][record.status - 1] }}</a-button>
            <a-button danger type="link" v-if="record.status === 1" @click="handleDelete(record)">删除</a-button>
          </template>
        </template>
      </a-table>
    </div>
  </div>
  <createModal
    ref="createModal"
    v-model:visible="visible"
    :modalData="modalData"
    :tagLevel="tagLevelList"
    @refresh="onRefresh(1)"
  />
</template>
<script>
import * as Api from './api';
import { splitText } from '@/utils/gatekeeper_tools';
import createModal from './Modals/createModal.vue';
import { h } from 'vue';
import tableScrollMixin from '@/mixins/tableScrollMixin';
const SEARCH = {
  category_type: undefined,
  tag_id_list: undefined,
  status: undefined
};
const COLUMNS = [
  { title: '序号', fixed: 'left', width: 20, align: 'left', customRender: ({ index }) => index + 1 },
  { title: '标签体系', dataIndex: 'content_type_name', width: 30, align: 'left' },
  { title: '标签库别', dataIndex: 'category_type_name', width: 30, align: 'left' },
  { title: '层级1', dataIndex: 'parent1_name', width: 50, align: 'left', customRender: ({ text }) => text || '--' },
  { title: '层级2', dataIndex: 'parent2_name', width: 50, align: 'left', customRender: ({ text }) => text || '--' },
  { title: '层级3', dataIndex: 'parent3_name', width: 50, align: 'left', customRender: ({ text }) => text || '--' },
  { title: '标签名称', dataIndex: 'name', width: 50, align: 'left' },
  { title: '标签状态', dataIndex: 'status', width: 30, align: 'left' },
  { title: '创建日期', dataIndex: 'create_time', width: 30, align: 'left' },
  { title: '操作', fixed: 'right', dataIndex: 'op', align: 'left', width: 50 }
];
export default {
  name: 'Tags',
  mixins: [tableScrollMixin],
  data() {
    return {
      columns: COLUMNS,
      search: SEARCH,
      range: [],
      dataList: [],
      common_list: [],
      hook_list: [],
      tagList: [],
      fieldNames: {
        label: 'name',
        value: 'id',
        children: 'children'
      },
      pagination: {
        showTotal: total =>
          h('div', null, [
            h('span', null, '合计：'),
            h('span', { class: 'blue' }, ` ${total} `),
            h('span', null, '条')
          ]),
        current: 1,
        defaultPageSize: 20,
        total: 0
      },
      locale: {},
      visible: false, // 弹框
      modalData: {} // 弹框数据
    };
  },
  components: {
    createModal
  },
  activated() {
    this.handleQuery(1);
  },
  computed: {
    searchSchema() {
      return [
        {
          label: '标签名称',
          field: 'tag_id_list',
          type: 'cascader',
          options: this.tagLevelList,
          multiple: true,
          fieldNames: {
            label: 'name',
            value: 'id',
            children: 'children'
          },
          maxTagCount: 'responsive',
          showCheckedStrategy: 'SHOW_CHILD',
          expandTrigger: 'hover',
          showSearch: this.showSearch,
          transform: 'cascader-to-string'
        },
        { label: '标签状态', field: 'status', options: this.statusOption },
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
    showSearch() {
      return {
        limit: 999999,
        filter: (inputValue, path) => {
          return path.some(option => option.name.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);
        }
      };
    },
    categoryTypeOption() {
      return [
        { label: '通用', value: 1 },
        { label: 'hook', value: 2 }
      ];
    },
    statusOption() {
      return [
        { label: '生效中', value: 1 },
        { label: '禁用中', value: 2 }
      ];
    },
    tagLevelList() {
      return this.$store.getters.getTagLevelList;
    }
  },
  methods: {
    onRefresh(page) {
      this.$store.dispatch('fetchTagLevelList');
      this.handleQuery(page);
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
    async handleQuery(page = 1) {
      this.pagination.current = page;
      const params = {
        page: this.pagination.current,
        page_size: this.pagination.defaultPageSize,
        ...this.search
      };
      Api.getTagsList(params).then(({ data }) => {
        if (data.error_code) return this.$message.error(data.error_desc);
        this.dataList = data?.result?.tag_list || [];
        this.pagination.total = data.result.total;
      });
    },
    onRequest(pagination) {
      this.pagination.current = pagination.current;
      this.pagination.defaultPageSize = pagination.pageSize;
      this.pagination.current = pagination.current;
      this.handleQuery(pagination.current);
    },
    handleAdd() {
      // 新增
      this.visible = true;
      this.modalData = {
        type: 'add'
      };
    },
    handleEdit(record) {
      // 编辑
      this.visible = true;
      this.modalData = {
        type: 'edit',
        parent_id: record.parent_id,
        data: {
          ...record
        }
      };
    },
    handleStatus(record) {
      // 禁用/启用
      const tip = ['禁用', '启用'][record.status - 1];
      const _this = this;
      this.$confirm({
        title: '信息确认',
        content: `确认要${tip}吗？`,
        onOk() {
          Api.updateStatus({
            id: record.id,
            status: record.status === 1 ? 2 : 1
          }).then(({ data }) => {
            if (data.error_code) return _this.$message.error(data.error_desc);
            _this.$message.success(`${tip}成功`);
            _this.onRefresh(_this.pagination.current);
          });
        }
      });
    },
    handleDelete(record) {
      // 删除
      const _this = this;
      this.$confirm({
        title: '信息确认',
        content: '确认要删除吗？',
        onOk() {
          Api.deleteTag({
            id: record.id
          }).then(({ data }) => {
            if (data.error_code) {
              // 截取后端返回的数据
              let tipNodes = null;
              const texts = splitText(data.error_desc);
              if ((texts.length = 3)) {
                tipNodes = h('div', null, [
                  h('span', null, texts[0]),
                  h('span', { class: 'blue font-bold' }, ` ${texts[1]} `),
                  h('span', null, texts[2])
                ]);
              } else {
                tipNodes = data.error_desc;
              }
              _this.$message.error(tipNodes);

              return;
            }
            _this.removeSearchTag(record.id);
            _this.$message.success('删除成功');
            _this.onRefresh(_this.pagination.current);
          });
        }
      });
    },
    removeSearchTag(id) {
      // TODO: 临时补丁，后续需要优化
      this.tagList = this.tagList.filter(item => {
        return item[item.length - 1] !== id;
      });
    }
  }
};
</script>
