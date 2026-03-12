import { createApp } from 'vue';
import App from './App.vue';
import { createRouter, createWebHashHistory } from 'vue-router';
import { createStore } from 'vuex';
import routes from './router/routes.js';
// import { beforeRouterAction } from './router'
import { setupRouterGuards } from './router/guards.js';
import Store from './store/index.js';
import { setAxiosOption } from '@/api';
import 'ant-design-vue/dist/reset.css';

import { message, Modal } from 'ant-design-vue';
// import 'ant-design-vue/es/message/style/css';
// import 'ant-design-vue/es/modal/style/css';
import 'virtual:windi.css';
import './css/index.css';
import './scss/index.scss';

const router = createRouter({
  history: createWebHashHistory(),
  routes
});
setupRouterGuards(router);

const store = createStore(Store);

setAxiosOption(store);

// beforeRouterAction(router,store);

const app = createApp(App);
app.config.globalProperties.$message = message;
app.config.globalProperties.$confirm = Modal.confirm;

app.use(router).use(store).mount('#app');
