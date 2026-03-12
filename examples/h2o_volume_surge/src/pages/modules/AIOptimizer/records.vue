<template>
  <div class="ai-chat-page">
    <a-card class="ai-chat-card" :bordered="false">
      <div class="ai-chat-header">
        <div class="ai-chat-header-left">
          <div class="ai-chat-title">
            <a-button type="text" shape="circle" size="small" :icon="h(LeftOutlined)" @click="handleBack" />
            <!-- <span class="ai-chat-title-dot"></span> -->
            <span class="ai-chat-title-text">AI 优化师工作记录</span>
          </div>
        </div>
        <div class="ai-chat-status">
          <span class="ai-chat-status-dot"></span>
          <span class="ai-chat-status-text">智能在线</span>
        </div>
      </div>
      <div class="ai-chat-body">
        <XProvider>
          <div class="ai-chat-messages" ref="messagesContainer">
            <template v-if="messages.length">
              <Bubble.List :items="messages" :roles="bubbleRoles">
                <template #header="{ item }">
                  <div
                    class="ai-chat-bubble-meta"
                    :class="item.role === 'assistant' ? 'ai-chat-bubble-meta--assistant' : 'ai-chat-bubble-meta--user'"
                  >
                    <span class="ai-chat-bubble-name">{{ item.name }}</span>
                    <span class="ai-chat-bubble-time">{{ item.createdAt }}</span>
                  </div>
                </template>
                <template #footer="{ item }">
                  <div v-if="item.role === 'assistant'" class="ai-chat-bubble-footer">
                    <a-button type="text" size="small" :icon="h(CopyOutlined)" @click="handleCopy(item.content)" />
                  </div>
                </template>
              </Bubble.List>
            </template>
            <div v-else class="ai-chat-empty">
              <div class="ai-chat-empty-panel">
                <div class="ai-chat-empty-icon">
                  <img src="/favicon.png" alt="ADS BOOM" />
                </div>
                <div class="ai-chat-empty-title">欢迎使用 AI 优化师</div>
                <div class="ai-chat-empty-subtitle">从一个问题开始，让我帮你梳理投放思路</div>
                <!-- <div class="ai-chat-empty-prompts">
                  <Prompts
                    :items="welcomePrompts"
                    wrap
                    :styles="{ item: { width: '240px' } }"
                    @itemClick="handlePromptClick"
                  />
                </div> -->
              </div>
            </div>
          </div>
          <div class="ai-chat-footer">
            <Sender
              v-model:value="inputValue"
              :placeholder="senderPlaceholder"
              :read-only="senderDisabled"
              :loading="loading"
              size="large"
              @submit="handleSubmit"
            />
          </div>
        </XProvider>
      </div>
    </a-card>
  </div>
</template>

<script setup>
import { h, ref, nextTick, onUnmounted } from 'vue';
import { useScopedLoading } from '@/composables/useScopedLoading.js';
import MarkdownIt from 'markdown-it';
import dayjs from 'dayjs';
import { getChatLogList, sendChat, createWork } from './api.js';
import { localGet } from '@/utils/gatekeeper_tools';
import {
  CopyOutlined,
  LeftOutlined,
  UserOutlined,
  LineChartOutlined,
  AlertOutlined,
  BulbOutlined,
  ExperimentOutlined
} from '@ant-design/icons-vue';
import { message, Spin } from 'ant-design-vue';
import { Bubble, Sender, XProvider, Prompts } from 'ant-design-x-vue';
import { useRoute, useRouter } from 'vue-router';
const route = useRoute();
const router = useRouter();
const { loading } = useScopedLoading('loading-send-chart');

const md = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: true,
  highlight: true,
  typographer: true
});

const ASSISTANT_NAME = 'AI 优化师';
const USER_NAME = localGet('OperatorName');

const renderMarkdown = content => {
  if (!content) return '';
  return md.render(String(content));
};

const TYPING_OPTION = {
  step: 8,
  interval: 50
};
const bubbleRoles = {
  assistant: {
    placement: 'start',
    avatar: {
      name: ASSISTANT_NAME,
      src: '/favicon.png'
    },
    style: {
      maxWidth: '640px',
      marginInlineEnd: 'auto'
    },
    messageRender: content =>
      h('div', {
        class: 'ai-chat-md-message',
        innerHTML: renderMarkdown(content)
      }),
    loadingRender: () =>
      h(
        'div',
        {
          class: 'ai-chat-loading'
        },
        [h(Spin, { size: 'small' })]
      )
  },
  user: {
    placement: 'end',
    avatar: {
      name: USER_NAME,
      icon: h(UserOutlined)
    },
    style: {
      maxWidth: '640px',
      marginInlineStart: 'auto'
    }
  }
};

