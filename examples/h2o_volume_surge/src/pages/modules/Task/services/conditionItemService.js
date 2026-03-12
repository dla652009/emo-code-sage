import { matchTagsForCreativeType } from './tagService';

export function getCreativeParams(item, config) {
  return {
    creative_type: item?.creative_type,
    content_type: item?.content_type,
    lang: config.lang || '',
    gender: config.gender || '',
    status: 1
  };
}

export function updateItemParams(item, config) {
  if (!item) return;
  item.loadSelectParams = getCreativeParams(item, config);
}

export function updateAllItemParams(conditionList, config) {
  conditionList.forEach(item => {
    updateItemParams(item, config);
  });
}

export function handleGenderChange(conditionList, gender, config) {
  conditionList.forEach(item => {
    item.gender = gender;
    updateItemParams(item, config);
  });
}

export function handleLangChange(conditionList, lang, config) {
  conditionList.forEach(item => {
    item.lang = lang;
    updateItemParams(item, config);
  });
}

export function handleContentTypeChange(item, config) {
  const { creative_type, isCopy } = item;
  if (isCopy) {
    item.tags = [];
  } else {
    item.weight = [];
    item.author = [];
    item.tags = [];
    item.creative_time = [];
  }
  item.filter_type = null;
  item.creative_id = [];
  item.creativeOption = [];
  if (creative_type < 3) {
    item.filter_type = 1;
    item.gender = config.gender;
    item.lang = config.lang;
  }
  updateItemParams(item, config);
}

export function handleCreativeTypeChange(item, index, oldCreativeTypes, tagLevelList, creativeTypeOption, config) {
  const { creative_type, isCopy, content_type } = item;
  const oldCreativeType = oldCreativeTypes[index];

  if (isCopy && content_type) {
    if (creative_type < 3) {
      matchTagsForCreativeType(tagLevelList, creativeTypeOption, item);
    } else {
      if (oldCreativeType && [3, 4].includes(oldCreativeType) && oldCreativeType !== creative_type) {
        item.creative_id = [];
      }
    }
  } else if (!isCopy) {
    item.weight = [];
    item.author = [];
    item.tags = [];
    item.creative_time = [];
    item.creative_id = [];
  }

  oldCreativeTypes[index] = creative_type;

  item.filter_type = null;
  item.creativeOption = [];
  if (creative_type < 3) {
    item.filter_type = 1;
    item.gender = config.gender;
    item.lang = config.lang;
  }
  updateItemParams(item, config);
}

export function handleFilterTypeChange(item, config) {
  const { filter_type, creative_type } = item;
  item.weight = [];
  item.author = [];
  item.tags = [];
  item.creative_id = [];
  item.creative_time = [];
  item.creativeOption = [];

  if (filter_type === 1 && creative_type < 3) {
    item.gender = config.gender;
    item.lang = config.lang;
  }
  updateItemParams(item, config);
}

export function handleCreativeTimeChange(item) {
  const { creative_time } = item;
  item.start_time = creative_time ? creative_time[0] : null;
  item.end_time = creative_time ? creative_time[1] : null;
}
