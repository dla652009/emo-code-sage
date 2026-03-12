<template>
  <a-modal
    :title="`${modalType === 'edit' ? '编辑' : '新增'}标签`"
    :open="visible"
    @ok="handleOk"
    @cancel="handleCancel"
    :maskClosable="false"
  >
    <a-form ref="form" :model="formData" :rules="rules" :label-col="labelCol" :wrapper-col="wrapperCol">
      <a-form-item label="标签名称" name="name">
        <a-input v-model:value.trim="formData.name" placeholder="请输入标签名称" />
      </a-form-item>
      <a-form-item label="父级层级" name="parent_id">
        <a-cascader
          ref="cascaderRef"
          v-model:value="formData.parent_id"
          :options="tagLevelList"
          :field-names="fieldNames"
          expand-trigger="hover"
          allowClear
          changeOnSelect
          @change="handleLevelChange"
          :show-search="showSearch"
          placeholder="请选择父级层级"
          :show-checked-strategy="'SHOW_CHILD'"
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script>
import { createTag, updateTag } from '../api';
import { findPathByKey } from '@/utils/const.js';
export default {
  name: 'CreateModal',
  props: {
    visible: {
      // 弹框展示
      type: Boolean,
      default: false
    },
    tagLevel: {
      // 标签层级list
      type: Array,
      default: () => []
    },
    modalData: {
      // 弹框数据 用于回显
      type: Object,
      default: null
    }
  },
  emits: ['update:visible', 'refresh'],
  data() {
    return {
      labelCol: { span: 8 },
      wrapperCol: { span: 14 },
      currentLevelData: null,
      modalType: 'add',
      previousValue: [], // 父级层级上一次的值，用于回退
      fieldNames: {
        label: 'name',
        value: 'id',
        children: 'children'
      },
      formData: {
        name: '',
        parent_id: ''
      }
    };
  },
  computed: {
    tagLevelList() {
      return this.removeTags(this.$store.getters.getTagLevelList);
    },
    showSearch() {
      return {
        limit: 999999,
        filter: (inputValue, path) => {
          return path.some(option => option.name.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);
        }
      };
    },
    rules() {
      return {
        name: [{ required: true, message: '请输入标签名称' }],
        parent_id: [{ required: true, message: '请选择父级层级' }]
      };
    }
  },
  created() {},
  methods: {
    initLevel(id) {
      // 根据 id 查找对应的层级关系并 回显 cascader
      const data = findPathByKey(this.tagLevel, 'id', id);
      data.pop(); // 处理末尾标签
      this.formData.parent_id = data;
      this.previousValue = data;
    },
    removeTags(tree) {
      // 去除标签
      return tree
        .filter(item => item.is_tier !== 0) // 过滤掉标签
        .map(item => {
          const newItem = { ...item };
          if (newItem.children && newItem.children.length) {
            newItem.children = this.removeTags(newItem.children);
          }
          return newItem;
        });
    },
    handleCancel() {
      this.formData.name = '';
      this.formData.parent_id = '';
      this.currentLevelData = null;
      this.previousValue = [];
      this.$refs.form.clearValidate();
      this.$emit('update:visible', false);
    },

    prepareSubmitData() {
      // 准备提交数据
      let submitData;
      const { name } = this.formData;
      const isEdit = this.modalData.type === 'edit';
      const api = isEdit ? updateTag : createTag;
      const message = isEdit ? '编辑' : '新增';
      if (isEdit) {
        // 编辑
        const { parent_id } = this.modalData;
        const { id } = this.modalData.data;
        submitData = {
          id,
          parent_id,
          name
        };
        if (this.currentLevelData) {
          const { category_type, content_type, id: parent_id } = this.currentLevelData;
          submitData = {
            ...submitData,
            category_type,
            content_type,
            parent_id
          };
        }
      } else {
        // 新增
        const { category_type, content_type, id } = this.currentLevelData;
        submitData = {
          name,
          parent_id: id,
          category_type,
          content_type
        };
      }
      return { api, submitData, message };
    },
    handleOk() {
      this.$refs.form
        .validate()
        .then(() => {
          const { api, submitData, message } = this.prepareSubmitData(); // 获取提交数据
          api(submitData).then(res => {
            if (res.data.error_code) return this.$message.error(res.data.error_desc);
            this.$message.success(`${message}成功`);
            this.handleCancel();
            this.$emit('refresh');
          });
        })
        .catch(() => {
          this.$message.error('请填写完整信息');
        });
    },
    handleLevelChange(newVal, selectedOptions) {
      const lastOption = selectedOptions?.[selectedOptions.length - 1];
      this.currentLevelData = lastOption;
      const is = lastOption && lastOption.id >= 10000000;
      if (!newVal || newVal.length === 0 || !is) {
        this.previousValue = newVal;
        return;
      }
      if (is) {
        // 回退到上一次合法值
        this.$message.error('请选择标签层级！');
        this.formData.parent_id = this.previousValue;
        this.$refs.cascaderRef?.focus?.(); // 可选
        return;
      }
    }
  },
  watch: {
    modalData(val) {
      if (!val) return;
      const { type, data } = val;
      this.modalType = type;
      if (type !== 'edit') return;
      this.formData = data;
      this.initLevel(data?.id);
    }
  }
};
</script>

<style scoped></style>
