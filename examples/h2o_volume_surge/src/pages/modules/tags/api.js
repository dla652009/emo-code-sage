import axios from 'axios';

export function getTagsList(params) {
  return axios.get('tag/list', { params });
}

// 标签层级列表
export function getTagLevelList(params) {
  return axios.get('tag_level/list', { params });
}

// 新增标签
export function createTag(params) {
  return axios.post('tag/create', params);
}

// 增加标签层级
export function createTagLevel(params) {
  return axios.post('tag_level/create', params);
}

// 修改标签
export function updateTag(params) {
  return axios.post('tag/update', params);
}

// 修改标签状态
export function updateStatus(params) {
  return axios.post('tag/updateStatus', params);
}

// 删除标签
export function deleteTag(params) {
  return axios.post('tag/delete', params);
}
