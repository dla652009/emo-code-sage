import * as Common from '@/api/common.js';
import createPersistedState from 'vuex-persistedstate';
const store = {
  state() {
    return {
      menu: null,
      showPageLoading: false,
      creative_author: [], // 素材师
      creative_type: [], //素材库
      content_type: [], // 标签体系
      fb_bm_id: [], //FB投放广告主ID
      gender: [], //投放性别
      lang: [], //投放语言
      project: [], //所属项目
      task_creator: [], // 任务&成片视频 创建人
      creative_creator: [], // 素材创建人
      music_creative_list: [], //音乐素材列表
      tail_creative_list: [], //尾页素材列表
      filmList: [], // 成片素材/视频列表：用于创建任务
      tagLevelList: [], // 标签层级列表
      taskBaseInfo: {} // 任务基础信息
    };
  },
  getters: {
    getMenu(state) {
      return state.menu;
    },
    getAuthorOption(state) {
      return state.creative_author;
    },
    getContentTypeOption(state) {
      return state.content_type;
    },
    getCreativeTypeOption(state) {
      return state.creative_type;
    },
    getFbBmIdOption(state) {
      return state.fb_bm_id;
    },
    getGenderOption(state) {
      return state.gender;
    },
    getLangOption(state) {
      return state.lang;
    },
    getProjectOption(state) {
      return state.project;
    },
    getTaskCreatorOption(state) {
      return state.task_creator;
    },
    getCreativeCreatorOption(state) {
      return state.creative_creator;
    },
    getMusicCreativeList(state) {
      return state.music_creative_list;
    },
    getTailCreativeList(state) {
      return state.tail_creative_list;
    },
    getFilmList(state) {
      return state.filmList;
    },
    getTagLevelList(state) {
      return state.tagLevelList;
    },
    getTaskBaseInfo(state) {
      return state.taskBaseInfo;
    }
  },
  mutations: {
    setMenu(state, payload) {
      state.menu = payload;
    },
    setSelectOption(state, payload) {
      state.creative_author = payload.creative_author;
      state.creative_type = payload.creative_type;
      state.fb_bm_id = payload.fb_bm_id;
      state.gender = payload.gender;
      state.lang = payload.lang;
      state.project = payload.project;
      state.music_creative_list = payload.music_creative_list;
      state.tail_creative_list = payload.tail_creative_list;
      state.content_type = payload.content_type;
      state.task_creator = payload.task_creator;
      state.creative_creator = payload.creative_creator;
    },
    // 优化后的loading状态管理 - 使用显式设置而非toggle
    setPageLoading(state, show) {
      state.showPageLoading = show;
    },
    // 保留togglePageLoading以兼容旧代码（但建议逐步迁移到setPageLoading）
    togglePageLoading(state) {
      state.showPageLoading = !state.showPageLoading;
    },
    setFilmList(state, payload) {
      state.filmList = payload;
    },
    setTagLevelList(state, payload) {
      state.tagLevelList = payload;
    },
    setTaskBaseInfo(state, payload) {
      state.taskBaseInfo = payload;
    }
  },
  actions: {
    fetchSelectOption({ commit, state }, payload = {}) {
      return new Promise((resolve, reject) => {
        Common.getSelect({})
          .then(({ data }) => {
            if (data.error_code) return reject(new Error(data.error_desc));
            commit('setSelectOption', data.result.select_list);
            resolve(state.selectOption);
          })
          .catch(error => {
            console.error('Failed to fetch select options:', error);
            reject(error);
          });
      });
    },
    fetchTagLevelList({ commit, state }, payload = {}) {
      return new Promise((resolve, reject) => {
        Common.getTagLevelList()
          .then(({ data }) => {
            if (data.error_code) return reject(new Error(data.error_desc));
            const list = data?.result || [];
            commit('setTagLevelList', list);
            resolve(state.tagLevelList);
          })
          .catch(error => {
            console.error('Failed to fetch tag level list:', error);
            // 即使出错也标记为已加载，避免无限等待
            commit('setTagLevelList', []);
            resolve([]);
          });
      });
    }
  },
  plugins: [
    createPersistedState({
      paths: ['filmList', 'taskBaseInfo'],
      storage: window.sessionStorage
    })
  ]
};

export default store;
