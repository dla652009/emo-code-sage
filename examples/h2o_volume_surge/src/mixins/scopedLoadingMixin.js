import { getLoadingManager } from '@/api';

/**
 * 通用的 Scoped Loading Mixin
 *
 * @example
 * export default {
 *   mixins: [scopedLoadingMixin],
 *
 *   methods: {
 *     async loadUsers() {
 *       // 直接使用 key，会自动作为 scope
 *       const res = await axios.get('/api/users', this.$withScope('user'));
 *       this.users = res.data;
 *     },
 *
 *     async loadOrders() {
 *       // 或者使用 $loadWithScope
 *       await this.$loadWithScope('order', async () => {
 *         const res = await axios.get('/api/orders');
 *         this.orders = res.data;
 *       });
 *     }
 *   },
 *
 *   template: `
 *     <div>
 *       <a-spin :spinning="$isLoading('user')">
 *         <UserList />
 *       </a-spin>
 *       <a-spin :spinning="$isLoading('order')">
 *         <OrderList />
 *       </a-spin>
 *     </div>
 *   `
 * }
 */
export const scopedLoadingMixin = {
  data() {
    return {
      _scopeLoadingStates: {},
      _scopeCheckTimers: {}
    };
  },

  beforeUnmount() {
    // 清理所有定时器和 scope
    Object.keys(this._scopeCheckTimers).forEach(key => {
      clearInterval(this._scopeCheckTimers[key]);
    });

    const loadingManager = getLoadingManager();
    if (loadingManager) {
      // 清理所有已注册的 scope
      Object.keys(this._scopeLoadingStates).forEach(scope => {
        loadingManager.clear(scope);
      });
    }
  },

  methods: {
    /**
     * 开始检查某个 scope 的 loading 状态
     * @private
     */
    _startScopeCheck(scope) {
      // 避免重复启动定时器
      if (this._scopeCheckTimers[scope]) {
        return;
      }

      const loadingManager = getLoadingManager();
      this._scopeCheckTimers[scope] = setInterval(() => {
        if (loadingManager) {
          this._scopeLoadingStates[scope] = loadingManager.isScopeLoading(scope);
        }
      }, 50);
    },

    /**
     * 检查某个 scope 是否正在 loading
     * @param {string} scope - scope 名称
     * @returns {boolean}
     */
    $isLoading(scope) {
      // 首次访问时自动启动检查
      if (!this._scopeCheckTimers[scope]) {
        this._scopeLoadingStates[scope] = false;
        this._startScopeCheck(scope);
      }
      return this._scopeLoadingStates[scope] || false;
    },

    /**
     * 使用指定 scope 执行异步函数
     * @param {string} scope - scope 名称
     * @param {Function} asyncFn - 异步函数
     * @returns {Promise}
     */
    async $loadWithScope(scope, asyncFn) {
      // 首次使用时自动启动检查
      if (!this._scopeCheckTimers[scope]) {
        this._scopeLoadingStates[scope] = false;
        this._startScopeCheck(scope);
      }

      this._scopeLoadingStates[scope] = true;
      try {
        return await asyncFn();
      } finally {
        setTimeout(() => {
          const loadingManager = getLoadingManager();
          if (loadingManager) {
            this._scopeLoadingStates[scope] = loadingManager.isScopeLoading(scope);
          }
        }, 100);
      }
    },

    /**
     * 获取用于 axios 请求的配置对象
     * @param {string} scope - scope 名称（直接作为 loadingScope 使用）
     * @param {Object} config - 额外的 axios 配置
     * @returns {Object}
     */
    $withScope(scope, config = {}) {
      // 首次使用时自动启动检查
      if (!this._scopeCheckTimers[scope]) {
        this._scopeLoadingStates[scope] = false;
        this._startScopeCheck(scope);
      }

      return {
        ...config,
        loadingScope: scope
      };
    }
  }
};
