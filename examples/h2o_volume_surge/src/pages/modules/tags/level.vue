<template>
  <div class="p-4 flex h-full bg-white rounded-lg">
    <!-- 左侧树形结构 -->
    <div class="w-100 border-r-2 pr-3 overflow-auto">
      <a-input-search
        v-model:value.trim="searchValue"
        placeholder="请输入"
        allowClear
        class="mb-2 sticky top-0 bg-white z-1"
      />
      <!-- 树形结构 -->
      <a-tree
        :tree-data="filteredTreeData"
        :expanded-keys="expandedKeys"
        :auto-expand-parent="autoExpandParent"
        :field-names="fieldNames"
        :show-line="{ showLeafIcon: false }"
        show-icon
        @expand="onExpand"
        @select="onSelect"
        v-if="treeData.length"
      >
        <template #icon="data">
          <template v-if="!data.is_tier">
            <img src="@/assets/tag.png" style="width: 14px; height: 14px" />
          </template>
        </template>
        <template #title="{ name }">
          <!-- 高亮搜索关键词 -->
          <span v-if="searchValue && name.indexOf(searchValue) > -1">
            {{ name.substr(0, name.indexOf(searchValue)) }}
            <span style="color: #f50">{{ searchValue }}</span>
            {{ name.substr(name.indexOf(searchValue) + searchValue.length) }}
          </span>
          <span v-else>{{ name }}</span>
        </template>
      </a-tree>

      <!-- 无数据时显示 -->
      <div v-else><a-spin class="!flex justify-center !mt-10" /></div>
    </div>

    <!-- 右侧表单区域 -->
    <div class="flex flex-1 justify-center items-center flex-col" v-if="isInfoShow">
      <div>
        <a-form
          ref="form"
          :model="formData"
          :label-col="{ span: 7 }"
          :wrapper-col="{ span: 17 }"
          labelAlign="left"
          :rules="rules"
        >
          <a-form-item :label="`${['标签', '层级'][formData.is_tier]}名称`" name="name" required>
            <a-input v-model:value.trim="formData.name" :disabled="!isEditing" />
          </a-form-item>
          <a-form-item label="节点属性" name="info" required>
            <a-input v-model:value.trim="formData.info" disabled />
          </a-form-item>
        </a-form>
      </div>

      <!-- 操作按钮 -->
      <div class="mt-6 flex justify-center py-5 gap-2 space-x-2" v-if="isToolShow">
        <a-button type="primary" @click="handleAddClick" v-if="isAddShow">添加子层级</a-button>
        <template v-if="isEditShow">
          <template v-if="isEditing">
            <a-button type="primary" @click="handleSaveClick">保存</a-button>
            <a-button @click="handleCancelClick">取消</a-button>
          </template>
          <template v-else>
            <a-button type="primary" @click="isEditing = true">编辑</a-button>
            <a-button @click="handleDeleteClick">删除</a-button>
          </template>
        </template>
      </div>
    </div>
  </div>

  <!-- 弹框：添加子层级 -->
  <addSubLevelModal v-model:visible="visible" :modalData="currentData" @refresh="init" />
</template>

