import axios from 'axios';

export function getSelect(params) {
  return axios.get('common/select', { params, skipLoading: true });
}

export function getTagLevelList(params) {
  return axios.get('tag_level/list', { params });
}
