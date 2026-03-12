import axios from 'axios';

export function getTaskList(params) {
  return axios.get('task/list', { params });
}

export function getTaskDetail(params) {
  return axios.get('task/detail', { params });
}

export function createTask(params) {
  return axios.post('task/create', params);
}

export function deleteTask(params) {
  return axios.post('task/delete', params);
}

export function updateTask(params) {
  return axios.post('task/update', params);
}

export function runTask(params) {
  return axios.post('task/run', params);
}

export function getCommonConfig(params) {
  return axios.get('common/projectConfig', { params, skipLoading: true });
}

export function getTagsList(params) {
  return axios.get('tag/list', { params });
}

export function getCreativeList(params, loadingScope) {
  return axios.get('creative/list', { params, loadingScope });
}

export function getVideoList(params, loadingScope) {
  return axios.get('task_log/list', { params, loadingScope });
}

// 任务预校验
export function taskPreCheck(params, loadingScope) {
  return axios.post('task/preview', params, { loadingScope });
}

// 账号campaign列表
export function getAccountCampaignList(params) {
  return axios.get('common/projectCampaignList', { params, loadingScope: 'account-campaign' });
}

export function refreshTaskProgress(params) {
  return axios.get('task/refreshProgress', { params, skipLoading: true });
}

// 获取生效的广告组信息
export function getAdsetList(params) {
  return axios.get('common/projectCampaignAdsetList', { params, loadingScope: 'account-adset' });
}
