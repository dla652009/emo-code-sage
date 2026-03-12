<template>
  <a-modal title="新增工作" @ok="handleOk" @cancel="handleCancel" :maskClosable="false">
    <a-form ref="formRef" :model="formState" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
      <a-form-item label="优化师" name="optimizer_id" :rules="[{ required: true, message: '请选择优化师' }]">
        <a-select
          v-model:value="formState.optimizer_id"
          placeholder="请选择优化师"
          :options="props.data.options || []"
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup>
import { message } from 'ant-design-vue';
const props = defineProps({
  data: {
    type: Object,
    default: () => ({})
  }
});
const emit = defineEmits(['update:open', 'refresh', 'go']);
const formRef = ref(null);
const formState = reactive({
  optimizer_id: null
});

const handleOk = async () => {
  try {
    await formRef.value.validate();
    emit('go', { optimizer_id: formState.optimizer_id, status: 1 });
    handleCancel();
    // emit('refresh');
  } catch (error) {
    console.error(error);
    message.error('新增工作失败');
  }
};
const handleCancel = () => {
  formRef.value.resetFields();
  emit('update:open', false);
};
</script>
