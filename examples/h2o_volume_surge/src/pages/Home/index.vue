<template>
  <a-layout v-if="menu.length">
    <a-layout-header :style="{ padding: 0 }">
      <div class="flex items-center">
        <div style="width: 208px" class="flex justify-center">
          <img width="118" src="@/assets/logo.png" />
        </div>
        <div class="flex-grow">
          <a-menu theme="dark" mode="horizontal" :selected-keys="[+activeNav]" :style="{ lineHeight: '64px' }">
            <a-menu-item v-for="(item, index) in menu" :key="index" @click="handleNavClick(item, index)">
              {{ item.cate_name }}
            </a-menu-item>
          </a-menu>
        </div>
        <div class="flex-none relative" style="width: 200px" v-if="showCat">
          <div class="cat">
            <div class="body"></div>
            <div class="head">
              <div class="ear"></div>
              <div class="ear"></div>
            </div>
            <div class="face">
              <div class="nose"></div>
              <div class="whisker-container">
                <div class="whisker"></div>
                <div class="whisker"></div>
              </div>
              <div class="whisker-container">
                <div class="whisker"></div>
                <div class="whisker"></div>
              </div>
            </div>
            <div class="tail-container">
              <div class="tail">
                <div class="tail">
                  <div class="tail">
                    <div class="tail">
                      <div class="tail">
                        <div class="tail">
                          <div class="tail"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="env == 'test'" class="flex-none relative">
          <img src="@/assets/env1.png" style="width: 64px; height: 64px" />
        </div>
        <div style="width: 150px" class="text-center">
          <a-dropdown class="user-area cursor-pointer">
            <div>
              <a-avatar :size="32" src="https://xsgames.co/randomusers/avatar.php?g=pixel" />
              <span class="px-2 text-white">{{ user_name }}</span>
            </div>
            <template #overlay>
              <a-menu>
                <a-menu-item @click="handleLogout">
                  <logout-outlined />
                  退出登录
                </a-menu-item>
                <a-menu-item @click="handleCat">
                  <div class="flex items-center">
                    <key-outlined />
                    <span class="ml-1">{{ showCat ? '收起大佬' : '打开大佬' }}</span>
                  </div>
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </div>
    </a-layout-header>
    <a-layout>
      <a-layout-sider class="bg-white" width="208" v-if="!$route.meta.hideSideMenu">
        <a-menu
          class="h-full"
          mode="inline"
          :collapsed="collapsed"
          v-model:openKeys="openKeys"
          :selected-keys="[activeMenu]"
          style="borderright: 0"
        >
          <a-sub-menu v-for="(item, outerIndex) in leftMenu" :key="outerIndex" @titleClick="handleTitleClick">
            <template #title>{{ item.cate_name }}</template>
            <a-menu-item
              style="height: 48px; padding-top: 2px"
              v-for="(it, innerIndex) in item.sub_cate_list"
              :key="it.route_name || it.cate_name"
              :title="it.cate_name"
              @click="handleMenuClick(it)"
            >
              <span class="ant-menu-item-multiline">{{ it.cate_name.split('=>')[1] }}</span>
            </a-menu-item>
          </a-sub-menu>
        </a-menu>
      </a-layout-sider>
      <a-layout class="relative" style="padding: 0 16px; height: calc(100vh - 70px)">
        <div class="flex" v-if="menu">
          <a-breadcrumb class="flex-1" style="margin: 10px 0; color: #bfbfbf">
            <a-breadcrumb-item>{{ this.menu[+activeNav].cate_name }}</a-breadcrumb-item>
            <a-breadcrumb-item>{{ getSecondMenu() }}</a-breadcrumb-item>
            <a-breadcrumb-item>
              <a :style="getStyle()" @click="goBack(activeMenu)">{{ getActiveThirdMenuName() }}</a>
            </a-breadcrumb-item>
            <a-breadcrumb-item v-if="$route.meta && $route.meta.extra">{{ $route.name }}</a-breadcrumb-item>
          </a-breadcrumb>
        </div>
        <a-layout-content class="overflow-auto bg-#f5f5f5" id="main-content">
          <router-view v-slot="{ Component }">
            <component v-if="!$route.meta.keepAlive" :is="Component" :key="$route.name" />
            <keep-alive>
              <component :is="Component" :key="$route.name" v-if="$route.meta.keepAlive" />
            </keep-alive>
          </router-view>
        </a-layout-content>
        <a-layout-footer class="text-center !p-0">
          Copyright © 2023-至今 西安瑜乐文化科技股份有限公司
        </a-layout-footer>
        <div
          v-if="showPageLoading"
          class="absolute top-0 right-0 bottom-0 left-0 flex justify-center items-center"
          style="z-index: 9999"
        >
          <!-- <a-spin size="large" spinning /> -->
          <div class="loader">
            <img src="https://dailyyogaappimage.dailyyoga.com/62/7d/627da6e366eccb84ce53bcb8d9dda0e4.gif" />
          </div>
        </div>
      </a-layout>
    </a-layout>
  </a-layout>
