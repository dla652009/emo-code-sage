<template>
  <div class="bg-white rounded-lg h-full">
    <a-page-header :title="route.name" @back="goBack" class="!sticky top-0 !bg-white w-full z-10" />
    <div class="p-10 pt-0">
      <div
        class="px-6 py-3 mb-4 bg-gray-50 border border-gray-100 rounded-lg flex items-center text-sm text-gray-700 gap-6"
      >
        <div class="flex-1 flex items-center min-w-0">
          <span class="text-gray-500 mr-1">素材体系：</span>
          <span class="text-gray-900 font-medium truncate" :title="creative.content_type_label || '--'">
            {{ creative.content_type_label || '--' }}
          </span>
        </div>
        <!-- <div class="flex-1 flex items-center min-w-0">
          <span class="text-gray-500 mr-1">素材格式：</span>
          <span class="text-gray-900 font-medium truncate">--</span>
        </div> -->
        <div class="flex-1 flex items-center min-w-0">
          <span class="text-gray-500 mr-1">素材库：</span>
          <span class="text-gray-900 font-medium truncate" :title="creative.creative_type_label || '--'">
            {{ creative.creative_type_label || '--' }}
          </span>
        </div>
        <div class="flex-1 flex items-center min-w-0">
          <span class="text-gray-500 mr-1">素材师：</span>
          <span class="text-gray-900 font-medium truncate" :title="creative.author_label || '--'">
            {{ creative.author_label || '--' }}
          </span>
        </div>
        <div class="flex-1 flex items-center min-w-0">
          <span class="text-gray-500 mr-1">投放人群性别：</span>
          <span class="text-gray-900 font-medium truncate" :title="creative.gender_label || '--'">
            {{ creative.gender_label || '--' }}
          </span>
        </div>
        <div class="flex-1 flex items-center min-w-0">
          <span class="text-gray-500 mr-1">素材语言：</span>
          <span class="text-gray-900 font-medium truncate" :title="creative.lang_label || '--'">
            {{ creative.lang_label || '--' }}
          </span>
        </div>
      </div>
      <a-alert show-icon type="warning" class="mb-4">
        <template #message>
          素材上传需<span class="blue">开启代理</span>，未开启将无法完成上传；上传过程中<span class="blue">请勿关闭</span
          >页面，避免上传失败。<br />
          建议单次上传<span class="blue">10-15</span>条素材，大体积素材请<span class="blue">单独上传</span
          >；若上传进度卡顿、页面长时间无响应，可<span class="blue">重新上传</span>解决网络异常问题。
        </template>
      </a-alert>
      <a-upload-dragger
        v-model:fileList="fileList"
        :accept="accept"
        name="file"
        :multiple="true"
        :beforeUpload="beforeUpload"
        :customRequest="customRequest"
        :progress="progress"
        @remove="handleRemove"
        @change="handleFileChange"
        class="mb-4"
      >
        <p class="ant-upload-drag-icon !mb-1">
          <InboxOutlined />
        </p>
        <p class="ant-upload-text">点击或拖拽文件到此区域进行上传</p>
        <p class="ant-upload-hint">支持单个或批量上传。严禁上传公司数据或其他禁止文件</p>
        <p class="ant-upload-hint">上传图片支持 .jpg .png .gif 格式，上传视频支持 .mp4 格式，上传音频支持 .mp3 格式</p>
        <template #itemRender="{ file, actions }">
          <div class="flex items-center justify-between">
            <div class="flex-1 min-w-0">
              <div class="font-medium truncate">{{ file.name }}</div>
              <div class="text-xs text-gray-500 mt-1">
                <span>已上传：{{ formatFileSize(file.loaded || 0) }} / {{ formatFileSize(file.total || 0) }}</span>
              </div>
              <a-progress
                :percent="file.percent || 0"
                :strokeWidth="4"
                class="mt-1"
                :status="
                  file.status === 'error'
                    ? 'exception'
                    : file.status === 'done'
                      ? 'success'
                      : file.status === 'cancelled'
                        ? 'exception'
                        : 'active'
                "
              />
            </div>
            <a-tooltip title="重新上传">
              <a-button
                type="link"
                @click="handleReload(file)"
                :disabled="!['error', 'cancelled'].includes(file.status)"
              >
                <ReloadOutlined />
              </a-button>
            </a-tooltip>
            <a-tooltip title="取消">
              <a-button
                type="link"
                @click="handleCancel(file)"
                danger
                :disabled="file.status === 'done' || file.status === 'cancelled'"
              >
                <StopOutlined />
              </a-button>
            </a-tooltip>
            <!-- <a-tooltip title="删除">
              <a-button type="link" @click="handleDelete(file)" danger :disabled="file.status === 'uploading'">
                <DeleteOutlined />
              </a-button>
            </a-tooltip> -->
          </div>
        </template>
      </a-upload-dragger>
    </div>
  </div>