const welcomePrompts = [
  {
    key: 'overview',
    icon: h(LineChartOutlined, { style: { color: '#52C41A' } }),
    label: '整体投放概览',
    description: '回顾最近 7 天的消耗、转化和关键指标走势'
  },
  {
    key: 'reason',
    icon: h(AlertOutlined, { style: { color: '#FF4D4F' } }),
    label: '转化下降排查',
    description: '从渠道、受众、素材等维度排查效果下滑原因'
  },
  {
    key: 'suggest',
    icon: h(BulbOutlined, { style: { color: '#FFD700' } }),
    label: '生成优化建议',
    description: '基于当前表现给出 2-3 条可执行优化动作'
  },
  {
    key: 'abtest',
    icon: h(ExperimentOutlined, { style: { color: '#1890FF' } }),
    label: '设计 A/B 测试',
    description: '围绕创意或受众，生成一组可落地的实验方案'
  }
];

const senderPlaceholder = '描述你的诉求';
const messagesContainer = ref(null);
const messages = ref([]);
const queryParams = ref({});
const inputValue = ref('');
const senderDisabled = computed(() => loading.value || queryParams.value.status != 1);

const handleBack = () => {
  router.back();
};

const scrollToBottom = () => {
  nextTick(() => {
    const el = messagesContainer.value;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  });
};

let typingIntervalId = null;
let typingTimeoutId = null;

const stopTypingScroll = () => {
  if (typingIntervalId !== null) {
    clearInterval(typingIntervalId);
    typingIntervalId = null;
  }
  if (typingTimeoutId !== null) {
    clearTimeout(typingTimeoutId);
    typingTimeoutId = null;
  }
};

const startTypingScroll = content => {
  stopTypingScroll();
  const length = String(content || '').length;
  const step = TYPING_OPTION.step || 1;
  const interval = TYPING_OPTION.interval || 50;
  const duration = Math.max(Math.ceil(length / step) * interval + 300, 500);
  typingIntervalId = window.setInterval(scrollToBottom, interval);
  typingTimeoutId = window.setTimeout(() => {
    stopTypingScroll();
    scrollToBottom();
  }, duration);
};

onUnmounted(() => {
  stopTypingScroll();
});

const formatDateTime = (value = Date.now()) => dayjs(value).format('YYYY-MM-DD HH:mm:ss');

const handlePromptClick = ({ data }) => {
  if (!data || !data.label) return;
  inputValue.value = data.label;
};

const handleCopy = async content => {
  if (!content) return;
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(content);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = content;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    message.success('已复制到剪贴板');
  } catch (e) {
    message.error('复制失败，请稍后重试');
  }
};

const handleSubmit = async value => {
  const raw = typeof value === 'string' ? value : inputValue.value;
  inputValue.value = '';
  const text = raw.trim();
  if (!text || loading.value) return;
  let loadingKey = '';
  try {
    pushMessage({
      role: 'user',
      name: USER_NAME,
      content: text,
      createdAt: formatDateTime()
    });
    loadingKey = `assistant-loading-${Date.now()}`;
    pushMessage({
      key: loadingKey,
      role: 'assistant',
      name: ASSISTANT_NAME,
      loading: true,
      content: ''
    });
    loading.value = true;
    // 若 work_id 不存在，则创建新的 work_id 进行对话
    if (!queryParams.value.work_id) {
      const { data } = await createWork({ optimizer_id: queryParams.value.optimizer_id });
      if (data.error_code) return message.error(data.error_desc);
      router.replace({ query: { ...route.query, work_id: data.result.work_id } });
      queryParams.value.work_id = data.result.work_id;
    }
    // 发送消息
    const { data } = await sendChat({ work_id: queryParams.value.work_id, message: text }, 'loading-send-chart');
    queryParams.value.status = data?.result?.status || 1;
    router.replace({ query: { ...route.query, status: queryParams.value.status } });
    loading.value = false;
    if (data.error_code) {
      messages.value = messages.value.filter(item => item.key !== loadingKey);
      return message.error(data.error_desc);
    }
    const { content, create_time, speaker } = data?.result || {};
    messages.value = messages.value.filter(item => item.key !== loadingKey);
    pushMessage({
      role: 'assistant',
      name: speaker || ASSISTANT_NAME,
      content,
      typing: TYPING_OPTION,
      createdAt: create_time
    });
    startTypingScroll(content);
  } catch (error) {
    console.error(error);
    loading.value = false;
    if (loadingKey) {
      messages.value = messages.value.filter(item => item.key !== loadingKey);
    }
    message.error('发送消息失败，请稍后重试');
  }
};
const pushMessage = message => {
  messages.value.push(message);
  scrollToBottom();
};
const initRecord = async () => {
  try {
    queryParams.value = route.query;
    if (!queryParams.value.work_id) return;
    const { data } = await getChatLogList(queryParams.value);
    if (data.error_code) return message.error(data.error_desc);
    messages.value = data.result.map(item => ({
      role: item.chat_type === 1 ? 'user' : 'assistant',
      name: item.speaker,
      content: item.content,
      createdAt: item.create_time
    }));
    scrollToBottom();
  } catch (error) {
    console.error(error);
    message.error('获取聊天记录失败，请稍后重试');
  }
};
initRecord();
</script>

