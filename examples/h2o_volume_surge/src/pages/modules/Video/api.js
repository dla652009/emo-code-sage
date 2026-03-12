import axios from 'axios';

export function getVideoList(params) {
  return axios.get('task_log/list', { params });
}

export function getTagsList(params) {
  return axios.get('tag/list', { params });
}

export function getVideoInsight(params, loadingScope) {
  return axios.get('task_log/insight', { params, loadingScope });
}