</template>
<script>
import Bus from '@/Bus';
import { getEnv } from '@/api';
import { LogoutOutlined, KeyOutlined } from '@ant-design/icons-vue';
import { localGet, logOutFunc } from '@/utils/gatekeeper_tools';

// 为了解决不同二级菜单下出现相同的三级菜单名称导致路由错误，此处对三级菜单名称做处理
function setMenuName(menu, parent) {
  menu.map(i => {
    if (i.sub_cate_list) {
      setMenuName(i.sub_cate_list, i.cate_name);
    } else if (parent) {
      const baseName = String(i.cate_name).split('=>').pop();
      i.cate_name = `${parent}=>${baseName}`;
    }
  });
}
export default {
  data() {
    return {
      collapsed: true,
      activeNav: '',
      activeMenu: '',
      openKeys: [],
      user_name: localGet('OperatorName'),
      env: getEnv(),
      showCat: !!+localStorage.getItem('showCat')
    };
  },
  components: {
    LogoutOutlined,
    KeyOutlined
  },
  /*mounted() {
    Bus.on('changeMenu', menu => {
      this.handleMenuClick({cate_name: menu}, false, '_blank');
    })
  },
  beforeUnmount() {
    Bus.off('changeMenu');
  },*/
  computed: {
    menu() {
      let menu = this.$store.getters.getMenu;
      if (!menu) return [];
      setMenuName(menu);
      return menu;
    },
    leftMenu() {
      if (!this.menu) return [];
      return this.menu[this.activeNav]?.sub_cate_list || [];
    },
    showPageLoading() {
      // return true
      return this.$store.state.showPageLoading;
    }
  },
  methods: {
    getActiveThirdMenuName() {
      const item = this.findMenuItemByKey(this.activeMenu);
      if (!item || !item.cate_name) {
        return this.activeMenu && typeof this.activeMenu === 'string'
          ? this.activeMenu
          : '';
      }
      const parts = String(item.cate_name).split('=>');
      return parts[parts.length - 1];
    },
    findMenuItemByKey(key) {
      let result = null;
      this.menu.map(first => {
        if (result) return;
        (first.sub_cate_list || []).map(second => {
          if (result) return;
          (second.sub_cate_list || []).map(third => {
            if (result) return;
            if (third.route_name === key || third.cate_name === key) {
              result = third;
            }
          });
        });
      });
      return result;
    },
    handleCat() {
      this.showCat = !this.showCat;
      localStorage.setItem('showCat', this.showCat ? 1 : 0);
    },
    getStyle() {
      if (this.$route.meta && this.$route.meta.extra) {
        return {
          color: '#BFBFBF'
        };
      } else {
        return {};
      }
    },
    init() {
      // 获取激活的子菜单下标
      let activeNav = sessionStorage.getItem('M_activeNav');
      // 获取激活的菜单
      let activeMenu = sessionStorage.getItem('M_activeMenu') || this.$route.name; // 优先取缓存菜单项，防止刷新后错乱
      // 获取打开的菜单项
      let openKeys = JSON.parse(sessionStorage.getItem('M_openKeys'));
      let extraRouter = this.$route.meta && this.$route.meta.extra;

      // 如果没有激活的导航，则不考虑激活的菜单
      if (activeNav === null || !this.menu[activeNav]) {
        this.handleNavClick(this.menu[0], 0);
      } else {
        this.activeNav = activeNav;
        if (!activeMenu || activeMenu == 'Home') {
          this.handleMenuClick(this.leftMenu[0].sub_cate_list[0], extraRouter);
        } else {
          const item = this.findMenuItemByKey(activeMenu);
          if (item) {
            this.handleMenuClick(item, extraRouter);
          }
        }
      }

      // 如果没有展开的菜单，则默认展开第一个菜单
      if (!openKeys) return (this.openKeys = [0]);
      this.openKeys = JSON.parse(sessionStorage.getItem('M_openKeys'));
    },
    getSecondMenu() {
      // 获取二级菜单名称
      let menu = '';
      this.leftMenu.map(i => {
        if (i.sub_cate_list.some(i => i.route_name === this.activeMenu || i.cate_name === this.activeMenu)) {
          menu = i.cate_name;
        }
      });

      return menu;
    },
    handleNavClick(item, index) {
      this.activeNav = index;
      sessionStorage.setItem('M_activeNav', index);
      this.handleMenuClick(this.leftMenu[0].sub_cate_list[0]);
    },
    async handleMenuClick(item, extraRouter, target) {
      if (!item) return;
      this.activeMenu = item.route_name || item.cate_name;
      if (!extraRouter) sessionStorage.setItem('M_activeMenu', this.activeMenu); // 非菜单路由，不要需要缓存
      if (extraRouter) return this.$router.push({ name: this.$route.name });
      if (this.$route.name === item.route_name && !target) {
        return;
      }
      if (target == '_blank') {
        let routeUrl = this.$router.resolve({ name: item.route_name });
        window.open(routeUrl.href, target);
      } else {
        try {
          let navigationResult = await this.$router.push({ name: item.route_name });
          if (navigationResult) {
            // 导航被阻止
            // console.log('导航被阻止了');
          } else {
          }
        } catch (e) {
          sessionStorage.removeItem('M_activeMenu');
          sessionStorage.removeItem('M_activeNav');
        }
      }
    },
    handleTitleClick() {
      this.$nextTick(() => {
        sessionStorage.setItem('M_openKeys', JSON.stringify(this.openKeys));
      });
    },
    changeBreadcrumb(index, item) {
      this.breadcrumb[index] = item;
    },
    handleLogout() {
      logOutFunc();
    },
    goBack(activeMenu) {
      const item = this.findMenuItemByKey(activeMenu);
      if (!item) return;
      this.$router.push({ name: item.route_name });
    }
  },
  watch: {
    menu: {
      handler(val) {
        if (val.length) {
          this.init();
        }
      },
      immediate: true
    },
    $route(val) {
      if (!val?.meta?.extra) {
        let target = null;
        let navIndex = null;
        this.menu.map((first, index) => {
          if (navIndex !== null) return;
          (first.sub_cate_list || []).map(second => {
            if (navIndex !== null) return;
            (second.sub_cate_list || []).map(third => {
              if (navIndex !== null) return;
              if (third.route_name === val.name) {
                target = third;
                navIndex = index;
              }
            });
          });
        });
        if (target && navIndex !== null) {
          this.activeNav = navIndex;
          localStorage.setItem('M_activeNav', navIndex);
          this.handleMenuClick(target);
        }
      }
    }
  }
};
</script>

