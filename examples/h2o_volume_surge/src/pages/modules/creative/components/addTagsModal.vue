<template>
  <a-modal title="新增标签" :open="visible" @ok="handleOk" @cancel="handleCancel" :maskClosable="false">
    <a-form ref="form" :model="formModel" :label-col="labelCol" :wrapper-col="wrapperCol">
      <template v-for="(item, index) in formModel.tags" :key="index">
        <a-form-item :label="`标签名称${formModel.tags.length > 1 ? index + 1 : ''}`">
          <a-input v-model:value.trim="item.name" placeholder="请输入标签名称" disabled />
        </a-form-item>
        <a-form-item
          label="父级层级"
          :name="['tags', index, 'parent_id']"
          :rules="[{ required: true, message: '请选择父级层级' }]"
        >
          <a-cascader
            v-model:value="item.parent_id"
            :options="tagLevelFilter"
            :field-names="fieldNames"
            expand-trigger="hover"
            allowClear
            changeOnSelect
            @change="(newVal, selectedOptions) => handleLevelChange(newVal, selectedOptions, index)"
            :show-search="showSearch"
            placeholder="请选择父级层级"
            :show-checked-strategy="'SHOW_CHILD'"
          />
        </a-form-item>
      </template>
    </a-form>
  </a-modal>
</template>

<script>
import { multiCreateTags } from '../api.js';
export default {
  name: 'CreateModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    data: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['update:visible', 'refresh'],
  data() {
    return {
      labelCol: { span: 8 },
      wrapperCol: { span: 14 },
      formModel: {
        tags: []
      },
      fieldNames: {
        label: 'name',
        value: 'id',
        children: 'children'
      }
    };
  },
  computed: {
    content_type() {
      return this.data.content_type;
    },
    category_type() {
      return this.data.label_creative_type;
    },
    tagLevelList() {
      return this.$store.getters.getTagLevelList;
    },
    creativeTypeOption() {
      return this.$store.getters.getCreativeTypeOption;
    },
    tagLevelFilter() {
      const levelList = this.tagLevelList.filter(tag => tag.content_type === this.content_type);
      
      if (levelList.length > 0) {
        const firstItem = { ...levelList[0] };
        const categoryList = firstItem.children?.filter(tag => tag.category_type === this.category_type);
        firstItem.children = categoryList;
        
        const safeLevelList = [firstItem, ...levelList.slice(1)];
        return this.removeTags(safeLevelList);
      }
      
      return this.removeTags(levelList);
    },
    showSearch() {
      return {
        limit: 999999,
        filter: (inputValue, path) => {
          return path.some(option => option.name.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);
        }
      };
    }
  },
  methods: {
    removeTags(tree) {
      return tree
        .filter(item => item.is_tier !== 0)
        .map(item => {
          const newItem = { ...item };
          if (newItem.children && newItem.children.length) {
            newItem.children = this.removeTags(newItem.children);
          }
          return newItem;
        });
    },
    handleCancel() {
      this.$refs.form?.clearValidate?.();
      this.formModel.tags = [];
      this.$emit('update:visible', false);
    },
    async handleOk() {
      this.$refs.form
        .validate()
        .then(() => {
          const submitData = {
            parent_ids: this.formModel.tags.map(item => item.parent_id[item.parent_id.length - 1]).join(','),
            category_type: this.category_type,
            content_type: this.content_type,
            names: this.formModel.tags.map(item => item.name).join(',')
          };
          multiCreateTags(submitData).then(({ data }) => {
            if (data.error_code) return this.$message.error(data.error_desc);
            this.$message.success('新增成功');
            this.$emit('update:visible', false);
            this.$emit('refresh');
          });
        })
        .catch(() => {
          this.$message.error('请填写完整信息');
        });
    },
    handleLevelChange(newVal, selectedOptions, index) {
      const lastOption = selectedOptions?.[selectedOptions.length - 1];
      const item = this.formModel.tags[index];
      if (!item) return;
      item.currentLevelData = lastOption;
      const is = lastOption && lastOption.id >= 10000000;
      if (!newVal || newVal.length === 0 || !is) {
        item.previousValue = newVal;
        return;
      }
      if (is) {
        this.$message.error('请选择标签层级！');
        item.parent_id = item.previousValue || [];
        return;
      }
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        const { not_match_tag } = this.data || {};
        const list = (not_match_tag || '')
          .split(',')
          .map(item => item.trim())
          .filter(Boolean);
        this.formModel.tags = list.map(name => ({
          name,
          parent_id: [],
          currentLevelData: null,
          previousValue: []
        }));
      } else {
        this.formModel.tags = [];
      }
    }
  }
};
</script>

<style scoped></style>
