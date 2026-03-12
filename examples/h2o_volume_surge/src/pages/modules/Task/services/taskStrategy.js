import { findPathByKey } from '@/utils/const';

export const taskType = {
  AdsTask: 1,
  CreativeTask: 2,
  VideoTask: 3
};

class BaseTaskStrategy {
  constructor(vm) {
    this.vm = vm;
  }

  initCondition() {
    throw new Error('initCondition must be implemented');
  }

  buildCondition() {
    throw new Error('buildCondition must be implemented');
  }

  validateCondition() {
    throw new Error('validateCondition must be implemented');
  }
}

/**
 * 广告任务策略
 */
class AdsTaskStrategy extends BaseTaskStrategy {
  constructor(vm) {
    super(vm);
  }

  initCondition(data) {
    const vm = this.vm;
    const { project_id, merge_type, condition, lang, gender } = data;
    const arr = JSON.parse(condition);
    vm.config.condition = arr?.length ? arr : [{}];
    vm.updateAllItemParams();
    vm.config.condition.map((item, index) => {
      vm.preCheck({ project_id, merge_type, condition: JSON.stringify([item]) }, index);
      const excludes = [];
      for (const key in item) {
        if ([0, ''].includes(item[key]) && !excludes.includes(key)) item[key] = null;
      }
      if (item.creative_type === 4) {
        item.is_skip_hook_bgm = !!item.is_skip_hook_bgm;
      }
      if (item.creative_type < 3) {
        if (item.filter_type === 1) {
          item.creative_time = [item.start_time, item.end_time];
          item.weight = item.weight?.split(',').map(it => parseInt(it)) || [];
          item.author = item.author?.split(',') || [];
          item.lang = lang;
          item.gender = gender;
          if (item.tags) {
            const tagArr = item.tags.split(',').map(tag => {
              const list = vm.tagLevelListByContentType(item);
              return findPathByKey(list, 'name', tag) || [];
            });
            item.tags = tagArr;
          }
        } else if (item.filter_type === 2) {
          const params = { select_creative_id: item.creative_id, page: 1, page_size: 9999999 };
          item.creative_id = item.creative_id?.split(',').map(id => Number(id)) || [];
          vm.getCreativeList(params, `condition-init-${index}`).then(res => {
            item.creativeOption = res;
          });
        } else {
          item.filter_type = 1;
          item.creative_time = [item.start_time, item.end_time];
          item.weight = item.weight?.split(',').map(it => parseInt(it)) || [];
          item.author = item.author?.split(',') || [];
          if (item.tags) {
            const tagArr = item.tags.split(',').map(tag => {
              return findPathByKey(vm.tagLevelList, 'name', tag) || [];
            });
            item.tags = tagArr;
          }
        }
      } else {
        item.creative_id = item.creative_id?.split(',') || [];
      }
    });
    vm.initItemActive(vm.config.condition);
    vm.config.condition.forEach((item, idx) => {
      vm.oldCreativeTypes[idx] = item.creative_type;
    });
  }

  buildCondition(index) {
    const vm = this.vm;
    let result = [];
    const condition = index >= 0 ? [vm.config.condition[index]] : vm.config.condition;
    condition.forEach(item => {
      if (Object.keys(item).length === 0) return;
      const dataObj = {
        content_type: item.content_type,
        creative_type: item.creative_type,
        filter_type: item.filter_type
      };
      if (item.start_time && item.end_time) {
        dataObj.start_time = item.start_time;
        dataObj.end_time = item.end_time;
      }
      if (item.creative_type === 4) {
        const is = item.is_skip_hook_bgm ? 1 : 0;
        dataObj.is_skip_hook_bgm = is;
      }
      if (item.creative_type < 3) {
        if (item.filter_type === 1) {
          dataObj.lang = item.lang;
          dataObj.gender = item.gender;
          dataObj.weight = item?.weight.join(',');
          dataObj.author = item?.author.join(',');
          dataObj.content_type = item.content_type;
          dataObj.tags = item?.tags
            ?.map(tag => {
              if (Array.isArray(tag) && tag.length > 0) {
                return tag[tag.length - 1];
              }
              return tag;
            })
            .join(',');
        } else {
          dataObj.creative_id = item.creative_id?.join(',');
        }
      } else {
        dataObj.creative_id = item.creative_id?.join(',');
      }
      result.push(dataObj);
    });
    return JSON.stringify(result);
  }

  validateCondition(index) {
    // 广告任务
    const vm = this.vm;
    const condition = index >= 0 ? [vm.config.condition[index]] : vm.config.condition;
    const result = condition.some(item => {
      if (!item.creative_type) return true; // 素材库
      if (item.creative_type < 3) {
        // 素材库： hook or 卖点库
        if (!item.filter_type) return true;
        if (item.filter_type === 1) {
          // 条件筛选
          if (!item.gender && item.gender != 0) return true; // 投放人群性别
          if (!item.lang && item.lang != 0) return true; // 素材语言
          if (!item.tags?.length || !item.weight.length || !item.author.length) return true;
          // if (!item.start_time || !item.end_time) return true;
        } else {
          // 手动筛选
          if (!item.creative_id?.length) return true;
        }
      } else {
        if (!item.creative_id?.length) return true;
      }
      return false;
    });
    return result;
  }
}

/**
 * 成片素材任务策略
 */
class CreativeTaskStrategy extends BaseTaskStrategy {
  constructor(vm) {
    super(vm);
  }

  initCondition(data) {
    const vm = this.vm;
    const { condition_data_list } = data;
    const creativeIds = [];
    vm.creativeOption = condition_data_list.map(item => {
      creativeIds.push(item.id);
      return {
        id: item.id,
        creative_name: item.name
      };
    });
    vm.selfData.content_type = condition_data_list?.[0]?.content_type;
    vm.selfData.current_list = creativeIds;
  }

  buildCondition() {
    const vm = this.vm;
    const result = vm.selfData.current_list || [];
    return result.join(',');
  }

  validateCondition() {
    const vm = this.vm;
    return !(vm.selfData.current_list && vm.selfData.current_list.length > 0);
  }
}

/**
 * 成片视频任务策略
 */
class VideoTaskStrategy extends BaseTaskStrategy {
  constructor(vm) {
    super(vm);
  }

  initCondition(data) {
    const vm = this.vm;
    const { condition_data_list } = data;
    const ids = [];
    vm.videoOption = condition_data_list.map(item => {
      ids.push(item.id);
      return {
        id: item.id,
        task_log_name: item.name
      };
    });
    vm.selfData.current_list = ids;
  }

  buildCondition() {
    const vm = this.vm;
    const result = vm.selfData.current_list || [];
    return result.join(',');
  }

  validateCondition() {
    const vm = this.vm;
    return !(vm.selfData.current_list && vm.selfData.current_list.length > 0);
  }
}

/**
 * 创建任务策略
 * @param {Number} type 任务类型
 * @param {Vue} vm Vue实例
 * @returns {BaseTaskStrategy} 任务策略实例
 */
export function createTaskStrategy(type, vm) {
  switch (type) {
    case taskType.AdsTask:
      return new AdsTaskStrategy(vm);
    case taskType.CreativeTask:
      return new CreativeTaskStrategy(vm);
    case taskType.VideoTask:
      return new VideoTaskStrategy(vm);
    default:
      throw new Error(`Unknown task type: ${type}`);
  }
}
