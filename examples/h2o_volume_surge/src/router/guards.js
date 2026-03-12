export function setupRouterGuards(router) {
  const storageKeyPrefix = 'PERSIST_QUERY_';
  const ignoredKeys = ['token'];
  router.beforeEach((to, from, next) => {
    const routeName = to.name;
    if (!routeName) return next();
    const storageKey = storageKeyPrefix + routeName;
    const filteredToQuery = Object.keys(to.query || {}).reduce((acc, key) => {
      if (!ignoredKeys.includes(key)) {
        acc[key] = to.query[key];
      }
      return acc;
    }, {});
    let stored = {};
    try {
      const value = sessionStorage.getItem(storageKey);
      stored = value ? JSON.parse(value) : {};
    } catch {
      stored = {};
    }
    if (!Object.keys(filteredToQuery).length && Object.keys(stored).length) {
      return next({
        ...to,
        query: { ...to.query, ...stored },
        replace: true
      });
    }
    if (Object.keys(filteredToQuery).length) {
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(filteredToQuery));
      } catch {}
    }
    next();
  });
}