<style scoped lang="scss">
.ai-chat-page {
  position: relative;
  height: 100%;
}

.ai-chat-card {
  border-radius: 18px;
  background: linear-gradient(135deg, #ffffff, #f7fafc);
  border: 1px solid rgba(226, 232, 240, 0.9);
  box-shadow: 0 18px 45px rgba(148, 163, 184, 0.25);
  overflow: hidden;
  transition: all 0.25s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
  :deep(.ant-card-body) {
    padding: 12px 24px;
    height: calc(100% - 56px);
  }
}

.ai-chat-card:hover {
  box-shadow: 0 22px 55px rgba(148, 163, 184, 0.35);
  border-color: rgba(129, 140, 248, 0.45);
}

.ai-chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
}

.ai-chat-title {
  display: flex;
  align-items: center;
  gap: 10px;
  :deep(.ant-btn) {
    position: absolute;
    left: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.ai-chat-title-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: linear-gradient(135deg, #4f46e5, #38bdf8);
  box-shadow: 0 0 0 0 rgba(96, 165, 250, 0.5);
}

.ai-chat-title-text {
  font-size: 18px;
  font-weight: 500;
  letter-spacing: 0.02em;
  color: #111827;
}

.ai-chat-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #6b7280;
}

.ai-chat-status-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: #22c55e;
  box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4);
  animation: statusPulse 1.6s ease-out infinite;
}

.ai-chat-status-text {
  letter-spacing: 0.04em;
}

.ai-chat-body {
  padding: 4px 18px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  height: calc(100% - 56px);
}

.ai-chat-messages {
  padding: 10px 6px 8px;
  border-radius: 16px;
  border: 1px solid rgba(209, 213, 219, 0.8);
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  scroll-behavior: smooth;
  scrollbar-width: thin;
  scrollbar-color: rgba(148, 163, 184, 0.6) transparent;
  :deep(.ant-bubble-footer) {
    margin: 0;
    .ant-btn {
      color: #6b7280;
    }
  }
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-image: linear-gradient(180deg, #e5e7eb, #c7d2fe);
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.8);
    box-shadow: 0 0 0 1px rgba(148, 163, 184, 0.18);
  }

  &::-webkit-scrollbar-thumb:hover {
    background-image: linear-gradient(180deg, #d1d5db, #a5b4fc);
  }

  &::-webkit-scrollbar-button,
  &::-webkit-scrollbar-button:single-button,
  &::-webkit-scrollbar-button:vertical:increment,
  &::-webkit-scrollbar-button:vertical:decrement {
    width: 0;
    height: 0;
    background: transparent;
    border: none;
    display: none;
  }
}

.ai-chat-md-message {
  font-size: 13px;
  line-height: 1.6;
  color: #111827;
  word-break: break-word;

  p {
    margin: 0 0 4px;
  }

  ul,
  ol {
    padding-left: 20px;
    margin: 4px 0;
  }

  code {
    font-family: SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
    font-size: 12px;
    background: rgba(15, 23, 42, 0.03);
    padding: 1px 4px;
    border-radius: 4px;
  }

  pre {
    margin: 6px 0;
    padding: 8px 10px;
    border-radius: 8px;
    background: #0b1120;
    color: #e5e7eb;
    overflow-x: auto;
    font-size: 12px;
  }

  pre code {
    background: transparent;
    padding: 0;
  }

  a {
    color: #2563eb;
    text-decoration: underline;
    text-underline-offset: 2px;
  }
}

.ai-chat-text-message {
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
}