</template>

<script setup>
import * as Api from './api';
import { message, Modal } from 'ant-design-vue';
import { S3Client } from '@aws-sdk/client-s3';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';
import { Upload } from '@aws-sdk/lib-storage';
import { getEnv } from '@/api';
import { ReloadOutlined, StopOutlined, InboxOutlined, DeleteOutlined } from '@ant-design/icons-vue';

const route = useRoute();
const router = useRouter();
const env = getEnv();
const accept = '.jpg, .png, .gif, .mp4, .mp3';
const progress = {
  strokeColor: {
    '0%': '#108ee9',
    '100%': '#87d068'
  },
  strokeWidth: 3,
  format: percent => `${parseFloat(percent.toFixed(2))}%`,
  class: 'test'
};

// 在组件卸载时取消所有正在进行的上传
onUnmounted(() => {
  // 先通过 AbortController 中断所有底层 HTTP 请求
  Object.values(fileAbortControllers.value).forEach(controller => {
    try {
      controller.abort();
    } catch (error) {
      console.error('清理 AbortController 时出错:', error);
    }
  });
  fileAbortControllers.value = {};

  // 清除所有模拟进度定时器
  Object.values(fileProgressTimers.value).forEach(timer => {
    clearInterval(timer);
  });
  fileProgressTimers.value = {};

  // 取消所有未完成的上传
  Object.values(fileAbort.value).forEach(abortFn => {
    if (typeof abortFn === 'function') {
      try {
        abortFn();
      } catch (error) {
        console.error('清理上传请求时出错:', error);
      }
    }
  });

  // 清空相关的引用
  fileAbort.value = {};

  sessionStorage.removeItem('creative_config');
});

const config = {
  region: 'us-east-1', // 你的S3桶区域
  identityPoolId: 'us-east-1:a190432d-5100-41d5-9200-bba0a176bf3f', // Cognito身份池ID
  bucketName: 'dailyyogastream' // 你的S3桶名
};

// 初始化S3客户端（用Cognito临时凭证）
const s3Client = new S3Client({
  region: config.region,
  // 从Cognito身份池获取临时凭证（自动刷新）
  credentials: fromCognitoIdentityPool({
    identityPoolId: config.identityPoolId,
    region: config.region
  })
});

const creative = JSON.parse(sessionStorage.getItem('creative_config') || '{}');
const fileList = ref([]);
const uploadFinishedFiles = ref([]);
const uploadedFileNames = ref([]);
const uploadedFileMd5Names = ref([]);
const uploadErrFiles = ref(new Set());
const keyPrefix = ref(env == 'online' ? 'auto_ads_creative' : 'dev_auto_ads_creative');

const fileStartTime = ref({});

const fileAbort = ref({});
const fileAbortControllers = ref({});
const fileProgressTimers = ref({});

const fileFingerprints = ref(new Set());

const originalFiles = ref({});

let duplicateCheckTimer = null;

