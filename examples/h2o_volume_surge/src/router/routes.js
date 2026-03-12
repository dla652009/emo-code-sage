import Home from '@/pages/Home/index.vue';

// http://115.29.202.161:28436/api/admin_module  测试环境，查询当前最新的菜单key对照表

// https://admin.musclemonster.fit/api/admin_module 线上环境

/*
  左侧可点击菜单必须和permission中的key相同，其他和菜单不相关的路由无限制；
  meta: {extra: true}  代表非菜单路由页面；
*/

export const menuModules = [
  {
    secondName: '标签管理',
    permission: 'tag_module',
    children: [
      {
        path: 'level',
        name: 'TagLevel',
        menuName: '标签层级管理',
        permission: 'tag_module',
        meta: { keepAlive: true },
        component: () => import(`../pages/modules/tags/level.vue`)
      },
      {
        path: 'tags',
        name: 'TagList',
        menuName: '标签管理',
        permission: 'tag_module',
        meta: { keepAlive: true },
        component: () => import(`../pages/modules/tags/index.vue`)
      }
    ]
  },
  {
    secondName: '素材管理',
    permission: 'creative_module',
    children: [
      {
        path: 'creativeConfig',
        name: 'CreativeList',
        menuName: '素材管理',
        permission: 'creative_module',
        meta: { keepAlive: true },
        component: () => import(`../pages/modules/creative/index.vue`)
      }
    ]
  },
  {
    secondName: '广告任务管理',
    permission: 'task_module',
    children: [
      {
        path: 'task',
        name: 'TaskList',
        menuName: '任务管理',
        permission: 'task_module',
        meta: { keepAlive: true },
        component: () => import(`../pages/modules/Task/index.vue`)
      }
    ]
  },
  {
    secondName: '成片视频管理',
    permission: 'task_log_module',
    children: [
      {
        path: 'video',
        name: 'VideoList',
        menuName: '成片视频管理',
        permission: 'task_log_module',
        meta: { keepAlive: true },
        component: () => import(`../pages/modules/Video/index.vue`)
      }
    ]
  },
  {
    secondName: 'AI优化师',
    permission: 'task_log_module',
    children: [
      {
        path: 'optimizer',
        name: 'OptimizerList',
        menuName: 'AI优化师管理',
        permission: 'task_log_module',
        meta: { keepAlive: true },
        component: () => import(`../pages/modules/AIOptimizer/manager.vue`)
      },
      {
        path: 'work',
        name: 'OptimizerWork',
        menuName: 'AI优化工作管理',
        permission: 'task_log_module',
        meta: { keepAlive: true },
        component: () => import(`../pages/modules/AIOptimizer/work.vue`)
      },
    ]
  },
];

const homeChildren = menuModules
  .reduce((acc, module) => {
    return acc.concat(module.children);
  }, [])
  .concat([
    {
      path: 'creativeEdit/:id',
      name: '编辑素材',
      meta: { extra: true },
      component: () => import(`../pages/modules/creative/form.vue`)
    },
    {
      path: 'upload',
      name: '素材上传',
      meta: { extra: true },
      component: () => import(`../pages/modules/creative/upload.vue`)
    },
    {
      path: 'taskEdit/:id/:type',
      name: '编辑任务',
      meta: { extra: true },
      component: () => import(`../pages/modules/Task/form.vue`)
    },
    {
      path: 'taskCopy/:id/:type',
      name: '复制任务',
      meta: { extra: true, key: 'taskCopy' },
      component: () => import(`../pages/modules/Task/form.vue`)
    },
    {
      path: 'taskCreate/:type',
      name: '创建任务',
      meta: { extra: true },
      component: () => import(`../pages/modules/Task/form.vue`)
    },
    {
      path: 'taskView/:id/:type',
      name: '查看任务',
      meta: { extra: true },
      component: () => import(`../pages/modules/Task/form.vue`)
    },
    {
      path: 'workRecord',
      name: '工作记录',
      meta: { extra: true },
      component: () => import(`../pages/modules/AIOptimizer/records.vue`)
    }
  ]);

const routes = [
  {
    path: '/home',
    name: 'Home',
    component: Home,
    children: homeChildren
  },
  {
    path: '/firework',
    name: 'firework',
    component: () => import('@/pages/Firework/index.vue')
  }
  /* {                                                         
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/pages/NotFound/index.vue')
  } */
];

export default routes;