.ai-chat-empty {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ai-chat-empty-panel {
  text-align: center;
  padding: 24px 32px;
  border-radius: 20px;
  box-shadow: 0 18px 40px rgba(148, 163, 184, 0.32);
  max-width: 560px;
}

.ai-chat-empty-icon {
  width: 45px;
  height: 45px;
  margin: 0 auto 12px;
  animation: floatY 3s ease-in-out infinite;
}

.ai-chat-empty-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 6px;
}

.ai-chat-empty-subtitle {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 18px;
}

.ai-chat-empty-prompts {
  margin-top: 16px;
}

.ai-chat-empty-prompt {
  cursor: pointer;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.55);
  background: rgba(249, 250, 251, 0.9);
  color: #374151;
  font-size: 12px;
  padding: 6px 12px;
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
  transition: all 0.18s ease;
  max-width: none;
}

.ai-chat-empty-prompt-icon {
  width: 16px;
  height: 16px;
  border-radius: 999px;
  background: linear-gradient(135deg, #4f46e5, #38bdf8);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: #f9fafb;
}

.ai-chat-empty-prompt-text {
  white-space: normal;
  text-align: left;
}

.ai-chat-empty-prompt:hover {
  border-color: rgba(129, 140, 248, 0.9);
  background: linear-gradient(135deg, rgba(238, 242, 255, 0.98), rgba(224, 242, 254, 0.96));
  color: #111827;
}

.ai-chat-bubble-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: #9ca3af;
  margin-bottom: 2px;
  padding: 0 4px;
}

.ai-chat-bubble-meta--assistant {
  justify-content: flex-start;
  .ai-chat-bubble-time {
    margin-left: 8px;
  }
}

.ai-chat-bubble-meta--user {
  justify-content: flex-end;
  .ai-chat-bubble-name {
    margin-right: 8px;
  }
}

.ai-chat-bubble-name {
  color: #6b7280;
}

.ai-chat-bubble-time {
  color: #9ca3af;
}

.ai-chat-bubble-footer {
  margin-top: 4px;
  display: flex;
  justify-content: flex-end;
}

.ai-chat-loading {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #6b7280;
}

.ai-chat-loading-text {
  user-select: none;
}

.ai-chat-suggestions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 6px 2px;
}

.ai-chat-suggestions-label {
  font-size: 12px;
  color: #6b7280;
}

.ai-chat-suggestions-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.ai-chat-suggestions-tag {
  cursor: pointer;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.6);
  background: #f9fafb;
  color: #374151;
  font-size: 12px;
  padding-inline: 10px;
  transition: all 0.22s ease;
}

.ai-chat-suggestions-tag:hover {
  border-color: rgba(129, 140, 248, 0.9);
  background: linear-gradient(135deg, #eef2ff, #e0f2fe);
  color: #111827;
  transform: translateY(-1px);
}

.ai-chat-footer {
  background-color: #ffffff;
  position: absolute;
  bottom: 20px;
  left: 0;
  margin: 0 38px;
  width: calc(100% - 76px);
  padding: 6px 4px 2px;
  border-radius: 16px;
  border: none;
  box-shadow: none;
  :deep(.ant-sender-actions-btn) {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  :deep(textarea) {
    scrollbar-width: thin;
    scrollbar-color: rgba(148, 163, 184, 0.6) transparent;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background-image: linear-gradient(180deg, #e5e7eb, #c7d2fe);
      border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, 0.8);
      box-shadow: 0 0 0 1px rgba(148, 163, 184, 0.18);
    }

    &::-webkit-scrollbar-thumb:hover {
      background-image: linear-gradient(180deg, #d1d5db, #a5b4fc);
    }

    &::-webkit-scrollbar-button,
    &::-webkit-scrollbar-button:single-button,
    &::-webkit-scrollbar-button:vertical:increment,
    &::-webkit-scrollbar-button:vertical:decrement {
      width: 0;
      height: 0;
      background: transparent;
      border: none;
      display: none;
    }
  }
}

@keyframes statusPulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.6);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 12px rgba(34, 197, 94, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
  }
}

@media (max-width: 767px) {
  .ai-chat-card,
  .ai-chat-side {
    border-radius: 16px;
  }

  .ai-chat-header {
    padding-inline: 16px;
  }

  .ai-chat-body {
    padding-inline: 12px;
  }

  .ai-chat-messages {
    max-height: 420px;
  }
}

@keyframes floatY {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
  100% {
    transform: translateY(0);
  }
}
</style>