const handleRemove = file => {
  const fingerprint = `${file.name}_${file.size}`;
  fileFingerprints.value.delete(fingerprint);

  if (uploadErrFiles.value.has(file.name)) return true;
  message.warning('素材上传中，无法删除');
  return false;
};

const formatFileSize = bytes => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const beforeUpload = (file, fileListParam) => {
  // 生成文件指纹（文件名+大小），用于识别重复文件
  const fingerprint = `${file.name}_${file.size}`;

  if (fileFingerprints.value.has(fingerprint)) {
    return false;
  }

  return true;
};

const handleFileChange = ({ file, fileList: newFileList }) => {
  if (file && file.status === undefined) {
    if (duplicateCheckTimer) {
      clearTimeout(duplicateCheckTimer);
    }

    duplicateCheckTimer = setTimeout(() => {
      nextTick(() => {
        const rejectedFiles = newFileList.filter(f => f.status === undefined);
        if (rejectedFiles.length > 0) {
          Modal.warning({
            title: '重复素材提示',
            content: () =>
              h('div', null, [
                h('span', null, '检测到有 '),
                h('span', { class: 'blue' }, rejectedFiles.length),
                h('span', null, ' 条重复素材,重复素材将取消上传')
              ]),
            okText: '确定'
          });
          fileList.value = newFileList.filter(f => f.status !== undefined);
        }
        duplicateCheckTimer = null;
      });
    }, 100);
  }
};

const customRequest = async info => {
  info.md5Name = CryptoUtils.MD5Util.encrypt(`${Date.now()}-${info.file.name}`);

  originalFiles.value[info.file.uid] = info.file.originFileObj || info.file;

  const fingerprint = `${info.file.name}_${info.file.size}`;
  fileFingerprints.value.add(fingerprint);

  fileStartTime.value[info.file.uid] = Date.now();

  info.file.total = info.file.size;
  info.file.loaded = 0;
  info.file.percent = 0;

  try {
    const abortController = new AbortController();
    fileAbortControllers.value[info.file.uid] = abortController;

    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: config.bucketName,
        Key: `${keyPrefix.value}/${info.md5Name}`,
        Body: originalFiles.value[info.file.uid] || info.file,
        ContentType: info.file.type || 'application/octet-stream',
        ACL: 'public-read'
      },
      partSize: 1024 * 1024 * 1024, // 1GB
      queueSize: 3,
      abortSignal: abortController.signal
    });
    // 保存中止函数
    fileAbort.value[info.file.uid] = upload.abort.bind(upload);
    let simulatedProgress = 0;
    const progressIncrement = 99 / ((30 * 1000) / 100);
    const fileUid = info.file.uid;

    const simulateProgressTimer = setInterval(() => {
      const currentFile = fileList.value.find(f => f.uid === fileUid);
      if (!currentFile || currentFile.status === 'cancelled') {
        clearInterval(simulateProgressTimer);
        delete fileProgressTimers.value[fileUid];
        return;
      }

      simulatedProgress += progressIncrement;
      if (simulatedProgress > 99) {
        simulatedProgress = 99;
      }

      const loaded = Math.floor((simulatedProgress / 100) * info.file.total);

      info.file.percent = Math.floor(simulatedProgress);
      info.file.loaded = loaded;

      info.onProgress({
        percent: info.file.percent,
        loaded: info.file.loaded,
        total: info.file.total
      });
    }, 100);

    fileProgressTimers.value[fileUid] = simulateProgressTimer;

    const response = await upload.done();

    clearInterval(fileProgressTimers.value[info.file.uid]);
    delete fileProgressTimers.value[info.file.uid];

    if (info.file.status === 'cancelled') {
      return;
    }
    info.file.percent = 100;
    info.file.loaded = info.file.total;

    info.onProgress({
      percent: 100,
      loaded: info.file.total,
      total: info.file.total
    });

    uploadedFileNames.value.push(info.file.name);
    uploadedFileMd5Names.value.push(info.md5Name);
    uploadFinishedFiles.value.push(info.file.name);
    info.onSuccess(response);

    checkAllUploadFinished();
  } catch (error) {
    if (error.name === 'AbortError') return;
    console.error('上传出错:', error);
    message.error(`${info.file.name} 上传失败`);
    uploadErrFiles.value.add(info.file.name);
    uploadFinishedFiles.value.push(info.file.name);
    info.onError(error);

    checkAllUploadFinished();
  }
};

