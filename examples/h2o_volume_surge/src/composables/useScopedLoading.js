import { ref, onUnmounted } from 'vue';
import { getLoadingManager } from '@/api';

/**
 * 局部Loading Composable
 * 用于在组件中管理模块级别的loading状态
 *
 * @param {string} scope - 作用域标识，同一个scope共享loading状态
 * @returns {Object} loading状态和工具方法
 *
 * @example
 * // 在组件中使用
 * const { loading, execute } = useScopedLoading('user-module');
 *
 * // 方式1: 使用execute包装异步函数
 * const fetchData = async () => {
 *   await execute(async () => {
 *     const res = await axios.get('/api/users');
 *     users.value = res.data;
 *   });
 * };
 *
 * // 方式2: 直接在axios请求中使用loadingScope
 * const fetchData = async () => {
 *   const res = await axios.get('/api/users', { loadingScope: 'user-module' });
 * };
 *
 * // 在模板中使用
 * <a-spin :spinning="loading">
 *   <UserList />
 * </a-spin>
 */
export function useScopedLoading(scope) {
  const loading = ref(false);
  const loadingManager = getLoadingManager();
  let checkTimer = null;

  // 定期检查loading状态
  const startChecking = () => {
    if (!checkTimer) {
      checkTimer = setInterval(() => {
        if (loadingManager) {
          loading.value = loadingManager.isScopeLoading(scope);
        }
      }, 50); // 50ms检查一次
    }
  };

  // 停止检查
  const stopChecking = () => {
    if (checkTimer) {
      clearInterval(checkTimer);
      checkTimer = null;
    }
  };

  // 开始检查
  startChecking();

  // 组件卸载时清理
  onUnmounted(() => {
    stopChecking();
    if (loadingManager) {
      loadingManager.clear(scope);
    }
  });

  /**
   * 执行异步函数并自动管理loading
   * @param {Function} asyncFn - 异步函数
   * @returns {Promise}
   */
  const execute = async asyncFn => {
    loading.value = true;
    try {
      return await asyncFn();
    } finally {
      // 延迟一点隐藏，等待可能的其他请求
      setTimeout(() => {
        if (loadingManager) {
          loading.value = loadingManager.isScopeLoading(scope);
        }
      }, 100);
    }
  };

  /**
   * 手动设置loading状态
   * @param {boolean} value - loading状态
   */
  const setLoading = value => {
    loading.value = value;
  };

  /**
   * 清空当前scope的所有请求
   */
  const clear = () => {
    if (loadingManager) {
      loadingManager.clear(scope);
      loading.value = false;
    }
  };

  return {
    loading,
    execute,
    setLoading,
    clear
  };
}

/**
 * 创建一个带scope的axios配置对象
 * @param {string} scope - 作用域标识
 * @param {Object} config - axios配置
 * @returns {Object} 合并后的配置
 *
 * @example
 * const config = withScope('user-module', { params: { page: 1 } });
 * const res = await axios.get('/api/users', config);
 */
export function withScope(scope, config = {}) {
  return {
    ...config,
    loadingScope: scope
  };
}
