import axios from 'axios';

export function getAiOptimizerList(params) {
  return axios.get('ai_optimizer/list', { params });
}

export function switchStatus(params) {
  return axios.post('ai_optimizer/update', params);
}

export function getAiWorkList(params) {
  return axios.get('ai_optimizer/works/list', { params });
}

export function createWork(params) {
  return axios.post('ai_optimizer/works/create', params);
}

export function stopWork(params) {
  return axios.post('ai_optimizer/works/close', params);
}

export function getOperationLogList(params, loadingScope) {
  return axios.get('ai_optimizer/operation_log', { params, loadingScope });
}

export function getChatLogList(params) {
  return axios.get('ai_optimizer/chat_log', { params });
}

export function sendChat(params, loadingScope) {
  return axios.post('ai_optimizer/startChat', params, { loadingScope });
}
