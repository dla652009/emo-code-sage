<template>
  <div class="s3-upload">
    <a-upload-dragger
      v-model:fileList="fileList"
      name="file"
      :multiple="true"
      :customRequest="customRequest"
      @drop="handleDrop"
      :progress="progress"
    >
      <p class="ant-upload-drag-icon">
        <inbox-outlined></inbox-outlined>
      </p>
      <p class="ant-upload-text">点击或拖拽文件到此区域进行上传</p>
      <p class="ant-upload-hint">支持单个或批量上传。严禁上传公司数据或其他禁止文件</p>
    </a-upload-dragger>
  </div>
</template>
<script setup>
import { ref } from 'vue';
import { message } from 'ant-design-vue';
import { S3Client } from '@aws-sdk/client-s3';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';
import { Upload } from '@aws-sdk/lib-storage';

const progress = {
  strokeColor: {
    '0%': '#108ee9',
    '100%': '#87d068'
  },
  strokeWidth: 3,
  format: percent => `${parseFloat(percent.toFixed(2))}%`,
  class: 'test'
};

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

const fileList = ref([]);
const customRequest = async info => {
  console.log(info.file);
  try {
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: config.bucketName,
        Key: `dev_auto_ads_creative/${Date.now()}-${info.file.name}`,
        Body: info.file,
        ContentType: info.file.type || 'application/octet-stream',
        ACL: 'public-read'
      },
      // 方案A：将 partSize 调到超大以避免分片，走单次 PutObject
      partSize: 1024 * 1024 * 1024, // 1GB
      queueSize: 3
    });

    upload.on('httpUploadProgress', progress => {
      if (progress.total) {
        const percent = Math.round((progress.loaded / progress.total) * 100);
        console.log('上传进度:', percent);
        info.onProgress({ percent });
      }
    });

    const response = await upload.done();
    console.log('上传完成', response.Location, info.file.name);
    // todo 把response中的url传给服务端保存
    info.onSuccess(response);
  } catch (error) {
    console.error('上传文件到S3失败:', error);
    message.error(`${info.file.name} file upload failed.`);
    info.onError(error);
  }
};
function handleDrop(e) {
  console.log(e);
}
</script>
