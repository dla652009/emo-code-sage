<template>
  <a-form :model="formState" ref="refForm" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
    <a-form-item label="任务名称" name="task_name" required>
      <a-textarea v-model:value.trim="formState.task_name" auto-size placeholder="请输入任务名称" />
    </a-form-item>
    <a-form-item label="所属项目" name="project_id" required>
      <a-select v-model:value="formState.project_id" :options="projectOption" placeholder="请选择所属项目" />
    </a-form-item>
    <a-form-item label="业务模式" name="business_mode" required>
      <a-select v-model:value="formState.business_mode" :options="businessModeOption" placeholder="请选择业务模式" />
    </a-form-item>
    <a-form-item label="拼接类型" name="merge_type" required>
      <a-select v-model:value="formState.merge_type" :options="mergeTypeOption" placeholder="请选择拼接类型" disabled />
    </a-form-item>
    <a-form-item label="素材类型" name="merge_media_type" required>
      <a-select
        v-model:value="formState.merge_media_type"
        :options="materialTypeOption"
        placeholder="请选择素材类型"
        @change="handleChangeMergeMediaType"
      />
    </a-form-item>
    <a-form-item label="图片拼接logo" name="is_image_watermark" required v-if="[2, 3].includes(formState.merge_media_type)">
      <a-select v-model:value="formState.is_image_watermark" :options="mergeLogoOption" placeholder="请选择拼接logo" />
    </a-form-item>
  </a-form>
</template>

<script setup>
import { businessModeOption, mergeTypeOption, materialTypeOption } from '@/utils/const';
const mergeLogoOption = [
  {
    label: '是',
    value: 1
  },
  {
    label: '否',
    value: 0
  }
];
const store = useStore();
const refForm = ref(null);
const formState = defineModel('formState', { type: Object, default: () => ({}) });
const projectOption = computed(() => store.getters.getProjectOption.filter(item => item.value !== 0));

const handleChangeMergeMediaType = val => {
  if (![2, 3].includes(val)) {
    formState.value.merge_logo = null;
  }
};

const validate = () => {
  return new Promise((resolve, reject) => {
    refForm.value
      .validate()
      .then(() => {
        resolve();
      })
      .catch(() => {
        reject();
      });
  });
};
defineExpose({
  validate
});
</script>
