import axios from 'axios';

export function getCreativeList(params) {
  return axios.get('creative/list', { params });
}

export function createCreative(params) {
  return axios.post('creative/create', params);
}

export function deleteCreative(params) {
  return axios.post('creative/delete', params);
}

export function getUpdateWeightLog(params) {
  return axios.get('creative/getUpdateWeightLog', { params });
}

export function updateCreativeWeight(params) {
  return axios.post('creative/updateWeight', params);
}

export function updateCreative(params) {
  return axios.post('creative/update', params);
}

export function getCreative(params) {
  return axios.get('creative/detail', { params });
}

export function getTagsList(params) {
  return axios.get('tag/list', { params });
}

export function updateStatus(params) {
  return axios.post('creative/updateStatus', params);
}

export function multiCreateTags(params) {
  return axios.post('tag/multiCreate', params);
}
