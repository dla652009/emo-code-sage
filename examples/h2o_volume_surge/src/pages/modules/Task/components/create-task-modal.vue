<template>
  <a-modal v-model:open="open" @ok="handleOk" @cancel="handleCancel" title="任务基础信息" :maskClosable="false">
    <a-alert type="info" show-icon v-if="props.data.selected?.length" class="mb-2" size="small">
      <template #message>
        <div class="text-sm">
          已勾选 <span class="blue">{{ props.data.selected.length }}</span> 条成片{{
            ['素材', '视频'][props.data.type - 2]
          }}
          <template v-if="props.data.type === 2">
            <br />
            若为太极体系的成片库视频素材，默认根据任务所属项目拼接logo
          </template>
        </div>
      </template>
    </a-alert>
    <TaskBaseInfo ref="refTaskBaseInfo" v-model:formState="formState" />
  </a-modal>
</template>

<script setup>
import { deepCopy } from '@/utils/gatekeeper_tools.js';
import { message } from 'ant-design-vue';
import TaskBaseInfo from './task-base-info.vue';
const store = useStore();
const router = useRouter();
const open = defineModel('open', {
  type: Boolean,
  default: false
});
const props = defineProps({
  data: {
    type: Object,
    default: () => {
      return {
        id: null,
        type: 1,
        selected: []
      };
    }
  }
});
const refTaskBaseInfo = ref(null);
const formState = reactive({});
const handleOk = async () => {
  try {
    await refTaskBaseInfo.value.validate();
    const info = deepCopy({ ...formState, task_unique_id: '' });
    store.commit('setTaskBaseInfo', info);
    if (props.data.selected?.length) store.commit('setFilmList', props.data.selected);
    const name = props.data.id ? '复制任务' : '创建任务';
    const params = { type: props.data.type };
    if (props.data.id) params.id = props.data.id;
    router.push({
      name,
      params
    });
    handleCancel();
  } catch (error) {
    console.log(error);
    message.error('请填写完整任务基础信息');
  }
};
const handleCancel = () => {
  Object.keys(formState).forEach(key => {
    formState[key] = null;
  });
  open.value = false;
};
watch(
  () => open.value,
  newVal => {
    if (newVal) {
      formState.merge_type = props.data.type;
      if (props.data.rawData) {
        Object.keys(props.data.rawData).forEach(key => {
          formState[key] = props.data.rawData[key];
        });
      }
    }
  }
);
</script>