<style lang="scss">
.user-area {
  &:hover {
    background: #595959;
  }
}

.ant-layout-sider {
  height: calc(100vh - 64px);
  overflow-x: hidden;
  background: #000;
}

.ant-layout-footer {
  padding: 5px !important;
}

.ant-menu-item-multiline {
  line-height: initial;
  overflow: visible;
  text-overflow: initial;
  display: inline-block;
  white-space: initial;
}

.ant-menu-item {
  word-break: break-all;
}

@keyframes tail {
  6.66667% {
    transform: rotate(0);
  }

  10% {
    transform: rotate(10deg);
  }

  16.6667% {
    transform: rotate(-5deg);
  }

  20% {
    transform: rotate(30deg);
  }

  26.6667% {
    transform: rotate(-2deg);
  }

  46.6667% {
    transform: rotate(10deg);
  }

  53.3333% {
    transform: rotate(-5deg);
  }

  56.6667% {
    transform: rotate(10deg);
  }
}

@keyframes left-ear {
  0% {
    transform: rotate(-20deg);
  }

  6.66667% {
    transform: rotate(-6deg);
  }

  13.3333% {
    transform: rotate(-15deg);
  }

  26.6667% {
    transform: rotate(-15deg);
  }

  33.3333% {
    transform: rotate(-30deg);
  }

  40% {
    transform: rotate(-30deg);
  }

  46.6667% {
    transform: rotate(0deg);
  }

  53.3333% {
    transform: rotate(0deg);
  }

  60% {
    transform: rotate(-15deg);
  }

  80% {
    transform: rotate(-15deg);
  }

  93.3333% {
    transform: rotate(-6deg);
  }

  100% {
    transform: rotateZ(-6deg);
  }
}

