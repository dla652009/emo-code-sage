<template>
  <div ref="container" class="creative-container">
    <a-tabs v-model:activeKey="activeKey" class="bg-white p-4 pt-0 pb-0 rounded-lg rounded-b-none !mb-0" size="small">
      <a-tab-pane :key="0" tab="全 部"> </a-tab-pane>
      <a-tab-pane :key="item.value" :tab="item.label" v-for="item in contentTypeOption"> </a-tab-pane>
    </a-tabs>

    <keep-alive>
      <component
        ref="creativeListRef"
        :is="CreativeList"
        :key="`creative-list-${activeKey}`"
        :content-type="activeKey"
        @upload="handleUpload"
        @preview="handlePreview"
        @weight="handleWeight"
        @add-tag="handleAddTag"
        @batch-weight="handleBatchWeight"
        @weight-history="handleWeightHistory"
        @create-task="handleCreateTask"
      />
    </keep-alive>

    <!-- 公共弹窗 -->
    <a-modal :footer="null" v-model:open="Video.visible" v-if="Video.visible" class="flex justify-center">
      <video v-if="Video.type === 'video'" autoplay controls width="300" height="300">
        <source :src="Video.url" type="video/mp4" />
      </video>
      <img v-else :src="Video.url" style="max-width: 100%; max-height: 600px" />
    </a-modal>

    <a-modal
      width="50%"
      v-model:open="WeightModal.visible"
      :title="`${WeightModal.isMulti ? '批量' : ''}修改权重`"
      cancelText="取消"
      okText="保存"
      @ok="handleWeightOk"
      @cancel="handleWeightCancel"
    >
      <a-form :model="WeightModal.form" :label-col="{ span: 6 }" :wrapper-col="{ span: 12 }">
        <a-form-item label="素材编号" name="creative_unique_id" v-if="!WeightModal.isMulti">
          <a-input v-model:value="WeightModal.form.creative_unique_id" disabled />
        </a-form-item>
        <a-form-item label="素材文件名称" name="creative_name" v-if="!WeightModal.isMulti">
          <a-input v-model:value="WeightModal.form.creative_name" disabled />
        </a-form-item>
        <a-form-item label="当前权重" name="currentWeight" v-if="!WeightModal.isMulti">
          <a-input v-model:value="WeightModal.form.currentWeight" disabled />
        </a-form-item>
        <a-form-item label="修改权重" name="weight" required>
          <a-select v-model:value="WeightModal.form.weight" :options="weightOption" placeholder="请选择权重" />
        </a-form-item>
        <a-form-item label="修订日期" name="date" v-if="!WeightModal.isMulti">
          <a-date-picker
            class="w-full"
            disabled
            v-model:value="WeightModal.form.date"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择修订日期"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <CreateModal v-model:visible="CreateModal.visible" :content-type="activeKey" />
    <AddTagsModal v-model:visible="addTagsModal.visible" :data="addTagsModal.data" @refresh="refresh" />
    <WeightHistoryModal ref="WeightHistoryModal" :config="WeightHistoryModal.config" />
    <CreateTaskModal v-model:open="createTaskModal.visible" :data="createTaskModal.data" />
  </div>
</template>
<script>
import * as Api from './api';
import { weightOption } from '@/utils/const';
import CreativeList from './components/CreativeList.vue';
import CreateModal from './components/createModal.vue';
import WeightHistoryModal from './components/weightHistoryModal.vue';
import AddTagsModal from './components/addTagsModal.vue';
import CreateTaskModal from '@/pages/modules/Task/components/create-task-modal.vue';
import dayjs from 'dayjs';
import { mapGetters } from 'vuex';

export default {
  name: 'Creative',
  components: {
    CreativeList,
    CreateModal,
    WeightHistoryModal,
    AddTagsModal,
    CreateTaskModal
  },
  data() {
    return {
      activeKey: 0,
      weightOption,
      Video: {
        visible: false,
        url: '',
        type: 'video'
      },
      WeightModal: {
        visible: false,
        form: { weight: undefined },
        isMulti: false
      },
      addTagsModal: {
        visible: false,
        data: {}
      },
      CreateModal: {
        visible: false
      },
      WeightHistoryModal: {
        config: {}
      },
      createTaskModal: {
        visible: false,
        data: {}
      }
    };
  },
  computed: {
    CreativeList() {
      return CreativeList;
    },
    ...mapGetters({
      contentTypeOption: 'getContentTypeOption'
    })
  },
  methods: {
    handlePreview({ url, name }) {
      this.Video.url = url;
      const isVideo = /\.(mp4|mov|avi|wmv|flv|mkv)$/i.test(name);

      this.Video.type = isVideo ? 'video' : 'image';
      this.Video.visible = true;
    },
    handleUpload(contentType) {
      this.CreateModal.visible = true;
    },
    handleAddTag(record) {
      this.addTagsModal.visible = true;
      this.addTagsModal.data = record;
    },
    handleWeight(data) {
      this.WeightModal.visible = true;
      this.WeightModal.form = { ...data };
      this.WeightModal.isMulti = data.isMulti;
    },
    handleBatchWeight(data) {
      this.WeightModal.visible = true;
      this.WeightModal.form = { ...data, currentWeight: '' };
      this.WeightModal.isMulti = data.isMulti;
    },
    handleWeightOk() {
      if (!this.WeightModal.form.weight && this.WeightModal.form.weight !== 0) return this.$message.error('请选择权重');

      let params = {
        ids: this.WeightModal.form.ids,
        weight: this.WeightModal.form.weight
      };

      if (!this.WeightModal.isMulti) {
        params.time = dayjs(this.WeightModal.form.date).valueOf();
      }

      Api.updateCreativeWeight(params).then(({ data }) => {
        if (data.error_code) return this.$message.error(data.error_desc);
        this.$message.success('修改成功');
        this.WeightModal.visible = false;
        if (this.$refs.creativeListRef?.handleQuery) {
          this.$refs.creativeListRef.handleQuery(this.$refs.creativeListRef.pagination.current);
        }
      });
    },
    handleWeightCancel() {
      this.WeightModal.visible = false;
      this.WeightModal.form = { weight: undefined };
    },
    handleWeightHistory(record) {
      this.WeightHistoryModal.config = record;
      this.$refs.WeightHistoryModal.visible = true;
      this.$refs.WeightHistoryModal.dataList = [];
      this.$refs.WeightHistoryModal.handleQuery(record.id);
    },
    handleCreateTask(selected) {
      this.createTaskModal.data = { type: 2, selected };
      this.createTaskModal.visible = true;
    },
    refresh() {
      this.$store.dispatch('fetchTagLevelList');
      if (this.$refs.creativeListRef?.handleQuery) {
        this.$refs.creativeListRef.handleQuery(this.$refs.creativeListRef.pagination.current);
      }
    }
  }
};
</script>

<style scoped>
.ant-cascader {
  width: 100%;
}
:deep(.ant-tabs-nav) {
  margin: 0;
}
</style>
