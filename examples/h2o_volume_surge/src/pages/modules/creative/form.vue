<template>
  <div class="bg-white rounded-lg h-full">
    <a-page-header :title="$route.name" @back="$router.go(-1)" class="!sticky top-0 !bg-white w-full z-10" />
    <a-form ref="formRef" :model="config" :label-col="{ span: 4 }" :wrapper-col="{ span: 14 }" class="bg-white h-full">
      <a-form-item label="素材编号" name="creative_unique_id" required>
        <a-input v-model:value.trim="config.creative_unique_id" disabled />
      </a-form-item>
      <a-form-item label="素材文件名称" name="creative_name" required>
        <a-input v-model:value.trim="config.creative_name" @blur="handleBlur" />
      </a-form-item>
      <a-form-item label="标签体系" name="content_type" required>
        <a-select v-model:value="config.content_type" :options="contentTypeOption" />
      </a-form-item>
      <a-form-item label="素材格式" name="media_type">
        <a-select v-model:value="config.media_type" :options="mediaTypeOption" disabled />
      </a-form-item>
      <a-form-item label="素材库" name="creative_type" required>
        <a-select v-model:value="config.creative_type" :options="creativeTypeOption" placeholder="请选择素材库" />
      </a-form-item>
      <a-form-item label="素材权重" name="weight" required>
        <a-select v-model:value="config.weight" :options="weightOption" />
      </a-form-item>
      <a-form-item label="素材师" name="author_id" required>
        <a-select v-model:value="config.author_id" :options="authorOption" />
      </a-form-item>
      <a-form-item label="投放人群性别" name="gender" required>
        <a-select v-model:value="config.gender" :options="genderOption" />
      </a-form-item>
      <a-form-item label="素材语言" name="lang" required>
        <a-select v-model:value="config.lang" :options="langOption" />
      </a-form-item>
      <a-form-item label="素材标签" name="tag" required disabled>
        <a-select v-model:value="config.tag" mode="tags" disabled>
          <a-select-option v-for="item in config.tag" :key="item" :value="item">{{ item }}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="未匹配标签" name="not_match_tag" disabled>
        <div class="not-match-tag-container">
          <template v-if="config?.not_match_tag?.length">
            <a-tag v-for="item in config.not_match_tag" :key="item" color="orange">
              {{ item }}
            </a-tag>
          </template>
          <span v-else class="no"> 无 </span>
        </div>
      </a-form-item>
      <a-form-item label="创建日期" name="create_time" required>
        <a-input v-model:value="config.create_time" disabled />
      </a-form-item>
    </a-form>
    <div class="flex justify-center py-5 gap-2 sticky bottom-0 w-full bg-white">
      <a-button @click="handleCancel">取消</a-button>
      <a-button type="primary" @click="handleSave">保存</a-button>
    </div>
  </div>
</template>
<script>
import { tagLevelListByContentType } from '@/pages/modules/Task/services/tagService.js';
import * as Api from './api';
import { weightOption, creativeStatusOption, mediaTypeOption } from '@/utils/const';
import { findPathByKey } from '@/utils/const';
import { mapGetters } from 'vuex';
export default {
  name: 'CreativeForm',
  data() {
    return {
      config: {},
      weightOption,
      creativeStatusOption,
      mediaTypeOption,
      fieldNames: {
        label: 'name',
        value: 'name',
        children: 'children'
      }
    };
  },
  computed: {
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
      tagLevelList: 'getTagLevelList'
    })
  },
  created() {
    this.getConfig();
  },
  watch: {},
  methods: {
    getConfig() {
      Api.getCreative({ id: this.$route.params.id }).then(({ data }) => {
        if (data.error_code) return this.$message.error(data.error_desc);
        this.config = data.result;
      });
    },
    handleBlur() {
      const text = this.config.creative_name.trim();
      const tags = this.getTags(text);
      const matchTags = this.matchTags(tags);
      this.config.not_match_tag = matchTags;
    },
    getTags(text) {
      if (!text.includes('#')) return [];
      // 移除文件后缀 (例如 .png)
      const cleanText = text.replace(/\.[^/.]+$/, '');

      // 分割并获取 # 之后的部分
      const parts = cleanText.split('#');
      const tags = parts.slice(1).filter(t => t.trim());
      return tags;
    },
    matchTags(tags) {
      const tagLevelList = tagLevelListByContentType(this.tagLevelList, this.creativeTypeOption, this.config);
      return tags.filter(tag => !findPathByKey(tagLevelList, 'name', tag).length);
    },
    handleCancel() {
      this.$router.back();
    },
    async handleSave() {
      try {
        await this.$refs.formRef.validate();
        const params = { ...this.config };
        delete params.tag;
        const { data } = await Api.updateCreative(params);
        if (data.error_code) return this.$message.error(data.error_desc);
        this.$message.success('保存成功');
        this.$router.back();
      } catch (error) {
        console.error(error);
        this.$message.error('保存失败，请检查输入');
      }
    }
  }
};
</script>
<style scoped lang="scss">
.ant-form-item {
  margin-bottom: 18px;
}
.not-match-tag-container {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  padding: 2px 4px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid #d9d9d9;
  span {
    display: flex;
    align-items: center;
  }
  .no {
    color: rgba(0, 0, 0, 0.65);
  }
}
</style>