function handleCreateCreative(isAllSuccess, successCount, failCount) {
  Api.createCreative({
    ...creative,
    creative_name_list: uploadedFileNames.value.join(','),
    s3_creative_name_list: uploadedFileMd5Names.value.join(',')
  })
    .then(({ data }) => {
      if (data.error_code) return message.error(data.error_desc);

      // 根据上传结果显示不同的提示
      if (isAllSuccess) {
        // 全部成功：跳转到列表页，显示成功提示
        message.success({
          content: () =>
            h('div', null, [
              h('span', null, '上传成功 '),
              h('span', { class: 'blue' }, successCount),
              h('span', null, ' 条')
            ])
        });
        router.push({ name: 'CreativeList' });
      } else {
        // 部分失败：显示成功和失败数量，保留在当前页面
        message.warning({
          content: () =>
            h('div', null, [
              h('span', null, '上传成功 '),
              h('span', { class: 'blue' }, successCount),
              h('span', null, ' 条，上传失败 '),
              h('span', { class: 'red' }, failCount),
              h('span', null, ' 条')
            ])
        });

        fileList.value = fileList.value.filter(file => file.status === 'error' || file.status === 'cancelled');

        uploadedFileNames.value = [];
        uploadedFileMd5Names.value = [];
        uploadFinishedFiles.value = [];
      }
    })
    .catch((error) => {
      console.error(error);
      message.error('素材创建失败,请重试');
    });
}
const handleReload = async file => {
  // 只有失败或取消的文件才能重传
  if (file.status !== 'error' && file.status !== 'cancelled') {
    message.warning('只能重传失败或已取消的文件');
    return;
  }

  if (!originalFiles.value[file.uid]) {
    message.error('无法找到原始文件，请重新选择文件上传');
    return;
  }

  uploadErrFiles.value.delete(file.name);

  const finishedIndex = uploadFinishedFiles.value.indexOf(file.name);
  if (finishedIndex > -1) {
    uploadFinishedFiles.value.splice(finishedIndex, 1);
  }

  file.status = 'uploading';
  file.percent = 0;
  file.loaded = 0;

  const index = fileList.value.findIndex(item => item.uid === file.uid);
  if (index > -1) {
    fileList.value[index].status = 'uploading';
    fileList.value[index].percent = 0;
    fileList.value[index].loaded = 0;
  }

  const info = {
    file: file,
    onProgress: ({ percent, loaded, total }) => {
      file.percent = percent;
      file.loaded = loaded;
      file.total = total;
      if (index > -1) {
        fileList.value[index].percent = percent;
        fileList.value[index].loaded = loaded;
        fileList.value[index].total = total;
      }
    },
    onSuccess: response => {
      file.status = 'done';
      if (index > -1) {
        fileList.value[index].status = 'done';
      }
      message.success(`${file.name} 重新上传成功`);
    },
    onError: error => {
      file.status = 'error';
      if (index > -1) {
        fileList.value[index].status = 'error';
      }
      console.error('重传失败:', error);
      message.error(`${file.name} 重新上传失败`);
    }
  };

  // 重新上传
  await customRequest(info);
};
const handleDelete = file => {
  Modal.confirm({
    title: '删除素材',
    content: `确定要删除${file.name}吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      if (file.status === 'uploading') {
        if (fileProgressTimers.value[file.uid]) {
          clearInterval(fileProgressTimers.value[file.uid]);
          delete fileProgressTimers.value[file.uid];
        }

        if (fileAbortControllers.value[file.uid]) {
          fileAbortControllers.value[file.uid].abort();
          delete fileAbortControllers.value[file.uid];
        }

        if (fileAbort.value[file.uid]) {
          try {
            fileAbort.value[file.uid]();
          } catch (error) {
            console.error('取消上传时发生错误:', error);
          }
          delete fileAbort.value[file.uid];
        }
      }

      const fingerprint = `${file.name}_${file.size}`;
      fileFingerprints.value.delete(fingerprint);

      uploadErrFiles.value.delete(file.name);

      const finishedIndex = uploadFinishedFiles.value.indexOf(file.name);
      if (finishedIndex > -1) {
        uploadFinishedFiles.value.splice(finishedIndex, 1);
      }

      const uploadedIndex = uploadedFileNames.value.indexOf(file.name);
      if (uploadedIndex > -1) {
        uploadedFileNames.value.splice(uploadedIndex, 1);
        uploadedFileMd5Names.value.splice(uploadedIndex, 1);
      }

      delete originalFiles.value[file.uid];

      const index = fileList.value.findIndex(item => item.uid === file.uid);
      if (index > -1) {
        fileList.value.splice(index, 1);
      }

      message.success(`${file.name} 已删除`);
    }
  });
};
const handleCancel = file => {
  if (fileAbort.value[file.uid] || fileAbortControllers.value[file.uid]) {
    try {
      // 停止进度条
      if (fileProgressTimers.value[file.uid]) {
        clearInterval(fileProgressTimers.value[file.uid]);
        delete fileProgressTimers.value[file.uid];
      }
      if (fileAbortControllers.value[file.uid]) {
        fileAbortControllers.value[file.uid].abort();
        delete fileAbortControllers.value[file.uid];
      }
      if (fileAbort.value[file.uid]) {
        fileAbort.value[file.uid]();
        delete fileAbort.value[file.uid];
      }
      const fingerprint = `${file.name}_${file.size}`;
      fileFingerprints.value.delete(fingerprint);

      file.status = 'cancelled';
      const index = fileList.value.findIndex(item => item.uid === file.uid);
      if (index > -1) {
        fileList.value[index].status = 'cancelled';
      }
      const finishedIndex = uploadFinishedFiles.value.indexOf(file.name);
      if (finishedIndex > -1) {
        uploadFinishedFiles.value.splice(finishedIndex, 1);
      }
      uploadErrFiles.value.add(file.name);
      message.info(`${file.name} 上传已取消`);
    } catch (error) {
      console.error('取消上传时发生错误:', error);
      message.error(`${file.name} 取消上传失败`);
    }
  } else {
    message.warning('无法取消上传，上传可能已完成或尚未开始');
  }
};
const checkAllUploadFinished = () => {
  // 等待下一个tick，确保状态已更新
  nextTick(() => {
    const hasUploading = fileList.value.some(item => item.status === 'uploading');

    if (hasUploading) return;

    const successCount = uploadedFileNames.value.length;
    const failCount = uploadErrFiles.value.size;

    if (successCount === 0 && failCount === 0) return;

    // 情况1：全部上传成功
    if (successCount > 0 && failCount === 0) {
      handleCreateCreative(true, successCount, failCount);
    }
    // 情况2：部分上传失败
    else if (successCount > 0 && failCount > 0) {
      handleCreateCreative(false, successCount, failCount);
    }
    // 情况3：全部失败，只显示提示，不提交
    else if (successCount === 0 && failCount > 0) {
      message.error({
        content: () =>
          h('div', null, [h('span', null, '上传失败 '), h('span', { class: 'red' }, failCount), h('span', null, ' 条')])
      });
      // 只保留失败的文件
      fileList.value = fileList.value.filter(file => file.status === 'error' || file.status === 'cancelled');
    }
  });
};
const goBack = () => {
  router.go(-1);
};
</script>
