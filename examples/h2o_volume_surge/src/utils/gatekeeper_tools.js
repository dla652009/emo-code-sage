import { message } from 'ant-design-vue';

import { NotLeafMenu } from '@/utils/menu';

import { menuModules } from '@/router/routes.js';

import { getEnv, getAllPermission } from '@/api';

export const localGet = key => {
  const value = window.localStorage.getItem(key);
  try {
    return JSON.parse(window.localStorage.getItem(key));
  } catch (error) {
    return value;
  }
};

export const localSet = (key, value) => {
  window.localStorage.setItem(key, JSON.stringify(value));
};

export const localRemove = key => {
  window.localStorage.removeItem(key);
};

export const getUrlQueryObj = (url = window.location.href) => {
  const search = url.substring(url.lastIndexOf('?') + 1);
  const obj = {};
  const reg = /([^?&=]+)=([^?&=]*)/g;
  search.replace(reg, function (rs, $1, $2) {
    const name = decodeURIComponent($1);
    const val = decodeURIComponent($2);
    obj[name] = val;
    return rs;
  });
  return obj;
};

export const logOutFunc = (msg = '登录信息失效！请重新登录..') => {
  message.error(msg);
  setTimeout(() => {
    localRemove('Authorization');
    window.location.href = 'https://gatekeeper.dailyyoga.com.cn';
  }, 1500);
};

export const setLoginStatus = cb => {
  const token = getUrlQueryObj().token || localGet('Authorization');
  if (token) {
    localSet('Authorization', token);
    getUserInfo(cb);
  } else {
    getUserInfo(cb);
    // logOutFunc();
  }
};

export const getUserInfo = cb => {
  return fetch('https://gatekeeper.dailyyoga.com.cn/api/service/user', {
    method: 'get',
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
      'Authorization': localGet('Authorization') ?? ''
    }
    // body: JSON.stringify({}),
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        return Promise.reject({
          status: response.status,
          statusText: response.statusText
        });
      }
    })
    .then(json => {
      // console.log(json.data);
      localSet('token', json.data.token);
      localSet('OperatorName', json.data.name);
      if (getEnv() == 'test') {
        getAllPermission({}).then(({ data }) => {
          json.data.permissions = {};
          // console.log(data)
          Object.keys(data.result.module_list).map(i => {
            json.data.permissions[i] = ['view', 'edit'];
          });

          const menu_list = getMenuList(NotLeafMenu, json.data.permissions, menuModules);
          cb(menu_list);
          return json;
        });
      } else {
        if (!json.data.permissions) return message.error('未分配权限，请操作权限后重试');
        const menu_list = getMenuList(NotLeafMenu, json.data.permissions, menuModules);
        cb(menu_list);
        return json;
      }
    })
    .catch(err => {
      // console.log('err', err);
      logOutFunc();
    });
};

export const getMenuList = (NotLeafMenu, permission_obj, modules) => {
  const secondMenuMapThird = {};

  let permission_arr = Object.keys(permission_obj);

  modules.map(module => {
    const second_name = module.secondName;
    module.children.map(route => {
      if (permission_arr.indexOf(route.permission) > -1) {
        const third_name = route.menuName || route.name;
        const item = {
          cate_name: third_name,
          route_name: route.name,
          permission: permission_obj[route.permission]
        };
        if (secondMenuMapThird[second_name]) {
          secondMenuMapThird[second_name].sub_cate_list.push(item);
        } else {
          secondMenuMapThird[second_name] = {
            sub_cate_list: [item]
          };
        }
      }
    });
  });

  let menu = NotLeafMenu.map(first => {
    if (first.sub_cate_list) {
      first.sub_cate_list = first.sub_cate_list.map(second => {
        second = { ...second, sub_cate_list: [], ...secondMenuMapThird[second.cate_name.trim()] };
        return second;
      });
    } else {
      first.sub_cate_list = [];
    }
    return first;
  });

  // console.log(menu)

  return menu;
};

/**
 * 深拷贝
 * @param {Object} obj
 */
export const deepCopy = obj => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 *
 * @param {Function} fn
 * @param {Number} delay
 * @returns
 */
export function debounce(fn, delay = 400) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

/**
 *
 * @param {String} input
 * @returns
 */
export function splitText(input) {
  // 使用正则表达式提取 # 之间的数字并去掉 #
  const regex = /#(\d+)#/;
  const match = input.match(regex);

  if (match) {
    // 使用正则提取到的数字作为分割点来拆分字符串
    const [before, number, after] = input.split(regex);
    return [before, number, after];
  }

  return [input]; // 如果没有匹配的数字，直接返回原始字符串
}
