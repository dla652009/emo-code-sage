export function beforeRouterAction(router, store) {
  router.beforeEach((to, from, next) => {
    if (to.path == '/') return next('/home');
    return next();
  });
}