<script>
import addSubLevelModal from './Modals/addSubLevelModal.vue';
import { updateTag, deleteTag } from './api.js';
export default {
  components: {
    addSubLevelModal
  },
  data() {
    return {
      visible: false, // 弹框的显示状态
      isEditing: false, // 正在编辑中
      expandedKeys: [], // 展开的节点key
      autoExpandParent: false, // 是否自动展开父节点
      searchValue: '', // 搜索框的输入值
      fieldNames: {
        children: 'children', // 树节点的子节点字段
        title: 'name', // 树节点的标题字段
        key: 'id'
      },
      treeData: [], // 树的数据
      formData: {},
      currentData: null // 当前选中的节点数据
    };
  },
  computed: {
    // 过滤后的树数据
    filteredTreeData() {
      return this.searchValue ? this.filterTreeData(this.treeData) : this.treeData;
    },

    // 控制右侧表单的显示
    isInfoShow() {
      // const { is_tier } = this.currentData;
      return !!this.currentData;
    },

    isToolShow() {
      return !!this.currentData?.is_tier;
    },
    isAddShow() {
      // 添加子层级
      const { id, is_tier, children, level } = this.currentData;
      if (is_tier === 0) return false; // 不是层级
      if (level >= 3) return false; // 层级不能超过3级
      if (level === 0) return id > 1000000000; // 库允许
      return true
      // if (!children) return true;
      // const res = children.some(item => item.is_tier === 0);
      // return !res;
    },
    isEditShow() {
      // 编辑功能
      const { id } = this.currentData;
      if (id >= 100000000) return false;
      // if (level === 0 && [0, 1, 2, 3].includes(category_type)) return false;
      return true;
    },
    rules() {
      return {
        name: [{ required: true, message: '请输入层级名称' }],
        info: [{ required: true, message: '请选择父级层级' }]
      };
    }
  },
  created() {
    this.init(true);
  },
  activated() {
    this.init(); // 组件激活时初始化数据
  },
  methods: {
    // 初始化树数据
    async init(isInit) {
      const res = await this.$store.dispatch('fetchTagLevelList');
      this.treeData = res;
      if (isInit) this.expandAllNodes();
    },

    expandAllNodes() {
      // 展开所有节点
      const getAllKeys = data => {
        let keys = [];
        data.forEach(item => {
          keys.push(item.id);
          if (item.children) {
            keys = keys.concat(getAllKeys(item.children));
          }
        });
        return keys;
      };
      this.expandedKeys = getAllKeys(this.treeData); // 获取所有节点的key
    },

    // 递归过滤树节点
    filterTreeData(data) {
      return data
        .map(node => {
          const filteredNode = { ...node };
          const isMatch = filteredNode.name.includes(this.searchValue);

          // 递归处理子节点
          if (filteredNode.children) {
            filteredNode.children = this.filterTreeData(filteredNode.children);
          }

          // 如果当前节点匹配或有匹配的子节点，则保留该节点
          if (isMatch || (filteredNode.children && filteredNode.children.length > 0)) {
            return filteredNode;
          }
          return null; // 否则返回null，稍后会被过滤掉
        })
        .filter(node => node !== null);
    },

    // 展开节点时更新展开的节点
    onExpand(expandedKeys) {
      this.expandedKeys = expandedKeys;
      this.autoExpandParent = false;
    },

    // 选中节点时更新表单数据
    onSelect(_, { selectedNodes }) {
      const currentNode = selectedNodes && selectedNodes[0];
      if (!currentNode) {
        this.currentData = null;
        return;
      }
      const { name, is_tier } = currentNode;
      this.currentData = currentNode;
      this.handleCancelClick();
      this.formData = {
        name,
        is_tier,
        info: ['标签', '层级'][is_tier]
      };
    },

    // 添加子层级
    handleAddClick() {
      if (!this.currentData) {
        this.$message.warning('请先选择一个节点');
        return;
      }
      this.visible = true; // 显示添加子层级的弹框
    },

    handleSaveClick() {
      // 保存
      this.$refs.form
        .validate()
        .then(() => {
          const { name } = this.formData;
          const { id, parent_id, category_type, content_type } = this.currentData;
          const submitData = {
            id,
            name,
            parent_id,
            category_type,
            content_type
          };
          updateTag(submitData).then(res => {
            if (res.data.error_code) return this.$message.error(res.data.error_desc);
            this.$message.success('更新成功');
            this.isEditing = false;
            this.init();
          });
        })
        .catch(() => {
          this.$message.error('请填写完整信息');
        });
    },
    handleCancelClick() {
      // 取消编辑
      this.isEditing = false;
      this.formData.name = this.currentData.name;
    },
    handleDeleteClick() {
      if (this.currentData.children && this.currentData.children.length > 0) {
        this.$message.error('请先删除其所有子层级和标签');
      } else {
        const { id } = this.currentData;
        const _this = this;
        this.$confirm({
          title: '删除',
          content: '确定要删除吗？',
          okText: '确定',
          cancelText: '取消',
          onOk: () => {
            deleteTag({ id }).then(res => {
              if (res.data.error_code) return _this.$message.error(res.data.error_desc);
              _this.$message.success('删除成功');
              this.currentData = null;
              _this.init();
            });
          }
        });
      }
    }
  },

  watch: {
    // 监听搜索框的变化，动态更新展开的节点
    searchValue(val) {
      if (val) {
        const expandAllMatchedNodes = data => {
          let keys = [];
          data.forEach(node => {
            if (node.name.includes(val)) {
              keys.push(node.id);
            }
            if (node.children) {
              keys = keys.concat(expandAllMatchedNodes(node.children));
            }
          });
          return keys;
        };
        this.expandedKeys = expandAllMatchedNodes(this.treeData); // 展开所有匹配的节点
        this.autoExpandParent = true;
      } else {
        this.expandAllNodes(); // 清空搜索时恢复展开所有节点
        this.autoExpandParent = false;
      }
    }
  }
};
</script>
