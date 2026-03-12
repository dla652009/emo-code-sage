<template>
  <a-tooltip :title="tip">
    <div class="__img-upload__" :id="id">
      <a-upload
        :disabled="disabled"
        :accept="accept"
        :multiple="multiple"
        :list-type="listType"
        :before-upload="beforeUpload"
        :show-upload-list="showUploadList ? { showPreviewIcon, showRemoveIcon } : false"
        :file-list="fileList"
        @remove="removeFile"
      >
        <template v-if="uploading">
          <loading-outlined />
        </template>
        <template v-if="showUploadBtn">
          <slot>
            <template v-if="tip">
              {{ tip }}
            </template>
            <template v-else>
              <video-camera-outlined v-if="isVideo" />
              <picture-outlined v-else />
            </template>
          </slot>
        </template>
      </a-upload>
    </div>
  </a-tooltip>
  <div v-if="limit == 1 && files.indexOf('.pag') > -1">
    <a-button type="link" @click="handlePreviewPag">预览pag文件</a-button>
  </div>
  <a-modal
    title="PAG文件预览"
    v-model:open="pag_preview_visible"
    @ok="pag_preview_visible = false"
    v-if="pag_preview_visible"
  >
    <div class="text-center" v-if="pag_lib_loading">预览插件加载中，请稍等</div>
    <div class="flex justify-center bg-black">
      <canvas class="canvas" id="preview_pag" style="width: 300px"></canvas>
    </div>
  </a-modal>
</template>
<script>
import * as Common from '@/api/common.js';
import Sortable from 'sortablejs';
import { LoadingOutlined, PictureOutlined, VideoCameraOutlined } from '@ant-design/icons-vue';
import { loadJS } from '@/utils/index.js';

let pag = null;
export default {
  components: {
    LoadingOutlined,
    PictureOutlined,
    VideoCameraOutlined
  },
  props: {
    tip: String,
    isVideo: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    showUploadList: {
      type: Boolean,
      default: true
    },
    limit: {
      type: Number,
      default: 0
    },
    size: {
      type: Number,
      default: 0
    },
    files: {
      type: String,
      default: ''
    },
    showPreviewIcon: {
      type: Boolean,
      default: true
    },
    showRemoveIcon: {
      type: Boolean,
      default: true
    },
    listType: {
      type: String,
      default: 'picture-card'
    },
    accept: String,
    suffixWh: {
      type: Boolean,
      default: false
    }
  },
  emits: ['uploading', 'update:files', 'addFile', 'remove'],
  data() {
    return {
      uploading: false,
      fileList: [],
      id: new Date().getTime().toString(),
      pag_preview_visible: false,
      pag_lib_loading: false
    };
  },
  computed: {
    showUploadBtn() {
      if (this.uploading) return false;
      if (!this.limit) return true;
      return this.fileList.length < this.limit;
    },
    multiple() {
      return !(this.limit === 1);
    }
  },
  mounted() {
    let me = this;
    if (this.limit > 1) this.init();
  },
  methods: {
    handlePreviewPag() {
      this.pag_preview_visible = true;
      this.pag_lib_loading = true;
      if (!window.libpag) {
        loadJS('https://dystatich5.dailyyoga.com/h5/h5_static_files/libpag.min.js', () => {
          this.renderPag();
        });
      } else {
        this.renderPag();
      }
    },
    async renderPag() {
      // Initialize pag webassembly module.
      if (!window.$PAG) {
        window.$PAG = await window.libpag.PAGInit();
      }
      // Fetch pag file.
      const buffer = await fetch(this.files).then(response => response.arrayBuffer());

      // Load the PAGFile from file.
      const pagFile = await window.$PAG.PAGFile.load(buffer);
      // Set the width from the PAGFile.
      const canvas = document.getElementById('preview_pag');
      canvas.width = pagFile.width();
      canvas.height = pagFile.height();
      // Create PAGView.
      pag = await window.$PAG.PAGView.init(pagFile, canvas);
      // Set PAGView play infinity.
      pag.setRepeatCount(0);
      this.pag_lib_loading = false;
      await pag.play();
    },
    init() {
      let el = document.getElementById(this.id).getElementsByClassName(`ant-upload-list`)[0];
      new Sortable(el, {
        animation: 800,
        draggable: '.ant-upload-list-picture-card-container',
        ghostClass: 'sortable-ghost',
        onUpdate: Evt => this.handleUpdate(Evt)
      });
    },
    handleUpdate(Evt) {
      this.fileList.splice(Evt.newIndex, 0, this.fileList.splice(Evt.oldIndex, 1)[0]);
      let afterDragFiles = this.fileList.map(i => i.url).join(',');
      this.$emit('update:files', afterDragFiles);
    },
    beforeUpload(file) {
      let me = this;
      return new Promise((resolve, reject) => {
        const isLt2kb = this.size && this.size > 0 && file.size / 1024 > this.size;
        if (isLt2kb) {
          me.$message.error(`上传文件大于${this.size}kb!`);
          reject(false);
        } else {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
            me.uploadImage(file, {
              image_name: file.name,
              image_content: reader.result.split(',')[1]
            });
            reject();
          };
        }
      });
    },
    uploadImage(file, formData) {
      this.$emit('uploading', true);
      this.uploading = true;
      Common.uploadImage(formData)
        .then(({ data }) => {
          this.uploading = false;
          this.$emit('uploading', false);
          if (data.error_code) return;
          let suffixWh = '';
          let f = {
            url: data.result.url,
            status: 'done',
            sizes: `${data.result.width}x${data.result.height}`,
            name: file.name,
            uid: file.uid
          };
          if (this.suffixWh) {
            f.url = `${f.url}?w=${f.sizes}`;
          }
          this.addFile(f);
        })
        .catch(() => {
          this.uploading = false;
          this.$emit('uploading', false);
        });
    },
    /**
     * [addFile 上传图片完成回调方法]
     * @param {[type]} f [description]
     */
    addFile(f) {
      this.fileList.push(f);
      let newFiles = this.fileList.map(i => i.url).join(',');
      this.$emit('update:files', newFiles);
      this.$emit('addFile', f);
    },
    /**
     * [removeFile 删除图片完成回调方法]
     * @param  {[type]} file [description]
     * @return {[type]}      [description]
     */
    removeFile(file) {
      this.fileList.forEach((f, index) => {
        if (file.uid == f.uid) {
          this.fileList.splice(index, 1);
        }
      });
      let newFiles = this.fileList.map(i => i.url).join(',');
      this.$emit('update:files', newFiles);
      this.$emit('remove', { ...file });
    },
    formatFile(files) {
      this.fileList = files.split(',').map((i, index) => {
        return {
          status: 'done',
          url: i,
          uid: i.uid,
          name: i
        };
      });
    }
  },
  watch: {
    files: {
      handler(val, oldVal) {
        if (!val) return (this.fileList = []);
        if (typeof val == 'string') return this.formatFile(val);
      },
      immediate: true
    },
    pag_preview_visible(val) {
      if (!val) {
        pag.destroy();
      }
    }
  }
};
</script>
<style lang="scss">
.__img-upload__ {
}
</style>
