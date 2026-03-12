import axios from 'axios';
import qs from 'querystring';
import { message } from 'ant-design-vue';
import { localGet, logOutFunc } from '@/utils/gatekeeper_tools';
import LoadingManager from './loading-manager';

const API_MAP = {
  test: 'https://autoadsadminapiqa.dancefit.me/admin/',
  mirror: 'https://autoadsadminapi.dancefit.me/admin/',
  online: 'https://autoadsadminapi.dancefit.me/admin/'
};

const ENV = import.meta.env.VITE_ENV || 'test';

let loadingManager = null;
let requestIdCounter = 0;

export function setAxiosOption(store) {
  // 初始化loading管理器
  loadingManager = new LoadingManager(store);

  axios.defaults.baseURL = API_MAP[ENV];
  axios.defaults.headers = { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' };

  axios.interceptors.request.use(
    config => {
      // 拦截请求验证
      config.headers.Authorization = localGet('token') ?? '';

      const operatorName = localGet('OperatorName');
      const { method } = config;

      // 添加operate_name参数
      if (method === 'get') {
        Object.assign(config.params || {}, {
          operate_name: operatorName
        });
      } else if (method === 'post') {
        Object.assign(config.data || {}, {
          operate_name: operatorName
        });
      }

      // 处理multipart/form-data，跳过loading
      if (config.headers['Content-Type'] === 'multipart/form-data') {
        config._skipLoading = true;
        return config;
      }

      // 支持自定义配置跳过loading: axios.get(url, { skipLoading: true })
      if (config.skipLoading) {
        config._skipLoading = true;
        return config;
      }

      // 为每个请求生成唯一ID
      config._requestId = ++requestIdCounter;

      // 支持局部loading: axios.get(url, { loadingScope: 'module-name' })
      if (config.loadingScope) {
        config._loadingScope = config.loadingScope;
        loadingManager.addRequest(config._requestId, config.loadingScope);
      } else {
        // 默认全局loading
        loadingManager.addRequest(config._requestId);
      }

      // 序列化POST数据
      if (method !== 'get' && config.headers['Content-Type'] !== 'multipart/form-data') {
        config.data = qs.stringify(config.data);
      }

      return config;
    },
    err => {
      return Promise.reject(err);
    }
  );

  axios.interceptors.response.use(
    response => {
      // 移除请求loading
      if (response.config._requestId && !response.config._skipLoading) {
        const scope = response.config._loadingScope || null;
        loadingManager.removeRequest(response.config._requestId, scope);
      }
      return response;
    },
    err => {
      // 确保loading被移除
      if (err.config?._requestId && !err.config._skipLoading) {
        const scope = err.config._loadingScope || null;
        loadingManager.removeRequest(err.config._requestId, scope);
      }

      // 处理错误响应
      if (err.response) {
        const { status } = err.response;

        if (status === 401) {
          // token过期，清除所有loading并登出
          loadingManager.clear();
          logOutFunc('token过期，请退出重新登录!');
          return Promise.reject(err);
        } else if (status === 403) {
          message.error('暂无操作权限！请联系管理员...');
          return Promise.reject(err);
        }
      }

      return Promise.reject(err);
    }
  );
}

/**
 * 获取loading管理器实例
 * @returns {LoadingManager|null}
 */
export function getLoadingManager() {
  return loadingManager;
}

export function getEnv() {
  return ENV;
}

export function getLocation() {
  return API_MAP[ENV];
}

export function getAllPermission(params) {
  return axios.get('module', { params });
}
