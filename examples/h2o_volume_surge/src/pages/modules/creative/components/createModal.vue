<template>
  <a-modal title="新增素材" :open="visible" @ok="handleOk" @cancel="handleCancel">
    <a-alert message="若上传图片素材，请选择“成片库”" type="warning" show-icon class="mb-4" />
    <a-form ref="form" :model="config" :rules="rules" :label-col="labelCol" :wrapper-col="wrapperCol">
      <a-form-item label="标签体系" name="content_type" required>
        <a-select
          v-model:value="config.content_type"
          :options="contentTypeOption"
          placeholder="请选择标签体系"
          :disabled="isHasContentType"
        />
      </a-form-item>
      <a-form-item label="素材库" name="creative_type">
        <a-select v-model:value="config.creative_type" :options="creativeTypeOption" placeholder="请选择素材库" />
      </a-form-item>
      <a-form-item label="素材师" name="author_id">
        <a-select v-model:value="config.author_id" :options="authorOption" placeholder="请选择素材师" />
      </a-form-item>
      <a-form-item label="投放人群性别" name="gender">
        <a-select v-model:value="config.gender" :options="genderOption" placeholder="投放人群性别" />
      </a-form-item>
      <a-form-item label="素材语言" name="lang">
        <a-select v-model:value="config.lang" :options="langOption" placeholder="请选择素材语言" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script>
import { mapGetters } from 'vuex';
export default {
  name: 'CreateModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    contentType: {
      type: [Number, String],
      default: 1
    }
  },
  emits: ['update:visible'],
  data() {
    return {
      labelCol: { span: 8 },
      wrapperCol: { span: 14 },
      config: {
        content_type: 1
      }
    };
  },
  computed: {
    isHasContentType() {
      return this.contentType > 0;
    },
    rules() {
      return {
        creative_type: [{ required: true, message: '请选择素材库' }],
        project_id: [{ required: true, message: '请选择所属项目' }],
        author_id: [{ required: true, message: '请选择素材师' }],
        gender: [{ required: true, message: '请选择投放人群性别' }],
        lang: [{ required: true, message: '请选择素材语言' }]
      };
    },
    ...mapGetters({
      authorOption: 'getAuthorOption',
      creativeTypeOption: 'getCreativeTypeOption',
      contentTypeOption: 'getContentTypeOption',
      genderOption: 'getGenderOption',
      langOption: 'getLangOption',
      projectOption: 'getProjectOption'
    })
  },
  methods: {
    handleCancel() {
      this.$refs.form.resetFields();
      this.$emit('update:visible', false);
    },
    handleOk() {
      this.$refs.form
        .validate()
        .then(() => {
          const findLabel = (options, value) => {
            const list = options || [];
            const item = list.find(opt => opt.value === value);
            return item ? item.label : '';
          };
          const payload = {
            ...this.config,
            content_type_label: findLabel(this.contentTypeOption, this.config.content_type),
            creative_type_label: findLabel(this.creativeTypeOption, this.config.creative_type),
            author_label: findLabel(this.authorOption, this.config.author_id),
            gender_label: findLabel(this.genderOption, this.config.gender),
            lang_label: findLabel(this.langOption, this.config.lang)
          };
          sessionStorage.setItem('creative_config', JSON.stringify(payload));
          this.$router.push({
            name: '素材上传'
          });
          this.handleCancel();
        })
        .catch(() => {
          this.$message.error('请填写完整信息');
        });
    }
  },
  watch: {
    contentType: {
      handler(val) {
        this.config.content_type = !!val ? val : 1;
      }
    }
  }
};
</script>

<style scoped></style>
