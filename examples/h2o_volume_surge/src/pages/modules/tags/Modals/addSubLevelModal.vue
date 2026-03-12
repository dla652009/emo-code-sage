<template>
  <a-modal title="添加子层级" :open="visible" @ok="handleOk" @cancel="handleCancel" :maskClosable="false">
    <a-form ref="form" :model="formData" :rules="rules" :label-col="labelCol" :wrapper-col="wrapperCol">
      <a-form-item label="父级层级" name="parent_name">
        <a-input v-model:value="formData.parent_name" disabled />
      </a-form-item>
      <a-form-item label="层级名称" name="name">
        <a-input v-model:value.trim="formData.name" placeholder="请输入层级名称" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script>
import { createTagLevel } from '../api';
export default {
  name: 'AddSubLevelModal',
  props: {
    visible: {
      // 弹框展示
      type: Boolean,
      default: false
    },
    modalData: {
      // 弹框数据 用于回显
      type: Object,
      default: () => ({})
    }
  },
  emits: ['update:visible'],
  data() {
    return {
      labelCol: { span: 8 },
      wrapperCol: { span: 14 },
      tagLevelOption: [],
      formData: {
        parent_name: '',
        name: ''
      }
    };
  },
  computed: {
    rules() {
      return {
        parent_name: [{ required: true, message: '请选择父级层级' }],
        name: [{ required: true, message: '请输入层级名称' }]
      };
    }
  },
  created() {},
  methods: {
    handleCancel() {
      this.$refs.form.resetFields();
      this.$emit('update:visible', false);
    },
    handleOk() {
      this.$refs.form
        .validate()
        .then(() => {
          const { category_type, content_type, id: parent_id } = this.modalData;
          const { name } = this.formData;
          createTagLevel({
            name,
            category_type,
            content_type,
            parent_id
          }).then(res => {
            if (res.data.error_code) return this.$message.error(res.data.error_desc);
            this.$message.success('创建成功');
            this.$emit('refresh');
            this.handleCancel();
          });
        })
        .catch(() => {
          this.$message.error('请填写完整信息');
        });
    }
  },
  watch: {
    modalData(val) {
      if (!val) return;
      this.formData.parent_name = val.name;
    }
  }
};
</script>

<style scoped></style>
