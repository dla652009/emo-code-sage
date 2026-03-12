<template>
  <a-config-provider :locale="zhCN">
    <div v-if="appInitialized">
      <router-view></router-view>
    </div>
    <AppLoading :done="appInitialized" v-else />
  </a-config-provider>
</template>
<script>
import { setLoginStatus } from '@/utils/gatekeeper_tools';
import { loadJS } from '@/utils/index.js';
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
dayjs.locale('zh-cn');
export default {
  data() {
    return {
      zhCN,
      appInitialized: false
    };
  },
  async created() {
    // 等待所有初始化数据加载完成
    await new Promise(resolve => {
      setLoginStatus(async menu => {
        this.$store.commit('setMenu', menu);
        await Promise.all([this.$store.dispatch('fetchSelectOption'), this.$store.dispatch('fetchTagLevelList')]);
        this.appInitialized = true;
        resolve();
      });
    });
  },
  mounted() {
    this.initPAGLib();
  },
  methods: {
    initPAGLib() {
      if (!window.libpag) {
        loadJS('https://dystatich5.dailyyoga.com/h5/h5_static_files/libpag.min.js', async () => {
          window.$PAG = await window.libpag.PAGInit();
        });
      }
    }
  }
};
</script>
<style></style>
