/**
 * Loading管理器
 * 支持全局loading和局部loading两种模式
 */
class LoadingManager {
  constructor(store) {
    this.store = store;
    this.pendingRequests = new Set(); // 全局请求集合
    this.loadingTimer = null; // 防抖定时器
    this.scopedRequests = new Map(); // 局部作用域请求: Map<scope, Set<requestId>>
  }

  /**
   * 添加请求到管理器
   * @param {number} requestId - 请求的唯一标识
   * @param {string} scope - 作用域标识（可选，用于局部loading）
   */
  addRequest(requestId, scope = null) {
    if (scope) {
      // 局部loading：添加到指定作用域
      if (!this.scopedRequests.has(scope)) {
        this.scopedRequests.set(scope, new Set());
      }
      this.scopedRequests.get(scope).add(requestId);
    } else {
      // 全局loading：添加到全局集合
      this.pendingRequests.add(requestId);
      this.updateLoadingState();
    }
  }

  /**
   * 从管理器中移除请求
   * @param {number} requestId - 请求的唯一标识
   * @param {string} scope - 作用域标识（可选）
   */
  removeRequest(requestId, scope = null) {
    if (scope) {
      // 从局部作用域移除
      const scopeSet = this.scopedRequests.get(scope);
      if (scopeSet) {
        scopeSet.delete(requestId);
        if (scopeSet.size === 0) {
          this.scopedRequests.delete(scope);
        }
      }
    } else {
      // 从全局集合移除
      this.pendingRequests.delete(requestId);
      this.updateLoadingState();
    }
  }

  /**
   * 更新全局loading状态（带防抖）
   */
  updateLoadingState() {
    clearTimeout(this.loadingTimer);

    if (this.pendingRequests.size > 0) {
      this.setLoading(true);
    } else {
      this.loadingTimer = setTimeout(() => {
        this.setLoading(false);
      }, 100);
    }
  }

  /**
   * 设置全局loading状态
   * @param {boolean} show - 是否显示loading
   */
  setLoading(show) {
    if (this.store.state.showPageLoading !== show) {
      this.store.commit('setPageLoading', show);
    }
  }

  /**
   * 检查指定作用域是否有pending请求
   * @param {string} scope - 作用域标识
   * @returns {boolean}
   */
  isScopeLoading(scope) {
    const scopeSet = this.scopedRequests.get(scope);
    return scopeSet ? scopeSet.size > 0 : false;
  }

  /**
   * 获取指定作用域的pending请求数量
   * @param {string} scope - 作用域标识
   * @returns {number}
   */
  getScopePendingCount(scope) {
    const scopeSet = this.scopedRequests.get(scope);
    return scopeSet ? scopeSet.size : 0;
  }

  /**
   * 清空所有请求并隐藏loading
   * @param {string} scope - 可选，指定清空某个作用域
   */
  clear(scope = null) {
    if (scope) {
      // 清空指定作用域
      this.scopedRequests.delete(scope);
    } else {
      // 清空全局
      this.pendingRequests.clear();
      this.scopedRequests.clear();
      clearTimeout(this.loadingTimer);
      this.setLoading(false);
    }
  }

  /**
   * 获取全局pending请求数量
   * @returns {number}
   */
  getPendingCount() {
    return this.pendingRequests.size;
  }

  /**
   * 获取所有作用域的状态
   * @returns {Object} 作用域状态映射
   */
  getAllScopesStatus() {
    const status = {};
    this.scopedRequests.forEach((requests, scope) => {
      status[scope] = {
        loading: requests.size > 0,
        count: requests.size
      };
    });
    return status;
  }
}

export default LoadingManager;
