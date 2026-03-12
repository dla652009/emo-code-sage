<template>
  <div class="task-base-info">
    <div class="task-base-info-content grid grid-cols-5 gap-1">
      <div class="task-base-info-item">
        <span class="task-base-info-label task-base-info-label--project">
          <span class="task-base-info-label-icon"></span>
          <span class="task-base-info-label-text">所属项目：</span>
        </span>
        <span class="task-base-info-value">
          {{ projectOption.find(item => item.value === config.project_id)?.label || '未选择' }}
          <img :src="logo" alt="项目logo" v-if="isLogoShow" />
        </span>
      </div>
      <div class="task-base-info-item">
        <span class="task-base-info-label task-base-info-label--mode">
          <span class="task-base-info-label-icon"></span>
          <span class="task-base-info-label-text">业务模式：</span>
        </span>
        <span class="task-base-info-value">
          {{ businessModeOption.find(item => item.value === config.business_mode)?.label || '未选择' }}
        </span>
      </div>
      <div class="task-base-info-item">
        <span class="task-base-info-label task-base-info-label--merge">
          <span class="task-base-info-label-icon"></span>
          <span class="task-base-info-label-text">拼接类型：</span>
        </span>
        <span class="task-base-info-value">
          {{ mergeTypeOption.find(item => item.value === config.merge_type)?.label || '未选择' }}
        </span>
      </div>
      <div class="task-base-info-item">
        <span class="task-base-info-label task-base-info-label--material">
          <span class="task-base-info-label-icon"></span>
          <span class="task-base-info-label-text">素材类型：</span>
        </span>
        <span class="task-base-info-value">
          {{ materialTypeOption.find(item => item.value === config.merge_media_type)?.label || '未选择' }}
        </span>
      </div>
      <div class="task-base-info-item">
        <span class="task-base-info-label task-base-info-label--logo">
          <span class="task-base-info-label-icon"></span>
          <span class="task-base-info-label-text">图片拼接logo：</span>
        </span>
        <span class="task-base-info-value" v-if="[1].includes(config.merge_media_type)">--</span>
        <span class="task-base-info-value" v-else>{{  config.is_image_watermark ? '是' : '否' }}</span>
      </div>
      <div class="task-base-info-item">
        <span class="task-base-info-label task-base-info-label--id">
          <span class="task-base-info-label-icon"></span>
          <span class="task-base-info-label-text">任务编号：</span>
        </span>
        <span class="task-base-info-value">{{ config.task_unique_id || '自动编号' }}</span>
      </div>
      <div class="task-base-info-item col-span-3">
        <span class="task-base-info-label task-base-info-label--name">
          <span class="task-base-info-label-icon"></span>
          <span class="task-base-info-label-text">任务名称：</span>
        </span>
        <span class="task-base-info-value task-base-info-value--strong">{{ config.task_name }}</span>
      </div>
      <div class="task-base-info-item">
        <span class="task-base-info-label task-base-info-label--count">
          <span class="task-base-info-label-icon"></span>
          <span class="task-base-info-label-text">预计拼接条数：</span>
        </span>
        <div class="flex items-center">
          <span class="blue font-bold mr-1">
            <a-spin size="small" :spinning="true" v-if="preCheckLoading" />
            <template v-else> {{ preCount }} </template>
          </span>
          条
          <a-tooltip title="计算条数">
            <a-button
              type="primary"
              @click="$emit('pre-check')"
              v-if="taskType === 1 && !disabled"
              class="ml-2 flex items-center justify-center"
              size="small"
              shape="circle"
              :icon="h(CalculatorOutlined)"
            >
            </a-button>
          </a-tooltip>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useStore } from 'vuex';
import { h } from 'vue';
import { CalculatorOutlined } from '@ant-design/icons-vue';
import { businessModeOption, mergeTypeOption, materialTypeOption, PROJECT_LOGO } from '@/utils/const';
const props = defineProps({
  config: {
    type: Object,
    required: true
  },
  preCount: {
    type: Number,
    default: 0
  },
  taskType: {
    type: Number,
    default: 1
  },
  disabled: {
    type: Boolean,
    default: false
  },
  preCheckLoading: {
    type: Boolean,
    default: false
  }
});

const { config, preCount, taskType, disabled, preCheckLoading } = toRefs(props);

defineEmits(['pre-check']);

const store = useStore();
const projectOption = computed(() => store.getters.getProjectOption.filter(item => item.value !== 0));
const isLogoShow = computed(() => {
  if (taskType.value === 1) return config.value.merge_type === 1;
  else return false;
});
const logo = computed(() => PROJECT_LOGO[config.value.project_id]);
</script>

<style scoped lang="scss">
.task-base-info {
  position: sticky;
  top: 52px;
  z-index: 10;
  display: flex;
  align-items: stretch;
  padding: 6px 0px 4px 0px;
  background-color: #ffffff;
  border-bottom: 1px solid #f0f0f0;
  &:hover {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
}

.task-base-info-content {
  flex: 1;
}

.task-base-info-item {
  display: flex;
  align-items: center;
  min-height: 26px;
  padding: 2px 2px;
  font-size: 12px;
  color: #4b5563;
  transition: background-color 0.2s ease;
}

.task-base-info-item:hover {
  background-color: rgba(22, 119, 255, 0.03);
}

.task-base-info-label {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  width: 108px;
  text-align: right;
  font-weight: 500;
  color: #8c8c8c;
  flex-shrink: 0;
}

.task-base-info-label-icon {
  width: 16px;
  height: 16px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.14);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: #6b7280;
}

.task-base-info-label-text {
  line-height: 1;
}

.task-base-info-label--id .task-base-info-label-icon::before {
  content: '#';
}

.task-base-info-label--project .task-base-info-label-icon::before {
  content: 'P';
}

.task-base-info-label--mode .task-base-info-label-icon::before {
  content: 'M';
}

.task-base-info-label--merge .task-base-info-label-icon::before {
  content: 'S';
}

.task-base-info-label--material .task-base-info-label-icon::before {
  content: 'R';
}

.task-base-info-label--logo .task-base-info-label-icon::before {
  content: 'L';
}

.task-base-info-label--name .task-base-info-label-icon::before {
  content: 'N';
}

.task-base-info-label--count .task-base-info-label-icon::before {
  content: '∑';
}

.task-base-info-value {
  color: #1f2937;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  img {
    margin-left: 8px;
    width: 16px;
    height: 16px;
    border-radius: 999px;
  }
}

.task-base-info-value--strong {
  font-weight: 600;
  color: #111827;
}
</style>