@keyframes right-ear {
  0% {
    transform: rotateZ(-16deg);
  }

  6.66667% {
    transform: rotateZ(-16deg);
  }

  13.3333% {
    transform: rotateZ(-19deg);
  }

  26.6667% {
    transform: rotateZ(-19deg);
  }

  33.3333% {
    transform: rotateZ(-30deg);
  }

  36.6667% {
    transform: rotateZ(-19deg);
  }

  37.3333% {
    transform: rotateZ(-30deg);
  }

  38% {
    transform: rotateZ(-19deg);
  }

  40% {
    transform: rotateZ(-19deg);
  }

  40.6667% {
    transform: rotateZ(-30deg);
  }

  41.3333% {
    transform: rotateZ(-19deg);
  }

  46.6667% {
    transform: rotateZ(-9deg);
  }

  53.3333% {
    transform: rotateZ(-9deg);
  }

  60% {
    transform: rotateZ(-19deg);
  }

  60.6667% {
    transform: rotateZ(-30deg);
  }

  61.3333% {
    transform: rotateZ(-19deg);
  }

  62.6667% {
    transform: rotateZ(-19deg);
  }

  63.3333% {
    transform: rotateZ(-30deg);
  }

  64% {
    transform: rotateZ(-19deg);
  }

  80% {
    transform: rotateZ(-19deg);
  }

  93.3333% {
    transform: rotateZ(-16deg);
  }

  100% {
    transform: rotateZ(-16deg);
  }
}

@keyframes left-whisker {
  6.66667% {
    transform: rotate(0);
  }

  10% {
    transform: rotate(0deg);
  }

  16.6667% {
    transform: rotate(-5deg);
  }

  20% {
    transform: rotate(0deg);
  }

  26.6667% {
    transform: rotate(0deg);
  }

  46.6667% {
    transform: rotate(10deg);
  }

  53.3333% {
    transform: rotate(-5deg);
  }

  56.6667% {
    transform: rotate(10deg);
  }
}

@keyframes right-whisker {
  6.66667% {
    transform: rotate(180deg);
  }

  10% {
    transform: rotate(190deg);
  }

  16.6667% {
    transform: rotate(180deg);
  }

  20% {
    transform: rotate(175deg);
  }

  26.6667% {
    transform: rotate(190deg);
  }

  46.6667% {
    transform: rotate(180deg);
  }

  53.3333% {
    transform: rotate(185deg);
  }

  56.6667% {
    transform: rotate(175deg);
  }
}

.cat {
  width: 110px;
  height: 50px;
  position: absolute;
  top: calc(50% - 18px);
  right: 30px;
  border-top-left-radius: 100px;
  border-top-right-radius: 100px;
  z-index: 99;

  .body {
    width: 110px;
    height: 50px;
    background-color: blue;
    position: absolute;
    border-top-left-radius: 100px;
    border-top-right-radius: 100px;
    animation: body 12s none infinite;
  }

  .head {
    content: '';
    width: 70px;
    height: 35px;
    background-color: darkred;
    position: absolute;
    top: calc(50% - 10px);
    left: -40px;
    border-top-left-radius: 80px;
    border-top-right-radius: 80px;

    .ear {
      position: absolute;
      left: 4px;
      top: -4px;
      width: 0;
      height: 0;
      border-left: 12px solid transparent;
      border-right: 12px solid transparent;
      border-bottom: 20px solid darkorange;
      transform: rotate(-30deg);
      animation: left-ear 12s both infinite;

      & + .ear {
        animation: right-ear 12s both infinite;
        top: -12px;
        left: 30px;
      }
    }
  }

  .face {
    .nose {
      position: absolute;
      bottom: 10px;
      left: -10px;
      background-color: #fd6e72;
      height: 5px;
      width: 5px;
      border-radius: 50%;
    }

    .whisker-container {
      position: absolute;
      bottom: 5px;
      left: -36px;
      width: 20px;
      height: 10px;
      transform-origin: right;
      animation: left-whisker 12s both infinite;

      &:nth-child(2) {
        left: -20px;
        bottom: 12px;
        transform-origin: right;
        transform: rotate(180deg);
        animation: right-whisker 12s both infinite;
      }

      .whisker {
        position: absolute;
        top: 0;
        width: 100%;
        border: 1px solid #fdf9de;
        transform-origin: 100% 0;
        transform: rotate(10deg);

        &:last-child {
          top: 0;
          transform: rotate(-20deg);
        }
      }
    }
  }

  .tail-container {
    position: absolute;
    right: 0;
    bottom: -13px;
    z-index: 3;

    .tail {
      position: absolute;
      height: 30px;
      width: 14px;
      bottom: -10px;
      right: 0;
      border-bottom-right-radius: 5px;
      background: linear-gradient(45deg, black, transparent);
      z-index: 0;

      & > .tail {
        animation: tail 12s none infinite;
        height: 100%;
        width: 14px;
        transform-origin: left;
        border-bottom-left-radius: 20px 20px;
        border-bottom-right-radius: 20px 20px;
        border-top-right-radius: 40px;
      }
    }
  }
}
</style>
